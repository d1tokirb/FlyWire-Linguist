// ============================================================================
// Sequential Language Engine: Integrated Neural Written Language Acquisition
// ============================================================================
// Integrates three authentic neurocomputational subsystems:
// 1. SequentialSensoryStream: Streams orthographic/phonemic characters into 209 PNs.
// 2. MushroomBodyConnectome: 2,597 KCs with APL feedback inhibition and 21 MBONs.
// 3. NeuralSequenceGenerator: Recurrent motor sequence generator emitting symbols.
//
// Scientific Provenance:
// - Generates written outputs symbol-by-symbol without templates or dictionaries.
// - Connectome connectivity is 100% empirical FlyWire FAFB v783.
// - Sequence generation is mediated by biologically inspired Central Complex working memory.

import { MushroomBodyConnectome } from './mushroomBodyConnectome.js';
import { SequentialSensoryStream } from './sequentialSensoryStream.js';
import { NeuralSequenceGenerator } from './neuralSequenceGenerator.js';

export class SequentialLanguageEngine {
  constructor(options = {}) {
    this.mode = options.mode || 'SEQUENTIAL'; // 'SEQUENTIAL' or 'DISCRETE_MBON'

    // 1. Synthetic character sensory transducer
    this.stream = new SequentialSensoryStream(209);

    // 2. Empirical Drosophila Mushroom Body Connectome (FAFB v783)
    this.mb = new MushroomBodyConnectome({
      useSyntheticBilateralBridge: false, // Pure empirical FlyWire edges
      seed: options.seed || 42
    });

    // 3. Deterministic sparse projection from 2,597 KCs to 32 downstream context channels
    this.kcContextDim = 32;
    this.contextDim = 21 + this.kcContextDim; // 53 total context channels (21 MBONs + 32 KC projections)
    this.W_kc_to_ctx = new Float32Array(this.kcContextDim * 2597);
    this.initKCContextProjection();

    // 4. Neural motor sequence generator (working memory + character emissions)
    this.generator = new NeuralSequenceGenerator({
      contextDim: this.contextDim,
      hiddenDim: options.hiddenDim || 96,
      learningRate: options.learningRate || 0.05,
      maxSequenceLength: options.maxSequenceLength || 24,
      seed: options.seed || 12345
    });

    // Dopamine tracking
    this.pamDopamine = 35.0;
    this.ppl1Aversion = 10.0;

    // Dialogue history & learned sequence lexicon
    this.dialogueHistory = [];
    this.lexicon = new Map();
    this.totalWordsHeard = 0;
    this.totalCharactersEmitted = 0;
    this.totalEpisodesRun = 0;

    // Last output telemetry
    this.lastPrompt = '';
    this.lastResponse = null;
    this.lastGeneration = null;
    this.lastActiveKCCount = 0;
    this.lastKCSparsity = 0.0;
    this.lastWinningMBON = null;

    this.onStateChange = null;
  }

  getFluencyStage() {
    const mbStats = this.mb.getSynapticWeightStats();
    const depressedCount = mbStats.depressedSynapsesCount;

    if (depressedCount >= 150) {
      return {
        stage: 3,
        name: 'Stage 3: Multi-Lobe Sequence Integration',
        badge: 'Conditioned Multi-Lobe',
        color: '#30d158',
        description: 'Multi-compartment MBON disinhibition driving written sentence sequences.'
      };
    } else if (depressedCount >= 50) {
      return {
        stage: 2,
        name: 'Stage 2: Sequential Word Conditioning',
        badge: 'Conditioned Sequences',
        color: '#64d2ff',
        description: 'Selective KC->MBON LTD disinhibits structured character sequence generation.'
      };
    } else if (depressedCount >= 8) {
      return {
        stage: 1,
        name: 'Stage 1: Basic Symbol Conditioning',
        badge: 'Initial LTD',
        color: '#ffd60a',
        description: 'Early synaptic LTD conditioning basic character emissions and <EOS> termination.'
      };
    } else {
      return {
        stage: 0,
        name: 'Stage 0: Tabula Rasa',
        badge: 'Tabula Rasa',
        color: '#8e8e93',
        description: 'Unconditioned baseline connectome (0 depressed synapses relative to FAFB v783).'
      };
    }
  }

