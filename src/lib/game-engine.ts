import { questionBank } from "@/lib/questions";
import {
  LessonProgressEntry,
  Player,
  Question,
  SessionSummary,
  TopicMastery,
  WorldExamProgressEntry,
} from "@/lib/types";

const PLAYER_STORAGE_KEY = "swift-quest-player-v1";

function calcLevel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 120)) + 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createTopicMastery(topic: string): TopicMastery {
  return {
    topic,
    value: 0,
    answered: 0,
    correct: 0,
  };
}

export function createInitialPlayer(username: string): Player {
  return {
    id: crypto.randomUUID(),
    username,
    avatar: "🛡️",
    level: 1,
    xp: 0,
    coins: 0,
    streak: 1,
    unlockedWorlds: [1],
    unlockedStages: ["w1-s1"],
    masteryByTopic: {},
    answeredQuestions: [],
    wrongAnswers: [],
    reviewQueue: [],
    inventory: {
      hintScroll: 1,
      retryStone: 1,
      xpPotion: 0,
      shieldCharm: 0,
      memoryGem: 0,
    },
    achievements: [],
    sessionHistory: [],
    lessonProgress: {},
    worldExamProgress: {},
  };
}

export function savePlayer(player: Player): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(player));
}

export function loadPlayer(): Player | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PLAYER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Player>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const fallback = createInitialPlayer(
      typeof parsed.username === "string" ? parsed.username : "לומד",
    );

    return {
      ...fallback,
      ...parsed,
      unlockedWorlds:
        Array.isArray(parsed.unlockedWorlds) && parsed.unlockedWorlds.length > 0
          ? parsed.unlockedWorlds
          : fallback.unlockedWorlds,
      unlockedStages:
        Array.isArray(parsed.unlockedStages) && parsed.unlockedStages.length > 0
          ? parsed.unlockedStages
          : fallback.unlockedStages,
      answeredQuestions: Array.isArray(parsed.answeredQuestions) ? parsed.answeredQuestions : [],
      wrongAnswers: Array.isArray(parsed.wrongAnswers) ? parsed.wrongAnswers : [],
      reviewQueue: Array.isArray(parsed.reviewQueue) ? parsed.reviewQueue : [],
      sessionHistory: Array.isArray(parsed.sessionHistory) ? parsed.sessionHistory : [],
      masteryByTopic: parsed.masteryByTopic ?? {},
      inventory: parsed.inventory ?? fallback.inventory,
      lessonProgress: parsed.lessonProgress ?? {},
      worldExamProgress: parsed.worldExamProgress ?? {},
    };
  } catch {
    return null;
  }
}

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const tmp = cloned[index];
    cloned[index] = cloned[swapIndex];
    cloned[swapIndex] = tmp;
  }
  return cloned;
}

export function getWorldQuestions(worldId: number, includeBoss = true): Question[] {
  return questionBank.filter(
    (question) => question.worldId === worldId && (includeBoss || question.difficulty !== "boss"),
  );
}

export function getBattleQuestions(worldId: number, limit = 3): Question[] {
  const worldQuestions = getWorldQuestions(worldId, false);
  return shuffle(worldQuestions).slice(0, limit);
}

export function getReviewQuestions(player: Player, limit = 5): Question[] {
  const fromQueue = player.reviewQueue
    .map((id) => questionBank.find((question) => question.id === id))
    .filter((question): question is Question => Boolean(question));

  return fromQueue.slice(0, limit);
}

interface ApplyAnswerPayload {
  player: Player;
  question: Question;
  selectedIndex: number;
}

export function applyAnswer({ player, question, selectedIndex }: ApplyAnswerPayload): Player {
  const isCorrect = selectedIndex === question.correctAnswerIndex;
  const mastery = player.masteryByTopic[question.topic] ?? createTopicMastery(question.topic);

  const answeredQuestions = Array.from(new Set([...player.answeredQuestions, question.id]));
  const wrongAnswers = isCorrect
    ? player.wrongAnswers
    : Array.from(new Set([...player.wrongAnswers, question.id]));

  const reviewQueue = isCorrect
    ? player.reviewQueue.filter((id) => id !== question.id)
    : Array.from(new Set([question.id, ...player.reviewQueue]));

  const updatedMastery: TopicMastery = {
    ...mastery,
    answered: mastery.answered + 1,
    correct: mastery.correct + (isCorrect ? 1 : 0),
  };

  const rawRate = updatedMastery.correct / updatedMastery.answered;
  const weighted = rawRate * 100;
  const previous = mastery.value;
  const moved = isCorrect ? previous + (weighted - previous) * 0.28 : previous - 8;
  updatedMastery.value = clamp(Math.round(moved), 0, 100);

  return {
    ...player,
    answeredQuestions,
    wrongAnswers,
    reviewQueue,
    masteryByTopic: {
      ...player.masteryByTopic,
      [question.topic]: updatedMastery,
    },
  };
}

