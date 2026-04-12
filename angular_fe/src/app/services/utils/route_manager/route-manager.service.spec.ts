import { TestBed } from '@angular/core/testing';

import { RouteManagerService } from '../route_manager/route-manager.service';
import { DasboardContentComponent } from 'src/app/components/dinamic_path/dasboard-content/dasboard-content.component';
import { AdvertisementsCreateComponent } from 'src/app/components/dinamic_path/crud/advertisement/advertisements-create/advertisements-create.component';
import { AdvertisementsViewComponent } from 'src/app/components/dinamic_path/crud/advertisement/advertisements-view/advertisements-view.component';
import { FavoritesComponent } from 'src/app/components/dinamic_path/favorites/favorites/favorites.component';
import { SearchComponent } from 'src/app/components/dinamic_path/search/search/search.component';
import { SettingsProfileComponent } from 'src/app/components/dinamic_path/settings/settings-profile/settings-profile.component';
import { SettingsNotificationsComponent } from 'src/app/components/dinamic_path/settings/settings-notifications/settings-notifications.component';
import { SettingsPrivacyComponent } from 'src/app/components/dinamic_path/settings/settings-privacy/settings-privacy.component';
import { SettingsLanguageComponent } from 'src/app/components/dinamic_path/settings/settings-language/settings-language.component';
import { SettingsUserAdvertisementComponent } from 'src/app/components/dinamic_path/settings/settings-user-advertisement/settings-user-advertisement.component';
import { AdminCategoryCreateComponent } from 'src/app/components/dinamic_path/crud/admin/admin-category-create/admin-category-create.component';
import { AdminCategoryListComponent } from 'src/app/components/dinamic_path/crud/admin/admin-category-list/admin-category-list.component';
import { AdminUsersListComponent } from 'src/app/components/dinamic_path/crud/admin/admin-users-list/admin-users-list.component';
import { ContactRequestsListComponent } from 'src/app/components/dinamic_path/contact/contact-requests-list/contact-requests-list.component';
import { AppointmentsListComponent } from 'src/app/components/dinamic_path/contact/appointments-list/appointments-list.component';

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('RouteManagerService', () => {
  let service: RouteManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteManagerService);
  });

  // ── Instantiation ──────────────────────────────────────────────────────────

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Null / invalid inputs ──────────────────────────────────────────────────

  describe('getComponentForRoute() — invalid inputs', () => {
    it('should return { component: null, source: null } when category is null', () => {
      const result = service.getComponentForRoute(null, 'navbar');
      expect(result).toEqual({ component: null, source: null });
    });

    it('should return { component: null, source: null } when source is null', () => {
      const result = service.getComponentForRoute('dashboard', null);
      expect(result).toEqual({ component: null, source: null });
    });

    it('should return { component: null, source: null } when both are null', () => {
      const result = service.getComponentForRoute(null, null);
      expect(result).toEqual({ component: null, source: null });
    });

    it('should return { component: null, source: null } when the navbar key does not exist', () => {
      const result = service.getComponentForRoute('nonexistent_key', 'navbar');
      expect(result).toEqual({ component: null, source: null });
    });

    it('should return { component: null, source: null } when the sidebar key does not exist', () => {
      const result = service.getComponentForRoute('nonexistent_key', 'sidebar');
      expect(result).toEqual({ component: null, source: null });
    });
  });

  // ── Navbar routes ──────────────────────────────────────────────────────────

  describe('getComponentForRoute() — navbar', () => {
    it('should return DasboardContentComponent for "dashboard"', () => {
      const { component, source } = service.getComponentForRoute('dashboard', 'navbar');
      expect(component).toBe(DasboardContentComponent);
      expect(source).toBe('navbar');
    });

    it('should return AdvertisementsCreateComponent for advertisement_* keys', () => {
      const keys = [
        'advertisement_sports_fitness',
        'advertisement_vehicles_cars',
        'advertisement_electronics_smartphones',
        'advertisement_clothing_women_dresses',
        'advertisement_art_paintings',
        'advertisement_home_furniture',
      ];
      keys.forEach((key) => {
        const { component, source } = service.getComponentForRoute(key, 'navbar');
        expect(component).withContext(key).toBe(AdvertisementsCreateComponent);
        expect(source).withContext(key).toBe('navbar');
      });
    });

    it('should return FavoritesComponent for "favorites"', () => {
      const { component, source } = service.getComponentForRoute('favorites', 'navbar');
      expect(component).toBe(FavoritesComponent);
      expect(source).toBe('navbar');
    });

    it('should return SearchComponent for "search"', () => {
      const { component, source } = service.getComponentForRoute('search', 'navbar');
      expect(component).toBe(SearchComponent);
      expect(source).toBe('navbar');
    });

    it('should return SettingsProfileComponent for "settings_profile"', () => {
      const { component, source } = service.getComponentForRoute('settings_profile', 'navbar');
      expect(component).toBe(SettingsProfileComponent);
      expect(source).toBe('navbar');
    });

    it('should return SettingsNotificationsComponent for "settings_notifications"', () => {
      const { component, source } = service.getComponentForRoute('settings_notifications', 'navbar');
      expect(component).toBe(SettingsNotificationsComponent);
      expect(source).toBe('navbar');
    });

    it('should return SettingsPrivacyComponent for "settings_privacy"', () => {
      const { component, source } = service.getComponentForRoute('settings_privacy', 'navbar');
      expect(component).toBe(SettingsPrivacyComponent);
      expect(source).toBe('navbar');
    });

    it('should return SettingsLanguageComponent for "settings_language"', () => {
      const { component, source } = service.getComponentForRoute('settings_language', 'navbar');
      expect(component).toBe(SettingsLanguageComponent);
      expect(source).toBe('navbar');
    });

    it('should return SettingsUserAdvertisementComponent for "settings_myadvertisement"', () => {
      const { component, source } = service.getComponentForRoute('settings_myadvertisement', 'navbar');
      expect(component).toBe(SettingsUserAdvertisementComponent);
      expect(source).toBe('navbar');
    });

    it('should return AdminCategoryCreateComponent for "admin_category_create"', () => {
      const { component, source } = service.getComponentForRoute('admin_category_create', 'navbar');
      expect(component).toBe(AdminCategoryCreateComponent);
      expect(source).toBe('navbar');
    });

    it('should return AdminCategoryListComponent for "admin_category_list"', () => {
      const { component, source } = service.getComponentForRoute('admin_category_list', 'navbar');
      expect(component).toBe(AdminCategoryListComponent);
      expect(source).toBe('navbar');
    });

    it('should return AdminUsersListComponent for "admin_users_list"', () => {
      const { component, source } = service.getComponentForRoute('admin_users_list', 'navbar');
      expect(component).toBe(AdminUsersListComponent);
      expect(source).toBe('navbar');
    });

    it('should return ContactRequestsListComponent for "inbox_contact_list"', () => {
      const { component, source } = service.getComponentForRoute('inbox_contact_list', 'navbar');
      expect(component).toBe(ContactRequestsListComponent);
      expect(source).toBe('navbar');
    });

    it('should return AppointmentsListComponent for "inbox_appointments_calendar"', () => {
      const { component, source } = service.getComponentForRoute('inbox_appointments_calendar', 'navbar');
      expect(component).toBe(AppointmentsListComponent);
      expect(source).toBe('navbar');
    });
  });

  // ── Sidebar routes ─────────────────────────────────────────────────────────

  describe('getComponentForRoute() — sidebar', () => {
    it('should return AdvertisementsViewComponent for all marketplace_* keys', () => {
      const keys = [
        'marketplace_vehicles_cars',
        'marketplace_vehicles_boats',
        'marketplace_vehicles_bikes',
        'marketplace_home_furniture',
        'marketplace_electronics_smartphones',
        'marketplace_clothing_women_dresses',
        'marketplace_art_paintings',
        'marketplace_sports_fitness',
      ];
      keys.forEach((key) => {
        const { component, source } = service.getComponentForRoute(key, 'sidebar');
        expect(component).withContext(key).toBe(AdvertisementsViewComponent);
        expect(source).withContext(key).toBe('sidebar');
      });
    });

    it('should NOT resolve navbar keys when source is sidebar', () => {
      const { component, source } = service.getComponentForRoute('dashboard', 'sidebar');
      expect(component).toBeNull();
      expect(source).toBeNull();
    });

    it('should NOT resolve sidebar keys when source is navbar', () => {
      const { component, source } = service.getComponentForRoute('marketplace_vehicles_cars', 'navbar');
      expect(component).toBeNull();
      expect(source).toBeNull();
    });
  });
});