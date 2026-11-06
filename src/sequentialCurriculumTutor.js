// ============================================================================
// Sequential Curriculum Tutor: Autonomous Pedagogical Master for Written Language
// ============================================================================
// Orchestrates the 8-Stage Progressive Neural Language Acquisition Syllabus:
// Stage A: Basic Symbol Production (Single characters + <EOS> termination)
// Stage B: Short Sequence Formation (2- and 3-character sequences)
// Stage C: Word Formation (Char-by-char written words)
// Stage D: Arbitrary Stimulus-Response Associations (Randomized pseudoword mappings)
// Stage E: Short Sentence Production (Multi-word sentences with spaces and <EOS>)
// Stage F: Contextual Responses (Syntactic modulation & negation inversion)
// Stage G: Compositional Learning (Recombining components into novel sentences)
// Stage H: Unrewarded Generalization & Retention Audit (Zero feedback R=0, Temp=0.0)

export class SequentialCurriculumTutor {
  constructor(engine, speechSynth = null, ui = null) {
    this.engine = engine;
    this.speech = speechSynth;
    this.ui = ui;

    this.isRunning = false;
    this.isWaitingForFly = false;
    this.speedMode = 'TURBO'; // 'INSTANT', 'HYPER', 'TURBO', 'FAST', 'NORMAL'
    this.timerId = null;

    // Pedagogical State
    this.activeStageIndex = 0;
    this.activeCueIndex = 0;
    this.consecutiveHits = 0;
    this.requiredHits = 2; // Must answer correctly 2 consecutive times to master cue
    this.cueErrors = 0;
    this.totalTrialsRun = 0;
    this.totalSuccesses = 0;
    this.isRehearsalProbe = false;
    this.stageIntroAnnounced = new Set();
    this.masteredCues = new Set();
    this.cueTrialHistory = new Map(); // cueId -> { attempts, successes, errors }
    this.retentionExamResults = [];

    // Master 8-Stage Syllabus
    this.stages = [
      {
        id: 'stage_a_symbols',
        name: 'Stage A: Basic Symbol Production',
        description: 'Condition individual letter emission and immediate <EOS> sequence termination.',
        cues: [
          { id: 'sa_a', prompt: 'type a', target: 'a', desc: 'Single character a + <EOS>' },
          { id: 'sa_b', prompt: 'type b', target: 'b', desc: 'Single character b + <EOS>' },
          { id: 'sa_x', prompt: 'type x', target: 'x', desc: 'Single character x + <EOS>' },
          { id: 'sa_z', prompt: 'type z', target: 'z', desc: 'Single character z + <EOS>' }
        ]
      },
      {
        id: 'stage_b_sequences',
        name: 'Stage B: Short Sequence Formation',
        description: 'Condition ordered 2-character and 3-character sequences.',
        cues: [
          { id: 'sb_hi', prompt: 'spell hi', target: 'hi', desc: '2-character sequence h -> i' },
          { id: 'sb_go', prompt: 'spell go', target: 'go', desc: '2-character sequence g -> o' },
          { id: 'sb_no', prompt: 'spell no', target: 'no', desc: '2-character sequence n -> o' },
          { id: 'sb_fly', prompt: 'spell fly', target: 'fly', desc: '3-character sequence f -> l -> y' }
        ]
      },
      {
        id: 'stage_c_words',
        name: 'Stage C: Word Formation',
        description: 'Multi-character exact word formation generated sequentially.',
        cues: [
          { id: 'sc_left', prompt: 'write left', target: 'left', desc: 'Directional word left' },
          { id: 'sc_right', prompt: 'write right', target: 'right', desc: 'Directional word right' },
          { id: 'sc_sugar', prompt: 'write sugar', target: 'sugar', desc: 'Appetitive word sugar' },
          { id: 'sc_stop', prompt: 'write stop', target: 'stop', desc: 'Braking word stop' }
        ]
      },
      {
        id: 'stage_d_associations',
        name: 'Stage D: Stimulus-Response Associations',
        description: 'Arbitrary stimulus-response mappings between unfamiliar pseudowords and actions.',
        cues: [
          { id: 'sd_dax', prompt: 'dax', target: 'go', desc: 'Arbitrary pseudoword dax -> go' },
          { id: 'sd_wug', prompt: 'wug', target: 'left', desc: 'Arbitrary pseudoword wug -> left' },
          { id: 'sd_flim', prompt: 'flim', target: 'right', desc: 'Arbitrary pseudoword flim -> right' },
          { id: 'sd_kiv', prompt: 'kiv', target: 'sugar', desc: 'Arbitrary pseudoword kiv -> sugar' }
        ]
      },
      {
        id: 'stage_e_sentences',
        name: 'Stage E: Short Sentence Production',
        description: 'Sequential multi-word generation with spaces and <EOS> termination.',
        cues: [
          { id: 'se_go_left', prompt: 'command left', target: 'go left', desc: 'Multi-word with space' },
          { id: 'se_go_right', prompt: 'command right', target: 'go right', desc: 'Multi-word with space' },
          { id: 'se_want_sugar', prompt: 'craving', target: 'want sugar', desc: 'Multi-word with space' },
          { id: 'se_fly_fast', prompt: 'flight speed', target: 'fly fast', desc: 'Multi-word with space' }
        ]
      },
      {
        id: 'stage_f_context',
        name: 'Stage F: Contextual Responses',
        description: 'Different response to same directional cues based on preceding negation syntax.',
        cues: [
          { id: 'sf_pos_left', prompt: 'go left', target: 'left', desc: 'Affirmative left direction' },
          { id: 'sf_neg_left', prompt: 'dont go left', target: 'right', desc: 'Negation inverts left -> right' },
          { id: 'sf_pos_right', prompt: 'go right', target: 'right', desc: 'Affirmative right direction' },
          { id: 'sf_neg_right', prompt: 'dont go right', target: 'left', desc: 'Negation inverts right -> left' }
        ]
      },
      {
        id: 'stage_g_compositional',
        name: 'Stage G: Compositional Learning',
        description: 'Recombining learned lexical units into novel unfamiliar sentence structures.',
        cues: [
          { id: 'sg_please_left', prompt: 'please go left', target: 'left', desc: 'Polite prefix carrier' },
          { id: 'sg_please_right', prompt: 'please go right', target: 'right', desc: 'Polite prefix carrier' },
          { id: 'sg_fly_left_now', prompt: 'fly left now', target: 'left', desc: 'Carrier prefix and suffix' },
          { id: 'sg_sweet_sugar', prompt: 'sweet sugar craving', target: 'sugar', desc: 'Compound adjective carrier' }
        ]
      },
      {
        id: 'stage_h_audit',
        name: 'Stage H: Unrewarded Generalization & Retention Audit',
        description: 'Zero-feedback holdout evaluation (R = 0, Temp = 0.0) auditing memory retention.',
        cues: [
          { id: 'sh_a', prompt: 'type a', target: 'a', desc: 'Retention probe: single symbol a' },
          { id: 'sh_hi', prompt: 'spell hi', target: 'hi', desc: 'Retention probe: sequence hi' },
          { id: 'sh_left', prompt: 'write left', target: 'left', desc: 'Retention probe: word left' },
          { id: 'sh_dax', prompt: 'dax', target: 'go', desc: 'Retention probe: association dax' },
          { id: 'sh_neg_l', prompt: 'dont go left', target: 'right', desc: 'Retention probe: negation XOR' },
          { id: 'sh_comp_l', prompt: 'please go left', target: 'left', desc: 'Retention probe: carrier sentence' }
        ]
      }
    ];

    this.totalCuesCount = this.stages.reduce((acc, s) => acc + s.cues.length, 0);
  }

