import { ProductSummaryDTO } from "./productSummaryDTO.interface";

/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing a single item in a shopping cart.
 * Contains information about the product, quantity, pricing, subtotal, and metadata about when it was added.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface CartItemDTO
 * @property {number} cartItemId - Unique identifier of the cart item.
 * @property {number} quantity - Quantity of the product added to the cart.
 * @property {number} unitPrice - Price per single unit of the product.
 * @property {number} subtotal - Total price for this item (unitPrice * quantity).
 * @property {string} addedAt - ISO string representing the date/time when the item was added to the cart.
 * @property {ProductSummaryDTO} product - Summary information about the product.
 */
export interface CartItemDTO {
  cartItemId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  addedAt: string;
  product: ProductSummaryDTO;
}