const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageBreak } = require('docx');
const fs = require('fs');

// ─── Helpers ────────────────────────────────────────────────────────────────
const SAFFRON = 'E27431';
const FOREST  = '2D5A3D';
const MARIGOLD = 'D4A04C';
const DARK = '222222';
const GREY = '666666';
const LIGHT_GREY = 'EEEEEE';

const border = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' };
const cellBorders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 100, bottom: 100, left: 140, right: 140 };

const p = (text, opts = {}) => new Paragraph({
  spacing: { after: 120 },
  ...opts,
  children: [new TextRun({ text, ...opts.run })],
});

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 360, after: 200 },
  children: [new TextRun({ text, bold: true, size: 32, color: FOREST, font: 'Arial' })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 280, after: 160 },
  children: [new TextRun({ text, bold: true, size: 26, color: SAFFRON, font: 'Arial' })],
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 120 },
  children: [new TextRun({ text, bold: true, size: 22, color: MARIGOLD, font: 'Arial' })],
});

const body = (runs) => new Paragraph({
  spacing: { after: 120, line: 280 },
  children: runs.map(r => typeof r === 'string'
    ? new TextRun({ text: r, size: 22, font: 'Arial', color: DARK })
    : new TextRun({ size: 22, font: 'Arial', color: DARK, ...r })),
});

const bullet = (runs) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: 80, line: 280 },
  children: runs.map(r => typeof r === 'string'
    ? new TextRun({ text: r, size: 22, font: 'Arial', color: DARK })
    : new TextRun({ size: 22, font: 'Arial', color: DARK, ...r })),
});

const subBullet = (runs) => new Paragraph({
  numbering: { reference: 'bullets', level: 1 },
  spacing: { after: 60, line: 280 },
  children: runs.map(r => typeof r === 'string'
    ? new TextRun({ text: r, size: 22, font: 'Arial', color: DARK })
    : new TextRun({ size: 22, font: 'Arial', color: DARK, ...r })),
});

const code = (text) => new TextRun({ text, font: 'Consolas', size: 20, color: '8B0000' });
const bold = (text) => new TextRun({ text, bold: true, size: 22, font: 'Arial', color: DARK });
const italic = (text) => new TextRun({ text, italics: true, size: 22, font: 'Arial', color: GREY });

const sep = () => new Paragraph({
  spacing: { before: 200, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: SAFFRON, space: 1 } },
  children: [new TextRun({ text: '' })],
});

// Build a table from 2-D array (first row = header)
function table(rows, widths) {
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((row, ri) => new TableRow({
      tableHeader: ri === 0,
      children: row.map((cell, ci) => new TableCell({
        borders: cellBorders,
        width: { size: widths[ci], type: WidthType.DXA },
        margins: cellMargins,
        shading: ri === 0
          ? { fill: FOREST, type: ShadingType.CLEAR }
          : (ri % 2 === 0 ? { fill: 'F8F4ED', type: ShadingType.CLEAR } : undefined),
        children: [new Paragraph({
          alignment: cell.align ?? AlignmentType.LEFT,
          spacing: { before: 0, after: 0 },
          children: [new TextRun({
            text: cell.text ?? cell,
            bold: ri === 0,
            color: ri === 0 ? 'FFFFFF' : DARK,
            size: ri === 0 ? 20 : 20,
            font: 'Arial',
          })],
        })],
      })),
    })),
  });
}

// ─── Content ────────────────────────────────────────────────────────────────
const content = [];

// Title page
content.push(new Paragraph({
  spacing: { before: 2400, after: 200 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'AwadhVaani', bold: true, size: 96, color: SAFFRON, font: 'Arial' })],
}));
content.push(new Paragraph({
  spacing: { after: 400 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'AWADH KI BHAAKHA', bold: true, size: 28, color: FOREST, font: 'Arial' })],
}));
content.push(new Paragraph({
  spacing: { after: 200 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Feature Documentation', bold: true, size: 40, color: DARK, font: 'Arial' })],
}));
content.push(new Paragraph({
  spacing: { after: 1200 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'Complete Reference for Every Screen and Subsystem', italics: true, size: 22, color: GREY, font: 'Arial' })],
}));
content.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'A bilingual (Awadhi · Hindi · English) language-learning web app', size: 20, color: GREY, font: 'Arial' })],
}));
content.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: 'for the Awadhi dialect of Uttar Pradesh, India', size: 20, color: GREY, font: 'Arial' })],
}));
content.push(new Paragraph({ children: [new PageBreak()] }));

