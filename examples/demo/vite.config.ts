import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/ermis-ekyc-sdk/demo/",
  plugins: [react(), tailwindcss()],
  server: {
    open: true,
    port: 3001,
    allowedHosts: ["tuanmua.bandia.vn"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
});
