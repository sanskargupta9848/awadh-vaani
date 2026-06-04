# Awadh Vaani — Feature Documentation

> **A bilingual (Awadhi · Hindi · English) language-learning web app for the Awadhi dialect of the Awadh region of Uttar Pradesh, India.**

This document elaborates every feature, screen, and subsystem of the app — what it does, how it works, and which files implement it.

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Authentication & Multi-User Support](#2-authentication--multi-user-support)
3. [Home / Dashboard](#3-home--dashboard)
4. [Lessons (Curriculum)](#4-lessons-curriculum)
5. [Quiz (Pariksha)](#5-quiz-pariksha)
6. [Voice Practice (Aawaz Abhyas)](#6-voice-practice-aawaz-abhyas)
7. [Word Repository (Shabd Bhandar)](#7-word-repository-shabd-bhandar)
8. [Stories (Kahaaniyaan)](#8-stories-kahaaniyaan)
9. [Community (Samaaj)](#9-community-samaaj)
10. [Profile (Mera Pratiroop)](#10-profile-mera-pratiroop)
11. [Admin Panel](#11-admin-panel)
12. [DataLab — Synthetic Dataset Generator](#12-datalab--synthetic-dataset-generator)
13. [Audio Subsystem (Speak)](#13-audio-subsystem-speak)
14. [Mobile App](#14-mobile-app)
15. [Data Sources](#15-data-sources)
16. [Tech Stack](#16-tech-stack)

---

## 1. Overview & Architecture

**Awadh Vaani** ("Voice of Awadh") is a single-page React app that helps learners study the Awadhi dialect through curated lessons, vocabulary, quizzes, voice-pronunciation practice, and folk stories. It runs in two flavors:

| Version | Port | URL | Layout |
|---------|------|-----|--------|
| Desktop | 5173 | `http://localhost:5173` | Sidebar nav + wide multi-column layouts |
| Mobile  | 5174 | `http://localhost:5174/mobile.html` | Bottom tab bar + single-column stacked layouts |

Both versions share the **same auth, the same localStorage data, and the same data files** — sign in once, use either.

**State model:** all per-user data (XP, streak, completed lessons, quiz scores, activity log) lives in a single `stats` object stored in `localStorage` under the user's namespace. App-level state is lifted to `App.jsx` / `AppMobile.jsx` and passed to screens via props.

**Routing:** simple `useState` switch (`activeScreen`) — no React Router. Each screen is a top-level component selected by the sidebar / bottom-nav.

---

## 2. Authentication & Multi-User Support

**Files:** `src/Login.jsx`, persistence utilities exported from the same file.

### Features
- **Sign In / Sign Up toggle** on a single screen with split-panel layout (branding left, form right).
- **Local-only auth** — credentials stored in `localStorage` under `awadhvaani_users`. No backend.
- **Session persistence** — `awadhvaani_session` stores the active username; the app restores it on reload.
- **Demo account** seeded on first load: `username: demo · password: demo` (auto-fillable via "Autofill demo credentials" button).
- **Per-user namespacing** — each user's `stats` object is stored separately under their username, so multiple people sharing a browser get independent progress.
- **Sign Out** clears the session token (does not delete the user record).

### Security note
Passwords are stored in plaintext localStorage — **prototype only**. Production would need a real backend with hashed credentials.

---

## 3. Home / Dashboard

**Files:** `src/Dashboard.jsx` (desktop), `src/mobile/HomeM.jsx` (mobile).

### Features
- **Personalized greeting banner** — `नमस्ते, {firstName}!` with user's name, plus the tagline *"Awadhi ki awaaz, aapki zuban."*
- **Live stats strip** (3 cards):
  - ⚡ **Daily XP** vs daily goal
  - 🔥 **Streak** in days
  - 🏆 **Total XP** (lifetime)
- **Daily-goal progress bar** — fills based on `dailyXP / dailyXPGoal` (default 100).
- **Continue Learning card** — auto-detects the first unit with `progress < 100` and offers a **Resume Learning →** button that jumps to the Lessons screen.
- **Quick Access tiles** (2×2 grid) — one-tap shortcuts to Voice, Repository, Stories, Quiz.
- **Word of the Day** — rotates daily using `dayOfYear % vocab.length`. Shows Devanagari + romanization + English + category, plus a 🔊 button to hear it.
- **Upcoming Schedule** — three illustrative scheduled sessions with click-to-jump.
- **Last Quiz card** — shown only after the user takes their first quiz; displays XP earned, correct count, accuracy.
- **Recent Badges** (6-tile grid) — badges grey out until unlocked. Conditions:
  - 🥇 Fast Learner — 1000 XP
  - 🗣️ Speaker — at least 1 quiz taken
  - 📚 Storyteller — always unlocked
  - 🔥 14-Day Streak — streak ≥ 14
  - 💎 5000 XP
  - 🏆 Quiz Master — at least one quiz with ≥80% accuracy

---

## 4. Lessons (Curriculum)

**Files:** `src/Lessons.jsx`, data in `src/data/lessons.json`.

### Structure
The curriculum is organized as **Units → Lessons → Sentences**. Each unit has a title, emoji, color theme. Each lesson is a thematic mini-set (e.g. "Pranaam — Greetings", "Mora Naam — Introductions"). Each sentence has Devanagari, Roman transliteration, and English translation.

### Features
- **Header summary** — total XP earned, total lessons, lessons completed.
- **Collapsible unit accordions** — click to expand; only one open at a time.
- **Per-unit live progress** — `progress = (completedLessons / totalLessons) × 100`, computed dynamically from user's `completedLessons` map (no hardcoded values).
- **Lesson tabs** inside each open unit; completed lessons get a ✓ badge and green tint.
- **Sentence cards** — each sentence displays Devanagari + Roman + English with an inline 🔊 SpeakButton.
- **Lesson navigation:**
  - "← Previous" and "Next →" buttons; clicking "Next →" **marks the current lesson complete and awards +20 XP**.
  - On the last lesson of a unit, a "Mark Complete +20 XP" button appears in place of "Next →".
  - Already-completed lessons show "✓ Done" and don't double-award XP.
- **XP economy** — 20 XP per lesson completion, also boosts daily XP and adds an entry to the activity log.

---

## 5. Quiz (Pariksha)

**Files:** `src/Quiz.jsx`, `src/mobile/QuizM.jsx`, data in `src/data/quiz.json`.

### Question types (defined in JSON)
- Translation (Awadhi → English / English → Awadhi)
- Vocabulary recognition
- Cultural / contextual MCQs
- Each question has 4 options, one marked `correct: true`.

### Features
- **45-second per-question timer** with red pulse when ≤ 10s remain. Time-up auto-submits.
- **Top progress bar** — fills based on `currentIndex / total`.
- **Question card** — shows type chip, large Devanagari, Roman transliteration, 🔊 audio button, and the prompt text.
- **2×2 option grid** — tap to select; selected option highlights in saffron. Submit button disabled until selection made.
- **Result ribbon** — green for correct, saffron for incorrect; shows the right answer when wrong.
- **Live stats sidebar** (desktop only):
  - Score (running total)
  - Streak (consecutive correct)
  - Accuracy (live percentage)
  - Questions remaining
  - Motivational pep-talk that changes based on streak
- **Vocabulary tip** — appears under the question after submission with cultural / linguistic context.
- **Skip** button (counts as wrong, breaks streak).
- **Hint button** displayed (-5 XP cost — visual only at present).
- **Results modal** — fully blocking modal at quiz end:
  - Trophy / target / book emoji based on score band
  - +XP, correct/total, accuracy
  - **Back to Home** button (records quiz, navigates home)
  - **Try Again** button (resets state)
- **Quit confirmation** — bilingual modal asks "*सचमुच छोड़ब चाहत अहा?*" before discarding mid-quiz progress.
- **Scoring:** +20 XP per correct answer. Quiz attempts stored in `stats.quizScores` (used by Profile, Admin, and Dashboard's "Last Quiz" card).

---

## 6. Voice Practice (Aawaz Abhyas)

**Files:** `src/Voice.jsx`, `src/mobile/VoiceM.jsx`. Phrases pulled live from `lessons.json`.

### Features
- **Target phrase card** — Devanagari + Roman + English + 🔊 listen button (so user can hear the model pronunciation first).
- **Web Speech API recognition** with `lang: 'hi-IN'` (closest available to Awadhi). Only Chrome / Edge.
- **Animated waveform** — 12 bars that pulse during active recording (decorative, not real audio analysis).
- **Big mic button** — tap to start; turns into a red ⏹ pulse when listening.
- **Live status text** — *"Tap to start"* → *"🔴 Listening… speak now"* → *"Recording complete"*.
- **Transcript display** — shows what the speech recognizer heard, in Devanagari.
- **Fuzzy scoring** using Levenshtein distance:
  - Normalizes punctuation and whitespace
  - Splits into words; for each target word, finds the best match in the transcript (similarity = 1 − editDistance/maxLen)
  - Final score = average best-match across target words × 100
  - Forgiving of word-order differences and minor spelling variations
- **Score ring** — circular SVG progress that animates to the result; color shifts from red → marigold → green.
- **Feedback message** matched to score band:
  - 80+ → *"Shabash! Excellent! 🎉"*
  - 60+ → *"Bahut Badhiya! Good!"*
  - 40+ → *"Theek hai. Keep trying!"*
  - <40 → *"Koshish Karo! Try again."*
- **XP reward** — 10 XP if score ≥ 60.
- **Try Again** (re-record same phrase) and **Next Phrase →** (cycle to next).
- **Pronunciation tip card** — calls out Awadhi-specific markers (e.g. `मा` vs Hindi `में`).

---

## 7. Word Repository (Shabd Bhandar)

**Files:** `src/Repository.jsx`, `src/mobile/RepositoryM.jsx`, data in `src/data/vocabulary.json`.

### Features
- **Header** with the section title in Devanagari (शब्द भण्डार) plus total word count and "showing N" live filter count.
- **Search bar** — fuzzy search across Devanagari, Roman, English, and category. Debounced via `useMemo`.
- **Clear button** (✕) appears when there's text in the search.
- **Category filter chips** — All, Home, Family, Food, Nature, Education, Daily Life, Cultural. Single-select.
- **Word grid** (3 cols on desktop, 2 cols on mobile) — each card has:
  - Category tag
  - 🔊 SpeakButton
  - Large Devanagari word
  - Roman transliteration
  - English translation
- **Empty state** with magnifying-glass icon when filters return zero results.
- **Hover/scale animation** on each card.

---

## 8. Stories (Kahaaniyaan)

**Files:** `src/Stories.jsx`, data in `src/data/stories.json`.

### Features
- **Two cultural categories** — *Lifecycle* and *Daily Life* — toggled via tabs.
- **Horizontal scrollable story carousel** — each card shows emoji thumbnail, title, level (Beginner/Intermediate/Advanced), short Awadhi tagline, summary, read time, and an active-state indicator.
- **"Now Reading" panel** — left column displays the full story split into paragraphs:
  - Each paragraph: Devanagari + English translation + per-paragraph 🔊 button.
  - Currently-playing paragraph highlights in saffron.
- **Functional audio player** (right column):
  - ▶ / ⏸ play-pause that reads paragraphs sequentially via TTS, auto-advancing
  - ⏮ / ⏭ paragraph skip
  - Progress dots — click any to jump
  - Animated waveform that pulses while playing
  - Paragraph counter (e.g. "2 / 5")
  - Scrolling preview text underneath
- **Vocabulary Spotlight** — sidebar listing key words from the story with 🔊 buttons and English glosses.

---

## 9. Community (Samaaj)

**File:** `src/Community.jsx`.

### Features
- **5 left-rail nav items** — Discussion, Exchange, Challenges, Native Corner, Announce.
- **Tabbed post stream** — All Posts · Questions · Word Debates · Stories.
- **Post cards** display author name, region, time, bilingual content (Awadhi + parenthetical English translation), Wah! 👏 like count, and comment count.
- **Verified-elder badge** for community elders.
- **Wah! likes** — tap to increment (optimistic UI, no backend).
- **Post composer** — write a new bilingual post; appears at the top of the active tab. Counter increments.
- **Note:** posts live in component state only — they reset on reload (this is a prototype community feature, not a real social backend).

---

## 10. Profile (Mera Pratiroop)

**Files:** `src/Profile.jsx`, `src/mobile/ProfileM.jsx`.

### Features
- **Avatar circle** — uses the first letter of the user's name on a marigold background.
- **Username + display name + level chip** — current level computed from XP across 6 tiers:
  - 🌱 Naya Seekhne Wala (0 XP)
  - 📖 Shabd Gyani (500)
  - 💬 Bhaasha Prem (1500)
  - 🎯 Awadhi Praveen (3000)
  - 🏛️ Lok Kavi (5000)
  - 🏆 Ramkatha Gyani (8000)
- **XP-to-next-level progress bar** with "X / Y XP to {next title}" caption.
- **Stats grid** — Total XP · Day Streak · Quizzes Taken · Average Accuracy.
- **28-day activity heatmap** (desktop) — coloured cells based on `stats.activityLog` values (0–3 scale).
- **Skill bars** (desktop) — derived percentages for Vocabulary, Quiz, Speaking, Cultural categories.
- **Achievements grid** — same 6 badges as Dashboard; unlocked vs locked with greyscale.
- **Last Quiz Result card** — only when at least one quiz exists.
- **Sign Out button** — wired to `onLogout` (clears session, returns to Login).

---

## 11. Admin Panel

**File:** `src/Admin.jsx`.

### Features
- **Leaderboard table** — all registered users sorted by XP descending. Columns:
  - Rank with 🥇🥈🥉 medal icons for top 3
  - Avatar + name + @username
  - Total XP
  - Streak
  - Quizzes taken
  - Average accuracy
  - Active days (days with non-zero activityLog)
- **Click any row → detail panel** opens on the right showing:
  - Stat grid (XP, streak, etc.)
  - 28-day activity heatmap for that user
  - Full quiz history with timestamps and scores
- **Summary cards** at top:
  - Total registered users
  - Combined XP across all users
  - Total quizzes attempted
  - Top learner (name + XP)
- **↻ Refresh button** re-reads localStorage on demand.
- **Note:** read-only — no editing or deleting of users from this UI.

---

## 12. DataLab — Synthetic Dataset Generator

**File:** `src/DataLab.jsx`.

A meta-section that demonstrates how augmented training data can be generated from the existing curriculum.

### Two truly synthetic generators
1. **Substitution generator** (`generateSubstitutions()`) — for each sentence in the lessons, swaps a content word with up to 4 same-category alternatives from the vocabulary repository, producing **337 unique synthetic rows**.
2. **Template generator** (`generateTemplates()`) — extracts sentence templates with `[CATEGORY]` placeholders and recombines them with all category-matched words, producing **172 unique synthetic rows** that don't appear in the source data.

### Two view modes
- **Pipeline view** (default) — side-by-side flowcharts showing the 5-step process for each generator with real example data injected at each step:
  1. Source — load lessons + vocabulary
  2. Analyze — count categories / extract patterns
  3. Substitute / Extract Template — show one transformation
  4. Generate — show the new sentences produced
  5. Output — file size, row count, download
- **Dataset view** — selector cards, full preview table, download buttons (JSON + CSV with UTF-8 BOM for Excel Devanagari support).

---

## 13. Audio Subsystem (Speak)

**File:** `src/speak.jsx` — shared by **every** screen that has a 🔊 button.

### Functions
- `speak(devanagari, onEnd, roman)` — speak a phrase; calls `onEnd` callback when finished
- `stopSpeech()` — cancel any in-flight utterance
- `<SpeakButton text={...} roman={...} size="sm|md|lg" />` — reusable React component

### Voice selection logic (priority order)
1. `hi-IN` voice if available (Google हिन्दी, Microsoft local)
2. Any voice starting with `hi`
3. `en-IN` local Microsoft voice (Ravi / Heera) — **preferred fallback** because it's offline and won't drop mid-sentence
4. Any local voice
5. Any available voice

### Devanagari fallback
If the chosen voice is **not Hindi**, the Roman transliteration is spoken instead (since English voices like Microsoft Ravi can't pronounce Devanagari). The visual displays still show Devanagari — only what's *spoken* changes.

### Chrome bug workarounds
- **Keepalive** — calls `pause()` / `resume()` every 10 seconds while speaking to prevent Chrome's known silent-pause bug after ~15 seconds of activity.
- **resume() before cancel()** — unsticks the engine if Chrome paused it.
- **Local voice priority** — Google cloud voices (`hi-IN Google`) often drop because they need a live network stream; local Microsoft voices play offline reliably.

### Where it's used
Repository · Lessons · Voice · Quiz · Stories (paragraphs + vocab + audio player) · Dashboard (Word of Day) — and all their mobile counterparts.

---

## 14. Mobile App

**Files:** `src/AppMobile.jsx`, `src/mobile/*.jsx`, `mobile.html`, `vite.mobile.config.js`.

### Architecture
- Separate Vite config (`appType: 'mpa'`) on **port 5174**, served from `mobile.html` → `src/mobile.jsx` → `AppMobile`.
- Shares **all** logic with the desktop app: same Login, same localStorage namespace, same data files, same `speak.jsx`.
- Locked to a 430 px max-width with `mx-auto` for a phone-like preview on desktop browsers.

### Mobile-specific layout patterns
- **Bottom tab bar** with 5 tabs: Home · Lessons · Quiz · Voice · ☰ More
- **More sheet** slides up from bottom; contains: Repository · Stories · Community · Profile · Sign Out
- **Single-column** layouts everywhere; no sidebars
- **2×2 grids** instead of 3×3
- **Touch-friendly** larger tap targets, smaller text, more whitespace
- **Bottom-sheet results modal** for the Quiz instead of a centered modal
- **Stacked recorder + score ring** in Voice Practice instead of side-by-side

### Mobile screens
| File | Purpose |
|------|---------|
| `HomeM.jsx` | Dashboard — greeting + 3-stat pills + 2×2 quick tiles + Word of Day + last-quiz card |
| `LessonsM.jsx` | Thin wrapper re-exporting desktop `Lessons` (already mobile-friendly) |
| `QuizM.jsx` | Mobile quiz with stats strip on top, no sidebar, bottom-sheet results |
| `VoiceM.jsx` | Stacked phrase / recorder / score ring layout |
| `RepositoryM.jsx` | Search + scrollable category chips + 2-col word grid |
| `ProfileM.jsx` | Compact avatar + level + 2×2 stats + 3×2 badges |

---

## 15. Data Sources

All under `src/data/`:

| File | Contents | Used by |
|------|----------|---------|
| `vocabulary.json` | Awadhi words with Devanagari, Roman, English, category | Repository, Dashboard (Word of Day), DataLab |
| `lessons.json` | Units → Lessons → Sentences with all three scripts | Lessons, Voice (phrase pool), Dashboard, DataLab |
| `quiz.json` | MCQ questions: type, prompt, Awadhi text, 4 options with correct flag, vocabulary tip | Quiz |
| `stories.json` | Folk stories: title, level, summary, paragraphs (Awadhi + English), vocabulary spotlight | Stories |

DataLab additionally generates `awadhvaani_synthetic_substitution.json` and `awadhvaani_synthetic_template.json` on demand.

---

## 16. Tech Stack

- **React 19** + functional components / hooks only
- **Vite 8** for dev server + bundling
- **Tailwind CSS 4** for styling — custom palette: `saffron`, `marigold`, `forest`, `ivory`
- **Custom fonts** — `Tiro Devanagari Hindi` for Devanagari, `Noto Sans` for Latin
- **Web Speech API**:
  - `SpeechSynthesis` for TTS (output)
  - `SpeechRecognition` for voice input (Chrome / Edge only)
- **localStorage** for persistence (no backend) — keys: `awadhvaani_users`, `awadhvaani_session`
- **No external state library** — `useState` + `useCallback` + lifted state in `App.jsx` / `AppMobile.jsx`
- **No router** — single-screen state machine

---

## Summary at a glance

| Feature | Desktop | Mobile | Audio | Backed by user data |
|---------|:-------:|:------:|:-----:|:--------------------:|
| Login / Sign up | ✅ | ✅ | — | ✅ |
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Lessons | ✅ | ✅ | ✅ | ✅ |
| Quiz | ✅ | ✅ | ✅ | ✅ |
| Voice Practice | ✅ | ✅ | ✅ + 🎙️ | ✅ |
| Repository | ✅ | ✅ | ✅ | — |
| Stories | ✅ | (via More) | ✅ | — |
| Community | ✅ | (via More) | — | session-only |
| Profile | ✅ | ✅ | — | ✅ |
| Admin | ✅ | — | — | reads all users |
| DataLab | ✅ | — | — | — |
