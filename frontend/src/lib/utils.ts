export function formatLabel(format: string): string {
  const map: Record<string, string> = {
    QR_CODE: 'QR Code', EAN_13: 'EAN-13', EAN_8: 'EAN-8',
    CODE_128: 'Code 128', CODE_39: 'Code 39',
    UPC_A: 'UPC-A', UPC_E: 'UPC-E', MANUAL: 'Manual',
  };
  return map[format] ?? format;
}

export function formatColor(format: string): string {
  if (format === 'QR_CODE') return 'bg-teal-800 text-teal-200';
  if (format === 'MANUAL') return 'bg-neutral-700 text-neutral-300';
  if (format.startsWith('EAN') || format.startsWith('UPC')) return 'bg-blue-900 text-blue-200';
  return 'bg-purple-900 text-purple-200';
}

export function getDeviceInfo(): string {
  return navigator.userAgent.substring(0, 150);
}

export function exportCSV(rows: { id: number; barcodeData: string; format: string; createdAt: string }[]) {
  const header = ['ID', 'Barcode Data', 'Format', 'Scanned At'];
  const body = rows.map(r =>
    [r.id, `"${r.barcodeData.replace(/"/g, '""')}"`, r.format, new Date(r.createdAt).toLocaleString()].join(',')
  );
  const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `scans-${Date.now()}.csv` });
  a.click(); URL.revokeObjectURL(a.href);
}

export function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(); osc.stop(ctx.currentTime + 0.25);
  } catch { }
}

export function groupByDay(dates: string[]): Record<string, number> {
  return dates.reduce<Record<string, number>>((acc, d) => {
    const day = d.substring(0, 10);
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});
}

export function countOccurrences<T extends string>(arr: T[]): { value: T; count: number }[] {
  const map = arr.reduce<Record<string, number>>((acc, v) => { acc[v] = (acc[v] ?? 0) + 1; return acc; }, {});
  return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([value, count]) => ({ value: value as T, count }));
}
