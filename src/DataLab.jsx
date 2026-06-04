import React, { useState, useMemo } from 'react';
import vocab from './data/vocabulary.json';
import lessons from './data/lessons.json';

// ── Shared lookups ────────────────────────────────────────────────────────────

const ALL_SENTENCES = lessons.flatMap(u => u.lessons.flatMap(l => l.sentences));

const vocabByWord = {};
const categoryMap = {};
vocab.forEach(w => {
  vocabByWord[w.awadhi] = w;
  if (!categoryMap[w.cat]) categoryMap[w.cat] = [];
  categoryMap[w.cat].push(w);
});

function tokenize(str) {
  return str.split(/[\s।,!?]+/).filter(Boolean);
}

// ── Generator 1: Word substitution ───────────────────────────────────────────

function generateSubstitutions() {
  const results = [];
  ALL_SENTENCES.forEach(sentence => {
    const found = tokenize(sentence.awadhi).filter(t => vocabByWord[t]);
    if (!found.length) return;
    found.forEach(word => {
      const original = vocabByWord[word];
      (categoryMap[original.cat] || []).filter(w => w.awadhi !== word).slice(0, 4).forEach(alt => {
        const newAwadhi = sentence.awadhi.replace(word, alt.awadhi);
        if (newAwadhi === sentence.awadhi) return;
        const escaped = original.eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        results.push({
          क्रम: results.length + 1,
          मूल_अवधी: sentence.awadhi,
          संश्लेषित_अवधी: newAwadhi,
          संश्लेषित_रोमन: sentence.roman.replace(new RegExp(original.roman, 'i'), alt.roman),
          संश्लेषित_अंग्रेजी: sentence.english.replace(new RegExp(escaped, 'i'), alt.eng),
          प्रतिस्थापन: `${word} → ${alt.awadhi}`,
          श्रेणी: original.cat,
        });
      });
    });
  });
  return results;
}

// ── Generator 2: Template generation ─────────────────────────────────────────

function generateTemplates() {
  const results = [];
  const usedTemplates = new Set();
  ALL_SENTENCES.forEach(sentence => {
    const found = tokenize(sentence.awadhi).filter(t => vocabByWord[t]);
    if (found.length !== 1) return;
    const word = found[0];
    const original = vocabByWord[word];
    const templateAw = sentence.awadhi.replace(word, `[${original.cat.toUpperCase()}]`);
    if (usedTemplates.has(templateAw)) return;
    usedTemplates.add(templateAw);
    const escapedEng = original.eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const templateEn = sentence.english.replace(new RegExp(escapedEng, 'i'), `[${original.cat.toUpperCase()}]`);
    (categoryMap[original.cat] || []).filter(w => w.awadhi !== word).forEach(filler => {
      results.push({
        क्रम: results.length + 1,
        साँचा_अवधी: templateAw,
        साँचा_अंग्रेजी: templateEn,
        संश्लेषित_अवधी: sentence.awadhi.replace(word, filler.awadhi),
        संश्लेषित_रोमन: sentence.roman.replace(new RegExp(original.roman, 'i'), filler.roman),
        संश्लेषित_अंग्रेजी: sentence.english.replace(new RegExp(escapedEng, 'i'), filler.eng),
        भराव_शब्द: filler.awadhi,
        भराव_रोमन: filler.roman,
        श्रेणी: original.cat,
      });
    });
  });
  return results;
}

// ── Pipeline stats (computed once) ───────────────────────────────────────────

