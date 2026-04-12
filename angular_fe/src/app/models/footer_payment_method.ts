import { PAYMENT_METHOD_ICONS_FOOTER } from 'my-lib-inside';
import { FooterPaymentMethod } from 'my-lib-inside';

/**
 * @category Models
 * 
 * @fileoverview Class representing a collection of footer payment methods.
 * Each payment method contains a name, icon, and optional URL.
 * Provides a method to retrieve the list of supported payment methods
 * for display in the footer of the application.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export class FooterPaymentMethodItem {

  /**
   * @description Array of footer payment methods displayed in the application footer.
   * Each item contains:
   * - name: string representing the name of the payment method
   * - icon: string or component representing the payment method icon
   * - url: optional string representing the link associated with the payment method
   */
  footerPaymentMethodItem: FooterPaymentMethod[] = [
    {
      name: 'Visa',
      icon: PAYMENT_METHOD_ICONS_FOOTER.VISA,
      url: 'https://www.visa.com/en-us',
    },
    {
      name: 'MasterCard',
      icon: PAYMENT_METHOD_ICONS_FOOTER.MASTERCARD,
      url: 'https://www.mastercard.com/global/en.html',
    },
    {
      name: 'PayPal',
      icon: PAYMENT_METHOD_ICONS_FOOTER.PAYPAL,
      url: 'https://www.paypal.com/us/digital-wallet/how-paypal-works',
    },
  ];

  /**
   * @description Returns the array of footer payment methods.
   *
   * @returns {FooterPaymentMethod[]} Array of FooterPaymentMethod objects for the footer.
   */
  getPaymentMethods(): FooterPaymentMethod[] {
    return this.footerPaymentMethodItem;
  }
}
