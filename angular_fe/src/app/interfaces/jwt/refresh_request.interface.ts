/**
 * @category Interfaces
 * 
 * @fileoverview Payload DTO for requesting a new access token using a refresh token.
 * Encapsulates the refresh token issued to the user for obtaining a new access token.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface RefreshRequest
 * @property {string} refreshToken - The refresh token provided to the user for re-authentication.
 */
export interface RefreshRequest {
    refreshToken: string;
  }