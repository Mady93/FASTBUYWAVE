/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing a user account.
 * Contains authentication, authorization, and account metadata.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface UserDTO
 * @property {number} [userId] - Optional internal unique identifier of the user.
 * @property {string} [userIdGoogle] - Optional Google account identifier for OAuth login.
 * @property {string} email - User's email address, used for login and notifications.
 * @property {string} [password] - Optional password for authentication (hashed in backend).
 * @property {string} roles - User roles (e.g., 'USER', 'ADMIN') defining permissions.
 * @property {string} [scopes] - Optional scopes specifying fine-grained access rights.
 * @property {Date} registrationDate - Datetime when the user registered.
 * @property {Date} lastLogin - Datetime of the last user login.
 * @property {boolean} active - Whether the user account is active.
 */
export interface UserDTO {
    userId?: number;
    userIdGoogle?: string;
    email: string;
    password?: string;
    roles: string;
    scopes?: string;
    registrationDate: Date;
    lastLogin: Date;
    active: boolean;
}