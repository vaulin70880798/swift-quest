import { Question } from "@/lib/types";

export interface ConceptExplanation {
  term: string;
  explanation: string;
}

interface GlossaryItem extends ConceptExplanation {
  patterns: string[];
}

const glossary: GlossaryItem[] = [
  {
    term: "condition",
    patterns: ["condition", "if", "boolean", "logic", "תנאי"],
    explanation:
      "condition הוא ביטוי שמחזיר true/false. לפי התוצאה, הקוד מחליט אם להיכנס לבלוק מסוים או לדלג עליו.",
  },
  {
    term: "let",
    patterns: [" let", "let ", "let/var", "immutable"],
    explanation:
      "let מגדיר ערך קבוע (immutable). אחרי אתחול אי אפשר לשנות אותו, ולכן הוא בטוח יותר כשאין צורך בעדכון.",
  },
  {
    term: "var",
    patterns: [" var", "var ", "mutable"],
    explanation:
      "var מגדיר ערך משתנה (mutable). משתמשים בו כשהערך אמור להשתנות במהלך הריצה.",
  },
  {
    term: "String",
    patterns: ["string", "text", "interpolation"],
    explanation:
      "String הוא טיפוס לטקסט. ב-Swift אפשר לבנות טקסט עם חיבור מחרוזות או בצורה נקייה יותר עם interpolation.",
  },
  {
    term: "Int",
    patterns: ["int", "integer"],
    explanation:
      "Int מייצג מספר שלם ללא נקודה עשרונית. חישובים בין Int מחזירים בדרך כלל Int.",
  },
  {
    term: "Double",
    patterns: ["double", "decimal"],
    explanation:
      "Double מייצג מספר עם נקודה עשרונית. משתמשים בו כשצריך דיוק של שברים.",
  },
  {
    term: "Bool",
    patterns: ["bool", "true", "false", "&&", "||", "!"],
    explanation:
      "Bool הוא טיפוס לוגי עם שני ערכים בלבד: true או false. הוא הבסיס לתנאים ולוגיקה בקוד.",
  },
  {
    term: "print",
    patterns: ["print", "output", "פלט"],
    explanation:
      "print מציג פלט לקונסול. זה כלי מרכזי לבדיקה מהירה של ערכים בזמן למידה ודיבוג.",
  },
  {
    term: "interpolation",
    patterns: ["interpolation", "\\("],
    explanation:
      "interpolation מאפשר לשלב ערכים בתוך String עם התחביר \\(expression), במקום להמיר ידנית ולחבר טקסט.",
  },
  {
    term: "operator",
    patterns: ["operator", "operators", "+", "-", "*", "/", "%", "==", "="],
    explanation:
      "operator הוא סימן שמבצע פעולה על ערכים: חישוב, השוואה או השמה. חשוב להבחין בין השמה (=) להשוואה (==).",
  },
  {
    term: "expression",
    patterns: ["expression", "ביטוי"],
    explanation:
      "expression הוא קטע קוד שמחזיר ערך. לדוגמה, a + b הוא expression שמחזיר מספר.",
  },
  {
    term: "type inference",
    patterns: ["type inference", "inference"],
    explanation:
      "type inference אומר ש-Swift מסיק את הטיפוס לבד לפי הערך, גם אם לא כתבת אותו מפורשות.",
  },
  {
    term: "type safety",
    patterns: ["type safety", "type", "compiler", "קומפיל"],
    explanation:
      "type safety מונע ערבוב לא חוקי בין טיפוסים שונים. הקומפיילר מזהיר מוקדם ומקטין באגים בזמן ריצה.",
  },
  {
    term: "comment",
    patterns: ["comment", "comments", "//", "/*"],
    explanation:
      "comment הוא טקסט שהקומפיילר מתעלם ממנו. משתמשים בו כדי להסביר כוונה או להשבית קוד זמנית.",
  },
  {
    term: "modulo (%)",
    patterns: ["%", "remainder", "שארית", "modulo"],
    explanation:
      "modulo (%) מחזיר את שארית החלוקה. למשל 17 % 5 מחזיר 2, ולכן זה שימושי לבדיקת זוגי/אי-זוגי.",
  },
];

export function buildConceptExplanations(question: Question): ConceptExplanation[] {
  const source = [
    question.topic,
    question.subtopic,
    question.format,
    question.questionText,
    question.explanation,
    question.codeSnippet ?? "",
    ...question.tags,
  ]
    .join(" ")
    .toLowerCase();

  const found = glossary.filter((item) =>
    item.patterns.some((pattern) => source.includes(pattern.toLowerCase())),
  );

  // Keep the panel focused and readable.
  return found.slice(0, 5).map(({ term, explanation }) => ({ term, explanation }));
}
