package com.mady.springboot_be.dtos.cart_order_payment;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for shopping cart state.
 * 
 * Contains cart metadata, list of items, calculated totals (totalAmount,
 * totalItems),
 * and user association. The cart is automatically created when a user adds
 * their
 * first item and remains active until cleared or converted to an order.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class CartDTO implements Serializable {

    private static final long serialVersionUID = 2025042200025L;
    private Long cartId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active;
    private Long userId;
    private String userEmail;
    private List<CartItemDTO> cartItems;
    private BigDecimal totalAmount;
    private Integer totalItems;

    /**
     * Default constructor.
     */
    public CartDTO() {
    }

    /**
     * Returns the cart ID.
     * 
     * @return the cart ID
     */
    public Long getCartId() {
        return cartId;
    }

    /**
     * Sets the cart ID.
     * 
     * @param cartId the cart ID to set
     */
    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    /**
     * Returns the creation timestamp of the cart.
     * 
     * @return the creation timestamp
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the creation timestamp of the cart.
     * 
     * @param createdAt the creation timestamp to set
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Returns the last update timestamp of the cart.
     * 
     * @return the last update timestamp
     */

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Sets the last update timestamp of the cart.
     * 
     * @param updatedAt the last update timestamp to set
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Returns whether the cart is active.
     * 
     * @return true if active, false otherwise
     */
    public boolean isActive() {
        return active;
    }

    /**
     * Sets the active status of the cart.
     * 
     * @param active the active status to set
     */
    public void setActive(boolean active) {
        this.active = active;
    }

    /**
     * Returns the ID of the user who owns the cart.
     * 
     * @return the user ID
     */
    public Long getUserId() {
        return userId;
    }

    /**
     * Sets the ID of the user who owns the cart.
     * 
     * @param userId the user ID to set
     */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * Returns the email of the user who owns the cart.
     * 
     * @return the user email
     */
    public String getUserEmail() {
        return userEmail;
    }

    /**
     * Sets the email of the user who owns the cart.
     * 
     * @param userEmail the user email to set
     */
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    /**
     * Returns the list of items in the cart.
     * 
     * @return the list of cart items
     */
    public List<CartItemDTO> getCartItems() {
        return cartItems;
    }

    /**
     * Sets the list of items in the cart.
     * 
     * @param cartItems the list of cart items to set
     */
    public void setCartItems(List<CartItemDTO> cartItems) {
        this.cartItems = cartItems;
    }

    /**
     * Returns the total amount of all items in the cart.
     * 
     * @return the total amount
     */
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    /**
     * Sets the total amount of all items in the cart.
     * 
     * @param totalAmount the total amount to set
     */
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    /**
     * Returns the total number of items in the cart.
     * 
     * @return the total number of items
     */
    public Integer getTotalItems() {
        return totalItems;
    }

    /**
     * Sets the total number of items in the cart.
     * 
     * @param totalItems the total number of items to set
     */
    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }
}