// ─── Table of Contents ──────────────────────────────────────────────────────
content.push(h1('Table of Contents'));
const toc = [
  '1. Overview & Architecture',
  '2. Authentication & Multi-User Support',
  '3. Home / Dashboard',
  '4. Lessons (Curriculum)',
  '5. Quiz (Pariksha)',
  '6. Voice Practice (Aawaz Abhyas)',
  '7. Word Repository (Shabd Bhandar)',
  '8. Stories (Kahaaniyaan)',
  '9. Community (Samaaj)',
  '10. Profile (Mera Pratiroop)',
  '11. Admin Panel',
  '12. DataLab — Synthetic Dataset Generator',
  '13. Audio Subsystem (Speak)',
  '14. Mobile App',
  '15. Data Sources',
  '16. Tech Stack',
  '17. Summary at a Glance',
];
toc.forEach(t => content.push(body([t])));
content.push(new Paragraph({ children: [new PageBreak()] }));

// ─── 1. Overview ────────────────────────────────────────────────────────────
content.push(h1('1. Overview & Architecture'));
content.push(body([
  bold('AwadhVaani'),
  ' ("Voice of Awadh") is a single-page React app that helps learners study the Awadhi dialect through curated lessons, vocabulary, quizzes, voice-pronunciation practice, and folk stories. It runs in two flavors:',
]));
content.push(table([
  ['Version', 'Port', 'URL', 'Layout'],
  ['Desktop', '5173', 'http://localhost:5173', 'Sidebar nav + wide multi-column'],
  ['Mobile', '5174', 'http://localhost:5174/mobile.html', 'Bottom tab bar + single-column'],
], [1500, 1000, 3500, 3360]));
content.push(body([
  'Both versions share the ',
  bold('same auth, the same localStorage data, and the same data files'),
  ' — sign in once, use either.',
]));
content.push(h3('State Model'));
content.push(body([
  'All per-user data (XP, streak, completed lessons, quiz scores, activity log) lives in a single ',
  code('stats'),
  ' object stored in localStorage under the user\'s namespace. App-level state is lifted to ',
  code('App.jsx'),
  ' / ',
  code('AppMobile.jsx'),
  ' and passed to screens via props.',
]));
content.push(h3('Routing'));
content.push(body([
  'Simple ',
  code('useState'),
  ' switch (',
  code('activeScreen'),
  ') — no React Router. Each screen is a top-level component selected by the sidebar / bottom-nav.',
]));

// ─── 2. Auth ────────────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('2. Authentication & Multi-User Support'));
content.push(body([bold('Files: '), code('src/Login.jsx'), ', persistence utilities exported from the same file.']));
content.push(h3('Features'));
content.push(bullet([bold('Sign In / Sign Up toggle'), ' on a single screen with split-panel layout (branding left, form right).']));
content.push(bullet([bold('Local-only auth'), ' — credentials stored in localStorage under ', code('awadhvaani_users'), '. No backend.']));
content.push(bullet([bold('Session persistence'), ' — ', code('awadhvaani_session'), ' stores the active username; the app restores it on reload.']));
content.push(bullet([bold('Demo account'), ' seeded on first load: ', code('username: demo · password: demo'), ' (auto-fillable via "Autofill demo credentials" button).']));
content.push(bullet([bold('Per-user namespacing'), ' — each user\'s stats object is stored separately under their username, so multiple people sharing a browser get independent progress.']));
content.push(bullet([bold('Sign Out'), ' clears the session token (does not delete the user record).']));
content.push(h3('Security note'));
content.push(body([italic('Passwords are stored in plaintext localStorage — prototype only. Production would need a real backend with hashed credentials.')]));

