import { CONSTANTS_ROUTES_NAVBAR } from '../utils/constants/constants_routes_navbar';
import { MenuItem, ICONS } from 'my-lib-inside';

/**
 * @category Models
 * 
 * @fileoverview Class representing the navigation bar menu structure.
 * Contains a hierarchical list of menu items with support for roles, icons, routing links, and nested sub-items.
 * Used to dynamically render the application navbar.
 * Each menu item can have:
 * - label: displayed text in the navbar
 * - icon: icon associated with the menu item
 * - active: boolean indicating if the item is currently active
 * - link: routing path
 * - name: internal identifier
 * - roles: array of roles allowed to see the item
 * - subItems: optional array of nested MenuItem objects
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export class NavbarItem {
  /** Array of menu items displayed in the navigation bar */
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: ICONS.dashboard,
      active: false,
      link: CONSTANTS_ROUTES_NAVBAR.DASHBOARD,
      name: 'Dashboard',
      roles: ['USER', 'ADMIN'],
      subItems: [],
    },
    {
      label: 'Favorites',
      icon: ICONS.favorites,
      active: false,
      link: CONSTANTS_ROUTES_NAVBAR.FAVORITES,
      name: 'Favorites',
      roles: ['USER', 'ADMIN'],
      subItems: [],
    },
    {
      label: 'Search',
      icon: ICONS.search,
      active: false,
      link: CONSTANTS_ROUTES_NAVBAR.SEARCH,
      name: 'Search',
      roles: ['USER', 'ADMIN'],
      subItems: [],
    },

    {
      label: 'Settings',
      icon: ICONS.settings,
      active: false,
      link: CONSTANTS_ROUTES_NAVBAR.SETTINGS,
      name: 'Settings',
      subItems: [
        {
          label: 'Profile',
          icon: ICONS.profile,
          active: false,
          link: CONSTANTS_ROUTES_NAVBAR.PROFILE,
          name: 'Profile',
          roles: ['USER', 'ADMIN'],
          subItems: [],
        },
        {
          label: 'Notifications',
          icon: ICONS.notifications,
          active: false,
          link: CONSTANTS_ROUTES_NAVBAR.NOTIFICATIONS,
          name: 'Notifications',
          roles: ['USER', 'ADMIN'],
          subItems: [],
        },
        {
          label: 'Privacy',
          icon: ICONS.privacy,
          active: false,
          link: CONSTANTS_ROUTES_NAVBAR.PRIVACY,
          name: 'Privacy',
          roles: ['USER', 'ADMIN'],
          subItems: [],
        },
        {
          label: 'Language',
          icon: ICONS.language,
          active: false,
          link: CONSTANTS_ROUTES_NAVBAR.LANGUAGE,
          name: 'Language',
          roles: ['USER', 'ADMIN'],
          subItems: [],
        },
        {
          label: 'MyAdvertisements',
          icon: ICONS.list,
          active: false,
          link: CONSTANTS_ROUTES_NAVBAR.MYADVERTISEMENTS,
          name: 'MyAdvertisements',
          roles: ['USER', 'ADMIN'],
          subItems: [],
        },
      ],
    },

    {
      label: 'Admin',
      icon: ICONS.admin,
      active: false,
      link: CONSTANTS_ROUTES_NAVBAR.ADMIN,
      name: 'Admin',
      roles: ['ADMIN'],
      subItems: [
        {
          label: 'Category',
          icon: ICONS.category,
          active: false,
          link: CONSTANTS_ROUTES_NAVBAR.CATEGORY,
          name: 'Category',
          roles: ['ADMIN'],
          subItems: [
            {
              label: 'Create',
              icon: ICONS.create,
              active: false,
              link: CONSTANTS_ROUTES_NAVBAR.CREATECATEGORY,
              name: 'Create',
              roles: ['ADMIN'],
              subItems: [],
            },
            {
              label: 'List',
              icon: ICONS.list,
              active: false,
              link: CONSTANTS_ROUTES_NAVBAR.LISTCATEGORY,
              name: 'List',
              roles: ['ADMIN'],
              subItems: [],
            },
          ],
        },
        {
          label: 'Users',
          icon: ICONS.users,
          active: false,
          link: CONSTANTS_ROUTES_NAVBAR.USERS,
          name: 'Users',
          roles: ['ADMIN'],
          subItems: [
            {
              label: 'List',
              icon: ICONS.list,
              active: false,
              link: CONSTANTS_ROUTES_NAVBAR.LISTUSERS,
              name: 'List',
              roles: ['ADMIN'],
              subItems: [],
            },
          ],
        },
      ],
    },

    {
      label: 'Inbox',
      icon: ICONS.inbox,
      active: false,
      link: CONSTANTS_ROUTES_NAVBAR.INBOX,
      name: 'Inbox',
      roles: ['USER', 'ADMIN'],
      subItems: [
        {
          label: 'Contact',
          icon: ICONS.contact,
          active: false,
          link: CONSTANTS_ROUTES_NAVBAR.CONTACT,
          name: 'Contact',
          roles: ['USER', 'ADMIN'],
          subItems: [
            {
              label: 'List',
              icon: ICONS.list,
              active: false,
              link: CONSTANTS_ROUTES_NAVBAR.LISTCONTACT,
              name: 'List',
              roles: ['USER', 'ADMIN'],
              subItems: [],
            },
          ],
        },
        {
          label: 'Appointments',
          icon: ICONS.appointments,
          active: false,
          link: CONSTANTS_ROUTES_NAVBAR.APPOINTMENTS,
          name: 'Appointments',
          roles: ['USER', 'ADMIN'],
          subItems: [
            {
              label: 'Calendar',
              icon: ICONS.list,
              active: false,
              link: CONSTANTS_ROUTES_NAVBAR.LISTAPPOINTMENTS,
              name: 'Calendar',
              roles: ['USER', 'ADMIN'],
              subItems: [],
            },
          ],
        },
      ],
    },

    {
      label: 'Logout',
      icon: ICONS.logout,
      active: false,
      link: CONSTANTS_ROUTES_NAVBAR.LOGOUT,
      name: 'Logout',
      roles: ['USER', 'ADMIN'],
      subItems: [],
    },
  ];

  /**
   * @description Returns the list of navbar menu items.
   *
   * @returns {MenuItem[]} Array of MenuItem objects for rendering the navbar.
   */
  getMenuItems(): MenuItem[] {
    return this.menuItems;
  }
}
