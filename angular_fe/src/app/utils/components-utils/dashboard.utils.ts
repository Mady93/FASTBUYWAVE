import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { ICONS, MenuItem } from "my-lib-inside";
import { CategoryDTO } from "src/app/interfaces/dtos/category_dto.interface";
import { ICONS_FE_NAVBAR, ICONS_FE_SIDEBAR } from "src/app/icons/ICONS_FE";

/**
 * @category Utils
 * 
 * Recursively replaces all occurrences of the word "Marketplace" with "Advertisement"
 * in the `label`, `name`, and `link` properties of menu items.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param menuItems - The array of menu items to update.
 * @returns A new array of MenuItem objects with updated values.
 *
 * @example
 * const updatedMenu = replaceMarketplace(menuItems);
 * // All names/labels/links containing "Marketplace" are replaced with "Advertisement"
 */
export function replaceMarketplace(menuItems: MenuItem[]): MenuItem[] {
  return menuItems.map((item) => ({
    ...item,
    label: item.label?.replace(/Marketplace/g, 'Advertisement'),
    name: item.name?.replace(/Marketplace/g, 'Advertisement'),
    link: item.link?.replace(/marketplace/g, 'advertisement'),
    subItems: item.subItems ? replaceMarketplace(item.subItems) : undefined,
  }));
}

/**
 * @category Utils
 * 
 * Maps an array of CategoryDTO objects to an array of MenuItem objects,
 * selecting the appropriate icons based on the `currentRouteSource` ('navbar' or 'sidebar').
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param categories - The array of CategoryDTO objects.
 * @param userRoles - Array of current user roles to assign to menu items.
 * @param currentRouteSource - Source of the route ('navbar' or 'sidebar').
 * @returns An array of MenuItem objects with icons, roles, and nested subItems.
 */
export function mapCategoryDTOToMenuItems(
  categories: CategoryDTO[],
  userRoles: string[],
  currentRouteSource: string
): MenuItem[] {
  const activeCategories = categories.filter(c => c.active);

  const iconMap = currentRouteSource === 'navbar' ? ICONS_FE_NAVBAR : ICONS_FE_SIDEBAR;

  return activeCategories.map(category => {
    const iconDefinition = iconMap[category.icon as keyof typeof ICONS] || faQuestionCircle;

    if (!iconMap[category.icon as keyof typeof ICONS]) {
      console.warn(`🔴 Icon not found: "${category.icon}" -> fallback used`);
    }

    return {
      label: category.label,
      icon: iconDefinition,
      active: category.active,
      link: category.link,
      data: category,
      name: category.name,
      roles: userRoles,
      show: false,
      subItems: category.children
        ? mapCategoryDTOToMenuItems(category.children, userRoles, currentRouteSource)
        : currentRouteSource === 'navbar' ? undefined : [],
    };
  });
}

/**
 * @category Utils
 * 
 * Returns all "leaf" categories (categories without children) as objects with `label` and `path`.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param categories - The array of CategoryDTO objects to process.
 * @returns An array of objects containing `label` and `path` for each leaf category.
 *
 * @example
 * const leaves = findLeafRoutes(categories);
 */
export function findLeafRoutes(categories: CategoryDTO[]): { label: string; path: string }[] {
  if (!categories?.length) return [];

  return categories.flatMap(category => {
    if (!category.children?.length) {
      return [{ label: category.label, path: category.link }];
    }
    return findLeafRoutes(category.children);
  });
}

/**
 * @category Utils
 * 
 * Filters an array of MenuItem objects based on the user's roles.
 * Only items with at least one matching role or valid subItems are kept.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param items - The array of MenuItem objects to filter.
 * @param userRoles - The array of roles assigned to the current user.
 * @returns A filtered array of MenuItem objects.
 */
export function filterByRoles(items: MenuItem[], userRoles: string[]): MenuItem[] {
  return items
    .filter(item => Array.isArray(item.roles) && item.roles.some(role => userRoles.includes(role)))
    .map(item => ({
      ...item,
      subItems: item.subItems ? filterByRoles(item.subItems, userRoles) : [],
    }))
    .filter(item => item.subItems?.length > 0 || !!item.link);
}

/**
 * @category Utils
 * 
 * Recursively assigns user roles to menu items that do not have roles defined.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param items - The array of MenuItem objects to process.
 * @param userRoles - Array of roles to assign to items without specific roles.
 * @returns A new array of MenuItem objects with roles assigned.
 *
 * @example
 * const menu = [
 *   { name: 'Dashboard', roles: [], subItems: [{ name: 'Reports', roles: [] }] },
 *   { name: 'Settings' }
 * ];
 * const userRoles = ['admin', 'user'];
 * const result = assignRolesToStaticItems(menu, userRoles);
 * // result[0].roles => ['admin', 'user']
 * // result[0].subItems[0].roles => ['admin', 'user']
 */
export function assignRolesToStaticItems(items: MenuItem[], userRoles: string[]): MenuItem[] {
  return items.map(item => ({
    ...item,
    roles: item.roles && item.roles.length > 0 ? item.roles : userRoles,
    subItems: item.subItems ? assignRolesToStaticItems(item.subItems, userRoles) : [],
  }));
}