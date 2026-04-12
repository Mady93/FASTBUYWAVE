package com.mady.springboot_be.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for user information.
 * 
 * Contains user account details including authentication info,
 * roles, scopes, and timestamps. Password is included but should be
 * handled securely (never logged or sent to frontend unnecessarily).
 * 
 * Used for:
 * - User registration and profile management
 * - Authentication responses
 * - Admin user management
 * - Creator information in advertisements
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class UserDTO implements Serializable {

    private static final long serialVersionUID = 202504220001L;

    private Long userId;
    private String userIdGoogle;
    private String googleAccessToken;
    private String email;
    private String password;
    private String roles;
    private String scopes;
    private LocalDateTime registrationDate;
    private LocalDateTime lastLogin;
    private boolean active;

    /**
     * Default constructor.
     */
    public UserDTO() {
    }

    /**
     * Constructs a UserDTO for OAuth2 users (no password).
     * 
     * @param userIdGoogle      the Google OAuth2 user ID
     * @param email             the user's email
     * @param roles             the user's roles (e.g., "USER", "ADMIN")
     * @param scopes            the user's OAuth2 scopes
     * @param registrationDate  registration timestamp
     * @param lastLogin         last login timestamp
     * @param active            whether the account is active
     * @param googleAccessToken the Google access token
     */
    public UserDTO(String userIdGoogle, String email, String roles,
            String scopes, LocalDateTime registrationDate, LocalDateTime lastLogin, boolean active,
            String googleAccessToken) {
        this.userIdGoogle = userIdGoogle;
        this.email = email;
        this.roles = roles;
        this.scopes = scopes;
        this.registrationDate = registrationDate;
        this.lastLogin = lastLogin;
        this.active = true;
        this.googleAccessToken = googleAccessToken;
    }

    /**
     * Constructs a UserDTO for traditional login users (with password).
     * 
     * @param userIdGoogle     the Google OAuth2 user ID (can be null)
     * @param email            the user's email
     * @param password         the user's password (BCrypt encoded)
     * @param roles            the user's roles
     * @param scopes           the user's scopes
     * @param registrationDate registration timestamp
     * @param lastLogin        last login timestamp
     */
    public UserDTO(String userIdGoogle, String email, String password, String roles, String scopes,
            LocalDateTime registrationDate, LocalDateTime lastLogin) {
        this.userIdGoogle = userIdGoogle;
        this.email = email;
        this.password = password;
        this.roles = roles;
        this.scopes = scopes;
        this.registrationDate = registrationDate;
        this.lastLogin = lastLogin;
        this.active = true;
    }

    /**
     * Returns the user ID.
     * 
     * @return the user ID
     */
    public Long getUserId() {
        return this.userId;
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
     * Returns the Google OAuth2 user ID.
     * 
     * @return the Google ID (null for traditional login users)
     */
    public String getUserIdGoogle() {
        return this.userIdGoogle;
    }

    /**
     * Sets the Google OAuth2 user ID.
     * 
     * @param userIdGoogle the Google ID to set
     */
    public void setUserIdGoogle(String userIdGoogle) {
        this.userIdGoogle = userIdGoogle;
    }

    /**
     * Returns the Google access token.
     * 
     * @return the Google access token
     */
    public String getGoogleAccessToken() {
        return this.googleAccessToken;
    }

    /**
     * Sets the Google access token.
     * 
     * @param googleAccessToken the access token to set
     */
    public void setGoogleAccessToken(String googleAccessToken) {
        this.googleAccessToken = googleAccessToken;
    }

    /**
     * Returns whether the user account is active.
     * 
     * @return true if active, false otherwise
     */
    public boolean isActive() {
        return this.active;
    }

    /**
     * Returns the user's email.
     * 
     * @return the email address
     */
    public String getEmail() {
        return this.email;
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
     * Returns the user's password (BCrypt encoded).
     * 
     * @return the encoded password
     */
    public String getPassword() {
        return this.password;
    }

    /**
     * Sets the user's password (should be BCrypt encoded).
     * 
     * @param password the password to set
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Returns the user's roles.
     * 
     * @return the roles string (e.g., "USER", "ADMIN")
     */
    public String getRoles() {
        return this.roles;
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
     * Returns the user's scopes.
     * 
     * @return the scopes string (e.g., "read,write")
     */
    public String getScopes() {
        return this.scopes;
    }

    /**
     * Sets the user's scopes.
     * 
     * @param scopes the scopes to set (e.g., "read,write")
     */
    public void setScopes(String scopes) {
        this.scopes = scopes;
    }

    /**
     * Returns the registration timestamp.
     * 
     * @return the registration date
     */
    public LocalDateTime getRegistrationDate() {
        return this.registrationDate;
    }

    /**
     * Sets the registration timestamp.
     * 
     * @param registrationDate the timestamp to set
     */
    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    /**
     * Returns the last login timestamp.
     * 
     * @return the last login date
     */
    public LocalDateTime getLastLogin() {
        return this.lastLogin;
    }

    /**
     * Sets the last login timestamp.
     * 
     * @param lastLogin the timestamp to set
     */
    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    /**
     * Returns whether the user account is active.
     * 
     * @return true if active, false otherwise
     */
    public boolean getActive() {
        return this.active;
    }

    /**
     * Sets the active status of the user account.
     * 
     * @param active the active status to set
     */
    public void setActive(boolean active) {
        this.active = active;
    }

    /**
     * Returns a string representation of the UserDTO.
     * 
     * @return string with all user fields
     */
    @Override
    public String toString() {
        return "{" +
                " userId='" + getUserId() + "'" +
                ", userIdGoogle='" + getUserIdGoogle() + "'" +
                ", email='" + getEmail() + "'" +
                ", password='" + getPassword() + "'" +
                ", roles='" + getRoles() + "'" +
                ", scopes='" + getScopes() + "'" +
                ", registrationDate='" + getRegistrationDate() + "'" +
                ", lastLogin='" + getLastLogin() + "'" +
                ", active='" + getActive() + "'" +
                "}";
    }

}
