import { AdvertisementItem } from 'my-lib-inside';

/**
 * @category Utils
 * 
 * @description Extracts the price range from an array of AdvertisementItem objects.
 *
 * Only considers valid prices (non-null and greater than or equal to 0).
 * If no valid prices are found, the function returns `undefined`.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param {AdvertisementItem[]} ads - Array of AdvertisementItem objects to analyze
 * @returns {[number, number] | undefined} A tuple `[min, max]` representing the minimum and maximum price,
 * or `undefined` if there are no valid prices
 *
 * @example
 * const ads = [
 *   { price: 10 } as AdvertisementItem,
 *   { price: 50 } as AdvertisementItem,
 *   { price: 30 } as AdvertisementItem
 * ];
 * getPriceRange(ads); // [10, 50]
 *
 * @example
 * getPriceRange([]); // undefined
 */
export function getPriceRange(
  ads: AdvertisementItem[],
): [number, number] | undefined {
  const prices = ads
    .map((ad) => ad.price)
    .filter((price) => price != null && price >= 0) as number[];

  if (prices.length === 0) return undefined;

  return [Math.min(...prices), Math.max(...prices)];
}
