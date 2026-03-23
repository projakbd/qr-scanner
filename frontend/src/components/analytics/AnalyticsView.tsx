import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import type { ScanRecord } from '../../types/index';
import { formatLabel, groupByDay, countOccurrences } from '../../lib/utils';

interface Props { scans: ScanRecord[] }

const COLORS = ['#2dd4bf', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#4ade80'];

export default function AnalyticsView({ scans }: Props) {
  const today = new Date();
  const days: { date: string; count: number }[] = [];
  const grouped = groupByDay(scans.map(s => s.createdAt));
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().substring(0, 10);
    days.push({ date: key.slice(5), count: grouped[key] ?? 0 });
  }

  const topCodes = countOccurrences(scans.map(s => s.barcodeData)).slice(0, 8);

  const formatBreakdown = countOccurrences(scans.map(s => s.format)).slice(0, 6);

  const total = scans.length;
  const todayCount = grouped[today.toISOString().substring(0, 10)] ?? 0;
  const avgPerDay = total > 0 ? (total / 14).toFixed(1) : '0';

  if (scans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <span className="text-5xl">📊</span>
        <p className="text-neutral-600 text-sm">No data yet — start scanning to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[
          { label: 'Total Scans', val: total, color: 'text-teal-400' },
          { label: 'Today', val: todayCount, color: 'text-blue-400' },
          { label: 'Avg / Day', val: avgPerDay, color: 'text-pink-400' },
        ].map(k => (
          <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-center">
            <p className={`text-2xl font-bold ${k.color}`}>{k.val}</p>
            <p className="text-xs text-neutral-600 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
        <h3 className="text-sm font-bold text-white mb-4">Scans — Last 14 Days</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={days} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#525252', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#525252', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#171717', border: '1px solid #262626', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#a3a3a3' }} itemStyle={{ color: '#2dd4bf' }}
            />
            <Area type="monotone" dataKey="count" stroke="#2dd4bf" strokeWidth={2} fill="url(#scanGrad)" name="Scans" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {formatBreakdown.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-4">Format Breakdown</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={formatBreakdown.map(f => ({ name: formatLabel(f.value), count: f.count }))}
              margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#525252', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#525252', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#171717', border: '1px solid #262626', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#a3a3a3' }} itemStyle={{ color: '#60a5fa' }} />
              <Bar dataKey="count" name="Scans" radius={[4, 4, 0, 0]}>
                {formatBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {topCodes.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-3">Most Scanned Codes</h3>
          <div className="space-y-2">
            {topCodes.map(({ value, count }, i) => (
              <div key={value} className="flex items-center gap-3">
                <span className="text-neutral-600 text-xs font-mono w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-mono text-xs text-neutral-300 truncate">{value}</span>
                    <span className="text-xs text-neutral-500 ml-2 shrink-0">{count}×</span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all"
                      style={{ width: `${(count / topCodes[0].count) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
