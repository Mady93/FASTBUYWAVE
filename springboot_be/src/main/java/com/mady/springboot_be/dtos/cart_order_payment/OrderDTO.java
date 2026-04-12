package com.mady.springboot_be.dtos.cart_order_payment;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.mady.springboot_be.enums.OrderStatus;

/**
 * Data Transfer Object for order information.
 * 
 * Contains complete order details including order metadata, user information,
 * order items, payment information, and calculated totals (subtotal, tax,
 * shipping).
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class OrderDTO implements Serializable {

    private static final long serialVersionUID = 2025042200029L;
    private Long orderId;
    private String orderNumber;
    private LocalDateTime orderDate;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String notes;
    private UserSummaryDTO user;
    private List<OrderItemDTO> orderItems;
    private PaymentDTO payment;

    /**
     * Default constructor.
     */
    public OrderDTO() {
    }

    /**
     * Returns the order ID.
     * 
     * @return the order ID
     */
    public Long getOrderId() {
        return orderId;
    }

    /**
     * Sets the order ID.
     * 
     * @param orderId the order ID to set
     */
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    /**
     * Returns the unique order number.
     * Format: ORD-timestamp-randomNumber
     * 
     * @return the order number
     */
    public String getOrderNumber() {
        return orderNumber;
    }

    /**
     * Sets the unique order number.
     * 
     * @param orderNumber the order number to set
     */
    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    /**
     * Returns the order date.
     * 
     * @return the order date
     */
    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    /**
     * Sets the order date.
     * 
     * @param orderDate the order date to set
     */
    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    /**
     * Returns the order status.
     * 
     * @return the order status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED,
     *         CANCELLED, REFUNDED)
     */
    public OrderStatus getStatus() {
        return status;
    }

    /**
     * Sets the order status.
     * 
     * @param status the order status to set (PENDING, CONFIRMED, PROCESSING,
     *               SHIPPED, DELIVERED, CANCELLED, REFUNDED)
     */
    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    /**
     * Returns the subtotal (sum of item prices before tax and shipping).
     * 
     * @return the subtotal
     */
    public BigDecimal getSubtotal() {
        return subtotal;
    }

    /**
     * Sets the subtotal.
     * 
     * @param subtotal the subtotal to set
     */
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    /**
     * Returns the shipping cost.
     * 
     * @return the shipping cost
     */
    public BigDecimal getShippingCost() {
        return shippingCost;
    }

    /**
     * Sets the shipping cost.
     * 
     * @param shippingCost the shipping cost to set
     */
    public void setShippingCost(BigDecimal shippingCost) {
        this.shippingCost = shippingCost;
    }

    /**
     * Returns the tax amount.
     * 
     * @return the tax amount
     */
    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    /**
     * Sets the tax amount.
     * 
     * @param taxAmount the tax amount to set
     */
    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    /**
     * Returns the total amount (subtotal + tax + shipping).
     * 
     * @return the total amount
     */
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    /**
     * Sets the total amount.
     * 
     * @param totalAmount the total amount to set (subtotal + tax + shipping)
     */
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    /**
     * Returns the order notes.
     * 
     * @return the notes (optional)
     */
    public String getNotes() {
        return notes;
    }

    /**
     * Sets the order notes.
     * 
     * @param notes the notes to set (optional)
     */
    public void setNotes(String notes) {
        this.notes = notes;
    }

    /**
     * Returns the user summary (ID, name, email).
     * 
     * @return the user summary
     */
    public UserSummaryDTO getUser() {
        return user;
    }

    /**
     * Sets the user summary.
     * 
     * @param user the user summary to set
     */
    public void setUser(UserSummaryDTO user) {
        this.user = user;
    }

    /**
     * Returns the list of order items.
     * 
     * @return the order items
     */
    public List<OrderItemDTO> getOrderItems() {
        return orderItems;
    }

    /**
     * Sets the list of order items.
     * 
     * @param orderItems the order items to set
     */
    public void setOrderItems(List<OrderItemDTO> orderItems) {
        this.orderItems = orderItems;
    }

    /**
     * Returns the payment information associated with the order.
     * 
     * @return the payment DTO
     */
    public PaymentDTO getPayment() {
        return payment;
    }

    /**
     * Sets the payment information.
     * 
     * @param payment the payment DTO to set
     */
    public void setPayment(PaymentDTO payment) {
        this.payment = payment;
    }
}
