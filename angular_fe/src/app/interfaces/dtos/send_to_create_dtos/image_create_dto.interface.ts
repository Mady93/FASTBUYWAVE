/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing an image for advertisements or products.
 * Contains the image data and active status.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface ImageDTO
 * @property {string} picByte - Image data encoded as a Base64 string.
 * @property {boolean} active - Indicates whether the image is currently active.
 */
export interface ImageDTO {
    picByte: string; // Se il byte array è passato come stringa Base64
    active: boolean;
  }