package com.mady.springboot_be.utils.mappers.contact;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mady.springboot_be.dtos.contact.AppointmentDTO;
import com.mady.springboot_be.entities.contact.Appointment;
import com.mady.springboot_be.services_impl.AllMappingService;

/**
 * Mapper for converting Appointment entity to AppointmentDTO.
 * 
 * Maps all appointment fields including:
 * - Requester and organizer (via UserProfileMapper)
 * - Associated product (via AllMappingService for complete product data)
 * - Date/time, duration, location, status, timestamps
 * - Rating, feedback, cancellation information
 * - Geographic coordinates
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Component
public class AppointmentMapper {

    private final UserProfileMapper userProfileMapper;
    private final AllMappingService allMappingService;

    /**
     * Constructs a new AppointmentMapper with required dependencies.
     * 
     * @param userProfileMapper mapper for converting User to UserProfileDTO
     * @param allMappingService service for converting Product to ProductCompleteDto
     */
    public AppointmentMapper(UserProfileMapper userProfileMapper, AllMappingService allMappingService) {
        this.userProfileMapper = userProfileMapper;
        this.allMappingService = allMappingService;
    }

    /**
     * Converts an Appointment entity to an AppointmentDTO.
     * 
     * Maps all appointment fields including requester, organizer,
     * associated product, scheduling details, status, timestamps,
     * and post-appointment feedback.
     * 
     * @param appointment the Appointment entity to convert
     * @return the corresponding AppointmentDTO, or null if appointment is null
     */
    public AppointmentDTO toDTO(Appointment appointment) {
        if (appointment == null)
            return null;

        AppointmentDTO dto = new AppointmentDTO();
        dto.setAppointmentId(appointment.getAppointmentId());
        dto.setRequester(userProfileMapper.toDTO(appointment.getRequester()));
        dto.setOrganizer(userProfileMapper.toDTO(appointment.getOrganizer()));
        dto.setProduct(allMappingService.mapToCompleteDto(appointment.getProduct()));
        dto.setTitle(appointment.getTitle());
        dto.setDescription(appointment.getDescription());
        dto.setAppointmentDatetime(appointment.getAppointmentDatetime());
        dto.setDurationMinutes(appointment.getDurationMinutes());
        dto.setLocationType(appointment.getLocationType());
        dto.setLocationAddress(appointment.getLocationAddress());
        dto.setLocationNotes(appointment.getLocationNotes());
        dto.setMeetingLink(appointment.getMeetingLink());
        dto.setStatus(appointment.getStatus());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setConfirmedAt(appointment.getConfirmedAt());
        dto.setCancelledAt(appointment.getCancelledAt());
        dto.setCompletedAt(appointment.getCompletedAt());
        dto.setCancellationReason(appointment.getCancellationReason());
        dto.setCancelledByUserId(appointment.getCancelledByUserId());
        dto.setReminderSent(appointment.isReminderSent());
        dto.setReminderSentAt(appointment.getReminderSentAt());
        dto.setActive(appointment.getActive());
        dto.setRating(appointment.getRating());
        dto.setFeedback(appointment.getFeedback());
        dto.setLatitude(appointment.getLatitude());
        dto.setLongitude(appointment.getLongitude());

        return dto;
    }

    /**
     * Converts a list of Appointment entities to a list of AppointmentDTOs.
     * 
     * @param appointments the list of Appointment entities to convert
     * @return the list of corresponding AppointmentDTOs
     */
    public List<AppointmentDTO> toDTOList(List<Appointment> appointments) {
        return appointments.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
