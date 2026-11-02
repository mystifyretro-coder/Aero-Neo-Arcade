import React from 'react';
import { RunStats } from '../types/game';
import { RotateCcw, Trophy, Award, Zap, Compass } from 'lucide-react';

interface GameOverModalProps {
  stats: RunStats;
  onRestart: () => void;
  isNewHighScore: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  isNewHighScore,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-700/80 rounded-xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-arcade tracking-widest text-red-500 uppercase">
              FLIGHT SYSTEM TERMINATED
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-arcade tracking-tight text-white">
              RUN COMPLETE
            </h2>
          </div>

          {/* Flight Rank Badge */}
          <div className="flex flex-col items-center justify-center px-4 py-2 border border-slate-700 rounded-lg bg-slate-950">
            <span className="text-[10px] text-slate-400 font-arcade uppercase">Rank</span>
            <span className={`text-2xl font-black font-arcade ${
              stats.rank.startsWith('S') ? 'text-amber-400' : stats.rank === 'A' ? 'text-cyan-400' : 'text-slate-300'
            }`}>
              {stats.rank}
            </span>
          </div>
        </div>

        {/* Primary Scores Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col">
            <span className="text-xs text-slate-400 font-arcade uppercase flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              Final Score
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold font-telemetry text-white mt-1">
              {stats.score}
            </span>
            {isNewHighScore && (
              <span className="text-[11px] font-arcade font-bold text-amber-400 mt-1">
                ★ NEW ALL-TIME RECORD!
              </span>
            )}
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col">
            <span className="text-xs text-slate-400 font-arcade uppercase flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              High Score
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold font-telemetry text-amber-300 mt-1">
              {stats.highScore}
            </span>
          </div>
        </div>

        {/* Flight Telemetry Breakdown */}
        <div className="border border-slate-800/80 rounded-lg bg-slate-950/50 p-3.5 text-xs text-slate-300 space-y-2 font-telemetry">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Sector Reached</span>
            <span className="font-arcade font-bold uppercase text-white tracking-wider">
              {stats.levelReached}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Gates Cleared</span>
            <span className="font-bold text-white">{stats.gatesCleared}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Graze Maneuvers
            </span>
            <span className="font-bold text-amber-300">+{stats.grazeCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              Peak Velocity
            </span>
            <span className="font-bold text-cyan-300">{stats.topSpeedKmH} KM/H</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Flight Distance</span>
            <span className="font-bold text-white">{stats.distanceTraveledMeters} M</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onRestart}
          autoFocus
          className="w-full py-3.5 px-6 rounded-lg bg-cyan-500 hover:bg-cyan-400 active:scale-[0.99] text-slate-950 font-arcade font-bold text-base tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RELAUNCH SYSTEM [SPACE]</span>
        </button>
      </div>
    </div>
  );
};
