import { useState } from 'react';
import type { ScanRecord } from '../../types/index';
import { formatLabel, formatColor, exportCSV } from '../../lib/utils';

interface Props {
  scans: ScanRecord[];
  loading: boolean;
  onRefresh: () => void;
}

export default function HistoryView({ scans, loading, onRefresh }: Props) {
  const [search, setSearch] = useState('');

  const filtered = scans.filter(r =>
    r.barcodeData.toLowerCase().includes(search.toLowerCase()) ||
    formatLabel(r.format).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total', val: scans.length, color: 'text-teal-400' },
          { label: 'QR Codes', val: scans.filter(r => r.format === 'QR_CODE').length, color: 'text-blue-400' },
          { label: 'Barcodes', val: scans.filter(r => r.format !== 'QR_CODE' && r.format !== 'MANUAL').length, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-neutral-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
          </svg>
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by value or format…"
            className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>
        <button onClick={() => exportCSV(filtered)}
          title="Export CSV"
          className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          CSV
        </button>
        <button onClick={onRefresh}
          className="bg-teal-700 hover:bg-teal-600 text-white p-2 rounded-xl transition-all">
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.13-3.87M20 15a9 9 0 01-14.13 3.87"/>
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-neutral-600 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-neutral-700 text-sm">
          {search ? 'No results match your search.' : 'No scans yet. Start scanning!'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id}
              className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-3.5 flex items-start gap-3 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-semibold truncate">{r.barcodeData}</p>
                <p className="text-xs text-neutral-600 mt-0.5">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${formatColor(r.format)}`}>
                {formatLabel(r.format)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
