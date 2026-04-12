package com.mady.springboot_be.services.cart_order_payment;

import com.mady.springboot_be.dettails.PaymentResponseDTO;
import com.mady.springboot_be.dtos.cart_order_payment.InitiatePaymentRequestDTO;

/**
 * Service interface for payment operations.
 * 
 * Defines methods for initiating payments, confirming payments via webhook,
 * and handling payment failures. Supports both real payment gateways
 * (Stripe, PayPal) and mock mode for testing.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface PaymentService {

    /**
     * Initiates a payment for an order.
     * 
     * Validates order ownership and status (must be PENDING).
     * For mock payments, completes immediately. For real payments,
     * creates a payment record and returns a gateway redirect URL.
     * 
     * @param userId  the ID of the user initiating the payment
     * @param request contains orderId, paymentMethod, and mock flag
     * @return PaymentResponseDTO with success status and payment URL if applicable
     */
    public PaymentResponseDTO initiatePayment(Long userId, InitiatePaymentRequestDTO request);

    /**
     * Confirms a payment via webhook callback from payment gateway.
     * 
     * Called by Stripe or PayPal after user completes payment on their site.
     * Validates payment status and updates order accordingly.
     * 
     * @param paymentReference the unique reference of the payment
     * @param transactionId    the transaction ID from the payment gateway
     * @param useMockPayment   true for mock mode, false for real gateway
     * @return PaymentResponseDTO with confirmation result
     */
    public PaymentResponseDTO confirmPayment(String paymentReference, String transactionId, boolean useMockPayment);

    /**
     * Handles payment failure notification from payment gateway.
     * 
     * Updates payment status to FAILED and records the failure reason.
     * 
     * @param paymentReference the unique reference of the payment
     * @param failureReason    the reason for failure from the gateway
     * @return PaymentResponseDTO with failure details
     */
    public PaymentResponseDTO handlePaymentFailure(String paymentReference, String failureReason);
}
