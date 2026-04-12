package com.mady.springboot_be.config.retry;

import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;

/**
 * Configuration class that enables Spring Retry for the application.
 * 
 * This configuration activates Spring Retry capabilities, allowing methods
 * to be automatically retried when failures occur due to transient issues
 * such as database deadlocks, optimistic lock conflicts, or temporary service unavailability.
 * 
 * The @EnableRetry annotation enables the following features:
 * - @Retryable: annotate methods to be retried on specified exceptions
 * - @Recover: annotate fallback methods when retry attempts are exhausted
 * - Configurable backoff policies (fixed delay, exponential, random, etc.)
 * 
 * Usage example:
 * 
 * @Service
 * public class ProductStockService {
 *     
 *     @Retryable(
 *         retryFor = ObjectOptimisticLockingFailureException.class,
 *         maxAttempts = 3,
 *         backoff = @Backoff(delay = 100, multiplier = 2)
 *     )
 *     @Transactional(propagation = Propagation.REQUIRES_NEW)
 *     public void updateStock(Long productId, Integer quantity) {
 *         // Method that may fail due to optimistic lock conflicts
 *     }
 *     
 *     @Recover
 *     public void recoverStock(ObjectOptimisticLockingFailureException e,
 *                              Long productId, Integer quantity) {
 *         // Fallback logic when all retries fail
 *     }
 * }
 * 
 * In Fast Buy Wave, Spring Retry is specifically used for:
 * - Product stock updates with optimistic locking (@Version)
 * - Order status updates with pessimistic and optimistic lock conflicts
 * - Handling CannotAcquireLockException and PessimisticLockingFailureException
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Configuration
@EnableRetry
public class RetryConfig {

}
