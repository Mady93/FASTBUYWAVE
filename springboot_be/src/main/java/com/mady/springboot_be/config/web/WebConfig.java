package com.mady.springboot_be.config.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.mady.springboot_be.interceptor.HttpRequestLoggerInterceptor;

/**
 * Web MVC configuration class that registers HTTP interceptors.
 * 
 * This configuration sets up the HttpRequestLoggerInterceptor to intercept
 * all incoming HTTP requests for logging purposes.
 * 
 * The interceptor logs:
 * - HTTP method (GET, POST, PUT, DELETE, etc.)
 * - Request URI
 * - Request headers (configurable)
 * - Processing time
 * - Response status
 * 
 * This is useful for:
 * - Debugging and troubleshooting
 * - Performance monitoring
 * - Audit trails
 * - Request/response analysis in development environment
 * 
 * The interceptor is applied to all endpoints (/**) and executes before
 * the request reaches the controllers.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
         // Adds the HTTP request logger interceptor for all incoming requests
        registry.addInterceptor(new HttpRequestLoggerInterceptor())
                .addPathPatterns("/**"); // Applies interceptor to all endpoints
    }
}