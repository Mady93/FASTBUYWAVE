package com.mady.springboot_be.dtos.dashboard;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for upcoming appointments in dashboard view.
 * 
 * Contains summary information for appointments scheduled in the near future,
 * including participants' details (email, phone, name), product name,
 * status, and appointment type.
 * 
 * Used in dashboard widgets to display upcoming calendar events.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class UpcomingAppointmentDTO implements Serializable {

    private static final long serialVersionUID = 2025042200043L;

    private Long id;
    private LocalDateTime dateTime;

    // Requester (who requested the appointment)
    private String requesterEmail;
    private String requesterPhone;
    private String requesterName;

    // Organizer (who is organizing the appointment)
    private String organizerEmail;
    private String organizerName;
    private String organizerPhone;

    private String productName;
    private String status;
    private String type;

    /**
     * Default constructor.
     */
    public UpcomingAppointmentDTO() {
    }

    /**
     * Constructs an UpcomingAppointmentDTO with all fields.
     * 
     * @param id             appointment ID
     * @param dateTime       scheduled date and time
     * @param requesterEmail requester's email
     * @param requesterPhone requester's phone number
     * @param requesterName  requester's full name
     * @param organizerEmail organizer's email
     * @param organizerName  organizer's full name
     * @param organizerPhone organizer's phone number
     * @param productName    associated product name
     * @param status         appointment status
     * @param type           appointment type (location type)
     */
    public UpcomingAppointmentDTO(Long id, LocalDateTime dateTime, String requesterEmail, String requesterPhone,
            String requesterName, String organizerEmail, String organizerName, String organizerPhone,
            String productName, String status, String type) {
        this.id = id;
        this.dateTime = dateTime;
        this.requesterEmail = requesterEmail;
        this.requesterPhone = requesterPhone;
        this.requesterName = requesterName;
        this.organizerEmail = organizerEmail;
        this.organizerName = organizerName;
        this.organizerPhone = organizerPhone;
        this.productName = productName;
        this.status = status;
        this.type = type;
    }

    /**
     * Returns the appointment ID.
     * 
     * @return the appointment ID
     */
    public Long getId() {
        return this.id;
    }

    /**
     * Sets the appointment ID.
     * 
     * @param id the appointment ID to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Returns the scheduled date and time.
     * 
     * @return the scheduled date and time
     */
    public LocalDateTime getDateTime() {
        return this.dateTime;
    }

    /**
     * Sets the scheduled date and time.
     * 
     * @param dateTime the scheduled date and time to set
     */
    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    /**
     * Returns the requester's email.
     * 
     * @return the requester's email
     */
    public String getRequesterEmail() {
        return this.requesterEmail;
    }

    /**
     * Sets the requester's email.
     * 
     * @param requesterEmail the requester's email to set
     */
    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }

    /**
     * Returns the requester's phone number.
     * 
     * @return the requester's phone number
     */
    public String getRequesterPhone() {
        return this.requesterPhone;
    }

    /**
     * Sets the requester's phone number.
     * 
     * @param requesterPhone the requester's phone number to set
     */
    public void setRequesterPhone(String requesterPhone) {
        this.requesterPhone = requesterPhone;
    }

    /**
     * Returns the requester's full name.
     * 
     * @return the requester's full name
     */
    public String getRequesterName() {
        return this.requesterName;
    }

    /**
     * Sets the requester's full name.
     * 
     * @param requesterName the requester's full name to set
     */
    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    /**
     * Returns the organizer's email.
     * 
     * @return the organizer email
     */
    public String getOrganizerEmail() {
        return this.organizerEmail;
    }

    /**
     * Sets the organizer's email.
     * 
     * @param organizerEmail the organizer email to set
     */
    public void setOrganizerEmail(String organizerEmail) {
        this.organizerEmail = organizerEmail;
    }

    /**
     * Returns the organizer's full name.
     * 
     * @return the organizer full name
     */
    public String getOrganizerName() {
        return this.organizerName;
    }

    /**
     * Sets the organizer's full name.
     * 
     * @param organizerName the organizer full name to set
     */
    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    /**
     * Returns the organizer's phone number.
     * 
     * @return the organizer phone number
     */
    public String getOrganizerPhone() {
        return this.organizerPhone;
    }

    /**
     * Sets the organizer's phone number.
     * 
     * @param organizerPhone the organizer phone number to set
     */
    public void setOrganizerPhone(String organizerPhone) {
        this.organizerPhone = organizerPhone;
    }

    /**
     * Returns the associated product name.
     * 
     * @return the product name
     */
    public String getProductName() {
        return this.productName;
    }

    /**
     * Sets the associated product name.
     * 
     * @param productName the product name to set
     */
    public void setProductName(String productName) {
        this.productName = productName;
    }

    /**
     * Returns the appointment status.
     * 
     * @return the appointment status
     */
    public String getStatus() {
        return this.status;
    }

    /**
     * Sets the appointment status.
     * 
     * @param status the appointment status to set
     */
    public void setStatus(String status) {
        this.status = status;
    }

    /**
     * Returns the appointment type (location type).
     * 
     * @return the appointment type
     */
    public String getType() {
        return this.type;
    }

    /**
     * Sets the appointment type (location type).
     * 
     * @param type the appointment type to set
     */
    public void setType(String type) {
        this.type = type;
    }

    /**
     * Fluent setter for id.
     * 
     * @param id the appointment ID
     * @return this instance for method chaining
     */
    public UpcomingAppointmentDTO id(Long id) {
        setId(id);
        return this;
    }

    /**
     * Fluent setter for dateTime.
     * 
     * @param dateTime the date and time
     * @return this instance for method chaining
     */
    public UpcomingAppointmentDTO dateTime(LocalDateTime dateTime) {
        setDateTime(dateTime);
        return this;
    }

    /**
     * Fluent setter for requesterEmail.
     * 
     * @param requesterEmail the requester email
     * @return this instance for method chaining
     */
    public UpcomingAppointmentDTO requesterEmail(String requesterEmail) {
        setRequesterEmail(requesterEmail);
        return this;
    }

    /**
     * Fluent setter for requesterPhone.
     * 
     * @param requesterPhone the requester phone
     * @return this instance for method chaining
     */
    public UpcomingAppointmentDTO requesterPhone(String requesterPhone) {
        setRequesterPhone(requesterPhone);
        return this;
    }

    /**
     * Fluent setter for requesterName.
     * 
     * @param requesterName the requester name
     * @return this instance for method chaining
     */
    public UpcomingAppointmentDTO requesterName(String requesterName) {
        setRequesterName(requesterName);
        return this;
    }

    /**
     * Fluent setter for organizerEmail.
     * 
     * @param organizerEmail the organizer email
     * @return this instance for method chaining
     */
    public UpcomingAppointmentDTO organizerEmail(String organizerEmail) {
        setOrganizerEmail(organizerEmail);
        return this;
    }

    /**
     * Fluent setter for organizerName.
     * 
     * @param organizerName the organizer name
     * @return this instance for method chaining
     */
    public UpcomingAppointmentDTO organizerName(String organizerName) {
        setOrganizerName(organizerName);
        return this;
    }

    /**
     * Fluent setter for organizerPhone.
     * 
     * @param organizerPhone the organizer phone
     * @return this instance for method chaining
     */
    public UpcomingAppointmentDTO organizerPhone(String organizerPhone) {
        setOrganizerPhone(organizerPhone);
        return this;
    }

    /**
     * Fluent setter for productName.
     * 
     * @param productName the product name
     * @return this instance for method chaining
     */
    public UpcomingAppointmentDTO productName(String productName) {
        setProductName(productName);
        return this;
    }

    /**
     * Fluent setter for status.
     * 
     * @param status the appointment status
     * @return this instance for method chaining
     */
    public UpcomingAppointmentDTO status(String status) {
        setStatus(status);
        return this;
    }

    /**
     * Fluent setter for type.
     * 
     * @param type the appointment type
     * @return this instance for method chaining
     */
    public UpcomingAppointmentDTO type(String type) {
        setType(type);
        return this;
    }

    /**
     * Returns a string representation of the UpcomingAppointmentDTO.
     * 
     * @return string with all appointment fields
     */
    @Override
    public String toString() {
        return "{" +
                " id='" + getId() + "'" +
                ", dateTime='" + getDateTime() + "'" +
                ", requesterEmail='" + getRequesterEmail() + "'" +
                ", requesterPhone='" + getRequesterPhone() + "'" +
                ", requesterName='" + getRequesterName() + "'" +
                ", organizerEmail='" + getOrganizerEmail() + "'" +
                ", organizerName='" + getOrganizerName() + "'" +
                ", organizerPhone='" + getOrganizerPhone() + "'" +
                ", productName='" + getProductName() + "'" +
                ", status='" + getStatus() + "'" +
                ", type='" + getType() + "'" +
                "}";
    }

}