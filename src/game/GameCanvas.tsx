import React, { useEffect, useRef, useCallback } from 'react';
import { GameState, LevelConfig, GateObstacle, Particle, FloatingText, PlayerCraft, LiveRunTelemetry } from '../types/game';
import {
  CRAFT_RADIUS,
  CRAFT_HITBOX_RADIUS,
  GRAZE_MARGIN,
  MAX_FALL_VELOCITY,
  MAX_RISE_VELOCITY,
  getLevelForScore,
  calculateDifficultyMultiplier
} from './constants';
import { soundEngine } from '../audio/soundEngine';

interface GameCanvasProps {
  gameState: GameState;
  onScoreUpdate: (score: number, level: LevelConfig, grazeCount: number, hyperGauge: number, coins: number) => void;
  onTelemetryUpdate?: (telemetry: LiveRunTelemetry) => void;
  onPlayerDeathAndRespawn: (previousScore: number, finalLevel: LevelConfig, stats: { gatesCleared: number; grazeCount: number; distance: number; topSpeed: number; coins: number; hyperDashes: number }) => void;
  onStageChange: (level: LevelConfig) => void;
  onLaunchFromStart?: () => void;
  hyperGauge: number;
  onConsumeHyper: () => void;
  isPaused: boolean;
  scanlinesEnabled: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  onScoreUpdate,
  onTelemetryUpdate,
  onPlayerDeathAndRespawn,
  onStageChange,
  onLaunchFromStart,
  hyperGauge,
  onConsumeHyper,
  isPaused,
  scanlinesEnabled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game Engine References for 60/120fps physics loop
  const stateRef = useRef<{
    gameState: GameState;
    isPaused: boolean;
    isAtStartingPoint: boolean;
    respawnNoticeTime: number;
    respawnNoticeText: string;
    score: number;
    coins: number;
    currentLevel: LevelConfig;
    player: PlayerCraft;
    obstacles: GateObstacle[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    distanceTraveled: number;
    topSpeed: number;
    gatesCleared: number;
    grazeCount: number;
    hyperDashesUsed: number;
    hyperGauge: number;
    lastTime: number;
    lastTelemetryEmitTime: number;
    nextGateId: number;
    nextGateSpawnDist: number;
    cameraShake: number;
    screenFlash: number;
    warpEffectAlpha: number;
    backgroundStars: { x: number; y: number; speed: number; size: number; alpha: number; color: string }[];
    cityBuildings: { x: number; width: number; height: number; lights: { x: number; y: number }[] }[];
  }>({
    gameState: 'TITLE_MENU',
    isPaused: false,
    isAtStartingPoint: true,
    respawnNoticeTime: 0,
    respawnNoticeText: '',
    score: 0,
    coins: 0,
    currentLevel: getLevelForScore(0),
    player: {
      x: 180,
      y: 350,
      radius: CRAFT_RADIUS,
      vy: 0,
      angle: 0,
      wingAngle: 0,
      isFlapping: false,
      hyperActive: false,
      hyperTimeRemaining: 0,
      invulnerableTime: 0,
      grazeCount: 0,
    },
    obstacles: [],
    particles: [],
    floatingTexts: [],
    distanceTraveled: 0,
    topSpeed: 0,
    gatesCleared: 0,
    grazeCount: 0,
    hyperDashesUsed: 0,
    hyperGauge: 0,
    lastTime: 0,
    lastTelemetryEmitTime: 0,
    nextGateId: 1,
    nextGateSpawnDist: 480,
    cameraShake: 0,
    screenFlash: 0,
    warpEffectAlpha: 0,
    backgroundStars: [],
    cityBuildings: [],
  });

  // Sync props to stateRef
  useEffect(() => {
    stateRef.current.gameState = gameState;
    stateRef.current.isPaused = isPaused;
    stateRef.current.hyperGauge = hyperGauge;
  }, [gameState, isPaused, hyperGauge]);

  // Handle Level Transition
  const triggerLevelTransition = useCallback((newLevel: LevelConfig) => {
    stateRef.current.currentLevel = newLevel;
    stateRef.current.warpEffectAlpha = 1.0;
    stateRef.current.cameraShake = 12;
    soundEngine.setStageLevel(newLevel.stageNumber - 1);
    soundEngine.playStageUp();
    onStageChange(newLevel);

    // Spawn celebration particle burst
    const canvas = canvasRef.current;
    if (canvas) {
      for (let i = 0; i < 45; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 120 + Math.random() * 300;
        stateRef.current.particles.push({
          x: stateRef.current.player.x,
          y: stateRef.current.player.y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          size: 3 + Math.random() * 4,
          life: 0,
          maxLife: 0.8 + Math.random() * 0.5,
          color: newLevel.primaryColor,
          alpha: 1,
          glow: true,
          shape: 'spark'
        });
      }
    }
  }, [onStageChange]);

  // Flap / Thrust Trigger
  const triggerFlap = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState !== 'PLAYING' || s.isPaused) return;

