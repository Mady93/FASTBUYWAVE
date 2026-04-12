package com.mady.springboot_be.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.criteria.ProductSearchCriteriaDTO;
import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dtos.ProductDTO;
import com.mady.springboot_be.dtos.sample_dtos.ProductCompleteDto;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.services_impl.ProductServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for product management operations.
 * 
 * Supports CRUD operations with soft delete and hard delete (dev only),
 * pagination, product search with dynamic multi-field filtering (Criteria API),
 * and type-based product retrieval with advanced search capabilities.
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Endpoints for managing products")
public class ProductController {

    private final ProductServiceImpl productService;

    @Autowired
    public ProductController(ProductServiceImpl productService) {
        this.productService = productService;
    }

    @Operation(summary = "Count active products")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Count successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No products found")
    })
    @GetMapping("/count")
    public ResponseEntity<Integer> countProducts() {
        return productService.countProducts();
    }

    @Operation(summary = "Count deleted products")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Count successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No deleted products found")
    })
    @GetMapping("/deleted/count")
    public ResponseEntity<Integer> countProductsDeleted() {
        return productService.countProductsDeleted();
    }

    @Operation(summary = "Get paginated list of deleted products")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Deleted products retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No deleted products found")
    })
    @GetMapping("/deleted")
    public ResponseEntity<Page<ProductDTO>> getProductsDeleted(
            @RequestParam Pageable pageable) {
        Page<ProductDTO> deletedProducts = productService.getProductsDeleted(pageable);
        return ResponseEntity.ok(deletedProducts);
    }

    @Operation(summary = "Create a new product")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Product created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Address not found")
    })
    @PostMapping("/{addressId}")
    public ResponseEntity<ProductDTO> postProduct(@RequestBody ProductDTO product, @PathVariable Long addressId) {
        ProductDTO savedProduct = productService.postProduct(product, addressId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduct);
    }

    @Operation(summary = "Get product by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found")
    })
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long productId) {
        return productService.getProductById(productId);
    }

    @Operation(summary = "Update product price and active status")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found")
    })
    @PutMapping("/{productId}")
    public ResponseEntity<Object> putProduct(@PathVariable Long productId, @RequestBody ProductDTO product) {
        return productService.putProduct(productId, product);
    }

    @Operation(summary = "Soft delete a product by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found")
    })
    @DeleteMapping("/{productId}")
    public ResponseEntity<Object> deleteProduct(@PathVariable Long productId) {
        return productService.deleteProduct(productId);
    }

    @Operation(summary = "Soft delete all products")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "All products deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No products found to delete")
    })
    @DeleteMapping
    public ResponseEntity<ApiResponse> deleteAllProducts() {
        return productService.deleteAllProducts();
    }

    @Operation(summary = "Get all active products by user ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Products retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No products found for this user")
    })
    @GetMapping(path = "/getProduct/active/{userId}")
    public ResponseEntity<List<ProductCompleteDto>> getImagesListActiveByProductId(@PathVariable Long userId) {
        try {
            List<ProductCompleteDto> products = this.productService.getProductsNotDeletedByUserId(userId);
            return new ResponseEntity<>(products, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException(e.getMessage());
        }
    }

    @Operation(summary = "Search products by type and filters", description = "If only type is provided, returns all products of that type. If additional filters are provided, performs advanced search.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Products retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Type is mandatory"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No products found matching criteria")
    })
    @RequestMapping(value = "list/not/delete", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<List<ProductCompleteDto>> getProductsNotDeletedByType(
            @RequestBody(required = false) ProductSearchCriteriaDTO criteria) {

        if (criteria.getType() == null) {
            throw new IllegalArgumentException("Type is mandatory for product search");
        }

        // ✅ VERIFICA: Se ALMENO UN campo (oltre type) è valorizzato = ricerca avanzata
        boolean hasSearchFilters = (criteria.getCountry() != null && !criteria.getCountry().isEmpty()) ||
                (criteria.getCity() != null && !criteria.getCity().isEmpty()) ||
                criteria.getMinPrice() != null ||
                criteria.getMaxPrice() != null ||
                (criteria.getTitle() != null && !criteria.getTitle().isEmpty()) ||
                (criteria.getCondition() != null && !criteria.getCondition().isEmpty()) ||
                criteria.getAgency() != null ||
                criteria.getMinDate() != null ||
                criteria.getMaxDate() != null;

        List<ProductCompleteDto> products;

        if (!hasSearchFilters) {
            // ✅ Solo type valorizzato: recupera TUTTI i prodotti della categoria
            products = this.productService.getAllProductsNotDeletedByType(criteria.getType());
        } else {
            // ✅ Almeno un campo di ricerca valorizzato: ricerca AVANZATA con filtri
            products = this.productService.getProductsNotDeletedByType(criteria);
        }

        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @Operation(summary = "Permanently delete a product", description = "Hard deletes a product from the database. WARNING: This operation is irreversible! Use only in dev.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Product permanently deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found")
    })
    @DeleteMapping("/hard/{productId}")
    public ResponseEntity<ApiResponse> hardDeleteProduct(@PathVariable Long productId) {
        return this.productService.hardDeleteProduct(productId);
    }

    @Operation(summary = "Permanently delete all products", description = "Hard deletes all products from the database. WARNING: This operation is irreversible! Use only in dev.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "All products permanently deleted"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No products found to delete")
    })
    @DeleteMapping("/hard")
    public ResponseEntity<ApiResponse> hardDeleteAllProducts() {
        return this.productService.hardDeleteAllProducts();
    }
}
