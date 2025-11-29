import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Use /terminal/ base for production so assets are routed correctly via Vercel rewrites
  const base = mode === 'production' ? '/terminal/' : '/';
  return {
    base,
    server: {
      port: 3000,
      host: '0.0.0.0',
      fs: {
        allow: ['..']
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
