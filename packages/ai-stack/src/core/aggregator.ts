import type { AIStackProfile, StackItem, StackCategory } from "./types.js";

export interface TeamStackProfile {
  generatedAt: string;
  memberCount: number;
  sharedTools: StackItem[];
  uniqueByMember: Map<string, StackItem[]>;
  allTools: StackItem[];
  fragmentationScore: number;  // 0-100: 100 = everyone uses same tools
}

function itemKey(item: StackItem): string {
  return `${item.type}:${item.name}`;
}

/**
 * Aggregate multiple individual AIStackProfiles into a team view.
 * Identifies shared tools vs. per-member fragmentation.
 *
 * @param profiles  Map of memberName → AIStackProfile
 */
export function aggregateTeamStack(profiles: Map<string, AIStackProfile>): TeamStackProfile {
  const memberCount = profiles.size;
  if (memberCount === 0) {
    return {
      generatedAt: new Date().toISOString(),
      memberCount: 0, sharedTools: [], uniqueByMember: new Map(), allTools: [],
      fragmentationScore: 0,
    };
  }

  // Count how many members use each tool
  const toolFrequency = new Map<string, { item: StackItem; count: number }>();
  const uniqueByMember = new Map<string, StackItem[]>();

  for (const [member, profile] of profiles) {
    const memberItems: StackItem[] = profile.categories.flatMap((c: StackCategory) => c.items);
    uniqueByMember.set(member, memberItems);
    for (const item of memberItems) {
      const key = itemKey(item);
      const existing = toolFrequency.get(key) ?? { item, count: 0 };
      existing.count++;
      toolFrequency.set(key, existing);
    }
  }

  const allTools = [...toolFrequency.values()].map((e) => e.item);
  const sharedTools = [...toolFrequency.values()]
    .filter((e) => e.count === memberCount)
    .map((e) => e.item);

  // Fragmentation: what % of total unique tools are shared by everyone
  const fragmentationScore = allTools.length > 0
    ? Math.round((sharedTools.length / allTools.length) * 100)
    : 100;

  return {
    generatedAt: new Date().toISOString(),
    memberCount, sharedTools, uniqueByMember, allTools, fragmentationScore,
  };
}
