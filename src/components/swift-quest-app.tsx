"use client";

import { useEffect, useMemo, useState } from "react";

import { CodeSnippet, InlineCodeSnippet } from "@/components/code-snippet";
import { ExplanationModal } from "@/components/explanation-modal";
import { MixedText } from "@/components/mixed-text";
import { shouldRenderOptionAsCode } from "@/lib/code-option";
import { getWorldCourseBlueprint } from "@/lib/course-blueprint";
import { worlds } from "@/lib/curriculum";
import {
  applyAnswer,
  createInitialPlayer,
  finalizeSession,
  getBattleQuestions,
  getReviewQuestions,
  getWorldQuestions,
  loadPlayer,
  savePlayer,
  upsertLessonProgress,
  upsertMiniProjectProgress,
  upsertWorldExamProgress,
} from "@/lib/game-engine";
import { codexLibrary } from "@/lib/library";
import { buildLogicCoachGuide } from "@/lib/logic-coach";
import { getMiniProjectByWorld } from "@/lib/mini-projects";
import { questionBank } from "@/lib/questions";
import { runSwiftConsoleProgram } from "@/lib/swift-console";
import {
  areAllWorldLessonsPassed,
  getLessonPassRequiredCorrect,
  getLessonQuestions,
  getWorldCoursePlan,
  getWorldExamQuestions,
  getWorldLessonById,
  getWorldLessons,
  hasPassedWorldExam,
  isLessonUnlocked,
  isWorldUnlockedByCourse,
} from "@/lib/world-course";
import { Player, Question, QuestionState, SessionSummary } from "@/lib/types";

type Screen =
  | "welcome"
  | "home"
  | "world_map"
  | "world_course"
  | "lesson_intro"
  | "mini_project"
  | "battle"
  | "summary"
  | "review"
  | "library"
  | "stats";

interface BattleState {
  mode: "lesson" | "exam" | "review";
  worldId: number;
  lessonId?: string;
  examVariant?: "standard" | "luck";
  allowedMistakes?: number;
  startedAtISO: string;
  questions: Question[];
  currentIndex: number;
  answers: Array<{ question: Question; selectedIndex: number }>;
  pendingExplanation?: {
    question: Question;
    selectedIndex: number;
  };
}

interface ExamStartOptions {
  allowWithoutLessons?: boolean;
  allowLocked?: boolean;
  examVariant?: "standard" | "luck";
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function getWeakTopics(player: Player): Array<{ topic: string; value: number }> {
  return Object.values(player.masteryByTopic)
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)
    .map((item) => ({ topic: item.topic, value: item.value }));
}

function getQuestionState(player: Player, question: Question): QuestionState {
  const answered = player.answeredQuestions.includes(question.id);
  if (!answered) {
    return "new";
  }
  if (player.reviewQueue.includes(question.id)) {
    return "review_soon";
  }

  const topicMastery = player.masteryByTopic[question.topic];
  const topicValue = topicMastery?.value ?? 0;

  if (topicValue >= 80 && (topicMastery?.answered ?? 0) >= 2) {
    return "mastered";
  }
  if (topicValue >= 55) {
    return "review_later";
  }
  return "learning";
}

function questionStateLabel(state: QuestionState): string {
  switch (state) {
    case "new":
      return "חדש";
    case "learning":
      return "בלמידה";
    case "review_soon":
      return "חזרה בקרוב";
    case "review_later":
      return "חזרה מאוחרת";
    case "mastered":
      return "בשליטה";
    default:
      return "חדש";
  }
}

