# Swift Quest PRD Implementation Blueprint

## Product Goal
Teach Swift + SwiftUI through structured game progression, not isolated trivia.

## MVP 1 Scope (current repository target)

- Single playable world (`Syntax Fields`)
- 40-60 questions target (currently seeded subset, needs expansion)
- 4+ question formats
- Battle flow with explanation modal
- XP + coins + level
- Basic review queue
- Basic stats + mastery topic map

## Mapping from PRD to Code

- World/Curriculum model: `src/lib/curriculum.ts`
- Question contract and metadata: `src/lib/types.ts`
- Seed content: `src/lib/questions.ts`
- Progression + mastery + review: `src/lib/game-engine.ts`
- Screens and flow shell: `src/components/swift-quest-app.tsx`

## Key Rules Enforced

- Code-first question style (majority of seeded questions include code)
- Explanation exists for each question
- Wrong-option explanations are modeled explicitly
- Topic/subtopic/difficulty/type fields included per question

## Gaps to Close for Full MVP 1

- Expand to full 40-60 question pack for World 1
- Add enemy node types (elite, mini boss path logic, checkpoints)
- Add stronger battle pass/fail rules by node type
- Add stats dashboard with accuracy/time/topic trend
- Add review shrine screen with scheduling buckets