// ─── 3. Dashboard ───────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('3. Home / Dashboard'));
content.push(body([bold('Files: '), code('src/Dashboard.jsx'), ' (desktop), ', code('src/mobile/HomeM.jsx'), ' (mobile).']));
content.push(h3('Features'));
content.push(bullet([bold('Personalized greeting banner'), ' — "नमस्ते, {firstName}!" with user\'s name, plus the tagline "Awadhi ki awaaz, aapki zuban."']));
content.push(bullet([bold('Live stats strip'), ' (3 cards):']));
content.push(subBullet(['⚡ Daily XP vs daily goal']));
content.push(subBullet(['🔥 Streak in days']));
content.push(subBullet(['🏆 Total XP (lifetime)']));
content.push(bullet([bold('Daily-goal progress bar'), ' — fills based on dailyXP / dailyXPGoal (default 100).']));
content.push(bullet([bold('Continue Learning card'), ' — auto-detects the first unit with progress < 100 and offers a "Resume Learning →" button that jumps to the Lessons screen.']));
content.push(bullet([bold('Quick Access tiles'), ' (2×2 grid) — one-tap shortcuts to Voice, Repository, Stories, Quiz.']));
content.push(bullet([bold('Word of the Day'), ' — rotates daily using dayOfYear % vocab.length. Shows Devanagari + romanization + English + category, plus a 🔊 button to hear it.']));
content.push(bullet([bold('Upcoming Schedule'), ' — three illustrative scheduled sessions with click-to-jump.']));
content.push(bullet([bold('Last Quiz card'), ' — shown only after the user takes their first quiz; displays XP earned, correct count, accuracy.']));
content.push(bullet([bold('Recent Badges'), ' (6-tile grid) — badges grey out until unlocked. Conditions:']));
content.push(subBullet(['🥇 Fast Learner — 1000 XP']));
content.push(subBullet(['🗣️ Speaker — at least 1 quiz taken']));
content.push(subBullet(['📚 Storyteller — always unlocked']));
content.push(subBullet(['🔥 14-Day Streak — streak ≥ 14']));
content.push(subBullet(['💎 5000 XP']));
content.push(subBullet(['🏆 Quiz Master — at least one quiz with ≥80% accuracy']));

// ─── 4. Lessons ─────────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('4. Lessons (Curriculum)'));
content.push(body([bold('Files: '), code('src/Lessons.jsx'), ', data in ', code('src/data/lessons.json'), '.']));
content.push(h3('Structure'));
content.push(body([
  'The curriculum is organized as ',
  bold('Units → Lessons → Sentences'),
  '. Each unit has a title, emoji, color theme. Each lesson is a thematic mini-set (e.g. "Pranaam — Greetings"). Each sentence has Devanagari, Roman transliteration, and English translation.',
]));
content.push(h3('Features'));
content.push(bullet([bold('Header summary'), ' — total XP earned, total lessons, lessons completed.']));
content.push(bullet([bold('Collapsible unit accordions'), ' — click to expand; only one open at a time.']));
content.push(bullet([bold('Per-unit live progress'), ' — progress = (completedLessons / totalLessons) × 100, computed dynamically from user\'s completedLessons map (no hardcoded values).']));
content.push(bullet([bold('Lesson tabs'), ' inside each open unit; completed lessons get a ✓ badge and green tint.']));
content.push(bullet([bold('Sentence cards'), ' — each sentence displays Devanagari + Roman + English with an inline 🔊 SpeakButton.']));
content.push(bullet([bold('Lesson navigation:')]));
content.push(subBullet(['"← Previous" and "Next →" buttons; clicking "Next →" marks the current lesson complete and awards +20 XP.']));
content.push(subBullet(['On the last lesson of a unit, a "Mark Complete +20 XP" button appears in place of "Next →".']));
content.push(subBullet(['Already-completed lessons show "✓ Done" and don\'t double-award XP.']));
content.push(bullet([bold('XP economy'), ' — 20 XP per lesson completion, also boosts daily XP and adds an entry to the activity log.']));

