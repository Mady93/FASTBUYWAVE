package com.mady.springboot_be.support;

/**
 * Request DTO for refreshing JWT access tokens.
 * 
 * Contains the refresh token used to obtain a new access token
 * when the current access token has expired.
 * 
 * Used as the request body for the POST /api/auth/refresh endpoint.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class RefreshRequest {

    private String refreshToken;

    /**
     * Default constructor.
     */
    public RefreshRequest() {
    }

    /**
     * Constructs a RefreshRequest with a refresh token.
     * 
     * @param refreshToken the refresh token ID (UUID) obtained during login
     */
    public RefreshRequest(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    /**
     * Returns the refresh token.
     * 
     * @return the refresh token ID (UUID)
     */
    public String getRefreshToken() {
        return refreshToken;
    }

    /**
     * Sets the refresh token.
     * 
     * @param refreshToken the refresh token ID (UUID) to set
     */
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
