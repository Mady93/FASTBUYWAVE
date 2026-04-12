/**
 * @fileoverview Breadcrumb item interface for navigation.
 *
 * @description
 * Defines the structure of a breadcrumb navigation item used in both
 * sidebar and navbar contexts. Each item represents a level in the
 * navigation hierarchy.
 *
 * @category Interfaces
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * const breadcrumbItems: BreadcrumbItem[] = [
 *   { label: 'Home', path: '/', hasChild: false },
 *   { label: 'Products', path: '/products', hasChild: false },
 *   { label: 'Details', path: '/products/123', hasChild: true }
 * ];
 * ```
 */
export interface BreadcrumbItem {
  /**
   * @description Display text shown in the breadcrumb navigation.
   * Typically a human-readable name like 'Home', 'Products', 'Settings'.
   */
  label?: string;

  /**
   * @description Navigation path or URL for the breadcrumb item.
   * Used for routing when the item is clickable.
   */
  path?: string;

  /**
   * @description Indicates whether this breadcrumb item has child items.
   * When true, the item may be displayed differently (e.g., as plain text
   * instead of a link) to indicate it's the current active page with sub-pages.
   */
  hasChild?: boolean;
}
