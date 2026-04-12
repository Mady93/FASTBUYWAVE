/**
 * @fileoverview Table action button configuration interface.
 *
 * @description
 * Defines the structure for action buttons displayed in the table header.
 * Supports loading states, disabled states, tooltips, and visual styling variants.
 *
 * @category Interfaces
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * const tableActions: TableAction[] = [
 *   {
 *     id: 'add',
 *     label: 'Add User',
 *     type: 'primary',
 *     icon: '✚',
 *     tooltip: 'Create a new user'
 *   },
 *   {
 *     id: 'export',
 *     label: 'Export',
 *     type: 'secondary',
 *     icon: '📥',
 *     disabled: false
 *   },
 *   {
 *     id: 'delete',
 *     label: 'Delete',
 *     type: 'danger',
 *     icon: '🗑️',
 *     disabled: true,
 *     hidden: false
 *   },
 *   {
 *     id: 'refresh',
 *     label: 'Refresh',
 *     type: 'secondary',
 *     icon: '🔄',
 *     loading: true
 *   }
 * ];
 * ```
 */
export interface TableAction {
  /** @description Unique identifier for the action (emitted on click) */
  id: string;

  /** @description Display text of the button */
  label: string;

  /** @description Optional icon to display before the label */
  icon?: string;

  /**
   * @description Visual style variant of the button.
   * - 'primary' - main action (blue gradient)
   * - 'secondary' - alternative action (outline)
   * - 'danger' - destructive action (red)
   * - 'success' - positive action (green)
   * - 'warning' - caution action (orange)
   * - 'danger-outline' - destructive outline style
   */
  type?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'warning'
    | 'danger-outline';

  /** @description Whether the button is disabled */
  disabled?: boolean;

  /** @description Whether to show loading spinner and disable the button */
  loading?: boolean;

  /** @description Whether to hide the button from the UI */
  hidden?: boolean;

  /** @description Tooltip text displayed on hover */
  tooltip?: string;
}
