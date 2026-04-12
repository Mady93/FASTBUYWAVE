import { Injectable, Type } from '@angular/core';
import { AppointmentsListComponent } from 'src/app/components/dinamic_path/contact/appointments-list/appointments-list.component';
import { ContactRequestsListComponent } from 'src/app/components/dinamic_path/contact/contact-requests-list/contact-requests-list.component';
import { AdminCategoryCreateComponent } from 'src/app/components/dinamic_path/crud/admin/admin-category-create/admin-category-create.component';
import { AdminCategoryListComponent } from 'src/app/components/dinamic_path/crud/admin/admin-category-list/admin-category-list.component';
import { AdminUsersListComponent } from 'src/app/components/dinamic_path/crud/admin/admin-users-list/admin-users-list.component';
import { AdvertisementsCreateComponent } from 'src/app/components/dinamic_path/crud/advertisement/advertisements-create/advertisements-create.component';
import { AdvertisementsViewComponent } from 'src/app/components/dinamic_path/crud/advertisement/advertisements-view/advertisements-view.component';
import { DasboardContentComponent } from 'src/app/components/dinamic_path/dasboard-content/dasboard-content.component';
import { FavoritesComponent } from 'src/app/components/dinamic_path/favorites/favorites/favorites.component';
import { SearchComponent } from 'src/app/components/dinamic_path/search/search/search.component';
import { SettingsLanguageComponent } from 'src/app/components/dinamic_path/settings/settings-language/settings-language.component';
import { SettingsNotificationsComponent } from 'src/app/components/dinamic_path/settings/settings-notifications/settings-notifications.component';
import { SettingsPrivacyComponent } from 'src/app/components/dinamic_path/settings/settings-privacy/settings-privacy.component';
import { SettingsProfileComponent } from 'src/app/components/dinamic_path/settings/settings-profile/settings-profile.component';
import { SettingsUserAdvertisementComponent } from 'src/app/components/dinamic_path/settings/settings-user-advertisement/settings-user-advertisement.component';

