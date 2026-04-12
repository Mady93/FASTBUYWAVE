package com.mady.springboot_be.exceptions;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Generic error response wrapper for API exception handling.
 * 
 * This class provides a consistent structure for error responses sent to
 * clients
 * when exceptions occur during API request processing. It supports:
 * - Timestamp in Europe/Rome timezone with millisecond precision
 * - HTTP status code
 * - Generic error details (can be String, List, Map, etc.)
 * - Human-readable error message
 * - Stack trace (optional, typically for development environment)
 * - Request path that caused the error
 * 
 * The trace field is excluded from JSON serialization when null
 * (using @JsonInclude(JsonInclude.Include.NON_NULL)).
 * 
 * @param <T> the type of the errors field (String, List&lt;String&gt;,
 *            Map&lt;String, String&gt;, etc.)
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse<T> {

    private String timestamp;
    private Integer status;
    private T errors;
    private String message;
    private String[] trace;
    private String path;

    /**
     * Default constructor.
     */
    public ErrorResponse() {
    }

    /**
     * Constructs an ErrorResponse with auto-generated timestamp (Europe/Rome
     * timezone).
     * 
     * The timestamp is automatically formatted as "dd-MM-yyyy HH:mm:ss.SSS z"
     * Example: "15-04-2025 14:30:25.123 CEST"
     * 
     * @param status  the HTTP status code
     * @param errors  the error details (can be String, List, Map, etc.)
     * @param message the human-readable error message
     * @param trace   the stack trace array (can be null)
     * @param path    the request path that caused the error
     */
    public ErrorResponse(Integer status, T errors, String message, String[] trace, String path) {

        this.timestamp = ZonedDateTime.now(ZoneId.of("Europe/Rome"))
                .format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss.SSS z"));

        this.status = status;
        this.errors = errors;
        this.message = message;
        this.trace = trace;
        this.path = path;
    }

    /**
     * Constructs an ErrorResponse with explicit timestamp.
     * 
     * @param timestamp the timestamp string (already formatted)
     * @param status    the HTTP status code
     * @param errors    the error details (can be String, List, Map, etc.)
     * @param message   the human-readable error message
     * @param trace     the stack trace array (can be null)
     * @param path      the request path that caused the error
     */
    public ErrorResponse(String timestamp, Integer status, T errors, String message, String[] trace, String path) {
        this.timestamp = timestamp;
        this.status = status;
        this.errors = errors;
        this.message = message;
        this.trace = trace;
        this.path = path;
    }

    /**
     * Returns the timestamp of the error.
     * 
     * @return the timestamp string
     */
    public String getTimestamp() {
        return timestamp;
    }

    /**
     * Sets the timestamp of the error.
     * 
     * @param timestamp the timestamp to set
     */
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    /**
     * Returns the HTTP status code.
     * 
     * @return the status code (e.g., 400, 401, 404, 500)
     */
    public Integer getStatus() {
        return status;
    }

    /**
     * Sets the HTTP status code.
     * 
     * @param status the status code to set
     */
    public void setStatus(Integer status) {
        this.status = status;
    }

    /**
     * Returns the error details.
     * 
     * @return the errors of type T
     */
    public T getErrors() {
        return errors;
    }

    /**
     * Sets the error details.
     * 
     * @param errors the errors to set
     */
    public void setErrors(T errors) {
        this.errors = errors;
    }

    /**
     * Returns the human-readable error message.
     * 
     * @return the message
     */
    public String getMessage() {
        return message;
    }

    /**
     * Sets the human-readable error message.
     * 
     * @param message the message to set
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * Returns the stack trace array (typically null in production).
     * 
     * @return the trace array, or null if not included
     */
    public String[] getTrace() {
        return trace;
    }

    /**
     * Sets the stack trace array.
     * 
     * @param trace the trace array to set
     */
    public void setTrace(String[] trace) {
        this.trace = trace;
    }

    /**
     * Returns the request path that caused the error.
     * 
     * @return the path (e.g., "/api/users/123")
     */
    public String getPath() {
        return path;
    }

    /**
     * Sets the request path that caused the error.
     * 
     * @param path the path to set
     */
    public void setPath(String path) {
        this.path = path;
    }
}