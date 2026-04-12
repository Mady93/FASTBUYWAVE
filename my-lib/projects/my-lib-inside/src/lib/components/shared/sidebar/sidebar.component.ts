import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { MenuItem } from '../../../interfaces/menu-item.interface';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Router } from '@angular/router';
import { SidebarService } from '../../../services/sidebar/sidebar.service';
import { BreadcrumbItem } from '../../../interfaces/breadcrumb_item.interface';
import { NavbarService } from '../../../services/navbar/navbar.service';
import { Subject, takeUntil } from 'rxjs';

/**
 * @fileoverview Sidebar navigation component with resizable width and hierarchical menus.
 *
 * @description
 * A comprehensive sidebar component that provides:
 * - Hierarchical menu navigation with infinite nesting
 * - Resizable width with mouse/touch drag support
 * - Active path highlighting based on current route
 * - Breadcrumb generation for navigation context
 * - Integration with NavbarService for coordinated dropdown closing
 * - Filtering of inactive menu items
 * - Responsive width calculations based on screen size
 *
 * @implements {OnInit}
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-sidebar
 *   [menuItemsSidebar]="navigationItems"
 *   (breadcrumbChangeSidebar)="onBreadcrumbChange($event)"
 *   (linkClicked)="navigate($event)"
 * ></lib-sidebar>
 * ```
 */
