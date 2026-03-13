import { describe, it, expect } from "vitest";
import { enLocale } from "./en";
import { viLocale } from "./vi";
import type { EkycLocale } from "./types";

/**
 * Helper: recursively collect all keys of a nested object as dot-separated paths.
 */
function collectKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...collectKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

describe("Locale", () => {
  describe("enLocale", () => {
    it("should have all required top-level sections", () => {
      expect(enLocale).toHaveProperty("preview");
      expect(enLocale).toHaveProperty("room");
      expect(enLocale).toHaveProperty("panel");
    });

    it("should have non-empty string values for all keys", () => {
      const keys = collectKeys(enLocale as unknown as Record<string, unknown>);
      for (const key of keys) {
        const value = key
          .split(".")
          .reduce(
            (obj, k) => (obj as Record<string, unknown>)[k],
            enLocale as unknown,
          );
        expect(
          value,
          `enLocale.${key} should be a non-empty string`,
        ).toBeTruthy();
        expect(typeof value, `enLocale.${key} should be a string`).toBe(
          "string",
        );
      }
    });
  });

  describe("viLocale", () => {
    it("should have all required top-level sections", () => {
      expect(viLocale).toHaveProperty("preview");
      expect(viLocale).toHaveProperty("room");
      expect(viLocale).toHaveProperty("panel");
    });

    it("should have non-empty string values for all keys", () => {
      const keys = collectKeys(viLocale as unknown as Record<string, unknown>);
      for (const key of keys) {
        const value = key
          .split(".")
          .reduce(
            (obj, k) => (obj as Record<string, unknown>)[k],
            viLocale as unknown,
          );
        expect(
          value,
          `viLocale.${key} should be a non-empty string`,
        ).toBeTruthy();
        expect(typeof value, `viLocale.${key} should be a string`).toBe(
          "string",
        );
      }
    });
  });

  describe("Locale completeness – en vs vi", () => {
    it("should have the same keys in both locales", () => {
      const enKeys = collectKeys(
        enLocale as unknown as Record<string, unknown>,
      );
      const viKeys = collectKeys(
        viLocale as unknown as Record<string, unknown>,
      );
      expect(enKeys).toEqual(viKeys);
    });

    it("preview section should have the same keys", () => {
      const enKeys = Object.keys(enLocale.preview).sort();
      const viKeys = Object.keys(viLocale.preview).sort();
      expect(enKeys).toEqual(viKeys);
    });

    it("room section should have the same keys", () => {
      const enKeys = Object.keys(enLocale.room).sort();
      const viKeys = Object.keys(viLocale.room).sort();
      expect(enKeys).toEqual(viKeys);
    });

    it("panel section should have the same keys", () => {
      const enKeys = Object.keys(enLocale.panel).sort();
      const viKeys = Object.keys(viLocale.panel).sort();
      expect(enKeys).toEqual(viKeys);
    });
  });

  describe("Type safety", () => {
    it("enLocale should satisfy EkycLocale type", () => {
      const locale: EkycLocale = enLocale;
      expect(locale).toBeDefined();
    });

    it("viLocale should satisfy EkycLocale type", () => {
      const locale: EkycLocale = viLocale;
      expect(locale).toBeDefined();
    });
  });
});
