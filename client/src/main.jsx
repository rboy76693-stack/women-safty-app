import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { SocketProvider } from './context/SocketContext';
import ErrorBoundary from './ErrorBoundary';

const USER_ID = '665f1b2c3e4a5b6c7d8e9f00';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <SocketProvider userId={USER_ID}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </SocketProvider>
    </ErrorBoundary>
  </StrictMode>
);
