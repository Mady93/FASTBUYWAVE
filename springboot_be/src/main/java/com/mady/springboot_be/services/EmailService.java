package com.mady.springboot_be.services;

/**
 * Service interface for sending emails.
 * 
 * Provides a simple abstraction for email sending operations
 * used throughout the application for notifications, confirmations,
 * and reminders.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface EmailService {

    /**
     * Sends an email with the specified parameters.
     * 
     * @param from the sender email address
     * @param to the recipient email address
     * @param subject the email subject line
     * @param text the email body content (supports HTML)
     */
    void sendEmail(String from, String to, String subject, String text);
}
