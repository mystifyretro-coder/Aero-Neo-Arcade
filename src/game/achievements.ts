import {
  AchievementDefinition,
  AchievementId,
  AchievementProgress,
  AchievementStats,
  LiveRunTelemetry,
} from '../types/game';

const ACHIEVEMENTS_STORAGE_KEY = 'aero_arcade_2026_achievements_v1';

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'graze_master',
    title: 'Graze Master',
    shortTitle: 'Graze 1K',
    description: 'Accumulate 1,000 close-range barrier graze maneuvers across runs.',
    metricKey: 'totalGrazeCount',
    target: 1000,
    unit: 'grazes',
    iconKey: 'crosshair',
    accentColor: '#f59e0b',
  },
  {
    id: 'distance_runner',
    title: 'Distance Runner',
    shortTitle: '10K Units',
    description: 'Travel 10,000 total flight units across the megacity horizon.',
    metricKey: 'totalDistanceUnits',
    target: 10000,
    unit: 'units',
    iconKey: 'compass',
    accentColor: '#00f2ff',
  },
  {
    id: 'pipe_vanguard',
    title: 'Pipe Vanguard',
    shortTitle: '100 Pipes',
    description: 'Clear 100 barrier gates cleanly without hull impact.',
    metricKey: 'totalGatesCleared',
    target: 100,
    unit: 'pipes',
    iconKey: 'shield',
    accentColor: '#10b981',
  },
  {
    id: 'coin_collector',
    title: 'Coin Collector',
    shortTitle: '250 Coins',
    description: 'Collect 250 automatic arcade coins from cleared gates.',
    metricKey: 'totalCoins',
    target: 250,
    unit: 'coins',
    iconKey: 'coins',
    accentColor: '#eab308',
  },
  {
    id: 'hyper_overdrive',
    title: 'Hyper Overdrive',
    shortTitle: '15 Dashes',
    description: 'Engage emergency Hyper Dash invulnerability 15 times.',
    metricKey: 'totalHyperDashes',
    target: 15,
    unit: 'dashes',
    iconKey: 'zap',
    accentColor: '#f43f5e',
  },
  {
    id: 'event_horizon',
    title: 'Event Horizon',
    shortTitle: '35 Score',
    description: 'Reach Stage 03 Singularity by scoring 35 points in a single run.',
    metricKey: 'bestScore',
    target: 35,
    unit: 'pts',
    iconKey: 'crown',
    accentColor: '#a855f7',
  },
];

export interface PersistedAchievementsState {
  baseStats: AchievementStats;
  unlockedAtMap: Partial<Record<AchievementId, number>>;
}

export const EMPTY_ACHIEVEMENT_STATS: AchievementStats = {
  totalGrazeCount: 0,
  totalDistanceUnits: 0,
  totalGatesCleared: 0,
  totalCoins: 0,
  totalHyperDashes: 0,
  bestScore: 0,
};

export const EMPTY_LIVE_TELEMETRY: LiveRunTelemetry = {
  runGrazes: 0,
  runDistanceUnits: 0,
  runGatesCleared: 0,
  runCoins: 0,
  runHyperDashes: 0,
  currentScore: 0,
};

export function loadAchievementsState(): PersistedAchievementsState {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        baseStats: {
          totalGrazeCount: Number(parsed?.baseStats?.totalGrazeCount) || 0,
          totalDistanceUnits: Number(parsed?.baseStats?.totalDistanceUnits) || 0,
          totalGatesCleared: Number(parsed?.baseStats?.totalGatesCleared) || 0,
          totalCoins: Number(parsed?.baseStats?.totalCoins) || 0,
          totalHyperDashes: Number(parsed?.baseStats?.totalHyperDashes) || 0,
          bestScore: Number(parsed?.baseStats?.bestScore) || 0,
        },
        unlockedAtMap:
          parsed?.unlockedAtMap && typeof parsed.unlockedAtMap === 'object'
            ? parsed.unlockedAtMap
            : {},
      };
    }
  } catch {
    // Fallback if localStorage is restricted
  }

  return {
    baseStats: { ...EMPTY_ACHIEVEMENT_STATS },
    unlockedAtMap: {},
  };
}

export function saveAchievementsState(state: PersistedAchievementsState): void {
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Fallback if localStorage is restricted
  }
}

export function combineLiveStats(
  baseStats: AchievementStats,
  live: LiveRunTelemetry
): AchievementStats {
  return {
    totalGrazeCount: baseStats.totalGrazeCount + live.runGrazes,
    totalDistanceUnits: baseStats.totalDistanceUnits + live.runDistanceUnits,
    totalGatesCleared: baseStats.totalGatesCleared + live.runGatesCleared,
    totalCoins: baseStats.totalCoins + live.runCoins,
    totalHyperDashes: baseStats.totalHyperDashes + live.runHyperDashes,
    bestScore: Math.max(baseStats.bestScore, live.currentScore),
  };
}

export function buildAchievementProgressList(
  combinedStats: AchievementStats,
  unlockedAtMap: Partial<Record<AchievementId, number>>
): AchievementProgress[] {
  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const rawVal = combinedStats[def.metricKey];
    const unlockedTimestamp = unlockedAtMap[def.id];
    const unlocked = Boolean(unlockedTimestamp) || rawVal >= def.target;
    const current = unlocked ? Math.max(rawVal, def.target) : rawVal;
    const progressRatio = Math.min(1, Math.max(0, current / def.target));

    return {
      ...def,
      current,
      progressRatio,
      unlocked,
      unlockedAt: unlockedTimestamp,
    };
  });
}
