package com.mady.springboot_be.services;

import java.util.List;

import com.mady.springboot_be.dtos.CommentTreeDTO;

/**
 * Service interface for comment management operations.
 * 
 * Defines methods for creating, reading, updating, and deleting comments
 * on advertisements. Supports hierarchical comment trees with Materialized Path
 * pattern.
 * 
 * Features:
 * - Root comment creation on advertisements
 * - Reply creation to existing comments
 * - Comment update with content modification
 * - Recursive soft delete with state propagation to descendants
 * - Hierarchical comment tree retrieval optimized via LIKE queries
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface CommentService {

   /**
    * Retrieves the complete comment tree for an advertisement.
    * 
    * @param advertisementId the ID of the advertisement
    * @return list of root comments with their reply trees
    */
   List<CommentTreeDTO> getCommentsTree(Long advertisementId);

   /**
    * Creates a new root comment on an advertisement.
    * 
    * @param advertisementId the ID of the advertisement
    * @param content         the comment content
    * @param userId          the ID of the user creating the comment
    * @return the created CommentTreeDTO
    */
   CommentTreeDTO createRootComment(Long advertisementId, String content, Long userId);

   /**
    * Creates a reply to an existing comment.
    * 
    * @param parentId the ID of the parent comment
    * @param content  the reply content
    * @param userId   the ID of the user creating the reply
    * @return the created CommentTreeDTO
    */
   CommentTreeDTO createReply(Long parentId, String content, Long userId);

   /**
    * Updates an existing comment's content.
    * 
    * @param commentId  the ID of the comment to update
    * @param newContent the new content
    * @param userId     the ID of the user (for authorization)
    * @return the updated CommentTreeDTO
    */
   CommentTreeDTO updateComment(Long commentId, String newContent, Long userId);

   /**
    * Soft deletes a comment and all its replies recursively.
    * 
    * @param commentId the ID of the comment to delete
    * @param userId    the ID of the user (for authorization)
    */
   void deleteComment(Long commentId, Long userId);
}
