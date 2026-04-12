package com.mady.springboot_be.services_impl.cart_order_payment;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mady.springboot_be.dtos.cart_order_payment.CartDTO;
import com.mady.springboot_be.dtos.cart_order_payment.CartItemDTO;
import com.mady.springboot_be.dtos.cart_order_payment.CreateOrderRequestDTO;
import com.mady.springboot_be.dtos.cart_order_payment.OrderDTO;
import com.mady.springboot_be.entities.Order;
import com.mady.springboot_be.entities.OrderItem;
import com.mady.springboot_be.entities.Product;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.enums.OrderStatus;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.ProductRepository;
import com.mady.springboot_be.repositories.UserRepository;
import com.mady.springboot_be.repositories.cart_order_payment.OrderItemRepository;
import com.mady.springboot_be.repositories.cart_order_payment.OrderRepository;
import com.mady.springboot_be.services.cart_order_payment.OrderService;
import com.mady.springboot_be.services.retry.ProductStockService;
import com.mady.springboot_be.utils.mappers.cart_order_payment.OrderMapper;

/**
 * Service implementation for order management.
 * 
 * Handles order creation from user cart, order retrieval, and status updates.
 * Uses optimistic locking (@Version) for concurrency control and delegates
 * stock updates to ProductStockService which implements retry logic.
 * 
 * @author Popa Madalina Mariana
 */
@Service
@Transactional
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartServiceImpl cartService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;
    private final ProductStockService productStockService;

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    private static final BigDecimal DEFAULT_SHIPPING_COST = new BigDecimal("5.00");
    private static final BigDecimal TAX_RATE = new BigDecimal("0.22"); // 22% IVA

    /**
     * Constructs a new OrderServiceImpl with required dependencies.
     * 
     * @param orderRepository     repository for Order entity operations
     * @param orderItemRepository repository for OrderItem entity operations
     * @param cartService         service for cart operations
     * @param productRepository   repository for Product entity operations
     * @param userRepository      repository for User entity operations
     * @param orderMapper         mapper for converting between Order entity and
     *                            OrderDTO
     * @param productStockService service for stock updates with retry logic
     */
    @Autowired
    public OrderServiceImpl(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
            CartServiceImpl cartService, ProductRepository productRepository,
            UserRepository userRepository, OrderMapper orderMapper, ProductStockService productStockService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartService = cartService;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderMapper = orderMapper;
        this.productStockService = productStockService;
    }

    @Override
    public OrderDTO createOrderFromCart(Long userId, CreateOrderRequestDTO request) {
        logger.debug("Creating order from cart for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        CartDTO cartDTO = cartService.getActiveCartByUserId(userId);

        if (cartDTO.getCartItems() == null || cartDTO.getCartItems().isEmpty()) {
            logger.warn("Cart is empty for user: {}", userId);
            throw new IllegalStateException("Cart is empty");
        }

        validateStockAvailability(cartDTO);

        Order order = new Order();
        order.setUser(user);
        order.setNotes(request.getNotes());

        BigDecimal subtotal = cartDTO.getTotalAmount();
        BigDecimal shippingCost = calculateShippingCost(cartDTO);
        BigDecimal taxAmount = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(shippingCost).add(taxAmount);

        order.setSubtotal(subtotal);
        order.setShippingCost(shippingCost);
        order.setTaxAmount(taxAmount);
        order.setTotalAmount(totalAmount);
        order.setOrderNumber(generateOrderNumber());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);
        order.setActive(true);

        order = orderRepository.save(order);

        List<OrderItem> orderItems = new ArrayList<>();

        // Stock updates are handled by ProductStockService with retry mechanism
        for (CartItemDTO cartItem : cartDTO.getCartItems()) {
            productStockService.updateStockInNewTransaction(
                    cartItem.getProduct().getProductId(),
                    cartItem.getQuantity());

            Product product = productRepository.getReferenceById(
                    cartItem.getProduct().getProductId());
            OrderItem orderItem = new OrderItem(
                    cartItem.getQuantity(),
                    cartItem.getUnitPrice(),
                    product);
            orderItem.setOrder(order);
            orderItems.add(orderItem);
        }

        orderItemRepository.saveAll(orderItems);
        cartService.clearCart(userId);
        order.setOrderItems(orderItems);

        logger.debug("Created order {} with total: {}", order.getOrderNumber(), order.getTotalAmount());
        return orderMapper.toDTO(order);
    }

    @Override
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus newStatus) {

        logger.info("Updating order {} status to {}", orderId, newStatus);
        return productStockService.updateOrderStatusInNewTransaction(orderId, newStatus);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getUserOrders(Long userId) {

        logger.debug("Getting orders for user: {}", userId);

        if (!userRepository.existsById(userId)) {
            logger.error("User not found: {}", userId);
            throw new ResourceNotFoundException("User not found: " + userId);
        }

        List<Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        return orderMapper.toDTOList(orders);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId, Long userId) {
        logger.debug("Getting order {} for user {}", orderId, userId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> {
                    logger.error("Order not found: {}", orderId);
                    return new ResourceNotFoundException("Order not found: " + orderId);
                });

        if (!order.isActive()) {
            throw new ResourceNotFoundException("Order not found or inactive: " + orderId);
        }

        if (!order.getUser().getUserId().equals(userId)) {
            throw new SecurityException("Order does not belong to user");
        }

        return orderMapper.toDTO(order);
    }

    private void validateStockAvailability(CartDTO cartDTO) {
        for (CartItemDTO item : cartDTO.getCartItems()) {
            Product product = productRepository.findById(item.getProduct().getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " +
                            item.getProduct().getProductId()));

            if (!product.isActive()) {
                logger.warn("Product not active: {} (ID: {})", product.getAdvertisement().getTitle(),
                        product.getProductId());
                throw new IllegalStateException("Product is not active: " +
                        product.getAdvertisement().getTitle());
            }

            if (product.getStockQuantity() < item.getQuantity()) {
                logger.warn("Insufficient stock for product: {}. Available: {}, Requested: {}",
                        product.getAdvertisement().getTitle(), product.getStockQuantity(), item.getQuantity());
                throw new IllegalStateException("Insufficient stock for product: " +
                        product.getAdvertisement().getTitle() +
                        ". Available: " + product.getStockQuantity() +
                        ", Requested: " + item.getQuantity());
            }
        }
    }

    /**
     * Calculates shipping cost based on order total.
     * Free shipping for orders over €50.
     * 
     * @param cartDTO cart to calculate for
     * @return shipping cost
     */
    private BigDecimal calculateShippingCost(CartDTO cartDTO) {
        if (cartDTO.getTotalAmount().compareTo(new BigDecimal("50.00")) >= 0) {
            return BigDecimal.ZERO;
        }
        return DEFAULT_SHIPPING_COST;
    }

    /**
     * Generates a unique order number.
     * Format: ORD-timestamp-randomNumber
     * 
     * @return unique order number
     */
    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + (int) (Math.random() * 1000);
    }
}