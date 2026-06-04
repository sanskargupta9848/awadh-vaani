import React, { useState, useEffect, useCallback } from 'react';
import allQuestions from '../data/quiz.json';
import { SpeakButton } from '../speak';

const TIMER_START = 45;

const getOptionStyles = (opt, selected, submitted) => {
  if (!submitted) {
    return selected === opt.id
      ? 'border-saffron bg-saffron text-white scale-[1.02]'
      : 'border-marigold/20 bg-white text-slate-600';
  }
  if (opt.correct) return 'border-forest bg-forest text-white';
  if (selected === opt.id && !opt.correct) return 'border-red-400 bg-red-400 text-white';
  return 'border-ivory bg-ivory text-slate-300 opacity-40';
};

export default function QuizM({ onQuit, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_START);
  const [timerActive, setTimerActive] = useState(true);

  const question = allQuestions[currentIndex];
  const total = allQuestions.length;
  const progress = Math.round((currentIndex / total) * 100);

  const handleTimeUp = useCallback(() => {
    if (!isSubmitted) { setIsSubmitted(true); setTimerActive(false); setStreak(0); }
  }, [isSubmitted]);

  useEffect(() => {
    if (!timerActive || isSubmitted) return;
    if (timeLeft <= 0) { handleTimeUp(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive, isSubmitted, handleTimeUp]);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true); setTimerActive(false);
    const isCorrect = question.options.find(o => o.id === selectedOption)?.correct;
    if (isCorrect) { setScore(s => s + 20); setCorrect(c => c + 1); setStreak(s => s + 1); }
    else setStreak(0);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= total) { setShowModal(true); }
    else {
      setCurrentIndex(i => i + 1); setSelectedOption(null);
      setIsSubmitted(false); setTimeLeft(TIMER_START); setTimerActive(true);
    }
  };

  const correctAnswer = question.options.find(o => o.correct)?.text;
  const userIsCorrect = question.options.find(o => o.id === selectedOption)?.correct;
  const accuracy = currentIndex > 0 ? Math.round((correct / currentIndex) * 100) : 100;

  return (
    <div className="min-h-screen flex flex-col pb-4 animate-fadeIn font-noto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onQuit} className="text-slate-400 font-bold text-sm flex items-center gap-1">✕</button>
        <div className="flex-1 h-2 bg-ivory rounded-full overflow-hidden border border-marigold/10">
          <div className="h-full bg-saffron rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className={`w-10 h-10 rounded-full border-3 flex items-center justify-center font-bold text-xs ${timeLeft <= 10 ? 'border-red-400 text-red-400 animate-pulse' : 'border-forest text-forest'}`}>
          {timeLeft}s
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex gap-2 mb-4">
        <StatChip label="Score" val={score} />
        <StatChip label="Streak" val={streak > 0 ? `🔥${streak}` : '—'} />
        <StatChip label="Accuracy" val={`${accuracy}%`} />
        <StatChip label="Left" val={total - currentIndex - 1} />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-md mb-4 border border-marigold/10">
        <div className="p-6 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-marigold bg-ivory px-3 py-1 rounded-full border border-marigold/10">
            {question.type}
          </span>
          <h2 className="text-5xl font-tiro text-forest mt-4 mb-2 leading-none">{question.awadhi}</h2>
          <p className="text-slate-400 text-xs tracking-widest uppercase mb-4">{question.roman}</p>
          <SpeakButton text={question.awadhi} roman={question.roman} size="md" className="mx-auto" />
          <p className="text-base font-medium text-slate-700 mt-4 border-t border-ivory pt-4">{question.prompt}</p>
        </div>
        {isSubmitted && (
          <div className={`p-4 text-center font-bold text-sm border-t-2 ${userIsCorrect ? 'bg-forest text-white' : 'bg-saffron text-white'}`}>
            {!selectedOption ? `⏰ Time's up! Answer: ${correctAnswer}` : userIsCorrect ? '✓ Sahi! Correct!' : `✗ Galat. Answer: ${correctAnswer}`}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {question.options.map(opt => (
          <button key={opt.id} disabled={isSubmitted} onClick={() => setSelectedOption(opt.id)}
            className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all text-left ${getOptionStyles(opt, selectedOption, isSubmitted)}`}>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${selectedOption === opt.id ? 'bg-white/20 text-white' : 'bg-ivory text-marigold'}`}>{opt.id}</span>
            <span className="font-bold text-sm leading-tight">{opt.text}</span>
          </button>
        ))}
      </div>

      {/* Tip */}
      {isSubmitted && (
        <div className="bg-ivory/80 border border-marigold/20 rounded-2xl p-4 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-forest mb-1">💡 Tip</p>
          <p className="text-sm text-slate-600 italic leading-relaxed">{question.tip}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!isSubmitted ? (
          <>
            <button onClick={() => { setIsSubmitted(true); setTimerActive(false); setStreak(0); }}
              className="px-4 py-3 text-slate-400 font-bold text-sm border-2 border-slate-200 rounded-2xl">Skip</button>
            <button onClick={handleSubmit} disabled={!selectedOption}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm shadow-md transition-all ${selectedOption ? 'bg-saffron text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              Submit Answer
            </button>
          </>
        ) : (
          <button onClick={handleNext} className="flex-1 bg-forest text-white py-3 rounded-2xl font-bold shadow-md active:scale-95 transition">
            {currentIndex + 1 >= total ? 'See Results 🏆' : 'Next →'}
          </button>
        )}
      </div>

      {/* Results modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end">
          <div className="absolute inset-0 bg-forest/40 backdrop-blur-md" />
          <div className="relative bg-white w-full rounded-t-[2.5rem] shadow-2xl border-t-8 border-saffron p-8 space-y-6">
            <div className="text-center">
              <span className="text-6xl mb-3 block">{correct >= total * 0.8 ? '🏆' : correct >= total * 0.5 ? '🎯' : '📚'}</span>
              <h2 className="text-2xl font-tiro text-forest">Pariksha Complete!</h2>
              <p className="text-slate-400 italic text-sm">"Awadh ki Bhaakha"</p>
            </div>
            <div className="grid grid-cols-3 gap-3 border-y border-ivory py-6">
              <div className="text-center"><p className="text-2xl font-black text-saffron">+{score}</p><p className="text-[10px] uppercase text-slate-400 font-bold">XP</p></div>
              <div className="text-center"><p className="text-2xl font-black text-saffron">{correct}/{total}</p><p className="text-[10px] uppercase text-slate-400 font-bold">Correct</p></div>
              <div className="text-center"><p className="text-2xl font-black text-saffron">{Math.round((correct/total)*100)}%</p><p className="text-[10px] uppercase text-slate-400 font-bold">Accuracy</p></div>
            </div>
            <div className="space-y-3">
              <button onClick={() => onFinish?.(score, correct, total)}
                className="w-full bg-saffron text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition">
                Back to Home
              </button>
              <button onClick={() => { setCurrentIndex(0); setSelectedOption(null); setIsSubmitted(false); setScore(0); setCorrect(0); setStreak(0); setTimeLeft(TIMER_START); setTimerActive(true); setShowModal(false); }}
                className="w-full border-2 border-forest text-forest py-4 rounded-2xl font-bold">
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const StatChip = ({ label, val }) => (
  <div className="flex-1 bg-white rounded-xl p-2 text-center border border-marigold/10 shadow-sm">
    <p className="text-xs font-black text-slate-700">{val}</p>
    <p className="text-[8px] uppercase text-slate-400 font-bold">{label}</p>
  </div>
);
