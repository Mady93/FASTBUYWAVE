/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) for sending a like/unlike action.
 * Represents a user's action to like or unlike a specific entity, such as an advertisement or product.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface LikeRequestDTO
 * @property {boolean} liked - True if the user likes the entity; false if the user removes the like.
 */
export interface LikeRequestDTO {
 liked: boolean;
}