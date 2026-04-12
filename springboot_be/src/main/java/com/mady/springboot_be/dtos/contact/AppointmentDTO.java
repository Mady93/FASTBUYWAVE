package com.mady.springboot_be.dtos.contact;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.mady.springboot_be.dtos.UserProfileDTO;
import com.mady.springboot_be.dtos.sample_dtos.ProductCompleteDto;
import com.mady.springboot_be.enums.contact.AppointmentStatus;
import com.mady.springboot_be.enums.contact.LocationType;

/**
 * Data Transfer Object for appointment information.
 * 
 * Contains complete appointment details including requester and organizer
 * profiles,
 * associated product, date/time, duration, location type (IN_PERSON, ONLINE,
 * PHONE_CALL),
 * status (PENDING, CONFIRMED, CANCELLED, COMPLETED, RESCHEDULED), and
 * timestamps.
 * 
 * Supports calendar views, reminders, and post-appointment feedback with
 * rating.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class AppointmentDTO implements Serializable {

    private static final long serialVersionUID = 202504220008L;

    private Long appointmentId;
    private UserProfileDTO requester;
    private UserProfileDTO organizer;
    private ProductCompleteDto product;
    private String title;
    private String description;
    private LocalDateTime appointmentDatetime;
    private Integer durationMinutes; // Estimated duration
    private LocationType locationType; // IN_PERSON, ONLINE, PHONE_CALL
    private String locationAddress;
    private String locationNotes;
    private String meetingLink; // For online meetings
    private AppointmentStatus status; // PENDING, CONFIRMED, CANCELLED, COMPLETED, RESCHEDULED
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime completedAt;
    private String cancellationReason;
    private Long cancelledByUserId;
    private boolean reminderSent;
    private LocalDateTime reminderSentAt;
    private boolean active;
    private Integer rating; // 1-5
    private String feedback;
    private BigDecimal latitude;
    private BigDecimal longitude;

    /**
     * Default constructor.
     */
    public AppointmentDTO() {
    }

    /**
     * Constructs an AppointmentDTO with all fields.
     * 
     * @param appointmentId       unique identifier
     * @param requester           user who requested the appointment
     * @param organizer           user who organizes the appointment
     * @param product             associated product
     * @param title               appointment title
     * @param description         appointment description
     * @param appointmentDatetime scheduled date and time
     * @param durationMinutes     estimated duration in minutes
     * @param locationType        type of location (IN_PERSON, ONLINE, PHONE_CALL)
     * @param locationAddress     physical address (if IN_PERSON)
     * @param locationNotes       additional location notes
     * @param meetingLink         link for online meeting (if ONLINE)
     * @param status              current status
     * @param createdAt           creation timestamp
     * @param confirmedAt         confirmation timestamp
     * @param cancelledAt         cancellation timestamp
     * @param completedAt         completion timestamp
     * @param cancellationReason  reason for cancellation
     * @param cancelledByUserId   ID of user who cancelled
     * @param reminderSent        whether reminder was sent
     * @param reminderSentAt      reminder timestamp
     * @param active              whether appointment is active
     * @param rating              user rating (1-5)
     * @param feedback            user feedback
     * @param latitude            geographic latitude
     * @param longitude           geographic longitude
     */
    public AppointmentDTO(Long appointmentId, UserProfileDTO requester, UserProfileDTO organizer,
            ProductCompleteDto product, String title,
            String description, LocalDateTime appointmentDatetime, Integer durationMinutes, LocationType locationType,
            String locationAddress, String locationNotes, String meetingLink, AppointmentStatus status,
            LocalDateTime createdAt, LocalDateTime confirmedAt, LocalDateTime cancelledAt, LocalDateTime completedAt,
            String cancellationReason, Long cancelledByUserId, boolean reminderSent, LocalDateTime reminderSentAt,
            boolean active, Integer rating, String feedback, BigDecimal latitude, BigDecimal longitude) {
        this.appointmentId = appointmentId;
        this.requester = requester;
        this.organizer = organizer;
        this.product = product;
        this.title = title;
        this.description = description;
        this.appointmentDatetime = appointmentDatetime;
        this.durationMinutes = durationMinutes;
        this.locationType = locationType;
        this.locationAddress = locationAddress;
        this.locationNotes = locationNotes;
        this.meetingLink = meetingLink;
        this.status = status;
        this.createdAt = createdAt;
        this.confirmedAt = confirmedAt;
        this.cancelledAt = cancelledAt;
        this.completedAt = completedAt;
        this.cancellationReason = cancellationReason;
        this.cancelledByUserId = cancelledByUserId;
        this.reminderSent = reminderSent;
        this.reminderSentAt = reminderSentAt;
        this.active = active;
        this.rating = rating;
        this.feedback = feedback;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    /**
     * Returns the appointment ID.
     * 
     * @return the appointment ID
     */
    public Long getAppointmentId() {
        return this.appointmentId;
    }

    /**
     * Sets the appointment ID.
     * 
     * @param appointmentId the appointment ID to set
     */
    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    /**
     * Returns the requester (user who requested the appointment).
     * 
     * @return the requester profile
     */
    public UserProfileDTO getRequester() {
        return this.requester;
    }

    /**
     * Sets the requester (user who requested the appointment).
     * 
     * @param requester the requester profile to set
     */
    public void setRequester(UserProfileDTO requester) {
        this.requester = requester;
    }

    /**
     * Returns the organizer (user who organizes the appointment).
     * 
     * @return the organizer profile
     */
    public UserProfileDTO getOrganizer() {
        return this.organizer;
    }

    /**
     * Sets the organizer (user who organizes the appointment).
     * 
     * @param organizer the organizer profile to set
     */
    public void setOrganizer(UserProfileDTO organizer) {
        this.organizer = organizer;
    }

    /**
     * Returns the associated product.
     * 
     * @return the product
     */
    public ProductCompleteDto getProduct() {
        return this.product;
    }

    /**
     * Sets the associated product.
     * 
     * @param product the product to set
     */
    public void setProduct(ProductCompleteDto product) {
        this.product = product;
    }

    /**
     * Returns the appointment title.
     * 
     * @return the title
     */
    public String getTitle() {
        return this.title;
    }

    /**
     * Sets the appointment title.
     * 
     * @param title the title to set
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Returns the appointment description.
     * 
     * @return the description
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * Sets the appointment description.
     * 
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Returns the scheduled date and time.
     * 
     * @return the appointment datetime
     */
    public LocalDateTime getAppointmentDatetime() {
        return this.appointmentDatetime;
    }

    /**
     * Sets the scheduled date and time.
     * 
     * @param appointmentDatetime the appointment datetime to set
     */
    public void setAppointmentDatetime(LocalDateTime appointmentDatetime) {
        this.appointmentDatetime = appointmentDatetime;
    }

    /**
     * Returns the estimated duration in minutes.
     * 
     * @return the duration in minutes
     */
    public Integer getDurationMinutes() {
        return this.durationMinutes;
    }

    /**
     * Sets the estimated duration in minutes.
     * 
     * @param durationMinutes the duration in minutes to set
     */
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    /**
     * Returns the location type.
     * 
     * @return the location type (e.g., IN_PERSON)
     */
    public LocationType getLocationType() {
        return this.locationType;
    }

    /**
     * Sets the location type.
     * 
     * @param locationType the location type to set
     */
    public void setLocationType(LocationType locationType) {
        this.locationType = locationType;
    }

    /**
     * Returns the physical location address (for IN_PERSON appointments).
     * 
     * @return the location address
     */
    public String getLocationAddress() {
        return this.locationAddress;
    }

    /**
     * Sets the physical location address (for IN_PERSON appointments).
     * 
     * @param locationAddress the location address to set
     */
    public void setLocationAddress(String locationAddress) {
        this.locationAddress = locationAddress;
    }

    /**
     * Returns the location notes.
     * 
     * @return the location notes
     */

    public String getLocationNotes() {
        return this.locationNotes;
    }

    /**
     * Sets the location notes.
     * 
     * @param locationNotes the location notes to set
     */
    public void setLocationNotes(String locationNotes) {
        this.locationNotes = locationNotes;
    }

    /**
     * Returns the meeting link (for ONLINE appointments).
     * 
     * @return the meeting link
     */
    public String getMeetingLink() {
        return this.meetingLink;
    }

    /**
     * Sets the meeting link (for ONLINE appointments).
     * 
     * @param meetingLink the meeting link to set
     */
    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    /**
     * Returns the appointment status.
     * 
     * @return the status (PENDING, CONFIRMED, CANCELLED, COMPLETED, RESCHEDULED)
     */
    public AppointmentStatus getStatus() {
        return this.status;
    }

    /**
     * Sets the appointment status.
     * 
     * @param status the status to set
     */
    public void setStatus(AppointmentStatus status) {
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
     * @param createdAt the timestamp to set
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Returns the confirmation timestamp.
     * 
     * @return the confirmation timestamp
     */
    public LocalDateTime getConfirmedAt() {
        return this.confirmedAt;
    }

    /**
     * Sets the confirmation timestamp.
     * 
     * @param confirmedAt the timestamp to set
     */
    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    /**
     * Returns the cancellation timestamp.
     * 
     * @return the cancellation timestamp
     */
    public LocalDateTime getCancelledAt() {
        return this.cancelledAt;
    }

    /**
     * Sets the cancellation timestamp.
     * 
     * @param cancelledAt the timestamp to set
     */
    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    /**
     * Returns the completion timestamp.
     * 
     * @return the completion timestamp
     */
    public LocalDateTime getCompletedAt() {
        return this.completedAt;
    }

    /**
     * Sets the completion timestamp.
     * 
     * @param completedAt the timestamp to set
     */
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    /**
     * Returns the cancellation reason.
     * 
     * @return the cancellation reason
     */
    public String getCancellationReason() {
        return this.cancellationReason;
    }

    /**
     * Sets the cancellation reason.
     * 
     * @param cancellationReason the reason to set
     */
    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    /**
     * Returns the ID of the user who cancelled the appointment.
     * 
     * @return the cancelled by user ID
     */
    public Long getCancelledByUserId() {
        return this.cancelledByUserId;
    }

    /**
     * Sets the ID of the user who cancelled the appointment.
     * 
     * @param cancelledByUserId the user ID to set
     */
    public void setCancelledByUserId(Long cancelledByUserId) {
        this.cancelledByUserId = cancelledByUserId;
    }

    /**
     * Returns whether a reminder was sent.
     * 
     * @return true if reminder sent, false otherwise
     */
    public boolean isReminderSent() {
        return this.reminderSent;
    }

    /**
     * Returns whether a reminder was sent (getter for frameworks).
     * 
     * @return true if reminder sent, false otherwise
     */
    public boolean getReminderSent() {
        return this.reminderSent;
    }

    /**
     * Sets whether a reminder was sent.
     * 
     * @param reminderSent the flag to set
     */
    public void setReminderSent(boolean reminderSent) {
        this.reminderSent = reminderSent;
    }

    /**
     * Returns the reminder sent timestamp.
     * 
     * @return the reminder timestamp
     */
    public LocalDateTime getReminderSentAt() {
        return this.reminderSentAt;
    }

    /**
     * Sets the reminder sent timestamp.
     * 
     * @param reminderSentAt the timestamp to set
     */
    public void setReminderSentAt(LocalDateTime reminderSentAt) {
        this.reminderSentAt = reminderSentAt;
    }

    /**
     * Returns whether the appointment is active.
     * 
     * @return true if active, false otherwise
     */
    public boolean getActive() {
        return this.active;
    }

    /**
     * Sets whether the appointment is active.
     * 
     * @param active the flag to set
     */
    public void setActive(boolean active) {
        this.active = active;
    }

    /**
     * Returns the user rating (1-5).
     * 
     * @return the rating
     */
    public Integer getRating() {
        return this.rating;
    }

    /**
     * Sets the user rating.
     * 
     * @param rating the rating to set (1-5)
     */
    public void setRating(Integer rating) {
        this.rating = rating;
    }

    /**
     * Returns the user feedback.
     * 
     * @return the feedback
     */
    public String getFeedback() {
        return this.feedback;
    }

    /**
     * Sets the user feedback.
     * 
     * @param feedback the feedback to set
     */
    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    /**
     * Returns the geographic latitude.
     * 
     * @return the latitude
     */
    public BigDecimal getLatitude() {
        return this.latitude;
    }

    /**
     * Sets the geographic latitude.
     * 
     * @param latitude the latitude to set
     */
    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    /**
     * Returns the geographic longitude.
     * 
     * @return the longitude
     */
    public BigDecimal getLongitude() {
        return this.longitude;
    }

    /**
     * Sets the geographic longitude.
     * 
     * @param longitude the longitude to set
     */
    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    /**
     * Returns a string representation of the AppointmentDTO.
     * 
     * @return string with all appointment fields
     */
    @Override
    public String toString() {
        return "{" +
                " appointmentId='" + getAppointmentId() + "'" +
                ", requester='" + getRequester() + "'" +
                ", organizer='" + getOrganizer() + "'" +
                ", product='" + getProduct() + "'" +
                ", title='" + getTitle() + "'" +
                ", description='" + getDescription() + "'" +
                ", appointmentDatetime='" + getAppointmentDatetime() + "'" +
                ", durationMinutes='" + getDurationMinutes() + "'" +
                ", locationType='" + getLocationType() + "'" +
                ", locationAddress='" + getLocationAddress() + "'" +
                ", locationNotes='" + getLocationNotes() + "'" +
                ", meetingLink='" + getMeetingLink() + "'" +
                ", status='" + getStatus() + "'" +
                ", createdAt='" + getCreatedAt() + "'" +
                ", confirmedAt='" + getConfirmedAt() + "'" +
                ", cancelledAt='" + getCancelledAt() + "'" +
                ", completedAt='" + getCompletedAt() + "'" +
                ", cancellationReason='" + getCancellationReason() + "'" +
                ", cancelledByUserId='" + getCancelledByUserId() + "'" +
                ", reminderSent='" + isReminderSent() + "'" +
                ", reminderSentAt='" + getReminderSentAt() + "'" +
                ", active='" + getActive() + "'" +
                ", rating='" + getRating() + "'" +
                ", feedback='" + getFeedback() + "'" +
                ", latitude='" + getLatitude() + "'" +
                ", longitude='" + getLongitude() + "'" +
                "}";
    }

}
