package com.mady.springboot_be.services;

import java.io.IOException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.mady.springboot_be.entities.Image;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;

/**
 * Service interface for image management operations.
 * 
 * Defines methods for:
 * - Counting active/deleted images
 * - Retrieving images with pagination
 * - Uploading images for products
 * - Updating existing images
 * - Soft deleting images (single or all)
 * - Retrieving images by product ID (active/inactive)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface ImageService {

    /**
     * Counts active (not deleted) images.
     * 
     * @return count of active images
     * @throws ResourceNotFoundException if no images found
     */
    Long countImagesNotDeleted() throws ResourceNotFoundException;

    /**
     * Retrieves paginated list of active images.
     * 
     * @param pageable pagination parameters
     * @return page of active images
     * @throws ResourceNotFoundException if no images found
     */
    Page<Image> getImagesNotDeleted(Pageable pageable) throws ResourceNotFoundException;

    /**
     * Counts deleted (inactive) images.
     * 
     * @return count of deleted images
     * @throws ResourceNotFoundException if no deleted images found
     */
    Long countImagesDeleted() throws ResourceNotFoundException;

    /**
     * Retrieves paginated list of deleted images.
     * 
     * @param pageable pagination parameters
     * @return page of deleted images
     * @throws ResourceNotFoundException if no images found
     */
    Page<Image> getImagesDeleted(Pageable pageable) throws ResourceNotFoundException;

    /**
     * Retrieves all active images as a list.
     * 
     * @return list of active images
     * @throws ResourceNotFoundException if no images found
     */
    List<Image> getImageList() throws ResourceNotFoundException;

    /**
     * Retrieves all active images for a specific product.
     * 
     * @param productId the ID of the product
     * @return list of active images for the product
     * @throws ResourceNotFoundException if no images found
     */
    List<Image> getActiveImageListByProductId(Long productId) throws ResourceNotFoundException;

    /**
     * Retrieves all inactive images for a specific product.
     * 
     * @param productId the ID of the product
     * @return list of inactive images for the product
     * @throws ResourceNotFoundException if no images found
     */
    List<Image> getNotActiveImageListByProductId(Long productId) throws ResourceNotFoundException;

    /**
     * Uploads multiple images for a product.
     * 
     * @param productId the ID of the product
     * @param files     array of image files to upload
     * @return list of saved image IDs
     * @throws ResourceNotFoundException if product not found
     * @throws IOException               if file reading fails
     */
    List<Long> uploadImages(Long immId, MultipartFile[] files) throws ResourceNotFoundException, IOException;

    /**
     * Retrieves an image by its ID.
     * 
     * @param id the image ID
     * @return the Image entity
     * @throws ResourceNotFoundException if image not found
     */
    Image getImageById(Long id) throws ResourceNotFoundException;

    /**
     * Updates multiple images.
     * 
     * @param files array of new image files
     * @param ids   comma-separated string of image IDs to update
     * @return success message
     * @throws ResourceNotFoundException if any image not found
     * @throws IOException               if file reading fails
     * @throws IllegalArgumentException  if number of files and IDs don't match
     */
    String updateImages(MultipartFile[] files, String ids) throws ResourceNotFoundException, IOException;

    /**
     * Soft deletes an image by its ID.
     * 
     * @param imgId the ID of the image to delete
     * @throws ResourceNotFoundException if image not found
     */
    void deleteImage(Long imgId) throws ResourceNotFoundException;

    /**
     * Soft deletes all images.
     * 
     * @throws ResourceNotFoundException if no images found to delete
     */
    void deleteAllImages() throws ResourceNotFoundException;
}
