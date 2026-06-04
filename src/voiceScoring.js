// Voice Practice scoring engine — fair, granular, transparent.
//
// RUBRIC OVERVIEW
// ───────────────
// For each target Awadhi word, we find the best-matching transcript word using:
//   1. Strict comparison   — strip punctuation & nasal marks, then Levenshtein
//   2. Phonetic comparison — additionally fold equivalent vowel matras (ै→े, ी→े, ो→ा …)
//   3. Bilingual candidates — try the Awadhi target AND its Hindi equivalents
//                              (since speech recognizers transcribe Awadhi as Hindi)
// We take the BEST similarity across these.
//
// Each word gets one of 6 GRADES based on similarity:
//   95-100%  ⭐ Perfect
//    85-94%  ✓ Excellent
//    70-84%  ◐ Good
//    55-69%  ◑ Close
//    35-54%  ◯ Off
//    <35%   ✗ Missed
//
// And one of 5 MATCH TYPES (so users see WHY a word scored what it did):
//   • exact       — you said the Awadhi word verbatim
//   • equivalent  — recognizer wrote the Hindi equivalent (still 100% correct pronunciation)
//   • phonetic    — close pronunciation, minor matra variation
//   • partial     — some syllables right, others off
//   • miss        — word not detected in transcript
//
// FINAL SCORE = average of per-word similarities × 100.

import { getHindiEquivalents } from './awadhiHindiMap';

// ─── Helpers ─────────────────────────────────────────────────────────────

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(0).map((_, j) => j === 0 ? i : 0));
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

const VOWEL_FOLD = {
  'ै': 'े', 'ी': 'े', 'इ': 'ए',
  'ो': 'ा', 'ौ': 'ा', 'ू': 'ु',
  'ृ': 'ि',
};

// Strict normalization: strip punctuation, nasals, ZWJ/ZWNJ
function normalizeStrict(s) {
  return s.trim()
    .replace(/[।,\.!?;:]/g, '')
    .replace(/[ँंः]/g, '')
    .replace(/[‌‍]/g, '')
    .replace(/\s+/g, ' ');
}

// Phonetic normalization: also folds equivalent vowel matras
function normalizePhonetic(s) {
  const stripped = normalizeStrict(s);
  let folded = '';
  for (const ch of stripped) folded += VOWEL_FOLD[ch] ?? ch;
  return folded;
}

