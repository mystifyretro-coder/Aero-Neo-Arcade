import React from 'react';
import { AchievementIconKey, AchievementProgress } from '../types/game';
import { Award, Coins, Compass, Crosshair, Crown, Shield, Zap } from 'lucide-react';

export const renderAchievementIcon = (
  iconKey: AchievementIconKey,
  className = 'w-4 h-4'
) => {
  switch (iconKey) {
    case 'crosshair':
      return <Crosshair className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'coins':
      return <Coins className={className} />;
    case 'zap':
      return <Zap className={className} />;
    case 'crown':
      return <Crown className={className} />;
    default:
      return <Award className={className} />;
  }
};

interface AchievementToastProps {
  achievement: AchievementProgress | null;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement }) => {
  if (!achievement) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 right-4 md:right-8 z-50 pointer-events-none transition-all duration-200"
    >
      <div
        className="flex items-center gap-3 px-4 py-3 bg-slate-950/95 border rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.65)] backdrop-blur-md"
        style={{ borderColor: achievement.accentColor }}
      >
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center border shrink-0"
          style={{
            borderColor: `${achievement.accentColor}66`,
            backgroundColor: `${achievement.accentColor}1f`,
            color: achievement.accentColor,
          }}
        >
          {renderAchievementIcon(achievement.iconKey, 'w-4 h-4')}
        </div>
        <div className="min-w-0">
          <div
            className="text-[11px] font-arcade font-semibold tracking-wider"
            style={{ color: achievement.accentColor }}
          >
            Badge Unlocked
          </div>
          <div className="text-sm font-bold font-arcade text-white truncate">
            {achievement.title}
          </div>
          <div className="text-xs text-slate-400 font-telemetry tabular-nums">
            {achievement.target.toLocaleString()} {achievement.unit} milestone reached
          </div>
        </div>
      </div>
    </div>
  );
};
