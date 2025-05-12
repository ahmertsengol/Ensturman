import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    hmr: {
      overlay: false, // Disable the error overlay
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: mode === 'development', // Only generate source maps in development
    // Minimize output for better performance
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
  },
  // Set source map quality and error handling options
  css: {
    devSourcemap: true, // Enable CSS source maps in development
  },
  // Provide clearer JS source maps and fix for source map errors
  optimizeDeps: {
    entries: ['**/*.jsx'], // Explicitly process all JSX files
  },
}))
