import { useState, useMemo } from 'react';
import words from './data/vocabulary.json';
import { SpeakButton } from './speak';

const CATEGORIES = ['All', 'Home', 'Family', 'Food', 'Nature', 'Education', 'Daily Life', 'Cultural'];

export default function Repository() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(() => {
    return words.filter(w => {
      const matchesCategory = activeCategory === 'All' || w.cat === activeCategory;
      const q = query.toLowerCase();
      const matchesQuery = !q ||
        w.awadhi.includes(query) ||
        w.roman.toLowerCase().includes(q) ||
        w.eng.toLowerCase().includes(q) ||
        w.cat.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-forest text-ivory p-8 rounded-3xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-tiro mb-1">शब्द भण्डार</h2>
          <p className="opacity-80 text-sm">Awadhi Word Repository — {words.length} words</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black text-marigold">{filtered.length}</p>
          <p className="text-xs uppercase tracking-widest opacity-70">Showing</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by Awadhi, Roman, or English…"
          className="flex-1 p-4 rounded-2xl border-2 border-marigold/20 focus:border-saffron outline-none shadow-inner bg-white"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="px-6 rounded-2xl border-2 border-marigold/20 text-slate-400 font-bold hover:text-saffron transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
              activeCategory === cat
                ? 'bg-saffron text-white shadow-md shadow-saffron/20'
                : 'bg-white text-forest border border-marigold/20 hover:border-saffron'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Word Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-bold text-lg">No words found</p>
          <p className="text-sm mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filtered.map((w, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-marigold/10 shadow-sm hover:scale-105 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] bg-ivory text-marigold px-2 py-1 rounded font-bold uppercase tracking-wide">
                  {w.cat}
                </span>
                <SpeakButton text={w.awadhi} roman={w.roman} size="sm" />
              </div>
              <h4 className="text-4xl font-tiro text-forest mb-1">{w.awadhi}</h4>
              <p className="text-saffron font-bold text-sm mb-4">{w.roman}</p>
              <p className="text-slate-500 text-sm border-t border-ivory pt-4">
                English: <span className="text-slate-800 font-medium">{w.eng}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
