import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';
import { OrderDTO } from 'src/app/interfaces/cart_payment_order/order/orderDTO.interface';
import { OrderResponseDTO } from 'src/app/interfaces/cart_payment_order/order/orderResponseDTO.interface';
import { OrderStatus } from 'src/app/interfaces/cart_payment_order/order/orderStatus.enum';
import { CreateOrderRequestDTO } from 'src/app/interfaces/cart_payment_order/cart/createOrderRequestDTO.interface';

class MockApiConfigService {
  apiOrder = 'http://localhost:8080/api/orders';
}

const mockOrder: OrderDTO = {
  orderId: 1,
  orderNumber: 'ORD-001',
  orderDate: '2026-03-01T00:00:00Z',
  status: OrderStatus.PENDING,
  subtotal: 100,
  shippingCost: 10,
  taxAmount: 5,
  totalAmount: 115,
  notes: 'Test order',
  user: {
    userId: 1,
    email: 'test@test.com',
    roles: 'USER',
  },
  orderItems: [
    {
      orderItemId: 1,
      quantity: 2,
      unitPrice: 50,
      totalPrice: 100,
      product: {
        productId: 10,
        title: 'Test Product',
        price: 50,
        condition: 'NEW',
        stockQuantity: 5,
        productCountry: 'Italy',
        productCurrencySymbol: '€',
      },
    },
  ],
};

const mockOrderResponse = (data: OrderDTO): OrderResponseDTO => ({
  success: true,
  message: 'OK',
  data,
});

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        OrderService,
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
      ],
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ============================================
  // CREATION TEST
  // ============================================

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ============================================
  // createOrderFromCart
  // ============================================

  it('should POST to create an order from cart', () => {
    const request: CreateOrderRequestDTO = {
      notes: 'Test order',
      shippingAddressId: 1,
    };

    service.createOrderFromCart(request).subscribe((result) => {
      expect(result.data).toEqual(mockOrder);
      expect(result.success).toBeTrue();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockOrderResponse(mockOrder));
  });

  it('should create order without optional fields', () => {
    const request: CreateOrderRequestDTO = {};

    service.createOrderFromCart(request).subscribe((result) => {
      expect(result.success).toBeTrue();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/orders');
    expect(req.request.method).toBe('POST');
    req.flush(mockOrderResponse(mockOrder));
  });

  // ============================================
  // getUserOrders
  // ============================================

  it('should GET all user orders', () => {
    service.getUserOrders().subscribe((result) => {
      expect(result.length).toBe(1);
      expect(result[0].orderId).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/orders');
    expect(req.request.method).toBe('GET');
    req.flush([mockOrder]);
  });

  it('should return empty array when no orders exist', () => {
    service.getUserOrders().subscribe((result) => {
      expect(result.length).toBe(0);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/orders');
    req.flush([]);
  });

  // ============================================
  // getOrderById
  // ============================================

  it('should GET an order by id', () => {
    service.getOrderById(1).subscribe((result) => {
      expect(result).toEqual(mockOrder);
      expect(result.orderId).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/orders/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockOrderResponse(mockOrder));
  });

  it('should throw when response success is false', () => {
    const errorResponse: OrderResponseDTO = {
      success: false,
      message: 'Order not found',
      data: null as any,
    };

    service.getOrderById(99).subscribe({
      error: (err) => {
        expect(err.message).toBe('Order not found');
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/orders/99');
    req.flush(errorResponse);
  });

  it('should throw with default message when response has no message', () => {
    const errorResponse: OrderResponseDTO = {
      success: false,
      message: '',
      data: null as any,
    };

    service.getOrderById(99).subscribe({
      error: (err) => {
        expect(err.message).toBe('Failed to get order');
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/orders/99');
    req.flush(errorResponse);
  });

  // ============================================
  // updateOrderStatus
  // ============================================

  it('should PUT to update order status', () => {
    const updatedOrder = { ...mockOrder, status: OrderStatus.CONFIRMED };

    service.updateOrderStatus(1, OrderStatus.CONFIRMED).subscribe((result) => {
      expect(result.status).toBe(OrderStatus.CONFIRMED);
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/orders/1/status?status=CONFIRMED',
    );
    expect(req.request.method).toBe('PUT');
    req.flush(mockOrderResponse(updatedOrder));
  });

  it('should update order status to CANCELLED', () => {
    const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };

    service.updateOrderStatus(1, OrderStatus.CANCELLED).subscribe((result) => {
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/orders/1/status?status=CANCELLED',
    );
    expect(req.request.method).toBe('PUT');
    req.flush(mockOrderResponse(cancelledOrder));
  });

  it('should update order status to DELIVERED', () => {
    const deliveredOrder = { ...mockOrder, status: OrderStatus.DELIVERED };

    service.updateOrderStatus(1, OrderStatus.DELIVERED).subscribe((result) => {
      expect(result.status).toBe(OrderStatus.DELIVERED);
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/orders/1/status?status=DELIVERED',
    );
    expect(req.request.method).toBe('PUT');
    req.flush(mockOrderResponse(deliveredOrder));
  });

  // ============================================
  // ERROR HANDLING
  // ============================================

  it('should handle HTTP error on createOrderFromCart', () => {
    const request: CreateOrderRequestDTO = { notes: 'Test' };

    service.createOrderFromCart(request).subscribe({
      error: (err) => {
        expect(err.status).toBe(500);
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/orders');
    req.flush(
      { message: 'Server error' },
      { status: 500, statusText: 'Internal Server Error' },
    );
  });

  it('should handle HTTP error on getUserOrders', () => {
    service.getUserOrders().subscribe({
      error: (err) => {
        expect(err.status).toBe(403);
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/orders');
    req.flush(
      { message: 'Forbidden' },
      { status: 403, statusText: 'Forbidden' },
    );
  });
});
