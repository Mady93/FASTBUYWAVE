package com.mady.springboot_be.services;

import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dtos.UserDTO;
import com.mady.springboot_be.exceptions.AdminDeletionException;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;

/**
 * Service interface for user management operations.
 * 
 * Defines methods for:
 * - User CRUD operations (create, read, update, delete)
 * - Traditional and OAuth2 user creation
 * - Soft delete with recursive propagation to user data (advertisements,
 * products, images)
 * - ADMIN user protection (cannot delete the last ADMIN)
 * - Reactivation of soft-deleted users
 * - Pagination support for active/deleted users
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface UserService {

    /**
     * Retrieves a user by email.
     * 
     * @param email the user's email
     * @return the UserDTO
     */
    UserDTO getUserByEmail(String email);

    /**
     * Counts active users.
     * 
     * @return count of active users
     * @throws ResourceNotFoundException if no users found
     */
    int countUsers() throws ResourceNotFoundException;

    /**
     * Retrieves paginated list of active users.
     * 
     * @param pageable pagination parameters
     * @return page of UserDTOs
     * @throws ResourceNotFoundException if no users found
     */
    Page<UserDTO> getUsers(Pageable pageable) throws ResourceNotFoundException;

    /**
     * Retrieves all active users as a list.
     * 
     * @return list of active UserDTOs
     */
    List<UserDTO> getAllActiveUsers();

    /**
     * Counts deleted (inactive) users.
     * 
     * @return count of deleted users
     * @throws ResourceNotFoundException if no deleted users found
     */
    int countDeletedUsers() throws ResourceNotFoundException;

    /**
     * Retrieves paginated list of deleted users.
     * 
     * @param pageable pagination parameters
     * @return page of UserDTOs
     * @throws ResourceNotFoundException if no deleted users found
     */
    Page<UserDTO> getDeletedUsers(Pageable pageable) throws ResourceNotFoundException;

    /**
     * Creates a new user (traditional registration with password).
     * 
     * @param userDTO the user data
     * @return the created UserDTO
     */
    UserDTO createUser(UserDTO userDTO);

    /**
     * Creates a new user from OAuth2 (Google) login (no password).
     * 
     * @param userDTO the user data
     * @return the created UserDTO
     */
    UserDTO createOAuthUser(UserDTO userDTO);

    /**
     * Retrieves a user by ID.
     * 
     * @param id the user ID
     * @return the UserDTO
     * @throws ResourceNotFoundException if user not found
     */
    UserDTO getUserById(Long id) throws ResourceNotFoundException;

    /**
     * Updates a user.
     * 
     * Prevents deactivation of the last ADMIN user.
     * 
     * @param id      the user ID
     * @param userDTO the updated user data
     * @return the updated UserDTO
     * @throws ResourceNotFoundException if user not found
     */
    UserDTO updateUser(Long id, UserDTO userDTO) throws ResourceNotFoundException;

    /**
     * Soft deletes a user (only non-ADMIN users).
     * 
     * @param userId the user ID
     * @return ResponseEntity with success/failure message
     * @throws ResourceNotFoundException if user not found
     * @throws AccessDeniedException     if trying to delete an ADMIN user
     */
    ResponseEntity<Object> deleteUser(Long userId)
            throws ResourceNotFoundException, IllegalArgumentException, AccessDeniedException;

    /**
     * Soft deletes all non-ADMIN users.
     * 
     * @return ResponseEntity with success/failure message
     * @throws AdminDeletionException if ADMIN users cannot be deleted
     */
    ResponseEntity<ApiResponse> deleteUsers() throws IllegalArgumentException, AdminDeletionException;

    /**
     * Reactivates all soft-deleted non-ADMIN users and their associated data.
     * 
     * @return ResponseEntity with success/failure message
     */
    ResponseEntity<ApiResponse> reactivateAllUsers();
}