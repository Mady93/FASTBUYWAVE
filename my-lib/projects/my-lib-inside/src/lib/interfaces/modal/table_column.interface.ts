/**
 * @fileoverview Table column configuration interface.
 *
 * @description
 * Defines the structure for table columns, including field mapping,
 * display labels, sizing, sorting, and template options.
 * Used by TableLayoutComponent to render and configure table columns.
 *
 * @category Interfaces
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * const columns: TableColumn[] = [
 *   {
 *     field: 'id',
 *     label: 'ID',
 *     width: '80px',
 *     sortable: true
 *   },
 *   {
 *     field: 'name',
 *     label: 'Name',
 *     minWidth: '150px',
 *     sortable: true
 *   },
 *   {
 *     field: 'email',
 *     label: 'Email',
 *     template: true  // Uses custom template for complex rendering
 *   },
 *   {
 *     field: 'status',
 *     label: 'Status',
 *     width: '100px',
 *     sortable: false
 *   }
 * ];
 * ```
 */
export interface TableColumn {
  /**
   * @description Field name in the data object to display.
   * Used to access the value from each row: `row[field]`
   *
   * @example
   * ```typescript
   * // If data row is: { id: 1, name: 'John', email: 'john@example.com' }
   * // field: 'name' will display 'John'
   * ```
   */
  field: string;

  /**
   * @description Display label for the column header.
   * Shown to users as the column title.
   *
   * @example
   * ```typescript
   * label: 'User Name'  // Displays "User Name" in the header
   * ```
   */
  label: string;

  /**
   * @description Fixed width of the column.
   * Accepts CSS width values like '100px', '10%', 'auto', etc.
   *
   * @example
   * ```typescript
   * width: '80px'   // Fixed 80px width
   * width: '15%'    // 15% of table width
   * ```
   */
  width?: string;

  /**
   * @description Minimum width of the column.
   * Ensures column doesn't shrink below this value when resizing.
   * Accepts CSS min-width values.
   *
   * @example
   * ```typescript
   * minWidth: '120px'  // Column won't shrink below 120px
   * ```
   */
  minWidth?: string;

  /**
   * @description Whether the column can be sorted.
   * When true, enables sorting functionality (typically with clickable headers).
   *
   * @default false
   *
   * @example
   * ```typescript
   * sortable: true  // User can sort by this column
   * ```
   */
  sortable?: boolean;

  /**
   * @description Whether to use a custom template for this column.
   * When true, the table will look for a `customCell` template
   * to render the cell content instead of using the raw field value.
   * Useful for complex data like badges, buttons, or formatted values.
   *
   * @default false
   *
   * @example
   * ```html
   * <ng-template #customCell let-row="row" let-column="column">
   *   <span class="badge" [class.active]="row.active">
   *     {{ row.active ? 'Active' : 'Inactive' }}
   *   </span>
   * </ng-template>
   * ```
   */
  template?: boolean;
}
