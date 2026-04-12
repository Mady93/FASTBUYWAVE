package com.mady.springboot_be.dtos;

import java.io.Serializable;

/**
 * Data Transfer Object for like status of an advertisement.
 * 
 * Contains the advertisement ID and a boolean flag indicating whether
 * the current user has liked the advertisement.
 * 
 * Used in:
 * - GET /api/likes/likes/user - returns list of liked advertisements with
 * status
 * - Response for checking like status on multiple advertisements
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class LikeStatusDto implements Serializable {

    private static final long serialVersionUID = 2025042200019L;

    private Long advertisementId;
    private boolean liked;

    /**
     * Default constructor.
     */
    public LikeStatusDto() {
    }

    /**
     * Constructs a LikeStatusDto with advertisement ID and like status.
     * 
     * @param advertisementId the ID of the advertisement
     * @param liked           true if liked, false otherwise
     */
    public LikeStatusDto(Long advertisementId, boolean liked) {
        this.advertisementId = advertisementId;
        this.liked = liked;
    }

    /**
     * Returns the advertisement ID.
     * 
     * @return the advertisement ID
     */
    public Long getAdvertisementId() {
        return this.advertisementId;
    }

    /**
     * Sets the advertisement ID.
     * 
     * @param advertisementId the advertisement ID to set
     */
    public void setAdvertisementId(Long advertisementId) {
        this.advertisementId = advertisementId;
    }

    /**
     * Returns whether the advertisement is liked.
     * 
     * @return true if liked, false otherwise
     */
    public boolean isLiked() {
        return this.liked;
    }

    /**
     * Returns whether the advertisement is liked (getter for frameworks).
     * 
     * @return true if liked, false otherwise
     */
    public boolean getLiked() {
        return this.liked;
    }

    /**
     * Sets the like status of the advertisement.
     * 
     * @param liked true if liked, false otherwise
     */
    public void setLiked(boolean liked) {
        this.liked = liked;
    }

    /**
     * Fluent setter for advertisementId.
     * 
     * @param advertisementId the advertisement ID
     * @return this instance for method chaining
     */
    public LikeStatusDto advertisementId(Long advertisementId) {
        setAdvertisementId(advertisementId);
        return this;
    }

    /**
     * Fluent setter for liked status.
     * 
     * @param liked true if liked, false otherwise
     * @return this instance for method chaining
     */
    public LikeStatusDto liked(boolean liked) {
        setLiked(liked);
        return this;
    }

    /**
     * Returns a string representation of the LikeStatusDto.
     * 
     * @return string with advertisement ID and like status
     */
    @Override
    public String toString() {
        return "{" +
                " advertisementId='" + getAdvertisementId() + "'" +
                ", liked='" + isLiked() + "'" +
                "}";
    }

}
