import { worlds } from "@/lib/curriculum";
import { questionBank } from "@/lib/questions";
import { Player, Question } from "@/lib/types";

export interface LessonExample {
  title: string;
  code: string;
  explanation: string;
}

export interface WorldLesson {
  id: string;
  worldId: number;
  order: number;
  title: string;
  concept: string;
  summary: string;
  deepDive: string;
  keyPoints: string[];
  logicSteps: string[];
  examples: LessonExample[];
  questionIds: string[];
  questionPoolIds?: string[];
}

export interface WorldExamConfig {
  questionCount: number;
  maxMistakes: number;
}

export interface WorldCoursePlan {
  worldId: number;
  title: string;
  lessons: WorldLesson[];
  exam: WorldExamConfig;
}

const LESSON_PASS_REQUIRED_CORRECT = 8;

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = cloned[index];
    cloned[index] = cloned[swapIndex];
    cloned[swapIndex] = temp;
  }
  return cloned;
}

const world1Lessons: WorldLesson[] = [
  {
    id: "w1-lesson-1",
    worldId: 1,
    order: 1,
    title: "משתנים וטיפוסים",
    concept: "let / var / Type Safety",
    summary: "איך מחזיקים מידע בצורה בטוחה, ואיך Swift מונע באגים של טיפוסים.",
    deepDive:
      "בשיעור הזה אתה בונה את הבסיס לכל קוד Swift: מה קבוע ומה משתנה, ואיך התאמת טיפוסים מגינה עליך משגיאות.",
    keyPoints: [
      "let = ערך קבוע, var = ערך ניתן לשינוי.",
      "Type Safety: הערך חייב להתאים לטיפוס שהגדרת.",
      "שגיאות טיפוס הן לא כישלון, הן הגנה שמונעת באג ריצה.",
    ],
    logicSteps: [
      "זהה מה הערך בשורה נתונה ומה הטיפוס שלו.",
      "בדוק האם יש שינוי ערך לקבוע (let) או אי התאמת טיפוסים.",
      "אם יש חיבור או השוואה, ודא ששני הצדדים תואמים לוגית וטיפוסית.",
    ],
    examples: [
      {
        title: "let מול var",
        code: `let lives = 3\nvar score = 10\nscore += 5`,
        explanation:
          "`lives` נשאר קבוע לכל אורך הקוד, אבל `score` משתנה ולכן הוא מוגדר עם `var`.",
      },
      {
        title: "Type mismatch",
        code: `let age: Int = 20\n// let age: Int = \"20\"`,
        explanation:
          "השורה הראשונה תקינה. השורה המודגמת בהערה לא תקינה כי `\"20\"` הוא `String` ולא `Int`.",
      },
    ],
    questionIds: ["w1-q1", "w1-q4", "w1-q8", "w1-q11", "w1-q21", "w1-q24", "w1-q27", "w1-q29", "w1-q30", "w1-q33"],
  },
  {
    id: "w1-lesson-2",
    worldId: 1,
    order: 2,
    title: "אופרטורים ולוגיקה",
    concept: "Operators / Conditions / Bool Reasoning",
    summary: "איך מפרקים תנאי לוגי נכון, ואיך פותרים שאלות הגיון בקוד.",
    deepDive:
      "רוב השגיאות הלוגיות מגיעות מקריאה מהירה מדי של תנאים. כאן אתה לומד לפרק תנאי צעד-אחר-צעד ולהגיע לתשובה מדויקת.",
    keyPoints: [
      "הבדל קריטי בין `=` (השמה) ל-`==` (השוואה).",
      "`&&` דורש ששני תנאים יהיו `true`, ואילו `||` דורש לפחות אחד.",
      "סדר פעולות חשבוני ולוגי משפיע על הפלט.",
    ],
    logicSteps: [
      "חשב כל תת-ביטוי בנפרד (למשל `x > y`).",
      "המר תוצאות ביניים לערכי Bool ברורים: true/false.",
      "רק בסוף חבר עם `&&` או `||` וקבע תוצאה.",
    ],
    examples: [
      {
        title: "פירוק AND",
        code: `let hasTicket = true\nlet hasID = false\nprint(hasTicket && hasID)`,
        explanation:
          "תנאי ראשון true, תנאי שני false, ולכן true && false מחזיר false.",
      },
      {
        title: "השמה לעומת השוואה",
        code: `let hp = 10\nprint(hp == 10)`,
        explanation:
          "זו השוואה חוקית שמחזירה `true`. אם היינו כותבים `hp = 10` בתוך תנאי, זו הייתה שגיאה.",
      },
    ],
    questionIds: ["w1-q3", "w1-q10", "w1-q12", "w1-q17", "w1-q18", "w1-q19", "w1-q20", "w1-q31", "w1-q35", "w1-q38"],
  },
  {
    id: "w1-lesson-3",
    worldId: 1,
    order: 3,
    title: "מחרוזות ופלט",
    concept: "String / Interpolation / print / comments",
    summary: "איך כותבים פלט ברור ונכון, ואיך בונים מחרוזות בדרך Swift-ית.",
    deepDive:
      "השיעור הזה ממקד אותך בקריאות קוד ודיוק בפלט. אתה לומד להשתמש ב-`print` וב-`interpolation` בצורה יציבה, בלי טריקים שגויים.",
    keyPoints: [
      "`\\(value)` הוא הדרך הנכונה לשלב ערכים בתוך String.",
      "`print` מקבל expression, לא רק טקסט קבוע.",
      "comments מסבירות קוד ולא משפיעות על הרצה.",
    ],
    logicSteps: [
      "זהה האם הקוד מדפיס ערך מחושב או טקסט מילולי.",
      "אם יש String + Int, בדוק אם נעשתה המרה או interpolation.",
      "כאשר יש כמה שורות, עקוב אחרי הערך האחרון לפני print.",
    ],
    examples: [
      {
        title: "Interpolation תקין",
        code: `let name = "Dana"\nlet level = 4\nprint("\\(name) reached level \\(level)")`,
        explanation:
          "הפלט יהיה: Dana reached level 4. Swift משלב את הערכים בתוך המחרוזת.",
      },
      {
        title: "print עם ביטוי",
        code: `let a = 4\nlet b = 5\nprint(a + b)`,
        explanation:
          "`print` מחשב קודם את הביטוי (`9`) ורק אז מדפיס.",
      },
    ],
    questionIds: ["w1-q2", "w1-q5", "w1-q6", "w1-q13", "w1-q15", "w1-q16", "w1-q22", "w1-q23", "w1-q25", "w1-q26"],
  },
  {
    id: "w1-lesson-4",
    worldId: 1,
    order: 4,
    title: "חשיבה לוגית בשאלות קוד",
    concept: "Code Comparison / Refactor / Debug Thinking",
    summary: "איך עונים נכון על שאלות היגיון מורכבות יותר, גם בלי להריץ קוד.",
    deepDive:
      "כאן אתה מתרגל את מיומנות הליבה של מפתח: reasoning. לא רק 'מה התחביר', אלא למה פתרון אחד נקי, בטוח ונכון יותר מאחרים.",
    keyPoints: [
      "בשאלות השוואה: קודם מזהים מה משותף, ורק אז מה שונה.",
      "ב-refactor מחפשים קריאות, פשטות ומניעת באגים עתידיים.",
      "debug נכון מתחיל בהשערה ואז אימות שיטתי של כל אפשרות.",
    ],
    logicSteps: [
      "קרא את השאלה כמו spec: מה בדיוק מבקשים לבדוק.",
      "פסול אופציות אחת-אחת לפי כלל קונקרטי (טיפוס, תחביר, לוגיקה).",
      "בחר תשובה רק אחרי שאתה יכול להסביר למה כל האחרות שגויות.",
    ],
    examples: [
      {
        title: "השוואת קטעים A/B",
        code: `A) let lives = 3\nB) var lives = 3`,
        explanation:
          "ההבדל האמיתי: mutable vs immutable. לא סוג אחר, לא ביצועים.",
      },
      {
        title: "Refactor קצר",
        code: `let user = "Eli"\nlet text = "Hello " + user\nprint(text)\n// עדיף:\nprint("Hello \\(user)")`,
        explanation:
          "ה-refactor מפשט את הקוד, מוריד משתנה ביניים מיותר ושומר על קריאות גבוהה.",
      },
    ],
    questionIds: ["w1-q7", "w1-q9", "w1-q14", "w1-q28", "w1-q32", "w1-q34", "w1-q36", "w1-q37", "w1-q39", "w1-q40"],
  },
];

