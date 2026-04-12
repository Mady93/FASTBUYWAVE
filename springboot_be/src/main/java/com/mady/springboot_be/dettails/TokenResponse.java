package com.mady.springboot_be.dettails;

/**
 * JWT token response wrapper containing access and refresh tokens.
 * 
 * This class encapsulates the token response after successful authentication
 * (traditional login or Google OAuth2) or token refresh operation.
 * 
 * Token details:
 * - Access Token: Short-lived (15 minutes) JWT used for API authorization
 * - Refresh Token: Long-lived (3 days) JWT used to obtain new access tokens
 * - Token Type: Always "Bearer" for Authorization header usage
 * 
 * The tokens are signed using ECDSA on NIST P-256 curve (ES256) with
 * external PEM public/private keys.
 * 
 * Usage in Authorization header:
 * {@code
 * Authorization: Bearer <accessToken>
 * }
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private String scope;
    private String roles;

    /**
     * Default constructor.
     */
    public TokenResponse() {
    }

    /**
     * Constructs a TokenResponse with all fields.
     * 
     * @param accessToken  JWT access token (15 minutes validity)
     * @param refreshToken JWT refresh token (3 days validity)
     * @param tokenType    token type, always "Bearer"
     * @param expiresIn    expiration time in seconds
     * @param scope        token scope (e.g., "read", "write")
     * @param roles        user roles (e.g., "USER", "ADMIN")
     */
    public TokenResponse(String accessToken, String refreshToken, String tokenType, long expiresIn, String scope,
            String roles) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.scope = scope;
        this.roles = roles;
    }

    /**
     * Returns the access token.
     * 
     * @return JWT access token string
     */
    public String getAccessToken() {
        return accessToken;
    }

    /**
     * Sets the access token.
     * 
     * @param accessToken JWT access token string to set
     */
    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    /**
     * Returns the refresh token.
     * 
     * @return JWT refresh token string
     */
    public String getRefreshToken() {
        return refreshToken;
    }

    /**
     * Sets the refresh token.
     * 
     * @param refreshToken JWT refresh token string to set
     */
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    /**
     * Returns the token type.
     * 
     * @return token type (always "Bearer")
     */
    public String getTokenType() {
        return tokenType;
    }

    /**
     * Sets the token type.
     * 
     * @param tokenType token type to set (should be "Bearer")
     */
    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    /**
     * Returns the expiration time in seconds.
     * 
     * @return expiration time (typically 900 seconds = 15 minutes for access token)
     */
    public long getExpiresIn() {
        return expiresIn;
    }

    /**
     * Sets the expiration time in seconds.
     * 
     * @param expiresIn expiration time to set (e.g., 900 for 15 minutes)
     */
    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    /**
     * Returns the token scope.
     * 
     * @return scope string (e.g., "read", "write")
     */
    public String getScope() {
        return scope;
    }

    /**
     * Sets the token scope.
     * 
     * @param scope the scope to set (e.g., "read", "write")
     */
    public void setScope(String scope) {
        this.scope = scope;
    }

    /**
     * Returns the user roles associated with the token.
     * 
     * @return roles string (e.g., "USER", "ADMIN")
     */
    public String getRoles() {
        return roles;
    }

    /**
     * Sets the user roles associated with the token.
     * 
     * @param roles the roles to set (e.g., "USER", "ADMIN")
     */
    public void setRoles(String roles) {
        this.roles = roles;
    }

    /**
     * Returns a string representation of the TokenResponse.
     * 
     * @return string with all token fields
     */
    @Override
    public String toString() {
        return "TokenResponse{" +
                "accessToken='" + accessToken + '\'' +
                ", refreshToken='" + refreshToken + '\'' +
                ", tokenType='" + tokenType + '\'' +
                ", expiresIn=" + expiresIn +
                ", scope='" + scope + '\'' +
                ", roles='" + roles + '\'' +
                '}';
    }
}
