import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * @category Utils
 * 
 * @description Validator function that ensures a form control value is a non-empty array.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param control - The {@link AbstractControl} to validate.
 * @returns `null` if the control value is a non-empty array, otherwise `{ required: true }`.
 *
 * @example
 * const form = new FormGroup({
 *   items: new FormControl([], [arrayNotEmptyValidator])
 * });
 */
export function arrayNotEmptyValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value = control.value;
  return Array.isArray(value) && value.length > 0 ? null : { required: true };
}
