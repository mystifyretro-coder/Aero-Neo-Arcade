import React, { useState } from 'react';
import { Monitor, Music, Sliders, User, Volume2, VolumeX, X } from 'lucide-react';

interface SettingsModalProps {
  pilotName: string;
  onSavePilotName: (name: string) => void;
  masterVolume: number;
  onChangeMasterVolume: (volume: number) => void;
  isMuted: boolean;
  isMusicMuted: boolean;
  scanlinesEnabled: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleScanlines: () => void;
  onClose: () => void;
}

export const DEFAULT_SETTINGS_NAME = 'Advait Sankrityayan Brain';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  pilotName,
  onSavePilotName,
  masterVolume,
  onChangeMasterVolume,
  isMuted,
  isMusicMuted,
  scanlinesEnabled,
  onToggleMute,
  onToggleMusic,
  onToggleScanlines,
  onClose,
}) => {
  const [draftName, setDraftName] = useState(pilotName);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftName.trim() || DEFAULT_SETTINGS_NAME;
    setDraftName(trimmed);
    onSavePilotName(trimmed);
  };

  return (
    <div
      data-hud-interactive="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-7 shadow-2xl flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400 shrink-0" />
            <h2 className="text-xl font-bold font-arcade text-white tracking-wide">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name Section */}
        <form onSubmit={handleSaveName} className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="settings-pilot-name"
              className="text-xs font-medium text-slate-300 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Name</span>
            </label>
            <span className="text-xs font-telemetry text-cyan-400 font-semibold truncate max-w-[220px]">
              {pilotName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="settings-pilot-name"
              type="text"
              value={draftName}
              onChange={(e) => {
                setDraftName(e.target.value);
                onSavePilotName(e.target.value.trim() || DEFAULT_SETTINGS_NAME);
              }}
              placeholder={DEFAULT_SETTINGS_NAME}
              maxLength={48}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            {draftName !== DEFAULT_SETTINGS_NAME && (
              <button
                type="button"
                onClick={() => {
                  setDraftName(DEFAULT_SETTINGS_NAME);
                  onSavePilotName(DEFAULT_SETTINGS_NAME);
                }}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {/* Audio & Display Controls */}
        <div className="space-y-4 border-t border-slate-800 pt-5">
          {/* Master Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Master Volume</span>
              <span className="font-telemetry tabular-nums text-cyan-400 font-semibold">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(masterVolume * 100)}
              onChange={(e) => onChangeMasterVolume(Number(e.target.value) / 100)}
              aria-label="Master Volume"
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Toggle Rows */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              )}
              <span>Sound Effects</span>
            </div>
            <button
              type="button"
              onClick={onToggleMute}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                !isMuted
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {!isMuted ? 'Enabled' : 'Muted'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Music
                className={`w-4 h-4 ${
                  !isMusicMuted ? 'text-cyan-400' : 'text-slate-500'
                }`}
              />
              <span>Synth Background Music</span>
            </div>
            <button
              type="button"
              onClick={onToggleMusic}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                !isMusicMuted
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {!isMusicMuted ? 'Enabled' : 'Muted'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Monitor
                className={`w-4 h-4 ${
                  scanlinesEnabled ? 'text-cyan-400' : 'text-slate-500'
                }`}
              />
              <span>CRT Scanline Overlay</span>
            </div>
            <button
              type="button"
              onClick={onToggleScanlines}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                scanlinesEnabled
                  ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {scanlinesEnabled ? 'Enabled' : 'Off'}
            </button>
          </div>
        </div>

        {/* Core Attribution Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-slate-800 pt-4 text-xs text-slate-400">
          <div className="truncate">
            Core Brain: <span className="text-slate-200 font-medium">Advait Sankrityayan Brain</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-arcade font-bold text-xs tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
