import { GlobalHttpException } from "@app/common/filters/error-http-exception";
import { HttpStatus } from "@nestjs/common";

/**
 * A centralized error handler for `catch` blocks.
 *
 * If the error is a known `GlobalHttpException`, it's re-thrown.
 * Otherwise, it's wrapped in a generic 500 Internal Server Error.
 * The `never` return type indicates this function always throws.
 *
 * @param {any} error The caught error object.
 * @param {string} fallbackMessage A user-friendly message for unknown errors.
 * @throws {GlobalHttpException} Always throws an exception.
 */
export function handleError(error: any, fallbackMessage: string): never {
  if (error instanceof GlobalHttpException) throw error;
  throw new GlobalHttpException(
    HttpStatus.INTERNAL_SERVER_ERROR,
    fallbackMessage,
    error.message,
  );
}