import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { formatLabel, formatColor, playBeep } from '../../lib/utils';
import type { ScanRecord } from '../../types/index';

interface Props {
  onScan: (barcodeData: string, format: string) => Promise<ScanRecord | null>;
  pendingCount: number;
}

export default function ScannerView({ onScan, pendingCount }: Props) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<{ data: string; format: string } | null>(null);
  const [flash, setFlash] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  const [manualEntry, setManualEntry] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const lockRef = useRef(false);
  const lastCodeRef = useRef<{ data: string; time: number } | null>(null);

  const startScanner = useCallback(async () => {
    setCameraError(null);
    try {
      const devices = await Html5Qrcode.getCameras();
      if (!devices?.length) { setCameraError('No camera found on this device.'); return; }
      if (!scannerRef.current) scannerRef.current = new Html5Qrcode('html5-qrcode-reader');
      if (scannerRef.current.isScanning) return;
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 12, qrbox: { width: 260, height: 260 } } as any,
        (decodedText, result) => {
          const fmt = result.result.format?.formatName ?? 'QR_CODE';
          handleSuccess(decodedText, fmt);
        },
        () => {}
      );
    } catch (err: any) {
      setCameraError(
        err?.name === 'NotAllowedError' || String(err).includes('Permission')
          ? 'Camera permission denied. Use manual entry below or allow camera access in browser settings.'
          : `Camera error: ${err?.message ?? err}`
      );
    }
  }, []);

  useEffect(() => {
    if (!startedRef.current) { startedRef.current = true; startScanner(); }
    return () => { scannerRef.current?.stop().catch(() => {}); };
  }, [startScanner]);

  const handleSuccess = useCallback(async (data: string, format: string) => {
    if (lockRef.current) return;

    const now = Date.now();
    if (lastCodeRef.current?.data === data && now - lastCodeRef.current.time < 2500) {
      return;
    }

    lockRef.current = true;
    lastCodeRef.current = { data, time: now };

    playBeep();
    setLastScan({ data, format });
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
    setSubmitting(true);
    setSubmitMsg(null);

    try {
      const result = await onScan(data, format);
      setSubmitMsg(result
        ? { ok: true, msg: `Saved (${formatLabel(format)})` }
        : { ok: false, msg: 'Queued offline' }
      );
    } catch (err: any) {
      setSubmitMsg({ ok: false, msg: err.message || 'Error saving scan' });
    } finally {
      setSubmitting(false);
      lockRef.current = false;
    }
  }, [onScan]);

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const val = manualEntry.trim();
    if (!val) return;
    handleSuccess(val, 'MANUAL');
    setManualEntry('');
  };

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="bg-amber-900/40 border border-amber-700/60 text-amber-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
          <span className="text-base">⏳</span>
          {pendingCount} scan{pendingCount > 1 ? 's' : ''} queued offline — will sync when back online
        </div>
      )}

      {flash && lastScan && (
        <div className="bg-teal-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl text-center animate-pulse shadow-lg">
          ✓ {lastScan.data}
        </div>
      )}

      <div className={`rounded-2xl overflow-hidden border-2 transition-colors duration-300 bg-black ${
        flash ? 'border-teal-400 shadow-lg shadow-teal-900/40' : 'border-neutral-700'
      }`}>
        {cameraError ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center min-h-[250px]">
            <svg className="w-10 h-10 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            </svg>
            <p className="text-neutral-400 text-sm">{cameraError}</p>
            <button onClick={startScanner}
              className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all">
              Retry
            </button>
          </div>
        ) : (
          <div id="html5-qrcode-reader" className="w-full" />
        )}
      </div>

      <p className="text-xs text-neutral-600 text-center">
        QR Code · EAN-13 · EAN-8 · Code 128 · Code 39 · UPC-A/E
      </p>

      {lastScan && (
        <div className={`rounded-xl border p-4 transition-all duration-500 ${
          flash ? 'bg-teal-900/50 border-teal-600' : 'bg-neutral-800 border-neutral-700'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-neutral-500 mb-1">Last Scanned</p>
              <p className="font-mono font-semibold text-base break-all">{lastScan.data}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${formatColor(lastScan.format)}`}>
              {formatLabel(lastScan.format)}
            </span>
          </div>
          {submitMsg && (
            <p className={`mt-2 text-xs font-medium ${submitMsg.ok ? 'text-teal-400' : 'text-amber-400'}`}>
              {submitting ? '…' : submitMsg.msg}
            </p>
          )}
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
          Manual Entry Fallback
        </h2>
        <form onSubmit={submitManual} className="flex gap-2">
          <input
            type="text" value={manualEntry}
            onChange={e => setManualEntry(e.target.value)}
            placeholder="Type barcode or QR value…"
            className="flex-1 bg-neutral-800 text-white rounded-xl px-3 py-2.5 text-sm border border-neutral-600 focus:outline-none focus:border-teal-500 transition-all"
          />
          <button type="submit" disabled={!manualEntry.trim()}
            className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
