# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-05

### Added

- OCR document extraction (CCCD, Passport, GPLX)
- Liveness detection with passive mode and anti-spoofing checks
- Face match comparison with configurable threshold
- Full eKYC flow orchestration (OCR → Liveness → Face Match)
- TypeScript types and declaration files
- Custom error handling with `EkycError` and typed error codes
- Base64 to Blob conversion utilities
- Flexible input support: `File`, `Blob`, or base64 strings
