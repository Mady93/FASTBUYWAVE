package com.mady.springboot_be.dtos.cart_order_payment;

import java.io.Serializable;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for adding a product to the shopping cart.
 * 
 * This DTO is used as the request body for the POST /api/v1/cart/items
 * endpoint.
 * It contains the product ID and quantity to be added to the user's cart.
 * 
 * Validation constraints:
 * - productId: cannot be null
 * - quantity: cannot be null and must be at least 1
 * 
 * The cart service will validate:
 * - Product existence
 * - Sufficient stock availability
 * - User authentication
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class AddToCartRequestDTO implements Serializable {

    private static final long serialVersionUID = 2025042200024L;

    @NotNull(message = "Product ID cannot be null")
    private Long productId;

    @NotNull(message = "Quantity cannot be null")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    /**
     * Default constructor.
     */
    public AddToCartRequestDTO() {
    }

    /**
     * Constructs an AddToCartRequestDTO with product ID and quantity.
     * 
     * @param productId the ID of the product to add to cart
     * @param quantity  the quantity of the product to add (must be at least 1)
     */
    public AddToCartRequestDTO(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    /**
     * Returns the product ID.
     * 
     * @return the product ID
     */
    public Long getProductId() {
        return productId;
    }

    /**
     * Sets the product ID.
     * 
     * @param productId the product ID to set
     */
    public void setProductId(Long productId) {
        this.productId = productId;
    }

    /**
     * Returns the quantity of the product to add to cart.
     * 
     * @return the quantity (must be at least 1)
     */
    public Integer getQuantity() {
        return quantity;
    }

    /**
     * Sets the quantity of the product to add to cart.
     * 
     * @param quantity the quantity to set (must be at least 1)
     */
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
