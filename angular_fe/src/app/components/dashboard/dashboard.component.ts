import {
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Injector,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  Type,
} from '@angular/core';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  LayoutComponent,
  NavbarComponent,
  SidebarComponent,
  SpinnerComponent,
  BreadcrumbComponent,
  FooterComponent,
  BreadcrumbItem,
  SidebarService,
  MenuItem,
} from 'my-lib-inside';
import { NavbarItem } from 'src/app/models/navbar_item';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CarouselItems } from 'src/app/models/carousel_items';
import { FooterLinkItem } from 'src/app/models/footer_link_item';
import { FooterPaymentMethodItem } from 'src/app/models/footer_payment_method';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  filter,
  first,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { RouteManagerService } from 'src/app/services/utils/route_manager/route-manager.service';
import { AuthGoogleService } from 'src/app/services/auth_google/auth-google.service';
import { CategoryService } from 'src/app/services/path/category/category.service';
import { ProfileService } from 'src/app/services/path/profile/profile.service';
import { showSnackBar } from 'src/app/utils/snackbar.utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartComponent } from '../cart/cart.component';
import { SortService } from 'src/app/services/utils/sort/sort.service';
import {
  assignRolesToStaticItems,
  filterByRoles,
  mapCategoryDTOToMenuItems,
  replaceMarketplace,
} from 'src/app/utils/components-utils/dashboard.utils';

