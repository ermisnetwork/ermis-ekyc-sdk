import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "Ermis eKYC SDK",
  tagline: "Identity verification SDK for OCR, Liveness Detection & Face Match",
  favicon: "img/favicon.png",

  future: {
    v4: true,
  },

  // GitHub Pages
  url: "https://ermisnetwork.github.io",
  baseUrl: "/ermis-ekyc-sdk/",

  organizationName: "ermisnetwork",
  projectName: "ermis-ekyc-sdk",
  trailingSlash: false,

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "anonymous",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "description",
        content:
          "TypeScript SDK for identity verification (eKYC) – OCR, Liveness Detection, Face Match, and video meeting components for React.",
      },
    },
  ],

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/ermisnetwork/ermis-ekyc-sdk/tree/main/docs/",
        },
        blog: false, // Disable blog
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    metadata: [
      {
        name: "keywords",
        content:
          "ekyc, ocr, liveness, face-match, typescript, react, sdk, identity-verification, ermis",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    colorMode: {
      defaultMode: "light",
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Ermis eKYC SDK",
      logo: {
        alt: "Ermis eKYC SDK Logo",
        src: "img/favicon.png",
        width: 32,
        height: 32,
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          href: "https://github.com/ermisnetwork/ermis-ekyc-sdk",
          label: "GitHub",
          position: "right",
        },
        {
          href: "https://www.npmjs.com/package/ermis-ekyc-sdk",
          label: "npm",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            { label: "Getting Started", to: "/docs/" },
            { label: "Core SDK", to: "/docs/core-sdk/ekyc-service" },
            { label: "React SDK", to: "/docs/react-sdk/overview" },
            { label: "Examples", to: "/docs/examples/basic-ocr" },
          ],
        },
        {
          title: "Resources",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/ermisnetwork/ermis-ekyc-sdk",
            },
            {
              label: "npm – ermis-ekyc-sdk",
              href: "https://www.npmjs.com/package/ermis-ekyc-sdk",
            },
            {
              label: "npm – ermis-ekyc-react",
              href: "https://www.npmjs.com/package/ermis-ekyc-react",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Ermis Network. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "json"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
