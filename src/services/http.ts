import { isAxiosError } from "axios";
import { ValidationError } from "yup";

const GENERIC_ERROR = "Something went wrong. Please try again.";

/** HTTP status of a failed request, or undefined for network/other errors. */
export const getStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;

/**
 * A message safe to show the user. Uses the backend envelope's `message` for 4xx
 * responses (those are written for users); everything else gets a generic message.
 */
export const getErrorMessage = (error: unknown, fallback = GENERIC_ERROR): string => {
  if (isAxiosError(error)) {
    if (!error.response) return "We couldn't reach the server. Check your connection and try again.";
    const status = error.response.status;
    const body: unknown = error.response.data;
    if (status < 500 && typeof body === "object" && body !== null && "message" in body) {
      const message = body.message;
      if (typeof message === "string" && message.trim()) return message;
    }
    return fallback;
  }
  if (error instanceof ValidationError) {
    // The server answered with an unexpected shape.
    return fallback;
  }
  return fallback;
};
