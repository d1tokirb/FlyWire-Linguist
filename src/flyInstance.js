// ============================================================================
// FlyInstance: Completely Isolated Simulated Drosophila Neural Subject
// ============================================================================
// Encapsulates a distinct fruit fly brain with its own:
// - Measured Mushroom Body connectome (2,597 KCs, 21 MBONs)
// - Recurrent motor sequence generator (working memory, action distribution)
// - Sensory transduction stream (209 PNs)
// - Independent random number generator seed
// - Synaptic weights, value baseline, and eligibility traces
// - Trial metrics, rolling learning curve, and implant metadata
//
// ZERO SHARED MUTABLE STATE GUARANTEE:
// Modifications to one FlyInstance never leak or alter another fly's state.

import { SequentialLanguageEngine } from './sequentialLanguageEngine.js';
import { LanguageImplantEngine } from './languageImplantEngine.js';
import { NeuralCheckpoint } from './neuralCheckpoint.js';

export class FlyInstance {
  constructor(config = {}) {
    this.id = config.id || `fly_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.name = config.name || 'Subject Fly';
    this.condition = (config.condition || 'BLANK').toUpperCase();
    this.seed = typeof config.seed === 'number' ? config.seed : 42;
    this.implantIntensity = config.implantIntensity || 'MEDIUM';
    this.color = config.color || this.getDefaultColorForCondition(this.condition);

    // Instantiate dedicated, completely isolated neural engine
    this.engine = new SequentialLanguageEngine({
      mode: 'SEQUENTIAL',
      seed: this.seed,
      hiddenDim: config.hiddenDim || 96,
      learningRate: config.learningRate || 0.08
    });

    // Subject state
    this.isPaused = false;
    this.implantMetadata = null;

    // Performance metrics
    this.totalTrials = 0;
    this.totalSuccesses = 0;
    this.currentStreak = 0;
    this.trialsToCriterion = null; // Trial index where rolling 10-trial accuracy first hits >= 80%

    // Trial history & rolling accuracy
    this.recentWindow = []; // Last 10 trials (1 = success, 0 = fail)
    this.accuracyHistory = []; // Snapshots of accuracy over time for comparative curves
    this.trialLog = []; // Detailed record of past trials (capped to avoid memory bloat)

    // Last output telemetry
    this.lastPrompt = '';
    this.lastTarget = '';
    this.lastResponse = null;
    this.lastIsMatch = false;

    // Apply assigned implant condition
    this.initializeImplant();
  }

  getDefaultColorForCondition(cond) {
    switch (cond) {
      case 'BLANK': return '#8b949e';      // Gray
      case 'VOCABULARY': return '#58a6ff'; // Blue
      case 'GRAMMAR': return '#d29922';    // Yellow / Amber
      case 'COMBINED': return '#3fb950';   // Green
      case 'SCRAMBLED': return '#f85149';  // Red
      default: return '#c9d1d9';
    }
  }

  // Initialize or re-apply implant condition
  initializeImplant() {
    this.implantMetadata = LanguageImplantEngine.applyImplant(this.engine, this.condition, {
      intensity: this.implantIntensity,
      seed: this.seed
    });
    this.resetMetrics();
  }

  resetMetrics() {
    this.totalTrials = 0;
    this.totalSuccesses = 0;
    this.currentStreak = 0;
    this.trialsToCriterion = null;
    this.recentWindow = [];
    this.accuracyHistory = [0.0];
    this.trialLog = [];
    this.lastPrompt = '';
    this.lastTarget = '';
    this.lastResponse = null;
    this.lastIsMatch = false;
  }

  // Execute a single training trial with action-gated scalar reinforcement
  runTrial(prompt, target, options = {}) {
    if (this.isPaused) return null;

    this.totalTrials++;
    this.lastPrompt = prompt;
    this.lastTarget = target;

    const temperature = (typeof options.temperature === 'number')
      ? options.temperature
      : Math.max(0.12, 0.75 - Math.min(0.60, this.currentStreak * 0.25));

    const maxLen = (target ? target.length : 12) + 3;
    const response = this.engine.generateResponse(prompt, { temperature, maxLen });
    this.lastResponse = response;

    const targetClean = (target || '').toLowerCase().trim();
    const emittedClean = (response.text || '').toLowerCase().trim();
    const isExactMatch = (emittedClean === targetClean) && response.terminatedWithEOS;
    this.lastIsMatch = isExactMatch;

    // Deliver action-gated reinforcement (intermediate shaping + completion bonus)
    const rewardReport = this.engine.rewardSequence(target);

    // Update metrics
    if (isExactMatch) {
      this.totalSuccesses++;
      this.currentStreak++;
    } else {
      this.currentStreak = 0;
    }

    this.recentWindow.push(isExactMatch ? 1 : 0);
    if (this.recentWindow.length > 10) this.recentWindow.shift();

    const rollingAcc = (this.recentWindow.reduce((a, b) => a + b, 0) / this.recentWindow.length) * 100;

    // Check criterion (rolling 10-trial accuracy >= 80%)
    if (this.trialsToCriterion === null && rollingAcc >= 80 && this.totalTrials >= 10) {
      this.trialsToCriterion = this.totalTrials;
    }

    // Record trajectory point every 5 trials
    if (this.totalTrials % 5 === 0 || this.totalTrials === 1) {
      this.accuracyHistory.push(Math.round(rollingAcc));
      if (this.accuracyHistory.length > 60) this.accuracyHistory.shift();
    }

    // Log trial
    const record = {
      trial: this.totalTrials,
      prompt,
      target,
      emitted: emittedClean,
      isExactMatch,
      rollingAcc: Math.round(rollingAcc),
      matchChars: rewardReport ? rewardReport.matchCount : 0,
      activeKCs: response.activeKCCount,
      topMBON: response.topMBON
    };

    this.trialLog.push(record);
    if (this.trialLog.length > 50) this.trialLog.shift();

    return record;
  }

  // Execute an unrewarded holdout evaluation probe (R = 0, Temp = 0.0)
  runHoldoutProbe(prompt, target) {
    const maxLen = (target ? target.length : 12) + 3;
    // Temperature = 0.0 (strictly deterministic greedy evaluation)
    const response = this.engine.generateResponse(prompt, { temperature: 0.0, maxLen });

    const targetClean = (target || '').toLowerCase().trim();
    const emittedClean = (response.text || '').toLowerCase().trim();
    const isExactMatch = (emittedClean === targetClean) && response.terminatedWithEOS;

    return {
      flyId: this.id,
      condition: this.condition,
      prompt,
      target: targetClean,
      emitted: emittedClean,
      isExactMatch,
      terminatedWithEOS: response.terminatedWithEOS,
      stepsCount: response.stepsCount,
      activeKCs: response.activeKCCount,
      timeline: response.timeline
    };
  }

  // Export full neural state checkpoint
  exportCheckpoint() {
    return NeuralCheckpoint.createCheckpoint(this.engine, {
      flyId: this.id,
      name: this.name,
      condition: this.condition,
      seed: this.seed,
      implantIntensity: this.implantIntensity,
      totalTrials: this.totalTrials,
      totalSuccesses: this.totalSuccesses,
      trialsToCriterion: this.trialsToCriterion
    });
  }

  // Restore full neural state checkpoint
  loadCheckpoint(checkpointData) {
    const res = NeuralCheckpoint.loadCheckpoint(this.engine, checkpointData);
    if (checkpointData.metadata) {
      if (checkpointData.metadata.condition) this.condition = checkpointData.metadata.condition;
      if (checkpointData.metadata.name) this.name = checkpointData.metadata.name;
      if (typeof checkpointData.metadata.totalTrials === 'number') this.totalTrials = checkpointData.metadata.totalTrials;
    }
    return res;
  }

  // Get high-density telemetry summary for dashboard cards
  getTelemetry() {
    const mbStats = this.engine.mb.getSynapticWeightStats();
    const genStats = this.engine.generator.getWeightStats();
    const rollingAcc = this.recentWindow.length > 0
      ? Math.round((this.recentWindow.reduce((a, b) => a + b, 0) / this.recentWindow.length) * 100)
      : 0;

    return {
      id: this.id,
      name: this.name,
      condition: this.condition,
      color: this.color,
      isPaused: this.isPaused,
      totalTrials: this.totalTrials,
      totalSuccesses: this.totalSuccesses,
      currentStreak: this.currentStreak,
      rollingAcc,
      trialsToCriterion: this.trialsToCriterion,
      depressedSynapses: mbStats.depressedSynapsesCount,
      plasticityIndex: mbStats.plasticityIndex,
      activeKCs: this.engine.lastActiveKCCount,
      kcSparsity: this.engine.lastKCSparsity,
      topMBON: this.engine.lastWinningMBON ? this.engine.lastWinningMBON.label : '--',
      weightL2Norm: genStats.weightL2Norm,
      lastPrompt: this.lastPrompt,
      lastTarget: this.lastTarget,
      lastEmittedText: this.lastResponse ? this.lastResponse.text : '--',
      lastIsMatch: this.lastIsMatch,
      lastTimeline: this.lastResponse ? this.lastResponse.timeline : [],
      accuracyHistory: this.accuracyHistory
    };
  }
}
