package com.mady.springboot_be.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.Product;

/**
 * Repository interface for Product entity operations.
 * 
 * Provides CRUD operations and custom queries for product management including:
 * - Soft delete counting and filtering (active/deleted)
 * - Product retrieval with active images (using EntityGraph)
 * - Dashboard statistics for top selling products and sales trends
 * - Dynamic query support via JpaSpecificationExecutor for advanced search
 * 
 * The repository supports both soft delete (active flag) and hard delete
 * operations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

        /**
         * Counts active (not deleted) products.
         * 
         * @return count of active products
         */
        Long countByNotDeleted();

        /**
         * Counts deleted (inactive) products.
         * 
         * @return count of deleted products
         */
        Long countByDeleted();

        /**
         * Finds an active product by its ID (not soft-deleted).
         * 
         * @param productId the ID of the product
         * @return Optional containing the product if found and active
         */
        Optional<Product> findByIdByNotDeleted(Long productId);

        /**
         * Finds all active products with eager loading of advertisement and creator.
         * Uses EntityGraph to prevent N+1 query problems.
         * 
         * The associated named query uses JOIN FETCH to load:
         * - advertisement (the advertisement associated with the product)
         * - createdBy (the user who created the advertisement)
         * 
         * @return list of active products with advertisement and creator loaded
         */
        @EntityGraph(attributePaths = {
                        "advertisement",
                        "advertisement.createdBy",
        })
        List<Product> findByNotDeletedList();

        /**
         * Finds all active products by advertisement type.
         * 
         * The type is a hierarchical string representing the category path.
         * Examples: "Marketplace/Art/Paintings", "Marketplace/Electronics/Phones"
         * 
         * @param adType the advertisement type path
         * @return list of active products matching the advertisement type
         */
        List<Product> findByNotDeletedAndAdvertisementType(@Param("adType") String adType);

        /**
         * Finds all deleted (inactive) products.
         * 
         * @return list of deleted products
         */
        List<Product> findByDeletedList();

        /**
         * Finds all active products created by a specific user.
         * 
         * @param userId the ID of the user
         * @return list of active products associated with the user
         */
        List<Product> findByUserId(Long userId);

        /**
         * Finds a product by ID with its active images eagerly loaded.
         * 
         * The associated named query uses LEFT JOIN FETCH to load images,
         * but only includes active images (i.active = true).
         * Products without images are still returned (LEFT JOIN).
         * 
         * @param productId the ID of the product
         * @return Optional containing the product with active images if found
         */
        @Query(name = "Product.findByIdWithActiveImages", nativeQuery = false)
        Optional<Product> findByIdWithActiveImages(@Param("productId") Long productId);

        // ========== DASHBOARD QUERIES ==========

        /**
         * Retrieves top selling products for dashboard statistics.
         * 
         * Returns array of objects containing:
         * - productId: the product ID
         * - title: the advertisement title
         * - categoryName: the category name
         * - unitsSold: total quantity sold
         * - revenue: total revenue from sales
         * 
         * Only includes payments with status COMPLETED.
         * 
         * @param startDate start of the date range (inclusive)
         * @param endDate   end of the date range (inclusive)
         * @return list of Object arrays with product sales data
         */
        @Query("SELECT p.productId, a.title, c.name, " +
                        "SUM(oi.quantity), SUM(oi.unitPrice * oi.quantity) " +
                        "FROM Product p " +
                        "JOIN p.advertisement a " +
                        "JOIN a.category c " +
                        "JOIN OrderItem oi ON oi.product.productId = p.productId " +
                        "JOIN oi.order o " +
                        "JOIN Payment pay ON pay.order.orderId = o.orderId " +
                        "WHERE pay.status = 'COMPLETED' " +
                        "AND pay.paymentDate BETWEEN :startDate AND :endDate " +
                        "AND p.active = true " +
                        "GROUP BY p.productId, a.title, c.name " +
                        "ORDER BY SUM(oi.unitPrice * oi.quantity) DESC")
        List<Object[]> getTopSellingProducts(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        /**
         * Counts product sales within a date range for trend analysis.
         * 
         * Used to calculate sales trends by comparing current period with previous
         * period.
         * Only includes payments with status COMPLETED.
         * 
         * @param productId the ID of the product
         * @param startDate start of the date range (inclusive)
         * @param endDate   end of the date range (inclusive)
         * @return total quantity sold of the product in the period
         */
        @Query("SELECT COUNT(oi) FROM OrderItem oi " +
                        "JOIN oi.order o " +
                        "JOIN Payment pay ON pay.order.orderId = o.orderId " +
                        "WHERE oi.product.productId = :productId " +
                        "AND pay.status = 'COMPLETED' " +
                        "AND pay.paymentDate BETWEEN :startDate AND :endDate")
        Long getProductSalesCount(
                        @Param("productId") Long productId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

}
