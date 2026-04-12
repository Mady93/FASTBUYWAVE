import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { TableAction } from '../../../interfaces/modal/table_action.interface';

/**
 * @fileoverview Tree/hierarchical data layout component with skeleton loading and pagination.
 *
 * @description
 * A layout component designed for displaying hierarchical or tree-structured data.
 * Provides:
 * - Header with title, subtitle, and action buttons
 * - Skeleton loading animation
 * - Empty state with custom messaging
 * - Content projection for custom tree rendering
 * - Integrated pagination for large datasets
 * - Content projection slots for elements above actions
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-tree-list-layout
 *   [title]="'Categories'"
 *   [subtitle]="'Product categories hierarchy'"
 *   [actions]="treeActions"
 *   [loading]="isLoading"
 *   [pageable]="true"
 *   [totalItems]="totalCategories"
 *   [pageSize]="10"
 *   (actionClicked)="onAction($event)"
 *   (pageChanged)="onPageChange($event)"
 * >
 *   <div above-actions>
 *     <div class="breadcrumb">Home / Categories</div>
 *   </div>
 *
 *   <ng-template #treeContent>
 *     <app-category-tree [categories]="categories"></app-category-tree>
 *   </ng-template>
 * </lib-tree-list-layout>
 * ```
 *
 * @example
 * ```typescript
 * // In your component
 * treeActions: TableAction[] = [
 *   { id: 'add', label: 'Add Category', type: 'primary', icon: '✚' },
 *   { id: 'expand', label: 'Expand All', type: 'secondary' },
 *   { id: 'collapse', label: 'Collapse All', type: 'secondary' }
 * ];
 *
 * onAction(actionId: string) {
 *   switch(actionId) {
 *     case 'add':
 *       this.openAddDialog();
 *       break;
 *     case 'expand':
 *       this.expandAll();
 *       break;
 *     case 'collapse':
 *       this.collapseAll();
 *       break;
 *   }
 * }
 * ```
 */
@Component({
  selector: 'lib-tree-list-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
    EmptyStateComponent,
    PaginationComponent,
  ],
  templateUrl: './tree-list-layout.component.html',
  styleUrl: './tree-list-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeListLayoutComponent {
  // ── Header Configuration ───────────────────────────────────────────────────

  /** @description Title displayed in the header */
  @Input() title: string = '';

  /** @description Optional subtitle displayed below the title */
  @Input() subtitle?: string;

  /** @description Action buttons displayed in the header */
  @Input() actions: TableAction[] = [];

  /** @description Whether the component is in loading state (shows skeleton) */
  @Input() loading: boolean = false;

  // ── Empty State Configuration ──────────────────────────────────────────────

  /** @description Custom message displayed when empty */
  @Input() emptyStateMessage?: string;

  /** @description Custom subtitle displayed when empty */
  @Input() emptyStateSubtitle?: string;

  /** @description Custom logo URL for empty state */
  @Input() emptyStateLogo?: string;

  /** @description Function that determines if the content is empty */
  @Input() isEmptyStateFn?: () => boolean;

  /** @description Function that returns the logo source for empty state */
  @Input() getLogoSrcFn?: () => string;

  // ── Pagination Configuration ───────────────────────────────────────────────

  /** @description Enables pagination controls */
  @Input() pageable: boolean = false;

  /** @description Total number of items across all pages */
  @Input() totalItems: number = 0;

  /** @description Number of items per page */
  @Input() pageSize: number = 10;

  /** @description Current page index (0-based) */
  @Input() currentPage: number = 0;

  /** @description Options available for page size selection */
  @Input() pageSizeOptions: number[] = [5, 10, 15, 20];

  // ── Outputs ────────────────────────────────────────────────────────────────

  /** @description Emitted when an action button is clicked (emits action ID) */
  @Output() actionClicked = new EventEmitter<string>();

  /** @description Emitted when pagination changes (page index or size) */
  @Output() pageChanged = new EventEmitter<any>();

  // ── Content Projection ────────────────────────────────────────────────────

  /**
   * @description Template for the main tree/hierarchical content.
   * Projected content will be rendered when not loading and not empty.
   */
  @ContentChild('treeContent') treeContentTemplate?: TemplateRef<any>;

  // ── Computed Properties ───────────────────────────────────────────────────

  /**
   * @description Determines if the content is empty.
   * Uses custom function if provided, otherwise returns false.
   * @returns True if content is empty
   */
  get isEmpty(): boolean {
    return this.isEmptyStateFn ? this.isEmptyStateFn() : false;
  }

  /**
   * @description Gets the logo source for empty state.
   * Uses custom function if provided, otherwise returns the static logo URL.
   * @returns Logo source string
   */
  getLogoSrc(): string {
    return this.getLogoSrcFn ? this.getLogoSrcFn() : this.emptyStateLogo || '';
  }

  /**
   * @description Array of row indices for skeleton loading animation.
   * Creates 5 skeleton rows during loading state.
   */
  skeletonRows = [1, 2, 3, 4, 5];
}
