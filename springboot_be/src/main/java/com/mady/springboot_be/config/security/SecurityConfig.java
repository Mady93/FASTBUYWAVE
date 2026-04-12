package com.mady.springboot_be.config.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.mady.springboot_be.config.granted_authority.JwtAuthenticationFilter;
import com.mady.springboot_be.services.token.JwtService;

/**
 * Main security configuration class for the Fast Buy Wave application.
 * 
 * This configuration sets up:
 * - JWT-based authentication with stateless sessions
 * - Role-based authorization (USER / ADMIN)
 * - CORS support for frontend integration
 * - Public endpoints for authentication and documentation
 * - WebSocket endpoint permissions
 * 
 * Security features:
 * - Stateless session management (no JSESSIONID)
 * - JWT authentication filter before UsernamePasswordAuthenticationFilter
 * - 401 Unauthorized entry point for unauthenticated requests
 * - Method-level security with @PreAuthorize enabled
 * 
 * Public endpoints (permitAll):
 * - /api/auth/** - login, registration, token refresh
 * - /oauth2/** - Google OAuth2 endpoints
 * - /api/category/** - public category browsing
 * - /ws-comments/** - WebSocket connections
 * - /swagger-ui/** - API documentation
 * 
 * Protected endpoints require USER or ADMIN role:
 * - /api/user/**, /api/profiles/**
 * - /api/v1/cart/**, /api/v1/orders/**, /api/v1/payments/**
 * - /api/comments/**, /api/likes/**
 * - /api/appointments/**, /api/chat/**
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtService jwtService;

    /**
     * Constructs the security configuration with required dependencies.
     * 
     * @param jwtService service for JWT validation and claim extraction
     */
    @Autowired
    public SecurityConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    /**
     * Configures the main security filter chain.
     * 
     * Security configuration includes:
     * - CORS enabled with custom configuration
     * - CSRF disabled (stateless REST API)
     * - Role-based endpoint authorization
     * - Stateless session creation policy
     * - JWT authentication filter before standard authentication
     * - Custom 401 entry point for unauthenticated access
     * 
     * @param http the HttpSecurity to configure
     * @return the configured SecurityFilterChain
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) // ✅ Abilita il tuo CorsFilter (senza warning)
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**").permitAll()

                        .requestMatchers("/api/category/**").permitAll()
                        .requestMatchers("/api/address/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/announcement/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/advertisements/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/category/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/image/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/products/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/profiles/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/appointments/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/chat/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/contact/requests/**").hasAnyRole("USER", "ADMIN")

                        .requestMatchers("/api/user/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/profiles/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/likes/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/comments/**").hasAnyRole("USER", "ADMIN")

                        .requestMatchers("/api/v1/cart/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/v1/orders/**").authenticated()
                        .requestMatchers("/api/v1/payments/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/dashboard/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/api/appointment/proposals/**").hasAnyRole("USER", "ADMIN")

                        .requestMatchers("/ws-comments/**").permitAll()

                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/api-docs/**")
                        .permitAll()
                        .requestMatchers("/static/**", "/public/**", "/resources/**", "/webjars/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .logout(logout -> logout
                        .invalidateHttpSession(false)
                        .deleteCookies("JSESSIONID"))
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    /**
     * Creates the JWT authentication filter bean.
     * 
     * This filter intercepts requests and validates Bearer tokens from the
     * Authorization header. It runs before the standard Spring Security
     * UsernamePasswordAuthenticationFilter.
     * 
     * @return a new instance of JwtAuthenticationFilter
     */
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService);
    }

    /**
     * Configures CORS (Cross-Origin Resource Sharing) for the application.
     * 
     * Allows frontend applications (Angular on configured ports) to communicate
     * with the backend API. Credentials are allowed for authenticated requests.
     * 
     * Allowed origins are loaded from SensitiveUrls.ALLOWED_ORIGINS.
     * All headers and HTTP methods are permitted.
     * 
     * @return configured CorsFilter instance
     */
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        for (String origin : SensitiveUrls.ALLOWED_ORIGINS) {
            config.addAllowedOrigin(origin);
        }

        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    /**
     * Creates a RestTemplate bean for making HTTP requests.
     * 
     * Used for:
     * - Google OAuth2 token verification
     * - External API calls
     * - Payment gateway integrations (Stripe, PayPal)
     * 
     * @return a new RestTemplate instance
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
