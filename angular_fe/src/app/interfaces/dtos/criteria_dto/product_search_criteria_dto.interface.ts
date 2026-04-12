/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) for defining search criteria when querying products.
 * Supports filtering by type, location (country/city), price range, title, condition, agency, and date range.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface ProductSearchCriteriaDTO
 * @property {string} type - Type or category of the product to search for.
 * @property {string} [country] - Optional country filter for the product location.
 * @property {string} [city] - Optional city filter for the product location.
 * @property {number} [minPrice] - Optional minimum price filter.
 * @property {number} [maxPrice] - Optional maximum price filter.
 * @property {string} [title] - Optional title or keyword filter for the product.
 * @property {string} [condition] - Optional condition filter (e.g., new, used).
 * @property {string} [agency] - Optional agency or seller filter.
 * @property {Date} [minDate] - Optional minimum date filter for product listing or availability.
 * @property {Date} [maxDate] - Optional maximum date filter for product listing or availability.
 */
export interface ProductSearchCriteriaDTO {
    type: string;
    country?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    title?: string;
    condition?: string;
    agency?: string;
    minDate?: Date;
    maxDate?: Date;
}
