// Telemetry & Minimalist Chat Coordinator
// Manages the chat thread, action-gated conditioning experiments,
// and real-time biological connectome telemetry dashboard.

export class TelemetryUI {
  constructor(languageEngine, speechSynth) {
    this.engine = languageEngine;
    this.speech = speechSynth;

    this.chatThread = document.getElementById('chat-thread');
    this.initDefaultChat();
    this.initExperiments();
  }

  initExperiments() {
    const btnTrain = document.getElementById('btn-exp-train-commands');
    const btnExtinct = document.getElementById('btn-exp-extinction');
    const btnGen = document.getElementById('btn-exp-generalize');
    const resultLog = document.getElementById('exp-result-log');

    if (btnTrain) {
      btnTrain.addEventListener('click', () => {
        const commands = ['go', 'left', 'right', 'stop'];
        let correctTrials = 0;
        let totalTrials = 0;

        for (let iter = 0; iter < 12; iter++) {
          commands.forEach(cmd => {
            totalTrials++;
            const res = this.engine.mb.forward([cmd]);
            const isCorrect = (res.chosenLabel === cmd);
            if (isCorrect) correctTrials++;
            this.engine.mb.applyReinforcement(isCorrect ? 1.0 : -1.0, res.chosenIdx);
            this.engine.learnFromInput(cmd);
          });
        }

        if (this.speech) this.speech.playDopamineChime();
        const stats = this.engine.mb.getSynapticWeightStats();

        if (resultLog) {
          resultLog.textContent = `[Action-Gated RL] 'go', 'left', 'right', 'stop'\nTrials: ${totalTrials} (Correct: ${correctTrials}/${totalTrials})\nDepressed KC->MBON Synapses: ${stats.depressedSynapsesCount} (LTD: ${stats.plasticityIndex}%)`;
        }
        this.updateDashboard();
      });
    }

    if (btnExtinct) {
      btnExtinct.addEventListener('click', () => {
        const stats = this.engine.runExtinctionTrial();
        if (resultLog) {
          resultLog.textContent = `[Extinction Trial] Synapses decayed toward empirical baselines.\nRemaining depressed synapses: ${stats.depressedSynapsesCount} (Mean weight: ${stats.meanWeight})`;
        }
        this.updateDashboard();
      });
    }

    if (btnGen) {
      btnGen.addEventListener('click', () => {
        const res1 = this.engine.testGeneralization('go', 'go left');
        const res2 = this.engine.testGeneralization('left', 'stop right');
        if (resultLog) {
          resultLog.textContent = `[Generalization Test]\n'go' vs 'go left': Cosine Sim = ${res1.cosineSimilarity} (${res1.overlappingKCs} shared KCs)\n'left' vs 'stop right': Cosine Sim = ${res2.cosineSimilarity} (${res2.overlappingKCs} shared KCs)`;
        }
        this.updateDashboard();
      });
    }
  }

  initDefaultChat() {
    if (!this.chatThread) return;
    this.chatThread.innerHTML = `
      <div class="chat-system-notice">
        <b>Tabula Rasa Activated:</b> The fly begins with zero English comprehension.
        Send command tokens (e.g. "go", "left", "sugar") or activate Auto-Tutor to begin synaptic conditioning.
      </div>
    `;
  }

  addUserMessage(text) {
    if (!this.chatThread) return;
    const msg = document.createElement('div');
    msg.className = 'chat-message chat-user';
    msg.innerHTML = `
      <div class="bubble-meta">Human</div>
      <div class="bubble">${this.escapeHTML(text)}</div>
    `;
    this.chatThread.appendChild(msg);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    this.removeTypingIndicator();
    if (!this.chatThread) return;
    const typing = document.createElement('div');
    typing.id = 'fly-typing-indicator';
    typing.className = 'chat-message chat-fly';
    typing.innerHTML = `<div class="bubble" style="color: var(--text-muted); font-style: italic;">Transducing Johnston organ...</div>`;
    this.chatThread.appendChild(typing);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const el = document.getElementById('fly-typing-indicator');
    if (el) el.remove();
  }

