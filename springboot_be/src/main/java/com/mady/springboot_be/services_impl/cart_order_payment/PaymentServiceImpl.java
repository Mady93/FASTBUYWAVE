package com.mady.springboot_be.services_impl.cart_order_payment;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mady.springboot_be.dettails.PaymentResponseDTO;
import com.mady.springboot_be.dtos.cart_order_payment.InitiatePaymentRequestDTO;
import com.mady.springboot_be.entities.Order;
import com.mady.springboot_be.entities.Payment;
import com.mady.springboot_be.enums.OrderStatus;
import com.mady.springboot_be.enums.PaymentMethod;
import com.mady.springboot_be.enums.PaymentStatus;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.cart_order_payment.OrderRepository;
import com.mady.springboot_be.repositories.cart_order_payment.PaymentRepository;
import com.mady.springboot_be.services.cart_order_payment.PaymentService;
import com.mady.springboot_be.utils.mappers.cart_order_payment.PaymentMapper;
import com.paypal.core.PayPalEnvironment;
import com.paypal.core.PayPalHttpClient;
import com.paypal.http.HttpResponse;
import com.paypal.orders.AmountWithBreakdown;
import com.paypal.orders.OrderRequest;
import com.paypal.orders.OrdersCreateRequest;
import com.paypal.orders.OrdersGetRequest;
import com.paypal.orders.PurchaseUnitRequest;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

