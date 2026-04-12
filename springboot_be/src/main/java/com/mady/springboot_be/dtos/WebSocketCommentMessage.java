package com.mady.springboot_be.dtos;

import java.io.Serializable;

/**
 * WebSocket message DTO for real-time comment notifications.
 * 
 * Used to send comment-related events to connected clients via STOMP protocol.
 * Message types:
 * - NEW_COMMENT: a new root comment was added
 * - NEW_REPLY: a reply to an existing comment was added
 * - UPDATE_COMMENT: a comment was edited
 * - DELETE_COMMENT: a comment was soft-deleted
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class WebSocketCommentMessage implements Serializable {

    private static final long serialVersionUID = 2025042200044L;

    private String type; // "NEW_COMMENT", "NEW_REPLY", "UPDATE_COMMENT", "DELETE_COMMENT"
    private Long advertisementId;
    private CommentTreeDTO comment;
    private Long parentId;
    private Long commentId;

    /**
     * Default constructor.
     */
    public WebSocketCommentMessage() {
    }

    /**
     * Constructs a message for NEW_COMMENT or UPDATE_COMMENT.
     * 
     * @param type            the message type
     * @param advertisementId the ID of the advertisement
     * @param comment         the comment DTO
     */
    public WebSocketCommentMessage(String type, Long advertisementId, CommentTreeDTO comment) {
        this.type = type;
        this.advertisementId = advertisementId;
        this.comment = comment;
    }

    /**
     * Constructs a message for NEW_REPLY.
     * 
     * @param type            the message type
     * @param advertisementId the ID of the advertisement
     * @param comment         the reply comment DTO
     * @param parentId        the ID of the parent comment
     */
    public WebSocketCommentMessage(String type, Long advertisementId, CommentTreeDTO comment, Long parentId) {
        this.type = type;
        this.advertisementId = advertisementId;
        this.comment = comment;
        this.parentId = parentId;
    }

    /**
     * Constructs a message for DELETE_COMMENT.
     * 
     * @param type            the message type
     * @param advertisementId the ID of the advertisement
     * @param commentId       the ID of the deleted comment
     */
    public WebSocketCommentMessage(String type, Long advertisementId, Long commentId) {
        this.type = type;
        this.advertisementId = advertisementId;
        this.commentId = commentId;
    }

    /**
     * Returns the message type.
     * 
     * @return the type
     */
    public String getType() {
        return type;
    }

    /**
     * Sets the message type.
     * 
     * @param type the type to set
     */
    public void setType(String type) {
        this.type = type;
    }

    /**
     * Returns the advertisement ID.
     * 
     * @return the advertisement ID
     */
    public Long getAdvertisementId() {
        return advertisementId;
    }

    /**
     * Sets the advertisement ID.
     * 
     * @param advertisementId the ID to set
     */
    public void setAdvertisementId(Long advertisementId) {
        this.advertisementId = advertisementId;
    }

    /**
     * Returns the comment DTO.
     * 
     * @return the comment
     */
    public CommentTreeDTO getComment() {
        return comment;
    }

    /**
     * Sets the comment DTO.
     * 
     * @param comment the comment to set
     */
    public void setComment(CommentTreeDTO comment) {
        this.comment = comment;
    }

    /**
     * Returns the parent comment ID.
     * 
     * @return the parent comment ID
     */
    public Long getParentId() {
        return parentId;
    }

    /**
     * Sets the parent comment ID.
     * 
     * @param parentId the ID to set
     */
    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    /**
     * Returns the comment ID (used for DELETE_COMMENT).
     * 
     * @return the comment ID
     */
    public Long getCommentId() {
        return commentId;
    }

    /**
     * Sets the comment ID (used for DELETE_COMMENT).
     * 
     * @param commentId the ID to set
     */
    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }
}
