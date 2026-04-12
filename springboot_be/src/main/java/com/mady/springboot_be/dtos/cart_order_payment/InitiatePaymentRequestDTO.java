package com.mady.springboot_be.dtos.cart_order_payment;

import java.io.Serializable;

import com.mady.springboot_be.enums.PaymentMethod;

import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for initiating a payment.
 * 
 * This DTO is used as the request body for the POST /api/v1/payments/initiate
 * endpoint.
 * It contains order ID, payment method, optional payment gateway tokens, and a
 * flag
 * for mock payment mode (useful for testing without real payment gateways).
 * 
 * Validation constraints: * - orderId: cannot be null
 * - paymentMethod: cannot be null
 * 
 * Payment methods supported:
 * - VISA, MASTERCARD (via Stripe)
 * - PAYPAL (via PayPal Checkout)
 * - Mock payment for testing (useMockPayment = true)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class InitiatePaymentRequestDTO implements Serializable {

    private static final long serialVersionUID = 2025042200028L;

    @NotNull(message = "Order ID cannot be null")
    private Long orderId;

    @NotNull(message = "Payment method cannot be null")
    private PaymentMethod paymentMethod;

    private String cardToken; // Secure token from Stripe payment gateway

    // PayPal
    private String paypalEmail;

    // Mock
    private boolean useMockPayment;

    /**
     * Default constructor.
     */
    public InitiatePaymentRequestDTO() {
    }

    /**
     * Returns the order ID.
     * 
     * @return the order ID
     */
    public Long getOrderId() {
        return orderId;
    }

    /**
     * Sets the order ID.
     * 
     * @param orderId the order ID to set
     */
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    /**
     * Returns the payment method.
     * 
     * @return the payment method (VISA, MASTERCARD, PAYPAL)
     */
    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    /**
     * Sets the payment method.
     * 
     * @param paymentMethod the payment method to set
     */
    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    /**
     * Returns the card token from Stripe.
     * 
     * @return the card token (can be null)
     */
    public String getCardToken() {
        return cardToken;
    }

    /**
     * Sets the card token from Stripe.
     * 
     * @param cardToken the card token to set
     */
    public void setCardToken(String cardToken) {
        this.cardToken = cardToken;
    }

    /**
     * Returns the PayPal email.
     * 
     * @return the PayPal email (can be null)
     */
    public String getPaypalEmail() {
        return paypalEmail;
    }

    /**
     * Sets the PayPal email.
     * 
     * @param paypalEmail the PayPal email to set
     */
    public void setPaypalEmail(String paypalEmail) {
        this.paypalEmail = paypalEmail;
    }

    /**
     * Returns whether to use mock payment mode.
     * 
     * @return true for mock payment (no real gateway), false for real payment
     */
    public boolean isUseMockPayment() {
        return this.useMockPayment;
    }

    /**
     * Returns whether to use mock payment mode (getter for frameworks).
     * 
     * @return true for mock payment, false for real payment
     */
    public boolean getUseMockPayment() {
        return this.useMockPayment;
    }

    /**
     * Sets whether to use mock payment mode.
     * 
     * @param useMockPayment true to enable mock payment, false for real payment
     */
    public void setUseMockPayment(boolean useMockPayment) {
        this.useMockPayment = useMockPayment;
    }

}
