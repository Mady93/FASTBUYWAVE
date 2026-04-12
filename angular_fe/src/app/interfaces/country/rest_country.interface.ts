/**
 * @category Interfaces
 * 
 * @description Represents a country with its basic information.
 * 
 * @interface RstCountry
 * @property {Object} name - Names of the country.
 * @property {string} name.common - Commonly used name of the country.
 * @property {string} name.official - Official name of the country.
 * @property {string} cca2 - ISO 3166-1 alpha-2 code of the country.
 * @property {Object<string, {name: string; symbol: string}>} [currencies] - Optional mapping of currency codes to currency details.
 * @property {string} currencies.[code].name - Name of the currency.
 * @property {string} currencies.[code].symbol - Symbol of the currency.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface RstCountry {
  name: { common: string; official: string };
  cca2: string;
  currencies?: { [code: string]: { name: string; symbol: string } };
}