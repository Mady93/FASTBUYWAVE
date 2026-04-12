import { PaymentDTO } from "../payment/paymentDTO.interface";
import { OrderItemDTO } from "./orderItemDTO.interface";
import { OrderStatus } from "./orderStatus.enum";
import { UserSummaryDTO } from "./userSummaryDTO.interface";

/**
 * @category Interfaces
 * 
 * @description Represents an order in the system, including its details, status, user, items, and payment information.
 * Used for displaying order information or sending it via API responses.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface OrderDTO
 * @property {number} orderId - Unique identifier of the order.
 * @property {string} orderNumber - Human-readable or system-generated order number.
 * @property {string} orderDate - Date and time when the order was placed (ISO format).
 * @property {OrderStatus} status - Current status of the order (e.g., PENDING, CONFIRMED).
 * @property {number} subtotal - Total amount of all order items before shipping and taxes.
 * @property {number} shippingCost - Cost of shipping for the order.
 * @property {number} taxAmount - Total tax amount applied to the order.
 * @property {number} totalAmount - Total amount including subtotal, shipping, and taxes.
 * @property {string} [notes] - Optional notes provided by the user for the order.
 * @property {UserSummaryDTO} user - Summary information of the user who placed the order.
 * @property {OrderItemDTO[]} orderItems - List of items included in the order.
 * @property {PaymentDTO} [payment] - Optional payment information associated with the order.
 */
export interface OrderDTO {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  user: UserSummaryDTO;
  orderItems: OrderItemDTO[];
  payment?: PaymentDTO;
}