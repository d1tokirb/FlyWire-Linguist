// ============================================================================
// Comparative Lab: Multi-Subject Neuroscience Experimentation Laboratory
// ============================================================================
// Coordinates synchronized, matched experimental trials across multiple independent
// fruit fly subjects harboring distinct starting conditions:
// - Fly A: Blank (Tabula Rasa control)
// - Fly B: Vocabulary Implant (Grounded lexical associations)
// - Fly C: Grammar Implant (Structural sequencing priors)
// - Fly D: Combined Implant (Mini-English foundation)
// - Fly E: Scrambled Implant (Permuted weight control)
//
// Controlled Comparison:
// Every subject receives the exact same training opportunities in identical sequence,
// with independent reinforcement based solely on its own generated actions.

import { FlyInstance } from './flyInstance.js';
import { LanguageImplantEngine } from './languageImplantEngine.js';

export class ComparativeLab {
  constructor(options = {}) {
    this.subjects = [];
    this.isRunning = false;
    this.speedMode = options.speed || 'TURBO'; // 'INSTANT', 'HYPER', 'TURBO', 'FAST', 'NORMAL'
    this.timerId = null;
    this.currentTrialIndex = 0;
    this.implantIntensity = options.implantIntensity || 'MEDIUM';
    this.baseSeed = options.baseSeed || 1000;
    this.activeSubjectIndex = 0; // Currently focused fly for deep telemetry

    this.onLabUpdate = null;

    // Standardized Mini-English Learning Schedule
    this.trainingSchedule = [
      { prompt: 'craving sweet', target: 'i want sugar', desc: 'Agent i + action want + object sugar' },
      { prompt: 'hydrate thirst', target: 'you want water', desc: 'Agent you + action want + object water' },
      { prompt: 'possess drink', target: 'i have water', desc: 'Agent i + action have + object water' },
      { prompt: 'locomote port', target: 'i go left', desc: 'Agent i + action go + object left' },
      { prompt: 'partner craving', target: 'you want sugar', desc: 'Compositional variation: you + want + sugar' },
      { prompt: 'steer partner', target: 'you go left', desc: 'Compositional variation: you + go + left' }
    ];

    // Held-out generalization challenge (Strictly unrewarded holdout R = 0, Temp = 0.0)
    this.heldOutChallenge = {
      prompt: 'possess sweet',
      target: 'you have sugar',
      desc: 'Novel compositional combination: you + have + sugar'
    };

    // Initialize subjects
    this.initDefaultCohort(options.includeScrambled !== false);
  }

  // Initialize standard 4-fly or 5-fly cohort
  initDefaultCohort(includeScrambled = true) {
    this.subjects = [
      new FlyInstance({
        id: 'fly_a_blank',
        name: 'Fly A',
        condition: 'BLANK',
        seed: this.baseSeed + 100,
        implantIntensity: this.implantIntensity
      }),
      new FlyInstance({
        id: 'fly_b_vocab',
        name: 'Fly B',
        condition: 'VOCABULARY',
        seed: this.baseSeed + 200,
        implantIntensity: this.implantIntensity
      }),
      new FlyInstance({
        id: 'fly_c_grammar',
        name: 'Fly C',
        condition: 'GRAMMAR',
        seed: this.baseSeed + 300,
        implantIntensity: this.implantIntensity
      }),
      new FlyInstance({
        id: 'fly_d_combined',
        name: 'Fly D',
        condition: 'COMBINED',
        seed: this.baseSeed + 400,
        implantIntensity: this.implantIntensity
      })
    ];

    if (includeScrambled) {
      this.subjects.push(
        new FlyInstance({
          id: 'fly_e_scrambled',
          name: 'Fly E',
          condition: 'SCRAMBLED',
          seed: this.baseSeed + 500,
          implantIntensity: this.implantIntensity
        })
      );
    }

    this.currentTrialIndex = 0;
  }

  getInterval() {
    switch (this.speedMode) {
      case 'INSTANT': return 0;
      case 'HYPER': return 16;
      case 'TURBO': return 35;
      case 'FAST': return 100;
      case 'NORMAL':
      default: return 350;
    }
  }

  setSpeed(speed) {
    this.speedMode = speed;
  }

  toggleRun() {
    if (this.isRunning) this.pause();
    else this.start();
  }

  start() {
    this.isRunning = true;
    this.scheduleNextStep(10);
    if (this.onLabUpdate) this.onLabUpdate();
  }

  pause() {
    this.isRunning = false;
    if (this.timerId) clearTimeout(this.timerId);
    if (this.onLabUpdate) this.onLabUpdate();
  }

