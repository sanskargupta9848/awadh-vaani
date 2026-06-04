import React, { useState, useEffect, useCallback } from 'react';
import allQuestions from './data/quiz.json';
import { SpeakButton } from './speak';

const TIMER_START = 45;

const Quiz = ({ onQuit, onFinish }) => {
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
  const progress = Math.round(((currentIndex) / total) * 100);

  const handleTimeUp = useCallback(() => {
    if (!isSubmitted) {
      setIsSubmitted(true);
      setTimerActive(false);
      setStreak(0);
    }
  }, [isSubmitted]);

  useEffect(() => {
    if (!timerActive || isSubmitted) return;
    if (timeLeft <= 0) { handleTimeUp(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timerActive, isSubmitted, handleTimeUp]);

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    setTimerActive(false);
    const isCorrect = question.options.find(o => o.id === selectedOption)?.correct;
    if (isCorrect) {
      setScore(s => s + 20);
      setCorrect(c => c + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      setShowModal(true);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setTimeLeft(TIMER_START);
      setTimerActive(true);
    }
  };

  const correctAnswer = question.options.find(o => o.correct)?.text;
  const userIsCorrect = question.options.find(o => o.id === selectedOption)?.correct;
  const accuracy = currentIndex > 0 ? Math.round((correct / currentIndex) * 100) : 100;

  return (
    <div className="relative h-full flex flex-col animate-fadeIn font-noto">
      {/* TOP BAR */}
      <header className="flex items-center justify-between mb-8 bg-white/40 p-4 rounded-2xl border border-marigold/10 backdrop-blur-sm">
        <button
          onClick={onQuit}
          className="text-slate-400 font-bold text-sm hover:text-saffron transition tracking-tight flex items-center gap-2"
        >
          <span className="text-lg">✕</span> Quit Quiz
        </button>

        <div className="flex-1 max-w-md mx-10">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-forest mb-1">
            <span>Question {currentIndex + 1} of {total}</span>
            <span className="text-saffron">+ 20 XP per correct answer</span>
          </div>
          <div className="h-2 w-full bg-ivory rounded-full border border-marigold/10 overflow-hidden shadow-inner">
            <div
              className="h-full bg-saffron rounded-full shadow-sm transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm shadow-sm ${
          timeLeft <= 10 ? 'border-red-400 text-red-400 animate-pulse' : 'border-forest text-forest'
        }`}>
          {timeLeft}s
        </div>
      </header>

      <div className="flex gap-8 items-start justify-center">
        {/* MAIN QUIZ AREA */}
        <div className="flex-1 max-w-[700px] space-y-6">
          {/* Question Panel */}
          <div className="bg-white rounded-t-[6rem] rounded-b-3xl border border-marigold/10 shadow-xl overflow-hidden relative">
            <div className="p-12 pt-16 text-center relative">
              <div className="absolute top-10 left-1/2 -translate-x-1/2">
                <span className="bg-ivory text-marigold px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-marigold/10 whitespace-nowrap">
                  {question.type}
                </span>
              </div>

              <div className="pt-20 pb-8">
                <h2 className="text-7xl font-tiro text-forest leading-none">{question.awadhi}</h2>
                <p className="text-slate-400 font-medium tracking-widest uppercase text-xs mt-4">{question.roman}</p>
              </div>

              <SpeakButton text={question.awadhi} roman={question.roman} size="lg" className="mx-auto mb-8" />

              <div className="pt-8 border-t border-ivory/50">
                <p className="text-xl font-medium text-slate-700 tracking-tight">{question.prompt}</p>
              </div>
            </div>

            {/* Result Ribbon */}
            {isSubmitted && (
              <div className={`p-5 text-center font-bold border-t-2 ${
                userIsCorrect
                  ? 'bg-forest text-white border-white/10'
                  : 'bg-saffron text-white border-white/10'
              }`}>
                {!selectedOption
                  ? `⏰ Time's up! The answer is: ${correctAnswer}`
                  : userIsCorrect
                  ? '✓ Sahi! That\'s correct!'
                  : `✗ Galat. Correct answer: ${correctAnswer}`}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((opt) => (
              <button
                key={opt.id}
                disabled={isSubmitted}
                onClick={() => setSelectedOption(opt.id)}
                className={`group p-6 rounded-[1.5rem] border-2 flex items-center gap-4 transition-all text-left shadow-sm ${getOptionStyles(opt, selectedOption, isSubmitted)}`}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-colors ${
                  selectedOption === opt.id ? 'bg-white/20 text-white' : 'bg-ivory text-marigold group-hover:bg-marigold group-hover:text-white'
                }`}>
                  {opt.id}
                </span>
                <span className="font-bold flex-1">{opt.text}</span>
              </button>
            ))}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4">
            <button className="text-forest font-bold text-xs hover:underline decoration-2">Use a Hint (−5 XP)</button>
            <div className="flex gap-4">
              {!isSubmitted ? (
                <>
                  <button
                    onClick={() => { setIsSubmitted(true); setTimerActive(false); setStreak(0); }}
                    className="px-8 py-3 text-slate-400 font-bold hover:text-forest transition"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className={`px-12 py-3 rounded-2xl font-bold shadow-lg transition-all ${
                      selectedOption ? 'bg-saffron text-white shadow-saffron/30 hover:scale-105 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Submit Answer
                  </button>
                </>
              ) : (
                <button
                  onClick={handleNext}
                  className="bg-forest text-white px-16 py-4 rounded-2xl font-bold shadow-lg shadow-forest/20 hover:scale-105 transition-all"
                >
                  {currentIndex + 1 >= total ? 'See Results 🏆' : 'Next Question →'}
                </button>
              )}
            </div>
          </div>

          {/* Tip Card */}
          {isSubmitted && (
            <div className="bg-ivory/80 border border-marigold/20 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-forest mb-2">💡 Vocabulary Tip</p>
              <p className="text-sm text-slate-600 leading-relaxed italic">{question.tip}</p>
            </div>
          )}
        </div>

        {/* RIGHT STATS SIDEBAR */}
        <aside className="w-[280px] space-y-6">
          <div className="bg-white p-7 rounded-[2.5rem] border border-marigold/20 shadow-sm space-y-8">
            <h4 className="text-xs font-black uppercase text-forest tracking-widest border-b border-ivory pb-3">Live Stats</h4>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <StatItem label="Score" val={`${score}`} />
              <StatItem label="Streak" val={streak > 0 ? `🔥 ${streak}` : '—'} />
              <StatItem label="Accuracy" val={`${accuracy}%`} />
              <StatItem label="Left" val={`${total - currentIndex - 1}`} />
            </div>
            <div className="bg-ivory/50 p-4 rounded-2xl border border-marigold/10 text-center shadow-inner">
              <p className="text-[11px] text-forest font-bold italic leading-relaxed">
                {streak >= 3 ? `🔥 ${streak} in a row! Amazing!` : streak > 0 ? '"बढ़िया! Keep going!"' : '"हिम्मत रखो! You can do it!"'}
              </p>
            </div>
          </div>

          <div className="bg-forest p-7 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 text-4xl p-2">🏛️</div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-3">Did You Know?</h4>
            <p className="text-sm opacity-90 leading-relaxed italic font-tiro relative z-10">
              "Awadhi is spoken by over 38 million people and is the language of the Ramcharitmanas by Tulsidas."
            </p>
          </div>
        </aside>
      </div>

      {/* RESULTS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-forest/40 backdrop-blur-md" />
          <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden border-t-8 border-saffron">
            <div className="p-12 text-center space-y-8">
              <div>
                <span className="text-7xl mb-4 block">
                  {correct >= total * 0.8 ? '🏆' : correct >= total * 0.5 ? '🎯' : '📚'}
                </span>
                <h2 className="text-3xl font-tiro text-forest">Pariksha Complete!</h2>
                <p className="text-slate-400 italic text-sm mt-1">"Awadh ki Bhaakha"</p>
              </div>

              <div className="grid grid-cols-3 gap-4 border-y border-ivory py-10">
                <ResultStat label="XP" val={`+${score}`} />
                <ResultStat label="Correct" val={`${correct}/${total}`} />
                <ResultStat label="Accuracy" val={`${Math.round((correct / total) * 100)}%`} />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => onFinish?.(score, correct, total)}
                  className="w-full bg-saffron text-white py-4 rounded-2xl font-bold shadow-lg shadow-saffron/20 hover:scale-105 transition active:scale-95"
                >
                  Back to Home
                </button>
                <button
                  onClick={() => {
                    setCurrentIndex(0);
                    setSelectedOption(null);
                    setIsSubmitted(false);
                    setScore(0);
                    setCorrect(0);
                    setStreak(0);
                    setTimeLeft(TIMER_START);
                    setTimerActive(true);
                    setShowModal(false);
                  }}
                  className="w-full border-2 border-forest text-forest py-4 rounded-2xl font-bold hover:bg-forest hover:text-white transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem = ({ label, val }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-2">{label}</p>
    <p className="font-bold text-slate-800 text-lg">{val}</p>
  </div>
);

const ResultStat = ({ label, val }) => (
  <div>
    <p className="text-2xl font-black text-saffron">{val}</p>
    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">{label}</p>
  </div>
);

const getOptionStyles = (opt, selected, submitted) => {
  if (!submitted) {
    return selected === opt.id
      ? 'border-saffron bg-saffron text-white scale-[1.03]'
      : 'border-marigold/10 hover:border-marigold bg-white text-slate-600 hover:shadow-md';
  }
  if (opt.correct) return 'border-forest bg-forest text-white shadow-forest/20';
  if (selected === opt.id && !opt.correct) return 'border-red-400 bg-red-400 text-white';
  return 'border-ivory bg-ivory text-slate-300 opacity-50';
};

export default Quiz;
