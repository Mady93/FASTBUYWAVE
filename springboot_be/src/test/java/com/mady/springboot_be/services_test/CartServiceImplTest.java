package com.mady.springboot_be.services_test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.mady.springboot_be.dtos.cart_order_payment.AddToCartRequestDTO;
import com.mady.springboot_be.dtos.cart_order_payment.CartDTO;
import com.mady.springboot_be.dtos.cart_order_payment.UpdateCartItemRequestDTO;
import com.mady.springboot_be.entities.Cart;
import com.mady.springboot_be.entities.CartItem;
import com.mady.springboot_be.entities.Product;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.repositories.ProductRepository;
import com.mady.springboot_be.repositories.UserRepository;
import com.mady.springboot_be.repositories.cart_order_payment.CartItemRepository;
import com.mady.springboot_be.repositories.cart_order_payment.CartRepository;
import com.mady.springboot_be.services.cart_order_payment.CartService;
import com.mady.springboot_be.utils.mappers.cart_order_payment.CartMapper;

import jakarta.persistence.EntityNotFoundException;

/**
 * Unit tests for CartServiceImpl.
 * 
 * Tests all cart operations including:
 * - Retrieving active cart (existing or new)
 * - Adding products to cart (new item or updating quantity)
 * - Updating cart item quantities
 * - Removing items from cart
 * - Clearing the entire cart
 * 
 * Uses Mockito for mocking dependencies and AssertJ for assertions.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@ExtendWith(MockitoExtension.class)
public class CartServiceImplTest {

    // ── Mocks ──────────────────────────────────────────────────────────────────

    @Mock
    private CartRepository cartRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CartMapper cartMapper;

    // Manual initialization (no @InjectMocks to avoid issues)
    private CartService cartService;

    // ── Fixture ────────────────────────────────────────────────────────────────

    private User user;
    private Product product;
    private Cart cart;
    private CartDTO cartDTO;

    /**
     * Sets up test fixtures before each test.
     * Initializes the service manually and creates mock entities.
     */
    @BeforeEach
    void setUp() {
        // Manual initialization - avoids @InjectMocks issues
        cartService = new com.mady.springboot_be.services_impl.cart_order_payment.CartServiceImpl(
                cartRepository,
                cartItemRepository,
                productRepository,
                userRepository,
                cartMapper);

        user = new User();
        user.setUserId(1L);
        user.setEmail("mario@example.com");
        user.setActive(true);

        product = new Product();
        product.setProductId(10L);
        product.setPrice(new BigDecimal("29.99"));
        product.setStockQuantity(5);
        product.setActive(true);

        cart = new Cart();
        cart.setCartId(100L);
        cart.setUser(user);
        cart.setActive(true);
        cart.setCreatedAt(LocalDateTime.now());
        cart.setCartItems(new ArrayList<>());

        cartDTO = new CartDTO();
        cartDTO.setCartId(100L);
        cartDTO.setUserId(1L);
        cartDTO.setCartItems(new ArrayList<>());
    }

    // ── getActiveCartByUserId ──────────────────────────────────────────────────

    /**
     * Tests for getActiveCartByUserId method.
     */
    @Nested
    @DisplayName("getActiveCartByUserId()")
    class GetActiveCart {

        @Test
        @DisplayName("should return existing active cart")
        void shouldReturnExistingCart() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(cartRepository.findActiveCartByUserId(1L)).thenReturn(Optional.of(cart));
            when(cartMapper.toDTO(cart)).thenReturn(cartDTO);

            CartDTO result = cartService.getActiveCartByUserId(1L);

            assertThat(result).isNotNull();
            assertThat(result.getCartId()).isEqualTo(100L);
            verify(cartRepository, never()).save(any(Cart.class));
        }

        /**
         * Should create a new cart when no active cart exists for the user.
         */
        @Test
        @DisplayName("should create new cart when none exists")
        void shouldCreateNewCartWhenNoneExists() {
            Cart newCart = new Cart();
            newCart.setCartId(200L);
            newCart.setUser(user);
            newCart.setActive(true);
            newCart.setCartItems(new ArrayList<>());

            CartDTO newCartDTO = new CartDTO();
            newCartDTO.setCartId(200L);
            newCartDTO.setCartItems(new ArrayList<>());

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(cartRepository.findActiveCartByUserId(1L)).thenReturn(Optional.empty());
            when(cartRepository.save(any(Cart.class))).thenReturn(newCart);
            when(cartMapper.toDTO(newCart)).thenReturn(newCartDTO);

            CartDTO result = cartService.getActiveCartByUserId(1L);

            assertThat(result.getCartId()).isEqualTo(200L);
            verify(cartRepository, times(1)).save(any(Cart.class));
        }

        /**
         * Should throw EntityNotFoundException when user does not exist.
         */
        @Test
        @DisplayName("should throw EntityNotFoundException when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.getActiveCartByUserId(99L))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("User not found");

            verify(cartRepository, never()).findActiveCartByUserId(anyLong());
        }
    }

    // ── addToCart ──────────────────────────────────────────────────────────────

    /**
     * Tests for addToCart method.
     */
    @Nested
    @DisplayName("addToCart()")
    class AddToCart {

        private AddToCartRequestDTO request;

        @BeforeEach
        void setUp() {
            request = new AddToCartRequestDTO(10L, 2);
        }

        /**
         * Should add a new product to an empty cart.
         */
        @Test
        @DisplayName("should add new product to empty cart")
        void shouldAddNewProduct() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(productRepository.findById(10L)).thenReturn(Optional.of(product));
            when(cartRepository.findActiveCartByUserId(1L)).thenReturn(Optional.of(cart));
            when(cartRepository.save(any(Cart.class))).thenReturn(cart);
            when(cartMapper.toDTO(cart)).thenReturn(cartDTO);

            CartDTO result = cartService.addToCart(1L, request);

            assertThat(result).isNotNull();
            verify(cartItemRepository, times(1)).save(any(CartItem.class));
            verify(cartRepository, times(1)).save(cart);
        }

        @Test
        @DisplayName("should update quantity when product already in cart")
        void shouldUpdateQuantityWhenAlreadyPresent() {
            CartItem existing = new CartItem(1, new BigDecimal("29.99"), product);
            existing.setCartItemId(50L);
            existing.setCart(cart);
            cart.getCartItems().add(existing);

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(productRepository.findById(10L)).thenReturn(Optional.of(product));
            when(cartRepository.findActiveCartByUserId(1L)).thenReturn(Optional.of(cart));
            when(cartRepository.save(any(Cart.class))).thenReturn(cart);
            when(cartMapper.toDTO(cart)).thenReturn(cartDTO);

            cartService.addToCart(1L, request);

            assertThat(existing.getQuantity()).isEqualTo(3);
            verify(cartItemRepository, times(1)).save(existing);
        }

        /**
         * Should increase quantity when product is already in cart.
         */
        @Test
        @DisplayName("should throw when product not found")
        void shouldThrowWhenProductNotFound() {
            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(productRepository.findById(10L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.addToCart(1L, request))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Product not found");
        }

        /**
         * Should throw EntityNotFoundException when product does not exist.
         */
        @Test
        @DisplayName("should throw when product is inactive")
        void shouldThrowWhenProductInactive() {
            product.setActive(false);

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(productRepository.findById(10L)).thenReturn(Optional.of(product));

            assertThatThrownBy(() -> cartService.addToCart(1L, request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Product is not available");

            verify(cartRepository, never()).save(any());
        }

        /**
         * Should throw IllegalStateException when product is inactive.
         */
        @Test
        @DisplayName("should throw when stock is insufficient")
        void shouldThrowWhenStockInsufficient() {
            product.setStockQuantity(1);

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(productRepository.findById(10L)).thenReturn(Optional.of(product));

            assertThatThrownBy(() -> cartService.addToCart(1L, request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Insufficient stock");
        }

        /**
         * Should throw IllegalStateException when stock is insufficient.
         */
        @Test
        @DisplayName("should throw when cumulative quantity exceeds stock")
        void shouldThrowWhenCumulativeQuantityExceedsStock() {
            product.setStockQuantity(2);

            CartItem existing = new CartItem(2, new BigDecimal("29.99"), product);
            existing.setCartItemId(50L);
            existing.setCart(cart);
            cart.getCartItems().add(existing);

            when(userRepository.findById(1L)).thenReturn(Optional.of(user));
            when(productRepository.findById(10L)).thenReturn(Optional.of(product));
            when(cartRepository.findActiveCartByUserId(1L)).thenReturn(Optional.of(cart));

            assertThatThrownBy(() -> cartService.addToCart(1L, request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Insufficient stock for total quantity");
        }
    }

    // ── updateCartItem ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("updateCartItem()")
    class UpdateCartItem {

        private CartItem cartItem;
        private UpdateCartItemRequestDTO updateRequest;

        @BeforeEach
        void setUp() {
            cartItem = new CartItem(2, new BigDecimal("29.99"), product);
            cartItem.setCartItemId(50L);
            cartItem.setCart(cart);

            updateRequest = new UpdateCartItemRequestDTO();
            updateRequest.setQuantity(3);
        }

        /**
         * Should successfully update item quantity.
         */
        @Test
        @DisplayName("should update quantity successfully")
        void shouldUpdateQuantity() {
            when(cartItemRepository.findById(50L)).thenReturn(Optional.of(cartItem));
            when(cartMapper.toDTO(cart)).thenReturn(cartDTO);

            cartService.updateCartItem(1L, 50L, updateRequest);

            assertThat(cartItem.getQuantity()).isEqualTo(3);
            verify(cartItemRepository, times(1)).save(cartItem);
        }

        /**
         * Should throw EntityNotFoundException when cart item does not exist.
         */
        @Test
        @DisplayName("should throw EntityNotFoundException when cart item not found")
        void shouldThrowWhenCartItemNotFound() {
            when(cartItemRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.updateCartItem(1L, 99L, updateRequest))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Cart item not found");
        }

        /**
         * Should throw SecurityException when cart item belongs to another user.
         */
        @Test
        @DisplayName("should throw SecurityException when item belongs to different user")
        void shouldThrowWhenItemBelongsToDifferentUser() {
            User other = new User();
            other.setUserId(999L);
            Cart otherCart = new Cart();
            otherCart.setUser(other);
            cartItem.setCart(otherCart);

            when(cartItemRepository.findById(50L)).thenReturn(Optional.of(cartItem));

            assertThatThrownBy(() -> cartService.updateCartItem(1L, 50L, updateRequest))
                    .isInstanceOf(SecurityException.class)
                    .hasMessageContaining("Cart item does not belong to user");
        }

        /**
         * Should throw IllegalStateException when requested quantity exceeds stock.
         */
        @Test
        @DisplayName("should throw when stock insufficient for requested quantity")
        void shouldThrowWhenStockInsufficient() {
            product.setStockQuantity(1);

            when(cartItemRepository.findById(50L)).thenReturn(Optional.of(cartItem));

            assertThatThrownBy(() -> cartService.updateCartItem(1L, 50L, updateRequest))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("Insufficient stock");
        }
    }

    // ── removeFromCart ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("removeFromCart()")
    class RemoveFromCart {

        private CartItem cartItem;

        @BeforeEach
        void setUp() {
            cartItem = new CartItem(2, new BigDecimal("29.99"), product);
            cartItem.setCartItemId(50L);
            cartItem.setCart(cart);
            cart.getCartItems().add(cartItem);
        }

        /**
         * Should successfully remove item from cart.
         */
        @Test
        @DisplayName("should remove item and call delete")
        void shouldRemoveItem() {
            when(cartItemRepository.findById(50L)).thenReturn(Optional.of(cartItem));
            when(cartMapper.toDTO(cart)).thenReturn(cartDTO);

            cartService.removeFromCart(1L, 50L);

            verify(cartItemRepository, times(1)).delete(cartItem);
            assertThat(cart.getCartItems()).doesNotContain(cartItem);
        }

        /**
         * Should throw EntityNotFoundException when cart item does not exist.
         */
        @Test
        @DisplayName("should throw EntityNotFoundException when item not found")
        void shouldThrowWhenNotFound() {
            when(cartItemRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.removeFromCart(1L, 99L))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Cart item not found");
        }

        /**
         * Should throw SecurityException when cart item belongs to another user.
         */
        @Test
        @DisplayName("should throw SecurityException when item belongs to different user")
        void shouldThrowWhenWrongUser() {
            User other = new User();
            other.setUserId(999L);
            Cart otherCart = new Cart();
            otherCart.setUser(other);
            cartItem.setCart(otherCart);

            when(cartItemRepository.findById(50L)).thenReturn(Optional.of(cartItem));

            assertThatThrownBy(() -> cartService.removeFromCart(1L, 50L))
                    .isInstanceOf(SecurityException.class)
                    .hasMessageContaining("Cart item does not belong to user");
        }
    }

    // ── clearCart ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("clearCart()")
    class ClearCart {

        /**
         * Should clear all items from the active cart.
         */
        @Test
        @DisplayName("should clear all items from active cart")
        void shouldClearAllItems() {
            cart.getCartItems().add(new CartItem(1, new BigDecimal("10.00"), product));
            cart.getCartItems().add(new CartItem(2, new BigDecimal("20.00"), product));

            when(cartRepository.findActiveCartByUserId(1L)).thenReturn(Optional.of(cart));

            cartService.clearCart(1L);

            assertThat(cart.getCartItems()).isEmpty();
        }

        /**
         * Should throw EntityNotFoundException when no active cart exists.
         */
        @Test
        @DisplayName("should throw EntityNotFoundException when no active cart found")
        void shouldThrowWhenNoActiveCart() {
            when(cartRepository.findActiveCartByUserId(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.clearCart(1L))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("No active cart found");
        }
    }
}
