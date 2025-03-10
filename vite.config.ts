import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // historyApiFallback isn't a direct option in Vite
    // We can use middlewareMode and setup custom handling instead
  },
  preview: {
    port: 4000,
  },
  // Add this to handle client-side routing
  build: {
    outDir: 'dist',
  },
})
