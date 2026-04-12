package com.mady.springboot_be.support;

/**
 * Request DTO for user login authentication.
 * 
 * Contains the user's email and password credentials for traditional login.
 * Used as the request body for the POST /api/auth/login endpoint.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class LoginRequest {

    private String email;
    private String password;

    /**
     * Default constructor.
     */
    public LoginRequest() {
    }

    /**
     * Constructs a LoginRequest with email and password.
     * 
     * @param email    the user's email address
     * @param password the user's password (plain text, will be encoded during
     *                 validation)
     */
    public LoginRequest(String email, String password) {
        this.email = email;
        this.password = password;
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
     * Sets the user's password (plain text).
     * 
     * @param password the password to set
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Returns the user's password (plain text).
     * 
     * @return the password
     */
    public String getPassword() {
        return password;
    }

    /**
     * Returns the user's email address.
     * 
     * @return the email address
     */
    public String getEmail() {
        return email;
    }
}
