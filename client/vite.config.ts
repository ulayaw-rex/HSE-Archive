import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          if (_req.originalUrl?.endsWith(".mjs")) {
            res.setHeader("Content-Type", "application/javascript");
          }
          next();
        });
      },
    },
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    // Suppress warnings for chunks under 700KB (some admin pages are large)
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — rarely changes, long cache life
          "vendor-react": ["react", "react-dom"],
          // Router — separate so React updates don't bust router cache
          "vendor-router": ["react-router-dom"],
          // Data-fetching layer
          "vendor-query": ["@tanstack/react-query"],
          // Carousel — lazy-loaded, so this chunk is only fetched when needed
          "vendor-slick": ["react-slick", "slick-carousel"],
          // Icons — large package, deserves its own cache bucket
          "vendor-icons": ["react-icons"],
        },
      },
    },
  },
});

