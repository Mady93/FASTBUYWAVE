import { ICONS } from 'my-lib-inside';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';

/**
 * @category Icons
 * 
 * @description Mapping between backend icon keys and frontend sidebar icons.
 * 
 * This object is used to dynamically resolve the icons displayed in the sidebar
 * based on category or configuration keys sent from the backend.
 * Each key corresponds to a backend category or feature, and the value is
 * the FontAwesome icon used in the frontend sidebar.
 * 
 * Example usage:
 * ```ts
 * const icon: IconDefinition = ICONS_FE_SIDEBAR['faTshirt'];
 * ```
 * 
 * @constant {Record<string, IconDefinition>} ICONS_FE_SIDEBAR
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export const ICONS_FE_SIDEBAR: Record<string, IconDefinition> = {
  faThLarge: ICONS.catalog,
  faTshirt: ICONS.clothing,
  faUser: ICONS.men,
  faShoePrints: ICONS.shoes,
  faUserTie: ICONS.jacket,
  faChild: ICONS.kids,
  faBaby: ICONS.baby,
  faGem: ICONS.dress,
  faShoppingBag: ICONS.bag,
  faTruck: ICONS.vehicle,
  faMotorcycle: ICONS.motorcycle,
  faShip: ICONS.boat,
  faBicycle: ICONS.bicycle,
  faCar: ICONS.car,
  faPalette: ICONS.art,
  faArchive: ICONS.collection,
  faMusic: ICONS.music,
  faBook: ICONS.book,
  faMobileAlt: ICONS.electronics,
  faGamepad: ICONS.gamepad,
  faHeadphones: ICONS.headphones,
  faCamera: ICONS.camera,
  faLaptop: ICONS.computer,
  faTelevision: ICONS.tv,
  faRocket: ICONS.rocket,
  faChair: ICONS.furniture,
  faTree: ICONS.garden,
  faPlug: ICONS.appliance,
  faFootballBall: ICONS.sport,
  faDumbbell: ICONS.fitness,
  faWater: ICONS.water_sport,
} as const;

/**
 * @category Icons
 * 
 * @description Mapping between backend icon keys and frontend navbar icons.
 * 
 * This object is used to dynamically resolve icons displayed in the navbar
 * for advertisement creation, navigation categories, or menu items.
 * Each key corresponds to a backend category or feature, and the value is
 * the FontAwesome icon used in the frontend navbar.
 * 
 * Example usage:
 * ```ts
 * const icon: IconDefinition = ICONS_FE_NAVBAR['faThLarge'];
 * ```
 * 
 * @constant {Record<string, IconDefinition>} ICONS_FE_NAVBAR
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export const ICONS_FE_NAVBAR: Record<string, IconDefinition> = {
  faThLarge: ICONS.publish,
  faTshirt: ICONS.clothing,
  faUser: ICONS.men,
  faShoePrints: ICONS.shoes,
  faUserTie: ICONS.jacket,
  faChild: ICONS.kids,
  faBaby: ICONS.baby,
  faGem: ICONS.dress,
  faShoppingBag: ICONS.bag,
  faTruck: ICONS.vehicle,
  faMotorcycle: ICONS.motorcycle,
  faShip: ICONS.boat,
  faBicycle: ICONS.bicycle,
  faCar: ICONS.car,
  faPalette: ICONS.art,
  faArchive: ICONS.collection,
  faMusic: ICONS.music,
  faBook: ICONS.book,
  faMobileAlt: ICONS.electronics,
  faGamepad: ICONS.gamepad,
  faHeadphones: ICONS.headphones,
  faCamera: ICONS.camera,
  faLaptop: ICONS.computer,
  faTelevision: ICONS.tv,
  faRocket: ICONS.rocket,
  faChair: ICONS.furniture,
  faTree: ICONS.garden,
  faPlug: ICONS.appliance,
  faFootballBall: ICONS.sport,
  faDumbbell: ICONS.fitness,
  faWater: ICONS.water_sport,
} as const;
