package com.mady.springboot_be.repositories.cart_order_payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.Payment;
import com.mady.springboot_be.enums.PaymentMethod;
import com.mady.springboot_be.enums.PaymentStatus;

/**
 * Repository interface for Payment entity operations.
 * 
 * Provides custom queries for finding payments by order, payment reference,
 * status, payment method, date range, and dashboard statistics.
 * 
 * The repository uses both JPQL queries (annotated with @Query) and
 * named queries defined in the Payment entity.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

        /**
         * Finds a payment by order ID.
         * 
         * @param orderId the ID of the order
         * @return Optional containing the payment if found
         */
        @Query("SELECT p FROM Payment p WHERE p.order.orderId = :orderId")
        Optional<Payment> findByOrderId(@Param("orderId") Long orderId);

        /**
         * Finds a payment by its unique payment reference.
         * 
         * @param paymentReference the payment reference string (generated UUID)
         * @return Optional containing the payment if found
         */
        @Query("SELECT p FROM Payment p WHERE p.paymentReference = :paymentReference")
        Optional<Payment> findByPaymentReference(@Param("paymentReference") String paymentReference);

        /**
         * Finds all payments with a specific status.
         * 
         * @param status the payment status (PENDING, COMPLETED, FAILED, REFUNDED)
         * @return list of payments with the given status
         */
        @Query("SELECT p FROM Payment p WHERE p.status = :status")
        List<Payment> findByStatus(@Param("status") PaymentStatus status);

        /**
         * Finds all payments with a specific payment method.
         * 
         * @param paymentMethod the payment method (VISA, MASTERCARD, PAYPAL)
         * @return list of payments with the given method
         */
        @Query("SELECT p FROM Payment p WHERE p.paymentMethod = :paymentMethod")
        List<Payment> findByPaymentMethod(@Param("paymentMethod") PaymentMethod paymentMethod);

        /**
         * Finds all payments within a date range.
         * 
         * @param startDate the start of the date range (inclusive)
         * @param endDate   the end of the date range (inclusive)
         * @return list of payments in the date range
         */
        @Query("SELECT p FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
        List<Payment> findByPaymentDateBetween(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        // ===== DASHBOARD QUERIES =====

        /**
         * Calculates total revenue from completed payments within a date range.
         * 
         * Uses COALESCE to return 0 instead of NULL when no payments found.
         * Only includes payments with status COMPLETED.
         * 
         * @param startDate the start of the date range (inclusive)
         * @param endDate   the end of the date range (inclusive)
         * @return total revenue as BigDecimal, or 0 if no payments found
         */
        @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p " +
                        "WHERE p.status = 'COMPLETED' " +
                        "AND p.paymentDate BETWEEN :startDate AND :endDate")
        BigDecimal getTotalRevenueByDateRange(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        /**
         * Returns daily revenue statistics for dashboard charts.
         * 
         * Returns an array of objects containing:
         * - date: the payment date (as java.sql.Date)
         * - revenue: total revenue for that day
         * - orders: number of distinct orders paid that day
         * 
         * Only includes payments with status COMPLETED.
         * Results are grouped by date and ordered chronologically.
         * 
         * @param startDate the start of the date range (inclusive)
         * @param endDate   the end of the date range (inclusive)
         * @return list of Object[] where each element is [date, revenue, orders]
         */
        @Query("SELECT DATE(p.paymentDate) as date, " +
                        "SUM(p.amount) as revenue, " +
                        "COUNT(DISTINCT p.order.orderId) as orders " +
                        "FROM Payment p " +
                        "WHERE p.status = 'COMPLETED' " +
                        "AND p.paymentDate BETWEEN :startDate AND :endDate " +
                        "GROUP BY DATE(p.paymentDate) " +
                        "ORDER BY date ASC")
        List<Object[]> getDailyRevenueStats(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);
}
