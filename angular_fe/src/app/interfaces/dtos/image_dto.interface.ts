import { ProductDTO } from "./product_dto.interface";

/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) for images associated with products.
 * Includes image data in Base64 format, activation status, and associated product information.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface ImageDTO
 * @property {number} imageId - Unique identifier of the image.
 * @property {string} picByte - Image data encoded as a Base64 string.
 * @property {boolean} active - Indicates whether the image is active.
 * @property {ProductDTO} product - Product associated with this image.
 */
export interface ImageDTO {
    imageId: number;
    picByte: string; // Se il byte array è passato come stringa Base64
    active: boolean;
    product: ProductDTO;
  }