function rawSimilarity(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

// ─── Grading & match-type classification ─────────────────────────────────

export const GRADE_BANDS = [
  { id: 'perfect',    min: 0.95, label: '⭐ Perfect',   short: 'Perfect',   color: 'green',   tw: { text: 'text-green-600',  bg: 'bg-green-100',   border: 'border-green-300',  dot: 'bg-green-500' } },
  { id: 'excellent',  min: 0.85, label: '✓ Excellent', short: 'Excellent', color: 'emerald', tw: { text: 'text-emerald-600',bg: 'bg-emerald-50',  border: 'border-emerald-300',dot: 'bg-emerald-400' } },
  { id: 'good',       min: 0.70, label: '◐ Good',      short: 'Good',      color: 'lime',    tw: { text: 'text-lime-700',   bg: 'bg-lime-100',    border: 'border-lime-300',   dot: 'bg-lime-500' } },
  { id: 'close',      min: 0.55, label: '◑ Close',     short: 'Close',     color: 'amber',   tw: { text: 'text-amber-600',  bg: 'bg-amber-100',   border: 'border-amber-300',  dot: 'bg-amber-500' } },
  { id: 'off',        min: 0.35, label: '◯ Off',       short: 'Off',       color: 'orange',  tw: { text: 'text-orange-600', bg: 'bg-orange-100',  border: 'border-orange-300', dot: 'bg-orange-500' } },
  { id: 'miss',       min: 0,    label: '✗ Missed',    short: 'Missed',    color: 'red',     tw: { text: 'text-red-500',    bg: 'bg-red-100',     border: 'border-red-300',    dot: 'bg-red-400' } },
];

export function getGrade(sim) {
  for (const band of GRADE_BANDS) if (sim >= band.min) return band;
  return GRADE_BANDS[GRADE_BANDS.length - 1];
}

// Back-compat helper for older code
export function similarityColors(sim) {
  return getGrade(sim).tw;
}

function classifyMatch({ target, matched, equivalents, similarity, matchSource }) {
  if (!matched || similarity < 0.15) {
    return { type: 'miss', reason: 'Word not detected' };
  }
  const targetNorm = normalizeStrict(target);
  const matchedNorm = normalizeStrict(matched);

  if (targetNorm === matchedNorm) {
    return { type: 'exact', reason: 'Exact match — said the Awadhi word' };
  }

  // Matched to a Hindi equivalent (with strict equality after stripping)
  const eqMatch = equivalents.find(eq => normalizeStrict(eq) === matchedNorm);
  if (eqMatch) {
    return { type: 'equivalent', reason: `Hindi equivalent "${matched}" — pronounced correctly`, equivalent: matched };
  }

  // Phonetic equality (folds vowel matras)
  const targetPhon = normalizePhonetic(target);
  const matchedPhon = normalizePhonetic(matched);
  if (targetPhon === matchedPhon) {
    return { type: 'phonetic', reason: 'Phonetic match — same sound, different matra' };
  }

  if (similarity >= 0.55) {
    return { type: 'partial', reason: `Partial match — close to "${matched}"` };
  }
  return { type: 'wrong', reason: `Recognizer heard "${matched}" instead` };
}

// ─── Best match across candidates ────────────────────────────────────────

function bestMatch(awadhiWord, transcriptWords) {
  const equivalents = [awadhiWord, ...getHindiEquivalents(awadhiWord)];

  // Pre-normalize candidates in both modes
  const strictEqs   = equivalents.map(normalizeStrict);
  const phoneticEqs = equivalents.map(normalizePhonetic);

  let best = { transcriptIdx: -1, transcriptWord: '', similarity: 0, candidateIdx: -1, scoreSource: 'none' };

  for (let i = 0; i < transcriptWords.length; i++) {
    const twStrict   = normalizeStrict(transcriptWords[i]);
    const twPhonetic = normalizePhonetic(transcriptWords[i]);

    for (let k = 0; k < equivalents.length; k++) {
      const strictSim   = rawSimilarity(strictEqs[k],   twStrict);
      const phoneticSim = rawSimilarity(phoneticEqs[k], twPhonetic);
      const sim = Math.max(strictSim, phoneticSim);
      const src = strictSim >= phoneticSim ? 'strict' : 'phonetic';

      if (sim > best.similarity) {
        best = {
          transcriptIdx: i,
          transcriptWord: transcriptWords[i],
          similarity: sim,
          candidateIdx: k,
          scoreSource: src,
        };
      }
    }
  }

  return { best, equivalents };
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Analyze a transcript against an Awadhi target phrase.
 *
 * Returns:
 * {
 *   score              : 0-100 overall (average of per-word similarities)
 *   words              : [{
 *                          target, matched, similarity, grade, matchType, reason
 *                        }]
 *   extras             : transcript words that didn't match any target
 *   normalizedTranscript: target-word substitutions applied where matched
 *   rawTranscript      : original STT output
 *   summary            : { perfect, excellent, good, close, off, miss, total }
 * }
 */
export function analyzeTranscript(transcript, target) {
  if (!transcript) {
    return {
      score: 0, words: [], extras: [],
      normalizedTranscript: '', rawTranscript: '',
      summary: emptySummary(),
    };
  }

  const tWordsOriginal   = transcript.trim().split(/\s+/).filter(Boolean);
  const tgtWordsOriginal = target.trim().split(/\s+/).filter(Boolean);

  if (tgtWordsOriginal.length === 0) {
    return {
      score: 0, words: [], extras: tWordsOriginal,
      normalizedTranscript: transcript, rawTranscript: transcript,
      summary: emptySummary(),
    };
  }

  const matchedIdx = new Set();
  const transcriptOwners = {}; // transcript idx → { awadhi, sim }

  const words = tgtWordsOriginal.map(tgtW => {
    const { best, equivalents } = bestMatch(tgtW, tWordsOriginal);
    const grade = getGrade(best.similarity);
    const classification = classifyMatch({
      target: tgtW,
      matched: best.transcriptWord,
      equivalents,
      similarity: best.similarity,
      matchSource: best.scoreSource,
    });

    if (best.transcriptIdx >= 0 && best.similarity >= 0.3) {
      matchedIdx.add(best.transcriptIdx);
      const existing = transcriptOwners[best.transcriptIdx];
      if (!existing || existing.sim < best.similarity) {
        transcriptOwners[best.transcriptIdx] = { awadhi: tgtW, sim: best.similarity };
      }
    }

    return {
      target: tgtW,
      matched: best.transcriptWord,
      similarity: best.similarity,
      grade,
      matchType: classification.type,
      reason: classification.reason,
      scoreSource: best.scoreSource, // 'strict' | 'phonetic' | 'none'
    };
  });

  // Build the normalized "You said" line.
  // Only substitute the Awadhi target when the match is confidently high (≥0.85, "Excellent" band).
  // Below that, keep the raw transcript word so the display matches the score —
  // if the recognizer only heard "धन्य" of "धन्यवाद", the user should see "धन्य" and understand why the score is lower.
  const normalizedTranscript = tWordsOriginal
    .map((w, i) => {
      const m = transcriptOwners[i];
      return (m && m.sim >= 0.85) ? m.awadhi : w;
    })
    .join(' ');

  const extras = tWordsOriginal.filter((_, i) => !matchedIdx.has(i));
  const wordAvg = words.reduce((s, w) => s + w.similarity, 0) / words.length;

  // ── PHRASE-LEVEL FLOOR ───────────────────────────────────────────────
  // Sometimes the recognizer joins/splits words differently from the target,
  // tanking individual word scores even though the speaker said the phrase right.
  // Compare the WHOLE target (and its Hindi-equivalent rewrite) against the
  // whole transcript phonetically. If that's higher than the word average,
  // boost every word's similarity proportionally so display & total agree.
  const wholeTargetPhonetic = normalizePhonetic(target);
  const wholeTranscriptPhonetic = normalizePhonetic(transcript);
  const phraseSimAwadhi = rawSimilarity(wholeTargetPhonetic, wholeTranscriptPhonetic);

  const hindiRewrite = tgtWordsOriginal.map(w => {
    const hindiEqs = getHindiEquivalents(w);
    return hindiEqs.length > 0 ? hindiEqs[0] : w;
  }).join(' ');
  const phraseSimHindi = rawSimilarity(normalizePhonetic(hindiRewrite), wholeTranscriptPhonetic);
  const phraseFloor = Math.max(phraseSimAwadhi, phraseSimHindi);

  let effectiveWordSim = wordAvg;
  if (phraseFloor > wordAvg + 0.05) {
    const boost = phraseFloor - wordAvg;
    words.forEach(w => {
      w.similarity = Math.min(1.0, w.similarity + boost);
      w.grade = getGrade(w.similarity);
    });
    effectiveWordSim = phraseFloor;
  }

  const score = Math.round(effectiveWordSim * 100);

  return {
    score,
    words,
    extras,
    normalizedTranscript,
    rawTranscript: transcript,
    summary: summarize(words),
  };
}

function emptySummary() {
  return { perfect: 0, excellent: 0, good: 0, close: 0, off: 0, miss: 0, total: 0 };
}

function summarize(words) {
  const s = emptySummary();
  for (const w of words) {
    s[w.grade.id] = (s[w.grade.id] ?? 0) + 1;
    s.total++;
  }
  return s;
}

// Overall score band — interpretation of total score
export const OVERALL_BANDS = [
  { min: 90, label: '🏆 Shabash! Excellent!',    color: 'text-green-500'   },
  { min: 75, label: '✨ Bahut Badhiya! Great!',  color: 'text-emerald-500' },
  { min: 60, label: '👍 Theek hai. Good.',        color: 'text-lime-600'    },
  { min: 40, label: '🎯 Koshish karo. Practice.', color: 'text-amber-500'   },
  { min: 0,  label: '🔁 Try again.',             color: 'text-red-400'     },
];

export function getOverallBand(score) {
  return OVERALL_BANDS.find(b => score >= b.min) ?? OVERALL_BANDS[OVERALL_BANDS.length - 1];
}
