/**
 * @category Interfaces
 * 
 * @description Data transfer object for updating the quantity of a cart item.
 * Used when modifying the number of units of a specific product in the shopping cart.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface UpdateCartItemRequest
 * @property {number} quantity - The new quantity to set for the cart item.
 */
export interface UpdateCartItemRequest {
  quantity: number;
}