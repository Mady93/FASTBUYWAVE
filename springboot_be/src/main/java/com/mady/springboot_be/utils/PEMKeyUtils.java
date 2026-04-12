package com.mady.springboot_be.utils;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Security;
import java.security.spec.EncodedKeySpec;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import org.bouncycastle.asn1.pkcs.PrivateKeyInfo;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.openssl.PEMKeyPair;
import org.bouncycastle.openssl.PEMParser;
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter;

/**
 * Utility class for reading and parsing PEM-encoded cryptographic keys.
 * 
 * Supports reading EC (Elliptic Curve) private and public keys in PEM format,
 * used for JWT signing with ECDSA on NIST P-256 curve (ES256).
 * 
 * Features:
 * - Reads PEM files from file system or classpath
 * - Parses EC private keys from PEM format (PKCS#8 or PKCS#1)
 * - Parses EC public keys from PEM format (X.509)
 * - Uses BouncyCastle provider for PEM parsing
 * 
 * Key format examples:
 * - Private key: "-----BEGIN EC PRIVATE KEY-----..."
 * - Public key: "-----BEGIN PUBLIC KEY-----..."
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class PEMKeyUtils {

    /**
     * Reads the content of a PEM key file as a String.
     * 
     * Supports both file system paths and classpath resources.
     * - File system: "/path/to/key.pem"
     * - Classpath: "classpath:keys/private-key.pem"
     * 
     * @param filename the path to the key file (supports "classpath:" prefix)
     * @return the file content as a String
     * @throws IOException if the file cannot be read or not found
     */
    public static String readKeyAsString(String filename) throws IOException {
        InputStream inputStream;

        if (filename.startsWith("classpath:")) {
            String resourcePath = filename.replace("classpath:", "");
            inputStream = Thread.currentThread().getContextClassLoader().getResourceAsStream(resourcePath);
        } else {
            inputStream = new FileInputStream(filename);
        }

        if (inputStream == null) {
            throw new FileNotFoundException("Key file not found: " + filename);
        }

        return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
    }

    /**
     * Static initializer that adds BouncyCastle security provider.
     * Required for PEM parsing and EC key operations.
     */
    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    /**
     * Parses an EC private key from a PEM-encoded string.
     * 
     * Supports both:
     * - PKCS#8 format (unencrypted private key)
     * - PKCS#1 format (EC private key)
     * 
     * @param key the PEM-encoded private key string
     * @return the parsed EC PrivateKey
     * @throws Exception if the key cannot be parsed
     */
    public static PrivateKey readECPrivateKeyFromString(String key) throws Exception {
        try (PEMParser pemParser = new PEMParser(new StringReader(key))) {
            Object object = pemParser.readObject();
            JcaPEMKeyConverter converter = new JcaPEMKeyConverter().setProvider("BC");

            return switch (object) {
                case PEMKeyPair keyPair -> converter.getPrivateKey(keyPair.getPrivateKeyInfo());
                case PrivateKeyInfo pkInfo -> converter.getPrivateKey(pkInfo);
                case null -> throw new IllegalArgumentException("The key is null.");
                default -> throw new IllegalArgumentException("It is not a valid private key.");
            };
        }
    }

    /**
     * Parses an EC public key from a PEM-encoded string.
     * 
     * The PEM string should be in X.509 format:
     * "-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----"
     * 
     * @param key the PEM-encoded public key string
     * @return the parsed EC PublicKey
     * @throws NoSuchAlgorithmException if EC algorithm is not available
     * @throws InvalidKeySpecException  if the key specification is invalid
     */
    public static PublicKey readPublicKeyFromString(String key)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        String publicKeyPEM = key
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");

        byte[] encoded = Base64.getDecoder().decode(publicKeyPEM);
        KeyFactory keyFactory = KeyFactory.getInstance("EC");
        EncodedKeySpec keySpec = new X509EncodedKeySpec(encoded);
        return keyFactory.generatePublic(keySpec);
    }
}