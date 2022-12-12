import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import checker from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), checker({
    typescript: true,
  })],
  resolve: {
    alias: { '@' : path.resolve(__dirname, './src') },
  },
  server: { port: 3000 },
})
