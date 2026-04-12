package com.mady.springboot_be.services_impl;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.mady.springboot_be.dtos.CategoryDTO;
import com.mady.springboot_be.entities.Category;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.CategoryRepository;
import com.mady.springboot_be.services.CategoryService;
import com.mady.springboot_be.utils.PaginationUtils;
import com.mady.springboot_be.utils.mappers.CategoryMapperImplCustom;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

/**
 * Implementation of CategoryService for hierarchical category management.
 * 
 * Handles recursive category operations including:
 * - Recursive save of category trees (parent + children)
 * - Recursive soft delete with state propagation to descendants
 * - Recursive activation/deactivation of sub-trees
 * - Path-based category lookup (e.g., 'electronics/phones/smartphones')
 * - Pagination support for active/inactive categories
 * 
 * Uses custom mapper (CategoryMapperImplCustom) for recursive DTO conversion
 * with circular reference prevention.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class CategoryServiceImpl implements CategoryService {

    @PersistenceContext
    private EntityManager entityManager;

    private final CategoryRepository categoryRepository;
    private final CategoryMapperImplCustom customMapper;

    private static final Logger logger = LoggerFactory.getLogger(CategoryServiceImpl.class);

    /**
     * Constructs a new CategoryServiceImpl with required dependencies.
     * 
     * @param categoryRepository repository for Category entity operations
     * @param customMapper       custom mapper for recursive Category to DTO
     *                           conversion
     */
    @Autowired
    public CategoryServiceImpl(CategoryRepository categoryRepository, CategoryMapperImplCustom customMapper) {
        this.categoryRepository = categoryRepository;
        this.customMapper = customMapper;
    }

    @Override
    @Transactional
    public CategoryDTO save(CategoryDTO rootDto) {
        logger.info("Saving category: {}", rootDto.getName());
        Category saved = saveRecursively(rootDto, null);
        logger.debug("Category saved with ID: {}", saved.getCategoryId());
        return customMapper.toDTORecursive(saved);
    }

    /**
     * Recursively saves a category and its children.
     * 
     * @param dto    the category DTO to save
     * @param parent the parent entity (null for root)
     * @return the saved Category entity
     */
    private Category saveRecursively(CategoryDTO dto, Category parent) {
        // Check if category already exists with same name and same parent
        Optional<Category> existingOpt = categoryRepository.findByNameAndParent(dto.getName(), parent);
        if (existingOpt.isPresent()) {
            logger.debug("Category already exists: {} (parent: {})", dto.getName(),
                    parent != null ? parent.getCategoryId() : "null");
            return existingOpt.get();
        }

        // Create new entity
        Category category = new Category();
        category.setName(dto.getName());
        category.setLabel(dto.getLabel());
        category.setIcon(dto.getIcon());
        category.setLink(dto.getLink());
        category.setActive(dto.getActive());
        category.setParent(parent);

        // Save before adding children to obtain ID
        category = categoryRepository.save(category);

        // Save children recursively
        if (dto.getChildren() != null) {
            for (CategoryDTO childDto : dto.getChildren()) {
                Category child = saveRecursively(childDto, category);
                category.addChild(child); // relazione bidirezionale
            }
        }

        // Save again if children were added
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public CategoryDTO updateCategoryUniversal(CategoryDTO categoryDTO) {
        logger.info("Updating category ID: {}", categoryDTO.getCategoryId());
        if (categoryDTO.getCategoryId() == null) {
            throw new IllegalArgumentException("CategoryId is required for update");
        }

        // // Find category (active or inactive)
        Category existingCategory = categoryRepository.findById(categoryDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + categoryDTO.getCategoryId()));

        Category updatedCategory = updateCategoryFields(existingCategory, categoryDTO);
        Category savedCategory = categoryRepository.save(updatedCategory);
        logger.debug("Category updated: {}", categoryDTO.getCategoryId());
        return customMapper.toDTORecursive(savedCategory);
    }

    /**
     * Updates category fields from DTO.
     * 
     * @param existingCategory the existing entity
     * @param categoryDTO      the DTO with new values
     * @return the updated entity
     */
    private Category updateCategoryFields(Category existingCategory, CategoryDTO categoryDTO) {

        if (categoryDTO.getLabel() != null) {

            existingCategory.setLabel(categoryDTO.getLabel());
        }

        if (categoryDTO.getIcon() != null) {

            existingCategory.setIcon(categoryDTO.getIcon());
        }

        if (categoryDTO.getLink() != null) {

            existingCategory.setLink(categoryDTO.getLink());
        }

        if (categoryDTO.getName() != null) {

            existingCategory.setName(categoryDTO.getName());
        }

        // Check if parent is inactive
        if (existingCategory.getParent() != null && !existingCategory.getParent().isActive()) {
            throw new IllegalStateException("Cannot modify a child category when parent is inactive");
        }

        // Root category cannot be deactivated
        if (existingCategory.getParent() == null && !categoryDTO.getActive()) {
            throw new IllegalStateException("Root category cannot be deactivated");
        }

        // Handle active status change with recursive propagation
        boolean previousActive = existingCategory.isActive();
        boolean newActive = categoryDTO.getActive();

        if (previousActive != newActive) {
            existingCategory.setActive(newActive);

            if (newActive) {
                activateChildrenRecursively(existingCategory.getChildren());
            } else {
                propagateActiveToChildren(existingCategory.getChildren(), false);
            }
        }

        // Update parent
        if (categoryDTO.getParent() != null) {
            Category parentCategory = categoryRepository.findById(categoryDTO.getParent().getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            existingCategory.setParent(parentCategory);
        }

        // Update children
        if (categoryDTO.getChildren() != null && !categoryDTO.getChildren().isEmpty()) {
            Set<Category> children = new HashSet<>();
            for (CategoryDTO childDTO : categoryDTO.getChildren()) {
                Category childCategory = categoryRepository.findById(childDTO.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Child category not found"));
                children.add(childCategory);
            }
            existingCategory.setChildren(children);
        }

        return existingCategory;
    }

    /**
     * Recursively propagates active status to children.
     * 
     * @param children  the children set
     * @param newActive the new active status
     */
    private void propagateActiveToChildren(Set<Category> children, boolean newActive) {
        if (children == null || children.isEmpty())
            return;

        for (Category child : children) {
            // Skip state propagation if child is already explicitly updated
            if (child.isActive() != newActive) {
                child.setActive(newActive);
                propagateActiveToChildren(child.getChildren(), newActive);
            }
        }
    }

    @Override
    public CategoryDTO findByIdActive(Long id) {

        Category category = categoryRepository.findByIdByNotDeleted(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return customMapper.toDTORecursive(category);
    }

    @Override
    public CategoryDTO findByIdDeleted(Long id) {

        Category category = categoryRepository.findByIdDeleted(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return customMapper.toDTORecursive(category);
    }

    @Override
    public CategoryDTO findByName(String name) {
        Category category = categoryRepository.findByName(name);
        if (category == null) {
            throw new ResourceNotFoundException("Category not found with name: " + name);
        }
        return customMapper.toDTORecursive(category);
    }

    @Override
    public boolean existsByName(String name) {
        return categoryRepository.existsByNameActive(name);
    }

    @Override
    public List<CategoryDTO> findAll() {
        List<Category> allCategories = categoryRepository.findAllCategories();
        return this.customMapper.toDTORecursiveList(allCategories);
    }

    @Override
    @Transactional
    public List<CategoryDTO> findAllActive() {
        List<Category> allActive = categoryRepository.findByNotDeletedList();
        return this.customMapper.toDTORecursiveList(allActive);
    }

    @Override
    @Transactional
    public List<CategoryDTO> findAllNotAnactive() {
        List<Category> allInactive = categoryRepository.findByDeletedList();

        if (allInactive.isEmpty()) {
            throw new ResourceNotFoundException("Category not found");
        }

        // Force lazy loading of children within session
        allInactive.forEach(c -> c.getChildren().size());

        return this.customMapper.toDTORecursiveList(allInactive);
    }

    @Override
    public Page<CategoryDTO> findAllActivePaginated(Pageable pageable) {
        // Carica tutte le root attive
        List<Category> activeRoots = categoryRepository.findByNotDeletedList();

        // Filter active children recursively
        List<Category> filteredCategories = activeRoots.stream()
                .map(this::filterActiveChildren)
                .collect(Collectors.toList());

        return PaginationUtils.paginateList(
                customMapper.toDTORecursiveList(filteredCategories),
                pageable);
    }

    /**
     * Recursively filters only active children of a category.
     * 
     * @param category the category to filter
     * @return filtered category with only active children
     */
    private Category filterActiveChildren(Category category) {
        if (category.getChildren() == null || category.getChildren().isEmpty()) {
            return category;
        }

        // Recursively apply to active children only
        Set<Category> activeChildren = category.getChildren().stream()
                .filter(Category::isActive)
                .map(this::filterActiveChildren)
                .collect(Collectors.toSet());

        // Clone category with active children only
        Category filtered = new Category();
        filtered.setCategoryId(category.getCategoryId());
        filtered.setLabel(category.getLabel());
        filtered.setIcon(category.getIcon());
        filtered.setActive(category.isActive());
        filtered.setLink(category.getLink());
        filtered.setName(category.getName());
        filtered.setParent(category.getParent());
        filtered.setChildren(activeChildren);

        return filtered;
    }

    @Override
    public Page<CategoryDTO> findAllNotActivePaginated(Pageable pageable) {
        // Fetch all roots with their children to minimize queries
        List<Category> allRoots = categoryRepository.findAllRootsWithChildren();

        // Extract only disabled top-level categories (roots or direct children of
        // roots)
        List<Category> inactiveCategories = new ArrayList<>();

        for (Category root : allRoots) {
            // If root is disabled, add it as a standalone category
            if (!root.isActive()) {
                inactiveCategories.add(root);
            } else {
                // If root is active, look only for its directly disabled children
                collectDirectInactiveChildren(root, inactiveCategories);
            }
        }

        return PaginationUtils.paginateList(
                customMapper.toDTORecursiveList(inactiveCategories),
                pageable);
    }

    /**
     * Collects direct inactive children of a parent category.
     * 
     * @param parent    the parent category
     * @param collector the list to collect into
     */
    private void collectDirectInactiveChildren(Category parent, List<Category> collector) {
        if (parent.getChildren() == null)
            return;

        for (Category child : parent.getChildren()) {
            if (!child.isActive()) {
                // Add disabled child only; nested hierarchy will be automatically included
                // during DTO mapping
                collector.add(child);
            } else {
                // If the child is active, continue searching within its children
                collectDirectInactiveChildren(child, collector);
            }
        }
    }

    @Override
    public long countActive() {
        return categoryRepository.countByNotDeleted();
    }

    @Override
    public long countInactive() {
        return categoryRepository.countByDeleted();
    }

    @Override
    public void delete(Long id) {
        logger.info("Soft deleting category ID: {}", id);
        Category category = categoryRepository.findByIdByNotDeleted(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Deep delete all children recursively
        deleteChildrenRecursively(category);

        // Finally, delete the category itself
        category.setActive(false);
        logger.debug("Category soft deleted: {}", id);
        categoryRepository.save(category);
    }

    private void deleteChildrenRecursively(Category parent) {
        for (Category child : parent.getChildren()) {
            deleteChildrenRecursively(child); // Delete the deepest children first
            child.setActive(false);
            categoryRepository.save(child);
        }
    }

    @Override
    public void deleteChildByCategoryId(Long categoryId, Long childCategoryId) {
        // Fetch parent category
        Category parentCategory = categoryRepository.findByIdByNotDeleted(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent category not found with id: " + categoryId));

        // Find the specific child within the parent's children
        Category childCategory = parentCategory.getChildren().stream()
                .filter(child -> child.getCategoryId().equals(childCategoryId))
                .findFirst()
                .orElseThrow(
                        () -> new ResourceNotFoundException("Child category not found with id: " + childCategoryId));

        // Delete the specific child
        deactivateCategory(childCategory);
    }

    /**
     * Recursively deactivates a category and its children.
     * 
     * @param category the category to deactivate
     */
    private void deactivateCategory(Category category) {
        category.setActive(false);
        categoryRepository.save(category);

        // If the child has its own children, disable them
        for (Category child : category.getChildren()) {
            deactivateCategory(child); // disable children recursively
        }
    }

    @Override
    @Transactional
    public List<CategoryDTO> deactivateAllCategories() {
        // Find only root categories (those without a parent)
        List<Category> rootCategories = categoryRepository.findAll().stream()
                .filter(category -> category.getParent() == null)
                .collect(Collectors.toList());

        if (rootCategories.isEmpty()) {
            throw new ResourceNotFoundException("No root categories found");
        }

        int totalDeactivated = 0;

        // For each root, deactivate recursively all children (but NOT the root itself)
        for (Category root : rootCategories) {
            logger.info("Root category '{}' remains unchanged (active: {})", root.getName(), root.isActive());

            if (root.getChildren() != null && !root.getChildren().isEmpty()) {
                int deactivatedInBranch = deactivateChildrenRecursively(root.getChildren());
                totalDeactivated += deactivatedInBranch;
                logger.info("Deactivated {} children for root '{}'", deactivatedInBranch, root.getName());
            }
        }

        logger.info("Total child categories deactivated: {}", totalDeactivated);

        // Return all updated categories as DTO
        List<Category> updatedCategories = categoryRepository.findAll();
        return customMapper.toDTORecursiveList(updatedCategories);
    }

    @Override
    @Transactional
    public List<CategoryDTO> activateAllCategories() {
        // Find only root categories (those without a parent)
        List<Category> rootCategories = categoryRepository.findAll().stream()
                .filter(category -> category.getParent() == null)
                .collect(Collectors.toList());

        if (rootCategories.isEmpty()) {
            throw new ResourceNotFoundException("No root categories found");
        }

        int totalActivated = 0;

        // For each root, activate recursively all children (but NOT the root itself)
        for (Category root : rootCategories) {
            logger.info("Root category '{}' remains unchanged (active: {})", root.getName(), root.isActive());

            if (root.getChildren() != null && !root.getChildren().isEmpty()) {
                int activatedInBranch = activateChildrenRecursively(root.getChildren());
                totalActivated += activatedInBranch;
                logger.info("Activated {} children for root '{}'", activatedInBranch, root.getName());
            }
        }

        logger.info("Total child categories activated: {}", totalActivated);

        // Return all updated categories as DTO
        List<Category> updatedCategories = categoryRepository.findAll();
        return customMapper.toDTORecursiveList(updatedCategories);
    }

    @Override
    public CategoryDTO findCategoryByPath(String path) {
        String[] levels = path.split("/");
        Category parent = null;
        Category current = null;

        for (String level : levels) {
            if (parent == null) {
                current = categoryRepository.findByNameAndParentIsNull(level)
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + level));
            } else {
                current = categoryRepository.findByNameAndParent(level, parent)
                        .orElseThrow(() -> new ResourceNotFoundException("Subcategory not found: " + level));
            }
            parent = current;
        }

        return customMapper.toDTORecursive(current);
    }

    /**
     * Finds a category by its link identifier.
     * 
     * @param link the link string
     * @return the CategoryDTO
     */
    public CategoryDTO findCategoryByLink(String link) {
        return categoryRepository.findByLink(link)
                .map(customMapper::toDTORecursive)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found for link: " + link));
    }

    /**
     * Recursively activates children categories.
     * 
     * @param children the children set
     * @return count of activated categories
     */
    private int activateChildrenRecursively(Set<Category> children) {
        if (children == null || children.isEmpty())
            return 0;

        int count = 0;
        for (Category child : children) {
            // Activate only if not already active
            if (!child.isActive()) {
                child.setActive(true);
                categoryRepository.save(child);
                count++;
            }
            // Recursively sum children's count
            count += activateChildrenRecursively(child.getChildren());
        }
        return count;
    }

    /**
     * Recursively deactivates children categories.
     * 
     * @param children the children set
     * @return count of deactivated categories
     */
    private int deactivateChildrenRecursively(Set<Category> children) {
        if (children == null || children.isEmpty())
            return 0;

        int count = 0;
        for (Category child : children) {
            // Deactivate only if not already inactive
            if (child.isActive()) {
                child.setActive(false);
                categoryRepository.save(child);
                count++;
            }
            // Recursively sum children's count
            count += deactivateChildrenRecursively(child.getChildren());
        }
        return count;
    }

    @Override
    @Transactional
    @Deprecated
    public void deleteAllCategories() {
        // this.deleteAllCategoriesWithConstraints();
    }

    /*
     * @Transactional
     * private void deleteAllCategoriesWithConstraints() {
     * // 1. Disabilita temporaneamente i vincoli FK
     * disableForeignKeyChecks();
     * 
     * // 2. Cancellazione efficiente con batch
     * deleteAllInBatch();
     * 
     * // 3. Ripristina i vincoli
     * enableForeignKeyChecks();
     * 
     * // 4. Reset degli ID (opzionale)
     * resetAutoIncrement();
     * }
     * 
     * private void disableForeignKeyChecks() {
     * entityManager.createNativeQuery(
     * "SET FOREIGN_KEY_CHECKS = 0" // MySQL/MariaDB
     * // "SET REFERENTIAL_INTEGRITY FALSE" // H2
     * // "ALTER TABLE category DISABLE TRIGGER ALL" // PostgreSQL
     * ).executeUpdate();
     * }
     * 
     * private void deleteAllInBatch() {
     * Query query = entityManager.createQuery("DELETE FROM Category c");
     * query.executeUpdate();
     * }
     * 
     * private void enableForeignKeyChecks() {
     * entityManager.createNativeQuery(
     * "SET FOREIGN_KEY_CHECKS = 1" // MySQL/MariaDB
     * // "SET REFERENTIAL_INTEGRITY TRUE" // H2
     * // "ALTER TABLE category ENABLE TRIGGER ALL" // PostgreSQL
     * ).executeUpdate();
     * }
     * 
     * private void resetAutoIncrement() {
     * entityManager.createNativeQuery(
     * "ALTER TABLE category AUTO_INCREMENT = 1" // MySQL
     * // "ALTER SEQUENCE category_id_seq RESTART WITH 1" // PostgreSQL
     * ).executeUpdate();
     * }
     */

}
