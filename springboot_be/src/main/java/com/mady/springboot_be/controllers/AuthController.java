package com.mady.springboot_be.controllers;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mady.springboot_be.dettails.ApiResponse;
import com.mady.springboot_be.dettails.TokenResponse;
import com.mady.springboot_be.dtos.RefreshTokenDTO;
import com.mady.springboot_be.dtos.UserDTO;
import com.mady.springboot_be.entities.RefreshToken;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.RefreshTokenRepository;
import com.mady.springboot_be.services_impl.UserServiceImpl;
import com.mady.springboot_be.services_impl.token.JwtServiceImpl;
import com.mady.springboot_be.services_impl.token.RefreshTokenServiceImpl;
import com.mady.springboot_be.support.LoginRequest;
import com.mady.springboot_be.support.RefreshRequest;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

/**
 * REST controller for authentication operations.
 * 
 * Supports user registration, login, logout, token refresh, and password change.
 * Uses JWT with ECDSA signatures (ES256 on NIST P-256 curve) and stores
 * refresh tokens in database with 3-day expiration and explicit revocation.
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user registration, login, logout and token management")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserServiceImpl userService;
    private final JwtServiceImpl jwtService;
    private final RefreshTokenServiceImpl refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public AuthController(UserServiceImpl userService, JwtServiceImpl jwtService,
            RefreshTokenServiceImpl refreshTokenService, PasswordEncoder passwordEncoder,
            RefreshTokenRepository refreshTokenRepository, ObjectMapper objectMapper) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.objectMapper = objectMapper;
    }

    @Operation(summary = "Register a new user", description = "Creates a new user account with the provided information")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input data"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "User already exists")
    })
    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@RequestBody @Valid UserDTO user)
            throws MethodArgumentNotValidException, IllegalArgumentException, ResourceNotFoundException {
        logger.info("Register request for email: {}", user.getEmail());
        UserDTO savedUser = userService.createUser(user);
        logger.info("User registered successfully with id: {}", savedUser.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @Operation(summary = "Login user", description = "Authenticates user and returns JWT tokens in a secure cookie")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<Void> login(
            @RequestBody LoginRequest loginRequest,
            HttpServletRequest request,
            HttpServletResponse response) throws JOSEException, JsonProcessingException {

        logger.info("Login attempt for email: {}", loginRequest.getEmail());

        UserDTO user = userService.getUserByEmail(loginRequest.getEmail());

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            logger.warn("Invalid credentials for email: {}", loginRequest.getEmail());
            throw new BadCredentialsException("Invalid credentials");
        }

        String accessToken = jwtService.generateAccessToken(
                user.getUserId(), user.getEmail(), user.getScopes(), user.getRoles(), 15);

        long initialRefreshTokenMinutes = Duration.ofDays(3).toMinutes();

        String refreshToken = jwtService.generateRefreshToken(
                user.getUserId(), user.getEmail(), user.getScopes(), user.getRoles(), initialRefreshTokenMinutes);

        user.setLastLogin(LocalDateTime.now());
        userService.updateUser(user.getUserId(), user);

        TokenResponse tokenResponse = jwtService.createTokenResponse(
                accessToken, refreshToken, 15, user.getScopes(), user.getRoles());

        String tokensJson = objectMapper.writeValueAsString(tokenResponse);
        String encodedTokens = Base64.getEncoder().encodeToString(tokensJson.getBytes(StandardCharsets.UTF_8));

        String host = request.getHeader("Host");
        String domain = host != null ? host.split(":")[0] : request.getServerName();

        Cookie sessionCookie = new Cookie("tokens", encodedTokens);
        sessionCookie.setPath("/");
        sessionCookie.setHttpOnly(false);
        sessionCookie.setMaxAge(7 * 24 * 60 * 60);
        sessionCookie.setSecure(false);

        if (!domain.equals("localhost") &&
                !domain.equals("127.0.0.1") &&
                !domain.matches("\\d+\\.\\d+\\.\\d+\\.\\d+")) {
            sessionCookie.setDomain(domain);
            logger.info("Login tradizionale - Cookie con domain: {}", domain);
        } else {
            logger.info("Login tradizionale - Cookie senza domain (localhost/IP: {})", domain);
        }

        response.addCookie(sessionCookie);
        logger.info("Login successful for user id: {}", user.getUserId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Logout user", description = "Revokes all refresh tokens for the authenticated user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Logout successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or missing token")
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> forceLogout(@RequestHeader("Authorization") String authHeader) throws JOSEException {
        logger.info("Logout request received");
        String token = authHeader.replace("Bearer ", "");

        JWTClaimsSet claims = jwtService.validateToken(token);
        Long userId = Long.valueOf(claims.getSubject());
        logger.info("Logout for user id: {}", userId);

        List<RefreshToken> refreshTokens = this.refreshTokenRepository.findByUserId(userId);
        for (RefreshToken tokenEntity : refreshTokens) {
            tokenEntity.setRevoked(true);
            refreshTokenRepository.save(tokenEntity);
        }

        logger.info("All tokens revoked for user id: {}", userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Refresh access token", description = "Generates new access and refresh tokens using a valid refresh token")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tokens refreshed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid, revoked or expired refresh token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User associated with token not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Token generation error")
    })
    @PostMapping(value = "/refresh", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> refreshToken(@RequestBody RefreshRequest refreshRequest) {
        logger.info("Token refresh request received");

        RefreshTokenDTO refreshToken = refreshTokenService.findByTokenId(refreshRequest.getRefreshToken());

        if (refreshToken == null) {
            logger.warn("Refresh token not found in database");
            throw new BadCredentialsException("Invalid refresh token");
        }

        if (refreshToken.isRevoked()) {
            logger.warn("Refresh token already revoked for user id: {}", refreshToken.getUserId());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(HttpStatus.UNAUTHORIZED.value(), "Refresh token has been revoked"));
        }

        if (refreshToken.getExpirationDate().isBefore(LocalDateTime.now())) {
            logger.warn("Refresh token expired for user id: {}", refreshToken.getUserId());
            refreshTokenService.findByUserId(refreshToken.getUserId())
                    .forEach(token -> refreshTokenService.revokeToken(token.getTokenId()));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(HttpStatus.UNAUTHORIZED.value(),
                            "SESSION_EXPIRED: Your session has expired. Please login again."));
        }

        LocalDateTime newExpiration = refreshToken.getExpirationDate().minusMinutes(15);

        if (!newExpiration.isAfter(LocalDateTime.now())) {
            logger.warn("Refresh token about to expire for user id: {}", refreshToken.getUserId());
            refreshTokenService.findByUserId(refreshToken.getUserId())
                    .forEach(token -> refreshTokenService.revokeToken(token.getTokenId()));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(HttpStatus.UNAUTHORIZED.value(),
                            "SESSION_EXPIRED: Your session has expired. Please login again."));
        }

        UserDTO user = userService.getUserById(refreshToken.getUserId());
        if (user == null) {
            logger.error("User not found for token user id: {}", refreshToken.getUserId());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(HttpStatus.NOT_FOUND.value(), "User associated with token not found"));
        }

        try {
            String newAccessToken = jwtService.generateAccessToken(
                    user.getUserId(), refreshToken.getEmail(), refreshToken.getScopes(), user.getRoles(), 15);

            long remainingMinutes = Duration.between(LocalDateTime.now(), newExpiration).toMinutes();

            String newRefreshToken = jwtService.generateRefreshToken(
                    user.getUserId(), refreshToken.getEmail(), refreshToken.getScopes(),
                    user.getRoles(), remainingMinutes);

            refreshTokenService.revokeToken(refreshToken.getTokenId());

            RefreshTokenDTO newRefreshTokenDTO = new RefreshTokenDTO();
            newRefreshTokenDTO.setTokenId(newRefreshToken);
            newRefreshTokenDTO.setUserId(user.getUserId());
            newRefreshTokenDTO.setExpirationDate(newExpiration);
            newRefreshTokenDTO.setEmail(refreshToken.getEmail());
            newRefreshTokenDTO.setScopes(refreshToken.getScopes());
            newRefreshTokenDTO.setRoles(user.getRoles());
            newRefreshTokenDTO.setRevoked(false);
            refreshTokenService.save(newRefreshTokenDTO);

            logger.info("Token refresh successful for user id: {}", user.getUserId());
            return ResponseEntity.ok(jwtService.createTokenResponse(
                    newAccessToken, newRefreshToken, 15, refreshToken.getScopes(), user.getRoles()));

        } catch (JOSEException e) {
            logger.error("JWT error during token refresh for user id: {}: {}", user.getUserId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Token generation error"));
        }
    }

    @Operation(summary = "Change user password", description = "Updates the password for a specific user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or empty password"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/changePassword/{userId}")
    public ResponseEntity<?> changePassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {

        logger.info("Change password request for user id: {}", userId);

        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.isBlank()) {
            logger.warn("Change password failed — empty password for user id: {}", userId);
            return ResponseEntity.badRequest().body("La nuova password non può essere vuota.");
        }

        UserDTO user = userService.getUserById(userId);
        if (user == null) {
            logger.warn("Change password failed — user not found for id: {}", userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utente non trovato.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userService.updateUser(userId, user);

        logger.info("Password changed successfully for user id: {}", userId);
        return ResponseEntity.ok("Password aggiornata con successo.");
    }
}