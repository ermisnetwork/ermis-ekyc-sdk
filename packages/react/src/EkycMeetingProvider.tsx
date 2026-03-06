import React, { createContext, useContext, useMemo } from "react";
import { ErmisService } from "ermis-ekyc-sdk";

// ============================================================
// Ekyc Meeting Context
// ============================================================

export interface EkycMeetingConfig {
  // Placeholder for future configs (theme, locale, etc.)
}

const EkycMeetingContext = createContext<EkycMeetingConfig>({});

// ── Provider ─────────────────────────────────────────────────

export interface EkycMeetingProviderProps extends EkycMeetingConfig {
  /** Base URL of the Ermis API – used to initialize ErmisService singleton */
  baseUrl: string;
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
 * <EkycMeetingProvider baseUrl="https://api-ekyc.ermis.network">
 *   <EkycMeetingPreview joinCode="ABC123" />
 * </EkycMeetingProvider>
 * ```
 */
export function EkycMeetingProvider({
  baseUrl,
  children,
  ...config
}: EkycMeetingProviderProps) {
  // Initialize ErmisService singleton (idempotent – safe to call multiple times)
  useMemo(() => {
    ErmisService.getInstance({ baseUrl });
  }, [baseUrl]);

  const value = useMemo(() => ({ ...config }), [config]);

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
