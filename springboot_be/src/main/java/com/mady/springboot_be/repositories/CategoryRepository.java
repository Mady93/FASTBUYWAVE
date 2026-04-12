package com.mady.springboot_be.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.Category;

/**
 * Repository interface for Category entity operations.
 * 
 * Provides CRUD operations and custom queries for hierarchical category
 * management:
 * - Finding categories by name (active only)
 * - Counting active/deleted categories
 * - Retrieving root categories with their children (eager loading)
 * - Finding categories by ID (active or deleted)
 * - Finding categories by name and parent (for recursive save)
 * - Finding categories by URL-friendly link
 * - Dashboard statistics for category sales
 * 
 * The repository uses named queries defined in the Category entity for complex
 * hierarchical queries with JOIN FETCH to prevent N+1 problems.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

  /**
   * Checks if an active category exists with the given name.
   * 
   * @param name the category name
   * @return true if exists, false otherwise
   */
  boolean existsByNameActive(String name);

  /**
   * Finds an active category by name (with parent and children fetched).
   * 
   * @param name the category name
   * @return the Category entity, or null if not found
   */
  Category findByName(String name);

  /**
   * Counts active root categories (excluding children).
   * 
   * @return count of active root categories
   */
  long countByNotDeleted();

  /**
   * Finds all active root categories with their children eagerly loaded.
   * 
   * The query uses LEFT JOIN FETCH to load children in the same query,
   * preventing N+1 problems when accessing the children collection.
   * 
   * @return list of active root categories with children eagerly fetched
   */
  List<Category> findByNotDeletedList();

  /**
   * Finds all deleted (inactive) categories with their children eagerly loaded.
   * 
   * @return list of deleted categories with children
   */
  @EntityGraph(attributePaths = { "children" })
  List<Category> findByDeletedList();

  /**
   * Finds an active category by its ID with parent and children eagerly loaded.
   * 
   * @param categoryId the category ID
   * @return Optional containing the category if found and active
   */
  Optional<Category> findByIdByNotDeleted(@Param("categoryId") Long categoryId);

  /**
   * Finds a deleted category by its ID with parent and children eagerly loaded.
   * 
   * @param categoryId the category ID
   * @return Optional containing the category if found and deleted
   */
  Optional<Category> findByIdDeleted(@Param("categoryId") Long categoryId);

  /**
   * Counts deleted (inactive) root categories.
   * 
   * @return count of deleted root categories
   */
  long countByDeleted();

  /**
   * Finds all root categories (parent is null) with their children.
   * 
   * @return list of all root categories with children
   */
  List<Category> findAllCategories();

  /**
   * Finds a category by name and parent (for recursive save operations).
   * Checks for existing category with same name under same parent to prevent
   * duplicates.
   * 
   * @param name   the category name
   * @param parent the parent category (null for root)
   * @return Optional containing the category if found
   */
  Optional<Category> findByNameAndParent(@Param("name") String name, @Param("parent") Category parent);

  /**
   * Finds a root category by name (parent is null).
   * 
   * @param name the category name
   * @return Optional containing the root category if found
   */
  Optional<Category> findByNameAndParentIsNull(@Param("name") String name);

  /**
   * Finds an active category by its URL-friendly link identifier.
   * 
   * @param link the link string
   * @return Optional containing the category if found
   */
  @Query("SELECT c FROM Category c WHERE c.link = :link AND c.active = true")
  Optional<Category> findByLink(@Param("link") String link);

  /**
   * Finds all root categories with their children eagerly loaded.
   * Used for building the complete category tree.
   * 
   * @return list of root categories with children
   */
  List<Category> findAllRootsWithChildren();

  // ========== DASHBOARD QUERIES ==========

  /**
   * Retrieves category sales statistics for dashboard.
   * 
   * Returns array of objects containing:
   * - categoryId: the category ID
   * - name: the category name
   * - productCount: number of distinct products sold in this category
   * - orderCount: number of orders containing products from this category
   * - revenue: total revenue from this category
   * 
   * Only includes payments with status COMPLETED.
   * 
   * @param startDate start of the date range (inclusive)
   * @param endDate   end of the date range (inclusive)
   * @return list of Object arrays with category sales data
   */
  @Query("SELECT c.categoryId, c.name, " +
      "COUNT(DISTINCT p.productId), " +
      "COUNT(DISTINCT o.orderId), " +
      "SUM(oi.unitPrice * oi.quantity) " +
      "FROM Category c " +
      "JOIN Advertisement a ON a.category.categoryId = c.categoryId " +
      "JOIN Product p ON p.advertisement.advertisementId = a.advertisementId " +
      "JOIN OrderItem oi ON oi.product.productId = p.productId " +
      "JOIN Order o ON oi.order.orderId = o.orderId " +
      "JOIN Payment pay ON pay.order.orderId = o.orderId " +
      "WHERE pay.status = 'COMPLETED' " +
      "AND pay.paymentDate BETWEEN :startDate AND :endDate " +
      "AND c.active = true " +
      "GROUP BY c.categoryId, c.name " +
      "ORDER BY SUM(oi.unitPrice * oi.quantity) DESC")
  List<Object[]> getCategorySalesStats(
      @Param("startDate") LocalDateTime startDate,
      @Param("endDate") LocalDateTime endDate);
}
