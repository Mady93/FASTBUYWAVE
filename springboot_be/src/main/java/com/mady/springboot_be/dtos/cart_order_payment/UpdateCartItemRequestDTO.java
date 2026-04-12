package com.mady.springboot_be.dtos.cart_order_payment;

import java.io.Serializable;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for updating the quantity of an item in the shopping cart.
 * 
 * This DTO is used as the request body for the PUT
 * /api/v1/cart/items/{cartItemId} endpoint.
 * It contains the new quantity for the cart item.
 * 
 * Validation constraints:
 * - quantity: cannot be null and must be at least 1
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class UpdateCartItemRequestDTO implements Serializable {

    private static final long serialVersionUID = 2025042200033L;
    @NotNull(message = "Quantity cannot be null")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    /**
     * Default constructor.
     */
    public UpdateCartItemRequestDTO() {
    }

    /**
     * Returns the new quantity for the cart item.
     * 
     * @return the quantity (must be at least 1)
     */
    public Integer getQuantity() {
        return quantity;
    }

    /**
     * Sets the new quantity for the cart item.
     * 
     * @param quantity the quantity to set (must be at least 1)
     */
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
