package com.mady.springboot_be.dtos.sample_dtos;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

import com.mady.springboot_be.dtos.AddressDTO;

/**
 * Complete Data Transfer Object for product information.
 * 
 * Contains all product details including:
 * - Basic product info (ID, price, active status, condition, stock)
 * - Associated address (where product is located)
 * - Associated advertisement (title, description, type, agency info)
 * - All product images (as Base64 data URLs)
 * 
 * Used when returning full product data to the frontend for display
 * in product detail pages, cart items, and order items.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ProductCompleteDto implements Serializable {

    private static final long serialVersionUID = 2025042200011L;

    private Long productId;
    private BigDecimal price;
    private boolean active;
    private String condition;
    private Integer stockQuantity;

    private AddressDTO address;
    private AdvertisementCompleteDto advertisement;
    private List<ImageCompleteDto> images;

    /**
     * Default constructor.
     */
    public ProductCompleteDto() {
    }

    /**
     * Constructs a ProductCompleteDto with all fields.
     * 
     * @param productId     the product ID
     * @param price         the product price
     * @param active        whether the product is active
     * @param condition     the product condition (e.g., new, used)
     * @param stockQuantity available stock quantity
     * @param address       associated address
     * @param advertisement associated advertisement
     * @param images        list of product images
     */
    public ProductCompleteDto(Long productId, BigDecimal price, boolean active, String condition, Integer stockQuantity,
            AddressDTO address, AdvertisementCompleteDto advertisement, List<ImageCompleteDto> images) {
        this.productId = productId;
        this.price = price;
        this.active = active;
        this.condition = condition;
        this.address = address;
        this.advertisement = advertisement;
        this.images = images;
    }

    /**
     * Returns the product ID.
     * 
     * @return the product ID
     */
    public Long getProductId() {
        return this.productId;
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
     * Returns the product price.
     * 
     * @return the price
     */
    public BigDecimal getPrice() {
        return this.price;
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
     * Returns whether the product is active (getter for frameworks).
     * 
     * @return true if active, false otherwise
     */
    public boolean getActive() {
        return this.active;
    }

    /**
     * Sets whether the product is active.
     * 
     * @param active the active status to set
     */
    public void setActive(boolean active) {
        this.active = active;
    }

    /**
     * Returns the associated address.
     * 
     * @return the address DTO
     */
    public AddressDTO getAddress() {
        return this.address;
    }

    /**
     * Sets the associated address.
     * 
     * @param address the address to set
     */
    public void setAddress(AddressDTO address) {
        this.address = address;
    }

    /**
     * Returns the associated advertisement.
     * 
     * @return the advertisement DTO
     */
    public AdvertisementCompleteDto getAdvertisement() {
        return this.advertisement;
    }

    /**
     * Sets the associated advertisement.
     * 
     * @param advertisement the advertisement to set
     */
    public void setAdvertisement(AdvertisementCompleteDto advertisement) {
        this.advertisement = advertisement;
    }

    /**
     * Returns the list of product images.
     * 
     * @return list of image DTOs with Base64 data
     */
    public List<ImageCompleteDto> getImages() {
        return this.images;
    }

    /**
     * Sets the list of product images.
     * 
     * @param images the images to set
     */
    public void setImages(List<ImageCompleteDto> images) {
        this.images = images;
    }

    /**
     * Fluent setter for productId.
     * 
     * @param productId the product ID
     * @return this instance for method chaining
     */
    public ProductCompleteDto productId(Long productId) {
        setProductId(productId);
        return this;
    }

    /**
     * Fluent setter for price.
     * 
     * @param price the price
     * @return this instance for method chaining
     */
    public ProductCompleteDto price(BigDecimal price) {
        setPrice(price);
        return this;
    }

    /**
     * Fluent setter for active status.
     * 
     * @param active the active status
     * @return this instance for method chaining
     */
    public ProductCompleteDto active(boolean active) {
        setActive(active);
        return this;
    }

    /**
     * Fluent setter for address.
     * 
     * @param address the address DTO
     * @return this instance for method chaining
     */
    public ProductCompleteDto address(AddressDTO address) {
        setAddress(address);
        return this;
    }

    /**
     * Fluent setter for advertisement.
     * 
     * @param advertisement the advertisement DTO
     * @return this instance for method chaining
     */
    public ProductCompleteDto advertisement(AdvertisementCompleteDto advertisement) {
        setAdvertisement(advertisement);
        return this;
    }

    /**
     * Fluent setter for images.
     * 
     * @param images the list of image DTOs
     * @return this instance for method chaining
     */
    public ProductCompleteDto images(List<ImageCompleteDto> images) {
        setImages(images);
        return this;
    }

    /**
     * Returns whether the product is active.
     * 
     * @return true if active, false otherwise
     */
    public boolean isActive() {
        return this.active;
    }

    /**
     * Returns the product condition.
     * 
     * @return the condition (e.g., new, used, refurbished)
     */
    public String getCondition() {
        return this.condition;
    }

    /**
     * Sets the product condition.
     * 
     * @param condition the condition to set
     */
    public void setCondition(String condition) {
        this.condition = condition;
    }

    /**
     * Returns the available stock quantity.
     * 
     * @return the stock quantity
     */
    public Integer getStockQuantity() {
        return this.stockQuantity;
    }

    /**
     * Sets the available stock quantity.
     * 
     * @param stockQuantity the stock quantity to set
     */
    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    /**
     * Returns a string representation of the ProductCompleteDto.
     * 
     * @return string with all product fields
     */
    @Override
    public String toString() {
        return "{" +
                " productId='" + getProductId() + "'" +
                ", price='" + getPrice() + "'" +
                ", active='" + getActive() + "'" +
                ", condition='" + getCondition() + "'" +
                ", stockQuantity='" + getStockQuantity() + "'" +
                ", address='" + getAddress() + "'" +
                ", advertisement='" + getAdvertisement() + "'" +
                ", images=" + (images != null ? "ImageDTO[" + images.size() + "]" : "null") +
                "}";
    }
}
