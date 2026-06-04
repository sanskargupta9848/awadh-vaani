import { useState, useMemo } from 'react';
import words from '../data/vocabulary.json';
import { SpeakButton } from '../speak';

const CATEGORIES = ['All', 'Home', 'Family', 'Food', 'Nature', 'Education', 'Daily Life', 'Cultural'];

export default function RepositoryM() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => words.filter(w => {
    const matchesCat = activeCategory === 'All' || w.cat === activeCategory;
    const q = query.toLowerCase();
    const matchesQ = !q || w.awadhi.includes(query) || w.roman.toLowerCase().includes(q) || w.eng.toLowerCase().includes(q);
    return matchesCat && matchesQ;
  }), [query, activeCategory]);

  return (
    <div className="space-y-4 pb-4 animate-fadeIn">
      {/* Header */}
      <div className="bg-forest text-ivory p-5 rounded-3xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-tiro">शब्द भण्डार</h2>
          <p className="opacity-70 text-xs mt-0.5">{words.length} Awadhi words</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-marigold">{filtered.length}</p>
          <p className="text-[10px] uppercase opacity-60">Showing</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search Awadhi, Roman, English…"
          className="flex-1 p-3 rounded-2xl border-2 border-marigold/20 focus:border-saffron outline-none bg-white text-sm" />
        {query && <button onClick={() => setQuery('')} className="px-4 rounded-2xl border-2 border-marigold/20 text-slate-400 font-bold">✕</button>}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full font-bold text-xs whitespace-nowrap flex-shrink-0 transition-all ${activeCategory === cat ? 'bg-saffron text-white shadow-md' : 'bg-white text-forest border border-marigold/20'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* 2-col grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-bold">No words found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((w, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-marigold/10 shadow-sm active:scale-95 transition">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] bg-ivory text-marigold px-1.5 py-0.5 rounded font-bold uppercase">{w.cat}</span>
                <SpeakButton text={w.awadhi} roman={w.roman} size="sm" />
              </div>
              <h4 className="text-2xl font-tiro text-forest mb-0.5">{w.awadhi}</h4>
              <p className="text-saffron font-bold text-xs mb-2">{w.roman}</p>
              <p className="text-slate-500 text-xs border-t border-ivory pt-2">{w.eng}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