function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizeConsoleOutput(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

export function SwiftQuestApp() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [nameInput, setNameInput] = useState("לומד");
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selectedWorldId, setSelectedWorldId] = useState<number | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [dailyClaimDate, setDailyClaimDate] = useState<string | null>(null);
  const [miniProjectCode, setMiniProjectCode] = useState("");
  const [miniProjectOutput, setMiniProjectOutput] = useState("");
  const [miniProjectError, setMiniProjectError] = useState<string | null>(null);
  const [miniProjectPassedNow, setMiniProjectPassedNow] = useState(false);

  useEffect(() => {
    const existing = loadPlayer();
    if (existing) {
      setPlayer(existing);
      setScreen("home");
    }
  }, []);

  useEffect(() => {
    if (player) {
      savePlayer(player);
    }
  }, [player]);

  const currentQuestion = useMemo(() => {
    if (!battle) {
      return null;
    }
    return battle.questions[battle.currentIndex] ?? null;
  }, [battle]);

  const selectedWorld = useMemo(() => {
    if (!selectedWorldId) {
      return null;
    }
    return worlds.find((world) => world.id === selectedWorldId) ?? null;
  }, [selectedWorldId]);

  const selectedMiniProject = useMemo(() => {
    if (!selectedWorldId) {
      return null;
    }
    return getMiniProjectByWorld(selectedWorldId);
  }, [selectedWorldId]);

  const selectedWorldPlan = useMemo(() => {
    if (!selectedWorldId) {
      return null;
    }
    return getWorldCoursePlan(selectedWorldId);
  }, [selectedWorldId]);

  const selectedWorldBlueprint = useMemo(() => {
    if (!selectedWorldId) {
      return null;
    }
    return getWorldCourseBlueprint(selectedWorldId);
  }, [selectedWorldId]);

  const selectedWorldLessons = useMemo(() => {
    if (!selectedWorldId) {
      return [];
    }
    return getWorldLessons(selectedWorldId);
  }, [selectedWorldId]);

  const selectedWorldQuestionCount = useMemo(() => {
    if (!selectedWorldId) {
      return 0;
    }
    return questionBank.filter((question) => question.worldId === selectedWorldId).length;
  }, [selectedWorldId]);

  const activeLesson = useMemo(() => {
    if (!activeLessonId) {
      return null;
    }
    return getWorldLessonById(activeLessonId);
  }, [activeLessonId]);

  const selectedMiniProjectProgress = useMemo(() => {
    if (!player || !selectedWorldId) {
      return null;
    }
    return player.miniProjectProgress[selectedWorldId] ?? null;
  }, [player, selectedWorldId]);

  const weakTopics = useMemo(() => {
    if (!player) {
      return [];
    }
    return getWeakTopics(player);
  }, [player]);

  const masteryEntries = useMemo(() => {
    if (!player) {
      return [];
    }
    return Object.values(player.masteryByTopic).sort((a, b) => b.value - a.value);
  }, [player]);

  const statsSummary = useMemo(() => {
    if (!player) {
      return {
        attempts: 0,
        correct: 0,
        accuracy: 0,
        totalSessionQuestions: 0,
      };
    }

    const attempts = masteryEntries.reduce((sum, item) => sum + item.answered, 0);
    const correct = masteryEntries.reduce((sum, item) => sum + item.correct, 0);
    const totalSessionQuestions = player.sessionHistory.reduce(
      (sum, session) => sum + session.totalQuestions,
      0,
    );

    return {
      attempts,
      correct,
      accuracy: attempts === 0 ? 0 : Math.round((correct / attempts) * 100),
      totalSessionQuestions,
    };
  }, [masteryEntries, player]);

  const reviewQuestions = useMemo(() => {
    if (!player) {
      return [];
    }
    return player.reviewQueue
      .map((id) => questionBank.find((question) => question.id === id))
      .filter((question): question is Question => Boolean(question));
  }, [player]);

  const reviewStateCounts = useMemo(() => {
    if (!player) {
      return {
        new: 0,
        learning: 0,
        review_soon: 0,
        review_later: 0,
        mastered: 0,
      };
    }

    const counts = {
      new: 0,
      learning: 0,
      review_soon: 0,
      review_later: 0,
      mastered: 0,
    };

    for (const question of questionBank) {
      const state = getQuestionState(player, question);
      counts[state] += 1;
    }
    return counts;
  }, [player]);

  const selectedWorldLessonsPassedCount = useMemo(() => {
    if (!player || !selectedWorldLessons.length) {
      return 0;
    }
    return selectedWorldLessons.filter((lesson) => player.lessonProgress[lesson.id]?.passed).length;
  }, [player, selectedWorldLessons]);

  const currentLogicGuide = useMemo(() => {
    if (!currentQuestion) {
      return null;
    }
    return buildLogicCoachGuide(currentQuestion);
  }, [currentQuestion]);

  const canStartWorldExam = useMemo(() => {
    if (!player || !selectedWorldId) {
      return false;
    }
    return areAllWorldLessonsPassed(player, selectedWorldId);
  }, [player, selectedWorldId]);

  const onNewGame = () => {
    const nextPlayer = createInitialPlayer(nameInput.trim() || "לומד");
    setPlayer(nextPlayer);
    setSummary(null);
    setBattle(null);
    setScreen("home");
  };

  const onContinue = () => {
    if (player) {
      setScreen("home");
    }
  };

  const openWorldCourse = (worldId: number) => {
    setSelectedWorldId(worldId);
    setActiveLessonId(null);
    setSummary(null);

    const plan = getWorldCoursePlan(worldId);
    const blueprint = getWorldCourseBlueprint(worldId);
    if (plan) {
      setScreen("world_course");
      return;
    }
    if (blueprint) {
      setScreen("world_course");
    }
  };

  const openLessonIntro = (lessonId: string) => {
    const lesson = getWorldLessonById(lessonId);
    if (!lesson || !player) {
      return;
    }
    if (!isLessonUnlocked(player, lesson)) {
      return;
    }
    setActiveLessonId(lessonId);
    setScreen("lesson_intro");
  };

  const startLessonQuiz = (lessonId: string) => {
    const lesson = getWorldLessonById(lessonId);
    if (!lesson || !player) {
      return;
    }
    if (!isLessonUnlocked(player, lesson)) {
      return;
    }

    const questions = getLessonQuestions(lessonId);
    if (questions.length === 0) {
      return;
    }

    setBattle({
      mode: "lesson",
      worldId: lesson.worldId,
      lessonId,
      startedAtISO: new Date().toISOString(),
      questions,
      currentIndex: 0,
      answers: [],
    });
    setSummary(null);
    setScreen("battle");
  };

  const startWorldExam = (worldId: number, options: ExamStartOptions = {}) => {
    const plan = getWorldCoursePlan(worldId);
    if (!plan || !player) {
      return;
    }
    const unlocked = isWorldUnlockedByCourse(player, worldId);
    const allowLocked = Boolean(options.allowLocked);
    const allowWithoutLessons = Boolean(options.allowWithoutLessons);

    if (!allowLocked && !unlocked) {
      return;
    }

    if (!allowWithoutLessons && !areAllWorldLessonsPassed(player, worldId)) {
      return;
    }

    const questions = getWorldExamQuestions(worldId);
    if (questions.length === 0) {
      return;
    }

    setBattle({
      mode: "exam",
      worldId,
      examVariant: options.examVariant ?? "standard",
      allowedMistakes: plan.exam.maxMistakes,
      startedAtISO: new Date().toISOString(),
      questions,
      currentIndex: 0,
      answers: [],
    });
    setSummary(null);
    setScreen("battle");
  };

  const openMiniProject = (worldId: number) => {
    const project = getMiniProjectByWorld(worldId);
    if (!project) {
      return;
    }

    setSelectedWorldId(worldId);
    setMiniProjectCode(project.starterCode);
    setMiniProjectOutput("");
    setMiniProjectError(null);
    setMiniProjectPassedNow(false);
    setScreen("mini_project");
  };

  const resetMiniProjectCode = () => {
    if (!selectedMiniProject) {
      return;
    }
    setMiniProjectCode(selectedMiniProject.starterCode);
    setMiniProjectOutput("");
    setMiniProjectError(null);
    setMiniProjectPassedNow(false);
  };

  const runMiniProject = () => {
    if (!player || !selectedWorldId || !selectedMiniProject) {
      return;
    }

    const runResult = runSwiftConsoleProgram(miniProjectCode);
    const normalizedOutput = normalizeConsoleOutput(runResult.output);
    const normalizedExpected = normalizeConsoleOutput(selectedMiniProject.expectedOutput);
    const passed = !runResult.error && normalizedOutput === normalizedExpected;

    setMiniProjectOutput(runResult.output);
    setMiniProjectError(runResult.error ?? null);
    setMiniProjectPassedNow(passed);

    setPlayer((currentPlayer) => {
      if (!currentPlayer) {
        return currentPlayer;
      }

      const previousPassed = Boolean(
        currentPlayer.miniProjectProgress[selectedWorldId]?.passed,
      );
      let updated = upsertMiniProjectProgress(
        currentPlayer,
        selectedWorldId,
        runResult.output,
        passed,
      );

      if (passed && !previousPassed) {
        const nextXp = updated.xp + selectedMiniProject.rewardXP;
        updated = {
          ...updated,
          xp: nextXp,
          coins: updated.coins + selectedMiniProject.rewardCoins,
          level: Math.max(1, Math.floor(Math.sqrt(nextXp / 120)) + 1),
        };
      }

      return updated;
    });
  };

  const startReviewBattle = () => {
    if (!player) {
      return;
    }

    const reviewQuestions = getReviewQuestions(player, 5);
    const fallback = getBattleQuestions(1, 3);
    const selected = reviewQuestions.length > 0 ? reviewQuestions : fallback;

    if (selected.length === 0) {
      return;
    }

    setBattle({
      mode: "review",
      worldId: selected[0].worldId,
      startedAtISO: new Date().toISOString(),
      questions: selected,
      currentIndex: 0,
      answers: [],
    });
    setSummary(null);
    setScreen("battle");
  };

  const startFocusedReview = (questionId: string) => {
    if (!player) {
      return;
    }

    const target = questionBank.find((question) => question.id === questionId);
    if (!target) {
      return;
    }

    const neighbors = getWorldQuestions(target.worldId, false)
      .filter((question) => question.topic === target.topic && question.id !== target.id)
      .slice(0, 2);
    const questions = [target, ...neighbors];

    setBattle({
      mode: "review",
      worldId: target.worldId,
      startedAtISO: new Date().toISOString(),
      questions,
      currentIndex: 0,
      answers: [],
    });
    setSummary(null);
    setScreen("battle");
  };

  const removeFromReviewQueue = (questionId: string) => {
    setPlayer((currentPlayer) => {
      if (!currentPlayer) {
        return currentPlayer;
      }
      return {
        ...currentPlayer,
        reviewQueue: currentPlayer.reviewQueue.filter((id) => id !== questionId),
      };
    });
  };

  const onPickAnswer = (selectedIndex: number) => {
    if (!player || !battle || !currentQuestion) {
      return;
    }

    setPlayer((currentPlayer) => {
      if (!currentPlayer) {
        return currentPlayer;
      }
      return applyAnswer({ player: currentPlayer, question: currentQuestion, selectedIndex });
    });

    setBattle((currentBattle) => {
      if (!currentBattle) {
        return currentBattle;
      }

      return {
        ...currentBattle,
        answers: [...currentBattle.answers, { question: currentQuestion, selectedIndex }],
        pendingExplanation: {
          question: currentQuestion,
          selectedIndex,
        },
      };
    });
  };

  const goToNextQuestion = () => {
    if (!battle || !player) {
      return;
    }

    const correctAnswersCount = battle.answers.filter(
      ({ question, selectedIndex }) => selectedIndex === question.correctAnswerIndex,
    ).length;
    const mistakesCount = battle.answers.length - correctAnswersCount;
    const hasExceededExamMistakes =
      battle.mode === "exam" &&
      typeof battle.allowedMistakes === "number" &&
      mistakesCount > battle.allowedMistakes;
    const isLast = battle.currentIndex >= battle.questions.length - 1;

    if (!isLast && !hasExceededExamMistakes) {
      setBattle((currentBattle) => {
        if (!currentBattle) {
          return currentBattle;
        }
        return {
          ...currentBattle,
          currentIndex: currentBattle.currentIndex + 1,
          pendingExplanation: undefined,
        };
      });
      return;
    }

    let updatedPlayer = player;
    let sessionType: SessionSummary["sessionType"] = "review";
    let sessionLabel = "קרב חזרה";
    let passed: boolean | undefined = undefined;
    let requiredCorrect: number | undefined = undefined;
    let maxMistakesAllowed: number | undefined = undefined;

    if (battle.mode === "lesson") {
      const lesson = battle.lessonId ? getWorldLessonById(battle.lessonId) : null;
      const required = getLessonPassRequiredCorrect();
      const isPassed = correctAnswersCount >= required;

      requiredCorrect = required;
      passed = isPassed;
      sessionType = "lesson";
      sessionLabel = lesson ? `שיעור: ${lesson.title}` : "שיעור מושג";

      if (battle.lessonId) {
        updatedPlayer = upsertLessonProgress(
          updatedPlayer,
          battle.lessonId,
          correctAnswersCount,
          isPassed,
        );
      }
    } else if (battle.mode === "exam") {
      const allowed = battle.allowedMistakes ?? 5;
      const isPassed = mistakesCount <= allowed;

      maxMistakesAllowed = allowed;
      passed = isPassed;
      sessionType = "world_exam";
      sessionLabel =
        battle.examVariant === "luck"
          ? `נסה את מזלך - בוס עולם ${battle.worldId}`
          : `מבחן עולם ${battle.worldId}`;

      updatedPlayer = upsertWorldExamProgress(
        updatedPlayer,
        battle.worldId,
        correctAnswersCount,
        mistakesCount,
        isPassed,
      );

      if (isPassed) {
        const maxWorldId = worlds[worlds.length - 1]?.id ?? battle.worldId;
        const nextWorldId = Math.min(maxWorldId, battle.worldId + 1);
        const toUnlock =
          nextWorldId > battle.worldId
            ? [battle.worldId, nextWorldId]
            : [battle.worldId];
        updatedPlayer = {
          ...updatedPlayer,
          unlockedWorlds: Array.from(new Set([...updatedPlayer.unlockedWorlds, ...toUnlock])),
        };
      }
    }

    const finalized = finalizeSession({
      player: updatedPlayer,
      worldId: battle.worldId,
      answers: battle.answers,
      startedAtISO: battle.startedAtISO,
      sessionMeta: {
        sessionType,
        sessionLabel,
        passed,
        mistakesMade: mistakesCount,
        maxMistakesAllowed,
        requiredCorrect,
      },
    });

    setPlayer(finalized.player);
    setSummary(finalized.summary);
    setSelectedWorldId(battle.worldId);
    if (battle.mode !== "lesson") {
      setActiveLessonId(null);
    }
    setBattle(null);
    setScreen("summary");
  };

  const onSaveForReview = () => {
    if (!battle?.pendingExplanation || !player) {
      return;
    }

    const questionId = battle.pendingExplanation.question.id;
    setPlayer((currentPlayer) => {
      if (!currentPlayer) {
        return currentPlayer;
      }
      return {
        ...currentPlayer,
        reviewQueue: Array.from(new Set([questionId, ...currentPlayer.reviewQueue])),
      };
    });
  };

  const onTrySimilar = () => {
    if (!battle?.pendingExplanation || !battle) {
      return;
    }

    const topic = battle.pendingExplanation.question.topic;
    const candidate = getWorldQuestions(battle.worldId, false).find(
      (item) => item.topic === topic && item.id !== battle.pendingExplanation?.question.id,
    );

    if (!candidate) {
      return;
    }

    setBattle((currentBattle) => {
      if (!currentBattle) {
        return currentBattle;
      }

      const updated = [...currentBattle.questions];
      updated.splice(currentBattle.currentIndex + 1, 0, candidate);
      return {
        ...currentBattle,
        questions: updated,
      };
    });
  };

  const claimDailyReward = () => {
    if (!player) {
      return;
    }

    const today = getTodayDateKey();
    if (dailyClaimDate === today) {
      return;
    }

    setPlayer({
      ...player,
      xp: player.xp + 40,
      coins: player.coins + 25,
      streak: player.streak + 1,
      level: Math.max(1, Math.floor(Math.sqrt((player.xp + 40) / 120)) + 1),
    });
    setDailyClaimDate(today);
  };

  if (!player && screen === "welcome") {
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-3 py-8 sm:px-4 sm:py-12">
        <section className="card w-full max-w-xl rounded-3xl p-5 sm:p-7">
          <MixedText text="Swift Quest" as="p" className="text-xs uppercase tracking-[0.25em] text-sky" />
          <MixedText text="מסע לימוד קוד בסגנון RPG" as="h1" className="mt-2 text-3xl font-semibold text-fog" />
          <MixedText
            text="מהדורת MVP 1: עולם ראשון, קרבות קוד, ניסיון, מטבעות, מנגנון חזרה חכם והסבר מפורט אחרי כל טעות."
            as="p"
            className="mt-3 text-sm text-fog/80"
          />

          <label className="mt-6 block text-sm text-fog/90" htmlFor="nameInput">
            שם שחקן
          </label>
          <input
            id="nameInput"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            placeholder="למשל: אלוף Swift"
            className="mt-2 w-full rounded-xl px-3 py-2.5 text-fog outline-none transition"
          />

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              className="btn btn-primary"
              onClick={onNewGame}
              type="button"
            >
              משחק חדש
            </button>
            <button
              className="btn btn-ghost"
              onClick={onContinue}
              type="button"
              disabled
            >
              המשך
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (!player) {
    return null;
  }

  return (
    <main className="app-shell mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8">
      <header className="hero-header card mb-9 rounded-3xl p-4 sm:mb-10 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky">בסיס הבית</p>
            <MixedText text={player.username} as="h1" className="text-2xl font-semibold tracking-tight text-fog" />
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="stat-pill">רמה {player.level}</span>
            <span className="stat-pill">ניסיון {player.xp}</span>
            <span className="stat-pill">מטבעות {player.coins}</span>
            <span className="stat-pill">רצף {player.streak}</span>
          </div>
        </div>
        <div className="hero-header-top-bubble" aria-hidden="true" />
        <div className="hero-header-bubble" aria-hidden="true" />
      </header>

      {screen === "home" ? (
        <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <article className="card rounded-3xl p-6">
            <MixedText text="מרכז הפיקוד של Swift Quest" as="h2" className="text-xl font-semibold text-fog" />
            <MixedText
              text="לולאה מומלצת לסשן של 15-20 דקות: חזרה קצרה, שלב קרב, תגמול וסיכום."
              as="p"
              className="mt-2 text-sm text-fog/78"
            />

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                className="btn btn-primary"
                onClick={() => setScreen("world_map")}
                type="button"
              >
                עולמות
              </button>
              <button
                className="btn btn-warning"
                onClick={startReviewBattle}
                type="button"
              >
                <MixedText text="מצב חזרה (Review)" />
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setScreen("review")}
                type="button"
              >
                תור חזרה
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setScreen("stats")}
                type="button"
              >
                סטטיסטיקות
              </button>
              <button
                className="btn btn-success"
                onClick={() => setScreen("library")}
                type="button"
              >
                <MixedText text="ספריית Codex" />
              </button>
              <button
                className="btn btn-ghost"
                onClick={claimDailyReward}
                type="button"
              >
                בונוס התחברות יומי
              </button>
            </div>

            {summary ? (
              <div className="surface-block-accent mt-5 p-4">
                <p className="text-sm font-semibold text-sky">הסשן האחרון</p>
                <p className="mt-1 text-sm text-fog">
                  {summary.correctAnswers}/{summary.totalQuestions} נכונות | ניסיון +{summary.xpEarned} | מטבעות +{summary.coinsEarned}
                </p>
                <p className="mt-2 text-xs text-fog/80">זכור את קטע הקוד הזה:</p>
                <CodeSnippet code={summary.memorySnippet} language="swift" />
              </div>
            ) : null}
          </article>

          <aside className="space-y-4">
            <div className="card rounded-3xl p-5">
              <p className="text-sm font-semibold text-fog">נושאים חלשים כרגע</p>
              <ul className="mt-2 space-y-2 text-sm text-fog/90">
                {weakTopics.length === 0 ? <li>אין מספיק נתונים עדיין.</li> : null}
                {weakTopics.map((entry) => (
                  <li key={entry.topic} className="flex items-center justify-between">
                    <span>{entry.topic}</span>
                    <span className="text-amber">{formatPercent(entry.value)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card rounded-3xl p-5">
              <p className="text-sm font-semibold text-fog">תור חזרה</p>
              <p className="mt-1 text-2xl font-semibold text-sky">{player.reviewQueue.length}</p>
              <p className="mt-1 text-xs text-fog/75">שאלות שסומנו לחזרה חכמה.</p>
            </div>
          </aside>
        </section>
      ) : null}

      {screen === "world_map" ? (
        <section className="card rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-fog">מפת העולמות</h2>
            <button
              className="btn btn-ghost"
              onClick={() => setScreen("home")}
              type="button"
            >
              חזרה
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {worlds.map((world) => {
              const unlocked = isWorldUnlockedByCourse(player, world.id);
              const hasPlan = Boolean(getWorldCoursePlan(world.id));
              const hasBlueprint = Boolean(getWorldCourseBlueprint(world.id));
              const passedExam = hasPassedWorldExam(player, world.id);
              return (
                <article
                  key={world.id}
                  className={`rounded-xl border p-4 ${
                    unlocked
                      ? "surface-block-accent"
                      : "surface-block-muted opacity-65"
                  }`}
                >
                  <p className="text-xs uppercase tracking-widest text-fog/65">עולם {world.id}</p>
                  <MixedText text={world.name} as="h3" className="mt-1 text-lg font-semibold text-fog" />
                  <MixedText text={world.description} as="p" className="mt-1 text-sm text-fog/78" />

                  <div className="mt-3 flex flex-wrap gap-1 text-xs text-fog/75">
                    {world.topicCoverage.slice(0, 3).map((topic) => (
                      <span key={topic} className="tag-pill">
                        <MixedText text={topic} />
                      </span>
                    ))}
                  </div>

                  <button
                    className={`btn mt-4 w-full ${unlocked ? "btn-primary" : "btn-ghost"}`}
                    onClick={() => openWorldCourse(world.id)}
                    type="button"
                    disabled={!unlocked || (!hasPlan && !hasBlueprint)}
                  >
                    {passedExam
                      ? "כניסה לעולם (עבר מבחן)"
                      : hasPlan
                        ? unlocked
                          ? "כניסה למסלול הקורס"
                          : "נעול - עבר מבחן עולם קודם"
                        : hasBlueprint
                          ? "תוכנית לימוד זמינה (תוכן בבנייה)"
                          : "תוכן קורס בבנייה"}
                  </button>

                  {!unlocked && hasPlan ? (
                    <button
                      className="btn btn-warning mt-2 w-full"
                      onClick={() =>
                        startWorldExam(world.id, {
                          allowLocked: true,
                          allowWithoutLessons: true,
                          examVariant: "luck",
                        })
                      }
                      type="button"
                    >
                      נסה את מזלך
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {screen === "world_course" && selectedWorld ? (
        <section className="card rounded-3xl p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky">מסלול קורס</p>
              <MixedText text={`${selectedWorld.name}`} as="h2" className="mt-1 text-xl font-semibold text-fog" />
              <MixedText text={selectedWorld.description} as="p" className="mt-1 text-sm text-fog/85" />
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => setScreen("world_map")}
              type="button"
            >
              חזרה למפה
            </button>
          </div>

          {selectedWorldPlan ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="surface-block-accent p-3 text-sm">
                  <p className="text-fog/80">שיעורים שהושלמו</p>
                  <p className="text-xl font-semibold text-sky">
                    {selectedWorldLessonsPassedCount}/{selectedWorldLessons.length}
                  </p>
                </div>
                <div className="surface-block-success p-3 text-sm">
                  <p className="text-fog/80">מאגר שאלות עולם</p>
                  <p className="text-base font-semibold text-fog">
                    {selectedWorldQuestionCount} שאלות
                  </p>
                </div>
                <div className="surface-block-warning p-3 text-sm">
                  <p className="text-fog/80">כלל מעבר</p>
                  <p className="text-base font-semibold text-fog">30 שאלות, עד 5 טעויות</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {selectedWorldLessons.map((lesson) => {
                  const lessonProgress = player.lessonProgress[lesson.id];
                  const passed = Boolean(lessonProgress?.passed);
                  const unlocked = isLessonUnlocked(player, lesson);

                  return (
                    <article key={lesson.id} className="surface-block-muted rounded-2xl p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-sky">
                            שיעור {lesson.order} · {lesson.concept}
                          </p>
                          <MixedText text={lesson.title} as="h3" className="mt-1 text-lg font-semibold text-fog" />
                          <MixedText text={lesson.summary} as="p" className="mt-1 text-sm text-fog/85" />
                        </div>
                        <span className="tag-pill text-xs text-fog">
                          {passed ? "הושלם" : unlocked ? "זמין" : "נעול"}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-fog/80">
                        <span className="tag-pill">10 שאלות</span>
                        <span className="tag-pill">
                          מאגר: {lesson.questionPoolIds?.length ?? lesson.questionIds.length}
                        </span>
                        <span className="tag-pill">נדרש: {getLessonPassRequiredCorrect()}/10</span>
                        <span className="tag-pill">
                          שיא: {lessonProgress?.bestCorrect ?? 0}/10
                        </span>
                        <span className="tag-pill">ניסיונות: {lessonProgress?.attempts ?? 0}</span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          className="btn btn-primary"
                          onClick={() => openLessonIntro(lesson.id)}
                          type="button"
                          disabled={!unlocked}
                        >
                          פתח שיעור
                        </button>
                        <button
                          className="btn btn-accent"
                          onClick={() => startLessonQuiz(lesson.id)}
                          type="button"
                          disabled={!unlocked}
                        >
                          התחל 10 שאלות
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="surface-block-accent mt-4 rounded-2xl p-4">
                <p className="text-sm font-semibold text-sky">מבחן סיום עולם</p>
                <p className="mt-1 text-sm text-fog/90">
                  המבחן כולל 30 שאלות מכל המושגים בעולם. מותר לטעות עד 5 פעמים.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="btn btn-warning"
                    onClick={() => startWorldExam(selectedWorld.id)}
                    type="button"
                    disabled={!canStartWorldExam}
                  >
                    התחל מבחן עולם
                  </button>
                  {!canStartWorldExam ? (
                    <span className="tag-pill text-xs text-fog/90">קודם מסיימים את כל השיעורים</span>
                  ) : null}
                </div>
              </div>

              {hasPassedWorldExam(player, selectedWorld.id) && selectedMiniProject ? (
                <div className="surface-block-success mt-4 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-mint">מיני פרויקט אופציונלי</p>
                  <p className="mt-1 text-sm text-fog/90">
                    פרויקט קצר עם קונסולה: רק אם הפלט תואם בדיוק לדרישה, הפרויקט יעבור.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-fog/85">
                    <span className="tag-pill">
                      סטטוס: {selectedMiniProjectProgress?.passed ? "עבר" : "טרם עבר"}
                    </span>
                    <span className="tag-pill">
                      ניסיונות: {selectedMiniProjectProgress?.attempts ?? 0}
                    </span>
                    <span className="tag-pill">
                      בונוס ראשון: +{selectedMiniProject.rewardXP} XP, +{selectedMiniProject.rewardCoins} מטבעות
                    </span>
                  </div>
                  <div className="mt-3">
                    <button
                      className="btn btn-success"
                      onClick={() => openMiniProject(selectedWorld.id)}
                      type="button"
                    >
                      פתיחת מיני פרויקט
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : selectedWorldBlueprint ? (
            <div className="space-y-3">
              <div className="surface-block-muted rounded-2xl p-4 text-sm text-fog/88">
                <p className="font-semibold text-fog">תוכנית קורס לעולם הזה מוכנה.</p>
                <p className="mt-1">
                  כרגע בנק השאלות המלא עדיין בבנייה, אבל סדר הלימוד והלוגיקה כבר מוגדרים.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="surface-block-accent p-3 text-sm">
                  <p className="text-fog/80">עולם</p>
                  <p className="text-base font-semibold text-fog">
                    {selectedWorldBlueprint.worldId}. {selectedWorldBlueprint.title}
                  </p>
                </div>
                <div className="surface-block-muted p-3 text-sm">
                  <p className="text-fog/80">דרישת קדם</p>
                  <p className="text-base font-semibold text-fog">{selectedWorldBlueprint.prerequisite}</p>
                </div>
                <div className="surface-block-warning p-3 text-sm">
                  <p className="text-fog/80">חוק מבחן עולם</p>
                  <p className="text-base font-semibold text-fog">{selectedWorldBlueprint.examRule}</p>
                </div>
              </div>

              <div className="space-y-2">
                {selectedWorldBlueprint.lessons.map((lesson) => (
                  <article key={lesson.order} className="surface-block-muted rounded-2xl p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-sky">
                      שיעור {lesson.order} · {lesson.concept}
                    </p>
                    <p className="mt-1 text-sm text-fog">
                      <span className="font-semibold">מטרת למידה:</span> {lesson.goal}
                    </p>
                    <p className="mt-1 text-sm text-fog/86">
                      <span className="font-semibold">מיומנות לוגית:</span> {lesson.logicSkill}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="surface-block-muted rounded-2xl p-4 text-sm text-fog/85">
              מסלול הקורס לעולם הזה עדיין בבנייה.
            </div>
          )}
        </section>
      ) : null}

      {screen === "lesson_intro" && activeLesson ? (
        <section className="card rounded-3xl p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-sky">
                שיעור {activeLesson.order} · {activeLesson.concept}
              </p>
              <MixedText text={activeLesson.title} as="h2" className="mt-1 text-xl font-semibold text-fog" />
              <MixedText text={activeLesson.summary} as="p" className="mt-1 text-sm text-fog/85" />
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => setScreen("world_course")}
              type="button"
            >
              חזרה למסלול
            </button>
          </div>

          <div className="surface-block-accent rounded-2xl p-4 text-sm text-fog/95">
            <p className="font-semibold text-sky">הסבר מפורט על המושג</p>
            <MixedText text={activeLesson.deepDive} as="p" className="mt-2" />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <article className="surface-block-muted rounded-2xl p-4">
              <p className="text-sm font-semibold text-fog">מה חייבים לזכור</p>
              <ul className="mt-2 space-y-1 text-sm text-fog/85">
                {activeLesson.keyPoints.map((point) => (
                  <li key={point}>
                    <MixedText text={`• ${point}`} />
                  </li>
                ))}
              </ul>
            </article>

            <article className="surface-block-muted rounded-2xl p-4">
              <p className="text-sm font-semibold text-fog">שיטה לפתרון שאלות לוגיות</p>
              <ol className="mt-2 space-y-1 text-sm text-fog/85">
                {activeLesson.logicSteps.map((step, index) => (
                  <li key={step}>
                    <MixedText text={`${index + 1}. ${step}`} />
                  </li>
                ))}
              </ol>
            </article>
          </div>

          <div className="mt-4 space-y-3">
            {activeLesson.examples.map((example) => (
              <article key={example.title} className="surface-block-muted rounded-2xl p-4">
                <MixedText text={example.title} as="h3" className="text-sm font-semibold text-fog" />
                <div className="mt-2">
                  <CodeSnippet code={example.code} language="swift" />
                </div>
                <MixedText text={example.explanation} as="p" className="mt-2 text-sm text-fog/85" />
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className="btn btn-primary"
              onClick={() => startLessonQuiz(activeLesson.id)}
              type="button"
            >
              התחל 10 שאלות על המושג הזה
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setScreen("world_course")}
              type="button"
            >
              חזרה למסלול העולם
            </button>
          </div>
        </section>
      ) : null}

      {screen === "mini_project" && selectedWorld && selectedMiniProject ? (
        <section className="card rounded-3xl p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-mint">מיני פרויקט אופציונלי</p>
              <MixedText
                text={`${selectedMiniProject.title} · ${selectedWorld.name}`}
                as="h2"
                className="mt-1 text-xl font-semibold text-fog"
              />
              <MixedText text={selectedMiniProject.challenge} as="p" className="mt-1 text-sm text-fog/85" />
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => setScreen("world_course")}
              type="button"
            >
              חזרה למסלול
            </button>
          </div>

          <div className="surface-block-accent rounded-2xl p-4 text-sm text-fog/95">
            <p className="font-semibold text-sky">תנאי מעבר</p>
            <p className="mt-1">{selectedMiniProject.successCondition}</p>
            <p className="mt-2 text-xs text-fog/80">הפלט שנדרש:</p>
            <pre dir="ltr" className="console-output mt-1 whitespace-pre-wrap">{selectedMiniProject.expectedOutput}</pre>
          </div>

          <div className="surface-block-muted mt-4 rounded-2xl p-4">
            <p className="text-sm font-semibold text-fog">עורך קוד (Swift Console)</p>
            <textarea
              dir="ltr"
              value={miniProjectCode}
              onChange={(event) => setMiniProjectCode(event.target.value)}
              className="console-editor mt-2 min-h-[220px] w-full rounded-xl px-3 py-3 text-sm outline-none"
              spellCheck={false}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={runMiniProject} type="button">
                הרץ קוד ובדוק פלט
              </button>
              <button className="btn btn-ghost" onClick={resetMiniProjectCode} type="button">
                איפוס קוד
              </button>
              <button className="btn btn-accent" onClick={() => setScreen("world_course")} type="button">
                דלג (אופציונלי)
              </button>
            </div>
          </div>

          <div className="surface-block-muted mt-4 rounded-2xl p-4">
            <p className="text-sm font-semibold text-fog">קונסולה</p>
            <pre dir="ltr" className="console-output mt-2 whitespace-pre-wrap">
              {miniProjectOutput || "// עדיין אין פלט. לחץ על 'הרץ קוד ובדוק פלט'."}
            </pre>
            {miniProjectError ? (
              <div className="surface-block-danger mt-3 p-3 text-sm text-[#8f2430]">
                שגיאה: {miniProjectError}
              </div>
            ) : null}
            {miniProjectPassedNow || selectedMiniProjectProgress?.passed ? (
              <div className="surface-block-success mt-3 p-3 text-sm text-fog">
                הפרויקט עבר בהצלחה.
                {miniProjectPassedNow && !selectedMiniProjectProgress?.passed ? (
                  <span className="block text-xs">
                    בונוס: +{selectedMiniProject.rewardXP} XP, +{selectedMiniProject.rewardCoins} מטבעות.
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="mt-3 text-xs text-fog/80">
                טיפ: בדוק רווחים ושורות בפלט. ההשוואה היא מדויקת.
              </div>
            )}
          </div>

          <div className="surface-block-accent mt-4 rounded-2xl p-4 text-sm text-fog/95">
            <p className="font-semibold text-sky">רמזים</p>
            <ul className="mt-2 space-y-1">
              {selectedMiniProject.hints.map((hint) => (
                <li key={hint}>
                  <MixedText text={`• ${hint}`} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {screen === "battle" && battle && currentQuestion ? (
        <section className="space-y-4">
          <div className="card rounded-3xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <MixedText
                text={
                  battle.mode === "exam"
                    ? battle.examVariant === "luck"
                      ? "נסה את מזלך - בוס עולם"
                      : "מבחן עולם"
                    : battle.mode === "lesson"
                      ? "שיעור מושג"
                      : "קרב חזרה"
                }
                as="p"
                className="text-xs uppercase tracking-[0.18em] text-sky"
              />
              <MixedText
                text={`שאלה ${
                  battle.currentIndex + 1
                }/${battle.questions.length}`}
                as="p"
                className="text-fog/80"
              />
              <button
                className="btn btn-ghost !min-h-[2.2rem] px-3 py-1"
                onClick={() => {
                  setBattle(null);
                  setScreen("home");
                }}
                type="button"
              >
                יציאה
              </button>
            </div>
            {battle.mode === "exam" ? (
              <p className="mt-2 text-xs text-fog/85">
                טעויות עד עכשיו:{" "}
                {
                  battle.answers.filter(
                    ({ question, selectedIndex }) =>
                      selectedIndex !== question.correctAnswerIndex,
                  ).length
                }
                /{battle.allowedMistakes}
              </p>
            ) : null}
            <div className="mt-3">
              <div className="progress-track" aria-hidden="true">
                <div
                  className="progress-fill transition-all"
                  style={{
                    width: `${Math.round(((battle.currentIndex + 1) / battle.questions.length) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <article className="card rounded-3xl p-6">
            <MixedText
              text={`${currentQuestion.topic} · ${currentQuestion.difficulty}`}
              as="p"
              className="text-xs uppercase tracking-[0.18em] text-amber"
            />
            <MixedText
              text={currentQuestion.questionText}
              as="h2"
              className="mt-2 text-xl font-semibold leading-8 text-fog"
            />

            {currentLogicGuide ? (
              <div className="surface-block-accent mt-3 rounded-2xl p-3 text-sm text-fog/92">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky">
                  איך פותרים לוגית את השאלה הזו
                </p>
                <p className="mt-1 font-semibold text-fog">{currentLogicGuide.title}</p>
                <ol className="mt-2 space-y-1 text-sm">
                  {currentLogicGuide.steps.map((step, index) => (
                    <li key={step}>
                      <MixedText text={`${index + 1}. ${step}`} />
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-xs text-fog/80">
                  <MixedText text={`בדיקה מהירה: ${currentLogicGuide.quickCheck}`} />
                </p>
              </div>
            ) : null}

            {currentQuestion.codeSnippet ? (
              <div className="mt-4">
                <CodeSnippet
                  code={currentQuestion.codeSnippet}
                  language={currentQuestion.codeLanguage}
                />
              </div>
            ) : null}

            <div className="mt-4 grid gap-2">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={`${currentQuestion.id}-${option}`}
                  className="option-button text-sm text-fog"
                  onClick={() => onPickAnswer(index)}
                  type="button"
                  disabled={Boolean(battle.pendingExplanation)}
                >
                  {shouldRenderOptionAsCode(option, currentQuestion.format) ? (
                    <div className="space-y-1">
                      <span className="block text-xs font-semibold text-fog/70">{index + 1}.</span>
                      <InlineCodeSnippet code={option} />
                    </div>
                  ) : (
                    <MixedText text={`${index + 1}. ${option}`} />
                  )}
                </button>
              ))}
            </div>
          </article>

          {battle.pendingExplanation ? (
            <ExplanationModal
              open={Boolean(battle.pendingExplanation)}
              question={battle.pendingExplanation.question}
              selectedIndex={battle.pendingExplanation.selectedIndex}
              onAcknowledge={goToNextQuestion}
              onSaveForReview={onSaveForReview}
              onTrySimilar={onTrySimilar}
            />
          ) : null}
        </section>
      ) : null}

      {screen === "summary" && summary ? (
        <section className="card rounded-3xl p-6">
          {summary.sessionLabel ? (
            <p className="text-xs uppercase tracking-[0.18em] text-sky">{summary.sessionLabel}</p>
          ) : null}
          <h2 className="text-2xl font-semibold text-fog">סיכום סוף סשן</h2>
          <p className="mt-2 text-sm text-fog/85">
            פתרת {summary.totalQuestions} שאלות, מתוכן {summary.correctAnswers} נכונות.
          </p>
          {typeof summary.passed === "boolean" ? (
            <div
              className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
                summary.passed
                  ? "surface-block-success text-fog"
                  : "surface-block-danger text-[#8c2330]"
              }`}
            >
              {summary.passed
                ? "סטטוס: עבר בהצלחה."
                : "סטטוס: לא עבר. חזרה ממוקדת ואז ניסיון נוסף."}
              {summary.requiredCorrect ? (
                <span className="block text-xs">
                  נדרש: {summary.requiredCorrect} תשובות נכונות.
                </span>
              ) : null}
              {typeof summary.maxMistakesAllowed === "number" ? (
                <span className="block text-xs">
                  טעויות: {summary.mistakesMade}/{summary.maxMistakesAllowed}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="surface-block-accent p-3 text-sm">
              <p className="text-fog/80">ניסיון שנצבר</p>
              <p className="text-xl font-semibold text-sky">+{summary.xpEarned}</p>
            </div>
            <div className="surface-block-warning p-3 text-sm">
              <p className="text-fog/80">מטבעות שנצברו</p>
              <p className="text-xl font-semibold text-amber">+{summary.coinsEarned}</p>
            </div>
            <div className="surface-block-success p-3 text-sm">
              <p className="text-fog/80">נושאים חלשים</p>
              <MixedText
                text={summary.weakTopics.join(", ") || "אין כרגע"}
                as="p"
                className="text-sm text-fog"
              />
            </div>
          </div>

          <div className="surface-block-muted mt-4 p-3">
            <p className="text-sm font-semibold text-fog">קטע קוד לזכירה</p>
            <CodeSnippet code={summary.memorySnippet} language="swift" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {summary.sessionType === "lesson" || summary.sessionType === "world_exam" ? (
              <button
                className="btn btn-accent"
                onClick={() => setScreen("world_course")}
                type="button"
              >
                חזרה למסלול עולם
              </button>
            ) : null}
            {summary.sessionType === "world_exam" && summary.passed ? (
              <button
                className="btn btn-success"
                onClick={() => openMiniProject(summary.worldId)}
                type="button"
              >
                מיני פרויקט (אופציונלי)
              </button>
            ) : null}
            <button
              className="btn btn-primary"
              onClick={() => setScreen("home")}
              type="button"
            >
              חזרה לבית
            </button>
            <button
              className="btn btn-warning"
              onClick={startReviewBattle}
              type="button"
            >
              התחל חזרה
            </button>
          </div>
        </section>
      ) : null}

      {screen === "review" ? (
        <section className="card rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-fog">תור חזרה</h2>
            <button
              className="btn btn-ghost"
              onClick={() => setScreen("home")}
              type="button"
            >
              חזרה
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            <div className="surface-block-warning p-3 text-center">
              <p className="text-xs text-fog/80">חזרה בקרוב</p>
              <p className="text-xl font-semibold text-amber">{reviewStateCounts.review_soon}</p>
            </div>
            <div className="surface-block-accent p-3 text-center">
              <p className="text-xs text-fog/80">בלמידה</p>
              <p className="text-xl font-semibold text-sky">{reviewStateCounts.learning}</p>
            </div>
            <div className="surface-block-muted p-3 text-center">
              <p className="text-xs text-fog/80">חדש</p>
              <p className="text-xl font-semibold text-fog">{reviewStateCounts.new}</p>
            </div>
            <div className="surface-block-muted p-3 text-center">
              <p className="text-xs text-fog/80">חזרה מאוחרת</p>
              <p className="text-xl font-semibold text-fog">{reviewStateCounts.review_later}</p>
            </div>
            <div className="surface-block-success p-3 text-center">
              <p className="text-xs text-fog/80">בשליטה</p>
              <p className="text-xl font-semibold text-mint">{reviewStateCounts.mastered}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="btn btn-warning"
              onClick={startReviewBattle}
              type="button"
              disabled={reviewQuestions.length === 0}
            >
              התחל חזרה מהתור
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setScreen("stats")}
              type="button"
            >
              מעבר לסטטיסטיקות
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {reviewQuestions.length === 0 ? (
              <div className="surface-block-muted p-4 text-sm text-fog/85">
                אין כרגע שאלות בתור החזרה. ענה על קרבות או לחץ \"שמור לחזרה\" מתוך חלון ההסבר.
              </div>
            ) : null}

            {reviewQuestions.map((question) => {
              const state = getQuestionState(player, question);
              return (
                <article key={question.id} className="surface-block-muted p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <MixedText
                        text={`${question.topic} · ${question.difficulty}`}
                        as="p"
                        className="text-xs uppercase tracking-wide text-amber"
                      />
                      <MixedText
                        text={question.questionText}
                        as="h3"
                        className="mt-1 text-base font-semibold text-fog"
                      />
                    </div>
                    <span className="tag-pill text-xs text-fog/85">
                      {questionStateLabel(state)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="btn btn-accent"
                      onClick={() => startFocusedReview(question.id)}
                      type="button"
                    >
                      תרגול ממוקד
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => removeFromReviewQueue(question.id)}
                      type="button"
                    >
                      הסר מהתור
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {screen === "stats" ? (
        <section className="card rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-fog">לוח סטטיסטיקות</h2>
            <button
              className="btn btn-ghost"
              onClick={() => setScreen("home")}
              type="button"
            >
              חזרה
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="surface-block-accent p-3">
              <p className="text-xs text-fog/80">דיוק</p>
              <p className="text-2xl font-semibold text-sky">{statsSummary.accuracy}%</p>
            </div>
            <div className="surface-block-success p-3">
              <p className="text-xs text-fog/80">נכונות / ניסיונות</p>
              <p className="text-2xl font-semibold text-mint">
                {statsSummary.correct}/{statsSummary.attempts}
              </p>
            </div>
            <div className="surface-block-warning p-3">
              <p className="text-xs text-fog/80">סשנים</p>
              <p className="text-2xl font-semibold text-amber">{player.sessionHistory.length}</p>
            </div>
            <div className="surface-block-muted p-3">
              <p className="text-xs text-fog/80">שאלות בסשנים</p>
              <p className="text-2xl font-semibold text-fog">{statsSummary.totalSessionQuestions}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <article className="surface-block-muted p-4">
              <h3 className="text-base font-semibold text-fog">רמת שליטה לפי נושא</h3>
              <div className="mt-3 space-y-3">
                {masteryEntries.length === 0 ? (
                  <p className="text-sm text-fog/80">אין מספיק נתונים עדיין.</p>
                ) : null}
                {masteryEntries.map((entry) => (
                  <div key={entry.topic}>
                    <div className="mb-1 flex items-center justify-between text-sm text-fog/90">
                      <MixedText text={entry.topic} />
                      <span>{entry.value}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill transition-all"
                        style={{ width: `${entry.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="surface-block-muted p-4">
              <h3 className="text-base font-semibold text-fog">סשנים אחרונים</h3>
              <div className="mt-3 space-y-2">
                {player.sessionHistory.length === 0 ? (
                  <p className="text-sm text-fog/80">אין סשנים קודמים עדיין.</p>
                ) : null}
                {player.sessionHistory.slice(0, 6).map((session) => (
                  <div
                    key={session.id}
                    className="surface-block p-3 text-sm"
                  >
                    <p className="text-fog/90">
                      {formatSessionDate(session.endedAtISO)} · עולם {session.worldId}
                    </p>
                    <p className="mt-1 text-fog/75">
                      {session.correctAnswers}/{session.totalQuestions} נכונות · +{session.xpEarned} ניסיון · +{session.coinsEarned} מטבעות
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {screen === "library" ? (
        <section className="card rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <MixedText text="ספריית Codex" as="h2" className="text-xl font-semibold text-fog" />
            <button
              className="btn btn-ghost"
              onClick={() => setScreen("home")}
              type="button"
            >
              חזרה
            </button>
          </div>

          <div className="space-y-4">
            {codexLibrary.map((topic) => (
              <article key={topic.id} className="surface-block-muted p-4">
                <MixedText text={topic.title} as="h3" className="text-lg font-semibold text-fog" />
                <MixedText text={topic.summary} as="p" className="mt-1 text-sm text-fog/85" />

                <div className="mt-3">
                  <p className="mb-1 text-xs uppercase tracking-wide text-amber">טעויות נפוצות</p>
                  <ul className="space-y-1 text-sm text-fog/80">
                    {topic.commonMistakes.map((mistake) => (
                      <li key={mistake}>
                        <MixedText text={`- ${mistake}`} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3">
                  <CodeSnippet code={topic.snippet} language="swift" />
                </div>

                <MixedText
                  text={`קשור לנושאים: ${topic.related.join(" • ")}`}
                  as="p"
                  className="mt-3 text-xs text-fog/70"
                />
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
