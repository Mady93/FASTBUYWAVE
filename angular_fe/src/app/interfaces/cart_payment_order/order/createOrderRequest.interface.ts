/**
 * @category Interfaces
 * 
 * @description Data transfer object for creating a new order.
 * Contains optional notes from the user and an optional reference to a shipping address.
 * Used when submitting an order from the shopping cart.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface CreateOrderRequest
 * @property {string} [notes] - Optional notes or instructions provided by the user for the order.
 * @property {number} [shippingAddressId] - Optional identifier of the shipping address to use for the order.
 */
export interface CreateOrderRequest {
  notes?: string;
  shippingAddressId?: number;
}