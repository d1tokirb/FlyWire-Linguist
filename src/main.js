// Master Drosophila Linguist Controller
// Minimalist, high-performance orchestration of connectome language engine,
// insectoid speech synthesis, and real-time telemetry.

import { SynapticLanguageEngine } from './synapticLanguageEngine.js';
import { DrosophilaSpeechSynth } from './drosophilaSpeechSynth.js';
import { TelemetryUI } from './telemetryUI.js';
import { CurriculumTutorBot } from './curriculumTutorBot.js';

export class App {
  constructor() {
    this.engine = new SynapticLanguageEngine();
    this.speech = new DrosophilaSpeechSynth();
    this.ui = new TelemetryUI(this.engine, this.speech);
    this.tutor = new CurriculumTutorBot(this.engine, this.speech, this.ui);

    this.engine.onStateChange = () => {
      this.ui.updateDashboard();
    };

    this.initEvents();
    this.ui.updateDashboard();
  }

  initEvents() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    const handleSendMessage = (text) => {
      if (!text || !text.trim()) return;
      const prompt = text.trim();
      chatInput.value = '';

      this.ui.addUserMessage(prompt);
      this.ui.showTypingIndicator();

      const latency = 200 + Math.random() * 300;
      setTimeout(() => {
        const response = this.engine.generateResponse(prompt);
        this.ui.addFlyMessage(response);
        this.speech.speak(response.text, response.stage);
        this.ui.updateDashboard();
      }, latency);
    };

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSendMessage(chatInput.value);
      });
    }

    document.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        handleSendMessage(btn.dataset.phrase);
      });
    });

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
            this.tutor.currentLessonIdx = 0;
            this.tutor.currentQuestionIdx = 0;
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

    const tutorModuleSelect = document.getElementById('tutor-module-select');
    if (tutorModuleSelect) {
      tutorModuleSelect.addEventListener('change', (e) => {
        this.tutor.setModule(e.target.value);
      });
    }

    const btnStepTutor = document.getElementById('btn-step-tutor');
    if (btnStepTutor) {
      btnStepTutor.addEventListener('click', () => {
        this.tutor.executeTutorStep();
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new App();
});
