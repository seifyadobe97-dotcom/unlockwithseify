# UNLOCK WITH SEIFY

A separate interactive Unlock 1 learning platform with **two independent books**:

- Listening, Speaking & Critical Thinking
- Reading, Writing & Critical Thinking

**Live preview:** https://seifyadobe97-dotcom.github.io/unlockwithseify/

## Unit 1 — People (published for enrolled students)

Both Unit 1 books are currently published with **21 sections**, **134 graded practice items**, **56 source-indexed guided activities**, and **41 vocabulary cards** containing the glossary's English definitions, IPA, Arabic meanings and source pages. Original media-dependent activities show **سيتم النشر**, not fake listening/video scores. Other units remain drafts.

See [Unit 1 publication report](./UNIT1_STATUS_AR.md) for exact completion limits and QA.

## Administrator workflow

1. Log in and refresh your session after your server-side admin role is set.
2. Open **لوحة الإدارة**. Four tabs: **الدروس والأسئلة، رفع الميديا، الطلاب، تقييم المهام**.
3. Expand a book, then expand Unit 1; click **معاينة الكتاب كطالب** to open the same educational page layout.
4. Upload licensed audio/video, then review and approve it; media only appears as true assessment after being uploaded and approved.
5. Enroll each student independently in the right book.
6. Review written submissions and indexed open-ended activities separately.

Learn more in [Admin setup](./ADMIN_SETUP_AR.md).

## Source fidelity

The project owner provided scanned/OCR source books and affirmed all needed usage permissions. To protect licensed scans, **the full source page images are not in the public GitHub repository**. The source page assets can be uploaded from admin to the private `unlock-course-media` bucket; until then, students see precise page references and the transcribed passages available in the platform. The owner also has an offline source-review package containing all Unit 1 pages.

Indexed tasks are teaching guides and page locators; do not mistake them for a confirmed byte-for-byte digitization of the entire printed book.

## Security

Supabase `caumpvsypmkpewdbiedd` is independent of STEP. The frontend uses a publishable key only; private answer keys and grading remain on the server. Students must authenticate and be enrolled. The app uses RLS, protected private media and role-based admin navigation.

## Deploy

The GitHub Pages workflow validates JavaScript and essential assets before publishing from `main`.
