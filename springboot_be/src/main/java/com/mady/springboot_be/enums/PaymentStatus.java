package com.mady.springboot_be.enums;

/**
 * Represents the status of a payment transaction.
 * 
 * The payment progresses through various states during its lifecycle:
 * - PENDING: Payment initiated, waiting for completion
 * - PROCESSING: Payment being processed by gateway
 * - COMPLETED: Payment successful, order confirmed
 * - FAILED: Payment failed, order not processed
 * - CANCELLED: Payment cancelled by user
 * - REFUNDED: Payment refunded after completion
 * 
 * Status flow:
 * 
 * <pre>
 * PENDING → PROCESSING → COMPLETED → REFUNDED
 *    ↓          ↓
 * CANCELLED  FAILED
 * </pre>
 * 
 * Only COMPLETED payments are considered successful and trigger order
 * confirmation.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public enum PaymentStatus {

    /**
     * Payment has been initiated but not yet completed.
     * Initial state when payment record is created.
     * User has not completed the payment on gateway page.
     */
    PENDING,

    /**
     * Payment is being processed by the gateway (Stripe/PayPal).
     * Intermediate state between PENDING and COMPLETED/FAILED.
     */
    PROCESSING,

    /**
     * Payment has been successfully completed.
     * Terminal success state - order is confirmed.
     * Can transition to REFUNDED if needed.
     */
    COMPLETED,

    /**
     * Payment has failed.
     * Terminal failure state - order is not processed.
     * No further transitions possible.
     */
    FAILED,

    /**
     * Payment was cancelled by the user before completion.
     * Terminal state - order is not processed.
     */
    CANCELLED,

    /**
     * Payment has been refunded to the customer.
     * Occurs after COMPLETED status when refund is requested.
     * Terminal state.
     */
    REFUNDED
}
