"use client";

import { CodeSnippet } from "@/components/code-snippet";
import { MixedText } from "@/components/mixed-text";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/76 p-4 backdrop-blur-sm">
      <div className="card max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-6">
        <h3 className="mb-2 text-xl font-semibold text-amber">
          {isCorrect ? "תשובה נכונה, ממשיכים" : "פירוק הטעות וההיגיון הנכון"}
        </h3>
        <MixedText text={question.questionText} as="p" className="mb-3 text-sm text-fog/85" />

        <div
          className={`mb-4 rounded-2xl border p-3 text-sm ${
            isCorrect
              ? "surface-block-success text-mint"
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
            className={`rounded-2xl border p-3 ${
              isCorrect
                ? "surface-block-success"
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
            <MixedText text={selectedText} as="p" className="mt-1 text-sm text-fog" />
            <MixedText text={selectedExplanation} as="p" className="mt-2 text-sm text-fog/85" />
          </div>
          <div className="surface-block-accent p-3">
            <p className="text-xs uppercase tracking-wide text-sky">למה זו התשובה הנכונה</p>
            <MixedText
              text={question.options[question.correctAnswerIndex]}
              as="p"
              className="mt-1 text-sm text-fog"
            />
            <MixedText text={question.explanation} as="p" className="mt-2 text-sm text-fog/90" />
          </div>
        </div>

        <div className="surface-block-accent mt-4 p-3 text-sm text-fog/95">
          <p className="font-semibold text-sky">הסבר מפורט צעד-אחר-צעד</p>
          <MixedText
            text={`בשאלה הזו בדקנו את הנושא ${question.topic}${
              question.subtopic ? ` ותת-הנושא ${question.subtopic}` : ""
            }. כדי לפתור נכון, כדאי לעבוד בשלושה צעדים קבועים:`}
            as="p"
            className="mt-2"
          />
          <ol className="mt-2 space-y-1">
            <li>
              <MixedText text="1. לזהות מה כל שורה בקוד עושה בפועל." />
            </li>
            <li>
              <MixedText text="2. לבדוק טיפוסים ולוגיקה (למשל Bool, comparison, assignment)." />
            </li>
            <li>
              <MixedText text="3. להשוות את התוצאה הסופית לאפשרויות, ואז לבחור." />
            </li>
          </ol>
          <MixedText
            text={`במקרה הנוכחי, ההיגיון הנכון הוא: ${question.explanation}`}
            as="p"
            className="mt-2"
          />
        </div>

        <div className="surface-block-muted mt-4 p-3">
          <p className="mb-2 text-sm font-semibold text-fog">פירוק כל האפשרויות</p>
          <ul className="space-y-1 text-sm text-fog/80">
            {question.options.map((option, index) => (
              <li key={option + index}>
                <MixedText
                  text={`${index + 1}. ${option} - ${question.wrongOptionExplanations[index]}`}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-block-accent mt-4 p-3 text-sm text-fog">
          <p className="font-semibold text-sky">כלל קצר לזכור</p>
          <MixedText text={question.hint} as="p" />
        </div>

        {conceptExplanations.length > 0 ? (
          <div className="surface-block-accent mt-4 p-3">
            <p className="mb-2 text-sm font-semibold text-sky">מושגים חשובים (בתכלת)</p>
            <ul className="space-y-2 text-sm text-fog/90">
              {conceptExplanations.map((concept) => (
                <li key={concept.term}>
                  <MixedText text={concept.term} as="p" className="font-semibold text-sky" />
                  <MixedText text={concept.explanation} as="p" />
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
            className="btn btn-primary"
            onClick={onAcknowledge}
            type="button"
          >
            המשך לשאלה הבאה
          </button>
          <button
            className="btn btn-warning"
            onClick={onTrySimilar}
            type="button"
          >
            נסה שאלה דומה
          </button>
          <button
            className="btn btn-ghost"
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
