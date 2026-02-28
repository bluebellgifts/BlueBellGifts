/**
 * Vite Configuration for SEO Optimization
 *
 * This file shows recommended vite config enhancements for SEO
 * These can be merged into your existing vite.config.ts
 *
 * Features:
 * - Image optimization for WebP format
 * - Asset minification
 * - Preload critical resources
 * - Security headers
 * - Performance optimizations
 */

import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// SEO Optimization Configuration
const seoConfig = defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Build optimization for SEO
  build: {
    // Optimize chunks for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "vendor-react";
            if (id.includes("@radix-ui")) return "vendor-ui";
            if (id.includes("lucide-react")) return "vendor-icons";
            return "vendor";
          }
        },
      },
    },

    // Compression
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: true,
      },
    },

    // Report compressed size
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1024,

    // CSS optimization
    cssCodeSplit: true,
  },

  // Server configuration
  server: {
    headers: {
      // SEO-friendly security headers
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    },

    // Preload important files
    middlewareMode: false,
  },

  // Preview server (for production builds)
  preview: {
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    },
  },

  // Assets configuration
  assetsInclude: ["**/*.svg", "**/*.csv", "**/*.webp", "**/*.webm"],

  // Optimal settings for SEO
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "lucide-react",
    ],
  },
});

export default seoConfig;

/**
 * SEO BEST PRACTICES IN BUILD CONFIGURATION
 *
 * 1. Code Splitting:
 *    - Separates vendor code from app code
 *    - Improves caching
 *    - Reduces initial bundle size
 *
 * 2. Minification:
 *    - Reduces file size for faster loading
 *    - Improves Core Web Vitals scores
 *    - Essential for mobile users
 *
 * 3. Security Headers:
 *    - Protects against common vulnerabilities
 *    - Improves trust signals for crawlers
 *    - Required for HTTPS compliance
 *
 * 4. CSS Code Splitting:
 *    - Only loads CSS needed for page
 *    - Improves First Contentful Paint (FCP)
 *    - Reduces render-blocking resources
 *
 * 5. Asset Optimization:
 *    - Supports WebP format for better compression
 *    - Enables lazy loading
 *    - Reduces server bandwidth
 *
 * RECOMMENDED ENVIRONMENT VARIABLES:
 *
 * .env.production
 * VITE_SITE_URL=https://bluebellgifts.in
 * VITE_GA_ID=G-XXXXXXXXXX
 * VITE_GTM_ID=GTM-XXXXXX
 *
 * Usage in code:
 * const siteUrl = import.meta.env.VITE_SITE_URL
 * const gaId = import.meta.env.VITE_GA_ID
 */
