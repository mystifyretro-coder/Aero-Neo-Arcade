import { PlayerProfile, StoreUpgrade, Trophy, UpgradeId } from '../types/game';

const PROFILE_KEY = 'aero_arcade_2026_profile';

export const INITIAL_UPGRADES: StoreUpgrade[] = [
  {
    id: 'triLaser',
    name: 'Spread Laser Cannon',
    description: 'Upgrades your single laser into multi-angle spread beams to clear all heights simultaneously.',
    iconName: 'Crosshair',
    level: 0,
    maxLevel: 3,
    baseCost: 150,
    costMultiplier: 1.8,
    currentBenefit: 'Standard Dual Lasers',
    nextBenefit: 'Tri-Beam Spread (Fires 3 lasers at wide angles)',
  },
  {
    id: 'quantumShield',
    name: 'Quantum Hull Shield',
    description: 'Deploys an overcharged kinetic shield that absorbs crash collisions without death.',
    iconName: 'Shield',
    level: 0,
    maxLevel: 3,
    baseCost: 200,
    costMultiplier: 2.0,
    currentBenefit: 'No extra shield charges',
    nextBenefit: 'Absorbs 1 collision impact safely',
  },
  {
    id: 'orbMagnet',
    name: 'Graviton Orb Magnet',
    description: 'Magnetically draws distant Energy Orbs straight toward your craft.',
    iconName: 'Magnet',
    level: 0,
    maxLevel: 3,
    baseCost: 120,
    costMultiplier: 1.6,
    currentBenefit: 'Touch collection only',
    nextBenefit: 'Orb pull radius 160px',
  },
  {
    id: 'hyperCapacitor',
    name: 'Hyper Drive Capacitor',
    description: 'Accelerates Hyper Gauge charging so you can trigger invulnerability dashes much more frequently.',
    iconName: 'Zap',
    level: 0,
    maxLevel: 3,
    baseCost: 180,
    costMultiplier: 1.8,
    currentBenefit: 'Standard charge speed',
    nextBenefit: '+50% faster Hyper Gauge filling',
  },
  {
    id: 'antiGravity',
    name: 'Repulsor Glide Dampener',
    description: 'Reduces downward gravitational pull for ultra-smooth, effortless hover control.',
    iconName: 'Feather',
    level: 0,
    maxLevel: 3,
    baseCost: 140,
    costMultiplier: 1.7,
    currentBenefit: 'Normal gravity (880-980 px/s²)',
    nextBenefit: '-20% reduced gravity for easier gliding',
  },
  {
    id: 'plasmaOvercharge',
    name: 'Plasma Bolt Overcharge',
    description: 'Increases laser beam thickness, vaporizes larger blast radiuses, and awards +50% bonus credits.',
    iconName: 'Flame',
    level: 0,
    maxLevel: 3,
    baseCost: 220,
    costMultiplier: 2.0,
    currentBenefit: 'Standard laser power',
    nextBenefit: 'Thicker laser beams + 1.5x Credit drops',
  },
];

