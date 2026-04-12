package com.mady.springboot_be.repositories.contact;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.contact.AppointmentProposal;
import com.mady.springboot_be.enums.contact.ProposalStatus;

/**
 * Repository interface for AppointmentProposal entity operations.
 * 
 * Provides custom queries for finding proposals by appointment
 * and finding the most recent pending proposal for an appointment.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface AppointmentProposalRepository extends JpaRepository<AppointmentProposal, Long> {

    /**
     * Finds all proposals for a specific appointment, ordered by creation date
     * descending.
     * 
     * @param appointmentId the ID of the appointment
     * @return list of proposals (newest first)
     */
    List<AppointmentProposal> findByAppointmentAppointmentIdOrderByCreatedAtDesc(Long appointmentId);

    /**
     * Finds the most recent pending proposal for a specific appointment.
     * 
     * @param appointmentId the ID of the appointment
     * @param status        the proposal status (should be PENDING)
     * @return Optional containing the most recent pending proposal if found
     */
    Optional<AppointmentProposal> findFirstByAppointmentAppointmentIdAndStatusOrderByCreatedAtDesc(
            Long appointmentId, ProposalStatus status);

}