/**
 * @category Routing
 *
 * @description
 * Service to manage dynamic routing to Angular components based on category keys
 * for both the navigation bar and sidebar. This service provides a central mapping
 * between category identifiers and components, allowing dynamic component rendering
 * without hardcoding them in templates. Ideal for modular and scalable UI architectures.
 *
 * The service supports:
 * - Mapping navbar categories to components (`navbarRoutes`)
 * - Mapping sidebar categories to components (`sidebarRoutes`)
 * - Dynamic retrieval of components via `getComponentForRoute`
 *
 * @example
 * ```typescript
 * constructor(private routeManager: RouteManagerService) {}
 *
 * // Get component for a navbar route
 * const { component, source } = this.routeManager.getComponentForRoute('dashboard', 'navbar');
 * if(component) {
 *   // dynamically render the component
 * }
 *
 * // Get component for a sidebar route
 * const sidebarRoute = this.routeManager.getComponentForRoute('marketplace_vehicles_cars', 'sidebar');
 * ```
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class RouteManagerService {
  /**
   * Mapping of navbar category keys to Angular components.
   *
   * @description
   * Each key represents a navbar category identifier. The value is the Angular
   * component that should be rendered when the user selects that category.
   * This enables dynamic component loading for navbar selections.
   *
   * @example
   * ```typescript
   * const component = this.navbarRoutes['dashboard']; // returns DasboardContentComponent
   * ```
   *
   */
  private navbarRoutes: { [key: string]: Type<any> } = {
    dashboard: DasboardContentComponent,
    advertisement_sports_fitness: AdvertisementsCreateComponent,
    advertisement_sports_camping: AdvertisementsCreateComponent,
    advertisement_sports_water: AdvertisementsCreateComponent,
    advertisement_sports_bikes: AdvertisementsCreateComponent,
    advertisement_home_appliances: AdvertisementsCreateComponent,
    advertisement_home_decor: AdvertisementsCreateComponent,
    advertisement_home_garden: AdvertisementsCreateComponent,
    advertisement_home_furniture: AdvertisementsCreateComponent,
    advertisement_clothing_kids_baby: AdvertisementsCreateComponent,
    advertisement_clothing_kids_teen: AdvertisementsCreateComponent,
    advertisement_clothing_kids_kidshoes: AdvertisementsCreateComponent,
    advertisement_clothing_kids_child: AdvertisementsCreateComponent,
    advertisement_clothing_men_jackets: AdvertisementsCreateComponent,
    advertisement_clothing_men_shoes: AdvertisementsCreateComponent,
    advertisement_clothing_men_tshirts: AdvertisementsCreateComponent,
    advertisement_clothing_men_trousers: AdvertisementsCreateComponent,
    advertisement_clothing_women_skirts: AdvertisementsCreateComponent,
    advertisement_clothing_women_bags: AdvertisementsCreateComponent,
    advertisement_clothing_women_dresses: AdvertisementsCreateComponent,
    advertisement_clothing_women_shoes: AdvertisementsCreateComponent,
    advertisement_art_books: AdvertisementsCreateComponent,
    advertisement_art_collectibles: AdvertisementsCreateComponent,
    advertisement_art_paintings: AdvertisementsCreateComponent,
    advertisement_art_music: AdvertisementsCreateComponent,
    advertisement_vehicles_cars: AdvertisementsCreateComponent,
    advertisement_vehicles_boats: AdvertisementsCreateComponent,
    advertisement_vehicles_motorcycles: AdvertisementsCreateComponent,
    advertisement_vehicles_bikes: AdvertisementsCreateComponent,
    advertisement_electronics_drones: AdvertisementsCreateComponent,
    advertisement_electronics_smartphones: AdvertisementsCreateComponent,
    advertisement_electronics_cameras: AdvertisementsCreateComponent,
    advertisement_electronics_consoles: AdvertisementsCreateComponent,
    advertisement_electronics_computers: AdvertisementsCreateComponent,
    advertisement_electronics_tv: AdvertisementsCreateComponent,
    advertisement_electronics_audio: AdvertisementsCreateComponent,

    favorites: FavoritesComponent,
    search: SearchComponent,

    settings_profile: SettingsProfileComponent,
    settings_notifications: SettingsNotificationsComponent,
    settings_privacy: SettingsPrivacyComponent,
    settings_language: SettingsLanguageComponent,
    settings_myadvertisement: SettingsUserAdvertisementComponent,

    admin_category_create: AdminCategoryCreateComponent,
    admin_category_list: AdminCategoryListComponent,
    admin_users_list: AdminUsersListComponent,

    inbox_contact_list: ContactRequestsListComponent,
    inbox_appointments_calendar: AppointmentsListComponent,
  };

  /**
   * Mapping of sidebar category keys to Angular components.
   *
   * @description
   * Each key represents a sidebar category identifier. The value is the Angular
   * component that should be rendered when the user selects that category.
   * This allows dynamic sidebar rendering without hardcoding components.
   *
   * @example
   * ```typescript
   * const component = this.sidebarRoutes['marketplace_vehicles_cars'];
   * // returns AdvertisementsViewComponent
   * ```
   */
  private sidebarRoutes: { [key: string]: Type<any> } = {
    marketplace_vehiclesmotorcycles: AdvertisementsViewComponent,
    marketplace_vehicles_boats: AdvertisementsViewComponent,
    marketplace_vehicles_bikes: AdvertisementsViewComponent,
    marketplace_vehicles_cars: AdvertisementsViewComponent,
    marketplace_home_furniture: AdvertisementsViewComponent,
    marketplace_home_garden: AdvertisementsViewComponent,
    marketplace_home_decor: AdvertisementsViewComponent,
    marketplace_home_appliances: AdvertisementsViewComponent,
    marketplace_art_music: AdvertisementsViewComponent,
    marketplace_art_collectibles: AdvertisementsViewComponent,
    marketplace_art_books: AdvertisementsViewComponent,
    marketplace_art_paintings: AdvertisementsViewComponent,
    marketplace_clothing_women_bags: AdvertisementsViewComponent,
    marketplace_clothing_women_dresses: AdvertisementsViewComponent,
    marketplace_clothing_women_shoes: AdvertisementsViewComponent,
    marketplace_clothing_women_skirts: AdvertisementsViewComponent,
    marketplace_clothing_kids_baby: AdvertisementsViewComponent,
    marketplace_clothing_kids_kidshoes: AdvertisementsViewComponent,
    marketplace_clothing_kids_child: AdvertisementsViewComponent,
    marketplace_clothing_kids_teen: AdvertisementsViewComponent,
    marketplace_clothing_men_shoes: AdvertisementsViewComponent,
    marketplace_clothing_men_trousers: AdvertisementsViewComponent,
    marketplace_clothing_men_tshirts: AdvertisementsViewComponent,
    marketplace_clothing_men_jackets: AdvertisementsViewComponent,
    marketplace_sports_camping: AdvertisementsViewComponent,
    marketplace_sports_fitness: AdvertisementsViewComponent,
    marketplace_sports_water: AdvertisementsViewComponent,
    marketplace_sports_bikes: AdvertisementsViewComponent,
    marketplace_electronics_tv: AdvertisementsViewComponent,
    marketplace_electronics_computers: AdvertisementsViewComponent,
    marketplace_electronics_audio: AdvertisementsViewComponent,
    marketplace_electronics_drones: AdvertisementsViewComponent,
    marketplace_electronics_consoles: AdvertisementsViewComponent,
    marketplace_electronics_cameras: AdvertisementsViewComponent,
    marketplace_electronics_smartphones: AdvertisementsViewComponent,
  };

  getComponentForRoute(
    category: string | null,
    source: 'navbar' | 'sidebar' | null,
  ): { component: Type<any> | null; source: 'navbar' | 'sidebar' | null } {
    if (!category) return { component: null, source: null };

    if (source === 'navbar') {
      const component = this.navbarRoutes[category];
      return {
        component: component ?? null,
        source: component ? 'navbar' : null,
      };
    }

    if (source === 'sidebar') {
      const component = this.sidebarRoutes[category];
      return {
        component: component ?? null,
        source: component ? 'sidebar' : null,
      };
    }

    return { component: null, source: null };
  }
}
