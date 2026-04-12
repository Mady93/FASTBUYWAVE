import { AdvertisementItem } from 'my-lib-inside';
import { detectMimeType } from './file-utils';
import { AdDetailDialogComponent } from '../components/dialog/ad-detail-dialog/ad-detail-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { extractCountryNameReplace } from './country.utils';

/**
 * @category Utils
 * 
 * @description Maps raw product data to a structured {@link AdvertisementItem} array.
 * Converts base64 images to data URLs and normalizes category type.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param val - Array of raw product objects from the backend.
 * @returns Array of {@link AdvertisementItem} with properly mapped fields.
 *
 * @example
 * const ads = mapProductsToAds(rawProducts);
 */
export function mapProductsToAds(val: any[]): AdvertisementItem[] {
  return val.map((product) => {
    const productId = product.productId;
    const ad = product.advertisement;
    const typeParts = ad.type?.split('/') || [];
    const categoryType = (typeParts[typeParts.length - 1] || '').toLowerCase();

    let imageUrl = '';
    let picByte = '';

    if (product.images?.length > 0 && product.images[0].picByte) {
      const base64 = product.images[0].picByte;
      const mimeType = detectMimeType(base64.slice(0, 10));
      picByte = `data:${mimeType};base64,${base64}`;
    }

    if (ad.profile?.profilePicture) {
      const base64 = ad.profile.profilePicture;
      const mimeType = detectMimeType(base64.slice(0, 10));

      imageUrl = `data:${mimeType};base64,${base64}`;
    }

    return {
      productId: productId,
      advertisementId: ad.advertisementId,
      productCountry: product.address.country,
      city: product.address.city,
      title: ad.title,
      description: ad.description,
      price: product.price,
      condition: product.condition,
      stockQuantity: product.stockQuantity,

      status: ad.status,
      renewedAt: ad.renewedAt,
      agency: ad.agency,
      agencyName: ad.agencyName,
      agencyFeePercent: ad.agencyFeePercent,
      agencyUrl: ad.agencyUrl,
      active: ad.active,
      createdBy: {
        userId: ad.createdBy.userId,
        userIdGoogle: ad.createdBy.userIdGoogle,
        email: ad.createdBy.email,
        roles: ad.createdBy.roles,
        scopes: ad.createdBy.scopes,
        registrationDate: ad.createdBy.registrationDate,
        lastLogin: ad.createdBy.lastLogin,
        active: ad.createdBy.active,
      },
      profile: {
        profileId: ad.profile.profileId,
        firstName: ad.profile.firstName,
        lastName: ad.profile.lastName,
        dateOfBirth: ad.profile.dateOfBirth,
        gender: ad.profile.gender,
        phoneNumber: ad.profile.phoneNumber,
        userType: ad.profile.userType,
        rating: ad.profile.rating,
        totalSales: ad.profile.totalSales,
        totalPurchases: ad.profile.totalPurchases,
        wishlist: ad.profile.wishlist,
        securityQuestion: ad.profile.securityQuestion,
        securityAnswer: ad.profile.securityAnswer,
        newsletterSubscription: ad.profile.newsletterSubscription,
        preferredLanguage: ad.profile.preferredLanguage,
        currency: ad.profile.currency,
        active: ad.profile.active,
        notificationPreferences: ad.profile.notificationPreferences,
        privacySettings: ad.profile.privacySettings,
        profileCountry: ad.profile.country,
      },

      imageUrl,
      picByte,
      likes: ad.likesNumber || 0,
      liked: false,
      type: categoryType,
      createdAt: ad.createdAt,
    } as AdvertisementItem;
  });
}

/**
 * @category Utils
 * 
 * @description Paginates an array of items by page index and size.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param items - Array of items to paginate.
 * @param pageIndex - Zero-based page index.
 * @param pageSize - Number of items per page.
 * @returns A slice of items for the specified page.
 *
 * @example
 * const pageItems = paginateItems(products, 0, 10); // first 10 items
 */
export function paginateItems<T>(
  items: T[],
  pageIndex: number,
  pageSize: number,
): T[] {
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  return items.slice(start, end);
}

