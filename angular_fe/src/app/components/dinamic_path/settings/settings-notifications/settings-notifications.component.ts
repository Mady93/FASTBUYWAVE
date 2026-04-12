import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * @category Components
 * 
 * @description
 * Manages the user notification settings page. This component:
 * - Receives the current category from the DashboardComponent via ngComponentOutletInputs.
 * - Provides a placeholder for future notification-related logic.
 * - Designed as a standalone Angular component with OnPush change detection.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 */
@Component({
  selector: 'app-settings-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-notifications.component.html',
  styleUrl: './settings-notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsNotificationsComponent {
  /**
   * @property category
   * @description The current category passed from the DashboardComponent via `ngComponentOutletInputs`.
   *
   * @source - DashboardComponent template:
   * ```html
   * <ng-container
   *   [ngComponentOutlet]="currentComponent"
   *   [ngComponentOutletInputs]="{ category: currentCategory }">
   * </ng-container>
   * ```
   *
   * @purpose - Represents the current route value (e.g., 'contact-requests', 'products', 'users').
   * @usage - Not directly used in this component's template yet, but available for future logic.
   * @type {string}
   */
  @Input() category!: string;
}
