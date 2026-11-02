import React, { useState } from 'react';
import { AchievementProgress, LevelConfig } from '../types/game';
import { renderAchievementIcon } from './AchievementToast';
import { Award, Check, Lock, Music, Pause, Play, Settings, Volume2, VolumeX, Zap } from 'lucide-react';

interface ArcadeHUDProps {
  score: number;
  highScore: number;
  coins: number;
  distanceUnits: number;
  totalGrazeCount: number;
  totalDistanceUnits: number;
  achievements: AchievementProgress[];
  lastRunScore?: number | null;
  currentLevel: LevelConfig;
  grazeCount: number;
  hyperGauge: number;
  isPaused: boolean;
  isMuted: boolean;
  isMusicMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onTriggerHyper: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
}

export const ArcadeHUD: React.FC<ArcadeHUDProps> = ({
  score,
  highScore,
  coins,
  distanceUnits,
  totalGrazeCount,
  totalDistanceUnits,
  achievements,
  lastRunScore,
  currentLevel,
  grazeCount,
  hyperGauge,
  isPaused,
  isMuted,
  isMusicMuted,
  onTogglePause,
  onToggleMute,
  onToggleMusic,
  onTriggerHyper,
  onOpenAchievements,
  onOpenSettings,
  scanlinesEnabled,
  onToggleScanlines,
}) => {
  const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null);
  const hyperReady = hyperGauge >= 100;
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const hoveredBadge = achievements.find((a) => a.id === hoveredBadgeId) || null;

  return (
    <header
      data-hud-interactive="true"
      className="absolute top-0 left-0 right-0 z-30 pointer-events-none px-4 md:px-8 pt-2.5 flex flex-col gap-2"
    >
      {/* Primary HUD Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Zone 1: Stage, Coins & Live Run Telemetry */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="border px-3 py-1 bg-slate-950/75 backdrop-blur-md rounded transition-colors shrink-0"
            style={{ borderColor: currentLevel.primaryColor }}
          >
            <div className="text-[10px] tracking-wider text-slate-400 font-arcade">
              Stage 0{currentLevel.stageNumber}
            </div>
            <div
              className="text-base md:text-lg font-bold font-arcade tracking-wider leading-none"
              style={{ color: currentLevel.primaryColor }}
            >
              {currentLevel.name}
            </div>
          </div>

          {/* Automatic Coins Counter */}
          <div className="flex items-center gap-1.5 border border-amber-500/50 bg-slate-950/75 backdrop-blur-md px-2.5 py-1 rounded shrink-0">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-200 flex items-center justify-center text-[10px] font-black text-amber-950">
              ¢
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] tracking-wider text-amber-300/80 font-arcade leading-none">
                Coins
              </span>
              <span className="text-xs md:text-sm font-telemetry font-bold text-amber-400 leading-tight tabular-nums">
                {coins.toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Unboxed Live Distance & Graze Telemetry */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-telemetry tabular-nums text-slate-300 pl-1">
            <span>
              Dist <strong className="text-cyan-400">{distanceUnits.toLocaleString()}u</strong>
              <span className="text-slate-500"> ({totalDistanceUnits.toLocaleString()} total)</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">
              ·
            </span>
            <span>
              Graze <strong className="text-amber-400">{grazeCount}</strong>
              <span className="text-slate-500"> ({totalGrazeCount.toLocaleString()} total)</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Main Score & High Score */}
        <div className="flex flex-col items-center shrink-0">
          <div className="text-3xl md:text-4xl font-extrabold font-telemetry tabular-nums tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.35)] leading-none">
            {score.toString().padStart(3, '0')}
          </div>
          <div className="text-[11px] font-telemetry tabular-nums text-slate-400 flex items-center gap-2 mt-1">
            <span>Best</span>
            <span className="text-cyan-400 font-bold">{highScore.toString().padStart(3, '0')}</span>
            {lastRunScore !== null && lastRunScore !== undefined && (
              <>
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
                <span>Last</span>
                <span className="text-amber-400 font-bold">
                  {lastRunScore.toString().padStart(3, '0')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Zone 3: Hyper Meter & Controls */}
        <div className="flex items-center gap-2 md:gap-3 pointer-events-auto shrink-0">
          {/* Hyper Dash Gauge */}
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={onTriggerHyper}
              disabled={!hyperReady}
              title="Emergency Hyper Dash (Press Shift or Right-Click)"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-arcade font-bold transition-colors whitespace-nowrap shrink-0 ${
                hyperReady
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 cursor-pointer'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${hyperReady ? 'text-amber-400' : 'text-slate-600'}`} />
              <span className="hidden sm:inline">Hyper [Shift]</span>
              <span className="sm:hidden">Hyper</span>
            </button>

            <div className="w-20 md:w-28 h-1.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-transform duration-150 origin-left ${
                  hyperReady ? 'bg-amber-400' : 'bg-cyan-500'
                }`}
                style={{ transform: `scaleX(${Math.min(1, hyperGauge / 100)})` }}
              />
            </div>
          </div>

          {/* Audio & Display Toggles */}
          <div className="flex items-center gap-1 bg-slate-950/75 border border-slate-800 rounded p-0.5 backdrop-blur-md">
            <button
              onClick={onToggleScanlines}
              title={scanlinesEnabled ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
              className={`px-2 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                scanlinesEnabled
                  ? 'text-cyan-400 bg-cyan-950/40'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              CRT
            </button>

            <button
              onClick={onToggleMusic}
              title={isMusicMuted ? 'Unmute Synth Music' : 'Mute Synth Music'}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                !isMusicMuted ? 'text-cyan-400' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
              className="p-1.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onOpenSettings}
              title="Open Settings"
              aria-label="Open Settings"
              className="p-1.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onTogglePause}
              title={isPaused ? 'Resume Game' : 'Pause Game'}
              className="p-1.5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Unlockable Achievement Badges Rack in HUD */}
      <div className="relative flex items-center justify-between gap-3 pointer-events-auto self-start">
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/90 backdrop-blur-md rounded-lg px-2.5 py-1.5">
          <button
            onClick={onOpenAchievements}
            title="Inspect all flight achievements"
            className="flex items-center gap-1.5 pr-2 mr-0.5 border-r border-slate-800 text-xs font-arcade text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Badges</span>
            <span className="font-telemetry tabular-nums text-amber-400 font-bold">
              {unlockedCount}/{achievements.length}
            </span>
          </button>

          <div className="flex items-center gap-1.5">
            {achievements.map((badge) => {
              const size = 28;
              const radius = 11.5;
              const circumference = 2 * Math.PI * radius;
              const strokeDashoffset = circumference * (1 - badge.progressRatio);
              const pct = Math.round(badge.progressRatio * 100);

              return (
                <button
                  key={badge.id}
                  onClick={onOpenAchievements}
                  onMouseEnter={() => setHoveredBadgeId(badge.id)}
                  onMouseLeave={() =>
                    setHoveredBadgeId((prev) => (prev === badge.id ? null : prev))
                  }
                  onFocus={() => setHoveredBadgeId(badge.id)}
                  onBlur={() =>
                    setHoveredBadgeId((prev) => (prev === badge.id ? null : prev))
                  }
                  aria-label={`${badge.title}: ${
                    badge.unlocked ? 'Unlocked' : `${pct}% complete`
                  }`}
                  className={`relative flex items-center gap-1.5 px-1.5 py-1 rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    badge.unlocked
                      ? 'bg-slate-900/95 border-slate-700 text-white hover:border-slate-500'
                      : 'bg-slate-950/60 border-slate-800/70 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                  }`}
                  style={
                    badge.unlocked
                      ? {
                          borderColor: `${badge.accentColor}88`,
                          boxShadow: `0 0 12px ${badge.accentColor}26`,
                        }
                      : undefined
                  }
                >
                  {/* Circular Progress & Badge Emblem */}
                  <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
                    <svg
                      width={size}
                      height={size}
                      viewBox={`0 0 ${size} ${size}`}
                      className="-rotate-90 absolute inset-0"
                    >
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(51, 65, 85, 0.55)"
                        strokeWidth="2"
                      />
                      <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={badge.unlocked ? badge.accentColor : '#94a3b8'}
                        strokeWidth="2"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span
                      style={{
                        color: badge.unlocked ? badge.accentColor : '#64748b',
                      }}
                    >
                      {renderAchievementIcon(badge.iconKey, 'w-3.5 h-3.5')}
                    </span>
                  </div>

                  {/* Compact Badge Label & Status on Medium+ Screens */}
                  <div className="hidden md:flex flex-col items-start pr-1">
                    <span
                      className={`text-[10px] font-arcade font-semibold leading-none ${
                        badge.unlocked ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {badge.title}
                    </span>
                    <span className="text-[10px] font-telemetry tabular-nums leading-tight mt-0.5 flex items-center gap-1">
                      {badge.unlocked ? (
                        <span
                          className="inline-flex items-center gap-0.5 font-semibold"
                          style={{ color: badge.accentColor }}
                        >
                          <Check className="w-2.5 h-2.5" />
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-slate-500 inline-flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          {Math.min(badge.current, badge.target).toLocaleString()}/
                          {badge.target.toLocaleString()}
                        </span>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hover / Focus Badge Detail Popover */}
        {hoveredBadge && (
          <div
            role="tooltip"
            className="absolute left-0 top-full mt-2 w-72 p-3.5 rounded-lg bg-slate-950/95 border border-slate-700 shadow-2xl backdrop-blur-md pointer-events-none z-40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold font-arcade text-white">
                {hoveredBadge.title}
              </span>
              <span
                className="text-[11px] font-telemetry tabular-nums font-semibold"
                style={{
                  color: hoveredBadge.unlocked ? hoveredBadge.accentColor : '#94a3b8',
                }}
              >
                {hoveredBadge.unlocked
                  ? 'Unlocked'
                  : `${Math.round(hoveredBadge.progressRatio * 100)}%`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {hoveredBadge.description}
            </p>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-telemetry tabular-nums text-slate-300">
              <span>Progress</span>
              <span>
                {Math.min(hoveredBadge.current, hoveredBadge.target).toLocaleString()} /{' '}
                {hoveredBadge.target.toLocaleString()} {hoveredBadge.unit}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-1">
              <div
                className="h-full origin-left transition-transform duration-150"
                style={{
                  backgroundColor: hoveredBadge.unlocked
                    ? hoveredBadge.accentColor
                    : '#94a3b8',
                  transform: `scaleX(${hoveredBadge.progressRatio})`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
