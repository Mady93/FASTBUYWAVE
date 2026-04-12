package com.mady.springboot_be.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.User;

/**
 * Repository interface for User entity operations.
 * 
 * Provides custom queries for finding users by email, Google ID,
 * counting active/deleted users, and role-based retrieval.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by Google ID (not deleted).
     * 
     * @param googleId the Google OAuth2 user ID
     * @return Optional containing the user if found
     */
    Optional<User> findByUserIdGoogleNotDeleted(String googleId);

    /**
     * Checks if a user exists with the given email.
     * 
     * @param email the email to check
     * @return true if exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Finds a user by email.
     * 
     * @param email the email to search for
     * @return the User entity
     */
    User findUserByEmail(String email);

    /**
     * Counts users with a specific role.
     * 
     * @param roles the role string (e.g., "USER", "ADMIN")
     * @return count of users with the role
     */
    long countByRoles(String roles);

    /**
     * Counts active (not deleted) users.
     * 
     * @return count of active users
     */
    long countByNotDeleted();

    /**
     * Finds all active (not deleted) users.
     * 
     * @return list of active users
     */
    List<User> findByNotDeleted();

    /**
     * Finds all users with a specific role.
     * 
     * @param role the role to filter by
     * @return list of users with the role
     */
    List<User> getUsersByRoles(String role);

    /**
     * Finds an active user by ID.
     * 
     * @param userId the user ID
     * @return Optional containing the user if found and active
     */
    Optional<User> findUserByIdByNotDeleted(@Param("userId") Long userId);

    /**
     * Counts deleted (inactive) users.
     * 
     * @return count of deleted users
     */
    long countByDeleted();

    /**
     * Finds all deleted (inactive) users.
     * 
     * @return list of deleted users
     */
    List<User> findByDeleted();
}