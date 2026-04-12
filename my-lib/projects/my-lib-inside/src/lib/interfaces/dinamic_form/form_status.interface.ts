/**
 * @fileoverview Form status event interface.
 * Emitted when form validity or values change.
 *
 * @category Interfaces
 *
 * @description Complete form status snapshot.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 */
export interface FormStatus {
  /** @description Current form values */
  values: any;

  /** @description Whether form is valid */
  valid: boolean;

  /** @description Current validation errors by field */
  errors: { [key: string]: any };
}