// ─── 5. Quiz ────────────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('5. Quiz (Pariksha)'));
content.push(body([bold('Files: '), code('src/Quiz.jsx'), ', ', code('src/mobile/QuizM.jsx'), ', data in ', code('src/data/quiz.json'), '.']));
content.push(h3('Question Types'));
content.push(bullet(['Translation (Awadhi → English / English → Awadhi)']));
content.push(bullet(['Vocabulary recognition']));
content.push(bullet(['Cultural / contextual MCQs']));
content.push(bullet(['Each question has 4 options, one marked correct: true.']));
content.push(h3('Features'));
content.push(bullet([bold('45-second per-question timer'), ' with red pulse when ≤10s remain. Time-up auto-submits.']));
content.push(bullet([bold('Top progress bar'), ' — fills based on currentIndex / total.']));
content.push(bullet([bold('Question card'), ' — shows type chip, large Devanagari, Roman transliteration, 🔊 audio button, and the prompt text.']));
content.push(bullet([bold('2×2 option grid'), ' — tap to select; selected option highlights in saffron. Submit button disabled until selection made.']));
content.push(bullet([bold('Result ribbon'), ' — green for correct, saffron for incorrect; shows the right answer when wrong.']));
content.push(bullet([bold('Live stats sidebar'), ' (desktop only): Score, Streak, Accuracy, Questions remaining, Motivational pep-talk that changes based on streak.']));
content.push(bullet([bold('Vocabulary tip'), ' — appears under the question after submission with cultural / linguistic context.']));
content.push(bullet([bold('Skip'), ' button (counts as wrong, breaks streak).']));
content.push(bullet([bold('Hint button'), ' displayed (-5 XP cost — visual only at present).']));
content.push(bullet([bold('Results modal'), ' — fully blocking modal at quiz end with score band emoji, +XP, correct/total, accuracy, "Back to Home" and "Try Again" buttons.']));
content.push(bullet([bold('Quit confirmation'), ' — bilingual modal asks "सचमुच छोड़ब चाहत अहा?" before discarding mid-quiz progress.']));
content.push(bullet([bold('Scoring:'), ' +20 XP per correct answer. Quiz attempts stored in stats.quizScores.']));

// ─── 6. Voice ───────────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('6. Voice Practice (Aawaz Abhyas)'));
content.push(body([bold('Files: '), code('src/Voice.jsx'), ', ', code('src/mobile/VoiceM.jsx'), '. Phrases pulled live from lessons.json.']));
content.push(h3('Features'));
content.push(bullet([bold('Target phrase card'), ' — Devanagari + Roman + English + 🔊 listen button (so user can hear the model pronunciation first).']));
content.push(bullet([bold('Web Speech API recognition'), ' with lang: \'hi-IN\' (closest available to Awadhi). Only Chrome / Edge.']));
content.push(bullet([bold('Animated waveform'), ' — 12 bars that pulse during active recording (decorative).']));
content.push(bullet([bold('Big mic button'), ' — tap to start; turns into a red ⏹ pulse when listening.']));
content.push(bullet([bold('Live status text'), ' — "Tap to start" → "🔴 Listening… speak now" → "Recording complete".']));
content.push(bullet([bold('Transcript display'), ' — shows what the speech recognizer heard, in Devanagari.']));
content.push(bullet([bold('Fuzzy scoring'), ' using Levenshtein distance:']));
content.push(subBullet(['Normalizes punctuation and whitespace']));
content.push(subBullet(['Splits into words; for each target word, finds the best match (similarity = 1 − editDistance/maxLen)']));
content.push(subBullet(['Final score = average best-match × 100']));
content.push(subBullet(['Forgiving of word-order differences and minor spelling variations']));
content.push(bullet([bold('Score ring'), ' — circular SVG progress that animates to the result; color shifts from red → marigold → green.']));
content.push(bullet([bold('Feedback message'), ' matched to score band (Shabash / Bahut Badhiya / Theek hai / Koshish Karo).']));
content.push(bullet([bold('XP reward'), ' — 10 XP if score ≥ 60.']));
content.push(bullet([bold('Try Again'), ' (re-record same phrase) and ', bold('Next Phrase →'), ' (cycle to next).']));
content.push(bullet([bold('Pronunciation tip card'), ' — calls out Awadhi-specific markers (e.g. "मा" vs Hindi "में").']));

