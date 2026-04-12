package com.mady.springboot_be.dtos;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Transfer Object for product information.
 * 
 * Represents a product with its price, condition, stock quantity,
 * and relationships to address, advertisement, and images.
 * 
 * Maintains bidirectional relationship with ImageDTO using safe methods
 * (addImage, removeImage) that prevent infinite loops and ensure
 * both sides of the relationship stay synchronized.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ProductDTO implements Serializable {

    private static final long serialVersionUID = 202504220003L;

    private Long productId;
    private BigDecimal price;
    private boolean active;
    private String condition;
    private Integer stockQuantity;
    private AddressDTO address;
    private AdvertisementDTO advertisement;
    private List<ImageDTO> images = new ArrayList<>();

    /**
     * Default constructor.
     */
    public ProductDTO() {
    }

    /**
     * Constructs a ProductDTO with a price. Active status is set to true by
     * default.
     * 
     * @param price the product price
     */
    public ProductDTO(BigDecimal price) {
        this.price = price;
        this.active = true;
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
     * Returns whether the product is active.
     * 
     * @return true if active, false otherwise
     */
    public boolean isActive() {
        return this.active;
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
     * Sets the active status.
     * 
     * @param active true for active, false for soft-deleted
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
    public AdvertisementDTO getAdvertisement() {
        return this.advertisement;
    }

    /**
     * Sets the associated advertisement.
     * 
     * @param advertisement the advertisement to set
     */
    public void setAdvertisement(AdvertisementDTO advertisement) {
        this.advertisement = advertisement;
    }

    /**
     * Returns the list of product images.
     * 
     * @return the list of image DTOs
     */
    public List<ImageDTO> getImages() {
        return images;
    }

    /**
     * Sets the list of product images.
     * 
     * @param images the images to set
     */
    public void setImages(List<ImageDTO> images) {
        this.images = images;
    }

    /**
     * Adds an image to the product, maintaining bidirectional relationship.
     * Prevents duplicate images and ensures the image references this product.
     * 
     * @param image the image to add
     */
    public void addImage(ImageDTO image) {
        if (image != null && !images.contains(image)) {
            images.add(image);
            image.setProduct(this); // Use internal setter
        }
    }

    /**
     * Removes an image from the product, maintaining bidirectional relationship.
     * 
     * @param image the image to remove
     */
    public void removeImage(ImageDTO image) {
        if (image != null && images.contains(image)) {
            images.remove(image);
            image.setProduct(null);
        }
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
     * Returns a string representation of the ProductDTO.
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
