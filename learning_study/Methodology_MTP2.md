# Methodology — Chapter 5 (Drop-In for MTP-II Report)

> Locked research questions, hypotheses, study design, and analysis plan for the AwadhVaani MTP-II evaluation. Aligns with Path B of the RQ-selection discussion: foregrounding synthetic data validation alongside learning effectiveness.

---

## 5.1 Research Questions and Hypotheses

This study is guided by **two formally stated research questions**, the first addressing the content validity of AwadhVaani's curriculum (both human-curated and synthetic-augmented content), and the second evaluating the app's effectiveness in producing measurable learning outcomes. These questions formalize what was implicitly evaluated in Stage-1 (MTP-I) and directly respond to the limitations enumerated in MTP-I Section 7.6 (small sample, no rigorous content validation, short exposure duration).

### RQ1 — Content Validity of the Synthetic-Augmented Curriculum

> *To what extent does the curriculum content of AwadhVaani — including both human-curated items and synthetically-augmented items generated through substitution and template-based methods from the curated seed corpus — meet expert-judged content validity thresholds, and how does the validity of synthetic content compare to that of human-curated content?*

**Hypotheses:**

- **H₁ₐ** *(Acceptable validity):* The aggregate Scale-level Content Validity Index (S-CVI/Ave) across all rated items will meet the established threshold of **S-CVI/Ave ≥ 0.78** (Lynn, 1986), with the stronger target of S-CVI/Ave ≥ 0.90 (Polit & Beck, 2007) representing excellent validity.
- **H₁ᵦ** *(Parity of synthetic with curated):* The S-CVI/Ave for synthetically-augmented items will not differ meaningfully from that of human-curated items, with the absolute difference **|S-CVI/Ave_curated − S-CVI/Ave_synthetic| ≤ 0.05**, supporting the claim that synthetic augmentation preserves linguistic and pedagogical authenticity.

**Theoretical grounding:** The CVI methodology follows Lynn (1986) and Polit & Beck (2007), with the modified kappa (κ*) correction for chance agreement (Polit, Beck, & Owen, 2007). Synthetic vs curated comparison uses the same framework, treating source (curated/synthetic) as the grouping factor.

### RQ2 — Learning Effectiveness

> *Does a structured 5-day intervention with AwadhVaani (one hour per day) produce statistically significant gains in Awadhi vocabulary acquisition and grammar competence among Hindi-speaking learners aged 15–25?*

**Hypotheses:**

