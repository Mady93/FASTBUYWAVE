package com.mady.springboot_be.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dtos.AddressDTO;
import com.mady.springboot_be.dtos.ProfileDTO;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;

/**
 * Service interface for profile management operations.
 * 
 * Defines methods for CRUD operations on user profiles including:
 * - Counting active/deleted profiles
 * - Creating/updating profiles with address and profile picture
 * - Soft delete with recursive propagation
 * - Retrieving profile pictures as binary or Base64
 * - Pagination support for active/inactive profiles
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface ProfileService {

    ResponseEntity<Integer> countProfiles();

    /**
     * Counts active (not deleted) profiles.
     * 
     * @return ResponseEntity with count
     */
    ResponseEntity<Integer> countProfilesDeleted();

    /**
     * Counts deleted (inactive) profiles.
     * 
     * @return ResponseEntity with count
     */
    ResponseEntity<Object> postProfile(ProfileDTO profileDTO, AddressDTO addressDTO, Long userId,
            MultipartFile profilePicture);

    /**
     * Creates a new profile with address and optional profile picture.
     * 
     * @param profileDTO     the profile data
     * @param addressDTO     the address data
     * @param userId         the ID of the user to associate
     * @param profilePicture the profile picture file (optional)
     * @return ResponseEntity with created profile
     */
    ResponseEntity<Object> putProfile(Long userId, ProfileDTO profileDTO, AddressDTO addressDTO,
            MultipartFile profilePicture);

    /**
     * Updates an existing profile.
     * 
     * @param userId         the ID of the user whose profile to update
     * @param profileDTO     the updated profile data
     * @param addressDTO     the updated address data
     * @param profilePicture the new profile picture file (optional)
     * @return ResponseEntity with updated profile
     */
    ResponseEntity<ProfileDTO> getProfileById(Long profileId);

    /**
     * Retrieves a profile by its ID.
     * 
     * @param profileId the profile ID
     * @return ResponseEntity with ProfileDTO
     */
    ResponseEntity<Object> deleteProfile(Long profileId);

    /**
     * Soft deletes all profiles.
     * 
     * @return ResponseEntity with success/failure message
     */
    ResponseEntity<ApiResponse> deleteAllProfiles();

    /**
     * Retrieves paginated list of active profiles.
     * 
     * @param pageable pagination parameters
     * @return page of ProfileDTOs
     * @throws ResourceNotFoundException if no profiles found
     */
    Page<ProfileDTO> getProfilessNotDeleted(Pageable pageable) throws ResourceNotFoundException;

    /**
     * Retrieves paginated list of deleted profiles.
     * 
     * @param pageable pagination parameters
     * @return page of ProfileDTOs
     * @throws ResourceNotFoundException if no profiles found
     */
    Page<ProfileDTO> getProfilesDeleted(Pageable pageable) throws ResourceNotFoundException;

    /**
     * Retrieves a profile by user ID.
     * 
     * @param userId the ID of the user
     * @return ResponseEntity with ProfileDTO
     */
    ResponseEntity<ProfileDTO> getByUserId(Long userId);

    /**
     * Retrieves profile picture as binary image bytes.
     * 
     * @param userId the ID of the user
     * @return ResponseEntity with image bytes and appropriate content type
     */
    ResponseEntity<byte[]> getProfilePictureByUserId(Long userId);

    /**
     * Retrieves profile picture as Base64-encoded data URL.
     * 
     * Format: data:image/jpeg;base64,...
     * 
     * @param userId the ID of the user
     * @return ResponseEntity with Base64 data URL string
     */
    ResponseEntity<String> getProfilePictureBase64ByUserId(Long userId);
}
