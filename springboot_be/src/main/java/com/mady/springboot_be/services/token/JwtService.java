package com.mady.springboot_be.services.token;

import com.mady.springboot_be.dettails.TokenResponse;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;

/**
 * Service interface for JWT (JSON Web Token) management.
 * 
 * Provides methods for generating access tokens, refresh tokens,
 * token validation, and Google OAuth2 token retrieval.
 * 
 * Uses ECDSA on NIST P-256 curve (ES256) for secure signing.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface JwtService {

    /**
     * Generates a new JWT access token for a user.
     * 
     * @param userId           the user ID
     * @param email            the user's email
     * @param scopes           the OAuth2 scopes
     * @param roles            the user's roles
     * @param expiresInMinutes expiration time in minutes (typically 15)
     * @return the signed JWT as a string
     * @throws JOSEException if signing fails
     */
    String generateAccessToken(Long userId, String clientId, String scopes, String roles, long expiresInMinutes)
            throws JOSEException;

    /**
     * Generates a new refresh token (stored in database).
     * 
     * @param userId           the user ID
     * @param email            the user's email
     * @param scopes           the OAuth2 scopes
     * @param roles            the user's roles
     * @param expiresInMinutes expiration time in minutes (typically 4320 = 3 days)
     * @return the refresh token ID (UUID)
     */
    String generateRefreshToken(Long userId, String clientId, String scopes, String roles, long expiresInDays);

    /**
     * Creates a TokenResponse containing access token and refresh token.
     * 
     * @param accessToken      the JWT access token
     * @param refreshToken     the refresh token ID
     * @param expiresInMinutes access token expiration in minutes
     * @param scopes           the OAuth2 scopes
     * @param roles            the user's roles
     * @return the TokenResponse
     */
    TokenResponse createTokenResponse(String accessToken, String refreshToken, long expiresInMinutes, String scopes,
            String roles);

    /**
     * Validates a JWT token.
     * 
     * Checks signature, expiration, and issuer.
     * 
     * @param token the JWT to validate
     * @return the JWT claims set if valid
     * @throws JOSEException if signature is invalid, token expired, or issuer
     *                       mismatch
     */
    JWTClaimsSet validateToken(String token) throws JOSEException;

    /**
     * Retrieves the Google OAuth2 access token for a user.
     * 
     * @param userId the user ID
     * @return the Google access token, or null if not found
     */
    String getGoogleAccessTokenFromUser(Long userId);
}