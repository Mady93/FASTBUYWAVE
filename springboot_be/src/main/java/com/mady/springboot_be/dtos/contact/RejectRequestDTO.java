package com.mady.springboot_be.dtos.contact;

import java.io.Serializable;

/**
 * Request DTO for rejecting a contact request.
 * 
 * This DTO is used as the request body for the PATCH
 * /api/contact/requests/{requestId}/reject endpoint.
 * It contains the rejection reason that the receiver provides when declining a
 * contact request.
 * 
 * The rejection reason is optional but recommended to provide clarity to the
 * sender.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class RejectRequestDTO implements Serializable {

    private static final long serialVersionUID = 2025042200050L;

    private String rejectionReason;

    /**
     * Default constructor.
     */
    public RejectRequestDTO() {
    }

    /**
     * Constructs a RejectRequestDTO with a rejection reason.
     * 
     * @param rejectionReason the reason for rejecting the contact request
     */
    public RejectRequestDTO(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    /**
     * Returns the rejection reason.
     * 
     * @return the rejection reason (can be null)
     */
    public String getRejectionReason() {
        return this.rejectionReason;
    }

    /**
     * Sets the rejection reason.
     * 
     * @param rejectionReason the reason to set
     */
    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    /**
     * Fluent setter for rejectionReason.
     * 
     * @param rejectionReason the rejection reason
     * @return this instance for method chaining
     */
    public RejectRequestDTO rejectionReason(String rejectionReason) {
        setRejectionReason(rejectionReason);
        return this;
    }

    /**
     * Returns a string representation of the RejectRequestDTO.
     * 
     * @return string with the rejection reason
     */
    @Override
    public String toString() {
        return "{" +
                " rejectionReason='" + getRejectionReason() + "'" +
                "}";
    }

}
