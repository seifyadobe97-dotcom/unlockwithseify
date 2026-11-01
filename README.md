# UNLOCK WITH SEIFY

An independent interactive Cambridge Unlock Level 1 study platform for **two separate books**:

1. **Listening, Speaking & Critical Thinking 1**
2. **Reading, Writing & Critical Thinking 1**

## Current deployment status

This repository contains the **student/admin frontend**. Its backend is the separate Supabase project `caumpvsypmkpewdbiedd`. The local full-source teaching prototype and its original page facsimiles are distributed privately as a project ZIP, not committed to this **public** repository.

Unit 1 (*People*) is under editorial review. The frontend shows a login and only loads published material for enrolled students; administrators with a server-issued `app_metadata.unlock_role=admin` claim can review drafts. **Do not interpret an empty question list as lost content**: unpublished exercises are intentionally hidden.

## First-run setup

1. Configure a trusted administrator in Supabase Auth through a server-side action (never from browser code).
2. Enroll the student in the intended book, independent of the other book.
3. Review the imported lesson questions, separate from their answer keys in `private.activity_keys`.
4. Change individual activity, lesson, unit, and book publication statuses **after** QA.
5. Upload licensed source pages/audio/video to private protected storage and issue signed URLs only for authorized users.
6. Configure GitHub Pages or your hosting provider and later point the intended domain at the host.

No backend service-role secret is included in this repository.

## Assessment

Objective answers are evaluated by the `grade-activity` edge function, not in frontend JS. Text-based study questions about audio/video scripts **do not count as listening or video assessment**. Writing/speaking require human or rubric-based review.

## Source integrity

The scanned/OCR copies provided by the course owner are the canonical source. Teacher-authored explanations and practice questions should be distinguished from published book exercises; ambiguous exercises are never force-graded with one answer.

## Project safeguards

- No changes to the STEP WITH SEIFY app or its Supabase database.
- Private answer keys and course media.
- RLS-protected student access and separate enrollments per book.
- Correct LTR / RTL handling, accessible buttons, mobile-friendly interface.
