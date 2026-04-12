/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) for creating a product.
 * Contains pricing information and activation status for the product.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface ProductCreateDTO
 * @property {number} price - Price of the product (float/double representation).
 * @property {boolean} active - Indicates whether the product is active and visible.
 */
export interface ProductCreateDTO {
    price: number; // BigDecimal in Java è un float/double in TypeScript
    active: boolean;
  }