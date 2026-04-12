package com.mady.springboot_be.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.Advertisement;

/**
 * Repository interface for Advertisement entity operations.
 * 
 * Provides custom queries for finding active advertisements by user
 * and finding advertisements by ID that are not soft-deleted.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface AdvertisementRepository extends JpaRepository<Advertisement, Long> {

    /**
     * Finds an active (not soft-deleted) advertisement by its ID.
     * 
     * @param advertisementId the ID of the advertisement
     * @return Optional containing the advertisement if found and active
     */
    Optional<Advertisement> findByIdByNotDeleted(Long advertisementId);

    /**
     * Finds all active advertisements created by a specific user.
     * 
     * @param userId the ID of the creator user
     * @return list of active advertisements by the user
     */
    List<Advertisement> findByCreatedByUserIdAndActiveTrue(Long userId);
}