/**
 * Implementation of PaymentService for payment processing.
 * 
 * Handles payment initiation, confirmation, and failure handling for:
 * - Stripe (VISA, MASTERCARD)
 * - PayPal Checkout
 * - Mock payment mode for testing
 * 
 * The service is production-ready with real gateway SDKs integrated.
 * Awaiting live credentials for end-to-end testing.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderServiceImpl orderService;
    private final PaymentMapper paymentMapper;

    private final String stripeApiKey;
    private final String paypalClientId;
    private final String paypalClientSecret;

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    /**
     * Constructs a new PaymentServiceImpl with required dependencies.
     * 
     * API keys are loaded from environment variables or default to test values.
     * 
     * @param paymentRepository repository for Payment entity operations
     * @param orderRepository   repository for Order entity operations
     * @param orderService      service for order status updates
     * @param paymentMapper     mapper for converting between Payment entity and
     *                          PaymentDTO
     */
    @Autowired
    public PaymentServiceImpl(PaymentRepository paymentRepository, OrderRepository orderRepository,
            OrderServiceImpl orderService, PaymentMapper paymentMapper) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
        this.paymentMapper = paymentMapper;

        // Load keys from environment variables or use default test values
        this.stripeApiKey = System.getenv().getOrDefault("STRIPE_API_KEY", "sk_test_123456");
        this.paypalClientId = System.getenv().getOrDefault("PAYPAL_CLIENT_ID", "client_id_test");
        this.paypalClientSecret = System.getenv().getOrDefault("PAYPAL_CLIENT_SECRET", "client_secret_test");
    }

    @Override
    public PaymentResponseDTO initiatePayment(Long userId, InitiatePaymentRequestDTO request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + request.getOrderId()));

        if (!order.getUser().getUserId().equals(userId)) {
            throw new SecurityException("Order does not belong to user");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Order is not in PENDING status");
        }

        // Mock mode → immediate confirmation
        if (request.isUseMockPayment()) {
            return mockInitiatePayment(order, request.getPaymentMethod());
        }

        // Real payment → create record and gateway URL
        Payment payment = new Payment(request.getPaymentMethod(), order.getTotalAmount(), order);
        payment = paymentRepository.save(payment);

        String paymentUrl = generatePaymentUrl(payment);

        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setSuccess(true);
        response.setMessage("Payment initiated successfully");
        response.setData(paymentMapper.toDTO(payment));
        response.setPaymentUrl(paymentUrl);

        return response;
    }

    /**
     * Handles mock payment initiation (testing mode).
     * 
     * Creates a completed payment record without calling external gateways.
     * 
     * @param order  the order being paid for
     * @param method the payment method (VISA, MASTERCARD, PAYPAL)
     * @return PaymentResponseDTO with mock confirmation
     */
    private PaymentResponseDTO mockInitiatePayment(Order order, PaymentMethod method) {
        Payment payment = new Payment(method, order.getTotalAmount(), order);
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId("MOCK_" + System.currentTimeMillis());
        payment.setPaymentDate(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        orderService.updateOrderStatus(order.getOrderId(), OrderStatus.CONFIRMED);

        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setSuccess(true);
        response.setMessage("Mock payment confirmed immediately");
        response.setData(paymentMapper.toDTO(payment));
        response.setPaymentUrl(null); // No redirect for mocks
        return response;
    }

    @Override
    public PaymentResponseDTO confirmPayment(String paymentReference, String transactionId, boolean useMockPayment) {
        logger.debug("Confirming payment: {}, mock: {}", paymentReference, useMockPayment);

        Payment payment = paymentRepository.findByPaymentReference(paymentReference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + paymentReference));

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Payment already completed");
        }

        if (useMockPayment) {
            return mockConfirmPayment(payment);
        } else {
            return realConfirmPayment(payment, transactionId);
        }
    }

    @Override
    public PaymentResponseDTO handlePaymentFailure(String paymentReference, String failureReason) {
        Payment payment = paymentRepository.findByPaymentReference(paymentReference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + paymentReference));

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(failureReason);
        payment = paymentRepository.save(payment);

        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setSuccess(false);
        response.setMessage("Payment failed: " + failureReason);
        response.setData(paymentMapper.toDTO(payment));
        return response;
    }

    /**
     * Generates payment gateway URL based on payment method.
     * 
     * @param payment the payment entity
     * @return redirect URL for Stripe or PayPal checkout
     */
    private String generatePaymentUrl(Payment payment) {
        return switch (payment.getPaymentMethod()) {
            case VISA, MASTERCARD -> generateStripePaymentUrl(payment);
            case PAYPAL -> generatePaypalPaymentUrl(payment);
            default -> throw new IllegalArgumentException("Unsupported payment method: " + payment.getPaymentMethod());
        };
    }

    /**
     * Generates Stripe Checkout session URL.
     * 
     * @param payment the payment entity
     * @return Stripe Checkout page URL
     */
    private String generateStripePaymentUrl(Payment payment) {
        try {
            com.stripe.Stripe.apiKey = stripeApiKey;

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl("https://tuo-sito.com/success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl("https://tuo-sito.com/cancel")
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("USD")
                                    .setUnitAmount(payment.getOrder().getTotalAmount().longValue() * 100)
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Ordine #" + payment.getOrder().getOrderId())
                                            .build())
                                    .build())
                            .build())
                    .build();

            Session session = Session.create(params);
            return session.getUrl();
        } catch (com.stripe.exception.StripeException | RuntimeException e) {
            logger.error("Errore generazione URL Stripe", e);
            throw new RuntimeException("Errore generazione URL Stripe", e);
        }
    }

    /**
     * Generates PayPal approval URL.
     * 
     * @param payment the payment entity
     * @return PayPal approval URL
     */
    private String generatePaypalPaymentUrl(Payment payment) {
        try {
            PayPalEnvironment environment = new PayPalEnvironment.Sandbox(paypalClientId, paypalClientSecret);
            PayPalHttpClient client = new PayPalHttpClient(environment);

            OrderRequest orderRequest = new OrderRequest();
            orderRequest.checkoutPaymentIntent("CAPTURE");
            orderRequest.purchaseUnits(Arrays.asList(
                    new PurchaseUnitRequest().amountWithBreakdown(
                            new AmountWithBreakdown()
                                    .currencyCode("USD")
                                    .value(payment.getOrder().getTotalAmount().toString()))));

            OrdersCreateRequest request = new OrdersCreateRequest();
            request.header("prefer", "return=representation");
            request.requestBody(orderRequest);

            HttpResponse<com.paypal.orders.Order> response = client.execute(request);

            return response.result().links().stream()
                    .filter(link -> "approve".equals(link.rel()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Link approvazione PayPal non trovato"))
                    .href();
        } catch (com.paypal.http.exceptions.HttpException e) {
            logger.error("Errore HTTP PayPal", e);
            throw new RuntimeException("Errore HTTP PayPal", e);
        } catch (IOException e) {
            logger.error("Errore I/O durante comunicazione con PayPal", e);
            throw new RuntimeException("Errore I/O PayPal", e);
        }
    }

    /**
     * Confirms mock payment (testing mode).
     * 
     * @param payment the payment entity
     * @return PaymentResponseDTO with mock confirmation
     */
    private PaymentResponseDTO mockConfirmPayment(Payment payment) {
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId("MOCK_" + System.currentTimeMillis());
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);

        orderService.updateOrderStatus(payment.getOrder().getOrderId(), OrderStatus.CONFIRMED);

        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setSuccess(true);
        response.setMessage("Mock payment confirmed successfully");
        response.setData(paymentMapper.toDTO(payment));
        response.setPaymentUrl(null);
        return response;
    }

    /**
     * Confirms real payment by verifying with payment gateway.
     * 
     * @param payment       the payment entity
     * @param transactionId the transaction ID from the gateway
     * @return PaymentResponseDTO with confirmation result
     */
    private PaymentResponseDTO realConfirmPayment(Payment payment, String transactionId) {
        boolean paymentValid = verifyPaymentWithGateway(payment, transactionId, false);

        if (paymentValid) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionId(transactionId);
            payment.setPaymentDate(LocalDateTime.now());
            orderService.updateOrderStatus(payment.getOrder().getOrderId(), OrderStatus.CONFIRMED);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            if (payment.getFailureReason() == null) {
                payment.setFailureReason("Payment verification failed");
            }
        }

        paymentRepository.save(payment);

        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setSuccess(paymentValid);
        response.setMessage(paymentValid ? "Payment confirmed" : "Payment failed");
        response.setData(paymentMapper.toDTO(payment));
        response.setPaymentUrl(null);
        return response;
    }

    /**
     * Verifies payment status with the appropriate payment gateway.
     * 
     * Delegates to Stripe or PayPal verification based on payment method.
     * 
     * @param payment        the payment entity to verify
     * @param transactionId  the transaction ID from the payment gateway
     * @param useMockPayment true for mock mode, false for real gateway
     * @return true if payment is successful, false otherwise
     */
    private boolean verifyPaymentWithGateway(Payment payment, String transactionId, boolean useMockPayment) {
        if (useMockPayment)
            return true;

        try {
            return switch (payment.getPaymentMethod()) {
                case VISA, MASTERCARD -> verifyWithStripe(payment, transactionId);
                case PAYPAL -> verifyWithPaypal(payment, transactionId);
                default -> {
                    payment.setFailureReason("Unsupported payment method: " + payment.getPaymentMethod());
                    yield false;
                }
            };
        } catch (Exception e) {
            payment.setFailureReason("Payment verification failed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Verifies payment status with Stripe API.
     * 
     * Retrieves the PaymentIntent from Stripe and checks if status is "succeeded".
     * 
     * @param payment       the payment entity to update with transaction details
     * @param transactionId the Stripe PaymentIntent ID
     * @return true if payment status is "succeeded", false otherwise
     * @throws Exception if Stripe API call fails
     */
    private boolean verifyWithStripe(Payment payment, String transactionId) throws Exception {
        com.stripe.Stripe.apiKey = stripeApiKey;
        com.stripe.model.PaymentIntent pi = com.stripe.model.PaymentIntent.retrieve(transactionId);

        if ("succeeded".equals(pi.getStatus())) {
            payment.setTransactionId(transactionId);
            payment.setPaymentDate(LocalDateTime.now());
            return true;
        } else {
            payment.setFailureReason("Stripe payment status: " + pi.getStatus());
            return false;
        }
    }

    /**
     * Verifies payment status with PayPal API.
     * 
     * Retrieves the order from PayPal and checks if status is "COMPLETED".
     * 
     * @param payment       the payment entity to update with transaction details
     * @param transactionId the PayPal order ID
     * @return true if payment status is "COMPLETED", false otherwise
     * @throws Exception if PayPal API call fails
     */
    private boolean verifyWithPaypal(Payment payment, String transactionId) throws Exception {
        PayPalEnvironment environment = new PayPalEnvironment.Sandbox(paypalClientId, paypalClientSecret);
        PayPalHttpClient client = new PayPalHttpClient(environment);

        OrdersGetRequest request = new OrdersGetRequest(transactionId);
        HttpResponse<com.paypal.orders.Order> response = client.execute(request);
        com.paypal.orders.Order order = response.result();

        if ("COMPLETED".equalsIgnoreCase(order.status())) {
            payment.setTransactionId(transactionId);
            payment.setPaymentDate(LocalDateTime.now());
            return true;
        } else {
            payment.setFailureReason("PayPal payment status: " + order.status());
            return false;
        }
    }
}