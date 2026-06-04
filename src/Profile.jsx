import React, { useMemo } from 'react';
import lessons from './data/lessons.json';
import { aggregateStats } from './voiceUtils';

const LEVELS = [
  { min: 0,    label: 'Naya Seekhne Wala' },
  { min: 500,  label: 'Shabd Gyata' },
  { min: 1000, label: 'Vakya Vichar' },
  { min: 2000, label: 'Awadhi Pracharak' },
  { min: 4000, label: 'Awadh Shikshak' },
  { min: 8000, label: 'Ramkatha Gyani' },
];

function getLevel(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return { num: i + 1, label: LEVELS[i].label, next: LEVELS[i + 1]?.min ?? null };
  }
  return { num: 1, label: LEVELS[0].label, next: LEVELS[1].min };
}

const HEATMAP_COLORS = ['bg-ivory border border-marigold/10', 'bg-marigold/30', 'bg-marigold', 'bg-forest'];

export default function Profile({ stats, user, onLogout }) {
  const { xp, streak, quizScores = [], activityLog = [], completedUnits = [], voiceStats = {} } = stats ?? {};
  const voiceAgg = useMemo(() => aggregateStats(voiceStats), [voiceStats]);

  const level = useMemo(() => getLevel(xp), [xp]);

  const quizAccuracy = useMemo(() => {
    if (!quizScores.length) return null;
    const totalCorrect = quizScores.reduce((s, q) => s + q.correct, 0);
    const totalQ = quizScores.reduce((s, q) => s + q.total, 0);
    return totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : null;
  }, [quizScores]);

  const totalLessons = useMemo(() => lessons.reduce((s, u) => s + u.lessons.length, 0), []);
  const vocabPct = Math.min(100, Math.round((completedUnits.length / lessons.length) * 100));
  const quizPct = quizAccuracy ?? 0;
  const speakingPct = Math.min(100, Math.round((xp / 80)));
  const culturalPct = Math.min(100, Math.round(completedUnits.length >= 5 ? 80 : completedUnits.length * 14));

  const levelPct = level.next
    ? Math.round(((xp - LEVELS[level.num - 1].min) / (level.next - LEVELS[level.num - 1].min)) * 100)
    : 100;

  const ACHIEVEMENTS = [
    { icon: '🥇', title: 'Fast Learner',  unlocked: xp >= 1000 },
    { icon: '🗣️', title: 'Speaker',       unlocked: quizScores.length > 0 },
    { icon: '📚', title: 'Storyteller',   unlocked: true },
    { icon: '🔥', title: '14-Day Streak', unlocked: streak >= 14 },
    { icon: '💎', title: '5000 XP',       unlocked: xp >= 5000 },
    { icon: '🏆', title: 'Quiz Master',   unlocked: quizScores.some(q => q.correct / q.total >= 0.8) },
  ];

  return (
    <div className="grid grid-cols-12 gap-8 animate-fadeIn">
      {/* LEFT COLUMN */}
      <div className="col-span-4 space-y-6">
        {/* User card */}
        <div className="bg-white p-8 rounded-[2.5rem] border-b-4 border-marigold shadow-sm text-center">
          <div className="w-32 h-32 bg-marigold rounded-full mx-auto mb-4 border-4 border-ivory shadow-lg flex items-center justify-center text-5xl font-black text-white">
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <h2 className="text-2xl font-bold text-forest font-tiro">{user?.name ?? 'Learner'}</h2>
          <p className="text-sm text-slate-400">@{user?.username ?? ''}</p>
          <div className="mt-4 inline-block bg-saffron/10 text-saffron px-4 py-1 rounded-full font-bold text-xs uppercase">
            Level {level.num}: {level.label}
          </div>

          {/* XP + level progress */}
          <div className="mt-6 space-y-1 text-left px-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>XP to next level</span>
              <span className="text-forest">{xp.toLocaleString()} / {level.next?.toLocaleString() ?? '∞'}</span>
            </div>
            <div className="h-2 bg-ivory rounded-full overflow-hidden border border-marigold/10">
              <div className="h-full bg-saffron rounded-full transition-all duration-700" style={{ width: `${levelPct}%` }} />
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="bg-ivory rounded-xl py-3 border border-marigold/10">
              <p className="text-xl font-black text-saffron">{xp.toLocaleString()}</p>
              <p className="text-[9px] uppercase text-slate-400 font-bold">Total XP</p>
            </div>
            <div className="bg-ivory rounded-xl py-3 border border-marigold/10">
              <p className="text-xl font-black text-forest">{streak}</p>
              <p className="text-[9px] uppercase text-slate-400 font-bold">Day Streak</p>
            </div>
            <div className="bg-ivory rounded-xl py-3 border border-marigold/10">
              <p className="text-xl font-black text-marigold">{quizScores.length}</p>
              <p className="text-[9px] uppercase text-slate-400 font-bold">Quizzes</p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={onLogout}
          className="w-full border-2 border-red-200 text-red-400 hover:bg-red-50 py-3 rounded-2xl font-bold text-sm transition"
        >
          ⎋ Sign Out
        </button>

        {/* Achievements */}
        <div className="bg-forest p-6 rounded-[2rem] text-white">
          <h4 className="font-bold mb-4 border-b border-white/10 pb-2 text-sm">Achievements</h4>
          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENTS.map(a => (
              <div
                key={a.title}
                title={a.unlocked ? a.title : `🔒 ${a.title}`}
                className={`flex flex-col items-center gap-1 transition-all ${a.unlocked ? '' : 'grayscale opacity-30'}`}
              >
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl border border-white/5 hover:bg-white/20 transition cursor-help">
                  {a.icon}
                </div>
                <p className="text-[8px] text-white/60 text-center leading-tight">{a.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="col-span-8 space-y-6">
        {/* Skill bars */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm">
          <h3 className="font-tiro text-2xl text-saffron mb-6">Learning Progress</h3>
          <div className="space-y-6">
            <SkillBar label="Speaking" pct={speakingPct} />
            <SkillBar label="Quiz Accuracy" pct={quizPct} note={quizAccuracy === null ? 'Take a quiz to unlock' : null} />
            <SkillBar label="Vocabulary Units" pct={vocabPct} />
            <SkillBar label="Cultural Knowledge" pct={culturalPct} />
          </div>
        </div>

        {/* Activity heatmap */}
        <div className="bg-ivory border border-marigold/20 p-8 rounded-[2.5rem]">
          <h4 className="font-bold text-forest mb-4">Activity Heatmap</h4>
          <div className="flex gap-1.5">
            {(activityLog.length ? activityLog : Array(28).fill(0)).map((v, i) => (
              <div
                key={i}
                title={`Day ${i + 1}: ${['No activity', 'Light', 'Medium', 'Heavy'][v] ?? 'No activity'}`}
                className={`flex-1 h-8 rounded-sm cursor-help transition-all hover:opacity-70 ${HEATMAP_COLORS[v] ?? HEATMAP_COLORS[0]}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <p className="text-[10px] text-slate-400 uppercase font-bold flex-1">Past 4 Weeks of Awadhi Practice</p>
            <div className="flex items-center gap-1 text-[9px] text-slate-400">
              <div className="w-3 h-3 rounded-sm bg-ivory border border-marigold/10" /> None
              <div className="w-3 h-3 rounded-sm bg-marigold/30 ml-2" /> Light
              <div className="w-3 h-3 rounded-sm bg-marigold ml-2" /> Good
              <div className="w-3 h-3 rounded-sm bg-forest ml-2" /> Great
            </div>
          </div>
        </div>

        {/* Voice Practice Stats */}
        {voiceAgg.totalAttempts > 0 && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-marigold/10">
            <h3 className="font-tiro text-2xl text-saffron mb-6 flex items-center gap-2">🎙️ Voice Practice</h3>
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-ivory rounded-2xl py-4 text-center border border-marigold/10">
                <p className="text-2xl font-black text-forest">{voiceAgg.totalAttempts}</p>
                <p className="text-[9px] uppercase font-bold text-slate-400 mt-1">Recordings</p>
              </div>
              <div className="bg-ivory rounded-2xl py-4 text-center border border-marigold/10">
                <p className="text-2xl font-black text-green-500">{voiceAgg.masteredCount}</p>
                <p className="text-[9px] uppercase font-bold text-slate-400 mt-1">Mastered ≥80%</p>
              </div>
              <div className="bg-ivory rounded-2xl py-4 text-center border border-marigold/10">
                <p className="text-2xl font-black text-marigold">{voiceAgg.avgScore}%</p>
                <p className="text-[9px] uppercase font-bold text-slate-400 mt-1">Avg Score</p>
              </div>
              <div className="bg-ivory rounded-2xl py-4 text-center border border-marigold/10">
                <p className="text-2xl font-black text-red-400">{voiceAgg.weakCount}</p>
                <p className="text-[9px] uppercase font-bold text-slate-400 mt-1">Weak Words</p>
              </div>
            </div>

            {voiceAgg.bestPhrase && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-2xl mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-1">Best Pronunciation</p>
                <p className="font-tiro text-xl text-forest">{voiceAgg.bestPhrase}</p>
                <p className="text-xs text-green-600 mt-1 font-bold">{voiceAgg.bestScore}% score</p>
              </div>
            )}

            {Object.keys(voiceAgg.categoryStats).length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Accuracy by Category</p>
                <div className="space-y-2">
                  {Object.entries(voiceAgg.categoryStats).map(([cat, s]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-xs text-forest font-bold w-44 truncate">{cat}</span>
                      <div className="flex-1 h-2 bg-ivory rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.avg >= 80 ? 'bg-green-400' : s.avg >= 50 ? 'bg-marigold' : 'bg-red-400'}`}
                          style={{ width: `${s.avg}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-500 w-10 text-right">{s.avg}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Last quiz summary */}
        {quizScores.length > 0 && (() => {
          const last = quizScores[quizScores.length - 1];
          const acc = Math.round((last.correct / last.total) * 100);
          return (
            <div className="bg-saffron/10 border border-saffron/20 p-6 rounded-[2rem]">
              <h4 className="font-bold text-saffron mb-4 text-sm uppercase tracking-wide">Last Quiz Result</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-2xl font-black text-forest">+{last.score}</p><p className="text-[10px] text-slate-400 uppercase font-bold">XP Earned</p></div>
                <div><p className="text-2xl font-black text-forest">{last.correct}/{last.total}</p><p className="text-[10px] text-slate-400 uppercase font-bold">Correct</p></div>
                <div><p className="text-2xl font-black text-forest">{acc}%</p><p className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</p></div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

const SkillBar = ({ label, pct, note }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
      <span>{label}</span>
      <span>{note ?? `${pct}%`}</span>
    </div>
    <div className="w-full bg-ivory h-2 rounded-full border border-marigold/10">
      <div className="bg-saffron h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  </div>
);