// ─── 7. Repository ──────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('7. Word Repository (Shabd Bhandar)'));
content.push(body([bold('Files: '), code('src/Repository.jsx'), ', ', code('src/mobile/RepositoryM.jsx'), ', data in ', code('src/data/vocabulary.json'), '.']));
content.push(h3('Features'));
content.push(bullet([bold('Header'), ' with the section title in Devanagari (शब्द भण्डार) plus total word count and "showing N" live filter count.']));
content.push(bullet([bold('Search bar'), ' — fuzzy search across Devanagari, Roman, English, and category. Debounced via useMemo.']));
content.push(bullet([bold('Clear button'), ' (✕) appears when there\'s text in the search.']));
content.push(bullet([bold('Category filter chips'), ' — All, Home, Family, Food, Nature, Education, Daily Life, Cultural. Single-select.']));
content.push(bullet([bold('Word grid'), ' (3 cols on desktop, 2 cols on mobile) — each card has category tag, 🔊 SpeakButton, large Devanagari word, Roman transliteration, English translation.']));
content.push(bullet([bold('Empty state'), ' with magnifying-glass icon when filters return zero results.']));
content.push(bullet([bold('Hover/scale animation'), ' on each card.']));

// ─── 8. Stories ─────────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('8. Stories (Kahaaniyaan)'));
content.push(body([bold('Files: '), code('src/Stories.jsx'), ', data in ', code('src/data/stories.json'), '.']));
content.push(h3('Features'));
content.push(bullet([bold('Two cultural categories'), ' — Lifecycle and Daily Life — toggled via tabs.']));
content.push(bullet([bold('Horizontal scrollable story carousel'), ' — each card shows emoji thumbnail, title, level (Beginner/Intermediate/Advanced), short Awadhi tagline, summary, read time, and an active-state indicator.']));
content.push(bullet([bold('"Now Reading" panel'), ' — left column displays the full story split into paragraphs, with per-paragraph 🔊 button. Currently-playing paragraph highlights in saffron.']));
content.push(bullet([bold('Functional audio player'), ' (right column):']));
content.push(subBullet(['▶ / ⏸ play-pause that reads paragraphs sequentially via TTS, auto-advancing']));
content.push(subBullet(['⏮ / ⏭ paragraph skip']));
content.push(subBullet(['Progress dots — click any to jump']));
content.push(subBullet(['Animated waveform that pulses while playing']));
content.push(subBullet(['Paragraph counter (e.g. "2 / 5")']));
content.push(subBullet(['Scrolling preview text underneath']));
content.push(bullet([bold('Vocabulary Spotlight'), ' — sidebar listing key words from the story with 🔊 buttons and English glosses.']));

// ─── 9. Community ───────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('9. Community (Samaaj)'));
content.push(body([bold('File: '), code('src/Community.jsx'), '.']));
content.push(h3('Features'));
content.push(bullet([bold('5 left-rail nav items'), ' — Discussion, Exchange, Challenges, Native Corner, Announce.']));
content.push(bullet([bold('Tabbed post stream'), ' — All Posts · Questions · Word Debates · Stories.']));
content.push(bullet([bold('Post cards'), ' display author name, region, time, bilingual content (Awadhi + parenthetical English translation), Wah! 👏 like count, and comment count.']));
content.push(bullet([bold('Verified-elder badge'), ' for community elders.']));
content.push(bullet([bold('Wah! likes'), ' — tap to increment (optimistic UI, no backend).']));
content.push(bullet([bold('Post composer'), ' — write a new bilingual post; appears at the top of the active tab. Counter increments.']));
content.push(body([italic('Note: posts live in component state only — they reset on reload (this is a prototype community feature, not a real social backend).')]));

