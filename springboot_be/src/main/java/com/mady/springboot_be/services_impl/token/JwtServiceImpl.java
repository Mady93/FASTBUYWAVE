package com.mady.springboot_be.services_impl.token;

import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Date;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.mady.springboot_be.config.jwt.JwtProperties;
import com.mady.springboot_be.dettails.TokenResponse;
import com.mady.springboot_be.dtos.RefreshTokenDTO;
import com.mady.springboot_be.dtos.UserDTO;
import com.mady.springboot_be.services.token.JwtService;
import com.mady.springboot_be.services.token.RefreshTokenService;
import com.mady.springboot_be.services_impl.UserServiceImpl;
import com.mady.springboot_be.utils.PEMKeyUtils;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.ECDSASigner;
import com.nimbusds.jose.crypto.ECDSAVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import jakarta.annotation.PostConstruct;

/**
 * Implementation of JwtService for JWT generation and validation.
 * 
 * Uses ECDSA (Elliptic Curve Digital Signature Algorithm) on NIST P-256 curve
 * (ES256)
 * for secure JWT signing. Keys are loaded from external PEM files.
 * 
 * Features:
 * - Access token generation (15 minutes expiration)
 * - Refresh token generation (3 days expiration, stored in database)
 * - Token validation with signature and expiration checks
 * - Google OAuth2 access token retrieval
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Service
public class JwtServiceImpl implements JwtService {

    private final RefreshTokenService refreshTokenService;
    private final JwtProperties jwtProperties;
    private final UserServiceImpl userService;

    private static final Logger logger = LoggerFactory.getLogger(JwtServiceImpl.class);

    private ECPrivateKey privateKey;
    private ECPublicKey publicKey;

    /**
     * Constructs a new JwtServiceImpl with required dependencies.
     * 
     * @param refreshTokenService service for refresh token management
     * @param jwtProperties       JWT configuration properties (signingkey,
     *                            verificationkey, issuer)
     * @param userService         service for user operations
     */
    @Autowired
    public JwtServiceImpl(RefreshTokenService refreshTokenService, JwtProperties jwtProperties,
            UserServiceImpl userService) {
        this.refreshTokenService = refreshTokenService;
        this.jwtProperties = jwtProperties;
        this.userService = userService;
    }

    /**
     * Initializes EC keys from PEM files after bean construction.
     * 
     * @throws RuntimeException if key loading fails
     */
    @PostConstruct
    public void init() {
        try {
            this.privateKey = loadECPrivateKey(jwtProperties.getSigningkey());
            this.publicKey = loadECPublicKey(jwtProperties.getVerificationkey());
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize JWT service with EC keys", e);
        }
    }

    /**
     * Loads EC private key from PEM file.
     * 
     * @param path the path to the PEM file
     * @return the ECPrivateKey
     */
    private ECPrivateKey loadECPrivateKey(String path) throws Exception {
        String pemEncodedKey = PEMKeyUtils.readKeyAsString(path);
        return (ECPrivateKey) PEMKeyUtils.readECPrivateKeyFromString(pemEncodedKey);
    }

    /**
     * Loads EC public key from PEM file.
     * 
     * @param path the path to the PEM file
     * @return the ECPublicKey
     */
    private ECPublicKey loadECPublicKey(String path) throws Exception {
        String pemEncodedKey = PEMKeyUtils.readKeyAsString(path);
        return (ECPublicKey) PEMKeyUtils.readPublicKeyFromString(pemEncodedKey);
    }

    @Override
    public String generateAccessToken(Long userId, String email, String scopes, String roles, long expiresInMinutes)
            throws JOSEException {

        logger.debug("Generating access token for user: {}", userId);
        UserDTO user = userService.getUserById(userId);
        JWSHeader jwsHeader = new JWSHeader.Builder(JWSAlgorithm.ES256)
                .type(JOSEObjectType.JWT)
                .build();

        Instant now = Instant.now();
        Date expirationTime = Date.from(now.plus(expiresInMinutes, ChronoUnit.MINUTES));

        JWTClaimsSet jwtClaims = new JWTClaimsSet.Builder()
                .issuer(jwtProperties.getIssuer())
                .subject(String.valueOf(userId))
                .claim("upn", userId)
                .claim("email", email)
                .claim("scope", scopes)
                .claim("groups", Arrays.asList(scopes.split(" ")))
                .claim("roles", user.getRoles())
                .expirationTime(expirationTime)
                .notBeforeTime(Date.from(now))
                .issueTime(Date.from(now))
                .jwtID(UUID.randomUUID().toString())
                .build();

        SignedJWT signedJWT = new SignedJWT(jwsHeader, jwtClaims);
        signedJWT.sign(new ECDSASigner(privateKey));

        return signedJWT.serialize();
    }

    @Override
    public String generateRefreshToken(Long userId, String email, String scopes, String roles, long expiresInMinutes) {

        logger.debug("Generating refresh token for user: {}", userId);
        UserDTO user = userService.getUserById(userId);
        String tokenId = UUID.randomUUID().toString();

        RefreshTokenDTO refreshTokenDTO = new RefreshTokenDTO(
                tokenId,
                userId,
                email,
                scopes,
                user.getRoles(),
                LocalDateTime.now().plusMinutes(expiresInMinutes),
                false);

        try {
            refreshTokenService.save(refreshTokenDTO);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Failed to save refresh token", e);
        }

        return tokenId;
    }

    @Override
    public TokenResponse createTokenResponse(String accessToken, String refreshToken, long expiresInMinutes,
            String scopes, String roles) {
        TokenResponse response = new TokenResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setTokenType("Bearer");
        response.setExpiresIn(expiresInMinutes * 60);
        response.setScope(scopes);
        response.setRoles(roles);
        return response;
    }

    @Override
    public JWTClaimsSet validateToken(String token) throws JOSEException {

        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new ECDSAVerifier(publicKey);

            if (!signedJWT.verify(verifier)) {
                throw new JOSEException("Invalid token signature");
            }

            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();

            logger.debug("Token validated successfully for user: {}", claimsSet.getSubject());

            if (claimsSet.getExpirationTime() != null && claimsSet.getExpirationTime().before(new Date())) {
                throw new JOSEException("Token has expired");
            }

            if (!jwtProperties.getIssuer().equals(claimsSet.getIssuer())) {
                throw new JOSEException("Invalid token issuer");
            }

            return claimsSet;
        } catch (java.text.ParseException e) {
            logger.error("Token validation failed: {}", e.getMessage());
            throw new JOSEException("Failed to parse token", e);
        }
    }

    @Override
    public String getGoogleAccessTokenFromUser(Long userId) {
        // Fetch the user based on userId
        UserDTO user = userService.getUserById(userId);

        // Assuming user has a googleAccessToken field
        if (user != null && user.getGoogleAccessToken() != null) {
            return user.getGoogleAccessToken();
        }

        // Return null if no access token is found for the user
        return null;
    }
}