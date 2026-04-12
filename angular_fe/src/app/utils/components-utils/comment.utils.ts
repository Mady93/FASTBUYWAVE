import { CommentTreeDTO } from 'src/app/interfaces/dtos/comment/comment_dto';

/**
 * @category Utils
 * 
 * @description Recursively searches the comment tree to find a comment by its ID.
 * Used in: startEdit(), getParentOf()
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param commentId - The ID of the comment to search for.
 * @param comments - The array of comments to search through.
 * @returns The comment matching the ID, or null if not found.
 *
 * @example
 * const comment = findCommentById(42, commentsTree);
 */
export function findCommentById(
  commentId: number,
  comments: CommentTreeDTO[],
): CommentTreeDTO | null {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }
    if (comment.children && comment.children.length > 0) {
      const found = findCommentById(commentId, comment.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * @category Utils
 * 
 * @description Recursively finds the parent of a given comment.
 * Used in: getParentOf()
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param commentId - The ID of the comment whose parent is being searched.
 * @param comments - The array of comments to search through.
 * @param parent - The current parent during recursion (default: null).
 * @returns The parent comment, or null if not found.
 *
 * @example
 * const parent = findParent(42, commentsTree);
 */
export function findParent(
  commentId: number,
  comments: CommentTreeDTO[],
  parent: CommentTreeDTO | null = null,
): CommentTreeDTO | null {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return parent;
    }
    if (comment.children && comment.children.length > 0) {
      const found = findParent(commentId, comment.children, comment);
      if (found) return found;
    }
  }
  return null;
}

/**
 * @category Utils
 * 
 * @description Checks if a comment has reached the maximum allowed nesting depth.
 * Used in: toggleReply()
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param comments - The array of comments to search through.
 * @param commentId - The ID of the comment to check.
 * @param maxDepth - The maximum allowed depth (default: 10).
 * @returns True if the comment has reached or exceeded the maximum depth, false otherwise.
 *
 * @example
 * if (isMaxDepthReached(commentsTree, 42)) { ... }
 */
export function isMaxDepthReached(
  comments: CommentTreeDTO[],
  commentId: number,
  maxDepth: number = 10,
): boolean {
  const comment = findCommentById(commentId, comments);
  if (!comment) return false;
  return comment.depthLevel >= maxDepth;
}

/**
 * @category Utils
 * 
 * @description Counts all active descendants of a comment recursively.
 * Optional utility for services to avoid duplicating logic.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param comment - The comment whose descendants are counted.
 * @returns The number of active descendant comments.
 *
 * @example
 * const totalDescendants = countAllDescendants(comment);
 */
export function countAllDescendants(comment: CommentTreeDTO): number {
  if (!comment.children || comment.children.length === 0) {
    return 0;
  }

  let count = 0;
  for (const child of comment.children) {
    if (child.active !== false) {
      count += 1 + countAllDescendants(child);
    }
  }

  return count;
}

/**
 * @category Utils
 * 
 * @description Checks if a specific user has replied to a comment.
 * Optional utility to use instead of component-level logic.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param comment - The comment to inspect.
 * @param userId - The ID of the user to check for replies.
 * @returns True if the user has replied, false otherwise.
 *
 * @example
 * const hasReplied = hasUserRepliedToComment(comment, userId);
 */
export function hasUserRepliedToComment(
  comment: CommentTreeDTO,
  userId: number,
): boolean {
  if (!comment.children || comment.children.length === 0) {
    return false;
  }

  return comment.children.some(
    (child) => child.active !== false && child.user.userId === userId,
  );
}

/**
 * @category Utils
 * 
 * @description Validates the structure of a comment object.
 * Useful for debugging and backend data validation.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param comment - The object to validate.
 * @returns True if the object conforms to CommentTreeDTO, false otherwise.
 *
 * @example
 * if (validateComment(obj)) { ... }
 */
export function validateComment(comment: any): comment is CommentTreeDTO {
  return (
    comment !== null &&
    typeof comment === 'object' &&
    typeof comment.content === 'string' &&
    typeof comment.user === 'object' &&
    typeof comment.user.userId === 'number' &&
    typeof comment.depthLevel === 'number'
  );
}
