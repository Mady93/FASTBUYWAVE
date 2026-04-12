package com.mady.springboot_be.services_impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mady.springboot_be.dtos.CommentTreeDTO;
import com.mady.springboot_be.dtos.UserProfileDTO;
import com.mady.springboot_be.entities.Advertisement;
import com.mady.springboot_be.entities.Comment;
import com.mady.springboot_be.entities.Profile;
import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.AdvertisementRepository;
import com.mady.springboot_be.repositories.CommentRepository;
import com.mady.springboot_be.repositories.ProfileRepository;
import com.mady.springboot_be.repositories.UserRepository;
import com.mady.springboot_be.services.CommentService;
import com.mady.springboot_be.services.WebSocketCommentService;

import jakarta.persistence.EntityNotFoundException;

/**
 * Implementation of CommentService for comment management.
 * 
 * Handles hierarchical comment operations using Materialized Path pattern:
 * - treePath: dot-separated path (e.g., "1.5.12") for efficient tree queries
 * - depthLevel: comment depth for UI indentation
 * - denormalized counters: directRepliesCount, totalRepliesCount
 * 
 * Features:
 * - Recursive soft delete with state propagation to descendants
 * - Automatic counter updates on parent comments
 * - WebSocket notifications for real-time UI updates
 * - User profile validation before comment creation
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final ProfileRepository profileRepository;
    private final AdvertisementRepository advertisementRepository;
    private final UserRepository userRepository;
    private final WebSocketCommentService webSocketCommentService;

    private static final Logger logger = LoggerFactory.getLogger(CommentServiceImpl.class);

    /**
     * Constructs a new CommentServiceImpl with required dependencies.
     * 
     * @param commentRepository       repository for Comment entity operations
     * @param profileRepository       repository for Profile entity operations
     * @param advertisementRepository repository for Advertisement entity operations
     * @param userRepository          repository for User entity operations
     * @param webSocketCommentService service for WebSocket notifications
     */
    @Autowired
    public CommentServiceImpl(CommentRepository commentRepository,
            ProfileRepository profileRepository,
            AdvertisementRepository advertisementRepository,
            UserRepository userRepository,
            WebSocketCommentServiceImpl webSocketCommentService) {
        this.commentRepository = commentRepository;
        this.profileRepository = profileRepository;
        this.advertisementRepository = advertisementRepository;
        this.userRepository = userRepository;
        this.webSocketCommentService = webSocketCommentService;
    }

    @Transactional(readOnly = true)
    @Override
    public List<CommentTreeDTO> getCommentsTree(Long advertisementId) {
        // Carica solo i commenti attivi
        List<Comment> allComments = commentRepository
                .findByAdvertisementIdOrderByTreePathCreatedAt(advertisementId);

        // Filter active comments only
        List<Comment> activeComments = allComments.stream()
                .filter(Comment::isActive)
                .collect(Collectors.toList());

        Map<Long, CommentTreeDTO> dtoMap = new HashMap<>();
        List<CommentTreeDTO> roots = new ArrayList<>();

        for (Comment comment : activeComments) {
            UserProfileDTO userProfileDTO = getUserProfileDTO(comment.getUser());
            CommentTreeDTO dto = new CommentTreeDTO(comment, userProfileDTO);
            dtoMap.put(comment.getId(), dto);

            if (comment.isRootComment()) {
                roots.add(dto);
            } else {
                // Add only if parent exists and is active
                CommentTreeDTO parentDto = dtoMap.get(comment.getParent().getId());
                if (parentDto != null) {
                    parentDto.getChildren().add(dto);
                    // Update parent counters
                    updateParentCountersInDTO(parentDto);
                }
            }
        }

        return roots;
    }

    /**
     * Updates counter fields in a DTO based on active children.
     * 
     * @param parent the parent comment DTO
     */
    private void updateParentCountersInDTO(CommentTreeDTO parent) {
        if (parent.getChildren() == null || parent.getChildren().isEmpty()) {
            parent.setDirectRepliesCount(0);
            parent.setTotalRepliesCount(0);
            return;
        }

        List<CommentTreeDTO> activeChildren = parent.getChildren().stream()
                .filter(CommentTreeDTO::getActive)
                .collect(Collectors.toList());

        parent.setDirectRepliesCount(activeChildren.size());

        int totalReplies = activeChildren.size();
        for (CommentTreeDTO child : activeChildren) {
            totalReplies += countDescendants(child);
        }

        parent.setTotalRepliesCount(totalReplies);
    }

    /**
     * Counts active descendants recursively.
     * 
     * @param comment the comment DTO
     * @return count of active descendants
     */
    private int countDescendants(CommentTreeDTO comment) {
        if (comment.getChildren() == null || comment.getChildren().isEmpty()) {
            return 0;
        }

        int count = 0;
        for (CommentTreeDTO child : comment.getChildren()) {
            if (child.getActive()) {
                count += 1 + countDescendants(child);
            }
        }

        return count;
    }

    /**
     * Builds UserProfileDTO from User entity.
     * 
     * @param user the User entity
     * @return the UserProfileDTO
     */
    private UserProfileDTO getUserProfileDTO(User user) {
        return Optional.ofNullable(user)
                .map(u -> profileRepository.findByUserId(u.getUserId()))
                .map(profile -> new UserProfileDTO(user, profile))
                .orElseGet(() -> new UserProfileDTO(user, null));
    }

    @Override
    public CommentTreeDTO createRootComment(Long advertisementId, String content, Long userId) {
        logger.info("Creating root comment for advertisement ID: {}", advertisementId);

        Advertisement advertisement = this.advertisementRepository.findById(advertisementId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Advertisement not found with ID: " + advertisementId));

        User user = this.userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Check for user profile
        Optional<Profile> optionalProfile = this.profileRepository.findByUserId(user.getUserId());
        if (optionalProfile.isEmpty()) {
            throw new IllegalStateException("User must have a profile to comment");
        }

        Comment comment = new Comment(user, advertisement, content);

        // Set depthLevel and treePath for root comment
        comment.setDepthLevel(0);
        // For the root comment, the treePath is simply its ID, so we need to save it
        // first and then update it
        comment = this.commentRepository.save(comment);

        comment.setTreePath(comment.getId().toString());
        comment = this.commentRepository.save(comment);

        UserProfileDTO userProfileDTO = new UserProfileDTO(user, optionalProfile);
        CommentTreeDTO created = new CommentTreeDTO(comment, userProfileDTO);

        webSocketCommentService.notifyNewComment(advertisementId, created);

        logger.debug("Root comment created with ID: {}", created.getId());
        return created;
    }

    @Override
    public CommentTreeDTO createReply(Long parentId, String content, Long userId) {
        logger.info("Creating reply to comment ID: {}", parentId);
        Comment parent = commentRepository.findByIdWithChildren(parentId)
                .orElseThrow(() -> new EntityNotFoundException("Commento non trovato con ID: " + parentId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Utente non trovato con ID: " + userId));

        Optional<Profile> optionalProfile = profileRepository.findByUserId(userId);
        if (optionalProfile.isEmpty()) {
            throw new IllegalStateException("L'utente deve avere un profilo per rispondere ai commenti");
        }

        Advertisement advertisement = parent.getAdvertisement();

        // Create and save the response
        Comment reply = new Comment(user, advertisement, content, parent);
        reply.setDepthLevel(parent.getDepthLevel() + 1);
        reply = commentRepository.save(reply);

        // Set treePath and save
        String parentTreePath = parent.getTreePath() == null ? "" : parent.getTreePath();
        String newTreePath = parentTreePath.isEmpty()
                ? parent.getId().toString()
                : parentTreePath + "." + parent.getId();
        reply.setTreePath(newTreePath + "." + reply.getId());

        reply = commentRepository.save(reply);

        UserProfileDTO userProfileDTO = new UserProfileDTO(user, optionalProfile);

        CommentTreeDTO replyy = new CommentTreeDTO(reply, userProfileDTO);
        webSocketCommentService.notifyNewReply(parentId, replyy);

        logger.debug("Reply created with ID: {}", replyy.getId());
        return replyy;
    }

    @Transactional
    @Override
    public CommentTreeDTO updateComment(Long commentId, String newContent, Long userId) {

        logger.info("Updating comment ID: {}", commentId);

        Comment comment = this.commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Commento non trovato"));

        if (!isCommentAndParentsActive(comment)) {
            throw new IllegalStateException("Non è possibile modificare un commento figlio di commenti eliminati");
        }

        // Check for user profile
        Optional<Profile> optionalProfile = profileRepository.findByUserId(userId);
        if (optionalProfile.isEmpty()) {
            throw new IllegalStateException("L'utente deve avere un profilo per modificare commenti");
        }

        comment.setContent(newContent);
        comment = this.commentRepository.save(comment);

        UserProfileDTO userProfileDTO = new UserProfileDTO(comment.getUser(), optionalProfile);

        CommentTreeDTO updated = new CommentTreeDTO(comment, userProfileDTO);

        webSocketCommentService.notifyCommentUpdated(updated);

        logger.debug("Comment updated: {}", commentId);

        return updated;
    }

    /**
     * Checks if a comment and all its parents are active.
     * 
     * @param comment the comment to check
     * @return true if active, false otherwise
     */
    private boolean isCommentAndParentsActive(Comment comment) {
        Comment current = comment;
        while (current != null) {
            if (!current.isActive()) {
                return false;
            }
            current = current.getParent();
        }
        return true;
    }

    @Transactional
    @Override
    public void deleteComment(Long commentId, Long userId) {

        logger.info("Deleting comment ID: {}", commentId);

        Comment comment = commentRepository.findByIdWithChildren(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));

        if (!areAllParentsActive(comment)) {
            throw new IllegalStateException("Cannot delete a comment with inactive parents");
        }

        // Save advertisementId before deletion
        Long advertisementId = comment.getAdvertisement().getAdvertisementId();

        // Recursive soft delete
        softDeleteCommentTree(comment);

        // Update counters
        updateParentCounters(comment);
        if (comment.getParent() != null) {
            updateParentCounters(comment.getParent());
        }

        logger.debug("Comment soft deleted: {}", commentId);

        // Pass both parameters
        webSocketCommentService.notifyCommentDeleted(commentId, advertisementId);
    }

    /**
     * Checks if all parents of a comment are active.
     * 
     * @param comment the comment to check
     * @return true if all parents are active
     */
    private boolean areAllParentsActive(Comment comment) {
        Comment current = comment.getParent();
        while (current != null) {
            if (!current.isActive()) {
                return false;
            }
            current = current.getParent();
        }
        return true;
    }

    /**
     * Recursively soft deletes a comment tree.
     * 
     * @param comment the root comment to delete
     */
    @Transactional
    private void softDeleteCommentTree(Comment comment) {
        comment.setActive(false);

        // Also mark children as deleted
        for (Comment child : comment.getChildren()) {
            softDeleteCommentTree(child);
        }

        commentRepository.save(comment);
    }

    /**
     * Updates counters on parent comments after deletion.
     * 
     * @param parent the parent comment to update
     */
    private void updateParentCounters(Comment parent) {
        long activeChildren = parent.getChildren().stream()
                .filter(Comment::isActive)
                .count();

        parent.setDirectRepliesCount((int) activeChildren);

        int totalActive = parent.getChildren().stream()
                .filter(Comment::isActive)
                .mapToInt(child -> 1 + calculateActiveDescendants(child))
                .sum();

        parent.setTotalRepliesCount(totalActive);
        commentRepository.save(parent);

        if (parent.getParent() != null) {
            updateParentCounters(parent.getParent());
        }
    }

    /**
     * Calculates the number of active descendants recursively.
     * 
     * @param comment the comment to calculate for
     * @return count of active descendants
     */
    private int calculateActiveDescendants(Comment comment) {
        return comment.getChildren().stream()
                .filter(Comment::isActive)
                .mapToInt(child -> 1 + calculateActiveDescendants(child))
                .sum();
    }

}
