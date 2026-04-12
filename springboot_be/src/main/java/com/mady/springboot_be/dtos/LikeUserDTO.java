package com.mady.springboot_be.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for user information when retrieving likes on an
 * advertisement.
 * 
 * Contains user details for users who have liked a specific advertisement,
 * including when the like was created.
 * 
 * Used in:
 * - GET /api/likes/advertisement/{advertisementId} - returns list of users who
 * liked the advertisement
 * - Response for like analytics and user engagement tracking
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class LikeUserDTO implements Serializable {

    private static final long serialVersionUID = 2025042200051L;
    private Long userId;
    private String email;
    private LocalDateTime likedAt;

    /**
     * Default constructor.
     */
    public LikeUserDTO() {
    }

    /**
     * Constructs a LikeUserDTO with user ID, email, and like timestamp.
     * 
     * @param userId  the ID of the user who liked the advertisement
     * @param email   the email of the user
     * @param likedAt the timestamp when the like was created
     */
    public LikeUserDTO(Long userId, String email, LocalDateTime likedAt) {
        this.userId = userId;
        this.email = email;
        this.likedAt = likedAt;
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
     * Returns the user's email address.
     * 
     * @return the email address
     */
    public String getEmail() {
        return this.email;
    }

    /**
     * Sets the user's email address.
     * 
     * @param email the email to set
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Returns the timestamp when the like was created.
     * 
     * @return the like creation timestamp
     */
    public LocalDateTime getLikedAt() {
        return this.likedAt;
    }

    /**
     * Sets the timestamp when the like was created.
     * 
     * @param likedAt the timestamp to set
     */
    public void setLikedAt(LocalDateTime likedAt) {
        this.likedAt = likedAt;
    }

    /**
     * Fluent setter for userId.
     * 
     * @param userId the user ID
     * @return this instance for method chaining
     */
    public LikeUserDTO userId(Long userId) {
        setUserId(userId);
        return this;
    }

    /**
     * Fluent setter for email.
     * 
     * @param email the email address
     * @return this instance for method chaining
     */
    public LikeUserDTO email(String email) {
        setEmail(email);
        return this;
    }

    /**
     * Fluent setter for likedAt.
     * 
     * @param likedAt the like timestamp
     * @return this instance for method chaining
     */
    public LikeUserDTO likedAt(LocalDateTime likedAt) {
        setLikedAt(likedAt);
        return this;
    }

    /**
     * Returns a string representation of the LikeUserDTO.
     * 
     * @return string with user ID, email, and like timestamp
     */
    @Override
    public String toString() {
        return "{" +
                " userId='" + getUserId() + "'" +
                ", email='" + getEmail() + "'" +
                ", likedAt='" + getLikedAt() + "'" +
                "}";
    }

}
