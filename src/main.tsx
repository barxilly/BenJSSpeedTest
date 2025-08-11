import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './polyfills'
import App from './App.tsx'
import { registerServiceWorker, setupInstallPrompt } from './pwa.ts'

// Register service worker and setup PWA
registerServiceWorker();
setupInstallPrompt();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    
    <App />
  </StrictMode>,
)
