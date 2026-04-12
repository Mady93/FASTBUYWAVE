package com.mady.springboot_be.dtos.cart_order_payment;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Data Transfer Object for an item within an order.
 * 
 * Contains product reference, quantity, unit price at time of order,
 * and calculated total price (quantity * unitPrice).
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class OrderItemDTO implements Serializable {

    private static final long serialVersionUID = 2025042200030L;
    private Long orderItemId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private ProductSummaryDTO product;

    /**
     * Default constructor.
     */
    public OrderItemDTO() {
    }

    /**
     * Returns the order item ID.
     * 
     * @return the order item ID
     */
    public Long getOrderItemId() {
        return orderItemId;
    }

    /**
     * Sets the order item ID.
     * 
     * @param orderItemId the order item ID to set
     */
    public void setOrderItemId(Long orderItemId) {
        this.orderItemId = orderItemId;
    }

    /**
     * Returns the quantity of the product ordered.
     * 
     * @return the quantity
     */
    public Integer getQuantity() {
        return quantity;
    }

    /**
     * Sets the quantity of the product ordered.
     * 
     * @param quantity the quantity to set
     */
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    /**
     * Returns the unit price of the product at the time of order.
     * 
     * @return the unit price
     */
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    /**
     * Sets the unit price of the product.
     * 
     * @param unitPrice the unit price to set
     */
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    /**
     * Returns the total price for this order item (quantity * unit price).
     * 
     * @return the total price
     */
    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    /**
     * Sets the total price for this order item.
     * 
     * @param totalPrice the total price to set
     */
    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    /**
     * Returns the product summary (ID, name, price, image).
     * 
     * @return the product summary
     */
    public ProductSummaryDTO getProduct() {
        return product;
    }

    /**
     * Sets the product summary.
     * 
     * @param product the product summary to set
     */
    public void setProduct(ProductSummaryDTO product) {
        this.product = product;
    }
}
