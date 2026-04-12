package com.mady.springboot_be.services.token;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;

import com.mady.springboot_be.dtos.RefreshTokenDTO;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;

/**
 * Service interface for refresh token management.
 * 
 * Defines methods for:
 * - Finding refresh tokens by ID or user ID
 * - Saving new refresh tokens
 * - Revoking tokens (single or all user tokens)
 * - Cleaning up expired tokens
 * 
 * Refresh tokens are stored in the database with configurable expiration (3
 * days)
 * and support explicit revocation for logout and session invalidation.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public interface RefreshTokenService {

    /**
     * Finds a refresh token by its token ID.
     * 
     * @param tokenId the token ID (UUID)
     * @return the RefreshTokenDTO
     * @throws ResourceNotFoundException if token not found
     */
    RefreshTokenDTO findByTokenId(String tokenId) throws ResourceNotFoundException;

    /**
     * Finds all refresh tokens for a specific user.
     * 
     * @param userId the user ID
     * @return list of RefreshTokenDTOs
     * @throws ResourceNotFoundException if no tokens found
     */
    List<RefreshTokenDTO> findByUserId(Long userId) throws ResourceNotFoundException;

    /**
     * Saves a new refresh token.
     * 
     * @param refreshTokenDTO the token to save
     * @return the saved RefreshTokenDTO
     * @throws DataIntegrityViolationException if a token with the same ID already
     *                                         exists
     */
    RefreshTokenDTO save(RefreshTokenDTO refreshTokenDTO) throws DataIntegrityViolationException;

    /**
     * Revokes a specific refresh token.
     * 
     * @param tokenId the token ID to revoke
     * @throws ResourceNotFoundException if token not found
     */
    void revokeToken(String tokenId) throws ResourceNotFoundException;

    /**
     * Revokes all refresh tokens for a specific user.
     * 
     * Used during logout to invalidate all user sessions.
     * 
     * @param userId the user ID
     * @throws ResourceNotFoundException if no tokens found
     */
    void revokeAllUserTokens(Long userId) throws ResourceNotFoundException;

    /**
     * Deletes all expired and revoked tokens from the database.
     * Should be scheduled periodically for cleanup.
     */
    void deleteExpiredTokens();
}
