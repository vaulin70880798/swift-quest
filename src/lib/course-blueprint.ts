export interface BlueprintLesson {
  order: number;
  concept: string;
  goal: string;
  logicSkill: string;
}

export interface WorldCourseBlueprint {
  worldId: number;
  title: string;
  prerequisite: string;
  lessons: BlueprintLesson[];
  examRule: string;
}

const worldCourseBlueprints: Record<number, WorldCourseBlueprint> = {
  1: {
    worldId: 1,
    title: "Syntax Fields",
    prerequisite: "ללא דרישה מוקדמת",
    examRule: "30 שאלות, עד 5 טעויות.",
    lessons: [
      { order: 1, concept: "let / var / type safety", goal: "הגדרת משתנים נכונה", logicSkill: "זיהוי טיפוס ותאימות ערך" },
      { order: 2, concept: "operators / Bool conditions", goal: "פירוק תנאים נכון", logicSkill: "חישוב תתי-ביטויים לוגיים" },
      { order: 3, concept: "String / print / interpolation", goal: "פלט מדויק וקריא", logicSkill: "ניבוי output שורה-אחר-שורה" },
      { order: 4, concept: "debug thinking", goal: "איתור טעויות בסיס", logicSkill: "פסילת אופציות שיטתית" },
    ],
  },
  2: {
    worldId: 2,
    title: "Optional Caverns",
    prerequisite: "מעבר עולם 1",
    examRule: "30 שאלות, עד 5 טעויות.",
    lessons: [
      { order: 1, concept: "Optional / nil", goal: "הבנת ערך שיכול להיות ריק", logicSkill: "מעקב מצב ערך קיים/ריק" },
      { order: 2, concept: "if let / guard let", goal: "פתיחה בטוחה של Optional", logicSkill: "ניתוח נתיבי זרימה" },
      { order: 3, concept: "optional chaining / ??", goal: "גישה בטוחה עם fallback", logicSkill: "בחירת fallback נכון לפי context" },
      { order: 4, concept: "force unwrap risk", goal: "הימנעות מקריסות", logicSkill: "זיהוי מסלולי קריסה אפשריים" },
    ],
  },
  3: {
    worldId: 3,
    title: "Function Forest",
    prerequisite: "מעבר עולם 2",
    examRule: "30 שאלות, עד 5 טעויות.",
    lessons: [
      { order: 1, concept: "func / parameters / return", goal: "כתיבת פונקציות בסיס", logicSkill: "מיפוי input ל-output" },
      { order: 2, concept: "argument labels / defaults", goal: "קריאות API נכונה", logicSkill: "התאמת חתימה לקריאה" },
      { order: 3, concept: "scope / inout", goal: "שליטה על שינוי ערכים", logicSkill: "זיהוי היכן ערך מתעדכן באמת" },
      { order: 4, concept: "overloading", goal: "בחירת פונקציה נכונה", logicSkill: "resolve לפי טיפוסים" },
    ],
  },
  4: {
    worldId: 4,
    title: "Flow Canyon",
    prerequisite: "מעבר עולם 3",
    examRule: "30 שאלות, עד 5 טעויות.",
    lessons: [
      { order: 1, concept: "if / else / switch", goal: "branching מדויק", logicSkill: "הערכת תנאים בסדר נכון" },
      { order: 2, concept: "for-in / while / repeat-while", goal: "לולאות יציבות", logicSkill: "מעקב iterations" },
      { order: 3, concept: "break / continue", goal: "שליטה בזרימת לולאה", logicSkill: "זיהוי השפעת יציאה/דילוג" },
      { order: 4, concept: "nested flow", goal: "שילוב תנאים ולולאות", logicSkill: "trace מורכב בלי להריץ קוד" },
    ],
  },
  5: {
    worldId: 5,
    title: "Collections Kingdom",
    prerequisite: "מעבר עולם 4",
    examRule: "30 שאלות, עד 5 טעויות.",
    lessons: [
      { order: 1, concept: "Array basics", goal: "גישה ועדכון מערכים", logicSkill: "מעקב אינדקסים" },
      { order: 2, concept: "Dictionary / Set", goal: "בחירת מבנה נתונים נכון", logicSkill: "השוואת tradeoffs" },
      { order: 3, concept: "contains / append / remove", goal: "ניהול אוספים", logicSkill: "חיזוי מצב אוסף אחרי פעולות" },
      { order: 4, concept: "map / filter basics", goal: "טרנספורמציה וסינון", logicSkill: "ניבוי תוצאת pipeline" },
    ],
  },
  6: {
    worldId: 6,
    title: "Struct City",
    prerequisite: "מעבר עולם 5",
    examRule: "30 שאלות, עד 5 טעויות.",
    lessons: [
      { order: 1, concept: "struct / properties", goal: "מודל נתונים נקי", logicSkill: "הבחנה בין stored/computed" },
      { order: 2, concept: "methods / mutating", goal: "שינוי state נכון", logicSkill: "זיהוי האם יש שינוי עצמי" },
      { order: 3, concept: "init", goal: "אתחול עקבי ובטוח", logicSkill: "בדיקת כל שדות החובה" },
      { order: 4, concept: "property observers", goal: "תגובה לשינוי ערך", logicSkill: "הבנת before/after" },
    ],
  },
  7: {
    worldId: 7,
    title: "Class Citadel",
    prerequisite: "מעבר עולם 6",
    examRule: "30 שאלות, עד 5 טעויות.",
    lessons: [
      { order: 1, concept: "class / reference type", goal: "הבנת reference semantics", logicSkill: "מעקב זהות אובייקטים" },
      { order: 2, concept: "inheritance / override", goal: "ירושה ושכתוב מתודות", logicSkill: "בחירת מימוש בזמן ריצה" },
      { order: 3, concept: "final / identity", goal: "מניעת ירושה לא רצויה", logicSkill: "השוואת == מול ===" },
      { order: 4, concept: "deinit", goal: "מחזור חיים של אובייקט", logicSkill: "ניתוח שחרור זיכרון לוגי" },
    ],
  },
  8: {
    worldId: 8,
    title: "Protocol Temple",
    prerequisite: "מעבר עולם 7",
    examRule: "30 שאלות, עד 5 טעויות.",
    lessons: [
      { order: 1, concept: "protocol / conformance", goal: "חוזים ברורים לקוד", logicSkill: "בדיקת התאמה לדרישות" },
      { order: 2, concept: "extension", goal: "הרחבה נקייה של טיפוסים", logicSkill: "הפרדה בין מודל להתנהגות" },
      { order: 3, concept: "protocol-oriented basics", goal: "הרכבה מבוססת פרוטוקולים", logicSkill: "בחירת abstraction נכונה" },
      { order: 4, concept: "real API design", goal: "עיצוב API ברור", logicSkill: "הסקת חוזה ממקרי שימוש" },
    ],
  },
  9: {
    worldId: 9,
    title: "Closure Tower",
    prerequisite: "מעבר עולם 8",
    examRule: "30 שאלות, עד 5 טעויות.",
    lessons: [
      { order: 1, concept: "closures syntax", goal: "כתיבת closure קריא", logicSkill: "קריאת סוגריים ונפח ארגומנטים" },
      { order: 2, concept: "trailing / shorthand", goal: "תחביר מקוצר נכון", logicSkill: "פענוח `$0` וחתימות" },
      { order: 3, concept: "capture", goal: "הבנת לכידת ערכים", logicSkill: "מעקב scope ו-lifecycle" },
      { order: 4, concept: "completion handlers", goal: "עבודה עם callbacks", logicSkill: "סדר אירועים אסינכרוני" },
    ],
  },
  10: {
    worldId: 10,
    title: "Error & Async Sea",
    prerequisite: "מעבר עולם 9",
    examRule: "30 שאלות, עד 5 טעויות.",
    lessons: [
      { order: 1, concept: "throw / do-catch", goal: "טיפול שגיאות נכון", logicSkill: "ניתוח נתיבי הצלחה/שגיאה" },
      { order: 2, concept: "try / try? / try!", goal: "בחירת אסטרטגיית try", logicSkill: "הערכת סיכון קריסה" },
      { order: 3, concept: "Result basics", goal: "מודל תוצאה מפורש", logicSkill: "פירוק success/failure" },
      { order: 4, concept: "async/await / Task / MainActor", goal: "זרימה אסינכרונית בטוחה", logicSkill: "מעקב context ו-thread" },
    ],
  },
  11: {
    worldId: 11,
    title: "SwiftUI City",
    prerequisite: "מעבר עולם 10",
    examRule: "30 שאלות, עד 5 טעויות.",
    lessons: [
      { order: 1, concept: "View / Text / stacks", goal: "בניית layout נקי", logicSkill: "פירוק היררכיית UI" },
      { order: 2, concept: "modifiers / images / buttons", goal: "עיצוב והתנהגות", logicSkill: "סדר modifiers והשפעה" },
      { order: 3, concept: "List / NavigationStack", goal: "ניווט ותצוגת נתונים", logicSkill: "מיפוי state למסכים" },
      { order: 4, concept: "sheet / alert", goal: "מצבי הצגה", logicSkill: "ניהול תנאי הצגה מדויק" },
    ],
  },
  12: {
    worldId: 12,
    title: "State & Architecture Arena",
    prerequisite: "מעבר עולם 11",
    examRule: "30 שאלות, עד 5 טעויות.",
    lessons: [
      { order: 1, concept: "@State / @Binding", goal: "בעלות על state", logicSkill: "מי מחזיק state ומי רק צורך" },
      { order: 2, concept: "@ObservedObject / @StateObject", goal: "ניהול מודל תצפיתי", logicSkill: "lifecycle נכון לאובייקט" },
      { order: 3, concept: "@EnvironmentObject", goal: "הזרקת תלויות רוחבית", logicSkill: "debug של מקור נתון" },
      { order: 4, concept: "mini architecture scenarios", goal: "קבלת החלטות ארכיטקטורה", logicSkill: "tradeoff reasoning בסצנות אמת" },
    ],
  },
};

export function getWorldCourseBlueprint(worldId: number): WorldCourseBlueprint | null {
  return worldCourseBlueprints[worldId] ?? null;
}

