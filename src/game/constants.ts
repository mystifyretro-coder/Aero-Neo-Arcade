import { LevelConfig, LevelId } from '../types/game';

export const GRAVITY_BASE = 880; // pixels / second^2
export const FLAP_IMPULSE_BASE = -340; // upward velocity
export const CRAFT_RADIUS = 14;
export const CRAFT_HITBOX_RADIUS = 5; // clean forgiving hit tolerance
export const GRAZE_MARGIN = 20; // Distance from obstacle edge to trigger graze bonus
export const MAX_FALL_VELOCITY = 580;
export const MAX_RISE_VELOCITY = -450;

export const LEVELS: Record<LevelId, LevelConfig> = {
  ascent: {
    id: 'ascent',
    name: 'ASCENT',
    stageNumber: 1,
    subtitle: 'Dawn Megacity Skyport',
    scoreThreshold: 0,
    speedBase: 290,
    gravity: 840,
    jumpForce: -340,
    gapSize: 260,
    minGapVariation: 0.25,
    maxGapVariation: 0.75,
    hazardTypes: ['static'],
    primaryColor: '#00f2ff', // Neon Cyan
    accentColor: '#f59e0b',  // Solar Amber
    glowColor: 'rgba(0, 242, 255, 0.4)',
    skyGradientTop: '#08101e',
    skyGradientBottom: '#04070e',
    gridColor: 'rgba(0, 242, 255, 0.08)',
    musicBpm: 124,
  },
  catalyst: {
    id: 'catalyst',
    name: 'CATALYST',
    stageNumber: 2,
    subtitle: 'Ion Storm Conduits',
    scoreThreshold: 15,
    speedBase: 340,
    gravity: 860,
    jumpForce: -345,
    gapSize: 250,
    minGapVariation: 0.2,
    maxGapVariation: 0.8,
    hazardTypes: ['static'],
    primaryColor: '#10b981', // Electric Emerald
    accentColor: '#a855f7',  // Plasma Violet
    glowColor: 'rgba(16, 185, 129, 0.45)',
    skyGradientTop: '#061718',
    skyGradientBottom: '#040c10',
    gridColor: 'rgba(16, 185, 129, 0.1)',
    musicBpm: 138,
  },
  singularity: {
    id: 'singularity',
    name: 'SINGULARITY',
    stageNumber: 3,
    subtitle: 'Event Horizon Relativistic Flow',
    scoreThreshold: 35,
    speedBase: 390,
    gravity: 890,
    jumpForce: -355,
    gapSize: 240,
    minGapVariation: 0.2,
    maxGapVariation: 0.8,
    hazardTypes: ['static'],
    primaryColor: '#ff0055', // Crimson Laser
    accentColor: '#fbbf24',  // Radiant Gold
    glowColor: 'rgba(255, 0, 85, 0.5)',
    skyGradientTop: '#18040d',
    skyGradientBottom: '#070206',
    gridColor: 'rgba(255, 0, 85, 0.12)',
    musicBpm: 154,
  }
};

export const LEVEL_SEQUENCE: LevelId[] = ['ascent', 'catalyst', 'singularity'];

export function getLevelForScore(score: number): LevelConfig {
  if (score >= LEVELS.singularity.scoreThreshold) {
    return LEVELS.singularity;
  }
  if (score >= LEVELS.catalyst.scoreThreshold) {
    return LEVELS.catalyst;
  }
  return LEVELS.ascent;
}

export function calculateDifficultyMultiplier(score: number): {
  speedBoost: number;
  gapTightening: number;
} {
  // Smoothly increases difficulty as score rises beyond thresholds
  const excess = Math.max(0, score);
  const speedBoost = Math.min(220, excess * 4.2); // Up to +220 px/s over time
  const gapTightening = Math.min(30, excess * 0.5); // Tightens gap further
  return { speedBoost, gapTightening };
}

export const HIGH_SCORE_KEY = 'aero_arcade_2026_highscore';
export const STATS_KEY = 'aero_arcade_2026_stats';
