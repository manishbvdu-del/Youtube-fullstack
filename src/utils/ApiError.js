// Create a custom error class called ApiError.
// It extends the built-in Error class in JavaScript.
class ApiError extends Error {
    constructor(
        statusCode,                          // HTTP status code (e.g., 400, 404, 500)
        message = "Something went wrong",    // Default error message
        errors = [],                         // Optional array of validation or extra errors
        stack = ""                           // Optional stack trace
    ) {
        // Call the parent Error constructor with the message.
        super(message);

        // Custom properties for API error response
        this.statusCode = statusCode;   // Store HTTP status code
        this.data = null;               // No data in error response
        this.message = message;         // Error message
        this.success = false;           // Always false for errors
        this.errors = errors;           // Store extra error details if any

        // Handle stack trace
        if (stack) {
            this.stack = stack;         // Use provided stack trace
        } else {
            // Capture stack trace automatically
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export the ApiError class so it can be used in other files.
export { ApiError }
