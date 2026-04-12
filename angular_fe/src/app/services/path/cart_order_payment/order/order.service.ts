import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CreateOrderRequestDTO } from 'src/app/interfaces/cart_payment_order/cart/createOrderRequestDTO.interface';
import { OrderDTO } from 'src/app/interfaces/cart_payment_order/order/orderDTO.interface';
import { OrderResponseDTO } from 'src/app/interfaces/cart_payment_order/order/orderResponseDTO.interface';
import { OrderStatus } from 'src/app/interfaces/cart_payment_order/order/orderStatus.enum';
import { ApiConfigService } from 'src/app/services/api-config/api-config.service';

/**
 * @category Services
 *
 * @description
 * Service responsible for managing orders in the application.
 * Provides methods to:
 * - Create an order from the current user's cart
 * - Retrieve all orders for the current user
 * - Retrieve a specific order by its ID
 * - Update the status of an order (admin only)
 *
 * This service uses Angular HttpClient to communicate with the backend
 * and relies on ApiConfigService for endpoint configuration.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  /**
   * @constructor
   * @param http - Angular HttpClient used to make HTTP requests.
   * @param apiConfig - Service providing API endpoints configuration.
   */
  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
  ) {}

  /**
   * @description Creates a new order from the current user's cart.
   *
   * @param request - DTO containing details for creating the order.
   * @returns Observable<OrderResponseDTO> emitting the server response with the created order.
   */
  createOrderFromCart(
    request: CreateOrderRequestDTO,
  ): Observable<OrderResponseDTO> {
    return this.http.post<OrderResponseDTO>(this.apiConfig.apiOrder, request);
  }

  /**
   * @description Retrieves all orders for the current user.
   *
   * @returns Observable<OrderDTO[]> emitting an array of user's orders.
   */
  getUserOrders(): Observable<OrderDTO[]> {
    return this.http.get<OrderDTO[]>(this.apiConfig.apiOrder);
  }

  /**
   * @description Retrieves a specific order by its ID.
   *
   * @param orderId - ID of the order to retrieve.
   * @returns Observable<OrderDTO> emitting the requested order.
   * @throws Error if the order cannot be retrieved or if the response indicates failure.
   */
  getOrderById(orderId: number): Observable<OrderDTO> {
    return this.http
      .get<OrderResponseDTO>(`${this.apiConfig.apiOrder}/${orderId}`)
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to get order');
        }),
      );
  }

  /**
   * @description Updates the status of a specific order.
   * This is typically restricted to admin users.
   *
   * @param orderId - ID of the order to update.
   * @param status - New status to assign to the order (see OrderStatus enum).
   * @returns Observable<OrderDTO> emitting the updated order.
   */
  updateOrderStatus(
    orderId: number,
    status: OrderStatus,
  ): Observable<OrderDTO> {
    return this.http
      .put<OrderResponseDTO>(
        `${this.apiConfig.apiOrder}/${orderId}/status?status=${status}`,
        {},
        {},
      )
      .pipe(map((response) => response.data));
  }
}
