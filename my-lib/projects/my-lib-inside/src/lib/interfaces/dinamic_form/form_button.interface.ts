import { IconProp } from '@fortawesome/fontawesome-svg-core';

/**
 * @fileoverview Form button configuration interface.
 * Defines properties for action buttons in forms.
 *
 * @category Interfaces
 *
 * @description Configuration for a form action button.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 */
export interface FormButton {
  /** @description Unique button identifier */
  id: string;

  /** @description Button display text */
  label: string;

  /** @description Button type determining its behavior */
  type: 'submit' | 'refresh' | 'button';

  /** @description Button color theme */
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

  /** @description Icon to display before label */
  icon?: IconProp;

  /** @description Whether button is disabled */
  disabled?: boolean;

  /** @description Position alignment within button group */
  position?: 'left' | 'right' | 'center';

  /** @description Additional CSS classes */
  class?: string;

  /** @description Form data (for submit type) */
  formData?: any;

  /** @description Whether form is valid (for submit type) */
  isValid?: boolean;

  /** @description Additional button-specific data */
  extraData?: any;

  /** @description Custom action handler */
  action?: () => void;
}
