package com.mady.springboot_be.services_impl.cart_order_payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mady.springboot_be.dtos.cart_order_payment.AddToCartRequestDTO;
import com.mady.springboot_be.dtos.cart_order_payment.CartDTO;
import com.mady.springboot_be.dtos.cart_order_payment.CartItemDTO;
import com.mady.springboot_be.dtos.cart_order_payment.UpdateCartItemRequestDTO;
import com.mady.springboot_be.entities.Cart;
import com.mady.springboot_be.entities.CartItem;
import com.mady.springboot_be.entities.Image;
import com.mady.springboot_be.entities.Product;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.ProductRepository;
import com.mady.springboot_be.repositories.UserRepository;
import com.mady.springboot_be.repositories.cart_order_payment.CartItemRepository;
import com.mady.springboot_be.repositories.cart_order_payment.CartRepository;
import com.mady.springboot_be.services.cart_order_payment.CartService;
import com.mady.springboot_be.utils.mappers.cart_order_payment.CartMapper;

import jakarta.persistence.EntityNotFoundException;

/**
 * Implementation of CartService for shopping cart management.
 * 
 * Handles cart retrieval, creation, item addition/update/removal,
 * stock validation, and cart clearing with transactional guarantees.
 * 
 * Key features:
 * - Automatic cart creation for new users
 * - Stock validation before any cart modification
 * - Product image enrichment in cart items (Base64)
 * - Automatic total amount and total items calculation
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    private static final Logger logger = LoggerFactory.getLogger(CartService.class);

    /**
     * Constructs a new CartServiceImpl with required dependencies.
     * 
     * @param cartRepository     repository for Cart entity operations
     * @param cartItemRepository repository for CartItem entity operations
     * @param productRepository  repository for Product entity operations
     * @param userRepository     repository for User entity operations
     * @param cartMapper         mapper for converting between Cart entity and
     *                           CartDTO
     */
    @Autowired
    public CartServiceImpl(CartRepository cartRepository, CartItemRepository cartItemRepository,
            ProductRepository productRepository, UserRepository userRepository,
            CartMapper cartMapper) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.cartMapper = cartMapper;
    }

    @Override
    @Transactional
    public CartDTO getActiveCartByUserId(Long userId) {
        logger.debug("Getting active cart for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        Cart cart = cartRepository.findActiveCartByUserId(userId)
                .orElseGet(() -> createNewCart(user));

        CartDTO cartDTO = cartMapper.toDTO(cart);
        enrichCartDTO(cartDTO);

        logger.debug("Retrieved cart with {} items", cartDTO.getCartItems().size());
        return cartDTO;
    }

    @Override
    public CartDTO addToCart(Long userId, AddToCartRequestDTO request) {
        logger.debug("Adding product {} to cart for user {}", request.getProductId(), userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + request.getProductId()));

        if (!product.isActive()) {
            throw new IllegalStateException("Product is not available: " + request.getProductId());
        }

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new IllegalStateException("Insufficient stock. Available: " + product.getStockQuantity());
        }

        // Get or create cart
        Cart cart = cartRepository.findActiveCartByUserId(userId)
                .orElseGet(() -> createNewCart(user));

        // Check if product is already in the cart
        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(request.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            // Update existing quantity
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();

            if (product.getStockQuantity() < newQuantity) {
                throw new IllegalStateException("Insufficient stock for total quantity: " + newQuantity);
            }

            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            // Create a new item
            CartItem newItem = new CartItem(request.getQuantity(), product.getPrice(), product);
            cart.addCartItem(newItem);
            cartItemRepository.save(newItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cart = cartRepository.save(cart);

        CartDTO cartDTO = cartMapper.toDTO(cart);
        enrichCartDTO(cartDTO);

        logger.debug("Added product to cart. Cart now has {} items", cartDTO.getCartItems().size());
        return cartDTO;
    }

    @Override
    public CartDTO updateCartItem(Long userId, Long cartItemId, UpdateCartItemRequestDTO request) {
        logger.debug("Updating cart item {} for user {}", cartItemId, userId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("Cart item not found: " + cartItemId));

        // Verify that the item belongs to the user
        if (!cartItem.getCart().getUser().getUserId().equals(userId)) {
            throw new SecurityException("Cart item does not belong to user");
        }

        // Verify stock availability
        if (cartItem.getProduct().getStockQuantity() < request.getQuantity()) {
            throw new IllegalStateException("Insufficient stock. Available: " +
                    cartItem.getProduct().getStockQuantity());
        }

        cartItem.setQuantity(request.getQuantity());
        cartItem.getCart().setUpdatedAt(LocalDateTime.now());

        cartItemRepository.save(cartItem);

        CartDTO cartDTO = cartMapper.toDTO(cartItem.getCart());
        enrichCartDTO(cartDTO);

        logger.debug("Updated cart item quantity to {}", request.getQuantity());
        return cartDTO;
    }

    @Override
    public CartDTO removeFromCart(Long userId, Long cartItemId) {
        logger.debug("Removing cart item {} for user {}", cartItemId, userId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new EntityNotFoundException("Cart item not found: " + cartItemId));

        // Verify that the item belongs to the user
        if (!cartItem.getCart().getUser().getUserId().equals(userId)) {
            throw new SecurityException("Cart item does not belong to user");
        }

        Cart cart = cartItem.getCart();
        cart.getCartItems().remove(cartItem);
        cart.setUpdatedAt(LocalDateTime.now());

        cartItemRepository.delete(cartItem);

        CartDTO cartDTO = cartMapper.toDTO(cart);
        enrichCartDTO(cartDTO);

        logger.debug("Removed item from cart. Cart now has {} items", cartDTO.getCartItems().size());
        return cartDTO;
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        logger.debug("Clearing cart for user {}", userId);

        Cart cart = cartRepository.findActiveCartByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("No active cart found for user: " + userId));

        int itemsCount = cart.getCartItems().size();
        cart.getCartItems().clear(); // Hibernate cancellerà gli items automaticamente
        cart.setUpdatedAt(LocalDateTime.now());

        logger.debug("Cleared {} items from cart for user {}", itemsCount, userId);
    }

    /**
     * Creates a new empty cart for a user.
     * 
     * @param user the user to associate with the cart
     * @return the newly created and persisted cart
     */
    private Cart createNewCart(User user) {
        logger.debug("Creating new cart for user: {}", user.getUserId());

        Cart cart = new Cart();
        cart.setUser(user);
        cart.setCreatedAt(LocalDateTime.now());
        cart.setActive(true);

        return cartRepository.save(cart);
    }

    /**
     * Enriches the CartDTO with calculated totals and product images.
     * 
     * Calculates subtotal for each item, total amount for the cart,
     * total number of items, and adds Base64 encoded product images.
     * 
     * @param cartDTO the DTO to enrich (modified in place)
     */
    private void enrichCartDTO(CartDTO cartDTO) {
        if (cartDTO.getCartItems() != null) {
            BigDecimal totalAmount = BigDecimal.ZERO;
            int totalItems = 0;

            for (CartItemDTO item : cartDTO.getCartItems()) {
                // Compute subtotal
                BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                item.setSubtotal(subtotal);

                // Add to the total
                totalAmount = totalAmount.add(subtotal);
                totalItems += item.getQuantity();

                // Conditional image conversion (product must exist)
                if (item.getProduct() != null) {
                    String imageBase64 = getFirstProductImageBase64(item.getProduct().getProductId());
                    item.getProduct().setImageUrl(imageBase64); // può essere null
                }
            }

            cartDTO.setTotalAmount(totalAmount);
            cartDTO.setTotalItems(totalItems);
        }
    }

    /**
     * Retrieves the first active product image as a Base64 data URL.
     * 
     * @param productId the ID of the product
     * @return Base64 data URL (e.g., "data:image/jpeg;base64,...") or null if no
     *         image exists
     */
    private String getFirstProductImageBase64(Long productId) {
        try {
            Product product = productRepository.findByIdWithActiveImages(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

            // Filter for active images (extra layer of security)
            List<Image> activeImages = product.getImages() != null ? product.getImages().stream()
                    .filter(Image::isActive)
                    .collect(Collectors.toList()) : Collections.emptyList();

            if (!activeImages.isEmpty()) {
                Image firstImage = activeImages.get(0);
                byte[] picByte = firstImage.getPicByte();

                if (picByte != null && picByte.length > 0) {
                    String mimeType = determineImageType(picByte);
                    String base64 = Base64.getEncoder().encodeToString(picByte);
                    return "data:" + mimeType + ";base64," + base64;
                }
            }

            return null;

        } catch (Exception e) {
            logger.warn("Error loading image for product {}: {}", productId, e.getMessage());
            return null;
        }
    }

    /**
     * Determines the MIME type of an image from its byte signature.
     * 
     * Checks the first few bytes to identify JPEG or PNG format.
     * 
     * @param imageBytes the image bytes
     * @return the MIME type ("image/jpeg", "image/png", or default "image/jpeg")
     */
    private String determineImageType(byte[] imageBytes) {
        if (imageBytes.length >= 4) {
            // JPEG
            if (imageBytes[0] == (byte) 0xFF && imageBytes[1] == (byte) 0xD8) {
                return "image/jpeg";
            }
            // PNG
            if (imageBytes[0] == (byte) 0x89 && imageBytes[1] == (byte) 0x50 &&
                    imageBytes[2] == (byte) 0x4E && imageBytes[3] == (byte) 0x47) {
                return "image/png";
            }
        }
        return "image/jpeg"; // default
    }
}
