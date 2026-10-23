import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  const base = mode === 'production' ? '/terminal/' : '/';
  return {
    base,
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.source.html')
        }
      }
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      fs: {
        allow: ['..']
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        '/guestbook': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [
      react(),
      {
        name: 'copy-terminal-html',
        closeBundle() {
          const srcDist = path.resolve(__dirname, 'dist/index.source.html');
          const destDist = path.resolve(__dirname, 'dist/index.html');
          const destRoot = path.resolve(__dirname, 'index.html');
          if (fs.existsSync(srcDist)) {
            fs.copyFileSync(srcDist, destDist);
            fs.copyFileSync(srcDist, destRoot);
            console.log('[copy-terminal-html] Successfully synchronized production terminal index.html');
          }
        }
      }
    ],
    define: {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
