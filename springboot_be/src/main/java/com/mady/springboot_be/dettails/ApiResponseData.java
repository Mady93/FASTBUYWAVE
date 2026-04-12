package com.mady.springboot_be.dettails;

/**
 * Generic API response wrapper with data payload.
 * 
 * This class provides a consistent structure for API responses that include
 * a data payload along with status and message information.
 * 
 * @param <T> the type of the data payload
 * 
 *            Use cases:
 *            - Successful GET requests returning an entity (T = EntityDTO)
 *            - Successful GET requests returning a list (T =
 *            List&lt;EntityDTO&gt;)
 *            - Search results with custom data structure
 *            - Any response requiring both metadata and data
 * 
 *            For simple status/message responses without data, use ApiResponse
 *            instead.
 * 
 *            Example usage:
 *            {@code
 *            @GetMapping("/{id}")
 *            public ResponseEntity<ApiResponseData<UserDTO>>
 *            getUser(@PathVariable Long id) {
 *            UserDTO user = userService.findById(id);
 *            return ResponseEntity.ok(new ApiResponseData<>("success", "User
 *            found", user));
 *            }
 *            }
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ApiResponseData<T> {
    private String status;
    private String message;
    private T data;

    /**
     * Constructs an ApiResponseData with status, message, and data payload.
     * 
     * @param status  response status (e.g., "success", "error")
     * @param message response message describing the result
     * @param data    the actual data payload (can be null)
     */
    public ApiResponseData(String status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    /**
     * Returns the response status.
     * 
     * @return status string (e.g., "success", "error")
     */
    public String getStatus() {
        return status;
    }

    /**
     * Sets the response status.
     * 
     * @param status status string to set (e.g., "success", "error")
     */
    public void setStatus(String status) {
        this.status = status;
    }

    /**
     * Returns the response message.
     * 
     * @return response message describing the result
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

    /**
     * Returns the data payload of the response.
     * 
     * @return data payload (can be null)
     */
    public T getData() {
        return data;
    }

    /**
     * Sets the data payload of the response.
     * 
     * @param data the data payload to set (can be null)
     */
    public void setData(T data) {
        this.data = data;
    }

}
