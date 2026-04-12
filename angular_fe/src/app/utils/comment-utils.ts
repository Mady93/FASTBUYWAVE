import { CommentTreeDTO } from '../interfaces/dtos/comment/comment_dto';

/**
 * @category Utils
 * 
 * @description Recursively searches for a comment by its ID within a comment tree.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param id - The ID of the comment to find.
 * @param comments - An array of comments representing the comment tree.
 * @returns The comment with the matching ID, or `undefined` if not found.
 *
 * @example
 * const comment = findCommentById(42, commentTree);
 */
export function findCommentById(
  id: number,
  comments: CommentTreeDTO[],
): CommentTreeDTO | undefined {
  for (const comment of comments) {
    if (comment.id === id) return comment;
    if (comment.children?.length) {
      const found = findCommentById(id, comment.children);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * @category Utils
 * 
 * @description Finds the parent of a comment in a nested comment tree.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param commentId - The ID of the comment whose parent is sought.
 * @param comments - The array of comments representing the tree.
 * @param parent - The parent node in the current recursion (default `null`).
 * @returns The parent comment if found, or `null` if the comment has no parent or is not found.
 *
 * @example
 * const parent = findParent(42, commentTree);
 */
export function findParent(
  commentId: number,
  comments: CommentTreeDTO[],
  parent: CommentTreeDTO | null = null,
): CommentTreeDTO | null {
  for (const comment of comments) {
    if (comment.id === commentId) return parent;
    if (comment.children?.length) {
      const result = findParent(commentId, comment.children, comment);
      if (result) return result;
    }
  }
  return null;
}

/**
 * @category Utils
 * 
 * @description Computes the depth of a comment within a nested comment tree.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param comments - The array of comments representing the tree.
 * @param targetId - The ID of the comment whose depth is calculated.
 * @param level - The current depth level during recursion (default `0`).
 * @returns The depth level of the comment, or `-1` if not found.
 *
 * @example
 * const depth = getCommentDepth(commentTree, 42); // → 2
 */
export function getCommentDepth(
  comments: CommentTreeDTO[],
  targetId: number,
  level = 0,
): number {
  for (const comment of comments) {
    if (comment.id === targetId) return level;
    if (comment.children?.length) {
      const found = getCommentDepth(comment.children, targetId, level + 1);
      if (found !== -1) return found;
    }
  }
  return -1;
}

/**
 * @category Utils
 * 
 * @description Checks if a comment has reached the maximum allowed depth in the tree.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 *
 * @param comments - The array of comments representing the tree.
 * @param id - The ID of the comment to check.
 * @param maxDepth - Optional maximum depth (default `10`).
 * @returns `true` if the comment's depth is greater than or equal to the maximum depth.
 *
 * @example
 * const reached = isMaxDepthReached(commentTree, 42); // → true or false
 */
export function isMaxDepthReached(
  comments: CommentTreeDTO[],
  id: number,
  maxDepth: number = 10,
): boolean {
  return getCommentDepth(comments, id) >= maxDepth;
}