package com.mady.springboot_be.dettails;

import com.mady.springboot_be.dtos.cart_order_payment.PaymentDTO;

/**
 * API response wrapper specifically for payment operations.
 * 
 * This class provides a consistent response structure for all payment-related
 * endpoints, encapsulating success status, a message, payment data payload,
 * and an optional external payment URL for gateway redirection.
 * 
 * Use cases:
 * - POST /api/v1/payments/initiate - returns payment URL for gateway redirect
 * - POST /api/v1/payments/webhook/confirm - confirms payment completion
 * - POST /api/v1/payments/webhook/failure - handles payment failure
 * 
 * The paymentUrl field is particularly important for real payment gateways:
 * - Stripe Checkout: returns Stripe-hosted payment page URL
 * - PayPal Checkout: returns PayPal approval URL
 * - Mock payment: paymentUrl is null (immediate confirmation)
 * 
 * PaymentDTO data field contains:
 * - Payment ID and reference
 * - Payment method (VISA, MASTERCARD, PAYPAL)
 * - Payment status (e.g., PENDING, COMPLETED)
 * - Transaction ID from gateway (after completion)
 * - Amount and order association
 * - Timestamps
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class PaymentResponseDTO {
    private boolean success;
    private String message;
    private PaymentDTO data;
    private String paymentUrl; // Redirect URL for external payment gateways

    /**
     * Default constructor.
     */
    public PaymentResponseDTO() {
    }

    /**
     * Constructs a PaymentResponseDTO with success flag, message, and payment data.
     * 
     * @param success true if operation succeeded, false otherwise
     * @param message response message describing the result
     * @param data    the payment DTO payload
     */
    public PaymentResponseDTO(boolean success, String message, PaymentDTO data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    /**
     * Returns whether the operation was successful.
     * 
     * @return true if success, false otherwise
     */
    public boolean isSuccess() {
        return success;
    }

    /**
     * Sets the success flag.
     * 
     * @param success true for success, false for failure
     */
    public void setSuccess(boolean success) {
        this.success = success;
    }

    /**
     * Returns the response message.
     * 
     * @return message string
     */
    public String getMessage() {
        return message;
    }

    /**
     * Sets the response message.
     * 
     * @param message the message to set
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * Returns the payment data payload.
     * 
     * @return PaymentDTO containing payment information
     */
    public PaymentDTO getData() {
        return data;
    }

    /**
     * Sets the payment data payload.
     * 
     * @param data the PaymentDTO to set
     */
    public void setData(PaymentDTO data) {
        this.data = data;
    }

    /**
     * Returns the external payment gateway URL for redirect.
     * 
     * For real payments (Stripe/PayPal), this URL points to the hosted
     * payment page. For mock payments, this is null.
     * 
     * @return payment gateway URL, or null for mock payments
     */
    public String getPaymentUrl() {
        return paymentUrl;
    }

    /**
     * Sets the external payment gateway URL for redirect.
     * 
     * @param paymentUrl URL to redirect user for payment completion
     */
    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }
}
