import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * @fileoverview Service for managing sidebar state.
 *
 * @description
 * Provides reactive state management for sidebar visibility and width.
 * Handles responsive width calculations based on screen size and
 * provides methods for toggling sidebar and resizing.
 *
 * @category Services
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * // Toggle sidebar visibility
 * constructor(private sidebarService: SidebarService) {}
 *
 * toggleSidebar() {
 *   this.sidebarService.toggleSidebar();
 * }
 *
 * // Subscribe to sidebar visibility changes
 * this.sidebarService.isSidebarVisible$.subscribe(visible => {
 *   console.log('Sidebar visible:', visible);
 * });
 *
 * // Subscribe to width changes
 * this.sidebarService.sidebarWidth$.subscribe(width => {
 *   this.sidebarWidth = width;
 * });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  /** @description Subject for sidebar visibility state */
  private isSidebarVisibleSubject = new BehaviorSubject<boolean>(true);

  /** @description Subject for sidebar width state */
  private sidebarWidthSubject = new BehaviorSubject<number>(250);

  /** @description Observable for sidebar visibility */
  isSidebarVisible$ = this.isSidebarVisibleSubject.asObservable();

  /** @description Observable for sidebar width */
  sidebarWidth$ = this.sidebarWidthSubject.asObservable();

  /**
   * @constructor
   * @description Initializes the service and sets up responsive width calculation.
   * On browser, sets initial width based on screen size and listens for resize events.
   *
   * @param platformId - Platform identifier for SSR detection
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const width = this.getInitialSidebarWidth();
      this.sidebarWidthSubject.next(width);

      // Update width when window is resized
      window.addEventListener('resize', () => {
        const newWidth = this.getInitialSidebarWidth();
        this.sidebarWidthSubject.next(newWidth);
      });
    }
  }

  /**
   * @description Toggles the sidebar visibility.
   * Emits the opposite of the current state.
   */
  toggleSidebar() {
    const currentValue = this.isSidebarVisibleSubject.getValue();
    this.isSidebarVisibleSubject.next(!currentValue);
  }

  /**
   * @description Sets the sidebar visibility explicitly.
   * @param visible - Whether sidebar should be visible
   */
  setSidebarVisibility(visible: boolean) {
    this.isSidebarVisibleSubject.next(visible);
  }

  /**
   * @description Resets the sidebar width.
   * @param value - New width value in pixels
   */
  resetSidebarWidth(value: number) {
    this.sidebarWidthSubject.next(value);
  }

  /**
   * @description Calculates initial sidebar width based on screen size.
   * Returns different widths for different device breakpoints.
   *
   * @returns Width in pixels
   */
  getInitialSidebarWidth(): number {
    if (isPlatformBrowser(this.platformId)) {
      const width = window.innerWidth;

      // Breakpoints aligned with CSS media queries
      if (width <= 320) return 110; // Very small mobile
      if (width <= 375) return 110; // Small mobile
      if (width <= 412) return 110; // Medium mobile
      if (width <= 429) return 180; // Large mobile
      if (width <= 720) return 220; // Tablet
      if (width <= 1024) return 250; // Tablet landscape / small laptop
    }
    return 250; // Desktop default
  }

  /**
   * @description Gets the maximum allowed sidebar width for the current screen size.
   * Used during resize operations to constrain the width.
   *
   * @returns Maximum width in pixels
   */
  getMaxWidth(): number {
    if (isPlatformBrowser(this.platformId)) {
      const width = window.innerWidth;
      if (width <= 320) return 140;
      if (width <= 375) return 140;
      if (width <= 412) return 140;
      if (width <= 429) return 160;
      if (width <= 720) return 280;
      if (width <= 1024) return 350;
    }
    return 500; // Desktop max width
  }
}
