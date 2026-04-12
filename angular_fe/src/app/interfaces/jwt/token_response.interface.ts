/**
 * @category Interfaces
 * 
 * @fileoverview DTO representing a token response from the backend.
 * Contains access and optional refresh tokens, expiration information,
 * and associated user authorization details such as roles and scopes.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface TokenResponse
 * @property {string} accessToken - JWT access token for authenticating API requests.
 * @property {string} [refreshToken] - Optional refresh token to obtain a new access token.
 * @property {number} expiresIn - Lifetime of the access token in seconds.
 * @property {string[]} [scopes] - Optional list of scopes granted to the token.
 * @property {string[]} [roles] - Optional list of user roles associated with the token.
 */
export interface TokenResponse {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    scopes?: string[];
    roles?: string[];
}