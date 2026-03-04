/**
 * Error codes enum for the eKYC SDK.
 * Helps consumers classify and handle errors accurately.
 */
export enum EkycErrorCode {
  /** Network error (no connection, timeout) */
  NETWORK_ERROR = "NETWORK_ERROR",

  /** Request timeout */
  TIMEOUT_ERROR = "TIMEOUT_ERROR",

  /** OCR extraction failed */
  OCR_FAILED = "OCR_FAILED",

  /** Liveness detection failed */
  LIVENESS_FAILED = "LIVENESS_FAILED",

  /** Face match failed */
  FACE_MATCH_FAILED = "FACE_MATCH_FAILED",

  /** Invalid SDK configuration */
  INVALID_CONFIG = "INVALID_CONFIG",

  /** Authentication failed (invalid API key) */
  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",

  /** Unknown error */
  UNKNOWN = "UNKNOWN",
}

/**
 * Custom Error class for the eKYC SDK.
 * Provides detailed error information including error code,
 * HTTP status code, and additional details.
 */
export class EkycError extends Error {
  /** Classified error code */
  public readonly code: EkycErrorCode;

  /** HTTP status code (if available) */
  public readonly statusCode?: number;

  /** Additional details from the API response */
  public readonly details?: Record<string, unknown>;

  /** Timestamp when the error occurred */
  public readonly timestamp: string;

  constructor(
    message: string,
    code: EkycErrorCode,
    statusCode?: number,
    details?: Record<string, unknown>,
  ) {
    super(message);

    // Ensure correct prototype chain when extending Error
    Object.setPrototypeOf(this, EkycError.prototype);

    this.name = "EkycError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Serialize the error to a plain object for logging or transmission.
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}
