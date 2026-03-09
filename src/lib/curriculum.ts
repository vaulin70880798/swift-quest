import { courseCatalog } from "@/lib/course-catalog";
import { World } from "@/lib/types";

function buildEnemySet(id: number): string[] {
  const pools = [
    ["Trace Sprite", "Compiler Shade", "Logic Wisp"],
    ["Nil Phantom", "Flow Serpent", "Type Golem"],
    ["Task Siren", "State Warden", "Bug Hunter"],
    ["Model Keeper", "Test Sentinel", "Memory Drake"],
  ];

  return pools[id % pools.length];
}

function requiredWorlds(worldId: number): number[] {
  return Array.from({ length: Math.max(0, worldId - 1) }, (_, index) => index + 1);
}

function buildStages(worldId: number): string[] {
  return [`w${worldId}-s1`, `w${worldId}-s2`, `w${worldId}-s3`];
}

export const worlds: World[] = courseCatalog.map((course) => {
  const enemySet = buildEnemySet(course.id);
  const rewardXp = 260 + course.id * 45;
  const rewardCoins = 120 + course.id * 22;

  return {
    id: course.id,
    name: course.name,
    theme: course.theme,
    description: course.description,
    topicCoverage: course.topicCoverage,
    stages: buildStages(course.id),
    enemySet,
    miniBoss: `${course.name} Gatekeeper`,
    finalBoss: `${course.name} Final Boss`,
    unlockRequirement: {
      minLevel: course.id,
      requiredWorlds: requiredWorlds(course.id),
    },
    rewardSet: {
      xp: rewardXp,
      coins: rewardCoins,
      badge: course.badge,
    },
  };
});

export const topicDependencies: Record<string, string[]> = worlds.reduce(
  (acc, world) => {
    acc[world.name] = world.id > 1 ? [worlds[world.id - 2].name] : [];
    return acc;
  },
  {} as Record<string, string[]>,
);

