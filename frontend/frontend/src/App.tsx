import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar';
import { AnalyticsPage } from './features/analytics/pages/AnalyticsPage';
import { SettingPage } from './features/setting/page/SettingPage';
import SubscriptionPage from './features/subscription/pages/SubscriptionPage';
import UserPage from './features/user/pages/UserPage';
import './App.css';
import Language from './components/Language';
import { AuthProvider } from './components/AuthContext';
import useAuth from './components/useAuth';
import SubLock from './components/SubLock';
import AuthPage from './features/auth/AuthPage';
import './i18n';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </Router>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return (
    <>
      <Language />
      {isAuthenticated ? (
        <SubLock>
          <div className="app-root">
            <Sidebar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<AnalyticsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingPage />} />
                <Route path="/subscribe" element={<SubscriptionPage />} />
                <Route path="/user" element={<UserPage />} />
              </Routes>
            </main>
          </div>
        </SubLock>
      ) : (
        <Routes>
          <Route path="*" element={<AuthPage />} />
        </Routes>
      )}
    </>
  );
}

export default App;
