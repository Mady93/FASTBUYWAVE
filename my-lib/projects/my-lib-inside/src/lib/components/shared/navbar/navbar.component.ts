import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MenuItem } from '../../../interfaces/menu-item.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarService } from '../../../services/sidebar/sidebar.service';
import { BreadcrumbItem } from '../../../interfaces/breadcrumb_item.interface';
import { NavbarService } from '../../../services/navbar/navbar.service';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  Subscription,
  take,
} from 'rxjs';

/**
 * @fileoverview Navigation bar component with dropdown menus and breadcrumb.
 *
 * @description
 * A responsive navbar component that supports:
 * - Multi-level dropdown menus (infinite nesting)
 * - Dynamic breadcrumb generation based on current route
 * - Toggle sidebar functionality
 * - Logo display
 * - Mobile responsive with hamburger menu
 * - Integration with SidebarService and NavbarService
 *
 * @implements {OnInit, OnDestroy}
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-navbar
 *   [menuItems]="navigationItems"
 *   [logoUrl]="logoPath"
 *   [currentRoute]="router.url"
 *   [currentYear]="2024"
 *   (breadcrumbChangeNav)="onBreadcrumbChange($event)"
 *   (linkClicked)="navigate($event)"
 *   (logout)="onLogout()"
 * ></lib-navbar>
 * ```
 */
