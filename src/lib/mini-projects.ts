import { worlds } from "@/lib/curriculum";

export interface MiniProject {
  id: string;
  worldId: number;
  title: string;
  challenge: string;
  successCondition: string;
  starterCode: string;
  expectedOutput: string;
  hints: string[];
  rewardXP: number;
  rewardCoins: number;
  optional: true;
}

function buildStarterCode(worldId: number, mainTopic: string): string {
  const safeTopic = mainTopic.replace(/"/g, "");
  return `// מיני פרויקט עולם ${worldId}\nlet world = ${worldId}\nlet topic = "${safeTopic}"\n// הדפס בדיוק את הפלט המבוקש\nprint("WORLD \\(world) :: \\(topic)")\nprint("READY")`;
}

const miniProjects: MiniProject[] = worlds.map((world) => {
  const mainTopic = world.topicCoverage[0] ?? "Swift";
  const expectedOutput = `WORLD ${world.id} :: ${mainTopic}\nREADY`;

  return {
    id: `mini-project-w${world.id}`,
    worldId: world.id,
    title: `מיני פרויקט עולם ${world.id}`,
    challenge:
      `כתוב קוד Swift שמדפיס שני שורות: שורת זיהוי עולם + נושא מרכזי, ואז READY.`,
    successCondition:
      "הפרויקט עובר רק אם הפלט בקונסולה זהה בדיוק לפלט המבוקש.",
    starterCode: buildStarterCode(world.id, mainTopic),
    expectedOutput,
    hints: [
      "אפשר להשתמש ב-interpolation: `\\(value)`.",
      "שים לב לרווחים ולתווים: בדיקת הפלט היא מדויקת.",
      "אם אתה מקבל שגיאה, הרץ שוב אחרי תיקון קטן ולא שינוי ענק.",
    ],
    rewardXP: 90 + world.id * 3,
    rewardCoins: 45 + world.id * 2,
    optional: true,
  };
});

export function getMiniProjectByWorld(worldId: number): MiniProject | null {
  return miniProjects.find((project) => project.worldId === worldId) ?? null;
}

