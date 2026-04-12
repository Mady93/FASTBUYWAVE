package com.mady.springboot_be.dettails;

import com.mady.springboot_be.dtos.cart_order_payment.OrderDTO;

/**
 * API response wrapper specifically for order operations.
 * 
 * This class provides a consistent response structure for all order-related
 * endpoints, encapsulating success status, a message, and the order data
 * payload.
 * 
 * Use cases:
 * - POST /api/v1/orders - returns created order after checkout
 * - GET /api/v1/orders/{orderId} - returns specific order details
 * - PUT /api/v1/orders/{orderId}/status - returns updated order after status
 * change
 * 
 * The OrderDTO data field contains complete order information including:
 * - Order ID and user association
 * - List of order items with product details
 * - Total amount calculation
 * - Order status (e.g., PENDING, CONFIRMED)
 * - Payment information
 * - Shipping address
 * - Timestamps (createdAt, updatedAt)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class OrderResponseDTO {
    private boolean success;
    private String message;
    private OrderDTO data;

    /**
     * Default constructor.
     */
    public OrderResponseDTO() {
    }

    /**
     * Constructs an OrderResponseDTO with success flag, message, and order data.
     * 
     * @param success true if operation succeeded, false otherwise
     * @param message response message describing the result
     * @param data    the order DTO payload (can be null if operation failed)
     */
    public OrderResponseDTO(boolean success, String message, OrderDTO data) {
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
     * Returns the order data payload.
     * 
     * @return OrderDTO containing complete order information, or null if operation
     *         failed
     */
    public OrderDTO getData() {
        return data;
    }

    /**
     * Sets the order data payload.
     * 
     * @param data the OrderDTO to set (can be null if operation failed)
     */
    public void setData(OrderDTO data) {
        this.data = data;
    }
}
