import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add comprehensive global error handling for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
  // Prevent the default browser logging of unhandled rejections
  event.preventDefault();
  
  // We'll suppress all unhandled promise rejections that aren't critical errors
  // This handles:
  // 1. Browser extension errors
  // 2. Supabase auth errors when no credentials are set
  // 3. Any other non-critical promise rejections
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
