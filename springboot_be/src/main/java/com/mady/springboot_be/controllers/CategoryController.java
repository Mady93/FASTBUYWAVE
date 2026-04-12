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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.dtos.CategoryDTO;
import com.mady.springboot_be.services_impl.CategoryServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for category management operations.
 * 
 * Supports CRUD operations on hierarchical categories with parent/child
 * relationships, recursive activation/deactivation of sub-trees, and
 * path-based lookup (e.g., 'electronics/phones/smartphones').
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/category")
@Tag(name = "Categories", description = "Endpoints for managing product categories")
public class CategoryController {

    private final CategoryServiceImpl categoryService;

    @Autowired
    public CategoryController(CategoryServiceImpl categoryService) {
        this.categoryService = categoryService;
    }

    @Operation(summary = "Create a new category", description = "Creates a new category with optional hierarchical structure")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Category created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping("/create")
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO categoryDTO) {
        CategoryDTO saved = categoryService.save(categoryDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @Operation(summary = "Update a category", description = "Updates an existing category. Can modify label, icon, link, name, and active status")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Category updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data or cannot modify child when parent is inactive"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Cannot deactivate root category"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found")
    })
    @PutMapping("/update")
    public ResponseEntity<CategoryDTO> updateCategory(@RequestBody CategoryDTO categoryDTO) {
        CategoryDTO updated = categoryService.updateCategoryUniversal(categoryDTO);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Soft delete a category", description = "Deactivates a category and all its children recursively")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Category deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found")
    })
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Soft delete a child category", description = "Deactivates a specific child category within a parent category")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Child category deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Parent or child category not found")
    })
    @DeleteMapping("/delete/{categoryId}/child/{childCategoryId}")
    public ResponseEntity<Void> deleteChildByCategoryId(@PathVariable Long categoryId,
            @PathVariable Long childCategoryId) {
        categoryService.deleteChildByCategoryId(categoryId, childCategoryId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get active category by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Category found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Active category not found")
    })
    @GetMapping("/get/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        CategoryDTO category = categoryService.findByIdActive(id);
        return ResponseEntity.ok(category);
    }

    @Operation(summary = "Get deleted category by ID")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Deleted category found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Deleted category not found")
    })
    @GetMapping("/get/deleted/{id}")
    public ResponseEntity<CategoryDTO> getCategoryDeletedById(@PathVariable Long id) {
        CategoryDTO category = categoryService.findByIdDeleted(id);
        return ResponseEntity.ok(category);
    }

    @Operation(summary = "Get category by name")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Category found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found with given name")
    })
    @GetMapping("/get/name/{name}")
    public ResponseEntity<CategoryDTO> getCategoryByName(@PathVariable String name) {
        CategoryDTO category = categoryService.findByName(name);
        return ResponseEntity.ok(category);
    }

    @Operation(summary = "Check if category exists by name")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Returns true if exists, false otherwise")
    })
    @GetMapping("/exists/name/{name}")
    public ResponseEntity<Boolean> existsByName(@PathVariable String name) {
        boolean exists = categoryService.existsByName(name);
        return ResponseEntity.ok(exists);
    }

    @Operation(summary = "Get all categories (active and inactive)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Categories retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No categories found")
    })
    @GetMapping("/get/all")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.findAll();
        return ResponseEntity.ok(categories);
    }

    @Operation(summary = "Get all active categories")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Active categories retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No active categories found")
    })
    @GetMapping("/get/active")
    public ResponseEntity<List<CategoryDTO>> getAllActiveCategories() {
        List<CategoryDTO> categories = categoryService.findAllActive();
        return ResponseEntity.ok(categories);
    }

    @Operation(summary = "Get all inactive categories")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Inactive categories retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No inactive categories found")
    })
    @GetMapping("/get/not/active")
    public ResponseEntity<List<CategoryDTO>> getAllInactiveCategories() {
        List<CategoryDTO> categories = categoryService.findAllNotAnactive();
        return ResponseEntity.ok(categories);
    }

    @Operation(summary = "Get paginated active categories")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Active categories retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No active categories found")
    })
    @GetMapping("/active/paginated")
    public ResponseEntity<Page<CategoryDTO>> getActiveCategoriesPaginated(Pageable pageable) {
        Page<CategoryDTO> categories = categoryService.findAllActivePaginated(pageable);
        return ResponseEntity.ok(categories);
    }

    @Operation(summary = "Get paginated inactive categories")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Inactive categories retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No inactive categories found")
    })
    @GetMapping("/not/active/paginated")
    public ResponseEntity<Page<CategoryDTO>> getInactiveCategoriesPaginated(Pageable pageable) {
        Page<CategoryDTO> categories = categoryService.findAllNotActivePaginated(pageable);
        return ResponseEntity.ok(categories);
    }

    @Operation(summary = "Count active categories")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Count successful")
    })
    @GetMapping("/count/active")
    public ResponseEntity<Long> countActiveCategories() {
        long count = categoryService.countActive();
        return ResponseEntity.ok(count);
    }

    @Operation(summary = "Count inactive categories")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Count successful")
    })
    @GetMapping("/count/not/active")
    public ResponseEntity<Long> countInactiveCategories() {
        long count = categoryService.countInactive();
        return ResponseEntity.ok(count);
    }

    @Deprecated
    @Operation(summary = "Delete all categories (DEPRECATED)", description = "This method is deprecated and should not be used")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Categories deleted successfully")
    })
    @DeleteMapping("/delete/all")
    public ResponseEntity<Void> deleteCategories() {
        categoryService.deleteAllCategories();
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Activate all child categories", description = "Activates all child categories while keeping root categories unchanged")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Categories activated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No root categories found")
    })
    @PutMapping("/activate/all")
    public ResponseEntity<List<CategoryDTO>> activateAllCategories() {
        List<CategoryDTO> activatedCategories = categoryService.activateAllCategories();
        return ResponseEntity.ok(activatedCategories);
    }

    @Operation(summary = "Deactivate all child categories", description = "Deactivates all child categories while keeping root categories unchanged")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Categories deactivated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No root categories found")
    })
    @PutMapping("/deactivate/all")
    public ResponseEntity<List<CategoryDTO>> deactivateAllCategories() {
        List<CategoryDTO> deactivatedCategories = categoryService.deactivateAllCategories();
        return ResponseEntity.ok(deactivatedCategories);
    }

    @Operation(summary = "Get category by path", description = "Finds a category using a slash-separated path (e.g., 'electronics/phones/smartphones')")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Category found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found at given path")
    })
    @GetMapping("/get/path")
    public ResponseEntity<CategoryDTO> getCategoryByPath(@RequestParam String path) {
        CategoryDTO category = categoryService.findCategoryByPath(path);
        return ResponseEntity.ok(category);
    }

    @Operation(summary = "Get category by link", description = "Finds a category using its link identifier")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Category found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Category not found for given link")
    })
    @GetMapping("/get/link")
    public ResponseEntity<CategoryDTO> getCategoryByLink(@RequestParam String link) {
        CategoryDTO category = categoryService.findCategoryByLink(link);
        return ResponseEntity.ok(category);
    }

}
