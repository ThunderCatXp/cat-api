export class DatabaseError extends Error {
    constructor(message: string, public originalError: Error) {
      super(`${message}: ${originalError.message}`);
    }
  }
  
  export class ValidationError extends Error {
    constructor(public field: string, message: string) {
      super(`Validation failed for ${field}: ${message}`);
    }
  }