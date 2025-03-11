import React from 'react';
import ReactDOM from 'react-dom/client';
import StPaddysBarCrawl from './StPaddysBarCrawl';
import './App.css';

// Add festive shamrock decorations to the page
function addFestiveElements() {
  const container = document.createElement('div');
  container.className = 'shamrock-container';
  
  // Add floating shamrocks
  for (let i = 0; i < 3; i++) {
    const shamrock = document.createElement('div');
    shamrock.className = `floating-shamrock shamrock${i+1}`;
    shamrock.innerText = '☘️';
    container.appendChild(shamrock);
  }
  
  document.body.appendChild(container);
  
  // Add festive theme class to body
  document.body.classList.add('theme-st-patricks');
}

// Handle offline capability
function setupOfflineSupport() {
  // Store bar data in localStorage for offline use
  window.addEventListener('beforeunload', function() {
    const barData = document.getElementById('root').innerHTML;
    try {
      localStorage.setItem('barCrawlData', barData);
      localStorage.setItem('barCrawlTimestamp', new Date().toISOString());
    } catch (e) {
      console.error('Failed to save data for offline use', e);
    }
  });
  
  // Check if we're offline and use stored data
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  function updateOnlineStatus() {
    const statusIndicator = document.createElement('div');
    statusIndicator.style.position = 'fixed';
    statusIndicator.style.top = '5px';
    statusIndicator.style.right = '5px';
    statusIndicator.style.borderRadius = '50%';
    statusIndicator.style.width = '10px';
    statusIndicator.style.height = '10px';
    statusIndicator.style.zIndex = '1000';
    
    if (navigator.onLine) {
      statusIndicator.style.backgroundColor = '#4CAF50';
      statusIndicator.title = 'Online';
    } else {
      statusIndicator.style.backgroundColor = '#F44336';
      statusIndicator.title = 'Offline - Using cached data';
    }
    
    // Remove existing indicator if any
    const existing = document.querySelector('.connection-status');
    if (existing) document.body.removeChild(existing);
    
    statusIndicator.className = 'connection-status';
    document.body.appendChild(statusIndicator);
  }
}

// Initialize the app
function initApp() {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  root.render(
    <React.StrictMode>
      <StPaddysBarCrawl />
    </React.StrictMode>
  );
  
  // Setup mobile and offline features
  addFestiveElements();
  setupOfflineSupport();
}

// Run initialization
initApp();