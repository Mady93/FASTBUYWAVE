package com.mady.springboot_be.dtos.cart_order_payment;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.mady.springboot_be.enums.PaymentMethod;
import com.mady.springboot_be.enums.PaymentStatus;

/**
 * Data Transfer Object for payment information.
 * 
 * Contains payment details including payment method, status, amount,
 * transaction ID from gateway, and timestamps. Supports Stripe, PayPal,
 * and mock payment modes.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class PaymentDTO implements Serializable {

    private static final long serialVersionUID = 2025042200031L;
    private Long paymentId;
    private String paymentReference;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime paymentDate;
    private String transactionId;
    private String failureReason;
    private LocalDateTime createdAt;

    /**
     * Default constructor.
     */
    public PaymentDTO() {
    }

    /**
     * Returns the payment ID.
     * 
     * @return the payment ID
     */
    public Long getPaymentId() {
        return paymentId;
    }

    /**
     * Sets the payment ID.
     * 
     * @param paymentId the payment ID to set
     */
    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    /**
     * Returns the payment reference.
     * 
     * @return the payment reference
     */
    public String getPaymentReference() {
        return paymentReference;
    }

    /**
     * Sets the payment reference.
     * 
     * @param paymentReference the payment reference to set
     */
    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    /**
     * Returns the payment method.
     * 
     * @return the payment method (VISA, MASTERCARD, PAYPAL)
     */
    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    /**
     * Sets the payment method.
     * 
     * @param paymentMethod the payment method to set
     */
    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    /**
     * Returns the payment status.
     * 
     * @return the payment status (PENDING, COMPLETED, FAILED, REFUNDED)
     */
    public PaymentStatus getStatus() {
        return status;
    }

    /**
     * Sets the payment status.
     * 
     * @param status the payment status to set
     */
    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    /**
     * Returns the payment amount.
     * 
     * @return the payment amount
     */
    public BigDecimal getAmount() {
        return amount;
    }

    /**
     * Sets the payment amount.
     * 
     * @param amount the payment amount to set
     */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /**
     * Returns the currency code.
     * 
     * @return the currency (e.g., "USD", "EUR")
     */
    public String getCurrency() {
        return currency;
    }

    /**
     * Sets the currency code.
     * 
     * @param currency the currency to set
     */
    public void setCurrency(String currency) {
        this.currency = currency;
    }

    /**
     * Returns the payment date and time.
     * 
     * @return the payment date and time
     */
    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    /**
     * Sets the payment completion date.
     * 
     * @param paymentDate the payment date to set
     */
    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    /**
     * Returns the transaction ID from the payment gateway.
     * 
     * @return the transaction ID
     */
    public String getTransactionId() {
        return transactionId;
    }

    /**
     * Sets the transaction ID from the payment gateway.
     * 
     * @param transactionId the transaction ID to set
     */
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    /**
     * Returns the failure reason if the payment failed.
     * 
     * @return the failure reason
     */
    public String getFailureReason() {
        return failureReason;
    }

    /**
     * Sets the failure reason if the payment failed.
     * 
     * @param failureReason the failure reason to set
     */
    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    /**
     * Returns the creation timestamp of the payment record.
     * 
     * @return the creation timestamp
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the creation timestamp of the payment record.
     * 
     * @param createdAt the creation timestamp to set
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
