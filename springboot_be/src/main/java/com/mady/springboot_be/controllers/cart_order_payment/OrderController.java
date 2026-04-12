package com.mady.springboot_be.controllers.cart_order_payment;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.dettails.OrderResponseDTO;
import com.mady.springboot_be.dtos.cart_order_payment.CreateOrderRequestDTO;
import com.mady.springboot_be.dtos.cart_order_payment.OrderDTO;
import com.mady.springboot_be.enums.OrderStatus;
import com.mady.springboot_be.services_impl.cart_order_payment.OrderServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

/**
 * REST controller for order management operations.
 * 
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders", description = "Endpoints for managing orders")
@Validated
public class OrderController {
    private final OrderServiceImpl orderService;
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    public OrderController(OrderServiceImpl orderService) {
        this.orderService = orderService;
    }

    @Operation(summary = "Create order", description = "Creates a new order from the user's cart")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Order created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request or empty cart"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Insufficient stock")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<OrderResponseDTO> createOrder(
            @Valid @RequestBody CreateOrderRequestDTO request,
            Authentication authentication) {

        try {
            Long userId = getUserIdFromAuthentication(authentication);
            OrderDTO orderDTO = orderService.createOrderFromCart(userId, request);

            OrderResponseDTO response = new OrderResponseDTO(true, "Order created successfully", orderDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalStateException e) {
            logger.error("Business rule violation: {}", e.getMessage());
            OrderResponseDTO response = new OrderResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (EntityNotFoundException e) {
            logger.error("Entity not found: {}", e.getMessage());
            OrderResponseDTO response = new OrderResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            logger.error("Error creating order", e);
            OrderResponseDTO response = new OrderResponseDTO(false, "Internal server error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Operation(summary = "Get user orders", description = "Retrieves all orders for the current user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Orders retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<OrderDTO>> getUserOrders(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            List<OrderDTO> orders = orderService.getUserOrders(userId);

            return ResponseEntity.ok(orders);

        } catch (Exception e) {
            logger.error("Error retrieving user orders", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    @Operation(summary = "Get order details", description = "Retrieves details of a specific order")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Order retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Order does not belong to user"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Order not found")
    })
    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<OrderResponseDTO> getOrderById(
            @PathVariable Long orderId,
            Authentication authentication) {

        try {
            Long userId = getUserIdFromAuthentication(authentication);
            OrderDTO orderDTO = orderService.getOrderById(orderId, userId);

            OrderResponseDTO response = new OrderResponseDTO(true, "Order retrieved successfully", orderDTO);
            return ResponseEntity.ok(response);

        } catch (EntityNotFoundException e) {
            logger.error("Order not found: {}", e.getMessage());
            OrderResponseDTO response = new OrderResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (SecurityException e) {
            logger.error("Security violation: {}", e.getMessage());
            OrderResponseDTO response = new OrderResponseDTO(false, "Access denied", null);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            logger.error("Error retrieving order", e);
            OrderResponseDTO response = new OrderResponseDTO(false, "Internal server error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Operation(summary = "Update order status", description = "Updates the status of an order (Admin only)")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Order status updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied (Admin only)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Order not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Invalid status transition")
    })
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponseDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {

        try {
            OrderDTO orderDTO = orderService.updateOrderStatus(orderId, status);

            OrderResponseDTO response = new OrderResponseDTO(true, "Order status updated successfully", orderDTO);
            return ResponseEntity.ok(response);

        } catch (EntityNotFoundException e) {
            logger.error("Order not found: {}", e.getMessage());
            OrderResponseDTO response = new OrderResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (IllegalStateException e) {
            logger.error("Invalid status transition: {}", e.getMessage());
            OrderResponseDTO response = new OrderResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            logger.error("Error updating order status", e);
            OrderResponseDTO response = new OrderResponseDTO(false, "Internal server error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null) {
            throw new SecurityException("User not authenticated");
        }

        try {
            return Long.valueOf((String) authentication.getPrincipal());
        } catch (ClassCastException | NumberFormatException e) {
            throw new SecurityException("Invalid authentication: " + e.getMessage(), e);
        }
    }
}