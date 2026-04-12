import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
} from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  PLATFORM_ID,
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { CartComponent } from './cart.component';
import { CartService } from 'src/app/services/path/cart_order_payment/cart/cart.service';
import { OrderService } from 'src/app/services/path/cart_order_payment/order/order.service';
import { PaymentService } from 'src/app/services/path/cart_order_payment/payment/payment.service';
import { GeocodingService } from 'src/app/services/geo/geocoding.service';
import { CartDTO } from 'src/app/interfaces/cart_payment_order/cart/cartDTO.interface';
import { CartItemDTO } from 'src/app/interfaces/cart_payment_order/cart/cartItemDTO.interface';
import { PaymentMethod } from 'src/app/interfaces/cart_payment_order/payment/paymentMethod.enum';
import { OrderStatus } from 'src/app/interfaces/cart_payment_order/order/orderStatus.enum';
import { OrderDTO } from 'src/app/interfaces/cart_payment_order/order/orderDTO.interface';
import { ProductSummaryDTO } from 'src/app/interfaces/cart_payment_order/cart/productSummaryDTO.interface';
import { UserSummaryDTO } from 'src/app/interfaces/cart_payment_order/order/userSummaryDTO.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: MOCK COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'lib-cart-drawer',
  template: '<div></div>',
  standalone: true,
})
class MockCartDrawerComponent {
  @Input() items: any[] = [];
  @Input() totalAmount: number = 0;
  @Input() currencySymbol: string = '€';
  @Input() itemsCount: number = 0;
  @Input() isOpen: boolean = false;
  @Input() showCheckoutModal: boolean = false;
  @Input() showPaymentModal: boolean = false;
  @Input() currentOrder: any = null;
  @Input() paymentMethods: string[] = [];
  @Input() selectedPaymentMethod: string | null = null;
  @Input() isCheckingOut: boolean = false;
  @Input() isProcessingPayment: boolean = false;
  @Input() useMockPayment: boolean = false;

