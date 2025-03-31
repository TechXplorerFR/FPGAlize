import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add the following publicDir configuration to copy all files from public to the build output
  publicDir: 'public',
  // Define build-specific configurations
  build: {
    // Configure Vite to copy the samples directory to the build output
    assetsDir: 'assets',
    rollupOptions: {
      // Explicitly include files in the src/data/samples directory as assets
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
    chunkSizeWarningLimit: 1024,
  },
});
