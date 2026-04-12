package com.mady.springboot_be.controllers;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mady.springboot_be.dettails.TokenResponse;
import com.mady.springboot_be.dtos.RefreshTokenDTO;
import com.mady.springboot_be.dtos.UserDTO;
import com.mady.springboot_be.entities.RefreshToken;
import com.mady.springboot_be.repositories.RefreshTokenRepository;
import com.mady.springboot_be.services_impl.UserServiceImpl;
import com.mady.springboot_be.services_impl.token.JwtServiceImpl;
import com.mady.springboot_be.services_impl.token.RefreshTokenServiceImpl;
import com.mady.springboot_be.support.RefreshRequest;
import com.mady.springboot_be.utils.Secret;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.mady.springboot_be.dettails.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for Google OAuth2 authentication.
 * 
 * Supports Google OAuth2 login flow, callback handling, user creation/update,
 * logout, and token refresh. Uses JWT with ECDSA signatures (ES256) and
 * stores refresh tokens in database with 3-day expiration.
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/oauth2")
@Tag(name = "Google OAuth2 Authentication", description = "Endpoints for Google OAuth2 login, callback, logout and token refresh")
public class GoogleAuthController {

    private static final Logger logger = LoggerFactory.getLogger(GoogleAuthController.class);

    private final JwtServiceImpl jwtService;
    private final UserServiceImpl userService;
    private final RefreshTokenServiceImpl refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public GoogleAuthController(JwtServiceImpl jwtService, UserServiceImpl userService,
            RefreshTokenServiceImpl refreshTokenService, RefreshTokenRepository refreshTokenRepository,
            ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.objectMapper = objectMapper;
    }

