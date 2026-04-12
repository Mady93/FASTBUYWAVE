package com.mady.springboot_be.services;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dtos.AddressDTO;
import com.mady.springboot_be.dtos.AdvertisementDTO;
import com.mady.springboot_be.dtos.CategoryDTO;
import com.mady.springboot_be.dtos.ProductDTO;
import com.mady.springboot_be.entities.Advertisement;

/**
 * Service interface for advertisement management operations.
 * 
 * Defines methods for creating complete advertisements with all associated
 * data (product, address, category, images) and renewing existing
 * advertisements.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface AdvertisementService {

  /**
   * Creates a complete advertisement with all associated data.
   * 
   * Creates and saves:
   * - Address entity
   * - Product entity (linked to address)
   * - Advertisement entity (linked to user, category, product, profile)
   * - Image entities for the product
   * 
   * All operations are transactional and will roll back on failure.
   * 
   * @param advertisementDTO the advertisement data
   * @param productDTO       the product data
   * @param addressDTO       the address data
   * @param categoryDTO      the category data
   * @param imageFiles       array of image files for the product
   * @param userId           the ID of the user creating the advertisement
   * @return ResponseEntity with ApiResponse containing success/failure message
   * @throws IOException if image file processing fails
   */
  ResponseEntity<ApiResponse> createAdvertisement(
      AdvertisementDTO advertisementDTO,
      ProductDTO productDTO,
      AddressDTO addressDTO,
      CategoryDTO categoryDTO,
      MultipartFile[] imageFiles,
      long userId) throws IOException;

  /**
   * Renews an existing advertisement by updating its renewal date.
   * 
   * @param announcement the advertisement to renew (must have valid ID)
   * @return the updated Advertisement entity
   */
  Advertisement setRenewedAt(Advertisement announcement);

}
