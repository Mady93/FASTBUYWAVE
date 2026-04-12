import { UserProfileDTO } from './user_profile_dto.interface';

/**
 *
 * @category Interfaces
 *
 * @fileoverview Data Transfer Objects (DTOs) for comments and user profiles.
 * Includes comment hierarchy, statistics, and user profile information.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @interface CommentTreeDTO
 * @property {number} [id] - Optional unique identifier for the comment.
 * @property {string} content - The text content of the comment.
 * @property {UserProfileDTO} user - The user who posted the comment.
 * @property {Date} createdAt - Timestamp when the comment was created.
 * @property {Date} [updatedAt] - Optional timestamp when the comment was last updated.
 * @property {number} depthLevel - The nesting level of the comment in the thread.
 * @property {number} directRepliesCount - Number of immediate replies to this comment.
 * @property {number} totalRepliesCount - Total number of replies including nested ones.
 * @property {CommentTreeDTO[]} [children] - Optional array of nested child comments.
 * @property {boolean} [active] - Optional flag indicating if the comment is active or soft-deleted.
 */
export interface CommentTreeDTO {
  id?: number;
  content: string;
  user: UserProfileDTO;
  createdAt: Date;
  updatedAt?: Date;
  depthLevel: number;
  directRepliesCount: number;
  totalRepliesCount: number;
  children?: CommentTreeDTO[];
  active?: boolean;
}