    // If waiting at starting point, launch into flight!
    if (s.isAtStartingPoint) {
      s.isAtStartingPoint = false;
      s.respawnNoticeTime = 0;
      if (onLaunchFromStart) {
        onLaunchFromStart();
      }
    }

    s.player.vy = s.currentLevel.jumpForce;
    s.player.isFlapping = true;
    s.player.wingAngle = 0.5;

    soundEngine.playFlap(Math.abs(s.player.vy) / 400);

    // Thruster blast particles
    for (let i = 0; i < 9; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * 0.7;
      const speed = 140 + Math.random() * 220;
      s.particles.push({
        x: s.player.x - 14,
        y: s.player.y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.6,
        size: 3 + Math.random() * 3,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
        color: s.currentLevel.accentColor,
        alpha: 0.9,
        glow: true,
      });
    }
  }, [onLaunchFromStart]);

  // Hyper-Dash Trigger
  const triggerHyper = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState !== 'PLAYING' || s.isPaused || s.isAtStartingPoint) return;
    if (s.hyperGauge < 100 || s.player.hyperActive) return;

    s.player.hyperActive = true;
    s.player.hyperTimeRemaining = 1.4;
    s.hyperDashesUsed += 1;
    s.cameraShake = 16;
    s.screenFlash = 0.6;
    soundEngine.playHyperDash();
    onConsumeHyper();
    if (onTelemetryUpdate) {
      onTelemetryUpdate({
        runGrazes: s.grazeCount,
        runDistanceUnits: Math.floor(s.distanceTraveled),
        runGatesCleared: s.gatesCleared,
        runCoins: s.coins,
        runHyperDashes: s.hyperDashesUsed,
        currentScore: s.score,
      });
    }

    // Shockwave burst
    for (let i = 0; i < 35; i++) {
      const angle = (i / 35) * Math.PI * 2;
      const speed = 250 + Math.random() * 180;
      s.particles.push({
        x: s.player.x,
        y: s.player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 3,
        life: 0,
        maxLife: 0.7,
        color: '#ffffff',
        alpha: 1,
        glow: true,
        shape: 'spark'
      });
    }
  }, [onConsumeHyper, onTelemetryUpdate]);

  // Reset / Send to Starting Point
  const sendToStartingPoint = useCallback((_isInitialStart = false) => {
    const canvas = canvasRef.current;
    const startY = canvas ? canvas.height / 2 : 350;
    const playerX = canvas ? Math.max(160, Math.min(260, canvas.width * 0.16)) : 180;
    const initialLevel = getLevelForScore(0);

    const s = stateRef.current;
    s.score = 0;
    s.coins = 0;
    s.currentLevel = initialLevel;
    s.isAtStartingPoint = true;
    s.player = {
      x: playerX,
      y: startY,
      radius: CRAFT_RADIUS,
      vy: 0,
      angle: 0,
      wingAngle: 0,
      isFlapping: false,
      hyperActive: false,
      hyperTimeRemaining: 0,
      invulnerableTime: 0.8,
      grazeCount: 0,
    };
    s.obstacles = [];
    s.distanceTraveled = 0;
    s.topSpeed = initialLevel.speedBase;
    s.gatesCleared = 0;
    s.grazeCount = 0;
    s.hyperDashesUsed = 0;
    s.hyperGauge = 0;
    s.nextGateId = 1;
    s.nextGateSpawnDist = 480; // generous clearance on starting runway
    s.warpEffectAlpha = 0.5;

    soundEngine.setStageLevel(0);
    onScoreUpdate(0, initialLevel, 0, 0, 0);
    if (onTelemetryUpdate) {
      onTelemetryUpdate({
        runGrazes: 0,
        runDistanceUnits: 0,
        runGatesCleared: 0,
        runCoins: 0,
        runHyperDashes: 0,
        currentScore: 0,
      });
    }
    onStageChange(initialLevel);
  }, [onScoreUpdate, onTelemetryUpdate, onStageChange]);

  // Handle Player Death -> SEND IMMEDIATELY TO STARTING POINT
  const handlePlayerDeath = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState !== 'PLAYING' || s.isAtStartingPoint) return;

    soundEngine.playCrash();
    s.cameraShake = 26;
    s.screenFlash = 0.85;

    // Death explosion debris
    for (let i = 0; i < 65; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 380;
      s.particles.push({
        x: s.player.x,
        y: s.player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 5,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.6,
        color: Math.random() > 0.4 ? s.currentLevel.primaryColor : s.currentLevel.accentColor,
        alpha: 1,
        glow: true,
        shape: Math.random() > 0.5 ? 'spark' : 'circle',
      });
    }

    const previousScore = s.score;
    const finalLevel = s.currentLevel;
    const stats = {
      gatesCleared: s.gatesCleared,
      grazeCount: s.grazeCount,
      distance: Math.floor(s.distanceTraveled),
      topSpeed: Math.floor(s.topSpeed * 1.8),
      coins: s.coins,
      hyperDashes: s.hyperDashesUsed,
    };

    // Report run to parent
    onPlayerDeathAndRespawn(previousScore, finalLevel, stats);

    // SEND PLAYER TO STARTING POINT IMMEDIATELY
    sendToStartingPoint(false);
    s.respawnNoticeTime = 2.4;
    s.respawnNoticeText = previousScore > 0 
      ? `CRASH [SCORE ${previousScore}] · SENT TO STARTING POINT` 
      : 'CRASH · SENT TO STARTING POINT';
  }, [sendToStartingPoint, onPlayerDeathAndRespawn]);

  // User input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        triggerFlap();
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyF') {
        e.preventDefault();
        triggerHyper();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, [data-hud-interactive="true"]')) {
        return;
      }
      if (e.button === 2) {
        e.preventDefault();
        triggerHyper();
      } else if (e.button === 0) {
        triggerFlap();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [triggerFlap, triggerHyper]);

  // Window resize handler & background star generator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      stateRef.current.player.x = Math.max(160, Math.min(260, width * 0.16));

      // Starfield
      const stars: { x: number; y: number; speed: number; size: number; alpha: number; color: string }[] = [];
      const starColors = ['#ffffff', '#a5f3fc', '#cbd5e1', '#fef08a'];
      for (let i = 0; i < 140; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          speed: 0.1 + Math.random() * 0.8,
          size: 1 + Math.random() * 1.8,
          alpha: 0.2 + Math.random() * 0.7,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
      stateRef.current.backgroundStars = stars;

      // City buildings
      const buildings: { x: number; width: number; height: number; lights: { x: number; y: number }[] }[] = [];
      let curX = 0;
      while (curX < width * 2) {
        const bWidth = 60 + Math.random() * 100;
        const bHeight = 80 + Math.random() * 200;
        const lights: { x: number; y: number }[] = [];
        for (let ly = 15; ly < bHeight - 15; ly += 20) {
          for (let lx = 10; lx < bWidth - 10; lx += 18) {
            if (Math.random() > 0.45) {
              lights.push({ x: lx, y: ly });
            }
          }
        }
        buildings.push({
          x: curX,
          width: bWidth,
          height: bHeight,
          lights,
        });
        curX += bWidth + 10 + Math.random() * 25;
      }
      stateRef.current.cityBuildings = buildings;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // When game state switches to PLAYING, initialize at starting point
  useEffect(() => {
    if (gameState === 'PLAYING') {
      sendToStartingPoint(true);
    }
  }, [gameState, sendToStartingPoint]);

  // Main 60-120fps Game Loop
  useEffect(() => {
    let animId: number;

    const gameLoop = (time: number) => {
      animId = requestAnimationFrame(gameLoop);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      const s = stateRef.current;
      if (!s.lastTime) s.lastTime = time;
      const dt = Math.min((time - s.lastTime) / 1000, 0.08);
      s.lastTime = time;

      // Update simulation if playing and not paused
      if (s.gameState === 'PLAYING' && !s.isPaused) {
        // --- If at Starting Point: Hover gently waiting for player flap ---
        if (s.isAtStartingPoint) {
          const startY = height / 2;
          s.player.y = startY + Math.sin(time * 0.005) * 8;
          s.player.vy = 0;
          s.player.angle = 0;
          s.player.wingAngle = 0;
        } else {
          // --- Active Flight Simulation ---
          const { speedBoost, gapTightening } = calculateDifficultyMultiplier(s.score);
          const currentSpeed = s.currentLevel.speedBase + speedBoost;
          s.topSpeed = Math.max(s.topSpeed, currentSpeed);
          s.distanceTraveled += currentSpeed * dt;

          // Throttled live telemetry emit (~10Hz) so Distance Runner & HUD counters update smoothly mid-flight
          if (onTelemetryUpdate && time - s.lastTelemetryEmitTime >= 100) {
            s.lastTelemetryEmitTime = time;
            onTelemetryUpdate({
              runGrazes: s.grazeCount,
              runDistanceUnits: Math.floor(s.distanceTraveled),
              runGatesCleared: s.gatesCleared,
              runCoins: s.coins,
              runHyperDashes: s.hyperDashesUsed,
              currentScore: s.score,
            });
          }

          // Check for level progression
          const targetLevel = getLevelForScore(s.score);
          if (targetLevel.id !== s.currentLevel.id) {
            triggerLevelTransition(targetLevel);
          }

          const player = s.player;

          // Hyper-dash timer
          if (player.hyperActive) {
            player.hyperTimeRemaining -= dt;
            if (player.hyperTimeRemaining <= 0) {
              player.hyperActive = false;
              player.invulnerableTime = 0.5;
            }
          }
          if (player.invulnerableTime > 0) {
            player.invulnerableTime -= dt;
          }

          // Wing flap recovery
          if (player.wingAngle > 0) {
            player.wingAngle = Math.max(0, player.wingAngle - dt * 2.5);
          }

          // Gravity & Velocity
          player.vy += s.currentLevel.gravity * dt;
          if (player.vy > MAX_FALL_VELOCITY) player.vy = MAX_FALL_VELOCITY;
          if (player.vy < MAX_RISE_VELOCITY) player.vy = MAX_RISE_VELOCITY;
          player.y += player.vy * dt;

          // Smooth Craft Pitch
          const targetAngle = Math.max(-0.6, Math.min(1.1, (player.vy / 400) * 0.8));
          player.angle += (targetAngle - player.angle) * 12 * dt;

          // Ceiling / Floor Collision
          const floorY = height - 36;
          const ceilingY = 32;

          // MAKE IT DIE WHENEVER IT GOES TO THE BOTTOM OF THE SCREEN
          if (player.y >= floorY - player.radius) {
            player.y = floorY - player.radius;
            if (!player.hyperActive && player.invulnerableTime <= 0) {
              handlePlayerDeath();
              return;
            }
          } else if (player.y <= ceilingY + player.radius) {
            player.y = ceilingY + player.radius;
            player.vy = 50; // Gentle bounce off top border
          }

          // Continuous thruster particle stream
          if (Math.random() < 0.8) {
            s.particles.push({
              x: player.x - 16,
              y: player.y + (Math.random() - 0.5) * 4,
              vx: -currentSpeed * 0.6 - Math.random() * 50,
              vy: (Math.random() - 0.5) * 30,
              size: player.hyperActive ? 4 + Math.random() * 3 : 2.5 + Math.random() * 2,
              life: 0,
              maxLife: 0.28,
              color: player.hyperActive ? '#ffffff' : s.currentLevel.primaryColor,
              alpha: 0.8,
              glow: true,
            });
          }

          // --- Spawn Obstacles Across Ultrawide Screen (NO TINY BALLS) ---
          s.nextGateSpawnDist -= currentSpeed * dt;
          if (s.nextGateSpawnDist <= 0) {
            const gateSpacing = Math.max(380, 520 - s.score * 3.5);
            s.nextGateSpawnDist = gateSpacing;

            const gapHeight = Math.max(140, s.currentLevel.gapSize - gapTightening);
            const minY = ceilingY + 70 + gapHeight / 2;
            const maxY = floorY - 70 - gapHeight / 2;
            const gapY = minY + Math.random() * (maxY - minY);

            let type: GateObstacle['type'] = 'static';
            const allowedHazards = s.currentLevel.hazardTypes;
            if (allowedHazards.length > 1 && Math.random() > 0.35) {
              type = allowedHazards[Math.floor(Math.random() * allowedHazards.length)];
            }

            s.obstacles.push({
              id: s.nextGateId++,
              x: width + 80,
              width: 58,
              gapY,
              gapHeight,
              type,
              baseGapY: gapY,
              oscillationSpeed: 1.5 + Math.random() * 2.0,
              oscillationAmplitude: 45 + Math.random() * 45,
              oscillationOffset: Math.random() * Math.PI * 2,
              laserState: 'charging',
              laserTimer: 0,
              passed: false,
              grazedTop: false,
              grazedBottom: false,
            });
          }

          // --- Update Obstacles ---
          for (let i = s.obstacles.length - 1; i >= 0; i--) {
            const obs = s.obstacles[i];
            obs.x -= currentSpeed * dt;

            const px = player.x;
            const py = player.y;
            const pr = CRAFT_HITBOX_RADIUS;
            const distToPlayer = obs.x - px;

            // Oscillating dynamic gates: smooth stabilization when player approaches
            if (obs.type === 'oscillating' && obs.baseGapY !== undefined && obs.oscillationSpeed !== undefined && obs.oscillationAmplitude !== undefined) {
              if (distToPlayer > 130 || distToPlayer < -60) {
                obs.gapY = obs.baseGapY + Math.sin(time / 1000 * obs.oscillationSpeed + (obs.oscillationOffset || 0)) * obs.oscillationAmplitude;
              }
            }

            const topBarrierBottom = obs.gapY - obs.gapHeight / 2;
            const bottomBarrierTop = obs.gapY + obs.gapHeight / 2;

            // Safe passage check: Is the craft aligned with the gap between the pipes?
            // Generous margin ensures you NEVER die while flying through or aiming between the pipes
            const isGoingBetweenPipes = py > topBarrierBottom - 18 && py < bottomBarrierTop + 18;

            // 1. GOING BETWEEN THE PIPE: DO NOT DIE!
            // The moment craft reaches the pipe while between the pipes, it safely clears!
            if (!obs.passed && isGoingBetweenPipes && px >= obs.x - 8) {
              obs.passed = true;

              // Safe Graze Bonus Detection (skimming near top or bottom barrier lip)
              const topDist = Math.abs(py - topBarrierBottom);
              const bottomDist = Math.abs(py - bottomBarrierTop);
              if (topDist <= GRAZE_MARGIN + 18 || bottomDist <= GRAZE_MARGIN + 18) {
                s.grazeCount += 1;
                s.score += 2;
                s.hyperGauge = Math.min(100, s.hyperGauge + 14);
                soundEngine.playGraze();
                s.floatingTexts.push({
                  id: Math.random(),
                  x: px,
                  y: topDist < bottomDist ? topBarrierBottom + 18 : bottomBarrierTop - 18,
                  text: 'GRAZE +2',
                  color: s.currentLevel.accentColor,
                  life: 0,
                  maxLife: 0.65,
                });
              }

              s.score += 1;
              s.coins += 1; // Automatic coin award!
              s.gatesCleared++;
              s.hyperGauge = Math.min(100, s.hyperGauge + 6);
              soundEngine.playCoin(); // Sparkling arcade coin chime!
              onScoreUpdate(s.score, s.currentLevel, s.grazeCount, s.hyperGauge, s.coins);
              if (onTelemetryUpdate) {
                onTelemetryUpdate({
                  runGrazes: s.grazeCount,
                  runDistanceUnits: Math.floor(s.distanceTraveled),
                  runGatesCleared: s.gatesCleared,
                  runCoins: s.coins,
                  runHyperDashes: s.hyperDashesUsed,
                  currentScore: s.score,
                });
              }

              // Floating coin text
              s.floatingTexts.push({
                id: Math.random(),
                x: obs.x + obs.width / 2,
                y: obs.gapY - 14,
                text: '+1 COIN',
                color: '#facc15',
                life: 0,
                maxLife: 0.7,
              });

              // Floating clearance text
              s.floatingTexts.push({
                id: Math.random(),
                x: obs.x + obs.width / 2,
                y: obs.gapY + 14,
                text: '+1 CLEARED',
                color: '#34d399',
                life: 0,
                maxLife: 0.6,
              });

              // Golden Coin burst animation
              for (let p = 0; p < 12; p++) {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.3;
                const speed = 130 + Math.random() * 190;
                s.particles.push({
                  x: obs.x + obs.width / 2,
                  y: obs.gapY,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  size: 4 + Math.random() * 3,
                  life: 0,
                  maxLife: 0.65,
                  color: '#fbbf24',
                  alpha: 1,
                  glow: true,
                  shape: 'coin',
                });
              }

              // Dissolve particle burst: barriers dematerialize!
              for (let p = 0; p < 22; p++) {
                const isTop = Math.random() < 0.5;
                s.particles.push({
                  x: obs.x + Math.random() * obs.width,
                  y: isTop ? ceilingY + Math.random() * Math.max(10, topBarrierBottom - ceilingY) : bottomBarrierTop + Math.random() * Math.max(10, floorY - bottomBarrierTop),
                  vx: -currentSpeed * 0.25 + (Math.random() - 0.5) * 100,
                  vy: isTop ? -90 - Math.random() * 120 : 90 + Math.random() * 120,
                  size: 2.5 + Math.random() * 3,
                  life: 0,
                  maxLife: 0.5,
                  color: s.currentLevel.primaryColor,
                  alpha: 0.95,
                  glow: true,
                  shape: 'spark',
                });
              }

              // REMOVE THE BARRIER IMMEDIATELY!
              s.obstacles.splice(i, 1);
              continue;
            }

            // 2. COLLISION CHECK: HIT THE SOLID PIPE
            // Only dies if hitting the actual solid wall of the pipe (above or below opening)
            const insidePipeBodyX = px + pr > obs.x + 8 && px - pr < obs.x + obs.width - 8;
            const hitSolidPylon = py <= topBarrierBottom - 18 || py >= bottomBarrierTop + 18;

            if (!obs.passed && insidePipeBodyX && hitSolidPylon) {
              if (player.hyperActive) {
                s.cameraShake = 10;
                soundEngine.playScore();
                obs.gapHeight += 140;
                for (let k = 0; k < 20; k++) {
                  s.particles.push({
                    x: obs.x + obs.width / 2,
                    y: py + (Math.random() - 0.5) * 60,
                    vx: (Math.random() - 0.2) * 350,
                    vy: (Math.random() - 0.5) * 300,
                    size: 3 + Math.random() * 4,
                    life: 0,
                    maxLife: 0.6,
                    color: '#ffffff',
                    alpha: 1,
                    glow: true,
                    shape: 'spark'
                  });
                }
              } else if (player.invulnerableTime <= 0) {
                // Crashed into the solid pipe wall!
                handlePlayerDeath();
                return;
              }
            }

            // Ensure passed obstacles are completely removed
            if (obs.x + obs.width < px) {
              s.obstacles.splice(i, 1);
            }
          }
        }
      }

      // --- Update Visual FX & Particles ---
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) {
          s.particles.splice(i, 1);
        }
      }

      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.life += dt;
        ft.y -= 38 * dt;
        if (ft.life >= ft.maxLife) {
          s.floatingTexts.splice(i, 1);
        }
      }

      if (s.cameraShake > 0) s.cameraShake = Math.max(0, s.cameraShake - dt * 28);
      if (s.screenFlash > 0) s.screenFlash = Math.max(0, s.screenFlash - dt * 2.8);
      if (s.warpEffectAlpha > 0) s.warpEffectAlpha = Math.max(0, s.warpEffectAlpha - dt * 1.4);
      if (s.respawnNoticeTime > 0) s.respawnNoticeTime = Math.max(0, s.respawnNoticeTime - dt);

      // -------------------------------------------------------------
      // RENDER PASS
      // -------------------------------------------------------------
      ctx.save();

      // Screen Shake
      if (s.cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * s.cameraShake;
        const shakeY = (Math.random() - 0.5) * s.cameraShake;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, s.currentLevel.skyGradientTop);
      skyGrad.addColorStop(1, s.currentLevel.skyGradientBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Parallax Stars
      const curSpeed = s.gameState === 'PLAYING' && !s.isAtStartingPoint ? s.currentLevel.speedBase : 50;
      s.backgroundStars.forEach((star) => {
        if (s.gameState === 'PLAYING' && !s.isAtStartingPoint) {
          star.x -= curSpeed * 0.15 * star.speed * dt;
          if (star.x < 0) star.x = width;
        }
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 3. Cyber Skyline Silhouette
      ctx.fillStyle = 'rgba(6, 12, 22, 0.75)';
      s.cityBuildings.forEach((b) => {
        if (s.gameState === 'PLAYING' && !s.isAtStartingPoint) {
          b.x -= curSpeed * 0.28 * dt;
          if (b.x + b.width < 0) {
            b.x = width + Math.random() * 50;
          }
        }
        const bY = height - 36 - b.height;
        ctx.fillRect(b.x, bY, b.width, b.height);

        ctx.fillStyle = s.currentLevel.primaryColor;
        ctx.globalAlpha = 0.35;
        b.lights.forEach((light) => {
          ctx.fillRect(b.x + light.x, bY + light.y, 4, 3);
        });
        ctx.fillStyle = 'rgba(6, 12, 22, 0.75)';
        ctx.globalAlpha = 1.0;
      });

      // 4. Perspective Neon Grid
      const gridOffset = (s.distanceTraveled * 0.8) % 40;
      ctx.strokeStyle = s.currentLevel.gridColor;
      ctx.lineWidth = 1.5;

      const floorY = height - 36;
      ctx.beginPath();
      for (let x = -gridOffset; x < width; x += 40) {
        ctx.moveTo(x, floorY);
        ctx.lineTo(x, height);
      }
      ctx.stroke();

      const ceilY = 32;
      ctx.beginPath();
      for (let x = -gridOffset; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ceilY);
      }
      ctx.stroke();

      // Glowing Neon Rails
      ctx.save();
      ctx.shadowColor = s.currentLevel.primaryColor;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = s.currentLevel.primaryColor;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(0, ceilY);
      ctx.lineTo(width, ceilY);
      ctx.moveTo(0, floorY);
      ctx.lineTo(width, floorY);
      ctx.stroke();
      ctx.restore();

      // 5. STARTING POINT PORTAL & BEACON (When at starting point)
      if (s.isAtStartingPoint) {
        const startX = s.player.x - 36;
        ctx.save();
        ctx.shadowColor = s.currentLevel.primaryColor;
        ctx.shadowBlur = 16;
        ctx.strokeStyle = s.currentLevel.primaryColor;
        ctx.lineWidth = 2;

        // Vertical starting portal line
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(startX, ceilY);
        ctx.lineTo(startX, floorY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Emitter rings at top and bottom of start line
        ctx.fillStyle = s.currentLevel.primaryColor;
        ctx.beginPath();
        ctx.arc(startX, ceilY + 6, 5, 0, Math.PI * 2);
        ctx.arc(startX, floorY - 6, 5, 0, Math.PI * 2);
        ctx.fill();

        // Starting point HUD callout on runway
        ctx.font = '700 11px "Chakra Petch", sans-serif';
        ctx.fillStyle = s.currentLevel.primaryColor;
        ctx.fillText('SECTOR 01 // STARTING POINT', startX + 10, ceilY + 22);

        // Pulsing instruction label
        const pulse = 0.7 + 0.3 * Math.sin(time * 0.006);
        ctx.globalAlpha = pulse;
        ctx.font = '700 15px "Chakra Petch", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = s.currentLevel.primaryColor;
        ctx.shadowBlur = 10;
        ctx.fillText('PRESS SPACE OR CLICK TO LAUNCH', s.player.x + 36, s.player.y + 5);
        ctx.restore();
      }

      // 6. Obstacles & Gates (No tiny balls)
      s.obstacles.forEach((obs) => {
        const topHeight = obs.gapY - obs.gapHeight / 2 - ceilY;
        const bottomY = obs.gapY + obs.gapHeight / 2;
        const bottomHeight = floorY - bottomY;

        const pylonGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
        pylonGrad.addColorStop(0, '#0f172a');
        pylonGrad.addColorStop(0.5, '#334155');
        pylonGrad.addColorStop(1, '#0f172a');

        ctx.fillStyle = pylonGrad;
        ctx.fillRect(obs.x, ceilY, obs.width, Math.max(0, topHeight));
        ctx.fillRect(obs.x, bottomY, obs.width, Math.max(0, bottomHeight));

        ctx.strokeStyle = s.currentLevel.primaryColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(obs.x, ceilY, obs.width, Math.max(0, topHeight));
        ctx.strokeRect(obs.x, bottomY, obs.width, Math.max(0, bottomHeight));

        // Emitter Caps
        ctx.save();
        ctx.shadowColor = s.currentLevel.primaryColor;
        ctx.shadowBlur = 18;
        ctx.fillStyle = s.currentLevel.accentColor;
        const capH = 10;
        ctx.fillRect(obs.x - 3, obs.gapY - obs.gapHeight / 2 - capH, obs.width + 6, capH);
        ctx.fillRect(obs.x - 3, obs.gapY + obs.gapHeight / 2, obs.width + 6, capH);
        ctx.restore();

        // Laser Gate Guide Beam (Holographic guide lines)
        if (obs.type === 'laser') {
          ctx.save();
          const p = 0.25 + 0.25 * Math.sin(time * 0.008);
          ctx.strokeStyle = `rgba(0, 242, 255, ${p})`;
          ctx.setLineDash([4, 6]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width / 2, obs.gapY - obs.gapHeight / 2);
          ctx.lineTo(obs.x + obs.width / 2, obs.gapY + obs.gapHeight / 2);
          ctx.stroke();
          ctx.restore();
        }
      });

      // 7. Particles Layer (With Coin rendering support)
      s.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        if (p.shape === 'coin') {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fffbeb';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2);
          ctx.fill();
        } else {
          if (p.glow) {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
          }
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.shape === 'spark' ? p.size * 0.7 : p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 8. Render Aero Craft
      const pl = s.player;
      ctx.save();
      ctx.translate(pl.x, pl.y);
      ctx.rotate(pl.angle);

      // Hyper Aura or Respawn Invulnerability Shield
      if (pl.hyperActive || pl.invulnerableTime > 0) {
        ctx.save();
        ctx.shadowColor = '#00f2ff';
        ctx.shadowBlur = 28;
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, pl.radius + 14, pl.radius + 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 242, 255, 0.15)';
        ctx.fill();
        ctx.restore();
      }

      // Flame
      const flameLength = 16 + Math.random() * 12 + (pl.isFlapping ? 14 : 0);
      const flameGrad = ctx.createLinearGradient(-12, 0, -12 - flameLength, 0);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.4, s.currentLevel.accentColor);
      flameGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(-12 - flameLength, 0);
      ctx.lineTo(-10, 5);
      ctx.closePath();
      ctx.fill();

      // Craft Fuselage
      ctx.save();
      ctx.shadowColor = s.currentLevel.primaryColor;
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = s.currentLevel.primaryColor;
      ctx.lineWidth = 1.8;

      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-10, -13 - pl.wingAngle * 6);
      ctx.lineTo(-6, -4);
      ctx.lineTo(-12, 0);
      ctx.lineTo(-6, 4);
      ctx.lineTo(-10, 13 + pl.wingAngle * 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit Glow
      const canopyGrad = ctx.createLinearGradient(4, 0, 14, 0);
      canopyGrad.addColorStop(0, s.currentLevel.primaryColor);
      canopyGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = canopyGrad;
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(2, -3);
      ctx.lineTo(0, 0);
      ctx.lineTo(2, 3);
      ctx.closePath();
      ctx.fill();

      // Wing tip lights
      ctx.fillStyle = s.currentLevel.accentColor;
      ctx.fillRect(-10, -14 - pl.wingAngle * 6, 2, 2);
      ctx.fillRect(-10, 12 + pl.wingAngle * 6, 2, 2);

      ctx.restore();
      ctx.restore();

      // 9. Floating Texts
      s.floatingTexts.forEach((ft) => {
        ctx.save();
        const alpha = Math.max(0, 1 - ft.life / ft.maxLife);
        ctx.globalAlpha = alpha;
        ctx.font = '700 13px "Chakra Petch", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // 10. Respawn Notice Banner on screen
      if (s.respawnNoticeTime > 0) {
        ctx.save();
        const alpha = Math.min(1, s.respawnNoticeTime * 1.5);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        const boxW = Math.min(500, width - 40);
        const boxX = (width - boxW) / 2;
        const boxY = ceilY + 18;
        ctx.fillRect(boxX, boxY, boxW, 36);
        ctx.strokeRect(boxX, boxY, boxW, 36);

        ctx.font = '700 12px "Chakra Petch", sans-serif';
        ctx.fillStyle = '#f87171';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillText(s.respawnNoticeText, width / 2, boxY + 23);
        ctx.restore();
      }

      // 11. Warp Speed streaks
      if (s.warpEffectAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = s.warpEffectAlpha;
        ctx.strokeStyle = s.currentLevel.primaryColor;
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 30; i++) {
          const y = (i / 30) * height;
          const streakLen = 140 + Math.random() * 220;
          const startX = Math.random() * width;
          ctx.beginPath();
          ctx.moveTo(startX, y);
          ctx.lineTo(startX + streakLen, y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 12. Screen Flash
      if (s.screenFlash > 0) {
        ctx.save();
        ctx.globalAlpha = s.screenFlash;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [triggerLevelTransition, handlePlayerDeath, onScoreUpdate]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-pointer touch-none"
      />
      {scanlinesEnabled && <div className="absolute inset-0 scanlines pointer-events-none" />}
      <div className="absolute inset-0 arcade-vignette pointer-events-none" />
    </div>
  );
};