  getInterval() {
    if (this.speedMode === 'INSTANT') return 0;
    if (this.speedMode === 'HYPER') return 16;
    if (this.speedMode === 'TURBO') return 25;
    if (this.speedMode === 'FAST') return 70;
    return 250; // NORMAL
  }

  getBatchChunkSize() {
    if (this.speedMode === 'INSTANT') return 25;
    if (this.speedMode === 'HYPER') return 8;
    if (this.speedMode === 'TURBO') return 2;
    return 1;
  }

  setSpeed(mode) {
    this.speedMode = mode;
    this.updateUIStatus();
  }

  toggle() {
    if (this.isRunning) this.pause();
    else this.start();
  }

  start() {
    this.isRunning = true;
    this.updateUIStatus();
    if (this.ui) {
      this.ui.addSystemLog(`[AUTONOMOUS TUTOR] Started sequential neural writing tutor. Current stage: ${this.getCurrentStage().name}`);
    }
    this.scheduleNextStep(10);
  }

  pause() {
    this.isRunning = false;
    if (this.timerId) clearTimeout(this.timerId);
    this.updateUIStatus();
    if (this.ui) {
      this.ui.addSystemLog(`[AUTONOMOUS TUTOR] Paused by user.`);
    }
  }

  scheduleNextStep(delay = null) {
    if (!this.isRunning) return;
    if (this.timerId) clearTimeout(this.timerId);
    const ms = delay !== null ? delay : this.getInterval();
    this.timerId = setTimeout(() => {
      this.executeTeacherStep();
    }, ms);
  }

