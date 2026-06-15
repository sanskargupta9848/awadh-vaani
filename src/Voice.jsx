import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SpeakButton, speak, getPreferredVoiceName } from './speak';
import { analyzeTranscript, GRADE_BANDS, getOverallBand } from './voiceScoring';
import { useRecorder } from './useRecorder';
import {
  buildPhrasePool, CATEGORIES, DIFFICULTIES,
  masteryIcon, syllabify, aggregateStats,
} from './voiceUtils';
import VoicePicker from './VoicePicker';

// Calibrated for Microsoft Ravi (en-IN). Its baseline is roughly 2× faster
// than the API's nominal 1.0, so these rates aim for genuine learner-comfortable speeds.
const SPEEDS = [
  { id: 0.30, label: '🐢 Slow' },
  { id: 0.50, label: '🚶 Normal' },
  { id: 0.75, label: '🏃 Fast' },
];

// On mobile, SpeechRecognition + MediaRecorder can't share the mic — skip simultaneous recording there.
const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

export default function Voice({ onXP, voiceStats = {}, onAttempt }) {
  const [phraseIdx, setPhraseIdx]   = useState(0);
  const [status, setStatus]         = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis]     = useState(null);
  const [bars, setBars]             = useState(Array(12).fill(10));
  const [category, setCategory]     = useState('All');
  const [difficulty, setDifficulty] = useState('all');
  const [mode, setMode]             = useState('all'); // 'all' | 'weak'
  const [showStats, setShowStats]   = useState(false);
  const [showHint, setShowHint]     = useState(false);
  const [speed, setSpeed]           = useState(0.5);
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [voicePref, setVoicePref]   = useState(getPreferredVoiceName());
  const [errorMsg, setErrorMsg]     = useState('');

  const recognitionRef = useRef(null);
  const animRef = useRef(null);
  const recorder = useRecorder();

  // Recompute pool when filters change
  const pool = useMemo(
    () => buildPhrasePool({ category, difficulty, mode, voiceStats }),
    [category, difficulty, mode, voiceStats],
  );

  // Reset index if pool size changes from under us
  useEffect(() => { setPhraseIdx(i => i >= pool.length ? 0 : i); }, [pool.length]);

  const phrase = pool[phraseIdx % pool.length] ?? pool[0];
  const score = analysis?.score ?? null;
  const phraseHistory = voiceStats.phraseHistory ?? {};
  const phraseRecord = phraseHistory[phrase?.awadhi];
  const stats = useMemo(() => aggregateStats(voiceStats), [voiceStats]);

  const animateBars = useCallback((active) => {
    if (!active) { setBars(Array(12).fill(10)); cancelAnimationFrame(animRef.current); return; }
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
      setStatus('listening'); setTranscript(''); setAnalysis(null);
      animateBars(true);
      if (!IS_MOBILE) recorder.start();   // playback recording only on desktop
    };
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      const a = analyzeTranscript(text, phrase.awadhi);
      setAnalysis(a);
      setStatus('done');
      animateBars(false);
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

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setStatus('idle'); animateBars(false);
    if (!IS_MOBILE) recorder.stop();
  }, [animateBars, recorder]);

  useEffect(() => () => { cancelAnimationFrame(animRef.current); recognitionRef.current?.stop(); }, []);

  const nextPhrase = () => {
    setPhraseIdx(i => (i + 1) % pool.length);
    setStatus('idle'); setTranscript(''); setAnalysis(null);
    setBars(Array(12).fill(10)); recorder.reset();
  };

  const playAtSpeed = () => speak(phrase.awadhi, null, phrase.roman, speed);

  const overallBand   = score === null ? null : getOverallBand(score);
  const scoreColor    = overallBand?.color ?? 'text-forest';
  const scoreFeedback = overallBand?.label ?? '';

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-forest text-ivory p-8 rounded-3xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-tiro mb-1">🎙️ Aawaz Abhyas</h2>
          <p className="opacity-80 text-sm">
            Speak Awadhi · per-word feedback · weak-words tracker
            {voicePref && <span className="ml-2 text-marigold">· Voice: {voicePref.replace(/Microsoft|Online|\(Natural\)/gi, '').trim()}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowVoicePicker(true)}
            className="bg-marigold/20 hover:bg-marigold/30 px-4 py-2 rounded-xl border border-marigold/30 transition flex items-center gap-2"
            title="Pick a different voice"
          >
            <span className="text-lg">🎙️</span>
            <span className="text-xs font-bold uppercase tracking-wide">Voice</span>
          </button>
          <button
            onClick={() => setShowStats(s => !s)}
            className="bg-marigold/20 hover:bg-marigold/30 px-4 py-2 rounded-xl border border-marigold/30 transition flex items-center gap-2"
          >
            <span className="text-lg">📊</span>
            <span className="text-xs font-bold uppercase tracking-wide">Stats</span>
          </button>
        </div>
      </div>

      {showVoicePicker && (
        <VoicePicker onClose={() => { setShowVoicePicker(false); setVoicePref(getPreferredVoiceName()); }} />
      )}

      {/* ── Stats Panel (collapsible) ──────────────────────────── */}
      {showStats && (
        <div className="bg-white rounded-3xl p-6 border border-marigold/20 shadow-sm grid grid-cols-5 gap-4 animate-fadeIn">
          <StatBox label="Attempts" val={stats.totalAttempts} sub="Total recordings" />
          <StatBox label="Tried" val={`${stats.totalPhrasesTried}`} sub="Unique phrases" />
          <StatBox label="Mastered" val={stats.masteredCount} sub="≥80% best" color="text-green-500" />
          <StatBox label="Weak" val={stats.weakCount} sub="<50% best" color="text-red-400" />
          <StatBox label="Avg" val={`${stats.avgScore}%`} sub="Last attempts" />
          {Object.keys(stats.categoryStats).length > 0 && (
            <div className="col-span-5 mt-2 pt-4 border-t border-ivory">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">By Category (best score)</p>
              <div className="space-y-2">
                {Object.entries(stats.categoryStats).map(([cat, s]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs text-forest font-bold w-48 truncate">{cat}</span>
                    <div className="flex-1 h-2 bg-ivory rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.avg >= 80 ? 'bg-green-400' : s.avg >= 50 ? 'bg-marigold' : 'bg-red-400'}`}
                        style={{ width: `${s.avg}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500 w-10 text-right">{s.avg}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Filter Strip ───────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 border border-marigold/20 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Category:</span>
            <select
              value={category}
              onChange={e => { setCategory(e.target.value); setPhraseIdx(0); }}
              className="text-sm font-bold text-forest bg-ivory border border-marigold/20 rounded-xl px-3 py-1.5 outline-none focus:border-saffron"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">Level:</span>
            {DIFFICULTIES.map(d => (
              <button
                key={d.id}
                onClick={() => { setDifficulty(d.id); setPhraseIdx(0); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${difficulty === d.id ? 'bg-saffron text-white shadow-md' : 'text-forest bg-ivory hover:bg-marigold/10'}`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Mode toggle */}
          <button
            onClick={() => { setMode(m => m === 'weak' ? 'all' : 'weak'); setPhraseIdx(0); }}
            disabled={mode !== 'weak' && stats.weakCount === 0}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition disabled:opacity-30 disabled:cursor-not-allowed ${mode === 'weak' ? 'bg-red-400 text-white shadow-md' : 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'}`}
          >
            ⚠️ {mode === 'weak' ? `Weak Mode (${pool.length})` : `Weak Words (${stats.weakCount})`}
          </button>

          {/* Pool count */}
          <span className="text-xs text-slate-400 ml-auto">
            <span className="font-bold text-forest">{pool.length}</span> phrase{pool.length === 1 ? '' : 's'} in pool
          </span>
        </div>
      </div>

      {/* ── Main 2-Column Layout ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-8">
        {/* ── LEFT — Recorder ──────────────────────────────── */}
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center border border-marigold/20 shadow-sm">
          {/* Target phrase */}
          <div className="w-full bg-ivory/60 rounded-2xl p-6 text-center mb-6 border border-marigold/10 relative">
            {/* Mastery + unit chips */}
            <div className="absolute top-3 left-3 flex gap-2">
              {masteryIcon(phraseHistory, phrase.awadhi) && (
                <span className="text-base" title={phraseRecord ? `Best: ${phraseRecord.bestScore}%` : ''}>
                  {masteryIcon(phraseHistory, phrase.awadhi)}
                </span>
              )}
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <SpeakButton text={phrase.awadhi} roman={phrase.roman} size="md" />
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2 mb-2">
              {phrase.unitEmoji} {phrase.unitTitle} · {phrase.lessonName}
            </p>
            <p className="text-4xl font-tiro text-forest leading-snug">{phrase.awadhi}</p>
            <p className="text-saffron font-bold text-sm mt-2">{phrase.roman}</p>
            <p className="text-slate-500 italic text-sm mt-1">{phrase.english}</p>

            {/* Phonetic hint */}
            {showHint && (
              <p className="mt-3 text-marigold text-sm font-mono tracking-wide bg-white/60 p-2 rounded-lg border border-marigold/20">
                {syllabify(phrase.roman)}
              </p>
            )}

            {/* Hint + speed controls */}
            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-ivory">
              <button
                onClick={() => setShowHint(s => !s)}
                className={`text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-lg transition ${showHint ? 'bg-marigold text-white' : 'text-marigold hover:bg-marigold/10 border border-marigold/30'}`}
              >
                {showHint ? '✓ Syllables' : '💡 Hint'}
              </button>
              <span className="text-[10px] text-slate-300">·</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Speed:</span>
              {SPEEDS.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSpeed(s.id); }}
                  onDoubleClick={() => { setSpeed(s.id); playAtSpeed(); }}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition ${speed === s.id ? 'bg-forest text-white' : 'text-forest hover:bg-ivory'}`}
                >
                  {s.label}
                </button>
              ))}
              <button
                onClick={playAtSpeed}
                className="text-[10px] font-bold px-2 py-1 rounded bg-forest text-white hover:scale-105 transition"
                title="Play at selected speed"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Waveform */}
          <div className="flex items-end gap-1 h-16 mb-6 w-full max-w-xs justify-center">
            {bars.map((h, i) => (
              <div key={i} className={`w-3 rounded-full transition-all duration-75 ${status === 'listening' ? 'bg-saffron' : 'bg-marigold/30'}`} style={{ height: `${h}%` }} />
            ))}
          </div>

          {/* Record button */}
          {status === 'idle' || status === 'done' ? (
            <button onClick={startRecording} className="w-24 h-24 bg-saffron rounded-full flex items-center justify-center text-white text-4xl shadow-xl hover:scale-110 transition active:scale-95 border-4 border-saffron/30">
              🎙️
            </button>
          ) : (
            <button onClick={stopRecording} className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white text-4xl shadow-xl hover:scale-110 transition active:scale-95 animate-pulse border-4 border-red-300">
              ⏹
            </button>
          )}

          <p className="mt-4 text-slate-400 text-sm font-medium">
            {status === 'idle' && 'Click to start recording'}
            {status === 'listening' && '🔴 Listening... speak now'}
            {status === 'done' && 'Recording complete'}
          </p>

          {errorMsg && (
            <div className="mt-4 w-full bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
            </div>
          )}

          {/* Playback your recording — desktop only (mic conflict on mobile) */}
          {!IS_MOBILE && recorder.audioUrl && (
            <div className="mt-5 w-full bg-forest/5 border border-forest/20 rounded-2xl p-4 flex items-center gap-3">
              <button
                onClick={recorder.isPlaying ? recorder.pausePlayback : recorder.play}
                className="w-12 h-12 bg-forest text-white rounded-full flex items-center justify-center text-lg shadow-md hover:scale-105 active:scale-95 transition"
              >
                {recorder.isPlaying ? '⏸' : '▶'}
              </button>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-forest">Your Recording</p>
                <p className="text-xs text-slate-500 italic">Compare with native pronunciation above</p>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT — Score + Feedback + History ───────────── */}
        <div className="flex flex-col gap-6">
          {/* Score ring */}
          <div className="bg-ivory border-2 border-dashed border-marigold/30 rounded-3xl p-6 flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center mb-3">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth="11" fill="transparent" className="text-white/80" />
                <circle
                  cx="80" cy="80" r="68"
                  stroke="currentColor" strokeWidth="11" fill="transparent"
                  strokeDasharray="427"
                  strokeDashoffset={score === null ? 427 : 427 - (427 * score) / 100}
                  className={score === null ? 'text-slate-200' : score >= 80 ? 'text-green-400' : score >= 50 ? 'text-marigold' : 'text-red-400'}
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <span className={`absolute text-3xl font-black ${scoreColor}`}>{score === null ? '—' : `${score}%`}</span>
            </div>
            <h4 className={`text-lg font-bold ${scoreColor}`}>{scoreFeedback || 'Awaiting recording…'}</h4>
            {phraseRecord && (
              <p className="mt-2 text-xs text-slate-500">
                Best: <span className="font-bold text-green-500">{phraseRecord.bestScore}%</span>
                {' · '}Attempts: <span className="font-bold text-forest">{phraseRecord.attempts}</span>
              </p>
            )}
          </div>

          {/* Per-word breakdown — learner-facing, no internals */}
          {analysis && (
            <div className="bg-white rounded-3xl p-6 border border-marigold/20 shadow-sm space-y-5">
              <p className="text-xs font-black uppercase tracking-widest text-forest">Per-Word Accuracy</p>

              {/* Target with colored words */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Target</p>
                <p className="font-tiro text-2xl leading-relaxed flex flex-wrap gap-x-2 gap-y-1">
                  {analysis.words.map((w, i) => {
                    const c = w.grade.tw;
                    const pct = Math.round(w.similarity * 100);
                    return (
                      <span
                        key={i}
                        className={`${c.text} ${c.bg} px-2 py-0.5 rounded-md border ${c.border}`}
                        title={`${pct}% ${w.grade.short}`}
                      >
                        {w.target}
                      </span>
                    );
                  })}
                </p>
              </div>

              {/* You said — clean */}
              {transcript && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">You said</p>
                  <p className="font-tiro text-lg text-forest leading-relaxed bg-ivory/50 p-3 rounded-xl">
                    {analysis.normalizedTranscript || transcript}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Multi-attempt history */}
          {phraseRecord && phraseRecord.tries.length > 1 && (
            <div className="bg-white rounded-3xl p-5 border border-marigold/20 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-forest mb-3">Recent Attempts</p>
              <div className="space-y-2">
                {phraseRecord.tries.slice().reverse().map((t, i) => {
                  const c = t.score >= 80 ? 'text-green-500' : t.score >= 50 ? 'text-marigold' : 'text-red-400';
                  return (
                    <div key={i} className="flex items-center justify-between text-xs bg-ivory/40 px-3 py-2 rounded-lg">
                      <span className={`font-black text-base ${c} w-12`}>{t.score}%</span>
                      <span className="font-tiro text-forest text-sm flex-1 truncate ml-2">{t.transcript || '—'}</span>
                      <span className="text-slate-400 text-[10px]">
                        {i === 0 ? 'Latest' : `${i + 1} ago`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="bg-white rounded-3xl p-6 border border-marigold/20 shadow-sm space-y-3">
            <button onClick={startRecording} disabled={status === 'listening'}
              className="w-full border-2 border-forest text-forest py-3 rounded-2xl font-bold hover:bg-forest hover:text-white transition disabled:opacity-40">
              🔄 Try Again
            </button>
            <button onClick={nextPhrase}
              className="w-full bg-saffron text-white py-3 rounded-2xl font-bold shadow-md hover:scale-105 transition">
              Next Phrase →
            </button>
          </div>

          {/* Tip */}
          <div className="bg-forest text-white rounded-3xl p-6 shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">💡 Pronunciation Tip</p>
            <p className="text-sm italic leading-relaxed opacity-90">
              In Awadhi, <span className="text-marigold font-bold">"मा"</span> (ma) is used where Hindi uses <span className="text-marigold font-bold">"में"</span> (mein) — a key dialect marker. Speak it short and flat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatBox = ({ label, val, sub, color = 'text-forest' }) => (
  <div className="bg-ivory/50 rounded-2xl p-3 text-center border border-marigold/10">
    <p className={`text-2xl font-black ${color}`}>{val}</p>
    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mt-1">{label}</p>
    <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>
  </div>
);
