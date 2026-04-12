/**
 * @category Interfaces
 * 
 * @fileoverview Generic API response wrapper without payload data.
 * Encapsulates HTTP status code and message from the API.
 * 
 * @interface ApiResponse
 * @property {number} status - HTTP status code of the response (e.g., 200, 404).
 * @property {string} message - Human-readable message describing the response.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface ApiResponse {
    status: number;
	message: string;
}