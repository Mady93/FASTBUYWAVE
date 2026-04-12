package com.mady.springboot_be.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.Profile;

/**
 * Repository interface for Profile entity operations.
 * 
 * Provides CRUD operations and custom queries for profile management including:
 * - Counting active/deleted profiles
 * - Paginated retrieval of active/deleted profiles
 * - Finding profiles by ID (active only)
 * - Bulk retrieval of active/deleted profiles
 * - Finding a profile by associated user ID
 * 
 * The repository uses named queries defined in the Profile entity.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {

    /**
     * Counts active (not deleted) profiles.
     * 
     * @return count of active profiles
     */
    Long countByNotDeleted();

    /**
     * Retrieves paginated list of active profiles.
     * 
     * @param pageable pagination parameters
     * @return page of active profiles
     */
    Page<Profile> findByNotDeleted(Pageable pageable);

    /**
     * Counts deleted (inactive) profiles.
     * 
     * @return count of deleted profiles
     */
    Long countByDeleted();

    /**
     * Retrieves paginated list of deleted profiles.
     * 
     * @param pageable pagination parameters
     * @return page of deleted profiles
     */
    Page<Profile> findByDeleted(Pageable pageable);

    /**
     * Finds an active profile by its ID.
     * 
     * @param profileId the profile ID
     * @return Optional containing the profile if found and active
     */
    Optional<Profile> findByIdByNotDeleted(Long profileId);

    /**
     * Retrieves all active profiles as a list.
     * 
     * @return list of active profiles
     */
    List<Profile> findByNotDeletedList();

    /**
     * Retrieves all deleted profiles as a list.
     * 
     * @return list of deleted profiles
     */
    List<Profile> findByDeletedList();

    /**
     * Finds an active profile by associated user ID.
     * 
     * @param userId the ID of the user
     * @return Optional containing the profile if found and active
     */
    Optional<Profile> findByUserId(Long userId);

}
