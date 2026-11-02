import React, { useState } from 'react';
import { PlayerProfile, Trophy } from '../types/game';
import { INITIAL_TROPHIES } from '../game/profileManager';
import { X, Trophy as TrophyIcon, Check, Award, Coins, Sparkles, PlaneTakeoff, Compass, Gauge, Infinity, Crosshair, Flame, Zap, CircleDot, Wrench, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface TrophiesModalProps {
  profile: PlayerProfile;
  onClaimTrophy: (trophyId: string, reward: number) => void;
  onClose: () => void;
}

export const TrophiesModal: React.FC<TrophiesModalProps> = ({
  profile,
  onClaimTrophy,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'flight' | 'combat' | 'reflex' | 'arsenal'>('all');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'PlaneTakeoff': return <PlaneTakeoff className="w-5 h-5 text-cyan-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-blue-400" />;
      case 'Gauge': return <Gauge className="w-5 h-5 text-emerald-400" />;
      case 'Infinity': return <Infinity className="w-5 h-5 text-purple-400" />;
      case 'Crosshair': return <Crosshair className="w-5 h-5 text-cyan-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-rose-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'CircleDot': return <CircleDot className="w-5 h-5 text-yellow-400" />;
      case 'Trophy': return <TrophyIcon className="w-5 h-5 text-amber-400" />;
      case 'Wrench': return <Wrench className="w-5 h-5 text-cyan-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-blue-400" />;
      default: return <Award className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getTrophyProgress = (trophy: Trophy): number => {
    switch (trophy.id) {
      case 'first_flight':
        return profile.unlockedTrophyIds.includes('first_flight') ? 1 : 0;
      case 'stage_ascent':
        return Math.min(trophy.maxProgress, profile.totalGatesCleared);
      case 'stage_catalyst':
        return profile.unlockedTrophyIds.includes('stage_catalyst') ? 15 : 0;
      case 'stage_singularity':
        return profile.unlockedTrophyIds.includes('stage_singularity') ? 35 : 0;
      case 'demolisher_25':
        return Math.min(trophy.maxProgress, profile.totalVaporized);
      case 'demolisher_100':
        return Math.min(trophy.maxProgress, profile.totalVaporized);
      case 'graze_expert':
        return Math.min(trophy.maxProgress, profile.totalGrazes);
      case 'hyper_streak':
        return Math.min(trophy.maxProgress, profile.totalHyperUsed);
      case 'orb_collector':
        return Math.min(trophy.maxProgress, profile.totalOrbsCollected);
      case 'high_scorer':
        return profile.unlockedTrophyIds.includes('high_scorer') ? 50 : 0;
      case 'store_shopper':
        return Object.values(profile.upgrades).some((lvl: number) => lvl > 0) ? 1 : 0;
      case 'shield_master':
        return profile.unlockedTrophyIds.includes('shield_master') ? 1 : 0;
      default:
        return 0;
    }
  };

  const trophies = INITIAL_TROPHIES.map((t) => {
    const progress = getTrophyProgress(t);
    const unlocked = profile.unlockedTrophyIds.includes(t.id) || progress >= t.maxProgress;
    const claimed = profile.claimedTrophyIds.includes(t.id);
    return {
      ...t,
      currentProgress: progress,
      unlocked,
      claimed,
    };
  });

  const unlockedCount = trophies.filter((t) => t.unlocked).length;

  const filteredTrophies = selectedCategory === 'all'
    ? trophies
    : trophies.filter((t) => t.category === selectedCategory);

  const handleClaim = (trophy: Trophy) => {
    if (!trophy.unlocked || trophy.claimed) return;
    soundEngine.playTrophyUnlock();
    onClaimTrophy(trophy.id, trophy.creditReward);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="text-[11px] font-arcade uppercase tracking-widest text-amber-400">
              HALL OF RECORDS & ACHIEVEMENTS
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-arcade text-white tracking-wide flex items-center gap-2">
              <span>ARCADE TROPHIES</span>
              <span className="text-xs font-telemetry px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-normal">
                {unlockedCount}/{trophies.length} UNLOCKED
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/30">
              <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-sm font-telemetry font-bold text-amber-300">
                {profile.credits}
              </span>
              <span className="text-[10px] text-amber-400/80 uppercase font-arcade">CREDITS</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs font-arcade">
          {(['all', 'flight', 'combat', 'reflex', 'arsenal'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Trophy Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrophies.map((trophy) => (
            <div
              key={trophy.id}
              className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                trophy.unlocked
                  ? 'border-amber-500/40 bg-slate-950/70 shadow-[0_0_15px_rgba(251,191,36,0.06)]'
                  : 'border-slate-800/70 bg-slate-950/40 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg border ${
                        trophy.unlocked
                          ? 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_10px_rgba(251,191,36,0.25)]'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      {getIcon(trophy.iconName)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-arcade text-white">
                        {trophy.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {trophy.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-telemetry">
                    <span>PROGRESS</span>
                    <span>
                      {trophy.currentProgress} / {trophy.maxProgress}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        trophy.unlocked ? 'bg-amber-400' : 'bg-cyan-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (trophy.currentProgress / trophy.maxProgress) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Claim / Status Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-telemetry font-bold text-amber-300">
                    +{trophy.creditReward}
                  </span>
                  <span className="text-[10px] text-slate-500 font-arcade">CREDITS</span>
                </div>

                {trophy.claimed ? (
                  <div className="flex items-center gap-1 text-[11px] font-arcade text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>CLAIMED</span>
                  </div>
                ) : trophy.unlocked ? (
                  <button
                    onClick={() => handleClaim(trophy)}
                    className="px-3 py-1 rounded bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-arcade font-bold text-xs tracking-wide uppercase transition-all shadow-[0_0_12px_rgba(251,191,36,0.4)] cursor-pointer"
                  >
                    CLAIM REWARD
                  </button>
                ) : (
                  <span className="text-[11px] font-arcade text-slate-500 uppercase">
                    LOCKED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 font-telemetry">
          <span>Complete objectives to claim bounties and finance your upgrade fleet!</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-arcade uppercase transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
