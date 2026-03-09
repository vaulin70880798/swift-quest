import { courseCatalog } from "@/lib/course-catalog";

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

function chunkTopics(topics: string[], chunkCount: number): string[][] {
  const chunks: string[][] = Array.from({ length: Math.max(1, chunkCount) }, () => []);
  for (let index = 0; index < topics.length; index += 1) {
    chunks[index % chunks.length].push(topics[index]);
  }
  return chunks;
}

function buildLessons(topics: string[]): BlueprintLesson[] {
  const chunks = chunkTopics(topics, 4);
  return chunks.map((chunk, index) => {
    const concept = chunk.join(" / ");
    return {
      order: index + 1,
      concept,
      goal: `שליטה מעשית בנושאי ${concept}.`,
      logicSkill: "פירוק קוד שיטתי, בדיקת טיפוסים, ופסילת אופציות מבוססת היגיון.",
    };
  });
}

const worldCourseBlueprints: Record<number, WorldCourseBlueprint> = Object.fromEntries(
  courseCatalog.map((course) => [
    course.id,
    {
      worldId: course.id,
      title: course.name,
      prerequisite: course.id === 1 ? "ללא דרישה מוקדמת" : `מעבר קורס ${course.id - 1}`,
      lessons: buildLessons(course.topicCoverage),
      examRule: "30 שאלות, עד 5 טעויות.",
    } satisfies WorldCourseBlueprint,
  ]),
);

export function getWorldCourseBlueprint(worldId: number): WorldCourseBlueprint | null {
  return worldCourseBlueprints[worldId] ?? null;
}

