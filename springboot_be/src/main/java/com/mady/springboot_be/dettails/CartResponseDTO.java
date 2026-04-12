package com.mady.springboot_be.dettails;

import com.mady.springboot_be.dtos.cart_order_payment.CartDTO;

/**
 * API response wrapper specifically for cart operations.
 * 
 * This class provides a consistent response structure for all cart-related
 * endpoints, encapsulating success status, a message, and the cart data
 * payload.
 * 
 * Use cases:
 * - GET /api/v1/cart - returns current user's cart
 * - POST /api/v1/cart/items - returns updated cart after adding item
 * - PUT /api/v1/cart/items/{id} - returns updated cart after quantity change
 * - DELETE /api/v1/cart/items/{id} - returns updated cart after removal
 * - DELETE /api/v1/cart - returns success/failure for cart clearance
 * 
 * The CartDTO data field contains the complete cart state including:
 * - Cart ID and user association
 * - List of cart items with product details and quantities
 * - Total price calculation
 * - Cart status (active, abandoned, converted)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class CartResponseDTO {
    private boolean success;
    private String message;
    private CartDTO data;

    /**
     * Default constructor.
     */
    public CartResponseDTO() {
    }

    /**
     * Constructs a CartResponseDTO with success flag, message, and cart data.
     * 
     * @param success true if operation succeeded, false otherwise
     * @param message response message describing the result
     * @param data    the cart DTO payload (can be null if operation failed or cart
     *                is cleared)
     */
    public CartResponseDTO(boolean success, String message, CartDTO data) {
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
     * Sets the success status of the operation.
     * 
     * @param success true if operation succeeded, false otherwise
     */
    public void setSuccess(boolean success) {
        this.success = success;
    }

    /**
     * Returns the response message.
     * 
     * @return response message describing the result
     */
    public String getMessage() {
        return message;
    }

    /**
     * Sets the response message.
     * 
     * @param message response message to set
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * Returns the cart data payload of the response.
     * 
     * @return CartDTO containing cart details, or null if operation failed or cart
     *         is cleared
     */
    public CartDTO getData() {
        return data;
    }

    /**
     * Sets the cart data payload of the response.
     * 
     * @param data the CartDTO to set (can be null if operation failed or cart is
     *             cleared)
     */
    public void setData(CartDTO data) {
        this.data = data;
    }
}
