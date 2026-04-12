package com.mady.springboot_be.services_impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.mady.springboot_be.criteria.ProductSearchCriteriaDTO;
import com.mady.springboot_be.criteria.ProductSpecifications;
import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dtos.ProductDTO;
import com.mady.springboot_be.dtos.sample_dtos.ProductCompleteDto;
import com.mady.springboot_be.entities.Address;
import com.mady.springboot_be.entities.Product;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.AddressRepository;
import com.mady.springboot_be.repositories.ProductRepository;
import com.mady.springboot_be.services.ProductService;
import com.mady.springboot_be.utils.PaginationUtils;
import com.mady.springboot_be.utils.mappers.ProductMapper;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

/**
 * Implementation of ProductService for product management.
 * 
 * Handles CRUD operations on products including:
 * - Soft delete with recursive propagation to related entities
 * - Hard delete for development environment
 * - Dynamic product search using JPA Specifications (Criteria API)
 * - Product retrieval by user and advertisement type
 * 
 * Soft delete operations cascade to:
 * - Images associated with the product
 * - Advertisement associated with the product
 * - Categories used in the advertisement
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class ProductServiceImpl implements ProductService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final ProductMapper productMapper;
    private final AllMappingService mappingService;

    private static final Logger logger = LoggerFactory.getLogger(ProductServiceImpl.class);

    /**
     * Constructs a new ProductServiceImpl with required dependencies.
     * 
     * @param productRepository repository for Product entity
     * @param addressRepository repository for Address entity
     * @param productMapper     mapper for Product entity to DTO conversion
     * @param mappingService    service for mapping Product to ProductCompleteDto
     */
    @Autowired
    public ProductServiceImpl(ProductRepository productRepository, AddressRepository addressRepository,
            ProductMapper productMapper,
            AllMappingService mappingService) {
        this.productRepository = productRepository;
        this.addressRepository = addressRepository;
        this.productMapper = productMapper;
        this.mappingService = mappingService;
    }

    @Override
    public ResponseEntity<Integer> countProducts() {
        Long count = productRepository.countByNotDeleted();
        if (count == 0) {
            throw new ResourceNotFoundException(
                    "Unable to perform the count. No product resource was found");
        }
        return new ResponseEntity<>(count.intValue(), HttpStatus.OK);
    }

    @Override
    public List<ProductCompleteDto> getAllProductsNotDeletedByType(String adType) throws ResourceNotFoundException {

        logger.info("Fetching products by advertisement type: {}", adType);
        List<Product> products = productRepository.findByNotDeletedAndAdvertisementType(adType);

        if (products.isEmpty()) {
            throw new ResourceNotFoundException("No product resource was found");
        }

        return products.stream()
                .map(mappingService::mapToCompleteDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductCompleteDto> getProductsNotDeletedByType(ProductSearchCriteriaDTO criteria)
            throws ResourceNotFoundException {
        if (criteria.getType() == null) {
            throw new IllegalArgumentException("Type is mandatory for product search");
        }

        List<Product> products = productRepository.findAll(ProductSpecifications.withFilters(criteria));

        if (products.isEmpty()) {
            throw new ResourceNotFoundException("No products found matching the criteria");
        }

        return products.stream()
                .map(mappingService::mapToCompleteDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductCompleteDto> getProductsNotDeletedByUserId(Long userId) throws ResourceNotFoundException {
        List<Product> products = productRepository.findByUserId(userId);

        if (products.isEmpty()) {
            throw new ResourceNotFoundException("No product resource was found");
        }

        return products.stream()
                .map(mappingService::mapToCompleteDto)
                .collect(Collectors.toList());
    }

    @Override
    public ResponseEntity<Integer> countProductsDeleted() {
        Long count = productRepository.countByDeleted();
        if (count == 0) {
            throw new ResourceNotFoundException(
                    "Unable to perform the count. No products resource was found");
        }
        return new ResponseEntity<>(count.intValue(), HttpStatus.OK);
    }

    @Override
    public Page<ProductDTO> getProductsDeleted(Pageable pageable) {
        List<Product> allProduct = productRepository.findByDeletedList();
        if (allProduct.isEmpty()) {
            throw new ResourceNotFoundException("No product resource was found");
        }

        Page<Product> paged = PaginationUtils.paginateList(allProduct, pageable);
        return paged.map(productMapper::toDto);
    }

    @Override
    public ProductDTO postProduct(ProductDTO productDTO, Long addressId) {

        logger.info("Creating product for address ID: {}", addressId);

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("No address with ID: " + addressId + " was found"));

        Product product = productMapper.toEntity(productDTO);
        product.setAddress(address);
        product.setActive(true);
        Product saved = productRepository.save(product);

        logger.info("Product created with ID: {}", saved.getProductId());

        return productMapper.toDto(saved);
    }

    @Override
    public ResponseEntity<ProductDTO> getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("No product with ID: " + productId + " was found"));
        ProductDTO productDTO = productMapper.toDto(product);
        return ResponseEntity.ok(productDTO);
    }

    @Override
    public ResponseEntity<Object> putProduct(Long productId, ProductDTO productDTO) {

        logger.info("Updating product ID: {}", productId);

        Product existing = productRepository.findByIdByNotDeleted(productId)
                .orElseThrow(() -> new ResourceNotFoundException("No product with ID: " + productId + " was found"));

        productMapper.updatePriceAndActiveFromDto(productDTO, existing);
        productRepository.save(existing);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse(HttpStatus.OK.value(), "Product updated successfully"));
    }

    @Override
    public ResponseEntity<Object> deleteProduct(Long productId) {

        logger.info("Soft deleting all products");

        Optional<Product> optional = productRepository.findByIdByNotDeleted(productId);
        if (optional.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Unable to perform the deletion. The property resource with ID: " + productId
                            + " was not found in the database");
        }

        this.deleteProductEm(productId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse(HttpStatus.OK.value(), "Success deleted"));
    }

    @Override
    public ResponseEntity<ApiResponse> deleteAllProducts() {

        logger.info("Soft deleting all products");

        List<Product> list = productRepository.findByNotDeletedList();
        if (list.isEmpty()) {
            throw new ResourceNotFoundException("No products found to delete");
        }

        this.deleteAllProductsEm();

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse(HttpStatus.OK.value(), "Success deleted"));
    }

    // ============ SOFT DELETE METHODS ============

    /**
     * Soft deletes a product and all associated entities.
     * 
     * @param productId the ID of the product to delete
     */
    @Transactional
    private void deleteProductEm(Long productId) {

        List<Long> categoryIds = entityManager.createQuery(
                "SELECT DISTINCT a.category.categoryId FROM Advertisement a WHERE a.product.productId = :productId",
                Long.class)
                .setParameter("productId", productId)
                .getResultList();

        entityManager.createQuery("UPDATE Image i SET i.active = false WHERE i.product.productId = :productId")
                .setParameter("productId", productId)
                .executeUpdate();

        entityManager.createQuery("UPDATE Advertisement a SET a.active = false WHERE a.product.productId = :productId")
                .setParameter("productId", productId)
                .executeUpdate();

        entityManager.createQuery("UPDATE Product p SET p.active = false WHERE p.productId = :productId")
                .setParameter("productId", productId)
                .executeUpdate();

        if (!categoryIds.isEmpty()) {
            entityManager.createQuery("UPDATE Category c SET c.active = false WHERE c.categoryId IN :categoryIds")
                    .setParameter("categoryIds", categoryIds)
                    .executeUpdate();
        }
    }

    /**
     * Soft deletes all products and associated entities.
     */
    @Transactional
    private void deleteAllProductsEm() {

        List<Long> categoryIds = entityManager.createQuery(
                "SELECT DISTINCT a.category.categoryId FROM Advertisement a WHERE a.active = true", Long.class)
                .getResultList();

        entityManager.createQuery("UPDATE Image i SET i.active = false")
                .executeUpdate();

        entityManager.createQuery("UPDATE Advertisement a SET a.active = false")
                .executeUpdate();

        entityManager.createQuery("UPDATE Product p SET p.active = false")
                .executeUpdate();

        if (!categoryIds.isEmpty()) {
            entityManager.createQuery("UPDATE Category c SET c.active = false WHERE c.categoryId IN :categoryIds")
                    .setParameter("categoryIds", categoryIds)
                    .executeUpdate();
        }
    }

    // ============ HARD DELETE METHODS ============

    @Override
    public ResponseEntity<ApiResponse> hardDeleteProduct(Long productId) {

        logger.warn("Hard deleting product ID: {}", productId);

        Optional<Product> optional = productRepository.findByIdByNotDeleted(productId);
        if (optional.isEmpty()) {
            throw new ResourceNotFoundException(
                    "Unable to perform the deletion. The property resource with ID: " + productId
                            + " was not found in the database");
        }
        this.hardDeleteProductEm(productId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse(HttpStatus.OK.value(), "Success hard deleted"));
    }

    @Override
    @Transactional
    public ResponseEntity<ApiResponse> hardDeleteAllProducts() {

        logger.warn("Hard deleting all products");

        List<Product> list = productRepository.findByNotDeletedList();
        if (list.isEmpty()) {
            throw new ResourceNotFoundException("No products found to delete");
        }
        this.hardDeleteAllProductsEm();
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse(HttpStatus.OK.value(), "Success hard deleted"));
    }

    /**
     * Hard deletes a single product and its associated entities.
     * 
     * @param productId the ID of the product to hard delete
     */
    @Transactional
    private void hardDeleteProductEm(Long productId) {
        try {
            List<Long> advertisementIds = entityManager.createQuery(
                    "SELECT a.advertisementId FROM Advertisement a WHERE a.product.productId = :productId", Long.class)
                    .setParameter("productId", productId)
                    .getResultList();

            entityManager.createQuery("DELETE FROM Image i WHERE i.product.productId = :productId")
                    .setParameter("productId", productId)
                    .executeUpdate();

            entityManager.createQuery("DELETE FROM Product p WHERE p.productId = :productId")
                    .setParameter("productId", productId)
                    .executeUpdate();

            if (!advertisementIds.isEmpty()) {
                entityManager.createQuery("DELETE FROM Advertisement a WHERE a.advertisementId IN :advertisementIds")
                        .setParameter("advertisementIds", advertisementIds)
                        .executeUpdate();
            }

        } catch (Exception e) {
            System.err.println("Errore durante l'hard delete del prodotto " + productId + ": " + e.getMessage());
            throw e;
        }
    }

    /**
     * Hard deletes all products and associated entities.
     */
    private void hardDeleteAllProductsEm() {
        try {

            entityManager.createQuery("DELETE FROM Image i").executeUpdate();

            entityManager.createQuery("DELETE FROM Product p").executeUpdate();

            entityManager.createQuery("DELETE FROM Advertisement a").executeUpdate();

        } catch (Exception e) {
            logger.error("Error during hard delete of all products: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Reactivates a soft-deleted product and its associated entities.
     * 
     * @param productId the ID of the product to reactivate
     */
    @Transactional
    public void reactivateProduct(Long productId) {
        entityManager.createQuery("UPDATE Product p SET p.active = true WHERE p.productId = :productId")
                .setParameter("productId", productId)
                .executeUpdate();

        entityManager.createQuery("UPDATE Image i SET i.active = true WHERE i.product.productId = :productId")
                .setParameter("productId", productId)
                .executeUpdate();

        entityManager.createQuery("UPDATE Advertisement a SET a.active = true WHERE a.product.productId = :productId")
                .setParameter("productId", productId)
                .executeUpdate();
    }

}
