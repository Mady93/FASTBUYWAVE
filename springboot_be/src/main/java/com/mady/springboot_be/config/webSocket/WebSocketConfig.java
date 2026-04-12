package com.mady.springboot_be.config.webSocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.mady.springboot_be.config.security.SensitiveUrls;

/**
 * WebSocket configuration for real-time messaging using STOMP protocol.
 * 
 * This configuration enables WebSocket message brokering for real-time features
 * such as live notifications, comments, and chat functionality.
 * 
 * Key features:
 * - STOMP protocol over WebSocket for real-time bidirectional communication
 * - Simple in-memory message broker for topic-based messaging
 * - SockJS fallback support for browsers without native WebSocket support
 * - CORS configuration using allowed origin patterns from SensitiveUrls
 * 
 * Message flow:
 * - Clients send messages to /app/** endpoints
 * - The broker broadcasts messages to /topic/** endpoints
 * - Subscribers receive real-time updates
 * 
 * Use cases in Fast Buy Wave:
 * - Live comment notifications on advertisements
 * - Real-time replies and edits updates
 * - Instant notifications for appointment confirmations
 * - Chat messages between users
 * 
 * Endpoint configuration:
 * - WebSocket endpoint: /ws-comments
 * - SockJS fallback available at: /ws-comments (with /info, /iframe, etc.)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configures the message broker for WebSocket messaging.
     * 
     * Sets up:
     * - Simple in-memory broker for "/topic" destinations
     * - Application destination prefix "/app" for client-to-server messages
     * 
     * How it works:
     * 1. Client sends message to "/app/comment/add"
     * 2. Server processes the message
     * 3. Server broadcasts to "/topic/comments"
     * 4. All subscribed clients receive the update
     * 
     * @param config the MessageBrokerRegistry to configure
     */
    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Registers STOMP endpoints for WebSocket connections.
     * 
     * Configures:
     * - WebSocket endpoint at "/ws-comments"
     * - Allowed origin patterns from SensitiveUrls for CORS
     * - SockJS fallback for browser compatibility
     * 
     * SockJS provides fallback options when WebSocket is not available:
     * - XHR streaming
     * - XHR polling
     * - JSONP polling
     * - iFrame-based transport
     * 
     * @param registry the StompEndpointRegistry to register endpoints
     */
    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-comments")
                .setAllowedOriginPatterns(SensitiveUrls.ALLOWED_ORIGIN_PATTERNS)
                .withSockJS();
    }

}