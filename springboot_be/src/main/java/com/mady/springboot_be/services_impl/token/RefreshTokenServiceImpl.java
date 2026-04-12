package com.mady.springboot_be.services_impl.token;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.mady.springboot_be.dtos.RefreshTokenDTO;
import com.mady.springboot_be.entities.RefreshToken;
import com.mady.springboot_be.exceptions.ResourceNotFoundException;
import com.mady.springboot_be.repositories.RefreshTokenRepository;
import com.mady.springboot_be.services.token.RefreshTokenService;
import com.mady.springboot_be.utils.mappers.RefreshTokenMapper;

import jakarta.transaction.Transactional;

/**
 * Implementation of RefreshTokenService for refresh token management.
 * 
 * Handles:
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
@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenMapper refreshTokenMapper;

    private static final Logger logger = LoggerFactory.getLogger(RefreshTokenServiceImpl.class);

    /**
     * Constructs a new RefreshTokenServiceImpl with required dependencies.
     * 
     * @param refreshTokenRepository repository for RefreshToken entity
     * @param refreshTokenMapper     mapper for RefreshToken entity to DTO
     *                               conversion
     */
    @Autowired
    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository,
            RefreshTokenMapper refreshTokenMapper) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenMapper = refreshTokenMapper;
    }

    @Override
    public RefreshTokenDTO findByTokenId(String tokenId) throws ResourceNotFoundException {
        return refreshTokenRepository.findByTokenId(tokenId)
                .map(token -> {
                    logger.debug("Refresh token found: {}", tokenId);
                    return refreshTokenMapper.toDTO(token);
                })
                .orElseThrow(() -> {
                    logger.error("Refresh token not found: {}", tokenId);
                    return new ResourceNotFoundException("Refresh token not found");
                });
    }

    @Override
    public List<RefreshTokenDTO> findByUserId(Long userId) throws ResourceNotFoundException {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserId(userId);
        if (tokens.isEmpty()) {
            logger.warn("No refresh tokens found for user: {}", userId);
            throw new ResourceNotFoundException("No refresh tokens found for user: " + userId);
        }
        logger.debug("Found {} refresh tokens for user: {}", tokens.size(), userId);
        return refreshTokenMapper.toDTOList(tokens);
    }

    @Override
    public RefreshTokenDTO save(RefreshTokenDTO refreshTokenDTO) throws DataIntegrityViolationException {
        RefreshToken refreshToken = refreshTokenMapper.toEntity(refreshTokenDTO);
        refreshToken = refreshTokenRepository.save(refreshToken);
        logger.debug("Refresh token saved for user: {}", refreshTokenDTO.getUserId());
        return refreshTokenMapper.toDTO(refreshToken);
    }

    @Transactional
    @Override
    public void revokeToken(String tokenId) throws ResourceNotFoundException {
        logger.info("Revoking refresh token: {}", tokenId);
        RefreshToken token = refreshTokenRepository.findByTokenId(tokenId)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));
        token.setRevoked(true);
        refreshTokenRepository.save(token);
        logger.debug("Refresh token revoked: {}", tokenId);
    }

    @Override
    public void revokeAllUserTokens(Long userId) throws ResourceNotFoundException {
        logger.info("Revoking all refresh tokens for user: {}", userId);
        List<RefreshToken> tokens = refreshTokenRepository.findByUserId(userId);
        if (tokens.isEmpty()) {
            logger.warn("No refresh tokens found for user: {}", userId);
            throw new ResourceNotFoundException("No refresh tokens found for user: " + userId);
        }
        tokens.forEach(token -> token.setRevoked(true));
        refreshTokenRepository.saveAll(tokens);
        logger.debug("Revoked {} refresh tokens for user: {}", tokens.size(), userId);
    }

    @Override
    public void deleteExpiredTokens() {
        logger.info("Deleting expired and revoked refresh tokens");
        refreshTokenRepository.deleteByExpirationDateBeforeOrRevokedTrue(LocalDateTime.now());
    }
}
