import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from './contexts/UserContext.tsx';
import { ToastProvider } from './contexts/ToastContext';
import { ExpenseProvider } from './contexts/ExpenseContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="984750071739-bvac7ntsqccskujin9av3e69urdti499.apps.googleusercontent.com">
      <UserProvider>
        <ToastProvider>
          <ExpenseProvider>
            <App />
          </ExpenseProvider>
        </ToastProvider>
      </UserProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
