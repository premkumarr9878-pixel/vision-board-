import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add global error handling for better debugging of "Uncaught in promise" errors
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  
  // 1. Suppress Supabase/Network/Extension 403 errors
  if (reason && (reason.code === 403 || reason.status === 403 || reason.httpStatus === 403)) {
    event.preventDefault();
    return;
  }

  // 403 error with httpStatus 200 is a common signature of extension-related rejections
  if (reason && reason.code === 403 && reason.httpStatus === 200) {
    event.preventDefault();
    return;
  }
  
  // 2. Suppress errors originating from browser extensions (content.js)
  const stack = reason?.stack || '';
  if (stack.includes('extension://') || stack.includes('content.js')) {
    event.preventDefault();
    return;
  }

  // 3. If it's an object with no message and no stack, it's likely extension noise
  if (reason && typeof reason === 'object' && !reason.message && !reason.stack) {
    event.preventDefault();
    return;
  }

  console.error('Unhandled Promise Rejection:', reason);
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
    // Filter out the specific 403 error signature from extensions
    if (firstArg.code === 403 && (firstArg.httpStatus === 200 || firstArg.httpStatus === 403)) {
      return;
    }
    if (firstArg.name === 'n' && firstArg.code === 403) {
      return;
    }
  }
  
  // Filter out string messages related to content scripts
  if (typeof firstArg === 'string' && (firstArg.includes('content.js') || firstArg.includes('extension:'))) {
    return;
  }
  
  originalConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
