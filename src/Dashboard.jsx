import React, { useMemo } from 'react';
import vocab from './data/vocabulary.json';
import lessons from './data/lessons.json';
import { SpeakButton } from './speak';

const QUICK_TILES = [
  { icon: '🎙️', title: 'Aawaz Abhyas', sub: 'Voice Practice', color: 'bg-marigold', screen: 'Voice' },
  { icon: '🏛️', title: 'Shabd Bhandar', sub: 'Word Repository', color: 'bg-forest', screen: 'Repository' },
  { icon: '🐘', title: 'Puraani Kahaani', sub: 'Folk Stories', color: 'bg-saffron', screen: 'Stories' },
  { icon: '📝', title: 'Pariksha', sub: 'Take a Quiz', color: 'bg-forest', screen: 'Quiz' },
];

export default function Dashboard({ stats, userName, onNavigate }) {
  // Word of the Day — rotates daily using day-of-year index
  const wordOfDay = useMemo(() => {
    const day = Math.floor(Date.now() / 86400000);
    return vocab[day % vocab.length];
  }, []);

  // Current lesson = first non-100% unit
  const currentUnit = useMemo(() => lessons.find(u => u.progress < 100) || lessons[0], []);
  const dailyPct = Math.round((stats.dailyXP / stats.dailyXPGoal) * 100);

  return (
    <div className="flex gap-8 animate-fadeIn">

      {/* MAIN COLUMN */}
      <div className="flex-1 space-y-8">

        {/* GREETING BANNER */}
        <section className="relative overflow-hidden bg-white p-8 rounded-[2rem] border-b-4 border-marigold shadow-sm">
          <div className="relative z-10">
            <h2 className="font-tiro text-4xl text-saffron mb-2">नमस्ते, {userName?.split(' ')[0] ?? 'Learner'}!</h2>
            <p className="text-forest font-medium italic">"Awadhi ki awaaz, aapki zuban"</p>
            <div className="flex gap-4 mt-6">
              <div className="bg-ivory px-4 py-2 rounded-xl border border-marigold/20 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="text-[10px] uppercase text-slate-500 leading-none">Daily XP</p>
                  <p className="font-bold text-forest">{stats.dailyXP} / {stats.dailyXPGoal}</p>
                </div>
              </div>
              <div className="bg-ivory px-4 py-2 rounded-xl border border-marigold/20 flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <div>
                  <p className="text-[10px] uppercase text-slate-500 leading-none">Streak</p>
                  <p className="font-bold text-forest">{stats.streak} Days</p>
                </div>
              </div>
              <div className="bg-ivory px-4 py-2 rounded-xl border border-marigold/20 flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <div>
                  <p className="text-[10px] uppercase text-slate-500 leading-none">Total XP</p>
                  <p className="font-bold text-forest">{stats.xp.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Daily XP progress bar */}
            <div className="mt-4 max-w-sm">
              <div className="h-2 bg-ivory rounded-full overflow-hidden border border-marigold/10">
                <div className="h-full bg-saffron rounded-full transition-all duration-700" style={{ width: `${dailyPct}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{dailyPct}% of daily goal reached</p>
            </div>
          </div>
          <div className="absolute top-[-20px] right-[-20px] opacity-5 pointer-events-none">
            <svg width="200" height="250" viewBox="0 0 100 120">
              <path d="M0 120 V40 C0 0 50 0 50 0 C50 0 100 0 100 40 V120 H0" fill="currentColor" className="text-saffron" />
            </svg>
          </div>
        </section>

        {/* CONTINUE LEARNING */}
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-marigold/10 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-saffron/10 text-saffron text-xs font-bold px-2 py-1 rounded">Current Unit</span>
              <span className="text-slate-400 text-sm">Unit {currentUnit.id} • {currentUnit.lessons.length} lessons</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1 font-tiro">
              {currentUnit.emoji} {currentUnit.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{currentUnit.lessons.map(l => l.name).join(' · ')}</p>
            <div className="w-full max-w-md bg-ivory h-3 rounded-full overflow-hidden">
              <div className="bg-forest h-full rounded-full shadow-inner transition-all duration-700" style={{ width: `${currentUnit.progress}%` }} />
            </div>
            <p className="text-xs text-forest font-bold mt-2">{currentUnit.progress}% Complete</p>
          </div>
          <button
            onClick={() => onNavigate('Lessons')}
            className="bg-saffron hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-saffron/20 transition-all transform hover:scale-105 active:scale-95 ml-8"
          >
            Resume Learning
          </button>
        </section>

        {/* QUICK ACCESS GRID */}
        <section className="grid grid-cols-2 gap-4">
          {QUICK_TILES.map(tile => (
            <button
              key={tile.screen}
              onClick={() => onNavigate(tile.screen)}
              className="bg-white p-6 rounded-3xl border border-marigold/10 hover:border-saffron/40 cursor-pointer transition-all group flex items-center gap-4 shadow-sm hover:shadow-md text-left w-full"
            >
              <div className={`w-14 h-14 rounded-2xl ${tile.color} flex items-center justify-center text-2xl shadow-inner`}>
                {tile.icon}
              </div>
              <div>
                <h5 className="font-tiro font-bold text-lg text-slate-800 leading-tight group-hover:text-saffron">{tile.title}</h5>
                <p className="text-xs text-slate-400 font-medium">{tile.sub}</p>
              </div>
            </button>
          ))}
        </section>
      </div>

      {/* RIGHT PANEL */}
      <aside className="w-[300px] space-y-6">

        {/* WORD OF THE DAY */}
        <div className="bg-white p-6 rounded-[2rem] border border-marigold/20 text-center shadow-sm">
          <h4 className="font-tiro text-saffron text-lg mb-4">Din ka Shabd</h4>
          <div className="bg-ivory py-8 rounded-2xl border-2 border-dashed border-marigold/30 mb-4 relative">
            <div className="absolute top-3 right-3">
              <SpeakButton text={wordOfDay.awadhi} roman={wordOfDay.roman} size="md" />
            </div>
            <p className="text-5xl font-tiro text-forest font-bold mb-2">{wordOfDay.awadhi}</p>
            <p className="text-saffron font-bold text-sm mt-1">{wordOfDay.roman}</p>
            <p className="text-slate-500 italic text-sm mt-1">{wordOfDay.eng}</p>
            <span className="inline-block mt-3 text-[10px] bg-ivory text-marigold px-2 py-0.5 rounded font-bold uppercase border border-marigold/20">{wordOfDay.cat}</span>
          </div>
          <button
            onClick={() => onNavigate('Repository')}
            className="text-xs font-bold text-forest hover:text-saffron transition"
          >
            See all words in Repository →
          </button>
        </div>

        {/* UPCOMING SCHEDULE */}
        <div className="bg-white p-6 rounded-[2rem] border border-marigold/20 shadow-sm">
          <h4 className="font-bold text-forest mb-4 border-b border-ivory pb-2">Upcoming Schedule</h4>
          <div className="space-y-4">
            <ScheduleItem day="Mon" time="10 AM" title="Vocabulary Basics" onClick={() => onNavigate('Lessons')} />
            <ScheduleItem day="Wed" time="04 PM" title="Awadhi Phrases" onClick={() => onNavigate('Lessons')} />
            <ScheduleItem day="Fri" time="06 PM" title="Quiz Practice" onClick={() => onNavigate('Quiz')} />
          </div>
        </div>

        {/* QUIZ STATS */}
        {stats.quizScores.length > 0 && (
          <div className="bg-saffron/10 border border-saffron/20 p-6 rounded-[2rem] shadow-sm">
            <h4 className="font-bold text-saffron mb-3 text-sm uppercase tracking-wide">Last Quiz</h4>
            {(() => {
              const last = stats.quizScores[stats.quizScores.length - 1];
              return (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-xl font-black text-forest">+{last.score}</p><p className="text-[10px] text-slate-400 uppercase font-bold">XP</p></div>
                  <div><p className="text-xl font-black text-forest">{last.correct}/{last.total}</p><p className="text-[10px] text-slate-400 uppercase font-bold">Correct</p></div>
                  <div><p className="text-xl font-black text-forest">{Math.round((last.correct / last.total) * 100)}%</p><p className="text-[10px] text-slate-400 uppercase font-bold">Accuracy</p></div>
                </div>
              );
            })()}
          </div>
        )}

        {/* BADGES */}
        <div className="bg-forest text-ivory p-6 rounded-[2rem] shadow-lg">
          <h4 className="font-bold mb-4 text-center border-b border-white/10 pb-2">Recent Badges</h4>
          <div className="grid grid-cols-3 gap-2">
            <Badge icon="🥇" title="Fast Learner" unlocked={stats.xp >= 1000} />
            <Badge icon="🗣️" title="Speaker" unlocked={stats.quizScores.length > 0} />
            <Badge icon="📚" title="Storyteller" unlocked={true} />
            <Badge icon="🔥" title="14-Day Streak" unlocked={stats.streak >= 14} />
            <Badge icon="💎" title="5000 XP" unlocked={stats.xp >= 5000} />
            <Badge icon="🏆" title="Quiz Master" unlocked={stats.quizScores.some(q => q.correct / q.total >= 0.8)} />
          </div>
        </div>
      </aside>
    </div>
  );
}

const ScheduleItem = ({ day, time, title, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-3 w-full hover:opacity-80 transition text-left">
    <div className="bg-ivory text-saffron font-bold text-[10px] w-10 h-10 flex items-center justify-center rounded-lg border border-marigold/10 flex-shrink-0">{day}</div>
    <div>
      <p className="text-xs font-bold text-slate-700 leading-none">{title}</p>
      <p className="text-[10px] text-slate-400 mt-1">{time}</p>
    </div>
  </button>
);

const Badge = ({ icon, title, unlocked }) => (
  <div className={`flex flex-col items-center gap-1 transition-all ${unlocked ? '' : 'grayscale opacity-40'}`} title={unlocked ? title : `🔒 ${title}`}>
    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl hover:bg-white/20 transition-colors cursor-help border border-white/5">
      {icon}
    </div>
    <p className="text-[8px] text-white/60 text-center leading-tight">{title}</p>
  </div>
);
