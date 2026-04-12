package com.mady.springboot_be.entities.contact;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.mady.springboot_be.entities.Product;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.enums.contact.ContactMethod;
import com.mady.springboot_be.enums.contact.RequestStatus;

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
    // Trova per receiver ID (proprietario annuncio)
    @NamedQuery(
        name = "ContactRequest.findByReceiverIdAndActiveTrue",
        query = "SELECT cr FROM ContactRequest cr WHERE cr.receiver.userId = :receiverId " +
                "AND cr.active = true " +
                "AND cr.hiddenByReceiver = false " +
                "ORDER BY cr.createdAt DESC"
    ),
    // Trova per receiver ID e status
    @NamedQuery(
        name = "ContactRequest.findByReceiverIdAndStatusAndActiveTrue",
        query = "SELECT cr FROM ContactRequest cr WHERE cr.receiver.userId = :receiverId " +
                "AND cr.status = :status " +
                "AND cr.active = true " +
                "AND cr.hiddenByReceiver = false " +
                "ORDER BY cr.createdAt DESC"
    ),
    
    // Trova per sender ID (chi ha richiesto)
    @NamedQuery(
        name = "ContactRequest.findBySenderIdAndActiveTrue",
        query = "SELECT cr FROM ContactRequest cr WHERE cr.sender.userId = :senderId " +
                "AND cr.active = true " +
                "AND cr.hiddenBySender = false " +
                "ORDER BY cr.createdAt DESC"
    ),
    // Trova per sender ID e status
    @NamedQuery(
        name = "ContactRequest.findBySenderIdAndStatusAndActiveTrue",
        query = "SELECT cr FROM ContactRequest cr WHERE cr.sender.userId = :senderId " +
                "AND cr.status = :status " +
                "AND cr.active = true " +
                "AND cr.hiddenBySender = false " +
                "ORDER BY cr.createdAt DESC"
    ),
    
    // Trova per prodotto ID
    @NamedQuery(
        name = "ContactRequest.findByProductIdAndActiveTrue",
        query = "SELECT cr FROM ContactRequest cr WHERE cr.product.productId = :productId AND cr.active = true ORDER BY cr.createdAt DESC"
    ),
    
    // Conta richieste pending per receiver
    @NamedQuery(
        name = "ContactRequest.countByReceiverIdAndStatusAndActiveTrue",
        query = "SELECT COUNT(cr) FROM ContactRequest cr WHERE cr.receiver.userId = :receiverId AND cr.status = :status AND cr.active = true"
    ),
    
    // Trova richieste convertite in appointment
    @NamedQuery(
        name = "ContactRequest.findConvertedRequests",
        query = "SELECT cr FROM ContactRequest cr WHERE cr.convertedToAppointmentId IS NOT NULL AND cr.active = true"
    ),
    
    // Verifica se esiste già una richiesta simile
    @NamedQuery(
        name = "ContactRequest.existsBySenderIdAndProductIdAndStatusInAndActiveTrue",
        query = "SELECT COUNT(cr) > 0 FROM ContactRequest cr WHERE cr.sender.userId = :senderId AND cr.product.productId = :productId AND cr.status IN :statuses AND cr.active = true"
    ),
    
    // Query per statistiche
    @NamedQuery(
        name = "ContactRequest.getRequestStatsByReceiverId",
        query = "SELECT cr.status, COUNT(cr) FROM ContactRequest cr WHERE cr.receiver.userId = :receiverId AND cr.active = true GROUP BY cr.status"
    )
})

