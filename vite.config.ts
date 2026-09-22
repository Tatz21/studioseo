import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crawlerApiPlugin } from './server/crawlerApi';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crawlerApiPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
