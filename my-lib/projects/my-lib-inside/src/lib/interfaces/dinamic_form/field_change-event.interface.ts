import { FormGroup } from '@angular/forms';

/**
 * @fileoverview Field change event interface.
 * Emitted when a form field value changes.
 *
 * @category Interfaces
 *
 * @description Event data for field value changes.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 */
export interface FieldChangeEvent {
  /** @description Name of the field that changed */
  fieldName: string;

  /** @description New value of the field */
  value: any;

  /** @description Reference to the parent form group */
  form: FormGroup;
}
