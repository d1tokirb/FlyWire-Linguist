// Master Drosophila Linguist Controller
// Minimalist, high-performance orchestration of connectome language engine,
// insectoid speech synthesis, real-time telemetry, multi-subject comparative lab,
// and scientific experiment configuration.

import { SequentialLanguageEngine } from './sequentialLanguageEngine.js';
import { SequentialCurriculumTutor } from './sequentialCurriculumTutor.js';
import { DrosophilaSpeechSynth } from './drosophilaSpeechSynth.js';
import { TelemetryUI } from './telemetryUI.js';
import { ComparativeLab } from './comparativeLab.js';
import { ComparativeUI } from './comparativeUI.js';
import { ExperimentSetupUI } from './experimentSetupUI.js';
import { LanguageImplantEngine } from './languageImplantEngine.js';
import { NeuralCheckpoint } from './neuralCheckpoint.js';

export class App {
  constructor() {
    this.currentView = 'COMPARATIVE'; // 'COMPARATIVE' or 'SINGLE'
    this.engine = new SequentialLanguageEngine({ mode: 'SEQUENTIAL' });
    this.speech = new DrosophilaSpeechSynth();
    this.ui = new TelemetryUI(this.engine, this.speech);
    this.tutor = new SequentialCurriculumTutor(this.engine, this.speech, this.ui);
    this.tutor.setSpeed('TURBO');

    // Multi-subject comparative lab coordinator
    this.lab = new ComparativeLab({
      seed: 42,
      baseSeed: 42,
      intensity: 'MEDIUM',
      implantIntensity: 'MEDIUM',
      includeScrambled: true
    });
    this.lab.setSpeed('TURBO');
    this.lab.onLabUpdate = () => {
      this.comparativeUI.render();
    };
    this.lab.onTrialComplete = () => {
      this.comparativeUI.render();
    };

    this.comparativeUI = new ComparativeUI(this.lab, (flyIdx) => {
      this.inspectFly(flyIdx);
    });

    this.setupUI = new ExperimentSetupUI((config) => {
      this.applyExperimentConfig(config);
    });

    this.engine.onStateChange = () => {
      this.ui.updateDashboard();
    };

    this.initEvents();
    this.setView('COMPARATIVE');
    this.comparativeUI.render();
    this.ui.updateDashboard();

    // Mandatory startup flow: Open Experiment Setup interface before running simulation
    this.setupUI.show();
  }

  setView(viewMode) {
    this.currentView = viewMode;
    const labView = document.getElementById('comparative-lab-view');
    const singleView = document.getElementById('main');
    const btnToggle = document.getElementById('btn-toggle-view');

    if (viewMode === 'COMPARATIVE') {
      if (labView) labView.style.display = 'flex';
      if (singleView) singleView.style.display = 'none';
      if (btnToggle) btnToggle.textContent = '[View: Single Fly View]';
    } else {
      if (labView) labView.style.display = 'none';
      if (singleView) singleView.style.display = 'grid';
      if (btnToggle) btnToggle.textContent = '[View: Comparative Lab]';
    }
  }

  inspectFly(flyIdx) {
    const fly = this.lab.subjects[flyIdx];
    if (!fly) return;

    // Clone fly's state into the single-fly engine to avoid contaminating the comparative cohort
    this.engine = new SequentialLanguageEngine({ mode: 'SEQUENTIAL', seed: fly.seed });
    NeuralCheckpoint.cloneState(fly.engine, this.engine);
    this.ui.engine = this.engine;
    this.tutor.engine = this.engine;

    this.engine.onStateChange = () => {
      this.ui.updateDashboard();
    };

    const stageNameEl = document.getElementById('val-stage-name');
    if (stageNameEl) {
      stageNameEl.textContent = `Inspecting: ${fly.name} [${fly.condition}] (Isolated Clone)`;
      stageNameEl.style.color = fly.color;
    }

    this.setView('SINGLE');
    this.ui.updateDashboard();
  }

  applyExperimentConfig(config) {
    if (config.mode === 'COMPARATIVE') {
      if (this.tutor && this.tutor.isRunning) {
        this.tutor.pause();
      }
      this.lab.pause();
      this.lab = new ComparativeLab({
        seed: config.seed,
        baseSeed: config.seed,
        intensity: config.intensity,
        implantIntensity: config.intensity,
        includeScrambled: config.includeScrambled
      });
      this.lab.onLabUpdate = () => {
        this.comparativeUI.render();
      };
      this.lab.onTrialComplete = () => {
        this.comparativeUI.render();
      };
      this.comparativeUI.lab = this.lab;
      this.setView('COMPARATIVE');
      this.comparativeUI.render();

      if (config.environment === 'AUTONOMOUS') {
        this.lab.start();
        this.comparativeUI.updateControls();
      }
    } else {
      // Single Fly mode
      if (this.lab && this.lab.isRunning) {
        this.lab.pause();
      }
      this.engine = new SequentialLanguageEngine({ mode: 'SEQUENTIAL', seed: config.seed });
      this.ui.engine = this.engine;
      this.tutor.engine = this.engine;
      this.engine.onStateChange = () => {
        this.ui.updateDashboard();
      };

      if (config.importedCheckpoint) {
        NeuralCheckpoint.loadCheckpoint(this.engine, config.importedCheckpoint);
      } else {
        LanguageImplantEngine.applyImplant(this.engine, config.condition, {
          intensity: config.intensity,
          seed: config.seed
        });
      }

      const stageNameEl = document.getElementById('val-stage-name');
      if (stageNameEl) {
        stageNameEl.textContent = `Subject [${config.condition || 'Custom'}]`;
        stageNameEl.style.color = 'var(--c-blue)';
      }

      this.setView('SINGLE');
      this.ui.updateDashboard();

      if (config.environment === 'AUTONOMOUS') {
        this.tutor.start();
      } else {
        this.tutor.pause();
      }
    }
  }

  initEvents() {
    const btnToggleView = document.getElementById('btn-toggle-view');
    if (btnToggleView) {
      btnToggleView.addEventListener('click', () => {
        const next = (this.currentView === 'COMPARATIVE') ? 'SINGLE' : 'COMPARATIVE';
        this.setView(next);
      });
    }

    const btnOpenSetup = document.getElementById('btn-open-setup');
    if (btnOpenSetup) {
      btnOpenSetup.addEventListener('click', () => {
        this.setupUI.show();
      });
    }

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
        const cp = NeuralCheckpoint.createCheckpoint(this.engine, {
          name: 'Drosophila Subject',
          condition: 'ACTIVE'
        });
        const json = JSON.stringify(cp, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FlyWire_Drosophila_Checkpoint_${Date.now()}.json`;
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
