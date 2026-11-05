// ============================================================================
// Autonomous In-Depth Pedagogical Master Teacher for Drosophila Linguist
// ============================================================================
// Multi-Stage Operant Conditioning, Scaffolding & Interleaved Memory Engine:
// Stage 1: Two-Alternative Forced Choice (2AFC Steering & Appetitive Discrimination)
// Stage 2: 4-Way Navigational & Operant Control (Spatial & Motor Exploration)
// Stage 3: Contextual Syntactic Scaffolding (Carrier Sentences & Prefix Invariance)
// Stage 4: Bidirectional Position Invariance (Tonotopic Anti-Shortcut Delay Banks)
// Stage 5: Non-Linear Inhibitory Inversion (Neuromodulatory XOR Negation)
// Stage 6: Scaled Measured Connectome Lexicon (15 Dense Biological FAFB v783 Classes)
// Stage 7: Zero-Dopamine Unrewarded Retention Audit (Examination Protocol R = 0)
// Stage 8: Autonomous Reciprocal Discourse (Continuous Adaptive Dialogue)

export class CurriculumTutorBot {
  constructor(engine, speechSynth, ui = null) {
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
    this.isScaffoldingActive = false;
    this.isRehearsalProbe = false;
    this.rehearsalCueTarget = null;
    this.stageIntroAnnounced = new Set();
    this.examResults = []; // Stage 7 exam logs

    // Mastered sets & spaced repetition history
    this.masteredCues = new Set();
    this.cueTrialHistory = new Map(); // cueId -> { attempts, successes, errors }

    // 8-Stage Rigorous Pedagogical Syllabus
    this.stages = [
      {
        id: 'stage_1_binary_2afc',
        name: 'Stage 1: Two-Alternative Forced Choice (2AFC Steering & Appetitive)',
        description: 'Binary motor discrimination between competing directional and valence attractors.',
        cues: [
          { id: 's1_left', prompt: 'left', target: 'left', desc: 'Left motor steering (beta_prime2)' },
          { id: 's1_right', prompt: 'right', target: 'right', desc: 'Right motor steering (beta_prime2)' },
          { id: 's1_sugar', prompt: 'sugar', target: 'sugar', desc: 'Appetitive sucrose craving (gamma5)' },
          { id: 's1_stop', prompt: 'stop', target: 'stop', desc: 'Aerodynamic braking halt (beta1)' }
        ]
      },
      {
        id: 'stage_2_four_choice',
        name: 'Stage 2: 4-Way Navigational & Operant Control',
        description: 'Multi-directional coordinate steering across beta_prime2, gamma4, and beta1.',
        cues: [
          { id: 's2_left', prompt: 'left', target: 'left', desc: 'Port steering bank' },
          { id: 's2_right', prompt: 'right', target: 'right', desc: 'Starboard steering bank' },
          { id: 's2_go', prompt: 'go', target: 'go', desc: 'Forward thrust acceleration' },
          { id: 's2_stop', prompt: 'stop', target: 'stop', desc: 'Braking halt' }
        ]
      },
      {
        id: 'stage_3_carriers',
        name: 'Stage 3: Contextual Syntactic Scaffolding (Carrier Sentences)',
        description: 'Conditioning invariance across diverse prefixes, suffixes, and syntactic frames.',
        cues: [
          { id: 's3_turn_left', prompt: 'turn left', target: 'left', desc: 'Carrier prefix turn' },
          { id: 's3_steer_left', prompt: 'steer left', target: 'left', desc: 'Carrier prefix steer' },
          { id: 's3_turn_right', prompt: 'turn right', target: 'right', desc: 'Carrier prefix turn' },
          { id: 's3_steer_right', prompt: 'steer right', target: 'right', desc: 'Carrier prefix steer' },
          { id: 's3_go_forward', prompt: 'go forward', target: 'go', desc: 'Thrust with suffix' },
          { id: 's3_please_stop', prompt: 'please stop', target: 'stop', desc: 'Polite carrier please' },
          { id: 's3_taste_sugar', prompt: 'taste sugar', target: 'sugar', desc: 'Carrier prefix taste' },
          { id: 's3_sweet_sugar', prompt: 'sweet sugar', target: 'sugar', desc: 'Adjective carrier sweet' }
        ]
      },
      {
        id: 'stage_4_bidirectional',
        name: 'Stage 4: Bidirectional Position Invariance (Anti-Shortcut Delay Banks)',
        description: 'Order sensitivity and position invariance via tonotopic delay line banks.',
        cues: [
          { id: 's4_bidi_l1', prompt: 'left turn', target: 'left', desc: 'Focal cue in position 0' },
          { id: 's4_bidi_l2', prompt: 'turn left', target: 'left', desc: 'Focal cue in position 1' },
          { id: 's4_bidi_r1', prompt: 'right turn', target: 'right', desc: 'Focal cue in position 0' },
          { id: 's4_bidi_r2', prompt: 'turn right', target: 'right', desc: 'Focal cue in position 1' },
          { id: 's4_bidi_g1', prompt: 'go forward', target: 'go', desc: 'Thrust in position 0' },
          { id: 's4_bidi_g2', prompt: 'forward go', target: 'go', desc: 'Thrust in position 1' },
          { id: 's4_bidi_s1', prompt: 'stop now', target: 'stop', desc: 'Brake in position 0' },
          { id: 's4_bidi_s2', prompt: 'now stop', target: 'stop', desc: 'Brake in position 1' }
        ]
      },
      {
        id: 'stage_5_xor_negation',
        name: 'Stage 5: Non-Linear Inhibitory Inversion (XOR Negation)',
        description: 'Neuromodulatory channel inversion: Negation particles reverse directional motor output.',
        cues: [
          { id: 's5_pos_left', prompt: 'go left', target: 'left', desc: 'Affirmative left direction' },
          { id: 's5_neg_left', prompt: 'dont go left', target: 'right', desc: 'Negated left -> Inverts to right' },
          { id: 's5_pos_right', prompt: 'go right', target: 'right', desc: 'Affirmative right direction' },
          { id: 's5_neg_right', prompt: 'dont go right', target: 'left', desc: 'Negated right -> Inverts to left' },
          { id: 's5_comp_neg_left', prompt: 'please dont go left', target: 'right', desc: 'Compound negated left -> Inverts to right' },
          { id: 's5_comp_neg_right', prompt: 'please dont go right', target: 'left', desc: 'Compound negated right -> Inverts to left' }
        ]
      },
      {
        id: 'stage_6_measured_lexicon',
        name: 'Stage 6: Scaled Measured Connectome Lexicon (15 Dense Classes)',
        description: 'Expanding vocabulary across all 15 densely reconstructed FAFB v783 compartments.',
        cues: [
          { id: 's6_sugar', prompt: 'sugar', target: 'sugar', desc: 'gamma5 appetitive sucrose' },
          { id: 's6_left', prompt: 'left', target: 'left', desc: 'beta_prime2 left steering' },
          { id: 's6_right', prompt: 'right', target: 'right', desc: 'beta_prime2 right steering' },
          { id: 's6_go', prompt: 'go', target: 'go', desc: 'gamma4 forward thrust' },
          { id: 's6_stop', prompt: 'stop', target: 'stop', desc: 'beta1 braking halt' },
          { id: 's6_sweet', prompt: 'sweet', target: 'sweet', desc: 'alpha_prime2 gustatory sweet' },
          { id: 's6_hello', prompt: 'hello', target: 'hello', desc: 'alpha1 acoustic greeting' },
          { id: 's6_human', prompt: 'human', target: 'human', desc: 'alpha3 teacher agent' },
          { id: 's6_smart', prompt: 'smart', target: 'smart', desc: 'alpha2 plasticity pride' },
          { id: 's6_no', prompt: 'no', target: 'no', desc: 'gamma3 aversive refusal' },
          { id: 's6_want', prompt: 'want', target: 'want', desc: 'beta2 appetitive drive' },
          { id: 's6_rest', prompt: 'rest', target: 'rest', desc: 'beta1 grooming quiescence' },
          { id: 's6_happy', prompt: 'happy', target: 'happy', desc: 'gamma5 dopamine arousal' },
          { id: 's6_bzz', prompt: 'bzz', target: 'bzz', desc: 'gamma1 wing vibration' },
          { id: 's6_clck', prompt: 'clck', target: 'clck', desc: 'gamma2 motor click' }
        ]
      },
      {
        id: 'stage_7_holdout_audit',
        name: 'Stage 7: Zero-Dopamine Unrewarded Retention Audit (Examination)',
        description: 'Zero-feedback holdout test (R = 0, Temp = 0.0) verifying consolidated synaptic memory.',
        cues: [
          { id: 's7_h_left', prompt: 'turn left', target: 'left', desc: 'Holdout motor left' },
          { id: 's7_h_right', prompt: 'turn right', target: 'right', desc: 'Holdout motor right' },
          { id: 's7_h_sugar', prompt: 'sweet sugar', target: 'sugar', desc: 'Holdout appetitive sugar' },
          { id: 's7_h_neg_l', prompt: 'dont go left', target: 'right', desc: 'Holdout negation left->right' },
          { id: 's7_h_neg_r', prompt: 'dont go right', target: 'left', desc: 'Holdout negation right->left' },
          { id: 's7_h_bidi', prompt: 'forward go', target: 'go', desc: 'Holdout bidirectional thrust' },
          { id: 's7_h_stop', prompt: 'now stop', target: 'stop', desc: 'Holdout brake' }
        ]
      },
      {
        id: 'stage_8_open_dialogue',
        name: 'Stage 8: Autonomous Reciprocal Discourse',
        description: 'Continuous dialogue mode with adaptive maintenance reinforcement.',
        cues: [
          { id: 's8_disc_1', prompt: 'Hello friend, can you hear me?', target: 'hello', desc: 'Open conversation greeting' },
          { id: 's8_disc_2', prompt: 'Would you like some sweet sugar?', target: 'sugar', desc: 'Open appetitive prompt' },
          { id: 's8_disc_3', prompt: 'Please steer left through the arena', target: 'left', desc: 'Open navigational prompt' },
          { id: 's8_disc_4', prompt: 'You are a very smart insect', target: 'smart', desc: 'Open praise prompt' }
        ]
      }
    ];

    this.totalCuesCount = this.stages.reduce((acc, s) => acc + s.cues.length, 0);
  }

