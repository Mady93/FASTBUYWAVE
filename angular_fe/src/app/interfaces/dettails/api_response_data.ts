/**
 * @category Interfaces
 * 
 * @fileoverview Generic API response wrapper.
 * Encapsulates status, message, and payload data of type T.
 * 
 * @template T - Type of the payload data
 * @interface ApiResponseData
 * 
 * @property {string} status - Response status (e.g., "success" or "error").
 * @property {string} message - Human-readable message describing the response.
 * @property {T} data - Payload data of the response.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
 export interface ApiResponseData<T> {
    status: string;
    message: string;
    data: T;
 }