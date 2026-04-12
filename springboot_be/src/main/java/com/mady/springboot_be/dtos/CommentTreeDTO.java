package com.mady.springboot_be.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.mady.springboot_be.entities.Comment;

/**
 * Data Transfer Object for hierarchical comment tree structure.
 * 
 * Represents a comment with its reply tree using Materialized Path pattern.
 * Contains denormalized counters (directRepliesCount, totalRepliesCount)
 * for efficient querying without counting children each time.
 * 
 * Features:
 * - Hierarchical structure with parent/child relationships
 * - Depth level tracking for indentation in UI
 * - Direct replies count (immediate children)
 * - Total replies count (all descendants)
 * - Recursive soft delete with state propagation
 * 
 * Used for:
 * - Displaying comment threads on advertisement pages
 * - Real-time WebSocket notifications for new comments/replies
 * - Optimized hierarchical queries via LIKE 'rootId.%'
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class CommentTreeDTO implements Serializable {

    private static final long serialVersionUID = 2025042200020L;

    private Long id;
    private String content;
    private UserProfileDTO user;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer depthLevel;
    private Integer directRepliesCount;
    private Integer totalRepliesCount;
    private List<CommentTreeDTO> children = new ArrayList<>();
    private boolean active;

    /**
     * Default constructor.
     */
    public CommentTreeDTO() {
    }

    /**
     * Constructs a CommentTreeDTO from a Comment entity and UserProfileDTO.
     * 
     * @param comment        the Comment entity
     * @param userProfileDTO the user profile DTO
     */
    public CommentTreeDTO(Comment comment, UserProfileDTO userProfileDTO) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.user = userProfileDTO;
        this.createdAt = comment.getCreatedAt();
        this.updatedAt = comment.getUpdatedAt();
        this.depthLevel = comment.getDepthLevel();
        this.directRepliesCount = comment.getDirectRepliesCount();
        this.totalRepliesCount = comment.getTotalRepliesCount();
        this.active = comment.isActive();
    }

    /**
     * Returns the comment ID.
     * 
     * @return the comment ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the comment ID.
     * 
     * @param id the comment ID to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Returns the comment content.
     * 
     * @return the content
     */
    public String getContent() {
        return content;
    }

    /**
     * Sets the comment content.
     * 
     * @param content the content to set
     */
    public void setContent(String content) {
        this.content = content;
    }

    /**
     * Returns the user profile who wrote the comment.
     * 
     * @return the user profile DTO
     */
    public UserProfileDTO getUser() {
        return user;
    }

    /**
     * Sets the user profile.
     * 
     * @param user the user profile to set
     */
    public void setUser(UserProfileDTO user) {
        this.user = user;
    }

    /**
     * Returns the creation timestamp.
     * 
     * @return the creation timestamp
     */
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Sets the creation timestamp.
     * 
     * @param createdAt the timestamp to set
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Returns the last update timestamp.
     * 
     * @return the update timestamp
     */
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    /**
     * Sets the last update timestamp.
     * 
     * @param updatedAt the timestamp to set
     */
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Returns the depth level in the comment tree.
     * Root comments have depth 0, replies have depth 1, etc.
     * 
     * @return the depth level
     */
    public Integer getDepthLevel() {
        return depthLevel;
    }

    /**
     * Sets the depth level.
     * 
     * @param depthLevel the depth level to set
     */
    public void setDepthLevel(Integer depthLevel) {
        this.depthLevel = depthLevel;
    }

    /**
     * Returns the number of direct replies (immediate children).
     * 
     * @return the direct replies count
     */
    public Integer getDirectRepliesCount() {
        return directRepliesCount;
    }

    /**
     * Sets the number of direct replies.
     * 
     * @param directRepliesCount the count to set
     */
    public void setDirectRepliesCount(Integer directRepliesCount) {
        this.directRepliesCount = directRepliesCount;
    }

    /**
     * Returns the total number of replies (all descendants).
     * 
     * @return the total replies count
     */
    public Integer getTotalRepliesCount() {
        return totalRepliesCount;
    }

    /**
     * Sets the total number of replies.
     * 
     * @param totalRepliesCount the count to set
     */
    public void setTotalRepliesCount(Integer totalRepliesCount) {
        this.totalRepliesCount = totalRepliesCount;
    }

    /**
     * Returns the list of child comments (replies).
     * 
     * @return the children list
     */
    public List<CommentTreeDTO> getChildren() {
        return children;
    }

    /**
     * Sets the list of child comments.
     * 
     * @param children the list of children to set
     */
    public void setChildren(List<CommentTreeDTO> children) {
        this.children = children;
    }

    /**
     * Returns whether the comment is active (not soft-deleted).
     * 
     * @return true if active, false otherwise
     */
    public boolean getActive() {
        return active;
    }

    /**
     * Sets the active status of the comment.
     * 
     * @param active the active status to set
     */
    public void setActive(boolean active) {
        this.active = active;
    }
}
