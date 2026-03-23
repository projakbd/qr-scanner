import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useScans } from './hooks/useScans';
import { useOfflineQueue } from './hooks/useOfflineQueue';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import Header from './components/layout/Header';
import ScannerView from './components/scanner/ScannerView';
import HistoryView from './components/history/HistoryView';
import AnalyticsView from './components/analytics/AnalyticsView';
import type { ScanRecord } from './types/index';
import { getDeviceInfo } from './lib/utils';

export default function App() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { scans, loading, refresh, addLocal } = useScans(auth.isAuthenticated);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const { enqueueScan, pendingCount, syncQueue } = useOfflineQueue(auth.isAuthenticated, refresh);

  const handleScan = useCallback(async (barcodeData: string, format: string): Promise<ScanRecord | null> => {
    const deviceInfo = getDeviceInfo();
    const result = await enqueueScan(barcodeData, format, deviceInfo);
    if (result?.data) {
      addLocal(result.data as ScanRecord);
      return result.data as ScanRecord;
    }
    return null;
  }, [enqueueScan, addLocal]);

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage auth={auth} onSwitchToSignup={() => navigate('/signup')} />} />
        <Route path="/signup" element={<SignupPage auth={auth} onSwitchToLogin={() => navigate('/login')} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const currentTab = location.pathname === '/history' ? 'history' :
                     location.pathname === '/analytics' ? 'analytics' : 'scanner';

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Header
        tab={currentTab}
        setTab={(t) => navigate(t === 'scanner' ? '/' : `/${t}`)}
        user={auth.user}
        onLogout={() => { auth.logout(); navigate('/login'); }}
        pendingCount={pendingCount}
        isOnline={isOnline}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 pb-20">
        <Routes>
          <Route path="/" element={<ScannerView onScan={handleScan} pendingCount={pendingCount} />} />
          <Route path="/history" element={<HistoryView scans={scans} loading={loading} onRefresh={refresh} />} />
          <Route path="/analytics" element={<AnalyticsView scans={scans} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isOnline && pendingCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
            ⚡ {pendingCount} scan{pendingCount === 1 ? '' : 's'} will sync when online
          </div>
        </div>
      )}
      {isOnline && pendingCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30">
          <button onClick={syncQueue}
            className="bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-teal-500 transition-all">
            🔄 Sync {pendingCount} offline scan{pendingCount === 1 ? '' : 's'}
          </button>
        </div>
      )}
    </div>
  );
}
