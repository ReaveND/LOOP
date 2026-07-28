export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists.") {
    super(message, 409);
  }
}