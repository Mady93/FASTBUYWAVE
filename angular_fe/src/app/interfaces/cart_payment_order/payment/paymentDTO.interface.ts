import { PaymentMethod } from "./paymentMethod.enum";

/**
 * @category Interfaces
 * 
 * @description Represents the details of a payment made for an order.
 *              Includes information about the payment method, amount, status, and optional transaction details.
 * 
 * @property {number} paymentId - Unique identifier of the payment.
 * @property {string} paymentReference - Reference code or number for the payment.
 * @property {PaymentMethod} paymentMethod - Method used to make the payment (e.g., CARD, PAYPAL).
 * @property {string} status - Current status of the payment (e.g., SUCCESS, FAILED, PENDING).
 * @property {number} amount - Amount of the payment.
 * @property {string} currency - Currency code for the payment (e.g., USD, EUR).
 * @property {string} [paymentDate] - Optional date when the payment was completed.
 * @property {string} [transactionId] - Optional identifier from the payment processor.
 * @property {string} [failureReason] - Optional reason for failure if the payment was not successful.
 * @property {string} createdAt - Timestamp when the payment record was created.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface PaymentDTO {
  paymentId: number;
  paymentReference: string;
  paymentMethod: PaymentMethod;
  status: string;
  amount: number;
  currency: string;
  paymentDate?: string;
  transactionId?: string;
  failureReason?: string;
  createdAt: string;
}