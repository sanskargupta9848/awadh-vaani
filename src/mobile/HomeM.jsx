import React, { useMemo } from 'react';
import vocab from '../data/vocabulary.json';
import lessons from '../data/lessons.json';
import { SpeakButton } from '../speak';

export default function HomeM({ stats, user, onNavigate }) {
  const wordOfDay = useMemo(() => {
    const day = Math.floor(Date.now() / 86400000);
    return vocab[day % vocab.length];
  }, []);
  // Compute live unit progress from the user's actual completedLessons map.
  const unitProgress = (unit) => {
    const completed = stats?.completedLessons ?? {};
    const total = unit.lessons.length;
    if (total === 0) return 0;
    const done = unit.lessons.filter((_, i) => completed[`${unit.id}_${i}`]).length;
    return Math.round((done / total) * 100);
  };
  const currentUnit = useMemo(
    () => lessons.find(u => unitProgress(u) < 100) || lessons[0],
    [stats?.completedLessons]
  );
  const currentUnitPct = unitProgress(currentUnit);
  const dailyPct = Math.min(100, Math.round((stats.dailyXP / stats.dailyXPGoal) * 100));
  const firstName = user?.name?.split(' ')[0] ?? 'Learner';

  return (
    <div className="space-y-4 pb-4 animate-fadeIn">
      {/* Greeting banner */}
      <div className="bg-white rounded-3xl p-6 border-b-4 border-marigold shadow-sm">
        <h2 className="font-tiro text-3xl text-saffron mb-1">नमस्ते, {firstName}!</h2>
        <p className="text-forest text-sm italic opacity-80">"Awadhi ki awaaz, aapki zuban"</p>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <StatPill icon="⚡" label="Daily XP" val={`${stats.dailyXP}/${stats.dailyXPGoal}`} />
          <StatPill icon="🔥" label="Streak" val={`${stats.streak}d`} />
          <StatPill icon="🏆" label="Total XP" val={stats.xp >= 1000 ? `${(stats.xp/1000).toFixed(1)}k` : stats.xp} />
        </div>
        <div className="mt-3 h-2 bg-ivory rounded-full overflow-hidden border border-marigold/10">
          <div className="h-full bg-saffron rounded-full transition-all duration-700" style={{ width: `${dailyPct}%` }} />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">{dailyPct}% of daily goal reached</p>
      </div>

      {/* Continue learning */}
      <div className="bg-white rounded-3xl p-5 border border-marigold/20 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Continue Learning</p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-tiro text-lg text-slate-800 truncate">{currentUnit.emoji} {currentUnit.title}</h3>
            <div className="h-2 bg-ivory rounded-full overflow-hidden my-2">
              <div className="h-full bg-forest rounded-full" style={{ width: `${currentUnitPct}%` }} />
            </div>
            <p className="text-xs text-forest font-bold">{currentUnitPct}% complete</p>
          </div>
          <button onClick={() => onNavigate('Lessons')}
            className="bg-saffron text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition flex-shrink-0">
            Resume →
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '🎙️', title: 'Aawaz Abhyas', sub: 'Voice Practice', color: 'bg-marigold', screen: 'Voice' },
          { icon: '📝', title: 'Pariksha', sub: 'Take a Quiz', color: 'bg-forest', screen: 'Quiz' },
          { icon: '🏛️', title: 'Shabd Bhandar', sub: 'Word Repository', color: 'bg-saffron', screen: 'Repository' },
          { icon: '🐘', title: 'Kahaaniyaan', sub: 'Folk Stories', color: 'bg-forest', screen: 'Stories' },
        ].map(t => (
          <button key={t.screen} onClick={() => onNavigate(t.screen)}
            className="bg-white p-4 rounded-2xl border border-marigold/10 flex items-center gap-3 shadow-sm text-left active:scale-95 transition">
            <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center text-xl flex-shrink-0`}>{t.icon}</div>
            <div className="min-w-0">
              <p className="font-tiro font-bold text-sm text-slate-800 leading-tight truncate">{t.title}</p>
              <p className="text-[10px] text-slate-400">{t.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Word of day */}
      <div className="bg-white rounded-3xl p-5 border border-marigold/20 shadow-sm text-center">
        <p className="text-xs font-black text-saffron uppercase tracking-widest mb-3">Din ka Shabd</p>
        <div className="bg-ivory rounded-2xl py-5 px-4 border-2 border-dashed border-marigold/30 relative">
          <div className="absolute top-2 right-2">
            <SpeakButton text={wordOfDay.awadhi} roman={wordOfDay.roman} size="sm" />
          </div>
          <p className="text-4xl font-tiro text-forest font-bold mb-1">{wordOfDay.awadhi}</p>
          <p className="text-saffron font-bold text-sm">{wordOfDay.roman}</p>
          <p className="text-slate-500 text-sm mt-1 italic">{wordOfDay.eng}</p>
          <span className="inline-block mt-2 text-[10px] bg-ivory text-marigold px-2 py-0.5 rounded font-bold uppercase border border-marigold/20">{wordOfDay.cat}</span>
        </div>
      </div>

      {/* Last quiz */}
      {stats.quizScores?.length > 0 && (() => {
        const last = stats.quizScores[stats.quizScores.length - 1];
        return (
          <div className="bg-saffron/10 border border-saffron/20 rounded-3xl p-5">
            <p className="text-xs font-black uppercase tracking-widest text-saffron mb-3">Last Quiz</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-xl font-black text-forest">+{last.score}</p><p className="text-[10px] text-slate-400 font-bold uppercase">XP</p></div>
              <div><p className="text-xl font-black text-forest">{last.correct}/{last.total}</p><p className="text-[10px] text-slate-400 font-bold uppercase">Correct</p></div>
              <div><p className="text-xl font-black text-forest">{Math.round((last.correct/last.total)*100)}%</p><p className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</p></div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

const StatPill = ({ icon, label, val }) => (
  <div className="bg-ivory rounded-xl p-2 border border-marigold/10 text-center">
    <span className="text-base leading-none">{icon}</span>
    <p className="text-[8px] text-slate-400 uppercase font-bold mt-0.5 leading-none">{label}</p>
    <p className="text-xs font-bold text-forest mt-0.5">{val}</p>
  </div>
);
