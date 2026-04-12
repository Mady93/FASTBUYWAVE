package com.mady.springboot_be.controllers.cart_order_payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.dettails.CartResponseDTO;
import com.mady.springboot_be.dtos.cart_order_payment.AddToCartRequestDTO;
import com.mady.springboot_be.dtos.cart_order_payment.CartDTO;
import com.mady.springboot_be.dtos.cart_order_payment.UpdateCartItemRequestDTO;
import com.mady.springboot_be.services_impl.cart_order_payment.CartServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

/**
 * REST controller for shopping cart operations.
 * 
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/v1/cart")
@Tag(name = "Cart", description = "Endpoints for managing shopping cart")
public class CartController {
    private final CartServiceImpl cartService;
    private static final Logger logger = LoggerFactory.getLogger(CartController.class);

    public CartController(CartServiceImpl cartService) {
        this.cartService = cartService;
    }

    @Operation(summary = "Get user's cart", description = "Retrieves the active cart for the current user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cart retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping
    public ResponseEntity<CartResponseDTO> getCurrentUserCart(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            CartDTO cartDTO = cartService.getActiveCartByUserId(userId);

            CartResponseDTO response = new CartResponseDTO(true, "Cart retrieved successfully", cartDTO);
            return ResponseEntity.ok(response);

        } catch (EntityNotFoundException e) {
            logger.error("User not found", e);
            CartResponseDTO response = new CartResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            logger.error("Error retrieving cart", e);
            CartResponseDTO response = new CartResponseDTO(false, "Internal server error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Operation(summary = "Add item to cart", description = "Adds a product to the user's cart")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Item added successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Product not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Insufficient stock")
    })
    @PostMapping("/items")
    public ResponseEntity<CartResponseDTO> addToCart(
            @Valid @RequestBody AddToCartRequestDTO request,
            Authentication authentication) {

        try {
            Long userId = getUserIdFromAuthentication(authentication);
            CartDTO cartDTO = cartService.addToCart(userId, request);

            CartResponseDTO response = new CartResponseDTO(true, "Item added to cart successfully", cartDTO);
            return ResponseEntity.ok(response);

        } catch (EntityNotFoundException e) {
            logger.error("Entity not found: {}", e.getMessage());
            CartResponseDTO response = new CartResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (IllegalStateException e) {
            logger.error("Business rule violation: {}", e.getMessage());
            CartResponseDTO response = new CartResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            logger.error("Error adding item to cart", e);
            CartResponseDTO response = new CartResponseDTO(false, "Internal server error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Operation(summary = "Update cart item", description = "Updates the quantity of an item in the cart")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cart item updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Cart item does not belong to user"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Cart item not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Insufficient stock")
    })
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponseDTO> updateCartItem(
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequestDTO request,
            Authentication authentication) {

        try {
            Long userId = getUserIdFromAuthentication(authentication);
            CartDTO cartDTO = cartService.updateCartItem(userId, cartItemId, request);

            CartResponseDTO response = new CartResponseDTO(true, "Cart item updated successfully", cartDTO);
            return ResponseEntity.ok(response);

        } catch (EntityNotFoundException e) {
            logger.error("Cart item not found: {}", e.getMessage());
            CartResponseDTO response = new CartResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (SecurityException e) {
            logger.error("Security violation: {}", e.getMessage());
            CartResponseDTO response = new CartResponseDTO(false, "Access denied", null);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (IllegalStateException e) {
            logger.error("Business rule violation: {}", e.getMessage());
            CartResponseDTO response = new CartResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            logger.error("Error updating cart item", e);
            CartResponseDTO response = new CartResponseDTO(false, "Internal server error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Operation(summary = "Remove cart item", description = "Removes an item from the cart")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Item removed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Cart item does not belong to user"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Cart item not found")
    })
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponseDTO> removeFromCart(
            @PathVariable Long cartItemId,
            Authentication authentication) {

        try {
            Long userId = getUserIdFromAuthentication(authentication);
            CartDTO cartDTO = cartService.removeFromCart(userId, cartItemId);

            CartResponseDTO response = new CartResponseDTO(true, "Item removed from cart successfully", cartDTO);
            return ResponseEntity.ok(response);

        } catch (EntityNotFoundException e) {
            logger.error("Cart item not found: {}", e.getMessage());
            CartResponseDTO response = new CartResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (SecurityException e) {
            logger.error("Security violation: {}", e.getMessage());
            CartResponseDTO response = new CartResponseDTO(false, "Access denied", null);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        } catch (Exception e) {
            logger.error("Error removing cart item", e);
            CartResponseDTO response = new CartResponseDTO(false, "Internal server error", null);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @Operation(summary = "Clear cart", description = "Removes all items from the cart")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cart cleared successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No active cart found")
    })
    @DeleteMapping
    public ResponseEntity<CartResponseDTO> clearCart(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            cartService.clearCart(userId);

            CartResponseDTO response = new CartResponseDTO(true, "Cart cleared successfully", null);
            return ResponseEntity.ok(response);

        } catch (EntityNotFoundException e) {
            logger.error("Cart not found: {}", e.getMessage());
            CartResponseDTO response = new CartResponseDTO(false, e.getMessage(), null);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            logger.error("Error clearing cart", e);
            CartResponseDTO response = new CartResponseDTO(false, "Internal server error", null);
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