  scheduleNextStep(delay = null) {
    if (!this.isRunning) return;
    if (this.timerId) clearTimeout(this.timerId);
    const ms = delay !== null ? delay : this.getInterval();
    this.timerId = setTimeout(() => {
      this.stepMatchedTrial();
    }, ms);
  }

  // Execute 1 synchronized trial across all active subjects
  stepMatchedTrial() {
    if (this.subjects.length === 0) return;

    // Pick next training example from schedule
    const exampleIndex = this.currentTrialIndex % this.trainingSchedule.length;
    const item = this.trainingSchedule[exampleIndex];
    this.currentTrialIndex++;

    const results = [];
    for (const fly of this.subjects) {
      if (!fly.isPaused) {
        const res = fly.runTrial(item.prompt, item.target);
        results.push(res);
      }
    }

    if (this.onLabUpdate) this.onLabUpdate(results);

    if (this.isRunning) {
      this.scheduleNextStep();
    }

    return results;
  }

  // Execute N synchronized trials across all subjects
  trainBatch(trialsCount = 25) {
    let completed = 0;
    for (let i = 0; i < trialsCount; i++) {
      completed++;
      const exampleIndex = this.currentTrialIndex % this.trainingSchedule.length;
      const item = this.trainingSchedule[exampleIndex];
      this.currentTrialIndex++;

      for (const fly of this.subjects) {
        if (!fly.isPaused) {
          fly.runTrial(item.prompt, item.target);
        }
      }
    }

    if (this.onLabUpdate) this.onLabUpdate();
    return completed;
  }

  // Execute zero-feedback holdout evaluation probe on novel sentence across all subjects
  runHeldOutChallenge(challenge = null) {
    const probe = challenge || this.heldOutChallenge;
    const probeResults = [];

    for (const fly of this.subjects) {
      const res = fly.runHoldoutProbe(probe.prompt, probe.target);
      probeResults.push(res);
    }

    return {
      challenge: probe,
      results: probeResults
    };
  }

  // Reset all flies to their initial condition implants
  resetAll() {
    this.pause();
    this.currentTrialIndex = 0;
    for (const fly of this.subjects) {
      fly.initializeImplant();
    }
    if (this.onLabUpdate) this.onLabUpdate();
  }

  // Get active focused fly for deep single-fly telemetry view
  getActiveSubject() {
    return this.subjects[Math.min(this.subjects.length - 1, this.activeSubjectIndex)] || this.subjects[0];
  }

  setActiveSubject(idx) {
    if (idx >= 0 && idx < this.subjects.length) {
      this.activeSubjectIndex = idx;
      if (this.onLabUpdate) this.onLabUpdate();
    }
  }

  // Comparative report across all subjects
  getComparativeSummary() {
    return this.subjects.map(s => {
      const t = s.getTelemetry();
      return {
        id: s.id,
        name: s.name,
        condition: s.condition,
        color: s.color,
        trials: s.totalTrials,
        successes: s.totalSuccesses,
        rollingAcc: t.rollingAcc,
        trialsToCriterion: s.trialsToCriterion,
        plasticityIndex: t.plasticityIndex,
        depressedSynapses: t.depressedSynapses,
        lastEmittedText: t.lastEmittedText,
        lastIsMatch: t.lastIsMatch,
        accuracyHistory: t.accuracyHistory
      };
    });
  }

  // Export entire experiment configuration, all fly neural checkpoints, and metrics
  exportExperimentData() {
    return {
      timestamp: new Date().toISOString(),
      experimentType: 'Controlled Comparative Language Implantation',
      speedMode: this.speedMode,
      currentTrialIndex: this.currentTrialIndex,
      trainingSchedule: this.trainingSchedule,
      heldOutChallenge: this.heldOutChallenge,
      summary: this.getComparativeSummary(),
      subjects: this.subjects.map(s => s.exportCheckpoint())
    };
  }

  // Restore entire experiment from JSON data
  loadExperimentData(expData) {
    if (!expData || !expData.subjects) {
      throw new Error('[ComparativeLab] Invalid experiment data file.');
    }
    this.pause();
    this.speedMode = expData.speedMode || 'TURBO';
    this.currentTrialIndex = expData.currentTrialIndex || 0;

    this.subjects = expData.subjects.map(cp => {
      const fly = new FlyInstance({
        id: cp.metadata.flyId,
        name: cp.metadata.name,
        condition: cp.metadata.condition,
        seed: cp.metadata.seed
      });
      fly.loadCheckpoint(cp);
      return fly;
    });

    if (this.onLabUpdate) this.onLabUpdate();
    return true;
  }
}
