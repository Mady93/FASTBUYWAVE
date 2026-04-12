import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

/**
 * @fileoverview Pagination component wrapping Angular Material paginator.
 *
 * @description
 * A reusable pagination component that wraps Angular Material's MatPaginator.
 * Provides page navigation controls with configurable page sizes, first/last buttons,
 * and range display. Emits page change events to parent components.
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-pagination
 *   [totalItems]="totalProducts"
 *   [pageSize]="itemsPerPage"
 *   [pageSizeOptions]="[5, 10, 25, 50]"
 *   [currentPage]="currentPage"
 *   (pageChanged)="onPageChange($event)"
 * ></lib-pagination>
 * ```
 *
 * @example
 * ```typescript
 * // In your component
 * onPageChange(event: { pageIndex: number; pageSize: number }) {
 *   this.currentPage = event.pageIndex;
 *   this.itemsPerPage = event.pageSize;
 *   this.loadData();
 * }
 * ```
 */
@Component({
  selector: 'lib-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatPaginatorModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  /** @description Total number of items across all pages */
  @Input() totalItems: number = 0;

  /** @description Number of items to display per page */
  @Input() pageSize: number = 1;

  /** @description Options available for page size selection (e.g., [5, 10, 25, 50]) */
  @Input() pageSizeOptions: number[] = [];

  /** @description Current active page index (0-based) */
  @Input() currentPage: number = 0;

  /** @description Emitted when page index or page size changes */
  @Output() pageChanged = new EventEmitter<{
    pageIndex: number;
    pageSize: number;
  }>();

  /** @description Change detector reference for manual change detection */
  private cdr: ChangeDetectorRef;

  constructor(cdr: ChangeDetectorRef) {
    this.cdr = cdr;
  }

  /**
   * @description Label for the first page button.
   * @returns String 'Start'
   */
  get firstPageLabel(): string {
    return 'Start';
  }

  /**
   * @description Label for the last page button.
   * @returns String 'End'
   */
  get lastPageLabel(): string {
    return 'End';
  }

  /**
   * @description Label for the next page button.
   * @returns String 'Next'
   */
  get nextPageLabel(): string {
    return 'Next';
  }

  /**
   * @description Label for the previous page button.
   * @returns String 'Previous'
   */
  get previousPageLabel(): string {
    return 'Previous';
  }

  /**
   * @description Generates the range label displayed in the paginator (e.g., "1 - 10 of 100").
   *
   * @param page - Current page index (0-based)
   * @param pageSize - Number of items per page
   * @param length - Total number of items
   * @returns Formatted range string
   *
   * @example
   * ```typescript
   * getRangeLabel(0, 10, 100)  // returns "1 - 10 di 100"
   * getRangeLabel(2, 10, 45)   // returns "21 - 30 di 45"
   * getRangeLabel(0, 0, 0)     // returns "0 di 0"
   * ```
   */
  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0 || pageSize === 0) {
      return `0 di ${length}`;
    }
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    return `${startIndex + 1} - ${endIndex} di ${length}`;
  }

  /**
   * @description Handles page change events from the Material paginator.
   * Updates internal state and emits the new page index and size to parent.
   *
   * @param event - PageEvent containing pageIndex, pageSize, and length
   */
  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    this.pageChanged.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });

    this.cdr.markForCheck();
  }
}
