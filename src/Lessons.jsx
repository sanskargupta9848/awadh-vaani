import { useState } from 'react';
import units from './data/lessons.json';
import { SpeakButton } from './speak';

const XP_PER_LESSON = 20;

function unitProgress(unit, completedLessons) {
  const done = unit.lessons.filter((_, i) => completedLessons[`${unit.id}_${i}`]).length;
  return unit.lessons.length > 0 ? Math.round((done / unit.lessons.length) * 100) : 0;
}

function unitXP(unit, completedLessons) {
  return unit.lessons.filter((_, i) => completedLessons[`${unit.id}_${i}`]).length * XP_PER_LESSON;
}

export default function Lessons({ onXP, completedLessons = {}, onComplete }) {
  const [expanded, setExpanded] = useState(null);
  const [activeLesson, setActiveLesson] = useState({});

  const totalXP = units.reduce((sum, u) => sum + unitXP(u, completedLessons), 0);
  const totalLessons = units.reduce((sum, u) => sum + u.lessons.length, 0);
  const totalDone = units.reduce((sum, u) =>
    sum + u.lessons.filter((_, i) => completedLessons[`${u.id}_${i}`]).length, 0);

  const toggle = (unitId) => {
    setExpanded(prev => prev === unitId ? null : unitId);
    if (activeLesson[unitId] === undefined) {
      setActiveLesson(prev => ({ ...prev, [unitId]: 0 }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-forest text-ivory p-8 rounded-3xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-tiro mb-2">Your Learning Path</h2>
          <p className="opacity-80">{units.length} Units · {totalLessons} Lessons · {totalDone} Completed</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-marigold">{totalXP} XP</p>
          <p className="text-sm uppercase tracking-widest opacity-70">Earned</p>
        </div>
      </div>

      {/* Units */}
      <div className="space-y-4">
        {units.map((unit) => {
          const isOpen = expanded === unit.id;
          const lessonIdx = activeLesson[unit.id] ?? 0;
          const currentLesson = unit.lessons[lessonIdx];
          const progress = unitProgress(unit, completedLessons);
          const xpEarned = unitXP(unit, completedLessons);
          const doneLessons = unit.lessons.filter((_, i) => completedLessons[`${unit.id}_${i}`]).length;

          return (
            <div key={unit.id} className="bg-white border border-marigold/20 rounded-2xl overflow-hidden shadow-sm">
              {/* Unit Header */}
              <button
                onClick={() => toggle(unit.id)}
                className="w-full p-6 flex justify-between items-center bg-ivory/50 hover:bg-ivory transition text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl ${
                    progress === 100 ? 'bg-forest' : progress > 0 ? 'bg-marigold' : 'bg-slate-300'
                  }`}>
                    {progress === 100 ? '✓' : unit.emoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-700">{unit.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {doneLessons}/{unit.lessons.length} lessons done · {xpEarned} XP earned
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${progress === 100 ? 'text-forest' : progress > 0 ? 'text-marigold' : 'text-slate-300'}`}>
                    {progress}%
                  </span>
                  <span className="text-slate-400 text-lg">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-ivory">
                <div
                  className="h-full bg-saffron transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Expanded Lesson Content */}
              {isOpen && (
                <div className="border-t border-marigold/10">
                  {/* Lesson Tabs */}
                  <div className="flex gap-2 p-4 pb-0 overflow-x-auto">
                    {unit.lessons.map((lesson, i) => {
                      const done = !!completedLessons[`${unit.id}_${i}`];
                      return (
                        <button
                          key={i}
                          onClick={() => setActiveLesson(prev => ({ ...prev, [unit.id]: i }))}
                          className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            lessonIdx === i
                              ? 'bg-saffron text-white shadow-md'
                              : done
                              ? 'bg-forest/10 text-forest border border-forest/20 hover:border-saffron'
                              : 'bg-ivory text-forest border border-marigold/20 hover:border-saffron'
                          }`}
                        >
                          {done && <span className="text-xs">✓</span>}
                          {lesson.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sentences */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Example Sentences
                      </p>
                      {completedLessons[`${unit.id}_${lessonIdx}`] ? (
                        <span className="text-xs font-bold text-forest bg-forest/10 px-3 py-1 rounded-full">✓ Completed · +{XP_PER_LESSON} XP</span>
                      ) : (
                        <span className="text-xs text-slate-400">Finish all sentences to complete</span>
                      )}
                    </div>

                    {currentLesson.sentences.map((s, i) => (
                      <div key={i} className="bg-ivory/60 rounded-2xl p-5 border border-marigold/10 hover:border-marigold/30 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-2xl font-tiro text-forest leading-snug">{s.awadhi}</p>
                            <p className="text-saffron text-sm font-bold mt-1 tracking-wide">{s.roman}</p>
                            <p className="text-slate-500 text-sm mt-2 italic">{s.english}</p>
                          </div>
                          <SpeakButton text={s.awadhi} roman={s.roman} size="md" className="ml-4 mt-1" />
                        </div>
                      </div>
                    ))}

                    {/* Nav buttons */}
                    <div className="flex justify-between pt-4">
                      <button
                        disabled={lessonIdx === 0}
                        onClick={() => setActiveLesson(prev => ({ ...prev, [unit.id]: lessonIdx - 1 }))}
                        className="px-6 py-2 rounded-xl font-bold text-sm border-2 border-marigold/20 text-forest hover:border-saffron disabled:opacity-30 transition"
                      >
                        ← Previous
                      </button>

                      {lessonIdx < unit.lessons.length - 1 ? (
                        <button
                          onClick={() => {
                            // Mark current lesson complete when moving forward
                            onComplete?.(unit.id, lessonIdx);
                            setActiveLesson(prev => ({ ...prev, [unit.id]: lessonIdx + 1 }));
                          }}
                          className="px-6 py-2 rounded-xl font-bold text-sm bg-saffron text-white hover:scale-105 transition"
                        >
                          Next →
                        </button>
                      ) : (
                        <button
                          onClick={() => onComplete?.(unit.id, lessonIdx)}
                          disabled={!!completedLessons[`${unit.id}_${lessonIdx}`]}
                          className="px-6 py-2 rounded-xl font-bold text-sm bg-forest text-white hover:scale-105 disabled:opacity-50 disabled:cursor-default transition"
                        >
                          {completedLessons[`${unit.id}_${lessonIdx}`] ? '✓ Done' : 'Mark Complete +20 XP'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
