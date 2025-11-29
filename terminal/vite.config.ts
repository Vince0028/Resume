import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Use /terminal/ base for production so assets are routed correctly via Vercel rewrites
  // Use root (`/`) during local dev so Vite dev server works at localhost:3000
  const base = mode === 'production' ? '/terminal/' : '/';
  return {
    base,
    server: {
      port: 3000,
      host: '0.0.0.0',
      fs: {
        allow: ['..']
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [react()],
    // Avoid inlining secret API keys into the client bundle. Server-side functions
    // should access secrets via environment variables at runtime (Vercel/Netlify dashboard).
    define: {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
