# Swift Quest Technical Design (MVP-Oriented)

## Architecture

- Next.js App Router with one primary client shell for game flow
- Local-first state in memory + localStorage persistence
- Content-driven model via typed question/world objects

## Core Domain Models

### Question
Includes all PRD-required fields:
`id`, `worldId`, `stageId`, `topic`, `subtopic`, `difficulty`, `format`, `questionText`,
`codeSnippet`, `codeLanguage`, `options`, `correctAnswerIndex`, `explanation`,
`wrongOptionExplanations`, `hint`, `tags`, `xpReward`, `retryWeight`,
`prerequisites`, `relatedQuestionIds`.

### Player
Includes PRD-required fields for progression, mastery, review, history, and inventory.

### World
Includes thematic and progression metadata with unlock requirements and rewards.

## Game Loop Implementation

1. Player opens home base.
2. Starts world battle or review battle.
3. Answers question.
4. Immediate explanation modal appears.
5. Answer updates mastery + review queue.
6. Session finalizes with XP/coins and summary card.

## Review Heuristics (current)

- Wrong answer -> question enters `reviewQueue`
- Correct answer removes from queue when revisited
- Manual save-for-review is available in explanation modal

## Storage Strategy

- `localStorage` key: `swift-quest-player-v1`
- Suitable for MVP and solo usage
- Migration path: move player/session/question analytics to backend (Supabase/Postgres) in MVP 2+

## Future Backend Interfaces

Recommended future APIs:

- `POST /sessions`
- `GET /review-queue`
- `PATCH /mastery`
- `GET /daily-challenge`
- `GET /worlds/:id/questions`
