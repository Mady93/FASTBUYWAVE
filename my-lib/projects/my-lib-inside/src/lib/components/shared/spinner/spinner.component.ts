import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * @fileoverview Loading spinner overlay component.
 *
 * @description
 * A full-screen overlay spinner component that displays a loading animation
 * when data is being fetched or operations are in progress.
 * The overlay covers the entire viewport with a semi-transparent background
 * and shows a rotating image/icon.
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-spinner
 *   [isLoading]="isLoading"
 *   [spinner]="spinnerUrl"
 * ></lib-spinner>
 * ```
 *
 * @example
 * ```typescript
 * // In your component
 * isLoading = false;
 * spinnerUrl = 'assets/images/spinner.svg';
 *
 * loadData() {
 *   this.isLoading = true;
 *   this.api.getData().subscribe({
 *     next: (data) => {
 *       this.data = data;
 *       this.isLoading = false;
 *     },
 *     error: () => {
 *       this.isLoading = false;
 *     }
 *   });
 * }
 * ```
 */
@Component({
  selector: 'lib-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  /**
   * @description Function or string that returns the spinner image URL.
   * Can be a direct URL string or a function that returns the URL.
   *
   * @example
   * ```typescript
   * // Direct string
   * spinner = 'assets/images/loader.svg'
   *
   * // Function that returns URL
   * spinner = () => this.getSpinnerUrl()
   * ```
   */
  @Input() spinner: Function = () => {};

  /**
   * @description Function or boolean that controls spinner visibility.
   * Can be a direct boolean or a function that returns a boolean.
   * When true, shows the overlay spinner.
   *
   * @example
   * ```typescript
   * // Direct boolean
   * isLoading = true
   *
   * // Function that returns boolean
   * isLoading = () => this.isDataLoading()
   * ```
   */
  @Input() isLoading: Function = () => {};
}
