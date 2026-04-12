import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdvertisementItem } from 'my-lib-inside';
import { BehaviorSubject, map, Observable, Subject, tap } from 'rxjs';
import { AddToCartRequestDTO } from 'src/app/interfaces/cart_payment_order/cart/addToCartRequestDTO.interface';
import { CartDTO } from 'src/app/interfaces/cart_payment_order/cart/cartDTO.interface';
import { CartResponseDTO } from 'src/app/interfaces/cart_payment_order/cart/cartResponseDTO.interface';
import { UpdateCartItemRequest } from 'src/app/interfaces/cart_payment_order/cart/updateCartItemRequest.interface';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Service responsible for managing the user's shopping cart.
 * Provides methods to:
 * - Retrieve the current cart
 * - Add, update, or remove items
 * - Clear the cart
 * - Track cart totals and item counts
 * - Convert AdvertisementItem objects to AddToCartRequestDTO
 * - Validate stock availability before adding items
 * - Communicate cart updates between components via observables
 *
 * It also exposes reactive streams (`BehaviorSubject` and `Subject`) to allow
 * components to reactively subscribe to cart changes, total count, and total value.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @example
 * // Injecting the service in a component
 * constructor(private cartService: CartService) {}
 *
 * // Subscribe to the cart observable
 * this.cartService.cart$.subscribe(cart => console.log(cart));
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  /**
   * @constructor
   * @param http - Angular HttpClient for API calls.
   * @param apiConfig - Service providing API endpoints configuration.
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Internal BehaviorSubject holding the current cart state.
   * Emits `CartDTO` when cart changes, `null` if empty.
   */
  private cartSubject = new BehaviorSubject<CartDTO | null>(null);

  /**
   * @description Public observable emitting the current cart state.
   * Components can subscribe to reactively get cart updates.
   */
  public cart$ = this.cartSubject.asObservable();

  /**
   * @description Internal Subject used to notify when an AdvertisementItem
   * should be added to the cart.
   * Useful for cross-component communication (e.g., advertisement-view → cart).
   */
  private addToCartSubject = new Subject<AdvertisementItem>();

  /**
   * @description Observable emitting AdvertisementItems to be added to the cart.
   * Allows components without direct parent-child relationship to communicate.
   */
  public addToCart$ = this.addToCartSubject.asObservable();

  /**
   * @description BehaviorSubject tracking the total number of items in the cart.
   */
  private cartItemsCountSubject = new BehaviorSubject<number>(0);

  /**
   * @description Observable emitting the current total number of items in the cart.
   */
  public cartItemsCount$ = this.cartItemsCountSubject.asObservable();

  /**
   * @description BehaviorSubject tracking the total value of the cart.
   */
  private cartTotalSubject = new BehaviorSubject<number>(0);

  /**
   * @description Observable emitting the current total price of the cart.
   */
  public cartTotal$ = this.cartTotalSubject.asObservable();

  /**
   * @description Retrieves the current user's cart from the backend.
   * Updates the internal cart state observable.
   *
   * @returns Observable<CartDTO> emitting the current cart.
   */
  getCurrentUserCart(): Observable<CartDTO> {
    return this.http.get<CartResponseDTO>(`${this.apiConfig.apiCart}`).pipe(
      map((response) => response.data),
      tap((cart) => {
        this.cartSubject.next(cart);
      }),
    );
  }

  /**
   * @description Adds an item to the cart.
   * Updates the internal cart state observable.
   *
   * @param request - DTO containing product ID and quantity.
   * @returns Observable<CartDTO> emitting the updated cart.
   */
  addToCart(request: AddToCartRequestDTO): Observable<CartDTO> {
    return this.http
      .post<CartResponseDTO>(`${this.apiConfig.apiCart}/items`, request)
      .pipe(
        map((response) => response.data),
        tap((cart) => {
          this.cartSubject.next(cart);
        }),
      );
  }

  /**
   * @description Updates the quantity of a specific cart item.
   * Updates the internal cart state observable.
   *
   * @param cartItemId - ID of the cart item to update.
   * @param request - DTO containing new quantity.
   * @returns Observable<CartDTO> emitting the updated cart.
   */
  updateCartItem(
    cartItemId: number,
    request: UpdateCartItemRequest,
  ): Observable<CartDTO> {
    return this.http
      .put<CartResponseDTO>(
        `${this.apiConfig.apiCart}/items/${cartItemId}`,
        request,
      )
      .pipe(
        map((response) => response.data),
        tap((cart) => {
          this.cartSubject.next(cart);
        }),
      );
  }

  /**
   * @description Removes a specific item from the cart.
   * Updates the internal cart state observable.
   *
   * @param cartItemId - ID of the cart item to remove.
   * @returns Observable<CartDTO> emitting the updated cart.
   * @throws Error if backend response indicates failure.
   */
  removeFromCart(cartItemId: number): Observable<CartDTO> {
    return this.http
      .delete<CartResponseDTO>(`${this.apiConfig.apiCart}/items/${cartItemId}`)
      .pipe(
        map((res) => {
          if (res.success && res.data) {
            this.cartSubject.next(res.data);
            return res.data;
          }
          throw new Error(res.message);
        }),
      );
  }

  /**
   * @description Clears the entire cart.
   * Updates the internal cart state observable to null.
   *
   * @returns Observable<void> that completes when the cart is cleared.
   * @throws Error if backend response indicates failure.
   */
  clearCart(): Observable<void> {
    return this.http.delete<CartResponseDTO>(`${this.apiConfig.apiCart}`).pipe(
      tap((res) => {
        if (res.success) {
          // Il BE non ritorna il cartDTO, quindi impostiamo a null
          this.cartSubject.next(null);
          this.updateCartSummary(0, 0);
        } else {
          throw new Error(res.message);
        }
      }),
      map(() => void 0),
    );
  }

  /**
   * @description Returns the total number of items in the cart.
   *
   * @returns Observable<number> emitting the total count of items.
   */
  getCartItemsCount(): Observable<number> {
    return this.cart$.pipe(map((cart) => cart?.totalItems || 0));
  }

  /**
   * @description Formats a price with a given currency symbol.
   *
   * @param price - Numeric price to format.
   * @param currencySymbol - Currency symbol to prepend.
   * @returns Formatted price string.
   */
  formatPrice(price: number, currencySymbol: string): string {
    return `${currencySymbol}${price.toFixed(2)}`;
  }

  /**
   * @description Converts an AdvertisementItem to an AddToCartRequestDTO.
   * Validates product availability and requested quantity.
   *
   * @param ad - AdvertisementItem to convert.
   * @param quantity - Desired quantity (default: 1).
   * @returns AddToCartRequestDTO ready for API submission.
   * @throws Error if product data is incomplete or stock is insufficient.
   */
  createAddToCartRequestFromAd(
    ad: AdvertisementItem,
    quantity: number = 1,
  ): AddToCartRequestDTO {
    if (!ad.productId || ad.price == null) {
      throw new Error('Product data incomplete: missing productId or price');
    }

    if (ad.stockQuantity == null || ad.stockQuantity <= 0) {
      throw new Error('Product is out of stock');
    }

    if (quantity > ad.stockQuantity) {
      throw new Error(
        `Requested quantity (${quantity}) exceeds available stock (${ad.stockQuantity})`,
      );
    }

    return {
      productId: ad.productId,
      quantity: quantity,
    };
  }

  /**
   * @description Adds an advertisement item to the cart.
   *
   * @param ad - AdvertisementItem to add.
   * @param quantity - Quantity to add (default: 1).
   * @returns Observable<CartDTO> emitting the updated cart.
   */
  addAdvertisementToCart(
    ad: AdvertisementItem,
    quantity: number = 1,
  ): Observable<CartDTO> {
    const request = this.createAddToCartRequestFromAd(ad, quantity);
    return this.addToCart(request);
  }

  /**
   * @description Quickly adds one unit of an advertisement item to the cart.
   * Validates product ID, activity status, and stock availability.
   *
   * @param ad - AdvertisementItem to add.
   * @returns Observable<CartDTO> emitting the updated cart.
   * @throws Error if product cannot be added.
   */
  quickAddToCart(ad: AdvertisementItem): Observable<CartDTO> {
    if (!ad.productId) {
      throw new Error('Cannot add to cart: Product ID is missing');
    }

    if (!ad.active) {
      throw new Error('Cannot add to cart: Product is not active');
    }

    if (ad.stockQuantity === 0) {
      throw new Error('Cannot add to cart: Product is out of stock');
    }

    return this.addAdvertisementToCart(ad, 1);
  }

  /**
   * @description Emits a product addition to the cart to subscribers.
   *
   * @param product - AdvertisementItem to add.
   */
  addProductToCart(product: AdvertisementItem): void {
    this.addToCartSubject.next(product);
  }

  /**
   * @description Updates the cart summary (items count and total value).
   *
   * @param count - Total number of items.
   * @param total - Total value of the cart.
   */
  updateCartSummary(count: number, total: number): void {
    this.cartItemsCountSubject.next(count);
    this.cartTotalSubject.next(total);
  }

  /**
   * @description Returns the current total item count in the cart.
   *
   * @returns Number of items currently in the cart.
   */
  getCurrentCartCount(): number {
    return this.cartItemsCountSubject.value;
  }

  /**
   * @description Returns the quantity of a product currently in the cart.
   *
   * @param productId - ID of the product.
   * @returns Quantity in cart.
   */
  getQuantityInCart(productId: number): number {
    const cart = this.cartSubject.value;
    if (!cart?.cartItems) return 0;
    const item = cart.cartItems.find((i) => i.product?.productId === productId);
    return item?.quantity || 0;
  }

  /**
   * @description Checks if more units of a product can be added to the cart.
   *
   * @param ad - AdvertisementItem to check.
   * @returns True if stock allows additional units to be added.
   */
  canAddMoreToCart(ad: AdvertisementItem): boolean {
    if (!ad.productId || !ad.active || (ad.stockQuantity ?? 0) === 0)
      return false;
    const quantityInCart = this.getQuantityInCart(ad.productId);
    return quantityInCart < (ad.stockQuantity ?? 0);
  }
}
