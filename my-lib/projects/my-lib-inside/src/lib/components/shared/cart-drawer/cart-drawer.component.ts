import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * @fileoverview Shopping cart drawer component with checkout and payment modals.
 *
 * @description
 * A complete cart management component that provides:
 * - Slide-out cart drawer with item list
 * - Quantity management (increase/decrease/input)
 * - Item removal
 * - Checkout modal with order summary and notes
 * - Payment modal with multiple payment method selection
 * - Mock payment toggle for testing
 *
 * This component is designed to be **stateless** - all business logic is handled
 * by the parent component. It only emits events and receives data via @Input().
 *
 * @category Components
 *
 * @author Popa Madalina Mariana
 * @version 0.0.1
 *
 * @example
 * ```html
 * <lib-cart-drawer
 *   [items]="cartItems"
 *   [totalAmount]="cartTotal"
 *   [itemsCount]="cartCount"
 *   [isOpen]="cartOpen"
 *   [paymentMethods]="['CREDIT_CARD', 'PAYPAL']"
 *   (quantityIncrease)="onIncrease($event)"
 *   (quantityDecrease)="onDecrease($event)"
 *   (itemRemove)="onRemove($event)"
 *   (orderConfirm)="onOrderConfirm()"
 *   (paymentConfirm)="onPaymentConfirm()"
 * ></lib-cart-drawer>
 * ```
 */