  addFlyMessage(res) {
    this.removeTypingIndicator();
    if (!this.chatThread) return;

    const msg = document.createElement('div');
    msg.className = 'chat-message chat-fly';
    msg.innerHTML = `
      <div class="bubble-meta">
        <span>Fly (${res.circuit})</span>
        <span>${res.confidence}% Conf</span>
      </div>
      <div class="bubble">${this.escapeHTML(res.text)}</div>
      <div class="bubble-actions">
        <button type="button" class="bubble-btn btn-speak">Speak</button>
        <button type="button" class="bubble-btn btn-reward">+Sugar (+PAM)</button>
        <button type="button" class="bubble-btn btn-teach">Teach</button>
      </div>
    `;

    const btnSpeak = msg.querySelector('.btn-speak');
    if (btnSpeak) {
      btnSpeak.addEventListener('click', () => {
        if (this.speech) this.speech.speak(res.text, res.stage);
      });
    }

    const btnReward = msg.querySelector('.btn-reward');
    if (btnReward) {
      btnReward.addEventListener('click', () => {
        this.engine.rewardSugar(30);
        if (this.speech) this.speech.playDopamineChime();
        btnReward.textContent = 'Rewarded';
        btnReward.disabled = true;
        this.updateDashboard();
      });
    }

    const btnTeach = msg.querySelector('.btn-teach');
    if (btnTeach) {
      btnTeach.addEventListener('click', () => {
        const target = prompt(`Teach the fly the expected output for "${this.engine.lastUserPrompt}":`, res.text);
        if (target && target.trim()) {
          this.engine.teachCorrection(target.trim());
          this.updateDashboard();
        }
      });
    }

    this.chatThread.appendChild(msg);
    this.scrollToBottom();
  }

  addTutorMessage(text, tag) {
    if (!this.chatThread) return;
    const msg = document.createElement('div');
    msg.className = 'chat-message chat-tutor';
    msg.innerHTML = `
      <div class="bubble-meta">
        <b>Auto-Tutor</b> &bull; ${this.escapeHTML(tag)}
      </div>
      <div>${this.escapeHTML(text)}</div>
    `;
    this.chatThread.appendChild(msg);
    this.scrollToBottom();
  }

  addTutorFeedback(feedbackText) {
    if (!this.chatThread) return;
    const msg = document.createElement('div');
    msg.className = 'chat-system-notice';
    msg.innerHTML = feedbackText;
    this.chatThread.appendChild(msg);
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.chatThread) {
      this.chatThread.scrollTop = this.chatThread.scrollHeight;
    }
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  updateDashboard() {
    const stage = this.engine.getFluencyStage();
    const score = this.engine.getFluencyScore();

    const stageEl = document.getElementById('val-stage-name');
    if (stageEl) {
      stageEl.textContent = stage.name;
      stageEl.style.color = stage.color;
    }

    const scoreEl = document.getElementById('val-fluency-score');
    if (scoreEl) scoreEl.textContent = `${score}%`;

    const pamEl = document.getElementById('val-pam-dopamine');
    if (pamEl) pamEl.textContent = `${Math.round(this.engine.pamDopamine)}%`;

    const ppl1El = document.getElementById('val-ppl1-aversion');
    if (ppl1El) ppl1El.textContent = `${Math.round(this.engine.ppl1Aversion)}%`;

    if (this.engine.mb) {
      const stats = this.engine.mb.getSynapticWeightStats();

      const depressedEl = document.getElementById('val-depressed-synapses');
      if (depressedEl) {
        depressedEl.textContent = `${stats.depressedSynapsesCount} / ${stats.connectedSynapsesCount} (${stats.plasticityIndex}%)`;
      }

      const activeKCsEl = document.getElementById('val-active-kcs');
      if (activeKCsEl) {
        activeKCsEl.textContent = `${this.engine.lastActiveKCCount || 0} / 2,597`;
      }

      const aplEl = document.getElementById('val-apl-inhibition');
      if (aplEl) {
        aplEl.textContent = `${this.engine.mb.aplActivity.toFixed(2)} GABA`;
      }

      const winningMbonEl = document.getElementById('val-winning-mbon');
      if (winningMbonEl) {
        winningMbonEl.textContent = this.engine.lastWinningMBON ? `${this.engine.lastWinningMBON.label} (${this.engine.lastWinningMBON.id})` : 'Resting';
      }

      const compEl = document.getElementById('val-active-compartment');
      if (compEl) {
        compEl.textContent = this.engine.lastWinningMBON ? this.engine.lastWinningMBON.compartment : 'gamma5';
      }
    }

    this.renderLexiconCloud();
  }

  renderLexiconCloud() {
    const container = document.getElementById('lexicon-cloud');
    if (!container) return;

    if (this.engine.lexicon.size === 0) {
      container.innerHTML = `<div class="empty-lexicon">Tabula Rasa: No conditioned words yet.</div>`;
      return;
    }

    container.innerHTML = '';
    const sorted = Array.from(this.engine.lexicon.values()).sort((a, b) => b.count - a.count);

    sorted.slice(0, 30).forEach(item => {
      const chip = document.createElement('span');
      chip.className = 'lexicon-chip';
      chip.textContent = `${item.token} (${item.count}x)`;
      chip.title = `Confidence: ${item.confidence}%`;
      chip.addEventListener('click', () => {
        const input = document.getElementById('chat-input');
        if (input) {
          input.value = (input.value ? input.value + ' ' : '') + item.token;
          input.focus();
        }
      });
      container.appendChild(chip);
    });
  }
}
