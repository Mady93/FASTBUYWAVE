import { EventEmitter } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * @fileoverview Input component interface defining the contract for all form input components.
 *
 * @description
 * Defines the standard API that all form input components must implement.
 * Extends ControlValueAccessor pattern with additional UI-specific properties
 * for labels, validation, and error handling.
 *
 * @category Interfaces
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * @Component({
 *   selector: 'fbw-custom-input',
 *   templateUrl: './custom-input.component.html'
 * })
 * export class CustomInputComponent implements InputComponent {
 *   name: string = '';
 *   label: string = '';
 *   value: any = '';
 *   // ... implement all required methods
 * }
 * ```
 */
export interface InputComponent {
  /** @description Unique identifier for the form field */
  name: string;

  /** @description Display label for the input field */
  label: string;

  /** @description Current value of the input field */
  value: any;

  /** @description Placeholder text shown when input is empty */
  placeholder?: string;

  /** @description Whether the input is disabled */
  disabled?: boolean;

  /** @description Whether the field is required for form validation */
  required?: boolean;

  /** @description Angular form control for validation and value tracking */
  formControl?: AbstractControl;

  /** @description Custom error messages keyed by validation rule name */
  errorMessages?: { [key: string]: string };

  /** @description Emitted when the input value changes */
  valueChange: EventEmitter<any>;

  // Metodi comuni che ogni componente deve implementare

  /**
   * @description Handles input change event from DOM.
   * @param event - DOM input event
   */
  onInput(event: Event): void;

  /**
   * @description Handles blur event from DOM.
   * Marks field as touched.
   */
  onBlur(): void;

  /**
   * @description Writes a new value to the input from the form control.
   * @param value - New value to write
   */
  writeValue(value: any): void;

  /**
   * @description Registers a callback function for when the control value changes.
   * @param fn - Callback function
   */
  registerOnChange(fn: any): void;

  /**
   * @description Registers a callback function for when the control is touched.
   * @param fn - Callback function
   */
  registerOnTouched(fn: any): void;

  /**
   * @description Sets the disabled state of the input.
   * @param isDisabled - Whether the input should be disabled
   */
  setDisabledState?(isDisabled: boolean): void;

  /**
   * @description Gets the appropriate error message for the current validation state.
   * @returns Error message string or empty string if no error
   */
  getErrorMessage(): string;

  /**
   * @description Determines whether to show validation error message.
   * @returns True if form control is invalid and has been touched or dirty
   */
  get showError(): boolean;

  /**
   * @description Resets the input field to its initial state.
   * Optional method for components that support reset functionality.
   */
  reset?(): void;
}
