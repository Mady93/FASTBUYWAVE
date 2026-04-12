import { AddressDTO } from "./adress_dto.interface";
import { UserDTO } from "./user_dto.interface";

/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing a user profile.
 * Contains personal information, contact details, preferences, associated account,
 * security settings, and activity metrics.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface ProfileDTO
 * @property {number} [profileId] - Optional unique identifier of the profile.
 * @property {string} firstName - First name of the user.
 * @property {string} lastName - Last name of the user.
 * @property {string} dateOfBirth - User's date of birth in ISO string format.
 * @property {string} gender - Gender of the user.
 * @property {string} phoneNumber - Contact phone number.
 * @property {AddressDTO} [address] - Optional address associated with the user.
 * @property {number[]} [profilePicture] - Optional profile picture represented as byte array.
 * @property {string} userType - Type of the user (e.g., buyer, seller, admin).
 * @property {number} [rating] - Optional rating of the user.
 * @property {number} [totalSales] - Optional total number of sales made by the user.
 * @property {number} [totalPurchases] - Optional total number of purchases made by the user.
 * @property {string[]} [wishlist] - Optional list of product IDs in user's wishlist.
 * @property {string} securityQuestion - Security question for account recovery.
 * @property {string} securityAnswer - Answer to the security question.
 * @property {boolean} newsletterSubscription - Whether the user is subscribed to the newsletter.
 * @property {string} preferredLanguage - User's preferred language.
 * @property {string} currency - Default currency for transactions.
 * @property {boolean} active - Whether the profile is currently active.
 * @property {string[]} notificationPreferences - User's notification preferences.
 * @property {string[]} privacySettings - User's privacy settings.
 * @property {UserDTO} [user] - Optional associated user account details.
 */
export interface ProfileDTO {
    profileId?: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // LocalDateTime in Java è rappresentato come stringa ISO in TypeScript
    gender: string;
    phoneNumber: string;
    address?: AddressDTO;
    profilePicture?: number[]; 
    userType: string;
    rating?: number;
    totalSales?: number;
    totalPurchases?: number;
    wishlist?: string[];
    securityQuestion: string;
    securityAnswer: string;
    newsletterSubscription: boolean;
    preferredLanguage: string;
    currency: string;
    active: boolean;
    notificationPreferences: string[];
    privacySettings: string[];
    user?: UserDTO;
  }