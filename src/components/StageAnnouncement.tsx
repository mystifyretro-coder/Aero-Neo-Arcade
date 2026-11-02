import React, { useEffect, useState } from 'react';
import { LevelConfig } from '../types/game';

interface StageAnnouncementProps {
  level: LevelConfig | null;
}

export const StageAnnouncement: React.FC<StageAnnouncementProps> = ({ level }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!level) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, [level]);

  if (!visible || !level) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center text-center animate-fade-in px-6 py-4 bg-slate-950/80 border-y border-slate-700 backdrop-blur-md w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="text-xs uppercase tracking-widest text-slate-400 font-arcade mb-1">
          STAGE 0{level.stageNumber} REACHED
        </div>
        <div
          className="text-4xl md:text-5xl font-extrabold font-arcade tracking-widest uppercase"
          style={{ 
            color: level.primaryColor,
            textShadow: `0 0 25px ${level.glowColor}`
          }}
        >
          {level.name}
        </div>
        <div className="text-sm font-arcade text-slate-300 mt-1 tracking-wide">
          {level.subtitle}
        </div>
      </div>
    </div>
  );
};
