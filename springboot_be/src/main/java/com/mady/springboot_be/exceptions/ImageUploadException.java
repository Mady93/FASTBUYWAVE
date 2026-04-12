package com.mady.springboot_be.exceptions;

import java.io.IOException;

/**
 * Exception thrown when an image upload operation fails.
 * 
 * This exception is a specialized IOException that indicates problems
 * during image processing or upload, such as:
 * - Corrupted image data
 * - Unsupported image format
 * - File size exceeds limits
 * - I/O errors during file reading
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ImageUploadException extends IOException {

    private static final long serialVersionUID = 1L;

    /**
     * Constructs a new ImageUploadException with no detail message.
     */
    public ImageUploadException() {
        super();
    }

    /**
     * Constructs a new ImageUploadException with the specified detail message.
     * 
     * @param message the detail message (which is saved for later retrieval by the
     *                getMessage() method)
     */
    public ImageUploadException(String message) {
        super(message);
    }

    /**
     * Constructs a new ImageUploadException with the specified detail message and
     * cause.
     * 
     * @param message the detail message (which is saved for later retrieval by the
     *                getMessage() method)
     * @param cause   the cause (which is saved for later retrieval by the
     *                getCause() method)
     */
    public ImageUploadException(String message, Throwable cause) {
        super(message, cause);
    }

}
