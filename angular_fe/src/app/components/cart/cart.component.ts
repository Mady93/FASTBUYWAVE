import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CartDrawerComponent } from 'my-lib-inside';
import {
  catchError,
  exhaustMap,
  finalize,
  of,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { CartDTO } from 'src/app/interfaces/cart_payment_order/cart/cartDTO.interface';
import { CartItemDTO } from 'src/app/interfaces/cart_payment_order/cart/cartItemDTO.interface';
import { OrderDTO } from 'src/app/interfaces/cart_payment_order/order/orderDTO.interface';
import { PaymentMethod } from 'src/app/interfaces/cart_payment_order/payment/paymentMethod.enum';
import { PaymentResponseDTO } from 'src/app/interfaces/cart_payment_order/payment/paymentResponseDTO.interface';
import { GeocodingService } from 'src/app/services/geo/geocoding.service';
import { CartService } from 'src/app/services/path/cart_order_payment/cart/cart.service';
import { OrderService } from 'src/app/services/path/cart_order_payment/order/order.service';
import { PaymentService } from 'src/app/services/path/cart_order_payment/payment/payment.service';
import {
  enrichCartItemsWithCurrency,
  getCartErrorMessage,
  getOrderErrorMessage,
  getPaymentErrorMessage,
} from 'src/app/utils/cart-utils';
import { extractCountryNameReplace } from 'src/app/utils/country.utils';
import { showSnackBar } from 'src/app/utils/snackbar.utils';

/**
 * @category Components
 * 
 * @description Component responsible for managing the shopping cart, checkout, and payment process.
 *
 * This component handles:
 * - Display and manipulation of cart items.
 * - Quantity adjustments and item removal.
 * - Checkout and order creation.
 * - Payment processing via multiple payment methods (including mock mode).
 * - Integration with GeocodingService to enrich products with currency symbols.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @remarks
 * The component uses Angular's ChangeDetectionStrategy.OnPush for optimized rendering.
 * All cart updates and reactive streams are managed with RxJS and the `takeUntil` pattern
 * for proper cleanup.
 *
 * @implements OnInit
 * @implements OnDestroy
 */
@Component({
  selector: 'app-cart-project',
  standalone: true,
  imports: [CommonModule, FormsModule, CartDrawerComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartComponent implements OnInit, OnDestroy {
  /**
   * @description Angular Material service for showing snack bar notifications.
   */
  private snackBar = inject(MatSnackBar);

  /**
   * @description Service for managing the shopping cart, adding/removing items, and providing cart streams.
   */
  private cartService = inject(CartService);

  /**
   * @description Service responsible for creating orders and managing order data.
   */
  private orderService = inject(OrderService);

  /**
   * @description Service for handling payments via multiple payment methods.
   */
  private paymentService = inject(PaymentService);

  /**
   * @description Angular Router for navigation between routes.
   */
  private router = inject(Router);

  /**
   * @description Angular ChangeDetectorRef used to manually trigger change detection.
   */
  private cdr = inject(ChangeDetectorRef);

  /**
   * @description Subject used to clean up subscriptions on component destroy.
   */
  private destroy$ = new Subject<void>();

  /**
   * @description Platform ID used to determine if the code is running in a browser.
   */
  private platformId = inject(PLATFORM_ID);

  /**
   * @description Service for geocoding and retrieving country-related advertisement data.
   */
  private geocodingService = inject(GeocodingService);

  /**
   * @description Map of country names to their currency symbols, used to enrich cart items.
   */
  private countryCurrencySymbolMap = new Map<string, string>();

  // ───────────────────────────────────────── Cart/Checkout state ────────────────────────────────────────────────

  /**
   * @description Current list of items in the cart.
   */
  cartItems: CartItemDTO[] = [];

  /**
   * @description Total number of items in the cart.
   */
  cartItemsCount = 0;

  /**
   * @description Total monetary amount of all items in the cart.
   */
  cartTotal = 0;

  /**
   * @description Flag indicating if an item is currently being added to the cart.
   */
  isAddingToCart = false;

  /**
   * @description Flag to show temporary toast notification after successful addition.
   */
  showSuccessToast = false;

  /**
   * @description Controls the visibility of the cart drawer component.
   */
  cartDrawerOpen = false;

  /**
   * @description Flag indicating if the checkout process is ongoing.
   */
  isCheckingOut = false;

  /**
   * @description Flag controlling the visibility of the checkout modal.
   */
  showCheckoutModal = false;

  /**
   * @description Stores the current order data after creating an order.
   */
  currentOrder: OrderDTO | null = null;

  /**
   * @description Flag indicating if payment processing is currently ongoing.
   */
  isProcessingPayment = false;

  /**
   * @description Flag controlling the visibility of the payment modal.
   */
  showPaymentModal = false;

  /**
   * @description Currently selected payment method by the user.
   */
  selectedPaymentMethod: string | null = null;

  /**
   * @description List of available payment methods.
   */
  paymentMethods = Object.values(PaymentMethod);

  // ────────────────────────────────────────── Internal form/payment state ──────────────────────────────────────────

  /**
   * @description Token used for card-based payments.
   */
  cardToken = '';

  /**
   * @description Email used for PayPal payments.
   */
  paypalEmail = '';

  /**
   * @description Optional notes added by the user during checkout.
   */
  orderNotes = '';

  /**
   * @description Flag indicating if mock payment mode is enabled.
   */
  useMockPayment: boolean = false;

  /**
   * @inheritdoc
   * @description Angular OnInit lifecycle hook.
   * Initializes the cart and sets up reactive listeners if running in the browser.
   */
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCart();
      this.setupCartListeners();
    }
  }

  /**
   * @inheritdoc
   * @description Angular OnDestroy lifecycle hook.
   * Cleans up subscriptions and completes the destroy$ subject.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ──────────────────────────────────────────────── Cart ────────────────────────────────────────────────

  /**
   * @description Initializes the cart by fetching the current user's cart from the service.
   * Subscribes to updates and handles errors.
   */
  private initializeCart(): void {
    this.cartService
      .getCurrentUserCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => this.updateCartFromDTO(cart),
        error: (error) => {
          if (error.status !== 404)
            showSnackBar(this.snackBar, 'Error loading the cart');
        },
      });
  }

  /**
   * @description Updates the component state with the provided CartDTO.
   * Calculates totals, item counts, and enriches items with currency symbols.
   *
   * @param cart - The cart data transfer object.
   */
  private updateCartFromDTO(cart: CartDTO | null): void {
    this.cartItems = cart?.cartItems || [];
    this.cartItemsCount = this.cartItems.reduce(
      (sum, i) => sum + i.quantity,
      0,
    );
    this.cartTotal = cart?.totalAmount || 0;
    enrichCartItemsWithCurrency(
      this.cartItems,
      () => this.geocodingService.getCountriesAdvertisementView(),
      extractCountryNameReplace,
      this.countryCurrencySymbolMap,
    ).subscribe((enrichedItems) => {
      this.cartItems = enrichedItems;
      this.cdr.markForCheck();
    });
  }

  /**
   * @description Sets up listeners for cart events including add-to-cart, item count, and total updates.
   * Uses RxJS operators and ensures proper cleanup.
   */
  private setupCartListeners(): void {
    this.cartService.addToCart$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap((ad) => {
          this.isAddingToCart = true;
          this.cdr.markForCheck();
          return this.cartService.quickAddToCart(ad).pipe(
            finalize(() => {
              this.isAddingToCart = false;
              this.cdr.markForCheck();
            }),
            tap({
              next: (cart) => {
                this.cartService.updateCartSummary(
                  cart.totalItems || 0,
                  cart.totalAmount || 0,
                );
                this.updateCartFromDTO(cart);
                this.showSuccessMessage(ad.title || 'Product');
              },
              error: (error) => this.handleAddToCartError(error),
            }),
            catchError(() => of(null)),
          );
        }),
      )
      .subscribe();

    this.cartService.cartItemsCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.cartItemsCount = count;
        this.cdr.markForCheck();
      });

    this.cartService.cartTotal$
      .pipe(takeUntil(this.destroy$))
      .subscribe((total) => {
        this.cartTotal = total;
        this.cdr.markForCheck();
      });
  }

  /**
   * @description Displays a temporary success message for adding an item to the cart.
   *
   * @param title - The name of the product added to the cart.
   */
  private showSuccessMessage(title: string): void {
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
      this.cdr.markForCheck();
    }, 3000);
    showSnackBar(this.snackBar, `"${title}" added to cart`);
  }

  // ──────────────────────────────────────────────── Quantity ────────────────────────────────────────────────

  /**
   * @description Increases the quantity of a cart item by one.
   * Validates stock availability and shows a snackbar if limit is reached.
   *
   * @param item - The cart item to update.
   */
  increaseQuantity(item: CartItemDTO): void {
    if (item.quantity >= (item.product?.stockQuantity || 0)) {
      showSnackBar(this.snackBar, 'Maximum available quantity reached');
      return;
    }
    this.updateQuantity(item, item.quantity + 1);
  }

  /**
   * @description Decreases the quantity of a cart item by one.
   * Ensures quantity cannot drop below 1.
   *
   * @param item - The cart item to update.
   */
  decreaseQuantity(item: CartItemDTO): void {
    if (item.quantity <= 1) return;
    this.updateQuantity(item, item.quantity - 1);
  }

  /**
   * @description Updates the quantity of a cart item to a specific value.
   * Clamps the value to available stock and ensures no redundant updates.
   *
   * @param item - The cart item to update.
   * @param value - The new quantity value.
   */
  updateQuantity(item: CartItemDTO, value: number): void {
    const newQty = Math.max(
      1,
      Math.min(value, item.product?.stockQuantity || 1),
    );
    if (newQty === item.quantity) return;
    this.cartService
      .updateCartItem(item.cartItemId, { quantity: newQty })
      .subscribe({
        next: (cart) => this.updateCartFromDTO(cart),
        error: (err) => this.handleAddToCartError(err),
      });
  }

  /**
   * @description Removes a cart item entirely from the cart.
   *
   * @param item - The cart item to remove.
   */
  removeFromCart(item: CartItemDTO): void {
    this.cartService.removeFromCart(item.cartItemId).subscribe({
      next: (cart) => this.updateCartFromDTO(cart),
      error: (err) => this.handleAddToCartError(err),
    });
  }

  // ──────────────────────────────────────────────── Checkout ────────────────────────────────────────────────

  /**
   * @description Opens the checkout modal if the cart has items.
   * Shows a snackbar if the cart is empty.
   */
  proceedToCheckout(): void {
    if (!this.cartItems.length) {
      showSnackBar(this.snackBar, 'The cart is empty');
      return;
    }
    this.showCheckoutModal = true;
    this.cdr.markForCheck();
  }

  /**
   * @description Closes the checkout modal and clears temporary order notes.
   */
  closeCheckoutModal(): void {
    this.showCheckoutModal = false;
    this.orderNotes = '';
    this.cdr.markForCheck();
  }

  /**
   * @description Creates an order from the current cart.
   * Handles success and failure scenarios and triggers payment modal if successful.
   */
  createOrder(): void {
    this.isCheckingOut = true;
    this.orderService
      .createOrderFromCart({ notes: this.orderNotes })
      .pipe(
        finalize(() => {
          this.isCheckingOut = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentOrder = response.data;
            this.showCheckoutModal = false;
            this.showPaymentModal = true;
            this.orderNotes = '';
            this.updateCartFromDTO(null);
            showSnackBar(this.snackBar, 'Order created successfully');
            this.cdr.markForCheck();
          } else {
            showSnackBar(
              this.snackBar,
              response.message || 'Error creating the order',
            );
          }
        },
        error: (err) => this.handleOrderError(err),
      });
  }

  // ────────────────────────────────────────────────────── Payment ──────────────────────────────────────────────────────

  /**
   * @description Sets the selected payment method and clears unrelated payment data.
   *
   * @param method - The selected payment method.
   */
  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method as PaymentMethod;
    if (method === PaymentMethod.PAYPAL) this.cardToken = '';
    else this.paypalEmail = '';
    this.cdr.markForCheck();
  }

  /**
   * @description Toggles between mock and real payment processing modes.
   * Shows a snackbar indicating the current mode.
   */
  togglePaymentMode(): void {
    this.useMockPayment = !this.useMockPayment;
    showSnackBar(
      this.snackBar,
      `Payment mode: ${this.useMockPayment ? 'MOCK' : 'GATEWAY'}`,
    );
  }

  /**
   * @description Closes the payment modal if payment is not in progress.
   * Otherwise shows a snackbar indicating ongoing payment.
   */
  closePaymentModal(): void {
    if (this.isProcessingPayment) {
      showSnackBar(this.snackBar, 'Payment in progress, please wait…');
      return;
    }
    this.resetPaymentModal();
  }

  /**
   * @description Processes payment for the current order using the selected method.
   * Handles mock payments, redirects for real payments, and error handling.
   */
  processPayment(): void {
    if (!this.currentOrder || !this.selectedPaymentMethod) {
      showSnackBar(this.snackBar, 'Please select a payment method');
      return;
    }
    this.isProcessingPayment = true;

    const options =
      this.selectedPaymentMethod !== PaymentMethod.PAYPAL
        ? { cardToken: this.cardToken }
        : { paypalEmail: this.paypalEmail };

    this.paymentService
      .processPayment(
        this.currentOrder.orderId,
        this.selectedPaymentMethod as PaymentMethod,
        this.useMockPayment,
        options,
      )
      .pipe(
        finalize(() => {
          this.isProcessingPayment = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            if (res.paymentUrl?.includes('mock')) this.handleMockPayment(res);
            else if (res.paymentUrl) window.location.href = res.paymentUrl;
            else this.handlePaymentSuccess();
          } else {
            showSnackBar(this.snackBar, res.message || 'Payment error');
          }
        },
        error: (err) => this.handlePaymentError(err),
      });
  }

  /**
   * @description Handles a simulated/mock payment confirmation.
   *
   * @param res - The payment response DTO from the server.
   */
  private handleMockPayment(res: PaymentResponseDTO): void {
    const ref = res.data?.paymentReference;
    if (!ref) {
      showSnackBar(this.snackBar, 'Payment reference error');
      return;
    }
    setTimeout(() => {
      this.paymentService
        .mockPaymentConfirmation(ref, this.useMockPayment)
        .subscribe({
          next: (r) =>
            r.success
              ? this.handlePaymentSuccess()
              : showSnackBar(this.snackBar, r.message || 'Payment failed'),
          error: (e) => this.handlePaymentError(e),
        });
    }, 1500);
  }

  /**
   * @description Handles successful payment completion.
   * Shows a snackbar, resets the payment modal, and redirects to orders page.
   */
  private handlePaymentSuccess(): void {
    showSnackBar(this.snackBar, 'Payment completed successfully');
    this.resetPaymentModal();
    setTimeout(() => this.router.navigate(['/orders']), 2000);
  }

  /**
   * @description Resets all payment modal state including order reference and user input.
   */
  private resetPaymentModal(): void {
    this.showPaymentModal = false;
    this.currentOrder = null;
    this.selectedPaymentMethod = null;
    this.cardToken = '';
    this.paypalEmail = '';
    this.isProcessingPayment = false;
    this.cdr.markForCheck();
  }

  // ─────────────────────────────────────────────── Error handlers ───────────────────────────────────────────────

  /**
   * @description Handles errors when adding items to the cart.
   * Redirects to login if unauthorized or shows appropriate snackbar messages.
   *
   * @param error - The error object returned from HTTP or service call.
   */
  private handleAddToCartError(error: any): void {
    if (error?.status === 401) {
      this.router.navigate(['/login']);
      return;
    }
    showSnackBar(this.snackBar, getCartErrorMessage(error));
  }

  /**
   * @description Handles errors occurring during order creation.
   *
   * @param error - The error object returned from HTTP or service call.
   */
  private handleOrderError(error: any): void {
    showSnackBar(this.snackBar, getOrderErrorMessage(error));
  }

  /**
   * @description Handles errors occurring during payment processing.
   *
   * @param error - The error object returned from HTTP or service call.
   */
  private handlePaymentError(error: any): void {
    showSnackBar(this.snackBar, getPaymentErrorMessage(error));
  }

  /**
   * @description Toggles mock payment mode programmatically.
   *
   * @param checked - Whether mock mode is enabled.
   */
  onMockToggle(checked: boolean): void {
    this.useMockPayment = checked;
  }
}
