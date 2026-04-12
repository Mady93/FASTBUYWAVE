package com.mady.springboot_be.config.jackson;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mady.springboot_be.dtos.UserDTO;
import com.mady.springboot_be.utils.abs.UserDTOMixin;

/**
 * Configuration class for Jackson JSON processing.
 * 
 * This configuration provides a customized ObjectMapper bean that handles:
 * - UserDTO serialization without exposing sensitive password fields
 * - Java 8+ date/time types (LocalDate, LocalDateTime, etc.)
 * - Human-readable date format instead of timestamps
 * 
 * The mixin approach allows field-level control over serialization without
 * modifying the original DTO class. Specifically, password fields are excluded
 * from JSON serialization to prevent sensitive data leaks.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Configuration
public class JacksonConfig {

    /**
     * Creates and configures an ObjectMapper bean for JSON processing.
     * 
     * The configured ObjectMapper includes:
     * - UserDTOMixin: excludes password fields from UserDTO serialization
     * - JavaTimeModule: supports Java 8+ date/time types
     * - Disabled WRITE_DATES_AS_TIMESTAMPS: dates are written as ISO strings
     * (e.g., "2025-01-15T10:30:00") instead of numeric timestamps
     * 
     * @return configured ObjectMapper instance for the entire application
     */
    @Bean
    public ObjectMapper objectMapper() {

        ObjectMapper objectMapper = new ObjectMapper();

        // Excludes password fields from UserDTO serialization
        objectMapper.addMixIn(UserDTO.class, UserDTOMixin.class);

        // Registers module for Java 8+ date/time types (LocalDate, LocalDateTime, etc.)
        objectMapper.registerModule(new JavaTimeModule());

        // Sets date format to ISO strings instead of numeric timestamps
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return objectMapper;
    }
}
