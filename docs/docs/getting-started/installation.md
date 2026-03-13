---
sidebar_position: 1
---

# Installation

## Core SDK

```bash
# npm
npm install ermis-ekyc-sdk

# yarn
yarn add ermis-ekyc-sdk
```

## React UI SDK

If you need the React components for video eKYC meetings:

```bash
# npm
npm install ermis-ekyc-react ermis-ekyc-sdk

# yarn
yarn add ermis-ekyc-react ermis-ekyc-sdk
```

:::info
`ermis-ekyc-react` has `ermis-ekyc-sdk` as a peer dependency, so you need to install both.
:::

## Requirements

- **Node.js** ≥ 18
- **TypeScript** ≥ 5.3 (recommended)
- **React** ≥ 18 (for React SDK only)

## TypeScript Support

Both packages are written in TypeScript and ship with full type declarations. No additional `@types` packages needed.

```typescript
import { EkycService, DocumentType } from "ermis-ekyc-sdk";
import type { OcrRequest, OcrResponse } from "ermis-ekyc-sdk";
```
