/**
 * @category Interfaces
 * 
 * @description Represents the response structure when fetching a list of countries.
 * 
 * @interface CountryResponse
 * @property {boolean} error - Indicates if there was an error in the request.
 * @property {string} msg - Message providing additional information about the response.
 * @property {string[]} data - Array of country names returned by the request.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface CountryResponse {
  error: boolean;
  msg: string;
  data: string[];
}
