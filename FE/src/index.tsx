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
import { BrowserRouter } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SessionContextProvider supabaseClient={supabaseClient}>
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
      </SessionContextProvider>
    </BrowserRouter>
  </StrictMode>
);