package com.mady.springboot_be.enums.contact;

/**
 * Represents the status of an appointment change proposal.
 * 
 * When a user proposes changes to an existing appointment (date, time,
 * location, duration),
 * the proposal goes through the following states:
 * - PENDING: Waiting for the other party to respond
 * - ACCEPTED: Proposal accepted, changes applied to the appointment
 * - REJECTED: Proposal rejected, appointment remains unchanged
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public enum ProposalStatus {

    /**
     * Proposal is waiting for response from the other party.
     * No changes have been applied to the appointment yet.
     */
    PENDING,

    /**
     * Proposal has been accepted by the other party.
     * The proposed changes have been applied to the appointment.
     */
    ACCEPTED,

    /**
     * Proposal has been rejected by the other party.
     * The appointment remains unchanged.
     * A rejected proposal also cancels the associated appointment.
     */
    REJECTED
}
