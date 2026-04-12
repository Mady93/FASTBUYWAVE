package com.mady.springboot_be.services;

import com.mady.springboot_be.dtos.CommentTreeDTO;

/**
 * Service interface for WebSocket-based real-time comment notifications.
 * 
 * Uses STOMP protocol over WebSocket to push live updates to connected clients.
 * Notifications are sent to topic:
 * /topic/advertisement/{advertisementId}/comments
 * 
 * Notification types:
 * - NEW_COMMENT: a new root comment was added
 * - NEW_REPLY: a reply to an existing comment was added
 * - UPDATE_COMMENT: a comment was edited
 * - DELETE_COMMENT: a comment was soft-deleted
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface WebSocketCommentService {

    /**
     * Notifies all clients about a new root comment.
     * 
     * @param advertisementId the ID of the advertisement
     * @param comment         the newly created comment DTO
     */
    public void notifyNewComment(Long advertisementId, CommentTreeDTO comment);

    /**
     * Notifies all clients about a new reply to an existing comment.
     * 
     * @param parentId the ID of the parent comment
     * @param reply    the newly created reply DTO
     */
    public void notifyNewReply(Long parentId, CommentTreeDTO reply);

    /**
     * Notifies all clients about an updated comment.
     * 
     * @param updatedComment the updated comment DTO
     */
    public void notifyCommentUpdated(CommentTreeDTO updatedComment);

    /**
     * Notifies all clients about a deleted comment.
     * 
     * @param commentId       the ID of the deleted comment
     * @param advertisementId the ID of the advertisement
     */
    public void notifyCommentDeleted(Long commentId, Long advertisementId);
}
