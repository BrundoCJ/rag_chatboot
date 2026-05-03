// Error handling utilities
export class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export const ForbiddenError = (msg: string) =>
  new HttpError(403, msg);
