package com.mady.springboot_be.services_impl.contact;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;

import com.mady.springboot_be.dtos.contact.ContactRequestDTO;
import com.mady.springboot_be.entities.Product;
import com.mady.springboot_be.entities.Profile;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.entities.contact.Appointment;
import com.mady.springboot_be.entities.contact.ContactRequest;
import com.mady.springboot_be.enums.contact.AppointmentStatus;
import com.mady.springboot_be.enums.contact.ContactMethod;
import com.mady.springboot_be.enums.contact.LocationType;
import com.mady.springboot_be.enums.contact.RequestStatus;
import com.mady.springboot_be.repositories.ProductRepository;
import com.mady.springboot_be.repositories.ProfileRepository;
import com.mady.springboot_be.repositories.UserRepository;
import com.mady.springboot_be.repositories.contact.AppointmentRepository;
import com.mady.springboot_be.repositories.contact.ContactRequestRepository;
import com.mady.springboot_be.services.EmailService;
import com.mady.springboot_be.services.contact.ContactRequestService;
import com.mady.springboot_be.utils.mappers.contact.ContactRequestMapper;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

/**
 * Implementation of ContactRequestService for managing contact requests.
 * 
 * Handles creation, acceptance, rejection, and retrieval of contact requests
 * between users regarding products.
 * 
 * Key features:
 * - Duplicate request prevention (only one pending request per product per
 * user)
 * - Automatic email notifications on creation/acceptance/rejection
 * - MEETING requests automatically create appointments upon acceptance
 * - Soft delete with individual hiding by both parties
 * - Asynchronous email sending using CompletableFuture
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
@Transactional
public class ContactRequestServiceImpl implements ContactRequestService {

    private final ContactRequestRepository contactRequestRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final ProfileRepository profileRepository;
    private final ContactRequestMapper contactRequestMapper;

    private final Logger logger = LoggerFactory.getLogger(ContactRequestServiceImpl.class);

    /**
     * Constructs a new ContactRequestServiceImpl with required dependencies.
     * 
     * @param contactRequestRepository repository for ContactRequest entity
     * @param appointmentRepository    repository for Appointment entity
     * @param userRepository           repository for User entity
     * @param productRepository        repository for Product entity
     * @param emailService             service for sending email notifications
     * @param profileRepository        repository for Profile entity
     * @param contactRequestMapper     mapper for ContactRequest entity to DTO
     *                                 conversion
     */
    @Autowired
    public ContactRequestServiceImpl(ContactRequestRepository contactRequestRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository, ProductRepository productRepository, EmailService emailService,
            ProfileRepository profileRepository, ContactRequestMapper contactRequestMapper) {
        this.contactRequestRepository = contactRequestRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.emailService = emailService;
        this.profileRepository = profileRepository;
        this.contactRequestMapper = contactRequestMapper;
    }

    @Override
    public ContactRequestDTO createContactRequest(ContactRequestDTO dto, Long currentUserId) {
        try {
            User sender = userRepository.findById(dto.getSender().getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("Sender not found"));
            User receiver = userRepository.findById(dto.getReceiver().getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("Receiver not found"));
            Product product = productRepository.findById(dto.getProduct().getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found"));

            // Authorization check
            if (!sender.getUserId().equals(currentUserId)) {
                throw new SecurityException("You can only create requests for yourself");
            }

            // Prevent self-request
            if (sender.getUserId().equals(receiver.getUserId())) {
                throw new IllegalArgumentException("Cannot send request to yourself");
            }

            // Check for duplicate pending requests
            boolean hasPendingRequest = contactRequestRepository
                    .existsBySenderIdAndProductIdAndStatusInAndActiveTrue(
                            sender.getUserId(),
                            product.getProductId(),
                            List.of(RequestStatus.PENDING));

            if (hasPendingRequest) {
                throw new IllegalStateException("You already have a pending request for this product");
            }

            // Create ContactRequest - always PENDING
            ContactRequest contactRequest = new ContactRequest();
            contactRequest.setSender(sender);
            contactRequest.setReceiver(receiver);
            contactRequest.setProduct(product);
            contactRequest.setSubject(dto.getSubject());
            contactRequest.setMessage(dto.getMessage());
            contactRequest.setAdditionalNotes(dto.getAdditionalNotes());
            contactRequest.setPreferredContactMethod(dto.getPreferredContactMethod());
            contactRequest.setSenderPhone(dto.getSenderPhone());
            contactRequest.setSenderContactEmail(dto.getSenderContactEmail());
            contactRequest.setStatus(RequestStatus.PENDING);
            contactRequest.setActive(true);
            contactRequest.setCreatedAt(LocalDateTime.now());
            contactRequest.setHiddenBySender(false);
            contactRequest.setHiddenByReceiver(false);
            contactRequest.setEmailNotificationSent(false);

            if (dto.getPreferredContactMethod() == ContactMethod.MEETING) {
                contactRequest.setAppointmentDateTime(dto.getAppointmentDateTime());
                contactRequest.setLocationAddress(dto.getLocationAddress());
                contactRequest.setLocationNotes(dto.getLocationNotes());
                contactRequest.setDurationMinutes(dto.getDurationMinutes());
                contactRequest.setLatitude(dto.getLatitude());
                contactRequest.setLongitude(dto.getLongitude());
            }

            ContactRequest savedRequest = contactRequestRepository.save(contactRequest);

            // Send email notification
            sendContactRequestEmail(savedRequest);

            logger.info("ContactRequest created with ID: {}, Type: {}",
                    savedRequest.getRequestId(), savedRequest.getPreferredContactMethod());

            return contactRequestMapper.toDTO(savedRequest);

        } catch (EntityNotFoundException | SecurityException | IllegalArgumentException | IllegalStateException e) {
            // Queste eccezioni possono essere gestite insieme
            logger.error("Business error: {}", e.getMessage());
            throw e;
        } catch (DataAccessException | MailException e) {
            // Errori tecnici (database, email)
            logger.error("Technical error: {}", e.getMessage(), e);
            throw new RuntimeException("Technical error, please try again", e);
        }
    }

    @Override
    @Transactional
    public ContactRequestDTO acceptRequest(Long requestId, Long currentUserId) {

        ContactRequest request = contactRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("ContactRequest not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Request already processed");
        }

        if (!request.getReceiver().getUserId().equals(currentUserId)) {
            throw new SecurityException("Only the receiver can accept requests");
        }

        if (request.getPreferredContactMethod() == ContactMethod.MEETING) {

            // Validation
            if (request.getAppointmentDateTime() == null) {
                throw new IllegalArgumentException("Dati meeting mancanti nella richiesta");
            }
            if (request.getAppointmentDateTime().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("La data dell'appuntamento è nel passato");
            }

            Appointment appointment = new Appointment();
            appointment.setRequester(request.getSender());
            appointment.setOrganizer(request.getReceiver());
            appointment.setProduct(request.getProduct());
            appointment.setTitle("Meeting: " + request.getProduct().getAdvertisement().getTitle());
            appointment.setDescription(request.getMessage());
            appointment.setAppointmentDatetime(request.getAppointmentDateTime());
            appointment.setDurationMinutes(
                    Optional.ofNullable(request.getDurationMinutes()).orElse(60));
            appointment.setLocationType(LocationType.IN_PERSON);
            appointment.setLocationAddress(request.getLocationAddress());
            appointment.setLocationNotes(request.getLocationNotes());
            appointment.setLatitude(request.getLatitude());
            appointment.setLongitude(request.getLongitude());
            appointment.setStatus(AppointmentStatus.PENDING);
            appointment.setActive(true);
            appointment.setCreatedAt(LocalDateTime.now());

            Appointment saved = appointmentRepository.save(appointment);
            request.setConvertedToAppointmentId(saved.getAppointmentId());
            sendAppointmentConfirmationEmail(saved);
        }

        request.setStatus(RequestStatus.ACCEPTED);
        request.setEmailNotificationSent(true);
        ContactRequest saved = contactRequestRepository.save(request);

        return contactRequestMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ContactRequestDTO rejectRequest(Long requestId, String rejectionReason, Long currentUserId) {
        ContactRequest request = contactRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("ContactRequest not found"));

        // Check status
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("Request already processed");
        }

        // Check authorization - Only the receiver can reject
        if (!request.getReceiver().getUserId().equals(currentUserId)) {
            throw new SecurityException("Only the receiver can reject requests");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setRejectedAt(LocalDateTime.now());
        request.setRejectionReason(rejectionReason);
        request.setEmailNotificationSent(true);

        ContactRequest savedRequest = contactRequestRepository.save(request);

        // Send rejection email
        this.sendRejectionEmail(savedRequest);

        logger.info("ContactRequest {} rejected", requestId);

        return contactRequestMapper.toDTO(savedRequest);
    }

    @Override
    public ContactRequestDTO getRequestById(Long requestId) {
        ContactRequest request = contactRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("ContactRequest not found"));
        return contactRequestMapper.toDTO(request);
    }

    @Override
    public List<ContactRequestDTO> getRequestsByReceiver(Long receiverUserId) {
        return contactRequestRepository.findByReceiverIdAndActiveTrue(receiverUserId).stream()
                .map(contactRequestMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ContactRequestDTO> getRequestsBySender(Long senderUserId) {
        return contactRequestRepository.findBySenderIdAndActiveTrue(senderUserId).stream()
                .map(contactRequestMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Sends email notifications for a newly created contact request.
     *
     * Extracts all required data before the async block to prevent lazy loading
     * issues. Sends two emails:
     * 1. Notification to the receiver with full request details
     * 2. Confirmation to the sender with summary of the sent request
     *
     * For MEETING requests, includes appointment date, time, duration,
     * location address and notes in both emails.
     *
     * @param contactRequest the saved contact request entity
     */
    private void sendContactRequestEmail(ContactRequest contactRequest) {
        String receiverEmail = contactRequest.getReceiver().getEmail();
        String senderEmail = contactRequest.getSenderContactEmail();
        String senderPhone = contactRequest.getSenderPhone();
        String subjectText = contactRequest.getSubject();
        String messageText = contactRequest.getMessage();
        String additionalNotes = contactRequest.getAdditionalNotes();
        ContactMethod contactMethod = contactRequest.getPreferredContactMethod();
        Long requestId = contactRequest.getRequestId();

        Long senderUserId = contactRequest.getSender().getUserId();
        Profile senderProfile = this.getProfileByUserId(senderUserId);
        String senderFullName = senderProfile.getFirstName() + " " + senderProfile.getLastName();

        Long receiverUserId = contactRequest.getReceiver().getUserId();
        Profile receiverProfile = this.getProfileByUserId(receiverUserId);
        String receiverFullName = receiverProfile.getFirstName() + " " + receiverProfile.getLastName();

        String productTitle = contactRequest.getProduct().getAdvertisement().getTitle();
        LocalDateTime createdAt = contactRequest.getCreatedAt();

        // Dati meeting — estratti prima dell'async
        LocalDateTime appointmentDateTime = contactRequest.getAppointmentDateTime();
        String locationAddress = contactRequest.getLocationAddress();
        String locationNotes = contactRequest.getLocationNotes();
        Integer durationMinutes = contactRequest.getDurationMinutes();

        CompletableFuture.runAsync(() -> {
            try {
                // 1. Email al receiver con tutti i dettagli
                String receiverSubject = String.format("New Contact Request: %s", subjectText);
                String receiverMessage = buildContactRequestEmailTemplate(
                        senderFullName,
                        senderEmail,
                        senderPhone,
                        productTitle,
                        subjectText,
                        messageText,
                        additionalNotes,
                        contactMethod,
                        createdAt,
                        appointmentDateTime,
                        locationAddress,
                        locationNotes,
                        durationMinutes);

                emailService.sendEmail("noreply@yourapp.com", receiverEmail, receiverSubject, receiverMessage);

                // 2. Email di conferma al sender
                if (senderEmail != null) {
                    sendConfirmationToSender(
                            receiverFullName,
                            productTitle,
                            contactMethod,
                            senderPhone,
                            senderEmail,
                            appointmentDateTime,
                            locationAddress,
                            locationNotes,
                            durationMinutes);
                }

                logger.info("Contact request emails sent for request ID: {}. Receiver: {}, Sender: {}",
                        requestId, receiverEmail, senderEmail);

            } catch (Exception e) {
                logger.error("Error sending email for contact request ID {}: {}",
                        requestId, e.getMessage(), e);
            }
        });
    }

    /**
     * Retrieves profile by user ID.
     * 
     * @param userId the user ID
     * @return the Profile entity
     */
    private Profile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found for userId: " + userId));
    }

    /**
     * Builds HTML template for contact request email sent to the receiver.
     *
     * Generates a styled HTML email with sender info, request details,
     * preferred contact method, and — when the method is MEETING —
     * a dedicated section showing appointment date/time, duration,
     * location address and optional location notes.
     *
     * @param fullName               sender's full name
     * @param contactEmail           sender's contact email
     * @param senderPhone            sender's phone number
     * @param productTitle           product title
     * @param subject                request subject
     * @param message                request message
     * @param additionalNotes        additional notes; omitted if null or empty
     * @param preferredContactMethod preferred contact method (EMAIL, PHONE,
     *                               WHATSAPP, MEETING)
     * @param createdAt              creation timestamp
     * @param appointmentDateTime    proposed meeting date/time; used only for
     *                               MEETING
     * @param locationAddress        meeting location address; used only for MEETING
     * @param locationNotes          optional meeting location notes; used only for
     *                               MEETING
     * @param durationMinutes        meeting duration in minutes; used only for
     *                               MEETING
     * @return HTML email content as a String
     */
    private String buildContactRequestEmailTemplate(
            String fullName,
            String contactEmail,
            String senderPhone,
            String productTitle,
            String subject,
            String message,
            String additionalNotes,
            ContactMethod preferredContactMethod,
            LocalDateTime createdAt,
            LocalDateTime appointmentDateTime,
            String locationAddress,
            String locationNotes,
            Integer durationMinutes) {

        String contactMethodLabel = switch (preferredContactMethod) {
            case EMAIL -> "📧 Email Response";
            case PHONE -> "📞 Phone Call";
            case WHATSAPP -> "💬 WhatsApp/SMS";
            case MEETING -> "🤝 In-person Meeting";
        };

        String meetingSection = "";
        if (preferredContactMethod == ContactMethod.MEETING && appointmentDateTime != null) {
            String duration = durationMinutes != null
                    ? (durationMinutes >= 60
                            ? (durationMinutes / 60) + "h "
                                    + (durationMinutes % 60 > 0 ? durationMinutes % 60 + "min" : "")
                            : durationMinutes + " min")
                    : "60 min";

            meetingSection = String.format("""
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0;">
                        <h3 style="margin-top: 0;">📅 Meeting Details</h3>
                        <p><strong>📆 Date & Time:</strong> %s</p>
                        <p><strong>⏱️ Duration:</strong> %s</p>
                        <p><strong>📍 Address:</strong> %s</p>
                        %s
                    </div>
                    """,
                    appointmentDateTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                    duration,
                    locationAddress != null ? locationAddress : "To be defined",
                    locationNotes != null && !locationNotes.isEmpty()
                            ? "<p><strong>📝 Location Notes:</strong> " + locationNotes + "</p>"
                            : "");
        }

        return String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2b6cb0;">New Contact Request</h2>

                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
                        <h3 style="margin-top: 0;">👤 From: %s</h3>
                        <p><strong>📧 Email:</strong> %s</p>
                        %s
                    </div>

                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
                        <h3 style="margin-top: 0;">📋 Request Details</h3>
                        <p><strong>Product:</strong> %s</p>
                        <p><strong>Subject:</strong> %s</p>
                        <p><strong>Message:</strong> %s</p>
                        %s
                    </div>

                    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 10px 0;">
                        <h3 style="margin-top: 0;">📞 Preferred Contact Method</h3>
                        <p><strong>%s</strong></p>
                        %s
                    </div>

                    %s

                    <p style="color: #666; font-size: 12px; text-align: center;">
                        📅 Request received: %s
                    </p>
                </div>
                """,
                fullName,
                contactEmail != null ? contactEmail : "Not provided",
                (senderPhone != null && !senderPhone.isEmpty())
                        ? "<p><strong>📱 Phone:</strong> " + senderPhone + "</p>"
                        : "",
                productTitle,
                subject,
                message.replace("\n", "<br>"),
                (additionalNotes != null && !additionalNotes.isEmpty())
                        ? "<p><strong>📝 Additional Notes:</strong> " + additionalNotes.replace("\n", "<br>") + "</p>"
                        : "",
                contactMethodLabel,
                preferredContactMethod == ContactMethod.MEETING
                        ? "<p><em>This request will be converted to an appointment upon acceptance.</em></p>"
                        : "<p><em>Please contact the user directly using the method above.</em></p>",
                meetingSection,
                createdAt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
    }

    /**
     * Sends confirmation email to the sender after their contact request is
     * submitted.
     *
     * For MEETING requests, includes the proposed appointment date/time, duration,
     * location address and optional location notes so the sender has a full summary
     * of what was sent.
     *
     * @param receiverName        full name of the receiver (seller/advertiser)
     * @param productTitle        title of the product being inquired about
     * @param contactMethod       preferred contact method chosen by the sender
     * @param senderPhone         sender's phone number; shown if not null
     * @param senderEmail         sender's email address to send the confirmation to
     * @param appointmentDateTime proposed meeting date/time; used only for MEETING
     * @param locationAddress     meeting location address; used only for MEETING
     * @param locationNotes       optional meeting location notes; used only for
     *                            MEETING
     * @param durationMinutes     meeting duration in minutes; used only for MEETING
     */
    private void sendConfirmationToSender(
            String receiverName,
            String productTitle,
            ContactMethod contactMethod,
            String senderPhone,
            String senderEmail,
            LocalDateTime appointmentDateTime,
            String locationAddress,
            String locationNotes,
            Integer durationMinutes) {

        try {
            String subject = "Your contact request has been sent";

            String meetingSection = "";
            if (contactMethod == ContactMethod.MEETING && appointmentDateTime != null) {
                String duration = durationMinutes != null
                        ? (durationMinutes >= 60
                                ? (durationMinutes / 60) + "h "
                                        + (durationMinutes % 60 > 0 ? durationMinutes % 60 + "min" : "")
                                : durationMinutes + " min")
                        : "60 min";

                meetingSection = String.format("""
                        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <h3 style="margin-top: 0;">📅 Your Proposed Meeting</h3>
                            <p><strong>📆 Date & Time:</strong> %s</p>
                            <p><strong>⏱️ Duration:</strong> %s</p>
                            <p><strong>📍 Address:</strong> %s</p>
                            %s
                        </div>
                        """,
                        appointmentDateTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                        duration,
                        locationAddress != null ? locationAddress : "To be defined",
                        locationNotes != null && !locationNotes.isEmpty()
                                ? "<p><strong>📝 Location Notes:</strong> " + locationNotes + "</p>"
                                : "");
            }

            String message = String.format("""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h3>✅ Your contact request has been sent</h3>
                        <p>We've notified <strong>%s</strong> about your interest in <strong>%s</strong>.</p>
                        <p>They will contact you via <strong>%s</strong> soon.</p>
                        %s
                        %s
                    </div>
                    """,
                    receiverName,
                    productTitle,
                    contactMethod.toString().toLowerCase(),
                    senderPhone != null ? "<p><strong>Your contact phone:</strong> " + senderPhone + "</p>" : "",
                    meetingSection);

            emailService.sendEmail("noreply@yourapp.com", senderEmail, subject, message);

        } catch (Exception e) {
            logger.error("Error sending confirmation to sender: {}", e.getMessage());
        }
    }

    /**
     * Sends appointment confirmation email to both requester and organizer.
     *
     * Executed asynchronously using CompletableFuture to avoid blocking
     * the main transaction thread. All data is extracted before the async
     * operation to prevent lazy loading issues after transaction completion.
     *
     * Emails include full meeting details:
     * - Title, date and time, duration
     * - Location address and optional notes
     * - Participant names (requester and organizer)
     *
     * @param appointment the appointment that was created from the contact request
     */
    private void sendAppointmentConfirmationEmail(Appointment appointment) {
        String title = appointment.getTitle();
        String requesterEmail = appointment.getRequester().getEmail();
        String organizerEmail = appointment.getOrganizer().getEmail();
        LocalDateTime dateTime = appointment.getAppointmentDatetime();
        String locationAddress = appointment.getLocationAddress();
        String locationNotes = appointment.getLocationNotes();
        Integer durationMinutes = appointment.getDurationMinutes();
        Long requesterId = appointment.getRequester().getUserId();
        Long organizerId = appointment.getOrganizer().getUserId();
        Profile requesterProfile = getProfileByUserId(requesterId);
        Profile organizerProfile = getProfileByUserId(organizerId);
        String requesterName = requesterProfile.getFirstName() + " " + requesterProfile.getLastName();
        String organizerName = organizerProfile.getFirstName() + " " + organizerProfile.getLastName();

        CompletableFuture.runAsync(() -> {
            try {
                String subject = "Appuntamento Confermato: " + title;

                String message = buildAppointmentConfirmationTemplate(
                        title,
                        dateTime,
                        locationAddress,
                        locationNotes,
                        durationMinutes,
                        requesterName,
                        organizerName);

                emailService.sendEmail("noreply@yourapp.com", requesterEmail, subject, message);
                emailService.sendEmail("noreply@yourapp.com", organizerEmail, subject, message);

            } catch (Exception e) {
                logger.error("Error sending appointment confirmation email: {}", e.getMessage());
            }
        });
    }

    /**
     * Sends rejection email to the sender.
     * 
     * @param request the rejected contact request
     */
    private void sendRejectionEmail(ContactRequest request) {
        String subject = request.getSubject();
        String senderEmail = request.getSenderContactEmail();
        String productTitle = request.getProduct().getAdvertisement().getTitle();
        String rejectionReason = request.getRejectionReason();

        CompletableFuture.runAsync(() -> {
            try {
                String emailSubject = "Contact request rejected: " + subject;

                String message = buildRejectionEmailTemplate(
                        productTitle,
                        rejectionReason);

                emailService.sendEmail("noreply@yourapp.com",
                        senderEmail, emailSubject, message);

            } catch (Exception e) {
                logger.error("Error sending rejection email: {}", e.getMessage());
            }
        });
    }

    /**
     * Builds HTML template for appointment confirmation email.
     *
     * Generates a styled HTML email containing all relevant meeting details,
     * including title, date, duration, location, optional location notes,
     * and the names of both participants (organizer and requester).
     *
     * Duration is formatted as:
     * - "X min" if less than 60 minutes
     * - "Xh Ymin" if 60 minutes or more (e.g., "1h 30min")
     *
     * @param title               appointment title
     * @param appointmentDatetime appointment date and time
     * @param locationAddress     meeting location address, shown as "To be defined"
     *                            if null
     * @param locationNotes       optional meeting location notes (e.g., floor,
     *                            entrance); omitted if null or empty
     * @param durationMinutes     meeting duration in minutes; defaults to "60 min"
     *                            if null
     * @param requesterName       full name of the user who requested the meeting
     * @param organizerName       full name of the user who organized/accepted the
     *                            meeting
     * @return HTML email content as a String
     */
    private String buildAppointmentConfirmationTemplate(
            String title,
            LocalDateTime appointmentDatetime,
            String locationAddress,
            String locationNotes,
            Integer durationMinutes,
            String requesterName,
            String organizerName) {

        String duration = durationMinutes != null
                ? (durationMinutes >= 60
                        ? (durationMinutes / 60) + "h "
                                + (durationMinutes % 60 > 0 ? durationMinutes % 60 + "min" : "")
                        : durationMinutes + " min")
                : "60 min";

        return String.format(
                "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">" +
                        "<h2 style=\"color: #2b6cb0;\">✅ Appointment Confirmed</h2>" +
                        "<div style=\"background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;\">" +
                        "<h3 style=\"margin-top: 0;\">📋 Meeting Details</h3>" +
                        "<p><strong>Title:</strong> %s</p>" +
                        "<p><strong>📅 Date:</strong> %s</p>" +
                        "<p><strong>⏱️ Duration:</strong> %s</p>" +
                        "</div>" +
                        "<div style=\"background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;\">" +
                        "<h3 style=\"margin-top: 0;\">📍 Location</h3>" +
                        "<p><strong>Address:</strong> %s</p>" +
                        "%s" +
                        "</div>" +
                        "<div style=\"background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 10px 0;\">" +
                        "<h3 style=\"margin-top: 0;\">👥 Participants</h3>" +
                        "<p><strong>Organizer:</strong> %s</p>" +
                        "<p><strong>Requester:</strong> %s</p>" +
                        "</div>" +
                        "<p style=\"color: #666; font-size: 12px; text-align: center;\">Both parties have been notified.</p>"
                        +
                        "</div>",
                title,
                appointmentDatetime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                duration,
                locationAddress != null ? locationAddress : "To be defined",
                locationNotes != null && !locationNotes.isEmpty()
                        ? "<p><strong>📝 Notes:</strong> " + locationNotes + "</p>"
                        : "",
                organizerName,
                requesterName);
    }

    /**
     * Builds HTML template for rejection email.
     * 
     * @param productTitle    product title
     * @param rejectionReason rejection reason
     * @return HTML email content
     */
    private String buildRejectionEmailTemplate(
            String productTitle,
            String rejectionReason) {

        return String.format(
                "<div style=\"font-family: Arial, sans-serif;\">" +
                        "<h2>❌ Request Rejected</h2>" +
                        "<p>Your request for <strong>%s</strong> has been rejected.</p>" +
                        "<p><strong>Reason:</strong> %s</p>" +
                        "</div>",
                productTitle,
                rejectionReason != null ? rejectionReason : "No reason specified");
    }

    @Override
    @Transactional
    public void hideRequest(Long requestId, Long currentUserId) {
        ContactRequest request = contactRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Request not found"));

        boolean isSender = request.getSender().getUserId().equals(currentUserId);
        boolean isReceiver = request.getReceiver().getUserId().equals(currentUserId);

        if (!isSender && !isReceiver) {
            throw new SecurityException("User not involved in this request");
        }

        boolean shouldUpdate = false;

        if (isSender && !request.getHiddenBySender()) {
            request.setHiddenBySender(true);
            shouldUpdate = true;
        } else if (isReceiver && !request.getHiddenByReceiver()) {
            request.setHiddenByReceiver(true);
            shouldUpdate = true;
        }

        if (!shouldUpdate) {
            logger.info("Request {} already hidden by user {}", requestId, currentUserId);
            return;
        }

        // If both have hidden, deactivate the request
        if (request.getHiddenBySender() && request.getHiddenByReceiver()) {
            request.setActive(false);
            logger.info("Request {} deactivated - both users hid it", requestId);
        }

        contactRequestRepository.save(request);
    }
}