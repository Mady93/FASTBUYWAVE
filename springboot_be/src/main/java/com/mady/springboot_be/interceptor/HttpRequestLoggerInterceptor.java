package com.mady.springboot_be.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * HTTP request logging interceptor for debugging and monitoring.
 * 
 * This interceptor logs incoming HTTP requests before they reach the
 * controllers,
 * capturing the HTTP method, request URI, and query parameters.
 * 
 * Log format example:
 * HTTP Request: GET /api/users/123 - Params: page=1&size=10
 * 
 * The interceptor is registered in WebConfig and applies to all endpoints
 * (/**).
 * 
 * Useful for:
 * - Debugging API calls during development
 * - Tracking request patterns
 * - Performance monitoring
 * - Audit trails (when combined with response logging)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class HttpRequestLoggerInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(HttpRequestLoggerInterceptor.class);

    /**
     * Intercepts HTTP requests before they reach the controller.
     * 
     * Logs the HTTP method, request URI, and query string parameters.
     * Always returns true to allow the request to continue processing.
     * 
     * @param request  the HTTP request
     * @param response the HTTP response
     * @param handler  the handler that will process the request
     * @return true to continue the request processing chain
     * @throws Exception if an error occurs during logging
     */
    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull Object handler) throws Exception {
        // Log HTTP request details
        logger.info("HTTP Request: {} {} - Params: {}", request.getMethod(), request.getRequestURI(),
                request.getQueryString());
        return true;
    }
}