- **H₂ₐ** *(Vocabulary gain):* Mean post-test vocabulary scores will be significantly higher than pre-test scores (paired-samples t-test, p < .05) with at least a medium effect size (**Cohen's d ≥ 0.5**).
- **H₂ᵦ** *(Grammar gain):* Mean post-test grammar competence scores will be significantly higher than pre-test scores (paired-samples t-test, p < .05) with **Cohen's d ≥ 0.5**.

---

## 5.2 Study Design Overview

The study employs a **two-stage mixed-methods design**, with each stage answering one research question independently:

```
                            ┌─────────────────────────────────────────────┐
                            │   STAGE 1 — Content Validity Study (RQ1)    │
                            │   N = 5 Awadhi experts                      │
                            │   161 items rated (131 curated + 30 synth)  │
                            │   Blind to source — outputs S-CVI/Ave + κ*  │
                            └────────────────────┬────────────────────────┘
                                                 ▼
                            ┌─────────────────────────────────────────────┐
                            │   STAGE 2 — Learning Effectiveness (RQ2)    │
                            │   N = 30 Hindi-speaking learners            │
                            │   Single-group pre-post-delayed design      │
                            │   5 days × 1 hour daily app use             │
                            └─────────────────────────────────────────────┘
```

Stage 1 must complete (and pass H₁ₐ) before Stage 2 begins — if expert reviewers reject the content as invalid, no quantity of learning would justify the curriculum.

---

## 5.3 Stage 1 — Content Validity Study

### 5.3.1 Participants

Five experts, balanced across three relevant backgrounds:

| Expert ID | Background | Expertise |
|---|---|---|
| E1 | Native Awadhi speaker | Awadh-region resident, regular speaker |
| E2 | Linguist | Indo-Aryan dialectology specialist |
| E3 | Language educator | Hindi/regional language curriculum design |
| E4 | Cultural scholar | Folklore, Ramcharitmanas, regional literature |
| E5 | Native Awadhi speaker | Different sub-region from E1, for dialectal balance |

The N=5 panel size meets the Lynn (1986) minimum (N ≥ 3) and satisfies CVI computational requirements; modified-kappa thresholds are calibrated for this size.

### 5.3.2 Materials

A **blinded rating instrument** containing 161 items:
- **131 curated items** drawn from the deployed AwadhVaani curriculum (59 lesson sentences, 25 quiz items, 47 story paragraphs/vocab spotlights)
- **30 synthetic items** stratified-sampled from the DataLab augmentation pipeline:
  - 15 from the **substitution-based generator** (pool of 337)
  - 15 from the **template-based generator** (pool of 172)
  - Random selection seeded for reproducibility (seed = 2026)

Items are randomly shuffled and assigned new sequential display IDs (I001–I161) so experts cannot infer source from position. The source-tracking key is held only by the researcher.

### 5.3.3 Procedure

Each expert receives a personalized Google Form (or equivalent spreadsheet) containing all 161 items. For each item, they rate **Relevance** on a 4-point ordinal scale (1 = Not relevant, 2 = Somewhat relevant, 3 = Quite relevant, 4 = Highly relevant). Items are presented one at a time with full context: Awadhi text, Roman transliteration, English gloss, category, and curricular context. Estimated time: 90 minutes per expert.

Two optional supplementary ratings are also collected for triangulation:
- **Clarity** (4-point): clarity of Awadhi spelling, romanization, and English translation
- **Authenticity** (4-point): would a native Awadhi speaker actually use this phrasing?

### 5.3.4 Analysis Plan

**Per-item analysis:**
- **I-CVI** = (# experts rating ≥ 3) / N
- **Modified kappa κ\*** = (I-CVI − Pc) / (1 − Pc), where Pc = C(N,A) × 0.5^N

**Scale-level analysis:**
- **S-CVI/Ave** = mean of all I-CVI values
- **S-CVI/UA** = proportion of items where all experts rated ≥ 3

**H₁ₐ test:** Compare observed S-CVI/Ave against threshold 0.78 (acceptable) and 0.90 (excellent).

**H₁ᵦ test:** Compute S-CVI/Ave separately for the 131 curated and 30 synthetic items. Compute the **absolute difference** and the **two-sample t-test** on per-item I-CVI values (curated vs synthetic). Support for H₁ᵦ requires |diff| ≤ 0.05 *and* non-significant t-test (p > .05).

---

## 5.4 Stage 2 — Learning Effectiveness Study

### 5.4.1 Design

**Single-group quasi-experimental design** with three measurement points:

```
   Day 0           Days 1–5            Day 6              Day 13 (optional)
   ┌────────┐      ┌─────────────┐     ┌────────┐         ┌────────┐
   │ Pre-   │ ───▶ │ Intervention │ ──▶ │ Post-  │ ──────▶ │Delayed │
   │ test   │      │ 5 days x 1hr │     │ test   │         │ retest │
   └────────┘      └─────────────┘     └────────┘         └────────┘
```

The compressed 5-day intervention matches the cumulative exposure planned in MTP-1 Section 6.5.5 (two weeks of intermittent use) while controlling for between-session attrition and habituation effects.

### 5.4.2 Participants

**Target sample:** N = 30 Hindi-speaking adults aged 15–25 with no prior formal Awadhi instruction.

**Sample-size justification:** A priori power analysis (G\*Power 3.1) for a paired-samples t-test, α = .05, power = .80, Cohen's d = 0.6 (medium-to-large effect, consistent with MTP-1 pilot finding of ~30% vocabulary recall improvement), yields a minimum N = 24. Targeting N = 30 provides ~20% buffer for typical attrition in short-duration studies.

**Recruitment:** Convenience sampling from college and graduate-student networks. Distribution channels include institute email lists, social media DMs, and language clubs. Compensation: ₹500 honorarium plus course credit (where applicable) upon completion of all three sessions.

**Inclusion criteria:** Age 15–25; conversational Hindi proficiency; no prior formal Awadhi instruction; access to a smartphone or laptop with Chrome browser.

**Exclusion criteria:** Native Awadhi speakers; participants who have lived in the Awadh region for 6+ months; participants who report 3+ hours/week of recent Awadhi exposure.

### 5.4.3 Materials

Two custom test batteries developed for this study, each available in parallel forms (A for pre-test, B for post-test, C for delayed retention):

**Vocabulary Acquisition Test** — 40 items across four item types:
- 10 Recognition items (4-option MCQ, "What does X mean?")
- 10 Productive Recall items ("English → Awadhi")
- 10 Awadhi-vs-Hindi Discrimination items
- 10 Contextual fill-in-the-blank items

Items include both **taught words** (in the app) and **control words** (Awadhi but not taught) to support the specificity analysis (see 5.4.5).

**Grammar Competence Test** — 30 items distributed across 6 target Awadhi features (5 items per feature):
- "To-be" conjugation (अही / अहा / अहय)
- Locative postposition (मा vs Hindi में)
- Pronouns (तुहका, हमका, तोहार)
- Verb -य stem (देखय, खाय)
- Negation (नाहीं vs Hindi नहीं)
- Question word (कइसे vs Hindi कैसे)

Each feature includes a mix of item types: Fill-in-blank, Grammaticality Judgment (Yes/No), Forced Choice, Translation Production.

### 5.4.3.1 Test–Curriculum Alignment Verification

Prior to administering the test batteries, a systematic coverage audit was performed to confirm that every test item maps to corresponding content in the AwadhVaani curriculum. The audit checked whether each target Awadhi word, phrase, or construction in the test batteries appeared either as a vocabulary entry or within a lesson sentence, story paragraph, or quiz item in the deployed app.

**Initial audit findings** revealed that 5 vocabulary items (V08 *बाबू*, V23 *हम अही*, V28 *देखत*, V29 *काल्ह*, V39 *कहाँ*) and 2 grammar items (G07 *घर मा*, G27 *कइसा*) referenced constructions present in the equivalence map but not exposed as primary curriculum content. To address this gap, the curriculum was extended pre-emptively with **5 additional vocabulary entries** (*बाबू, देखत, काल्ह, कहाँ, कइसा*) and **9 supporting lesson sentences** distributed across three thematic units (Greetings & Basics, Family & Relations, Daily Life Sentences).

**Post-audit coverage** improved as follows:

| Test | Direct Coverage | Effective Coverage |
|---|---:|---:|
| Vocabulary (40 items) | 38/40 (95%) | 38/40 (95%); 2 items intentional Awadhi-not-in-app controls |
| Grammar (30 items) | 24/30 (80%) directly verbatim | 30/30 (100%) pedagogically aligned |

The 6 grammar items not appearing verbatim in the curriculum (G04, G08, G15, G20, G25, G30) are **Grammaticality Judgment items that present Hindi stimuli for participants to reject as non-Awadhi** — i.e., they correctly should NOT be in the curriculum. The 6 remaining items (G05, G10, G14, G19, G23, G28) are **Translation Production items** whose target answers are multi-word phrases constructed from taught components rather than memorized verbatim. All component lexemes and grammatical morphemes underlying these productive targets (हम, अही, मा, देखय, खाय, चाहत, etc.) are explicitly taught.

This pre-emptive curriculum-to-instrument validation strengthens the construct validity of subsequent learning gains: any pre-post change can be confidently attributed to engagement with content the app actually teaches.

### 5.4.4 Procedure

| Session | Day | Activity | Duration |
|---|---|---|---|
| 1 (in-person or video) | 0 | Informed consent + demographic survey + Vocabulary Pre-Test + Grammar Pre-Test | 60 min |
| 2–6 (independent) | 1–5 | App use, 60 min per day, self-paced. Usage logged via Admin export. | 5 × 60 min |
| 7 (in-person or video) | 6 | Vocabulary Post-Test + Grammar Post-Test + Satisfaction Survey | 60 min |
| 8 (optional, online) | 13 | Vocabulary Delayed Retention (14 items) + Grammar Delayed Retention (10 items) | 25 min |

Participants are instructed to use the app for ~60 minutes per day, distributed across any features (Lessons, Quiz, Voice Practice, Repository, Stories) as they prefer. App usage data is collected via the Admin → Export CSV function (patched into the Admin module specifically for this study).

### 5.4.5 Analysis Plan

**H₂ₐ test (Vocabulary):**
- **Paired-samples t-test** comparing pre vs post vocabulary totals
- **Cohen's d** computed as (M_post − M_pre) / pooled SD
- Effect size interpretation: d ≥ 0.2 small, ≥ 0.5 medium, ≥ 0.8 large (Cohen, 1988)
- **Repeated-measures ANOVA** on Pre / Post / Delayed if retention test is administered
- **Specificity ratio** = mean gain on taught items / mean gain on control items; ratio > 1.5 supports app-specific learning vs general exposure effects

**H₂ᵦ test (Grammar):**
- Same statistical structure as H₂ₐ
- **Per-feature breakdown:** Separate paired-t-tests for each of the 6 grammatical features, with Bonferroni correction (α/6 = .0083)
- Identifies which features the app teaches well and which need pedagogical refinement

**Supplementary analysis — dose-response:**
- Pearson correlation between cumulative app usage minutes and learning gains
- Tests the implicit hypothesis that more app use → more learning (positive r, p < .05)

**Triangulation with satisfaction data:**
- Satisfaction Score (composite of 10 Likert items, range 10–50) correlated with learning gains
- Open-ended satisfaction responses thematically coded for triangulation with quantitative findings

---

## 5.5 Instruments Summary

| Instrument | Use | Format | Items | Reliability |
|---|---|---|---|---|
| CVI Rating Form (per-expert) | Stage 1 — RQ1 | Google Form / Excel | 161 items × 1 Relevance + 2 optional | Inter-rater via κ* |
| Vocabulary Acquisition Test (A/B/C) | Stage 2 — RQ2 | Paper or Excel | 40 / 40 / 14 items | Cronbach's α target ≥ 0.70 |
| Grammar Competence Test (A/B/C) | Stage 2 — RQ2 | Paper or Excel | 30 / 30 / 10 items | Cronbach's α target ≥ 0.70 |
| Demographic Survey | Stage 2 baseline | Google Form | 17 items | N/A — covariate data |
| Satisfaction Survey | Stage 2 post-test | Google Form | 19 items | Cronbach's α on 10-item scale |
| App Usage Log | Stage 2 throughout | CSV export | Per-participant: lessons, quizzes, voice attempts, time | Auto-collected |

---

## 5.6 Ethical Considerations

- **Informed consent** following standard IIT Bombay IEC guidelines; parental consent for minors (15–17)
- **Pseudonymization** via Participant ID (P001…P030); name kept in a separate locked file
- **Voluntary participation** with right to withdraw at any time without penalty
- **Honorarium** is partial (proportionate) for incomplete sessions to avoid coercion to complete
- **Data storage** on password-protected institutional drives; deletion 5 years post-defense
- **Reporting** only aggregate statistics; no individual quotes or identifiers in publications

Stage 1 (expert ratings) raises minimal ethical concern; experts are compensated and acknowledged. Stage 2 (learner study) follows standard educational-intervention protocols.

---

## 5.7 Threats to Validity and Limitations

### Internal validity
- **Testing effect:** Familiarity with the test instrument from pre-exposure may inflate post-test scores. Mitigated by parallel forms (A/B/C) and reshuffled item order.
- **Maturation:** Participants' Hindi proficiency may improve over 5 days from general exposure. Mitigated by short duration (5 days minimizes other learning) and inclusion of control vocabulary items.
- **Regression to the mean:** Baseline low scorers may rise on retesting. Mitigated by reporting individual change scores and not selecting on baseline.

### External validity
- **Generalization:** Sample limited to Hindi-speaking adults 15–25; findings may not generalize to children or non-Hindi-speakers.
- **Context:** Tests are administered in controlled settings; real-world informal Awadhi acquisition may differ.

### Construct validity
- **Awadhi authenticity:** Whether what the app teaches is actually canonical Awadhi (vs Hindi with Awadhi flavor) is the central concern Stage 1 addresses.
- **Test–curriculum alignment:** A systematic coverage audit was conducted prior to data collection (Section 5.4.3.1). Vocabulary alignment reached 95% (38/40 items directly taught; 2 intentional controls retained for specificity analysis). Grammar alignment reached 100% pedagogical coverage after correctly classifying Grammaticality-Judgment items (which should NOT appear in the curriculum) and Translation-Production items (which test productive use of taught components). Pre-emptive curriculum extension (5 vocabulary entries + 9 lesson sentences) closed all identified gaps before recruitment, strengthening the inference that observed gains reflect engagement with taught content rather than untaught knowledge.
- **Speech recognition limitations:** The hi-IN Web Speech API transcribes Awadhi as approximate Hindi, which may underestimate true pronunciation accuracy. Manual coding of voice attempts could supplement but is out of scope.

### Statistical conclusion validity
- **Sample size** at N = 30 detects d ≥ 0.5 with 80% power; smaller effects would require larger samples.
- **Multiple comparisons** in the per-feature grammar analysis controlled via Bonferroni correction.

### Acknowledged limitations carried forward to Thesis Phase
- No between-subjects control group (a textbook or no-intervention arm would strengthen causal claims; planned for thesis-stage scaling to N = 60–75)
- Single 5-day window cannot test long-term retention beyond the 14-day delayed assessment
- Synthetic data validation tests only **content** validity; **pedagogical** validity of synthetic content in actual learning remains future work

---

## 5.8 Timeline (Aligned with MTP-II Calendar)

| Month | Activity |
|---|---|
| **Jan 2026** | Finalize Stage-1 protocol; recruit 5 experts; deploy Google Forms |
| **Feb 2026** | Collect Stage-1 ratings; compute CVI; verify H₁ₐ (S-CVI/Ave ≥ 0.78) |
| **Feb–Mar 2026** | Pilot test batteries with 3–5 participants; refine items; build study materials |
| **Mar 2026** | Recruit N = 30; obtain IEC clearance; schedule Day-0 sessions |
| **Mar–Apr 2026** | Run Stage 2 (~3 batches over 4 weeks); rolling pre-post-delayed sessions |
| **Apr 2026** | Data analysis (paired t-tests, effect sizes, dose-response); thematic coding of qualitative data |
| **Apr–May 2026** | Write MTP-II Chapter on Results + Discussion; prepare submission to thesis committee |

---

## 5.9 Connection to Seminar and MTP-I

The two RQs operationalize what the **Seminar Report's RQ2** ("design principles and pedagogical strategies in mobile applications for low-resource language learning") synthesized at the literature level. Where the seminar review identified content validation as a gap (Section 6.2 of the seminar), this MTP-II evaluates it empirically. Where MTP-I demonstrated feasibility with N = 5 and reported preliminary findings (SUS = 81.5, ~30% vocabulary recall improvement), this stage establishes a rigorous empirical baseline for the eventual thesis-stage scaling to N = 60–75 (planned for May–June 2026 per MTP-I Section 6.2.3).

Together, the two stages produce two publishable contributions:
1. *A validated synthetic-data augmentation pipeline for low-resource Indian language learning content*
2. *Empirical evidence of vocabulary and grammar acquisition from a 5-day mobile microlearning intervention*

Both deliverables target the **ICCE 2026** or **ICET 2026** conference submission window (per MTP-I Section 6.2.3).

---

## References

Brooke, J. (1996). SUS: A "quick and dirty" usability scale. In *Usability Evaluation in Industry*. Taylor & Francis.

Cohen, J. (1988). *Statistical power analysis for the behavioral sciences* (2nd ed.). Lawrence Erlbaum.

Lynn, M. R. (1986). Determination and quantification of content validity. *Nursing Research, 35*(6), 382–385.

Polit, D. F., & Beck, C. T. (2006). The Content Validity Index: Are you sure you know what's being reported? Critique and recommendations. *Research in Nursing & Health, 29*(5), 489–497.

Polit, D. F., Beck, C. T., & Owen, S. V. (2007). Is the CVI an acceptable indicator of content validity? Appraisal and recommendations. *Research in Nursing & Health, 30*(4), 459–467.
