import React, { createContext, useContext, useMemo } from "react";
import { ErmisService, EkycService } from "ermis-ekyc-sdk";
import type { EkycLocale } from "./locale/types";
import { viLocale } from "./locale/vi";

// ============================================================
// Ekyc Meeting Context
// ============================================================

export interface EkycMeetingConfig {
  /** URL of the meeting server (host) */
  meetingHostUrl: string;
  /** URL of the meeting node */
  meetingNodeUrl: string;
  /** Current locale */
  locale: EkycLocale;
}

const EkycMeetingContext = createContext<EkycMeetingConfig>({
  meetingHostUrl: "",
  meetingNodeUrl: "",
  locale: viLocale,
});

// ── Provider ─────────────────────────────────────────────────

export interface EkycMeetingProviderProps {
  /** URL of the meeting server (host) */
  meetingHostUrl: string;
  /** URL of the meeting node */
  meetingNodeUrl: string;
  /** Base URL of the Ermis management API (meeting/registrant/session) */
  ermisApiUrl: string;
  /** Base URL of the eKYC API (OCR, Liveness, Face Match) */
  ekycApiUrl: string;
  /** API key for eKYC API authentication */
  ekycApiKey: string;
  /**
   * Locale for i18n. Defaults to Vietnamese (`viLocale`).
   * Pass `enLocale` for English or a custom `EkycLocale` object.
   */
  locale?: EkycLocale;
  children: React.ReactNode;
}

/**
 * Initializes `ErmisService` and `EkycService` singletons, then wraps child components.
 *
 * Must be rendered **before** any `EkycMeetingPreview` or `EkycMeetingRoom`.
 *
 * @example
 * ```tsx
 * import { EkycMeetingProvider, enLocale } from "ermis-ekyc-react";
 *
 * <EkycMeetingProvider
 *   ermisApiUrl="https://api-ekyc.ermis.network"
 *   ekycApiUrl="https://ekyc-api.ktssolution.com/api/ekyc"
 *   ekycApiKey="your-api-key"
 *   meetingHostUrl="https://meet.ermis.network"
 *   meetingNodeUrl="https://node.ermis.network"
 *   locale={enLocale}
 * >
 *   <EkycMeetingPreview joinCode="ABC123" />
 * </EkycMeetingProvider>
 * ```
 */
export function EkycMeetingProvider({
  ermisApiUrl,
  ekycApiUrl,
  ekycApiKey,
  meetingHostUrl,
  meetingNodeUrl,
  locale = viLocale,
  children,
}: EkycMeetingProviderProps) {
  // Initialize ErmisService singleton (management API)
  useMemo(() => {
    ErmisService.getInstance({ baseUrl: ermisApiUrl });
  }, [ermisApiUrl]);

  // Initialize EkycService singleton (OCR / Liveness / Face Match API)
  useMemo(() => {
    try {
      EkycService.getInstance({ baseUrl: ekycApiUrl, apiKey: ekycApiKey });
    } catch {
      // Already initialized – singleton pattern, ignore
    }
  }, [ekycApiUrl, ekycApiKey]);

  const value = useMemo<EkycMeetingConfig>(
    () => ({ meetingHostUrl, meetingNodeUrl, locale }),
    [meetingHostUrl, meetingNodeUrl, locale],
  );

  return (
    <EkycMeetingContext.Provider value={value}>
      {children}
    </EkycMeetingContext.Provider>
  );
}

// ── Hooks ────────────────────────────────────────────────────

export function useEkycMeetingConfig() {
  return useContext(EkycMeetingContext);
}

/** Access the current locale */
export function useEkycLocale(): EkycLocale {
  return useContext(EkycMeetingContext).locale;
}
