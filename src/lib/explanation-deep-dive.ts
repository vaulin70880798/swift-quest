import { Question } from "@/lib/types";

export interface DeepDiveExample {
  title: string;
  code: string;
  explanation: string;
}

export interface ExplanationDeepDive {
  concept: string;
  conceptExplanation: string;
  questionFocus: string;
  examples: DeepDiveExample[];
}

function fallbackDeepDive(question: Question): ExplanationDeepDive {
  return {
    concept: question.subtopic || question.topic,
    conceptExplanation:
      "המטרה היא להבין מה הקוד עושה בפועל, איזה טיפוסים עובדים כאן, ואיזה כלל תחביר או לוגיקה קובע את התוצאה.",
    questionFocus:
      "השאלה בדקה האם אתה מזהה את העיקרון המרכזי בתוך קוד קצר, ולא רק זוכר תשובה בעל פה.",
    examples: [
      {
        title: "פירוק שורה-שורה",
        code: `let value = 5\nlet result = value + 2\nprint(result)`,
        explanation:
          "מגדירים value, מחשבים result, ומדפיסים 7. הרעיון: לעקוב אחרי הערך שנוצר בכל שורה.",
      },
      {
        title: "בדיקת תנאי פשוטה",
        code: `let score = 8\nprint(score > 5)`,
        explanation:
          "התנאי score > 5 מחזיר Bool. כאן התוצאה היא true כי 8 גדול מ-5.",
      },
    ],
  };
}

