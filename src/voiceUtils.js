// Shared logic for the Voice Practice screens — filters, weak-pool, syllables.

import lessons from './data/lessons.json';

// Enrich each sentence with metadata for filtering
export const ALL_PHRASES = lessons.flatMap(u =>
  u.lessons.flatMap(l => l.sentences.map(s => ({
    ...s,
    unitId: u.id,
    unitTitle: u.title,
    unitEmoji: u.emoji,
    lessonName: l.name,
    wordCount: s.awadhi.trim().split(/\s+/).length,
  })))
).filter(s => s.awadhi.length < 60);

// Distinct categories for the filter dropdown
export const CATEGORIES = ['All', ...Array.from(new Set(ALL_PHRASES.map(p => p.unitTitle)))];

export const DIFFICULTIES = [
  { id: 'all',    label: 'All',    test: () => true },
  { id: 'easy',   label: 'Easy',   test: p => p.wordCount <= 3 },
  { id: 'medium', label: 'Medium', test: p => p.wordCount >= 4 && p.wordCount <= 6 },
  { id: 'hard',   label: 'Hard',   test: p => p.wordCount >= 7 },
];

/**
 * Build a filtered, ordered phrase pool.
 * - mode 'weak': only phrases the user has scored < 50% on
 * - mode 'all': everything matching category + difficulty
 */
export function buildPhrasePool({ category = 'All', difficulty = 'all', mode = 'all', voiceStats = {} }) {
  const diff = DIFFICULTIES.find(d => d.id === difficulty) ?? DIFFICULTIES[0];
  const phraseHistory = voiceStats.phraseHistory ?? {};

  let pool = ALL_PHRASES.filter(p => {
    if (category !== 'All' && p.unitTitle !== category) return false;
    if (!diff.test(p)) return false;
    if (mode === 'weak') {
      const h = phraseHistory[p.awadhi];
      if (!h || h.bestScore >= 50) return false;
    }
    return true;
  });

  // Spaced repetition: if not in weak mode, give weak phrases a 2× chance to appear by duplicating them
  if (mode === 'all') {
    const repeated = pool.filter(p => {
      const h = phraseHistory[p.awadhi];
      return h && h.bestScore < 50;
    });
    pool = [...pool, ...repeated];
  }

  return pool.length > 0 ? pool : ALL_PHRASES.slice(0, 1);
}

/**
 * Get mastery indicator for a phrase: ⭐ ≥80, 🔄 50-79, ⚠️ <50, '' if never tried.
 */
export function masteryIcon(phraseHistory, awadhi) {
  const h = phraseHistory?.[awadhi];
  if (!h) return '';
  if (h.bestScore >= 80) return '⭐';
  if (h.bestScore >= 50) return '🔄';
  return '⚠️';
}

/**
 * Naive Devanagari/Roman syllable splitter — splits Roman text at vowel→consonant boundaries.
 * "Hum sab khaana khaate hain" → "Hum · sab · khaa·na · khaa·te · hain"
 */
export function syllabify(roman) {
  if (!roman) return '';
  return roman
    .split(/\s+/)
    .map(word => word.replace(/([aeiouAEIOU]+)([bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ])/g, '$1·$2'))
    .join(' · ');
}

/**
 * Compute aggregate practice stats from the per-phrase history.
 */
export function aggregateStats(voiceStats = {}) {
  const phraseHistory = voiceStats.phraseHistory ?? {};
  const phrases = Object.values(phraseHistory);
  if (phrases.length === 0) {
    return {
      totalAttempts: 0, totalPhrasesTried: 0, weakCount: 0,
      bestScore: 0, bestPhrase: null, avgScore: 0, masteredCount: 0,
      categoryStats: {},
    };
  }

  const totalAttempts = phrases.reduce((s, p) => s + (p.attempts ?? 0), 0);
  const weakCount = phrases.filter(p => p.bestScore < 50).length;
  const masteredCount = phrases.filter(p => p.bestScore >= 80).length;
  const best = phrases.reduce((b, p) => p.bestScore > (b?.bestScore ?? -1) ? p : b, null);
  const allLast = phrases.flatMap(p => (p.tries ?? []).slice(-1).map(t => t.score));
  const avgScore = allLast.length > 0
    ? Math.round(allLast.reduce((s, n) => s + n, 0) / allLast.length)
    : 0;

  // Per-category accuracy from latest tries
  const categoryStats = {};
  for (const p of phrases) {
    const cat = p.unitTitle ?? 'Other';
    if (!categoryStats[cat]) categoryStats[cat] = { sum: 0, count: 0 };
    if (p.bestScore != null) {
      categoryStats[cat].sum += p.bestScore;
      categoryStats[cat].count += 1;
    }
  }
  Object.keys(categoryStats).forEach(c => {
    categoryStats[c].avg = Math.round(categoryStats[c].sum / categoryStats[c].count);
  });

  return {
    totalAttempts,
    totalPhrasesTried: phrases.length,
    weakCount,
    masteredCount,
    bestScore: best?.bestScore ?? 0,
    bestPhrase: best?.awadhi ?? null,
    avgScore,
    categoryStats,
  };
}
