import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './contexts/ToastContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { Auth0Provider } from '@auth0/auth0-react';
import { TimePeriodProvider } from './contexts/TimePeriodContext.tsx';
import { SavingsProvider } from './contexts/SavingsContext.tsx';
import { GoodDeedsProvider } from './contexts/GoodDeedsContext.tsx';
import { ChoresProvider } from './contexts/ChoresContext.tsx';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

console.log('domain', domain)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: "openid profile email",
      }}
    >
      <ToastProvider>
        <ExpenseProvider>
          <TimePeriodProvider>
            <SavingsProvider>
              <GoodDeedsProvider>
                <ChoresProvider>
                  <App />
                </ChoresProvider>
              </GoodDeedsProvider>
            </SavingsProvider>
          </TimePeriodProvider>
        </ExpenseProvider>
      </ToastProvider>
    </Auth0Provider>
  </StrictMode>
);
