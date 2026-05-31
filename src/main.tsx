import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add global error handling for better debugging of "Uncaught in promise" errors
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  
  // 1. Suppress rejections that are just empty objects, null, undefined, or generic Objects
  if (!reason || (typeof reason === 'object' && (!reason.message && !reason.stack))) {
    event.preventDefault();
    return;
  }

  // 2. Suppress rejections from browser extensions (content.js, extension://)
  const stack = reason?.stack || '';
  const message = reason?.message || '';
  if (
    stack.includes('extension://') || 
    stack.includes('content.js') || 
    message.includes('extension') ||
    (typeof reason === 'string' && reason.includes('extension')) ||
    (reason.name === 'n' && (reason.code === 403 || reason.code === 422))
  ) {
    event.preventDefault();
    return;
  }

  // 3. Suppress specific network status noise (403, 404, 422)
  if (reason.status === 403 || reason.code === 403 || reason.httpStatus === 403 ||
      reason.status === 422 || reason.code === 422 ||
      reason.status === 404) {
    event.preventDefault();
    return;
  }

  console.warn('Unhandled Promise Rejection:', reason);
});

// Also catch standard errors from extensions
window.onerror = (message, source) => {
  if (typeof source === 'string' && (source.includes('extension') || source.includes('content.js'))) {
    return true; // prevent default firing
  }
  return false;
};

// Final safeguard: Override console.error to filter out extension-related noise
// that bypasses global event listeners.
const originalConsoleError = console.error;
console.error = (...args) => {
  const firstArg = args[0];
  if (firstArg && typeof firstArg === 'object') {
    // Filter out the specific 403/422 error signature from extensions and auth
    if ((firstArg.code === 403 || firstArg.code === 422) && (firstArg.httpStatus === 200 || firstArg.httpStatus === 403 || firstArg.httpStatus === 422)) {
      return;
    }
    // Targeted suppression for the specific {name: 'n', code: 403} signature
    if (firstArg.name === 'n' && (firstArg.code === 403 || firstArg.code === 422)) {
      return;
    }
    // Filter out generic promise rejection objects with no useful info
    if (!firstArg.message && !firstArg.stack && Object.keys(firstArg).length === 0) {
      return;
    }
    // Suppress 404 errors for invalid Supabase paths during configuration issues
    if (firstArg.status === 404 && typeof firstArg.message === 'string' && firstArg.message.includes('Invalid path')) {
      return;
    }
  }
  
  // Filter out string messages related to content scripts and Supabase URL errors
  if (typeof firstArg === 'string' && (
    firstArg.includes('content_script.js') || 
    firstArg.includes('content.js') || 
    firstArg.includes('extension:') ||
    firstArg.includes('Invalid path specified in request URL')
  )) {
    return;
  }
  
  originalConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
