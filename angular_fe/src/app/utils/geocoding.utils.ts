/**
 * @category Utils
 * 
 * @description Checks whether an address object contains all required fields.
 *
 * Required fields: street, streetNumber, province, region, zipCode, city, country.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param address - The address object to validate.
 * @returns `true` if all required fields are present and non-empty, `false` otherwise.
 *
 * @example
 * hasAllRequiredAddressFields({
 *   street: 'Via Roma',
 *   streetNumber: '15',
 *   province: 'RM',
 *   region: 'Lazio',
 *   zipCode: '00100',
 *   city: 'Rome',
 *   country: 'Italy'
 * }); // returns true
 */
export function hasAllRequiredAddressFields(address: any): boolean {
  const requiredFields = [
    address.street,
    address.streetNumber,
    address.province,
    address.region,
    address.zipCode,
    address.city,
    address.country,
  ];

  return !requiredFields.some((val) => !val || val.toString().trim() === '');
}

/**
 * @category Utils
 * 
 * @description Composes a full, formatted address string from an address object.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param address - Object containing street, streetNumber, zipCode, city, province, region.
 * @returns Formatted address string, e.g. "Via Roma 15, 00100 Rome, RM, Lazio".
 *
 * @example
 * composeFullAddress({
 *   street: 'Via Roma',
 *   streetNumber: '15',
 *   zipCode: '00100',
 *   city: 'Rome',
 *   province: 'RM',
 *   region: 'Lazio'
 * });
 * // Returns: "Via Roma 15, 00100 Rome, RM, Lazio"
 */
export function composeFullAddress(address: {
  street: string;
  streetNumber: string | number;
  zipCode: string;
  city: string;
  province: string;
  region: string;
}): string {
  return `${address.street} ${address.streetNumber}, ${address.zipCode} ${address.city}, ${address.province}, ${address.region}`;
}

/**
 * @category Utils
 * 
 * @description Filters out Italian states that are not proper regions (like provinces or consortia).
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param states - Array of state objects with a `name` property.
 * @returns Array of state names filtered to include only regions.
 *
 * @example
 * filterItalianStates([{ name: 'Province of Rome' }, { name: 'Lazio' }]);
 * // Returns: ['Lazio']
 */
export function filterItalianStates(states: any[]): string[] {
  return states
    .filter((state) => {
      const name = state.name.toLowerCase();
      return !(
        name.includes('province') ||
        name.includes('metropolitan city') ||
        name.includes('libero consorzio')
      );
    })
    .map((state) => state.name);
}

/**
 * @category Utils
 * 
 * @description Extracts valid province/state codes from an array of state objects.
 *
 * Accepts codes matching pattern: 2+ uppercase letters, optionally followed by '-' and alphanumeric.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param states - Array of state objects with a `state_code` property.
 * @returns Array of province/state codes.
 *
 * @example
 * extractProvinceCodes([{ state_code: 'RM' }, { state_code: 'LZ-01' }, { state_code: 'invalid' }]);
 * // Returns: ['RM', 'LZ-01']
 */
export function extractProvinceCodes(states: any[]): string[] {
  return states
    .filter((state) => /^[A-Z]{2,}(-[A-Z0-9]{1,})?$/.test(state.state_code))
    .map((state) => state.state_code);
}
