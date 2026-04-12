package com.mady.springboot_be.exceptions;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.AccessDeniedException;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

/**
 * Global exception handler for REST controllers.
 * 
 * This class intercepts exceptions thrown by any REST controller and returns
 * a consistent error response format (ErrorResponse) to the client.
 * 
 * Handled exception types:
 * - ResourceNotFoundException → 404 NOT FOUND
 * - MethodArgumentNotValidException → 400 BAD REQUEST (validation errors)
 * - MethodArgumentTypeMismatchException → 406 NOT ACCEPTABLE
 * - MissingServletRequestParameterException → 406 NOT ACCEPTABLE
 * - HttpMessageNotReadableException → 400 BAD REQUEST
 * - NoHandlerFoundException → 404 NOT FOUND
 * - IllegalArgumentException → 400 BAD REQUEST
 * - AccessDeniedException → 406 NOT ACCEPTABLE (last admin protection)
 * - AdminDeletionException → 406 NOT ACCEPTABLE
 * - RuntimeException → 406 NOT ACCEPTABLE
 * - DataIntegrityViolationException → 409 CONFLICT (duplicate entries)
 * - ImageUploadException → 500 INTERNAL SERVER ERROR
 * - OptimisticLockRetryException → 409 CONFLICT (concurrent modification)
 * - Generic Exception → 500 INTERNAL SERVER ERROR (fallback)
 * 
 * All responses include:
 * - Timestamp (Europe/Rome timezone)
 * - HTTP status code
 * - Error details (String or List of Strings)
 * - Error message
 * - Stack trace (for debugging)
 * - Request path
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@RestControllerAdvice
public class GlobalExceptionHandlerRestController {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandlerRestController.class);

	/**
	 * Extracts the request path from the WebRequest.
	 * 
	 * @param request the web request
	 * @return the request path (e.g., "/api/users/123")
	 */
	private static String getPath(WebRequest request) {
		String path = request.getDescription(true);
		path = path.substring(4, path.lastIndexOf(";"));
		return path;
	}

	/**
	 * Converts an exception stack trace to a String array.
	 * 
	 * @param ex the exception
	 * @return array of stack trace lines
	 */
	private String[] getStackTraceAsArray(Exception ex) {
		StringWriter sw = new StringWriter();
		PrintWriter pw = new PrintWriter(sw);
		ex.printStackTrace(pw);
		String traceString = sw.toString();
		return traceString.split("\\R");
	}

	/**
	 * Handles ResourceNotFoundException.
	 * Returns HTTP 404 NOT FOUND.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with error details
	 */
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ExceptionHandler(ResourceNotFoundException.class)
	public ErrorResponse<String> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {

		log.error("ResourceNotFoundException at {}: {}", getPath(request), ex.getMessage(), ex);
		Integer status = HttpStatus.NOT_FOUND.value();
		String path = getPath(request);

		String[] stackTraceArray = getStackTraceAsArray(ex);
		String errors = HttpStatus.NOT_FOUND.getReasonPhrase();
		String message = ex.getMessage();

		return new ErrorResponse<>(status, errors, message, stackTraceArray, path);
	}

	/**
	 * Handles MethodArgumentNotValidException (validation errors).
	 * Returns HTTP 400 BAD REQUEST with list of validation errors.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with list of validation error messages
	 */
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ErrorResponse<List<String>> validationException(MethodArgumentNotValidException ex, WebRequest request) {

		log.error("MethodArgumentNotValidException at {}: {}", getPath(request), ex.getMessage(), ex);
		List<String> errors = new ArrayList<>();
		ex.getBindingResult().getAllErrors().forEach((error) -> {
			String errorMessage = error.getDefaultMessage();
			errors.add(errorMessage);
		});

		Integer status = HttpStatus.BAD_REQUEST.value();
		String path = getPath(request);

		String[] stackTraceArray = getStackTraceAsArray(ex);

		String timestamp = ZonedDateTime.now(ZoneId.of("Europe/Rome"))
				.format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss.SSS z"));

		return new ErrorResponse<>(timestamp, status, errors, ex.getMessage(), stackTraceArray, path);
	}

	/**
	 * Handles MethodArgumentTypeMismatchException (type conversion errors).
	 * Returns HTTP 406 NOT ACCEPTABLE.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with error details
	 */
	@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ErrorResponse<String> notValidInteger(MethodArgumentTypeMismatchException ex, WebRequest request) {

		log.error("MethodArgumentTypeMismatchException at {}: {}", getPath(request), ex.getMessage(), ex);
		String errors = ex.getMessage();
		Integer status = HttpStatus.NOT_ACCEPTABLE.value();
		String path = getPath(request);
		String[] stackTraceArray = getStackTraceAsArray(ex);
		String timestamp = ZonedDateTime.now(ZoneId.of("Europe/Rome"))
				.format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss.SSS z"));

		return new ErrorResponse<>(timestamp, status, errors, ex.getMessage(), stackTraceArray, path);
	}

	/**
	 * Handles MissingServletRequestParameterException (missing required
	 * parameters).
	 * Returns HTTP 406 NOT ACCEPTABLE.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with error details
	 */
	@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
	@ExceptionHandler(MissingServletRequestParameterException.class)
	public ErrorResponse<String> handleBadRequestException(MissingServletRequestParameterException ex,
			WebRequest request) {

		log.error("MissingServletRequestParameterException at {}: {}", getPath(request), ex.getMessage(), ex);
		String path = getPath(request);
		String[] stackTraceArray = getStackTraceAsArray(ex);
		String message = ex.getMessage();
		int status = HttpStatus.NOT_ACCEPTABLE.value();
		String errors = HttpStatus.NOT_ACCEPTABLE.getReasonPhrase();

		return new ErrorResponse<>(status, errors, message, stackTraceArray, path);
	}

	/**
	 * Handles HttpMessageNotReadableException (invalid or unreadable request body).
	 * Returns HTTP 400 BAD REQUEST with extracted error message.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with error details
	 */
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ErrorResponse<String> handleBadRequestException(HttpMessageNotReadableException ex, WebRequest request) {

		log.error("HttpMessageNotReadableException at {}: {}", getPath(request), ex.getMessage(), ex);
		String path = getPath(request);
		String[] stackTraceArray = getStackTraceAsArray(ex);

		String fullMessage = ex.getMessage();
		String errorMessage = extractErrorMessage(fullMessage);

		int status = HttpStatus.BAD_REQUEST.value();
		String errors = HttpStatus.BAD_REQUEST.getReasonPhrase();

		return new ErrorResponse<>(status, errors, errorMessage, stackTraceArray, path);
	}

	/**
	 * Extracts a readable error message from HttpMessageNotReadableException.
	 * 
	 * @param fullMessage the full exception message
	 * @return extracted error message
	 */
	private String extractErrorMessage(String fullMessage) {
		String startTag = "Cannot deserialize value of type `int` from String";
		String endTag = "not a valid `int` value";

		int startIndex = fullMessage.indexOf(startTag);
		int endIndex = fullMessage.indexOf(endTag);

		if (startIndex != -1 && endIndex != -1) {
			return fullMessage.substring(startIndex, endIndex + endTag.length());
		}

		return fullMessage;
	}

	/**
	 * Handles NoHandlerFoundException (invalid URL).
	 * Returns HTTP 404 NOT FOUND.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with error details
	 */
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ExceptionHandler(value = { NoHandlerFoundException.class })
	public ErrorResponse<String> handleBadRequestExceptions(Exception ex, WebRequest request) {

		log.error("NoHandlerFoundException at {}: {}", getPath(request), ex.getMessage(), ex);
		String errors = "";
		Integer status = HttpStatus.NOT_FOUND.value();
		String path = getPath(request);
		String[] stackTraceArray = getStackTraceAsArray(ex);

		if (ex instanceof NoHandlerFoundException) {
			errors += "Invalid URL";
		}

		return new ErrorResponse<>(status, errors, ex.getMessage(), stackTraceArray, path);
	}

	/**
	 * Handles IllegalArgumentException.
	 * Returns HTTP 400 BAD REQUEST.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with error details
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ErrorResponse<String> handleGeneric(IllegalArgumentException ex, WebRequest request) {

		log.error("IllegalArgumentException at {}: {}", getPath(request), ex.getMessage(), ex);
		String path = getPath(request);
		String[] stackTraceArray = getStackTraceAsArray(ex);
		String message = ex.getMessage();
		int status = HttpStatus.BAD_REQUEST.value();
		String errors = HttpStatus.BAD_REQUEST.getReasonPhrase();

		return new ErrorResponse<>(status, errors, message, stackTraceArray, path);
	}

	/**
	 * Handles generic Exception (fallback for unhandled exceptions).
	 * Returns HTTP 500 INTERNAL SERVER ERROR.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with generic error message
	 */
	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	public ErrorResponse<String> handleGenericException(Exception ex, WebRequest request) {

		log.error("Unhandled Exception at {}: {}", getPath(request), ex.getMessage(), ex);
		String path = getPath(request);
		String[] stackTraceArray = getStackTraceAsArray(ex);
		String message = "Internal server error";
		int status = HttpStatus.INTERNAL_SERVER_ERROR.value();
		String errors = HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase();

		return new ErrorResponse<>(status, errors, message, stackTraceArray, path);
	}

	/**
	 * Handles AccessDeniedException (last admin cannot delete themselves).
	 * Returns HTTP 406 NOT ACCEPTABLE.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with specific error message
	 */
	@ExceptionHandler(AccessDeniedException.class)
	@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
	public ErrorResponse<String> handleEx(Exception ex, WebRequest request) {

		log.error("AccessDeniedException at {}: {}", getPath(request), ex.getMessage(), ex);
		String path = getPath(request);
		String[] stackTraceArray = getStackTraceAsArray(ex);
		String message = "You're the only one with type 'Admin'. We apologize, you cannot delete yourself!";
		int status = HttpStatus.NOT_ACCEPTABLE.value();
		String errors = HttpStatus.NOT_ACCEPTABLE.getReasonPhrase();

		return new ErrorResponse<>(status, errors, message, stackTraceArray, path);
	}

	/**
	 * Handles AdminDeletionException (attempt to delete admin users).
	 * Returns HTTP 406 NOT ACCEPTABLE.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with specific error message
	 */
	@ExceptionHandler(AdminDeletionException.class)
	@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
	public ErrorResponse<String> handleExAdmin(Exception ex, WebRequest request) {

		log.error("RuntimeException (admin) at {}: {}", getPath(request), ex.getMessage(), ex);
		String path = getPath(request);
		String[] stackTraceArray = getStackTraceAsArray(ex);
		String message = "We apologize, you cannot delete yourself and the users with type = 'Admin'! To maintain the security of inadvertent deletion, please delete through the user ID.";
		int status = HttpStatus.NOT_ACCEPTABLE.value();
		String errors = HttpStatus.NOT_ACCEPTABLE.getReasonPhrase();

		return new ErrorResponse<>(status, errors, message, stackTraceArray, path);
	}

	/**
	 * Handles generic RuntimeException.
	 * Returns HTTP 406 NOT ACCEPTABLE.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with error details
	 */
	@ExceptionHandler(RuntimeException.class)
	@ResponseStatus(HttpStatus.NOT_ACCEPTABLE)
	public ErrorResponse<String> handleRuntimeExcept(Exception ex, WebRequest request) {

		log.error("RuntimeException (admin) at {}: {}", getPath(request), ex.getMessage(), ex);
		String path = getPath(request);
		String[] stackTraceArray = getStackTraceAsArray(ex);
		String message = ex.getMessage();
		int status = HttpStatus.NOT_ACCEPTABLE.value();
		String errors = HttpStatus.NOT_ACCEPTABLE.getReasonPhrase();

		return new ErrorResponse<>(status, errors, message, stackTraceArray, path);
	}

	/**
	 * Handles DataIntegrityViolationException (duplicate entries).
	 * Returns HTTP 409 CONFLICT.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with list of error messages
	 */
	@ResponseStatus(HttpStatus.CONFLICT)
	@ExceptionHandler(DataIntegrityViolationException.class)
	public ErrorResponse<List<String>> handleDuplicate(Exception ex, WebRequest request) {

		log.error("DataIntegrityViolationException at {}: {}", getPath(request), ex.getMessage(), ex);
		List<String> errors = new ArrayList<>();
		String errorMessage = "Already exist!";
		errors.add(errorMessage);

		Integer status = HttpStatus.CONFLICT.value();
		String path = getPath(request);
		String[] stackTraceArray = getStackTraceAsArray(ex);

		return new ErrorResponse<>(status, errors, ex.getMessage(), stackTraceArray, path);
	}

	/**
	 * Handles ImageUploadException (image upload errors).
	 * Returns HTTP 500 INTERNAL SERVER ERROR.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with list of error messages
	 */
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	@ExceptionHandler(ImageUploadException.class)
	public ErrorResponse<List<String>> uploadImageIoException(Exception ex, WebRequest request) {

		log.error("ImageUploadException at {}: {}", getPath(request), ex.getMessage(), ex);
		List<String> errors = new ArrayList<>();
		String errorMessage = "Error during image upload";
		errors.add(errorMessage);

		Integer status = HttpStatus.INTERNAL_SERVER_ERROR.value();
		String path = getPath(request);
		String[] stackTraceArray = getStackTraceAsArray(ex);

		return new ErrorResponse<>(status, errors, ex.getMessage(), stackTraceArray, path);
	}

	/**
	 * Handles OptimisticLockRetryException (concurrent modification conflicts).
	 * Returns HTTP 409 CONFLICT.
	 * 
	 * @param ex      the exception
	 * @param request the web request
	 * @return ErrorResponse with error details
	 */
	@ResponseStatus(HttpStatus.CONFLICT)
	@ExceptionHandler(OptimisticLockRetryException.class)
	public ErrorResponse<String> handleOptimisticLockRetryException(OptimisticLockRetryException ex,
			WebRequest request) {

		log.error("OptimisticLockRetryException at {}: {}", getPath(request), ex.getMessage(), ex);
		Integer status = HttpStatus.CONFLICT.value();
		String path = getPath(request);
		String[] stackTraceArray = getStackTraceAsArray(ex);
		String errors = "Concurrent Modification";
		String message = ex.getMessage();

		return new ErrorResponse<>(status, errors, message, stackTraceArray, path);
	}

}