// ─── 10. Profile ────────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('10. Profile (Mera Pratiroop)'));
content.push(body([bold('Files: '), code('src/Profile.jsx'), ', ', code('src/mobile/ProfileM.jsx'), '.']));
content.push(h3('Features'));
content.push(bullet([bold('Avatar circle'), ' — uses the first letter of the user\'s name on a marigold background.']));
content.push(bullet([bold('Username + display name + level chip'), ' — current level computed from XP across 6 tiers:']));
content.push(table([
  ['Level', 'Title', 'XP Threshold'],
  ['🌱', 'Naya Seekhne Wala', '0 XP'],
  ['📖', 'Shabd Gyani', '500 XP'],
  ['💬', 'Bhaasha Prem', '1,500 XP'],
  ['🎯', 'Awadhi Praveen', '3,000 XP'],
  ['🏛️', 'Lok Kavi', '5,000 XP'],
  ['🏆', 'Ramkatha Gyani', '8,000 XP'],
], [1500, 4000, 3860]));
content.push(bullet([bold('XP-to-next-level progress bar'), ' with "X / Y XP to {next title}" caption.']));
content.push(bullet([bold('Stats grid'), ' — Total XP · Day Streak · Quizzes Taken · Average Accuracy.']));
content.push(bullet([bold('28-day activity heatmap'), ' (desktop) — coloured cells based on stats.activityLog values (0–3 scale).']));
content.push(bullet([bold('Skill bars'), ' (desktop) — derived percentages for Vocabulary, Quiz, Speaking, Cultural categories.']));
content.push(bullet([bold('Achievements grid'), ' — same 6 badges as Dashboard; unlocked vs locked with greyscale.']));
content.push(bullet([bold('Last Quiz Result card'), ' — only when at least one quiz exists.']));
content.push(bullet([bold('Sign Out button'), ' — wired to onLogout (clears session, returns to Login).']));

// ─── 11. Admin ──────────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('11. Admin Panel'));
content.push(body([bold('File: '), code('src/Admin.jsx'), '.']));
content.push(h3('Features'));
content.push(bullet([bold('Leaderboard table'), ' — all registered users sorted by XP descending. Columns:']));
content.push(subBullet(['Rank with 🥇🥈🥉 medal icons for top 3']));
content.push(subBullet(['Avatar + name + @username']));
content.push(subBullet(['Total XP, Streak, Quizzes taken, Average accuracy, Active days']));
content.push(bullet([bold('Click any row → detail panel'), ' opens on the right showing stat grid, 28-day activity heatmap, full quiz history with timestamps and scores.']));
content.push(bullet([bold('Summary cards'), ' at top: Total registered users, Combined XP across all users, Total quizzes attempted, Top learner.']));
content.push(bullet([bold('↻ Refresh button'), ' re-reads localStorage on demand.']));
content.push(body([italic('Note: read-only — no editing or deleting of users from this UI.')]));

// ─── 12. DataLab ────────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('12. DataLab — Synthetic Dataset Generator'));
content.push(body([bold('File: '), code('src/DataLab.jsx'), '.']));
content.push(body(['A meta-section that demonstrates how augmented training data can be generated from the existing curriculum.']));
content.push(h3('Two truly synthetic generators'));
content.push(bullet([bold('1. Substitution generator'), ' (', code('generateSubstitutions()'), ') — for each sentence in the lessons, swaps a content word with up to 4 same-category alternatives from the vocabulary repository, producing ', bold('337 unique synthetic rows'), '.']));
content.push(bullet([bold('2. Template generator'), ' (', code('generateTemplates()'), ') — extracts sentence templates with [CATEGORY] placeholders and recombines them with all category-matched words, producing ', bold('172 unique synthetic rows'), '.']));
content.push(h3('Two view modes'));
content.push(bullet([bold('Pipeline view'), ' (default) — side-by-side flowcharts showing the 5-step process: Source → Analyze → Substitute / Extract Template → Generate → Output.']));
content.push(bullet([bold('Dataset view'), ' — selector cards, full preview table, download buttons (JSON + CSV with UTF-8 BOM for Excel Devanagari support).']));

