"""
Finish closing the alignment gap — add lesson sentences containing the exact
multi-word phrases "हम अही" (I am) and "घर मा" (in the house).
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parent.parent

lessons_path = ROOT / 'src/data/lessons.json'
lessons = json.load(open(lessons_path, encoding='utf-8'))

# Add sentences with explicit "हम अही" and "घर मा"
ADDITIONS = {
    ('Greetings & Basics', 'Basic Expressions'): [
        {'awadhi': 'हम अही, सब ठीक बा।',     'roman': 'Hum ahi, sab theek baa.',     'english': 'I am here, everything is fine.'},
    ],
    ('Family & Relations', 'Mai-Baap'): [
        {'awadhi': 'अम्मा घर मा बैठी अहैं।', 'roman': 'Amma ghar ma baithi ahain.',   'english': 'Mother is sitting in the house.'},
        {'awadhi': 'घर मा सब लोग सुखी अहैं।','roman': 'Ghar ma sab log sukhi ahain.', 'english': 'Everyone in the house is happy.'},
    ],
}

added = 0
for (unit_match, lesson_match), new_sents in ADDITIONS.items():
    for unit in lessons:
        if unit_match in unit['title']:
            for lesson in unit['lessons']:
                if lesson_match in lesson['name']:
                    for sent in new_sents:
                        if not any(s['awadhi'] == sent['awadhi'] for s in lesson['sentences']):
                            lesson['sentences'].append(sent)
                            added += 1
                            print(f"  + {sent['awadhi']}  →  {unit['title']} / {lesson['name']}")

with open(lessons_path, 'w', encoding='utf-8') as f:
    json.dump(lessons, f, ensure_ascii=False, indent=2)

print(f"\nAdded {added} sentences. Re-running audit...\n")

# Re-audit
import importlib.util
spec = importlib.util.spec_from_file_location("audit_module", None)

vocab = json.load(open(ROOT / 'src/data/vocabulary.json', encoding='utf-8'))
lessons = json.load(open(lessons_path, encoding='utf-8'))

app_words = set()
app_text = []
for w in vocab:
    app_words.add(w['awadhi']); app_text.append(w['awadhi'])
for unit in lessons:
    for lesson in unit['lessons']:
        for sent in lesson['sentences']:
            app_text.append(sent['awadhi'])
            for word in sent['awadhi'].replace('।','').replace('?','').replace(',','').split():
                app_words.add(word.strip())

PREV_MISSING = [('V08','बाबू'),('V23','हम अही'),('V28','देखत'),('V29','काल्ह'),('V39','कहाँ'),('G07','घर मा'),('G27','कइसा')]
print(f"{'Item':6} {'Target':20} {'Status':30}")
print('-' * 60)
for tid, target in PREV_MISSING:
    if target in app_words:
        status = '✓ Now in vocabulary'
    elif any(target in t for t in app_text):
        status = '✓ Now in lesson sentence'
    else:
        status = '✗ STILL MISSING'
    print(f"{tid:6} {target:20} {status:30}")

print(f"\nFinal app totals: {len(app_words)} word tokens · {len(app_text)} sentences")
