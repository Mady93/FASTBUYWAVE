import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';
import { PaymentResponseDTO } from 'src/app/interfaces/cart_payment_order/payment/paymentResponseDTO.interface';
import { PaymentMethod } from 'src/app/interfaces/cart_payment_order/payment/paymentMethod.enum';
import { InitiatePaymentRequestDTO } from 'src/app/interfaces/cart_payment_order/payment/initiatePaymentRequestDTO.interface';

class MockApiConfigService {
  apiPayment = 'http://localhost:8080/api/payment';
}

const mockPaymentResponse: PaymentResponseDTO = {
  success: true,
  message: 'Payment initiated',
  paymentUrl: 'https://payment.gateway.com/pay/123',
  data: {
    paymentId: 1,
    paymentReference: 'REF-001',
    paymentMethod: PaymentMethod.VISA,
    status: 'PENDING',
    amount: 115,
    currency: 'EUR',
    createdAt: '2026-03-01T00:00:00Z',
  },
};

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        PaymentService,
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
      ],
    });

    service = TestBed.inject(PaymentService);
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
  // initiatePayment
  // ============================================

  it('should POST to initiate payment', () => {
    const request: InitiatePaymentRequestDTO = {
      orderId: 1,
      paymentMethod: PaymentMethod.VISA,
      useMockPayment: false,
    };

    service.initiatePayment(request).subscribe((result) => {
      expect(result.success).toBeTrue();
      expect(result.paymentUrl).toBe('https://payment.gateway.com/pay/123');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/payment/initiate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(mockPaymentResponse);
  });

  it('should initiate payment with card token', () => {
    const request: InitiatePaymentRequestDTO = {
      orderId: 1,
      paymentMethod: PaymentMethod.VISA,
      useMockPayment: false,
      cardToken: 'tok_test_123',
    };

    service.initiatePayment(request).subscribe((result) => {
      expect(result.success).toBeTrue();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/payment/initiate');
    expect(req.request.body.cardToken).toBe('tok_test_123');
    req.flush(mockPaymentResponse);
  });

  it('should initiate payment with paypal email', () => {
    const request: InitiatePaymentRequestDTO = {
      orderId: 1,
      paymentMethod: PaymentMethod.PAYPAL,
      useMockPayment: false,
      paypalEmail: 'user@paypal.com',
    };

    service.initiatePayment(request).subscribe((result) => {
      expect(result.success).toBeTrue();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/payment/initiate');
    expect(req.request.body.paypalEmail).toBe('user@paypal.com');
    req.flush(mockPaymentResponse);
  });

  it('should handle error on initiatePayment', () => {
    const request: InitiatePaymentRequestDTO = {
      orderId: 99,
      paymentMethod: PaymentMethod.VISA,
      useMockPayment: false,
    };

    service.initiatePayment(request).subscribe({
      error: (err) => {
        expect(err.status).toBe(400);
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/payment/initiate');
    req.flush({ message: 'Bad request' }, { status: 400, statusText: 'Bad Request' });
  });

  // ============================================
  // mockPaymentConfirmation
  // ============================================

  it('should POST to confirm mock payment', () => {
  service.mockPaymentConfirmation('REF-001', true).subscribe((result) => {
    expect(result.success).toBeTrue();
  });

  const req = httpMock.expectOne((r) =>
    r.url.includes('/webhook/confirm') &&
    r.url.includes('paymentReference=REF-001') &&
    r.url.includes('useMockPayment=true')
  );
  expect(req.request.method).toBe('POST');
  req.flush(mockPaymentResponse);
});

  it('should include MOCK_ prefix in transactionId', () => {
    service.mockPaymentConfirmation('REF-002', true).subscribe();

    const req = httpMock.expectOne((r) =>
      r.url.includes('/webhook/confirm') &&
      r.url.includes('MOCK_')
    );
    expect(req.request.method).toBe('POST');
    req.flush(mockPaymentResponse);
  });

  // ============================================
  // processPayment
  // ============================================

  it('should POST to process payment with VISA', () => {
    service.processPayment(1, PaymentMethod.VISA, false).subscribe((result) => {
      expect(result.success).toBeTrue();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/payment/initiate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.orderId).toBe(1);
    expect(req.request.body.paymentMethod).toBe(PaymentMethod.VISA);
    expect(req.request.body.useMockPayment).toBeFalse();
    req.flush(mockPaymentResponse);
  });

  it('should process payment with mock enabled', () => {
    service.processPayment(1, PaymentMethod.MASTERCARD, true).subscribe((result) => {
      expect(result.success).toBeTrue();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/payment/initiate');
    expect(req.request.body.useMockPayment).toBeTrue();
    expect(req.request.body.paymentMethod).toBe(PaymentMethod.MASTERCARD);
    req.flush(mockPaymentResponse);
  });

  it('should process payment with card token option', () => {
    service.processPayment(1, PaymentMethod.VISA, false, { cardToken: 'tok_abc' }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/payment/initiate');
    expect(req.request.body.cardToken).toBe('tok_abc');
    req.flush(mockPaymentResponse);
  });

  it('should process payment with paypal email option', () => {
    service.processPayment(1, PaymentMethod.PAYPAL, false, { paypalEmail: 'buyer@paypal.com' }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/payment/initiate');
    expect(req.request.body.paypalEmail).toBe('buyer@paypal.com');
    req.flush(mockPaymentResponse);
  });

  it('should handle error on processPayment', () => {
    service.processPayment(99, PaymentMethod.VISA, false).subscribe({
      error: (err) => {
        expect(err.status).toBe(500);
      },
    });

    const req = httpMock.expectOne('http://localhost:8080/api/payment/initiate');
    req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
  });

  // ============================================
  // redirectToPaymentGateway
  // ============================================

  it('should not throw for valid payment response with URL', () => {
    expect(() => service.redirectToPaymentGateway(mockPaymentResponse)).not.toThrow();
  });

  it('should throw when success is false', () => {
    const invalidResponse: PaymentResponseDTO = {
      success: false,
      message: 'Failed',
    };

    expect(() => service.redirectToPaymentGateway(invalidResponse))
      .toThrowError('Invalid payment response');
  });

  it('should throw when paymentUrl is missing', () => {
    const noUrlResponse: PaymentResponseDTO = {
      success: true,
      message: 'OK',
      paymentUrl: undefined,
    };

    expect(() => service.redirectToPaymentGateway(noUrlResponse))
      .toThrowError('Invalid payment response');
  });
});