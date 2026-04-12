import { ProductSummaryDTO } from "../cart/productSummaryDTO.interface";

/**
 * @category Interfaces
 * 
 * @description Represents a single item within an order, including quantity, pricing, and product details.
 * Each item corresponds to a product that the user has purchased.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface OrderItemDTO
 * @property {number} orderItemId - Unique identifier for the order item.
 * @property {number} quantity - Number of units of the product in this order item.
 * @property {number} unitPrice - Price per single unit of the product.
 * @property {number} totalPrice - Total price for this item (quantity × unitPrice).
 * @property {ProductSummaryDTO} product - Summary information of the product included in this order item.
 */
export interface OrderItemDTO {
  orderItemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: ProductSummaryDTO;
}