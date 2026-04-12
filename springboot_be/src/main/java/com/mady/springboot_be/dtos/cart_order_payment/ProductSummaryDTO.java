
package com.mady.springboot_be.dtos.cart_order_payment;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Data Transfer Object for product summary information.
 * 
 * Contains essential product information for display in cart items,
 * order items, and other contexts where full product details are not needed.
 * 
 * Fields include:
 * - Basic product info (ID, title, price, condition, stock quantity)
 * - First product image as Base64 data URL
 * - Product country of origin from associated address
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ProductSummaryDTO implements Serializable {

    private static final long serialVersionUID = 2025042200032L;
    private Long productId;
    private String title;
    private BigDecimal price;
    private String condition;
    private Integer stockQuantity;
    private String imageUrl; // First product image as Base64 data URL
    private String productCountry;

    /**
     * Default constructor.
     */
    public ProductSummaryDTO() {
    }

    /**
     * Returns the product ID.
     * 
     * @return the product ID
     */
    public Long getProductId() {
        return productId;
    }

    /**
     * Sets the product ID.
     * 
     * @param productId the product ID to set
     */
    public void setProductId(Long productId) {
        this.productId = productId;
    }

    /**
     * Returns the product title from the associated advertisement.
     * 
     * @return the product title
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the product title.
     * 
     * @param title the product title to set
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Returns the product price.
     * 
     * @return the price
     */
    public BigDecimal getPrice() {
        return price;
    }

    /**
     * Sets the product price.
     * 
     * @param price the price to set
     */
    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    /**
     * Returns the product condition (e.g., "New", "Used").
     * 
     * @return the product condition
     */
    public String getCondition() {
        return condition;
    }

    /**
     * Sets the product condition.
     * 
     * @param condition the product condition to set
     */
    public void setCondition(String condition) {
        this.condition = condition;
    }

    /**
     * Returns the available stock quantity for the product.
     * 
     * @return the stock quantity
     */
    public Integer getStockQuantity() {
        return stockQuantity;
    }

    /**
     * Sets the available stock quantity for the product.
     * 
     * @param stockQuantity the stock quantity to set
     */
    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    /**
     * Returns the URL of the first product image as a Base64 data URL.
     * 
     * @return the image URL
     */
    public String getImageUrl() {
        return imageUrl;
    }

    /**
     * Sets the URL of the first product image as a Base64 data URL.
     * 
     * @param imageUrl the image URL to set
     */
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    /**
     * Returns the country of origin for the product from the associated address.
     * 
     * @return the product country
     */
    public String getProductCountry() {
        return this.productCountry;
    }

    /**
     * Sets the country of origin for the product from the associated address.
     * 
     * @param productCountry the product country to set
     */
    public void setProductCountry(String productCountry) {
        this.productCountry = productCountry;
    }

}