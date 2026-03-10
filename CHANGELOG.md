# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — ermis-ekyc-react

### Added

- **Composable `EkycActionPanel`** — Detached from `EkycMeetingRoom`, can be rendered anywhere (sidebar, drawer, modal)
- **`EkycMeetingRoom` `forwardRef`** — Exposes `remoteVideoRef` via `EkycMeetingRoomRef` for external access
- **Per-step eKYC callbacks** — `onOcrComplete`, `onLivenessComplete`, `onFaceMatchComplete` on `EkycActionPanel`
- **i18n locale system** — `EkycLocale` type, `viLocale` (Vietnamese, default), `enLocale` (English)
- **`useEkycLocale()` hook** — Access current locale from custom components
- **CSS custom properties theming** — 20+ `--ekyc-*` variables with fallback defaults across all components
- **Structured result display** — OCR, Liveness, FaceMatch results shown in typed table format
- **Clear image functionality** — Replace "Recapture" with clear (✕) buttons that reset image state

### Changed

- `EkycMeetingProvider` now accepts `locale` prop (optional, defaults to `viLocale`)
- All hardcoded Vietnamese strings replaced with locale-driven values
- All hardcoded CSS colors replaced with `var(--ekyc-*, fallback)` pattern
- `EkycMeetingRoom` no longer renders `EkycActionPanel` internally
- Removed `leaveButtonLabel`, `hostLabel`, `guestLabel` props from `EkycMeetingRoom` (use locale instead)

---

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
