import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/brew_note/",
  server: {
    host: true,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
});
