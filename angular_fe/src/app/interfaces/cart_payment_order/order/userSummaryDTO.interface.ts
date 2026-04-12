/**
 * @category Interfaces
 * 
 * @description Represents a summary of a user, typically used in orders or other references
 *              where full user details are not required. Contains basic identifiers, email, 
 *              and roles assigned to the user.
 * 
 * @property {number} userId - Unique identifier of the user.
 * @property {string} email - Email address of the user.
 * @property {string} roles - Roles assigned to the user (e.g., "ADMIN", "CUSTOMER").
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
export interface UserSummaryDTO {
  userId: number;
  email: string;
  roles: string;
}