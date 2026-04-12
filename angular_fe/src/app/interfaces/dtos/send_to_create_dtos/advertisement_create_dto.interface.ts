/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) for creating a new advertisement.
 * Contains all necessary fields to create an advertisement, including metadata, agency info, and media.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface AdvertisementCreateDTO
 * @property {string} title - Title of the advertisement.
 * @property {string} description - Detailed description of the advertisement.
 * @property {string} status - Current status of the advertisement (e.g., 'DRAFT', 'PUBLISHED').
 * @property {string} createdAt - Creation datetime in ISO string format.
 * @property {string} type - Type/category of the advertisement.
 * @property {string} renewedAt - Last renewal datetime in ISO string format.
 * @property {boolean} agency - Flag indicating if the advertisement is managed by an agency.
 * @property {string} agencyName - Name of the managing agency.
 * @property {number} agencyFeePercent - Fee percentage charged by the agency.
 * @property {string} agencyUrl - URL of the agency's website.
 * @property {Uint8Array} logoImg - Logo image data (or base64 string if sent as such from backend).
 * @property {boolean} active - Indicates whether the advertisement is currently active.
 */
export interface AdvertisementCreateDTO {
  title: string;
  description: string;
  status: string;
  createdAt: string; // ISO string
  type: string;
  renewedAt: string; // ISO string
  agency: boolean;
  agencyName: string;
  agencyFeePercent: number;
  agencyUrl: string;
  logoImg: Uint8Array; // oppure string se nel backend lo mandi già base64
  active: boolean;
}