/**
 * @category Utils
 * 
 * @description Filters a list of products by a specific advertisement ID.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param products - Array of product objects.
 * @param adId - Advertisement ID to filter by.
 * @returns Array of products that belong to the given advertisement.
 *
 * @example
 * const relatedProducts = filterProductsByAdId(products, 42);
 */
export function filterProductsByAdId(products: any[], adId: number): any[] {
  return products.filter((p) => p.advertisement.advertisementId === adId);
}

/**
 * @category Utils
 * 
 * @description Opens the advertisement detail dialog for a selected ad.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param dialog - Angular Material {@link MatDialog} service.
 * @param ads - List of {@link AdvertisementItem} objects.
 * @param allProducts - Complete list of raw products from backend.
 * @param adId - Advertisement ID to display in the dialog.
 * @param isUserAd - Callback function to determine if the current user owns the ad.
 *
 * @example
 * openAdDetailDialog(dialogService, ads, allProducts, 42, () => true);
 */
export function openAdDetailDialog(
  dialog: MatDialog,
  ads: AdvertisementItem[],
  allProducts: any[],
  adId: number,
  isUserAd: () => boolean,
): void {
  const selectedAd = ads.find((ad) => ad.advertisementId === adId);
  if (!selectedAd) return;

  const filteredImages = filterProductsByAdId(allProducts, adId);

  dialog.open(AdDetailDialogComponent, {
    data: {
      ad: selectedAd,
      product: filteredImages,
      isUserAd: isUserAd,
    },
  });
}

/**
 * @category Utils
 * 
 * @description Formats a category path string for display.
 * Converts underscores to slashes and capitalizes each segment.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param category - Raw category string (e.g., 'electronics_smartphones').
 * @returns Formatted category path (e.g., 'Electronics/Smartphones').
 *
 * @example
 * const path = formatCategoryPath('home_furniture'); // → 'Home/Furniture'
 */
export function formatCategoryPath(category: string): string {
  if (!category) return '';
  const parts = category.split('_');
  const formattedParts = parts.map(
    (seg) => seg.charAt(0).toUpperCase() + seg.slice(1),
  );

  return formattedParts.join('/');
}

/**
 * @category Utils
 * 
 * @description Calculates the dynamic step value for a price range slider based on the maximum price.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param maxPrice The maximum price in the ads
 * @returns The calculated step value
 */
export function calculatePriceStep(maxPrice: number): number {
  if (maxPrice <= 10) return 0.1;
  if (maxPrice <= 100) return 1;
  if (maxPrice <= 1000) return 10;
  if (maxPrice <= 10000) return 50;
  if (maxPrice <= 50000) return 100;
  return 500;
}

/**
 * @category Utils
 * 
 * @description Formats a price value for display in range slider tooltips.
 * Applies rounding or decimal formatting based on the provided step
 * and optionally prepends a currency symbol.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param price The numeric price value
 * @param step The step used for the slider (e.g., from calculatePriceStep)
 * @param currencySymbol Optional currency symbol (e.g. "€", "$")
 * @returns The formatted price string
 */
export function formatPriceAdv(
  price: number,
  step: number,
  currencySymbol?: string,
): string {
  const formatted = step < 1 ? price.toFixed(2) : String(Math.round(price));
  return currencySymbol ? `${currencySymbol} ${formatted}` : formatted;
}

/**
 * @category Utils
 * 
 * @description Enriches an advertisement with the corresponding currency symbol
 * based on its country using the provided currency map.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param ad The advertisement to enrich
 * @param countryCurrencyMap Map of country names (lowercase) to currency symbols
 * @returns A new advertisement instance with currency symbol applied
 */
export function enrichWithCurrencySymbol(
  ad: AdvertisementItem,
  countryCurrencyMap: Map<string, string>,
): AdvertisementItem {
  if (!ad.productCountry) return { ...ad, productCurrencySymbol: '' };

  const clean = extractCountryNameReplace(ad.productCountry);
  const symbol = countryCurrencyMap.get(clean.toLowerCase()) || '';
  return { ...ad, productCountry: clean, productCurrencySymbol: symbol };
}
