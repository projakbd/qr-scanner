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
      } catch (err: any) {
        // If duplicate (409) or bad request (400), remove from queue as it won't succeed later
        if (err.status === 409 || err.status === 400) {
          await removePendingScan(key);
          setPendingCount(c => Math.max(0, c - 1));
          continue;
        }
        break; // Stop for other errors (network, server down)
      }
    }
    setSyncing(false);
    onSynced?.();
  }, [syncing, onSynced, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && navigator.onLine && pendingCount > 0) {
      syncQueue();
    }
  }, [isAuthenticated, pendingCount, syncQueue]);

  useEffect(() => {
    if (isAuthenticated) {
      const handleOnline = () => syncQueue();
      window.addEventListener('online', handleOnline);
      return () => window.removeEventListener('online', handleOnline);
    }
  }, [syncQueue, isAuthenticated]);

  return { enqueueScan, syncQueue, pendingCount, syncing };
}
