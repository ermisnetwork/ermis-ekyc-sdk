---
slug: /
sidebar_position: 1
---

# Ermis eKYC SDK

A TypeScript SDK for identity verification (eKYC) with **two modules**:

1. **ErmisService** – Management APIs (auth, customers, appraisers, appraisal sessions) using Bearer token authentication
2. **EkycService** – eKYC APIs (OCR, Liveness, Face Match) using API key authentication

## Packages

| Package                                                              | Description                                  | npm                                                   |
| -------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| [`ermis-ekyc-sdk`](https://www.npmjs.com/package/ermis-ekyc-sdk)     | Core SDK – TypeScript services & types       | ![npm](https://img.shields.io/npm/v/ermis-ekyc-sdk)   |
| [`ermis-ekyc-react`](https://www.npmjs.com/package/ermis-ekyc-react) | React UI – Meeting components for video eKYC | ![npm](https://img.shields.io/npm/v/ermis-ekyc-react) |

## Features

### Management Module (`ErmisService`)

- 🔐 **Authentication** – Login, register, token management
- 👤 **Customer Management** – CRUD operations with ID card images
- 👨‍💼 **Appraiser Management** – List and create appraisers
- 📋 **Appraisal Sessions** – Create sessions with registrants to generate room codes
- 🔗 **Join with Code** – Use room code to join video eKYC session

### eKYC Module (`EkycService`)

- 📄 **OCR** – Extract information from identity documents (CCCD, Passport)
- 🧬 **Liveness Detection** – Verify a selfie is from a live person (anti-spoofing)
- 🔍 **Face Match** – Compare a selfie with a document photo
- 🚀 **Full Flow** – Orchestrate all 3 steps in a single call
- 🔧 **Flexible Input** – Accepts `File`, `Blob`, or base64 strings

### React UI SDK (`ermis-ekyc-react`)

- 📹 **EkycMeetingPreview** – Camera/mic testing + join with room code
- 🎥 **EkycMeetingRoom** – Video meeting room
- 📋 **EkycActionPanel** – 3-step eKYC panel (OCR → Liveness → Face Match)
- 🌐 **i18n** – Vietnamese/English, custom locales

## Next Steps

- [Installation](/docs/getting-started/installation) – Get up and running in minutes
- [Quick Start](/docs/getting-started/quick-start) – Your first eKYC verification
- [Overall Flow](/docs/getting-started/overall-flow) – Understand the complete architecture
