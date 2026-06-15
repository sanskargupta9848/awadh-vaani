import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { SpeakButton, speak, getPreferredVoiceName } from '../speak';
import { analyzeTranscript, GRADE_BANDS, getOverallBand } from '../voiceScoring';
import { useRecorder } from '../useRecorder';
import { buildPhrasePool, CATEGORIES, DIFFICULTIES, masteryIcon, syllabify, aggregateStats } from '../voiceUtils';
import VoicePicker from '../VoicePicker';

const SPEEDS = [
  { id: 0.30, label: '🐢 Slow' },
  { id: 0.50, label: '🚶 Normal' },
  { id: 0.75, label: '🏃 Fast' },
];

// On mobile, SpeechRecognition and MediaRecorder cannot share the microphone.
// We skip the simultaneous playback-recording on mobile so recognition (scoring) works reliably.
const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
const SR_SUPPORTED = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

export default function VoiceM({ onXP, voiceStats = {}, onAttempt }) {
  const [phraseIdx, setPhraseIdx]   = useState(0);
  const [status, setStatus]         = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis]     = useState(null);
  const [bars, setBars]             = useState(Array(10).fill(10));
  const [category, setCategory]     = useState('All');
  const [difficulty, setDifficulty] = useState('all');
  const [mode, setMode]             = useState('all');
  const [showStats, setShowStats]   = useState(false);
  const [showHint, setShowHint]     = useState(false);
  const [speed, setSpeed]           = useState(0.5);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [voicePref, setVoicePref]   = useState(getPreferredVoiceName());
  const [errorMsg, setErrorMsg]     = useState('');

  const recognitionRef = useRef(null);
  const animRef = useRef(null);
  const recorder = useRecorder();

  const pool = useMemo(
    () => buildPhrasePool({ category, difficulty, mode, voiceStats }),
    [category, difficulty, mode, voiceStats],
  );

  useEffect(() => { setPhraseIdx(i => i >= pool.length ? 0 : i); }, [pool.length]);

  const phrase = pool[phraseIdx % pool.length] ?? pool[0];
  const score = analysis?.score ?? null;
  const phraseHistory = voiceStats.phraseHistory ?? {};
  const phraseRecord = phraseHistory[phrase?.awadhi];
  const stats = useMemo(() => aggregateStats(voiceStats), [voiceStats]);

  const animateBars = useCallback((active) => {
    if (!active) { setBars(Array(10).fill(10)); cancelAnimationFrame(animRef.current); return; }
    const tick = () => { setBars(prev => prev.map(() => 15 + Math.random() * 75)); animRef.current = requestAnimationFrame(tick); };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorMsg('Voice recognition is not supported on this browser. Please use Google Chrome on Android or a desktop. (iPhone/Safari does not support this feature.)');
      return;
    }
    setErrorMsg('');
    const rec = new SR();
    rec.lang = 'hi-IN'; rec.interimResults = false; rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    rec.onstart = () => {
      setStatus('listening'); setTranscript(''); setAnalysis(null); animateBars(true);
      // Only run MediaRecorder playback on desktop — on mobile it conflicts with the mic
      if (!IS_MOBILE) recorder.start();
    };
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      const a = analyzeTranscript(text, phrase.awadhi);
      setAnalysis(a); setStatus('done'); animateBars(false);
      if (!IS_MOBILE) recorder.stop();
      onAttempt?.({ awadhi: phrase.awadhi, unitTitle: phrase.unitTitle, score: a.score, transcript: text, normalized: a.normalizedTranscript });
      if (a.score >= 60) onXP?.(10);
    };
    rec.onerror = (e) => {
      setStatus('idle'); animateBars(false);
      if (!IS_MOBILE) recorder.stop();
      if (e.error === 'no-speech') setErrorMsg('No speech detected. Tap the mic and speak clearly.');
      else if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setErrorMsg('Microphone permission denied. Please allow mic access in your browser settings.');
      else if (e.error === 'network') setErrorMsg('Network error — voice recognition needs an internet connection.');
      else setErrorMsg('Could not capture audio. Please try again.');
    };
    rec.onend = () => { if (status === 'listening') { setStatus('done'); animateBars(false); if (!IS_MOBILE) recorder.stop(); } };
    try {
      rec.start();
    } catch (err) {
      setErrorMsg('Could not start the microphone. Tap again.');
    }
  }, [phrase, status, animateBars, onXP, recorder, onAttempt]);

  const stopRecording = useCallback(() => { recognitionRef.current?.stop(); setStatus('idle'); animateBars(false); if (!IS_MOBILE) recorder.stop(); }, [animateBars, recorder]);
  useEffect(() => () => { cancelAnimationFrame(animRef.current); recognitionRef.current?.stop(); }, []);

  const nextPhrase = () => {
    setPhraseIdx(i => (i + 1) % pool.length); setStatus('idle'); setTranscript(''); setAnalysis(null);
    setBars(Array(10).fill(10)); recorder.reset();
  };

  const playAtSpeed = () => speak(phrase.awadhi, null, phrase.roman, speed);

  const overallBand   = score === null ? null : getOverallBand(score);
  const scoreColor    = overallBand?.color ?? 'text-forest';
  const scoreFeedback = overallBand?.label ?? 'Awaiting recording…';

  return (
    <div className="space-y-4 pb-4 animate-fadeIn">
      {/* Header */}
      <div className="bg-forest text-ivory p-5 rounded-3xl shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-2xl font-tiro">🎙️ Aawaz Abhyas</h2>
            <p className="opacity-70 text-[10px] mt-0.5 truncate">
              {voicePref ? `Voice: ${voicePref.replace(/Microsoft|Online|\(Natural\)/gi, '').trim().slice(0, 40)}` : 'Per-word feedback · weak words'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowVoicePicker(true)}
            className="flex-1 bg-marigold/20 hover:bg-marigold/30 px-3 py-1.5 rounded-xl border border-marigold/30 text-[11px] font-bold flex items-center justify-center gap-1">
            🎙️ Voice
          </button>
          <button onClick={() => setShowStats(s => !s)}
            className="flex-1 bg-marigold/20 hover:bg-marigold/30 px-3 py-1.5 rounded-xl border border-marigold/30 text-[11px] font-bold flex items-center justify-center gap-1">
            📊 Stats
          </button>
        </div>
      </div>

      {showVoicePicker && (
        <VoicePicker onClose={() => { setShowVoicePicker(false); setVoicePref(getPreferredVoiceName()); }} />
      )}

      {/* Stats Panel */}
      {showStats && (
        <div className="bg-white rounded-3xl p-4 border border-marigold/20 shadow-sm grid grid-cols-3 gap-2">
          <MStatBox label="Attempts" val={stats.totalAttempts} />
          <MStatBox label="Mastered" val={stats.masteredCount} color="text-green-500" />
          <MStatBox label="Weak" val={stats.weakCount} color="text-red-400" />
          <MStatBox label="Tried" val={stats.totalPhrasesTried} />
          <MStatBox label="Avg" val={`${stats.avgScore}%`} />
          <MStatBox label="Best" val={`${stats.bestScore}%`} color="text-marigold" />
          {Object.keys(stats.categoryStats).length > 0 && (
            <div className="col-span-3 mt-2 pt-3 border-t border-ivory">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">By Category</p>
              <div className="space-y-1.5">
                {Object.entries(stats.categoryStats).map(([cat, s]) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="text-[10px] text-forest font-bold w-24 truncate">{cat}</span>
                    <div className="flex-1 h-1.5 bg-ivory rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.avg >= 80 ? 'bg-green-400' : s.avg >= 50 ? 'bg-marigold' : 'bg-red-400'}`}
                        style={{ width: `${s.avg}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{s.avg}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter strip */}
      <div className="bg-white rounded-3xl p-4 border border-marigold/20 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Category</span>
          <select value={category}
            onChange={e => { setCategory(e.target.value); setPhraseIdx(0); }}
            className="flex-1 text-xs font-bold text-forest bg-ivory border border-marigold/20 rounded-xl px-3 py-1.5 outline-none focus:border-saffron">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-1.5">
          {DIFFICULTIES.map(d => (
            <button key={d.id} onClick={() => { setDifficulty(d.id); setPhraseIdx(0); }}
              className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition ${difficulty === d.id ? 'bg-saffron text-white shadow-md' : 'text-forest bg-ivory'}`}>
              {d.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center justify-between">
          <button onClick={() => { setMode(m => m === 'weak' ? 'all' : 'weak'); setPhraseIdx(0); }}
            disabled={mode !== 'weak' && stats.weakCount === 0}
            className={`flex-1 px-3 py-1.5 rounded-xl text-[10px] font-bold transition disabled:opacity-30 ${mode === 'weak' ? 'bg-red-400 text-white shadow-md' : 'bg-red-50 text-red-500 border border-red-200'}`}>
            ⚠️ {mode === 'weak' ? `Weak (${pool.length})` : `Weak (${stats.weakCount})`}
          </button>
          <span className="text-[10px] text-slate-400">
            <span className="font-bold text-forest">{pool.length}</span> in pool
          </span>
        </div>
      </div>

      {/* Target phrase */}
      <div className="bg-white rounded-3xl p-5 border border-marigold/20 shadow-sm relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate flex-1">
            {masteryIcon(phraseHistory, phrase.awadhi)} {phrase.unitEmoji} {phrase.unitTitle}
          </p>
          <SpeakButton text={phrase.awadhi} roman={phrase.roman} size="md" />
        </div>
        <p className="text-3xl font-tiro text-forest leading-snug">{phrase.awadhi}</p>
        <p className="text-saffron font-bold text-sm mt-1">{phrase.roman}</p>
        <p className="text-slate-500 text-sm mt-1 italic">{phrase.english}</p>

        {showHint && (
          <p className="mt-3 text-marigold text-xs font-mono tracking-wide bg-ivory/60 p-2 rounded-lg border border-marigold/20">
            {syllabify(phrase.roman)}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-ivory">
          <button onClick={() => setShowHint(s => !s)}
            className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg transition ${showHint ? 'bg-marigold text-white' : 'text-marigold border border-marigold/30'}`}>
            {showHint ? '✓ Syllables' : '💡 Hint'}
          </button>
          <div className="flex items-center gap-1">
            {SPEEDS.map(s => (
              <button key={s.id} onClick={() => setSpeed(s.id)}
                className={`text-[9px] font-bold px-1.5 py-1 rounded transition ${speed === s.id ? 'bg-forest text-white' : 'text-forest bg-ivory'}`}>
                {s.label}
              </button>
            ))}
            <button onClick={playAtSpeed}
              className="text-[10px] font-bold px-2 py-1 rounded bg-forest text-white">
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Recorder */}
      <div className="bg-white rounded-3xl p-6 border border-marigold/20 shadow-sm flex flex-col items-center">
        <div className="flex items-end gap-1.5 h-14 mb-5 w-full justify-center">
          {bars.map((h, i) => (
            <div key={i} className={`w-3 rounded-full transition-all duration-75 ${status === 'listening' ? 'bg-saffron' : 'bg-marigold/30'}`} style={{ height: `${h}%` }} />
          ))}
        </div>
        {status === 'idle' || status === 'done' ? (
          <button onClick={startRecording} className="w-20 h-20 bg-saffron rounded-full flex items-center justify-center text-white text-3xl shadow-xl active:scale-95 transition border-4 border-saffron/30">🎙️</button>
        ) : (
          <button onClick={stopRecording} className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white text-3xl shadow-xl animate-pulse border-4 border-red-300 active:scale-95 transition">⏹</button>
        )}
        <p className="mt-3 text-slate-400 text-sm font-medium text-center">
          {status === 'idle' && 'Tap to start recording'}
          {status === 'listening' && '🔴 Listening… speak now'}
          {status === 'done' && 'Recording complete'}
        </p>

        {errorMsg && (
          <div className="mt-3 w-full bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
            <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
          </div>
        )}

        {!IS_MOBILE && recorder.audioUrl && (
          <div className="mt-4 w-full bg-forest/5 border border-forest/20 rounded-2xl p-3 flex items-center gap-3">
            <button onClick={recorder.isPlaying ? recorder.pausePlayback : recorder.play}
              className="w-11 h-11 bg-forest text-white rounded-full flex items-center justify-center text-base shadow-md active:scale-95 transition flex-shrink-0">
              {recorder.isPlaying ? '⏸' : '▶'}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-forest">Your Recording</p>
              <p className="text-[10px] text-slate-500 italic">Compare with native pronunciation above</p>
            </div>
          </div>
        )}
      </div>

      {/* Score ring */}
      <div className="bg-ivory border-2 border-dashed border-marigold/30 rounded-3xl p-6 flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center mb-3">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/80" />
            <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="10" fill="transparent"
              strokeDasharray="339" strokeDashoffset={score === null ? 339 : 339 - (339 * score) / 100}
              className={score === null ? 'text-slate-200' : score >= 80 ? 'text-green-400' : score >= 50 ? 'text-marigold' : 'text-red-400'}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
          </svg>
          <span className={`absolute text-2xl font-black ${scoreColor}`}>{score === null ? '—' : `${score}%`}</span>
        </div>
        <h4 className={`text-base font-bold ${scoreColor}`}>{scoreFeedback}</h4>
        {phraseRecord && (
          <p className="mt-2 text-[10px] text-slate-500">
            Best: <span className="font-bold text-green-500">{phraseRecord.bestScore}%</span> · Attempts: <span className="font-bold text-forest">{phraseRecord.attempts}</span>
          </p>
        )}
      </div>

      {/* Per-word breakdown — learner-facing */}
      {analysis && (
        <div className="bg-white rounded-3xl p-4 border border-marigold/20 shadow-sm space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-forest">Per-Word Accuracy</p>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Target</p>
            <p className="font-tiro text-xl leading-relaxed flex flex-wrap gap-x-1.5 gap-y-1">
              {analysis.words.map((w, i) => {
                const c = w.grade.tw;
                const pct = Math.round(w.similarity * 100);
                return (
                  <span key={i} className={`${c.text} ${c.bg} px-1.5 py-0.5 rounded border ${c.border}`}
                    title={`${pct}% ${w.grade.short}`}>
                    {w.target}
                  </span>
                );
              })}
            </p>
          </div>

          {transcript && (
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">You said</p>
              <p className="font-tiro text-base text-forest leading-relaxed bg-ivory/50 p-2 rounded-lg">
                {analysis.normalizedTranscript || transcript}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Multi-attempt history */}
      {phraseRecord && phraseRecord.tries.length > 1 && (
        <div className="bg-white rounded-3xl p-4 border border-marigold/20 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-forest mb-2">Recent Attempts</p>
          <div className="space-y-1.5">
            {phraseRecord.tries.slice().reverse().map((t, i) => {
              const c = t.score >= 80 ? 'text-green-500' : t.score >= 50 ? 'text-marigold' : 'text-red-400';
              return (
                <div key={i} className="flex items-center justify-between text-[10px] bg-ivory/40 px-2 py-1.5 rounded-lg">
                  <span className={`font-black text-sm ${c} w-10`}>{t.score}%</span>
                  <span className="font-tiro text-forest text-xs flex-1 truncate ml-2">{t.transcript || '—'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={startRecording} disabled={status === 'listening'}
          className="flex-1 border-2 border-forest text-forest py-3 rounded-2xl font-bold text-sm disabled:opacity-40 active:bg-forest active:text-white transition">
          🔄 Try Again
        </button>
        <button onClick={nextPhrase} className="flex-1 bg-saffron text-white py-3 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition">
          Next →
        </button>
      </div>

      {/* Tip */}
      <div className="bg-forest text-white rounded-3xl p-5 shadow-lg">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">💡 Tip</p>
        <p className="text-sm italic leading-relaxed opacity-90">In Awadhi, <span className="text-marigold font-bold">"मा"</span> is used where Hindi uses <span className="text-marigold font-bold">"में"</span> — speak it short and flat.</p>
      </div>
    </div>
  );
}

const MStatBox = ({ label, val, color = 'text-forest' }) => (
  <div className="bg-ivory/50 rounded-xl p-2 text-center border border-marigold/10">
    <p className={`text-base font-black ${color}`}>{val}</p>
    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">{label}</p>
  </div>
);
