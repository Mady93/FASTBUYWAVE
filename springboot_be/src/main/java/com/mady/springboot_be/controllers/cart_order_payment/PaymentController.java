package com.mady.springboot_be.controllers.cart_order_payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.dettails.PaymentResponseDTO;
import com.mady.springboot_be.dtos.cart_order_payment.InitiatePaymentRequestDTO;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.services_impl.cart_order_payment.PaymentServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * REST controller for payment operations.
 * 
 * Supports Stripe, PayPal and mock payment modes for testing.
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payments", description = "Endpoints for managing payments with Stripe, PayPal and mock support")
@Validated
public class PaymentController {

    private final PaymentServiceImpl paymentService;
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    public PaymentController(PaymentServiceImpl paymentService) {
        this.paymentService = paymentService;
    }

    @Operation(summary = "Initiate a payment", description = "Starts a payment process for an order. If useMockPayment=true, payment is completed immediately.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payment initiated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Order does not belong to user or access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Order not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Order is not in PENDING status"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/initiate")
    public ResponseEntity<PaymentResponseDTO> initiatePayment(
            @Valid @RequestBody InitiatePaymentRequestDTO request,
            Authentication authentication) {

        try {
            Long userId = getUserIdFromAuthentication(authentication);
            PaymentResponseDTO response = paymentService.initiatePayment(userId, request);

            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException e) {
            logger.error("Entity not found: {}", e.getMessage());
            PaymentResponseDTO response = new PaymentResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (SecurityException e) {
            logger.error("Security violation: {}", e.getMessage());
            PaymentResponseDTO response = new PaymentResponseDTO(false, "Access denied", null);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (IllegalStateException e) {
            logger.error("Business rule violation: {}", e.getMessage());
            PaymentResponseDTO response = new PaymentResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            logger.error("Error initiating payment", e);
            PaymentResponseDTO response = new PaymentResponseDTO(false, "Internal server error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Operation(summary = "Payment confirmation webhook", description = "Webhook endpoint called by payment gateways to confirm a payment. Can use mock payment for testing.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payment confirmed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Payment not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Payment already completed"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/webhook/confirm")
    public ResponseEntity<PaymentResponseDTO> confirmPayment(
            @RequestParam String paymentReference,
            @RequestParam String transactionId,
            @RequestParam(defaultValue = "false") boolean useMockPayment) {

        try {
            // Chiama direttamente il service, che gestisce già mock vs reale
            PaymentResponseDTO response = paymentService.confirmPayment(paymentReference, transactionId,
                    useMockPayment);
            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException e) {
            logger.error("Payment not found: {}", e.getMessage());
            PaymentResponseDTO response = new PaymentResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (IllegalStateException e) {
            logger.error("Invalid payment state: {}", e.getMessage());
            PaymentResponseDTO response = new PaymentResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            logger.error("Error confirming payment", e);
            PaymentResponseDTO response = new PaymentResponseDTO(false, "Internal server error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Operation(summary = "Payment failure webhook", description = "Webhook endpoint called by payment gateways when a payment fails")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Failure handled successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Payment not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/webhook/failure")
    public ResponseEntity<PaymentResponseDTO> handlePaymentFailure(
            @RequestParam String paymentReference,
            @RequestParam String failureReason) {

        try {
            PaymentResponseDTO response = paymentService.handlePaymentFailure(paymentReference, failureReason);
            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException e) {
            logger.error("Payment not found: {}", e.getMessage());
            PaymentResponseDTO response = new PaymentResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            logger.error("Error handling payment failure", e);
            PaymentResponseDTO response = new PaymentResponseDTO(false, "Internal server error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null) {
            throw new SecurityException("User not authenticated");
        }

        try {
            return Long.valueOf((String) authentication.getPrincipal());
        } catch (ClassCastException | NumberFormatException e) {
            throw new SecurityException("Invalid authentication: " + e.getMessage(), e);
        }
    }
}