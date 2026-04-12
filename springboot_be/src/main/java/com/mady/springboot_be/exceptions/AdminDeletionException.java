package com.mady.springboot_be.exceptions;

/**
 * Exception thrown when an attempt is made to delete or deactivate an ADMIN
 * user.
 * 
 * This runtime exception prevents unauthorized or unsafe deletion of ADMIN
 * accounts, ensuring that at least one ADMIN user always remains active
 * in the system.
 * 
 * Used in UserService when:
 * - Attempting to delete an ADMIN user directly
 * - Attempting to deactivate the last active ADMIN user
 * - Bulk delete operations that would remove all ADMIN users
 * 
 * The exception is caught by global exception handlers to return
 * appropriate HTTP 403 Forbidden or 400 Bad Request responses.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class AdminDeletionException extends RuntimeException {

    /**
     * Constructs a new AdminDeletionException with the specified detail message.
     * 
     * @param message the detail message explaining why ADMIN deletion is not
     *                allowed
     */
    public AdminDeletionException(String message) {
        super(message);
    }
}
