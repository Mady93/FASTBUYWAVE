import { Type } from '@angular/core';
import { FormButton } from './form_button.interface';

/**
 * @fileoverview Form field configuration interface for dynamic form.
 * Defines properties for individual form fields.
 *
 * @category Interfaces
 *
 * @description Configuration for a single form field.
 * Supports all standard input types and custom components.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 */
export interface FormFieldConfig {
  /** @description Unique field identifier */
  name: string;

  /** @description Input type or custom component identifier */
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'tel'
    | 'number'
    | 'textarea'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'date'
    | 'datetime'
    | 'file'
    | 'range'
    | 'search'
    | 'time'
    | 'url';

  /** @description Display label for the field */
  label: string;

  /** @description Placeholder text */
  placeholder?: string;

  /** @description Default value on form initialization */
  defaultValue?: any;

  /** @description Angular validators for the field */
  validators?: any[];

  /** @description Icon name or reference */
  icon?: string;

  /** @description Custom error messages for validation failures */
  errorMessages?: { [key: string]: string };

  /** @description Whether field is required */
  required?: boolean;

  /** @description Whether field is disabled */
  disabled?: boolean;

  /** @description Whether field is hidden */
  hidden?: boolean;

  /** @description Custom component to render instead of standard input */
  component?: Type<any>;

  /** @description Additional props to pass to custom component */
  componentProps?: { [key: string]: any };

  /** @description Options for select/radio/checkbox fields */
  options?: { value: any; label: string }[];

  /** @description Nested fields for complex structures */
  children?: {
    fields: FormFieldConfig[];
  };

  /** @description Buttons specific to this field */
  buttons?: FormButton[];

  /** @description Minimum items for array fields */
  minItems?: number;

  /** @description Maximum items for array fields */
  maxItems?: number;
}
