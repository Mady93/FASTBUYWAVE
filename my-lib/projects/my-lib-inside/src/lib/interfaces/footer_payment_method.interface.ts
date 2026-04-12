/**
 * @fileoverview Footer payment method interface.
 *
 * @description
 * Defines the structure for payment method icons and links in the footer.
 *
 * @category Interfaces
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * const paymentMethod: FooterPaymentMethod = {
 *   name: 'Visa',
 *   icon: 'fa-cc-visa',
 *   url: 'https://visa.com'
 * };
 * ```
 */
export interface FooterPaymentMethod {
  /** @description Display name of the payment method */
  name: string;

  /** @description FontAwesome icon class (e.g., 'fa-cc-visa', 'fa-cc-paypal') */
  icon: string;

  /** @description URL to the payment method's website */
  url: string;
}