/**
 * @category Components
 * 
 * @description
 * Angular dashboard component that manages the main layout of the application including:
 * - Navbar, sidebar, footer, and carousel
 * - Breadcrumbs for route navigation
 * - Dynamic menu items based on user roles and profile
 * - User profile checks and redirections
 * - Cart visibility and updates
 * - Handling of application stability and loading state
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FontAwesomeModule,
    LayoutComponent,
    NavbarComponent,
    SidebarComponent,
    SpinnerComponent,
    BreadcrumbComponent,
    FooterComponent,
    CartComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  /** @description Platform identifier for Angular Universal support */
  private platformId = inject(PLATFORM_ID);

  /** @description Sidebar service to control sidebar visibility */
  private sidebarService = inject(SidebarService);

  /** @description ChangeDetectorRef for manual change detection */
  private cdr = inject(ChangeDetectorRef);

  /** @description Angular Router instance */
  private router = inject(Router);

  /** @description Angular ApplicationRef instance */
  private appRef = inject(ApplicationRef);

  /** @description Angular NgZone instance */
  private ngZone = inject(NgZone);

  /** @description Current route ActivatedRoute */
  public route = inject(ActivatedRoute);

  /** @description Angular injector */
  public injector = inject(Injector);

  /** @description Route manager service for component mapping */
  private routeManager = inject(RouteManagerService);

  /** @description AuthGoogle authentication service */
  private authGoogleService = inject(AuthGoogleService);

  /** @description Category service to fetch active categories */
  private categoryService = inject(CategoryService);

  /** @description Profile service for user profile data */
  private profileService = inject(ProfileService);

  /** @description Angular Material snackbar service for notifications */
  private snackBar = inject(MatSnackBar);

  /** @description Service for sorting categories alphabetically */
  private sortService = inject(SortService);

  /** @description Boolean indicating if the user has a profile */
  public hasProfile: boolean = false;

  /** @description Boolean indicating if profile check is complete */
  public profileCheckComplete: boolean = false;

  /** @description Boolean to determine if redirect to profile is required */
  public shouldRedirectToProfile: boolean = false;

  /** @description Saved user profile data */
  savedProfile: any;

  /** @description RxJS subject to manage component cleanup */
  private destroy$ = new Subject<void>();

  // ───────────────────────────────────────── Navbar Menu Management ─────────────────────────────────────────

  /** @description Instance to manage static navbar menu items */
  navbarItem = new NavbarItem();

  /** @description Static menu items for the navbar */
  menuItems: MenuItem[] = [];

  /** @description Dynamic menu items loaded from active categories */
  dynamicNavbarItems: MenuItem[] = [];

  /** @description Combined static and dynamic menu items for the navbar */
  combinedMenuItems: MenuItem[] = [];

  /** @description Menu items for the sidebar */
  menuItemsSidebar: MenuItem[] = [];

  //───────────────────────────────────────── Footer Carousel and Payment ─────────────────────────────────────────

  /** @description Instance to retrieve carousel items */
  carouselItem = new CarouselItems();

  /** @description List of carousel items to display in the footer */
  carouselItems = this.carouselItem.getCarouselItems();

  /** @description Instance to retrieve footer links */
  footerLinkItem = new FooterLinkItem();

  /** @description List of footer links */
  footerLinkItems = this.footerLinkItem.getFooterLinkItem();

  /** @description Instance to retrieve payment method items for footer */
  footerPaymentMethodItem = new FooterPaymentMethodItem();

  /** @description List of footer payment method items */
  footerPaymentMethodItems = this.footerPaymentMethodItem.getPaymentMethods();

  /** @description Current year for display purposes */
  currentYear: number = new Date().getFullYear();

  /** @description Control visibility of breadcrumbs */
  showBreadcrumb: boolean = true;

  /** @description Breadcrumbs for sidebar*/
  breadcrumbListSidebar: BreadcrumbItem[] = [];

  /** @description Breadcrumbs for navbar */
  breadcrumbListNavbar: BreadcrumbItem[] = [];

  /** @description Control link state */
  linkActive?: boolean;

  /** @description Control link state */
  linkClicked?: any;

  /** @description Logo images */
  logo = '/logo11.png';

  /** @description Spinner images */
  spinner = '/t.png';

  /** @description BehaviorSubject for loading state */
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  /** @description Observable for loading state */
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  /** @description Sidebar visibility observable */
  sidebarVisible$ = this.sidebarService.isSidebarVisible$;

  /** @description User roles */
  userRoles: string[] = [];

  /** @description Current dynamically loaded component */
  currentComponent: Type<any> | null = null;

  /** @description Current route*/
  currentRoute: string = '';

  /** @description Current category */
  currentCategory: string = '';

  /** @description Current route source */
  currentRouteSource: 'navbar' | 'sidebar' | '' = '';

  /** @description Getter for current route source */
  getRouteSource = () => this.currentRouteSource;

  /** @description Cart visibility control */
  cartVisible = false;

  /**
   * @description Prevents drag and drop behavior globally in the dashboard.
   * @param event - The drag event
   */
  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    event.preventDefault();
  }

  /**
   * @inheritdoc
   * @description Angular OnInit lifecycle hook.
   * Initializes dashboard menus, categories, breadcrumbs, and profile checks.
   */
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.subscribeToCategoriesUpdates();
      this.userInfoSubscribe();
      this.subscribeToProfileUpdates();

      const routeData = this.route.data;
      routeData.subscribe((data) => {
        this.currentRoute = this.router.url;
        this.currentCategory = data['category'];

        const result = this.routeManager.getComponentForRoute(
          this.currentCategory,
          data['source'],
        );

        this.currentComponent = result.component;
        this.currentRouteSource = result.source ?? '';

        this.getActiveCategories();
        this.cdr.markForCheck();
      });
    }

    this.checkUserProfile();

    this.cartVisible = this.hasProfile && this.profileCheckComplete;
    this.isLoadingSubject.next(true);
    this.ensureAppStability();
  }

  /**
   * @description Subscribes to profile updates and updates menus when profile changes.
   */
  private subscribeToProfileUpdates(): void {
    this.profileService.profileUpdated$
      .pipe(
        filter((profile) => !!profile),
        takeUntil(this.destroy$),
      )
      .subscribe((profile) => {
        this.savedProfile = profile;
        this.hasProfile = true;
        this.profileCheckComplete = true;

        this.updateMenusBasedOnProfile();
        this.cdr.markForCheck();
      });
  }

  /**
   * @description Checks if user profile exists and redirects to profile creation if missing.
   */
  private checkUserProfile() {
    this.authGoogleService.userInfo$
      .pipe(
        filter((userInfo) => !!userInfo),
        take(1),
        switchMap((userInfo) => {
          const userId = +userInfo.userId;

          return this.profileService.getProfileByUserId(userId).pipe(
            map((profile) => {
              this.hasProfile = !!profile;
              this.profileCheckComplete = true;
              this.savedProfile = profile;

              this.updateMenusBasedOnProfile();
              this.updateCartVisibility();

              if (!this.hasProfile && this.router.url === '/dashboard') {
                showSnackBar(
                  this.snackBar,
                  'Complete your profile to access all features',
                );
                this.router.navigate(['/settings/profile']);
              }

              return profile;
            }),
            catchError((error) => {
              if (error.status === 404) {
                this.hasProfile = false;
                this.profileCheckComplete = true;
                this.savedProfile = null;

                this.updateMenusBasedOnProfile();
                this.updateCartVisibility();

                if (this.router.url === '/dashboard') {
                  this.router.navigate(['/settings/profile']);
                }
              } else {
                this.hasProfile = false;
                this.profileCheckComplete = true;
                this.savedProfile = null;

                showSnackBar(this.snackBar, 'Error loading user profile');

                this.updateMenusBasedOnProfile();
              }
              return of(null);
            }),
          );
        }),
      )
      .subscribe();
  }

  /**
   * @description Updates sidebar and navbar menus based on saved profile.
   */
  private updateMenusBasedOnProfile() {
    const currentUserInfo = this.authGoogleService.getCurrentUserInfo();
    if (currentUserInfo) {
      this.userInfoSubscribe();

      if (this.savedProfile) {
        this.getActiveCategories();
      }
    }
  }

  /**
   * @description Loads active categories from CategoryService and updates dynamic menus.
   */
  getActiveCategories() {
    if (!this.savedProfile) {
      this.dynamicNavbarItems = [];
      this.menuItemsSidebar = [];
      return;
    }

    this.categoryService.getAllActiveCategories().subscribe({
      next: (res) => {
        if (!res || res.length === 0) {
          showSnackBar(this.snackBar, 'No categories available');
          return;
        }

        const sortedCategories =
          this.sortService.sortCategoriesAlphabetically(res);

        this.currentRouteSource = 'sidebar';
        this.menuItemsSidebar = mapCategoryDTOToMenuItems(
          sortedCategories,
          this.userRoles,
          this.currentRouteSource,
        );

        this.currentRouteSource = 'navbar';
        this.dynamicNavbarItems = replaceMarketplace(
          mapCategoryDTOToMenuItems(
            sortedCategories,
            this.userRoles,
            this.currentRouteSource,
          ),
        );

        const routeData = this.route.snapshot.data;
        this.currentRouteSource = routeData['source'] ?? '';

        this.combineMenuItems();
        console.log(
          '🔗🔗🔗 Dashboard: Menu finali combinati per navbar🔗🔗🔗 ',
          this.combinedMenuItems.length,
        );

        setTimeout(() => {
          if (this.currentRoute) {
            this.updateBreadcrumbsForRoute(this.currentRoute);
          }
          this.cdr.markForCheck();
        }, 100);

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        showSnackBar(this.snackBar, 'Error loading navigation menu');
      },
      complete: () => {},
    });
  }

  /**
   * @description Combines static and dynamic menu items to pass to the navbar.
   */
  private combineMenuItems() {
    if (this.menuItems.length === 0) {
      this.combinedMenuItems = [];
      return;
    }

    const dashboardIndex = this.menuItems.findIndex(
      (item) => item.name === 'Dashboard',
    );

    if (dashboardIndex !== -1) {
      this.combinedMenuItems = [
        ...this.menuItems.slice(0, dashboardIndex + 1),
        ...this.dynamicNavbarItems,
        ...this.menuItems.slice(dashboardIndex + 1),
      ];
    } else {
      this.combinedMenuItems = [...this.menuItems, ...this.dynamicNavbarItems];
    }

    console.log(
      '🏁🏁🏁 Dashboard: Menu combinati finali🏁🏁🏁 ',
      this.combinedMenuItems.length,
    );
    this.combinedMenuItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} (${item.label})`);
    });

     this.cdr.markForCheck();
  }

  /**
   * @description Subscribes to userInfo observable and updates menu items dynamically.
   * Handles role-based filtering and dynamic/static menu combination.
   */
  userInfoSubscribe() {
    const allItems = this.navbarItem.getMenuItems();

    this.authGoogleService.userInfo$.subscribe((userInfo) => {
      if (userInfo) {
        console.log('👤👤👤Dashboard: Utente loggato👤👤👤 ', userInfo);
        this.userRoles = this.authGoogleService.getUserRoles();

        if (this.savedProfile) {
          const itemsWithDynamicRoles = assignRolesToStaticItems(
            allItems,
            this.userRoles,
          );

          this.menuItems = filterByRoles(itemsWithDynamicRoles, this.userRoles);

          if (this.dynamicNavbarItems.length > 0) {
            this.combineMenuItems();
          }
        } else {
          this.menuItems = allItems.filter(
            (item) =>
              item.name?.toLowerCase() === 'logout' ||
              item.label?.toLowerCase().includes('logout'),
          );

          this.dynamicNavbarItems = [];
          this.combinedMenuItems = [...this.menuItems];

          this.menuItemsSidebar = [];
        }

        this.cdr.markForCheck();
      } else {
        this.menuItems = [];
        this.combinedMenuItems = [];
        this.menuItemsSidebar = [];
        this.breadcrumbListNavbar = [];
        this.breadcrumbListSidebar = [];
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * @description Ensures app stability before marking loading complete.
   */
  ensureAppStability() {
    if (isPlatformBrowser(this.platformId)) {
      this.appRef.isStable.pipe(first((stable) => stable)).subscribe(() => {
        this.isLoadingSubject.next(false);
        this.cdr.markForCheck();
      });
    }
  }

  /**
   * @description Updates breadcrumbs based on the current route and menu structure.
   * @param route - The current route path
   */
  private updateBreadcrumbsForRoute(route: string) {
    let items: any[] = [];

    if (this.currentRouteSource === 'navbar') {
      items = this.combinedMenuItems;
      if (!items || items.length === 0) {
        setTimeout(() => {
          if (this.combinedMenuItems.length > 0) {
            this.updateBreadcrumbsForRoute(route);
          }
        }, 200);
        return;
      }
    } else if (this.currentRouteSource === 'sidebar') {
      items = this.menuItemsSidebar;
      if (!items || items.length === 0) {
        setTimeout(() => {
          if (this.menuItemsSidebar.length > 0) {
            this.updateBreadcrumbsForRoute(route);
          }
        }, 200);
        return;
      }
    } else {
      return;
    }

    const pathSegments = route.split('/').filter((seg) => seg);
    let breadcrumbList: BreadcrumbItem[] = [];

    for (const segment of pathSegments) {
      const match = items.find(
        (item) => item.name?.toLowerCase() === segment.toLowerCase(),
      );

      if (match) {
        breadcrumbList.push({
          label: match.label,
          path: match.name,
          hasChild: !!(match.subItems && match.subItems.length > 0),
        });
        items = match.subItems || [];
      } else {
        break;
      }
    }

    this.ngZone.run(() => {
      if (this.currentRouteSource === 'navbar') {
        this.breadcrumbListNavbar = [...breadcrumbList];
      } else if (this.currentRouteSource === 'sidebar') {
        this.breadcrumbListSidebar = [...breadcrumbList];
      }

      this.cdr.markForCheck();
    });
  }

  /**
   * @description Returns the logo URL for display.
   * @returns Logo path string
   */
  getLogoUrl: Function = () => this.logo;

  //getLogoFooter: Function = () => this.logoFooter;

  /**
   * @description Returns the spinner image URL for display.
   * @returns Spinner path string
   */
  getspinner: Function = () => this.spinner;

  /**
   * @description Returns current loading state.
   * @returns Boolean indicating loading
   */
  get isLoading(): Function {
    return () => {
      return this.isLoadingSubject.value; // Ritorna il valore attuale di isLoading
    };
  }

  /**
   * @description Handles breadcrumb updates from the navbar.
   * @param breadcrumb - Updated breadcrumb list
   */
  onNavbarBreadcrumbChange(breadcrumb: BreadcrumbItem[]) {
    console.log(
      '📨📨📨Dashboard: Breadcrumb ricevuto dalla navbar📨📨📨 ',
      breadcrumb,
    );
    this.breadcrumbListNavbar = breadcrumb;
    this.cdr.markForCheck();
  }

  /**
   * @description Handles breadcrumb updates from the sidebar.
   * @param breadcrumb - Updated breadcrumb list
   */
  onSidebarBreadcrumbChange(breadcrumb: BreadcrumbItem[]) {
    this.breadcrumbListSidebar = breadcrumb;
    this.cdr.markForCheck();
  }

  /**
   * @description Updates link active state when a link is activated.
   * @param bool - Boolean indicating active state
   */
  onLinkActive(bool: any) {
    this.linkActive = bool;
    this.cdr.markForCheck();
  }

  /**
   * @description Navigates to the specified dashboard route if not already there.
   * @param val - Target route
   */
  onNavigateDasboard(val: string) {
    console.log(`Uri : ${this.router.url}`);
    if (this.router.url !== '/dashboard') {
      if (val == '/dashboard') {
        console.log(`Uri next val : ${this.router.url}`);
        this.router.navigate([val]);
      }
    }
  }

  /**
   * @description Navigates to the given route.
   * @param val - Target route path
   */
  onNavigateLink(val: string) {
    this.router.navigate([val]);
  }

  /**
   * @description Logs out the user if the given value is 'out'.
   * @param val - Trigger string for logout
   */
  onLogout(val: string) {
    if (val == 'out') {
      this.authGoogleService.logoutUser(true).subscribe(() => {});
    }
  }

  /**
   * @description Handles click events on navbar links and emits to parent component.
   * @param link - Clicked link identifier
   */
  onNavbarLinkClick(link: string) {
    this.linkClicked.emit(link);
  }

  /**
   * @description Handles click events on sidebar links and emits to parent component.
   * @param link - Clicked link identifier
   */
  onSidebarLinkClick(link: string) {
    this.linkClicked.emit(link);
  }

  /**
   * @inheritdoc
   * @description Angular OnDestroy lifecycle hook.
   * Cleans up subscriptions and prevents memory leaks.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * @description Updates cart visibility based on profile check.
   */
  private updateCartVisibility() {
    this.cartVisible = this.hasProfile && this.profileCheckComplete;
    this.cdr.markForCheck();
  }

  /**
   * @description Subscribes to category updates and refreshes dynamic menus on changes.
   */
  private subscribeToCategoriesUpdates(): void {
    this.categoryService.categoriesUpdated$
      .pipe(takeUntil(this.destroy$), debounceTime(100))
      .subscribe(() => {
        this.getActiveCategories();
      });
  }
}
