/**
 * @category Interfaces
 * 
 * @fileoverview DTO representing user information extracted from a JWT or session.
 * Contains basic identity and authorization details of the user,
 * typically decoded from a token or session payload.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface UserInfo
 * @property {string} userId - Unique identifier of the user.
 * @property {string} email - Email address of the user.
 * @property {string[]} roles - Array of roles assigned to the user.
 * @property {string[]} scopes - Array of permission scopes granted to the user.
 */
export interface UserInfo {
  userId: string;
  email: string;
  roles: string[];
  scopes: string[];
}