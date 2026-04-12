import { AddressDTO } from "./adress_dto.interface";
import { AdvertisementDTO } from "./advertisement_dto.interface";
import { ImageDTO } from "./image_dto.interface";

/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing a product.
 * Includes information about pricing, activation status, stock quantity, condition,
 * location, associated advertisement, and images.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface ProductDTO
 * @property {number} [productId] - Optional unique identifier of the product.
 * @property {number} price - Price of the product.
 * @property {boolean} active - Whether the product is currently active.
 * @property {string} condition - Condition of the product (e.g., new, used).
 * @property {number} stockQuantity - Available quantity of the product in stock.
 * @property {AddressDTO} [address] - Optional address associated with the product.
 * @property {AdvertisementDTO} [advertisement] - Optional advertisement linked to the product.
 * @property {ImageDTO[]} [images] - Optional list of images associated with the product.
 */
export interface ProductDTO {
    productId?: number;
    price: number; // BigDecimal in Java è un float/double in TypeScript
    active: boolean;
    condition: string;
    stockQuantity: number;
    address?: AddressDTO;
    advertisement?: AdvertisementDTO;
    images?: ImageDTO[];
  }