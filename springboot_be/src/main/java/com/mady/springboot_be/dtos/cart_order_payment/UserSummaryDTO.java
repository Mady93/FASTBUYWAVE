package com.mady.springboot_be.dtos.cart_order_payment;

import java.io.Serializable;

/**
 * Data Transfer Object for user summary information.
 * 
 * Contains essential user information for display in orders and other contexts
 * where full user details are not needed. Used to avoid circular references
 * and reduce payload size.
 * 
 * Fields include:
 * - userId: unique identifier of the user
 * - email: user's email address
 * - roles: user's roles (e.g., "USER", "ADMIN")
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class UserSummaryDTO implements Serializable {

    private static final long serialVersionUID = 2025042200034L;

    private Long userId;

    private String email;

    private String roles;

    /**
     * Default constructor.
     */
    public UserSummaryDTO() {
    }

    /**
     * Returns the user ID.
     * 
     * @return the user ID
     */
    public Long getUserId() {
        return userId;
    }

    /**
     * Sets the user ID.
     * 
     * @param userId the user ID to set
     */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * Returns the user's email address.
     * 
     * @return the email address
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the user's email address.
     * 
     * @param email the email address to set
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Returns the user's roles.
     * 
     * @return the roles
     */
    public String getRoles() {
        return roles;
    }

    /**
     * Sets the user's roles.
     * 
     * @param roles the roles to set
     */
    public void setRoles(String roles) {
        this.roles = roles;
    }
}
