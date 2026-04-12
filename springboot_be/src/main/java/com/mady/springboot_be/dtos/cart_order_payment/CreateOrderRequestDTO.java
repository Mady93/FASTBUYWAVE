package com.mady.springboot_be.dtos.cart_order_payment;

import java.io.Serializable;

/**
 * Request DTO for creating an order from the user's cart.
 * 
 * This DTO is used as the request body for the POST /api/v1/orders endpoint.
 * It contains optional order notes and shipping address information.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class CreateOrderRequestDTO implements Serializable {

    private static final long serialVersionUID = 2025042200027L;
    private String notes;
    private Long shippingAddressId; // If you have shipping addresses

    /**
     * Default constructor.
     */
    public CreateOrderRequestDTO() {
    }

    /**
     * Returns the order notes.
     * 
     * @return the notes (optional, can be null)
     */
    public String getNotes() {
        return notes;
    }

    /**
     * Sets the order notes.
     * 
     * @param notes the notes to set
     */
    public void setNotes(String notes) {
        this.notes = notes;
    }

    /**
     * Returns the shipping address ID.
     * 
     * @return the shipping address ID (optional, can be null)
     */
    public Long getShippingAddressId() {
        return shippingAddressId;
    }

    /**
     * Sets the shipping address ID.
     * 
     * @param shippingAddressId the shipping address ID to set
     */
    public void setShippingAddressId(Long shippingAddressId) {
        this.shippingAddressId = shippingAddressId;
    }
}
