package com.mady.springboot_be.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mady.springboot_be.entities.RefreshToken;

/**
 * Repository interface for RefreshToken entity operations.
 * 
 * Provides custom queries for:
 * - Finding tokens by token ID
 * - Finding tokens by user ID
 * - Deleting expired and revoked tokens (cleanup)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {

    /**
     * Finds a refresh token by its token ID.
     * 
     * @param tokenId the token ID (UUID)
     * @return Optional containing the token if found
     */
    Optional<RefreshToken> findByTokenId(String tokenId);

    /**
     * Finds all refresh tokens for a specific user.
     * 
     * @param userId the user ID
     * @return list of refresh tokens for the user
     */
    List<RefreshToken> findByUserId(Long userId);

    /**
     * Deletes all refresh tokens that are either expired or revoked.
     * Used for periodic cleanup of stale tokens.
     * 
     * @param now the current date/time for expiration comparison
     */
    void deleteByExpirationDateBeforeOrRevokedTrue(LocalDateTime now);
}