@Component({
  selector: 'lib-cart-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDrawerComponent {
  // ── Inputs ──────────────────────────

  /** @description Array of cart items from parent component */
  @Input() items: any[] = [];

  /** @description Total amount already calculated by parent */
  @Input() totalAmount: number = 0;

  /** @description Fallback currency symbol (e.g., '€', '$') */
  @Input() currencySymbol: string = '€';

  /** @description Number of items in cart (badge display) */
  @Input() itemsCount: number = 0;

  /** @description Whether the drawer is open/closed - controlled by parent */
  @Input() isOpen: boolean = false;

  /** @description Whether checkout modal is open - controlled by parent */
  @Input() showCheckoutModal: boolean = false;

  /** @description Whether payment modal is open - controlled by parent */
  @Input() showPaymentModal: boolean = false;

  /** @description Current order data from parent (contains orderNumber, totalAmount, etc.) */
  @Input() currentOrder: any = null;

  /** @description Available payment methods passed from parent (e.g., Object.values(PaymentMethod)) */
  @Input() paymentMethods: string[] = [];

  /** @description Currently selected payment method - controlled by parent */
  @Input() selectedPaymentMethod: string | null = null;

  /** @description Disables "Place Order" button while parent calls backend */
  @Input() isCheckingOut: boolean = false;

  /** @description Disables "Pay Now" button while parent processes payment */
  @Input() isProcessingPayment: boolean = false;

  // ── Outputs ────────

  /** @description Emitted when drawer is toggled (open/close) */
  @Output() drawerToggle = new EventEmitter<boolean>();

  /** @description Emitted when item quantity is increased */
  @Output() quantityIncrease = new EventEmitter<any>();

  /** @description Emitted when item quantity is decreased */
  @Output() quantityDecrease = new EventEmitter<any>();

  /** @description Emitted when quantity is manually input/changed */
  @Output() quantityChange = new EventEmitter<{ item: any; value: number }>();

  /** @description Emitted when item is removed from cart */
  @Output() itemRemove = new EventEmitter<any>();

  /** @description Emitted when user proceeds to checkout */
  @Output() checkoutOpen = new EventEmitter<void>();

  /** @description Emitted when checkout modal is closed */
  @Output() checkoutClose = new EventEmitter<void>();

  /** @description Emitted when order notes are changed */
  @Output() orderNotesChange = new EventEmitter<string>();

  /** @description Emitted when order is confirmed */
  @Output() orderConfirm = new EventEmitter<void>();

  /** @description Emitted when payment modal is closed */
  @Output() paymentClose = new EventEmitter<void>();

  /** @description Emitted when a payment method is selected */
  @Output() paymentMethodSelect = new EventEmitter<string>();

  /** @description Emitted when card token input changes */
  @Output() cardTokenChange = new EventEmitter<string>();

  /** @description Emitted when PayPal email input changes */
  @Output() paypalEmailChange = new EventEmitter<string>();

  /** @description Emitted when mock payment toggle is changed */
  @Output() mockPaymentToggle = new EventEmitter<boolean>();

  /** @description Emitted when payment is confirmed */
  @Output() paymentConfirm = new EventEmitter<void>();

  /** @description Whether to use mock payment for testing */
  @Input() useMockPayment: boolean = false; // <-- Nuovo input

  // ── UI state locale ───────────────────

  /** @description Controls tooltip visibility for total info */
  showTooltip = false;

  // ── Drawer ─────────────────────────────────────────────────────────────────

  /**
   * @description Toggles the drawer open/closed state.
   * Emits the opposite of current state.
   */
  toggleDrawer(): void {
    this.drawerToggle.emit(!this.isOpen);
  }

  /**
   * @description Closes the drawer.
   */
  closeDrawer(): void {
    this.drawerToggle.emit(false);
  }

  // ── Quantity ───────────────────────────────────────────────────────────────

  /**
   * @description Increases item quantity by 1.
   * Prevents exceeding available stock.
   * @param item - Cart item to update
   */
  onIncrease(item: any): void {
    if (item.quantity >= (item.product?.stockQuantity || 0)) return;
    this.quantityIncrease.emit(item);
  }

  /**
   * @description Decreases item quantity by 1.
   * Prevents going below 1.
   * @param item - Cart item to update
   */
  onDecrease(item: any): void {
    if (item.quantity <= 1) return;
    this.quantityDecrease.emit(item);
  }

  /**
   * @description Handles manual quantity input from user.
   * Clamps value between 1 and available stock.
   * @param item - Cart item to update
   * @param value - New quantity value
   */
  onQuantityInput(item: any, value: number): void {
    const max = item.product?.stockQuantity || 1;
    const clamped = Math.max(1, Math.min(value, max));
    this.quantityChange.emit({ item, value: clamped });
  }

  /**
   * @description Removes an item from the cart.
   * @param item - Cart item to remove
   */
  onRemove(item: any): void {
    this.itemRemove.emit(item);
  }

  // ── Checkout modal ─────────────────────────────────────────────────────────

  /**
   * @description Opens the checkout modal.
   */
  proceedToCheckout(): void {
    this.checkoutOpen.emit();
  }

  /**
   * @description Closes the checkout modal.
   */
  closeCheckoutModal(): void {
    this.checkoutClose.emit();
  }

  /**
   * @description Handles order notes input change.
   * @param event - Textarea input event
   */
  onOrderNotesChange(event: Event): void {
    this.orderNotesChange.emit((event.target as HTMLTextAreaElement).value);
  }

  /**
   * @description Confirms the order and proceeds to payment.
   */
  confirmOrder(): void {
    this.orderConfirm.emit();
  }

  // ── Payment modal ──────────────────────────────────────────────────────────

  /**
   * @description Closes the payment modal.
   */
  closePaymentModal(): void {
    this.paymentClose.emit();
  }

  /**
   * @description Selects a payment method.
   * @param m - Payment method identifier
   */
  selectPaymentMethod(m: string): void {
    this.paymentMethodSelect.emit(m);
  }

  /**
   * @description Handles card token input change.
   * @param event - Input event
   */
  onCardTokenChange(event: Event): void {
    this.cardTokenChange.emit((event.target as HTMLInputElement).value);
  }

  /**
   * @description Handles PayPal email input change.
   * @param event - Input event
   */
  onPaypalEmailChange(event: Event): void {
    this.paypalEmailChange.emit((event.target as HTMLInputElement).value);
  }

  /**
   * @description Handles mock payment toggle change.
   * @param event - Checkbox change event
   */
  onMockToggle(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.mockPaymentToggle.emit(isChecked);
  }

  /**
   * @description Confirms payment and processes the transaction.
   */
  confirmPayment(): void {
    this.paymentConfirm.emit();
  }

  // ── Template helpers ───────────────────────────────────────────────────────

  /**
   * @description Gets formatted total amount with currency symbol.
   * @returns Formatted string like '€ 125.50' or empty string if no items
   */
  getFormattedTotal(): string {
    if (!this.items.length) return '';
    const sym =
      this.items.find((i) => i.product?.productCurrencySymbol)?.product
        .productCurrencySymbol || this.currencySymbol;
    return `${sym} ${this.totalAmount.toFixed(2)}`;
  }

  /**
   * @description Gets the currency symbol for a specific item.
   * @param item - Cart item
   * @returns Currency symbol (e.g., '€', '$')
   */
  getCurrencySymbol(item: any): string {
    return item.product?.productCurrencySymbol || this.currencySymbol;
  }

  /**
   * @description Formats payment method name for display.
   * @param method - Raw payment method string (e.g., 'CREDIT_CARD')
   * @returns Formatted label (e.g., 'Credit Card')
   */
  getPaymentMethodLabel(method: string): string {
    return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
  }

  /**
   * @description Track function for ngFor to optimize rendering.
   * @param _ - Index (unused)
   * @param item - Cart item
   * @returns Unique identifier for the item
   */
  trackById(_: number, item: any): any {
    return item.cartItemId ?? item.id ?? _;
  }
}