function chunkTopics(topics: string[], chunkCount: number): string[][] {
  const safeChunkCount = Math.max(1, chunkCount);
  const chunks: string[][] = Array.from({ length: safeChunkCount }, () => []);
  for (let index = 0; index < topics.length; index += 1) {
    chunks[index % safeChunkCount].push(topics[index]);
  }
  return chunks;
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}

function topicMatchesQuestion(question: Question, topic: string): boolean {
  const token = normalizeToken(topic);
  const bag = [
    question.topic,
    question.subtopic,
    ...question.tags,
    question.questionText,
  ]
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, "");

  return bag.includes(token);
}

function pickLessonPool(worldId: number, topics: string[], maxItems = 25): string[] {
  const candidates = questionBank.filter((question) => {
    if (question.worldId !== worldId || question.difficulty === "boss") {
      return false;
    }

    return topics.some((topic) => topicMatchesQuestion(question, topic));
  });

  const fallback = questionBank.filter(
    (question) => question.worldId === worldId && question.difficulty !== "boss",
  );
  const pool = candidates.length > 0 ? candidates : fallback;

  return pool.slice(0, maxItems).map((question) => question.id);
}

interface ExampleSource {
  topic: string;
  explanation: string;
  codeSnippet?: string;
}

function buildExampleFromQuestion(question: ExampleSource, defaultTitle: string): LessonExample {
  return {
    title: defaultTitle,
    code: question.codeSnippet ?? `// ${question.topic}\nprint("Swift Quest")`,
    explanation: question.explanation,
  };
}

