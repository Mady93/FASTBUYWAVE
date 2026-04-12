package com.mady.springboot_be.entities.contact;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.mady.springboot_be.entities.Product;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.enums.contact.AppointmentStatus;
import com.mady.springboot_be.enums.contact.LocationType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;

@NamedQueries({
    @NamedQuery(name = "Appointment.findByRequesterIdAndActiveTrue",
                query = "SELECT a FROM Appointment a WHERE a.requester.id = :requesterId AND a.active = true"),
    
    @NamedQuery(name = "Appointment.findByRequesterIdAndStatusAndActiveTrue",
                query = "SELECT a FROM Appointment a WHERE a.requester.id = :requesterId AND a.status = :status AND a.active = true"),
    
    @NamedQuery(name = "Appointment.findByOrganizerIdAndActiveTrue",
                query = "SELECT a FROM Appointment a WHERE a.organizer.id = :organizerId AND a.active = true"),
    
    @NamedQuery(name = "Appointment.findByOrganizerIdAndStatusAndActiveTrue",
                query = "SELECT a FROM Appointment a WHERE a.organizer.id = :organizerId AND a.status = :status AND a.active = true"),
    
    @NamedQuery(
    name = "Appointment.findByUserInvolved",
    query = "SELECT a FROM Appointment a " +
            "JOIN FETCH a.requester " +
            "JOIN FETCH a.organizer " +
            "WHERE (a.requester.id = :userId OR a.organizer.id = :userId) " +
            "AND a.active = true " +
            "ORDER BY a.appointmentDatetime ASC"),
            
    @NamedQuery(name = "Appointment.findConfirmedByUser",
                query = "SELECT a FROM Appointment a WHERE (a.requester.id = :userId OR a.organizer.id = :userId) AND a.status = 'CONFIRMED' AND a.active = true ORDER BY a.appointmentDatetime ASC"),
    
    @NamedQuery(name = "Appointment.findByProductIdAndActiveTrue",
                query = "SELECT a FROM Appointment a WHERE a.product.id = :productId AND a.active = true"),
    
    @NamedQuery(name = "Appointment.findByUserAndDateRange",
                query = "SELECT a FROM Appointment a WHERE (a.requester.id = :userId OR a.organizer.id = :userId) AND a.appointmentDatetime BETWEEN :startDate AND :endDate AND a.active = true ORDER BY a.appointmentDatetime ASC"),
    
    @NamedQuery(name = "Appointment.findTodayAppointmentsByUser",
                query = "SELECT a FROM Appointment a WHERE (a.requester.id = :userId OR a.organizer.id = :userId) AND DATE(a.appointmentDatetime) = CURRENT_DATE AND a.active = true ORDER BY a.appointmentDatetime ASC"),
    
    @NamedQuery(name = "Appointment.findThisWeekAppointmentsByUser",
                query = "SELECT a FROM Appointment a WHERE (a.requester.id = :userId OR a.organizer.id = :userId) AND WEEK(a.appointmentDatetime) = WEEK(CURRENT_DATE) AND YEAR(a.appointmentDatetime) = YEAR(CURRENT_DATE) AND a.active = true ORDER BY a.appointmentDatetime ASC"),
    
    @NamedQuery(name = "Appointment.findAppointmentsNeedingReminder",
                query = "SELECT a FROM Appointment a WHERE a.appointmentDatetime BETWEEN CURRENT_TIMESTAMP AND :reminderTime AND a.status = 'CONFIRMED' AND a.reminderSent = false AND a.active = true"),
    
    @NamedQuery(name = "Appointment.countByStatusAndActiveTrue",
                query = "SELECT COUNT(a) FROM Appointment a WHERE a.status = :status AND a.active = true"),
    
    @NamedQuery(name = "Appointment.findCalendarAppointments",
                query = "SELECT new map(a.appointmentId as id, a.title as title, a.appointmentDatetime as datetime, a.status as status, a.durationMinutes as duration) FROM Appointment a WHERE (a.requester.id = :userId OR a.organizer.id = :userId) AND YEAR(a.appointmentDatetime) = :year AND MONTH(a.appointmentDatetime) = :month AND a.active = true"),
    
    @NamedQuery(name = "Appointment.getAppointmentStatsByOrganizer",
                query = "SELECT a.status, COUNT(a) FROM Appointment a WHERE a.organizer.id = :organizerId AND a.active = true GROUP BY a.status"),

    @NamedQuery(name = "Appointment.countAppointmentsByPeriod",
                query = "SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDatetime BETWEEN :startDate AND :endDate AND a.active = true"),
    
@NamedQuery(name = "Appointment.getUpcomingAppointmentsByPeriodAndUser",
    query = "SELECT a.appointmentId, a.appointmentDatetime, " +
            "requester.email, " +                                // requesterEmail   (2)
            "requesterProfile.phoneNumber, " +                    // requesterPhone   (3)
            "organizer.email, " +                                 // organizerEmail   (4)
            "organizerProfile.phoneNumber, " +                    // organizerPhone   (5)
            "CAST(a.status AS string), " +                        // status           (6)
            "CAST(a.locationType AS string), " +                  // type             (7)
            "a.title " +                                          // productName      (8)
            "FROM Appointment a " +
            "JOIN a.requester requester " +
            "JOIN a.organizer organizer " +
            "JOIN Profile requesterProfile ON requesterProfile.user.userId = requester.userId " +
            "JOIN Profile organizerProfile ON organizerProfile.user.userId = organizer.userId " +
            "WHERE a.appointmentDatetime BETWEEN :startDate AND :endDate " +
            "AND a.active = true " +
            "AND (a.requester.id = :userId OR a.organizer.id = :userId) " +
            "ORDER BY a.appointmentDatetime ASC")

})
@Table(name = "appointments")
@Entity
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long appointmentId;

    // CHI HA RICHIESTO (cliente interessato)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_user_id", nullable = false)
    private User requester;

    // CON CHI (proprietario annuncio)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_user_id", nullable = false)
    private User organizer;

    // PRODOTTO
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // DETTAGLI APPUNTAMENTO
    @Column(name = "title", length = 254, nullable = false)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "appointment_datetime", nullable = false)
    private LocalDateTime appointmentDatetime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes; // Durata stimata

    // LUOGO
    @Column(name = "location_type")
    @Enumerated(EnumType.STRING)
    private LocationType locationType; // IN_PERSON, ONLINE, PHONE_CALL

    @Column(name = "location_address", length = 500)
    private String locationAddress;

    @Column(name = "location_notes", length = 500)
    private String locationNotes;

    @Column(name = "meeting_link", length = 500)
    private String meetingLink; // Per meeting online

    // STATO
    @Column(name = "status", length = 20)
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status; // PENDING, CONFIRMED, CANCELLED, COMPLETED, RESCHEDULED

    // TIMESTAMP
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // CANCELLAZIONE/RIFIUTO
    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "cancelled_by_user_id")
    private Long cancelledByUserId;

    // REMINDER
    @Column(name = "reminder_sent")
    private boolean reminderSent;

    @Column(name = "reminder_sent_at")
    private LocalDateTime reminderSentAt;

    // FLAG
    @Column(name = "active")
    private boolean active;

    // RATING (opzionale - per feedback post-appuntamento)
    @Column(name = "rating")
    private Integer rating; // 1-5

    @Column(name = "feedback", length = 1000)
    private String feedback;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    public Appointment() {
    }

    public Appointment(Long appointmentId, User requester, User organizer, Product product, String title,
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

    public Long getAppointmentId() {
        return this.appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public User getRequester() {
        return this.requester;
    }

    public void setRequester(User requester) {
        this.requester = requester;
    }

    public User getOrganizer() {
        return this.organizer;
    }

    public void setOrganizer(User organizer) {
        this.organizer = organizer;
    }

    public Product getProduct() {
        return this.product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getTitle() {
        return this.title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getAppointmentDatetime() {
        return this.appointmentDatetime;
    }

    public void setAppointmentDatetime(LocalDateTime appointmentDatetime) {
        this.appointmentDatetime = appointmentDatetime;
    }

    public Integer getDurationMinutes() {
        return this.durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public LocationType getLocationType() {
        return this.locationType;
    }

    public void setLocationType(LocationType locationType) {
        this.locationType = locationType;
    }

    public String getLocationAddress() {
        return this.locationAddress;
    }

    public void setLocationAddress(String locationAddress) {
        this.locationAddress = locationAddress;
    }

    public String getLocationNotes() {
        return this.locationNotes;
    }

    public void setLocationNotes(String locationNotes) {
        this.locationNotes = locationNotes;
    }

    public String getMeetingLink() {
        return this.meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public AppointmentStatus getStatus() {
        return this.status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getConfirmedAt() {
        return this.confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    public LocalDateTime getCancelledAt() {
        return this.cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public LocalDateTime getCompletedAt() {
        return this.completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getCancellationReason() {
        return this.cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public Long getCancelledByUserId() {
        return this.cancelledByUserId;
    }

    public void setCancelledByUserId(Long cancelledByUserId) {
        this.cancelledByUserId = cancelledByUserId;
    }

    public boolean isReminderSent() {
        return this.reminderSent;
    }

    public boolean getReminderSent() {
        return this.reminderSent;
    }

    public void setReminderSent(boolean reminderSent) {
        this.reminderSent = reminderSent;
    }

    public LocalDateTime getReminderSentAt() {
        return this.reminderSentAt;
    }

    public void setReminderSentAt(LocalDateTime reminderSentAt) {
        this.reminderSentAt = reminderSentAt;
    }

    public boolean getActive() {
        return this.active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Integer getRating() {
        return this.rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getFeedback() {
        return this.feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public BigDecimal getLatitude() {
        return this.latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return this.longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }


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
