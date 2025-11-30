import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  
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
    
    
    define: {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