interface FinalizeSessionPayload {
  player: Player;
  worldId: number;
  answers: Array<{ question: Question; selectedIndex: number }>;
  startedAtISO: string;
  sessionMeta?: {
    sessionType?: SessionSummary["sessionType"];
    sessionLabel?: string;
    passed?: boolean;
    mistakesMade?: number;
    maxMistakesAllowed?: number;
    requiredCorrect?: number;
  };
}

export function finalizeSession({
  player,
  worldId,
  answers,
  startedAtISO,
  sessionMeta,
}: FinalizeSessionPayload): { player: Player; summary: SessionSummary } {
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(
    ({ question, selectedIndex }) => selectedIndex === question.correctAnswerIndex,
  ).length;
  const xpEarned = answers.reduce((acc, { question, selectedIndex }) => {
    if (selectedIndex === question.correctAnswerIndex) {
      return acc + question.xpReward;
    }
    return acc + Math.round(question.xpReward * 0.35);
  }, 0);
  const coinsEarned = Math.max(12, Math.round(xpEarned * 0.45));

  const improvedTopics = Array.from(
    new Set(
      answers
        .filter(({ question, selectedIndex }) => selectedIndex === question.correctAnswerIndex)
        .map(({ question }) => question.topic),
    ),
  );

  const weakTopics = Array.from(
    new Set(
      answers
        .filter(({ question, selectedIndex }) => selectedIndex !== question.correctAnswerIndex)
        .map(({ question }) => question.topic),
    ),
  );

  const memorySnippet = answers[answers.length - 1]?.question.codeSnippet ?? "let swiftQuest = true";

  const sessionSummary: SessionSummary = {
    id: crypto.randomUUID(),
    startedAtISO,
    endedAtISO: new Date().toISOString(),
    worldId,
    totalQuestions,
    correctAnswers,
    xpEarned,
    coinsEarned,
    improvedTopics,
    weakTopics,
    memorySnippet,
    ...sessionMeta,
  };

  const updatedXp = player.xp + xpEarned;
  const level = calcLevel(updatedXp);

  const updatedPlayer: Player = {
    ...player,
    xp: updatedXp,
    coins: player.coins + coinsEarned,
    level,
    sessionHistory: [sessionSummary, ...player.sessionHistory].slice(0, 25),
  };

  return {
    player: updatedPlayer,
    summary: sessionSummary,
  };
}

export function getQuestionById(questionId: string): Question | undefined {
  return questionBank.find((question) => question.id === questionId);
}

export function upsertLessonProgress(
  player: Player,
  lessonId: string,
  correctAnswers: number,
  passed: boolean,
): Player {
  const previous: LessonProgressEntry = player.lessonProgress[lessonId] ?? {
    attempts: 0,
    bestCorrect: 0,
    passed: false,
  };

  return {
    ...player,
    lessonProgress: {
      ...player.lessonProgress,
      [lessonId]: {
        attempts: previous.attempts + 1,
        bestCorrect: Math.max(previous.bestCorrect, correctAnswers),
        passed: previous.passed || passed,
      },
    },
  };
}

export function upsertWorldExamProgress(
  player: Player,
  worldId: number,
  correctAnswers: number,
  mistakes: number,
  passed: boolean,
): Player {
  const previous: WorldExamProgressEntry = player.worldExamProgress[worldId] ?? {
    attempts: 0,
    bestCorrect: 0,
    bestMistakes: Number.POSITIVE_INFINITY,
    passed: false,
  };

  return {
    ...player,
    worldExamProgress: {
      ...player.worldExamProgress,
      [worldId]: {
        attempts: previous.attempts + 1,
        bestCorrect: Math.max(previous.bestCorrect, correctAnswers),
        bestMistakes: Math.min(previous.bestMistakes, mistakes),
        passed: previous.passed || passed,
      },
    },
  };
}
