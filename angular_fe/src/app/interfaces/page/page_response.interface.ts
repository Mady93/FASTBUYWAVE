/**
 * @category Interfaces
 * 
 * @fileoverview Generic interface representing a paginated response from the backend.
 * Provides metadata for pagination along with the current page content.
 * Useful for listing resources such as products, advertisements, or users
 * in a paginated manner.
 * 
 * @template T - Type of the content items in the page.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface PageResponse
 * @property {T[]} content - Array of items of generic type T (e.g., ProductDTO, AdvertisementDTO).
 * @property {number} pageNumber - Current page number (zero-based indexing).
 * @property {number} pageSize - Number of items per page.
 * @property {number} totalElements - Total number of elements across all pages.
 * @property {number} totalPages - Total number of pages available.
 * @property {boolean} first - True if this is the first page.
 * @property {boolean} last - True if this is the last page.
 * @property {number} numberOfElements - Number of items in the current page.
 */
export interface PageResponse<T> {
    content: T[];          // Lista di oggetti di tipo generico T (ad esempio, AdvertisementLikeDTO)
    pageNumber: number;    // Numero della pagina corrente
    pageSize: number;      // Numero di elementi per pagina
    totalElements: number; // Totale degli elementi (non solo quelli della pagina corrente)
    totalPages: number;    // Numero totale di pagine
    first: boolean;        // Se è la prima pagina
    last: boolean;         // Se è l'ultima pagina
    numberOfElements: number; // Numero di elementi nella pagina corrente
  }