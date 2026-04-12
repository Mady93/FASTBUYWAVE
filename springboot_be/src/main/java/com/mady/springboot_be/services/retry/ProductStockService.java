package com.mady.springboot_be.services.retry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.mady.springboot_be.dtos.cart_order_payment.OrderDTO;
import com.mady.springboot_be.entities.Order;
import com.mady.springboot_be.entities.Product;
import com.mady.springboot_be.enums.OrderStatus;
import com.mady.springboot_be.exceptions.OptimisticLockRetryException;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.ProductRepository;
import com.mady.springboot_be.repositories.cart_order_payment.OrderRepository;
import com.mady.springboot_be.utils.mappers.cart_order_payment.OrderMapper;

/**
 * Service for handling concurrent product stock and order status updates with
 * automatic retry.
 * 
 * Uses Spring Retry with exponential backoff to handle database lock conflicts.
 * Optimistic locking (@Version) detects conflicts, retry mechanism retries
 * failed operations.
 * 
 * Key features:
 * - Automatic retry on optimistic lock failures (max 3 attempts)
 * - Exponential backoff (100ms initial, multiplier 2)
 * - Separate recovery methods for different exception types
 * - REQUIRES_NEW transaction propagation for isolated operations
 * - Comprehensive order status state machine validation
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class ProductStockService {
    private static final Logger logger = LoggerFactory.getLogger(ProductStockService.class);
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    /**
     * Constructs a new ProductStockService with required dependencies.
     * 
     * @param productRepository repository for Product entity operations
     * @param orderRepository   repository for Order entity operations
     * @param orderMapper       mapper for converting between Order entity and
     *                          OrderDTO
     */
    public ProductStockService(ProductRepository productRepository,
            OrderRepository orderRepository,
            OrderMapper orderMapper) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
    }

    // ── Stock update ──────────────────────────────────────────────────────────

    /**
     * Updates product stock in a new transaction. Retries on optimistic lock
     * failures.
     * 
     * @param productId          ID of product to update
     * @param quantityToSubtract quantity to deduct
     * @throws ResourceNotFoundException if product not found
     * @throws IllegalStateException     if insufficient stock
     */
    @Retryable(retryFor = ObjectOptimisticLockingFailureException.class, maxAttempts = 3, backoff = @Backoff(delay = 100, multiplier = 2))
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateStockInNewTransaction(Long productId, Integer quantityToSubtract) {
        logger.debug("Attempting stock update for product {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        if (product.getStockQuantity() < quantityToSubtract) {
            throw new IllegalStateException(
                    "Insufficient stock for product: " + productId +
                            ". Available: " + product.getStockQuantity() +
                            ", Requested: " + quantityToSubtract);
        }

        product.decreaseStock(quantityToSubtract);
        productRepository.saveAndFlush(product);
        logger.debug("Successfully updated stock for product {}", productId);
    }

    /**
     * Recovery method when stock update retries are exhausted.
     * 
     * @param e                  the exception that caused failure
     * @param productId          product being updated
     * @param quantityToSubtract quantity being deducted
     */
    @Recover
    public void recoverStock(ObjectOptimisticLockingFailureException e,
            Long productId, Integer quantityToSubtract) {
        logger.error("Failed to update stock for product {} after max attempts", productId);
        throw new OptimisticLockRetryException(
                "Unable to update stock for product " + productId + ". Please try again.", e);
    }

    // ── Order status update ───────────────────────────────────────────────────

    /**
     * Updates order status in a new transaction. Retries on all lock exception
     * types.
     * 
     * @param orderId   ID of order to update
     * @param newStatus new status to set
     * @return updated OrderDTO
     * @throws ResourceNotFoundException if order not found
     * @throws IllegalStateException     if order inactive or invalid status
     *                                   transition
     */
    @Retryable(retryFor = { ObjectOptimisticLockingFailureException.class,
            PessimisticLockingFailureException.class,
            CannotAcquireLockException.class }, maxAttempts = 3, backoff = @Backoff(delay = 100, multiplier = 2))
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public OrderDTO updateOrderStatusInNewTransaction(Long orderId, OrderStatus newStatus) {
        logger.debug("Attempting order status update for order {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!order.isActive()) {
            throw new IllegalStateException("Cannot update status of inactive order");
        }

        if (!isValidStatusTransition(order.getStatus(), newStatus)) {
            throw new IllegalStateException("Invalid status transition from " +
                    order.getStatus() + " to " + newStatus);
        }

        order.setStatus(newStatus);
        order = orderRepository.saveAndFlush(order);
        logger.debug("Updated order {} status to {}", orderId, newStatus);
        return this.orderMapper.toDTO(order);
    }

    /**
     * Recovery for pessimistic lock failures. Makes one final update attempt.
     * 
     * @param e         the pessimistic lock exception
     * @param orderId   ID of the order being updated
     * @param newStatus new status being set
     * @return updated OrderDTO after recovery attempt
     */
    @Recover
    public OrderDTO recoverOrderStatus(PessimisticLockingFailureException e,
            Long orderId, OrderStatus newStatus) {
        logger.error("RECOVER PESSIMISTIC LOCK - Order {}: {}", orderId, e.getMessage());

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
            order.setStatus(newStatus);
            Order savedOrder = orderRepository.saveAndFlush(order);
            logger.info("RECOVER SUCCESS - Order {} status updated to {}", orderId, newStatus);
            return orderMapper.toDTO(savedOrder);
        } catch (Exception ex) {
            logger.error("RECOVER FAILED - Order {}", orderId, ex);
            throw new OptimisticLockRetryException(
                    "Unable to update order status for order " + orderId + " after recovery", ex);
        }
    }

    /**
     * Recovery for optimistic lock failures. Makes one final update attempt.
     * 
     * @param e         the optimistic lock exception
     * @param orderId   ID of the order being updated
     * @param newStatus new status being set
     * @return updated OrderDTO after recovery attempt
     */
    @Recover
    public OrderDTO recoverOrderStatus(ObjectOptimisticLockingFailureException e,
            Long orderId, OrderStatus newStatus) {
        logger.error("RECOVER OPTIMISTIC LOCK - Order {}: {}", orderId, e.getMessage());

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
            order.setStatus(newStatus);
            Order savedOrder = orderRepository.saveAndFlush(order);
            logger.info("RECOVER SUCCESS - Order {} status updated to {}", orderId, newStatus);
            return orderMapper.toDTO(savedOrder);
        } catch (Exception ex) {
            logger.error("RECOVER FAILED - Order {}", orderId, ex);
            throw new OptimisticLockRetryException(
                    "Unable to update order status for order " + orderId + " after recovery", ex);
        }
    }

    /**
     * Recovery for cannot acquire lock failures. Makes one final update attempt.
     * 
     * @param e         the cannot acquire lock exception
     * @param orderId   ID of the order being updated
     * @param newStatus new status being set
     * @return updated OrderDTO after recovery attempt
     */
    @Recover
    public OrderDTO recoverOrderStatus(CannotAcquireLockException e,
            Long orderId, OrderStatus newStatus) {
        logger.error("RECOVER CANNOT ACQUIRE LOCK - Order {}: {}", orderId, e.getMessage());

        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
            order.setStatus(newStatus);
            Order savedOrder = orderRepository.saveAndFlush(order);
            logger.info("RECOVER SUCCESS - Order {} status updated to {}", orderId, newStatus);
            return orderMapper.toDTO(savedOrder);
        } catch (Exception ex) {
            logger.error("RECOVER FAILED - Order {}", orderId, ex);
            throw new OptimisticLockRetryException(
                    "Unable to update order status for order " + orderId + " after recovery", ex);
        }
    }

    /**
     * Validates order status transitions based on business rules.
     * 
     * Allowed transitions:
     * - PENDING → CONFIRMED, CANCELLED
     * - CONFIRMED → PROCESSING, CANCELLED
     * - PROCESSING → SHIPPED, CANCELLED
     * - SHIPPED → DELIVERED
     * - DELIVERED → REFUNDED
     * - CANCELLED, REFUNDED → no further transitions
     * 
     * @param from current status
     * @param to   desired status
     * @return true if transition is allowed, false otherwise
     */
    private boolean isValidStatusTransition(OrderStatus from, OrderStatus to) {
        if (from == null || to == null)
            return false;

        return switch (from) {
            case PENDING -> to == OrderStatus.CONFIRMED || to == OrderStatus.CANCELLED;
            case CONFIRMED -> to == OrderStatus.PROCESSING || to == OrderStatus.CANCELLED;
            case PROCESSING -> to == OrderStatus.SHIPPED || to == OrderStatus.CANCELLED;
            case SHIPPED -> to == OrderStatus.DELIVERED;
            case DELIVERED -> to == OrderStatus.REFUNDED;
            case CANCELLED, REFUNDED -> false;
        };
    }
}