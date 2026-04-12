/**
 * @category Enumerations
 * 
 * @description Enum representing the supported payment methods for an order.
 * 
 * @enum {string}
 * @property {string} VISA - Payment made using a VISA card.
 * @property {string} MASTERCARD - Payment made using a MasterCard card.
 * @property {string} PAYPAL - Payment made using a PayPal account.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export enum PaymentMethod {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  PAYPAL = 'PAYPAL'
}