import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Get root element from HTML
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    {/* BrowserRouter should only wrap the App once */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
