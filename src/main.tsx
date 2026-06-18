import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Clean up any stale Supabase localStorage items on app start to prevent 403 errors
(() => {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('supabase') || 
      key.startsWith('sb-') ||
      key.includes('auth_token')
    )) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
})();

// Add comprehensive global error handling for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  // Prevent the default browser logging of unhandled rejections
  event.preventDefault();
  return;
});

// Also handle standard errors
window.onerror = (message, source) => {
  // Suppress errors from browser extensions
  if (typeof source === 'string' && (
    source.includes('extension') || 
    source.includes('content.js') ||
    source.includes('chrome-extension')
  )) {
    return true;
  }
  return false;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