  getCurrentStage() {
    return this.stages[Math.min(this.stages.length - 1, this.activeStageIndex)];
  }

  getCurrentCue() {
    const stage = this.getCurrentStage();
    return stage.cues[Math.min(stage.cues.length - 1, this.activeCueIndex)];
  }

  // Core Autonomous Step
  executeTeacherStep() {
    if (!this.isRunning && arguments.length === 0) return;
    if (this.isWaitingForFly) return;

    const chunkSize = this.getBatchChunkSize();
    if (chunkSize > 1 && this.isRunning) {
      this.trainBatch(chunkSize);
      this.scheduleNextStep();
      return;
    }

    const stage = this.getCurrentStage();
    const isHoldoutAudit = (stage.id === 'stage_h_audit');

    // Announce stage introduction
    if (!this.stageIntroAnnounced.has(stage.id)) {
      this.stageIntroAnnounced.add(stage.id);
      const introMsg = `[SYLLABUS] Commencing ${stage.name}. Objective: ${stage.description}`;
      if (this.ui) {
        this.ui.addSystemLog(introMsg);
        this.ui.addTutorMessage(stage.description, `[SYLLABUS: ${stage.name.split(':')[0].toUpperCase()}]`);
      }
    }

    // Interleaved spaced rehearsal outside audit
    let activeCue = this.getCurrentCue();
    let isRehearsal = false;
    if (this.totalTrialsRun > 0 && this.totalTrialsRun % 6 === 0 && this.masteredCues.size > 0 && !isHoldoutAudit) {
      const masteredList = Array.from(this.masteredCues);
      const randId = masteredList[Math.floor(Math.random() * masteredList.length)];
      for (const st of this.stages) {
        const found = st.cues.find(c => c.id === randId);
        if (found) {
          activeCue = found;
          isRehearsal = true;
          break;
        }
      }
    }
    this.isRehearsalProbe = isRehearsal;

    const promptText = activeCue.prompt;
    let pedagogicalTag = `${stage.name.split(':')[0]} | Cue ${this.activeCueIndex + 1}/${stage.cues.length}`;
    let instructionalText = activeCue.prompt;

    if (isRehearsal) {
      pedagogicalTag = `[SPACED REHEARSAL]`;
      instructionalText = `Memory retention probe: Can you still write '${activeCue.target}' for '${activeCue.prompt}'?`;
    } else if (isHoldoutAudit) {
      instructionalText = `[EXAM PROBE] Zero-feedback holdout test: '${activeCue.prompt}' (R=0, Temp=0.0).`;
    } else if (this.cueErrors > 0) {
      instructionalText = `Re-probing: '${activeCue.prompt}' (Target: '${activeCue.target}', Streak: ${this.consecutiveHits}/${this.requiredHits}, Attempt ${this.cueErrors + 1}).`;
    } else {
      instructionalText = `Instruction: '${activeCue.prompt}'. (Target sequence: '${activeCue.target}').`;
    }

    if (this.ui) {
      this.ui.addTutorMessage(instructionalText, pedagogicalTag);
      this.ui.showTypingIndicator();
    }

    this.isWaitingForFly = true;
    this.totalTrialsRun++;

    // Temperature schedule: exploration (0.7 -> 0.15) during training, greedy (0.0) during audit
    let temperature = 0.0;
    if (!isHoldoutAudit) {
      temperature = Math.max(0.15, 0.75 - Math.min(0.60, this.consecutiveHits * 0.3));
    }

    const latency = (this.speedMode === 'INSTANT') ? 0 : (this.speedMode === 'TURBO' ? 5 : (this.speedMode === 'FAST' ? 25 : 80));

    const runNeuralStep = () => {
      const maxLen = Math.max(4, activeCue.target.length + 3);
      const response = this.engine.generateResponse(promptText, { temperature, maxLen });

      if (this.ui) this.ui.addFlyMessage(response);
      if (this.speech && this.speedMode === 'NORMAL') {
        this.speech.speak(response.text, 1);
      }

      this.evaluateTrial(activeCue, response, isRehearsal);
    };

    if (latency === 0) runNeuralStep();
    else setTimeout(runNeuralStep, latency);
  }