@Component({
  selector: 'lib-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    FontAwesomeModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  /** @description Internal storage for menu items */
  private _menuItemsNavbar: MenuItem[] = [];

  /** @description Internal storage for current route */
  private _currentRoute?: string;

  /** @description Sidebar service instance */
  private sidebarService: SidebarService;

  /** @description Navbar service instance */
  private navbarService: NavbarService;

  /** @description Change detector reference */
  private cdr: ChangeDetectorRef;

  /**
 * @description Platform identifier for Angular Universal (SSR) detection.
 * Used to determine if code is running in browser or server environment.
 * 
 * **Why needed:**
 * - Prevents DOM access errors during server-side rendering (SSR)
 - Ensures browser-specific code (like breadcrumb generation, DOM manipulation)
 *   only runs in the browser
 * 
 * **Usage:**
 * ```typescript
 * if (isPlatformBrowser(this.platformId)) {
 *   // Browser-only code here
 * }
 * ```
 * 
 * @see isPlatformBrowser from '@angular/common'
 */
  private platformId: Object;

  /**
   * @description Internal subscription container for cleanup on destroy
   */
  private subscriptions = new Subscription();

  /**
   * @description BehaviorSubject that emits when menu items are ready
   * Used to coordinate breadcrumb generation with menu readiness
   */
  private menuReady$ = new BehaviorSubject<boolean>(false);

  /**
   * @description BehaviorSubject that emits the current route
   * Used to coordinate breadcrumb generation with route changes
   */
  private currentRoute$ = new BehaviorSubject<string | null>(null);

  // ── Inputs ───────────────────────────────────────────────────────────────

  /**
   * @description Sets the menu items for the navbar.
   * Creates a copy to avoid reference issues and triggers breadcrumb recalculation.
   *
   * **Behavior:**
   * - Stores a copy of the input items
   * - Emits menu readiness via menuReady$ BehaviorSubject
   * - If a current route exists AND menu has at least 2 items, recalculates breadcrumb
   *   (Waits for complete menu, not just partial "Dashboard" emission)
   *
   * @param items - Array of menu items to display in navbar
   */
  @Input()
  set menuItems(items: MenuItem[]) {
    this._menuItemsNavbar = items ? [...items] : [];
    this.menuReady$.next(!!items?.length);

    // Force breadcrumb recalculation if route exists and menu is complete (≥2 items)
    // This handles cases where menu arrives after route (e.g., dynamic categories loading)
    if (this.currentRoute && this._menuItemsNavbar.length >= 2) {
      console.log('🔄 Ricalcolo breadcrumb per route:', this.currentRoute);
      this.updateBreadcrumb(this.currentRoute);
    }

    this.cdr.markForCheck();
  }

  /** @description Returns the current menu items */
  get menuItems(): MenuItem[] {
    return this._menuItemsNavbar;
  }

  /**
   * @description Sets the current route.
   * Updates internal storage and emits the new route via currentRoute$ BehaviorSubject
   * to trigger breadcrumb generation when both route and menu are ready.
   *
   * @param route - Current route path (e.g., '/advertisement/art/paintings')
   */
  @Input()
  set currentRoute(route: string | undefined) {
    this._currentRoute = route;
    this.currentRoute$.next(route ?? null);
    this.cdr.markForCheck();
  }

  /** @description Returns the current route */
  get currentRoute(): string | undefined {
    return this._currentRoute;
  }

  /** @description Logo URL function that returns the logo path */
  @Input() logoUrl: Function = () => {};

  /** @description Current year for copyright display */
  @Input() currentYear!: number;

  /** @description Function that returns the source of the route ('navbar' or 'sidebar') */
  @Input() routeSource: () => '' | 'navbar' | 'sidebar' = () => '';

  // ── Outputs ───────────────────────────────────────────────────────────────

  /** @description Emitted when sidebar needs to be reset */
  @Output() resetSidebar = new EventEmitter<void>();

  /** @description Emitted when breadcrumb changes */
  @Output() breadcrumbChangeNav = new EventEmitter<BreadcrumbItem[]>();

  /** @description Emitted when a link becomes active */
  @Output() linkActive = new EventEmitter<boolean>();

  /** @description Emitted when breadcrumb should be hidden */
  @Output() hideBreadcrumb = new EventEmitter<boolean>();

  /** @description Emitted when a link is clicked */
  @Output() linkClicked = new EventEmitter<string>();

  /** @description Emitted when navigating to dashboard */
  @Output() navigateDasboard = new EventEmitter<string>();

  /** @description Emitted when navigating via link */
  @Output() navigateLink = new EventEmitter<string>();

  /** @description Emitted when user logs out */
  @Output() logout = new EventEmitter<string>();

  // ── State ─────────────────────────────────────────────────────────────────

  /** @description Map of open paths for dropdown management */
  openPath: any = {};

  /** @description Currently selected item path */
  selItemPath: string | null = null;

  /** @description Index of currently open submenu */
  openSubmenuIndex: number | null = null;

  /** @description Map of open sub-submenu indices */
  openSubSubmenuIndex: { [key: number]: number | null } = {};

  /** @description Whether navbar is collapsed on mobile */
  isNavbarCollapsed = true;

  constructor(
    sidebarService: SidebarService,
    navbarService: NavbarService,
    cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.sidebarService = sidebarService;
    this.navbarService = navbarService;
    this.cdr = cdr;
    this.platformId = platformId;
  }

  get sidebarVisible$() {
    return this.sidebarService.isSidebarVisible$;
}

  // ── Host Listeners ─────────────────────────────────────────────────────────

  /**
   * @description Handles click events to close dropdowns when clicking outside.
   * @param target - Clicked element
   */
  @HostListener('click', ['$event.target'])
  click_event(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return;

    if (!this.menuItems?.length) return;

    if (!target.classList.contains('dropdown-toggle')) {
      // Closes specific menus
      this.closeOtherMenus(this.menuItems[0]);
      this.closeOtherMenus(this.menuItems[3]);
    }
  }

  /**
   * @description Closes all dropdowns when clicking outside the navbar.
   * @param event - Mouse click event
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target;
    if (!(clickedElement instanceof HTMLElement)) return;

    if (!this.menuItems?.length) return;

    if (!clickedElement.closest('.dropdown')) {
      this.menuItems.forEach((item) => this.closeOtherMenus(item));
      this.cdr.markForCheck();
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * @inheritdoc
   * @description Lifecycle hook that initializes the component and sets up subscriptions.
   *
   * **Initialization steps:**
   * 1. Waits for both menu items and current route to be ready
   * 2. Ensures menu has at least 2 items before generating breadcrumb (avoids partial/empty menus)
   * 3. Subscribes to navbar service to close dropdowns when needed
   *
   * **Why wait for at least 2 menu items?**
   * The first menu emission often contains only "Dashboard" (1 item). Waiting for ≥2 items ensures
   * the complete menu structure (including dynamic categories) is loaded before generating breadcrumbs.
   */
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Wait for both menu items AND current route to be ready
      combineLatest([this.menuReady$, this.currentRoute$])
        .pipe(
          filter(([ready, route]) => {
            // Wait for menu to have at least 2 items (complete menu, not just Dashboard)
            const hasValidMenuItems =
              ready && this.menuItems && this.menuItems.length >= 2;
            const hasRoute = !!route;

            return hasValidMenuItems && hasRoute;
          }),
          take(1), // Only need the first valid emission
        )
        .subscribe(([_, route]) => {
          this.updateBreadcrumb(route!);
        });

      // Subscribe to close dropdowns from navbar service
      this.subscriptions.add(
        this.navbarService.closeDropdowns$.subscribe((shouldClose) => {
          if (shouldClose) {
            this.menuItems.forEach((item) => this.closeOtherMenus(item));
            this.cdr.markForCheck();
          }
        }),
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // ── Navigation Methods ────────────────────────────────────────────────────

  /**
   * @description Toggles the navbar on mobile devices.
   */
  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;

    const navbarDiv = document.querySelector('#main_nav');
    if (this.isNavbarCollapsed) {
      navbarDiv?.classList.remove('show');
    } else {
      navbarDiv?.classList.add('show');
    }

    this.cdr.markForCheck();
  }

  /**
   * @description Toggles the sidebar visibility for dashboard items.
   * @param data - Menu item data
   */
  toggleSidebar(data: any) {
    if (data.name === 'Dashboard') {
      this.sidebarService.toggleSidebar();
      this.cdr.markForCheck();
    }
  }

  /**
   * @description Toggles dropdown menu visibility and manages the open paths map.
   *
   * This function implements the dropdown management logic by maintaining a key/value map
   * of opened dropdowns. When a new path is clicked, it evaluates which existing open
   * dropdowns should remain open based on parent-child relationships.
   *
   * **Logic explanation:**
   * If an already present path (opened dropdown) is contained in the current opening path,
   * then this current path is a parent and needs to remain open. If it's not contained,
   * the dropdown can be closed.
   *
   * **Example:**
   * ```
   * openPath map contains:
   *   - products
   *   - products/electronics
   *   - products/clothing
   *
   * New path clicked: /products/electronics/smartphone
   *
   * Result:
   *   - products/electronics  → is a parent, remains open
   *   - products/clothing     → is NOT a parent, gets closed
   *   - products              → is a parent, remains open
   * ```
   *
   * @param path - Current path being clicked (e.g., 'products/electronics/smartphone')
   * @param item - Menu item associated with the clicked path
   * @param lvl - Nesting level of the menu item (1 = top level, 2+ = nested)
   * @param fromNav - Whether the toggle was triggered from navbar (affects breadcrumb visibility)
   */
  toggleMenu(
    path: string,
    item: MenuItem,
    lvl: number,
    fromNav: boolean = false,
  ) {
    // Iterate through all currently open paths
    for (let key of Object.keys(this.openPath)) {
      let val = this.openPath[key];

      // If an existing open path is NOT a parent of the new path, close it
      if (!path.includes(key)) {
        val.show = false;
        delete this.openPath[path];
      }
    }

    // Add the current path to the open paths map
    this.openPath[path] = item;

    // If the item has children (submenu), toggle its visibility
    if (item.subItems) {
      item.show = !item.show;

      /*
      reasoning: if the item is closed and lvl==1 first level then u can disable the breadcrumb
      (!item.show && lvl==1) ---------------> (item.show || lvl>1) (de morgan)
      */
      // Determine if breadcrumb should be active:
      // - true if submenu is open, OR
      // - true if level > 1 (nested item), OR
      // - true if triggered from navbar
      let cond = item.show || lvl > 1 || fromNav;
      console.log('lvl: ', lvl);
      console.log('deb: ', cond);
      this.linkActive.emit(cond);

      this.cdr.markForCheck();
    }

    // If clicked item is a leaf (no children), close all parent dropdowns
    if (!item.subItems || item.subItems.length === 0) {
      // Chiude solo i parent attivi (non chiude l'intera navbar)
      this.menuItems.forEach((rootItem) => {
        if (rootItem.show) {
          this.closeOtherMenus(rootItem);
        }
      });
      this.cdr.markForCheck();
    }

    // Special handling for Dashboard - skip breadcrumb
    if (item.name === 'Dashboard') {
      return;
    }

    // Special handling for Logout - skip breadcrumb
    if (item.name === 'Logout') {
      return;
    }

    console.warn(path);
    this.updateBreadcrumb(path);
  }

  /**
   * @description Closes non-active dropdown menus recursively.
   *
   * This function traverses the menu tree and closes all submenus that are currently open.
   * It's used to ensure that only the active menu path remains open, preventing multiple
   * dropdowns from staying open simultaneously.
   *
   * The recursion ensures that if a node has children, all nested submenus are also closed,
   * maintaining a clean menu state.
   *
   * @param node - Menu item node to process. If this node has subItems,
   *               it will recursively close all child nodes.
   *
   * @example
   * ```typescript
   * // Starting from a top-level menu item
   * closeOtherMenus(productsMenu);
   * // This will close: productsMenu.subItems.electronics, productsMenu.subItems.clothing,
   * // and all their nested submenus
   * ```
   */
  closeOtherMenus(node: MenuItem) {
    // Close the current node
    node.show = false;

    // If node has children, recursively close them as well
    if (node.subItems) {
      for (let child of node.subItems) {
        // Avoid circular references and only process if child is open
        if (child !== node && child.show) {
          // Recursively close the child and its descendants
          this.closeOtherMenus(child);
        }
      }
      this.cdr.markForCheck();
    }
  }

  /**
   * @description Navigates to the given path or emits appropriate events based on menu item type.
   *
   * This function handles three types of menu items:
   * 1. **Dashboard**: Toggles the sidebar visibility instead of navigating
   * 2. **Logout**: Emits logout event to parent component
   * 3. **Parent items**: Blocks navigation (they only open/close submenus)
   * 4. **Leaf items**: Emits navigation event with the link
   *
   * @param path - Menu item to evaluate and navigate from
   *
   * @example
   * ```typescript
   * // Dashboard item → toggles sidebar
   * navigateTo({ name: 'Dashboard', link: '/dashboard' });
   *
   * // Logout item → emits logout event
   * navigateTo({ name: 'Logout' });
   *
   * // Parent item with children → does nothing (blocks navigation)
   * navigateTo({ name: 'Products', subItems: [...] });
   *
   * // Leaf item → emits navigateLink with '/products/electronics'
   * navigateTo({ name: 'Electronics', link: '/products/electronics' });
   * ```
   */
  navigateTo(path: any) {
    // Special case: Dashboard toggles sidebar, doesn't navigate
    if (path.name === 'Dashboard') {
      this.toggleSidebar(path);
      return;
    }

    // Special case: Logout emits logout event
    if (path.name === 'Logout') {
      this.logout.emit('out');
      return;
    }

    // Parent items with children should NOT navigate (only open/close submenu)
    if (path.subItems && path.subItems.length > 0) {
      return;
    }

    // Leaf item: navigate to the provided link
    if (path.link) {
      this.navigateLink.emit(path.link);
    } else {
    }
  }

  // ── Breadcrumb Methods ────────────────────────────────────────────────────

  /**
   * @description Updates the breadcrumb based on the current route link.
   *
   * This function is called when the route changes or when menu items are updated.
   * It generates a new breadcrumb list from the current path and emits it to parent components.
   * The breadcrumb helps users understand their current location within the navigation hierarchy.
   *
   * @param link - Current route link (e.g., 'products/electronics/smartphone')
   */
  updateBreadcrumb(link: string) {
    // Guard: breadcrumb cannot be generated without menu items
    if (!this.menuItems || this.menuItems.length === 0) {
      return;
    }

    // Generate breadcrumb from the current path
    const breadcrumbList = this.createBreadcrumb(link);

    // Emit to parent component for display
    this.breadcrumbChangeNav.emit(breadcrumbList);
  }

  /**
   * @description Creates a breadcrumb list by traversing the menu structure based on the current path.
   *
   * This function walks through the menu tree matching each segment of the path
   * to a menu item, building a breadcrumb trail that shows the user's current location.
   *
   * **How it works:**
   * 1. Splits the path into segments (e.g., 'advertisement/art/paintings' → ['advertisement', 'art', 'paintings'])
   * 2. For each segment, finds the matching menu item in the current level of the menu tree
   *    - Supports exact matches (e.g., 'art' matches 'Art')
   *    - Supports partial matches (e.g., 'art' matches 'Art, Books, and Collectibles')
   *    - Supports word matches within comma-separated labels
   * 3. Adds the item to the breadcrumb list preserving the original label
   * 4. Moves to the item's children for the next segment
   *
   * **Breadcrumb Disabling:**
   * - Returns empty array if menu items are not ready (less than 2 items)
   * - Returns empty array if route comes from sidebar (avoids duplication)
   *
   * @param path - Current route path (e.g., 'advertisement/art/paintings')
   * @returns Array of breadcrumb items representing the navigation trail
   *
   * @example
   * ```typescript
   * // Given path = 'advertisement/art/paintings'
   * // and menu structure: Advertisement → Art, Books, and Collectibles → Art & Paintings
   *
   * createBreadcrumb('advertisement/art/paintings');
   * // Returns:
   * // [
   * //   { label: 'Advertisement', path: 'advertisement', hasChild: true },
   * //   { label: 'Art, Books, and Collectibles', path: 'art', hasChild: true },
   * //   { label: 'Art & Paintings', path: 'paintings', hasChild: false }
   * // ]
   * ```
   */
  createBreadcrumb(path: string): BreadcrumbItem[] {
    // Guard: cannot generate breadcrumb without menu items
    if (!this.menuItems || this.menuItems.length === 0) {
      console.log('❌ createBreadcrumb: no menu items');
      return [];
    }

    if (this.menuItems.length < 2) {
      return [];
    }

    // Guard: if route comes from sidebar, breadcrumb is disabled to avoid duplication
    if (this.routeSource() === 'sidebar') {
      return [];
    }

    const breadcrumbList: BreadcrumbItem[] = [];
    const steps = path.split('/').filter(Boolean);
    let children: any = this.menuItems;

    for (const step of steps) {
      if (!children || !Array.isArray(children)) {
        break;
      }

      const node = children.find((node: { label: string }) => {
        if (!node || !node.label) return false;

        const nodeLabelLower = node.label.toLowerCase();
        const stepLower = step.toLowerCase();

        // Match esatto
        if (nodeLabelLower === stepLower) return true;

        if (nodeLabelLower.includes(stepLower)) return true;

        const words = nodeLabelLower.split(/[,\s]+/);
        if (words.includes(stepLower)) return true;

        return false;
      });

      if (!node) {
        console.error('❌ NAVBAR - node not found for step:', step);
        break;
      }

      // Move to children for next iteration
      children = node.subItems || [];

      // Add breadcrumb item
      breadcrumbList.push({
        label: node.label,
        path: node.name,
        hasChild: children && children.length > 0,
      });
    }

    return breadcrumbList;
  }
}