export const INITIAL_TROPHIES: Trophy[] = [
  {
    id: 'first_flight',
    title: 'First Sortie',
    description: 'Launch your interceptor craft from the starting runway.',
    category: 'flight',
    iconName: 'PlaneTakeoff',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    creditReward: 50,
    claimed: false,
  },
  {
    id: 'stage_ascent',
    title: 'Ascent Navigator',
    description: 'Clear 15 energy gates in Stage 1: Ascent.',
    category: 'flight',
    iconName: 'Compass',
    currentProgress: 0,
    maxProgress: 15,
    unlocked: false,
    creditReward: 100,
    claimed: false,
  },
  {
    id: 'stage_catalyst',
    title: 'Catalyst Breaker',
    description: 'Survive and reach Stage 2: Catalyst (Score 15+).',
    category: 'flight',
    iconName: 'Gauge',
    currentProgress: 0,
    maxProgress: 15,
    unlocked: false,
    creditReward: 200,
    claimed: false,
  },
  {
    id: 'stage_singularity',
    title: 'Singularity Conqueror',
    description: 'Enter the event horizon in Stage 3: Singularity (Score 35+).',
    category: 'flight',
    iconName: 'Infinity',
    currentProgress: 0,
    maxProgress: 35,
    unlocked: false,
    creditReward: 500,
    claimed: false,
  },
  {
    id: 'demolisher_25',
    title: 'Laser Demolisher',
    description: 'Vaporize 25 obstacle pylons with your laser cannon.',
    category: 'combat',
    iconName: 'Crosshair',
    currentProgress: 0,
    maxProgress: 25,
    unlocked: false,
    creditReward: 150,
    claimed: false,
  },
  {
    id: 'demolisher_100',
    title: 'Annihilation Engine',
    description: 'Vaporize 100 obstacle pylons across all runs.',
    category: 'combat',
    iconName: 'Flame',
    currentProgress: 0,
    maxProgress: 100,
    unlocked: false,
    creditReward: 350,
    claimed: false,
  },
  {
    id: 'graze_expert',
    title: 'Edge Dancer',
    description: 'Perform 15 Graze near-miss maneuvers.',
    category: 'reflex',
    iconName: 'Sparkles',
    currentProgress: 0,
    maxProgress: 15,
    unlocked: false,
    creditReward: 150,
    claimed: false,
  },
  {
    id: 'hyper_streak',
    title: 'Hyper Overdrive',
    description: 'Engage Hyper Dash invulnerability 5 times.',
    category: 'combat',
    iconName: 'Zap',
    currentProgress: 0,
    maxProgress: 5,
    unlocked: false,
    creditReward: 200,
    claimed: false,
  },
  {
    id: 'orb_collector',
    title: 'Core Harvester',
    description: 'Collect 15 Energy Cores.',
    category: 'arsenal',
    iconName: 'CircleDot',
    currentProgress: 0,
    maxProgress: 15,
    unlocked: false,
    creditReward: 180,
    claimed: false,
  },
  {
    id: 'high_scorer',
    title: 'Century Ace',
    description: 'Achieve a run score of 50 or higher.',
    category: 'flight',
    iconName: 'Trophy',
    currentProgress: 0,
    maxProgress: 50,
    unlocked: false,
    creditReward: 400,
    claimed: false,
  },
  {
    id: 'store_shopper',
    title: 'Hangar Technician',
    description: 'Acquire your first upgrade from the Hangar Store.',
    category: 'arsenal',
    iconName: 'Wrench',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    creditReward: 120,
    claimed: false,
  },
  {
    id: 'shield_master',
    title: 'Kinetic Deflector',
    description: 'Absorb a crash impact using Quantum Hull Shield.',
    category: 'reflex',
    iconName: 'ShieldAlert',
    currentProgress: 0,
    maxProgress: 1,
    unlocked: false,
    creditReward: 150,
    claimed: false,
  },
];

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        credits: data.credits ?? 100, // Start with 100 Nano-Credits bonus!
        totalVaporized: data.totalVaporized ?? 0,
        totalGatesCleared: data.totalGatesCleared ?? 0,
        totalOrbsCollected: data.totalOrbsCollected ?? 0,
        totalGrazes: data.totalGrazes ?? 0,
        totalHyperUsed: data.totalHyperUsed ?? 0,
        upgrades: {
          triLaser: data.upgrades?.triLaser ?? 0,
          quantumShield: data.upgrades?.quantumShield ?? 0,
          orbMagnet: data.upgrades?.orbMagnet ?? 0,
          hyperCapacitor: data.upgrades?.hyperCapacitor ?? 0,
          antiGravity: data.upgrades?.antiGravity ?? 0,
          plasmaOvercharge: data.upgrades?.plasmaOvercharge ?? 0,
        },
        unlockedTrophyIds: Array.isArray(data.unlockedTrophyIds) ? data.unlockedTrophyIds : [],
        claimedTrophyIds: Array.isArray(data.claimedTrophyIds) ? data.claimedTrophyIds : [],
      };
    }
  } catch {
    // fallback
  }

  return {
    credits: 100,
    totalVaporized: 0,
    totalGatesCleared: 0,
    totalOrbsCollected: 0,
    totalGrazes: 0,
    totalHyperUsed: 0,
    upgrades: {
      triLaser: 0,
      quantumShield: 0,
      orbMagnet: 0,
      hyperCapacitor: 0,
      antiGravity: 0,
      plasmaOvercharge: 0,
    },
    unlockedTrophyIds: [],
    claimedTrophyIds: [],
  };
}

