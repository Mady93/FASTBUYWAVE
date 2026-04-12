package com.mady.springboot_be.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.Image;

/**
 * Repository interface for Image entity operations.
 * 
 * Provides CRUD operations and custom queries for image management including:
 * - Counting active/deleted images
 * - Finding images by ID (active only)
 * - Bulk retrieval of active/deleted images
 * - Soft deactivation of images by ID
 * - Finding images by product ID (active or inactive)
 * - Dashboard query for retrieving product images as byte arrays
 * 
 * The repository uses named queries defined in the Image entity.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    /**
     * Counts deleted (inactive) images.
     * 
     * @return count of deleted images
     */
    Long countByDeleted();

    /**
     * Counts active (not deleted) images.
     * 
     * @return count of active images
     */
    Long countByNotDeleted();

    /**
     * Finds an active image by its ID.
     * 
     * @param id the image ID
     * @return Optional containing the image if found and active
     */
    Optional<Image> findByIdByNotDeleted(Long id);

    /**
     * Retrieves all active images as a list.
     * 
     * @return list of active images
     */
    List<Image> findByNotDeletedList();

    /**
     * Retrieves all deleted images as a list.
     * 
     * @return list of deleted images
     */
    List<Image> findByDeletedList();

    /**
     * Soft deactivates an image by its ID.
     * 
     * @param imageId the ID of the image to deactivate
     * @return Optional containing the deactivated image if found
     */
    Optional<Image> deactivateById(Long imageId);

    /**
     * Finds all active images for a specific product.
     * 
     * @param productId the ID of the product
     * @return list of active images for the product
     */
    List<Image> findByProductIdActiveTrue(Long productId);

    /**
     * Finds all inactive images for a specific product.
     * 
     * @param productId the ID of the product
     * @return list of inactive images for the product
     */
    List<Image> findByProductIdActiveFalse(Long productId);

    // ========== DASHBOARD QUERIES ==========

    /**
     * Finds all active images for a product as byte arrays.
     * Results are ordered by image ID ascending.
     * Used for retrieving product images for dashboard display.
     * 
     * @param productId the ID of the product
     * @return list of byte arrays containing image data
     */
    @Query("SELECT i.picByte FROM Image i " +
            "WHERE i.product.productId = :productId " +
            "AND i.active = true " +
            "ORDER BY i.imageId ASC")
    List<byte[]> findImagesByProductId(@Param("productId") Long productId);
}
