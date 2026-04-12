/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing a user's profile information.
 * Contains identifiers, contact details, registration info, and optional personal/profile data.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface UserProfileDTO
 * @property {number} userId - Unique identifier of the user.
 * @property {string} email - User's email address.
 * @property {Date} registrationDate - Date the user registered.
 * @property {Date | null} lastLogin - Last login date; null if the user has never logged in.
 * @property {number} [profileId] - Optional identifier for the user's profile.
 * @property {string} [firstName] - Optional first name of the user.
 * @property {string} [lastName] - Optional last name of the user.
 * @property {Date} [dateOfBirth] - Optional date of birth of the user.
 * @property {string} [profileImageUrl] - Optional URL to the user's profile image.
 * @property {string} [displayName] - Optional display name for the user.
 */
export interface UserProfileDTO {
  userId: number;
  email: string;
  registrationDate: Date;
  lastLogin: Date | null;

  profileId?: number;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  profileImageUrl?: string;
  displayName?: string;
}