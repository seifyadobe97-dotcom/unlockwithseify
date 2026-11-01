# UNLOCK WITH SEIFY — Unit 1 People | LIVE CONTENT STATUS

**Last updated:** 2026-11-01

## Two fully separate books

1. Listening, Speaking & Critical Thinking — Unit 1 People
2. Reading, Writing & Critical Thinking — Unit 1 People

Each book has its own units, lessons, questions, glossary, submitted work and enrollment. Units 2–8 remain drafts.

## Published in Supabase

- **2 Unit 1 records** with status `published`.
- **21 sections/lessons** published (including two Script Study sections).
- **134 objective and sentence-ordering questions** published; 134 keys stored in private backend tables. Wrong answers show the correct choice and a linguistic explanation.
- **56 page-indexed original-exercise groups**, each with a corresponding guided writing/discussion response or a pending-media label. These are indexed teaching activities, not necessarily full verbatim conversions of every original publisher question.
- **41 Unit 1 vocabulary entries**: 14 LS + 27 RW, with Arabic meaning, original Cambridge Glossary English definition, IPA, part of speech, and PDF Glossary reference.
- **4 core Reading passages / blocks** (Chloe Kim profile and article, Sultan Kösen texts A/B), plus **five available script records** (4 LS, 1 RW), with source references.
- **21 Arabic tutorial sections**, and a unit-level glossary; per-part vocabulary matched to lessons.
- **10 media placeholders** (8 LS audio tracks and 2 original video slots), still awaiting files.
- Media-related lesson cards clearly display **سيتم النشر**. No objective activity remains under audio/video lesson kinds; text script questions are under Script Study only.

## Navigation and admin

Admin has four functional tabs: Lessons & Questions, Media, Students, and Teacher Reviews. Books and units collapse, reducing long scrolling; books have a student-preview button. Learner lesson pages show original book chapter, printed page and PDF page, explanations, source index, question, feedback and vocabulary. Unit lessons offer next/previous navigation.

## Authentic media vs source scripts

Audio/video files have not been uploaded. Script Study is text reading only and cannot be represented as an actual listening/video score. Videos and original audio can be uploaded and approved later through the private-media admin interface. Source page screenshots are distributed in the private offline review ZIP and **have not yet been uploaded to the protected Supabase Storage bucket**.

## Evidence and guardrails

- GitHub Actions static build and `node --check` successful.
- RLS: student access to published Unit 1 content tested with a simulated enrolled JWT in a rolled-back SQL transaction. Admin can read all draft/review content; answer keys are not readable by learner or anon roles.
- Actual browser login and course submission by independent student account remains untested.
- A page-indexed guided exercise is not proof of exact conversion of every printed publisher exercise. The remaining literal transcription and exercise-by-exercise editorial sign-off must be completed before claiming 100% Cambridge digital fidelity.
- The Supabase password leaked-password protection setting currently has a security advisor warning; enable it in Auth configuration.

**Supabase project:** `caumpvsypmkpewdbiedd` (independent of STEP).
**Deployed student portal:** https://seifyadobe97-dotcom.github.io/unlockwithseify/

## Pairwork supplement (important)

The teacher-owned Unit 1 source-reader package also includes the supplementary **Student A / Student B** pages from the Listening & Speaking volume: printed pp. 192 and 194 (PDF pp. 194 and 196). The four linked exercises cover Listening 2 Exercise 9 and Preparation for Speaking Exercise 2, bringing the total to **56** source-indexed groups.

A separate offline source review ZIP includes all Unit 1 page facsimiles (PDF 16–37 per book), Unit 1 video/audio script source pages, Glossary pages and this pairwork supplement. Original scans remain outside the public GitHub repository.
