import { AbstractControl } from '@angular/forms';

/**
 * @category Utils
 * 
 * @description Prevents non-numeric input and numbers greater than 100 in a numeric input field.
 * Allows control keys (Backspace, Delete, Arrows, Tab) and prevents multiple leading zeros.
 * Intended to be used as a 'keydown' event handler on an input.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param event KeyboardEvent triggered by key press
 */
export function blockInvalidAndTooHigh(event: KeyboardEvent): void {
  const input = event.target as HTMLInputElement;
  const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
  const isNumber = /^[0-9]$/.test(event.key);

  if (!isNumber && !allowedKeys.includes(event.key)) {
    event.preventDefault();
    return;
  }

  const selectionStart = input.selectionStart ?? input.value.length;
  const selectionEnd = input.selectionEnd ?? input.value.length;

  const nextValue =
    input.value.slice(0, selectionStart) +
    event.key +
    input.value.slice(selectionEnd);

  if (/^0\d+/.test(nextValue)) {
    event.preventDefault();
    return;
  }

  const asNumber = parseInt(nextValue, 10);

  if (!isNaN(asNumber) && asNumber > 100) {
    event.preventDefault();
  }
}

/**
 * @category Utils
 * 
 * @description Prevents pasting non-numeric values or numbers greater than 100.
 * Intended to be used as a 'paste' event handler on an input.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param event ClipboardEvent triggered by paste action
 */
export function blockInvalidPaste(event: ClipboardEvent): void {
  const pasted = event.clipboardData?.getData('text') ?? '';
  const isValid = /^[0-9]+$/.test(pasted) && parseInt(pasted, 10) <= 100;

  if (!isValid) {
    event.preventDefault();
  }
}

/**
 * @category Utils
 * 
 * @description Handles key presses in a price input field to ensure values follow the format:
 * - Max 6 integer digits
 * - Optional decimal point with max 2 decimals
 * - Maximum value 999999.99
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param event KeyboardEvent triggered during typing
 */
export function blockInvalidAndTooHighPrice(event: KeyboardEvent): void {
  const input = event.target as HTMLInputElement;
  const key = event.key;
  const value = input.value;
  const caretPosition = input.selectionStart ?? 0;

  const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
  if (controlKeys.includes(key)) return;

  if (input.selectionStart !== input.selectionEnd) {
    const newValue =
      value.substring(0, input.selectionStart!) +
      key +
      value.substring(input.selectionEnd!);
    if (!isValidPriceFormat(newValue)) {
      event.preventDefault();
    }
    return;
  }

  if (!/^\d$/.test(key) && key !== '.') {
    event.preventDefault();
    return;
  }

  if (key === '.' && caretPosition === 0) {
    event.preventDefault();
    return;
  }

  if (key === '.' && value.includes('.')) {
    event.preventDefault();
    return;
  }

  const potentialNewValue =
    value.substring(0, caretPosition) + key + value.substring(caretPosition);

  if (!isValidPriceFormat(potentialNewValue)) {
    event.preventDefault();
    return;
  }
}

/**
 * @category Utils
 * 
 * @description Validates a price string according to the following rules:
 * - Up to 6 integer digits
 * - Optional decimal with up to 2 digits
 * - Maximum numeric value 999999.99
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param value Price string to validate
 * @returns `true` if valid, `false` otherwise
 */
export function isValidPriceFormat(value: string): boolean {
  if (value === '') return true;

  const pricePattern = /^\d{1,6}(\.\d{0,2})?$/;
  if (!pricePattern.test(value)) return false;

  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue > 999999.99) return false;

  return true;
}

/**
 * @category Utils
 * 
 * @description Prevents pasting invalid price values.
 * Updates the FormControl with valid pasted value.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param event ClipboardEvent triggered during paste
 * @param control AbstractControl to update with valid price
 */
export function blockInvalidPastePrice(
  event: ClipboardEvent,
  control: AbstractControl,
): void {
  event.preventDefault();

  const clipboardData = event.clipboardData;
  if (!clipboardData) return;

  const pastedText = clipboardData.getData('text');
  if (!pastedText) return;

  if (isValidPriceFormat(pastedText)) {
    control.setValue(parseFloat(pastedText));
  }
}

/**
 * @category Utils
 * 
 * @description Blocks input outside the numeric range [1-100] and prevents non-numeric keys.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param event KeyboardEvent triggered by key press
 */
export function blockOnlyNumbers(event: KeyboardEvent): void {
  const input = event.target as HTMLInputElement;
  const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
  const isNumber = /^[0-9]$/.test(event.key);

  if (!isNumber && !allowedKeys.includes(event.key)) {
    event.preventDefault();
    return;
  }

  const selectionStart = input.selectionStart ?? input.value.length;
  const selectionEnd = input.selectionEnd ?? input.value.length;
  const nextValue =
    input.value.slice(0, selectionStart) +
    event.key +
    input.value.slice(selectionEnd);

  if (/^0\d+/.test(nextValue)) {
    event.preventDefault();
    return;
  }

  const asNumber = parseInt(nextValue, 10);
  if (!isNaN(asNumber) && (asNumber < 1 || asNumber > 100)) {
    event.preventDefault();
  }
}

/**
 * @category Utils
 * 
 * @description Blocks pasting non-numeric values or numbers outside the range [1-100].
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param event ClipboardEvent triggered during paste
 */
export function blockPasteNumbers(event: ClipboardEvent): void {
  const pasted = event.clipboardData?.getData('text') ?? '';
  const asNumber = parseInt(pasted, 10);
  if (!/^\d+$/.test(pasted) || asNumber < 1 || asNumber > 100) {
    event.preventDefault();
  }
}
