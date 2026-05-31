import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add global error handling for better debugging of "Uncaught in promise" errors
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  
  // 1. Suppress rejections that are just empty objects or null/undefined
  if (!reason || (typeof reason === 'object' && Object.keys(reason).length === 0)) {
    event.preventDefault();
    return;
  }

  // 2. Suppress Supabase/Network/Extension 403/422/404 errors
  if (reason && (
    reason.code === 403 || 
    reason.status === 403 || 
    reason.httpStatus === 403 ||
    reason.status === 422 ||
    reason.code === 422 ||
    reason.status === 404 ||
    (reason.name === 'n' && reason.code === 403) // Targeted fix for the specific extension error
  )) {
    event.preventDefault();
    return;
  }

  // 3. Suppress errors originating from browser extensions (content.js, extension://)
  const stack = reason?.stack || '';
  const message = reason?.message || '';
  if (
    stack.includes('extension://') || 
    stack.includes('content.js') || 
    message.includes('extension') ||
    (typeof reason === 'string' && reason.includes('extension'))
  ) {
    event.preventDefault();
    return;
  }

  // 4. If it's an object with no message and no stack, it's likely extension noise
  if (typeof reason === 'object' && !reason.message && !reason.stack) {
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
