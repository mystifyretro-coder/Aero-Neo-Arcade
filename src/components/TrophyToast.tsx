import React from 'react';
import { Trophy } from '../types/game';
import { Trophy as TrophyIcon, Sparkles } from 'lucide-react';

interface TrophyToastProps {
  trophy: Trophy | null;
}

export const TrophyToast: React.FC<TrophyToastProps> = ({ trophy }) => {
  if (!trophy) return null;

  return (
    <div className="fixed top-16 right-6 z-50 pointer-events-none animate-slide-in">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/95 border border-amber-400/80 rounded-xl shadow-[0_0_30px_rgba(251,191,36,0.35)] backdrop-blur-md">
        <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-400/50">
          <TrophyIcon className="w-5 h-5 text-amber-400 animate-bounce" />
        </div>
        <div>
          <div className="text-[10px] uppercase font-arcade tracking-widest text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>TROPHY UNLOCKED!</span>
          </div>
          <div className="text-sm font-bold font-arcade text-white">
            {trophy.title}
          </div>
          <div className="text-[11px] text-slate-300 font-telemetry">
            +{trophy.creditReward} Nano-Credits Bounty
          </div>
        </div>
      </div>
    </div>
  );
};
