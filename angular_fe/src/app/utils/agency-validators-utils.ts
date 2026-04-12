import { FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ValidationPatterns } from './validators-pattern-utils';

/**
 * @category Utils
 * 
 * @description Represents the set of validators for agency-related form fields.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface AgencyValidators {
  /** @description Validators applied to the agency name field */
  name: ValidatorFn[];
  /** @description Validators applied to the agency fee field (percentage) */
  fee: ValidatorFn[];
  /** @description Validators applied to the agency URL field */
  url: ValidatorFn[];
}

/**
 * @category Utils
 * 
 * @description Returns a set of validators for agency form fields (name, fee, url),
 * optionally marking all fields as required.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param required - If `true`, all fields will include `Validators.required`.
 * @returns An object containing validators for `name`, `fee`, and `url`.
 *
 * @example
 * const validators = getAgencyValidators(true);
 * myForm.controls['agencyName'].setValidators(validators.name);
 */
export function getAgencyValidators(required: boolean): AgencyValidators {
  const nameValidators: ValidatorFn[] = [
    Validators.pattern(ValidationPatterns.agencyNamePattern),
  ];
  const feeValidators: ValidatorFn[] = [
    Validators.min(0),
    Validators.max(100),
    Validators.pattern(ValidationPatterns.agencyFeePercentPattern),
  ];
  const urlValidators: ValidatorFn[] = [
    Validators.pattern(ValidationPatterns.httpsUrlPattern),
  ];

  if (required) {
    nameValidators.unshift(Validators.required);
    feeValidators.unshift(Validators.required);
    urlValidators.unshift(Validators.required);
  }

  return {
    name: nameValidators,
    fee: feeValidators,
    url: urlValidators,
  };
}

/**
 * @category Utils
 * 
 * @description Forces re-validation of all agency-related form controls.
 * Use this after dynamically changing validators to ensure
 * the form state is up-to-date.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param form - The reactive {@link FormGroup} containing agency fields.
 *
 * @example
 * updateAgencyFieldsValidity(myForm);
 */
export function updateAgencyFieldsValidity(form: FormGroup): void {
  ['agencyName', 'agencyFeePercent', 'agencyUrl'].forEach((field) =>
    form.get(field)?.updateValueAndValidity(),
  );
}
