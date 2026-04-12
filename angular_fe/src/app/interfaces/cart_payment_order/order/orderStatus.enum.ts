/**
 * @category Enumerations
 * 
 * @description Enum representing the possible statuses of an order throughout its lifecycle.
 * Tracks the current state of an order from creation to delivery or refund.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @enum {string}
 */
export enum OrderStatus {
  /** @description Order has been created but not yet confirmed */
  PENDING = 'PENDING',

  /** @description Order has been confirmed by the system or seller */
  CONFIRMED = 'CONFIRMED',

  /** @description Order is being prepared or processed for shipment */
  PROCESSING = 'PROCESSING',

  /** @description Order has been shipped to the customer */
  SHIPPED = 'SHIPPED',

  /** @description Order has been delivered to the customer */
  DELIVERED = 'DELIVERED',

  /** @description Order has been cancelled by the user or system */
  CANCELLED = 'CANCELLED',

  /** @description Order has been refunded after cancellation or return */
  REFUNDED = 'REFUNDED'
}