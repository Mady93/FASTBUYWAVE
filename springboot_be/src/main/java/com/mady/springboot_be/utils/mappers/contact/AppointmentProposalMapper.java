package com.mady.springboot_be.utils.mappers.contact;

import org.springframework.stereotype.Component;

import com.mady.springboot_be.dtos.contact.AppointmentProposalDTO;
import com.mady.springboot_be.entities.contact.AppointmentProposal;

/**
 * Mapper for converting AppointmentProposal entity to AppointmentProposalDTO.
 * 
 * Uses UserProfileMapper for proposer user conversion and
 * AppointmentMapper for appointment conversion.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Component
public class AppointmentProposalMapper {
    private final UserProfileMapper userProfileMapper;
    private final AppointmentMapper appointmentMapper;

    /**
     * Constructs a new AppointmentProposalMapper with required dependencies.
     * 
     * @param userProfileMapper mapper for User to UserProfileDTO conversion
     * @param appointmentMapper mapper for Appointment to AppointmentDTO conversion
     */
    public AppointmentProposalMapper(UserProfileMapper userProfileMapper,
            AppointmentMapper appointmentMapper) {
        this.userProfileMapper = userProfileMapper;
        this.appointmentMapper = appointmentMapper;
    }

    /**
     * Converts an AppointmentProposal entity to an AppointmentProposalDTO.
     * 
     * @param entity the entity to convert
     * @return the corresponding DTO, or null if entity is null
     */
    public AppointmentProposalDTO toDTO(AppointmentProposal entity) {
        if (entity == null) {
            return null;
        }

        AppointmentProposalDTO dto = new AppointmentProposalDTO();
        dto.setProposalId(entity.getProposalId());
        dto.setAppointment(appointmentMapper.toDTO(entity.getAppointment()));
        dto.setProposedDatetime(entity.getProposedDatetime());
        dto.setProposedLocationAddress(entity.getProposedLocationAddress());
        dto.setProposedLocationNotes(entity.getProposedLocationNotes());
        dto.setProposedDuration(entity.getProposedDuration());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());

        if (entity.getProposedBy() != null) {
            dto.setProposedBy(userProfileMapper.toDTO(entity.getProposedBy()));
        }
        return dto;
    }
}
