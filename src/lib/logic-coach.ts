import { Question } from "@/lib/types";

export interface LogicCoachGuide {
  title: string;
  steps: string[];
  quickCheck: string;
}

function formatGuide(question: Question): LogicCoachGuide {
  switch (question.format) {
    case "output_prediction":
      return {
        title: "ניבוי פלט בצורה לוגית",
        steps: [
          "קוראים את הקוד מלמעלה למטה, בלי לדלג על שורות.",
          "עוקבים אחרי הערך האחרון של כל משתנה לפני `print`.",
          "מחשבים כל ביטוי לפי סדר פעולות, ואז משווים לאפשרויות.",
        ],
        quickCheck: "לפני בחירה סופית: שאל את עצמך מה יודפס בדיוק תו-בתו.",
      };
    case "choose_correct_code":
      return {
        title: "בחירת קוד נכון",
        steps: [
          "פוסלים קודם תחביר לא חוקי (למשל סוגריים, `:`, `=`/`==`).",
          "בודקים התאמת טיפוסים ו-mutability (`let` מול `var`).",
          "רק בסוף משווים איזו אופציה באמת עונה על הדרישה בשאלה.",
        ],
        quickCheck: "אם שתי אופציות נראות דומות, חפש את הכלל הדק שמבדיל ביניהן.",
      };
    case "find_bug":
      return {
        title: "איתור באג בקוד",
        steps: [
          "מאתרים את השורה הראשונה שעלולה לשבור קומפילציה או לוגיקה.",
          "מגדירים את סוג הבאג: תחביר / טיפוס / לוגיקה.",
          "בודקים אילו תיקונים משנים מינימום קוד ועדיין פותרים את הבעיה.",
        ],
        quickCheck: "באג טוב לפתרון הוא התיקון הכי קטן שמחזיר קוד תקין.",
      };
    case "complete_code":
      return {
        title: "השלמת קוד חסר",
        steps: [
          "מזהים מה התפקיד של השורה החסרה בתוך הרצף.",
          "בודקים אילו שמות משתנים וטיפוסים כבר קיימים בהקשר.",
          "בוחרים השלמה ששומרת על תחביר תקין וגם על המשמעות.",
        ],
        quickCheck: "השורה הנכונה חייבת להיות גם חוקית וגם עקבית עם מה שכבר נכתב.",
      };
    case "code_comparison":
      return {
        title: "השוואת קטעי קוד",
        steps: [
          "מוצאים קודם מה משותף לשני הקטעים.",
          "מבודדים שורה/אופרטור אחד שהוא ההבדל האמיתי.",
          "מסבירים את ההבדל במונח מדויק: mutability, type, output או behavior.",
        ],
        quickCheck: "הסבר טוב אומר למה A נכון/שונה וגם למה B לא.",
      };
    case "mini_refactor":
      return {
        title: "Refactor בצורה נכונה",
        steps: [
          "שומרים על אותה התנהגות חיצונית (output/logic).",
          "מפשטים ביטויים ומורידים כפילויות מיותרות.",
          "בודקים שהגרסה החדשה קריאה יותר ולא מכניסה סיכון.",
        ],
        quickCheck: "Refactor טוב משפר קריאות בלי לשנות תוצאה.",
      };
    default:
      break;
  }

  const topic = `${question.topic} ${question.subtopic}`.toLowerCase();
  if (topic.includes("operator") || topic.includes("bool") || topic.includes("condition")) {
    return {
      title: "פתרון תנאים (`condition`) בצורה מדויקת",
      steps: [
        "מפרקים את התנאי לחלקים קטנים (`x > 3`, `isReady == true`).",
        "מחשבים כל חלק לערך Bool ברור: `true` או `false`.",
        "מחברים רק בסוף עם `&&` / `||` וקובעים תוצאה סופית.",
      ],
      quickCheck: "אם בלבלת בין `=` ל-`==`, כנראה מצאת את מקור הטעות.",
    };
  }

  return {
    title: "שיטת פתרון כללית לשאלת קוד",
    steps: [
      "קוראים את הדרישה של השאלה במדויק לפני שבוחרים תשובה.",
      "מאמתים תחביר, טיפוסים ולוגיקה לפי שורה.",
      "פוסלים אפשרויות לא עקביות ואז בוחרים את ההסבר הכי מדויק.",
    ],
    quickCheck: "אל תנחש. בחר רק תשובה שאתה יכול לנמק למה היא נכונה.",
  };
}

export function buildLogicCoachGuide(question: Question): LogicCoachGuide {
  return formatGuide(question);
}

