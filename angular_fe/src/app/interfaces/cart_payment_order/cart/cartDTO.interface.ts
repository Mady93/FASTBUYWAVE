import { CartItemDTO } from "./cartItemDTO.interface";

/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing a shopping cart.
 * Contains metadata about the cart, the user it belongs to, the list of items,
 * and aggregated totals like total amount and total items.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface CartDTO
 * @property {number} cartId - Unique identifier of the cart.
 * @property {string} createdAt - ISO string representing the creation date of the cart.
 * @property {string} updatedAt - ISO string representing the last update date of the cart.
 * @property {boolean} active - Indicates whether the cart is currently active.
 * @property {number} userId - Identifier of the user who owns the cart.
 * @property {string} userEmail - Email of the user who owns the cart.
 * @property {CartItemDTO[]} cartItems - List of items currently in the cart.
 * @property {number} totalAmount - Total cost of all items in the cart.
 * @property {number} totalItems - Total number of items in the cart.
 */
export interface CartDTO {
  cartId: number;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  userId: number;
  userEmail: string;
  cartItems: CartItemDTO[];
  totalAmount: number;
  totalItems: number;
}