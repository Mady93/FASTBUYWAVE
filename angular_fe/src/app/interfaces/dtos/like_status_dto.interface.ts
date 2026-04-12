/**
 * @category Interfaces
 * 
 * @fileoverview Data Transfer Object (DTO) representing the like status of an advertisement.
 * Contains the ID of the advertisement and whether it has been liked by the user.
 * 
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface LikeStatusDTO
 * @property {number} advertisementId - Unique identifier of the advertisement.
 * @property {boolean} liked - True if the user has liked the advertisement; false otherwise.
 */
export interface LikeStatusDto {
    advertisementId: number;
    liked: boolean;
}