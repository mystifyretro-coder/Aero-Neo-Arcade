/**
 * 2026 Neo Arcade Sound Engine
 * Synthesizes retro-futuristic arcade audio using browser Web Audio API.
 * Zero external audio assets needed; zero latency, 100% reliable.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private currentLevelIndex: number = 0;
  
  // Background synth music loop
  private isPlayingMusic: boolean = false;
  private musicIntervalId: number | null = null;
  private musicStep: number = 0;

  constructor() {
    // Initialized lazily on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.8;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.35;
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.initCtx();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public toggleMusic(): boolean {
    this.isMusicMuted = !this.isMusicMuted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.isMusicMuted ? 0 : 0.35, this.ctx.currentTime, 0.05);
    }
    return !this.isMusicMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  // --- Sound Effects ---

  public playFlap(velocityRatio = 1) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = 220 + velocityRatio * 80;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, t + 0.12);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playScore() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.setValueAtTime(880, t + 0.05); // A5

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playGraze() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // High energetic electric sizzle
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(2400, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Classic sparkling arcade coin chime (B5 -> E6)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, t);
    osc1.frequency.setValueAtTime(1318.51, t + 0.07);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1975.53, t);
    osc2.frequency.setValueAtTime(2637.02, t + 0.07);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.36);
    osc2.stop(t + 0.36);
  }

  public playStorePurchase() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, t); // C5
    osc1.frequency.setValueAtTime(659.25, t + 0.08); // E5
    osc1.frequency.setValueAtTime(783.99, t + 0.16); // G5
    osc1.frequency.setValueAtTime(1046.50, t + 0.24); // C6

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, t + 0.24);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t + 0.24);
    osc1.stop(t + 0.46);
    osc2.stop(t + 0.46);
  }

  public playTrophyUnlock() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(554.37, t + 0.1);
    osc.frequency.setValueAtTime(659.25, t + 0.2);
    osc.frequency.setValueAtTime(880, t + 0.3);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.56);
  }

  public playOrb() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1760, t + 0.15);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  public playHyperDash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Sub rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(90, t);
    subOsc.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    subGain.gain.setValueAtTime(0.5, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(t);
    subOsc.stop(t + 0.55);

    // High sweep
    const sweepOsc = this.ctx.createOscillator();
    const sweepGain = this.ctx.createGain();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(300, t);
    sweepOsc.frequency.exponentialRampToValueAtTime(1800, t + 0.35);
    sweepGain.gain.setValueAtTime(0.3, t);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    sweepOsc.connect(sweepGain);
    sweepGain.connect(this.sfxGain);
    sweepOsc.start(t);
    sweepOsc.stop(t + 0.42);
  }

  public playStageUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const chords = [440, 554.37, 659.25, 880, 1108.73]; // A major 7 arpeggio sweep

    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.18, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.45);
    });
  }

  public playCrash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Low boom
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'triangle';
    boomOsc.frequency.setValueAtTime(140, t);
    boomOsc.frequency.exponentialRampToValueAtTime(25, t + 0.45);
    boomGain.gain.setValueAtTime(0.45, t);
    boomGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    boomOsc.connect(boomGain);
    boomGain.connect(this.sfxGain);
    boomOsc.start(t);
    boomOsc.stop(t + 0.5);

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(800, t);
    noiseFilter.frequency.linearRampToValueAtTime(100, t + 0.35);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(t);
  }

  // --- Dynamic Arcade BGM Synthesis ---

  public setStageLevel(levelIndex: number) {
    this.currentLevelIndex = levelIndex;
  }

  public startMusic() {
    if (this.isPlayingMusic) return;
    this.isPlayingMusic = true;
    this.musicStep = 0;
    
    // 16-step synthwave rhythm
    // Tempo scales with stage: Ascent = 124 BPM, Catalyst = 138 BPM, Singularity = 152 BPM
    const runMusicTick = () => {
      if (!this.isPlayingMusic) return;
      this.playMusicStep();
      this.musicStep = (this.musicStep + 1) % 16;

      const bpms = [124, 138, 154];
      const bpm = bpms[Math.min(this.currentLevelIndex, bpms.length - 1)];
      const stepDurationMs = (60 / bpm / 4) * 1000;

      this.musicIntervalId = window.setTimeout(runMusicTick, stepDurationMs);
    };

    runMusicTick();
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicIntervalId !== null) {
      clearTimeout(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  private playMusicStep() {
    if (this.isMusicMuted || this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.musicGain) return;

    const t = this.ctx.currentTime;
    const step = this.musicStep;

    // Bassline notes based on level
    // Ascent: Dm (D, F, A, C)
    // Catalyst: Em / Gm (E, G, B, D)
    // Singularity: Cm / Fm (C, Eb, G, Bb)
    const baseFreqs = [
      [73.42, 73.42, 87.31, 73.42, 98.00, 73.42, 110.00, 73.42], // Level 1 D2
      [82.41, 82.41, 98.00, 82.41, 123.47, 82.41, 110.00, 98.00], // Level 2 E2
      [65.41, 65.41, 77.78, 65.41, 98.00, 65.41, 116.54, 98.00],  // Level 3 C2
    ];

    const currentNotes = baseFreqs[Math.min(this.currentLevelIndex, baseFreqs.length - 1)];
    const bassFreq = currentNotes[step % 8];

    // Bass synth pulse on every even step
    if (step % 2 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassFilter = this.ctx.createBiquadFilter();
      const bassAmp = this.ctx.createGain();

      bassOsc.type = this.currentLevelIndex >= 2 ? 'sawtooth' : 'triangle';
      bassOsc.frequency.setValueAtTime(bassFreq, t);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(320 + (this.currentLevelIndex * 150), t);
      bassFilter.frequency.exponentialRampToValueAtTime(100, t + 0.18);

      bassAmp.gain.setValueAtTime(0.16, t);
      bassAmp.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassAmp);
      bassAmp.connect(this.musicGain);

      bassOsc.start(t);
      bassOsc.stop(t + 0.2);
    }

    // Hi-hat pulse on odd 16th notes
    if (step % 4 === 2) {
      const hatBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.04, this.ctx.sampleRate);
      const hatData = hatBuffer.getChannelData(0);
      for (let i = 0; i < hatData.length; i++) {
        hatData[i] = (Math.random() * 2 - 1) * 0.4;
      }
      const hatSrc = this.ctx.createBufferSource();
      hatSrc.buffer = hatBuffer;

      const hatFilter = this.ctx.createBiquadFilter();
      hatFilter.type = 'highpass';
      hatFilter.frequency.setValueAtTime(7000, t);

      const hatAmp = this.ctx.createGain();
      hatAmp.gain.setValueAtTime(0.07, t);
      hatAmp.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      hatSrc.connect(hatFilter);
      hatFilter.connect(hatAmp);
      hatAmp.connect(this.musicGain);

      hatSrc.start(t);
    }

    // Arpeggio melody notes on Catalyst & Singularity
    if (this.currentLevelIndex >= 1 && (step % 2 === 1)) {
      const arpNotes = [
        [587.33, 659.25, 783.99, 880.00, 1046.50], // Catalyst
        [523.25, 622.25, 783.99, 932.33, 1046.50, 1244.51] // Singularity
      ];
      const scale = arpNotes[this.currentLevelIndex - 1];
      const arpFreq = scale[(step * 3) % scale.length];

      const arpOsc = this.ctx.createOscillator();
      const arpAmp = this.ctx.createGain();
      arpOsc.type = 'sine';
      arpOsc.frequency.setValueAtTime(arpFreq, t);

      arpAmp.gain.setValueAtTime(0.05, t);
      arpAmp.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      arpOsc.connect(arpAmp);
      arpAmp.connect(this.musicGain);

      arpOsc.start(t);
      arpOsc.stop(t + 0.13);
    }
  }
}

export const soundEngine = new SoundEngine();
