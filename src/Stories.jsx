import React, { useState, useRef, useEffect, useCallback } from 'react';
import stories from './data/stories.json';
import { SpeakButton, speak, stopSpeech } from './speak';

const CULTURE_TABS = ['Lifecycle', 'Daily Life'];

const Stories = () => {
  const [activeTab, setActiveTab] = useState('Lifecycle');
  const [reading, setReading] = useState(stories[0]);
  const [paraIdx, setParaIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const filtered = stories.filter(s => s.category === activeTab);

  const stopPlayer = useCallback(() => {
    stopSpeech();
    setPlaying(false);
  }, []);

  const playParagraph = useCallback((idx) => {
    const para = reading.paragraphs[idx];
    if (!para) { stopPlayer(); return; }
    setParaIdx(idx);
    setPlaying(true);
    speak(para.awadhi, () => {
      const next = idx + 1;
      if (next < reading.paragraphs.length) {
        playParagraph(next);
      } else {
        setPlaying(false);
      }
    }, para.roman);
  }, [reading, stopPlayer]);

  const togglePlay = useCallback(() => {
    if (playing) {
      stopPlayer();
    } else {
      playParagraph(paraIdx);
    }
  }, [playing, paraIdx, playParagraph, stopPlayer]);

  const prevPara = () => {
    stopPlayer();
    setParaIdx(i => Math.max(0, i - 1));
  };

  const nextPara = () => {
    stopPlayer();
    setParaIdx(i => Math.min(reading.paragraphs.length - 1, i + 1));
  };

  // Stop playback when story changes
  useEffect(() => {
    stopPlayer();
    setParaIdx(0);
  }, [reading.id]);

  // Stop on unmount
  useEffect(() => () => stopSpeech(), []);

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* STORIES LIBRARY */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-tiro text-forest">Stories Library</h2>
          <div className="flex gap-2">
            {CULTURE_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${activeTab === tab ? 'bg-saffron text-white shadow-md' : 'bg-white text-forest border border-marigold/20'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {filtered.map((story) => (
            <div
              key={story.id}
              onClick={() => setReading(story)}
              className={`min-w-[280px] rounded-[2rem] border shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden ${
                reading.id === story.id ? 'border-saffron border-2' : 'border-marigold/20 bg-white'
              }`}
            >
              <div className="h-40 bg-ivory flex items-center justify-center text-6xl hover:scale-110 transition-transform">
                {story.img}
              </div>
              <div className="p-6 bg-white">
                <span className={`text-[10px] px-2 py-1 rounded font-bold ${reading.id === story.id ? 'bg-saffron/10 text-saffron' : 'bg-forest/10 text-forest'}`}>
                  {story.level}
                </span>
                <h4 className="text-xl font-bold mt-2 leading-tight">{story.title}</h4>
                <p className="font-tiro text-saffron mt-1">{story.awadhi}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{story.summary}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-slate-400">🕒 {story.time}</span>
                  <button className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md ${reading.id === story.id ? 'bg-saffron text-white' : 'bg-forest/20 text-forest'}`}>
                    {reading.id === story.id ? '▶' : '▷'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NOW READING PANEL */}
      <section className="grid grid-cols-12 gap-6">
        {/* Story Text */}
        <div className="col-span-8 bg-white p-10 rounded-[2.5rem] border-l-8 border-saffron shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">{reading.img}</span>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Now Reading</p>
              <h3 className="text-lg font-bold text-forest">{reading.title}</h3>
            </div>
            <span className="ml-auto text-[10px] bg-forest/10 text-forest px-3 py-1 rounded-full font-bold">{reading.level}</span>
          </div>

          <div className="space-y-6">
            {reading.paragraphs.map((p, i) => (
              <div
                key={i}
                className={`border-b border-ivory pb-6 last:border-0 rounded-xl transition-colors ${paraIdx === i && playing ? 'bg-saffron/5 -mx-4 px-4' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-2xl font-tiro text-forest leading-relaxed">{p.awadhi}</p>
                    <p className="text-sm text-slate-400 italic mt-2 leading-relaxed">{p.english}</p>
                  </div>
                  <SpeakButton text={p.awadhi} roman={p.roman} size="md" className="mt-1 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-4 space-y-6">
          {/* Audio Player */}
          <div className="bg-forest rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 text-4xl p-2">🎵</div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-sm">Audio Player</h4>
              <span className="text-xs opacity-60">
                {paraIdx + 1} / {reading.paragraphs.length}
              </span>
            </div>

            {/* Waveform bars — animate when playing */}
            <div className="flex items-center gap-1 h-14 mb-6">
              {[20, 50, 30, 80, 40, 90, 20, 60, 40, 70, 30, 55, 45].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-150 ${playing ? 'bg-marigold animate-pulse' : 'bg-marigold/40'}`}
                  style={{ height: `${playing ? 15 + Math.random() * 75 : h}%` }}
                />
              ))}
            </div>

            {/* Paragraph progress dots */}
            <div className="flex justify-center gap-1.5 mb-5">
              {reading.paragraphs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { stopPlayer(); setParaIdx(i); }}
                  className={`rounded-full transition-all ${i === paraIdx ? 'w-4 h-2 bg-marigold' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-6">
              <button
                onClick={prevPara}
                disabled={paraIdx === 0}
                className="text-2xl opacity-70 hover:opacity-100 disabled:opacity-30 transition"
              >
                ⏮
              </button>
              <button
                onClick={togglePlay}
                className="w-14 h-14 bg-white text-forest rounded-full flex items-center justify-center text-xl shadow-lg hover:scale-105 active:scale-95 transition"
              >
                {playing ? '⏸' : '▶'}
              </button>
              <button
                onClick={nextPara}
                disabled={paraIdx >= reading.paragraphs.length - 1}
                className="text-2xl opacity-70 hover:opacity-100 disabled:opacity-30 transition"
              >
                ⏭
              </button>
            </div>

            <p className="text-center text-xs opacity-50 mt-4 font-tiro truncate">
              {reading.paragraphs[paraIdx]?.awadhi?.slice(0, 40)}…
            </p>
          </div>

          {/* Vocabulary Spotlight */}
          <div className="bg-white p-6 rounded-[2rem] border border-marigold/20 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-forest mb-4">Vocabulary Spotlight</p>
            <div className="space-y-3">
              {reading.vocabulary.map((v, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-ivory last:border-0">
                  <div className="flex items-center gap-3">
                    <SpeakButton text={v.awadhi} roman={v.roman} size="sm" />
                    <div>
                      <p className="font-tiro text-forest text-lg leading-none">{v.awadhi}</p>
                      <p className="text-xs text-saffron font-bold mt-0.5">{v.roman}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{v.english}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Stories;
