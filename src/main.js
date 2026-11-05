// Master Drosophila Linguist Application Controller
// Orchestrates 3D Three.js environment, Synaptic Plasticity Language Engine,
// Insectoid Speech Synthesis (TTS), and Real-Time Chat Telemetry.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { SynapticLanguageEngine } from './synapticLanguageEngine.js';
import { DrosophilaSpeechSynth } from './drosophilaSpeechSynth.js';
import { FlyLinguist3D } from './flyLinguist3D.js';
import { ConnectomeLanguage3D } from './connectomeLanguage3D.js';
import { TelemetryUI } from './telemetryUI.js';
import { CurriculumTutorBot } from './curriculumTutorBot.js';

export class App {
  constructor() {
    this.container = document.getElementById('viewport-container');
    this.canvas = document.getElementById('three-canvas');

    // 1. Initialize Core Engines
    this.engine = new SynapticLanguageEngine();
    this.speech = new DrosophilaSpeechSynth();

    // 2. Initialize Three.js 3D Scene
    this.initThree();

    // 3. Initialize 3D Fly Rig & Connectome
    this.fly3D = new FlyLinguist3D(this.scene, this.camera, this.controls);
    this.connectome3D = new ConnectomeLanguage3D(this.scene);

    // 4. Initialize UI & Telemetry Manager
    this.ui = new TelemetryUI(this.engine, this.speech, this.fly3D, this.connectome3D);

    // 5. Initialize Automated Curriculum Tutor Bot
    this.tutor = new CurriculumTutorBot(this.engine, this.speech, this.fly3D, this.connectome3D, this.ui);

    // Connect engine state change callback to UI update
    this.engine.onStateChange = () => {
      this.ui.updateDashboard();
    };

    // Connect speech events to 3D Fly Model
    this.speech.onSpeechStart = () => {
      this.fly3D.setSpeechState(true);
    };
    this.speech.onSpeechEnd = () => {
      this.fly3D.setSpeechState(false);
    };

    // 5. Wire Events & User Inputs
    this.initEvents();

    // 6. Initial UI state sync
    this.ui.updateDashboard();

    // 7. Start Animation Loop
    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c10);
    this.scene.fog = new THREE.FogExp2(0x0a0c10, 0.015);

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(13, 14, 20);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05; // Don't go below floor
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 80;
    this.controls.target.set(-4.2, 8, -2);
    this.controls.update();
  }

  initEvents() {
    // Window Resize
    window.addEventListener('resize', () => {
      if (!this.container || !this.camera || !this.renderer) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });

    // Chat Form Submission
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    const handleSendMessage = (text) => {
      if (!text || !text.trim()) return;
      const prompt = text.trim();
      chatInput.value = '';

      // 1. Post user message to chat UI
      this.ui.addUserMessage(prompt);

      // 2. Trigger fly listening pulse and typing indicator
      this.fly3D.triggerListeningPulse();
      this.ui.showTypingIndicator();

      // 3. Formulate fly response with dynamic neural latency
      const latency = 300 + Math.random() * 450;
      setTimeout(() => {
        const response = this.engine.generateResponse(prompt);

        // 4. Deliver response to UI
        this.ui.addFlyMessage(response);

        // 5. Audible vocalization with insectoid TTS
        this.fly3D.setSpeechState(true);
        this.speech.speak(response.text, response.stage,
          () => { this.fly3D.setSpeechState(true); },
          () => { this.fly3D.setSpeechState(false); }
        );

        // 6. Update dashboard metrics
        this.ui.updateDashboard();
      }, latency);
    };

    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSendMessage(chatInput.value);
      });
    }

    // Flashcard Curriculum Buttons
    document.querySelectorAll('.flashcard-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        handleSendMessage(btn.dataset.phrase);
      });
    });

    // View Switcher Buttons
    document.querySelectorAll('.segment-item').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.segment-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        this.fly3D.setView(view);

        // Toggle Connectome visibility based on view
        if (view === 'CONNECTOME_3D') {
          this.connectome3D.group.visible = true;
          this.fly3D.group.visible = true;
        } else {
          this.connectome3D.group.visible = true;
          this.fly3D.group.visible = true;
        }
      });
    });

    // Audio Toggle
    const btnAudio = document.getElementById('btn-audio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const unmuted = this.speech.toggleMute();
        btnAudio.classList.toggle('active', unmuted);
        document.getElementById('audio-icon').textContent = unmuted ? '[ON]' : '[OFF]';
        document.getElementById('audio-label').textContent = unmuted ? 'Audio On' : 'Muted';
      });
    }

    // Sugar Reward Button (+PAM Dopamine Surge)
    const btnSugar = document.getElementById('btn-sucrose');
    if (btnSugar) {
      btnSugar.addEventListener('click', () => {
        const res = this.engine.rewardSugar(35.0);
        this.speech.playDopamineChime();
        this.connectome3D.triggerDopamineSurge();
        this.fly3D.setSpeechState(true);
        setTimeout(() => this.fly3D.setSpeechState(false), 600);
        this.ui.updateDashboard();
      });
    }

    // Auto-Tutor Bot Event Listeners
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

    // Export Lexicon JSON Button
    const btnExport = document.getElementById('btn-export-lexicon');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        const json = this.engine.exportBrainJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FlyWire_Drosophila_Linguist_Brain_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Reset Brain (Tabula Rasa) Button
    const btnReset = document.getElementById('btn-reset-brain');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        const ok = confirm('Reset Drosophila language connectome to Tabula Rasa (0 words)? All learned vocabulary will be cleared.');
        if (ok) {
          if (this.tutor) {
            this.tutor.pause();
            this.tutor.currentLessonIdx = 0;
            this.tutor.currentQuestionIdx = 0;
            this.tutor.updateUIStatus();
          }
          this.engine.resetToTabulaRasa();
          this.ui.initDefaultChat();
          this.ui.updateDashboard();
          if (this.connectome3D) this.connectome3D.triggerAversionSpike();
        }
      });
    }

    // Recenter Camera Button
    const btnRecenter = document.getElementById('btn-recenter-cam');
    if (btnRecenter) {
      btnRecenter.addEventListener('click', () => {
        this.fly3D.recenterCamera();
      });
    }

    // Keyboard Shortcuts: 'C' to recenter, Escape to blur
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'c' || e.key === 'C') && document.activeElement !== chatInput) {
        this.fly3D.recenterCamera();
      }
    });

    // Chat Window Close / Minimize
    const chatClose = document.getElementById('chat-close');
    const chatWindow = document.getElementById('chat-window-container');
    if (chatClose && chatWindow) {
      chatClose.addEventListener('click', () => {
        chatWindow.classList.toggle('minimized');
      });
    }
  }

  animate(now) {
    requestAnimationFrame(this.animate);
    const dt = Math.min(0.1, (now - this.lastTime) / 1000.0);
    this.lastTime = now;

    // 1. Update 3D Fly Rig
    if (this.fly3D) {
      this.fly3D.update(dt, this.speech, this.engine);
    }

    // 2. Update 3D Connectome
    if (this.connectome3D) {
      this.connectome3D.update(
        dt,
        this.speech.isSpeaking,
        this.fly3D.isListening,
        this.engine
      );
    }

    // 3. Update Orbit Controls
    if (this.controls) {
      this.controls.update();
    }

    // 4. Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate App when DOM loads
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