@Component({
  selector: 'lib-sidebar',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, FontAwesomeModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
  /** @description Internal storage for sidebar menu items */
  private _menuItemsSidebar: MenuItem[] = [];

  /** @description Router instance for URL navigation */
  private router: Router;

  /** @description Sidebar service for state management */
  private sidebarService: SidebarService;

  /** @description Navbar service for coordinating dropdown closures */
  private navbarService: NavbarService;

  /** @description Change detector reference */
  private cdr: ChangeDetectorRef;

  /** @description Platform identifier for SSR detection */
  private platformId: Object;

  /** @description Subject for cleanup on destroy */
  private destroy$ = new Subject<void>();

  // ── Inputs ────────────────────────────────────────────────────────────────

  /**
   * @description Sets the sidebar menu items.
   * Filters out inactive items and updates active path based on current route.
   */
  @Input()
  set menuItemsSidebar(items: MenuItem[]) {
    if (!items) {
      this._menuItemsSidebar = [];
      return;
    }

    // @description Filter inactive items while preserving the show state
    this._menuItemsSidebar = this.filterActiveItemsKeepShow(items);

    if (this._menuItemsSidebar.length > 0) {
      this.updateActivePathForCurrentRoute();
    }
  }

  /** @description Returns the current sidebar menu items */
  get menuItemsSidebar(): MenuItem[] {
    return this._menuItemsSidebar;
  }

  /** @description Function that returns the source of the route ('navbar' or 'sidebar') */
  @Input() routeSource: () => '' | 'navbar' | 'sidebar' = () => '';

  // ── Outputs ───────────────────────────────────────────────────────────────

  /** @description Emitted when a detail is selected */
  @Output() detailSelected = new EventEmitter<any>();

  /** @description Emitted when breadcrumb changes */
  @Output() breadcrumbChangeSidebar = new EventEmitter<BreadcrumbItem[]>();

  /** @description Emitted when a link becomes active */
  @Output() linkActive = new EventEmitter<boolean>();

  /** @description Emitted when a link is clicked */
  @Output() linkClicked = new EventEmitter<string>();

  /** @description Emitted when navigating to dashboard */
  @Output() navigateDasboard = new EventEmitter<string>();

  /** @description Emitted when navigating via link */
  @Output() navigateLink = new EventEmitter<string>();

  // ── State ─────────────────────────────────────────────────────────────────

  /** @description Current sidebar width in pixels */
  sidebarWidth?: number;

  /** @description Whether sidebar is visible */
  visible?: boolean;

  /** @description Currently active menu item */
  activeItem: MenuItem | null = null;

  /** @description Currently active submenu item */
  activeSubItem: MenuItem | null = null;

  /** @description Whether user is resizing the sidebar */
  isResizing: boolean = false;

  /** @description Default sidebar width */
  defaultSidebarWidth!: number;

  /** @description Currently selected item path for highlighting */
  selItemPath: string | null = null;

  constructor(
    router: Router,
    sidebarService: SidebarService,
    navbarService: NavbarService,
    cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.router = router;
    this.sidebarService = sidebarService;
    this.navbarService = navbarService;
    this.cdr = cdr;
    this.platformId = platformId;
  }

  // ── Host Listeners ─────────────────────────────────────────────────────────

  /**
   * @description Prevents drag events on the sidebar.
   * @param event - Drag event to prevent
   */
  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent) {
    event.preventDefault();
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * @inheritdoc
   * @description Lifecycle hook: initializes component and subscribes to sidebar services.
   */
  ngOnInit() {
    this.sidebarService.sidebarWidth$
      .pipe(takeUntil(this.destroy$))
      .subscribe((width) => {
        this.sidebarWidth = width;
        this.defaultSidebarWidth = width;
        this.cdr.markForCheck();
      });

    // Subscribe to sidebar visibility changes
    this.sidebarService.isSidebarVisible$
      .pipe(takeUntil(this.destroy$))
      .subscribe((visible) => {
        if (!visible && this.sidebarWidth !== undefined) {
          this.sidebarService.resetSidebarWidth(this.sidebarWidth);
        } else {
          this.visible = visible;
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * @inheritdoc
   * @description Lifecycle hook: cleans up subscriptions.
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Path Management ────────────────────────────────────────────────────────

  /**
   * @description Updates the active path based on the current browser URL.
   * Used to highlight the correct menu item when navigating from outside the sidebar.
   */
  updateActivePathForCurrentRoute() {
    const currentUrl = this.router.url;

    // Remove leading slash and map to sidebar path structure
    let currentPath = currentUrl.startsWith('/')
      ? currentUrl.substring(1)
      : currentUrl;

    if (currentPath === 'dashboard') {
      this.selItemPath = 'Dashboard';
      this.linkActive.emit(true);
    } else if (currentPath.includes('/')) {
      // Convert route path to sidebar path format
      const pathParts = currentPath.split('/');
      let sidebarPath = '';

      // Map URL parts to menu item names
      for (let i = 0; i < pathParts.length; i++) {
        const part = this.capitalizeFirstLetter(pathParts[i]);
        sidebarPath = sidebarPath ? `${sidebarPath}/${part}` : part;
      }

      this.selItemPath = sidebarPath;
      this.linkActive.emit(true);

      // Make sure breadcrumbs are updated
      this.updateBreadcrumb(sidebarPath);
    }
  }

  /**
   * @description Capitalizes the first letter of a string.
   * @param string - Input string
   * @returns String with first letter capitalized
   */
  capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // ── Menu Interaction ───────────────────────────────────────────────────────

  /**
   * @description Toggles the visibility of a menu item's submenu.
   * @param item - Menu item to toggle
   */
  toggleSidebar(item: MenuItem) {
    console.log(item);
    item.show = !item.show;
    this.cdr.markForCheck();
  }

  /**
   * @description Recursively closes all children of a given node.
   * Used to clean up open submenus when a parent is collapsed.
   *
   * @param node - Menu node whose children should be closed
   */
  closeChildren(node: MenuItem) {
    if (node.subItems) {
      for (let child of node.subItems) {
        if (child.show) {
          child.show = false;
          this.closeChildren(child);
        }
      }
    }
    this.cdr.markForCheck();
  }

  /**
   * @description Handles selection of a menu item or section.
   *
   * This function manages:
   * - Setting the active path for highlighting
   * - Toggling submenu visibility
   * - Closing children when collapsing
   * - Emitting navigation events for leaf nodes
   * - Coordinating with navbar to close its dropdowns
   * - Updating breadcrumb
   *
   * @param subItem - The selected menu item
   * @param path - The full path of the selected item (e.g., 'Products/Electronics')
   */
  sectionAction(subItem: MenuItem, path: string) {
    let isMarketplace = path == 'Marketplace';

    this.selItemPath = path;
    subItem.show = !subItem.show;

    // If collapsing, close all children and reset active path
    if (!subItem.show) {
      this.closeChildren(subItem);
      this.selItemPath = null;
      this.linkActive.emit(false);

      // Extract parent path for breadcrumb
      let barPos = path.lastIndexOf('/');
      if (barPos >= 0) {
        path = path.substring(0, barPos);
      }

      // Special handling for Marketplace
      if (isMarketplace) {
        path = '/dashboard';
        this.navigateDasboard.emit(path);
      }
    } else {
      // When expanding, emit that a link is active
      this.linkActive.emit(true);
    }

    this.updateBreadcrumb(path);

    // If it's a leaf node (no children) with a link, navigate
    if (!subItem.subItems || subItem.subItems.length === 0) {
      if (subItem.link) {
        this.navigateLink.emit(subItem.link);
      }
    }

    // Close any open dropdowns in the navbar for better UX
    this.navbarService.closeDropdowns(true);
    this.cdr.markForCheck();
  }

  // ── Resize Functionality ───────────────────────────────────────────────────

  /**
   * @description Handles mouse move during sidebar resize.
   * Updates sidebar width within min/max constraints.
   *
   * @param event - Mouse move event
   */
  resizeSidebar = (event: MouseEvent): void => {
    if (this.isResizing) {
      const newWidth = event.clientX;
      const minWidth = this.sidebarService.getInitialSidebarWidth();
      const maxWidth = this.sidebarService.getMaxWidth();

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        this.sidebarService.resetSidebarWidth(newWidth);
        this.cdr.markForCheck();
      }
    }
  };

  /**
   * @description Starts sidebar resize on mouse down.
   * Prevents text selection and attaches move/up event listeners.
   *
   * @param event - Mouse down event
   */
  startResize(event: MouseEvent): void {
    event.preventDefault();
    this.isResizing = true;

    const body = document.body;
    body.classList.add('disable-text-selection');

    document.addEventListener('mousemove', this.resizeSidebar);
    document.addEventListener('mouseup', this.stopResize);
  }

  /**
   * @description Stops sidebar resize on mouse up.
   * Removes event listeners and restores text selection.
   */
  stopResize = (): void => {
    this.isResizing = false;

    const body = document.body;
    body.classList.remove('disable-text-selection');

    document.removeEventListener('mousemove', this.resizeSidebar);
    document.removeEventListener('mouseup', this.stopResize);
    this.cdr.markForCheck();
  };

  /**
   * @description Starts sidebar resize on touch start (for touch devices).
   * @param event - Touch start event
   */
  startTouchResize(event: TouchEvent): void {
    event.preventDefault();
    this.isResizing = true;

    document.addEventListener('touchmove', this.resizeSidebarTouch);
    document.addEventListener('touchend', this.stopTouchResize);
  }

  /**
   * @description Handles touch move during sidebar resize.
   * @param event - Touch move event
   */
  resizeSidebarTouch = (event: TouchEvent): void => {
    if (this.isResizing) {
      const touch = event.touches[0];
      const newWidth = touch.clientX;
      const minWidth = this.sidebarService.getInitialSidebarWidth();
      const maxWidth = this.sidebarService.getMaxWidth();

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        this.sidebarService.resetSidebarWidth(newWidth);
        this.cdr.markForCheck();
      }
    }
  };

  /**
   * @description Stops sidebar resize on touch end.
   */
  stopTouchResize = (): void => {
    this.isResizing = false;

    document.removeEventListener('touchmove', this.resizeSidebarTouch);
    document.removeEventListener('touchend', this.stopTouchResize);
    this.cdr.markForCheck();
  };

  // ── Breadcrumb ────────────────────────────────────────────────────────────

  /**
   * @description Updates the breadcrumb based on the current path.
   * Emits the breadcrumb list to parent components.
   *
   * @param path - Current navigation path
   */
  updateBreadcrumb(path: string) {
    if (isPlatformBrowser(this.platformId)) {
      const breadcrumbList = this.createBreadcrumb(path);
      this.breadcrumbChangeSidebar.emit(breadcrumbList);
    }
  }

  /**
   * @description Creates a breadcrumb list by traversing the menu structure.
   *
   * This function walks through the menu tree matching each segment of the path
   * to build a navigation trail. It skips breadcrumb generation when the route
   * source is navbar to avoid duplication.
   *
   * @param path - Current navigation path (e.g., 'Products/Electronics/Smartphone')
   * @returns Array of breadcrumb items representing the navigation trail
   */
  createBreadcrumb(path: string): BreadcrumbItem[] {
    if (path.toLowerCase().includes('advertisement')) {
      return [];
    }

    // Prevent breadcrumb if route comes from navbar (avoid duplication)
    if (this.routeSource() === 'navbar') {
      console.log('Breadcrumb disabilitato: route viene dalla navbar');
      return [];
    }

    const breadcrumbList: BreadcrumbItem[] = [];
    const steps = path.split('/');

    // Special case: dashboard path
    if (path === '/dashboard') {
      breadcrumbList.push({
        label: 'Dashboard',
        path: 'Dashboard',
        hasChild: false,
      });
      return breadcrumbList;
    }

    let children: any = this.menuItemsSidebar;

    if (children) {
      for (const step of steps) {
        console.log('Step cercato:', step);
        console.log(
          'Nomi figli disponibili:',
          children.map((c: any) => c.name),
        );
        let node = children.find(
          (node: { name: string }) => node.name === step,
        );

        if (node == null) {
          console.error('❌ SIDEBAR - node not found for step:', step);
          continue;
        }

        children = node.subItems || [];

        breadcrumbList.push({
          label: node.label,
          path: node.name,
          hasChild: children.length > 0,
        });
      }
    }
    return breadcrumbList;
  }

  // ── Filtering ──────────────────────────────────────────────────────────────

  /**
   * @description Filters a menu tree keeping only active items while preserving the show state.
   *
   * This function recursively traverses the menu tree and:
   * - Removes items where `active` is false
   * - Keeps active items and their active children
   * - Preserves the `show` property for UI state
   *
   * @param items - Array of menu items to filter
   * @returns Filtered array containing only active menu items
   */
  filterActiveItemsKeepShow(items: MenuItem[]): MenuItem[] {
    return items
      .map((item) => {
        const newItem: MenuItem = { ...item };

        // If node is not active, discard it entirely
        if (!newItem.active) {
          return null;
        }

        // If active, recursively filter children
        if (newItem.subItems && newItem.subItems.length) {
          newItem.subItems = this.filterActiveItemsKeepShow(newItem.subItems);
        }

        return newItem;
      })
      .filter((item) => item !== null) as MenuItem[];
  }
}
