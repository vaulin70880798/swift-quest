export interface LibraryTopic {
  id: string;
  title: string;
  summary: string;
  commonMistakes: string[];
  snippet: string;
  related: string[];
}

export const codexLibrary: LibraryTopic[] = [
  {
    id: "optionals",
    title: "Optionals",
    summary:
      "Optional מאפשר לייצג מצב שבו ייתכן שאין ערך. זה מונע קריסות ומכריח טיפול מפורש ב-nil.",
    commonMistakes: [
      "שימוש ב-force unwrap בלי בדיקה.",
      "ערבוב בין if let ל-guard let בלי להבין את ה-scope.",
      "התעלמות מ-nil coalescing כשיש ערך ברירת מחדל ברור.",
    ],
    snippet: `let userName: String? = fetchName()\nlet safeName = userName ?? "Guest"\nprint(safeName)`,
    related: ["if let", "guard let", "optional chaining"],
  },
  {
    id: "state-wrappers",
    title: "SwiftUI State Wrappers",
    summary:
      "@State מיועד ל-state מקומי, @Binding להעברת state מלמעלה, ו-@StateObject/@ObservedObject ל-reference models.",
    commonMistakes: [
      "שימוש ב-@State במקום @Binding בקומפוננטת child.",
      "יצירת view model עם @ObservedObject במקום @StateObject ברמת ownership.",
      "החזקת state כפול במסכים שונים בלי מקור אמת יחיד.",
    ],
    snippet:
      "@State private var isOn = false\nToggle(\"Enable\", isOn: $isOn)",
    related: ["data flow", "single source of truth", "component boundaries"],
  },
];
