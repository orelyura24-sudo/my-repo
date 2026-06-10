import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the Java backend so the browser never sees a
      // cross-origin request (no CORS setup needed in dev). `ws: true` also
      // proxies the WebSocket upgrade for /api/chat/ws.
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
