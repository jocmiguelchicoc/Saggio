import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrar Service Worker para soporte PWA offline y auto-actualización
if ('serviceWorker' in navigator && (import.meta.env.PROD || process.env.NODE_ENV === 'production')) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.update();
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            reg.update();
          }
        });
      })
      .catch((err) => {
        console.log('SW registration failed: ', err);
      });
  });
}

