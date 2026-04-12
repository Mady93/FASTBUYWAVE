package com.mady.springboot_be.dettails;

/**
 * Standard API response wrapper for simple status and message responses.
 * 
 * This class provides a consistent structure for API responses that only
 * need to return a status code and a message, without a data payload.
 * 
 * Used primarily for:
 * - Operation success/failure acknowledgments
 * - Error responses without additional data
 * - Validation failure responses
 * - Batch operation status reports
 * 
 * For responses that include data, use ApiResponseData<T> instead.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ApiResponse {
	private int status;
	private String message;

	/**
	 * Default constructor.
	 */
	public ApiResponse() {
	}

	/**
	 * Constructs an ApiResponse with status and message.
	 * 
	 * @param status  HTTP status code (e.g., 200, 400, 401, 404, 500)
	 * @param message response message describing the result
	 */
	public ApiResponse(int status, String message) {
		this.status = status;
		this.message = message;
	}

	/**
	 * Returns the HTTP status code.
	 * 
	 * @return status code
	 */
	public int getStatus() {
		return status;
	}

	/**
	 * Sets the HTTP status code.
	 * 
	 * @param status status code to set
	 */
	public void setStatus(int status) {
		this.status = status;
	}

	/**
	 * Returns the response message.
	 * 
	 * @return response message
	 */
	public String getMessage() {
		return message;
	}

	/**
	 * Sets the response message.
	 * 
	 * @param message response message to set
	 */
	public void setMessage(String message) {
		this.message = message;
	}
}
