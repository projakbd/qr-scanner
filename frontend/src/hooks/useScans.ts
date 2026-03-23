import { useState, useCallback, useEffect } from 'react';
import { apiGetScans } from '../lib/api';
import type { ScanRecord } from '../types/index';

export function useScans(isAuthenticated: boolean) {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true); setError(null);
    try {
      const res = await apiGetScans();
      setScans(res.data ?? []);
    } catch (e: any) {
      if (e.message !== 'Unauthorized') {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setScans([]);
    }
  }, [isAuthenticated, refresh]);

  const addLocal = useCallback((scan: ScanRecord) => {
    setScans(prev => {
      const exists = prev.findIndex(s => s.id === scan.id);
      if (exists !== -1) {
        const next = [...prev];
        next.splice(exists, 1);
        return [scan, ...next];
      }
      return [scan, ...prev];
    });
  }, []);

  return { scans, loading, error, refresh, addLocal };
}
