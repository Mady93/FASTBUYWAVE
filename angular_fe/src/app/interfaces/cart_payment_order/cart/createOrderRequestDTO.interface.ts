/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) used to create a new order.
 * Can include optional notes and a reference to a shipping address.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface CreateOrderRequestDTO
 * @property {string} [notes] - Optional notes provided by the user for the order.
 * @property {number} [shippingAddressId] - Optional ID of the shipping address to use for delivery.
 */
export interface CreateOrderRequestDTO {
  notes?: string;
  shippingAddressId?: number;
}