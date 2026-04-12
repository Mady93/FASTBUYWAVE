package com.mady.springboot_be.config.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties class for JWT (JSON Web Token) settings using ECDSA.
 * 
 * This class binds properties from application.yml or application.properties
 * with the prefix "jwt" for ECDSA-based JWT signing and verification.
 * 
 * The implementation uses:
 * - ECDSA (Elliptic Curve Digital Signature Algorithm)
 * - NIST P-256 curve (secp256r1)
 * - ES256 algorithm (SHA-256 with ECDSA)
 * - PEM-encoded key format
 * 
 * Properties mapped:
 * - jwt.signingkey: ECDSA private key (PEM format) for signing tokens
 * - jwt.verificationkey: ECDSA public key (PEM format) for verifying tokens
 * - jwt.issuer: token issuer identifier
 * 
 * Example configuration in application.yml:
 * 
 * jwt:
 * signingkey: |
 * -----BEGIN EC PRIVATE KEY-----
 * MHcCAQEE...
 * -----END EC PRIVATE KEY-----
 * verificationkey: |
 * -----BEGIN PUBLIC KEY-----
 * MFkwEwYH...
 * -----END PUBLIC KEY-----
 * issuer: fastbuywave.com
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String signingkey;
    private String verificationkey;
    private String issuer;

    /**
     * Default constructor for Spring Boot configuration binding.
     */
    public JwtProperties() {
    }

    /**
     * Constructs JwtProperties with all fields.
     * 
     * @param signingkey      the ECDSA private key for signing JWTs
     * @param verificationkey the ECDSA public key for verifying JWTs
     * @param issuer          the token issuer identifier
     */
    public JwtProperties(String signingkey, String verificationkey, String issuer) {
        this.signingkey = signingkey;
        this.verificationkey = verificationkey;
        this.issuer = issuer;
    }

    /**
     * Returns the ECDSA signing key (private key) in PEM format.
     * 
     * @return the private key as a PEM string
     */
    public String getSigningkey() {
        return signingkey;
    }

    /**
     * Sets the ECDSA signing key (private key) in PEM format.
     * 
     * @param signingkey the private key as a PEM string
     */
    public void setSigningkey(String signingkey) {
        this.signingkey = signingkey;
    }

    /**
     * Returns the ECDSA verification key (public key) in PEM format.
     * 
     * @return the public key as a PEM string
     */
    public String getVerificationkey() {
        return verificationkey;
    }

    /**
     * Sets the ECDSA verification key (public key) in PEM format.
     * 
     * @param verificationkey the public key as a PEM string
     */
    public void setVerificationkey(String verificationkey) {
        this.verificationkey = verificationkey;
    }

    /**
     * Returns the token issuer identifier.
     * 
     * @return the issuer string
     */
    public String getIssuer() {
        return issuer;
    }

    /**
     * Sets the token issuer identifier.
     * 
     * @param issuer the issuer string
     */
    public void setIssuer(String issuer) {
        this.issuer = issuer;
    }

    /**
     * Returns a string representation of JwtProperties.
     * Note: For security reasons, the actual key values are not masked in this
     * output.
     * 
     * @return string representation containing all property values
     */
    @Override
    public String toString() {
        return "JwtProperties{" +
                "signingkey='" + signingkey + '\'' +
                ", verificationkey='" + verificationkey + '\'' +
                ", issuer='" + issuer + '\'' +
                '}';
    }
}
