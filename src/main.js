// Master Drosophila Linguist Controller
// Minimalist, high-performance orchestration of connectome language engine,
// insectoid speech synthesis, and real-time telemetry.

import { SequentialLanguageEngine } from './sequentialLanguageEngine.js';
import { SequentialCurriculumTutor } from './sequentialCurriculumTutor.js';
import { DrosophilaSpeechSynth } from './drosophilaSpeechSynth.js';
import { TelemetryUI } from './telemetryUI.js';

export class App {
  constructor() {
    this.engine = new SequentialLanguageEngine({ mode: 'SEQUENTIAL' });
    this.speech = new DrosophilaSpeechSynth();
    this.ui = new TelemetryUI(this.engine, this.speech);
    this.tutor = new SequentialCurriculumTutor(this.engine, this.speech, this.ui);
    this.tutor.setSpeed('TURBO');

    this.engine.onStateChange = () => {
      this.ui.updateDashboard();
    };

    this.initEvents();
    this.ui.updateDashboard();

    // Autostart autonomous pedagogical teacher on page load
    setTimeout(() => {
      this.tutor.start();
    }, 500);
  }

  initEvents() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    const handleSendMessage = (text) => {
      if (!text || !text.trim()) return;
      const prompt = text.trim();
      chatInput.value = '';

      this.ui.addUserMessage(prompt);

      // Instant neural evaluation across connectome
      const response = this.engine.generateResponse(prompt);
      this.ui.addFlyMessage(response);
      if (this.speech && !this.speech.isMuted) {
        this.speech.speak(response.text, 1);
      }
      this.ui.updateDashboard();
    };

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSendMessage(chatInput.value);
      });
    }

    document.querySelectorAll('.tok-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        handleSendMessage(btn.dataset.phrase);
      });
    });

    const btnToggleMode = document.getElementById('btn-toggle-mode');
    if (btnToggleMode) {
      btnToggleMode.addEventListener('click', () => {
        const newMode = (this.engine.mode === 'SEQUENTIAL') ? 'DISCRETE_MBON' : 'SEQUENTIAL';
        this.engine.setMode(newMode);
        btnToggleMode.textContent = (newMode === 'SEQUENTIAL')
          ? '[Mode: Sequential Neural Writing]'
          : '[Mode: Discrete 21-MBON Baseline]';
        this.ui.updateDashboard();
      });
    }

    const btnAudio = document.getElementById('btn-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const unmuted = this.speech.toggleMute();
        btnAudio.textContent = unmuted ? '[Audio: On]' : '[Audio: Muted]';
      });
    }

    const btnSugar = document.getElementById('btn-sucrose');
    if (btnSugar) {
      btnSugar.addEventListener('click', () => {
        this.engine.rewardSugar(35.0);
        this.speech.playDopamineChime();
        this.ui.updateDashboard();
      });
    }

    const btnAversion = document.getElementById('btn-aversion');
    if (btnAversion) {
      btnAversion.addEventListener('click', () => {
        this.engine.punishAversion(30.0);
        this.ui.updateDashboard();
      });
    }

    const btnExport = document.getElementById('btn-export-lexicon');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const json = this.engine.exportBrainJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FlyWire_Drosophila_Brain_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    const btnReset = document.getElementById('btn-reset-brain');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Reset connectome to Tabula Rasa (0 words)?')) {
          if (this.tutor) {
            this.tutor.pause();
            this.tutor.activeStageIndex = 0;
            this.tutor.activeCueIndex = 0;
            this.tutor.consecutiveHits = 0;
            this.tutor.cueErrors = 0;
            this.tutor.masteredCues.clear();
            this.tutor.cueTrialHistory.clear();
            this.tutor.stageIntroAnnounced.clear();
            this.tutor.updateUIStatus();
          }
          this.engine.resetToTabulaRasa();
          this.ui.initDefaultChat();
          this.ui.updateDashboard();
        }
      });
    }

    const btnToggleTutor = document.getElementById('btn-toggle-tutor');
    if (btnToggleTutor) {
      btnToggleTutor.addEventListener('click', () => {
        this.tutor.toggle();
      });
    }

    const tutorSpeedSelect = document.getElementById('tutor-speed-select');
    if (tutorSpeedSelect) {
      tutorSpeedSelect.addEventListener('change', (e) => {
        this.tutor.setSpeed(e.target.value);
      });
    }

    const btnStepTutor = document.getElementById('btn-step-tutor');
    if (btnStepTutor) {
      btnStepTutor.addEventListener('click', () => {
        this.tutor.executeTeacherStep();
      });
    }

    // High-speed autonomous batch training buttons
    const btnTrain25x = document.getElementById('btn-train-25x');
    if (btnTrain25x) {
      btnTrain25x.addEventListener('click', () => {
        this.tutor.trainBatch(25);
      });
    }

    const btnTrain100x = document.getElementById('btn-train-100x');
    if (btnTrain100x) {
      btnTrain100x.addEventListener('click', () => {
        this.tutor.trainBatch(100);
      });
    }

    const btnCompleteStage = document.getElementById('btn-complete-stage');
    if (btnCompleteStage) {
      btnCompleteStage.addEventListener('click', () => {
        this.tutor.completeCurrentStage();
      });
    }

    const btnMasterAll = document.getElementById('btn-master-all');
    if (btnMasterAll) {
      btnMasterAll.addEventListener('click', () => {
        this.tutor.masterAllStages();
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
