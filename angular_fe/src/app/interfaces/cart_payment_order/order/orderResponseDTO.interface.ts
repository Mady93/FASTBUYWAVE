import { OrderDTO } from "./orderDTO.interface";

/**
 * @category Interfaces
 * 
 * @description Represents the response received after performing an order-related API request.
 * Contains the success status, a message, and the detailed order data.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface OrderResponseDTO
 * @property {boolean} success - Indicates whether the API call was successful.
 * @property {string} message - A descriptive message returned by the API.
 * @property {OrderDTO} data - The detailed order information returned from the API.
 */
export interface OrderResponseDTO {
  success: boolean;
  message: string;
  data: OrderDTO;
}