import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '../../styles/globals.css'

// Performance monitoring
if (typeof window !== 'undefined' && 'performance' in window) {
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    console.log('Page load time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
  });
}

// Error boundary for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

// Render with React Strict Mode for development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enable hot module replacement in development
if (import.meta.hot) {
  import.meta.hot.accept();
}