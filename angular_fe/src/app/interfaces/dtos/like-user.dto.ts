/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing a user who liked an item.
 * Includes the user's ID, email, and the timestamp when the like was made.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface LikeUserDTO
 * @property {number} userId - Unique identifier of the user.
 * @property {string} email - Email of the user who liked the item.
 * @property {string} likedAt - ISO datetime string when the like occurred.
 */
export interface LikeUserDTO {
  userId: number;
  email: string;
  likedAt: string;
}