// ─── 13. Audio ──────────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('13. Audio Subsystem (Speak)'));
content.push(body([bold('File: '), code('src/speak.jsx'), ' — shared by every screen that has a 🔊 button.']));
content.push(h3('Functions'));
content.push(bullet([code('speak(devanagari, onEnd, roman)'), ' — speak a phrase; calls onEnd callback when finished']));
content.push(bullet([code('stopSpeech()'), ' — cancel any in-flight utterance']));
content.push(bullet([code('<SpeakButton text={...} roman={...} size="sm|md|lg" />'), ' — reusable React component']));
content.push(h3('Voice selection logic (priority order)'));
content.push(bullet(['hi-IN voice if available (Google हिन्दी, Microsoft local)']));
content.push(bullet(['Any voice starting with hi']));
content.push(bullet([
  'en-IN local Microsoft voice (Ravi / Heera) — ',
  bold('preferred fallback'),
  ' because it\'s offline and won\'t drop mid-sentence',
]));
content.push(bullet(['Any local voice']));
content.push(bullet(['Any available voice']));
content.push(h3('Devanagari fallback'));
content.push(body([
  'If the chosen voice is ',
  bold('not Hindi'),
  ', the Roman transliteration is spoken instead (since English voices like Microsoft Ravi can\'t pronounce Devanagari). The visual displays still show Devanagari — only what is ',
  italic('spoken'),
  ' changes.',
]));
content.push(h3('Chrome bug workarounds'));
content.push(bullet([bold('Keepalive'), ' — calls pause() / resume() every 10 seconds while speaking to prevent Chrome\'s known silent-pause bug after ~15 seconds of activity.']));
content.push(bullet([bold('resume() before cancel()'), ' — unsticks the engine if Chrome paused it.']));
content.push(bullet([bold('Local voice priority'), ' — Google cloud voices (hi-IN Google) often drop because they need a live network stream; local Microsoft voices play offline reliably.']));
content.push(h3('Where it\'s used'));
content.push(body(['Repository · Lessons · Voice · Quiz · Stories (paragraphs + vocab + audio player) · Dashboard (Word of Day) — and all their mobile counterparts.']));

// ─── 14. Mobile ─────────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('14. Mobile App'));
content.push(body([bold('Files: '), code('src/AppMobile.jsx'), ', ', code('src/mobile/*.jsx'), ', ', code('mobile.html'), ', ', code('vite.mobile.config.js'), '.']));
content.push(h3('Architecture'));
content.push(bullet(['Separate Vite config (appType: \'mpa\') on port 5174, served from mobile.html → src/mobile.jsx → AppMobile.']));
content.push(bullet(['Shares all logic with the desktop app: same Login, same localStorage namespace, same data files, same speak.jsx.']));
content.push(bullet(['Locked to a 430 px max-width with mx-auto for a phone-like preview on desktop browsers.']));
content.push(h3('Mobile-specific layout patterns'));
content.push(bullet([bold('Bottom tab bar'), ' with 5 tabs: Home · Lessons · Quiz · Voice · ☰ More']));
content.push(bullet([bold('More sheet'), ' slides up from bottom; contains: Repository · Stories · Community · Profile · Sign Out']));
content.push(bullet([bold('Single-column'), ' layouts everywhere; no sidebars']));
content.push(bullet([bold('2×2 grids'), ' instead of 3×3']));
content.push(bullet([bold('Touch-friendly'), ' larger tap targets, smaller text, more whitespace']));
content.push(bullet([bold('Bottom-sheet results modal'), ' for the Quiz instead of a centered modal']));
content.push(bullet([bold('Stacked recorder + score ring'), ' in Voice Practice instead of side-by-side']));
content.push(h3('Mobile screens'));
content.push(table([
  ['File', 'Purpose'],
  ['HomeM.jsx', 'Dashboard — greeting + 3-stat pills + 2×2 quick tiles + Word of Day'],
  ['LessonsM.jsx', 'Thin wrapper re-exporting desktop Lessons (already mobile-friendly)'],
  ['QuizM.jsx', 'Mobile quiz with stats strip on top, no sidebar, bottom-sheet results'],
  ['VoiceM.jsx', 'Stacked phrase / recorder / score ring layout'],
  ['RepositoryM.jsx', 'Search + scrollable category chips + 2-col word grid'],
  ['ProfileM.jsx', 'Compact avatar + level + 2×2 stats + 3×2 badges'],
], [2200, 7160]));

// ─── 15. Data Sources ───────────────────────────────────────────────────────
content.push(sep());
content.push(h1('15. Data Sources'));
content.push(body(['All under ', code('src/data/'), ':']));
content.push(table([
  ['File', 'Contents', 'Used by'],
  ['vocabulary.json', 'Awadhi words: Devanagari, Roman, English, category', 'Repository, Dashboard, DataLab'],
  ['lessons.json', 'Units → Lessons → Sentences with all three scripts', 'Lessons, Voice, Dashboard, DataLab'],
  ['quiz.json', 'MCQ questions: type, prompt, 4 options, vocabulary tip', 'Quiz'],
  ['stories.json', 'Folk stories: paragraphs + vocabulary spotlight', 'Stories'],
], [2200, 4000, 3160]));
content.push(body(['DataLab additionally generates ', code('awadhvaani_synthetic_substitution.json'), ' and ', code('awadhvaani_synthetic_template.json'), ' on demand.']));

