package com.mady.springboot_be.enums;

/**
 * Represents the lifecycle status of an order in the system.
 * 
 * The order progresses through various states from creation to completion:
 * - PENDING: Initial state after order creation
 * - CONFIRMED: Payment confirmed, order accepted
 * - PROCESSING: Order being prepared/shipped
 * - SHIPPED: Order has been shipped to customer
 * - DELIVERED: Customer has received the order
 * - CANCELLED: Order was cancelled (can occur from PENDING or CONFIRMED)
 * - REFUNDED: Order was refunded after delivery
 * 
 * Status flow:
 * 
 * <pre>
 * PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → REFUNDED
 *    ↓          ↓
 * CANCELLED  CANCELLED
 * </pre>
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public enum OrderStatus {

    /**
     * Order has been created but not yet confirmed.
     * Initial state when order is first placed.
     * Can transition to CONFIRMED or CANCELLED.
     */
    PENDING,

    /**
     * Order has been confirmed (payment completed).
     * Can transition to PROCESSING or CANCELLED.
     */
    CONFIRMED,

    /**
     * Order is being processed for shipment.
     * Can transition to SHIPPED or CANCELLED.
     */
    PROCESSING,

    /**
     * Order has been shipped to the customer.
     * Can transition to DELIVERED.
     */
    SHIPPED,

    /**
     * Order has been delivered to the customer.
     * Can transition to REFUNDED.
     */
    DELIVERED,

    /**
     * Order has been cancelled.
     * Terminal state - no further transitions possible.
     */
    CANCELLED,

    /**
     * Order has been refunded to the customer.
     * Terminal state - occurs after DELIVERED.
     */
    REFUNDED
}
