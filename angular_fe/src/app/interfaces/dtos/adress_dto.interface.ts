/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) for addresses.
 * Represents a full address including street, city, region, country,
 * geographic coordinates, and activation status.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface AddressDTO
 * @property {number} [addressId] - Optional unique identifier of the address.
 * @property {string} street - Name of the street.
 * @property {string} streetNumber - Number of the building or location.
 * @property {string} province - Province or state of the address.
 * @property {string} region - Region of the address.
 * @property {string} zipCode - Postal code of the address.
 * @property {string} city - City of the address.
 * @property {string} country - Country of the address.
 * @property {number} latitude - Latitude coordinate for geolocation.
 * @property {number} longitude - Longitude coordinate for geolocation.
 * @property {boolean} active - Indicates whether the address is active.
 */
export interface AddressDTO {
    addressId?: number;
    street: string;
    streetNumber: string;
    province: string;
    region: string;
    zipCode: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    active: boolean;
  }