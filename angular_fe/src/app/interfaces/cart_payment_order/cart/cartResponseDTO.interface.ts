import { CartDTO } from "./cartDTO.interface";

/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing the response from cart-related API calls.
 * Contains a success flag, a message describing the result, and the cart data.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface CartResponseDTO
 * @property {boolean} success - Indicates whether the API call was successful.
 * @property {string} message - Message returned by the API, describing the result.
 * @property {CartDTO} data - The shopping cart data associated with the response.
 */
export interface CartResponseDTO {
  success: boolean;
  message: string;
  data: CartDTO;
}