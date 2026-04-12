package com.mady.springboot_be.dtos.cart_order_payment;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for an item inside a shopping cart.
 * 
 * Contains product reference, quantity, unit price, subtotal (quantity *
 * unitPrice),
 * and timestamp of when the item was added to the cart.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class CartItemDTO implements Serializable {

    private static final long serialVersionUID = 2025042200026L;

    private Long cartItemId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private LocalDateTime addedAt;
    private ProductSummaryDTO product;

    /**
     * Default constructor.
     */
    public CartItemDTO() {
    }

    /**
     * Returns the cart item ID.
     * 
     * @return the cart item ID
     */
    public Long getCartItemId() {
        return cartItemId;
    }

    /**
     * Sets the cart item ID.
     * 
     * @param cartItemId the cart item ID to set
     */
    public void setCartItemId(Long cartItemId) {
        this.cartItemId = cartItemId;
    }

    /**
     * Returns the quantity of the product in the cart.
     * 
     * @return the quantity
     */
    public Integer getQuantity() {
        return quantity;
    }

    /**
     * Sets the quantity of the product in the cart.
     * 
     * @param quantity the quantity to set
     */
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    /**
     * Returns the unit price of the product at the time it was added to the cart.
     * 
     * @return the unit price
     */
    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    /**
     * Sets the unit price of the product at the time it was added to the cart.
     * 
     * @param unitPrice the unit price to set
     */
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    /**
     * Returns the subtotal for this cart item (quantity * unit price).
     * 
     * @return the subtotal
     */
    public BigDecimal getSubtotal() {
        return subtotal;
    }

    /**
     * Sets the subtotal for this cart item (quantity * unit price).
     * 
     * @param subtotal the subtotal to set
     */
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    /**
     * Returns the timestamp of when the item was added to the cart.
     * 
     * @return the addedAt timestamp
     */
    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    /**
     * Sets the timestamp of when the item was added to the cart.
     * 
     * @param addedAt the addedAt timestamp to set
     */
    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }

    /**
     * Returns the product summary (product ID, name, price, image).
     * 
     * @return the product summary
     */
    public ProductSummaryDTO getProduct() {
        return product;
    }

    /**
     * Sets the product summary (product ID, name, price, image).
     * 
     * @param product the product summary to set
     */
    public void setProduct(ProductSummaryDTO product) {
        this.product = product;
    }

}
