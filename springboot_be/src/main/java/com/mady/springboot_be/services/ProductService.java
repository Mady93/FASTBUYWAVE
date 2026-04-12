package com.mady.springboot_be.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import com.mady.springboot_be.criteria.ProductSearchCriteriaDTO;
import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dtos.ProductDTO;
import com.mady.springboot_be.dtos.sample_dtos.ProductCompleteDto;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;

/**
 * Service interface for product management operations.
 * 
 * Defines methods for CRUD operations on products, including:
 * - Counting active/deleted products
 * - Creating, reading, updating, and soft-deleting products
 * - Advanced product search with dynamic filters (Criteria API)
 * - Hard delete operations (development only)
 * - Retrieving products by user ID and by advertisement type
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface ProductService {

    /**
     * Counts active (not deleted) products.
     * 
     * @return ResponseEntity with count
     */
    ResponseEntity<Integer> countProducts();

    /**
     * Counts deleted (inactive) products.
     * 
     * @return ResponseEntity with count
     */
    ResponseEntity<Integer> countProductsDeleted();

    /**
     * Creates a new product associated with an address.
     * 
     * @param productDTO the product data
     * @param addressId  the ID of the address to associate
     * @return the created ProductDTO
     */
    ProductDTO postProduct(ProductDTO productDTO, Long addressId);

    /**
     * Retrieves a product by its ID.
     * 
     * @param productId the product ID
     * @return ResponseEntity with ProductDTO
     */
    ResponseEntity<ProductDTO> getProductById(Long productId);

    /**
     * Updates a product's price and active status.
     * 
     * @param productId the ID of the product to update
     * @param product   the product data with updated fields
     * @return ResponseEntity with success/failure message
     */
    ResponseEntity<Object> putProduct(Long productId, ProductDTO product);

    /**
     * Soft deletes a product by its ID.
     * 
     * @param productId the ID of the product to delete
     * @return ResponseEntity with success/failure message
     */
    ResponseEntity<Object> deleteProduct(Long productId);

    /**
     * Soft deletes all products.
     * 
     * @return ResponseEntity with success/failure message
     */
    ResponseEntity<ApiResponse> deleteAllProducts();

    /**
     * Searches for products by type with optional dynamic filters.
     * 
     * @param criteria search criteria containing type (mandatory) and optional
     *                 filters
     * @return list of ProductCompleteDto matching the criteria
     * @throws ResourceNotFoundException if no products found
     */
    List<ProductCompleteDto> getProductsNotDeletedByType(ProductSearchCriteriaDTO criteria)
            throws ResourceNotFoundException;

    /**
     * Retrieves paginated list of deleted products.
     * 
     * @param pageable pagination parameters
     * @return page of ProductDTOs
     * @throws ResourceNotFoundException if no products found
     */
    Page<ProductDTO> getProductsDeleted(Pageable pageable) throws ResourceNotFoundException;

    /**
     * Retrieves all products created by a specific user.
     * 
     * @param userId the user ID
     * @return list of ProductCompleteDto
     * @throws ResourceNotFoundException if no products found
     */
    List<ProductCompleteDto> getProductsNotDeletedByUserId(Long userId) throws ResourceNotFoundException;

    /**
     * Permanently deletes a product (hard delete). WARNING: Irreversible!
     * Use only in development environment.
     * 
     * @param productId the ID of the product to hard delete
     * @return ResponseEntity with success/failure message
     * @deprecated This method performs irreversible hard delete. Use soft delete
     *             instead.
     *             Only for development/testing environments.
     */
    @Deprecated(since = "1.0", forRemoval = false)
    ResponseEntity<ApiResponse> hardDeleteProduct(Long productId);

    /**
     * Permanently deletes all products (hard delete). WARNING: Irreversible!
     * Use only in development environment.
     * 
     * @return ResponseEntity with success/failure message
     * @deprecated This method performs irreversible hard delete of ALL products.
     *             Only for development/testing environments. Do not use in
     *             production!
     */
    @Deprecated(since = "1.0", forRemoval = false)
    ResponseEntity<ApiResponse> hardDeleteAllProducts();

    /**
     * Retrieves all active products by advertisement type.
     * 
     * The type is a hierarchical string representing the category path.
     * Examples:
     * - "Marketplace/Art/Paintings"
     * - "Marketplace/Electronics/Phones"
     * - "Marketplace/Vehicles/Cars"
     * 
     * @param adType the hierarchical advertisement type path (e.g.,
     *               "Marketplace/Art/Paintings")
     * @return list of ProductCompleteDto matching the advertisement type
     */
    List<ProductCompleteDto> getAllProductsNotDeletedByType(String adType);
}
