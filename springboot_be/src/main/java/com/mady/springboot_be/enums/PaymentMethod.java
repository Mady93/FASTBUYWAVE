package com.mady.springboot_be.enums;

/**
 * Represents the available payment methods for orders.
 * 
 * Supports both card payments (Visa, MasterCard) via Stripe integration,
 * and digital wallet payments via PayPal Checkout.
 * 
 * Each payment method has a display name for UI presentation.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public enum PaymentMethod {

    /**
     * Visa credit/debit card payment via Stripe.
     */
    VISA("Visa"),

    /**
     * MasterCard credit/debit card payment via Stripe.
     */
    MASTERCARD("MasterCard"),

    /**
     * PayPal digital wallet payment via PayPal Checkout.
     */
    PAYPAL("PayPal");

    private final String displayName;

    /**
     * Constructs a PaymentMethod with a display name.
     * 
     * @param displayName the user-friendly name for UI display
     */
    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    /**
     * Returns the user-friendly display name of the payment method.
     * 
     * @return the display name (e.g., "Visa", "MasterCard", "PayPal")
     */
    public String getDisplayName() {
        return displayName;
    }
}