function computePipelineStats() {
  // Substitution pipeline
  const sentencesWithVocab = ALL_SENTENCES.filter(s =>
    tokenize(s.awadhi).some(t => vocabByWord[t])
  );
  const vocabMatchCount = sentencesWithVocab.reduce((sum, s) => {
    return sum + tokenize(s.awadhi).filter(t => vocabByWord[t]).length;
  }, 0);

  const subRows = generateSubstitutions();

  // Template pipeline
  const singleVocabSentences = ALL_SENTENCES.filter(s => {
    const found = tokenize(s.awadhi).filter(t => vocabByWord[t]);
    return found.length === 1;
  });
  const usedTemplates = new Set();
  let uniqueTemplates = 0;
  singleVocabSentences.forEach(s => {
    const word = tokenize(s.awadhi).filter(t => vocabByWord[t])[0];
    const original = vocabByWord[word];
    const tpl = s.awadhi.replace(word, `[${original.cat.toUpperCase()}]`);
    if (!usedTemplates.has(tpl)) { usedTemplates.add(tpl); uniqueTemplates++; }
  });
  const tplRows = generateTemplates();

  // Sample matched sentences
  const sampleSub = sentencesWithVocab.slice(0, 3).map(s => {
    const word = tokenize(s.awadhi).filter(t => vocabByWord[t])[0];
    return { sentence: s.awadhi, word, cat: vocabByWord[word]?.cat };
  });

  // Sample templates
  const usedT = new Set();
  const sampleTpl = [];
  singleVocabSentences.forEach(s => {
    if (sampleTpl.length >= 3) return;
    const word = tokenize(s.awadhi).filter(t => vocabByWord[t])[0];
    const original = vocabByWord[word];
    const tpl = s.awadhi.replace(word, `[${original.cat.toUpperCase()}]`);
    if (!usedT.has(tpl)) { usedT.add(tpl); sampleTpl.push({ template: tpl, cat: original.cat, word }); }
  });

  return {
    totalSentences: ALL_SENTENCES.length,
    sentencesWithVocab: sentencesWithVocab.length,
    vocabMatchCount,
    subOutputCount: subRows.length,
    singleVocabSentences: singleVocabSentences.length,
    uniqueTemplates,
    tplOutputCount: tplRows.length,
    sampleSub,
    sampleTpl,
    categoryCount: Object.keys(categoryMap).length,
    vocabTotal: vocab.length,
  };
}

// ── Download helpers ──────────────────────────────────────────────────────────

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  return '\uFEFF' + [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
}