// ─── 16. Tech Stack ─────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('16. Tech Stack'));
content.push(bullet([bold('React 19'), ' + functional components / hooks only']));
content.push(bullet([bold('Vite 8'), ' for dev server + bundling']));
content.push(bullet([bold('Tailwind CSS 4'), ' for styling — custom palette: saffron, marigold, forest, ivory']));
content.push(bullet([bold('Custom fonts'), ' — Tiro Devanagari Hindi for Devanagari, Noto Sans for Latin']));
content.push(bullet([bold('Web Speech API:')]));
content.push(subBullet(['SpeechSynthesis for TTS (output)']));
content.push(subBullet(['SpeechRecognition for voice input (Chrome / Edge only)']));
content.push(bullet([bold('localStorage'), ' for persistence (no backend) — keys: awadhvaani_users, awadhvaani_session']));
content.push(bullet([bold('No external state library'), ' — useState + useCallback + lifted state']));
content.push(bullet([bold('No router'), ' — single-screen state machine']));

// ─── 17. Summary ────────────────────────────────────────────────────────────
content.push(sep());
content.push(h1('17. Summary at a Glance'));
content.push(table([
  [{ text: 'Feature', align: AlignmentType.LEFT },
   { text: 'Desktop', align: AlignmentType.CENTER },
   { text: 'Mobile', align: AlignmentType.CENTER },
   { text: 'Audio', align: AlignmentType.CENTER },
   { text: 'User-Backed', align: AlignmentType.CENTER }],
  [{ text: 'Login / Sign up', align: AlignmentType.LEFT }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }, { text: '—', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }],
  [{ text: 'Dashboard', align: AlignmentType.LEFT }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }],
  [{ text: 'Lessons', align: AlignmentType.LEFT }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }],
  [{ text: 'Quiz', align: AlignmentType.LEFT }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }],
  [{ text: 'Voice Practice', align: AlignmentType.LEFT }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓ + 🎙️', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }],
  [{ text: 'Repository', align: AlignmentType.LEFT }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }, { text: '—', align: AlignmentType.CENTER }],
  [{ text: 'Stories', align: AlignmentType.LEFT }, { text: '✓', align: AlignmentType.CENTER }, { text: 'via More', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }, { text: '—', align: AlignmentType.CENTER }],
  [{ text: 'Community', align: AlignmentType.LEFT }, { text: '✓', align: AlignmentType.CENTER }, { text: 'via More', align: AlignmentType.CENTER }, { text: '—', align: AlignmentType.CENTER }, { text: 'session', align: AlignmentType.CENTER }],
  [{ text: 'Profile', align: AlignmentType.LEFT }, { text: '✓', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }, { text: '—', align: AlignmentType.CENTER }, { text: '✓', align: AlignmentType.CENTER }],
  [{ text: 'Admin', align: AlignmentType.LEFT }, { text: '✓', align: AlignmentType.CENTER }, { text: '—', align: AlignmentType.CENTER }, { text: '—', align: AlignmentType.CENTER }, { text: 'reads all', align: AlignmentType.CENTER }],
  [{ text: 'DataLab', align: AlignmentType.LEFT }, { text: '✓', align: AlignmentType.CENTER }, { text: '—', align: AlignmentType.CENTER }, { text: '—', align: AlignmentType.CENTER }, { text: '—', align: AlignmentType.CENTER }],
], [2400, 1740, 1740, 1740, 1740]));

content.push(new Paragraph({
  spacing: { before: 600 },
  alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: '— End of Document —', italics: true, color: GREY, size: 20, font: 'Arial' })],
}));

// ─── Build & Save ───────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
  },
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: '◦', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
      ],
    }],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 }, // US Letter
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children: content,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('AwadhVaani_Features.docx', buf);
  console.log('✓ AwadhVaani_Features.docx created (' + buf.length + ' bytes)');
});
