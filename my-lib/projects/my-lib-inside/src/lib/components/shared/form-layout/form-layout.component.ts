import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BehaviorSubject } from 'rxjs';
import { ModalAction } from '../../../interfaces/modal/modal_action.interface';

/**
 * @fileoverview Form layout component with loading skeleton and action buttons.
 *
 * @description
 * A flexible form layout component that provides:
 * - Responsive grid layout with configurable columns
 * - Loading skeleton with standard or tree/recursive mode
 * - Action buttons with loading states
 * - Content projection for custom form fields
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-form-layout
 *   [title]="'Create Product'"
 *   [subtitle]="'Fill in the product details'"
 *   [columns]="2"
 *   [actions]="actions"
 *   (actionClicked)="onAction($event)"
 * >
 *   <input formControlName="name" placeholder="Product name" />
 *   <input formControlName="price" placeholder="Price" />
 * </lib-form-layout>
 * ```
 *
 * @example
 * ```typescript
 * // With recursive mode (tree structure)
 * <lib-form-layout
 *   [title]="'Edit Categories'"
 *   [recursive]="true"
 *   [loading]="isLoading"
 * >
 *   <app-category-tree></app-category-tree>
 * </lib-form-layout>
 * ```
 */
@Component({
  selector: 'lib-form-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './form-layout.component.html',
  styleUrl: './form-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormLayoutComponent {
  /** @description Change detector reference for manual change detection */
  private cdr: ChangeDetectorRef;

  /** @description Internal subject for loading state */
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  /** @description Title displayed in the mat-card-header */
  @Input() title: string = '';

  /** @description Optional subtitle displayed below the title */
  @Input() subtitle?: string;

  /**
   * @description Number of columns in the responsive grid.
   * Default is 4.
   * - Below 1400px: collapses to 2 columns
   * - Below 768px: collapses to 1 column
   */
  @Input() columns: number = 4;

  /**
   * @description List of action buttons in the footer.
   * Uses the same ModalAction interface as lib-modal.
   */
  @Input() actions: ModalAction[] = [];

  /** @description URL of the spinner image (defaults to library asset) */
  @Input() spinnerUrl: string = '/t.png';

  /**
   * @description Enables recursive/tree mode skeleton.
   * Use for forms with nested or hierarchical structures.
   */
  @Input() recursive: boolean = false;

  /** @description Emits the ID of the clicked action button */
  @Output() actionClicked = new EventEmitter<string>();

  /**
   * @description Controls the loading overlay visibility.
   * When true, displays skeleton loader instead of content.
   */
  @Input() set loading(value: boolean) {
    this.isLoadingSubject.next(value);
    this.cdr.markForCheck();
  }

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  /**
   * @description Computes the CSS grid-template-columns value.
   * @returns CSS string like 'repeat(4, 1fr)'
   */
  get gridColumns(): string {
    return `repeat(${this.columns}, 1fr)`;
  }

  /**
   * @description Returns the current loading state.
   * @returns True if loading is active
   */
  get isLoading(): boolean {
    return this.isLoadingSubject.value;
  }

  /**
   * @description Returns the gradient CSS class based on recursive mode.
   * @returns 'gradient-recursive' or 'gradient-standard'
   */
  get gradientClass(): string {
    return this.recursive ? 'gradient-recursive' : 'gradient-standard';
  }
}
