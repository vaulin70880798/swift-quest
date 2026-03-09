export type Difficulty = "easy" | "medium" | "hard" | "boss";

export type QuestionFormat =
  | "multiple_choice"
  | "output_prediction"
  | "choose_correct_code"
  | "find_bug"
  | "complete_code"
  | "code_vs_concept"
  | "swiftui_scenario"
  | "wrapper_selection"
  | "code_comparison"
  | "mini_refactor";

export type QuestionState =
  | "new"
  | "learning"
  | "review_soon"
  | "review_later"
  | "mastered";

export interface Question {
  id: string;
  worldId: number;
  stageId: string;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  format: QuestionFormat;
  questionText: string;
  codeSnippet?: string;
  codeLanguage: "swift" | "swiftui";
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  wrongOptionExplanations: string[];
  hint: string;
  tags: string[];
  xpReward: number;
  retryWeight: number;
  prerequisites: string[];
  relatedQuestionIds: string[];
}

export interface TopicMastery {
  topic: string;
  value: number;
  answered: number;
  correct: number;
}

export interface LessonProgressEntry {
  attempts: number;
  bestCorrect: number;
  passed: boolean;
}

export interface WorldExamProgressEntry {
  attempts: number;
  bestCorrect: number;
  bestMistakes: number;
  passed: boolean;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  unlockedWorlds: number[];
  unlockedStages: string[];
  masteryByTopic: Record<string, TopicMastery>;
  answeredQuestions: string[];
  wrongAnswers: string[];
  reviewQueue: string[];
  inventory: Record<string, number>;
  achievements: string[];
  sessionHistory: SessionSummary[];
  lessonProgress: Record<string, LessonProgressEntry>;
  worldExamProgress: Record<number, WorldExamProgressEntry>;
}

export interface World {
  id: number;
  name: string;
  theme: string;
  description: string;
  topicCoverage: string[];
  stages: string[];
  enemySet: string[];
  miniBoss: string;
  finalBoss: string;
  unlockRequirement: {
    minLevel: number;
    requiredWorlds: number[];
  };
  rewardSet: {
    xp: number;
    coins: number;
    badge?: string;
  };
}

export interface BattleQuestionResult {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  answeredAtISO: string;
}

export interface SessionSummary {
  id: string;
  startedAtISO: string;
  endedAtISO: string;
  worldId: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  coinsEarned: number;
  improvedTopics: string[];
  weakTopics: string[];
  memorySnippet: string;
  sessionType?: "lesson" | "world_exam" | "review";
  sessionLabel?: string;
  passed?: boolean;
  mistakesMade?: number;
  maxMistakesAllowed?: number;
  requiredCorrect?: number;
}

export interface DailyChallenge {
  id: string;
  dateKey: string;
  title: string;
  worldId: number;
  questionIds: string[];
}
