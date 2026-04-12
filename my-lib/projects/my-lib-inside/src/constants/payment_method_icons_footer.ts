/**
 * @fileoverview Payment method icons mapping for footer display.
 * Maps payment method names to FontAwesome icon classes used in the footer component.
 *
 * @description
 * Provides a centralized mapping of payment method names to their corresponding
 * FontAwesome CSS classes. Used by the footer component to display payment method
 * icons consistently across the application.
 *
 * @category Constants
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * import { PAYMENT_METHOD_ICONS_FOOTER } from 'my-lib-inside';
 *
 * @Component({ ... })
 * export class FooterComponent {
 *   paymentIcons = PAYMENT_METHOD_ICONS_FOOTER;
 *   // { VISA: 'fab fa-cc-visa', MASTERCARD: 'fab fa-cc-mastercard', ... }
 * }
 * ```
 */
export const PAYMENT_METHOD_ICONS_FOOTER = {

  /** Visa card icon - FontAwesome class */
  VISA: 'fab fa-cc-visa',

  /** Mastercard icon - FontAwesome class */
  MASTERCARD: 'fab fa-cc-mastercard',

  /** PayPal icon - FontAwesome class */
  PAYPAL: 'fab fa-cc-paypal'
};
