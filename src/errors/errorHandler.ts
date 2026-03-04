import axios, { AxiosError } from "axios";
import { EkycError, EkycErrorCode } from "./EkycError";

/**
 * Centralized error handler.
 * Converts Axios errors and other errors into EkycError
 * with meaningful information for consumers.
 */

interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Handle errors from Axios and convert them into EkycError.
 *
 * @param error   - Original error (Axios or any)
 * @param context - Error context (e.g. 'OCR', 'LIVENESS', 'FACE_MATCH')
 * @returns EkycError with detailed information
 */
export function handleApiError(error: unknown, context?: string): EkycError {
  const prefix = context ? `[${context}] ` : "";

  // ── Axios Error ──────────────────────────────────────────
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // Timeout
    if (axiosError.code === "ECONNABORTED") {
      return new EkycError(
        `${prefix}Request timed out. Please try again.`,
        EkycErrorCode.TIMEOUT_ERROR,
        undefined,
        { originalCode: axiosError.code },
      );
    }

    // Network error (no response)
    if (!axiosError.response) {
      return new EkycError(
        `${prefix}Network error. Please check your internet connection.`,
        EkycErrorCode.NETWORK_ERROR,
        undefined,
        { originalMessage: axiosError.message },
      );
    }

    // Server responded with an error
    const { status, data } = axiosError.response;
    const serverMessage = data?.message || data?.error || axiosError.message;

    // 401 – Authentication failed
    if (status === 401) {
      return new EkycError(
        `${prefix}Authentication failed. Please check your API key.`,
        EkycErrorCode.AUTHENTICATION_FAILED,
        status,
        data?.details,
      );
    }

    // Map context → EkycErrorCode
    const contextCodeMap: Record<string, EkycErrorCode> = {
      OCR: EkycErrorCode.OCR_FAILED,
      LIVENESS: EkycErrorCode.LIVENESS_FAILED,
      FACE_MATCH: EkycErrorCode.FACE_MATCH_FAILED,
    };

    const errorCode =
      (context && contextCodeMap[context]) || EkycErrorCode.UNKNOWN;

    return new EkycError(
      `${prefix}${serverMessage}`,
      errorCode,
      status,
      data?.details,
    );
  }

  // ── Already an EkycError ──────────────────────────────────
  if (error instanceof EkycError) {
    return error;
  }

  // ── Unknown error ─────────────────────────────────────────
  const message = error instanceof Error ? error.message : String(error);

  return new EkycError(
    `${prefix}Unknown error: ${message}`,
    EkycErrorCode.UNKNOWN,
  );
}