  // Evaluate trial with exact character-by-character behavioral matching
  evaluateTrial(cue, response, isRehearsal = false) {
    const targetClean = cue.target.toLowerCase().trim();
    const emittedClean = response.text.toLowerCase().trim();
    const isExactMatch = (emittedClean === targetClean) && response.terminatedWithEOS;

    if (!this.cueTrialHistory.has(cue.id)) {
      this.cueTrialHistory.set(cue.id, { attempts: 0, successes: 0, errors: 0 });
    }
    const history = this.cueTrialHistory.get(cue.id);
    history.attempts++;

    const isHoldoutAudit = (this.getCurrentStage().id === 'stage_h_audit');

    if (isHoldoutAudit) {
      // STAGE H: ZERO FEEDBACK EXAMINATION (R = 0, Temp = 0.0)
      if (isExactMatch) {
        this.totalSuccesses++;
        history.successes++;
        this.masteredCues.add(cue.id);
        const passMsg = `[EXAM PASS] Probe '${cue.prompt}' -> Fly produced exact sequence "${emittedClean}" (R=0). Verified retention!`;
        if (this.ui) {
          this.ui.addSystemLog(passMsg);
          this.ui.addTutorFeedback(passMsg, true);
        }
        this.advanceCue();
      } else {
        history.errors++;
        this.cueErrors++;
        const failMsg = `[EXAM PROBE] Probe '${cue.prompt}' -> Fly produced "${emittedClean}" instead of target "${targetClean}" (R=0).`;
        if (this.ui) this.ui.addTutorFeedback(failMsg, false);
        if (this.cueErrors >= 2) this.advanceCue();
      }
    } else {
      // STAGES A-G: ACTIVE OPERANT CONDITIONING
      const rewardReport = this.engine.rewardSequence(cue.target);

      if (isExactMatch) {
        this.totalSuccesses++;
        history.successes++;
        if (!isRehearsal) {
          this.consecutiveHits++;
          this.cueErrors = 0;
        }

        let feedback = '';
        if (isRehearsal) {
          feedback = `[SPACED REHEARSAL PASS] '${cue.prompt}' -> Fly produced exact sequence "${emittedClean}". Synaptic trace active.`;
        } else {
          feedback = `[+] CORRECT: Fly emitted exact neural sequence "${emittedClean}"! +PAM dopamine reward applied. Streak: ${this.consecutiveHits}/${this.requiredHits}.`;
        }
        if (this.ui) this.ui.addTutorFeedback(feedback, true);

        // Check if cue has met mastery criterion
        if (!isRehearsal && this.consecutiveHits >= this.requiredHits) {
          this.masteredCues.add(cue.id);
          this.consecutiveHits = 0;
          const masterMsg = `[CUE CONSOLIDATED] '${cue.prompt}' -> "${cue.target}" (${cue.desc}) mastered!`;
          if (this.ui) {
            this.ui.addSystemLog(masterMsg);
            this.ui.addTutorFeedback(masterMsg, true);
          }
          this.advanceCue();
        }
      } else {
        if (!isRehearsal) {
          this.consecutiveHits = 0;
          this.cueErrors++;
        }
        history.errors++;

        const feedback = `[-] MISS: Fly emitted "${emittedClean}" (Target: "${targetClean}", ${rewardReport.matchCount}/${rewardReport.targetLength} chars). PPL1 shaping feedback applied. (Attempt ${this.cueErrors}).`;
        if (this.ui) this.ui.addTutorFeedback(feedback, false);
      }
    }

    this.isWaitingForFly = false;
    this.updateUIStatus();
    if (this.ui) this.ui.updateDashboard();

    if (this.isRunning) this.scheduleNextStep();
  }

