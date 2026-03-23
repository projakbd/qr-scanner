import type { User } from '../../types/index';

type Tab = 'scanner' | 'history' | 'analytics';

interface Props {
  tab: Tab;
  setTab: (t: Tab) => void;
  user: User | null;
  onLogout: () => void;
  pendingCount: number;
  isOnline: boolean;
}

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'scanner', label: 'Scanner', icon: '📷' },
  { key: 'history', label: 'History', icon: '📋' },
  { key: 'analytics', label: 'Analytics', icon: '📊' },
];

export default function Header({ tab, setTab, user, onLogout, pendingCount, isOnline }: Props) {
  return (
    <header className="bg-neutral-900/95 backdrop-blur border-b border-neutral-800 sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2.5"/>
                <path strokeLinecap="round" strokeWidth="2.5" d="M14 14h7M14 17h4M14 20h7"/>
              </svg>
            </div>
            <span className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400 hidden sm:block">
              OmniDevX
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="text-xs bg-amber-700/70 text-amber-200 px-2 py-0.5 rounded-full font-medium">
                Offline
              </span>
            )}
            {pendingCount > 0 && (
              <span className="text-xs bg-orange-700/70 text-orange-200 px-2 py-0.5 rounded-full font-medium">
                {pendingCount} queued
              </span>
            )}

            {user && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-neutral-400 hidden sm:block max-w-[120px] truncate">
                  {user.fullName ?? user.email}
                </span>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="ml-1 text-neutral-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-neutral-800">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="flex gap-1 pb-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-teal-600/20 text-teal-400 border border-teal-600/40'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}>
              <span className="text-base">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
