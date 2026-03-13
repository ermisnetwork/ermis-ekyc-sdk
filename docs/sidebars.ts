import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    "intro",
    {
      type: "category",
      label: "Getting Started",
      items: [
        "getting-started/installation",
        "getting-started/quick-start",
        "getting-started/overall-flow",
      ],
    },
    {
      type: "category",
      label: "Core SDK",
      items: [
        "core-sdk/ekyc-service",
        "core-sdk/ermis-service",
        "core-sdk/meeting-service",
        "core-sdk/error-handling",
      ],
    },
    {
      type: "category",
      label: "React SDK",
      items: [
        "react-sdk/overview",
        "react-sdk/ekyc-meeting-provider",
        "react-sdk/ekyc-meeting-preview",
        "react-sdk/ekyc-meeting-room",
        "react-sdk/ekyc-action-panel",
        "react-sdk/i18n",
      ],
    },
    {
      type: "category",
      label: "Examples",
      items: [
        "examples/basic-ocr",
        "examples/full-ekyc-flow",
        "examples/react-integration",
      ],
    },
  ],
};

export default sidebars;