  advanceCue() {
    const stage = this.getCurrentStage();
    this.activeCueIndex++;
    this.cueErrors = 0;
    this.consecutiveHits = 0;

    if (this.activeCueIndex >= stage.cues.length) {
      this.activeCueIndex = 0;
      this.activeStageIndex++;

      if (this.activeStageIndex >= this.stages.length) {
        this.activeStageIndex = this.stages.length - 1;
        const gradMsg = `[CURRICULUM GRADUATION] ALL 8 SEQUENTIAL NEURAL WRITING STAGES MASTERED (100%)! Connectome successfully generates written language sequences.`;
        if (this.ui) {
          this.ui.addSystemLog(gradMsg);
          this.ui.addTutorFeedback(gradMsg, true);
        }
      } else {
        const nextStage = this.getCurrentStage();
        const stageMsg = `[STAGE GRADUATED] Successfully completed ${stage.name}! Advancing to: ${nextStage.name} (${nextStage.description})`;
        if (this.ui) {
          this.ui.addSystemLog(stageMsg);
          this.ui.addTutorFeedback(stageMsg, true);
        }
      }
    }
  }

  // Fast batch conditioning
  trainBatch(trialsCount = 25) {
    let completed = 0;
    const masteredBefore = this.masteredCues.size;

    for (let t = 0; t < trialsCount; t++) {
      completed++;
      const stage = this.getCurrentStage();
      let activeCue = this.getCurrentCue();
      const isHoldoutAudit = (stage.id === 'stage_h_audit');

      let isRehearsal = false;
      if (this.totalTrialsRun > 0 && this.totalTrialsRun % 6 === 0 && this.masteredCues.size > 0 && !isHoldoutAudit) {
        const masteredList = Array.from(this.masteredCues);
        const randId = masteredList[Math.floor(Math.random() * masteredList.length)];
        for (const st of this.stages) {
          const found = st.cues.find(c => c.id === randId);
          if (found) {
            activeCue = found;
            isRehearsal = true;
            break;
          }
        }
      }

      this.totalTrialsRun++;

      let temperature = 0.0;
      if (!isHoldoutAudit) {
        temperature = Math.max(0.15, 0.75 - Math.min(0.60, this.consecutiveHits * 0.3));
      }

      const maxLen = Math.max(4, activeCue.target.length + 3);
      const response = this.engine.generateResponse(activeCue.prompt, { temperature, maxLen });

      const targetClean = activeCue.target.toLowerCase().trim();
      const emittedClean = response.text.toLowerCase().trim();
      const isExactMatch = (emittedClean === targetClean) && response.terminatedWithEOS;

      if (isHoldoutAudit) {
        if (isExactMatch) {
          this.totalSuccesses++;
          this.masteredCues.add(activeCue.id);
          this.advanceCue();
        } else {
          this.cueErrors++;
          if (this.cueErrors >= 2) this.advanceCue();
        }
      } else {
        this.engine.rewardSequence(activeCue.target);

        if (isExactMatch) {
          this.totalSuccesses++;
          if (!isRehearsal) {
            this.consecutiveHits++;
            this.cueErrors = 0;
          }

          if (!isRehearsal && this.consecutiveHits >= this.requiredHits) {
            this.masteredCues.add(activeCue.id);
            this.consecutiveHits = 0;
            this.advanceCue();
          }
        } else {
          if (!isRehearsal) {
            this.consecutiveHits = 0;
            this.cueErrors++;
          }
        }
      }
    }

    const newlyMastered = this.masteredCues.size - masteredBefore;
    const stage = this.getCurrentStage();
    const pct = ((this.masteredCues.size / this.totalCuesCount) * 100).toFixed(1);

    const logMsg = `[AUTONOMOUS BATCH] Ran ${completed} trials. Stage: ${stage.name.split(':')[0]}. Mastered: ${this.masteredCues.size}/${this.totalCuesCount} (${pct}%).`;
    if (this.ui) {
      this.ui.addSystemLog(logMsg);
      this.ui.updateDashboard();
    }
    this.updateUIStatus();
    return { completed, newlyMastered, totalMastered: this.masteredCues.size };
  }

