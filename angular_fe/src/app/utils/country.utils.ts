/**
 * @category Utils
 * 
 * @description Filters a list of countries based on an input string (case-insensitive).
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param countries - Array of country names.
 * @param value - Input string to filter countries by.
 * @returns Array of country names that contain the input string.
 *
 * @example
 * filterCountries(['Italy', 'United States', 'Germany'], 'it'); // → ['Italy']
 */
export function filterCountries(countries: string[], value: string): string[] {
  const filterValue = value.toLowerCase();
  return countries.filter((c) => c.toLowerCase().includes(filterValue));
}

/**
 * @category Utils
 * 
 * @description Converts a 2-letter ISO country code to its corresponding flag emoji.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param countryCode - ISO country code (e.g., "IT", "US").
 * @returns Flag emoji for the country, or empty string if invalid.
 *
 * @example
 * countryCodeToEmoji('IT'); // → "🇮🇹"
 */
export function countryCodeToEmoji(countryCode: string): string {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * @category Utils
 * 
 * @description Extracts the country name from a full country string that may include a flag emoji.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param fullCountryString - Full string (e.g., "🇮🇹 Italy").
 * @returns Lowercased country name (e.g., "italy").
 *
 * @example
 * extractCountryName('🇮🇹 Italy'); // → "italy"
 */
export function extractCountryName(fullCountryString: string): string {
  // Se il formato è "🇮🇹 Italy", restituisci solo "Italy"
  return fullCountryString.split(' ').slice(1).join(' ').toLowerCase();
}

/**
 * @category Utils
 * 
 * @description Filters an array of countries by an input string (case-insensitive).
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param countries - Array of country names.
 * @param value - Input string to filter countries.
 * @returns Filtered array of country names containing the input.
 */
export function filterCountriesArray(
  countries: string[],
  value: string,
): string[] {
  const filterValue = value.toLowerCase();
  return countries.filter((country) =>
    country.toLowerCase().includes(filterValue),
  );
}

/**
 * @category Utils
 * 
 * @description Filters an array of cities by an input string (case-insensitive).
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param cities - Array of city names.
 * @param value - Input string to filter cities.
 * @returns Filtered array of city names containing the input.
 */
export function filterCitiesArray(cities: string[], value: string): string[] {
  const filterValue = value.toLowerCase();
  return cities.filter((city) => city.toLowerCase().includes(filterValue));
}

/**
 * @category Utils
 * 
 * @description Extracts the country name from a string, removing any leading non-letter characters.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param country - Full country string (may contain emoji or symbols at start).
 * @returns Country name with leading symbols removed and trimmed.
 *
 * @example
 * extractCountryNameReplace('🇮🇹 Italy'); // → "Italy"
 */
export function extractCountryNameReplace(country: string): string {
  return country?.replace(/^[^\p{L}]*/u, '')?.trim() ?? '';
}
