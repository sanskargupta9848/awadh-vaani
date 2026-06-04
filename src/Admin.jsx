import React, { useState, useCallback } from 'react';
import { getUsers } from './Login';

function parseUsers() {
  const raw = getUsers();
  return Object.entries(raw).map(([username, data]) => {
    const s = data.stats ?? {};
    const quizScores = s.quizScores ?? [];
    const activityLog = s.activityLog ?? Array(28).fill(0);
    const totalCorrect = quizScores.reduce((a, q) => a + q.correct, 0);
    const totalQs = quizScores.reduce((a, q) => a + q.total, 0);
    const accuracy = totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : null;
    const activeDays = activityLog.filter(v => v > 0).length;
    const lastQuiz = quizScores.length > 0 ? quizScores[quizScores.length - 1] : null;
    return {
      username,
      name: data.name ?? username,
      xp: s.xp ?? 0,
      streak: s.streak ?? 0,
      dailyXP: s.dailyXP ?? 0,
      dailyXPGoal: s.dailyXPGoal ?? 100,
      completedUnits: s.completedUnits ?? [],
      quizScores,
      accuracy,
      activeDays,
      activityLog,
      lastQuiz,
      totalCorrect,
      totalQs,
    };
  }).sort((a, b) => b.xp - a.xp);
}

const HEATMAP = ['bg-ivory border border-marigold/20', 'bg-marigold/30', 'bg-marigold', 'bg-forest'];

export default function Admin({ currentUsername }) {
  const [users, setUsers] = useState(() => parseUsers());
  const [selected, setSelected] = useState(null);

  const refresh = useCallback(() => {
    const list = parseUsers();
    setUsers(list);
    if (selected) {
      const updated = list.find(u => u.username === selected.username);
      setSelected(updated ?? null);
    }
  }, [selected]);

  const totalXP = users.reduce((s, u) => s + u.xp, 0);
  const totalQuizzes = users.reduce((s, u) => s + u.quizScores.length, 0);
  const topUser = users[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-forest text-white p-8 rounded-3xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-tiro mb-1">🔧 Admin Panel</h2>
          <p className="opacity-70 text-sm">All registered users and their learning interactions</p>
        </div>
        <button
          onClick={refresh}
          className="bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-2xl text-sm font-bold transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard icon="👥" label="Total Users" value={users.length} />
        <SummaryCard icon="⚡" label="Total XP Earned" value={totalXP.toLocaleString()} />
        <SummaryCard icon="📝" label="Quizzes Taken" value={totalQuizzes} />
        <SummaryCard icon="🏆" label="Top Learner" value={topUser?.name.split(' ')[0] ?? '—'} sub={topUser ? `${topUser.xp.toLocaleString()} XP` : ''} />
      </div>

      <div className="flex gap-6 items-start">
        {/* User table */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-marigold/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-ivory flex items-center justify-between">
            <h3 className="font-bold text-forest">User Leaderboard</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold">{users.length} accounts</p>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ivory/60 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-right">XP</th>
                <th className="px-6 py-3 text-right">Streak</th>
                <th className="px-6 py-3 text-right">Quizzes</th>
                <th className="px-6 py-3 text-right">Accuracy</th>
                <th className="px-6 py-3 text-right">Active Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory">
              {users.map((u, i) => (
                <tr
                  key={u.username}
                  onClick={() => setSelected(selected?.username === u.username ? null : u)}
                  className={`cursor-pointer transition-colors ${
                    selected?.username === u.username
                      ? 'bg-saffron/5 border-l-4 border-l-saffron'
                      : 'hover:bg-ivory/40'
                  }`}
                >
                  <td className="px-6 py-4 font-black text-slate-300 text-base">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0 ${
                        u.username === currentUsername ? 'bg-saffron' : 'bg-marigold'
                      }`}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-none">{u.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">@{u.username}{u.username === currentUsername ? ' · you' : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-forest">{u.xp.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${u.streak >= 7 ? 'text-saffron' : 'text-slate-600'}`}>
                      {u.streak > 0 ? `🔥 ${u.streak}` : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-600">{u.quizScores.length || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    {u.accuracy !== null ? (
                      <span className={`font-bold ${u.accuracy >= 80 ? 'text-green-500' : u.accuracy >= 60 ? 'text-marigold' : 'text-red-400'}`}>
                        {u.accuracy}%
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-600">{u.activeDays} / 28</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-300 text-sm">No users yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 space-y-4 flex-shrink-0">
            <div className="bg-white rounded-3xl border border-marigold/10 shadow-sm p-6 space-y-5">
              {/* User header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-marigold rounded-2xl flex items-center justify-center text-2xl font-black text-white">
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-forest text-lg leading-tight">{selected.name}</h4>
                  <p className="text-xs text-slate-400">@{selected.username}</p>
                </div>
              </div>

              {/* Stat grid */}
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Total XP" val={selected.xp.toLocaleString()} />
                <Stat label="Day Streak" val={selected.streak > 0 ? `🔥 ${selected.streak}` : '0'} />
                <Stat label="Daily XP" val={`${selected.dailyXP} / ${selected.dailyXPGoal}`} />
                <Stat label="Units Done" val={selected.completedUnits.length} />
                <Stat label="Quizzes" val={selected.quizScores.length} />
                <Stat label="Accuracy" val={selected.accuracy !== null ? `${selected.accuracy}%` : '—'} />
              </div>

              {/* Activity heatmap */}
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">28-Day Activity</p>
                <div className="flex gap-1">
                  {selected.activityLog.map((v, i) => (
                    <div key={i} title={`Day ${i + 1}`} className={`flex-1 h-5 rounded-sm ${HEATMAP[v] ?? HEATMAP[0]}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Quiz history */}
            {selected.quizScores.length > 0 && (
              <div className="bg-white rounded-3xl border border-marigold/10 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-ivory">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Quiz History</p>
                </div>
                <div className="divide-y divide-ivory max-h-60 overflow-y-auto">
                  {[...selected.quizScores].reverse().map((q, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-700">{q.correct}/{q.total} correct</p>
                        <p className="text-[10px] text-slate-400">{new Date(q.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-forest text-sm">+{q.score} XP</p>
                        <p className={`text-[10px] font-bold ${Math.round(q.correct/q.total*100) >= 80 ? 'text-green-500' : 'text-marigold'}`}>
                          {Math.round(q.correct / q.total * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelected(null)}
              className="w-full text-xs text-slate-400 hover:text-slate-600 transition font-bold py-2"
            >
              ✕ Close detail
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const SummaryCard = ({ icon, label, value, sub }) => (
  <div className="bg-white rounded-2xl p-5 border border-marigold/10 shadow-sm">
    <p className="text-2xl mb-2">{icon}</p>
    <p className="text-2xl font-black text-forest">{value}</p>
    {sub && <p className="text-[10px] text-saffron font-bold">{sub}</p>}
    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">{label}</p>
  </div>
);

const Stat = ({ label, val }) => (
  <div className="bg-ivory/60 rounded-xl p-3 border border-marigold/10">
    <p className="text-[9px] uppercase font-bold text-slate-400 leading-none">{label}</p>
    <p className="font-bold text-forest text-sm mt-1">{val}</p>
  </div>
);
