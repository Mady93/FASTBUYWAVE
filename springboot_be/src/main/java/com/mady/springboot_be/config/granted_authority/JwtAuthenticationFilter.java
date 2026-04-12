package com.mady.springboot_be.config.granted_authority;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.mady.springboot_be.services.token.JwtService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * JWT authentication filter that intercepts HTTP requests and validates Bearer
 * tokens.
 * 
 * This filter extracts the JWT from the Authorization header, validates it
 * using
 * the JwtService, and sets the authentication context in Spring Security.
 * 
 * The filter is executed once per request and performs the following steps:
 * - Extracts the Bearer token from the Authorization header
 * - Validates the token using ECDSA signature (ES256 on NIST P-256 curve)
 * - Extracts user ID and role from token claims
 * - Creates Spring Security authentication with ROLE_ prefix
 * - Sets the authentication in SecurityContextHolder
 * 
 * If the token is invalid or missing, the request proceeds without
 * authentication.
 * 
 * Token claims structure:
 * - Subject (sub): user ID
 * - roles: user role as String (e.g., "USER", "ADMIN")
 * 
 * Example Authorization header:
 * Authorization: Bearer
 * eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIxMjMiLCJyb2xlcyI6IlVTRVIifQ...
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    /**
     * Constructs the JWT authentication filter with the required JwtService.
     * 
     * @param jwtService service for JWT validation and claim extraction
     */
    @Autowired
    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    /**
     * Processes each HTTP request to perform JWT authentication.
     * 
     * The method:
     * 1. Extracts the Authorization header
     * 2. Validates the Bearer token format
     * 3. Validates the JWT signature and expiration
     * 4. Extracts user ID and role from claims
     * 5. Creates and sets Spring Security authentication
     * 
     * If no token is present, the request continues unauthenticated.
     * If the token is invalid, a 401 Unauthorized response is returned.
     * 
     * @param request     the HTTP request
     * @param response    the HTTP response
     * @param filterChain the filter chain to continue request processing
     * @throws ServletException if a servlet error occurs
     * @throws IOException      if an I/O error occurs
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            JWTClaimsSet claims = jwtService.validateToken(token);
            String userId = claims.getSubject();

            Object rolesClaim = claims.getClaim("roles");
            if (!(rolesClaim instanceof String role)) {
                throw new JOSEException("Invalid roles claim type: expected String");
            }

            // Creates authorities with ROLE_ prefix for Spring Security
            Collection<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + role));

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userId, null,
                    authorities);

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (JOSEException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid JWT token: " + e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }
}