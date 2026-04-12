package com.mady.springboot_be.dtos.dashboard;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Data Transfer Object for category sales statistics in dashboard.
 * 
 * Contains aggregated sales data for a product category including:
 * - Category ID and name
 * - Total revenue generated from products in this category
 * - Number of distinct products sold in this category
 * - Number of orders containing products from this category
 * - Percentage of total revenue across all categories
 * 
 * Used in dashboard charts to display category sales distribution.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class CategoryStatsDTO implements Serializable {

    private static final long serialVersionUID = 2025042200035L;

    private Long id;
    private String name;
    private BigDecimal revenue;
    private Long productCount;
    private Long orderCount;
    private Double percentageOfTotal;

    /**
     * Constructs a CategoryStatsDTO with basic category sales data.
     * 
     * @param id           the category ID
     * @param name         the category name
     * @param revenue      total revenue from this category
     * @param productCount number of distinct products sold in this category
     * @param orderCount   number of orders containing products from this category
     */
    public CategoryStatsDTO(Long id, String name, BigDecimal revenue,
            Long productCount, Long orderCount) {
        this.id = id;
        this.name = name;
        this.revenue = revenue;
        this.productCount = productCount;
        this.orderCount = orderCount;
    }

    /**
     * Returns the category ID.
     * 
     * @return the category ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the category ID.
     * 
     * @param id the category ID to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Returns the category name.
     * 
     * @return the category name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the category name.
     * 
     * @param name the category name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the total revenue from this category.
     * 
     * @return the revenue
     */
    public BigDecimal getRevenue() {
        return revenue;
    }

    /**
     * Sets the total revenue from this category.
     * 
     * @param revenue the revenue to set
     */
    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    /**
     * Returns the number of distinct products sold in this category.
     * 
     * @return the product count
     */
    public Long getProductCount() {
        return productCount;
    }

    /**
     * Sets the number of distinct products sold in this category.
     * 
     * @param productCount the product count to set
     */
    public void setProductCount(Long productCount) {
        this.productCount = productCount;
    }

    /**
     * Returns the number of orders containing products from this category.
     * 
     * @return the order count
     */
    public Long getOrderCount() {
        return orderCount;
    }

    /**
     * Sets the number of orders containing products from this category.
     * 
     * @param orderCount the order count to set
     */
    public void setOrderCount(Long orderCount) {
        this.orderCount = orderCount;
    }

    /**
     * Returns the percentage of total revenue across all categories.
     * 
     * @return the percentage of total revenue
     */
    public Double getPercentageOfTotal() {
        return percentageOfTotal;
    }

    /**
     * Sets the percentage of total revenue across all categories.
     * 
     * @param percentageOfTotal the percentage of total revenue to set
     */
    public void setPercentageOfTotal(Double percentageOfTotal) {
        this.percentageOfTotal = percentageOfTotal;
    }
}