package com.mady.springboot_be.services_impl;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.mady.springboot_be.dtos.CommentTreeDTO;
import com.mady.springboot_be.entities.Comment;
import com.mady.springboot_be.repositories.CommentRepository;
import com.mady.springboot_be.services.WebSocketCommentService;

import jakarta.persistence.EntityNotFoundException;

/**
 * Implementation of WebSocketCommentService for real-time comment
 * notifications.
 * 
 * Uses Spring's SimpMessagingTemplate to send STOMP messages to connected
 * clients.
 * Messages are sent to topic: /topic/advertisement/{advertisementId}/comments
 * 
 * Each message includes a timestamp for client-side ordering and debugging.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class WebSocketCommentServiceImpl implements WebSocketCommentService {

        private final SimpMessagingTemplate messagingTemplate;
        private final CommentRepository commentRepository;

        private static final Logger logger = LoggerFactory.getLogger(WebSocketCommentServiceImpl.class);

        /**
         * Constructs a new WebSocketCommentServiceImpl with required dependencies.
         * 
         * @param messagingTemplate template for sending WebSocket messages
         * @param commentRepository repository for Comment entity operations
         */
        @Autowired
        public WebSocketCommentServiceImpl(SimpMessagingTemplate messagingTemplate,
                        CommentRepository commentRepository) {
                this.messagingTemplate = messagingTemplate;
                this.commentRepository = commentRepository;
        }

        @Override
        public void notifyNewComment(Long advertisementId, CommentTreeDTO comment) {
                Map<String, Object> message = Map.of(
                                "type", "NEW_COMMENT",
                                "comment", comment,
                                "advertisementId", advertisementId,
                                "timestamp", System.currentTimeMillis());

                logger.info("WebSocket: Sending NEW_COMMENT for advertisement {}", advertisementId);

                messagingTemplate.convertAndSend(
                                "/topic/advertisement/" + advertisementId + "/comments",
                                message);
        }

        @Override
        public void notifyNewReply(Long parentId, CommentTreeDTO reply) {
                Comment parent = commentRepository.findById(parentId)
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Commento non trovato con ID: " + parentId));
                Long advertisementId = parent.getAdvertisement().getAdvertisementId();

                Map<String, Object> message = Map.of(
                                "type", "NEW_REPLY",
                                "comment", reply,
                                "parentId", parentId,
                                "advertisementId", advertisementId,
                                "timestamp", System.currentTimeMillis());

                logger.info("WebSocket: Sending NEW_REPLY for parent {} in advertisement {}", parentId,
                                advertisementId);

                messagingTemplate.convertAndSend(
                                "/topic/advertisement/" + advertisementId + "/comments",
                                message);
        }

        @Override
        public void notifyCommentUpdated(CommentTreeDTO updatedComment) {
                Comment comment = commentRepository.findById(updatedComment.getId())
                                .orElseThrow(() -> new EntityNotFoundException(
                                                "Commento non trovato con ID: " + updatedComment.getId()));
                Long advertisementId = comment.getAdvertisement().getAdvertisementId();

                Map<String, Object> message = Map.of(
                                "type", "UPDATE_COMMENT",
                                "comment", updatedComment,
                                "advertisementId", advertisementId,
                                "timestamp", System.currentTimeMillis());

                logger.info("WebSocket: Sending UPDATE_COMMENT for comment {} in advertisement {}",
                                updatedComment.getId(), advertisementId);

                messagingTemplate.convertAndSend(
                                "/topic/advertisement/" + advertisementId + "/comments",
                                message);
        }

        @Override
        public void notifyCommentDeleted(Long commentId, Long advertisementId) {
                Map<String, Object> message = Map.of(
                                "type", "DELETE_COMMENT",
                                "commentId", commentId,
                                "advertisementId", advertisementId,
                                "timestamp", System.currentTimeMillis());

                logger.info("WebSocket: Sending DELETE_COMMENT for comment {} in advertisement {}", commentId,
                                advertisementId);

                messagingTemplate.convertAndSend(
                                "/topic/advertisement/" + advertisementId + "/comments",
                                message);
        }

}
