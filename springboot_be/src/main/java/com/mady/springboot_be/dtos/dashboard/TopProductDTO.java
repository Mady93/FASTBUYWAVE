package com.mady.springboot_be.dtos.dashboard;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Data Transfer Object for top selling products in dashboard.
 * 
 * Contains product sales performance data including:
 * - Product ID, name, category, and first image URL
 * - Units sold and total revenue generated
 * - Trend analysis (up/down/stable) with percentage change
 * 
 * Used in the "Top Products" widget on the dashboard to display
 * best-selling items with performance indicators.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class TopProductDTO implements Serializable {

    private static final long serialVersionUID = 2025042200042L;

    private Long id;
    private String name;
    private String imageUrl;
    private Long unitsSold;
    private BigDecimal revenue;
    private String trend; // "up", "down", "stable"
    private Double trendPercentage;
    private String categoryName;

    /**
     * Constructs a TopProductDTO with basic product sales data.
     * 
     * @param id           the product ID
     * @param name         the product name
     * @param categoryName the category name this product belongs to
     * @param unitsSold    total units sold in the period
     * @param revenue      total revenue generated in the period
     */
    public TopProductDTO(Long id, String name, String categoryName,
            Long unitsSold, BigDecimal revenue) {
        this.id = id;
        this.name = name;
        this.categoryName = categoryName;
        this.unitsSold = unitsSold;
        this.revenue = revenue;
    }

    /**
     * Returns the product ID.
     * 
     * @return the product ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the product ID.
     * 
     * @param id the product ID to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Returns the product name.
     * 
     * @return the product name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the product name.
     * 
     * @param name the product name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the product image URL (Base64 data URL).
     * 
     * @return the image URL, or null if no image exists
     */
    public String getImageUrl() {
        return imageUrl;
    }

    /**
     * Sets the product image URL (Base64 data URL).
     * 
     * @param imageUrl the image URL to set, or null if no image exists
     */
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    /**
     * Returns the total units sold in the period.
     * 
     * @return units sold count
     */
    public Long getUnitsSold() {
        return unitsSold;
    }

    /**
     * Sets the total units sold in the period.
     * 
     * @param unitsSold the units sold count to set
     */
    public void setUnitsSold(Long unitsSold) {
        this.unitsSold = unitsSold;
    }

    /**
     * Returns the total revenue generated in the period.
     * 
     * @return the revenue
     */
    public BigDecimal getRevenue() {
        return revenue;
    }

    /**
     * Sets the total revenue generated in the period.
     * 
     * @param revenue the revenue to set
     */
    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    /**
     * Returns the sales trend direction.
     * 
     * @return "up" for growth, "down" for decline, "stable" for no change
     */
    public String getTrend() {
        return trend;
    }

    /**
     * Sets the sales trend direction.
     * 
     * @param trend "up" for growth, "down" for decline, "stable" for no change
     */
    public void setTrend(String trend) {
        this.trend = trend;
    }

    /**
     * Returns the trend percentage change.
     * 
     * @return percentage change (positive for growth, negative for decline)
     */
    public Double getTrendPercentage() {
        return trendPercentage;
    }

    /**
     * Sets the trend percentage change.
     * 
     * @param trendPercentage percentage change to set (positive for growth,
     *                        negative for decline)
     */
    public void setTrendPercentage(Double trendPercentage) {
        this.trendPercentage = trendPercentage;
    }

    /**
     * Returns the category name.
     * 
     * @return the category name
     */
    public String getCategoryName() {
        return categoryName;
    }

    /**
     * Sets the category name.
     * 
     * @param categoryName the category name to set
     */
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}