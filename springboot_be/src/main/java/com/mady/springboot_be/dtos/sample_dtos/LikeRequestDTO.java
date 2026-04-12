package com.mady.springboot_be.dtos.sample_dtos;

import java.io.Serializable;

/**
 * Request DTO for toggling likes on advertisements.
 * 
 * This DTO is used as the request body for the PUT
 * /api/likes/create/update/{userId}/{advertisementId} endpoint.
 * It contains a boolean flag indicating whether the user likes or unlikes the
 * advertisement.
 * 
 * When liked = true:
 * - Adds a like for the user on the advertisement
 * - Increments the advertisement's like count
 * 
 * When liked = false:
 * - Removes the user's like from the advertisement
 * - Decrements the advertisement's like count
 * 
 * The service validates user existence and advertisement existence before
 * applying the change.
 * Duplicate likes are handled idempotently (multiple like requests do not
 * create duplicate entries).
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class LikeRequestDTO implements Serializable {

    private static final long serialVersionUID = 2025042200018L;

    private boolean liked;

    /**
     * Default constructor.
     */
    public LikeRequestDTO() {
    }

    /**
     * Returns whether the user likes the advertisement.
     * 
     * @return true to add a like, false to remove a like
     */
    public boolean getLiked() {
        return liked;
    }

    /**
     * Sets whether the user likes the advertisement.
     * 
     * @param liked true to add a like, false to remove a like
     */
    public void setLiked(boolean liked) {
        this.liked = liked;
    }
}
