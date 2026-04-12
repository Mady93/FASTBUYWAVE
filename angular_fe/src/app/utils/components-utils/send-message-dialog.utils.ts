import { AbstractControl, FormGroup } from '@angular/forms';
import { ContactMethod } from 'src/app/interfaces/dtos/contact/contactMethod.enum';

/**
 * @category Interfaces
 * 
 * Represents a single Nominatim geocoding result from OpenStreetMap.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
    country?: string;
  };
  importance: number;
}

/**
 * @category Utils
 * 
 * Default values for the contact form fields.
 * Used for form initialization and change detection in {@link hasFormChanges}.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export const CONTACT_FORM_DEFAULTS = {
  senderContactEmail: '',
  senderPhone: '',
  message: '',
  additionalNotes: '',
  appointmentDate: '',
  appointmentTime: '09:00',
  durationMinutes: 60,
  locationAddress: '',
  locationNotes: '',
} as const;

/**
 * @category Utils
 * 
 * Checks whether the user has made any meaningful change
 * to the contact form compared to its default values.
 *
 * Ignores `subject` (auto-generated) and `preferredContactMethod` (always defaults to EMAIL).
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param form - The reactive {@link FormGroup} to inspect.
 * @returns `true` if at least one field differs from its default value.
 *
 * @example
 * this.contactForm.valueChanges.subscribe(() => {
 *   this.isFormFilled.set(hasFormChanges(this.contactForm));
 * });
 */
export function hasFormChanges(form: FormGroup): boolean {
  const raw = form.getRawValue();

  return (
    raw.preferredContactMethod !== ContactMethod.EMAIL ||
    raw.senderContactEmail?.trim() !== CONTACT_FORM_DEFAULTS.senderContactEmail ||
    raw.senderPhone?.trim()        !== CONTACT_FORM_DEFAULTS.senderPhone        ||
    raw.message?.trim()            !== CONTACT_FORM_DEFAULTS.message            ||
    raw.additionalNotes?.trim()    !== CONTACT_FORM_DEFAULTS.additionalNotes    ||
    raw.appointmentDate            !== CONTACT_FORM_DEFAULTS.appointmentDate    ||
    raw.appointmentTime            !== CONTACT_FORM_DEFAULTS.appointmentTime    ||
    raw.durationMinutes            !== CONTACT_FORM_DEFAULTS.durationMinutes    ||
    raw.locationAddress?.trim()    !== CONTACT_FORM_DEFAULTS.locationAddress    ||
    raw.locationNotes?.trim()      !== CONTACT_FORM_DEFAULTS.locationNotes
  );
}

/**
 * @category Utils
 * 
 * Resets specific form controls to their default values and clears
 * their touched/dirty state.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param form - The parent {@link FormGroup}.
 * @param fieldNames - Array of control names to reset.
 * @param getDefault - Optional function that returns the default value for a given field.
 *                     Falls back to {@link CONTACT_FORM_DEFAULTS} if not provided.
 *
 * @example
 * resetFormFields(this.contactForm, ['additionalNotes', 'meetingNotes']);
 */
export function resetFormFields(
  form: FormGroup,
  fieldNames: string[],
  getDefault?: (field: string) => unknown,
): void {
  fieldNames.forEach((field) => {
    const control = form.get(field);
    if (!control) return;

    const defaultValue = getDefault
      ? getDefault(field)
      : (CONTACT_FORM_DEFAULTS as Record<string, unknown>)[field] ?? '';

    control.setValue(defaultValue, { emitEvent: false });
    control.markAsUntouched();
    control.markAsPristine();
    control.updateValueAndValidity();
  });
}

/**
 * @category Utils
 * 
 * Combines a {@link Date} object and a time string (HH:MM) into a single {@link Date}.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param date - The date portion.
 * @param time - Time string in `HH:MM` format (e.g., `"14:30"`).
 * @returns A new {@link Date} with the specified hours and minutes.
 *
 * @example
 * const dt = combineDateTime(new Date('2025-06-01'), '14:30');
 * // → Sun Jun 01 2025 14:30:00
 */
export function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

/**
 * @category Utils
 * 
 * @description Returns a ValidatorFn-compatible function that validates
 * whether a date falls within a specified range.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param minDate - Minimum allowed date (inclusive).
 * @param maxDate - Maximum allowed date (inclusive).
 * @returns Validator function returning `{ minDate: true }`, `{ maxDate: true }`, or `null`.
 *
 * @example
 * appointmentDate: ['', [dateRangeValidatorFn(this.minDate, this.maxDate)]]
 */