    @Operation(summary = "Initiate Google OAuth2 login", description = "Redirects user to Google's authorization page")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "303", description = "Redirect to Google authorization")
    })
    @GetMapping("/login")
    public RedirectView login() throws Exception {
        logger.info("Google OAuth login initiated");
        String clientId = Secret.CLIENT_ID;
        String redirectUri = Secret.REDIRECT_URI;
        String scope = Secret.SCOPE;
        String authUrl = Secret.AUTH_URL +
                "scope=" + URLEncoder.encode(scope, "UTF-8") +
                "&access_type=offline" +
                "&include_granted_scopes=true" +
                "&response_type=code" +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, "UTF-8") +
                "&client_id=" + clientId +
                "&prompt=consent";

        logger.info("Redirecting to Google authorization URL");
        RedirectView redirectView = new RedirectView(authUrl);
        redirectView.setStatusCode(HttpStatusCode.valueOf(303));
        return redirectView;
    }

    @Operation(summary = "Google OAuth2 callback", description = "Handles the OAuth callback from Google, exchanges code for tokens, and creates/updates user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "303", description = "Redirect to frontend with tokens in cookie"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Authorization code missing"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Authentication failed")
    })
    @GetMapping("/callback")
    public RedirectView callback(HttpServletRequest request, HttpServletResponse response) {
        try {
            String code = request.getParameter("code");
            logger.info("OAuth callback received with authorization code");

            if (code == null || code.isEmpty()) {
                throw new RuntimeException("Authorization code is missing");
            }

            String clientId = Secret.CLIENT_ID;
            String clientSecret = Secret.CLIENT_SECRET;
            String redirectUri = Secret.REDIRECT_URI;
            String tokenUrl = Secret.TOKEN_URL;

            String requestBody = "code=" + code +
                    "&client_id=" + clientId +
                    "&client_secret=" + clientSecret +
                    "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                    "&grant_type=authorization_code";

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map<String, Object>> tokenResponse = restTemplate.exchange(
                    tokenUrl, HttpMethod.POST, entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            Map<String, Object> tokenData = tokenResponse.getBody();
            if (tokenData == null) {
                throw new RuntimeException("Failed to receive token response from Google");
            }

            String accessToken = (String) tokenData.get("access_token");
            if (accessToken == null || accessToken.isEmpty()) {
                throw new RuntimeException("Access token not found in Google response");
            }

            Map<String, Object> userInfo = getUserInfo(accessToken);
            if (userInfo == null) {
                throw new RuntimeException("Failed to receive user information from Google");
            }

            String googleId = (String) userInfo.get("sub");
            String email = (String) userInfo.get("email");

            if (googleId == null || email == null) {
                throw new RuntimeException("User ID or email not found in Google response");
            }

            logger.info("Google OAuth user identified: {}", email);

            ResponseEntity<UserDTO> userResponse = this.createUser(googleId, email, accessToken);
            UserDTO user = userResponse.getBody();
            if (user == null) {
                throw new RuntimeException("Failed to create or update user");
            }

            UserDTO completeUser = userService.getUserByEmail(email);
            if (completeUser == null) {
                throw new RuntimeException("User not found after creation");
            }

            ResponseEntity<TokenResponse> jwtResponse = generateTokenResponse(completeUser);
            TokenResponse tokens = jwtResponse.getBody();
            if (tokens == null) {
                throw new RuntimeException("Failed to generate JWT tokens");
            }

            String tokensJson = objectMapper.writeValueAsString(tokens);
            String encodedTokens = Base64.getEncoder().encodeToString(tokensJson.getBytes(StandardCharsets.UTF_8));

            Cookie sessionCookie = new Cookie("tokens", encodedTokens);
            sessionCookie.setPath("/");
            sessionCookie.setHttpOnly(false);
            sessionCookie.setMaxAge(30000);
            sessionCookie.setSecure(false);
            sessionCookie.setDomain(Secret.DOMAIN);
            response.addCookie(sessionCookie);

            logger.info("OAuth login successful for user: {}", email);

            RedirectView redirectView = new RedirectView(Secret.REDIRECT_URL, true);
            redirectView.setExposeModelAttributes(false);
            redirectView.setStatusCode(HttpStatus.SEE_OTHER);
            redirectView.setContentType("application/json");
            return redirectView;

        } catch (JsonProcessingException e) {
            logger.error("JSON serialization error during OAuth callback: {}", e.getMessage(), e);
            String errorUrl = buildErrorUrl("JSON processing error");
            RedirectView errorRedirect = new RedirectView(errorUrl);
            errorRedirect.setStatusCode(HttpStatusCode.valueOf(303));
            return errorRedirect;
        } catch (JOSEException e) {
            logger.error("JWT generation error during OAuth callback: {}", e.getMessage(), e);
            String errorUrl = buildErrorUrl("Token generation error");
            RedirectView errorRedirect = new RedirectView(errorUrl);
            errorRedirect.setStatusCode(HttpStatusCode.valueOf(303));
            return errorRedirect;
        } catch (RestClientException e) {
            logger.error("Google API error during OAuth callback: {}", e.getMessage(), e);
            String errorUrl = buildErrorUrl(e.getMessage());
            RedirectView errorRedirect = new RedirectView(errorUrl);
            errorRedirect.setStatusCode(HttpStatusCode.valueOf(303));
            return errorRedirect;
        } catch (RuntimeException e) {
            logger.error("OAuth callback error: {}", e.getMessage(), e);
            String errorUrl = buildErrorUrl(e.getMessage());
            RedirectView errorRedirect = new RedirectView(errorUrl);
            errorRedirect.setStatusCode(HttpStatusCode.valueOf(303));
            return errorRedirect;
        }
    }

    private String buildErrorUrl(String message) {
        String errorMessage = message != null ? message : "Unknown error";
        try {
            return Secret.REDIRECT_URL_ERROR + "auth/error?message="
                    + URLEncoder.encode(errorMessage, StandardCharsets.UTF_8);
        } catch (Exception ex) {
            return Secret.REDIRECT_URL_ERROR + "auth/error?message=Error+during+authentication";
        }
    }

    private Map<String, Object> getUserInfo(String accessToken) {
        if (accessToken == null || accessToken.isEmpty()) {
            throw new IllegalArgumentException("Access token cannot be null or empty");
        }

        logger.info("Fetching user info from Google");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        RestTemplate restTemplate = new RestTemplate();

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    Secret.URL, HttpMethod.GET, entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            Map<String, Object> userData = response.getBody();
            if (userData == null) {
                throw new RuntimeException("No response received from Google user info endpoint");
            }

            logger.info("User info retrieved for email: {}", userData.get("email"));
            return userData;

        } catch (RestClientException e) {
            logger.error("Failed to fetch user info from Google: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch user info from Google: " + e.getMessage(), e);
        }
    }

    @Operation(summary = "Create or update OAuth user", description = "Internal method to create or update user from Google OAuth data")
    public ResponseEntity<UserDTO> createUser(String googleId, String email, String googleAccessToken) {
        logger.info("Creating or updating OAuth user for email: {}", email);
        UserDTO existingUser = userService.getUserByEmail(email);

        if (existingUser == null) {
            logger.info("New user — creating account for email: {}", email);
            existingUser = new UserDTO(googleId, email, "USER", "default",
                    LocalDateTime.now(), LocalDateTime.now(), true, googleAccessToken);
            this.userService.createOAuthUser(existingUser);

        } else if (existingUser.getUserIdGoogle() == null) {
            logger.info("Existing user without Google ID — updating for email: {}", email);
            existingUser.setUserIdGoogle(googleId);
            existingUser.setLastLogin(LocalDateTime.now());
            this.userService.createOAuthUser(existingUser);

        } else if (existingUser.getUserIdGoogle().equals(googleId)) {
            logger.info("Existing Google user — updating last login for email: {}", email);
            existingUser.setLastLogin(LocalDateTime.now());
            this.userService.createOAuthUser(existingUser);

        } else {
            logger.warn("Email {} already in use with a different Google account", email);
            throw new RuntimeException("Email is already in use with a different Google account.");
        }

        return ResponseEntity.ok().body(existingUser);
    }

    @Operation(summary = "Generate JWT tokens for user", description = "Internal method to generate access and refresh tokens")
    public ResponseEntity<TokenResponse> generateTokenResponse(UserDTO user) throws JOSEException {
        logger.info("Generating JWT tokens for user id: {}", user.getUserId());
        String newAccessToken = this.jwtService.generateAccessToken(
                user.getUserId(), user.getEmail(), user.getScopes(), user.getRoles(), 15);

        long initialRefreshTokenMinutes = Duration.ofDays(3).toMinutes();

        String refreshToken = this.jwtService.generateRefreshToken(
                user.getUserId(), user.getEmail(), user.getScopes(), user.getRoles(), initialRefreshTokenMinutes);

        logger.info("JWT tokens generated successfully for user id: {}", user.getUserId());
        return ResponseEntity.ok(this.jwtService.createTokenResponse(
                newAccessToken, refreshToken, 15, user.getScopes(), user.getRoles()));
    }

    @Operation(summary = "Logout user", description = "Revokes all refresh tokens for the authenticated user")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Successfully logged out"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid or missing token")
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> forceLogout(@RequestHeader("Authorization") String authHeader) throws JOSEException {
        logger.info("OAuth logout request received");
        String token = authHeader.replace("Bearer ", "");

        JWTClaimsSet claims = jwtService.validateToken(token);
        Long userId = Long.valueOf(claims.getSubject());
        logger.info("Revoking all tokens for user id: {}", userId);

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
        logger.info("OAuth token refresh request received");

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

            logger.info("OAuth token refresh successful for user id: {}", user.getUserId());
            return ResponseEntity.ok(jwtService.createTokenResponse(
                    newAccessToken, newRefreshToken, 15, refreshToken.getScopes(), user.getRoles()));

        } catch (JOSEException e) {
            logger.error("JWT error during OAuth token refresh for user id: {}: {}", user.getUserId(), e.getMessage(),
                    e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Token generation error"));
        }
    }
}