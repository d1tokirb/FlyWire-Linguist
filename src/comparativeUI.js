// ============================================================================
// Comparative UI: Multi-Subject Neuroscience Laboratory Dashboard
// ============================================================================
// High-density terminal dashboard for simultaneous comparative evaluation of
// multiple independent Drosophila subjects under matched experimental conditions.

export class ComparativeUI {
  constructor(labCoordinator, onInspectFly) {
    this.lab = labCoordinator;
    this.onInspectFly = onInspectFly;

    this.container = document.getElementById('comparative-lab-view');
    this.cardsGrid = document.getElementById('cohort-cards-grid');
    this.holdoutTableBody = document.getElementById('tbody-holdout-challenge');

    this.initEvents();
  }

  initEvents() {
    const btnStartAll = document.getElementById('btn-lab-toggle-run');
    if (btnStartAll) {
      btnStartAll.addEventListener('click', () => {
        this.lab.toggleRun();
        this.updateControls();
      });
    }

    const btnStep = document.getElementById('btn-lab-step');
    if (btnStep) {
      btnStep.addEventListener('click', () => {
        this.lab.stepMatchedTrial();
        this.render();
      });
    }

    const btnBatch25 = document.getElementById('btn-lab-train-25x');
    if (btnBatch25) {
      btnBatch25.addEventListener('click', () => {
        this.lab.trainBatch(25);
        this.render();
      });
    }

    const btnBatch100 = document.getElementById('btn-lab-train-100x');
    if (btnBatch100) {
      btnBatch100.addEventListener('click', () => {
        this.lab.trainBatch(100);
        this.render();
      });
    }

    const btnHoldout = document.getElementById('btn-lab-run-holdout');
    if (btnHoldout) {
      btnHoldout.addEventListener('click', () => {
        const holdoutRes = this.lab.runHeldOutChallenge();
        this.renderHoldoutResults(holdoutRes);
      });
    }

    const speedSelect = document.getElementById('lab-speed-select');
    if (speedSelect) {
      speedSelect.addEventListener('change', (e) => {
        this.lab.setSpeed(e.target.value);
      });
    }

    const btnResetAll = document.getElementById('btn-lab-reset');
    if (btnResetAll) {
      btnResetAll.addEventListener('click', () => {
        if (confirm('Reset all subjects to their initial condition implants?')) {
          this.lab.resetAll();
          this.render();
        }
      });
    }

    const btnExportExp = document.getElementById('btn-export-experiment-json');
    if (btnExportExp) {
      btnExportExp.addEventListener('click', () => {
        const data = this.lab.exportExperimentData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FlyLab_Comparative_Experiment_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  updateControls() {
    const btnStartAll = document.getElementById('btn-lab-toggle-run');
    if (btnStartAll) {
      btnStartAll.textContent = this.lab.isRunning ? '[Pause All Flies]' : '[Start All Flies]';
    }
    const statusBadge = document.getElementById('lab-status-badge');
    if (statusBadge) {
      statusBadge.textContent = this.lab.isRunning ? `Running (${this.lab.speedMode})` : 'Idle';
      statusBadge.style.color = this.lab.isRunning ? 'var(--c-green)' : 'var(--txt-muted)';
    }
  }

  render() {
    this.updateControls();
    if (!this.cardsGrid) return;

    const subjects = this.lab.subjects;
    this.cardsGrid.innerHTML = subjects.map((fly, idx) => {
      const tel = fly.getTelemetry();
      const isPaused = fly.isPaused;
      const pauseBtnText = isPaused ? '[Resume]' : '[Pause]';
      const rollingAcc = tel.rollingAcc;
      const filled = Math.min(20, Math.max(0, Math.round((rollingAcc / 100) * 20)));
      const empty = 20 - filled;
      const asciiBar = `[${'='.repeat(filled)}${'-'.repeat(empty)}] ${rollingAcc}%`;

      const critText = tel.trialsToCriterion !== null
        ? `<span class="c-green">Trial ${tel.trialsToCriterion}</span>`
        : `<span class="c-muted">Not yet met</span>`;

      // Timeline pill representation of last emission
      let timelineHtml = '<span class="c-muted">Awaiting trial...</span>';
      if (tel.lastTimeline && tel.lastTimeline.length > 0) {
        timelineHtml = tel.lastTimeline.map(s => {
          const isEos = s.symbol === '<EOS>';
          const isSpace = s.symbol === '[space]' || s.char === ' ';
          const sym = isEos ? '&lt;EOS&gt;' : (isSpace ? '[space]' : s.char);
          const pClass = isEos ? 'time-pill eos' : (isSpace ? 'time-pill space' : 'time-pill char');
          return `<span class="${pClass}">${sym}</span>`;
        }).join('');
      }

      const matchBadge = tel.lastIsMatch
        ? `<span class="c-green txt-bold">[MATCH]</span>`
        : `<span class="c-muted">[MISMATCH]</span>`;

      return `
        <div class="cohort-card ${isPaused ? 'card-paused' : ''}" style="border-top: 2px solid ${fly.color};">
          <div class="card-hdr">
            <div class="card-title">
              <span class="fly-name">${fly.name}</span>
              <span class="cond-badge" style="background: ${fly.color}22; color: ${fly.color}; border: 1px solid ${fly.color}44;">${fly.condition}</span>
            </div>
            <div class="card-actions">
              <button type="button" class="txt-btn btn-sm btn-fly-pause" data-idx="${idx}">${pauseBtnText}</button>
              <button type="button" class="txt-btn btn-sm btn-fly-save" data-idx="${idx}">[Save]</button>
              <button type="button" class="txt-btn btn-sm btn-primary btn-fly-inspect" data-idx="${idx}">[Inspect]</button>
            </div>
          </div>

          <div class="card-metrics-grid">
            <div class="m-cell">Trials: <b>${tel.totalTrials}</b></div>
            <div class="m-cell">Successes: <b>${tel.totalSuccesses}</b></div>
            <div class="m-cell">LTD Index: <b class="c-green">${tel.plasticityIndex}%</b></div>
            <div class="m-cell">Criterion (&ge;80%): <b>${critText}</b></div>
            <div class="m-cell">Depressed: <b>${tel.depressedSynapses}/7,537</b></div>
            <div class="m-cell">Active KCs: <b>${tel.activeKCs || 0}/2,597</b></div>
          </div>

          <div class="card-bar-row">
            Rolling Acc: <span class="ascii-bar">${asciiBar}</span>
          </div>

          <div class="card-prompt-row">
            Prompt: <span class="c-blue">"${fly.lastPrompt || '--'}"</span> &rarr; Target: <b>"${fly.lastTarget || '--'}"</b>
          </div>

          <div class="card-output-row">
            Emitted: <span class="txt-bright"><b>"${tel.lastEmittedText}"</b></span> ${matchBadge}
          </div>

          <div class="card-trace-box">
            ${timelineHtml}
          </div>
        </div>
      `;
    }).join('');

    // Attach card event listeners
    this.cardsGrid.querySelectorAll('.btn-fly-pause').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const fly = this.lab.subjects[idx];
        if (fly) {
          fly.isPaused = !fly.isPaused;
          this.render();
        }
      });
    });

    this.cardsGrid.querySelectorAll('.btn-fly-save').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        const fly = this.lab.subjects[idx];
        if (fly) {
          const cp = fly.exportCheckpoint();
          const blob = new Blob([JSON.stringify(cp, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Fly_${fly.name.replace(/\s+/g, '_')}_${fly.condition}_${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    });

    this.cardsGrid.querySelectorAll('.btn-fly-inspect').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        this.lab.setActiveSubject(idx);
        if (this.onInspectFly) {
          this.onInspectFly(idx);
        }
      });
    });
  }

  renderHoldoutResults(holdoutData) {
    if (!this.holdoutTableBody || !holdoutData) return;

    const challenge = holdoutData.challenge;
    const challengeTitle = document.getElementById('holdout-challenge-title');
    if (challengeTitle) {
      challengeTitle.textContent = `[HELD-OUT COMPOSITIONAL GENERALIZATION: "${challenge.prompt}" -> "${challenge.target}" (Unseen Combination, R=0, Temp=0.0)]`;
    }

    this.holdoutTableBody.innerHTML = holdoutData.results.map(r => {
      const isMatch = r.isExactMatch;
      const statusClass = isMatch ? 'c-green txt-bold' : (r.emitted ? 'c-yellow' : 'c-muted');
      const statusText = isMatch ? 'EXACT MATCH' : (r.emitted ? 'PARTIAL' : 'NO RESPONSE');

      let traceStr = '--';
      if (r.timeline && r.timeline.length > 0) {
        traceStr = r.timeline.map(s => s.symbol).join(' &rarr; ');
      }

      return `
        <tr>
          <td><b>${r.flyId}</b></td>
          <td><span class="cond-badge">${r.condition}</span></td>
          <td><b>"${r.target}"</b></td>
          <td><span class="txt-bright">"${r.emitted}"</span></td>
          <td class="${statusClass}">${statusText}</td>
          <td>${traceStr}</td>
        </tr>
      `;
    }).join('');
  }
}