  @Output() drawerToggle = new EventEmitter<boolean>();
  @Output() quantityIncrease = new EventEmitter<any>();
  @Output() quantityDecrease = new EventEmitter<any>();
  @Output() quantityChange = new EventEmitter<{ item: any; value: number }>();
  @Output() itemRemove = new EventEmitter<any>();
  @Output() checkoutOpen = new EventEmitter<void>();
  @Output() checkoutClose = new EventEmitter<void>();
  @Output() orderNotesChange = new EventEmitter<string>();
  @Output() orderConfirm = new EventEmitter<void>();
  @Output() paymentClose = new EventEmitter<void>();
  @Output() paymentMethodSelect = new EventEmitter<string>();
  @Output() cardTokenChange = new EventEmitter<string>();
  @Output() paypalEmailChange = new EventEmitter<string>();
  @Output() mockPaymentToggle = new EventEmitter<boolean>();
  @Output() paymentConfirm = new EventEmitter<void>();
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TEST DATA & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const snackBarOptions = {
  duration: 3000,
  horizontalPosition: 'center',
  verticalPosition: 'top',
};

const addToCartSubject = new Subject<any>();

const mockUser: UserSummaryDTO = {
  userId: 1,
  email: 'test@test.com',
  roles: 'USER',
};

const mockOrder: OrderDTO = {
  orderId: 99,
  orderNumber: 'ORD-001',
  orderDate: '2024-01-01T10:00:00Z',
  status: OrderStatus.PENDING,
  subtotal: 45,
  shippingCost: 5,
  taxAmount: 0,
  totalAmount: 50,
  notes: undefined,
  user: mockUser,
  orderItems: [],
  payment: undefined,
};

const product: ProductSummaryDTO = {
  productId: 10,
  title: 'Test Product',
  price: 25,
  condition: 'New',
  stockQuantity: 5,
  productCountry: 'Italy',
  productCurrencySymbol: '€',
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: SERVICE STUBS
// ─────────────────────────────────────────────────────────────────────────────

const cartServiceStub = {
  addToCart$: addToCartSubject.asObservable(),
  cartItemsCount$: of(0),
  cartTotal$: of(0),
  getCurrentUserCart: jasmine.createSpy('getCurrentUserCart').and.returnValue(
    of({
      cartId: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      active: true,
      userId: 1,
      userEmail: 'test@test.com',
      cartItems: [],
      totalAmount: 0,
      totalItems: 0,
    } as CartDTO),
  ),
  quickAddToCart: jasmine.createSpy('quickAddToCart').and.returnValue(
    of({
      cartId: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      active: true,
      userId: 1,
      userEmail: 'test@test.com',
      cartItems: [],
      totalAmount: 0,
      totalItems: 1,
    } as CartDTO),
  ),
  updateCartItem: jasmine.createSpy('updateCartItem').and.returnValue(
    of({
      cartId: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      active: true,
      userId: 1,
      userEmail: 'test@test.com',
      cartItems: [],
      totalAmount: 0,
      totalItems: 0,
    } as CartDTO),
  ),
  removeFromCart: jasmine.createSpy('removeFromCart').and.returnValue(
    of({
      cartId: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      active: true,
      userId: 1,
      userEmail: 'test@test.com',
      cartItems: [],
      totalAmount: 0,
      totalItems: 0,
    } as CartDTO),
  ),
  updateCartSummary: jasmine.createSpy('updateCartSummary'),
};

const orderServiceStub = {
  createOrderFromCart: jasmine
    .createSpy('createOrderFromCart')
    .and.returnValue(of({ success: true, data: mockOrder })),
};

const paymentServiceStub = {
  processPayment: jasmine
    .createSpy('processPayment')
    .and.returnValue(of({ success: true, paymentUrl: null })),
  mockPaymentConfirmation: jasmine
    .createSpy('mockPaymentConfirmation')
    .and.returnValue(of({ success: true })),
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: TEST SETUP
  // ─────────────────────────────────────────────────────────────────────────

  beforeEach(async () => {
    cartServiceStub.getCurrentUserCart.calls.reset();
    cartServiceStub.quickAddToCart.calls.reset();
    cartServiceStub.updateCartItem.calls.reset();
    cartServiceStub.removeFromCart.calls.reset();
    cartServiceStub.updateCartSummary.calls.reset();
    orderServiceStub.createOrderFromCart.calls.reset();
    paymentServiceStub.processPayment.calls.reset();
    paymentServiceStub.mockPaymentConfirmation.calls.reset();

    cartServiceStub.getCurrentUserCart.and.returnValue(
      of({
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [],
        totalAmount: 0,
        totalItems: 0,
      } as CartDTO),
    );
    orderServiceStub.createOrderFromCart.and.returnValue(
      of({ success: true, data: mockOrder }),
    );
    paymentServiceStub.processPayment.and.returnValue(
      of({ success: true, paymentUrl: null }),
    );

    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        { provide: CartService, useValue: cartServiceStub },
        { provide: OrderService, useValue: orderServiceStub },
        { provide: PaymentService, useValue: paymentServiceStub },
        {
          provide: GeocodingService,
          useValue: {
            getCountriesAdvertisementView: jasmine
              .createSpy()
              .and.returnValue(of([])),
          },
        },
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    })
      .overrideComponent(CartComponent, {
        set: {
          imports: [CommonModule, FormsModule, MockCartDrawerComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;

    component.cartItems = [];
    component.cartTotal = 0;
    component.cartItemsCount = 0;
    component.cartDrawerOpen = false;
    component.showCheckoutModal = false;
    component.showPaymentModal = false;
    component.currentOrder = null;
    component.paymentMethods = Object.values(PaymentMethod);
    component.selectedPaymentMethod = null;
    component.isCheckingOut = false;
    component.isProcessingPayment = false;
    component.useMockPayment = false;
    component.cardToken = '';
    component.paypalEmail = '';
    component.orderNotes = '';

    fixture.detectChanges();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: BASIC TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getCurrentUserCart on init', () => {
    expect(cartServiceStub.getCurrentUserCart).toHaveBeenCalled();
  });

  it('should not throw on 404 error during cart init', () => {
    cartServiceStub.getCurrentUserCart.and.returnValue(
      throwError(() => ({ status: 404 })),
    );
    expect(() => {
      const f = TestBed.createComponent(CartComponent);
      f.detectChanges();
    }).not.toThrow();
  });

  it('should show snackbar for non-404 errors on init', () => {
    const snackBar = TestBed.inject(MatSnackBar);
    cartServiceStub.getCurrentUserCart.and.returnValue(
      throwError(() => ({ status: 500 })),
    );
    TestBed.createComponent(CartComponent).detectChanges();
    expect(snackBar.open).toHaveBeenCalledWith(
      'Error loading the cart',
      '❌',
      jasmine.objectContaining(snackBarOptions),
    );
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: QUANTITY OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  describe('increaseQuantity', () => {
    it('should call updateCartItem with quantity + 1', () => {
      const item: CartItemDTO = {
        cartItemId: 1,
        quantity: 2,
        unitPrice: 10,
        subtotal: 20,
        addedAt: '2024-01-01',
        product: product,
      };
      component.increaseQuantity(item);
      expect(cartServiceStub.updateCartItem).toHaveBeenCalledWith(
        item.cartItemId,
        { quantity: 3 },
      );
    });

    it('should show snackbar and NOT update when max stock is reached', () => {
      const snackBar = TestBed.inject(MatSnackBar);
      const item: CartItemDTO = {
        cartItemId: 1,
        quantity: 5,
        unitPrice: 10,
        subtotal: 50,
        addedAt: '2024-01-01',
        product: product,
      };
      component.increaseQuantity(item);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Maximum available quantity reached',
        '❌',
        jasmine.objectContaining(snackBarOptions),
      );
      expect(cartServiceStub.updateCartItem).not.toHaveBeenCalled();
    });
  });

  describe('decreaseQuantity', () => {
    it('should call updateCartItem with quantity - 1', () => {
      const item: CartItemDTO = {
        cartItemId: 1,
        quantity: 3,
        unitPrice: 10,
        subtotal: 30,
        addedAt: '2024-01-01',
        product: product,
      };
      component.decreaseQuantity(item);
      expect(cartServiceStub.updateCartItem).toHaveBeenCalledWith(
        item.cartItemId,
        { quantity: 2 },
      );
    });

    it('should NOT call updateCartItem when quantity is already 1', () => {
      const item: CartItemDTO = {
        cartItemId: 1,
        quantity: 1,
        unitPrice: 10,
        subtotal: 10,
        addedAt: '2024-01-01',
        product: product,
      };
      component.decreaseQuantity(item);
      expect(cartServiceStub.updateCartItem).not.toHaveBeenCalled();
    });
  });

  describe('updateQuantity', () => {
    const item: CartItemDTO = {
      cartItemId: 1,
      quantity: 1,
      unitPrice: 10,
      subtotal: 10,
      addedAt: '2024-01-01',
      product: product,
    };

    it('should clamp value to max stock', () => {
      component.updateQuantity(item, 999);
      expect(cartServiceStub.updateCartItem).toHaveBeenCalledWith(1, {
        quantity: 5,
      });
    });

    it('should clamp value to minimum 1', () => {
      const item: CartItemDTO = {
        cartItemId: 1,
        quantity: 3,
        unitPrice: 10,
        subtotal: 30,
        addedAt: '2024-01-01',
        product: product,
      };

      component.updateQuantity(item, 0);

      expect(cartServiceStub.updateCartItem).toHaveBeenCalledWith(1, {
        quantity: 1,
      });
    });

    it('should NOT call updateCartItem if value equals current quantity', () => {
      component.updateQuantity(item, 1);
      expect(cartServiceStub.updateCartItem).not.toHaveBeenCalled();
    });

    it('should navigate to /login on 401 error', () => {
      const router = TestBed.inject(Router);
      cartServiceStub.updateCartItem.and.returnValue(
        throwError(() => ({ status: 401 })),
      );
      component.updateQuantity(item, 3);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: REMOVE FROM CART
  // ─────────────────────────────────────────────────────────────────────────

  describe('removeFromCart', () => {
    it('should call cartService.removeFromCart with the item id', () => {
      const item: CartItemDTO = {
        cartItemId: 1,
        quantity: 1,
        unitPrice: 10,
        subtotal: 10,
        addedAt: '2024-01-01',
        product: product,
      };
      component.removeFromCart(item);
      expect(cartServiceStub.removeFromCart).toHaveBeenCalledWith(
        item.cartItemId,
      );
    });

    it('should show snackbar on remove error', () => {
      const snackBar = TestBed.inject(MatSnackBar);
      cartServiceStub.removeFromCart.and.returnValue(
        throwError(() => ({ status: 409 })),
      );
      const item: CartItemDTO = {
        cartItemId: 1,
        quantity: 1,
        unitPrice: 10,
        subtotal: 10,
        addedAt: '2024-01-01',
        product: product,
      };
      component.removeFromCart(item);
      expect(snackBar.open).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: CHECKOUT FLOW
  // ─────────────────────────────────────────────────────────────────────────

  describe('proceedToCheckout', () => {
    it('should open checkout modal when cart has items', () => {
      component.cartItems = [
        {
          cartItemId: 1,
          quantity: 1,
          unitPrice: 10,
          subtotal: 10,
          addedAt: '2024-01-01',
          product: product,
        },
      ];
      component.proceedToCheckout();
      expect(component.showCheckoutModal).toBeTrue();
    });

    it('should show snackbar and NOT open modal when cart is empty', () => {
      const snackBar = TestBed.inject(MatSnackBar);
      component.cartItems = [];
      component.proceedToCheckout();
      expect(snackBar.open).toHaveBeenCalledWith(
        'The cart is empty',
        '❌',
        jasmine.objectContaining(snackBarOptions),
      );
      expect(component.showCheckoutModal).toBeFalse();
    });
  });

  describe('closeCheckoutModal', () => {
    it('should close modal and clear order notes', () => {
      component.showCheckoutModal = true;
      component.orderNotes = 'note test';
      component.closeCheckoutModal();
      expect(component.showCheckoutModal).toBeFalse();
      expect(component.orderNotes).toBe('');
    });
  });

  describe('createOrder', () => {
    it('should call createOrderFromCart with current notes', () => {
      component.orderNotes = 'spedire veloce';
      component.createOrder();
      expect(orderServiceStub.createOrderFromCart).toHaveBeenCalledWith({
        notes: 'spedire veloce',
      });
    });

    it('should open payment modal and set currentOrder on success', () => {
      component.createOrder();
      expect(component.showPaymentModal).toBeTrue();
      expect(component.currentOrder).toEqual(mockOrder);
    });

    it('should close checkout modal on success', () => {
      component.showCheckoutModal = true;
      component.createOrder();
      expect(component.showCheckoutModal).toBeFalse();
    });

    it('should show snackbar when backend returns success=false', () => {
      const snackBar = TestBed.inject(MatSnackBar);
      orderServiceStub.createOrderFromCart.and.returnValue(
        of({ success: false, message: 'Stock esaurito' }),
      );
      component.createOrder();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Stock esaurito',
        '❌',
        jasmine.objectContaining(snackBarOptions),
      );
    });

    it('should show snackbar on HTTP error', () => {
      const snackBar = TestBed.inject(MatSnackBar);
      orderServiceStub.createOrderFromCart.and.returnValue(
        throwError(() => ({ status: 409 })),
      );
      component.createOrder();
      expect(snackBar.open).toHaveBeenCalled();
    });

    it('should set isCheckingOut to false after completion', () => {
      component.createOrder();
      expect(component.isCheckingOut).toBeFalse();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: PAYMENT METHODS
  // ─────────────────────────────────────────────────────────────────────────

  describe('selectPaymentMethod', () => {
    it('should set selectedPaymentMethod', () => {
      component.selectPaymentMethod(PaymentMethod.VISA);
      expect(component.selectedPaymentMethod).toBe(PaymentMethod.VISA);
    });

    it('should clear cardToken when PAYPAL is selected', () => {
      component.cardToken = 'tok_123';
      component.selectPaymentMethod(PaymentMethod.PAYPAL);
      expect(component.cardToken).toBe('');
    });

    it('should clear paypalEmail when non-PAYPAL method is selected', () => {
      component.paypalEmail = 'user@paypal.com';
      component.selectPaymentMethod(PaymentMethod.VISA);
      expect(component.paypalEmail).toBe('');
    });
  });

  describe('togglePaymentMode', () => {
    it('should toggle useMockPayment from false to true', () => {
      component.useMockPayment = false;
      component.togglePaymentMode();
      expect(component.useMockPayment).toBeTrue();
    });

    it('should toggle useMockPayment from true to false', () => {
      component.useMockPayment = true;
      component.togglePaymentMode();
      expect(component.useMockPayment).toBeFalse();
    });

    it('should show snackbar with MOCK label when enabled', () => {
      const snackBar = TestBed.inject(MatSnackBar);
      component.useMockPayment = false;
      component.togglePaymentMode();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Payment mode: MOCK',
        '❌',
        jasmine.objectContaining(snackBarOptions),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: PAYMENT MODAL
  // ─────────────────────────────────────────────────────────────────────────

  describe('closePaymentModal', () => {
    it('should reset payment modal state when not processing', () => {
      component.showPaymentModal = true;
      component.isProcessingPayment = false;
      component.closePaymentModal();
      expect(component.showPaymentModal).toBeFalse();
    });

    it('should show snackbar and keep modal open when payment is in progress', () => {
      const snackBar = TestBed.inject(MatSnackBar);
      component.showPaymentModal = true;
      component.isProcessingPayment = true;
      component.closePaymentModal();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Payment in progress, please wait…',
        '❌',
        jasmine.objectContaining(snackBarOptions),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: PAYMENT PROCESSING
  // ─────────────────────────────────────────────────────────────────────────

  describe('processPayment', () => {
    beforeEach(() => {
      component.currentOrder = mockOrder;
      component.selectedPaymentMethod = PaymentMethod.VISA;
      component.cardToken = 'tok_abc';
    });

    it('should show snackbar when order or method is missing', () => {
      const snackBar = TestBed.inject(MatSnackBar);
      component.currentOrder = null;
      component.processPayment();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Please select a payment method',
        '❌',
        jasmine.objectContaining(snackBarOptions),
      );
    });

    it('should call paymentService.processPayment with correct params (VISA)', () => {
      component.processPayment();
      expect(paymentServiceStub.processPayment).toHaveBeenCalledWith(
        99,
        PaymentMethod.VISA,
        false,
        { cardToken: 'tok_abc' },
      );
    });

    it('should pass paypalEmail when PAYPAL is selected', () => {
      component.selectedPaymentMethod = PaymentMethod.PAYPAL;
      component.paypalEmail = 'user@paypal.com';
      component.processPayment();
      expect(paymentServiceStub.processPayment).toHaveBeenCalledWith(
        99,
        PaymentMethod.PAYPAL,
        false,
        { paypalEmail: 'user@paypal.com' },
      );
    });

    it('should show success snackbar on direct payment success (no URL)', () => {
      const snackBar = TestBed.inject(MatSnackBar);
      component.processPayment();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Payment completed successfully',
        '❌',
        jasmine.objectContaining(snackBarOptions),
      );
    });

    it('should navigate to /orders after 2s on success', fakeAsync(() => {
      const router = TestBed.inject(Router);
      component.processPayment();
      tick(2000);
      expect(router.navigate).toHaveBeenCalledWith(['/orders']);
    }));

    it('should call mockPaymentConfirmation after 1500ms for mock URL', fakeAsync(() => {
      paymentServiceStub.processPayment.and.returnValue(
        of({
          success: true,
          paymentUrl: 'http://mock/pay',
          data: { paymentReference: 'REF-001' },
        }),
      );
      component.processPayment();
      tick(1500);
      flush();
      expect(paymentServiceStub.mockPaymentConfirmation).toHaveBeenCalledWith(
        'REF-001',
        false,
      );
    }));

    it('should show snackbar when payment reference is missing in mock response', fakeAsync(() => {
      const snackBar = TestBed.inject(MatSnackBar);
      paymentServiceStub.processPayment.and.returnValue(
        of({
          success: true,
          paymentUrl: 'http://mock/pay',
          data: null,
        }),
      );
      component.processPayment();
      tick(1500);
      expect(snackBar.open).toHaveBeenCalledWith(
        'Payment reference error',
        '❌',
        jasmine.objectContaining(snackBarOptions),
      );
    }));

    it('should show snackbar when payment response success is false', () => {
      const snackBar = TestBed.inject(MatSnackBar);
      paymentServiceStub.processPayment.and.returnValue(
        of({ success: false, message: 'Carta rifiutata' }),
      );
      component.processPayment();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Carta rifiutata',
        '❌',
        jasmine.objectContaining(snackBarOptions),
      );
    });

    it('should show snackbar on HTTP error', () => {
      const snackBar = TestBed.inject(MatSnackBar);
      paymentServiceStub.processPayment.and.returnValue(
        throwError(() => ({ status: 404 })),
      );
      component.processPayment();
      expect(snackBar.open).toHaveBeenCalled();
    });

    it('should set isProcessingPayment to false after completion', () => {
      component.processPayment();
      expect(component.isProcessingPayment).toBeFalse();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: MOCK PAYMENT TOGGLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('onMockToggle', () => {
    it('should set useMockPayment to true', () => {
      component.onMockToggle(true);
      expect(component.useMockPayment).toBeTrue();
    });

    it('should set useMockPayment to false', () => {
      component.useMockPayment = true;
      component.onMockToggle(false);
      expect(component.useMockPayment).toBeFalse();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: ADD TO CART STREAM
  // ─────────────────────────────────────────────────────────────────────────

  describe('addToCart$ stream', () => {
    it('should call quickAddToCart when stream emits', fakeAsync(() => {
      const ad = {
        productId: 5,
        title: 'Widget',
        active: true,
        stockQuantity: 3,
      };

      addToCartSubject.next(ad);

      tick();
      flush();

      expect(cartServiceStub.quickAddToCart).toHaveBeenCalledWith(ad);
    }));

    it('should call updateCartSummary with totals after successful add', fakeAsync(() => {
      const cart: CartDTO = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [],
        totalAmount: 25,
        totalItems: 1,
      };
      cartServiceStub.quickAddToCart.and.returnValue(of(cart));
      addToCartSubject.next({
        productId: 5,
        title: 'Widget',
        active: true,
        stockQuantity: 3,
      });
      tick();
      flush();
      expect(cartServiceStub.updateCartSummary).toHaveBeenCalledWith(1, 25);
    }));
  });
});