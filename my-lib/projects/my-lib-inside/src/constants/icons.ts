import {
  faAdd,
  faArchive,
  faBaby,
  faBell,
  faBicycle,
  faBoxOpen,
  faBullhorn,
  faCalendarDay,
  faCamera,
  faCar,
  faChair,
  faChild,
  faDollarSign,
  faDumbbell,
  faEye,
  faEyeSlash,
  faFootballBall,
  faGamepad,
  faGem,
  faHeadphones,
  faHeart,
  faInbox,
  faLanguage,
  faLaptop,
  faLayerGroup,
  faList,
  faMobileAlt,
  faMotorcycle,
  faMountain,
  faMusic,
  faPalette,
  faPlug,
  faRocket,
  faSearch,
  faShip,
  faShoePrints,
  faShoppingBag,
  faShoppingCart,
  faSignOut,
  faStar,
  faTelevision,
  faThLarge,
  faTree,
  faTruck,
  faTshirt,
  faUser,
  faUserCircle,
  faUserLock,
  faUserTie,
  faWater,
} from '@fortawesome/free-solid-svg-icons';
import { faNavicon } from '@fortawesome/free-solid-svg-icons';
import {
  faHouse,
  faBook,
  faComment,
  faCalendar,
  faChartBar,
  faUsers,
  faCog,
} from '@fortawesome/free-solid-svg-icons';

/**
 * @fileoverview Global icon registry for the UI Library.
 * Maps semantic icon names to FontAwesome icon definitions
 * used across all components in the library.
 *
 * @description
 * Maps semantic names to FontAwesome icon objects.
 * Used by components like `NavbarComponent`, `SidebarComponent` and any
 * component that needs icon references. Import this constant and access
 * icons by their semantic key instead of importing FontAwesome icons directly.
 *
 * @category Constants
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * import { ICONS } from 'my-lib-inside';
 *
 * @Component({ ... })
 * export class MyComponent {
 *   dashboardIcon = ICONS.dashboard;
 *   cartIcon = ICONS.cart;
 * }
 * ```
 */
export const ICONS = {
  // ─────────────────────────────────────────────
  // Navigation & UI
  // ─────────────────────────────────────────────

  /** Dashboard eye icon */
  dashboard: faEyeSlash,

  /** Generic user icon */
  user: faUser,

  /** Address book icon */
  addressBook: faBook,

  /** Components/comment icon */
  components: faComment,

  /** Calendar icon */
  calendar: faCalendar,

  /** Charts/navicon icon */
  charts: faNavicon,

  /** Home icon */
  n1: faHouse,

  /** Chart bar icon */
  n2: faChartBar,

  /** Users icon */
  n3: faUsers,

  /** Settings icon*/
  n4: faCog,

  /** Logout/sign out icon */
  logout: faSignOut,

  /** Shopping cart icon */
  cart: faShoppingCart,

  /** Publish/bullhorn icon */
  publish: faBullhorn,

  /** Admin/user lock icon */
  admin: faUserLock,

  /** Category/layer group icon */
  category: faLayerGroup,

  /** Users management icon */
  users: faUsers,

  /** Create/add icon */
  create: faAdd,

  /** List icon */
  list: faList,

  /** Contact/user circle icon */
  contact: faUserCircle,

  /** Appointments/calendar day icon */
  appointments: faCalendarDay,

  // ─────────────────────────────────────────────
  // Product Categories
  // ─────────────────────────────────────────────

  /** Product catalog icon */
  catalog: faThLarge,

  /** Electronics category icon */
  electronics: faMobileAlt,

  /** Smartphone category icon */
  smartphone: faMobileAlt,

  /** Computer category icon */
  computer: faLaptop,

  /** TV category icon */
  tv: faTelevision,

  /** Clothing category icon */
  clothing: faTshirt,

  /** Furniture category icon */
  furniture: faChair,

  /** Men clothing icon */
  men: faUser,

  /** Women clothing icon */
  women: faUser,

  /** T-shirt icon */
  tshirt: faTshirt,

  /** Jacket icon */
  jacket: faUserTie,

  /** Dress icon */
  dress: faGem,

  /** Skirt icon */
  skirt: faGem,

  // ─────────────────────────────────────────────
  // Actions & Status
  // ─────────────────────────────────────────────

  /** Sell/box open icon */
  sell: faBoxOpen,

  /** Price/dollar sign icon */
  price: faDollarSign,

  /** Favorites/heart icon */
  favorites: faHeart,

  /** Recommended/star icon */
  recommended: faStar,

  /** Decoration/gem icon */
  decoration: faGem,

  /** Settings/cog icon */
  settings: faCog,

  /** Notifications/bell icon */
  notifications: faBell,

  /** Search icon */
  search: faSearch,

  /** Privacy/eye icon */
  privacy: faEye,

  /** Language icon */
  language: faLanguage,

  /** Profile/user icon */
  profile: faUser,

  // ─────────────────────────────────────────────
  // Additional Sub-category Icons
  // ─────────────────────────────────────────────

  /** Gaming consoles and video games icon */
  gamepad: faGamepad,

  /** Audio & Hi-Fi icon */
  headphones: faHeadphones,

  /** Photography and cameras icon */
  camera: faCamera,

  /** Drones and robotics icon */
  rocket: faRocket,

  /** Bags icon */
  shoppingBag: faShoppingBag,

  /** Children 0-2 years icon */
  baby: faBaby,

  /** Children 3-7 years icon */
  child: faChild,

  /** Teenager 8-14 years icon */
  teen: faUser,

  /** Shoes icon */
  shoes: faShoePrints,

  /** Bicycle icon */
  bicycle: faBicycle,

  /** Water sports icon */
  water_sport: faWater,

  /** Camping and outdoor icon */
  tent: faMountain,

  /** Boats icon */
  ship: faShip,

  /** Music icon */
  music: faMusic,

  /** Art and paintings icon */
  palette: faPalette,

  /** Collectibles icon */
  archive: faArchive,

  // ─────────────────────────────────────────────
  // Aliases
  // ─────────────────────────────────────────────

  /** Drone alias for rocket icon */
  drone: faRocket,

  /** Trousers alias for tshirt icon */
  trousers: faTshirt,

  /** Bag alias for shopping bag icon */
  bag: faShoppingBag,

  /** Kids alias for child icon */
  kids: faChild,

  /** Home appliances icon */
  appliance: faPlug,

  /** Garden icon */
  garden: faTree,

  /** Sport icon */
  sport: faFootballBall,

  /** Fitness icon */
  fitness: faDumbbell,

  /** Bike alias for bicycle icon */
  bike: faBicycle,

  /** Camping alias for tree icon */
  camping: faTree,

  /** Vehicle/truck icon */
  vehicle: faTruck,

  /** Car icon */
  car: faCar,

  /** Motorcycle icon */
  motorcycle: faMotorcycle,

  /** Boat alias for ship icon */
  boat: faShip,

  /** Art alias for palette icon */
  art: faPalette,

  /** Book icon */
  book: faBook,

  /** Painting alias for palette icon */
  painting: faPalette,

  /** Collection alias for archive icon */
  collection: faArchive,

  /** Inbox icon */
  inbox: faInbox,
};
