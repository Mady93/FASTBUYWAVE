package com.mady.springboot_be.services.cart_order_payment;

import com.mady.springboot_be.dtos.cart_order_payment.AddToCartRequestDTO;
import com.mady.springboot_be.dtos.cart_order_payment.CartDTO;
import com.mady.springboot_be.dtos.cart_order_payment.UpdateCartItemRequestDTO;

/**
 * Service interface for shopping cart operations.
 * 
 * Defines methods for retrieving, adding, updating, and removing items
 * from a user's active cart. All operations include stock validation and
 * user authorization checks.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface CartService {

    /**
     * Retrieves the active cart for a user.
     * 
     * Creates a new empty cart if no active cart exists for the user.
     * 
     * @param userId the ID of the user
     * @return the active cart DTO with enriched data (totals and product images)
     */
    public CartDTO getActiveCartByUserId(Long userId);

    /**
     * Adds a product to the user's cart.
     * 
     * If the product is already in the cart, the quantity is increased.
     * Validates product existence, active status, and stock availability.
     * 
     * @param userId  the ID of the user
     * @param request contains productId and quantity
     * @return the updated cart DTO
     */
    public CartDTO addToCart(Long userId, AddToCartRequestDTO request);

    /**
     * Updates the quantity of a specific cart item.
     * 
     * Validates stock availability and ensures the cart item belongs to the user.
     * 
     * @param userId     the ID of the user (for authorization)
     * @param cartItemId the ID of the cart item to update
     * @param request    contains the new quantity
     * @return the updated cart DTO
     */
    public CartDTO updateCartItem(Long userId, Long cartItemId, UpdateCartItemRequestDTO request);

    /**
     * Removes a specific item from the user's cart.
     * 
     * Ensures the cart item belongs to the user.
     * 
     * @param userId     the ID of the user (for authorization)
     * @param cartItemId the ID of the cart item to remove
     * @return the updated cart DTO
     */
    public CartDTO removeFromCart(Long userId, Long cartItemId);

    /**
     * Removes all items from the user's cart.
     * 
     * @param userId the ID of the user
     */
    public void clearCart(Long userId);
}
