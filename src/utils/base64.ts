/**
 * Convert a base64 string to a Blob.
 * Handles various formats: data URL, raw base64, and URL-safe base64.
 *
 * @param base64   - The base64 string to convert
 * @param mimeType - MIME type for the resulting Blob, defaults to 'image/jpeg'
 * @returns Blob created from the base64 data
 * @throws {Error} When the input is a URL or invalid base64
 */
export function base64ToBlob(
  base64: string,
  mimeType: string = "image/jpeg",
): Blob {
  // Cannot convert blob/http URLs directly
  if (base64.startsWith("blob:") || base64.startsWith("http")) {
    throw new Error(
      "Cannot convert URL to Blob directly. Please use the raw base64 data.",
    );
  }

  // Remove data URL prefix if present (handles various image types)
  let base64Data = base64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

  // Also handle other data URL formats (e.g., application/octet-stream)
  base64Data = base64Data.replace(/^data:[^;]+;base64,/, "");

  // Fix URL-safe base64: replace - with + and _ with /
  base64Data = base64Data.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if needed
  while (base64Data.length % 4) {
    base64Data += "=";
  }

  try {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  } catch {
    throw new Error(
      "Invalid base64 string. Please ensure the image data is correct.",
    );
  }
}

/**
 * Ensure input is a Blob. If the input is a base64 string, convert it.
 * If already a Blob or File, return as-is.
 *
 * @param input    - Blob, File, or base64 string
 * @param mimeType - MIME type for conversion, defaults to 'image/jpeg'
 * @returns Blob ready for FormData
 */
export function ensureBlob(
  input: Blob | File | string,
  mimeType: string = "image/jpeg",
): Blob {
  if (input instanceof Blob) {
    return input;
  }

  return base64ToBlob(input, mimeType);
}
