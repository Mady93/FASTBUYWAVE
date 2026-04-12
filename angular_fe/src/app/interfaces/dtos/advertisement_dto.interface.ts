import { CategoryDTO } from "./category_dto.interface";
import { ProductDTO } from "./product_dto.interface";
import { UserDTO } from "./user_dto.interface";

/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) for advertisements.
 * Represents a marketplace advertisement including metadata, agency details,
 * associated product, category, creator, and engagement metrics.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface AdvertisementDTO
 * @property {number} [advertisementId] - Optional unique identifier of the advertisement.
 * @property {string} title - Title of the advertisement.
 * @property {string} description - Detailed description of the advertisement.
 * @property {string} status - Current status of the advertisement (e.g., ACTIVE, INACTIVE).
 * @property {string} createdAt - ISO string representing the creation datetime.
 * @property {string} type - Type/category of the advertisement (e.g., sale, promotion).
 * @property {string} [renewedAt] - Optional ISO string for the last renewal datetime.
 * @property {boolean} agency - Indicates whether the advertisement is managed by an agency.
 * @property {string} agencyName - Name of the agency managing the advertisement.
 * @property {number} agencyFeePercent - Fee percentage applied by the agency.
 * @property {string} agencyUrl - Website or contact URL of the agency.
 * @property {Uint8Array} [logoImg] - Optional image/logo of the advertisement (Base64 byte array).
 * @property {boolean} active - Indicates whether the advertisement is active.
 * @property {UserDTO} [createdBy] - Optional user who created the advertisement.
 * @property {CategoryDTO} [category] - Optional category associated with the advertisement.
 * @property {ProductDTO} [product] - Optional product associated with the advertisement.
 * @property {number} [likesNumber] - Optional number of likes or engagement metric.
 */
export interface AdvertisementDTO {
  advertisementId?: number;
  title: string;
  description: string;
  status: string;
  createdAt: string; // ISO string
  type: string;
  renewedAt?: string; // ISO string
  agency: boolean;
  agencyName: string;
  agencyFeePercent: number;
  agencyUrl: string;
  logoImg?: Uint8Array; // oppure string se nel backend lo mandi già base64
  active: boolean;
  createdBy?: UserDTO;
  category?: CategoryDTO;
  product?: ProductDTO;
  likesNumber?: number;
}