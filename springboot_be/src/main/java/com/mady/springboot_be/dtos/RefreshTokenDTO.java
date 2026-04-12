package com.mady.springboot_be.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for refresh token information.
 * 
 * Represents a refresh token stored in the database for JWT token renewal.
 * Refresh tokens have a configurable expiration (3 days) and can be explicitly
 * revoked.
 * 
 * Used for:
 * - Generating new access tokens when they expire
 * - User session management across devices
 * - Logout functionality (revoking all user tokens)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class RefreshTokenDTO implements Serializable {

    private static final long serialVersionUID = 202504220002L;

    private String tokenId;
    private Long userId;
    private String email;
    private String scopes;
    private String roles;
    private LocalDateTime expirationDate;
    private boolean revoked;

    /**
     * Default constructor.
     */
    public RefreshTokenDTO() {
    }

    /**
     * Constructs a RefreshTokenDTO with all fields.
     * 
     * @param tokenId        the unique token identifier (UUID)
     * @param userId         the ID of the user associated with the token
     * @param email          the user's email
     * @param scopes         the OAuth2 scopes
     * @param roles          the user's roles (e.g., "USER", "ADMIN")
     * @param expirationDate when the token expires
     * @param revoked        whether the token has been revoked
     */
    public RefreshTokenDTO(String tokenId, Long userId, String email, String scopes, String roles,
            LocalDateTime expirationDate, boolean revoked) {
        this.tokenId = tokenId;
        this.userId = userId;
        this.email = email;
        this.scopes = scopes;
        this.roles = roles;
        this.expirationDate = expirationDate;
        this.revoked = revoked;
    }

    /**
     * Returns the token ID (UUID).
     * 
     * @return the token ID
     */
    public String getTokenId() {
        return tokenId;
    }

    /**
     * Sets the token ID (UUID).
     * 
     * @param tokenId the token ID to set
     */
    public void setTokenId(String tokenId) {
        this.tokenId = tokenId;
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
     * Returns the user's email.
     * 
     * @return the email
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the user's email.
     * 
     * @param email the email to set
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Returns the OAuth2 scopes.
     * 
     * @return the scopes
     */
    public String getScopes() {
        return scopes;
    }

    /**
     * Sets the OAuth2 scopes.
     * 
     * @param scopes the scopes to set
     */
    public void setScopes(String scopes) {
        this.scopes = scopes;
    }

    /**
     * Returns the user's roles.
     * 
     * @return the roles (e.g., "USER", "ADMIN")
     */
    public String getRoles() {
        return roles;
    }

    /**
     * Sets the user's roles.
     * 
     * @param roles the roles to set (e.g., "USER", "ADMIN")
     */
    public void setRoles(String roles) {
        this.roles = roles;
    }

    /**
     * Returns the expiration date.
     * 
     * @return the expiration date
     */
    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }

    /**
     * Sets the expiration date.
     * 
     * @param expirationDate the date to set
     */
    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }

    /**
     * Returns whether the token has been revoked.
     * 
     * @return true if revoked, false otherwise
     */
    public boolean isRevoked() {
        return revoked;
    }

    /**
     * Sets the revoked status.
     * 
     * @param revoked true to revoke, false otherwise
     */
    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }

    /**
     * Returns a string representation of the RefreshTokenDTO.
     * 
     * @return string with all token fields
     */
    @Override
    public String toString() {
        return "RefreshTokenDTO{" +
                "tokenId='" + tokenId + '\'' +
                ", userId=" + userId +
                ", email='" + email + '\'' +
                ", scopes='" + scopes + '\'' +
                ", roles='" + roles + '\'' +
                ", expirationDate=" + expirationDate +
                ", revoked=" + revoked +
                '}';
    }
}