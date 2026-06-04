import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const users = getUsers();

      if (mode === 'signup') {
        if (!name.trim())        { setError('Please enter your full name.'); return; }
        if (username.length < 3) { setError('Username must be at least 3 characters.'); return; }
        if (password.length < 4) { setError('Password must be at least 4 characters.'); return; }
        if (users[username])     { setError('Username already taken — try signing in.'); return; }

        const fresh = {
          name: name.trim(),
          password,
          stats: {
            xp: 0, streak: 0, dailyXP: 0, dailyXPGoal: 100,
            completedUnits: [], quizScores: [],
            activityLog: Array(28).fill(0),
          },
        };
        users[username] = fresh;
        saveUsers(users);
        saveSession(username);
        onLogin(username, fresh.name, fresh.stats);
      } else {
        if (!users[username])                        { setError('User not found — please sign up first.'); return; }
        if (users[username].password !== password)   { setError('Incorrect password.'); return; }
        saveSession(username);
        onLogin(username, users[username].name, users[username].stats);
      }
    }, 400);
  };

  const switchMode = () => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); };

  return (
    <div className="min-h-screen bg-ivory flex font-noto">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-forest flex-col items-center justify-center p-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 600">
            <path d="M0 600 V200 C0 0 200 0 200 0 C200 0 400 0 400 200 V600 H0" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10 text-center space-y-8 max-w-sm">
          <div>
            <h1 className="text-6xl font-tiro text-marigold mb-2">AwadhVaani</h1>
            <p className="text-sm uppercase tracking-[0.3em] opacity-60 font-bold">Awadh ki Bhaakha</p>
          </div>
          <div className="w-24 h-1 bg-marigold/40 mx-auto rounded-full" />
          <p className="text-xl font-tiro leading-relaxed opacity-80">
            "अवध की भाषा सीखो, संस्कृति को जानो।"
          </p>
          <p className="text-sm opacity-50 italic">Learn the language of Awadh, know its culture.</p>

          <div className="grid grid-cols-3 gap-4 mt-12">
            {[
              { icon: '📖', label: '18 Lessons' },
              { icon: '🎙️', label: 'Voice Practice' },
              { icon: '🐘', label: '4 Folk Stories' },
            ].map(f => (
              <div key={f.label} className="bg-white/10 rounded-2xl p-4 text-center border border-white/10">
                <div className="text-2xl mb-1">{f.icon}</div>
                <p className="text-[10px] font-bold uppercase opacity-70">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo (mobile) */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-4xl font-tiro text-saffron">AwadhVaani</h1>
            <p className="text-xs uppercase tracking-widest text-forest font-bold mt-1">Awadh ki Bhaakha</p>
          </div>

          <div>
            <h2 className="text-3xl font-tiro text-forest">
              {mode === 'signin' ? 'Swagat hai! 🙏' : 'Namaskar! 🌸'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {mode === 'signin' ? 'Sign in to continue your Awadhi journey.' : 'Create your account and start learning Awadhi.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <Field label="Full Name" value={name} onChange={setName} placeholder="e.g. Rohan Yadav" type="text" />
            )}
            <Field label="Username" value={username} onChange={setUsername} placeholder="e.g. rohan123" type="text" />
            <Field label="Password" value={password} onChange={setPassword} placeholder="Min 4 characters" type="password" />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-saffron text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-saffron/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Please wait…' : mode === 'signin' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          <div className="text-center">
            <span className="text-slate-400 text-sm">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button onClick={switchMode} className="text-saffron font-bold text-sm hover:underline decoration-2">
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {/* Demo hint */}
          {mode === 'signin' && (
            <div className="bg-ivory border border-marigold/20 rounded-2xl p-4 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Demo Account</p>
              <p className="text-xs text-slate-500">Username: <span className="font-bold text-forest">demo</span> &nbsp;·&nbsp; Password: <span className="font-bold text-forest">demo</span></p>
              <button
                type="button"
                onClick={() => { setUsername('demo'); setPassword('demo'); setError(''); }}
                className="mt-2 text-[10px] text-saffron font-bold hover:underline"
              >
                Autofill demo credentials
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, value, onChange, placeholder, type }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required
      className="w-full bg-ivory border-2 border-marigold/20 focus:border-saffron outline-none rounded-2xl px-4 py-3 text-sm text-forest font-medium placeholder:text-slate-300 transition-colors"
    />
  </div>
);

// ── localStorage helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = 'awadhvaani_users';
export const SESSION_KEY = 'awadhvaani_session';

export function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
export function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}
export function saveSession(username) {
  localStorage.setItem(SESSION_KEY, username);
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
export function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

// Seed a demo account if it doesn't exist yet
(function seedDemo() {
  const users = getUsers();
  if (!users.demo) {
    users.demo = {
      name: 'Rohan Yadav',
      password: 'demo',
      stats: {
        xp: 4850, streak: 14, dailyXP: 65, dailyXPGoal: 100,
        completedUnits: [1], quizScores: [],
        activityLog: Array.from({ length: 28 }, (_, i) => (i % 3 === 0 ? 2 : i % 5 === 0 ? 1 : 0)),
      },
    };
    saveUsers(users);
  }
})();
