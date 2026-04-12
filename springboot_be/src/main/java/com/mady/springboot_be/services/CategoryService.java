package com.mady.springboot_be.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.mady.springboot_be.dtos.CategoryDTO;

/**
 * Service interface for category management operations.
 * 
 * Defines methods for CRUD operations on hierarchical categories with
 * parent/child relationships, recursive save/update/delete operations,
 * and sub-tree activation/deactivation.
 * 
 * Key features:
 * - Recursive category tree management
 * - Soft delete with recursive propagation to children
 * - Activate/deactivate entire sub-trees
 * - Path-based lookup (e.g., 'electronics/phones/smartphones')
 * - Pagination support for active/inactive categories
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface CategoryService {

    /**
     * Saves a category with its entire child tree recursively.
     * 
     * @param categoryDTO the root category to save
     * @return the saved CategoryDTO with generated IDs
     */
    CategoryDTO save(CategoryDTO categoryDTO);

    /**
     * Updates a category using universal update logic.
     * Can update label, icon, link, name, active status, parent, and children.
     * 
     * @param categoryDTO the category data to update
     * @return the updated CategoryDTO
     */
    CategoryDTO updateCategoryUniversal(CategoryDTO categoryDTO);

    /**
     * Soft deletes a category and all its children recursively.
     * 
     * @param id the ID of the category to delete
     */
    void delete(Long id);

    CategoryDTO findByIdActive(Long id);

    /**
     * Finds a deleted (inactive) category by ID.
     * 
     * @param id the category ID
     * @return the CategoryDTO
     */
    CategoryDTO findByIdDeleted(Long id);

    /**
     * Finds a category by name.
     * 
     * @param name the category name
     * @return the CategoryDTO
     */
    CategoryDTO findByName(String name);

    /**
     * Checks if a category exists with the given name.
     * 
     * @param name the category name
     * @return true if exists, false otherwise
     */
    boolean existsByName(String name);

    /**
     * Retrieves all categories (both active and inactive).
     * 
     * @return list of all CategoryDTOs
     */
    List<CategoryDTO> findAll();

    /**
     * Retrieves all active categories.
     * 
     * @return list of active CategoryDTOs
     */
    List<CategoryDTO> findAllActive();

    /**
     * Retrieves all inactive categories.
     * 
     * @return list of inactive CategoryDTOs
     */
    List<CategoryDTO> findAllNotAnactive();

    /**
     * Retrieves paginated list of active categories.
     * 
     * @param pageable pagination parameters
     * @return page of active CategoryDTOs
     */
    Page<CategoryDTO> findAllActivePaginated(Pageable pageable);

    /**
     * Retrieves paginated list of inactive categories.
     * 
     * @param pageable pagination parameters
     * @return page of inactive CategoryDTOs
     */
    Page<CategoryDTO> findAllNotActivePaginated(Pageable pageable);

    /**
     * Counts active categories.
     * 
     * @return count of active categories
     */
    long countActive();

    /**
     * Counts inactive categories.
     * 
     * @return count of inactive categories
     */
    long countInactive();

    /**
     * Deletes all categories (DEPRECATED - use with caution).
     */
    @Deprecated
    void deleteAllCategories();

    /**
     * Deletes a specific child category under a parent category.
     * 
     * @param categoryId      the parent category ID
     * @param childCategoryId the child category ID to delete
     */
    void deleteChildByCategoryId(Long categoryId, Long childCategoryId);

    /**
     * Deactivates all child categories while keeping root categories active.
     * 
     * @return list of all updated categories
     */
    List<CategoryDTO> deactivateAllCategories();

    /**
     * Activates all child categories while keeping root categories unchanged.
     * 
     * @return list of all updated categories
     */
    List<CategoryDTO> activateAllCategories();

    /**
     * Finds a category by its slash-separated path.
     * Example: "electronics/phones/smartphones"
     * 
     * @param path the path string
     * @return the CategoryDTO
     */
    CategoryDTO findCategoryByPath(String path);
}
