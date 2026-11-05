// Telemetry & Interactive Chat Coordinator
// Manages the Apple-style chat thread, typing indicators, vocabulary lexicon cloud,
// biological telemetry dashboard, and live 60 FPS neural oscilloscope canvas.

export class TelemetryUI {
  constructor(languageEngine, speechSynth, fly3D, connectome3D) {
    this.engine = languageEngine;
    this.speech = speechSynth;
    this.fly = fly3D;
    this.connectome = connectome3D;

    this.chatThread = document.getElementById('chat-thread');
    this.oscilloscopeCanvas = document.getElementById('oscilloscope-canvas');
    this.oscCtx = this.oscilloscopeCanvas ? this.oscilloscopeCanvas.getContext('2d') : null;

    this.initOscilloscope();
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
        // Condition on core command tokens via genuine action-gated scalar reinforcement
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

        this.speech.playDopamineChime();
        if (this.connectome) this.connectome.triggerDopamineSurge();
        const stats = this.engine.mb.getSynapticWeightStats();

        if (resultLog) {
          resultLog.innerHTML = `<b>[Action-Gated Conditioning]:</b> 'go', 'left', 'right', 'stop'.<br/>Reinforcement Trials: ${totalTrials} (Correct: ${correctTrials}/${totalTrials}).<br/>Depressed KC->MBON Synapses: ${stats.depressedSynapsesCount} (LTD plasticity: ${stats.plasticityIndex}%).`;
        }
        this.updateDashboard();
      });
    }

    if (btnExtinct) {
      btnExtinct.addEventListener('click', () => {
        const stats = this.engine.runExtinctionTrial();
        if (resultLog) {
          resultLog.innerHTML = `<b>[Extinction Trial]:</b> Synapses decayed toward empirical biological baselines.<br/>Remaining depressed synapses: ${stats.depressedSynapsesCount} (mean weight: ${stats.meanWeight}).`;
        }
        this.updateDashboard();
      });
    }

    if (btnGen) {
      btnGen.addEventListener('click', () => {
        const res1 = this.engine.testGeneralization('go', 'go left');
        const res2 = this.engine.testGeneralization('left', 'stop right');
        if (resultLog) {
          resultLog.innerHTML = `<b>[Generalization Test]:</b><br/>'go' vs 'go left': Cosine Similarity = <b>${res1.cosineSimilarity}</b> (${res1.overlappingKCs} shared KCs)<br/>'left' vs 'stop right': Cosine Similarity = <b>${res2.cosineSimilarity}</b> (${res2.overlappingKCs} shared KCs)`;
        }
        this.updateDashboard();
      });
    }
  }

  initDefaultChat() {
    if (!this.chatThread) return;
    this.chatThread.innerHTML = '';

    // Welcome system notice
    const notice = document.createElement('div');
    notice.className = 'chat-system-notice';
    notice.innerHTML = `
      <div class="system-badge">Tabula Rasa Activated</div>
      <div class="system-text">
        The fruit fly has zero English comprehension. Type greeting tokens (e.g. <b>"Hello"</b>, <b>"I am human"</b>, <b>"Fly"</b>, <b>"Sugar"</b>) to begin real-time synaptic language acquisition.
      </div>
    `;
    this.chatThread.appendChild(notice);
  }

  // Add User Message to Chat
  addUserMessage(text) {
    if (!this.chatThread) return;

    const row = document.createElement('div');
    row.className = 'chat-message-row user-row';
    row.innerHTML = `
      <div class="message-bubble user-bubble">
        <div class="bubble-text">${this.escapeHTML(text)}</div>
        <div class="bubble-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
      </div>
    `;
    this.chatThread.appendChild(row);
    this.scrollToBottom();

    // Trigger Johnston's organ twitch on fly rig
    if (this.fly) this.fly.triggerListeningPulse();
  }

  // Show "Fly is formulating syllables..." typing indicator
  showTypingIndicator() {
    this.removeTypingIndicator();
    if (!this.chatThread) return;

    const row = document.createElement('div');
    row.className = 'chat-message-row fly-row typing-indicator-row';
    row.id = 'fly-typing-indicator';
    row.innerHTML = `
      <div class="fly-avatar">[Fly]</div>
      <div class="message-bubble fly-bubble typing-bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
        <span class="typing-label">Transducing acoustic Johnston's organ...</span>
      </div>
    `;
    this.chatThread.appendChild(row);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const existing = document.getElementById('fly-typing-indicator');
    if (existing) existing.remove();
  }

  // Add Fly Response Message to Chat
  addFlyMessage(res) {
    this.removeTypingIndicator();
    if (!this.chatThread) return;

    const row = document.createElement('div');
    row.className = 'chat-message-row fly-row';

    const stageInfo = this.engine.getFluencyStage();
    const confClass = res.confidence > 70 ? 'conf-high' : res.confidence > 40 ? 'conf-mid' : 'conf-low';

    row.innerHTML = `
      <div class="fly-avatar" title="Drosophila melanogaster (139k neurons)">[Fly]</div>
      <div class="message-bubble fly-bubble">
        <div class="fly-bubble-meta">
          <span class="fly-meta-circuit">${res.circuit}</span>
          <span class="fly-meta-conf ${confClass}">${res.confidence}% Conf</span>
        </div>
        <div class="bubble-text fly-speech-text">${this.escapeHTML(res.text)}</div>
        <div class="fly-bubble-actions">
          <button class="bubble-action-btn btn-speak-msg" title="Replay fly voice audio">
            Speak
          </button>
          <button class="bubble-action-btn btn-reward-msg" title="Praise fly (+25% PAM Dopamine & synaptic reinforcement)">
            Sugar Reward
          </button>
          <button class="bubble-action-btn btn-correct-msg" title="Teach immediate correction">
            Teach
          </button>
        </div>
        <div class="bubble-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
      </div>
    `;

    // Hook up speak button
    const speakBtn = row.querySelector('.btn-speak-msg');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        if (this.fly) this.fly.setSpeechState(true);
        this.speech.speak(res.text, res.stage, 
          () => { if (this.fly) this.fly.setSpeechState(true); },
          () => { if (this.fly) this.fly.setSpeechState(false); }
        );
      });
    }

    // Hook up praise / sugar button
    const rewardBtn = row.querySelector('.btn-reward-msg');
    if (rewardBtn) {
      rewardBtn.addEventListener('click', () => {
        this.engine.rewardSugar(30);
        this.speech.playDopamineChime();
        if (this.connectome) this.connectome.triggerDopamineSurge();
        rewardBtn.classList.add('rewarded');
        rewardBtn.textContent = 'Rewarded (+PAM)';
        rewardBtn.disabled = true;
        this.updateDashboard();
      });
    }

    // Hook up teach correction button
    const correctBtn = row.querySelector('.btn-correct-msg');
    if (correctBtn) {
      correctBtn.addEventListener('click', () => {
        const correction = prompt(`Teach the fly what it should have said to "${this.engine.lastUserPrompt}":`, res.text);
        if (correction && correction.trim()) {
          this.engine.teachCorrection(correction.trim());
          if (this.connectome) this.connectome.triggerDopamineSurge();
          alert(`Synaptic pathway imprinted: "${correction.trim()}" is now linked to "${this.engine.lastUserPrompt}".`);
          this.updateDashboard();
        }
      });
    }

    this.chatThread.appendChild(row);
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

  // Update Right Dashboard & Top Navigation Bar
  updateDashboard() {
    const stage = this.engine.getFluencyStage();
    const score = this.engine.getFluencyScore();

    // Top Bar Badges
    const vocabBadge = document.getElementById('badge-vocab-count');
    if (vocabBadge) vocabBadge.textContent = `${this.engine.lexicon.size} Words`;

    const stageCapsule = document.getElementById('stage-capsule-lbl');
    if (stageCapsule) {
      stageCapsule.textContent = stage.name;
      stageCapsule.style.color = stage.color;
    }

    // Hero Metric: Fluency Score %
    const heroFluency = document.getElementById('val-fluency-score');
    if (heroFluency) heroFluency.textContent = `${score}%`;

    const heroStageName = document.getElementById('val-stage-name');
    if (heroStageName) heroStageName.textContent = stage.badge;

    const heroProgress = document.getElementById('fluency-progress-bar');
    if (heroProgress) {
      heroProgress.style.width = `${score}%`;
      heroProgress.style.backgroundColor = stage.color;
    }

    // Activity Metrics
    const valVocab = document.getElementById('val-vocab-size');
    if (valVocab) valVocab.textContent = `${this.engine.lexicon.size} tokens`;

    const valHeard = document.getElementById('val-words-heard');
    if (valHeard) valHeard.textContent = `${this.engine.totalWordsHeard} words`;

    const valSpoken = document.getElementById('val-utterances-spoken');
    if (valSpoken) valSpoken.textContent = `${this.engine.totalUtterancesSpoken} outputs`;

    const valBabble = document.getElementById('val-babble-syllables');
    if (valBabble) valBabble.textContent = `${this.engine.totalSyllablesBabble} syllables`;

    // Biological States
    const valPam = document.getElementById('val-pam-dopamine');
    if (valPam) {
      valPam.textContent = `${Math.round(this.engine.pamDopamine)}%`;
      valPam.style.color = this.engine.pamDopamine > 65 ? 'var(--apple-green)' : 'var(--apple-blue)';
    }

    const valPpl1 = document.getElementById('val-ppl1-aversion');
    if (valPpl1) {
      valPpl1.textContent = `${Math.round(this.engine.ppl1Aversion)}%`;
      valPpl1.style.color = this.engine.ppl1Aversion > 50 ? 'var(--apple-red)' : 'var(--text-secondary)';
    }

    const valAssoc = document.getElementById('val-associations-count');
    if (valAssoc) valAssoc.textContent = `${this.engine.mb ? this.engine.mb.conditioningTrials : 0} trials`;

    // Mushroom Body Connectome Live Telemetry
    if (this.engine.mb) {
      const mbStats = this.engine.mb.getSynapticWeightStats();

      const kcSparsityBadge = document.getElementById('val-kc-sparsity-badge');
      if (kcSparsityBadge) {
        kcSparsityBadge.textContent = `${this.engine.lastKCSparsity || 5.0}% Sparse`;
      }

      const activeKCsElem = document.getElementById('val-active-kcs');
      if (activeKCsElem) {
        activeKCsElem.textContent = `${this.engine.lastActiveKCCount || 0} / 2,597`;
      }

      const aplElem = document.getElementById('val-apl-inhibition');
      if (aplElem) {
        aplElem.textContent = `${this.engine.mb.aplActivity.toFixed(2)} GABA`;
      }

      const ltdDeltaElem = document.getElementById('val-ltd-delta');
      if (ltdDeltaElem) {
        ltdDeltaElem.textContent = `${mbStats.lastTrialDepressed} synapses`;
      }

      const depressedElem = document.getElementById('val-depressed-synapses');
      if (depressedElem) {
        depressedElem.textContent = `${mbStats.depressedSynapsesCount} / ${mbStats.connectedSynapsesCount} (${mbStats.plasticityIndex}%)`;
      }

      const winningMBONElem = document.getElementById('val-winning-mbon');
      const activeCompElem = document.getElementById('val-active-compartment');
      let activeCompName = 'gamma5';

      if (this.engine.lastWinningMBON) {
        if (winningMBONElem) {
          winningMBONElem.textContent = `${this.engine.lastWinningMBON.label} (${this.engine.lastWinningMBON.id || 'MBON'})`;
        }
        if (this.engine.lastWinningMBON.compartment) {
          activeCompName = this.engine.lastWinningMBON.compartment;
        }
      } else {
        if (winningMBONElem) winningMBONElem.textContent = 'Resting';
      }

      if (activeCompElem) {
        activeCompElem.textContent = `${activeCompName} (PAM-LTD Gated)`;
      }

      // Highlight active compartment badge
      const compBadges = document.querySelectorAll('.comp-badge');
      compBadges.forEach(badge => {
        const comp = badge.getAttribute('data-comp');
        if (comp === activeCompName) {
          badge.classList.add('active');
        } else {
          badge.classList.remove('active');
        }
      });
    }

    // Render Vocabulary Lexicon Cloud & Synaptic Graph
    this.renderLexiconCloud();
  }

  // Render Learned Words Cloud with Confidence & Frequency
  renderLexiconCloud() {
    const container = document.getElementById('lexicon-cloud');
    if (!container) return;

    if (this.engine.lexicon.size === 0) {
      container.innerHTML = `
        <div class="empty-lexicon">
          <span>[Tabula Rasa]</span>
          <span>No words imprinted yet. Type to begin associative conditioning.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    const sorted = Array.from(this.engine.lexicon.values()).sort((a, b) => b.count - a.count);

    sorted.slice(0, 30).forEach(item => {
      const chip = document.createElement('div');
      chip.className = 'lexicon-chip';
      const confColor = item.confidence > 75 ? '#30d158' : item.confidence > 45 ? '#64d2ff' : '#ff9f0a';

      chip.innerHTML = `
        <span class="chip-token">${this.escapeHTML(item.token)}</span>
        <span class="chip-count">${item.count}x</span>
        <div class="chip-confidence-bar" style="width: ${item.confidence}%; background-color: ${confColor};"></div>
      `;
      chip.title = `Token: "${item.token}" • Confidence: ${item.confidence}% • Used: ${item.count} times`;

      // Clicking chip inputs the word into prompt
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

  // 60 FPS Real-time Oscilloscope Canvas
  initOscilloscope() {
    if (!this.oscilloscopeCanvas || !this.oscCtx) return;

    const render = () => {
      requestAnimationFrame(render);
      const ctx = this.oscCtx;
      const cvs = this.oscilloscopeCanvas;
      const w = cvs.width;
      const h = cvs.height;

      ctx.fillStyle = 'rgba(10, 14, 20, 0.4)';
      ctx.fillRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      const timeData = this.speech ? this.speech.getTimeDomainData() : null;
      const isSpeaking = this.speech && this.speech.isSpeaking;

      ctx.lineWidth = 2;
      ctx.strokeStyle = isSpeaking ? '#30d158' : (this.fly && this.fly.isListening ? '#ff9f0a' : '#32ade6');
      ctx.beginPath();

      const sliceWidth = w / (timeData ? timeData.length : 128);
      let x = 0;

      for (let i = 0; i < (timeData ? timeData.length : 128); i++) {
        let v = 128;
        if (timeData && isSpeaking) {
          v = timeData[i];
        } else if (this.fly && this.fly.isListening) {
          v = 128 + Math.sin(Date.now() * 0.02 + i * 0.4) * 35;
        } else {
          v = 128 + Math.sin(Date.now() * 0.003 + i * 0.15) * 8;
        }

        const y = (v / 255.0) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.stroke();
    };

    render();
  }
}