export function saveProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // safe fallback
  }
}

export function calculateUpgradeCost(upgrade: StoreUpgrade, currentLevel: number): number {
  if (currentLevel >= upgrade.maxLevel) return 0;
  return Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
}

export function getUpgradeBenefits(id: UpgradeId, level: number): { current: string; next: string } {
  switch (id) {
    case 'triLaser':
      if (level === 0) return { current: 'Standard Dual Lasers', next: 'Lv 1: Tri-Beam Spread (+30° Angled Lasers)' };
      if (level === 1) return { current: 'Lv 1: Tri-Beam Spread', next: 'Lv 2: Quad Heavy Cannons (+45° & -45° Coverage)' };
      if (level === 2) return { current: 'Lv 2: Quad Heavy Cannons', next: 'Lv 3: Penta-Omni Beam (5 Multi-Lasers)' };
      return { current: 'Lv 3: Max Omni-Laser Spread', next: 'Maxed Out' };

    case 'quantumShield':
      if (level === 0) return { current: 'No extra shields', next: 'Lv 1: Absorbs 1 crash hit without dying' };
      if (level === 1) return { current: 'Lv 1: 1 Shield Hit Charge', next: 'Lv 2: Absorbs 2 crash impacts safely' };
      if (level === 2) return { current: 'Lv 2: 2 Shield Hit Charges', next: 'Lv 3: Absorbs 3 crash impacts safely' };
      return { current: 'Lv 3: 3 Shield Hit Charges', next: 'Maxed Out' };

    case 'orbMagnet':
      if (level === 0) return { current: 'Touch collection only', next: 'Lv 1: Sucks orbs from 160px distance' };
      if (level === 1) return { current: 'Lv 1: 160px Magnet Reach', next: 'Lv 2: Sucks orbs from 280px distance' };
      if (level === 2) return { current: 'Lv 2: 280px Magnet Reach', next: 'Lv 3: Massive 420px Screen Magnet Reach' };
      return { current: 'Lv 3: 420px Screen Magnet Reach', next: 'Maxed Out' };

    case 'hyperCapacitor':
      if (level === 0) return { current: 'Standard charge speed', next: 'Lv 1: +50% faster Hyper Gauge generation' };
      if (level === 1) return { current: 'Lv 1: +50% Hyper Charge', next: 'Lv 2: +100% (2x) Hyper Gauge generation' };
      if (level === 2) return { current: 'Lv 2: +100% Hyper Charge', next: 'Lv 3: +180% (Near-instant Hyper dashes)' };
      return { current: 'Lv 3: +180% Ultra Hyper Charge', next: 'Maxed Out' };

    case 'antiGravity':
      if (level === 0) return { current: 'Normal heavy gravity', next: 'Lv 1: -20% gravity for smooth gliding' };
      if (level === 1) return { current: 'Lv 1: -20% Light Gravity', next: 'Lv 2: -35% gravity for effortless flight' };
      if (level === 2) return { current: 'Lv 2: -35% Float Gravity', next: 'Lv 3: -50% gravity (Featherweight Glide)' };
      return { current: 'Lv 3: Featherweight Glide', next: 'Maxed Out' };

    case 'plasmaOvercharge':
      if (level === 0) return { current: 'Normal laser bolts', next: 'Lv 1: +40% beam width & +30% Credit drops' };
      if (level === 1) return { current: 'Lv 1: +40% Plasma Width', next: 'Lv 2: +80% beam width & +60% Credit drops' };
      if (level === 2) return { current: 'Lv 2: +80% Plasma Width', next: 'Lv 3: Colossal Mega-Beams & 2x Credits' };
      return { current: 'Lv 3: Colossal Mega-Beams & 2x Credits', next: 'Maxed Out' };

    default:
      return { current: 'Standard Configuration', next: 'Next Level' };
  }
}
