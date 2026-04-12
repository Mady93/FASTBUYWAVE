package com.mady.springboot_be.dtos.contact;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.mady.springboot_be.dtos.UserProfileDTO;
import com.mady.springboot_be.dtos.sample_dtos.ProductCompleteDto;
import com.mady.springboot_be.enums.contact.ContactMethod;
import com.mady.springboot_be.enums.contact.RequestStatus;

/**
 * Data Transfer Object for contact requests between users.
 * 
 * Represents a contact request sent by a user (sender) to another user
 * (receiver)
 * regarding a specific product. Supports different contact methods:
 * - EMAIL: contact via email
 * - PHONE: contact via phone call
 * - WHATSAPP: contact via WhatsApp/SMS
 * - MEETING: request an in-person meeting (converted to appointment)
 * 
 * Request status can be:
 * - PENDING: waiting for receiver response
 * - ACCEPTED: receiver accepted, meeting converted to appointment
 * - REJECTED: receiver rejected with optional reason
 * 
 * Features:
 * - Soft delete via active flag
 * - Individual hiding by sender/receiver (both must hide to deactivate)
 * - Email notification tracking
 * - Meeting details for MEETING requests (date, location, duration,
 * coordinates)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ContactRequestDTO implements Serializable {

    private static final long serialVersionUID = 2025042200047L;

    private Long requestId;
    private UserProfileDTO sender;
    private UserProfileDTO receiver;
    private ProductCompleteDto product;
    private String subject;
    private String message;
    private String additionalNotes;
    private ContactMethod preferredContactMethod; // EMAIL, PHONE, WHATSAPP, MEETING
    private RequestStatus status; // PENDING, ACCEPTED, REJECTED
    private LocalDateTime createdAt;
    private LocalDateTime rejectedAt;
    private String rejectionReason;
    private boolean emailNotificationSent;
    private boolean active;
    private Long convertedToAppointmentId;
    private String senderPhone;
    private String senderContactEmail;
    private boolean hiddenBySender;
    private boolean hiddenByReceiver;

    // Meeting-specific fields (used when preferredContactMethod = MEETING)
    private LocalDateTime appointmentDateTime;
    private String locationAddress;
    private String locationNotes;
    private Integer durationMinutes;
    private BigDecimal latitude;
    private BigDecimal longitude;

    /**
     * Default constructor.
     */
    public ContactRequestDTO() {
    }

    /**
     * Constructs a ContactRequestDTO with all fields.
     * 
     * @param requestId                unique identifier
     * @param sender                   user who sent the request
     * @param receiver                 user who receives the request
     * @param product                  product being inquired about
     * @param subject                  request subject
     * @param message                  request message
     * @param additionalNotes          additional notes
     * @param preferredContactMethod   preferred contact method
     * @param status                   request status
     * @param createdAt                creation timestamp
     * @param rejectedAt               rejection timestamp
     * @param rejectionReason          reason for rejection
     * @param emailNotificationSent    whether email notification was sent
     * @param active                   whether request is active
     * @param convertedToAppointmentId ID of created appointment (if meeting)
     * @param senderPhone              sender's phone number
     * @param senderContactEmail       sender's contact email
     * @param hiddenBySender           whether sender hid this request
     * @param hiddenByReceiver         whether receiver hid this request
     * @param appointmentDateTime      proposed meeting date/time
     * @param locationAddress          meeting location address
     * @param locationNotes            meeting location notes
     * @param durationMinutes          meeting duration in minutes
     * @param latitude                 geographic latitude
     * @param longitude                geographic longitude
     */
    public ContactRequestDTO(Long requestId, UserProfileDTO sender, UserProfileDTO receiver, ProductCompleteDto product,
            String subject,
            String message, String additionalNotes, ContactMethod preferredContactMethod, RequestStatus status,
            LocalDateTime createdAt, LocalDateTime rejectedAt, String rejectionReason, boolean emailNotificationSent,
            boolean active,
            Long convertedToAppointmentId, String senderPhone, String senderContactEmail, boolean hiddenBySender,
            boolean hiddenByReceiver, LocalDateTime appointmentDateTime, String locationAddress, String locationNotes,
            Integer durationMinutes, BigDecimal latitude, BigDecimal longitude) {
        this.requestId = requestId;
        this.sender = sender;
        this.receiver = receiver;
        this.product = product;
        this.subject = subject;
        this.message = message;
        this.additionalNotes = additionalNotes;
        this.preferredContactMethod = preferredContactMethod;
        this.status = status;
        this.createdAt = createdAt;
        this.rejectedAt = rejectedAt;
        this.rejectionReason = rejectionReason;
        this.emailNotificationSent = emailNotificationSent;
        this.active = active;
        this.convertedToAppointmentId = convertedToAppointmentId;
        this.senderPhone = senderPhone;
        this.senderContactEmail = senderContactEmail;
        this.hiddenBySender = hiddenBySender;
        this.hiddenByReceiver = hiddenByReceiver;
        this.appointmentDateTime = appointmentDateTime;
        this.locationAddress = locationAddress;
        this.locationNotes = locationNotes;
        this.durationMinutes = durationMinutes;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    /**
     * Returns the request ID.
     * 
     * @return the request ID
     */
    public Long getRequestId() {
        return this.requestId;
    }

    /**
     * Sets the request ID.
     * 
     * @param requestId the request ID to set
     */
    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    /**
     * Returns the sender (user who sent the request).
     * 
     * @return the sender profile
     */
    public UserProfileDTO getSender() {
        return this.sender;
    }

    /**
     * Sets the sender (user who sent the request).
     * 
     * @param sender the sender profile to set
     */
    public void setSender(UserProfileDTO sender) {
        this.sender = sender;
    }

    /**
     * Returns the receiver (user who receives the request).
     * 
     * @return the receiver profile
     */
    public UserProfileDTO getReceiver() {
        return this.receiver;
    }

    /**
     * Sets the receiver (user who receives the request).
     * 
     * @param receiver the receiver profile to set
     */
    public void setReceiver(UserProfileDTO receiver) {
        this.receiver = receiver;
    }

    /**
     * Returns the product being inquired about.
     * 
     * @return the product
     */
    public ProductCompleteDto getProduct() {
        return this.product;
    }

    /**
     * Sets the product being inquired about.
     * 
     * @param product the product to set
     */
    public void setProduct(ProductCompleteDto product) {
        this.product = product;
    }

    /**
     * Returns the request subject.
     * 
     * @return the subject
     */
    public String getSubject() {
        return this.subject;
    }

    /**
     * Sets the request subject.
     * 
     * @param subject the subject to set
     */
    public void setSubject(String subject) {
        this.subject = subject;
    }

    /**
     * Returns the request message.
     * 
     * @return the message
     */
    public String getMessage() {
        return this.message;
    }

    /**
     * Sets the request message.
     * 
     * @param message the message to set
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * Returns additional notes for the request.
     * 
     * @return the additional notes
     */
    public String getAdditionalNotes() {
        return this.additionalNotes;
    }

    /**
     * Sets additional notes for the request.
     * 
     * @param additionalNotes the additional notes to set
     */
    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }

    /**
     * Returns the preferred contact method.
     * 
     * @return the contact method (EMAIL, PHONE, WHATSAPP, MEETING)
     */
    public ContactMethod getPreferredContactMethod() {
        return this.preferredContactMethod;
    }

    /**
     * Sets the preferred contact method.
     * 
     * @param preferredContactMethod the contact method to set (EMAIL, PHONE,
     *                               WHATSAPP, MEETING)
     */
    public void setPreferredContactMethod(ContactMethod preferredContactMethod) {
        this.preferredContactMethod = preferredContactMethod;
    }

    /**
     * Returns the request status.
     * 
     * @return the status (PENDING, ACCEPTED, REJECTED)
     */
    public RequestStatus getStatus() {
        return this.status;
    }

    /**
     * Sets the request status.
     * 
     * @param status the status to set (PENDING, ACCEPTED, REJECTED)
     */
    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    /**
     * Returns the creation timestamp.
     * 
     * @return the creation timestamp
     */
    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    /**
     * Sets the creation timestamp.
     * 
     * @param createdAt the creation timestamp to set
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Returns the rejection timestamp.
     * 
     * @return the rejection timestamp
     */
    public LocalDateTime getRejectedAt() {
        return this.rejectedAt;
    }

    /**
     * Sets the rejection timestamp.
     * 
     * @param rejectedAt the rejection timestamp to set
     */
    public void setRejectedAt(LocalDateTime rejectedAt) {
        this.rejectedAt = rejectedAt;
    }

    /**
     * Returns the reason for rejection (if status is REJECTED).
     * 
     * @return the rejection reason
     */
    public String getRejectionReason() {
        return this.rejectionReason;
    }

    /**
     * Sets the reason for rejection (if status is REJECTED).
     * 
     * @param rejectionReason the rejection reason to set
     */
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    /**
     * Returns whether email notification was sent.
     * 
     * @return true if sent, false otherwise
     */
    public boolean isEmailNotificationSent() {
        return this.emailNotificationSent;
    }

    /**
     * Sets whether email notification was sent.
     * 
     * @param emailNotificationSent true if sent, false otherwise
     */
    public boolean getEmailNotificationSent() {
        return this.emailNotificationSent;
    }

    /**
     * Sets whether email notification was sent.
     * 
     * @param emailNotificationSent the flag to set
     */
    public void setEmailNotificationSent(boolean emailNotificationSent) {
        this.emailNotificationSent = emailNotificationSent;
    }

    /**
     * Returns whether the request is active.
     * 
     * @return true if active, false otherwise
     */
    public boolean getActive() {
        return this.active;
    }

    /**
     * Sets whether the request is active.
     * 
     * @param active true to set as active, false to deactivate
     */
    public void setActive(boolean active) {
        this.active = active;
    }

    /**
     * Returns the ID of the created appointment (for MEETING requests).
     * 
     * @return the appointment ID, or null if not converted
     */
    public Long getConvertedToAppointmentId() {
        return this.convertedToAppointmentId;
    }

    /**
     * Sets the ID of the created appointment (for MEETING requests).
     * 
     * @param convertedToAppointmentId the appointment ID to set
     */
    public void setConvertedToAppointmentId(Long convertedToAppointmentId) {
        this.convertedToAppointmentId = convertedToAppointmentId;
    }

    /**
     * Returns the sender's phone number.
     * 
     * @return the sender phone
     */
    public String getSenderPhone() {
        return this.senderPhone;
    }

    /**
     * Sets the sender's phone number.
     * 
     * @param senderPhone the phone to set
     */
    public void setSenderPhone(String senderPhone) {
        this.senderPhone = senderPhone;
    }

    /**
     * Returns the sender's contact email.
     * 
     * @return the sender email
     */
    public String getSenderContactEmail() {
        return this.senderContactEmail;
    }

    /**
     * Sets the sender's contact email.
     * 
     * @param senderContactEmail the email to set
     */
    public void setSenderContactEmail(String senderContactEmail) {
        this.senderContactEmail = senderContactEmail;
    }

    /**
     * Returns whether the sender hid this request.
     * 
     * @return true if hidden by sender
     */
    public boolean getHiddenBySender() {
        return this.hiddenBySender;
    }

    /**
     * Sets whether the sender hid this request.
     * 
     * @param hiddenBySender true to hide for sender, false to show
     */
    public void setHiddenBySender(boolean hiddenBySender) {
        this.hiddenBySender = hiddenBySender;
    }

    /**
     * Returns whether the receiver hid this request.
     * 
     * @return true if hidden by receiver
     */
    public boolean getHiddenByReceiver() {
        return this.hiddenByReceiver;
    }

    /**
     * Sets whether the receiver hid this request.
     * 
     * @param hiddenByReceiver true to hide for receiver, false to show
     */
    public void setHiddenByReceiver(boolean hiddenByReceiver) {
        this.hiddenByReceiver = hiddenByReceiver;
    }

    /**
     * Returns the proposed appointment date and time (for MEETING requests).
     * 
     * @return the appointment datetime
     */
    public LocalDateTime getAppointmentDateTime() {
        return this.appointmentDateTime;
    }

    /**
     * Sets the proposed appointment date and time (for MEETING requests).
     * 
     * @param appointmentDateTime the datetime to set
     */
    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }

    /**
     * Returns the meeting location address (for MEETING requests).
     * 
     * @return the location address
     */
    public String getLocationAddress() {
        return this.locationAddress;
    }

    /**
     * Sets the meeting location address (for MEETING requests).
     * 
     * @param locationAddress the location address to set
     */
    public void setLocationAddress(String locationAddress) {
        this.locationAddress = locationAddress;
    }

    /**
     * Returns the meeting location notes (for MEETING requests).
     * 
     * @return the location notes
     */
    public String getLocationNotes() {
        return this.locationNotes;
    }

    /**
     * Sets the meeting location notes (for MEETING requests).
     * 
     * @param locationNotes the location notes to set
     */
    public void setLocationNotes(String locationNotes) {
        this.locationNotes = locationNotes;
    }

    /**
     * Returns the proposed meeting duration in minutes (for MEETING requests).
     * 
     * @return the duration in minutes
     */
    public Integer getDurationMinutes() {
        return this.durationMinutes;
    }

    /**
     * Sets the proposed meeting duration in minutes (for MEETING requests).
     * 
     * @param durationMinutes the duration to set in minutes
     */
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    /**
     * Returns the geographic latitude (for MEETING requests).
     * 
     * @return the latitude
     */
    public BigDecimal getLatitude() {
        return this.latitude;
    }

    /**
     * Sets the geographic latitude (for MEETING requests).
     * 
     * @param latitude the latitude to set
     */
    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    /**
     * Returns the geographic longitude (for MEETING requests).
     * 
     * @return the longitude
     */
    public BigDecimal getLongitude() {
        return this.longitude;
    }

    /**
     * Sets the geographic longitude (for MEETING requests).
     * 
     * @param longitude the longitude to set
     */
    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    /**
     * Returns a string representation of the ContactRequestDTO.
     * 
     * @return string with all request fields
     */
    @Override
    public String toString() {
        return "{" +
                " requestId='" + getRequestId() + "'" +
                ", sender='" + getSender() + "'" +
                ", receiver='" + getReceiver() + "'" +
                ", product='" + getProduct() + "'" +
                ", subject='" + getSubject() + "'" +
                ", message='" + getMessage() + "'" +
                ", additionalNotes='" + getAdditionalNotes() + "'" +
                ", preferredContactMethod='" + getPreferredContactMethod() + "'" +
                ", status='" + getStatus() + "'" +
                ", createdAt='" + getCreatedAt() + "'" +
                ", rejectedAt='" + getRejectedAt() + "'" +
                ", rejectionReason='" + getRejectionReason() + "'" +
                ", emailNotificationSent='" + isEmailNotificationSent() + "'" +
                ", active='" + getActive() + "'" +
                ", convertedToAppointmentId='" + getConvertedToAppointmentId() + "'" +
                ", senderPhone='" + getSenderPhone() + "'" +
                ", senderEmail='" + getSenderContactEmail() + "'" +
                ", hiddenBySender='" + getHiddenBySender() + "'" +
                ", hiddenByReceiver='" + getHiddenByReceiver() + "'" +
                ", appointmentDateTime='" + getAppointmentDateTime() + "'" +
                ", locationAddress='" + getLocationAddress() + "'" +
                ", locationNotes='" + getLocationNotes() + "'" +
                ", durationMinutes='" + getDurationMinutes() + "'" +
                ", latitude='" + getLatitude() + "'" +
                ", longitude='" + getLongitude() + "'" +
                "}";
    }

}
