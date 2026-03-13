import { describe, it, expect } from "vitest";
import { EkycError, EkycErrorCode } from "./EkycError";

describe("EkycError", () => {
  it("should create an error with correct properties", () => {
    const error = new EkycError(
      "Test error",
      EkycErrorCode.INVALID_CONFIG,
      400,
      { field: "apiKey" },
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(EkycError);
    expect(error.name).toBe("EkycError");
    expect(error.message).toBe("Test error");
    expect(error.code).toBe(EkycErrorCode.INVALID_CONFIG);
    expect(error.statusCode).toBe(400);
    expect(error.details).toEqual({ field: "apiKey" });
    expect(error.timestamp).toBeDefined();
  });

  it("should work without optional statusCode and details", () => {
    const error = new EkycError("Network issue", EkycErrorCode.NETWORK_ERROR);

    expect(error.message).toBe("Network issue");
    expect(error.code).toBe(EkycErrorCode.NETWORK_ERROR);
    expect(error.statusCode).toBeUndefined();
    expect(error.details).toBeUndefined();
  });

  it("should serialize to JSON correctly", () => {
    const error = new EkycError(
      "Auth failed",
      EkycErrorCode.AUTHENTICATION_FAILED,
      401,
    );
    const json = error.toJSON();

    expect(json).toEqual({
      name: "EkycError",
      message: "Auth failed",
      code: "AUTHENTICATION_FAILED",
      statusCode: 401,
      details: undefined,
      timestamp: expect.any(String),
    });
  });

  it("should have a valid ISO timestamp", () => {
    const before = new Date().toISOString();
    const error = new EkycError("test", EkycErrorCode.UNKNOWN);
    const after = new Date().toISOString();

    expect(error.timestamp >= before).toBe(true);
    expect(error.timestamp <= after).toBe(true);
  });
});

describe("EkycErrorCode", () => {
  it("should have all expected error codes", () => {
    const expectedCodes = [
      "NETWORK_ERROR",
      "TIMEOUT_ERROR",
      "OCR_FAILED",
      "LIVENESS_FAILED",
      "FACE_MATCH_FAILED",
      "INVALID_CONFIG",
      "AUTHENTICATION_FAILED",
      "INVALID_REGISTRANTS",
      "UNKNOWN",
    ];

    const actualCodes = Object.values(EkycErrorCode);
    expect(actualCodes).toEqual(expect.arrayContaining(expectedCodes));
    expect(actualCodes.length).toBe(expectedCodes.length);
  });
});
