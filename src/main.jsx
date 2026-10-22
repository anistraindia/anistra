import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Purge any bloated API cache keys from localStorage so authentication tokens always fit
try {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith('anistra_cache_') || k.startsWith('anistra_jikan_'))) {
      keysToRemove.push(k);
    }
  }
  if (keysToRemove.length > 0) {
    keysToRemove.forEach(k => localStorage.removeItem(k));
    console.warn(`[STORAGE_CLEANUP] Purged ${keysToRemove.length} bloated API cache items from localStorage.`);
  }
} catch (e) {
  console.warn('Storage cleanup notice:', e);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

