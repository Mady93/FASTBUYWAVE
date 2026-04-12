package com.mady.springboot_be.controllers.contact;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.dettails.ApiResponseData;
import com.mady.springboot_be.dtos.contact.ContactRequestDTO;
import com.mady.springboot_be.dtos.contact.RejectRequestDTO;
import com.mady.springboot_be.services_impl.contact.ContactRequestServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for contact request operations.
 * 
 * Supports creating, accepting, rejecting, and hiding contact requests
 * between users for product inquiries (email, phone, WhatsApp, meeting).
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/contact/requests")
@Tag(name = "Contact Requests", description = "Endpoints for managing contact requests between users")
public class ContactRequestController {

    private final ContactRequestServiceImpl contactRequestService;

    @Autowired
    public ContactRequestController(ContactRequestServiceImpl contactRequestService) {
        this.contactRequestService = contactRequestService;
    }

    @Operation(summary = "Create a new contact request", description = "Creates a pending contact request for a product. Can be for email, phone, WhatsApp or meeting.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Request created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or duplicate request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "User not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Cannot send request to yourself"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Sender, Receiver or Product not found")
    })
    @PostMapping
    public ResponseEntity<ApiResponseData<ContactRequestDTO>> createContactRequest(
            @RequestBody ContactRequestDTO contactRequestDTO,
            @AuthenticationPrincipal String currentUserId) {

        Long userId = Long.valueOf(currentUserId);
        ContactRequestDTO dto = contactRequestService.createContactRequest(contactRequestDTO, userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Richiesta di contatto creata", dto));
    }

    @Operation(summary = "Accept a contact request", description = "Accepts a pending request. For meeting requests, automatically creates an appointment.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Request accepted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "User not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only receiver can accept requests"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Request not found")
    })
    @PatchMapping("/{requestId}/accept")
    public ResponseEntity<ApiResponseData<ContactRequestDTO>> acceptMeetingRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal String currentUserId) {

        Long userId = Long.valueOf(currentUserId);
        ContactRequestDTO dto = contactRequestService.acceptRequest(
                requestId,
                userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Richiesta accettata", dto));
    }

    @Operation(summary = "Reject a contact request", description = "Rejects a pending request with an optional reason")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Request rejected successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "User not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Only receiver can reject requests"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Request not found")
    })
    @PatchMapping("/{requestId}/reject")
    public ResponseEntity<ApiResponseData<ContactRequestDTO>> rejectRequest(
            @PathVariable Long requestId,
            @RequestBody RejectRequestDTO request,
            @AuthenticationPrincipal String currentUserId) {

        Long userId = Long.valueOf(currentUserId);
        ContactRequestDTO dto = contactRequestService.rejectRequest(requestId, request.getRejectionReason(), userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Richiesta rifiutata", dto));
    }

    @Operation(summary = "Get contact request by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Request found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Request not found")
    })
    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponseData<ContactRequestDTO>> getRequestById(@PathVariable Long requestId) {
        ContactRequestDTO dto = contactRequestService.getRequestById(requestId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Richiesta trovata", dto));
    }

    @Operation(summary = "Get requests received by a user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Requests retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/receiver/{userId}")
    public ResponseEntity<ApiResponseData<List<ContactRequestDTO>>> getRequestsByReceiver(@PathVariable Long userId) {
        List<ContactRequestDTO> requests = contactRequestService.getRequestsByReceiver(userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Richieste ricevute trovate", requests));
    }

    @Operation(summary = "Get requests sent by a user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Requests retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/sender/{userId}")
    public ResponseEntity<ApiResponseData<List<ContactRequestDTO>>> getRequestsBySender(@PathVariable Long userId) {
        List<ContactRequestDTO> requests = contactRequestService.getRequestsBySender(userId);
        return ResponseEntity.ok(new ApiResponseData<>("success", "Richieste inviate trovate", requests));
    }

    @Operation(summary = "Hide a contact request", description = "Soft delete for one user. Request becomes inactive when both users hide it.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Request hidden successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "User not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "User not involved in this request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Request not found")
    })
    @PatchMapping("/{requestId}/hide")
    public ResponseEntity<ApiResponseData<Void>> hideRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal String currentUserId) {

        Long userId = Long.valueOf(currentUserId);
        contactRequestService.hideRequest(requestId, userId);

        return ResponseEntity.ok(new ApiResponseData<>(
                "Success",
                "Request hidden successfully",
                null));
    }
}
