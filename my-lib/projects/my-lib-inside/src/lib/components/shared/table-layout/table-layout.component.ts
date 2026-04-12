import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { TableColumn } from '../../../interfaces/modal/table_column.interface';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaginationComponent } from '../pagination/pagination.component';
import { TableAction } from '../../../interfaces/modal/table_action.interface';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

/**
 * @fileoverview Reusable table component with skeleton loading, pagination, and selection.
 *
 * @description
 * A feature-rich table component that provides:
 * - Configurable columns with custom templates
 * - Row selection (single/multiple)
 * - Action buttons in header and row level
 * - Skeleton loading animation
 * - Empty state with custom messaging
 * - Integrated pagination
 * - Custom cell templates for complex data rendering
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-table-layout
 *   [title]="'Users'"
 *   [data]="users"
 *   [columns]="columns"
 *   [actions]="tableActions"
 *   [selectable]="true"
 *   [pageable]="true"
 *   [totalItems]="totalUsers"
 *   (actionClicked)="onAction($event)"
 *   (rowClick)="onRowClick($event)"
 *   (selectionChange)="onSelectionChange($event)"
 * >
 *   <ng-template #customCell let-row="row" let-column="column">
 *     <span class="badge" [class.active]="row.active">
 *       {{ row.active ? 'Active' : 'Inactive' }}
 *     </span>
 *   </ng-template>
 * </lib-table-layout>
 * ```
 *
 * @example
 * ```typescript
 * // In your component
 * columns: TableColumn[] = [
 *   { field: 'id', label: 'ID', width: '80px' },
 *   { field: 'name', label: 'Name', minWidth: '150px' },
 *   { field: 'email', label: 'Email', template: true }
 * ];
 *
 * tableActions: TableAction[] = [
 *   { id: 'add', label: 'Add User', type: 'primary', icon: '♜' },
 *   { id: 'delete', label: 'Delete', type: 'danger', disabled: true }
 * ];
 * ```
 */
@Component({
  selector: 'lib-table-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PaginationComponent,
    EmptyStateComponent,
  ],
  templateUrl: './table-layout.component.html',
  styleUrl: './table-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableLayoutComponent {
  // ── Inputs ────────────────────────────────────────────────────────────────

  /** @description Table title displayed in the header */
  @Input() title: string = '';

  /** @description Optional subtitle displayed below the title */
  @Input() subtitle?: string;

  /** @description Array of data rows to display in the table */
  @Input() data: any[] = [];

  /** @description Column definitions for the table */
  @Input() columns: TableColumn[] = [];

  /** @description Action buttons displayed in the header */
  @Input() actions: TableAction[] = [];

  /** @description Whether the table is in loading state (shows skeleton) */
  @Input() loading: boolean = false;

  /** @description Icon name for empty state */
  @Input() emptyStateIcon: string = 'table_rows';

  /** @description Enables row selection checkboxes */
  @Input() selectable: boolean = false;

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

  /** @description Custom message for empty state */
  @Input() emptyStateMessage?: string;

  /** @description Custom subtitle for empty state */
  @Input() emptyStateSubtitle?: string;

  /** @description Custom logo for empty state */
  @Input() emptyStateLogo?: string;

  // ── Functions passed from consumer for empty state ────────────────────────

  /** @description Function that returns whether the table is empty (for custom logic) */
  @Input() isEmptyStateFn?: () => boolean;

  /** @description Function that returns the logo source for empty state */
  @Input() getLogoSrcFn?: () => string;

  // ── Outputs ───────────────────────────────────────────────────────────────

  /** @description Emitted when an action button is clicked (emits action ID) */
  @Output() actionClicked = new EventEmitter<string>();

  /** @description Emitted when pagination changes (page index or size) */
  @Output() pageChanged = new EventEmitter<any>();

  /** @description Emitted when a row is clicked */
  @Output() rowClick = new EventEmitter<any>();

  /** @description Emitted when row selection changes (emits array of selected rows) */
  @Output() selectionChange = new EventEmitter<any[]>();

  // ── Content Projection ────────────────────────────────────────────────────

  /** @description Template for custom action buttons in each row */
  @ContentChild('actionButtons') actionButtonsTemplate?: TemplateRef<any>;

  /** @description Template for custom cell rendering */
  @ContentChild('customCell') customCellTemplate?: TemplateRef<any>;

  // ── State ─────────────────────────────────────────────────────────────────

  /** @description Set of currently selected rows */
  selectedRows: Set<any> = new Set();

  // ── Computed Properties ───────────────────────────────────────────────────

  /**
   * @description Determines if the table is empty (no data).
   * @returns True if data is empty or undefined
   */
  get isEmpty(): boolean {
    return !this.data || this.data.length === 0;
  }

  /**
   * @description Returns columns for skeleton loading.
   * Uses actual columns if available, otherwise creates 5 placeholder columns.
   * @returns Array of columns or placeholder array
   */
  get skeletonCols(): any[] {
    return this.columns.length > 0 ? this.columns : Array(5).fill(0);
  }

  /**
   * @description Returns number of rows for skeleton loading.
   * @returns Array of 5 rows for skeleton
   */
  get skeletonRows(): number[] {
    return [1, 2, 3, 4, 5];
  }

  // ── Selection Methods ─────────────────────────────────────────────────────

  /**
   * @description Toggles selection of a single row.
   * Emits the updated selection set.
   *
   * @param row - Row data to toggle
   */
  toggleRow(row: any): void {
    if (!this.selectable) return;
    if (this.selectedRows.has(row)) {
      this.selectedRows.delete(row);
    } else {
      this.selectedRows.add(row);
    }
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  /**
   * @description Toggles selection of all rows in the current page.
   * If all are selected, clears selection; otherwise selects all.
   */
  toggleAll(): void {
    if (this.selectedRows.size === this.data.length) {
      this.selectedRows.clear();
    } else {
      this.data.forEach((row) => this.selectedRows.add(row));
    }
    this.selectionChange.emit(Array.from(this.selectedRows));
  }

  /**
   * @description Checks if a specific row is selected.
   * @param row - Row data to check
   * @returns True if row is selected
   */
  isSelected(row: any): boolean {
    return this.selectedRows.has(row);
  }

  /**
   * @description Checks if all rows on current page are selected.
   * @returns True if all rows are selected
   */
  isAllSelected(): boolean {
    return this.data.length > 0 && this.selectedRows.size === this.data.length;
  }

  /**
   * @description Checks if the selection is in indeterminate state.
   * @returns True if some but not all rows are selected
   */
  isIndeterminate(): boolean {
    return (
      this.selectedRows.size > 0 && this.selectedRows.size < this.data.length
    );
  }
}
