import React from 'react';

const LEVELS = [
  { min: 0,    title: 'Naya Seekhne Wala', icon: '🌱' },
  { min: 500,  title: 'Shabd Gyani',        icon: '📖' },
  { min: 1500, title: 'Bhaasha Prem',       icon: '💬' },
  { min: 3000, title: 'Awadhi Praveen',     icon: '🎯' },
  { min: 5000, title: 'Lok Kavi',           icon: '🏛️' },
  { min: 8000, title: 'Ramkatha Gyani',     icon: '🏆' },
];

function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) if (xp >= LEVELS[i].min) return { ...LEVELS[i], index: i };
  return { ...LEVELS[0], index: 0 };
}

export default function ProfileM({ stats, user, onLogout }) {
  const level = getLevel(stats.xp);
  const nextLevel = LEVELS[level.index + 1];
  const pct = nextLevel ? Math.round(((stats.xp - level.min) / (nextLevel.min - level.min)) * 100) : 100;
  const accuracy = stats.quizScores?.length > 0
    ? Math.round(stats.quizScores.reduce((s, q) => s + q.correct / q.total, 0) / stats.quizScores.length * 100)
    : 0;

  return (
    <div className="space-y-4 pb-4 animate-fadeIn">
      {/* Avatar + level */}
      <div className="bg-forest text-white rounded-3xl p-6 text-center shadow-lg">
        <div className="w-20 h-20 bg-marigold rounded-full flex items-center justify-center text-3xl font-black text-white mx-auto mb-3 shadow-lg">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-tiro">{user?.name}</h2>
        <p className="text-xs opacity-60 mt-0.5">@{user?.username}</p>
        <div className="mt-3 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
          <span className="text-lg">{level.icon}</span>
          <span className="text-sm font-bold">{level.title}</span>
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-marigold rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs opacity-60 mt-1">
          {nextLevel ? `${stats.xp} / ${nextLevel.min} XP to ${nextLevel.title}` : 'Max level reached!'}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total XP" val={stats.xp.toLocaleString()} icon="⚡" />
        <StatCard label="Day Streak" val={`${stats.streak} 🔥`} icon="🔥" />
        <StatCard label="Quizzes" val={stats.quizScores?.length ?? 0} icon="📝" />
        <StatCard label="Accuracy" val={`${accuracy}%`} icon="🎯" />
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-3xl p-5 border border-marigold/20 shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-forest mb-4">Badges</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🥇', title: 'Fast Learner', unlocked: stats.xp >= 1000 },
            { icon: '🗣️', title: 'Speaker', unlocked: (stats.quizScores?.length ?? 0) > 0 },
            { icon: '📚', title: 'Storyteller', unlocked: true },
            { icon: '🔥', title: '14-Day Streak', unlocked: stats.streak >= 14 },
            { icon: '💎', title: '5000 XP', unlocked: stats.xp >= 5000 },
            { icon: '🏆', title: 'Quiz Master', unlocked: stats.quizScores?.some(q => q.correct / q.total >= 0.8) ?? false },
          ].map((b, i) => (
            <div key={i} className={`flex flex-col items-center gap-1 ${b.unlocked ? '' : 'opacity-40 grayscale'}`} title={b.title}>
              <div className="w-12 h-12 bg-ivory rounded-full flex items-center justify-center text-2xl border border-marigold/10">{b.icon}</div>
              <p className="text-[9px] text-center font-bold text-slate-500 leading-tight">{b.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button onClick={onLogout} className="w-full py-4 rounded-2xl font-bold text-red-400 border-2 border-red-200 bg-red-50 active:scale-95 transition">
        ⎋ Sign Out
      </button>
    </div>
  );
}

const StatCard = ({ label, val, icon }) => (
  <div className="bg-white rounded-2xl p-4 border border-marigold/10 shadow-sm text-center">
    <p className="text-2xl mb-1">{icon}</p>
    <p className="text-xl font-black text-forest">{val}</p>
    <p className="text-[10px] uppercase font-bold text-slate-400">{label}</p>
  </div>
);
