package com.mady.springboot_be.services.contact;

import java.util.List;

import com.mady.springboot_be.dtos.contact.AppointmentProposalDTO;

/**
 * Service interface for appointment change proposal operations.
 * 
 * Defines methods for creating, accepting, rejecting, and retrieving
 * proposals to modify existing appointments (date, time, location, duration).
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface AppointmentProposalService {

        /**
         * Creates a proposal to change an existing appointment.
         * Any previous pending proposals are automatically rejected.
         * 
         * @param appointmentId ID of the appointment to modify
         * @param proposalDTO   contains proposed changes (datetime, location, duration)
         * @param userId        ID of the user proposing the change
         * @return the created AppointmentProposalDTO
         */
        AppointmentProposalDTO proposeChange(
                        Long appointmentId,
                        AppointmentProposalDTO proposalDTO,
                        Long userId);

        /**
         * Accepts a pending proposal and applies the proposed changes to the
         * appointment.
         * 
         * @param proposalId ID of the proposal to accept
         * @param userId     ID of the user accepting (cannot be the proposer)
         * @return the updated AppointmentProposalDTO with status ACCEPTED
         */
        AppointmentProposalDTO acceptProposal(
                        Long proposalId,
                        Long userId);

        /**
         * Rejects a pending proposal and cancels the associated appointment.
         * 
         * @param proposalId ID of the proposal to reject
         * @param userId     ID of the user rejecting (cannot be the proposer)
         * @return the updated AppointmentProposalDTO with status REJECTED
         */
        AppointmentProposalDTO rejectProposal(
                        Long proposalId,
                        Long userId);

        /**
         * Retrieves all proposals for a specific appointment, ordered by creation date
         * descending.
         * 
         * @param appointmentId ID of the appointment
         * @return list of AppointmentProposalDTO (pending, accepted, rejected)
         */
        List<AppointmentProposalDTO> getProposalsByAppointment(Long appointmentId);
}
