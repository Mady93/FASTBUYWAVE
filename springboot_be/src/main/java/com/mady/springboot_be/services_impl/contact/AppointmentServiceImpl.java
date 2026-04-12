package com.mady.springboot_be.services_impl.contact;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.mady.springboot_be.dtos.contact.AppointmentDTO;
import com.mady.springboot_be.entities.Profile;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.entities.contact.Appointment;
import com.mady.springboot_be.enums.contact.AppointmentStatus;
import com.mady.springboot_be.repositories.ProfileRepository;
import com.mady.springboot_be.repositories.UserRepository;
import com.mady.springboot_be.repositories.contact.AppointmentRepository;
import com.mady.springboot_be.services.EmailService;
import com.mady.springboot_be.services.contact.AppointmentService;
import com.mady.springboot_be.utils.mappers.contact.AppointmentMapper;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

/**
 * Implementation of AppointmentService for appointment management.
 * 
 * Handles all appointment operations including:
 * - Retrieval by various criteria (requester, organizer, date ranges)
 * - Confirmation, cancellation, rescheduling, completion
 * - Automated email notifications (confirmation, cancellation, reschedule,
 * reminders)
 * - Appointment statistics and calendar views
 * 
 * Email notifications are sent asynchronously using CompletableFuture.
 * Reminders are scheduled to run every hour (@Scheduled fixedRate = 3600000).
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ProfileRepository profileRepository;
    private final AppointmentMapper appointmentMapper;

    private static final Logger logger = LoggerFactory.getLogger(AppointmentServiceImpl.class);

    /**
     * Constructs a new AppointmentServiceImpl with required dependencies.
     * 
     * @param appointmentRepository repository for Appointment entity operations
     * @param userRepository        repository for User entity operations
     * @param emailService          service for sending email notifications
     * @param profileRepository     repository for Profile entity operations
     * @param appointmentMapper     mapper for converting between Appointment entity
     *                              and AppointmentDTO
     */
    @Autowired
    public AppointmentServiceImpl(
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            EmailService emailService,
            ProfileRepository profileRepository,
            AppointmentMapper appointmentMapper) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.profileRepository = profileRepository;
        this.appointmentMapper = appointmentMapper;
    }

    @Override
    public AppointmentDTO getAppointmentById(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with ID: " + appointmentId));
        return appointmentMapper.toDTO(appointment);
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByRequester(Long requesterUserId) {
        return appointmentRepository.findByRequesterIdAndActiveTrue(requesterUserId).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByOrganizer(Long organizerUserId) {
        return appointmentRepository.findByOrganizerIdAndActiveTrue(organizerUserId).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public Map<String, List<AppointmentDTO>> getAppointmentsByUser(Long userId) {
        Map<String, List<AppointmentDTO>> result = new HashMap<>();

        result.put("requested", appointmentRepository.findByRequesterIdAndActiveTrue(userId).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList()));

        result.put("organized", appointmentRepository.findByOrganizerIdAndActiveTrue(userId).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList()));

        return result;
    }

    @Override
    public List<AppointmentDTO> getConfirmedAppointmentsByUser(Long userId) {
        return appointmentRepository.findConfirmedByUser(userId).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getCalendarAppointments(Long userId, int year, int month) {
        return appointmentRepository.findCalendarAppointments(userId, year, month);
    }

    @Override
    @Transactional
    public AppointmentDTO confirmAppointment(Long appointmentId, Long userId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        if (!appointment.getRequester().getUserId().equals(userId) &&
                !appointment.getOrganizer().getUserId().equals(userId)) {
            throw new IllegalStateException("User not authorized to confirm this appointment");
        }

        // Accepts both PENDING and RESCHEDULED status for confirmation
        if (appointment.getStatus() != AppointmentStatus.PENDING &&
                appointment.getStatus() != AppointmentStatus.RESCHEDULED) {
            throw new IllegalStateException(
                    "Can only confirm a PENDING or RESCHEDULED appointment, current: "
                            + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setConfirmedAt(LocalDateTime.now());

        Appointment saved = appointmentRepository.save(appointment);
        sendConfirmationEmail(saved);

        logger.info("Appointment {} confirmed by user {}", appointmentId, userId);

        return appointmentMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public AppointmentDTO cancelAppointment(Long appointmentId, Long userId, String cancellationReason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        // Authorization check
        if (!appointment.getRequester().getUserId().equals(userId) &&
                !appointment.getOrganizer().getUserId().equals(userId)) {
            throw new IllegalStateException("User not authorized to cancel this appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelledAt(LocalDateTime.now());
        appointment.setCancellationReason(cancellationReason);
        appointment.setCancelledByUserId(userId);

        Appointment saved = appointmentRepository.save(appointment);

        // Notify the other party
        sendCancellationEmail(saved, userId);

        logger.info("Appointment {} cancelled by user {}", appointmentId, userId);

        return appointmentMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public AppointmentDTO rescheduleAppointment(Long appointmentId, LocalDateTime newDatetime, String reason) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        LocalDateTime oldDatetime = appointment.getAppointmentDatetime();
        appointment.setAppointmentDatetime(newDatetime);
        appointment.setStatus(AppointmentStatus.RESCHEDULED);

        Appointment saved = appointmentRepository.save(appointment);

        // Send notification email
        sendRescheduleEmail(saved, oldDatetime);

        logger.info("Appointment {} rescheduled to {}", appointmentId, newDatetime);

        return appointmentMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public AppointmentDTO completeAppointment(Long appointmentId, Integer rating, String feedback) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setCompletedAt(LocalDateTime.now());
        appointment.setRating(rating);
        appointment.setFeedback(feedback);

        Appointment saved = appointmentRepository.save(appointment);

        logger.info("Appointment {} completed with rating {}", appointmentId, rating);

        return appointmentMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public AppointmentDTO updateAppointmentLocation(Long appointmentId, String locationAddress, String locationNotes) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        appointment.setLocationAddress(locationAddress);
        appointment.setLocationNotes(locationNotes);

        Appointment saved = appointmentRepository.save(appointment);

        return appointmentMapper.toDTO(saved);
    }

    @Override
    @Scheduled(fixedRate = 3600000) // Every hour
    public void sendAppointmentReminders() {
        // Trova appuntamenti che iniziano tra 24 ore
        LocalDateTime reminderTime = LocalDateTime.now().plusHours(24);
        List<Appointment> appointments = appointmentRepository.findAppointmentsNeedingReminder(reminderTime);

        for (Appointment appointment : appointments) {
            try {
                sendReminderEmail(appointment);
                appointment.setReminderSent(true);
                appointment.setReminderSentAt(LocalDateTime.now());
                appointmentRepository.save(appointment);

                logger.info("Reminder sent for appointment {}", appointment.getAppointmentId());
            } catch (Exception e) {
                logger.error("Error sending reminder for appointment {}: {}",
                        appointment.getAppointmentId(), e.getMessage());
            }
        }
    }

    @Override
    public Map<String, Long> getAppointmentStatistics(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<Appointment> appointments = appointmentRepository.findByUserInvolved(user.getUserId());

        Map<String, Long> stats = new HashMap<>();
        stats.put("total", (long) appointments.size());
        stats.put("pending", appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.PENDING).count());
        stats.put("confirmed", appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.CONFIRMED).count());
        stats.put("completed", appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count());
        stats.put("cancelled", appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.CANCELLED).count());

        return stats;
    }

    // ============================================
    // Private Helper Methods
    // ============================================

    /**
     * Sends confirmation email asynchronously to both parties.
     * 
     * @param appointment the confirmed appointment
     */
    private void sendConfirmationEmail(Appointment appointment) {
        CompletableFuture.runAsync(() -> {
            try {
                String subject = "Appointment Confirmed: " + appointment.getTitle();
                String message = buildConfirmationEmailTemplate(appointment);

                emailService.sendEmail("noreply@yourapp.com",
                        appointment.getRequester().getEmail(), subject, message);
                emailService.sendEmail("noreply@yourapp.com",
                        appointment.getOrganizer().getEmail(), subject, message);

            } catch (Exception e) {
                logger.error("Error sending confirmation email for appointment {}: {}",
                        appointment.getAppointmentId(), e.getMessage());
            }
        });
    }

    /**
     * Sends cancellation email asynchronously to the other party.
     * 
     * @param appointment       the cancelled appointment
     * @param cancelledByUserId ID of user who cancelled
     */
    private void sendCancellationEmail(Appointment appointment, Long cancelledByUserId) {
        CompletableFuture.runAsync(() -> {
            try {
                User cancelledBy = appointment.getRequester().getUserId().equals(cancelledByUserId)
                        ? appointment.getRequester()
                        : appointment.getOrganizer();
                User notifyUser = appointment.getRequester().getUserId().equals(cancelledByUserId)
                        ? appointment.getOrganizer()
                        : appointment.getRequester();

                String subject = "Appointment Cancelled: " + appointment.getTitle();
                String message = buildCancellationEmailTemplate(appointment, cancelledBy);

                emailService.sendEmail("noreply@yourapp.com", notifyUser.getEmail(), subject, message);

            } catch (Exception e) {
                logger.error("Error sending cancellation email: {}", e.getMessage());
            }
        });
    }

    /**
     * Sends reschedule notification email asynchronously to both parties.
     * 
     * @param appointment the rescheduled appointment
     * @param oldDatetime the previous date and time
     */
    private void sendRescheduleEmail(Appointment appointment, LocalDateTime oldDatetime) {
        CompletableFuture.runAsync(() -> {
            try {
                String subject = "Appointment Rescheduled: " + appointment.getTitle();
                String message = buildRescheduleEmailTemplate(appointment, oldDatetime);

                emailService.sendEmail("noreply@yourapp.com",
                        appointment.getRequester().getEmail(), subject, message);
                emailService.sendEmail("noreply@yourapp.com",
                        appointment.getOrganizer().getEmail(), subject, message);

            } catch (Exception e) {
                logger.error("Error sending reschedule email: {}", e.getMessage());
            }
        });
    }

    /**
     * Sends reminder email for upcoming appointment.
     * 
     * @param appointment the appointment to remind about
     */
    private void sendReminderEmail(Appointment appointment) {
        String subject = "Reminder: Appointment Tomorrow - " + appointment.getTitle();
        String message = buildReminderEmailTemplate(appointment);

        emailService.sendEmail("noreply@yourapp.com",
                appointment.getRequester().getEmail(), subject, message);
        emailService.sendEmail("noreply@yourapp.com",
                appointment.getOrganizer().getEmail(), subject, message);
    }

    private String buildConfirmationEmailTemplate(Appointment appointment) {
        return String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2 style="color: #10b981;">✅ Appointment Confirmed</h2>
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>%s</h3>
                        <p><strong>📅 Date:</strong> %s</p>
                        <p><strong>⏱️ Duration:</strong> %s minutes</p>
                        <p><strong>📍 Location:</strong> %s</p>
                        %s
                    </div>
                    <p>Both parties have confirmed the appointment. See you there!</p>
                </div>
                """,
                appointment.getTitle(),
                appointment.getAppointmentDatetime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                Objects.toString(appointment.getDurationMinutes(), "60"),
                appointment.getLocationAddress(),
                appointment.getLocationNotes() != null
                        ? "<p><strong>📝 Notes:</strong> " + appointment.getLocationNotes() + "</p>"
                        : "");
    }

    private String buildCancellationEmailTemplate(Appointment appointment, User cancelledBy) {
        Profile profile = profileRepository.findByUserId(cancelledBy.getUserId())
                .orElse(null);
        String cancelledByName = profile != null ? profile.getFirstName() + " " + profile.getLastName()
                : "The other party";

        return String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2 style="color: #ef4444;">❌ Appointment Cancelled</h2>
                    <p><strong>%s</strong> has cancelled the appointment.</p>
                    <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>%s</h3>
                        <p><strong>📅 Was scheduled for:</strong> %s</p>
                        %s
                    </div>
                </div>
                """,
                cancelledByName,
                appointment.getTitle(),
                appointment.getAppointmentDatetime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                appointment.getCancellationReason() != null
                        ? "<p><strong>Reason:</strong> " + appointment.getCancellationReason() + "</p>"
                        : "");
    }

    private String buildRescheduleEmailTemplate(Appointment appointment, LocalDateTime oldDatetime) {
        return String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2 style="color: #f59e0b;">🔄 Appointment Rescheduled</h2>
                    <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>%s</h3>
                        <p><strong>❌ Old Date:</strong> %s</p>
                        <p><strong>✅ New Date:</strong> %s</p>
                        <p><strong>📍 Location:</strong> %s</p>
                    </div>
                    <p>Please confirm the new date and time.</p>
                </div>
                """,
                appointment.getTitle(),
                oldDatetime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                appointment.getAppointmentDatetime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                appointment.getLocationAddress());
    }

    private String buildReminderEmailTemplate(Appointment appointment) {
        return String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 600px;">
                    <h2 style="color: #3b82f6;">⏰ Appointment Reminder</h2>
                    <p>Your appointment is tomorrow!</p>
                    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>%s</h3>
                        <p><strong>📅 Date:</strong> %s</p>
                        <p><strong>📍 Location:</strong> %s</p>
                        %s
                    </div>
                    <p>Don't forget to prepare for the meeting!</p>
                </div>
                """,
                appointment.getTitle(),
                appointment.getAppointmentDatetime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                appointment.getLocationAddress(),
                appointment.getLocationNotes() != null
                        ? "<p><strong>📝 Notes:</strong> " + appointment.getLocationNotes() + "</p>"
                        : "");
    }

    @Override
    public List<AppointmentDTO> getTodayAppointments(Long userId) {
        return appointmentRepository.findTodayAppointmentsByUser(userId).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getThisWeekAppointments(Long userId) {
        return appointmentRepository.findThisWeekAppointmentsByUser(userId).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByDateRange(Long userId, LocalDateTime startDate,
            LocalDateTime endDate) {
        return appointmentRepository.findByUserAndDateRange(userId, startDate, endDate).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }
}