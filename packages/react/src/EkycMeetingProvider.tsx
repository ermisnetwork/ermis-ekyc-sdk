import React, { createContext, useContext, useMemo } from "react";
import { ErmisService } from "ermis-ekyc-sdk";

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
  /** Base URL of the Ermis eKYC API – used to initialize ErmisService singleton */
  ekycApiUrl: string;
  children: React.ReactNode;
}

/**
 * Initializes `ErmisService` and wraps child components.
 *
 * Must be rendered **before** any `EkycMeetingPreview` or `EkycMeetingRoom`.
 * Ensures the singleton is ready so child components can safely call
 * `ErmisService.getInstance()`.
 *
 * @example
 * ```tsx
 * <EkycMeetingProvider
 *   ekycApiUrl="https://api-ekyc.ermis.network"
 *   meetingServerUrl="https://meet.ermis.network"
 *   meetingNodeUrl="https://node.ermis.network"
 * >
 *   <EkycMeetingPreview joinCode="ABC123" />
 * </EkycMeetingProvider>
 * ```
 */
export function EkycMeetingProvider({
  ekycApiUrl,
  meetingHostUrl,
  meetingNodeUrl,
  children,
}: EkycMeetingProviderProps) {
  // Initialize ErmisService singleton (idempotent – safe to call multiple times)
  useMemo(() => {
    ErmisService.getInstance({ baseUrl: ekycApiUrl });
  }, [ekycApiUrl]);

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
