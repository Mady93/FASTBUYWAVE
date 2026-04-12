package com.mady.springboot_be.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.mady.springboot_be.dtos.CommentTreeDTO;
import com.mady.springboot_be.services_impl.CommentServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for comment management operations.
 * 
 * Supports creating root comments and replies on advertisements,
 * updating and soft-deleting comments with recursive state propagation,
 * and retrieving hierarchical comment trees using Materialized Path pattern.
 * Documentation is provided via Swagger/OpenAPI annotations.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestController
@RequestMapping("/api/comments")
@Tag(name = "Comments", description = "Endpoints for managing comments on advertisements")
public class CommentController {

    private final CommentServiceImpl commentService;

    @Autowired
    public CommentController(CommentServiceImpl commentService) {
        this.commentService = commentService;
    }

    @Operation(summary = "Get comment tree for an advertisement", description = "Retrieves all comments for an advertisement organized in a hierarchical tree structure")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Comments retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Advertisement not found")
    })
    @GetMapping("/get/advertisement/{advertisementId}")
    public ResponseEntity<List<CommentTreeDTO>> getCommentsTree(@PathVariable Long advertisementId) {
        List<CommentTreeDTO> commentsTree = commentService.getCommentsTree(advertisementId);
        return ResponseEntity.ok(commentsTree);
    }

    @Operation(summary = "Create a root comment", description = "Creates a new top-level comment on an advertisement")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Comment created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "User must have a profile to comment"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Advertisement or User not found")
    })
    @PostMapping("/create/advertisement/{advertisementId}")
    public ResponseEntity<CommentTreeDTO> createRootComment(
            @PathVariable Long advertisementId,
            @RequestParam String content,
            @RequestParam Long userId) {
        CommentTreeDTO created = commentService.createRootComment(advertisementId, content, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Reply to a comment", description = "Creates a reply to an existing comment")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Reply created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "User must have a profile to reply"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Parent comment or User not found")
    })
    @PostMapping("/create/{parentId}/reply")
    public ResponseEntity<CommentTreeDTO> createReply(
            @PathVariable Long parentId,
            @RequestParam String content,
            @RequestParam Long userId) {
        CommentTreeDTO reply = commentService.createReply(parentId, content, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(reply);
    }

    @Operation(summary = "Update a comment", description = "Updates the content of an existing comment")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Comment updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Cannot update comment with inactive parents"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @PutMapping("/update/{commentId}")
    public ResponseEntity<CommentTreeDTO> updateComment(
            @PathVariable Long commentId,
            @RequestParam String content,
            @RequestParam Long userId) {
        CommentTreeDTO updated = commentService.updateComment(commentId, content, userId);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete a comment", description = "Soft deletes a comment and all its replies")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Comment deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Cannot delete comment with inactive parents"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Comment not found")
    })
    @DeleteMapping("/delete/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }

}
