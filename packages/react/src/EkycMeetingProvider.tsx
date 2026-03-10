import React, { createContext, useContext, useMemo } from "react";
import { ErmisService, EkycService } from "ermis-ekyc-sdk";

// ============================================================
// Ekyc Meeting Context
// ============================================================

export interface EkycMeetingConfig {
  /** URL of the meeting server (host) */
  meetingHostUrl: string;
  /** URL of the meeting node */
  meetingNodeUrl: string;
}

const EkycMeetingContext = createContext<EkycMeetingConfig>({
  meetingHostUrl: "",
  meetingNodeUrl: "",
});

// ── Provider ─────────────────────────────────────────────────

export interface EkycMeetingProviderProps extends EkycMeetingConfig {
  /** Base URL of the Ermis management API (meeting/registrant/session) */
  ermisApiUrl: string;
  /** Base URL of the eKYC API (OCR, Liveness, Face Match) */
  ekycApiUrl: string;
  /** API key for eKYC API authentication */
  ekycApiKey: string;
  children: React.ReactNode;
}

/**
 * Initializes `ErmisService` and `EkycService` singletons, then wraps child components.
 *
 * Must be rendered **before** any `EkycMeetingPreview` or `EkycMeetingRoom`.
 *
 * @example
 * ```tsx
 * <EkycMeetingProvider
 *   ermisApiUrl="https://api-ekyc.ermis.network"
 *   ekycApiUrl="https://ekyc-api.ktssolution.com/api/ekyc"
 *   ekycApiKey="your-api-key"
 *   meetingHostUrl="https://meet.ermis.network"
 *   meetingNodeUrl="https://node.ermis.network"
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
    () => ({ meetingHostUrl, meetingNodeUrl }),
    [meetingHostUrl, meetingNodeUrl],
  );

  return (
    <EkycMeetingContext.Provider value={value}>
      {children}
    </EkycMeetingContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────

export function useEkycMeetingConfig() {
  return useContext(EkycMeetingContext);
}
