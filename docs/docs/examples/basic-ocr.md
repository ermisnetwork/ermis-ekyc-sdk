---
sidebar_position: 1
---

# Example: Basic OCR

Extract information from an identity document using the eKYC SDK.

## HTML + JavaScript

```html
<input type="file" id="frontInput" accept="image/*" />
<input type="file" id="backInput" accept="image/*" />
<button onclick="runOcr()">Run OCR</button>
<pre id="result"></pre>

<script type="module">
  import { EkycService, DocumentType } from "ermis-ekyc-sdk";

  const ekyc = EkycService.getInstance({
    baseUrl: "https://ekyc-api.ktssolution.com/api/ekyc",
    apiKey: "your-api-key",
  });

  window.runOcr = async () => {
    const front = document.getElementById("frontInput").files[0];
    const back = document.getElementById("backInput").files[0];

    try {
      const result = await ekyc.performOcr({
        documentFront: front,
        documentBack: back,
        documentType: DocumentType.CCCD,
      });

      document.getElementById("result").textContent = JSON.stringify(
        result,
        null,
        2,
      );
    } catch (error) {
      console.error("OCR failed:", error);
    }
  };
</script>
```

## React Component

```tsx
import { useState } from "react";
import { EkycService, DocumentType } from "ermis-ekyc-sdk";
import type { OcrResponse } from "ermis-ekyc-sdk";

const ekyc = EkycService.getInstance({
  baseUrl: "https://ekyc-api.ktssolution.com/api/ekyc",
  apiKey: "your-api-key",
});

function OcrExample() {
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [result, setResult] = useState<OcrResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOcr = async () => {
    if (!front) return;
    setLoading(true);

    try {
      const ocrResult = await ekyc.performOcr({
        documentFront: front,
        documentBack: back || undefined,
        documentType: DocumentType.CCCD,
      });
      setResult(ocrResult);
    } catch (error) {
      console.error("OCR failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>OCR Document Extraction</h2>

      <label>Front side:</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFront(e.target.files?.[0] || null)}
      />

      <label>Back side:</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setBack(e.target.files?.[0] || null)}
      />

      <button onClick={handleOcr} disabled={!front || loading}>
        {loading ? "Processing..." : "Run OCR"}
      </button>

      {result && (
        <div>
          <h3>Result</h3>
          <p>
            <strong>Full Name:</strong> {result.full_name}
          </p>
          <p>
            <strong>ID Number:</strong> {result.id_number}
          </p>
          <p>
            <strong>Date of Birth:</strong> {result.date_of_birth}
          </p>
          <p>
            <strong>Gender:</strong> {result.gender}
          </p>
          <p>
            <strong>Nationality:</strong> {result.nationality}
          </p>
        </div>
      )}
    </div>
  );
}
```

## Using Base64 Input

If you have a base64-encoded image (e.g., from a canvas capture):

```typescript
import { EkycService, base64ToBlob } from "ermis-ekyc-sdk";

// Capture from canvas
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const base64 = canvas.toDataURL("image/jpeg");

// You can pass the base64 string directly
const result = await ekyc.performOcr({
  documentFront: base64, // base64 string works!
  documentType: DocumentType.CCCD,
});

// Or convert manually if needed
const blob = base64ToBlob(base64, "image/jpeg");
```