function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DataLab() {
  const [view, setView] = useState('pipeline'); // 'pipeline' | 'dataset'
  const [activeId, setActiveId] = useState('substitution');
  const [previewCount, setPreviewCount] = useState(10);

  const subData = useMemo(() => generateSubstitutions(), []);
  const tplData = useMemo(() => generateTemplates(), []);
  const stats = useMemo(() => computePipelineStats(), []);

  const dataset = activeId === 'substitution' ? subData : tplData;
  const columns = dataset.length > 0 ? Object.keys(dataset[0]) : [];

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header */}
      <div className="bg-forest text-white p-8 rounded-3xl shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-tiro mb-1">🧪 डेटा प्रयोगशाला</h2>
          <p className="text-sm opacity-70 font-medium">Data Lab — Truly Synthetic Dataset Generator</p>
          <p className="text-xs opacity-50 mt-1 italic">मौजूदा पाठ-वाक्यों से स्वचालित रूप से नए अवधी वाक्य निर्मित।</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-center">
            <StatPill label="प्रतिस्थापन" val={subData.length} />
            <StatPill label="साँचा" val={tplData.length} />
            <StatPill label="कुल संश्लेषित" val={subData.length + tplData.length} highlight />
          </div>
          {/* View toggle */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-1 flex gap-1">
            <button onClick={() => setView('pipeline')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${view === 'pipeline' ? 'bg-saffron text-white' : 'text-white/60 hover:text-white'}`}>
              🔁 Pipeline
            </button>
            <button onClick={() => setView('dataset')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${view === 'dataset' ? 'bg-saffron text-white' : 'text-white/60 hover:text-white'}`}>
              📊 Dataset
            </button>
          </div>
        </div>
      </div>

      {/* ── PIPELINE VIEW ── */}
      {view === 'pipeline' && (
        <div className="grid grid-cols-2 gap-6">

          {/* LEFT: Substitution Pipeline */}
          <div className="space-y-0">
            <div className="bg-forest text-white px-5 py-3 rounded-t-2xl flex items-center gap-3">
              <span className="text-xl">🔄</span>
              <div>
                <p className="font-bold text-sm">शब्द-प्रतिस्थापन</p>
                <p className="text-[10px] opacity-60">Word Substitution Augmentation</p>
              </div>
              <span className="ml-auto text-marigold font-black">{subData.length} rows</span>
            </div>

            <PipelineStep
              num="01" icon="📥"
              title="स्रोत डेटा · Source"
              stat={`${stats.totalSentences} वाक्य`}
              statEn={`${stats.totalSentences} lesson sentences from lessons.json`}
              color="border-forest"
            >
              <div className="space-y-1">
                {ALL_SENTENCES.slice(0, 3).map((s, i) => (
                  <p key={i} className="font-tiro text-forest text-xs bg-white rounded-lg px-3 py-1.5 border border-marigold/10">{s.awadhi}</p>
                ))}
                <p className="text-[10px] text-slate-400 italic">+ {stats.totalSentences - 3} more…</p>
              </div>
            </PipelineStep>

            <Arrow />

            <PipelineStep
              num="02" icon="🔤"
              title="टोकनीकरण · Tokenize"
              stat="spaces + punctuation split"
              statEn={`Each sentence split on \\s। , ! ?`}
              color="border-forest"
            >
              <div className="bg-white rounded-xl p-3 border border-marigold/10 text-xs font-mono">
                <p className="text-slate-400 mb-1">"हमार भाय लखनऊ मा रहत है।"</p>
                <p className="text-saffron">→ [<span className="text-forest">"हमार"</span>, <span className="text-red-400 font-bold">"भाय"</span>, <span className="text-forest">"लखनऊ"</span>, <span className="text-forest">"मा"</span>, <span className="text-forest">"रहत"</span>, <span className="text-forest">"है"</span>]</p>
              </div>
            </PipelineStep>

            <Arrow />

            <PipelineStep
              num="03" icon="🔍"
              title="शब्द-भंडार मिलान · Vocab Match"
              stat={`${stats.sentencesWithVocab} / ${stats.totalSentences} वाक्यों में मिला`}
              statEn={`${stats.vocabMatchCount} vocab tokens found across ${stats.sentencesWithVocab} sentences`}
              color="border-marigold"
            >
              <div className="space-y-1.5">
                {stats.sampleSub.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-marigold/10">
                    <p className="font-tiro text-forest text-xs flex-1">{s.sentence}</p>
                    <span className="bg-saffron/10 text-saffron text-[10px] font-bold px-2 py-0.5 rounded-full border border-saffron/20 flex-shrink-0">{s.word} · {s.cat}</span>
                  </div>
                ))}
              </div>
            </PipelineStep>

            <Arrow />

            <PipelineStep
              num="04" icon="🏷️"
              title="श्रेणी पहचान · Category Lookup"
              stat={`${stats.categoryCount} श्रेणियाँ — ${stats.vocabTotal} शब्द`}
              statEn={`vocabulary.json has ${stats.categoryCount} categories`}
              color="border-marigold"
            >
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {Object.entries(categoryMap).map(([cat, words]) => (
                  <div key={cat} className="bg-white rounded-lg px-2 py-1.5 border border-marigold/10 flex justify-between items-center">
                    <span className="font-bold text-forest">{cat}</span>
                    <span className="text-slate-400">{words.length} शब्द</span>
                  </div>
                ))}
              </div>
            </PipelineStep>

            <Arrow />

            <PipelineStep
              num="05" icon="🔄"
              title="प्रतिस्थापन · Substitute"
              stat="max 4 alternatives per word"
              statEn="Each vocab word swapped with up to 4 same-category alternatives"
              color="border-saffron"
            >
              <div className="space-y-1.5 text-xs">
                <div className="bg-ivory rounded-lg p-2 border border-marigold/10">
                  <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">मूल · Original</p>
                  <p className="font-tiro text-forest">हमार <span className="bg-saffron/20 px-1 rounded">भाय</span> लखनऊ मा रहत है।</p>
                </div>
                {['बहिन', 'अम्मा', 'दोस्त'].map((w, i) => (
                  <div key={i} className="bg-green-50 rounded-lg p-2 border border-green-100 flex items-center gap-2">
                    <span className="text-green-600 text-[9px] font-black">NEW</span>
                    <p className="font-tiro text-forest">हमार <span className="bg-green-200/70 px-1 rounded">{w}</span> लखनऊ मा रहत है।</p>
                  </div>
                ))}
              </div>
            </PipelineStep>

            <Arrow />

            <div className="bg-green-600 text-white px-5 py-4 rounded-b-2xl flex items-center justify-between">
              <div>
                <p className="font-bold">📤 आउटपुट · Output</p>
                <p className="text-[10px] opacity-70">awadhvaani_synthetic_substitution.json / .csv</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">{subData.length}</p>
                <p className="text-[10px] opacity-70">नए संश्लेषित वाक्य</p>
              </div>
            </div>
          </div>

          {/* RIGHT: Template Pipeline */}
          <div className="space-y-0">
            <div className="bg-saffron text-white px-5 py-3 rounded-t-2xl flex items-center gap-3">
              <span className="text-xl">🧩</span>
              <div>
                <p className="font-bold text-sm">साँचा-निर्माण</p>
                <p className="text-[10px] opacity-70">Template-based Generation</p>
              </div>
              <span className="ml-auto text-white font-black">{tplData.length} rows</span>
            </div>

            <PipelineStep
              num="01" icon="📥"
              title="स्रोत डेटा · Source"
              stat={`${stats.totalSentences} वाक्य`}
              statEn={`${stats.totalSentences} lesson sentences from lessons.json`}
              color="border-saffron"
            >
              <div className="space-y-1">
                {ALL_SENTENCES.slice(0, 3).map((s, i) => (
                  <p key={i} className="font-tiro text-forest text-xs bg-white rounded-lg px-3 py-1.5 border border-marigold/10">{s.awadhi}</p>
                ))}
                <p className="text-[10px] text-slate-400 italic">+ {stats.totalSentences - 3} more…</p>
              </div>
            </PipelineStep>

            <Arrow color="border-saffron/30" />

            <PipelineStep
              num="02" icon="🔤"
              title="टोकनीकरण · Tokenize"
              stat="spaces + punctuation split"
              statEn="Same tokenization as substitution pipeline"
              color="border-saffron"
            >
              <div className="bg-white rounded-xl p-3 border border-marigold/10 text-xs font-mono">
                <p className="text-slate-400 mb-1">"हम भात खाइब।"</p>
                <p className="text-saffron">→ [<span className="text-forest">"हम"</span>, <span className="text-red-400 font-bold">"भात"</span>, <span className="text-forest">"खाइब"</span>]</p>
              </div>
            </PipelineStep>

            <Arrow color="border-saffron/30" />

            <PipelineStep
              num="03" icon="🎯"
              title="एकल-शब्द फ़िल्टर · Single-Slot Filter"
              stat={`${stats.singleVocabSentences} वाक्य पास · ${stats.totalSentences - stats.singleVocabSentences} हटाए`}
              statEn={`Only sentences with EXACTLY 1 vocab word kept — cleanest templates`}
              color="border-saffron"
            >
              <div className="space-y-1.5 text-xs">
                <div className="flex gap-2 items-center bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                  <span className="text-green-600 font-black text-[10px]">✓</span>
                  <p className="font-tiro text-forest">हम <span className="bg-saffron/20 px-1 rounded">भात</span> खाइब। <span className="text-[10px] text-slate-400">(1 vocab word)</span></p>
                </div>
                <div className="flex gap-2 items-center bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
                  <span className="text-red-400 font-black text-[10px]">✗</span>
                  <p className="font-tiro text-forest">हमार <span className="bg-saffron/20 px-1 rounded">बाप</span> <span className="bg-saffron/20 px-1 rounded">खेत</span> मा। <span className="text-[10px] text-slate-400">(2 vocab words)</span></p>
                </div>
              </div>
            </PipelineStep>

            <Arrow color="border-saffron/30" />

            <PipelineStep
              num="04" icon="🧩"
              title="साँचा निर्माण · Extract Template"
              stat={`${stats.uniqueTemplates} अनोखे साँचे`}
              statEn={`${stats.uniqueTemplates} unique templates extracted (duplicates removed)`}
              color="border-saffron"
            >
              <div className="space-y-1.5">
                {stats.sampleTpl.map((t, i) => (
                  <div key={i} className="bg-white rounded-lg p-2 border border-marigold/10">
                    <p className="text-[9px] text-slate-400 mb-1">शब्द "<span className="font-bold text-forest">{t.word}</span>" → <span className="text-saffron font-bold">[{t.cat.toUpperCase()}]</span></p>
                    <p className="font-tiro text-saffron text-xs font-bold">{t.template}</p>
                  </div>
                ))}
              </div>
            </PipelineStep>

            <Arrow color="border-saffron/30" />

            <PipelineStep
              num="05" icon="🪣"
              title="स्लॉट भरना · Fill Slots"
              stat="× (category size − 1) per template"
              statEn="Every word in the category fills the slot — combinatorial expansion"
              color="border-orange-300"
            >
              <div className="space-y-1.5 text-xs">
                <div className="bg-ivory rounded-lg p-2 border border-marigold/10">
                  <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">साँचा · Template</p>
                  <p className="font-tiro text-saffron font-bold">हम [FOOD] खाइब।</p>
                </div>
                {['भात · Rice', 'खीर · Kheer', 'लड्डू · Laddoo'].map((ex, i) => (
                  <div key={i} className="bg-green-50 rounded-lg p-2 border border-green-100 flex items-center gap-2">
                    <span className="text-green-600 text-[9px] font-black">NEW</span>
                    <p className="font-tiro text-forest">हम <span className="bg-green-200/70 px-1 rounded">{ex.split(' · ')[0]}</span> खाइब।</p>
                    <span className="text-[9px] text-slate-400 ml-auto">{ex.split(' · ')[1]}</span>
                  </div>
                ))}
              </div>
            </PipelineStep>

            <Arrow color="border-saffron/30" />

            <div className="bg-green-600 text-white px-5 py-4 rounded-b-2xl flex items-center justify-between">
              <div>
                <p className="font-bold">📤 आउटपुट · Output</p>
                <p className="text-[10px] opacity-70">awadhvaani_synthetic_templates.json / .csv</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">{tplData.length}</p>
                <p className="text-[10px] opacity-70">नए संश्लेषित वाक्य</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DATASET VIEW ── */}
      {view === 'dataset' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'substitution', icon: '🔄', title: 'शब्द-प्रतिस्थापन', sub: 'Word Substitution Augmentation', color: 'bg-forest', count: subData.length },
              { id: 'templates',    icon: '🧩', title: 'साँचा-निर्माण',   sub: 'Template-based Generation',    color: 'bg-saffron', count: tplData.length },
            ].map(d => (
              <button key={d.id} onClick={() => setActiveId(d.id)}
                className={`p-6 rounded-3xl border-2 text-left transition-all ${activeId === d.id ? 'border-saffron bg-saffron/5 shadow-md' : 'border-marigold/10 bg-white hover:border-saffron/30'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${d.color} rounded-2xl flex items-center justify-center text-2xl shadow-inner flex-shrink-0`}>{d.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-tiro font-bold text-forest text-lg">{d.title}</p>
                      <span className="text-[9px] font-black text-green-600 border border-green-200 px-2 py-0.5 rounded-full">✅ Truly Synthetic</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{d.sub}</p>
                    <p className="text-sm font-black text-marigold mt-1">{d.count} पंक्तियाँ</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-marigold/10 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-ivory flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-forest text-lg">
                  {activeId === 'substitution' ? '🔄 शब्द-प्रतिस्थापन' : '🧩 साँचा-निर्माण'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeId === 'substitution'
                    ? 'New Awadhi sentences created by swapping vocab words within same category'
                    : 'Sentence templates filled combinatorially with every word in a category'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <select value={previewCount} onChange={e => setPreviewCount(Number(e.target.value))}
                  className="text-xs border border-marigold/20 rounded-xl px-3 py-2 bg-ivory text-forest font-bold outline-none">
                  {[10, 25, 50, 100].map(n => <option key={n} value={n}>पहली {n} · First {n}</option>)}
                </select>
                <button onClick={() => download(toCSV(dataset), `awadhvaani_synthetic_${activeId}.csv`, 'text/csv;charset=utf-8')}
                  className="bg-forest text-white text-xs font-bold px-4 py-2 rounded-xl hover:scale-105 transition">⬇ CSV</button>
                <button onClick={() => download(JSON.stringify(dataset, null, 2), `awadhvaani_synthetic_${activeId}.json`, 'application/json')}
                  className="bg-saffron text-white text-xs font-bold px-4 py-2 rounded-xl hover:scale-105 transition">⬇ JSON</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-ivory/70 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                    {columns.map(col => <th key={col} className="px-4 py-3 text-left whitespace-nowrap">{col}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory">
                  {dataset.slice(0, previewCount).map((row, i) => (
                    <tr key={i} className="hover:bg-green-50/30 transition-colors">
                      {columns.map(col => {
                        const val = String(row[col] ?? '—');
                        const isAw = col.includes('अवधी') || col.includes('मूल') || col.includes('साँचा') || col.includes('शब्द');
                        const isSyn = col.startsWith('संश्लेषित');
                        return (
                          <td key={col} className="px-4 py-3 text-slate-700 max-w-[220px] align-top">
                            <span className={`${isAw || isSyn ? 'font-tiro text-forest text-sm' : ''} ${isSyn ? 'font-bold' : ''}`}>{val}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 bg-ivory/30 border-t border-ivory flex justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span>पूर्वावलोकन · {Math.min(previewCount, dataset.length)} / {dataset.length} rows</span>
              <span className="italic normal-case text-slate-300">UTF-8 BOM — Devanagari renders correctly in Excel</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PipelineStep({ num, icon, title, stat, statEn, color, children }) {
  return (
    <div className={`border-l-4 ${color} bg-white px-5 py-4 space-y-3`}>
      <div className="flex items-start gap-3">
        <div className="bg-ivory rounded-xl w-9 h-9 flex items-center justify-center text-lg flex-shrink-0 border border-marigold/10">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-300 font-mono">{num}</span>
            <p className="font-bold text-forest text-sm">{title}</p>
          </div>
          <p className="text-[10px] font-bold text-saffron">{stat}</p>
          <p className="text-[10px] text-slate-400 italic">{statEn}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Arrow({ color = 'border-forest/20' }) {
  return (
    <div className={`flex flex-col items-center py-1 bg-white border-l-4 ${color}`}>
      <div className="w-px h-4 bg-slate-200" />
      <div className="text-slate-300 text-lg leading-none">↓</div>
    </div>
  );
}

function StatPill({ label, val, highlight }) {
  return (
    <div className={`rounded-2xl px-4 py-3 border text-center ${highlight ? 'bg-marigold/20 border-marigold/30' : 'bg-white/10 border-white/10'}`}>
      <p className={`text-2xl font-black ${highlight ? 'text-marigold' : 'text-white'}`}>{val}</p>
      <p className="text-[9px] uppercase opacity-60 font-bold mt-0.5">{label}</p>
    </div>
  );
}
