package com.mady.springboot_be.enums.contact;

/**
 * Represents the status of a contact request between users.
 * 
 * When a user sends a contact request to another user regarding a product,
 * the request goes through the following states:
 * - PENDING: Request sent, waiting for receiver's response
 * - ACCEPTED: Receiver accepted the request
 * - REJECTED: Receiver rejected the request (with optional reason)
 * 
 * For MEETING requests, ACCEPTED status triggers automatic appointment
 * creation.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public enum RequestStatus {

    /**
     * Request has been sent and is waiting for receiver's response.
     * The receiver can either accept or reject.
     * No further action has been taken yet.
     */
    PENDING,

    /**
     * Request has been accepted by the receiver.
     * For MEETING requests, this triggers automatic appointment creation.
     * For other contact methods, this simply confirms the contact exchange.
     */
    ACCEPTED,

    /**
     * Request has been rejected by the receiver.
     * A rejection reason may be provided.
     * The request is closed and no further action is possible.
     */
    REJECTED
}
