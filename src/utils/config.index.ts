// src/config/index.ts
const config = {
    apiUrl: import.meta.env.VITE_API_URL || '/api',
    environment: import.meta.env.VITE_NODE_ENV || 'development',
    // Add other configuration values here
  };
  
  export default config;