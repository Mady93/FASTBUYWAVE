package com.mady.springboot_be.repositories.cart_order_payment;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.OrderItem;

/**
 * Repository interface for OrderItem entity operations.
 * 
 * Provides custom queries for finding order items by order ID and product ID.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Finds all order items for a specific order.
     * 
     * @param orderId the ID of the order
     * @return list of order items belonging to the order
     */
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.orderId = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);

    /**
     * Finds all order items for a specific product.
     * 
     * Used for product sales analytics and reporting.
     * 
     * @param productId the ID of the product
     * @return list of order items containing the product
     */
    @Query("SELECT oi FROM OrderItem oi WHERE oi.product.productId = :productId")
    List<OrderItem> findByProductId(@Param("productId") Long productId);
}