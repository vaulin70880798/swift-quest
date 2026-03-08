"use client";

import { CodeSnippet } from "@/components/code-snippet";
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

  const selectedText = question.options[selectedIndex] ?? "לא נבחרה תשובה";
  const selectedExplanation = question.wrongOptionExplanations[selectedIndex] ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="card max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-5">
        <h3 className="mb-2 text-xl font-semibold text-amber">פירוק הטעות וההיגיון הנכון</h3>
        <p className="mb-3 text-sm text-fog/90">{question.questionText}</p>

        {question.codeSnippet ? (
          <div className="mb-4">
            <CodeSnippet code={question.codeSnippet} language={question.codeLanguage} />
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-red-300/30 bg-red-400/10 p-3">
            <p className="text-xs uppercase tracking-wide text-red-200">הבחירה שלך</p>
            <p className="mt-1 text-sm text-fog">{selectedText}</p>
            <p className="mt-2 text-sm text-fog/85">{selectedExplanation}</p>
          </div>
          <div className="rounded-xl border border-mint/40 bg-mint/10 p-3">
            <p className="text-xs uppercase tracking-wide text-mint">התשובה הנכונה</p>
            <p className="mt-1 text-sm text-fog">{question.options[question.correctAnswerIndex]}</p>
            <p className="mt-2 text-sm text-fog/90">{question.explanation}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-3">
          <p className="mb-2 text-sm font-semibold text-fog">למה שאר האפשרויות לא נכונות?</p>
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

        {question.codeSnippet ? (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-fog">גרסה נכונה לזכור</p>
            <CodeSnippet code={question.codeSnippet} language={question.codeLanguage} />
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="rounded-lg bg-sky px-4 py-2 text-sm font-semibold text-night hover:brightness-110"
            onClick={onAcknowledge}
            type="button"
          >
            הבנתי
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
