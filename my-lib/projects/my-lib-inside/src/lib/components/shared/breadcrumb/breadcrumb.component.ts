import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BreadcrumbItem } from '../../../interfaces/breadcrumb_item.interface';

/**
 * @fileoverview Breadcrumb navigation component.
 *
 * @description
 * A navigation component that displays hierarchical paths for both sidebar and navbar contexts.
 * Provides visual indication of current location within the application and allows navigation
 * to parent pages. Supports different styling for dashboard items and child pages.
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <!-- Using with sidebar breadcrumb -->
 * <lib-breadcrumb
 *   [breadcrumbListSidebar]="[
 *     { path: 'Home', label: 'Home', hasChild: false },
 *     { path: 'Products', label: 'Products', hasChild: false },
 *     { path: 'Details', label: 'Details', hasChild: true }
 *   ]"
 * ></lib-breadcrumb>
 * ```
 *
 * @example
 * ```typescript
 * // In your component
 * sidebarItems: BreadcrumbItem[] = [
 *   { path: 'Dashboard', label: 'Dashboard', hasChild: false },
 *   { path: 'Settings', label: 'Settings', hasChild: true }
 * ];
 *
 * navbarItems: BreadcrumbItem[] = [
 *   { path: 'Profile', label: 'Profile', hasChild: false }
 * ];
 * ```
 */
@Component({
  selector: 'lib-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  /**
   * @description Breadcrumb items for sidebar context.
   * Displayed when the list is not empty.
   */
  @Input() breadcrumbListSidebar: BreadcrumbItem[] = [];

  /**
   * @description Breadcrumb items for navbar context.
   * Displayed when the list is not empty.
   */
  @Input() breadcrumbListNavbar: BreadcrumbItem[] = [];
}
