
/**
 * @category Interfaces
 * 
 * @description Represents the request payload to initiate a payment for an order.
 *              Supports multiple payment methods such as card or PayPal.
 * 
 * @property {number} orderId - The unique identifier of the order to be paid.
 * @property {string} paymentMethod - The chosen payment method (e.g., "CARD", "PAYPAL").
 * @property {string} [cardToken] - Optional token for card-based payments.
 * @property {string} [paypalEmail] - Optional PayPal email if the payment method is PayPal.
 * @property {boolean} useMockPayment - Flag indicating whether to use a mock payment for testing.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface InitiatePaymentRequestDTO {
  orderId: number;
  paymentMethod: string;
  cardToken?: string;
  paypalEmail?: string;
  useMockPayment: boolean;
}