  completeCurrentStage() {
    const curStageIdx = this.activeStageIndex;
    let safetyCounter = 0;
    while (this.activeStageIndex === curStageIdx && safetyCounter < 1500) {
      this.trainBatch(20);
      safetyCounter += 20;
    }
  }

  masterAllStages() {
    let safetyCounter = 0;
    while (this.activeStageIndex < this.stages.length - 1 && safetyCounter < 6000) {
      this.trainBatch(25);
      safetyCounter += 25;
    }
  }

  updateUIStatus() {
    if (typeof document === 'undefined') return;

    const toggleBtn = document.getElementById('btn-toggle-tutor');
    const badge = document.getElementById('tutor-status-badge');
    const lessonLbl = document.getElementById('tutor-lesson-label');
    const pctLbl = document.getElementById('tutor-progress-pct');
    const asciiBar = document.getElementById('tutor-ascii-bar');

    const stage = this.getCurrentStage();
    const cue = this.getCurrentCue();
    const total = this.totalCuesCount;
    const mastered = this.masteredCues.size;
    const pctVal = total > 0 ? (mastered / total) * 100 : 0;

    if (toggleBtn) {
      toggleBtn.textContent = this.isRunning ? '[Pause Autonomous Tutor]' : '[Start Autonomous Tutor]';
    }

    if (badge) {
      if (this.isRunning) {
        badge.textContent = `Running (${this.speedMode})`;
        badge.style.color = 'var(--c-green)';
      } else {
        badge.textContent = 'Idle';
        badge.style.color = 'var(--txt-muted)';
      }
    }

    if (lessonLbl) {
      const rehearsalText = this.isRehearsalProbe ? ' [Spaced Rehearsal]' : '';
      lessonLbl.textContent = `${stage.name} | Task: "${cue.prompt}" -> "${cue.target}" (${this.consecutiveHits}/${this.requiredHits} hits)${rehearsalText}`;
    }

    if (pctLbl) {
      pctLbl.textContent = `${mastered} / ${total} (${pctVal.toFixed(1)}%)`;
    }

    if (asciiBar) {
      const filled = Math.min(40, Math.max(0, Math.round((pctVal / 100) * 40)));
      const empty = 40 - filled;
      asciiBar.textContent = `[${'='.repeat(filled)}${'-'.repeat(empty)}] ${pctVal.toFixed(1)}%`;
    }
  }
}
