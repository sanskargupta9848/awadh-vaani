"""
Path 2 — Add missing curriculum content to close the test-app alignment gap.

Adds 5 vocabulary entries + 6 supporting lesson sentences so that every test
item (V08, V23, V28, V29, V39, G07, G27) has corresponding taught content.

Touches:
  • src/data/vocabulary.json   (+5 entries)
  • src/data/lessons.json      (+6 sentences in 2 existing lessons)

Run:  python content_validity/_fill_alignment_gaps.py
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parent.parent

# ─── New vocabulary additions ─────────────────────────────────────────
NEW_VOCAB = [
    {'awadhi': 'बाबू',    'roman': 'Babu',    'eng': 'Father (informal/affectionate)', 'cat': 'Family'},
    {'awadhi': 'देखत',    'roman': 'Dekhat',  'eng': 'Seeing / Watching (present continuous)', 'cat': 'Daily Life'},
    {'awadhi': 'काल्ह',   'roman': 'Kaalh',   'eng': 'Yesterday / Tomorrow', 'cat': 'Daily Life'},
    {'awadhi': 'कहाँ',    'roman': 'Kahaan',  'eng': 'Where', 'cat': 'Daily Life'},
    {'awadhi': 'कइसा',    'roman': 'Kaisaa',  'eng': 'How / What kind (adjectival form)', 'cat': 'Daily Life'},
]

# ─── New lesson sentences ─────────────────────────────────────────────
# Map: (unit_title_substring, lesson_name_substring) → list of new sentences
NEW_SENTENCES = {
    ('Family & Relations', 'Mai-Baap'): [
        {'awadhi': 'हमार बाबू खेत जात अहैं।',     'roman': 'Hamaar babu khet jaat ahain.',        'english': 'My father goes to the field.'},
        {'awadhi': 'बाबू हमका बहुत प्यार करत अहैं।','roman': 'Babu hamka bahut pyaar karat ahain.', 'english': 'Father loves me very much.'},
    ],
    ('Daily Life Sentences', 'Talking About Time'): [
        {'awadhi': 'काल्ह हम बजार जाब।',          'roman': 'Kaalh hum bajaar jaab.',              'english': 'Tomorrow I will go to the market.'},
        {'awadhi': 'काल्ह वे हियाँ आये रहें।',     'roman': 'Kaalh ve hiyaan aaye rahen.',         'english': 'Yesterday they came here.'},
    ],
    ('Daily Life Sentences', 'Everyday Actions'): [
        {'awadhi': 'हम तुहका देखत अही।',          'roman': 'Hum tuhka dekhat ahi.',                'english': 'I am watching you.'},
        {'awadhi': 'तू कहाँ जात अहा? कइसा रहा?',  'roman': 'Tu kahaan jaat aha? Kaisaa raha?',     'english': 'Where are you going? How was it?'},
    ],
}

# ─── Apply changes ────────────────────────────────────────────────────
vocab_path = ROOT / 'src/data/vocabulary.json'
lessons_path = ROOT / 'src/data/lessons.json'

# Vocabulary update
vocab = json.load(open(vocab_path, encoding='utf-8'))
existing = {w['awadhi'] for w in vocab}
added_vocab = []
for entry in NEW_VOCAB:
    if entry['awadhi'] in existing:
        print(f"  ⤵ Already present: {entry['awadhi']} — skipping")
        continue
    vocab.append(entry)
    added_vocab.append(entry['awadhi'])

with open(vocab_path, 'w', encoding='utf-8') as f:
    json.dump(vocab, f, ensure_ascii=False, indent=2)

# Lessons update
lessons = json.load(open(lessons_path, encoding='utf-8'))
added_sentences = 0

for (unit_match, lesson_match), new_sents in NEW_SENTENCES.items():
    matched_unit = None
    matched_lesson = None
    for unit in lessons:
        if unit_match in unit['title']:
            matched_unit = unit
            for lesson in unit['lessons']:
                if lesson_match in lesson['name']:
                    matched_lesson = lesson
                    break
            break

    if not matched_lesson:
        print(f"  ✗ Unit/lesson not found: ({unit_match}, {lesson_match})")
        continue

    for sent in new_sents:
        # Skip if already present
        if any(s['awadhi'] == sent['awadhi'] for s in matched_lesson['sentences']):
            continue
        matched_lesson['sentences'].append(sent)
        added_sentences += 1

with open(lessons_path, 'w', encoding='utf-8') as f:
    json.dump(lessons, f, ensure_ascii=False, indent=2)

print(f"\n✓ Added {len(added_vocab)} vocabulary entries:")
for w in added_vocab: print(f"    + {w}")
print(f"\n✓ Added {added_sentences} lesson sentences across 3 lessons")

# ─── Verify by re-running coverage audit ──────────────────────────────
print(f"\n{'=' * 70}")
print('Re-running coverage audit after additions...')
print('=' * 70)

vocab = json.load(open(vocab_path, encoding='utf-8'))
lessons = json.load(open(lessons_path, encoding='utf-8'))

app_words = set()
app_text = []
for w in vocab:
    app_words.add(w['awadhi'])
    app_text.append(w['awadhi'])
for unit in lessons:
    for lesson in unit['lessons']:
        for sent in lesson['sentences']:
            app_text.append(sent['awadhi'])
            for word in sent['awadhi'].replace('।','').replace('?','').replace(',','').split():
                app_words.add(word.strip())

# Previously-missing items
PREV_MISSING = [
    ('V08', 'बाबू'),
    ('V23', 'हम अही'),
    ('V28', 'देखत'),
    ('V29', 'काल्ह'),
    ('V39', 'कहाँ'),
    ('G07', 'घर मा'),
    ('G27', 'कइसा'),
]

print(f"\n{'Item':6} {'Target':20} {'Status':30}")
print('-' * 60)
for tid, target in PREV_MISSING:
    if target in app_words:
        print(f"{tid:6} {target:20} ✓ NOW in vocabulary")
    elif any(target in t for t in app_text):
        print(f"{tid:6} {target:20} ✓ NOW in lesson sentence")
    else:
        print(f"{tid:6} {target:20} ✗ STILL MISSING")

print(f"\nTotal app vocabulary: {len(app_words)} word tokens")
print(f"Total app sentences:  {len(app_text)}")
