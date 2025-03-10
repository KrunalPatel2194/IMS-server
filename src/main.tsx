import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/authContext.tsx'

// Get the client ID from environment variables
// const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// // Validate client ID
// if (!clientId) {
//   console.error('Missing VITE_GOOGLE_CLIENT_ID in environment variables');
// }
// console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <GoogleOAuthProvider clientId={clientId || ''}> */}
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    {/* </GoogleOAuthProvider> */}
  </StrictMode>,
)