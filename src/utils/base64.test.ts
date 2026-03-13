import { describe, it, expect } from "vitest";
import { base64ToBlob, ensureBlob } from "./base64";

describe("base64ToBlob", () => {
  // "Hello" in base64
  const helloBase64 = btoa("Hello");

  it("should convert raw base64 to Blob", () => {
    const blob = base64ToBlob(helloBase64, "text/plain");

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/plain");
    expect(blob.size).toBe(5); // "Hello" = 5 bytes
  });

  it("should strip data URL prefix with image/jpeg", () => {
    const dataUrl = `data:image/jpeg;base64,${helloBase64}`;
    const blob = base64ToBlob(dataUrl);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("image/jpeg");
    expect(blob.size).toBe(5);
  });

  it("should strip data URL prefix with image/png", () => {
    const dataUrl = `data:image/png;base64,${helloBase64}`;
    const blob = base64ToBlob(dataUrl, "image/png");

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(5);
  });

  it("should strip non-image data URL prefix", () => {
    const dataUrl = `data:application/octet-stream;base64,${helloBase64}`;
    const blob = base64ToBlob(dataUrl, "application/octet-stream");

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(5);
  });

  it("should handle URL-safe base64 characters", () => {
    // URL-safe base64 uses - instead of + and _ instead of /
    // Standard base64 "a+b/c" → URL-safe "a-b_c"
    const urlSafe = helloBase64.replace(/\+/g, "-").replace(/\//g, "_");
    const blob = base64ToBlob(urlSafe, "text/plain");

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(5);
  });

  it("should add padding when needed", () => {
    // "Hi" = "SGk" (missing one = of padding)
    const noPadding = btoa("Hi").replace(/=+$/, "");
    const blob = base64ToBlob(noPadding, "text/plain");

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBe(2);
  });

  it("should default mime type to image/jpeg", () => {
    const blob = base64ToBlob(helloBase64);
    expect(blob.type).toBe("image/jpeg");
  });

  it("should throw for blob: URLs", () => {
    expect(() => base64ToBlob("blob:http://example.com/123")).toThrow(
      "Cannot convert URL to Blob directly",
    );
  });

  it("should throw for http URLs", () => {
    expect(() => base64ToBlob("http://example.com/image.jpg")).toThrow(
      "Cannot convert URL to Blob directly",
    );
  });

  it("should throw for https URLs", () => {
    expect(() => base64ToBlob("https://example.com/image.jpg")).toThrow(
      "Cannot convert URL to Blob directly",
    );
  });

  it("should throw for invalid base64", () => {
    expect(() => base64ToBlob("!!!not-valid-base64!!!")).toThrow(
      "Invalid base64 string",
    );
  });
});

describe("ensureBlob", () => {
  it("should return Blob as-is", () => {
    const blob = new Blob(["test"], { type: "text/plain" });
    const result = ensureBlob(blob);
    expect(result).toBe(blob);
  });

  it("should return File as-is (File extends Blob)", () => {
    const file = new File(["test"], "test.txt", { type: "text/plain" });
    const result = ensureBlob(file);
    expect(result).toBe(file);
  });

  it("should convert base64 string to Blob", () => {
    const base64 = btoa("Hello");
    const result = ensureBlob(base64, "text/plain");

    expect(result).toBeInstanceOf(Blob);
    expect(result.size).toBe(5);
  });
});
