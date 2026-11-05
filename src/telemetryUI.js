// High-Density Telemetry Coordinator & Terminal Console
// Orchestrates the terminal event stream, dense connectome telemetry tables,
// and action-gated conditioning experiments.

export class TelemetryUI {
  constructor(languageEngine, speechSynth) {
    this.engine = languageEngine;
    this.speech = speechSynth;

    this.chatThread = document.getElementById('chat-thread');
    this.initDefaultChat();
    this.initExperiments();
  }

  initDefaultChat() {
    if (!this.chatThread) return;
    this.chatThread.innerHTML = `
      <div class="log-entry">
        <span class="log-time">${this.getTimeStr()}</span>
        <span class="log-speaker system">[SYSTEM]</span>
        <span class="log-msg">FlyWire-Linguist initialized in Tabula Rasa state (0 words, 0 depressed synapses relative to FAFB v783 baseline). Type inputs or engage Auto-Tutor.</span>
      </div>
    `;
  }

  getTimeStr() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
          resultLog.textContent = `[Action-Gated RL] 'go', 'left', 'right', 'stop'\nReinforcement Trials: ${totalTrials} (Correct: ${correctTrials}/${totalTrials})\nDepressed KC->MBON Synapses: ${stats.depressedSynapsesCount} (LTD: ${stats.plasticityIndex}%)`;
        }
        this.addSystemLog(`[EXPERIMENT] Conditioned commands: 'go', 'left', 'right', 'stop'. Trials: ${totalTrials}, Correct: ${correctTrials}. Depressed Synapses: ${stats.depressedSynapsesCount}`);
        this.updateDashboard();
      });
    }

    if (btnExtinct) {
      btnExtinct.addEventListener('click', () => {
        const stats = this.engine.runExtinctionTrial();
        if (resultLog) {
          resultLog.textContent = `[Extinction Trial] Decayed weights toward individual empirical baselines W0.\nDepressed Synapses: ${stats.depressedSynapsesCount} (Mean weight: ${stats.meanWeight})`;
        }
        this.addSystemLog(`[EXTINCTION] Spontaneous recovery toward baseline W0. Depressed Synapses: ${stats.depressedSynapsesCount}`);
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
        this.addSystemLog(`[GENERALIZATION] 'go' vs 'go left': Cosine Sim = ${res1.cosineSimilarity} (${res1.overlappingKCs} shared KCs)`);
        this.updateDashboard();
      });
    }
  }

  addUserMessage(text) {
    if (!this.chatThread) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry user-entry';
    entry.innerHTML = `
      <span class="log-time">${this.getTimeStr()}</span>
      <span class="log-speaker human">[USER]</span>
      <span class="log-msg">"${this.escapeHTML(text)}"</span>
    `;
    this.chatThread.appendChild(entry);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    this.removeTypingIndicator();
    if (!this.chatThread) return;
    const typing = document.createElement('div');
    typing.id = 'fly-typing-indicator';
    typing.className = 'log-entry';
    typing.innerHTML = `
      <span class="log-time">${this.getTimeStr()}</span>
      <span class="log-speaker fly">[FLY]</span>
      <span class="log-msg c-muted">Transducing 200 Hz Johnston organ acoustic signal...</span>
    `;
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

    const entry = document.createElement('div');
    entry.className = 'log-entry fly-entry';
    const chosenInfo = res.chosenMBON ? ` | Motor Action: ${res.chosenMBON}` : (res.winningMBON ? ` | MBON: ${res.winningMBON}` : '');
    const contrastInfo = (typeof res.relativeContrast === 'number') ? ` | Contrast: ${(res.relativeContrast * 100).toFixed(1)}%` : '';
    entry.innerHTML = `
      <span class="log-time">${this.getTimeStr()}</span>
      <span class="log-speaker fly">[FLY]</span>
      <span class="log-msg"><b>"${this.escapeHTML(res.text)}"</b> (${res.circuit}${chosenInfo}${contrastInfo}, Conf: ${res.confidence}%, KCs: ${res.kcActive || 0}/2,597)</span>
    `;
    this.chatThread.appendChild(entry);
    this.scrollToBottom();
  }

  addTutorMessage(text, tag) {
    if (!this.chatThread) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry tutor-entry';
    entry.innerHTML = `
      <span class="log-time">${this.getTimeStr()}</span>
      <span class="log-speaker tutor">[TUTOR]</span>
      <span class="log-msg"><b class="c-blue">${this.escapeHTML(tag)}:</b> ${this.escapeHTML(text)}</span>
    `;
    this.chatThread.appendChild(entry);
    this.scrollToBottom();
  }

  addTutorFeedback(feedbackText, isPraise = true) {
    if (!this.chatThread) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${isPraise ? 'reward-entry' : 'punish-entry'}`;
    const cleanText = feedbackText.replace(/<[^>]*>?/gm, '');
    entry.innerHTML = `
      <span class="log-time">${this.getTimeStr()}</span>
      <span class="log-speaker system">[FEEDBACK]</span>
      <span class="log-msg">${cleanText}</span>
    `;
    this.chatThread.appendChild(entry);
    this.scrollToBottom();
  }

  addSystemLog(text) {
    if (!this.chatThread) return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <span class="log-time">${this.getTimeStr()}</span>
      <span class="log-speaker system">[SYSTEM]</span>
      <span class="log-msg">${this.escapeHTML(text)}</span>
    `;
    this.chatThread.appendChild(entry);
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.chatThread) {
      // Keep DOM lean to avoid browser reflow memory overhead
      while (this.chatThread.children.length > 150) {
        this.chatThread.removeChild(this.chatThread.firstChild);
      }
      this.chatThread.scrollTop = this.chatThread.scrollHeight;
    }
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Update complete high-density telemetry dashboard
  updateDashboard() {
    const stage = this.engine.getFluencyStage();
    const score = this.engine.getFluencyScore();

    // Top Header Status Summary
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
      const kcSubtypes = this.engine.mb.getKCSubtypeActivity();

      // Depressed KC Synapses
      const depressedEl = document.getElementById('val-depressed-synapses');
      if (depressedEl) {
        depressedEl.textContent = `${stats.depressedSynapsesCount} / ${stats.connectedSynapsesCount}`;
      }

      // Active KCs & Sparsity
      const activeKCsEl = document.getElementById('val-active-kcs');
      if (activeKCsEl) activeKCsEl.textContent = `${this.engine.lastActiveKCCount || 0} / 2,597`;

      const kcSparsityEl = document.getElementById('val-kc-sparsity');
      if (kcSparsityEl) kcSparsityEl.textContent = `${this.engine.lastKCSparsity || 5.0}%`;

      // APL GABA
      const aplEl = document.getElementById('val-apl-inhibition');
      if (aplEl) aplEl.textContent = this.engine.mb.aplActivity.toFixed(2);

      // Section 2: Plasticity Matrix
      const statIndex = document.getElementById('stat-ltd-index');
      if (statIndex) statIndex.textContent = `${stats.plasticityIndex}%`;

      const statDep = document.getElementById('stat-depressed-count');
      if (statDep) statDep.textContent = `${stats.depressedSynapsesCount} / ${stats.connectedSynapsesCount}`;

      const statBase = document.getElementById('stat-baseline-mean');
      if (statBase) statBase.textContent = '2.704';

      const statCur = document.getElementById('stat-current-mean');
      if (statCur) statCur.textContent = stats.meanWeight;

      const statRange = document.getElementById('stat-weight-range');
      if (statRange) statRange.textContent = `[${stats.minWeight}, ${stats.maxWeight}]`;

      const statMag = document.getElementById('stat-total-magnitude');
      if (statMag) statMag.textContent = stats.totalDepressionMagnitude;

      const ltdDeltaEl = document.getElementById('val-ltd-delta');
      if (ltdDeltaEl) ltdDeltaEl.textContent = `${stats.lastTrialDepressed} synapses`;

      const condTrials = document.getElementById('stat-conditioning-trials');
      if (condTrials) condTrials.textContent = `${this.engine.mb.conditioningTrials}`;

      // Section 3: Kenyon Cell Dynamics
      const activeDetail = document.getElementById('val-active-kcs-detail');
      if (activeDetail) activeDetail.textContent = `${this.engine.lastActiveKCCount || 0} / 2,597`;

      const sparsityDetail = document.getElementById('val-kc-sparsity-detail');
      if (sparsityDetail) sparsityDetail.textContent = `${this.engine.lastKCSparsity || 5.0}%`;

      const aplDetail = document.getElementById('val-apl-inhibition-detail');
      if (aplDetail) aplDetail.textContent = `${this.engine.mb.aplActivity.toFixed(2)} GABA`;

      if (kcSubtypes) {
        const gammaEl = document.getElementById('val-kc-gamma');
        if (gammaEl) {
          const gPct = ((kcSubtypes.gamma.active / kcSubtypes.gamma.total) * 100).toFixed(1);
          gammaEl.textContent = `${kcSubtypes.gamma.active} / ${kcSubtypes.gamma.total} (${gPct}%)`;
        }

        const abEl = document.getElementById('val-kc-ab');
        if (abEl) {
          const abPct = ((kcSubtypes.alphaBeta.active / kcSubtypes.alphaBeta.total) * 100).toFixed(1);
          abEl.textContent = `${kcSubtypes.alphaBeta.active} / ${kcSubtypes.alphaBeta.total} (${abPct}%)`;
        }

        const apbpEl = document.getElementById('val-kc-apbp');
        if (apbpEl) {
          const apbpPct = ((kcSubtypes.alphaPrimeBetaPrime.active / kcSubtypes.alphaPrimeBetaPrime.total) * 100).toFixed(1);
          apbpEl.textContent = `${kcSubtypes.alphaPrimeBetaPrime.active} / ${kcSubtypes.alphaPrimeBetaPrime.total} (${apbpPct}%)`;
        }
      }

      // Section 4: Motor Output
      const winningMBON = this.engine.lastWinningMBON;
      const winningEl = document.getElementById('val-winning-mbon');
      const winningDetail = document.getElementById('val-winning-mbon-detail');
      const rootIdEl = document.getElementById('val-winning-root-id');
      const activeComp = document.getElementById('val-active-compartment');
      const winningNT = document.getElementById('val-winning-nt');
      const pamLvl = document.getElementById('val-pam-level');
      const ppl1Lvl = document.getElementById('val-ppl1-level');

      if (winningMBON) {
        if (winningEl) winningEl.textContent = `${winningMBON.label} (${winningMBON.id})`;
        if (winningDetail) winningDetail.textContent = `${winningMBON.label} (${winningMBON.id})`;
        if (rootIdEl) rootIdEl.textContent = winningMBON.flywireRootId || '--';
        if (activeComp) activeComp.textContent = winningMBON.compartment || 'gamma5';
        if (winningNT) winningNT.textContent = winningMBON.verifiedNT || winningMBON.nt || 'Glu';
      } else {
        if (winningEl) winningEl.textContent = 'Resting';
        if (winningDetail) winningDetail.textContent = 'Resting';
        if (rootIdEl) rootIdEl.textContent = '--';
        if (activeComp) activeComp.textContent = 'gamma5';
        if (winningNT) winningNT.textContent = '--';
      }

      if (pamLvl) pamLvl.textContent = `${Math.round(this.engine.pamDopamine)}%`;
      if (ppl1Lvl) ppl1Lvl.textContent = `${Math.round(this.engine.ppl1Aversion)}%`;

      // Section 5: 15 Compartments Table
      this.renderCompartmentTable();
    }

    // Section 7: Learned Lexicon Table
    this.renderLexiconTable();
  }

  renderCompartmentTable() {
    const tbody = document.getElementById('tbody-compartments');
    if (!tbody || !this.engine.mb) return;

    const matrix = this.engine.mb.getCompartmentMatrix();
    const activeCompartment = this.engine.lastWinningMBON ? this.engine.lastWinningMBON.compartment : 'gamma5';

    tbody.innerHTML = matrix.map(row => {
      const isActive = (row.compartment === activeCompartment);
      const rowClass = isActive ? 'class="active-comp"' : '';
      return `
        <tr ${rowClass}>
          <td><b>${row.compartment}</b></td>
          <td>${row.mbons}</td>
          <td>${row.labels}</td>
          <td>${row.neurotransmitter}</td>
          <td>${row.function}</td>
          <td>${row.depressedEdges} / ${row.totalEdges} (${row.pct}%)</td>
        </tr>
      `;
    }).join('');
  }

  renderLexiconTable() {
    const tbody = document.getElementById('tbody-lexicon');
    if (!tbody) return;

    if (this.engine.lexicon.size === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="c-muted">Tabula Rasa: No conditioned vocabulary yet.</td></tr>`;
      return;
    }

    const sorted = Array.from(this.engine.lexicon.values()).sort((a, b) => b.count - a.count);

    tbody.innerHTML = sorted.slice(0, 21).map(item => {
      const confClass = item.confidence > 70 ? 'c-green' : item.confidence > 40 ? 'c-yellow' : 'c-muted';
      return `
        <tr>
          <td><b class="c-blue">${this.escapeHTML(item.token)}</b></td>
          <td>${item.count}x</td>
          <td class="${confClass}">${item.confidence}%</td>
          <td>${item.confidence > 60 ? 'Conditioned' : 'Emerging'}</td>
        </tr>
      `;
    }).join('');
  }
}
