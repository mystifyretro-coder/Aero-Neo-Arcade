import React from 'react';
import { Award, Eye, Play, Settings, Sparkles, Zap } from 'lucide-react';
import { LEVELS } from '../game/constants';

interface TitleMenuProps {
  onStartGame: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
  highScore: number;
}

export const TitleMenu: React.FC<TitleMenuProps> = ({
  onStartGame,
  onOpenAchievements,
  onOpenSettings,
  unlockedAchievementsCount,
  totalAchievementsCount,
  highScore,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900/95 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.85)] flex flex-col gap-6">
        {/* Title Lockup */}
        <div className="text-center">
          <div className="text-xs tracking-widest text-cyan-400 font-arcade mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2026 Arcade Flight Simulation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black font-arcade tracking-tight text-white uppercase drop-shadow-[0_0_20px_rgba(0,242,255,0.4)]">
            AERO <span className="text-cyan-400">FLIGHT</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Ultra-wide horizontal arcade reaction flight in Ascent. Dodge high-voltage pylons, graze hazard barriers, and surge forward with precision timing.
          </p>
        </div>

        {/* Level Progression Briefing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-lg border border-cyan-500/40 bg-cyan-950/20 flex flex-col">
            <span className="text-[10px] font-arcade text-cyan-400 tracking-wider">
              Stage 01 · 0-14 pts
            </span>
            <span className="text-base font-bold font-arcade text-white">
              {LEVELS.ascent.name}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Dawn Skyport
            </span>
          </div>

          <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-950/20 flex flex-col">
            <span className="text-[10px] font-arcade text-emerald-400 tracking-wider">
              Stage 02 · 15-34 pts
            </span>
            <span className="text-base font-bold font-arcade text-white">
              {LEVELS.catalyst.name}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Ion Storm Conduits
            </span>
          </div>

          <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-950/20 flex flex-col">
            <span className="text-[10px] font-arcade text-rose-400 tracking-wider">
              Stage 03 · 35+ pts
            </span>
            <span className="text-base font-bold font-arcade text-white">
              {LEVELS.singularity.name}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Event Horizon
            </span>
          </div>
        </div>

        {/* Features & Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-arcade font-bold text-slate-200 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Ultrawide Horizon
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Full widescreen view with your craft positioned on the left, letting you see upcoming barriers across the screen for lightning-fast reflexes.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="font-arcade font-bold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Graze &amp; Milestones
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Skim near barrier borders for Graze points and unlock HUD badges like Graze Master (1,000 grazes) and Distance Runner (10,000 units).
            </p>
          </div>
        </div>

        {/* Key Bindings & Achievements Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-3 font-telemetry tabular-nums">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded text-[11px]">Space / Click</span>
              <span>Thrust</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded text-[11px]">Shift</span>
              <span>Hyper</span>
            </div>
            {highScore > 0 && (
              <div className="hidden sm:flex items-center gap-1 text-slate-300">
                <span>· Best {highScore}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAchievements}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Achievements ({unlockedAchievementsCount}/{totalAchievementsCount})
              </span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={onStartGame}
          className="w-full py-4 px-6 rounded-lg bg-cyan-400 hover:bg-cyan-300 active:scale-[0.99] text-slate-950 font-arcade font-bold text-base tracking-widest uppercase flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all cursor-pointer whitespace-nowrap"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Engage System [Press Space]</span>
        </button>
      </div>
    </div>
  );
};

