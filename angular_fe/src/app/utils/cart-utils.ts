import { catchError, map, Observable, of } from 'rxjs';
import { CartItemDTO } from '../interfaces/cart_payment_order/cart/cartItemDTO.interface';

/**
 * @category Utils
 * 
 * @description Adds the correct currency symbol to a single cart item.
 * Pure function to be used in utils.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param item - The cart item to enrich
 * @param countryCurrencyMap - Map of country => currency symbol
 * @param extractCountryName - Function to extract the country name from the product
 * @returns The cart item enriched with productCurrencySymbol
 */
export function enrichWithCurrencySymbol(
  item: CartItemDTO,
  countryCurrencyMap: Map<string, string>,
  extractCountryName: (country: string) => string,
): CartItemDTO {
  if (!item.product?.productCountry) {
    return { ...item, product: { ...item.product, productCurrencySymbol: '' } };
  }

  const country = extractCountryName(item.product.productCountry).toLowerCase();
  const symbol = countryCurrencyMap.get(country) || '';

  return {
    ...item,
    product: {
      ...item.product,
      productCurrencySymbol: symbol,
    },
  };
}

/**
 * @category Utils
 * 
 * @description Enriches a list of cart items with currency symbols based on the product country.
 * Returns an updated array of cart items and updates the countryCurrencyMap.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param cartItems - Array of CartItemDTO to enrich
 * @param getCountries - Function that returns an Observable of country data (e.g., GeocodingService.getCountriesAdvertisementView)
 * @param extractCountryName - Function to extract the country name from a product
 * @param countryCurrencyMap - Map that will be updated with country => currency symbol
 * @returns Observable<CartItemDTO[]> with the enriched cart items
 */
export function enrichCartItemsWithCurrency(
  cartItems: CartItemDTO[],
  getCountries: () => Observable<any[]>,
  extractCountryName: (country: string) => string,
  countryCurrencyMap: Map<string, string>,
): Observable<CartItemDTO[]> {
  const countriesInCart = cartItems.map((i) =>
    extractCountryName(i.product.productCountry).toLowerCase(),
  );

  return getCountries().pipe(
    map((allCountries) => {
      countryCurrencyMap.clear();

      allCountries.forEach((c) => {
        const name = c.name.common.toLowerCase();
        if (!countriesInCart.includes(name)) return;

        const code = Object.keys(c.currencies || {})[0];
        const symbol = c.currencies?.[code]?.symbol || '';
        countryCurrencyMap.set(name, symbol);
      });

      return cartItems.map((item) =>
        enrichWithCurrencySymbol(item, countryCurrencyMap, extractCountryName),
      );
    }),
    catchError((err) => {
      console.error('Errore caricamento country data', err);
      return of(cartItems);
    }),
  );
}

/**
 * @category Utils
 * 
 * @description Returns the correct error message for cart errors.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param error - The error object from HTTP or service
 * @returns The user-friendly error message
 */
export function getCartErrorMessage(error: any): string {
  const map: Record<number, string> = {
    409: 'Insufficient stock',
    404: 'Product not found',
  };
  return map[error?.status] || error?.message || 'Error adding item to cart';
}

/**
 * @category Utils
 * 
 * @description Returns the correct error message for order errors.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param error - The error object from HTTP or service
 * @returns The user-friendly error message
 */
export function getOrderErrorMessage(error: any): string {
  const map: Record<number, string> = {
    409: 'Insufficient stock for some products',
    404: 'Some products are no longer available',
    400: 'Invalid order data',
  };
  return map[error?.status] || error?.message || 'Error creating the order';
}

/**
 * @category Utils
 * 
 * @description Returns the correct error message for payment errors.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param error - The error object from HTTP or service
 * @returns The user-friendly error message
 */
export function getPaymentErrorMessage(error: any): string {
  const map: Record<number, string> = {
    404: 'Payment or order not found',
    409: 'Payment already completed or invalid status',
  };
  return map[error?.status] || error?.message || 'Error processing payment';
}
