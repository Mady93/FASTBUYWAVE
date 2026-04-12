import { Routes } from '@angular/router';
import { CONSTANTS_ROUTES_DEFAULT } from './utils/constants/constants_routes_default';
import { AuthGuard } from './services/auth_guard/auth-guard.service';

export const routes: Routes = [

  { 
    path: 'login', loadComponent: () => import('./components/login/login.component')
    .then(m => m.LoginComponent)
  },
  { 
    path: CONSTANTS_ROUTES_DEFAULT.REGISTER, loadComponent: () => import('./components/register_login_sign_up/register-project/register-project.component')
    .then(m => m.RegisterProjectComponent)
  },
  { 
    path: '', 
    redirectTo:  CONSTANTS_ROUTES_DEFAULT.REGISTER, 
    pathMatch: 'full' },

  //SIDEBAR
  {
    path: 'marketplace/vehicles/motorcycles',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_vehiclesmotorcycles', source: 'sidebar' }
  },
  {
    path: 'marketplace/vehicles/boats',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_vehicles_boats', source: 'sidebar' }
  },
  {
    path: 'marketplace/vehicles/bikes',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_vehicles_bikes', source: 'sidebar' }
  },
  {
    path: 'marketplace/vehicles/cars',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_vehicles_cars', source: 'sidebar' }
  },
  {
    path: 'marketplace/home/furniture',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_home_furniture', source: 'sidebar' }
  },
  {
    path: 'marketplace/home/garden',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_home_garden', source: 'sidebar' }
  },
  {
    path: 'marketplace/home/decor',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_home_decor', source: 'sidebar' }
  },
  {
    path: 'marketplace/home/appliances',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_home_appliances', source: 'sidebar' }
  },
  {
    path: 'marketplace/art/music',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_art_music', source: 'sidebar' }
  },
  {
    path: 'marketplace/art/collectibles',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_art_collectibles', source: 'sidebar' }
  },
  {
    path: 'marketplace/art/books',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_art_books', source: 'sidebar' }
  },
  {
    path: 'marketplace/art/paintings',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_art_paintings', source: 'sidebar' }
  },
  {
    path: 'marketplace/clothing/women/bags',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_clothing_women_bags', source: 'sidebar' }
  },
  {
    path: 'marketplace/clothing/women/dresses',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_clothing_women_dresses', source: 'sidebar' }
  },
  {
    path: 'marketplace/clothing/women/shoes',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_clothing_women_shoes', source: 'sidebar' }
  },
  {
    path: 'marketplace/clothing/women/skirts',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_clothing_women_skirts', source: 'sidebar' }
  },
  {
    path: 'marketplace/clothing/kids/baby',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_clothing_kids_baby', source: 'sidebar' }
  },
  {
    path: 'marketplace/clothing/kids/kidshoes',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_clothing_kids_kidshoes', source: 'sidebar' }
  },
  {
    path: 'marketplace/clothing/kids/child',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_clothing_kids_child', source: 'sidebar' }
  },
  {
    path: 'marketplace/clothing/kids/teen',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_clothing_kids_teen', source: 'sidebar' }
  },
  {
    path: 'marketplace/clothing/men/shoes',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_clothing_men_shoes', source: 'sidebar' }
  },
  {
    path: 'marketplace/clothing/men/trousers',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_clothing_men_trousers', source: 'sidebar' }
  },
  {
    path: 'marketplace/clothing/men/tshirts',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_clothing_men_tshirts', source: 'sidebar' }
  },
  {
    path: 'marketplace/clothing/men/jackets',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_clothing_men_jackets', source: 'sidebar' }
  },
  {
    path: 'marketplace/sports/camping',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_sports_camping', source: 'sidebar' }
  },
  {
    path: 'marketplace/sports/fitness',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_sports_fitness', source: 'sidebar' }
  },
  {
    path: 'marketplace/sports/water',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_sports_water', source: 'sidebar' }
  },
  {
    path: 'marketplace/sports/bikes',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_sports_bikes', source: 'sidebar' }
  },
  {
    path: 'marketplace/electronics/tv',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_electronics_tv', source: 'sidebar' }
  },
  {
    path: 'marketplace/electronics/computers',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_electronics_computers', source: 'sidebar' }
  },
  {
    path: 'marketplace/electronics/audio',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_electronics_audio', source: 'sidebar' }
  },
  {
    path: 'marketplace/electronics/drones',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_electronics_drones', source: 'sidebar' }
  },
  {
    path: 'marketplace/electronics/consoles',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_electronics_consoles', source: 'sidebar' }
  },
  {
    path: 'marketplace/electronics/cameras',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_electronics_cameras', source: 'sidebar' }
  },
  {
    path: 'marketplace/electronics/smartphones',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    data: { category: 'marketplace_electronics_smartphones', source: 'sidebar' }
  },
























  //NAVBAR
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      canActivate: [AuthGuard],
      data: { roles: ['USER','ADMIN'], category: 'dashboard', source: 'navbar' }
  },
  {
    path: 'advertisement/sports/fitness',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_sports_fitness', source: 'navbar' }
  },
  {
    path: 'advertisement/sports/camping',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_sports_camping', source: 'navbar' }
  },
  {
    path: 'advertisement/sports/water',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_sports_water', source: 'navbar' }
  },
  {
    path: 'advertisement/sports/bikes',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_sports_bikes', source: 'navbar' }
  },
  {
    path: 'advertisement/home/appliances',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_home_appliances', source: 'navbar' }
  },
  {
    path: 'advertisement/home/decor',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_home_decor', source: 'navbar' }
  },
  {
    path: 'advertisement/home/garden',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_home_garden', source: 'navbar' }
  },
  {
    path: 'advertisement/home/furniture',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_home_furniture', source: 'navbar' }
  },
  {
    path: 'advertisement/clothing/kids/baby',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_clothing_kids_baby', source: 'navbar' }
  },
  {
    path: 'advertisement/clothing/kids/teen',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_clothing_kids_teen', source: 'navbar' }
  },
  {
    path: 'advertisement/clothing/kids/kidshoes',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_clothing_kids_kidshoes', source: 'navbar' }
  },
  {
    path: 'advertisement/clothing/kids/child',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_clothing_kids_child', source: 'navbar' }
  },
  {
    path: 'advertisement/clothing/men/jackets',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_clothing_men_jackets', source: 'navbar' }
  },
  {
    path: 'advertisement/clothing/men/shoes',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_clothing_men_shoes', source: 'navbar' }
  },
  {
    path: 'advertisement/clothing/men/tshirts',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_clothing_men_tshirts', source: 'navbar' }
  },
  //Kids
  {
    path: 'advertisement/clothing/men/trousers',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_clothing_men_trousers', source: 'navbar' }
  },
  {
    path: 'advertisement/clothing/women/skirts',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_clothing_women_skirts', source: 'navbar' }
  },
  {
    path: 'advertisement/clothing/women/bags',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_clothing_women_bags', source: 'navbar' }
  },
  {
    path: 'advertisement/clothing/women/dresses',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_clothing_women_dresses', source: 'navbar' }
  },
  //Furniture
  {
    path: 'advertisement/clothing/women/shoes',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_clothing_women_shoes', source: 'navbar' }
  },
  {
    path: 'advertisement/art/books',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_art_books', source: 'navbar' }
  },
  {
    path: 'advertisement/art/collectibles',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_art_collectibles', source: 'navbar' }
  },
  {
    path: 'advertisement/art/paintings',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_art_paintings', source: 'navbar' }
  },
  {
    path: 'advertisement/art/music',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_art_music', source: 'navbar' }
  },
  {
    path: 'advertisement/vehicles/cars',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_vehicles_cars', source: 'navbar' }
  },
  {
    path: 'advertisement/vehicles/boats',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_vehicles_boats', source: 'navbar' }
  },
  {
    path: 'advertisement/vehicles/motorcycles',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_vehicles_motorcycles', source: 'navbar' }
  },
   //Cars
   {
    path: 'advertisement/vehicles/bikes',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_vehicles_bikes', source: 'navbar' }
  },
  {
    path: 'advertisement/electronics/drones',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_electronics_drones', source: 'navbar' }
  },
  {
    path: 'advertisement/electronics/smartphones',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_electronics_smartphones', source: 'navbar' }
  },
  {
    path: 'advertisement/electronics/cameras',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_electronics_cameras', source: 'navbar' }
  },
  //Art
  {
    path: 'advertisement/electronics/consoles',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_electronics_consoles', source: 'navbar' }
  },
  {
    path: 'advertisement/electronics/computers',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_electronics_computers', source: 'navbar' }
  },
  {
    path: 'advertisement/electronics/tv',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_electronics_tv', source: 'navbar' }
  },
  {
    path: 'advertisement/electronics/audio',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'advertisement_electronics_audio', source: 'navbar' }
  },
  //Favorites
  {
    path: 'favorites',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'favorites', source: 'navbar' }
  },
  //Search
  {
    path: 'search',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'search', source: 'navbar' }
  },
  //Settings
  {
    path: 'settings/profile',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'settings_profile', source: 'navbar' }
  },
  {
    path: 'settings/notifications',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'settings_notifications', source: 'navbar' }
  },
  {
    path: 'settings/privacy',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'settings_privacy', source: 'navbar' }
  },
  {
    path: 'settings/language',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'settings_language', source: 'navbar' }
  },
  {
    path: 'settings/myadvertisements',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'settings_myadvertisement', source: 'navbar' }
  },
   //Admin
   {
    path: 'admin/category/create',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      canActivate: [AuthGuard],
      data: { roles: ['ADMIN'], category: 'admin_category_create', source: 'navbar' }
  },
  {
    path: 'admin/category/list',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      canActivate: [AuthGuard],
      data: { roles: ['ADMIN'], category: 'admin_category_list', source: 'navbar' }
  },
  {
    path: 'admin/users/list',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      canActivate: [AuthGuard],
      data: { roles: ['ADMIN'], category: 'admin_users_list', source: 'navbar' }
  },

    {
    path: 'inbox/contact/list',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'inbox_contact_list', source: 'navbar' }
  },
  {
    path: 'inbox/appointments/calendar',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
      data: { category: 'inbox_appointments_calendar', source: 'navbar' }
  }
];