package com.mady.springboot_be.exceptions;

/**
 * Exception thrown when optimistic lock retry attempts are exhausted.
 * 
 * This exception indicates that a database operation failed due to
 * optimistic lock conflicts (concurrent modifications) even after
 * multiple retry attempts.
 * 
 * Used in conjunction with Spring Retry (@Retryable) when:
 * - Product stock updates encounter ObjectOptimisticLockingFailureException
 * - Order status updates face concurrent modification conflicts
 * 
 * The retry mechanism attempts the operation up to 3 times with
 * exponential backoff (100ms initial, multiplier 2) before throwing
 * this exception.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class OptimisticLockRetryException extends RuntimeException {

    /**
     * Constructs a new OptimisticLockRetryException with the specified detail
     * message.
     * 
     * @param message the detail message explaining why the retry failed
     */
    public OptimisticLockRetryException(String message) {
        super(message);
    }

    /**
     * Constructs a new OptimisticLockRetryException with the specified detail
     * message and cause.
     * 
     * @param message the detail message explaining why the retry failed
     * @param cause   the underlying cause (usually
     *                ObjectOptimisticLockingFailureException)
     */
    public OptimisticLockRetryException(String message, Throwable cause) {
        super(message, cause);
    }
}