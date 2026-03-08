# Swift Quest

Swift Quest is a code-first learning game for Swift and SwiftUI.
This repository starts with an MVP web implementation based on the PRD.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Local JSON/mock content + localStorage persistence

## What Is Implemented (MVP 1 starter)

- Onboarding and profile bootstrap
- Home Base with XP, coins, streak, review queue
- 12-world curriculum map (world 1 playable with 42 questions)
- Battle flow with code-based questions
- Detailed explanation modal after each answer
- Stats dashboard (accuracy, sessions, mastery by topic)
- Dedicated review queue screen with focused drills
- End-of-session summary
- Codex Library starter screen

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Project Structure

- `src/app` - Next.js routes and global styles
- `src/components` - UI components and game shell
- `src/lib` - data contracts, curriculum, question bank, game engine
- `docs` - product and engineering docs
- `progress.md` - running implementation notes for future agents

## Next Priority

See `docs/mvp-backlog.md` for prioritized implementation tasks toward MVP 2.
