import { FooterLink } from 'my-lib-inside';

/**
 * @category Models
 * 
 * @fileoverview Class representing a collection of footer links for the application.
 * Each link contains a label and a path to navigate to. Provides a method to retrieve
 * the list of footer links for display in the application footer.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export class FooterLinkItem {
 
  /**
   * @description Array of footer links to display in the application footer.
   * Each item contains:
   * - label: string representing the text of the link
   * - path: string representing the URL path for navigation
   */
  footerLinkItem: FooterLink[] = [
  { label: 'LinkedIn', path: 'https://www.linkedin.com/in/madalina-mariana-popa', external: true },
  { label: 'GitHub', path: 'https://github.com/Mady93', external: true }
];

   /**
   * @description Returns the array of footer link items.
   *
   * @returns {FooterLink[]} Array of FooterLink objects for the footer.
   */
  getFooterLinkItem(): FooterLink[] {
    return this.footerLinkItem;
  }
}
