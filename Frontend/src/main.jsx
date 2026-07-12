import { StrictMode } from 'react';
import { createRoot }  from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { initializeData } from './data/dummyData.js';

// Seed localStorage with dummy data on first run.
// Remove this import once the real backend is connected.
initializeData();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
