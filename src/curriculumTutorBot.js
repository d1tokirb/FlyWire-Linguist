// ============================================================================
// Autonomous In-Depth Pedagogical Master Teacher for Drosophila Linguist
// ============================================================================
// Multi-Stage Operant Conditioning, Scaffolding & Interleaved Memory Engine:
// Stage 1: Primary Operant Conditioning (All 21 Foundational Output Attractors)
// Stage 2: Contextual Syntactic Scaffolding (Carrier Sentences & Generalization)
// Stage 3: Bidirectional Position Invariance (Anti-Shortcut Temporal Delay Banks)
// Stage 4: Non-Linear Inhibitory Inversion (Neuromodulatory XOR Negation)
// Stage 5: Conversational Semantic Causality (Socratic Causal Attributions)
// Stage 6: Unrewarded Retention Audit & Examination (Zero-Dopamine Consolidation)
// Stage 7: Autonomous Reciprocal Discourse (Continuous Adaptive Dialogue)

export class CurriculumTutorBot {
  constructor(engine, speechSynth, ui = null) {
    this.engine = engine;
    this.speech = speechSynth;
    this.ui = ui;

    this.isRunning = false;
    this.isWaitingForFly = false;
    this.speedMode = 'TURBO'; // 'INSTANT', 'TURBO', 'FAST', 'NORMAL'
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
    this.examResults = []; // Stage 6 exam logs

    // Mastered sets & spaced repetition history
    this.masteredCues = new Set();
    this.cueTrialHistory = new Map(); // cueId -> { attempts, successes, errors }

    // 6-Stage Master Pedagogical Syllabus
    this.stages = [
      {
        id: 'stage_1_atomic',
        name: 'Stage 1: Primary Operant Conditioning (All 21 Atomic Tokens)',
        description: 'Establishing individual synaptic attractor basins for all 21 functional output classes.',
        cues: [
          { id: 's1_sugar', prompt: 'sugar', target: 'sugar', desc: 'Appetitive sucrose craving' },
          { id: 's1_left', prompt: 'left', target: 'left', desc: 'Left motor bank steering' },
          { id: 's1_right', prompt: 'right', target: 'right', desc: 'Right motor pitch steering' },
          { id: 's1_go', prompt: 'go', target: 'go', desc: 'Forward thrust motor excitation' },
          { id: 's1_stop', prompt: 'stop', target: 'stop', desc: 'Aerodynamic braking halt' },
          { id: 's1_sweet', prompt: 'sweet', target: 'sweet', desc: 'Gustatory sweet receptor detection' },
          { id: 's1_fast', prompt: 'fast', target: 'fast', desc: '200 Hz wing oscillation burst' },
          { id: 's1_rest', prompt: 'rest', target: 'rest', desc: 'Flight cessation and grooming' },
          { id: 's1_hello', prompt: 'hello', target: 'hello', desc: 'Acoustic vocal salience greeting' },
          { id: 's1_fly', prompt: 'fly', target: 'fly', desc: 'Species identity and aerial motor' },
          { id: 's1_human', prompt: 'human', target: 'human', desc: 'External teacher agent recognition' },
          { id: 's1_speak', prompt: 'speak', target: 'speak', desc: 'Vocal transduction activation' },
          { id: 's1_smart', prompt: 'smart', target: 'smart', desc: 'Mushroom body plasticity pride' },
          { id: 's1_good', prompt: 'good', target: 'good', desc: 'Positive valence companion state' },
          { id: 's1_happy', prompt: 'happy', target: 'happy', desc: 'Dopaminergic joy and arousal' },
          { id: 's1_yes', prompt: 'yes', target: 'yes', desc: 'Affirmative behavioral readiness' },
          { id: 's1_no', prompt: 'no', target: 'no', desc: 'Aversive refusal and avoidance' },
          { id: 's1_want', prompt: 'want', target: 'want', desc: 'Appetitive goal-directed pursuit' },
          { id: 's1_listen', prompt: 'listen', target: 'listen', desc: 'Antennae Johnston organ tuning' },
          { id: 's1_bzz', prompt: 'bzz', target: 'bzz', desc: 'Wing vibration acoustic click' },
          { id: 's1_clck', prompt: 'clck', target: 'clck', desc: 'Subesophageal motor click' }
        ]
      },
      {
        id: 'stage_2_carriers',
        name: 'Stage 2: Contextual Syntactic Scaffolding (Carrier Sentences)',
        description: 'Conditioning invariance across diverse prefixes, suffixes, and syntactic frames.',
        cues: [
          { id: 's2_turn_left', prompt: 'turn left', target: 'left', desc: 'Carrier prefix turn' },
          { id: 's2_steer_left', prompt: 'steer left', target: 'left', desc: 'Carrier prefix steer' },
          { id: 's2_go_left', prompt: 'go left', target: 'left', desc: 'Carrier prefix go' },
          { id: 's2_fly_left', prompt: 'fly left', target: 'left', desc: 'Carrier prefix fly' },
          { id: 's2_please_left', prompt: 'please turn left', target: 'left', desc: 'Compound prefix please turn' },
          { id: 's2_turn_right', prompt: 'turn right', target: 'right', desc: 'Carrier prefix turn' },
          { id: 's2_steer_right', prompt: 'steer right', target: 'right', desc: 'Carrier prefix steer' },
          { id: 's2_go_right', prompt: 'go right', target: 'right', desc: 'Carrier prefix go' },
          { id: 's2_fly_right', prompt: 'fly right', target: 'right', desc: 'Carrier prefix fly' },
          { id: 's2_please_right', prompt: 'please turn right', target: 'right', desc: 'Compound prefix please turn' },
          { id: 's2_taste_sugar', prompt: 'taste sugar', target: 'sugar', desc: 'Carrier prefix taste' },
          { id: 's2_want_sugar', prompt: 'want sugar', target: 'sugar', desc: 'Carrier prefix want' },
          { id: 's2_sweet_sugar', prompt: 'sweet sugar', target: 'sugar', desc: 'Adjective carrier sweet' },
          { id: 's2_eat_sugar', prompt: 'eat sweet sugar', target: 'sugar', desc: 'Compound carrier eat sweet' },
          { id: 's2_halt_stop', prompt: 'halt and stop', target: 'stop', desc: 'Synonym carrier halt and' },
          { id: 's2_please_stop', prompt: 'please stop', target: 'stop', desc: 'Polite carrier please' },
          { id: 's2_say_hello', prompt: 'say hello', target: 'hello', desc: 'Carrier prefix say' },
          { id: 's2_hello_fly', prompt: 'hello little fly', target: 'hello', desc: 'Compound greeting suffix' }
        ]
      },
      {
        id: 'stage_3_bidirectional',
        name: 'Stage 3: Bidirectional Position Invariance (Anti-Shortcut)',
        description: 'Enforcing order sensitivity and position invariance via temporal delay lines.',
        cues: [
          { id: 's3_bidi_l1', prompt: 'left turn', target: 'left', desc: 'Focal cue in position 0' },
          { id: 's3_bidi_l2', prompt: 'turn left', target: 'left', desc: 'Focal cue in position 1' },
          { id: 's3_bidi_r1', prompt: 'right turn', target: 'right', desc: 'Focal cue in position 0' },
          { id: 's3_bidi_r2', prompt: 'turn right', target: 'right', desc: 'Focal cue in position 1' },
          { id: 's3_bidi_g1', prompt: 'go forward', target: 'go', desc: 'Thrust in position 0' },
          { id: 's3_bidi_g2', prompt: 'forward go', target: 'go', desc: 'Thrust in position 1' },
          { id: 's3_bidi_s1', prompt: 'stop now', target: 'stop', desc: 'Brake in position 0' },
          { id: 's3_bidi_s2', prompt: 'now stop', target: 'stop', desc: 'Brake in position 1' }
        ]
      },
      {
        id: 'stage_4_xor_negation',
        name: 'Stage 4: Non-Linear Inhibitory Inversion (XOR Negation)',
        description: 'Neuromodulatory channel inversion: Negation particles reverse directional motor output.',
        cues: [
          { id: 's4_pos_left', prompt: 'go left', target: 'left', desc: 'Affirmative left direction' },
          { id: 's4_neg_left', prompt: 'dont go left', target: 'right', desc: 'Negated left -> Inverts to right' },
          { id: 's4_pos_right', prompt: 'go right', target: 'right', desc: 'Affirmative right direction' },
          { id: 's4_neg_right', prompt: 'dont go right', target: 'left', desc: 'Negated right -> Inverts to left' },
          { id: 's4_comp_neg_left', prompt: 'please dont go left', target: 'right', desc: 'Polite negated left -> Inverts to right' },
          { id: 's4_comp_neg_right', prompt: 'please dont go right', target: 'left', desc: 'Polite negated right -> Inverts to left' },
          { id: 's4_pos_sugar', prompt: 'want sugar', target: 'sugar', desc: 'Affirmative appetitive desire' },
          { id: 's4_neg_sugar', prompt: 'dont eat sugar', target: 'no', desc: 'Negated sugar -> Refusal' }
        ]
      },
      {
        id: 'stage_5_causality',
        name: 'Stage 5: Conversational Dialogue & Semantic Causality (Q&A)',
        description: 'Associative inquiry resolution: Linking questions to causal behavioral tokens.',
        cues: [
          { id: 's5_why_fly', prompt: 'why fly?', target: 'fast', desc: 'Flight causality -> Speed' },
          { id: 's5_why_sugar', prompt: 'why sugar?', target: 'sweet', desc: 'Sucrose causality -> Sweet taste' },
          { id: 's5_who_you', prompt: 'who are you?', target: 'fly', desc: 'Self-identity -> Fly' },
          { id: 's5_who_human', prompt: 'who am I?', target: 'human', desc: 'Teacher identity -> Human' },
          { id: 's5_how_hear', prompt: 'how hear voice?', target: 'listen', desc: 'Johnston organ -> Listen' },
          { id: 's5_how_feel', prompt: 'how is mood?', target: 'happy', desc: 'Dopamine valence -> Happy' },
          { id: 's5_if_tired', prompt: 'if you get tired?', target: 'rest', desc: 'Fatigue consequence -> Rest' },
          { id: 's5_can_speak', prompt: 'can you talk?', target: 'speak', desc: 'Vocal capability -> Speak' },
          { id: 's5_are_we_friends', prompt: 'are we good companions?', target: 'good', desc: 'Companionship -> Good' }
        ]
      },
      {
        id: 'stage_6_holdout_audit',
        name: 'Stage 6: Unrewarded Retention Audit (Examination)',
        description: 'Zero-feedback holdout test (R = 0) verifying consolidated synaptic memory.',
        cues: [
          { id: 's6_h_left', prompt: 'fly left', target: 'left', desc: 'Holdout motor left' },
          { id: 's6_h_right', prompt: 'fly right', target: 'right', desc: 'Holdout motor right' },
          { id: 's6_h_sugar', prompt: 'sweet sugar', target: 'sugar', desc: 'Holdout appetitive sugar' },
          { id: 's6_h_neg', prompt: 'dont go left', target: 'right', desc: 'Holdout negation XOR' },
          { id: 's6_h_why', prompt: 'why fly?', target: 'fast', desc: 'Holdout causality' },
          { id: 's6_h_bidi', prompt: 'turn right', target: 'right', desc: 'Holdout bidirectional' }
        ]
      },
      {
        id: 'stage_7_open_dialogue',
        name: 'Stage 7: Autonomous Reciprocal Discourse',
        description: 'Continuous dialogue mode with adaptive maintenance reinforcement.',
        cues: [
          { id: 's7_disc_1', prompt: 'Hello friend, how are your wings today?', target: 'fly', desc: 'Open conversation' },
          { id: 's7_disc_2', prompt: 'Would you like some sweet sugar?', target: 'sugar', desc: 'Open conversation' },
          { id: 's7_disc_3', prompt: 'Can you steer left through the chamber?', target: 'left', desc: 'Open conversation' },
          { id: 's7_disc_4', prompt: 'You have learned so much English today.', target: 'smart', desc: 'Open conversation' }
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

  // Biological Unconditioned Stimulus (US) Priming:
  // If the fly struggles on a cue for >= 5 consecutive errors due to collateral depression
  // from earlier tokens, prime the target receptive field by restoring target baseline weights
  applyUnconditionedStimulusPriming(targetLabel) {
    const targetIdx = this.engine.mb.mbonDefinitions.findIndex(m => m.label.toLowerCase() === targetLabel.toLowerCase());
    if (targetIdx === -1) return;

    this.engine.mb.forward([targetLabel]);
    for (let i = 0; i < this.engine.mb.numKCs; i++) {
      if (this.engine.mb.kcActivity[i] > 0) {
        const weightIdx = i * this.engine.mb.numMBONs + targetIdx;
        if (this.engine.mb.kcToMbonConnected[weightIdx] === 1) {
          this.engine.mb.kcToMbonWeights[weightIdx] = this.engine.mb.kcToMbonBaselineWeights[weightIdx];
        }
      }
    }
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

    // 1. Announce Stage Introduction if first time entering stage
    if (!this.stageIntroAnnounced.has(stage.id)) {
      this.stageIntroAnnounced.add(stage.id);
      const introMsg = `[SYLLABUS] Commencing ${stage.name}. Objective: ${stage.description}`;
      if (this.ui) {
        this.ui.addSystemLog(introMsg);
        this.ui.addTutorMessage(stage.description, `[SYLLABUS: ${stage.name.split(':')[0].toUpperCase()}]`);
      }
    }

    // 2. Spaced Repetition Interleaving: Every 5 trials in Stages 1-5, test a previously mastered cue
    let activeCue = this.getCurrentCue();
    let isRehearsal = false;
    if (this.totalTrialsRun > 0 && this.totalTrialsRun % 5 === 0 && this.masteredCues.size > 0 && this.activeStageIndex < 5) {
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

    // 3. Apply US priming if struggling on this cue
    if (!isRehearsal && this.cueErrors >= 5 && this.activeStageIndex < 5) {
      this.applyUnconditionedStimulusPriming(activeCue.target);
    }

    // 4. Formulate Rich Pedagogical Prompt & Instructional Framing
    let promptText = activeCue.prompt;
    let pedagogicalTag = `${stage.name.split(':')[0]} | Cue ${this.activeCueIndex + 1}/${stage.cues.length}`;
    let instructionalText = activeCue.prompt;

    if (isRehearsal) {
      pedagogicalTag = `[SPACED REHEARSAL]`;
      instructionalText = `Memory retention probe: Can you still identify '${activeCue.prompt}'?`;
      promptText = activeCue.prompt;
    } else if (this.cueErrors >= 3 && activeCue.prompt.includes(' ')) {
      this.isScaffoldingActive = true;
      pedagogicalTag = `[SCAFFOLDING]`;
      promptText = activeCue.target; // Scaffolding: isolate salient core token
      instructionalText = `Simplifying acoustic stream: Focus on isolated core token '${activeCue.target}'.`;
    } else if (this.cueErrors > 0) {
      instructionalText = `Re-probing: '${activeCue.prompt}' (Expected action: '${activeCue.target}', Attempt ${this.cueErrors + 1}).`;
    } else {
      // First attempt on new cue
      this.isScaffoldingActive = false;
      if (this.activeStageIndex === 0) {
        instructionalText = `Acoustic prompt: '${activeCue.prompt}'. Transduce frequency into motor action '${activeCue.target}'.`;
      } else if (this.activeStageIndex === 1) {
        instructionalText = `Carrier sentence: '${activeCue.prompt}'. Discriminate embedded action '${activeCue.target}'.`;
      } else if (this.activeStageIndex === 3) {
        instructionalText = `Inhibitory inversion: '${activeCue.prompt}'. Negation particle reverses direction.`;
      } else if (this.activeStageIndex === 4) {
        instructionalText = `Causal question: '${activeCue.prompt}'. Respond with causal behavioral token '${activeCue.target}'.`;
      } else if (this.activeStageIndex === 5) {
        instructionalText = `[EXAMINATION PROBE] Zero-feedback holdout test: '${activeCue.prompt}' (R=0).`;
      }
    }

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
      // Connectome processes sensory input
      const response = this.engine.generateResponse(promptText);
      if (this.ui) this.ui.addFlyMessage(response);

      if (this.speech && this.speedMode === 'NORMAL') {
        this.speech.speak(response.text, response.stage);
      }

      // Teacher evaluates response with rigorous behavioral criterion
      this.evaluateTrial(activeCue, response, promptText, isRehearsal);
    };

    if (latency === 0) {
      runNeuralStep();
    } else {
      setTimeout(runNeuralStep, latency);
    }
  }

  // In-Depth Behavioral Evaluation & Reinforcement Loop
  evaluateTrial(cue, response, actualPromptUsed, isRehearsal = false) {
    const target = cue.target.toLowerCase();
    const chosen = (response.winningMBON || '').toLowerCase();
    const flyWords = (response.words || []).map(w => w.toLowerCase().replace(/[^a-z]/g, ''));
    const isSuccess = (chosen === target) || flyWords.includes(target);

    // Track cue history
    if (!this.cueTrialHistory.has(cue.id)) {
      this.cueTrialHistory.set(cue.id, { attempts: 0, successes: 0, errors: 0 });
    }
    const history = this.cueTrialHistory.get(cue.id);
    history.attempts++;

    const isHoldoutAudit = (this.activeStageIndex === 5); // Stage 6 is unrewarded examination

    // Get biological compartment info for the chosen MBON
    const chosenDef = this.engine.mb.mbonDefinitions.find(m => m.label.toLowerCase() === chosen);
    const targetDef = this.engine.mb.mbonDefinitions.find(m => m.label.toLowerCase() === target);
    const chosenComp = chosenDef ? `${chosenDef.compartment} (${chosenDef.nt})` : 'unknown';
    const targetComp = targetDef ? `${targetDef.compartment} (${targetDef.nt})` : 'unknown';

    if (isHoldoutAudit) {
      // STAGE 6: EXAMINATION PROTOCOL (R = 0, Strict zero-feedback holdout test)
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

        // After 2 examination attempts, record result and advance to next question
        if (this.cueErrors >= 2) {
          this.advanceCue();
        }
      }
    } else {
      // STAGES 1-5 & 7: ACTIVE OPERANT CONDITIONING
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

        // Check if cue has met Mastery Criterion (e.g. 2 consecutive correct hits)
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
          feedback = `[SPACED RETENTION MISS] Rehearsal probe '${cue.prompt}' -> Fly produced '${chosen}' (${chosenComp}) instead of '${target}'. PPL1 aversive tune-up applied.`;
        } else {
          const scaffoldNote = this.isScaffoldingActive ? ' [Faded Scaffolding Active]' : '';
          feedback = `[-] ERROR: Fly produced '${chosen}' (${chosenComp}) instead of expected '${target}' (${targetComp}). PPL1 aversive dopamine applied to suppress '${chosen}'. Re-probing (Attempt ${this.cueErrors})...${scaffoldNote}`;
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
        // Mastered all stages! Settle in Stage 7 (Autonomous Open Discourse)
        this.activeStageIndex = this.stages.length - 1;
        const gradMsg = `[CURRICULUM GRADUATION] ALL 6 SCIENTIFIC PEDAGOGICAL STAGES MASTERED (100%)! Connectome has achieved full linguistic conditioning. Engaging continuous discourse mode.`;
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

      let isRehearsal = false;
      if (this.totalTrialsRun > 0 && this.totalTrialsRun % 5 === 0 && this.masteredCues.size > 0 && this.activeStageIndex < 5) {
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

      // Apply US priming if struggling
      if (!isRehearsal && this.cueErrors >= 5 && this.activeStageIndex < 5) {
        this.applyUnconditionedStimulusPriming(activeCue.target);
      }

      let promptText = activeCue.prompt;
      if (!isRehearsal && this.cueErrors >= 3 && activeCue.prompt.includes(' ')) {
        promptText = activeCue.target;
      }

      this.totalTrialsRun++;
      const response = this.engine.generateResponse(promptText);
      const chosen = (response.winningMBON || '').toLowerCase();
      const flyWords = (response.words || []).map(w => w.toLowerCase().replace(/[^a-z]/g, ''));
      const isSuccess = (chosen === activeCue.target.toLowerCase()) || flyWords.includes(activeCue.target.toLowerCase());

      const isHoldoutAudit = (this.activeStageIndex === 5);

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
    while (this.activeStageIndex === currentStageIdx && safetyCounter < 600) {
      this.trainBatch(20);
      safetyCounter += 20;
    }
  }

  // Completely train through all stages autonomously
  masterAllStages() {
    let safetyCounter = 0;
    while (this.activeStageIndex < 6 && safetyCounter < 2500) {
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
