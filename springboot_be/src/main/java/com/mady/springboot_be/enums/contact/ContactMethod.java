package com.mady.springboot_be.enums.contact;

/**
 * Represents the preferred method of contact for a contact request.
 * 
 * Defines how users wish to communicate when inquiring about a product.
 * The behavior differs based on the selected method:
 * - EMAIL, PHONE, WHATSAPP: Direct contact only, no appointment created
 * - MEETING: In-person meeting request, creates an appointment automatically
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public enum ContactMethod {

    /**
     * Request contact via email.
     * The request is closed immediately after notification.
     * No appointment is created.
     */
    EMAIL,

    /**
     * Request contact via phone call.
     * The request is closed immediately after notification.
     * No appointment is created.
     */
    PHONE,

    /**
     * Request contact via WhatsApp/SMS.
     * The request is closed immediately after notification.
     * No appointment is created.
     */
    WHATSAPP,

    /**
     * Request an in-person meeting.
     * When accepted, an appointment is automatically created
     * with PENDING status, including meeting details (date, location, duration).
     * A dedicated chat is also created for the participants.
     */
    MEETING
}
