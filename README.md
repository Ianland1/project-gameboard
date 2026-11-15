# STEM Practice — Game Companion

A STEM practice companion for a physical cyber pyramid game. The website provides question cards and a die that rolls from 1 to 4; players move their real pieces on their existing game board.

## Included

- 318 multiple-choice questions across 53 grade-specific course decks, with six cards per focused course.
- Elementary (grades 1–5), Middle school (6–8), High school (9–12), and introductory College levels.
- Math, Computer Science, Science, and Engineering, each with a course picker appropriate to the selected grade level.
- Math includes Geometry, Algebra, Precalculus, Calculus, Linear Algebra, and more. Computer Science includes Coding Basics, Programming, Algorithms, Digital Systems, and Data & Databases. Other subjects include Biology, Chemistry, Physics, Mechanical, Electrical, Civil, and Computing.
- All courses mode combines the courses in the selected grade and subject into a mixed deck.
- My PDF notes mode builds a private study deck from a text-based PDF or pasted notes, with a review step, page citations, and optional local saving.
- Shuffled cards and options, with no repeated cards until the selected deck is exhausted.
- Answer explanations. By default, one correct answer unlocks one roll.
- Free roll mode for your own game rules.
- Animated D4-style triangular pyramid die with a three-sided base, cryptographically randomized rolls from 1 to 4, and recent-roll history. Each number is equally likely.
- Session totals and progress saved locally when browser storage is available.
- Responsive layout, keyboard controls, accessible dialogs, and reduced-motion support.

## Run locally

This is a static website with no build step or runtime packages. Serve `dist/` with an HTTP server, for example:

```sh
python3 -m http.server 8000 --directory dist
```

Visit `http://localhost:8000`. Use an HTTP server because the application uses JavaScript modules. Modern browsers are required. The optional Google Fonts request falls back to system fonts when unavailable.

## Check

Node.js 20 or later is sufficient; no npm install is necessary.

```sh
npm run check
npm test
```

## Study from a PDF

Choose **My PDF notes**, select a PDF, and choose up to 10, 20, or 30 cards. Generate the deck, review its questions/answers and source excerpts, uncheck unwanted cards, and select **Use this study deck**. Upload tools collapse while you play.

- PDF reading and card generation happen locally. The original PDF is never uploaded or stored by the app.
- PDF.js is loaded only when needed; question generation runs in a Web Worker when available. Re-generating from the same selected file reuses its extracted text.
- PDFs are limited to 25 MiB, the first 120 pages, and 400,000 extracted characters. Partial extraction is reported. Image-only or handwritten scans need OCR elsewhere or pasted text; there is no hidden OCR or remote AI service.
- Cards come from clear definitions, useful facts, and formulas in the notes. Generation uses conservative extraction rules, not semantic AI inference. Layout fragments or unfamiliar wording can yield fewer cards, so review before play. Answers and page excerpts stay grounded in the document.
- Multiple-choice cards use peers from the notes when suitable. Other cards use self-check: think of an answer, reveal it, then choose **I got it** or **Need more practice**. A correct self-check earns one roll, just like a correct built-in answer.
- PDF decks stay only in the current tab by default. **Save this study deck on this device** explicitly saves generated cards, their excerpts, and the title to localStorage. It never saves the raw PDF. **Remove deck** clears the local deck and saved copy when browser storage permits; a failed cleanup is reported.
- Starting a new session clears quiz progress/totals while keeping the installed notes deck available. Switching sources cancels any unused earned roll and keeps separate draw queues.

The vendored PDF.js version and license are in `dist/vendor/pdfjs/README.md` and `LICENSE`.

## Customize

Edit the subject modules in `dist/courses/` to change the course catalog or its question cards. Each course contains an ID, a label, and six rows containing a question, the correct answer, three distractors, and an explanation. `dist/questions.js` merges the catalog with the original cards while preserving their IDs for saved sessions. The questions are starting content for play; review their difficulty for your particular players. Edit `dist/styles.css` for the visual design. All state stays in the visitor's browser; there is no backend or shared player scoreboard.

## Hosting

Upload the contents of `dist/` to any static website host. The included GitHub Actions workflow deploys that folder to GitHub Pages when you enable **Settings → Pages → Source: GitHub Actions**. GitHub Pages availability depends on your account plan and repository visibility. Enabling Pages can publish the website publicly; choose that deliberately. The `.openai/hosting.json` file identifies the companion's separate, initially private Sites deployment.

## Privacy

No analytics, login, or player-information collection is included. Saved sessions retain course selection and separate card queues. Existing sessions retain their totals and dice history. Opted-in PDF decks restore along with current cards and spent-roll state. Current cards and queues remain for retained STEM subjects; a retired English selection moves to Computer Science with a fresh deck. App progress is stored under `pyra-companion-v1` in localStorage. Browser storage may be cleared by the browser or unavailable in private/restricted sessions.
