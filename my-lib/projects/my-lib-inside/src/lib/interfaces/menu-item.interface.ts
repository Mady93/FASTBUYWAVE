import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

/**
 * @fileoverview Menu item interface for navigation components.
 *
 * @description
 * Defines the structure of a navigation menu item used in both sidebar and navbar.
 * Supports hierarchical menus with nested subItems, icon display, role-based access control,
 * and UI state management (open/closed state).
 *
 * @category Interfaces
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * import { faHome, faUser, faCog } from '@fortawesome/free-solid-svg-icons';
 *
 * const menuItems: MenuItem[] = [
 *   {
 *     label: 'Dashboard',
 *     name: 'Dashboard',
 *     icon: faHome,
 *     active: true,
 *     link: '/dashboard',
 *     show: false
 *   },
 *   {
 *     label: 'Products',
 *     name: 'Products',
 *     icon: faBox,
 *     active: true,
 *     show: false,
 *     subItems: [
 *       {
 *         label: 'Electronics',
 *         name: 'Electronics',
 *         icon: faLaptop,
 *         active: true,
 *         link: '/products/electronics'
 *       },
 *       {
 *         label: 'Clothing',
 *         name: 'Clothing',
 *         icon: faShirt,
 *         active: true,
 *         link: '/products/clothing'
 *       }
 *     ]
 *   },
 *   {
 *     label: 'Settings',
 *     name: 'Settings',
 *     icon: faCog,
 *     active: true,
 *     roles: ['ADMIN', 'MANAGER'], // Only visible to users with these roles
 *     show: false,
 *     subItems: [
 *       {
 *         label: 'Profile',
 *         name: 'Profile',
 *         icon: faUser,
 *         active: true,
 *         link: '/settings/profile'
 *       }
 *     ]
 *   }
 * ];
 * ```
 */
export interface MenuItem {
  /**
   * @description Display text shown in the navigation menu.
   * This is what users see in the UI (e.g., 'Dashboard', 'Products').
   */
  label: string;

  /**
   * @description FontAwesome icon definition for the menu item.
   * Use imported icons from '@fortawesome/free-solid-svg-icons'.
   *
   * @example
   * ```typescript
   * import { faHome } from '@fortawesome/free-solid-svg-icons';
   * icon: faHome
   * ```
   */
  icon: IconDefinition;

  /**
   * @description Whether the menu item is active and should be displayed.
   * Used to filter out inactive items from the navigation.
   *
   * - `true` - Item is visible in the menu
   * - `false` - Item is hidden (filtered out)
   */
  active: boolean;

  /**
   * @description Optional navigation link URL or route path.
   * When provided, clicking the menu item navigates to this path.
   * Only applicable for leaf nodes (items without subItems).
   *
   * @example
   * ```typescript
   * link: '/dashboard'
   * link: '/products/electronics'
   * ```
   */
  link?: string;

  /**
   * @description Optional arbitrary data associated with the menu item.
   * Can be used to store additional metadata like component references,
   * query parameters, or custom configuration.
   */
  data?: any;

  /**
   * @description Optional internal name identifier for the menu item.
   * Used for path matching, breadcrumb generation, and programmatic references.
   * Should be unique within its parent level.
   *
   * @example
   * ```typescript
   * name: 'Dashboard'
   * name: 'Products'
   * name: 'Electronics'
   * ```
   */
  name?: string;

  /**
   * @description Optional array of user roles that have access to this menu item.
   * Used for role-based access control (RBAC).
   * If not provided, the item is visible to all authenticated users.
   *
   * @example
   * ```typescript
   * roles: ['ADMIN']
   * roles: ['USER']
   * roles: ['ADMIN', 'USER']
   * ```
   */
  roles?: string[];

  /**
   * @description UI state flag indicating whether the submenu is currently expanded/collapsed.
   * Used to persist menu open/close state across navigation.
   *
   * - `true` - Submenu is expanded, children are visible
   * - `false` - Submenu is collapsed, children are hidden
   *
   * @default false
   */
  show?: boolean;

  /**
   * @description Optional hierarchical children (nested submenu items).
   * Allows for infinite nesting of menu structures.
   * When present, the menu item acts as a parent that expands/collapses.
   *
   * @example
   * ```typescript
   * subItems: [
   *   { label: 'Electronics', ... },
   *   { label: 'Clothing', ... }
   * ]
   * ```
   */
  subItems?: MenuItem[];
}
