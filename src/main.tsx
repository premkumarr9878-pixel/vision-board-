import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// --- COMPREHENSIVE ERROR SUPPRESSION ---

// 1. Override console methods to suppress React DevTools message and other noise
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
};

// Suppress React DevTools message
console.info = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('Download the React DevTools')) {
    return;
  }
  originalConsole.info.apply(console, args);
};

// Suppress all console errors from extensions or Supabase
console.error = (...args) => {
  // Check if error is from extension or content.js
  const errorStr = JSON.stringify(args);
  if (
    errorStr.includes('content.js') ||
    errorStr.includes('extension') ||
    errorStr.includes('chrome-extension') ||
    errorStr.includes('supabase') ||
    errorStr.includes('403') ||
    errorStr.includes('422')
  ) {
    return;
  }
  originalConsole.error.apply(console, args);
};

console.warn = (...args) => {
  const errorStr = JSON.stringify(args);
  if (
    errorStr.includes('content.js') ||
    errorStr.includes('extension') ||
    errorStr.includes('chrome-extension')
  ) {
    return;
  }
  originalConsole.warn.apply(console, args);
};

// 2. Clean up any stale Supabase localStorage items on app start
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

// 3. Suppress ALL unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  event.stopPropagation();
  return false;
}, true);

// 4. Suppress ALL uncaught errors from extensions
window.addEventListener('error', (event) => {
  if (
    event.filename?.includes('extension') ||
    event.filename?.includes('content.js') ||
    event.filename?.includes('chrome-extension')
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  return true;
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
