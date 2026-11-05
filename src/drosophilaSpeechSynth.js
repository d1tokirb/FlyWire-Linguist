// Drosophila Speech Synthesizer & Acoustic Formant Generator
// Combines Web Speech API (pitch-shifted insectoid TTS) with
// Web Audio API biological wingbeat modulation, proboscis click generation,
// and real-time FFT frequency analysis for 3D waveform visualizers.

export class DrosophilaSpeechSynth {
  constructor() {
    this.isMuted = false;
    this.isSpeaking = false;
    this.audioCtx = null;
    this.analyser = null;
    this.dataArray = null;
    this.timeDomainArray = null;

    // Callbacks
    this.onSpeechStart = null;
    this.onSpeechEnd = null;

    // Web Speech API Voice cache
    this.preferredVoice = null;
    this.initWebSpeech();
  }

  initWebSpeech() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Prefer English voices with clear, higher pitch potential
      const enVoices = voices.filter(v => v.lang.startsWith('en'));
      this.preferredVoice = enVoices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Karen') || v.name.includes('Google UK English Female')) || enVoices[0] || voices[0];
    };

    pickVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = pickVoice;
    }
  }

  ensureAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        this.timeDomainArray = new Uint8Array(bufferLength);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      if (this.onSpeechEnd) this.onSpeechEnd();
    }
    return !this.isMuted;
  }

  // Play biological Drosophila wingbeat buzz hum (200 Hz carrier modulated)
  playWingbeatBuzz(durationSec = 0.5, pitchOffset = 0) {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      // Drosophila fundamental wingbeat frequency is ~200 Hz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(195 + pitchOffset, this.audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(215 + pitchOffset, this.audioCtx.currentTime + durationSec);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, this.audioCtx.currentTime);
      filter.Q.setValueAtTime(3.5, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + durationSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + durationSec);
    } catch (e) {}
  }

  // Play proboscis chitinous click / chirp
  playProboscisClick() {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  // Play Dopamine PAM chime (Sweet sucrose reward audio)
  playDopamineChime() {
    if (this.isMuted) return;
    this.ensureAudioContext();
    if (!this.audioCtx) return;

    try {
      const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.14, this.audioCtx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + idx * 0.08);
        osc.stop(this.audioCtx.currentTime + idx * 0.08 + 0.35);
      });
    } catch (e) {}
  }

  // Main Speech Execution: Converts fly text/babble into audible high-pitch insectoid speech
  speak(text, stage = 0, onStart, onEnd) {
    if (this.isMuted || !text) {
      if (onStart) onStart();
      if (onEnd) onEnd();
      return;
    }

    this.ensureAudioContext();

    // Trigger biological accompaniment buzz
    const buzzLength = Math.min(2.5, Math.max(0.6, text.length * 0.08));
    this.playWingbeatBuzz(buzzLength, stage * 15);

    // If Stage 0 and purely babble/buzzes, accompany with rapid clicks
    if (stage === 0) {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => this.playProboscisClick(), i * 180 + 80);
      }
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.isSpeaking = true;
      if (this.onSpeechStart) this.onSpeechStart(text);
      if (onStart) onStart();

      setTimeout(() => {
        this.isSpeaking = false;
        if (this.onSpeechEnd) this.onSpeechEnd();
        if (onEnd) onEnd();
      }, buzzLength * 1000);
      return;
    }

    window.speechSynthesis.cancel(); // Cancel any prior utterance

    // Clean text for speech synthesis (strip dots and hyphens that cause long awkward pauses)
    const cleanSpeechText = text
      .replace(/\.\.\./g, ', ')
      .replace(/bzz/gi, 'buzz')
      .replace(/zzz/gi, 'zee')
      .replace(/vzzz/gi, 'vuzz')
      .replace(/k-k/gi, 'tick')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText || text);

    // Tiny Fruit Fly Vocal Tract Settings:
    // Extremely high pitch (1.8 - 2.0) and brisk insectoid rate (1.15 - 1.30)
    utterance.pitch = Math.min(2.0, 1.85 + (stage === 0 ? 0.15 : 0.05));
    utterance.rate = 1.20;
    utterance.volume = 1.0;

    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onSpeechStart) this.onSpeechStart(text);
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onSpeechEnd) this.onSpeechEnd();
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (this.onSpeechEnd) this.onSpeechEnd();
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Get current real-time FFT frequency data for visualizers
  getFrequencyData() {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      return this.dataArray;
    }
    return null;
  }

  getTimeDomainData() {
    if (this.analyser && this.timeDomainArray) {
      this.analyser.getByteTimeDomainData(this.timeDomainArray);
      return this.timeDomainArray;
    }
    return null;
  }
}
