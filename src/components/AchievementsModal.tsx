import React, { useState } from 'react';
import { AchievementProgress, AchievementStats } from '../types/game';
import { renderAchievementIcon } from './AchievementToast';
import { Award, Check, Lock, X } from 'lucide-react';

interface AchievementsModalProps {
  achievements: AchievementProgress[];
  stats: AchievementStats;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  stats,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const filtered = achievements.filter((a) => {
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return true;
  });

  return (
    <div
      data-hud-interactive="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-arcade text-white tracking-wide flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Flight Achievements</span>
            </h2>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2 font-telemetry tabular-nums">
              <span>
                {unlockedCount} of {achievements.length} badges unlocked
              </span>
              <span aria-hidden="true">·</span>
              <span>{stats.totalGrazeCount.toLocaleString()} total grazes</span>
              <span aria-hidden="true">·</span>
              <span>{stats.totalDistanceUnits.toLocaleString()} flight units</span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close achievements"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Filter Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({achievements.length})
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filter === 'unlocked'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter('locked')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filter === 'locked'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              In Progress ({achievements.length - unlockedCount})
            </button>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="col-span-full py-10 text-center text-sm text-slate-400">
              No badges match the selected filter yet. Keep flying to unlock milestones.
            </div>
          ) : (
            filtered.map((item) => {
              const pct = Math.round(item.progressRatio * 100);
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border transition-colors flex flex-col justify-between gap-3 ${
                    item.unlocked
                      ? 'bg-slate-950/90 border-slate-700'
                      : 'bg-slate-950/50 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0"
                      style={
                        item.unlocked
                          ? {
                              borderColor: item.accentColor,
                              backgroundColor: `${item.accentColor}22`,
                              color: item.accentColor,
                            }
                          : {
                              borderColor: 'rgba(51, 65, 85, 0.8)',
                              backgroundColor: 'rgba(15, 23, 42, 0.8)',
                              color: '#64748b',
                            }
                      }
                    >
                      {renderAchievementIcon(item.iconKey, 'w-5 h-5')}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold font-arcade text-white truncate">
                          {item.title}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-telemetry tabular-nums shrink-0 ${
                            item.unlocked ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {item.unlocked ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Unlocked</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>{pct}%</span>
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar & Tabular Count */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-telemetry tabular-nums text-slate-400">
                      <span>
                        {Math.min(item.current, item.target).toLocaleString()} /{' '}
                        {item.target.toLocaleString()} {item.unit}
                      </span>
                      {item.unlocked && item.current > item.target && (
                        <span className="text-slate-500">
                          Total: {item.current.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-transform duration-200 origin-left"
                        style={{
                          backgroundColor: item.unlocked ? item.accentColor : '#475569',
                          transform: `scaleX(${item.progressRatio})`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-arcade font-bold text-xs tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Back to Flight
          </button>
        </div>
      </div>
    </div>
  );
};
