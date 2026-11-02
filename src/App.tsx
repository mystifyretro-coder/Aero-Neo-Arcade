/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  AchievementId,
  AchievementProgress,
  AchievementStats,
  GameState,
  LevelConfig,
  LiveRunTelemetry,
} from './types/game';
import { LEVELS, HIGH_SCORE_KEY } from './game/constants';
import {
  buildAchievementProgressList,
  combineLiveStats,
  EMPTY_LIVE_TELEMETRY,
  loadAchievementsState,
  saveAchievementsState,
} from './game/achievements';
import { GameCanvas } from './game/GameCanvas';
import { ArcadeHUD } from './components/ArcadeHUD';
import { TitleMenu } from './components/TitleMenu';
import { PauseModal } from './components/PauseModal';
import { StageAnnouncement } from './components/StageAnnouncement';
import { AchievementsModal } from './components/AchievementsModal';
import { AchievementToast } from './components/AchievementToast';
import {
  DEFAULT_SETTINGS_NAME,
  SettingsModal,
} from './components/SettingsModal';
import { soundEngine } from './audio/soundEngine';

const SETTINGS_NAME_STORAGE_KEY = 'aero_arcade_2026_pilot_name';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lastRunScore, setLastRunScore] = useState<number | null>(null);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS.ascent);
  const [announcedLevel, setAnnouncedLevel] = useState<LevelConfig | null>(null);
  const [grazeCount, setGrazeCount] = useState(0);
  const [hyperGauge, setHyperGauge] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [pilotName, setPilotName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_NAME_STORAGE_KEY);
      return saved && saved.trim() ? saved : DEFAULT_SETTINGS_NAME;
    } catch {
      return DEFAULT_SETTINGS_NAME;
    }
  });

  // Achievements & Persistent Milestone State
  const initialAchievementsStore = useMemo(() => loadAchievementsState(), []);
  const [baseStats, setBaseStats] = useState<AchievementStats>(
    initialAchievementsStore.baseStats
  );
  const [unlockedAtMap, setUnlockedAtMap] = useState<
    Partial<Record<AchievementId, number>>
  >(initialAchievementsStore.unlockedAtMap);
  const [liveTelemetry, setLiveTelemetry] =
    useState<LiveRunTelemetry>(EMPTY_LIVE_TELEMETRY);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [pausedBeforeModal, setPausedBeforeModal] = useState(false);
  const [activeToastAchievement, setActiveToastAchievement] =
    useState<AchievementProgress | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Load High Score on initial mount & sync with bestScore in achievement store
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) {
        const val = parseInt(stored, 10);
        if (!isNaN(val)) {
          setHighScore(val);
          setBaseStats((prev) =>
            val > prev.bestScore ? { ...prev, bestScore: val } : prev
          );
        }
      }
    } catch {
      // Ignore localStorage errors in restricted environments
    }
  }, []);

  // Combined live + persistent achievement metrics
  const combinedStats = useMemo(
    () => combineLiveStats(baseStats, liveTelemetry),
    [baseStats, liveTelemetry]
  );

  const achievements = useMemo(
    () => buildAchievementProgressList(combinedStats, unlockedAtMap),
    [combinedStats, unlockedAtMap]
  );

  // Detect newly unlocked achievements in real time & persist immediately
  useEffect(() => {
    const newlyUnlocked = achievements.filter(
      (item) => item.unlocked && !unlockedAtMap[item.id]
    );
    if (newlyUnlocked.length === 0) return;

    const now = Date.now();
    const nextUnlockedMap: Partial<Record<AchievementId, number>> = {
      ...unlockedAtMap,
    };
    newlyUnlocked.forEach((item) => {
      nextUnlockedMap[item.id] = now;
    });

    setUnlockedAtMap(nextUnlockedMap);
    saveAchievementsState({
      baseStats,
      unlockedAtMap: nextUnlockedMap,
    });

    soundEngine.playTrophyUnlock();
    setActiveToastAchievement({ ...newlyUnlocked[0], unlockedAt: now });

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setActiveToastAchievement(null);
    }, 3600);
  }, [achievements, unlockedAtMap, baseStats]);

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Start Game (Places player at starting point)
  const handleStartGame = useCallback(() => {
    setScore(0);
    setCoins(0);
    setGrazeCount(0);
    setHyperGauge(0);
    setLiveTelemetry(EMPTY_LIVE_TELEMETRY);
    setCurrentLevel(LEVELS.ascent);
    setAnnouncedLevel(LEVELS.ascent);
    setIsPaused(false);
    setShowAchievementsModal(false);
    setShowSettingsModal(false);
    setGameState('PLAYING');

    soundEngine.setStageLevel(0);
    soundEngine.startMusic();
  }, []);

  // Open / Close Achievements Modal cleanly
  const handleOpenAchievements = useCallback(() => {
    if (gameState === 'PLAYING' && !showSettingsModal) {
      setPausedBeforeModal(isPaused);
      setIsPaused(true);
    }
    setShowSettingsModal(false);
    setShowAchievementsModal(true);
  }, [gameState, isPaused, showSettingsModal]);

  const handleCloseAchievements = useCallback(() => {
    setShowAchievementsModal(false);
    if (gameState === 'PLAYING' && !pausedBeforeModal) {
      setIsPaused(false);
    }
  }, [gameState, pausedBeforeModal]);

  // Open / Close Settings Modal cleanly
  const handleOpenSettings = useCallback(() => {
    if (gameState === 'PLAYING' && !showAchievementsModal) {
      setPausedBeforeModal(isPaused);
      setIsPaused(true);
    }
    setShowAchievementsModal(false);
    setShowSettingsModal(true);
  }, [gameState, isPaused, showAchievementsModal]);

  const handleCloseSettings = useCallback(() => {
    setShowSettingsModal(false);
    if (gameState === 'PLAYING' && !pausedBeforeModal) {
      setIsPaused(false);
    }
  }, [gameState, pausedBeforeModal]);

  const handleSavePilotName = useCallback((name: string) => {
    setPilotName(name);
    try {
      localStorage.setItem(SETTINGS_NAME_STORAGE_KEY, name);
    } catch {
      // Safe fallback
    }
  }, []);

  const handleChangeMasterVolume = useCallback((vol: number) => {
    setMasterVolume(vol);
    soundEngine.setVolume(vol);
  }, []);

  // Keyboard controls for game flow (Start, Pause, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettingsModal) {
        if (e.code === 'Escape') {
          e.preventDefault();
          handleCloseSettings();
        }
        return;
      }

      if (showAchievementsModal) {
        if (e.code === 'Escape') {
          e.preventDefault();
          handleCloseAchievements();
        }
        return;
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (gameState === 'PLAYING') {
          e.preventDefault();
          setIsPaused((prev) => !prev);
        }
      } else if (e.code === 'Space') {
        if (gameState === 'TITLE_MENU') {
          e.preventDefault();
          handleStartGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState,
    showAchievementsModal,
    showSettingsModal,
    handleCloseAchievements,
    handleCloseSettings,
    handleStartGame,
  ]);

  // Restart Game from Pause or manual action (commit any active run progress first)
  const handleRestartGame = useCallback(() => {
    setBaseStats((prev) => {
      const committed = combineLiveStats(prev, liveTelemetry);
      saveAchievementsState({
        baseStats: committed,
        unlockedAtMap,
      });
      return committed;
    });
    handleStartGame();
  }, [handleStartGame, liveTelemetry, unlockedAtMap]);

  // Handle Score Update from Engine
  const handleScoreUpdate = useCallback(
    (
      newScore: number,
      level: LevelConfig,
      newGrazeCount: number,
      newHyperGauge: number,
      newCoins: number
    ) => {
      setScore(newScore);
      setCoins(newCoins);
      setCurrentLevel(level);
      setGrazeCount(newGrazeCount);
      setHyperGauge(newHyperGauge);

      if (newScore > highScore) {
        setHighScore(newScore);
        try {
          localStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
        } catch {
          // Safe fallback
        }
      }
    },
    [highScore]
  );

  // Handle Live Run Telemetry Update (~10Hz + instant on events)
  const handleTelemetryUpdate = useCallback((telemetry: LiveRunTelemetry) => {
    setLiveTelemetry(telemetry);
  }, []);

  // Stage Transition Announcement
  const handleStageChange = useCallback((newLevel: LevelConfig) => {
    setCurrentLevel(newLevel);
    setAnnouncedLevel(newLevel);
  }, []);

  // When player dies: Commit run stats into persistent AchievementStats & reset run
  const handlePlayerDeathAndRespawn = useCallback(
    (
      previousScore: number,
      _finalLevel: LevelConfig,
      stats: {
        gatesCleared: number;
        grazeCount: number;
        distance: number;
        topSpeed: number;
        coins: number;
        hyperDashes: number;
      }
    ) => {
      setLastRunScore(previousScore);

      if (previousScore > highScore) {
        setHighScore(previousScore);
        try {
          localStorage.setItem(HIGH_SCORE_KEY, previousScore.toString());
        } catch {
          // Safe fallback
        }
      }

      setBaseStats((prev) => {
        const nextBase: AchievementStats = {
          totalGrazeCount: prev.totalGrazeCount + stats.grazeCount,
          totalDistanceUnits: prev.totalDistanceUnits + stats.distance,
          totalGatesCleared: prev.totalGatesCleared + stats.gatesCleared,
          totalCoins: prev.totalCoins + stats.coins,
          totalHyperDashes: prev.totalHyperDashes + stats.hyperDashes,
          bestScore: Math.max(prev.bestScore, previousScore),
        };
        saveAchievementsState({
          baseStats: nextBase,
          unlockedAtMap,
        });
        return nextBase;
      });

      setLiveTelemetry(EMPTY_LIVE_TELEMETRY);
      setScore(0);
      setCoins(0);
      setGrazeCount(0);
      setCurrentLevel(LEVELS.ascent);
      setAnnouncedLevel(LEVELS.ascent);
    },
    [highScore, unlockedAtMap]
  );

  // Audio Toggles
  const handleToggleMute = useCallback(() => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleToggleMusic = useCallback(() => {
    const musicActive = soundEngine.toggleMusic();
    setIsMusicMuted(!musicActive);
  }, []);

  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleToggleScanlines = useCallback(() => {
    setScanlinesEnabled((prev) => !prev);
  }, []);

  const handleTriggerHyper = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' }));
  }, []);

  const handleConsumeHyper = useCallback(() => {
    setHyperGauge(0);
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#04060a] text-slate-100 flex flex-col font-sans select-none">
      {/* 2026 Arcade Head-Up Display with Unlockable Achievement Badges */}
      {gameState === 'PLAYING' && (
        <ArcadeHUD
          score={score}
          highScore={highScore}
          coins={coins}
          distanceUnits={liveTelemetry.runDistanceUnits}
          totalGrazeCount={combinedStats.totalGrazeCount}
          totalDistanceUnits={combinedStats.totalDistanceUnits}
          achievements={achievements}
          lastRunScore={lastRunScore}
          currentLevel={currentLevel}
          grazeCount={grazeCount}
          hyperGauge={hyperGauge}
          isPaused={isPaused}
          isMuted={isMuted}
          isMusicMuted={isMusicMuted}
          onTogglePause={handleTogglePause}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
          onTriggerHyper={handleTriggerHyper}
          onOpenAchievements={handleOpenAchievements}
          onOpenSettings={handleOpenSettings}
          scanlinesEnabled={scanlinesEnabled}
          onToggleScanlines={handleToggleScanlines}
        />
      )}

      {/* Real-Time Achievement Unlock Toast */}
      <AchievementToast achievement={activeToastAchievement} />

      {/* Main Full-Screen Game Canvas */}
      <div className="relative flex-1 w-full h-full">
        <GameCanvas
          gameState={gameState}
          onScoreUpdate={handleScoreUpdate}
          onTelemetryUpdate={handleTelemetryUpdate}
          onPlayerDeathAndRespawn={handlePlayerDeathAndRespawn}
          onStageChange={handleStageChange}
          hyperGauge={hyperGauge}
          onConsumeHyper={handleConsumeHyper}
          isPaused={isPaused}
          scanlinesEnabled={scanlinesEnabled}
        />

        {/* Stage Entrance Holographic Banner */}
        {gameState === 'PLAYING' && (
          <StageAnnouncement level={announcedLevel} />
        )}
      </div>

      {/* Title Menu Modal on initial launch */}
      {gameState === 'TITLE_MENU' && (
        <TitleMenu
          onStartGame={handleStartGame}
          onOpenAchievements={handleOpenAchievements}
          onOpenSettings={handleOpenSettings}
          unlockedAchievementsCount={unlockedCount}
          totalAchievementsCount={achievements.length}
          highScore={highScore}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PLAYING' &&
        isPaused &&
        !showAchievementsModal &&
        !showSettingsModal && (
          <PauseModal
            pilotName={pilotName}
            currentLevel={currentLevel}
            score={score}
            onResume={() => setIsPaused(false)}
            onRestart={handleRestartGame}
            onOpenSettings={handleOpenSettings}
            isMuted={isMuted}
            isMusicMuted={isMusicMuted}
            onToggleMute={handleToggleMute}
            onToggleMusic={handleToggleMusic}
          />
        )}

      {/* Achievements Inspector Modal */}
      {showAchievementsModal && (
        <AchievementsModal
          achievements={achievements}
          stats={combinedStats}
          onClose={handleCloseAchievements}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          pilotName={pilotName}
          onSavePilotName={handleSavePilotName}
          masterVolume={masterVolume}
          onChangeMasterVolume={handleChangeMasterVolume}
          isMuted={isMuted}
          isMusicMuted={isMusicMuted}
          scanlinesEnabled={scanlinesEnabled}
          onToggleMute={handleToggleMute}
          onToggleMusic={handleToggleMusic}
          onToggleScanlines={handleToggleScanlines}
          onClose={handleCloseSettings}
        />
      )}
    </div>
  );
}
