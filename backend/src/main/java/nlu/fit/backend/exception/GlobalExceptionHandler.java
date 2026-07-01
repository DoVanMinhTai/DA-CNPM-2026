package nlu.fit.backend.exception;

import nlu.fit.backend.dto.response.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiErrorResponse> handleEmailAlreadyExistsException(EmailAlreadyExistsException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, "Email Already Exists", ex.getMessage(), null);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentialsException(InvalidCredentialsException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", ex.getMessage(), null);
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<ApiErrorResponse> handleTokenExpiredException(TokenExpiredException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Token Expired", ex.getMessage(), null);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidTokenException(InvalidTokenException ex) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Invalid Token", ex.getMessage(), null);
    }

    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ApiErrorResponse> handleEmailNotVerifiedException(EmailNotVerifiedException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "Email Not Verified", ex.getMessage(), null);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleUserNotFoundException(UserNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), null);
    }



    @ExceptionHandler(InsufficientCreditsException.class)
    public ResponseEntity<ApiErrorResponse> handleInsufficientCreditsException(InsufficientCreditsException ex) {
        return buildErrorResponse(HttpStatus.PAYMENT_REQUIRED, "Insufficient Credits", ex.getMessage(), null);
    }

    @ExceptionHandler(CvUploadException.class)
    public ResponseEntity<ApiErrorResponse> handleCvUploadException(CvUploadException ex) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "CV Upload Error", ex.getMessage(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Bad Request", "Validation failed", errors);
    }

    @ExceptionHandler(org.springframework.web.bind.MissingRequestCookieException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingRequestCookieException(org.springframework.web.bind.MissingRequestCookieException ex) {
        log.error("Missing Request Cookie Exception: {}", ex.getMessage());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Missing Cookie", ex.getMessage(), null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleAllUncaughtExceptions(Exception ex) {
        log.error("Unhandled Exception: ", ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex.getMessage(), null);
    }

    private ResponseEntity<ApiErrorResponse> buildErrorResponse(
            HttpStatus status,
            String error,
            String message,
            Map<String, String> fieldErrors
    ) {
        ApiErrorResponse response = ApiErrorResponse.builder()
                .status(status.value())
                .error(error)
                .message(message)
                .timestamp(LocalDateTime.now())
                .fieldErrors(fieldErrors)
                .build();
        return new ResponseEntity<>(response, status);
    }
}
