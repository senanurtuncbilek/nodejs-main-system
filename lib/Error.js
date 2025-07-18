/**
 * Extends the built-in Error class to support custom error structures with HTTP codes and detailed descriptions.
 * Useful for throwing structured, descriptive errors throughout the application.
 */

class CustomError extends Error {
    constructor(code, message, description){
        super(`{"code: "${code}", "message:" "${message}", "description:" "${description}"}`);
        this.code = code;
        this.message = message;
        this.description = description;
    }
}

module.exports = CustomError;