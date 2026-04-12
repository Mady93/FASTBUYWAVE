/**
 * @category Enumerations
 * 
 * @description Enum representing the possible statuses of a payment.
 * 
 * @enum {string}
 * @property {string} PENDING - Payment has been initiated but not yet completed.
 * @property {string} COMPLETED - Payment has been successfully completed.
 * @property {string} FAILED - Payment attempt failed.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}