import React from 'react';
import { Music, Play, RotateCcw, Settings, Volume2, VolumeX } from 'lucide-react';
import { LevelConfig } from '../types/game';

interface PauseModalProps {
  pilotName: string;
  currentLevel: LevelConfig;
  score: number;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  isMusicMuted: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  pilotName,
  currentLevel,
  score,
  onResume,
  onRestart,
  onOpenSettings,
  isMuted,
  isMusicMuted,
  onToggleMute,
  onToggleMusic,
}) => {
  return (
    <div
      data-hud-interactive="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-xl p-6 shadow-2xl flex flex-col gap-5 text-center">
        <div>
          <div className="text-[11px] font-arcade tracking-widest text-cyan-400">
            Stage 0{currentLevel.stageNumber} · {currentLevel.name}
          </div>
          <h3 className="text-2xl font-bold font-arcade text-white mt-1">
            Simulation Paused
          </h3>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center justify-center gap-2 font-telemetry tabular-nums">
            <span>Score: {score}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-300 truncate max-w-[180px]">{pilotName}</span>
          </div>
        </div>

        {/* Audio controls */}
        <div className="flex items-center justify-center gap-2.5 py-2.5 border-y border-slate-800">
          <button
            onClick={onToggleMusic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-arcade border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              !isMusicMuted
                ? 'border-cyan-500/50 text-cyan-400 bg-cyan-950/30'
                : 'border-slate-800 text-slate-500'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Music</span>
          </button>

          <button
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-arcade border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              !isMuted
                ? 'border-cyan-500/50 text-cyan-400 bg-cyan-950/30'
                : 'border-slate-800 text-slate-500'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>SFX</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-arcade border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>Settings</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-arcade font-bold text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Flight [Esc]</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-arcade font-semibold text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Run</span>
          </button>
        </div>
      </div>
    </div>
  );
};
