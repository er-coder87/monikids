import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { viteStaticCopy } from 'vite-plugin-static-copy';

const isDev = process.env.NODE_ENV === 'development'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteStaticCopy({
    targets: [
      {
        src: 'staticwebapp.config.json',
        dest: '.' // copy to dist/
      }
    ]
  })],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: isDev
    ? {
      https: {
        key: fs.readFileSync(path.resolve(__dirname, 'localhost+2-key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, 'localhost+2.pem')),
      },
      port: 5173,
    }
    : undefined,
})
