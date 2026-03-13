import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EkycMeetingProvider, useEkycLocale, useEkycMeetingConfig } from "./EkycMeetingProvider";
import { enLocale } from "./locale/en";
import { viLocale } from "./locale/vi";

// Helper component to read context
function ConfigReader() {
  const config = useEkycMeetingConfig();
  return React.createElement("pre", null, JSON.stringify(config));
}

function LocaleReader() {
  const locale = useEkycLocale();
  return React.createElement("span", null, locale.preview.title);
}

describe("EkycMeetingProvider", () => {
  const baseProps = {
    meetingHostUrl: "https://meet.example.com",
    meetingNodeUrl: "https://node.example.com",
    ermisApiUrl: "https://api.example.com",
    ekycApiUrl: "https://ekyc.example.com",
    ekycApiKey: "test-key",
  };

  it("should render children", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        EkycMeetingProvider,
        baseProps,
        React.createElement("div", null, "Hello"),
      ),
    );
    expect(html).toContain("Hello");
  });

  it("should provide meeting config via context", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        EkycMeetingProvider,
        baseProps,
        React.createElement(ConfigReader),
      ),
    );
    expect(html).toContain("https://meet.example.com");
    expect(html).toContain("https://node.example.com");
  });

  it("should default to viLocale", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        EkycMeetingProvider,
        baseProps,
        React.createElement(LocaleReader),
      ),
    );
    expect(html).toContain(viLocale.preview.title);
  });

  it("should use custom locale when provided", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        EkycMeetingProvider,
        { ...baseProps, locale: enLocale },
        React.createElement(LocaleReader),
      ),
    );
    expect(html).toContain(enLocale.preview.title);
  });
});

describe("useEkycMeetingConfig default values", () => {
  it("should return default config outside provider", () => {
    const html = renderToStaticMarkup(React.createElement(ConfigReader));
    // renderToStaticMarkup encodes quotes as &quot;
    expect(html).toContain("meetingHostUrl");
    expect(html).toContain("meetingNodeUrl");
  });
});
