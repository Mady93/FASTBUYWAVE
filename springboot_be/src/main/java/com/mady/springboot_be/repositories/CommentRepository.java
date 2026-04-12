package com.mady.springboot_be.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.Comment;

/**
 * Repository interface for Comment entity operations.
 * 
 * Provides custom queries for hierarchical comment management using
 * Materialized Path pattern (treePath field).
 * 
 * Key features:
 * - Find root comments (no parent) for an advertisement
 * - Find entire comment threads using treePath pattern matching
 * - Find direct children of a specific comment
 * - Count total comments per advertisement
 * - Find comments up to a specific depth level
 * - Eager loading of children with LEFT JOIN FETCH
 * - Ordering by treePath (hierarchical) and creation date
 * 
 * The treePath format: "1.5.12" where each number is a comment ID.
 * This allows efficient hierarchical queries using LIKE patterns.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

  /**
   * Finds all root comments (no parent) for a specific advertisement.
   * Only active comments are returned, ordered by creation date ascending.
   * 
   * @param advertisementId the ID of the advertisement
   * @return list of root comments
   */
  List<Comment> findRootCommentsByAdvertisementId(@Param("advertisementId") Long advertisementId);

  /**
   * Finds all comments in a complete thread starting from a root comment.
   * Uses treePath pattern matching to find:
   * - The root comment itself
   * - All descendants (any depth) via treePath LIKE patterns
   * 
   * @param advertisementId the ID of the advertisement
   * @param rootId          the ID of the root comment
   * @return list of all comments in the thread, ordered by treePath and creation
   *         date
   */
  List<Comment> findAllInThread(@Param("advertisementId") Long advertisementId, @Param("rootId") Long rootId);

  /**
   * Finds direct children of a specific parent comment.
   * Only active comments are returned, ordered by creation date ascending.
   * 
   * @param parentId the ID of the parent comment
   * @return list of direct child comments
   */
  List<Comment> findDirectChildren(@Param("parentId") Long parentId);

  /**
   * Counts total active comments for a specific advertisement.
   * 
   * @param advertisementId the ID of the advertisement
   * @return total comment count
   */
  Long countByAdvertisementId(@Param("advertisementId") Long advertisementId);

  /**
   * Finds comments for an advertisement up to a specific depth level.
   * Useful for paginated or limited-depth comment loading.
   * 
   * @param advertisementId the ID of the advertisement
   * @param maxDepth        the maximum depth level (0 = root only, 1 = root +
   *                        direct replies, etc.)
   * @return list of comments within the depth limit
   */
  List<Comment> findByAdvertisementIdAndMaxDepth(@Param("advertisementId") Long advertisementId);

  /**
   * Finds all root comments for an advertisement with children eagerly loaded.
   * Uses LEFT JOIN FETCH to prevent N+1 queries when accessing children.
   * 
   * @param advertisementId the ID of the advertisement
   * @return list of root comments with their children
   */
  List<Comment> findByAdvertisementIdAndParentIsNull(@Param("advertisementId") Long advertisementId);

  /**
   * Finds a comment by ID with its children eagerly loaded.
   * Uses LEFT JOIN FETCH to load children in the same query.
   * 
   * @param id the comment ID
   * @return Optional containing the comment with children if found
   */
  Optional<Comment> findByIdWithChildren(@Param("id") Long id);

  /**
   * Finds all active comments for an advertisement ordered by treePath and
   * creation date.
   * Uses LEFT JOIN FETCH to eagerly load children.
   * This is the main method for building the complete comment tree.
   * 
   * @param advertisementId the ID of the advertisement
   * @return list of comments ordered hierarchically (treePath) and by creation
   *         date
   */
  List<Comment> findByAdvertisementIdOrderByTreePathCreatedAt(@Param("advertisementId") Long advertisementId);

}
