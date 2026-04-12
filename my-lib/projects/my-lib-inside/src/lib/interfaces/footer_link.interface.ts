/**
 * @fileoverview Footer link interface for navigation.
 *
 * @description
 * Defines the structure for navigation links in the footer.
 *
 * @category Interfaces
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * const footerLink: FooterLink = {
 *   label: 'About Us',
 *   path: '/about'
 * };
 * ```
 */
export interface FooterLink {
  /** @description Display text for the link */
  label: string;

  /** @description Router path or URL for navigation */
  path: string;

  /** @description If true, opens link in new tab as external URL. If false, uses routerLink for internal navigation */
  external?: boolean;
}