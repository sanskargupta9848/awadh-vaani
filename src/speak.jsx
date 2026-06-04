import React, { useState, useEffect } from 'react';

const RATE = 0.78;
const PREF_KEY = 'awadhvaani_voice_pref';

// True if a voice's name suggests it's a high-quality neural voice.
// Edge ships "Microsoft Aarav Online (Natural) - Hindi (India)" and similar — these
// sound dramatically more human than the default SAPI voices.
// Note: "Online" alone is NOT enough — that just means cloud-streamed (Google voices
// have it too and frequently drop). We require explicit Natural/Neural/Premium markers.
function isNaturalVoice(name = '') {
  return /Natural|Neural|Premium|Enhanced/i.test(name);
}

// Read user's preferred voice (from voice picker), if any
export function getPreferredVoiceName() {
  try { return localStorage.getItem(PREF_KEY); } catch { return null; }
}

export function setPreferredVoiceName(name) {
  try {
    if (name) localStorage.setItem(PREF_KEY, name);
    else localStorage.removeItem(PREF_KEY);
  } catch {}
}

// Auto-select the best available voice. Priority:
// 1. User's saved preference (if it still exists)
// 2. Natural/Neural voice in hi-IN
// 3. Natural/Neural voice in hi-* or en-IN or anything
// 4. Local hi-IN
// 5. Local en-IN
// 6. Any local voice
function getVoice(overrideName = null) {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const tryName = overrideName || getPreferredVoiceName();
  if (tryName) {
    const found = voices.find(v => v.name === tryName);
    if (found) return found;
  }

  return (
    // 1. Local Indian voices first — guaranteed to work, never throttle.
    //    Microsoft Ravi (en-IN) is the gold standard for reliability across browsers.
    voices.find(v => v.lang === 'hi-IN' && v.localService) ||
    voices.find(v => v.lang === 'en-IN' && v.localService) ||
    voices.find(v => v.localService && v.lang.startsWith('hi')) ||
    // 2. Then Natural/Neural cloud voices in Hindi (sound great but can fail)
    voices.find(v => isNaturalVoice(v.name) && v.lang === 'hi-IN') ||
    voices.find(v => isNaturalVoice(v.name) && v.lang.startsWith('hi')) ||
    voices.find(v => isNaturalVoice(v.name) && v.lang === 'en-IN') ||
    // 3. Other local voices
    voices.find(v => v.localService && v.lang.startsWith('en')) ||
    voices.find(v => v.localService) ||
    // 4. Anything else
    voices.find(v => isNaturalVoice(v.name)) ||
    voices.find(v => v.lang === 'hi-IN') ||
    voices.find(v => v.lang.startsWith('hi')) ||
    voices.find(v => v.lang === 'en-IN') ||
    voices[0]
  );
}

// Inspect available voices for the picker UI. Sorted: Natural first → local → others.
export function listVoices() {
  return window.speechSynthesis.getVoices()
    .map(v => ({
      name: v.name,
      lang: v.lang,
      localService: v.localService,
      isNatural: isNaturalVoice(v.name),
    }))
    .sort((a, b) => {
      if (a.isNatural !== b.isNatural) return a.isNatural ? -1 : 1;
      if (a.localService !== b.localService) return a.localService ? -1 : 1;
      return a.lang.localeCompare(b.lang);
    });
}

// If chosen voice can't speak Devanagari, fall back to roman transliteration
function pickText(devanagari, roman, voice) {
  const isHindi = voice?.lang?.startsWith('hi');
  return (isHindi || !roman) ? devanagari : roman;
}

let _keepAlive = null;
function startKeepAlive() {
  clearInterval(_keepAlive);
  _keepAlive = setInterval(() => {
    if (!window.speechSynthesis.speaking) { clearInterval(_keepAlive); return; }
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
  }, 10000);
}

export function speak(devanagari, onEnd, roman, rate = RATE, voiceName = null) {
  if (!window.speechSynthesis) return;
  const voice = getVoice(voiceName);
  const text = pickText(devanagari, roman, voice);
  const utt = new SpeechSynthesisUtterance(text);
  if (voice) { utt.voice = voice; utt.lang = voice.lang; }
  utt.rate = rate;
  utt.volume = 1;
  utt.pitch = 1;
  utt.onend = () => { clearInterval(_keepAlive); onEnd?.(); };
  utt.onerror = () => clearInterval(_keepAlive);
  window.speechSynthesis.resume();
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
  startKeepAlive();
}

export function stopSpeech() {
  clearInterval(_keepAlive);
  window.speechSynthesis?.cancel();
}

export function SpeakButton({ text, roman, size = 'md', className = '' }) {
  const [active, setActive] = useState(false);

  useEffect(() => () => stopSpeech(), []);

  const toggle = (e) => {
    e.stopPropagation();
    if (!window.speechSynthesis) return;

    if (active) {
      stopSpeech();
      setActive(false);
      return;
    }

    const voice = getVoice();
    const spoken = pickText(text, roman, voice);
    const utt = new SpeechSynthesisUtterance(spoken);
    if (voice) { utt.voice = voice; utt.lang = voice.lang; }
    utt.rate = RATE;
    utt.volume = 1;
    utt.pitch = 1;
    utt.onend = () => { clearInterval(_keepAlive); setActive(false); };
    utt.onerror = () => { clearInterval(_keepAlive); setActive(false); };

    setActive(true);
    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
    startKeepAlive();
  };

  const sizes = { sm: 'w-7 h-7 text-sm', md: 'w-9 h-9 text-base', lg: 'w-12 h-12 text-xl' };

  return (
    <button
      onClick={toggle}
      title={active ? 'रोकें · Stop' : 'सुनें · Listen'}
      className={`${sizes[size] ?? sizes.md} rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
        active
          ? 'bg-saffron text-white animate-pulse shadow-md shadow-saffron/40'
          : 'bg-ivory text-marigold hover:bg-saffron hover:text-white border border-marigold/20'
      } ${className}`}
    >
      {active ? '⏹' : '🔊'}
    </button>
  );
}
