import { PaymentDTO } from "./paymentDTO.interface";

/**
 * @category Interfaces
 * 
 * @description Response DTO for payment-related operations.
 * Contains information about the success of the operation,
 * a message, an optional payment URL, and optional detailed payment data.
 * 
 * @property {boolean} success - Indicates if the payment operation was successful.
 * @property {string} message - Message describing the result of the operation.
 * @property {string} [paymentUrl] - Optional URL for the payment gateway.
 * @property {PaymentDTO} [data] - Optional detailed payment information.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface PaymentResponseDTO {
  success: boolean;
  message: string;
  paymentUrl?: string; // URL for payment gateway
  data?: PaymentDTO;
}