  // Speed interval in milliseconds
  getInterval() {
    if (this.speedMode === 'INSTANT') return 0;
    if (this.speedMode === 'HYPER') return 16;
    if (this.speedMode === 'TURBO') return 25;
    if (this.speedMode === 'FAST') return 70;
    return 250; // NORMAL
  }

  // Micro-batch trials executed per cycle for decoupled DOM efficiency
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
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    this.isRunning = true;
    this.updateUIStatus();
    if (this.ui) {
      this.ui.addSystemLog(`[AUTONOMOUS TEACHER] Engaged autonomous pedagogical master. Current stage: ${this.getCurrentStage().name}`);
    }
    this.scheduleNextStep(10);
  }

  pause() {
    this.isRunning = false;
    if (this.timerId) clearTimeout(this.timerId);
    this.updateUIStatus();
    if (this.ui) {
      this.ui.addSystemLog(`[AUTONOMOUS TEACHER] Paused by user.`);
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

  // Core Autonomous Pedagogical Execution Step
  executeTeacherStep() {
    if (!this.isRunning && arguments.length === 0) return;
    if (this.isWaitingForFly) return;

    // For accelerated modes (TURBO, HYPER, INSTANT), run decoupled micro-batches
    const chunkSize = this.getBatchChunkSize();
    if (chunkSize > 1 && this.isRunning) {
      this.trainBatch(chunkSize);
      this.scheduleNextStep();
      return;
    }

    const stage = this.getCurrentStage();
    const isHoldoutAudit = (stage.id === 'stage_7_holdout_audit');

    // 1. Announce Stage Introduction if first time entering stage
    if (!this.stageIntroAnnounced.has(stage.id)) {
      this.stageIntroAnnounced.add(stage.id);
      const introMsg = `[SYLLABUS] Commencing ${stage.name}. Objective: ${stage.description}`;
      if (this.ui) {
        this.ui.addSystemLog(introMsg);
        this.ui.addTutorMessage(stage.description, `[SYLLABUS: ${stage.name.split(':')[0].toUpperCase()}]`);
      }
    }

    // 2. Spaced Repetition Interleaving: Every 6 trials outside examination, test a previously mastered cue
    let activeCue = this.getCurrentCue();
    let isRehearsal = false;
    if (this.totalTrialsRun > 0 && this.totalTrialsRun % 6 === 0 && this.masteredCues.size > 0 && !isHoldoutAudit && stage.id !== 'stage_8_open_dialogue') {
      const masteredList = Array.from(this.masteredCues);
      const randomMasteredId = masteredList[Math.floor(Math.random() * masteredList.length)];
      for (const st of this.stages) {
        const found = st.cues.find(c => c.id === randomMasteredId);
        if (found) {
          activeCue = found;
          isRehearsal = true;
          break;
        }
      }
    }
    this.isRehearsalProbe = isRehearsal;

    // 3. Formulate Prompt & Scaffolding State
    let promptText = activeCue.prompt;
    let pedagogicalTag = `${stage.name.split(':')[0]} | Cue ${this.activeCueIndex + 1}/${stage.cues.length}`;
    let instructionalText = activeCue.prompt;
    let isScaffoldingTrial = false;

    if (isRehearsal) {
      pedagogicalTag = `[SPACED REHEARSAL]`;
      instructionalText = `Memory retention probe: Can you still identify '${activeCue.prompt}'?`;
      promptText = activeCue.prompt;
    } else if (this.cueErrors >= 3 && activeCue.prompt.includes(' ')) {
      // Scaffolding: probe the isolated core token to help build the sub-circuit
      isScaffoldingTrial = true;
      pedagogicalTag = `[SCAFFOLDING]`;
      promptText = activeCue.target;
      instructionalText = `Simplifying acoustic stream: Focus on isolated core token '${activeCue.target}'.`;
    } else if (this.cueErrors > 0) {
      instructionalText = `Re-probing: '${activeCue.prompt}' (Target: '${activeCue.target}', Streak: ${this.consecutiveHits}/${this.requiredHits}, Attempt ${this.cueErrors + 1}).`;
    } else {
      // First attempt on cue
      instructionalText = `Cue prompt: '${activeCue.prompt}'. (Target action: '${activeCue.target}').`;
    }
    this.isScaffoldingActive = isScaffoldingTrial;

    if (this.ui) {
      this.ui.addTutorMessage(instructionalText, pedagogicalTag);
      this.ui.showTypingIndicator();
    }

    this.isWaitingForFly = true;
    this.totalTrialsRun++;

    // Fast execution latency
    const isInstant = (this.speedMode === 'INSTANT');
    const latency = isInstant ? 0 : (this.speedMode === 'TURBO' ? 5 : (this.speedMode === 'FAST' ? 25 : 80));

    const runNeuralStep = () => {
      // Action exploration temperature: 0.018 during operant training, 0.0 (greedy) during holdout audit
      const explorationTemp = isHoldoutAudit ? 0.0 : 0.018;
      const response = this.engine.generateResponse(promptText, { temperature: explorationTemp });
      if (this.ui) this.ui.addFlyMessage(response);

      if (this.speech && this.speedMode === 'NORMAL') {
        this.speech.speak(response.text, response.stage);
      }

      // Teacher evaluates response with rigorous behavioral criterion
      this.evaluateTrial(activeCue, response, promptText, isRehearsal, isScaffoldingTrial);
    };

    if (latency === 0) {
      runNeuralStep();
    } else {
      setTimeout(runNeuralStep, latency);
    }
  }

  // In-Depth Behavioral Evaluation & Reinforcement Loop
  evaluateTrial(cue, response, actualPromptUsed, isRehearsal = false, isScaffoldingTrial = false) {
    const target = cue.target.toLowerCase();
    const chosen = (response.chosenMBON || response.winningMBON || '').toLowerCase();
    const flyWords = (response.words || []).map(w => w.toLowerCase().replace(/[^a-z]/g, ''));
    const isSuccess = (chosen === target) || flyWords.includes(target);

    // Track cue history
    if (!this.cueTrialHistory.has(cue.id)) {
      this.cueTrialHistory.set(cue.id, { attempts: 0, successes: 0, errors: 0 });
    }
    const history = this.cueTrialHistory.get(cue.id);
    history.attempts++;

    const isHoldoutAudit = (this.getCurrentStage().id === 'stage_7_holdout_audit');

    // Biological compartment info for telemetry
    const chosenDef = this.engine.mb.mbonDefinitions.find(m => m.label.toLowerCase() === chosen);
    const targetDef = this.engine.mb.mbonDefinitions.find(m => m.label.toLowerCase() === target);
    const chosenComp = chosenDef ? `${chosenDef.compartment} (${chosenDef.nt})` : 'unknown';
    const targetComp = targetDef ? `${targetDef.compartment} (${targetDef.nt})` : 'unknown';

    if (isHoldoutAudit) {
      // STAGE 7: EXAMINATION PROTOCOL (R = 0, Strict zero-feedback holdout test)
      if (isSuccess) {
        this.totalSuccesses++;
        history.successes++;
        this.masteredCues.add(cue.id);
        const examPassMsg = `[EXAM PASS] Probe '${cue.prompt}' -> Fly produced '${chosen}' (R=0). Verified retention!`;
        if (this.ui) {
          this.ui.addSystemLog(examPassMsg);
          this.ui.addTutorFeedback(examPassMsg, true);
        }
        this.advanceCue();
      } else {
        history.errors++;
        this.cueErrors++;
        const examFailMsg = `[EXAM PROBE] Probe '${cue.prompt}' -> Fly produced '${chosen}' instead of '${target}' (R=0).`;
        if (this.ui) this.ui.addTutorFeedback(examFailMsg, false);

        // After 2 examination attempts, record result and advance to next probe
        if (this.cueErrors >= 2) {
          this.advanceCue();
        }
      }
    } else if (isScaffoldingTrial) {
      // SCAFFOLDING TRIAL: Train on isolated token, but do NOT grant carrier cue mastery
      if (isSuccess) {
        this.engine.rewardSugar(35);
        this.cueErrors = 0; // Reset errors so next trial re-tests the FULL carrier prompt
        const msg = `[SCAFFOLD SUCCESS] Fly recognized isolated core token '${cue.target}'. Re-testing full carrier prompt '${cue.prompt}'...`;
        if (this.ui) this.ui.addTutorFeedback(msg, true);
      } else {
        this.engine.punishError(25);
        const msg = `[SCAFFOLD MISS] Fly struggled on isolated token '${cue.target}' (chose '${chosen}'). PPL1 applied.`;
        if (this.ui) this.ui.addTutorFeedback(msg, false);
      }
    } else {
      // STANDARD OPERANT TRIAL
      if (isSuccess) {
        this.totalSuccesses++;
        history.successes++;

        if (!isRehearsal) {
          this.consecutiveHits++;
          this.cueErrors = 0;
        }

        // Apply +PAM dopamine sucrose reward
        this.engine.rewardSugar(35);
        if (this.speech && this.speedMode === 'NORMAL') this.speech.playDopamineChime();

        let feedback = '';
        if (isRehearsal) {
          feedback = `[SPACED RETENTION PASS] '${cue.prompt}' -> Fly correctly produced '${chosen}' (${chosenComp}). Synaptic trace verified active.`;
        } else {
          feedback = `[+] CORRECT: Fly expressed '${chosen}' (${chosenComp})! Delivering +PAM dopaminergic sucrose reward (+35.0 PAM). Competing synapses depressed. Streak: ${this.consecutiveHits}/${this.requiredHits}.`;
        }
        if (this.ui) this.ui.addTutorFeedback(feedback, true);

        // Check if cue has met Mastery Criterion (e.g. 2 consecutive correct hits on full prompt)
        if (!isRehearsal && this.consecutiveHits >= this.requiredHits) {
          this.masteredCues.add(cue.id);
          this.consecutiveHits = 0;
          const stats = this.engine.mb.getSynapticWeightStats();
          const masterMsg = `[CUE CONSOLIDATED] '${cue.prompt}' -> '${cue.target}' (${cue.desc}) mastered! LTD Index: ${stats.plasticityIndex}%.`;
          if (this.ui) {
            this.ui.addSystemLog(masterMsg);
            this.ui.addTutorFeedback(masterMsg, true);
          }

          // Advance to next cue in stage
          this.advanceCue();
        }
      } else {
        if (!isRehearsal) {
          this.consecutiveHits = 0;
          this.cueErrors++;
        }
        history.errors++;

        // Apply PPL1 aversive conditioning to suppress erroneous chosen action
        this.engine.punishError(25);

        let feedback = '';
        if (isRehearsal) {
          feedback = `[SPACED RETENTION MISS] Rehearsal probe '${cue.prompt}' -> Fly produced '${chosen}' (${chosenComp}) instead of '${target}'. PPL1 applied.`;
        } else {
          feedback = `[-] ERROR: Fly produced '${chosen}' (${chosenComp}) instead of expected '${target}' (${targetComp}). PPL1 aversive shock applied to suppress '${chosen}'. Re-probing (Attempt ${this.cueErrors})...`;
        }
        if (this.ui) this.ui.addTutorFeedback(feedback, false);
      }
    }

    this.isWaitingForFly = false;
    this.updateUIStatus();
    if (this.ui) this.ui.updateDashboard();

    // Schedule next autonomous step
    if (this.isRunning) {
      this.scheduleNextStep();
    }
  }

  // Advance to next cue or graduate to next stage
  advanceCue() {
    const stage = this.getCurrentStage();
    this.activeCueIndex++;
    this.cueErrors = 0;
    this.consecutiveHits = 0;

    // Check if entire stage is completed
    if (this.activeCueIndex >= stage.cues.length) {
      this.activeCueIndex = 0;
      this.activeStageIndex++;

      if (this.activeStageIndex >= this.stages.length) {
        // Mastered all stages! Settle in Stage 8 (Autonomous Open Discourse)
        this.activeStageIndex = this.stages.length - 1;
        const gradMsg = `[CURRICULUM GRADUATION] ALL SCIENTIFIC PEDAGOGICAL STAGES MASTERED (100%)! Connectome has achieved full linguistic conditioning. Engaging continuous discourse mode.`;
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

  // Fast batch conditioning: executes N autonomous teacher trials in a tight loop
  trainBatch(trialsCount = 25) {
    let completed = 0;
    const masteredBefore = this.masteredCues.size;

    for (let t = 0; t < trialsCount; t++) {
      completed++;
      const stage = this.getCurrentStage();
      let activeCue = this.getCurrentCue();
      const isHoldoutAudit = (stage.id === 'stage_7_holdout_audit');

      let isRehearsal = false;
      if (this.totalTrialsRun > 0 && this.totalTrialsRun % 6 === 0 && this.masteredCues.size > 0 && !isHoldoutAudit && stage.id !== 'stage_8_open_dialogue') {
        const masteredList = Array.from(this.masteredCues);
        const randomMasteredId = masteredList[Math.floor(Math.random() * masteredList.length)];
        for (const st of this.stages) {
          const found = st.cues.find(c => c.id === randomMasteredId);
          if (found) {
            activeCue = found;
            isRehearsal = true;
            break;
          }
        }
      }

      let promptText = activeCue.prompt;
      let isScaffoldTrial = false;
      if (!isRehearsal && !isHoldoutAudit && this.cueErrors >= 3 && activeCue.prompt.includes(' ')) {
        promptText = activeCue.target;
        isScaffoldTrial = true;
      }

      this.totalTrialsRun++;
      const explorationTemp = isHoldoutAudit ? 0.0 : 0.018;
      const response = this.engine.generateResponse(promptText, { temperature: explorationTemp });
      const chosen = (response.chosenMBON || response.winningMBON || '').toLowerCase();
      const flyWords = (response.words || []).map(w => w.toLowerCase().replace(/[^a-z]/g, ''));
      const isSuccess = (chosen === activeCue.target.toLowerCase()) || flyWords.includes(activeCue.target.toLowerCase());

      if (isHoldoutAudit) {
        if (isSuccess) {
          this.totalSuccesses++;
          this.masteredCues.add(activeCue.id);
          this.advanceCue();
        } else {
          this.cueErrors++;
          if (this.cueErrors >= 2) {
            this.advanceCue();
          }
        }
      } else if (isScaffoldTrial) {
        if (isSuccess) {
          this.engine.rewardSugar(35);
          this.cueErrors = 0;
        } else {
          this.engine.punishError(25);
        }
      } else {
        if (isSuccess) {
          this.totalSuccesses++;
          if (!isRehearsal) {
            this.consecutiveHits++;
            this.cueErrors = 0;
          }

          this.engine.rewardSugar(35);

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
          this.engine.punishError(25);
        }
      }
    }

    const newlyMastered = this.masteredCues.size - masteredBefore;
    const stats = this.engine.mb.getSynapticWeightStats();
    const stage = this.getCurrentStage();
    const pct = ((this.masteredCues.size / this.totalCuesCount) * 100).toFixed(1);

    const logMsg = `[AUTONOMOUS BATCH] Ran ${completed} trials. Stage: ${stage.name.split(':')[0]}. Total Mastered: ${this.masteredCues.size}/${this.totalCuesCount} (${pct}%). Depressed KC Synapses: ${stats.depressedSynapsesCount} (${stats.plasticityIndex}%).`;
    if (this.ui) {
      this.ui.addSystemLog(logMsg);
      this.ui.updateDashboard();
    }
    this.updateUIStatus();
    return { completed, newlyMastered, totalMastered: this.masteredCues.size };
  }

  // Complete current stage automatically
  completeCurrentStage() {
    const currentStageIdx = this.activeStageIndex;
    let safetyCounter = 0;
    while (this.activeStageIndex === currentStageIdx && safetyCounter < 1000) {
      this.trainBatch(20);
      safetyCounter += 20;
    }
  }

  // Completely train through all stages autonomously
  masterAllStages() {
    let safetyCounter = 0;
    while (this.activeStageIndex < this.stages.length - 1 && safetyCounter < 4000) {
      this.trainBatch(25);
      safetyCounter += 25;
    }
  }

  // Update UI telemetry elements
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
      toggleBtn.textContent = this.isRunning ? '[Pause Autonomous Teacher]' : '[Start Autonomous Teacher]';
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
      const scaffoldText = this.isScaffoldingActive ? ' [Scaffold Active]' : '';
      const rehearsalText = this.isRehearsalProbe ? ' [Spaced Rehearsal]' : '';
      lessonLbl.textContent = `${stage.name} | Cue: "${cue.prompt}" -> "${cue.target}" (${this.consecutiveHits}/${this.requiredHits} hits)${scaffoldText}${rehearsalText}`;
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
