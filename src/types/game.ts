export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type LevelId = 'ascent' | 'catalyst' | 'singularity';

export interface LevelConfig {
  id: LevelId;
  name: string;
  stageNumber: number;
  subtitle: string;
  scoreThreshold: number; // Score to reach this level
  speedBase: number;      // Horizontal scrolling speed in px/s
  gravity: number;        // Downward acceleration
  jumpForce: number;      // Flap impulse
  gapSize: number;        // Vertical opening between barriers
  minGapVariation: number;
  maxGapVariation: number;
  hazardTypes: ('static' | 'oscillating' | 'laser' | 'vortex')[];
  primaryColor: string;   // Cyan / Emerald / Crimson
  accentColor: string;    // Gold / Violet / Ultraviolet
  glowColor: string;
  skyGradientTop: string;
  skyGradientBottom: string;
  gridColor: string;
  musicBpm: number;
}

export interface PlayerCraft {
  x: number;
  y: number;
  radius: number;
  vy: number;
  angle: number;
  wingAngle: number;
  isFlapping: boolean;
  hyperActive: boolean;
  hyperTimeRemaining: number;
  invulnerableTime: number;
  grazeCount: number;
}

export interface GateObstacle {
  id: number;
  x: number;
  width: number;
  gapY: number;        // Center of the opening
  gapHeight: number;   // Height of opening
  type: 'static' | 'oscillating' | 'laser' | 'vortex';
  // For oscillating:
  oscillationSpeed?: number;
  oscillationAmplitude?: number;
  baseGapY?: number;
  oscillationOffset?: number;
  // For laser gate:
  laserState?: 'charging' | 'firing' | 'cooldown';
  laserTimer?: number;
  // State:
  passed: boolean;
  grazedTop: boolean;
  grazedBottom: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  alpha: number;
  glow?: boolean;
  shape?: 'circle' | 'spark' | 'ring' | 'coin';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface RunStats {
  score: number;
  highScore: number;
  coins: number;
  levelReached: LevelId;
  gatesCleared: number;
  grazeCount: number;
  hyperDashesUsed: number;
  distanceTraveledMeters: number;
  topSpeedKmH: number;
  runDurationSeconds: number;
  rank: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
}

export type UpgradeId = 'triLaser' | 'quantumShield' | 'orbMagnet' | 'hyperCapacitor' | 'antiGravity' | 'plasmaOvercharge';

export interface StoreUpgrade {
  id: UpgradeId;
  name: string;
  description: string;
  iconName: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  currentBenefit: string;
  nextBenefit: string;
}

export interface Trophy {
  id: string;
  title: string;
  description: string;
  category: 'all' | 'flight' | 'combat' | 'reflex' | 'arsenal' | string;
  iconName: string;
  currentProgress: number;
  maxProgress: number;
  unlocked: boolean;
  creditReward: number;
  claimed: boolean;
}

export interface PlayerProfile {
  credits: number;
  totalVaporized: number;
  totalGatesCleared: number;
  totalOrbsCollected: number;
  totalGrazes: number;
  totalHyperUsed: number;
  upgrades: Record<UpgradeId, number>;
  unlockedTrophyIds: string[];
  claimedTrophyIds: string[];
}

export type AchievementId =
  | 'graze_master'
  | 'distance_runner'
  | 'pipe_vanguard'
  | 'coin_collector'
  | 'hyper_overdrive'
  | 'event_horizon';

export type AchievementIconKey =
  | 'crosshair'
  | 'compass'
  | 'shield'
  | 'coins'
  | 'zap'
  | 'crown';

export interface AchievementStats {
  totalGrazeCount: number;
  totalDistanceUnits: number;
  totalGatesCleared: number;
  totalCoins: number;
  totalHyperDashes: number;
  bestScore: number;
}

export interface LiveRunTelemetry {
  runGrazes: number;
  runDistanceUnits: number;
  runGatesCleared: number;
  runCoins: number;
  runHyperDashes: number;
  currentScore: number;
}

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  shortTitle: string;
  description: string;
  metricKey: keyof AchievementStats;
  target: number;
  unit: string;
  iconKey: AchievementIconKey;
  accentColor: string;
}

export interface AchievementProgress extends AchievementDefinition {
  current: number;
  progressRatio: number;
  unlocked: boolean;
  unlockedAt?: number;
}

