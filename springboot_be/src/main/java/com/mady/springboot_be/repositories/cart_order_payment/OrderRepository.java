package com.mady.springboot_be.repositories.cart_order_payment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.Order;
import com.mady.springboot_be.enums.OrderStatus;

/**
 * Repository interface for Order entity operations.
 * 
 * Provides custom queries for finding orders by user, status, date range,
 * order number, and dashboard statistics.
 * 
 * The repository uses both JPQL queries (annotated with @Query) and
 * named queries defined in the Order entity.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

        /**
         * Finds all active orders for a user, ordered by date descending.
         * 
         * @param userId the ID of the user
         * @return list of orders, newest first
         */
        @Query("SELECT o FROM Order o WHERE o.user.userId = :userId AND o.active = true ORDER BY o.orderDate DESC")
        List<Order> findByUserIdOrderByOrderDateDesc(@Param("userId") Long userId);

        /**
         * Finds all active orders with a specific status.
         * 
         * @param status the order status to filter by (PENDING, CONFIRMED, PROCESSING,
         *               SHIPPED, DELIVERED, CANCELLED, REFUNDED)
         * @return list of orders with the given status
         */
        @Query("SELECT o FROM Order o WHERE o.status = :status AND o.active = true")
        List<Order> findByStatus(@Param("status") OrderStatus status);

        /**
         * Finds all active orders within a date range.
         * 
         * @param startDate the start of the date range (inclusive)
         * @param endDate   the end of the date range (inclusive)
         * @return list of orders in the date range
         */
        @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate AND o.active = true")
        List<Order> findByOrderDateBetween(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        /**
         * Finds an active order by its unique order number.
         * 
         * Format: ORD-timestamp-randomNumber (e.g., "ORD-1702656000000-123")
         * 
         * @param orderNumber the order number
         * @return Optional containing the order if found
         */
        @Query("SELECT o FROM Order o WHERE o.orderNumber = :orderNumber AND o.active = true")
        Optional<Order> findByOrderNumber(@Param("orderNumber") String orderNumber);

        /**
         * Counts the number of active orders for a user.
         * 
         * @param userId the ID of the user
         * @return count of orders
         */
        @Query("SELECT COUNT(o) FROM Order o WHERE o.user.userId = :userId AND o.active = true")
        Long countByUserId(@Param("userId") Long userId);

        // ========== DASHBOARD QUERIES ==========

        /**
         * Counts orders by status within a date range for dashboard statistics.
         * 
         * @param status    the order status to count (e.g., CONFIRMED for completed
         *                  orders)
         * @param startDate the start of the date range (inclusive)
         * @param endDate   the end of the date range (inclusive)
         * @return count of orders matching the criteria
         */
        @Query("SELECT COUNT(o) FROM Order o " +
                        "WHERE o.status = :status " +
                        "AND o.orderDate BETWEEN :startDate AND :endDate " +
                        "AND o.active = true")
        Long countByStatusAndDateRange(
                        @Param("status") OrderStatus status,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);
}