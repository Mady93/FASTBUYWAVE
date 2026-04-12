import { FormButton } from './form_button.interface';
import { FormFieldConfig } from './form_field_config.interface';

/**
 * @fileoverview Form configuration interfaces for dynamic form component.
 * Defines the structure for form fields, buttons, and validation.
 *
 * @category Interfaces
 *
 * @description Main configuration object for dynamic form.
 * Contains field definitions, buttons, and form-level validators.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 */
export interface FormConfig {
  /** @description Array of field configurations */
  fields: FormFieldConfig[];

  /** @description Optional buttons for form actions */
  buttons?: FormButton[];

  /** @description Form-level validators (cross-field validation) */
  formValidators?: any[];

  /** @description Error messages for form-level validation errors */
  formErrorMessages?: { [key: string]: string };

  /** @description Custom icons mapping for form elements */
  icons?: { [key: string]: any };
}
