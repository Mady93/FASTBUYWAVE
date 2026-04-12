import { State } from "./state";

/**
 * @category Interfaces
 * 
 * @description Represents the response structure when fetching the states of a country.
 * 
 * @interface CountryStatesResponse
 * @property {boolean} error - Indicates if there was an error in the request.
 * @property {string} msg - Message providing additional information about the response.
 * @property {Object} data - Contains information about the country and its states.
 * @property {string} data.name - Name of the country.
 * @property {string} data.iso3 - ISO 3166-1 alpha-3 code of the country.
 * @property {string} data.iso2 - ISO 3166-1 alpha-2 code of the country.
 * @property {State[]} data.states - Array of states within the country.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface CountryStatesResponse {
  error: boolean;
  msg: string;
  data: {
    name: string;
    iso3: string;
    iso2: string;
    states: State[];
  };
}