import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './contexts/ToastContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { TimePeriodProvider } from './contexts/TimePeriodContext.tsx';
import { SavingsProvider } from './contexts/SavingsContext.tsx';
import { GoodDeedsProvider } from './contexts/GoodDeedsContext.tsx';
import { ChoresProvider } from './contexts/ChoresContext.tsx';
import { Auth0ProviderWithNavigate } from './components/Auth0ProviderrWIthNavigate.tsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
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
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>
);