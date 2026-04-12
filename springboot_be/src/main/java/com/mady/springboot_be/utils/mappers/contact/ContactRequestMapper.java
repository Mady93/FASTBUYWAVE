package com.mady.springboot_be.utils.mappers.contact;

import org.springframework.stereotype.Component;

import com.mady.springboot_be.dtos.contact.ContactRequestDTO;
import com.mady.springboot_be.entities.contact.ContactRequest;
import com.mady.springboot_be.services_impl.AllMappingService;

/**
 * Mapper for converting ContactRequest entity to ContactRequestDTO.
 * 
 * Uses:
 * - UserProfileMapper for sender and receiver user conversion
 * - AllMappingService for product to ProductCompleteDto conversion
 * 
 * This mapper handles all fields of ContactRequest including:
 * - Basic request info (subject, message, notes)
 * - Status and timestamps (createdAt, rejectedAt)
 * - Contact method and contact details (email, phone)
 * - Meeting-specific fields (appointmentDateTime, location, duration,
 * coordinates)
 * - Soft delete flags (hiddenBySender, hiddenByReceiver, active)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Component
public class ContactRequestMapper {

    private final UserProfileMapper userProfileMapper;
    private final AllMappingService allMappingService;

    /**
     * Constructs a new ContactRequestMapper with required dependencies.
     * 
     * @param userProfileMapper mapper for User to UserProfileDTO conversion
     * @param allMappingService service for Product to ProductCompleteDto conversion
     */
    public ContactRequestMapper(UserProfileMapper userProfileMapper, AllMappingService allMappingService) {
        this.userProfileMapper = userProfileMapper;
        this.allMappingService = allMappingService;
    }

    /**
     * Converts a ContactRequest entity to a ContactRequestDTO.
     * 
     * Maps all fields including sender, receiver, product, request details,
     * status, timestamps, meeting information, and soft delete flags.
     * 
     * @param contactRequest the entity to convert
     * @return the corresponding DTO, or null if entity is null
     */
    public ContactRequestDTO toDTO(ContactRequest contactRequest) {
        if (contactRequest == null)
            return null;

        ContactRequestDTO dto = new ContactRequestDTO();
        dto.setRequestId(contactRequest.getRequestId());
        dto.setSender(userProfileMapper.toDTO(contactRequest.getSender()));
        dto.setReceiver(userProfileMapper.toDTO(contactRequest.getReceiver()));
        dto.setProduct(allMappingService.mapToCompleteDto(contactRequest.getProduct()));
        dto.setSubject(contactRequest.getSubject());
        dto.setMessage(contactRequest.getMessage());
        dto.setAdditionalNotes(contactRequest.getAdditionalNotes());
        dto.setPreferredContactMethod(contactRequest.getPreferredContactMethod());
        dto.setStatus(contactRequest.getStatus());
        dto.setCreatedAt(contactRequest.getCreatedAt());
        dto.setRejectedAt(contactRequest.getRejectedAt());
        dto.setRejectionReason(contactRequest.getRejectionReason());
        dto.setEmailNotificationSent(contactRequest.isEmailNotificationSent());
        dto.setActive(contactRequest.getActive());
        dto.setConvertedToAppointmentId(contactRequest.getConvertedToAppointmentId());
        dto.setSenderPhone(contactRequest.getSenderPhone());
        dto.setSenderContactEmail(contactRequest.getSenderContactEmail());
        dto.setHiddenBySender(contactRequest.getHiddenBySender());
        dto.setHiddenByReceiver(contactRequest.getHiddenByReceiver());
        dto.setAppointmentDateTime(contactRequest.getAppointmentDateTime());
        dto.setLocationAddress(contactRequest.getLocationAddress());
        dto.setLocationNotes(contactRequest.getLocationNotes());
        dto.setDurationMinutes(contactRequest.getDurationMinutes());
        dto.setLatitude(contactRequest.getLatitude());
        dto.setLongitude(contactRequest.getLongitude());
        return dto;
    }
}