function buildAutoWorldLessons(worldId: number): WorldLesson[] {
  const world = worlds.find((item) => item.id === worldId);
  if (!world) {
    return [];
  }

  const topicChunks = chunkTopics(world.topicCoverage, 4);

  return topicChunks.map((topics, lessonIndex) => {
    const order = lessonIndex + 1;
    const lessonId = `w${worldId}-lesson-${order}`;
    const concept = topics.join(" / ");
    const poolIds = pickLessonPool(worldId, topics, 25);
    const fixedIds = poolIds.slice(0, 10);

    const poolQuestions = poolIds
      .map((id) => questionBank.find((question) => question.id === id))
      .filter((question): question is Question => Boolean(question));

    const firstExample = buildExampleFromQuestion(
      poolQuestions[0] ??
        {
          topic: topics[0] ?? "Swift",
          explanation: "דוגמה בסיסית לנושא.",
          codeSnippet: `// ${topics[0] ?? "Swift"}\nprint("learning")`,
        },
      "דוגמה 1",
    );

    const secondExample = buildExampleFromQuestion(
      poolQuestions[1] ??
        {
          topic: topics[1] ?? topics[0] ?? "Swift",
          explanation: "דוגמה נוספת מזווית אחרת.",
          codeSnippet: `// ${topics[1] ?? topics[0] ?? "Swift"}\nprint("practice")`,
        },
      "דוגמה 2",
    );

    return {
      id: lessonId,
      worldId,
      order,
      title: `שיעור ${order} - ${world.name}`,
      concept,
      summary: `שיעור ממוקד בנושאים: ${concept}.`,
      deepDive:
        `בשיעור הזה לומדים את ${concept} לעומק, כולל דוגמאות קוד, פירוק לוגי, ונקודות שגיאה נפוצות.`,
      keyPoints: [
        `הבנה מעשית של: ${concept}.`,
        "קריאת קוד שורה-אחר-שורה לפני בחירת תשובה.",
        "זיהוי טעויות תחביר/טיפוסים/לוגיקה בצורה שיטתית.",
      ],
      logicSteps: [
        "זהה מה בדיוק השאלה מבקשת לבדוק.",
        "פרק את הקוד לערכי ביניים קטנים וברורים.",
        "פסול אופציות לא נכונות לפי כלל קונקרטי, לא לפי תחושה.",
      ],
      examples: [firstExample, secondExample],
      questionIds: fixedIds,
      questionPoolIds: poolIds,
    };
  });
}

