import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * @fileoverview Service for managing navbar dropdown state.
 *
 * @description
 * Provides inter-component communication for closing dropdown menus.
 * Used to coordinate between sidebar and navbar components so that
 * when one component opens a menu, the other can close its menus.
 *
 * @category Services
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * // Close all navbar dropdowns from sidebar
 * constructor(private navbarService: NavbarService) {}
 *
 * closeNavbarDropdowns() {
 *   this.navbarService.closeDropdowns(true);
 * }
 *
 * // Subscribe to close events
 * this.navbarService.closeDropdowns$.subscribe(shouldClose => {
 *   if (shouldClose) {
 *     // Close all navbar dropdowns
 *   }
 * });
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class NavbarService {
  /** @description Subject for emitting close dropdown events */
  private closeDropdownSubject = new Subject<boolean>();

  /** @description Observable for listening to close dropdown events */
  closeDropdowns$ = this.closeDropdownSubject.asObservable();

  /**
   * @description Emits an event to close navbar dropdowns.
   * Typically called from sidebar when a menu item is selected.
   *
   * @param close - Boolean indicating whether dropdowns should close
   */
  closeDropdowns(close: boolean) {
    this.closeDropdownSubject.next(close);
  }
}
