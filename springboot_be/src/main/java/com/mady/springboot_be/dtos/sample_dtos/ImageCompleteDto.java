package com.mady.springboot_be.dtos.sample_dtos;

import java.io.Serializable;

/**
 * Data Transfer Object for product image information.
 * 
 * Contains image ID and Base64-encoded image data for direct use
 * in HTML img tags (data:image/...;base64,...).
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ImageCompleteDto implements Serializable {

    private static final long serialVersionUID = 2025042200013L;

    private Long imageId;
    private String picByte; // Base64-encoded image data
    private Boolean active;

    /**
     * Default constructor.
     */
    public ImageCompleteDto() {
    }

    /**
     * Constructs an ImageCompleteDto with all fields.
     * 
     * @param imageId the image ID
     * @param picByte the Base64-encoded image data
     * @param active  whether the image is active
     */
    public ImageCompleteDto(Long imageId, String picByte, Boolean active) {
        this.imageId = imageId;
        this.picByte = picByte;
        this.active = active;
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
     * Returns the Base64-encoded image data.
     * 
     * @return the Base64 string
     */
    public String getPicByte() {
        return this.picByte;
    }

    /**
     * Sets the Base64-encoded image data.
     * 
     * @param picByte the Base64 string to set
     */
    public void setPicByte(String picByte) {
        this.picByte = picByte;
    }

    /**
     * Returns whether the image is active.
     * 
     * @return true if active, false otherwise
     */
    public Boolean getActive() {
        return this.active;
    }

    /**
     * Sets whether the image is active.
     * 
     * @param active true to set as active, false otherwise
     */
    public void setActive(Boolean active) {
        this.active = active;
    }

    /**
     * Returns a string representation of the ImageCompleteDto.
     * 
     * @return string with all image fields
     */
    @Override
    public String toString() {
        return "{" +
                " imageId='" + getImageId() + "'" +
                ", picByte='" + getPicByte() + "'" +
                ", active='" + getActive() + "'" +
                "}";
    }

}
