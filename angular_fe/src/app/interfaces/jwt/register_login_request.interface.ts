/**
 * @category Interfaces
 * 
 * @fileoverview Payload DTO for user registration or login.
 * Encapsulates the credentials required to authenticate a user
 * via login or registration endpoints.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface RegisterLoginRequest
 * @property {string} email - User's email address used for authentication.
 * @property {string} password - User's password for authentication.
 */
export interface RegisterLoginRequest {
    email: string;
    password: string;
  }