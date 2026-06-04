// Generates the content_validity artifacts from the app's data files.
// Run from project root:  node content_validity/_generate.cjs

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT  = __dirname;

const vocab   = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/vocabulary.json'), 'utf8'));
const lessons = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/lessons.json'),    'utf8'));
const quiz    = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/quiz.json'),       'utf8'));
const stories = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/stories.json'),    'utf8'));

// Escape a value for CSV (RFC 4180 — wrap in quotes, double internal quotes)
const csvCell = v => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const csvRow = arr => arr.map(csvCell).join(',');

// ── Build a unified list of items ───────────────────────────────────────
const items = [];
let counter = { V: 0, L: 0, Q: 0, S: 0 };

// 1. Vocabulary
vocab.forEach(w => {
  counter.V++;
  items.push({
    id:           `V${String(counter.V).padStart(3, '0')}`,
    type:         'Vocabulary',
    awadhi:       w.awadhi,
    roman:        w.roman,
    english:      w.eng,
    category:     w.cat,
    context:      '',
    source_file:  'vocabulary.json',
  });
});

// 2. Lesson sentences
lessons.forEach(unit => {
  unit.lessons.forEach(lesson => {
    lesson.sentences.forEach(s => {
      counter.L++;
      items.push({
        id:           `L${String(counter.L).padStart(3, '0')}`,
        type:         'Lesson Sentence',
        awadhi:       s.awadhi,
        roman:        s.roman,
        english:      s.english,
        category:     unit.title,
        context:      `Unit ${unit.id}: ${unit.title} / ${lesson.name}`,
        source_file:  'lessons.json',
      });
    });
  });
});

// 3. Quiz questions
quiz.forEach(q => {
  counter.Q++;
  const correctOpt = q.options.find(o => o.correct);
  items.push({
    id:           `Q${String(counter.Q).padStart(3, '0')}`,
    type:         'Quiz Item',
    awadhi:       q.awadhi,
    roman:        q.roman ?? '',
    english:      correctOpt?.text ?? '',
    category:     q.type,
    context:      `Prompt: ${q.prompt} | Options: ${q.options.map(o => o.text).join(' / ')}`,
    source_file:  'quiz.json',
  });
});

// 4. Story paragraphs + spotlight vocab
stories.forEach(story => {
  (story.paragraphs ?? []).forEach((p, i) => {
    counter.S++;
    items.push({
      id:           `S${String(counter.S).padStart(3, '0')}`,
      type:         'Story Paragraph',
      awadhi:       p.awadhi,
      roman:        p.roman ?? '',
      english:      p.english,
      category:     story.category,
      context:      `${story.title} (¶${i + 1})`,
      source_file:  'stories.json',
    });
  });
  (story.vocabulary ?? []).forEach(v => {
    counter.S++;
    items.push({
      id:           `S${String(counter.S).padStart(3, '0')}`,
      type:         'Story Vocab',
      awadhi:       v.awadhi,
      roman:        v.roman,
      english:      v.english,
      category:     story.category,
      context:      `Vocab from "${story.title}"`,
      source_file:  'stories.json',
    });
  });
});

// ── 03_content_inventory.csv ────────────────────────────────────────────
{
  const header = ['ID', 'Type', 'Awadhi', 'Roman', 'English', 'Category', 'Context', 'Source File'];
  const rows = items.map(it => [it.id, it.type, it.awadhi, it.roman, it.english, it.category, it.context, it.source_file]);
  const csv = '﻿' + [csvRow(header), ...rows.map(csvRow)].join('\r\n');
  fs.writeFileSync(path.join(OUT, '03_content_inventory.csv'), csv);
  console.log(`✓ 03_content_inventory.csv     (${items.length} items)`);
}

// ── 04_rating_spreadsheet.csv ───────────────────────────────────────────
{
  const header = [
    'ID', 'Type', 'Awadhi', 'Roman', 'English', 'Category', 'Context',
    'Relevance (1-4)', 'Clarity (1-4)', 'Authenticity (1-4)',
    'Essential / Useful / Unnecessary',
    'Comments',
  ];
  const rows = items.map(it => [
    it.id, it.type, it.awadhi, it.roman, it.english, it.category, it.context,
    '', '', '', '', '',
  ]);

  // Add a header row of guidance + a separator
  const guide = [
    [
      '', 'KEY:',
      'Relevance: 1=Not, 2=Somewhat, 3=Quite, 4=Highly',
      'Clarity: 1=Unclear, 2=Vague, 3=Clear, 4=Crystal',
      'Authenticity: 1=Sounds Hindi, 2=Mostly Hindi, 3=Mostly Awadhi, 4=Authentically Awadhi',
      '', '', '', '', '', '', '',
    ],
    Array(header.length).fill(''),
  ];

  const csv = '﻿' + [csvRow(header), ...guide.map(csvRow), ...rows.map(csvRow)].join('\r\n');
  fs.writeFileSync(path.join(OUT, '04_rating_spreadsheet.csv'), csv);
  console.log(`✓ 04_rating_spreadsheet.csv    (${items.length} items + rating columns)`);
}

// ── Screen-level rating sheet (bonus, embedded in same file or separate) ──
{
  const screens = [
    { name: 'Lessons',       claim: 'Teaches curriculum across 7 thematic units' },
    { name: 'Quiz',          claim: 'Tests Awadhi knowledge with 4-option MCQs' },
    { name: 'Voice Practice',claim: 'Lets learners practice pronunciation with feedback' },
    { name: 'Repository',    claim: 'Searchable Awadhi-Hindi-English vocabulary' },
    { name: 'Stories',       claim: 'Cultural folk stories with audio + vocabulary spotlight' },
    { name: 'Dashboard',     claim: 'Tracks XP, streak, daily learning goal' },
    { name: 'Profile',       claim: 'Shows learner progress, level, achievements' },
  ];
  const header = ['Screen', 'Stated Claim', 'Coverage Adequacy (1-4)', 'Pedagogical Soundness (1-4)', 'Cultural Authenticity (1-4)', 'Comments'];
  const rows = screens.map(s => [s.name, s.claim, '', '', '', '']);
  const csv = '﻿' + [csvRow(header), ...rows.map(csvRow)].join('\r\n');
  fs.writeFileSync(path.join(OUT, '04b_screen_rating.csv'), csv);
  console.log(`✓ 04b_screen_rating.csv        (${screens.length} screens)`);
}

console.log(`\nAll items extracted: ${counter.V} vocabulary · ${counter.L} lesson sentences · ${counter.Q} quiz items · ${counter.S} story items`);
