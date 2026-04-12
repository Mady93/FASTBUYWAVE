package com.mady.springboot_be.services_impl.contact;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mady.springboot_be.dtos.contact.AppointmentProposalDTO;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.entities.contact.Appointment;
import com.mady.springboot_be.entities.contact.AppointmentProposal;
import com.mady.springboot_be.enums.contact.AppointmentStatus;
import com.mady.springboot_be.enums.contact.ProposalStatus;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.UserRepository;
import com.mady.springboot_be.repositories.contact.AppointmentProposalRepository;
import com.mady.springboot_be.repositories.contact.AppointmentRepository;
import com.mady.springboot_be.services.contact.AppointmentProposalService;
import com.mady.springboot_be.utils.mappers.contact.AppointmentProposalMapper;

import jakarta.persistence.EntityNotFoundException;

/**
 * Implementation of AppointmentProposalService for managing appointment change
 * proposals.
 * 
 * Handles creation, acceptance, and rejection of proposals to modify
 * appointment details (datetime, location, duration, coordinates).
 * 
 * Key features:
 * - Automatically rejects previous pending proposals when a new one is created
 * - Only pending proposals can be accepted or rejected
 * - Users cannot accept or reject their own proposals
 * - Rejecting a proposal automatically cancels the associated appointment
 * - Accepting a proposal applies all proposed changes to the appointment
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
@Transactional
public class AppointmentProposalServiceImpl implements AppointmentProposalService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentProposalServiceImpl.class);

    private final AppointmentProposalRepository proposalRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final AppointmentProposalMapper proposalMapper;

    /**
     * Constructs a new AppointmentProposalServiceImpl with required dependencies.
     * 
     * @param proposalRepository    repository for AppointmentProposal entity
     * @param appointmentRepository repository for Appointment entity
     * @param userRepository        repository for User entity
     * @param proposalMapper        mapper for AppointmentProposal entity to DTO
     *                              conversion
     */
    public AppointmentProposalServiceImpl(
            AppointmentProposalRepository proposalRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            AppointmentProposalMapper proposalMapper) {

        this.proposalRepository = proposalRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.proposalMapper = proposalMapper;
    }

    @Override
    public AppointmentProposalDTO proposeChange(Long appointmentId,
            AppointmentProposalDTO dto,
            Long userId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (!appointment.getRequester().getUserId().equals(userId) &&
                !appointment.getOrganizer().getUserId().equals(userId)) {
            throw new SecurityException("User not involved in this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED ||
                appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("Cannot propose changes on a " + appointment.getStatus() + " appointment");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<AppointmentProposal> existingPending = proposalRepository
                .findByAppointmentAppointmentIdOrderByCreatedAtDesc(appointmentId)
                .stream()
                .filter(p -> p.getStatus() == ProposalStatus.PENDING)
                .collect(Collectors.toList());

        existingPending.forEach(p -> {
            p.setStatus(ProposalStatus.REJECTED);
            proposalRepository.save(p);
        });

        if (appointment.getStatus() == AppointmentStatus.RESCHEDULED) {
            appointment.setStatus(AppointmentStatus.PENDING);
            appointmentRepository.save(appointment);
        }

        AppointmentProposal proposal = new AppointmentProposal();

        proposal.setAppointment(appointment);
        proposal.setProposedBy(user);
        proposal.setStatus(ProposalStatus.PENDING);
        proposal.setCreatedAt(LocalDateTime.now());

        if (dto.getProposedDatetime() != null)
            proposal.setProposedDatetime(dto.getProposedDatetime());
        if (dto.getProposedLocationAddress() != null)
            proposal.setProposedLocationAddress(dto.getProposedLocationAddress());
        if (dto.getProposedLocationNotes() != null)
            proposal.setProposedLocationNotes(dto.getProposedLocationNotes());
        if (dto.getProposedDuration() != null)
            proposal.setProposedDuration(dto.getProposedDuration());
        if (dto.getLatitude() != null)
            proposal.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null)
            proposal.setLongitude(dto.getLongitude());

        AppointmentProposal saved = proposalRepository.save(proposal);

        logger.info("Proposal {} created for appointment {} by user {} (previous proposals invalidated: {})",
                saved.getProposalId(), appointmentId, userId, existingPending.size());

        return proposalMapper.toDTO(saved);
    }

    @Override
    public AppointmentProposalDTO acceptProposal(Long proposalId, Long userId) {

        AppointmentProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new EntityNotFoundException("Proposal not found"));

        logger.info("=== acceptProposal START ===");
        logger.info("proposalId={}, userId={}", proposalId, userId);
        logger.info("proposal.status={}", proposal.getStatus());
        logger.info("proposal.proposedDatetime={}", proposal.getProposedDatetime());
        logger.info("proposal.proposedLocationAddress={}", proposal.getProposedLocationAddress());
        logger.info("proposal.proposedLocationNotes={}", proposal.getProposedLocationNotes());
        logger.info("proposal.proposedDuration={}", proposal.getProposedDuration());
        logger.info("proposal.latitude={}", proposal.getLatitude());
        logger.info("proposal.longitude={}", proposal.getLongitude());

        // Validation
        if (proposal.getProposedBy().getUserId().equals(userId)) {
            throw new IllegalStateException("You cannot accept your own proposal");
        }

        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new IllegalStateException("Proposal already processed");
        }

        Appointment appointment = proposal.getAppointment();

        logger.info("--- appointment BEFORE update ---");
        logger.info("appointment.id={}", appointment.getAppointmentId());
        logger.info("appointment.datetime BEFORE={}", appointment.getAppointmentDatetime());
        logger.info("appointment.locationAddress BEFORE={}", appointment.getLocationAddress());
        logger.info("appointment.locationNotes BEFORE={}", appointment.getLocationNotes());
        logger.info("appointment.duration BEFORE={}", appointment.getDurationMinutes());
        logger.info("appointment.latitude BEFORE={}", appointment.getLatitude());
        logger.info("appointment.longitude BEFORE={}", appointment.getLongitude());
        logger.info("appointment.status BEFORE={}", appointment.getStatus());

        boolean modified = false;

        if (proposal.getProposedDatetime() != null) {
            if (!proposal.getProposedDatetime().equals(appointment.getAppointmentDatetime())) {
                appointment.setAppointmentDatetime(proposal.getProposedDatetime());
                logger.info("DATETIME modified: {} → {}",
                        appointment.getAppointmentDatetime(), proposal.getProposedDatetime());
                modified = true;
            } else {
                logger.info("DATETIME identical, no change needed");
            }
        } else {
            logger.info("DATETIME not proposed (keeping: {})", appointment.getAppointmentDatetime());
        }

        if (proposal.getProposedLocationAddress() != null && !proposal.getProposedLocationAddress().isBlank()) {
            if (!proposal.getProposedLocationAddress().equals(appointment.getLocationAddress())) {
                appointment.setLocationAddress(proposal.getProposedLocationAddress());
                logger.info("ADDRESS modified: {} → {}",
                        appointment.getLocationAddress(), proposal.getProposedLocationAddress());
                modified = true;
            } else {
                logger.info("ADDRESS identical, no change needed");
            }
        } else {
            logger.info("ADDRESS not proposed (keeping: {})", appointment.getLocationAddress());
        }

        if (proposal.getProposedLocationNotes() != null && !proposal.getProposedLocationNotes().isBlank()) {
            if (!proposal.getProposedLocationNotes().equals(appointment.getLocationNotes())) {
                appointment.setLocationNotes(proposal.getProposedLocationNotes());
                logger.info("NOTES modified: {} → {}",
                        appointment.getLocationNotes(), proposal.getProposedLocationNotes());
                modified = true;
            } else {
                logger.info("NOTES identical, no change needed");
            }
        } else {
            logger.info("NOTES not proposed (keeping: {})", appointment.getLocationNotes());
        }

        if (proposal.getProposedDuration() != null) {
            if (!proposal.getProposedDuration().equals(appointment.getDurationMinutes())) {
                appointment.setDurationMinutes(proposal.getProposedDuration());
                logger.info("DURATION modified: {} → {}",
                        appointment.getDurationMinutes(), proposal.getProposedDuration());
                modified = true;
            } else {
                logger.info("DURATION identical, no change needed");
            }
        } else {
            logger.info("DURATION not proposed (keeping: {})", appointment.getDurationMinutes());
        }

        if (proposal.getLatitude() != null) {
            if (!proposal.getLatitude().equals(appointment.getLatitude())) {
                appointment.setLatitude(proposal.getLatitude());
                logger.info("LATITUDE modified: {} → {}",
                        appointment.getLatitude(), proposal.getLatitude());
                modified = true;
            } else {
                logger.info("LATITUDE identical, no change needed");
            }
        } else {
            logger.info("LATITUDE not proposed (keeping: {})", appointment.getLatitude());
        }

        if (proposal.getLongitude() != null) {
            if (!proposal.getLongitude().equals(appointment.getLongitude())) {
                appointment.setLongitude(proposal.getLongitude());
                logger.info("LONGITUDE modified: {} → {}",
                        appointment.getLongitude(), proposal.getLongitude());
                modified = true;
            } else {
                logger.info("LONGITUDE identical, no change needed");
            }
        } else {
            logger.info("LONGITUDE not proposed (keeping: {})", appointment.getLongitude());
        }

        if (!modified) {
            logger.warn("NO MODIFICATIONS APPLIED - all proposed fields are null or equal");
        }

        // Update appointment status
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setConfirmedAt(LocalDateTime.now());

        logger.info("--- appointment AFTER update (before save) ---");
        logger.info("appointment.datetime AFTER={}", appointment.getAppointmentDatetime());
        logger.info("appointment.locationAddress AFTER={}", appointment.getLocationAddress());
        logger.info("appointment.locationNotes AFTER={}", appointment.getLocationNotes());
        logger.info("appointment.duration AFTER={}", appointment.getDurationMinutes());
        logger.info("appointment.latitude AFTER={}", appointment.getLatitude());
        logger.info("appointment.longitude AFTER={}", appointment.getLongitude());
        logger.info("appointment.status AFTER={}", appointment.getStatus());

        Appointment saved = appointmentRepository.save(appointment);

        logger.info("--- appointment AFTER save ---");
        logger.info("saved.datetime={}", saved.getAppointmentDatetime());
        logger.info("saved.locationAddress={}", saved.getLocationAddress());
        logger.info("saved.locationNotes={}", saved.getLocationNotes());
        logger.info("saved.duration={}", saved.getDurationMinutes());
        logger.info("saved.latitude={}", saved.getLatitude());
        logger.info("saved.longitude={}", saved.getLongitude());
        logger.info("saved.status={}", saved.getStatus());

        proposal.setStatus(ProposalStatus.ACCEPTED);
        proposalRepository.save(proposal);

        logger.info("Proposal {} ACCEPTED by user {}", proposalId, userId);
        logger.info("=== acceptProposal END ===");

        return proposalMapper.toDTO(proposal);
    }

    @Override
    public AppointmentProposalDTO rejectProposal(Long proposalId, Long userId) {

        AppointmentProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new EntityNotFoundException("Proposal not found"));

        if (proposal.getProposedBy().getUserId().equals(userId)) {
            throw new IllegalStateException("You cannot reject your own proposal");
        }

        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new IllegalStateException("Proposal already processed");
        }

        proposal.setStatus(ProposalStatus.REJECTED);
        proposalRepository.save(proposal);

        // Cancel the associated appointment
        Appointment appointment = proposal.getAppointment();
        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelledAt(LocalDateTime.now());
        appointment.setCancelledByUserId(userId);
        appointment.setCancellationReason("Proposal rejected by counterpart");
        appointmentRepository.save(appointment);

        logger.info("Proposal {} rejected by user {} — appointment {} cancelled",
                proposalId, userId, appointment.getAppointmentId());

        return proposalMapper.toDTO(proposal);
    }

    @Override
    public List<AppointmentProposalDTO> getProposalsByAppointment(Long appointmentId) {

        List<AppointmentProposal> proposals = proposalRepository
                .findByAppointmentAppointmentIdOrderByCreatedAtDesc(appointmentId);

        return proposals.stream()
                .map(proposalMapper::toDTO)
                .collect(Collectors.toList());
    }
}