@Entity
@Table(name = "contact_requests")
public class ContactRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;
    
    // CHI MANDA (l'interessato)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_user_id", nullable = false)
    private User sender;
    
    // CHI RICEVE (proprietario annuncio)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_user_id", nullable = false)
    private User receiver;
    
    // PRODOTTO di riferimento
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    // CONTENUTO
    @Column(name = "subject", length = 254, nullable = false)
    private String subject;
    
    @Column(name = "message", length = 1000, nullable = false)
    private String message;
    
    @Column(name = "additional_notes", length = 500)
    private String additionalNotes;
    
    // TIPO DI CONTATTO PREFERITO
    @Column(name = "preferred_contact_method", length = 20)
    @Enumerated(EnumType.STRING)
    private ContactMethod preferredContactMethod; // EMAIL, PHONE, WHATSAPP, MEETING
    
    // STATO
    @Column(name = "status", length = 20)
    @Enumerated(EnumType.STRING)
    private RequestStatus status; //PENDING, ACCEPTED, REJECTED
    
    // TIMESTAMP
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // GESTIONE RIFIUTO
    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;
    
    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;
    
    // FLAG
    @Column(name = "email_notification_sent")
    private boolean emailNotificationSent;
    
    @Column(name = "active")
    private boolean active;
    
    // Se il receiver vuole trasformare questa richiesta in un appointment
    @Column(name = "converted_to_appointment_id")
    private Long convertedToAppointmentId;

    @Column(name = "sender_phone", length = 16)
    private String senderPhone;

    @Column(name = "sender_contact_email", length = 254)
    private String senderContactEmail;
    
    @Column(name = "hidden_by_sender")
    private boolean hiddenBySender = false;
    
    @Column(name = "hidden_by_receiver") 
    private boolean hiddenByReceiver = false;

    @Column(name = "appointment_datetime")
    private LocalDateTime appointmentDateTime;

    @Column(name = "location_address", length = 500)
    private String locationAddress;

    @Column(name = "location_notes", length = 500)
    private String locationNotes;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;
    
    public ContactRequest() {
    }


    public ContactRequest(Long requestId, User sender, User receiver, Product product, String subject, String message, String additionalNotes, ContactMethod preferredContactMethod, RequestStatus status, LocalDateTime createdAt, LocalDateTime rejectedAt, String rejectionReason, boolean emailNotificationSent, boolean active, Long convertedToAppointmentId, String senderPhone, String senderContactEmail, 
    boolean hiddenBySender, boolean hiddenByReceiver, LocalDateTime appointmentDateTime, String locationAddress, String locationNotes, Integer durationMinutes, BigDecimal latitude, BigDecimal longitude) {
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
    

    public Long getRequestId() {
        return this.requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public User getSender() {
        return this.sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public User getReceiver() {
        return this.receiver;
    }

    public void setReceiver(User receiver) {
        this.receiver = receiver;
    }

    public Product getProduct() {
        return this.product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getSubject() {
        return this.subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return this.message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAdditionalNotes() {
        return this.additionalNotes;
    }

    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }

    public ContactMethod getPreferredContactMethod() {
        return this.preferredContactMethod;
    }

    public void setPreferredContactMethod(ContactMethod preferredContactMethod) {
        this.preferredContactMethod = preferredContactMethod;
    }

    public RequestStatus getStatus() {
        return this.status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getRejectedAt() {
        return this.rejectedAt;
    }

    public void setRejectedAt(LocalDateTime rejectedAt) {
        this.rejectedAt = rejectedAt;
    }

    public String getRejectionReason() {
        return this.rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public boolean isEmailNotificationSent() {
        return this.emailNotificationSent;
    }

    public boolean getEmailNotificationSent() {
        return this.emailNotificationSent;
    }

    public void setEmailNotificationSent(boolean emailNotificationSent) {
        this.emailNotificationSent = emailNotificationSent;
    }

    public boolean getActive() {
        return this.active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Long getConvertedToAppointmentId() {
        return this.convertedToAppointmentId;
    }

    public void setConvertedToAppointmentId(Long convertedToAppointmentId) {
        this.convertedToAppointmentId = convertedToAppointmentId;
    }

    public String getSenderPhone() {
        return this.senderPhone;
    }

    public void setSenderPhone(String senderPhone) {
        this.senderPhone = senderPhone;
    }


    public String getSenderContactEmail() {
        return this.senderContactEmail;
    }

    public void setSenderContactEmail(String senderContactEmail) {
        this.senderContactEmail = senderContactEmail;
    }

    public boolean getHiddenBySender() {
        return this.hiddenBySender;
    }

    public void setHiddenBySender(boolean hiddenBySender) {
        this.hiddenBySender = hiddenBySender;
    }


    public boolean getHiddenByReceiver() {
        return this.hiddenByReceiver;
    }

    public void setHiddenByReceiver(boolean hiddenByReceiver) {
        this.hiddenByReceiver = hiddenByReceiver;
    }

    public LocalDateTime getAppointmentDateTime() {
        return this.appointmentDateTime;
    }

    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
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

    public Integer getDurationMinutes() {
        return this.durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
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
            " appointmentDateTime='" + getAppointmentDateTime() + "'" +
            ", locationAddress='" + getLocationAddress() + "'" +
            ", locationNotes='" + getLocationNotes() + "'" +
            ", durationMinutes='" + getDurationMinutes() + "'" +
            ", latitude='" + getLatitude() + "'" +
            ", longitude='" + getLongitude() + "'" +
            "}";
    }
   

}

