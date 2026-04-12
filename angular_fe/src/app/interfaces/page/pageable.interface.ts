/**
 * @category Interfaces
 * 
 * @fileoverview Interface representing pagination request parameters.
 * Used to request a specific page of results from the backend,
 * optionally including sorting information.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface Pageable
 * @property {number} page - The page number to request (zero-based).
 * @property {number} size - Number of items per page.
 * @property {string} [sort] - Optional sorting criteria in the format "field,ASC|DESC".
 */
export interface Pageable {
    page: number;
    size: number;
    sort?: string;
  }