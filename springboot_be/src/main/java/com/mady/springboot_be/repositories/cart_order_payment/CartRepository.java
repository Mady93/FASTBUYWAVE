package com.mady.springboot_be.repositories.cart_order_payment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.Cart;

/**
 * Repository interface for Cart entity operations.
 * 
 * Provides custom queries for finding active carts by user,
 * deactivating user carts, and retrieving cart history.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    /**
     * Finds the active cart for a specific user.
     * 
     * @param userId the ID of the user
     * @return Optional containing the active cart if found, empty otherwise
     */
    @Query("SELECT c FROM Cart c WHERE c.user.userId = :userId AND c.active = true")
    Optional<Cart> findActiveCartByUserId(@Param("userId") Long userId);

    /**
     * Finds all carts for a user ordered by creation date (descending).
     * 
     * @param userId the ID of the user
     * @return list of carts, newest first
     */
    @Query("SELECT c FROM Cart c WHERE c.user.userId = :userId ORDER BY c.createdAt DESC")
    List<Cart> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    /**
     * Deactivates all active carts for a user.
     * 
     * Used when a cart is converted to an order to prevent further modifications.
     * 
     * @param userId the ID of the user
     */
    @Modifying
    @Query("UPDATE Cart c SET c.active = false WHERE c.user.userId = :userId AND c.active = true")
    void deactivateUserCarts(@Param("userId") Long userId);
}