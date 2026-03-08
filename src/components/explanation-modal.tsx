"use client";

import { CodeSnippet } from "@/components/code-snippet";
import { buildConceptExplanations } from "@/lib/concept-glossary";
import { Question } from "@/lib/types";

interface ExplanationModalProps {
  open: boolean;
  question: Question;
  selectedIndex: number;
  onAcknowledge: () => void;
  onSaveForReview: () => void;
  onTrySimilar: () => void;
}

export function ExplanationModal({
  open,
  question,
  selectedIndex,
  onAcknowledge,
  onSaveForReview,
  onTrySimilar,
}: ExplanationModalProps) {
  if (!open) {
    return null;
  }

  const isCorrect = selectedIndex === question.correctAnswerIndex;
  const selectedText = question.options[selectedIndex] ?? "לא נבחרה תשובה";
  const selectedExplanation =
    question.wrongOptionExplanations[selectedIndex] ??
    (isCorrect
      ? "זו בחירה נכונה כי היא תואמת את חוקי Swift ואת הלוגיקה של הקוד המוצג."
      : "זו בחירה שלא תואמת את התוצאה הנכונה של הקוד.");
  const conceptExplanations = buildConceptExplanations(question);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="card max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-5">
        <h3 className="mb-2 text-xl font-semibold text-amber">
          {isCorrect ? "תשובה נכונה, ממשיכים" : "פירוק הטעות וההיגיון הנכון"}
        </h3>
        <p className="mb-3 text-sm text-fog/90">{question.questionText}</p>

        <div
          className={`mb-4 rounded-xl border p-3 text-sm ${
            isCorrect
              ? "border-mint/40 bg-mint/10 text-mint"
              : "border-red-300/30 bg-red-400/10 text-red-200"
          }`}
        >
          {isCorrect
            ? "ענית נכון. מצוין. עדיין מומלץ לקרוא את ההסבר כדי להבין את העיקרון, לא רק את התשובה."
            : "ענית לא נכון. זה בדיוק המקום שבו לומדים: נפרק מה קרה ולמה."}
        </div>

        {question.codeSnippet ? (
          <div className="mb-4">
            <CodeSnippet code={question.codeSnippet} language={question.codeLanguage} />
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div
            className={`rounded-xl border p-3 ${
              isCorrect
                ? "border-mint/40 bg-mint/10"
                : "border-red-300/30 bg-red-400/10"
            }`}
          >
            <p
              className={`text-xs uppercase tracking-wide ${
                isCorrect ? "text-mint" : "text-red-200"
              }`}
            >
              {isCorrect ? "הבחירה שלך (נכונה)" : "הבחירה שלך"}
            </p>
            <p className="mt-1 text-sm text-fog">{selectedText}</p>
            <p className="mt-2 text-sm text-fog/85">{selectedExplanation}</p>
          </div>
          <div className="rounded-xl border border-sky/35 bg-sky/10 p-3">
            <p className="text-xs uppercase tracking-wide text-sky">למה זו התשובה הנכונה</p>
            <p className="mt-1 text-sm text-fog">
              {question.options[question.correctAnswerIndex]}
            </p>
            <p className="mt-2 text-sm text-fog/90">{question.explanation}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-sky/35 bg-[#0c2947]/60 p-3 text-sm text-fog/95">
          <p className="font-semibold text-sky">הסבר מפורט צעד-אחר-צעד</p>
          <p className="mt-2">
            בשאלה הזו בדקנו את הנושא <span className="text-sky">{question.topic}</span>
            {question.subtopic ? (
              <>
                {" "}
                ותת-הנושא <span className="text-sky">{question.subtopic}</span>
              </>
            ) : null}
            . כדי לפתור נכון, כדאי לעבוד בשלושה צעדים קבועים:
          </p>
          <ol className="mt-2 space-y-1">
            <li>1. לזהות מה כל שורה בקוד עושה בפועל.</li>
            <li>2. לבדוק טיפוסים ולוגיקה (למשל Bool, comparison, assignment).</li>
            <li>3. להשוות את התוצאה הסופית לאפשרויות, ואז לבחור.</li>
          </ol>
          <p className="mt-2">
            במקרה הנוכחי, ההיגיון הנכון הוא: <span className="text-sky">{question.explanation}</span>
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-3">
          <p className="mb-2 text-sm font-semibold text-fog">פירוק כל האפשרויות</p>
          <ul className="space-y-1 text-sm text-fog/80">
            {question.options.map((option, index) => (
              <li key={option + index}>
                {index + 1}. {option} - {question.wrongOptionExplanations[index]}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-xl border border-sky/30 bg-sky/10 p-3 text-sm text-fog">
          <p className="font-semibold text-sky">כלל קצר לזכור</p>
          <p>{question.hint}</p>
        </div>

        {conceptExplanations.length > 0 ? (
          <div className="mt-4 rounded-xl border border-sky/35 bg-[#09233f]/60 p-3">
            <p className="mb-2 text-sm font-semibold text-sky">מושגים חשובים (בתכלת)</p>
            <ul className="space-y-2 text-sm text-fog/90">
              {conceptExplanations.map((concept) => (
                <li key={concept.term}>
                  <p className="font-semibold text-sky">{concept.term}</p>
                  <p>{concept.explanation}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {question.codeSnippet ? (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-fog">גרסת הקוד לשימור בזיכרון</p>
            <CodeSnippet code={question.codeSnippet} language={question.codeLanguage} />
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="rounded-lg bg-sky px-4 py-2 text-sm font-semibold text-night hover:brightness-110"
            onClick={onAcknowledge}
            type="button"
          >
            המשך לשאלה הבאה
          </button>
          <button
            className="rounded-lg border border-amber/50 px-4 py-2 text-sm text-amber hover:bg-amber/10"
            onClick={onTrySimilar}
            type="button"
          >
            נסה שאלה דומה
          </button>
          <button
            className="rounded-lg border border-fog/40 px-4 py-2 text-sm text-fog hover:bg-fog/10"
            onClick={onSaveForReview}
            type="button"
          >
            שמור לחזרה
          </button>
        </div>
      </div>
    </div>
  );
}