  getFluencyScore() {
    const mbStats = this.mb.getSynapticWeightStats();
    const depressedSynapses = mbStats.depressedSynapsesCount;
    return Math.min(100, Math.round((depressedSynapses / 180) * 100));
  }

  // Tokenize helper for basic text normalization
  tokenize(text) {
    if (!text) return [];
    return text.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(Boolean);
  }

  initKCContextProjection() {
    let seed = 42;
    const rng = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < this.W_kc_to_ctx.length; i++) {
      this.W_kc_to_ctx[i] = (rng() < 0.05) ? (rng() * 2.0 - 1.0) : 0.0;
    }
  }

  computeFullContext() {
    const fullContext = new Float32Array(this.contextDim);
    // Channels 0..20: 21 MBONs (conditioned associative valence)
    for (let j = 0; j < 21; j++) {
      fullContext[j] = this.mb.mbonActivity[j];
    }
    // Channels 21..52: 32 sparse KC projections (high-dimensional stimulus discrimination)
    for (let j = 0; j < this.kcContextDim; j++) {
      let sum = 0.0;
      for (let i = 0; i < 2597; i++) {
        if (this.mb.kcActivity[i] > 0) {
          sum += this.W_kc_to_ctx[j * 2597 + i] * this.mb.kcActivity[i];
        }
      }
      fullContext[21 + j] = Math.tanh(sum);
    }
    return fullContext;
  }

  // Set mode: 'SEQUENTIAL' (primary writing objective) or 'DISCRETE_MBON' (preserved baseline)
  setMode(mode) {
    this.mode = mode;
    if (this.onStateChange) this.onStateChange();
  }

  // Core Forward Pass & Character-by-Character Generation
  generateResponse(inputText, options = {}) {
    this.totalEpisodesRun++;
    this.lastPrompt = inputText;
    const prompt = (inputText || '').trim();
    const temperature = (typeof options.temperature === 'number') ? options.temperature : 0.0;

    // 1. Transduce text through sequential sensory stream into 209 PNs
    const terminalPNActivity = this.stream.encodeStringToTerminalPN(prompt);
    this.mb.pnActivity.set(terminalPNActivity);

    // 2. Execute authentic Mushroom Body forward pass across 2,597 KCs
    // Passing null preserves the externally clamped pnActivity
    const mbResult = this.mb.forward(null, 0.0);
    this.lastActiveKCCount = mbResult.activeKCCount;
    this.lastKCSparsity = mbResult.sparsityPct;
    this.lastWinningMBON = mbResult.topMBONs ? mbResult.topMBONs[0] : null;

    // 3. Compute 53-dimensional context vector (21 MBONs + 32 KC projections)
    const fullContext = this.computeFullContext();

    // Record user turn
    this.dialogueHistory.push({ role: 'user', text: prompt });
    if (this.dialogueHistory.length > 20) this.dialogueHistory.shift();

    let result = null;

    if (this.mode === 'SEQUENTIAL') {
      // Primary Research Mode: Sequential Neural Writing
      const maxLen = options.maxLen || 20;
      const genResult = this.generator.generateSequence(fullContext, { temperature, maxLen });
      this.lastGeneration = genResult;
      this.totalCharactersEmitted += genResult.emittedIndices.length;

      // Update lexicon tracking for emitted sequences
      if (genResult.text && genResult.text.length > 0) {
        const word = genResult.text.trim();
        const existing = this.lexicon.get(word) || { token: word, count: 0, confidence: 0 };
        existing.count++;
        const conf = genResult.timeline.length > 0
          ? Math.round(genResult.timeline.reduce((s, p) => s + p.confidence, 0) / genResult.timeline.length)
          : 50;
        existing.confidence = conf;
        this.lexicon.set(word, existing);
      }

      result = {
        mode: 'SEQUENTIAL',
        text: genResult.text,
        emittedIndices: genResult.emittedIndices,
        timeline: genResult.timeline,
        stepsCount: genResult.stepsCount,
        terminatedWithEOS: genResult.terminatedWithEOS,
        activeKCCount: mbResult.activeKCCount,
        kcSparsity: mbResult.sparsityPct,
        aplInhibition: mbResult.aplInhibition,
        topMBON: mbResult.winningToken,
        mbonContext: fullContext,
        generatorStats: this.generator.getWeightStats()
      };
    } else {
      // Preserved Baseline Mode: Discrete 21-MBON classification
      const chosenToken = mbResult.winningToken;
      result = {
        mode: 'DISCRETE_MBON',
        text: chosenToken,
        emittedIndices: [],
        timeline: [{ step: 0, char: chosenToken, symbol: chosenToken, confidence: 100 }],
        stepsCount: 1,
        terminatedWithEOS: true,
        activeKCCount: mbResult.activeKCCount,
        kcSparsity: mbResult.sparsityPct,
        aplInhibition: mbResult.aplInhibition,
        topMBON: chosenToken,
        mbonContext: fullContext,
        generatorStats: this.generator.getWeightStats()
      };
    }

    this.lastResponse = result;
    this.dialogueHistory.push({ role: 'fly', text: result.text });
    if (this.dialogueHistory.length > 20) this.dialogueHistory.shift();

    if (this.onStateChange) this.onStateChange();
    return result;
  }

  // Deliver Reinforcement with Intermediate Shaping (No answer injection)
  // Computes scalar step rewards based on character-by-character alignment
  rewardSequence(targetString) {
    if (!this.lastGeneration) return null;
    const targetClean = (targetString || '').toLowerCase().trim();
    const emitted = this.lastGeneration.emittedIndices;
    const stepsCount = this.lastGeneration.steps.length;

    // Convert target string to target indices (letters, spaces, and terminal <EOS>)
    const targetIndices = [];
    for (let i = 0; i < targetClean.length; i++) {
      targetIndices.push(this.generator.charToIdx(targetClean[i]));
    }
    targetIndices.push(27); // Terminal <EOS>

    // Step-wise shaping rewards with sequence-level credit assignment:
    // Matches receive +1.0 PAM dopamine; mismatches receive -0.20 PPL1 aversive shock
    const stepRewards = [];
    let matchCount = 0;

    for (let tau = 0; tau < stepsCount; tau++) {
      if (tau < targetIndices.length && emitted[tau] === targetIndices[tau]) {
        stepRewards.push(1.0);
        matchCount++;
      } else {
        stepRewards.push(-0.20);
      }
    }

    const isExactMatch = (matchCount === targetIndices.length && emitted.length === targetIndices.length);
    if (isExactMatch) {
      // Full sequence completion bonus
      for (let tau = 0; tau < stepRewards.length; tau++) {
        stepRewards[tau] += 0.5;
      }
      this.pamDopamine = Math.min(100, this.pamDopamine + 25.0);
      this.ppl1Aversion = Math.max(0, this.ppl1Aversion - 15.0);
      // Reinforce Mushroom Body context via scalar reward (+1.0)
      this.mb.applyReinforcement(1.0);
    } else {
      this.pamDopamine = Math.max(0, this.pamDopamine - 5.0);
      this.ppl1Aversion = Math.min(100, this.ppl1Aversion + 15.0);
      // Aversive feedback on mushroom body context (-0.5)
      this.mb.applyReinforcement(-0.5);
    }

    // Update sequence generator weights via step-wise reinforcement
    const genReport = this.generator.applyReinforcement(stepRewards);

    if (this.onStateChange) this.onStateChange();

    return {
      isExactMatch,
      matchCount,
      targetLength: targetIndices.length,
      emittedLength: emitted.length,
      genReport
    };
  }

  // Aversive feedback on whole trajectory
  punishSequence(penalty = -0.6) {
    this.ppl1Aversion = Math.min(100, this.ppl1Aversion + 25.0);
    this.pamDopamine = Math.max(0, this.pamDopamine - 10.0);

    const genReport = this.generator.applyReinforcement(penalty);
    this.mb.applyReinforcement(-1.0);

    if (this.onStateChange) this.onStateChange();
    return genReport;
  }

  // Reset all neural weights to Tabula Rasa (Untrained State)
  resetToTabulaRasa() {
    this.stream.reset();
    this.mb.resetWeights(); // Measured FlyWire empirical baseline (0 depressed)
    this.generator.initWeights(); // Untrained Gaussian state
    this.pamDopamine = 35.0;
    this.ppl1Aversion = 10.0;
    this.dialogueHistory = [];
    this.lexicon.clear();
    this.totalWordsHeard = 0;
    this.totalCharactersEmitted = 0;
    this.totalEpisodesRun = 0;
    this.lastResponse = null;
    this.lastGeneration = null;

    if (this.onStateChange) this.onStateChange();
  }

  // Manual dopamine sucrose reward
  rewardSugar(amount = 35.0) {
    this.pamDopamine = Math.min(100, this.pamDopamine + amount);
    this.ppl1Aversion = Math.max(0, this.ppl1Aversion - 10.0);
    this.mb.applyReinforcement(1.0);
    if (this.onStateChange) this.onStateChange();
  }

  // Manual looming aversion shock
  punishAversion(amount = 30.0) {
    this.ppl1Aversion = Math.min(100, this.ppl1Aversion + amount);
    this.pamDopamine = Math.max(0, this.pamDopamine - 10.0);
    this.mb.applyReinforcement(-1.0);
    if (this.onStateChange) this.onStateChange();
  }

  // Export full brain state JSON
  exportBrainJSON() {
    const mbStats = this.mb.getSynapticWeightStats();
    const data = {
      timestamp: new Date().toISOString(),
      architecture: 'FlyWire FAFB v783 Connectome + Central Complex Sequence Generator',
      mode: this.mode,
      fluencyScore: this.getFluencyScore(),
      fluencyStage: this.getFluencyStage(),
      totalCharactersEmitted: this.totalCharactersEmitted,
      totalEpisodesRun: this.totalEpisodesRun,
      dialogueHistory: this.dialogueHistory,
      lexicon: Array.from(this.lexicon.values()),
      generatorStats: this.generator.getWeightStats(),
      mushroomBodyStats: mbStats
    };
    return JSON.stringify(data, null, 2);
  }

  // Spontaneous recovery toward individual empirical baseline W0
  runExtinctionTrial() {
    const stats = this.mb.applyExtinctionDecay(0.02);
    if (this.onStateChange) this.onStateChange();
    return stats;
  }

  // Test generalization between two stimuli via KC cosine similarity
  testGeneralization(str1, str2) {
    const pn1 = this.stream.encodeStringToTerminalPN(str1);
    this.mb.pnActivity.set(pn1);
    this.mb.forward(null, 0.0);
    const kc1 = Float32Array.from(this.mb.kcActivity);

    const pn2 = this.stream.encodeStringToTerminalPN(str2);
    this.mb.pnActivity.set(pn2);
    this.mb.forward(null, 0.0);
    const kc2 = Float32Array.from(this.mb.kcActivity);

    let dot = 0.0, norm1 = 0.0, norm2 = 0.0, overlap = 0;
    for (let i = 0; i < 2597; i++) {
      dot += kc1[i] * kc2[i];
      norm1 += kc1[i] * kc1[i];
      norm2 += kc2[i] * kc2[i];
      if (kc1[i] > 0 && kc2[i] > 0) overlap++;
    }
    const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
    const cosineSimilarity = denom > 0 ? (dot / denom).toFixed(4) : '0.0000';

    return { cosineSimilarity, overlappingKCs: overlap };
  }

  learnFromInput(userText) {
    const prompt = (userText || '').trim();
    if (!prompt) return;
    this.totalWordsHeard += prompt.split(/\s+/).length;
    const terminalPNActivity = this.stream.encodeStringToTerminalPN(prompt);
    this.mb.pnActivity.set(terminalPNActivity);
    this.mb.forward(null, 0.0);
  }
}
