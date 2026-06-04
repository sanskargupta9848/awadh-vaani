import React, { useState, useEffect, useMemo } from 'react';
import {
  listVoices, getPreferredVoiceName, setPreferredVoiceName,
  speak, stopSpeech,
} from './speak';

const SAMPLE_AWADHI = 'नमस्ते, हम Awadhi सीख रहे हैं';
const SAMPLE_ROMAN  = 'Namaste, hum Awadhi seekh rahe hain';

const FILTERS = [
  { id: 'recommended', label: '⭐ Recommended', desc: 'Hindi & Indian English only' },
  { id: 'hi',          label: 'Hindi' },
  { id: 'en',          label: 'English' },
  { id: 'natural',     label: '✨ Natural' },
  { id: 'all',         label: 'All' },
];

export default function VoicePicker({ onClose }) {
  const [voices, setVoices] = useState([]);
  const [pref, setPref] = useState(getPreferredVoiceName());
  const [previewing, setPreviewing] = useState(null);
  const [filter, setFilter] = useState('recommended');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = () => setVoices(listVoices());
    load();
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = load;
    }
    return () => stopSpeech();
  }, []);

  const filtered = useMemo(() => {
    let list = voices;
    if (filter === 'recommended') {
      list = voices.filter(v => v.lang.startsWith('hi') || v.lang === 'en-IN');
    } else if (filter === 'natural') {
      list = voices.filter(v => v.isNatural);
    } else if (filter === 'hi') {
      list = voices.filter(v => v.lang.startsWith('hi'));
    } else if (filter === 'en') {
      list = voices.filter(v => v.lang.startsWith('en'));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v => v.name.toLowerCase().includes(q) || v.lang.toLowerCase().includes(q));
    }
    return list;
  }, [voices, filter, search]);

  const select = (name) => { setPref(name); setPreferredVoiceName(name); };
  const reset  = () => { setPref(null); setPreferredVoiceName(null); };

  const preview = (voice) => {
    if (previewing === voice.name) {
      stopSpeech();
      setPreviewing(null);
      return;
    }
    setPreviewing(voice.name);
    // Auto-clear preview state after 4s in case onend never fires (cloud voice silently failed)
    const timer = setTimeout(() => setPreviewing(null), 4000);
    speak(SAMPLE_AWADHI, () => { clearTimeout(timer); setPreviewing(null); }, SAMPLE_ROMAN, 0.5, voice.name);
  };

  const counts = useMemo(() => ({
    recommended: voices.filter(v => v.lang.startsWith('hi') || v.lang === 'en-IN').length,
    hi: voices.filter(v => v.lang.startsWith('hi')).length,
    en: voices.filter(v => v.lang.startsWith('en')).length,
    natural: voices.filter(v => v.isNatural).length,
    all: voices.length,
  }), [voices]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-forest/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-ivory bg-gradient-to-br from-saffron/5 to-marigold/5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-tiro text-2xl text-forest">🎙️ Choose Your Voice</h3>
              <p className="text-xs text-slate-500 mt-1">Tap ▶ to preview · pick the one that sounds best</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-forest text-2xl leading-none">✕</button>
          </div>

          {/* Edge tip */}
          {voices.length > 100 && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
              ⚠️ <span className="font-bold">Tip:</span> Some <em>Online (Natural)</em> voices need a stable network and may not play. If a voice fails to play, try <span className="font-bold">Microsoft Ravi</span> or <span className="font-bold">Heera</span> (under English filter) — they're local and always work.
            </div>
          )}

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search voices (e.g. 'Ravi', 'Aarav', 'hi')"
            className="mt-3 w-full px-3 py-2 rounded-xl border border-marigold/20 text-sm outline-none focus:border-saffron"
          />

          {/* Filter chips */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                title={f.desc}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${filter === f.id ? 'bg-saffron text-white shadow-md' : 'bg-ivory text-forest border border-marigold/20 hover:border-saffron'}`}>
                {f.label} ({counts[f.id]})
              </button>
            ))}
          </div>
        </div>

        {/* Voice list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {/* Auto option */}
          <button onClick={reset}
            className={`w-full p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition ${!pref ? 'border-saffron bg-saffron/10 shadow-md' : 'border-ivory hover:border-marigold/30'}`}>
            <span className="text-2xl">⚡</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-forest">Auto</p>
                <span className="text-[9px] bg-saffron/20 text-saffron px-1.5 py-0.5 rounded font-bold">RECOMMENDED</span>
              </div>
              <p className="text-[10px] text-slate-400">Reliable local voice — Microsoft Ravi or similar</p>
            </div>
            {!pref && <span className="text-saffron text-xl">✓</span>}
          </button>

          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">No voices match your filter</p>
          ) : (
            filtered.map(v => {
              const isCloud = !v.localService;
              return (
                <div key={v.name}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition ${pref === v.name ? 'border-saffron bg-saffron/10 shadow-md' : 'border-ivory hover:border-marigold/30'}`}>
                  <button
                    onClick={() => preview(v)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-base shadow-sm flex-shrink-0 transition ${previewing === v.name ? 'bg-red-500 text-white animate-pulse' : 'bg-forest text-white hover:scale-110'}`}>
                    {previewing === v.name ? '⏹' : '▶'}
                  </button>
                  <button onClick={() => select(v.name)} className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-sm text-forest truncate">{v.name}</p>
                      {v.isNatural && <span className="text-[9px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold flex-shrink-0">✨ NATURAL</span>}
                      {v.localService && <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-bold flex-shrink-0">✓ RELIABLE</span>}
                      {isCloud && !v.isNatural && <span className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-bold flex-shrink-0">CLOUD</span>}
                      {isCloud && <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold flex-shrink-0" title="May fail silently">⚠️</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{v.lang}</p>
                  </button>
                  {pref === v.name && <span className="text-saffron text-xl flex-shrink-0">✓</span>}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ivory bg-ivory/30">
          <button onClick={onClose}
            className="w-full bg-saffron text-white py-3 rounded-2xl font-bold shadow-md hover:scale-[1.02] active:scale-95 transition">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
