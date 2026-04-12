package com.mady.springboot_be.repositories.cart_order_payment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.CartItem;

/**
 * Repository interface for CartItem entity operations.
 * 
 * Provides custom queries for finding items by cart, by cart and product,
 * and bulk deletion by cart ID.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /**
     * Finds all cart items for a specific cart.
     * 
     * @param cartId the ID of the cart
     * @return list of cart items belonging to the cart
     */
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.cartId = :cartId")
    List<CartItem> findByCartId(@Param("cartId") Long cartId);

    /**
     * Finds a specific cart item by cart ID and product ID.
     * 
     * Used to check if a product is already in the cart before adding.
     * 
     * @param cartId    the ID of the cart
     * @param productId the ID of the product
     * @return Optional containing the cart item if found, empty otherwise
     */
    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.cartId = :cartId AND ci.product.productId = :productId")
    Optional<CartItem> findByCartIdAndProductId(@Param("cartId") Long cartId, @Param("productId") Long productId);

    /**
     * Deletes all cart items for a specific cart.
     * 
     * Used when clearing a cart or during cart cleanup operations.
     * 
     * @param cartId the ID of the cart
     */
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.cartId = :cartId")
    void deleteByCartId(@Param("cartId") Long cartId);
}
