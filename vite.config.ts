import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from your local network
    port: 3050, // Optional: Specify a por
    strictPort: true
  },
});
