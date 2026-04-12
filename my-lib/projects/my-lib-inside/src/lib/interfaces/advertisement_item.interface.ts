/**
 * @fileoverview Advertisement item interface representing a product listing.
 *
 * @description
 * Complete advertisement/product data structure used throughout the application.
 * Contains product details, seller information, pricing, stock management,
 * and user interaction tracking (likes, etc.).
 *
 * @category Interfaces
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```typescript
 * const ad: AdvertisementItem = {
 *   advertisementId: 123,
 *   title: 'Smartphone XYZ',
 *   description: 'Brand new smartphone with 128GB storage',
 *   price: 499.99,
 *   condition: 'New',
 *   stockQuantity: 10,
 *   likes: 25,
 *   liked: false,
 *   imageUrl: 'https://example.com/image.jpg'
 * };
 * ```
 */
export interface AdvertisementItem {
  /** @description Product identifier */
  productId?: number;

  /** @description Advertisement identifier */
  advertisementId?: number;

  /** @description Country where product is located */
  productCountry?: string;

  /** @description City where product is located */
  city?: string;

  /** @description Advertisement title */
  title?: string;

  /** @description Detailed product description */
  description?: string;

  /** @description Product price */
  price?: number;

  /** @description Product condition (New, Used, etc.) */
  condition?: string;

  /** @description Available stock quantity */
  stockQuantity?: number;

  /** @description Currency symbol for the price */
  productCurrencySymbol?: string;

  /** @description Advertisement status */
  status?: string;

  /** @description Last renewal date */
  renewedAt?: Date;

  /** @description Whether the seller is a private/agency */
  agency?: boolean;

  /** @description Agency name */
  agencyName?: string;

  /** @description Agency fee percentage */
  agencyFeePercent?: number;

  /** @description Agency website URL */
  agencyUrl?: string;

  /** @description Whether the ad is active */
  active?: boolean;

  /** @description User who created the ad */
  createdBy?: {
    /** @description User identifier */
    userId?: number;

    /** @description Google user identifier */
    userIdGoogle?: string;

    /** @description User email */
    email?: string;

    /** @description User roles */
    roles?: string;

    /** @description OAuth scopes */
    scopes?: string;

    /** @description Registration date */
    registrationDate?: Date;

    /** @description Last login date */
    lastLogin?: Date;

    /** @description Whether user is active */
    active?: boolean;
  };

  /** @description User profile information */
  profile?: {
    /** @description Profile identifier */
    profileId?: number;

    /** @description First name */
    firstName?: string;

    /** @description Last name */
    lastName?: string;

    /** @description Date of birth */
    dateOfBirth?: string;

    /** @description Gender */
    gender?: string;

    /** @description Phone number */
    phoneNumber?: string;

    /** @description User type (buyer, seller, both) */
    userType?: string;

    /** @description User rating */
    rating?: number;

    /** @description Total sales count */
    totalSales?: number;

    /** @description Total purchases count */
    totalPurchases?: number;

    /** @description Wishlist items */
    wishlist?: string[];

    /** @description Security question */
    securityQuestion?: string;

    /** @description Security answer */
    securityAnswer?: string;

    /** @description Newsletter subscription status */
    newsletterSubscription?: boolean;

    /** @description Preferred language */
    preferredLanguage?: string;

    /** @description Preferred currency */
    currency?: string;

    /** @description Whether profile is active */
    active?: boolean;

    /** @description Notification preferences */
    notificationPreferences?: string[];

    /** @description Privacy settings */
    privacySettings?: string[];

    /** @description Profile country */
    profileCountry?: string;

    /** @description Profile currency symbol */
    profileCurrencySymbol?: string;
  };

  /** @description URL for product image */
  imageUrl?: string;

  /** @description Base64 encoded image data */
  picByte?: string;

  /** @description Number of likes received */
  likes?: number;

  /** @description Whether current user has liked this ad */
  liked?: boolean;

  /** @description Product type/category */
  type?: string;

  /** @description Creation timestamp */
  createdAt?: Date;
}
