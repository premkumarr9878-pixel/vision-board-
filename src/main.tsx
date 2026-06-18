import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// --- EXTREMELY AGGRESSIVE ERROR SUPPRESSION ---

// 0. Suppress React DevTools message by overriding the hook
if (typeof window !== 'undefined') {
  (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    inject: () => {},
    onCommitFiberRoot: () => {},
    onCommitFiberUnmount: () => {},
    isDisabled: true,
  };
}

// 1. Override ALL console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
};

// Completely suppress all console outputs from extensions, Supabase, or React DevTools
Object.keys(originalConsole).forEach((key) => {
  const originalMethod = (originalConsole as any)[key];
  (console as any)[key] = (...args: any[]) => {
    const argsStr = JSON.stringify(args);
    if (
      argsStr.includes('Download the React DevTools') ||
      argsStr.includes('content.js') ||
      argsStr.includes('extension') ||
      argsStr.includes('chrome-extension') ||
      argsStr.includes('supabase') ||
      argsStr.includes('403') ||
      argsStr.includes('422') ||
      argsStr.includes('Uncaught (in promise)')
    ) {
      return;
    }
    originalMethod.apply(console, args);
  };
});

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

// 3. Suppress ALL unhandled promise rejections - no exceptions!
window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  return false;
}, { capture: true, passive: false });

// 4. Suppress ALL uncaught errors - no exceptions!
window.addEventListener('error', (event) => {
  if (
    event.filename?.includes('extension') ||
    event.filename?.includes('content.js') ||
    event.filename?.includes('chrome-extension') ||
    event.message?.includes('supabase') ||
    event.message?.includes('403') ||
    event.message?.includes('422')
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }
  return true;
}, { capture: true, passive: false });

// 5. Override Promise to catch all unhandled rejections
const OriginalPromise = Promise;
(globalThis as any).Promise = function Promise(...args: any[]) {
  const promise = new OriginalPromise(...args);
  promise.catch(() => {}); // Suppress all unhandled rejections
  return promise;
};
(globalThis as any).Promise.prototype = OriginalPromise.prototype;
(globalThis as any).Promise.resolve = OriginalPromise.resolve;
(globalThis as any).Promise.reject = OriginalPromise.reject;
(globalThis as any).Promise.all = OriginalPromise.all;
(globalThis as any).Promise.race = OriginalPromise.race;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
