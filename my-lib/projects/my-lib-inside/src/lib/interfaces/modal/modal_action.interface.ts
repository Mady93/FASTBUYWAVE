/**
 * @fileoverview Modal action button configuration interface.
 *
 * @description
 * Defines the structure for action buttons used in modals and form layouts.
 * Supports loading states, disabled states, and visual styling variants.
 *
 * @category Interfaces
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * const actions: ModalAction[] = [
 *   {
 *     id: 'save',
 *     label: 'Save',
 *     type: 'primary',
 *     disabled: false,
 *     loading: false
 *   },
 *   {
 *     id: 'cancel',
 *     label: 'Cancel',
 *     type: 'secondary',
 *     disabled: false
 *   }
 * ];
 * ```
 */
export interface ModalAction {
  /** @description Display text of the button */
  label: string;

  /**
   * Visual style variant of the button.
   * - 'primary' - main action (blue)
   * - 'secondary' - alternative action (gray)
   * - 'danger' - destructive action (red)
   */
  type?: string;

  /** @description Whether the button is disabled */
  disabled?: boolean;

  /** @description Whether to show loading spinner and disable the button */
  loading?: boolean;

  /** @description Unique identifier for the action (emitted on click) */
  id: string;
}
