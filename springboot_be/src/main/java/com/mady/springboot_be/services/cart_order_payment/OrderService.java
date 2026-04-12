package com.mady.springboot_be.services.cart_order_payment;

import java.util.List;

import com.mady.springboot_be.dtos.cart_order_payment.CreateOrderRequestDTO;
import com.mady.springboot_be.dtos.cart_order_payment.OrderDTO;
import com.mady.springboot_be.enums.OrderStatus;

/**
 * Service interface for order management operations.
 * 
 * Defines methods for creating orders from cart, retrieving user orders,
 * fetching order details by ID, and updating order status.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface OrderService {

    /**
     * Creates a new order from the user's active cart.
     * 
     * Validates stock availability, calculates totals (subtotal, tax, shipping),
     * updates product stock, and clears the cart upon success.
     * 
     * @param userId  the ID of the user creating the order
     * @param request contains order notes and shipping address
     * @return the created OrderDTO
     */
    public OrderDTO createOrderFromCart(Long userId, CreateOrderRequestDTO request);

    /**
     * Retrieves all orders for a specific user.
     * 
     * @param userId the ID of the user
     * @return list of user's orders, sorted by date descending
     */
    public List<OrderDTO> getUserOrders(Long userId);

    /**
     * Retrieves a specific order by ID with ownership verification.
     * 
     * @param orderId the ID of the order
     * @param userId  the ID of the user (for security check)
     * @return the OrderDTO
     */
    public OrderDTO getOrderById(Long orderId, Long userId);

    /**
     * Updates the status of an order.
     * 
     * @param orderId   the ID of the order to update
     * @param newStatus the new status to set
     * @return the updated OrderDTO
     */
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus newStatus);

}
