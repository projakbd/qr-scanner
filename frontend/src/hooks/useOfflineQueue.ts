import { useState, useEffect, useCallback } from 'react';
import { queueScan, getPendingScans, removePendingScan } from '../lib/db';
import { apiPostScan } from '../lib/api';
import type { PendingScan } from '../types/index';

export function useOfflineQueue(isAuthenticated: boolean, onSynced?: () => void) {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(async () => {
    const items = await getPendingScans();
    setPendingCount(items.length);
  }, []);

  useEffect(() => { refreshCount(); }, [refreshCount]);

  const enqueueScan = useCallback(async (barcodeData: string, format: string, deviceInfo?: string) => {
    if (navigator.onLine && isAuthenticated) {
      try {
        return await apiPostScan(barcodeData, format, deviceInfo);
      } catch {
        // If the online attempt fails, fall through to queue
      }
    }
    const pending: PendingScan = { barcodeData, format, deviceInfo, queuedAt: new Date().toISOString() };
    await queueScan(pending);
    setPendingCount(c => c + 1);
    return null;
  }, [isAuthenticated]);

  const syncQueue = useCallback(async () => {
    if (!navigator.onLine || syncing || !isAuthenticated) return;
    setSyncing(true);
    const items = await getPendingScans();
    for (const { key, scan } of items) {
      try {
        await apiPostScan(scan.barcodeData, scan.format, scan.deviceInfo);
        await removePendingScan(key);
        setPendingCount(c => Math.max(0, c - 1));
      } catch { break; }
    }
    setSyncing(false);
    onSynced?.();
  }, [syncing, onSynced, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      window.addEventListener('online', syncQueue);
      return () => window.removeEventListener('online', syncQueue);
    }
  }, [syncQueue, isAuthenticated]);

  return { enqueueScan, syncQueue, pendingCount, syncing };
}
