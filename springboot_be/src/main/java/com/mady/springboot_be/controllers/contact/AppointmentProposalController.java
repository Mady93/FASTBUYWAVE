package com.mady.springboot_be.controllers.contact;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.dtos.contact.AppointmentProposalDTO;
import com.mady.springboot_be.services.contact.AppointmentProposalService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for appointment change proposal operations.
 * 
 * Supports creating, accepting, and rejecting proposals to modify
 * existing appointments (date, time, location, duration).
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/appointment/proposals")
@Tag(name = "Appointment Proposals", description = "Endpoints for managing appointment change proposals")
public class AppointmentProposalController {
    private final AppointmentProposalService proposalService;

    public AppointmentProposalController(AppointmentProposalService proposalService) {
        this.proposalService = proposalService;
    }

    @Operation(summary = "Propose a change to an appointment", description = "Creates a proposal to modify an existing appointment (date, time, location, duration). "
            +
            "Any previous pending proposals are automatically rejected.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Proposal created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid proposal data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User not involved in this appointment"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Appointment or User not found")
    })
    @PostMapping("/create/{appointmentId}")
    public ResponseEntity<AppointmentProposalDTO> proposeChange(
            @PathVariable Long appointmentId,
            @RequestBody AppointmentProposalDTO dto,
            @RequestParam Long userId) {
        AppointmentProposalDTO created = proposalService.proposeChange(appointmentId, dto, userId);
        return ResponseEntity.ok(created);
    }

    @Operation(summary = "Accept a proposal", description = "Accepts a pending proposal and updates the appointment with the proposed changes")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Proposal accepted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Proposal already processed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Cannot accept your own proposal"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Proposal not found")
    })
    @PostMapping("/{proposalId}/accept")
    public ResponseEntity<AppointmentProposalDTO> acceptProposal(
            @PathVariable Long proposalId,
            @RequestParam Long userId) {
        AppointmentProposalDTO accepted = proposalService.acceptProposal(proposalId, userId);
        return ResponseEntity.ok(accepted);
    }

    @Operation(summary = "Reject a proposal", description = "Rejects a pending proposal and automatically cancels the associated appointment")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Proposal rejected successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Proposal already processed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Cannot reject your own proposal"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Proposal not found")
    })
    @PostMapping("/{proposalId}/reject")
    public ResponseEntity<AppointmentProposalDTO> rejectProposal(
            @PathVariable Long proposalId,
            @RequestParam Long userId) {
        AppointmentProposalDTO rejected = proposalService.rejectProposal(proposalId, userId);
        return ResponseEntity.ok(rejected);
    }

    @Operation(summary = "Get all proposals for an appointment", description = "Retrieves all proposals (pending, accepted, rejected) for a specific appointment, ordered by creation date")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Proposals retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Appointment not found")
    })
    @GetMapping("/{appointmentId}")
    public ResponseEntity<List<AppointmentProposalDTO>> getProposals(
            @PathVariable Long appointmentId) {
        List<AppointmentProposalDTO> proposals = proposalService.getProposalsByAppointment(appointmentId);
        return ResponseEntity.ok(proposals);
    }
}