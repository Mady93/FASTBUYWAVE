import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InitiatePaymentRequestDTO } from 'src/app/interfaces/cart_payment_order/payment/initiatePaymentRequestDTO.interface';
import { PaymentMethod } from 'src/app/interfaces/cart_payment_order/payment/paymentMethod.enum';
import { PaymentResponseDTO } from 'src/app/interfaces/cart_payment_order/payment/paymentResponseDTO.interface';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Service responsible for handling payments in the application.
 * Provides methods to:
 * - Initiate a payment (real or mock)
 * - Confirm a mock payment
 * - Process a payment end-to-end with optional payment method options
 * - Redirect the user to the payment gateway
 *
 * This service uses Angular HttpClient for communication with the backend
 * and relies on ApiConfigService for endpoint configuration.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  /**
   * @constructor
   * @param http - Angular HttpClient used for HTTP requests.
   * @param apiConfig - Service providing API endpoints configuration.
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Initiates a payment using a specified request DTO.
   * Can be used for real or mock payments depending on the backend configuration.
   *
   * @param request - DTO containing payment initiation data (orderId, payment method, etc.).
   * @returns Observable<PaymentResponseDTO> emitting the server response with payment details.
   */
  initiatePayment(
    request: InitiatePaymentRequestDTO,
  ): Observable<PaymentResponseDTO> {
    return this.http.post<PaymentResponseDTO>(
      `${this.apiConfig.apiPayment}/initiate`,
      request,
    );
  }

  /**
   * @description Confirms a mock payment using a generated mock transaction ID.
   *
   * @param paymentReference - Reference ID of the payment to confirm.
   * @param useMockPayment - Boolean flag to indicate mock payment usage.
   * @returns Observable<PaymentResponseDTO> emitting the server response of the mock confirmation.
   */
  mockPaymentConfirmation(
    paymentReference: string,
    useMockPayment: boolean,
  ): Observable<PaymentResponseDTO> {
    return this.http.post<PaymentResponseDTO>(
      `${this.apiConfig.apiPayment}/webhook/confirm?paymentReference=${paymentReference}&transactionId=MOCK_${Date.now()}&useMockPayment=${useMockPayment}`,
      {},
    );
  }

  /**
   * @description Processes a payment end-to-end for an order, supporting optional payment method details.
   *
   * @param orderId - ID of the order to pay.
   * @param paymentMethod - Payment method selected (see PaymentMethod enum).
   * @param useMockPayment - Boolean flag to indicate whether to use mock payment.
   * @param options - Optional payment details (cardToken for cards, paypalEmail for PayPal).
   * @returns Observable<PaymentResponseDTO> emitting the server response with payment processing results.
   */
  processPayment(
    orderId: number,
    paymentMethod: PaymentMethod,
    useMockPayment: boolean,
    options?: {
      cardToken?: string;
      paypalEmail?: string;
    },
  ): Observable<PaymentResponseDTO> {
    const request: InitiatePaymentRequestDTO = {
      orderId,
      paymentMethod,
      useMockPayment,
      cardToken: options?.cardToken,
      paypalEmail: options?.paypalEmail,
    };

    return this.http.post<PaymentResponseDTO>(
      `${this.apiConfig.apiPayment}/initiate`,
      request,
    );
  }

  /**
   * @description Redirects the user to the payment gateway using the URL returned by the backend.
   *
   * @param paymentResponse - The payment response DTO containing the payment URL.
   * @throws Error if the payment response is invalid or missing the payment URL.
   */
  redirectToPaymentGateway(paymentResponse: PaymentResponseDTO): void {
    if (!paymentResponse.success || !paymentResponse.paymentUrl) {
      throw new Error('Invalid payment response');
    }
  }
}
