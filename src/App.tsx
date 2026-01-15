import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { SearchProvider } from './contexts/SearchContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ExitGuardProvider } from './contexts/ExitGuardContext';
import { MainLayout } from './components/Layout/MainLayout';

import { MemoDetail } from './components/LogView/MemoDetail';
import { EmptyState } from './components/LogView/EmptyState';
import { SettingsPage } from './pages/SettingsPage';
import { AndroidExitHandler } from './components/AndroidExitHandler';

function App() {
  return (
    <LanguageProvider>
      <ExitGuardProvider>
        <ThemeProvider>
          <SearchProvider>
            <HashRouter>
              <AndroidExitHandler />
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<EmptyState />} />
                  <Route path="memo/new" element={<MemoDetail />} />
                  <Route path="memo/:id" element={<MemoDetail />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </HashRouter>
          </SearchProvider>
        </ThemeProvider>
      </ExitGuardProvider>
    </LanguageProvider>
  );
}

export default App;
