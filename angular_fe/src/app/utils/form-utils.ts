import { AbstractControl, FormGroup, FormArray } from '@angular/forms';
import { extractCountryName } from './country.utils';

/**
 * @category Utils
 * 
 * @description Marks all controls in a `FormGroup` or `FormArray` (including nested) as touched.
 * Useful to force display of validation errors in Angular reactive forms.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param control - The parent form group or array of controls.
 *
 * @example
 * markFormGroupTouched(this.myForm);
 */
export function markFormGroupTouched(control: AbstractControl): void {
  if (control instanceof FormGroup || control instanceof FormArray) {
    Object.keys(control.controls).forEach((key) => {
      const childControl = control.get(key);
      if (childControl) {
        markFormGroupTouched(childControl);
      }
    });
  } else {
    control.markAsTouched();
  }
}

/**
 * @category Utils
 * 
 * @description Sanitizes a string value by trimming whitespace.
 * Returns `undefined` if the value is empty or invalid.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param value - Any value to sanitize.
 * @returns Trimmed string or `undefined`.
 */
export function sanitizeValue(value: any): string | undefined {
  return value && typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : undefined;
}

/**
 * @category Utils
 * 
 * @description Converts a number or string into a positive number string.
 * Returns `undefined` if invalid or negative.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param value - Number or string to sanitize.
 * @returns Positive number as string or `undefined`.
 */
export function sanitizeNumber(value: any): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;

  const num = typeof value === 'number' ? value : Number(value);
  if (isNaN(num)) return undefined;
  if (num < 0) return undefined;

  return num.toString();
}

/**
 * @category Utils
 * 
 * @description Converts a string to a `Date` object if valid.
 * Returns `undefined` if the string is empty or invalid.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param value - Date string to convert.
 * @returns Date object or `undefined`.
 */
export function sanitizeDateToDate(value: any): Date | undefined {
  if (!value || typeof value !== 'string' || value.trim() === '')
    return undefined;
  const date = new Date(value.trim());
  return isNaN(date.getTime()) ? undefined : date;
}

/**
 * @category Utils
 * 
 * @description Removes all object properties with `undefined` values.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param obj - Object to clean.
 * @returns New object without `undefined` fields.
 */
export function removeUndefinedFields(obj: any): any {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  );
}

/**
 * @category Utils
 * 
 * @description Extracts a sanitized country name from a string, removing emojis.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param value - String containing country information.
 * @returns Clean country name or `undefined`.
 */
export function sanitizeCountryValue(value: any): string | undefined {
  if (!value || typeof value !== 'string') return undefined;

  // Estrae solo il nome del paese (rimuove l'emoji)
  const countryName = extractCountryName(value.trim());
  return countryName !== '' ? countryName : undefined;
}

// -------------------- PRICE --------------------

/**
 * @category Utils
 * 
 * @description Analyzes an array of ads and returns the minimum and maximum prices.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param ads - Array of objects containing a `price` property.
 * @returns Object with `min` and `max` prices.
 */
export function analyzePrices(ads: { price: number }[]): {
  min: number;
  max: number;
} {
  const prices = ads.map((a) => a.price).filter((p) => p != null && p >= 0);
  if (!prices.length) return { min: 0, max: 100 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/**
 * @category Utils
 * 
 * @description Formats a price with a currency symbol and optional rounding step.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param price - Price to format.
 * @param step - Rounding step.
 * @param symbol - Currency symbol (default '€').
 * @returns Formatted price string.
 */
export function formatPrice(price: number, step: number, symbol = '€'): string {
  if (step < 1) return `${symbol}${price.toFixed(2)}`;
  return `${symbol}${Math.round(price)}`;
}

/**
 * @category Utils
 * 
 * @description Determines a dynamic step value for price sliders based on the maximum price.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param maxPrice - Maximum price in the dataset.
 * @returns Suggested step for price slider.
 */
export function getPriceStep(maxPrice: number): number {
  if (maxPrice <= 10) return 0.1;
  if (maxPrice <= 100) return 1;
  if (maxPrice <= 1000) return 10;
  if (maxPrice <= 10000) return 50;
  if (maxPrice <= 50000) return 100;
  return 500;
}

// -------------------- FORM FIELD UTILITIES --------------------

/**
 * @category Utils
 * 
 * @description Resets the visual and logical state of specified form fields in a `FormGroup`.
 *
 * For each field:
 * - Removes validation errors
 * - Marks as pristine and untouched
 * - Updates validity state
 *
 * Useful after resetting a form to clear error indicators without losing field values.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param formGroup - Parent reactive form group.
 * @param fields - Array of field names to reset.
 */
export function resetFormFields(formGroup: FormGroup, fields: string[]): void {
  fields.forEach((field) => {
    const control = formGroup.get(field);
    if (control) {
      control.setErrors(null);
      control.markAsPristine();
      control.markAsUntouched();
      control.updateValueAndValidity();
    }
  });
}

/**
 * @category Utils
 * 
 * @description Enables the specified fields in a form group.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export function enableFormFields(form: FormGroup, fields: string[]): void {
  fields.forEach((field) => form.get(field)?.enable());
}

/**
 * @category Utils
 * 
 * @description Disables the specified fields in a form group.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export function disableFormFields(form: FormGroup, fields: string[]): void {
  fields.forEach((field) => form.get(field)?.disable());
}

/**
 * @category Utils
 * 
 * @description Resets and disables specified fields in a form group.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export function resetAndDisableFormFields(
  form: FormGroup,
  fields: string[],
): void {
  fields.forEach((field) => {
    const control = form.get(field);
    control?.reset();
    control?.disable();
  });
}

/**
 * @category Utils
 * 
 * @description Validates that all provided forms are valid.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param forms - One or more FormGroups.
 * @returns True if all forms are valid, false otherwise.
 */
export function validateAllForms(...forms: FormGroup[]): boolean {
  return forms.every((form) => form.valid);
}

/**
 * @category Utils
 * 
 * @description Marks all controls in the provided forms as touched.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param forms - One or more FormGroups.
 */
export function markAllFormsTouched(...forms: FormGroup[]): void {
  forms.forEach((form) => markFormGroupTouched(form));
}