function enrichManualLessonPools(lessons: WorldLesson[]): WorldLesson[] {
  return lessons.map((lesson) => {
    const seedTopics = lesson.questionIds
      .map((id) => questionBank.find((question) => question.id === id))
      .filter((question): question is Question => Boolean(question))
      .flatMap((question) => [question.topic, question.subtopic]);

    const uniqueTopics = Array.from(new Set(seedTopics.filter(Boolean)));
    const poolIds = pickLessonPool(lesson.worldId, uniqueTopics, 25);

    return {
      ...lesson,
      questionPoolIds: poolIds.length > 0 ? poolIds : lesson.questionIds,
    };
  });
}

const world1LessonsWithPools = enrichManualLessonPools(world1Lessons);

const worldCoursePlans: Record<number, WorldCoursePlan> = {
  1: {
    worldId: 1,
    title: "קורס יסודות Swift - עולם 1",
    lessons: world1LessonsWithPools,
    exam: {
      questionCount: 30,
      maxMistakes: 5,
    },
  },
};

for (const world of worlds) {
  if (worldCoursePlans[world.id]) {
    continue;
  }

  worldCoursePlans[world.id] = {
    worldId: world.id,
    title: `קורס ${world.name}`,
    lessons: buildAutoWorldLessons(world.id),
    exam: {
      questionCount: 30,
      maxMistakes: 5,
    },
  };
}

export function getLessonPassRequiredCorrect(): number {
  return LESSON_PASS_REQUIRED_CORRECT;
}

export function getWorldCoursePlan(worldId: number): WorldCoursePlan | null {
  return worldCoursePlans[worldId] ?? null;
}

export function getWorldLessons(worldId: number): WorldLesson[] {
  return getWorldCoursePlan(worldId)?.lessons ?? [];
}

export function getWorldLessonById(lessonId: string): WorldLesson | null {
  for (const plan of Object.values(worldCoursePlans)) {
    const lesson = plan.lessons.find((item) => item.id === lessonId);
    if (lesson) {
      return lesson;
    }
  }
  return null;
}

export function getLessonQuestions(lessonId: string): Question[] {
  const lesson = getWorldLessonById(lessonId);
  if (!lesson) {
    return [];
  }

  const sourceIds = lesson.questionPoolIds?.length
    ? lesson.questionPoolIds
    : lesson.questionIds;

  const pool = sourceIds
    .map((id) => questionBank.find((question) => question.id === id))
    .filter((question): question is Question => Boolean(question));

  return shuffle(pool).slice(0, 10);
}

export function getWorldExamQuestions(worldId: number): Question[] {
  const plan = getWorldCoursePlan(worldId);
  if (!plan) {
    return [];
  }

  const lessonQuestionIds = plan.lessons.flatMap((lesson) =>
    lesson.questionPoolIds?.length ? lesson.questionPoolIds : lesson.questionIds,
  );
  const uniqueIds = Array.from(new Set(lessonQuestionIds));
  const pool = uniqueIds
    .map((id) => questionBank.find((question) => question.id === id))
    .filter((question): question is Question => Boolean(question));

  return shuffle(pool).slice(0, plan.exam.questionCount);
}

export function hasPassedLesson(player: Player, lessonId: string): boolean {
  return Boolean(player.lessonProgress[lessonId]?.passed);
}

export function isLessonUnlocked(player: Player, lesson: WorldLesson): boolean {
  if (lesson.order === 1) {
    return true;
  }

  const previousLesson = getWorldLessons(lesson.worldId).find(
    (item) => item.order === lesson.order - 1,
  );
  if (!previousLesson) {
    return true;
  }
  return hasPassedLesson(player, previousLesson.id);
}

export function areAllWorldLessonsPassed(player: Player, worldId: number): boolean {
  const lessons = getWorldLessons(worldId);
  if (lessons.length === 0) {
    return false;
  }
  return lessons.every((lesson) => hasPassedLesson(player, lesson.id));
}

export function hasPassedWorldExam(player: Player, worldId: number): boolean {
  return Boolean(player.worldExamProgress[worldId]?.passed);
}

export function isWorldUnlockedByCourse(player: Player, worldId: number): boolean {
  if (worldId === 1) {
    return true;
  }
  if (hasPassedWorldExam(player, worldId)) {
    return true;
  }
  if (player.unlockedWorlds.includes(worldId)) {
    return true;
  }
  return hasPassedWorldExam(player, worldId - 1);
}
