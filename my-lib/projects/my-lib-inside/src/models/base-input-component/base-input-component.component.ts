import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputComponent } from '../../lib/interfaces/input_component.interface';

/**
 * @fileoverview Base input component implementing ControlValueAccessor.
 * Provides common functionality for all form input components.
 *
 * @description
 * Abstract base class that implements ControlValueAccessor and InputComponent interface,
 * providing shared logic for validation, error display, and value handling.
 * All input components (text, email, password, etc.) extend this class.
 *
 * @implements {InputComponent}
 * 
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * @Component({
 *   selector: 'fbw-text-input',
 *   templateUrl: './text-input.component.html'
 * })
 * export class TextInputComponent extends BaseInputComponent {
 *   // Component-specific logic
 * }
 * ```
 */
@Component({
  selector: 'lib-base-input-component',
  standalone: true,
  imports: [],
  templateUrl: './base-input-component.component.html',
  styleUrl: './base-input-component.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseInputComponent implements InputComponent {
  /** @description Unique identifier for the form field */
  @Input() name: string = '';

  /** @description Display label for the input field */
  @Input() label: string = '';

  /** @description Current value of the input field */
  @Input() value: any = '';

  /** @description Placeholder text shown when input is empty */
  @Input() placeholder?: string;

  /** @description Whether the input is disabled */
  @Input() disabled: boolean = false;

  /** @description Whether the input is hidden from view */
  @Input() hidden: boolean = false;

  /** @description Whether the field is required for form validation */
  @Input() required: boolean = false;

  /** @description Form control for validation and value tracking */
  @Input() formControl!: FormControl;

  /** @description Custom error messages keyed by validation rule name */
  @Input() errorMessages: { [key: string]: string } = {};

  /**
   * @description Sets the touched state of the input field.
   * @param value - Whether the field has been touched
   */
  @Input() set touched(value: boolean) {
    this._touched = value;
  }

  /** @description Returns whether the field has been touched */
  get touched(): boolean {
    return this._touched;
  }

  /** @description Internal storage for touched state */
  protected _touched: boolean = false;

  /** @description Emitted when the input value changes */
  @Output() valueChange = new EventEmitter<any>();

  /** @description Emitted when the input loses focus */
  @Output() blur = new EventEmitter<void>();

  /** @description Callback function for ControlValueAccessor onChange */
  onChange = (value: any) => {};

  /** @description Callback function for ControlValueAccessor onTouched */
  onTouched = () => {};

  /**
   * @description Determines whether to show validation error message.
   * @returns True if form control is invalid and has been touched or dirty
   */
  get showError(): boolean {
    return (
      this.formControl?.invalid &&
      (this.formControl?.touched || this.formControl?.dirty)
    );
  }

  /**
   * @description Gets the appropriate error message for the current validation state.
   * @returns Error message string or empty string if no error
   */
  getErrorMessage(): string {
    if (!this.formControl || !this.formControl.errors) return '';

    for (const key of Object.keys(this.formControl.errors)) {
      if (this.errorMessages[key]) {
        return this.errorMessages[key];
      }
    }

    return 'Unknown error';
  }

  /**
   * @description Handles input change event from DOM.
   * @param event - DOM input event
   */
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.valueChange.emit(this.value);

    if (this.formControl) {
      this.formControl.setValue(this.value, { emitEvent: false });
      this.formControl.markAsDirty();
    }
  }

  /**
   * @description Handles blur event from DOM.
   * Marks field as touched and emits blur event.
   */
  onBlur(): void {
    this.touched = true;
    this.blur.emit();
    if (this.formControl) {
      this.formControl.markAsTouched();
    }
  }

  /**
   * @description Writes a new value to the input from the form control.
   * @param value - New value to write
   */
  writeValue(value: any): void {
    this.value = value ?? '';
    if (this.formControl) {
      this.formControl.setValue(this.value, { emitEvent: false });
    }
  }

  /**
   * @description Registers a callback function for when the control value changes.
   * @param fn - Callback function
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * @description Registers a callback function for when the control is touched.
   * @param fn - Callback function
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * @description Sets the disabled state of the input.
   * @param isDisabled - Whether the input should be disabled
   */
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /**
   * @description Resets the input field to its initial state.
   * Clears value, resets touched state, and updates form control.
   */
  reset(): void {
    this.value = '';
    this.touched = false;

    if (this.formControl) {
      this.formControl.markAsUntouched();
      this.formControl.markAsPristine();
      this.formControl.setValue('');
      this.formControl.updateValueAndValidity();
    }

    this.valueChange.emit('');
    if (this.onChange) this.onChange('');
    if (this.onTouched) this.onTouched();
  }
}