function deepDiveByTopic(question: Question): ExplanationDeepDive | null {
  const topic = `${question.topic} ${question.subtopic}`.toLowerCase();

  if (topic.includes("let") || topic.includes("var")) {
    return {
      concept: "let vs var",
      conceptExplanation:
        "`let` יוצר ערך קבוע (immutable), ו-`var` יוצר ערך שניתן לעדכן (mutable). הבחירה ביניהם קובעת אם מותר לבצע שינוי אחרי האתחול.",
      questionFocus:
        "השאלה בדקה אם אתה מזהה מתי הקוד מנסה לעדכן ערך שלא אמור להשתנות, או להפך.",
      examples: [
        {
          title: "קבוע שלא ניתן לעדכן",
          code: `let lives = 3\n// lives = 4  // compile-time error`,
          explanation:
            "ברגע שהערך נשמר ב-`let`, שינוי נוסף נחסם בזמן קומפילציה כדי לשמור על בטיחות.",
        },
        {
          title: "משתנה שכן ניתן לעדכן",
          code: `var coins = 10\ncoins += 5\nprint(coins)`,
          explanation:
            "כאן `var` מאפשר שינוי ערך. אחרי העדכון יודפס 15.",
        },
      ],
    };
  }

  if (topic.includes("interpolation") || topic.includes("string")) {
    return {
      concept: "String interpolation",
      conceptExplanation:
        "ב-`String interpolation` מכניסים ערכים לתוך מחרוזת בעזרת `\\(expression)` במקום לחבר מחרוזות ידנית.",
      questionFocus:
        "השאלה בדקה אם אתה יודע להשתמש בתחביר המדויק של interpolation ולקבל פלט נקי וקריא.",
      examples: [
        {
          title: "שילוב משתנה בתוך טקסט",
          code: `let user = "Maya"\nprint("Hello, \\(user)")`,
          explanation:
            "הערך של `user` נשזר לתוך המחרוזת, והפלט יהיה `Hello, Maya`.",
        },
        {
          title: "שילוב חישוב בתוך טקסט",
          code: `let a = 3\nlet b = 4\nprint("sum: \\(a + b)")`,
          explanation:
            "אפשר לשים גם ביטוי שלם בתוך `\\(...)`, ולכן יודפס `sum: 7`.",
        },
      ],
    };
  }

  if (topic.includes("operator") || topic.includes("comparison")) {
    return {
      concept: "Operators and conditions",
      conceptExplanation:
        "אופרטורים (`+`, `-`, `==`, `&&`, `||`) מפעילים לוגיקה או חישוב. חשוב להבחין בין השמה (`=`) להשוואה (`==`) ובין AND ל-OR.",
      questionFocus:
        "השאלה בדקה אם אתה יודע לפרש תנאי או ביטוי בצורה מדויקת, כולל סדר פעולות וסוג האופרטור.",
      examples: [
        {
          title: "השוואה מול השמה",
          code: `let hp = 10\nprint(hp == 10)`,
          explanation:
            "`==` מחזיר Bool. במקרה הזה יודפס true. אם נשתמש ב-`=` בתוך תנאי נקבל שגיאה.",
        },
        {
          title: "AND לוגי",
          code: `let hasKey = true\nlet hasCode = false\nprint(hasKey && hasCode)`,
          explanation:
            "AND מחייב ששני התנאים יהיו true. כאן אחד false ולכן התוצאה false.",
        },
      ],
    };
  }

  if (topic.includes("type") || topic.includes("bool")) {
    return {
      concept: "Type safety",
      conceptExplanation:
        "Swift שפה עם Type Safety: כל ערך חייב להתאים לטיפוס שלו. אי התאמה בין טיפוס לערך תוביל לשגיאת קומפילציה.",
      questionFocus:
        "השאלה בדקה האם אתה מזהה מתי הטיפוס של הערך לא תואם להגדרה.",
      examples: [
        {
          title: "התאמה תקינה לטיפוס",
          code: `let age: Int = 20`,
          explanation:
            "הערך 20 הוא Int ולכן ההגדרה תקינה.",
        },
        {
          title: "אי התאמה לטיפוס",
          code: `let isReady: Bool = "true"`,
          explanation:
            "`\"true\"` הוא String, לא Bool. צריך לכתוב `true` בלי מרכאות.",
        },
      ],
    };
  }

  if (topic.includes("comment")) {
    return {
      concept: "Swift comments",
      conceptExplanation:
        "הערות משמשות תיעוד לקוד ולא משפיעות על הרצה. ב-Swift משתמשים ב-`//` לשורה אחת וב-`/* ... */` לבלוק.",
      questionFocus:
        "השאלה בדקה אם אתה מזהה תחביר הערות תקין של Swift מול תחבירים משפות אחרות.",
      examples: [
        {
          title: "הערת שורה",
          code: `// TODO: improve naming\nlet score = 10`,
          explanation:
            "השורה הראשונה היא הערה בלבד והקומפיילר מתעלם ממנה.",
        },
        {
          title: "הערת בלוק",
          code: `/* this value\n   is temporary */\nvar value = 5`,
          explanation:
            "אפשר לפרוס הערת בלוק על כמה שורות, והקוד ממשיך כרגיל.",
        },
      ],
    };
  }

  if (topic.includes("print")) {
    return {
      concept: "print and output",
      conceptExplanation:
        "`print` מציג פלט למסך. אפשר להעביר אליו ערכים, ביטויים ותוצאות חישוב, כל עוד הטיפוסים תקינים.",
      questionFocus:
        "השאלה בדקה האם אתה מבין מה באמת נשלח ל-`print` אחרי שהביטוי מחושב.",
      examples: [
        {
          title: "הדפסת תוצאה חשבונית",
          code: `let x = 4\nlet y = 2\nprint(x * y)`,
          explanation:
            "הביטוי מחושב קודם, לכן יודפס 8.",
        },
        {
          title: "הדפסת טקסט עם ערך",
          code: `let hp = 9\nprint("HP: \\(hp)")`,
          explanation:
            "interpolation שוזר את הערך 9 בתוך הטקסט בצורה קריאה.",
        },
      ],
    };
  }

  return null;
}

export function buildExplanationDeepDive(question: Question): ExplanationDeepDive {
  return deepDiveByTopic(question) ?? fallbackDeepDive(question);
}
