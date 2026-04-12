/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) used to add a product to the shopping cart.
 * Contains the identifier of the product and the quantity to add.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface AddToCartRequestDTO
 * @property {number} productId - Unique identifier of the product to be added to the cart.
 * @property {number} quantity - Number of units of the product to add.
 */
export interface AddToCartRequestDTO {
  productId: number;
  quantity: number;
}