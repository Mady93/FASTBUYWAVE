package com.mady.springboot_be.exceptions;

/**
 * Exception thrown when a requested resource is not found in the database.
 * 
 * This runtime exception indicates that an operation attempted to access
 * a resource (User, Product, Advertisement, Category, etc.) that does not
 * exist or has been soft-deleted.
 * 
 * Used throughout the application for:
 * - JPA repository find operations when entity not found
 * - Service layer validation of entity existence
 * - API endpoints returning 404 Not Found responses
 * 
 * Being a RuntimeException, it does not require explicit declaration
 * in method signatures, but is caught by global exception handlers
 * to return appropriate HTTP 404 responses.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ResourceNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * Constructs a new ResourceNotFoundException with no detail message.
     */
    public ResourceNotFoundException() {
        super();
    }

    /**
     * Constructs a new ResourceNotFoundException with the specified detail message.
     * 
     * @param message the detail message explaining which resource was not found
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructs a new ResourceNotFoundException with the specified detail message
     * and cause.
     * 
     * @param message the detail message explaining which resource was not found
     * @param cause   the underlying cause of the exception
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Constructs a new ResourceNotFoundException with the specified cause.
     * 
     * @param cause the underlying cause of the exception
     */
    public ResourceNotFoundException(Throwable cause) {
        super(cause);
    }

}