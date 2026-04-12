import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';

import { CartService } from './cart.service';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';
import { CartDTO } from 'src/app/interfaces/cart_payment_order/cart/cartDTO.interface';
import { CartItemDTO } from 'src/app/interfaces/cart_payment_order/cart/cartItemDTO.interface';
import { CartResponseDTO } from 'src/app/interfaces/cart_payment_order/cart/cartResponseDTO.interface';
import { AddToCartRequestDTO } from 'src/app/interfaces/cart_payment_order/cart/addToCartRequestDTO.interface';
import { UpdateCartItemRequest } from 'src/app/interfaces/cart_payment_order/cart/updateCartItemRequest.interface';
import { AdvertisementItem } from 'my-lib-inside';
import { ProductSummaryDTO } from 'src/app/interfaces/cart_payment_order/cart/productSummaryDTO.interface';

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  let apiConfigService: ApiConfigService;
  let expectedApiUrl: string;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CartService,
        ApiConfigService,
        {
          provide: PLATFORM_ID,
          useValue: 'browser',
        },
      ],
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
    apiConfigService = TestBed.inject(ApiConfigService);

    expectedApiUrl = apiConfigService.apiCart;
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ── getCurrentUserCart ─────────────────────────────────────────────────────

  describe('getCurrentUserCart', () => {
    it('should GET the cart and return CartDTO', (done) => {
      const cart: CartDTO = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [],
        totalAmount: 50,
        totalItems: 0,
      };

      const response: CartResponseDTO = {
        success: true,
        message: '',
        data: cart,
      };

      service.getCurrentUserCart().subscribe((result) => {
        expect(result).toEqual(cart);
        done();
      });

      const req = httpMock.expectOne(expectedApiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(response);
    });

    it('should update cart$ observable after fetch', fakeAsync(() => {
      const cart: CartDTO = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [],
        totalAmount: 0,
        totalItems: 3,
      };

      const response: CartResponseDTO = {
        success: true,
        message: '',
        data: cart,
      };

      let emitted: CartDTO | null = null;

      service.cart$.subscribe((c) => (emitted = c));
      service.getCurrentUserCart().subscribe();

      httpMock.expectOne(expectedApiUrl).flush(response);
      tick();

      expect(emitted).not.toBeNull();
      expect(emitted!).toEqual(cart);
    }));
  });

  // ── addToCart ──────────────────────────────────────────────────────────────

  describe('addToCart', () => {
    it('should POST to cart items endpoint', (done) => {
      const request: AddToCartRequestDTO = { productId: 10, quantity: 1 };

      const cart: CartDTO = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [],
        totalAmount: 0,
        totalItems: 1,
      };

      const response: CartResponseDTO = {
        success: true,
        message: '',
        data: cart,
      };

      service.addToCart(request).subscribe((result) => {
        expect(result).toEqual(cart);
        done();
      });

      const req = httpMock.expectOne(`${expectedApiUrl}/items`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(response);
    });
  });

  // ── updateCartItem ─────────────────────────────────────────────────────────

  describe('updateCartItem', () => {
    it('should PUT to the correct URL with new quantity', (done) => {
      const request: UpdateCartItemRequest = { quantity: 3 };

      const cart: CartDTO = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [],
        totalAmount: 75,
        totalItems: 0,
      };

      const response: CartResponseDTO = {
        success: true,
        message: '',
        data: cart,
      };

      service.updateCartItem(1, request).subscribe((result) => {
        expect(result).toEqual(cart);
        done();
      });

      const req = httpMock.expectOne(`${expectedApiUrl}/items/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(response);
    });
  });

  // ── removeFromCart ─────────────────────────────────────────────────────────

  describe('removeFromCart', () => {
    it('should DELETE item and return updated cart', (done) => {
      const cart: CartDTO = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [],
        totalAmount: 0,
        totalItems: 0,
      };

      const response: CartResponseDTO = {
        success: true,
        message: '',
        data: cart,
      };

      service.removeFromCart(1).subscribe((result) => {
        expect(result).toEqual(cart);
        done();
      });

      const req = httpMock.expectOne(`${expectedApiUrl}/items/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(response);
    });

    it('should throw when success is false', (done) => {
      const errorResponse: CartResponseDTO = {
        success: false,
        message: 'Item not found',
        data: null as any,
      };

      service.removeFromCart(99).subscribe({
        error: (err) => {
          expect(err.message).toBe('Item not found');
          done();
        },
      });

      httpMock.expectOne(`${expectedApiUrl}/items/99`).flush(errorResponse);
    });
  });

  // ── clearCart ──────────────────────────────────────────────────────────────

  describe('clearCart', () => {
    it('should DELETE cart and set cart$ to null', fakeAsync(() => {
      let cartValue: CartDTO | null = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [],
        totalAmount: 100,
        totalItems: 2,
      };

      service.cart$.subscribe((c) => (cartValue = c));

      service.clearCart().subscribe();
      httpMock.expectOne(expectedApiUrl).flush({ success: true });
      tick();

      expect(cartValue).toBeNull();
    }));

    it('should throw when response success is false', (done) => {
      service.clearCart().subscribe({
        error: (err) => {
          expect(err.message).toBe('Error');
          done();
        },
      });

      httpMock
        .expectOne(expectedApiUrl)
        .flush({ success: false, message: 'Error' });
    });
  });

  // ── formatPrice ───────────────────────────────────────────────────────────

  describe('formatPrice', () => {
    it('should format with symbol and two decimals', () => {
      expect(service.formatPrice(12.5, '€')).toBe('€12.50');
    });

    it('should handle integer prices', () => {
      expect(service.formatPrice(100, '$')).toBe('$100.00');
    });
  });

  // ── createAddToCartRequestFromAd ──────────────────────────────────────────

  describe('createAddToCartRequestFromAd', () => {
    it('should return a valid request DTO', () => {
      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 5,
      };

      const result = service.createAddToCartRequestFromAd(ad);
      expect(result).toEqual({ productId: 10, quantity: 1 });
    });

    it('should throw when productId is missing', () => {
      const ad: AdvertisementItem = {
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 5,
      };

      expect(() => service.createAddToCartRequestFromAd(ad)).toThrowError(
        'Product data incomplete: missing productId or price',
      );
    });

    it('should throw when price is null', () => {
      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: null as any,
        active: true,
        stockQuantity: 5,
      };

      expect(() => service.createAddToCartRequestFromAd(ad)).toThrowError(
        'Product data incomplete: missing productId or price',
      );
    });

    it('should throw when stock is 0', () => {
      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 0,
      };

      expect(() => service.createAddToCartRequestFromAd(ad)).toThrowError(
        'Product is out of stock',
      );
    });

    it('should throw when requested quantity exceeds stock', () => {
      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 2,
      };

      expect(() => service.createAddToCartRequestFromAd(ad, 5)).toThrowError(
        /exceeds available stock/,
      );
    });
  });

  // ── addAdvertisementToCart ─────────────────────────────────────────────────

  describe('addAdvertisementToCart', () => {
    it('should add advertisement to cart', (done) => {
      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 5,
      };

      const cart: CartDTO = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [],
        totalAmount: 0,
        totalItems: 1,
      };

      const response: CartResponseDTO = {
        success: true,
        message: '',
        data: cart,
      };

      service.addAdvertisementToCart(ad).subscribe((result) => {
        expect(result).toEqual(cart);
        done();
      });

      const req = httpMock.expectOne(`${expectedApiUrl}/items`);
      expect(req.request.body).toEqual({ productId: 10, quantity: 1 });
      req.flush(response);
    });
  });

  // ── quickAddToCart ────────────────────────────────────────────────────────

  describe('quickAddToCart', () => {
    it('should throw when productId is missing', () => {
      const ad: AdvertisementItem = {
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 5,
      };

      expect(() => service.quickAddToCart(ad)).toThrowError(
        'Cannot add to cart: Product ID is missing',
      );
    });

    it('should throw when product is inactive', () => {
      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        active: false,
        stockQuantity: 5,
      };

      expect(() => service.quickAddToCart(ad)).toThrowError(
        'Cannot add to cart: Product is not active',
      );
    });

    it('should throw when stockQuantity is 0', () => {
      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 0,
      };

      expect(() => service.quickAddToCart(ad)).toThrowError(
        'Cannot add to cart: Product is out of stock',
      );
    });

    it('should POST with quantity 1 for valid ad', (done) => {
      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 5,
      };

      const cart: CartDTO = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [],
        totalAmount: 0,
        totalItems: 1,
      };

      const response: CartResponseDTO = {
        success: true,
        message: '',
        data: cart,
      };

      service.quickAddToCart(ad).subscribe((result) => {
        expect(result).toEqual(cart);
        done();
      });

      const req = httpMock.expectOne(`${expectedApiUrl}/items`);
      expect(req.request.body).toEqual({ productId: 10, quantity: 1 });
      req.flush(response);
    });
  });

  // ── updateCartSummary / getCurrentCartCount ───────────────────────────────

  describe('updateCartSummary', () => {
    it('should emit updated count and total', fakeAsync(() => {
      let count = 0;
      let total = 0;

      service.cartItemsCount$.subscribe((c) => (count = c));
      service.cartTotal$.subscribe((t) => (total = t));

      service.updateCartSummary(5, 99.99);
      tick();

      expect(count).toBe(5);
      expect(total).toBe(99.99);
    }));
  });

  describe('getCurrentCartCount', () => {
    it('should return current count synchronously', () => {
      service.updateCartSummary(7, 0);
      expect(service.getCurrentCartCount()).toBe(7);
    });
  });

  // ── getQuantityInCart ─────────────────────────────────────────────────────

  describe('getQuantityInCart', () => {
    it('should return 0 when cart is empty', () => {
      expect(service.getQuantityInCart(10)).toBe(0);
    });

    it('should return the quantity of a matching product', fakeAsync(() => {
      const product: ProductSummaryDTO = {
  productId: 10,
  title: 'Test Product',
  price: 25,
  condition: 'New',
  stockQuantity: 5,
  productCountry: 'Italy',
  productCurrencySymbol: '€',
};

      const item: CartItemDTO = {
        cartItemId: 1,
        quantity: 3,
        unitPrice: 10,
        subtotal: 30,
        addedAt: '2024-01-01',
        product: product,
      };

      const cart: CartDTO = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [item],
        totalAmount: 30,
        totalItems: 3,
      };

      const response: CartResponseDTO = {
        success: true,
        message: '',
        data: cart,
      };

      service.getCurrentUserCart().subscribe();
      httpMock.expectOne(expectedApiUrl).flush(response);
      tick();

      expect(service.getQuantityInCart(10)).toBe(3);
    }));

    it('should return 0 for a product not in cart', fakeAsync(() => {
      const product: ProductSummaryDTO = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        condition: 'New',
        stockQuantity: 5,
        productCountry: 'Italy',
        productCurrencySymbol: '€',
      };

      const item: CartItemDTO = {
        cartItemId: 1,
        quantity: 1,
        unitPrice: 10,
        subtotal: 10,
        addedAt: '2024-01-01',
        product: product,
      };

      const cart: CartDTO = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [item],
        totalAmount: 10,
        totalItems: 1,
      };

      const response: CartResponseDTO = {
        success: true,
        message: '',
        data: cart,
      };

      service.getCurrentUserCart().subscribe();
      httpMock.expectOne(expectedApiUrl).flush(response);
      tick();

      expect(service.getQuantityInCart(999)).toBe(0);
    }));
  });

  // ── canAddMoreToCart ──────────────────────────────────────────────────────

  describe('canAddMoreToCart', () => {
    it('should return false when productId is missing', () => {
      const ad: AdvertisementItem = {
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 5,
      };

      expect(service.canAddMoreToCart(ad)).toBeFalse();
    });

    it('should return false when product is inactive', () => {
      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        active: false,
        stockQuantity: 5,
      };

      expect(service.canAddMoreToCart(ad)).toBeFalse();
    });

    it('should return false when stockQuantity is 0', () => {
      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 0,
      };

      expect(service.canAddMoreToCart(ad)).toBeFalse();
    });

    it('should return true when quantity in cart < stock', () => {
      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 5,
      };

      expect(service.canAddMoreToCart(ad)).toBeTrue();
    });

    it('should return false when quantity in cart equals stock', fakeAsync(() => {
      const product: ProductSummaryDTO = {
  productId: 10,
  title: 'Test Product',
  price: 25,
  condition: 'New',
  stockQuantity: 5,
  productCountry: 'Italy',
  productCurrencySymbol: '€',
};

      const item: CartItemDTO = {
        cartItemId: 1,
        quantity: 5,
        unitPrice: 10,
        subtotal: 50,
        addedAt: '2024-01-01',
        product: product,
      };

      const cart: CartDTO = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [item],
        totalAmount: 50,
        totalItems: 5,
      };

      const response: CartResponseDTO = {
        success: true,
        message: '',
        data: cart,
      };

      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 5,
      };

      service.getCurrentUserCart().subscribe();
      httpMock.expectOne(expectedApiUrl).flush(response);
      tick();

      expect(service.canAddMoreToCart(ad)).toBeFalse();
    }));
  });

  // ── addProductToCart / addToCart$ ─────────────────────────────────────────

  describe('addProductToCart', () => {
    it('should emit the ad via addToCart$', (done) => {
      const ad: AdvertisementItem = {
        productId: 10,
        title: 'Test Product',
        price: 25,
        active: true,
        stockQuantity: 5,
      };

      service.addToCart$.subscribe((emitted) => {
        expect(emitted).toEqual(ad);
        done();
      });

      service.addProductToCart(ad);
    });
  });

  // ── getCartItemsCount ─────────────────────────────────────────────────────

  describe('getCartItemsCount', () => {
    it('should return 0 when cart$ emits null', (done) => {
      service.getCartItemsCount().subscribe((count) => {
        expect(count).toBe(0);
        done();
      });
    });

    it('should return totalItems from cart', fakeAsync(() => {
      const cart: CartDTO = {
        cartId: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        active: true,
        userId: 1,
        userEmail: 'test@test.com',
        cartItems: [],
        totalAmount: 0,
        totalItems: 4,
      };

      const response: CartResponseDTO = {
        success: true,
        message: '',
        data: cart,
      };

      service.getCurrentUserCart().subscribe();
      httpMock.expectOne(expectedApiUrl).flush(response);
      tick();

      let count = 0;
      service.getCartItemsCount().subscribe((c) => (count = c));
      tick();

      expect(count).toBe(4);
    }));
  });
});
