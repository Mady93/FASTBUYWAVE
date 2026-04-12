package com.mady.springboot_be.services;

import org.springframework.http.ResponseEntity;

import com.mady.springboot_be.dettails.ApiResponseData;
import com.mady.springboot_be.dtos.sample_dtos.LikeRequestDTO;

/**
 * Service interface for managing user likes on advertisements.
 * 
 * Provides methods for:
 * - Toggling likes on advertisements (create/update)
 * - Retrieving all advertisements liked by a specific user
 * - Retrieving all users who liked a specific advertisement
 * 
 * Like operations are idempotent: multiple like requests do not create duplicates.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface UserAdvertisementLikeService {

    /**
     * Updates the like status for an advertisement by a user.
     * 
     * If a like record doesn't exist, creates a new one.
     * If it exists, updates the liked flag.
     * 
     * @param advertisementId the ID of the advertisement
     * @param likeRequest contains the liked flag (true/false)
     * @param userId the ID of the user
     * @return ResponseEntity with ApiResponseData containing:
     *         - status: HTTP status code as string
     *         - message: success/failure message
     *         - data: Integer (updated like count for the advertisement)
     */
public ResponseEntity<ApiResponseData> updateLikes(Long advertisementId, LikeRequestDTO likeRequest, Long userId);

 /**
     * Retrieves all advertisements liked by a specific user.
     * 
     * @param userId the ID of the user
     * @return ResponseEntity with ApiResponseData containing:
     *         - status: HTTP status code as string
     *         - message: "User likes fetched"
     *         - data: List&lt;LikeStatusDto&gt; (list of advertisement IDs with liked status)
     */
public ResponseEntity<ApiResponseData> getAllLikesByUser(Long userId);

/**
     * Retrieves all users who liked a specific advertisement.
     * 
     * @param advertisementId the ID of the advertisement
     * @return ResponseEntity with ApiResponseData containing:
     *         - status: HTTP status code as string
     *         - message: "Likes fetched"
     *         - data: List&lt;LikeUserDTO&gt; (list of user details with like timestamp)
     */
public ResponseEntity<ApiResponseData> getLikesByAdvertisement(Long advertisementId);
}
