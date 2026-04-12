package com.mady.springboot_be.dtos;

import java.io.Serializable;
import java.util.Base64;

/**
 * Data Transfer Object for product image information.
 * 
 * Represents an image associated with a product, containing the raw image bytes
 * and relationship to the product. Maintains bidirectional relationship with
 * ProductDTO using safe setters that prevent infinite loops.
 * 
 * The image bytes are stored as byte array in the database and can be converted
 * to Base64 for frontend display when needed.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ImageDTO implements Serializable {

	private static final long serialVersionUID = 202504220004L;

	private Long imageId;
	private byte[] picByte;
	private boolean active;
	private ProductDTO product;

	/**
	 * Default constructor.
	 */
	public ImageDTO() {
	}

	/**
	 * Constructs an ImageDTO with image data and associated product.
	 * Active status is set to true by default.
	 * 
	 * @param picByte the image bytes
	 * @param active  whether the image is active
	 * @param product the associated product DTO
	 */
	public ImageDTO(byte[] picByte, boolean active, ProductDTO product) {
		this.picByte = picByte;
		this.setProduct(product);
		this.active = true;
	}

	/**
	 * Returns the image ID.
	 * 
	 * @return the image ID
	 */
	public Long getImageId() {
		return this.imageId;
	}

	/**
	 * Sets the image ID.
	 * 
	 * @param imageId the image ID to set
	 */
	public void setImageId(Long imageId) {
		this.imageId = imageId;
	}

	/**
	 * Returns the raw image bytes.
	 * 
	 * @return the image byte array
	 */
	public byte[] getPicByte() {
		return this.picByte;
	}

	/**
	 * Sets the raw image bytes.
	 * 
	 * @param picByte the image byte array to set
	 */
	public void setPicByte(byte[] picByte) {
		this.picByte = picByte;
	}

	/**
	 * Returns whether the image is active.
	 * 
	 * @return true if active, false otherwise
	 */
	public boolean isActive() {
		return this.active;
	}

	/**
	 * Returns whether the image is active (getter for frameworks).
	 * 
	 * @return true if active, false otherwise
	 */
	public boolean getActive() {
		return this.active;
	}

	/**
	 * Sets the active status of the image.
	 * 
	 * @param active true to set as active, false to set as inactive
	 */
	public void setActive(boolean active) {
		this.active = active;
	}

	/**
	 * Returns the associated product.
	 * 
	 * @return the product DTO
	 */
	public ProductDTO getProduct() {
		return product;
	}

	/**
	 * Sets the associated product using safe bidirectional relationship management.
	 * Prevents infinite loops by removing this image from the old product
	 * before adding it to the new product.
	 * 
	 * @param product the product to associate
	 */
	public void setProduct(ProductDTO product) {
		if (this.product != null) {
			this.product.removeImage(this);
		}
		if (product != null) {
			product.addImage(this);
		}
	}

	/**
	 * Returns a string representation of the ImageDTO.
	 * Image bytes are Base64-encoded for readability.
	 * 
	 * @return string with all image fields
	 */
	@Override
	public String toString() {
		return "{" +
				" imageId='" + getImageId() + "'" +
				", picByte='" + (getPicByte() != null ? Base64.getEncoder().encodeToString(getPicByte()) : "null") + "'"
				+
				", active='" + isActive() + "'" +
				", product='" + getProduct() + "'" +
				"}";
	}

}
