import { describe, it, expect, beforeEach } from "vitest";
import { EkycService } from "./EkycService";
import { EkycError, EkycErrorCode } from "./errors/EkycError";

describe("EkycService", () => {
  beforeEach(() => {
    // Reset singleton before each test
    EkycService.resetInstance();
  });

  describe("Singleton pattern", () => {
    it("should create instance with valid config", () => {
      const service = EkycService.getInstance({
        baseUrl: "https://api.example.com",
        apiKey: "test-api-key",
      });

      expect(service).toBeInstanceOf(EkycService);
    });

    it("should return the same instance on subsequent calls", () => {
      const first = EkycService.getInstance({
        baseUrl: "https://api.example.com",
        apiKey: "test-api-key",
      });
      const second = EkycService.getInstance();

      expect(first).toBe(second);
    });

    it("should throw when called without config on first call", () => {
      expect(() => EkycService.getInstance()).toThrow(EkycError);
    });

    it("should allow new instance after reset", () => {
      const first = EkycService.getInstance({
        baseUrl: "https://api1.example.com",
        apiKey: "key-1",
      });

      EkycService.resetInstance();

      const second = EkycService.getInstance({
        baseUrl: "https://api2.example.com",
        apiKey: "key-2",
      });

      expect(first).not.toBe(second);
    });
  });

  describe("Config validation", () => {
    it("should throw for empty baseUrl", () => {
      expect(() =>
        EkycService.getInstance({
          baseUrl: "",
          apiKey: "test-key",
        }),
      ).toThrow(EkycError);
    });

    it("should throw for empty apiKey", () => {
      expect(() =>
        EkycService.getInstance({
          baseUrl: "https://api.example.com",
          apiKey: "",
        }),
      ).toThrow(EkycError);
    });

    it("should throw with INVALID_CONFIG error code", () => {
      try {
        EkycService.getInstance({
          baseUrl: "",
          apiKey: "",
        });
        expect.unreachable("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(EkycError);
        expect((error as EkycError).code).toBe(EkycErrorCode.INVALID_CONFIG);
      }
    });
  });
});
