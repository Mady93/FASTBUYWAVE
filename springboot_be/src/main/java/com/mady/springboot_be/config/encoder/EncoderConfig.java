package com.mady.springboot_be.config.encoder;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuration class that provides a BCrypt password encoder bean.
 * 
 * The encoder uses BCrypt hashing algorithm with default strength (10 rounds),
 * which is the recommended password encoding strategy for Spring Security.
 * 
 * Features of BCrypt:
 * - Adaptive hash function that can be configured to be slower over time
 * - Built-in salt generation to prevent rainbow table attacks
 * - Computationally expensive to resist brute-force attacks
 * - Industry standard for password storage
 * 
 * Usage example:
 * 
 * {@code
 * @Service
 * public class UserService {
 * private final PasswordEncoder passwordEncoder;
 * 
 * public UserService(PasswordEncoder passwordEncoder) {
 * this.passwordEncoder = passwordEncoder;
 * }
 * 
 * public void createUser(String rawPassword) {
 * String encodedPassword = passwordEncoder.encode(rawPassword);
 * // Store encodedPassword in database
 * }
 * 
 * public boolean validatePassword(String rawPassword, String encodedPassword) {
 * return passwordEncoder.matches(rawPassword, encodedPassword);
 * }
 * }
 * }
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Configuration
public class EncoderConfig {

    /**
     * Creates and returns a BCryptPasswordEncoder instance.
     * 
     * The encoder uses default strength of 10 (2^10 rounds of hashing),
     * providing a good balance between security and performance.
     * 
     * @return PasswordEncoder bean for encoding passwords
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}