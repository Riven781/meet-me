export class AppError extends Error {
  constructor(code, statusCode = 500, details = null) {
    super(code);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details
  }
}