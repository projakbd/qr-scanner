import React, { useState } from 'react';
import type { AuthState } from '../../hooks/useAuth';

interface Props {
  auth: AuthState;
  onSwitchToSignup: () => void;
}

export default function LoginPage({ auth, onSwitchToSignup }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.login(email, password);
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-600 mb-4 shadow-lg shadow-teal-900/40">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
              <path strokeLinecap="round" strokeWidth="2" d="M14 14h2m3 0h2M14 17h5M14 20h2m3 0h2" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white">OmniDevX Scanner</h1>
          <p className="text-neutral-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={submit}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Email
            </label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-neutral-800 text-white rounded-xl px-4 py-3 text-sm border border-neutral-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-neutral-600"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-800 text-white rounded-xl px-4 py-3 text-sm border border-neutral-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-neutral-600"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] mt-2">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-neutral-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-teal-400 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
