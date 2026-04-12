package com.mady.springboot_be.services.contact;

import java.util.List;

import com.mady.springboot_be.dtos.contact.ContactRequestDTO;

/**
 * Service interface for contact request management.
 * 
 * Defines methods for creating, accepting, rejecting, and retrieving
 * contact requests between users regarding products.
 * 
 * Contact requests support:
 * - EMAIL: contact via email
 * - PHONE: contact via phone call
 * - WHATSAPP: contact via WhatsApp/SMS
 * - MEETING: request an in-person meeting (converted to appointment)
 * 
 * Features:
 * - Automatic email notifications on creation/acceptance/rejection
 * - Duplicate request prevention per product
 * - Soft delete with individual hiding by users
 * - Meeting requests automatically create appointments upon acceptance
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface ContactRequestService {

    /**
     * Creates a new contact request.
     * 
     * Validates sender identity (must match current user), prevents self-requests,
     * checks for existing pending requests for the same product.
     * For MEETING requests, stores meeting details (date, location, duration).
     * 
     * @param dto           the contact request data
     * @param currentUserId ID of the authenticated user (must be the sender)
     * @return the created ContactRequestDTO
     */
    public ContactRequestDTO createContactRequest(ContactRequestDTO dto, Long currentUserId);

    /**
     * Accepts a pending contact request.
     * 
     * Only the receiver can accept. For MEETING requests, automatically creates
     * an appointment with PENDING status and sends confirmation emails.
     * 
     * @param requestId     ID of the request to accept
     * @param currentUserId ID of the authenticated user (must be the receiver)
     * @return the updated ContactRequestDTO with status ACCEPTED
     */
    public ContactRequestDTO acceptRequest(Long requestId, Long currentUserId);

    /**
     * Rejects a pending contact request.
     * 
     * Only the receiver can reject. Stores rejection reason and sends
     * rejection email to the sender.
     * 
     * @param requestId       ID of the request to reject
     * @param rejectionReason reason for rejection
     * @param currentUserId   ID of the authenticated user (must be the receiver)
     * @return the updated ContactRequestDTO with status REJECTED
     */
    public ContactRequestDTO rejectRequest(Long requestId, String rejectionReason, Long currentUserId);

    /**
     * Retrieves a contact request by its ID.
     * 
     * @param requestId the request ID
     * @return the ContactRequestDTO
     */
    public ContactRequestDTO getRequestById(Long requestId);

    /**
     * Retrieves all contact requests where the user is the receiver.
     * 
     * @param receiverUserId the receiver's user ID
     * @return list of ContactRequestDTOs
     */
    public List<ContactRequestDTO> getRequestsByReceiver(Long receiverUserId);

    /**
     * Retrieves all contact requests where the user is the sender.
     * 
     * @param senderUserId the sender's user ID
     * @return list of ContactRequestDTOs
     */
    public List<ContactRequestDTO> getRequestsBySender(Long senderUserId);

    /**
     * Hides a contact request from the user's view.
     * 
     * The user can hide a request where they are either sender or receiver.
     * This is a soft delete that only affects the user's view, not the other
     * party's.
     * 
     * @param requestId     ID of the request to hide
     * @param currentUserId ID of the authenticated user (must be sender or
     *                      receiver)
     */
    public void hideRequest(Long requestId, Long currentUserId);
}