export function dateRangeValidatorFn(minDate: Date, maxDate: Date) {
  return (control: AbstractControl) => {
    const date = control.value;
    if (!date) return null;
    if (date < minDate) return { minDate: true };
    if (date > maxDate) return { maxDate: true };
    return null;
  };
}

/**
 * @category Utils
 * 
 * Builds the Nominatim geocoding URL for a given address query.
 * Results are restricted to Italy (`countrycodes=it`).
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param query - Free-text address query.
 * @param limit - Maximum number of results (default: 5).
 * @returns The complete Nominatim request URL.
 */
export function buildNominatimUrl(query: string, limit = 5): string {
  return (
    `https://nominatim.openstreetmap.org/search` +
    `?format=json` +
    `&q=${encodeURIComponent(query)}` +
    `&countrycodes=it` +
    `&addressdetails=1` +
    `&limit=${limit}`
  );
}

/**
 * @category Utils
 * 
 * Formats a {@link NominatimResult} into a minimal HTML string
 * suitable for OpenLayers popups.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param result - The Nominatim geocoding result.
 * @returns An HTML string with street and city information.
 *
 * @example
 * popupElement.innerHTML = formatAddressForPopup(result);
 */
export function formatAddressForPopup(result: NominatimResult): string {
  const parts: string[] = [];

  if (result.address.road) {
    let street = result.address.road;
    if (result.address.house_number) street += ` ${result.address.house_number}`;
    parts.push(`<strong>${street}</strong>`);
  }

  const cityParts: string[] = [];
  if (result.address.postcode) cityParts.push(result.address.postcode);
  const city = result.address.city ?? result.address.town ?? result.address.village;
  if (city) cityParts.push(city);
  if (cityParts.length > 0) parts.push(cityParts.join(' '));

  return `<div class="popup-content">${parts.join('<br>')}</div>`;
}

/**
 * @category Utils
 * 
 * Display function for Angular Material Autocomplete.
 * Converts a {@link NominatimResult} or string into a human-readable label.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param result - NominatimResult object or a raw string.
 * @returns Display string for the autocomplete input.
 */
export function nominatimDisplayFn(result: NominatimResult | string): string {
  if (typeof result === 'string') return result;
  return result?.display_name ?? '';
}

/**
 * @category Utils
 * 
 * Maps a form control name to a human-readable label, for error messages.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param fieldName - Reactive form control name.
 * @returns Friendly display name, or original `fieldName` if unknown.
 *
 * @example
 * prettyFieldName('senderContactEmail'); // → 'Email'
 */
export function prettyFieldName(fieldName: string): string {
  const map: Record<string, string> = {
    senderContactEmail: 'Email',
    senderPhone: 'Phone number',
    subject: 'Subject',
    message: 'Message',
    preferredContactMethod: 'Contact method',
    additionalNotes: 'Additional notes',
    appointmentDate: 'Meeting date',
    appointmentTime: 'Meeting time',
    durationMinutes: 'Duration',
    locationAddress: 'Location address',
    locationNotes: 'Location notes',
    meetingNotes: 'Meeting notes',
  };
  return map[fieldName] ?? fieldName;
}

/**
 * @category Utils
 * 
 * Generates a validation error message for a given form control.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param control - The {@link AbstractControl} to inspect.
 * @param fieldName - The form field name to map via {@link prettyFieldName}.
 * @returns Validation error string, or `''` if no errors or untouched.
 *
 * @example
 * getFieldError(this.contactForm.get('message'), 'message');
 */
export function getFieldError(
  control: AbstractControl | null,
  fieldName: string,
): string {
  if (!control?.errors || !control.touched) return '';

  const label = prettyFieldName(fieldName);

  if (control.hasError('required')) return `${label} is required`;
  if (control.hasError('email')) return 'Please enter a valid email address';
  if (control.hasError('minlength')) {
    const req = control.errors!['minlength'].requiredLength;
    return `${label} must be at least ${req} characters long`;
  }
  if (control.hasError('maxlength')) {
    const req = control.errors!['maxlength'].requiredLength;
    return `${label} must be no more than ${req} characters long`;
  }
  if (control.hasError('pattern')) {
    if (fieldName === 'senderPhone') return 'Invalid phone number format (e.g., +393497463284)';
    if (fieldName === 'appointmentTime') return 'Format HH:MM (e.g., 14:30)';
    return `${label} format is invalid`;
  }
  if (control.hasError('minDate')) return 'Date cannot be in the past';
  if (control.hasError('maxDate')) return 'Date cannot exceed 12 months';
  if (control.hasError('min')) return 'Minimum 15 minutes';
  if (control.hasError('max')) return 'Maximum 480 minutes';

  return 'Invalid input';
}