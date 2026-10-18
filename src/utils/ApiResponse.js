
// Define a class called ApiResponse.
// This is a reusable structure for sending consistent API responses.
class ApiResponse {
    // The constructor runs whenever you create a new ApiResponse object.
    // It accepts three parameters:
    // 1. statusCode → HTTP status code (e.g., 200, 404, 500)
    // 2. data → the actual payload (object, array, string, etc.)
    // 3. message → optional message, defaults to "Success"
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;   // Store the status code
        this.data = data;               // Store the response data
        this.message = message;         // Store the message (default "Success")
        
        // success → Boolean flag.
        // If statusCode < 400, it means request was successful (2xx or 3xx).
        // If statusCode >= 400, it means request failed (4xx or 5xx).
        this.success = statusCode < 400;
    } 
}

export {ApiResponse}