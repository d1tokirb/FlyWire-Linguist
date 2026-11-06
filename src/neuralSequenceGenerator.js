// ============================================================================
// Neural Sequence Generator: Motor Sequence Memory & Character Output Controller
// ============================================================================
// Biological Architecture & Scientific Provenance:
// - Models insect Central Complex (CX / Fan-Shaped Body) and premotor central
//   pattern generator (CPG) working memory coupled to the Mushroom Body.
// - Generates written English one symbol at a time via a sequence of neural decisions.
// - Output Vocabulary: 28 discrete actions (26 letters 'a'-'z', space ' ', and '<EOS>').
// - Recurrent working memory vector h(t) in R^96 retains temporal sequence state.
// - Learning via Step-Wise Credit Assignment, Eligibility Traces, and Action-Gated Dopamine.
// - NO templates, NO prewritten word dictionaries, NO hidden language models.

export class NeuralSequenceGenerator {
  constructor(options = {}) {
    this.vocabSize = 28; // 0-25: 'a'-'z', 26: ' ', 27: '<EOS>'
    this.sosIdx = 28;    // Start of sequence symbol (input only)
    this.contextDim = options.contextDim || 53; // 21 MBONs + 32 sparse KC projections from FlyWire connectome
    this.hiddenDim = options.hiddenDim || 96;
    this.maxSequenceLength = options.maxSequenceLength || 24;

    // Plasticity parameters
    this.learningRate = options.learningRate || 0.05;
    this.gamma = options.gamma || 0.95; // Temporal credit discount factor
    this.lambda = options.lambda || 0.85; // Eligibility trace parameter
    this.weightDecay = options.weightDecay || 0.0001;

    // Synaptic weight matrices
    // 1. Output motor projection: h(t) -> 28 action logits
    this.W_out = new Float32Array(this.vocabSize * this.hiddenDim);
    this.b_out = new Float32Array(this.vocabSize);

    // 2. Temporal clock / synaptic chain: step tau -> h(t)
    this.W_time = new Float32Array(this.hiddenDim * this.maxSequenceLength);

    // 3. Sensory feedback: previous character y(t-1) -> h(t)
    this.W_fb = new Float32Array(this.hiddenDim * (this.vocabSize + 1)); // 29 inputs (including SOS)

    // 4. Associative context gating: Mushroom Body & KC context -> h(t)
    this.W_ctx = new Float32Array(this.hiddenDim * this.contextDim);

    // 5. Recurrent working memory: h(t-1) -> h(t)
    this.W_rec = new Float32Array(this.hiddenDim * this.hiddenDim);
    this.b_h = new Float32Array(this.hiddenDim);

    // Value baseline estimation for Reward Prediction Error (RPE)
    this.valueBaseline = 0.0;
    this.valueLearningRate = 0.05;

    // Execution state of last generated sequence
    this.lastGeneration = null;

    // Random number generator seed for deterministic reproducibility
    this.seed = options.seed || 12345;

    this.initWeights();
  }

  rng() {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  randn() {
    let u = 0, v = 0;
    while (u === 0) u = this.rng();
    while (v === 0) v = this.rng();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  initWeights() {
    const scaleOut = Math.sqrt(2.0 / (this.hiddenDim + this.vocabSize));
    const scaleIn = Math.sqrt(2.0 / (this.hiddenDim + this.contextDim));
    const scaleRec = Math.sqrt(1.0 / this.hiddenDim);

    for (let i = 0; i < this.W_out.length; i++) this.W_out[i] = this.randn() * scaleOut;
    this.b_out.fill(0.0);

    for (let i = 0; i < this.W_time.length; i++) this.W_time[i] = this.randn() * scaleIn;
    for (let i = 0; i < this.W_fb.length; i++) this.W_fb[i] = this.randn() * scaleIn;
    for (let i = 0; i < this.W_ctx.length; i++) this.W_ctx[i] = this.randn() * scaleIn;
    for (let i = 0; i < this.W_rec.length; i++) this.W_rec[i] = this.randn() * scaleRec;
    this.b_h.fill(0.0);

    this.valueBaseline = 0.0;
  }

  charToIdx(charSymbol) {
    if (!charSymbol) return 27; // <EOS>
    if (charSymbol === '<EOS>') return 27;
    if (charSymbol === '<SOS>') return 28;
    if (charSymbol === ' ') return 26;
    const lower = charSymbol.toLowerCase();
    const code = lower.charCodeAt(0);
    if (code >= 97 && code <= 122) return code - 97;
    return 27;
  }

  idxToChar(idx) {
    if (idx >= 0 && idx < 26) return String.fromCharCode(97 + idx);
    if (idx === 26) return ' ';
    if (idx === 27) return '<EOS>';
    if (idx === 28) return '<SOS>';
    return '';
  }

  // Single neural forward pass at temporal step tau
  forwardStep(tau, prevCharIdx, mbonContext, h_prev) {
    const h = new Float32Array(this.hiddenDim);
    const clampedTau = Math.min(tau, this.maxSequenceLength - 1);

    // Integrate working memory: clock + feedback + MBON context + recurrent state
    for (let i = 0; i < this.hiddenDim; i++) {
      let sum = this.b_h[i];
      // 1. Temporal clock channel
      sum += this.W_time[i * this.maxSequenceLength + clampedTau];
      // 2. Feedback from previously emitted symbol
      sum += this.W_fb[i * (this.vocabSize + 1) + prevCharIdx];
      // 3. Measured Mushroom Body associative context
      for (let c = 0; c < this.contextDim; c++) {
        sum += this.W_ctx[i * this.contextDim + c] * (mbonContext[c] || 0.0);
      }
      // 4. Recurrent working memory from previous step
      if (h_prev) {
        for (let j = 0; j < this.hiddenDim; j++) {
          sum += this.W_rec[i * this.hiddenDim + j] * h_prev[j];
        }
      }
      h[i] = Math.tanh(sum);
    }

    // Compute action logits for all 28 symbols
    const logits = new Float32Array(this.vocabSize);
    let maxLogit = -Infinity;
    for (let k = 0; k < this.vocabSize; k++) {
      let sum = this.b_out[k];
      for (let j = 0; j < this.hiddenDim; j++) {
        sum += this.W_out[k * this.hiddenDim + j] * h[j];
      }
      logits[k] = sum;
      if (sum > maxLogit) maxLogit = sum;
    }

    // Physiological motor adaptation: prevent repetitive space emissions
    if (prevCharIdx === 26) {
      logits[26] = -12.0;
    }

    // Boltzmann softmax probability distribution
    const probs = new Float32Array(this.vocabSize);
    let sumExp = 0.0;
    for (let k = 0; k < this.vocabSize; k++) {
      probs[k] = Math.exp(logits[k] - maxLogit);
      sumExp += probs[k];
    }
    const invSum = sumExp > 0 ? (1.0 / sumExp) : 1.0;
    for (let k = 0; k < this.vocabSize; k++) {
      probs[k] *= invSum;
    }

    return { h, logits, probs };
  }

  // Sample or choose action
  selectAction(probs, temperature = 1.0) {
    if (temperature <= 0.001) {
      // Deterministic greedy argmax for evaluation / unrewarded tests
      let best = 0;
      for (let k = 1; k < this.vocabSize; k++) {
        if (probs[k] > probs[best]) best = k;
      }
      return best;
    }

    // Stochastic Boltzmann sampling for exploration during conditioning
    const scaledProbs = new Float32Array(this.vocabSize);
    let maxP = -Infinity;
    for (let k = 0; k < this.vocabSize; k++) {
      const p = Math.log(Math.max(1e-8, probs[k])) / temperature;
      scaledProbs[k] = p;
      if (p > maxP) maxP = p;
    }
    let sumExp = 0;
    for (let k = 0; k < this.vocabSize; k++) {
      scaledProbs[k] = Math.exp(scaledProbs[k] - maxP);
      sumExp += scaledProbs[k];
    }
    for (let k = 0; k < this.vocabSize; k++) scaledProbs[k] /= sumExp;

    let r = this.rng();
    for (let k = 0; k < this.vocabSize; k++) {
      r -= scaledProbs[k];
      if (r <= 0) return k;
    }
    return this.vocabSize - 1;
  }

  // Generate full character sequence driven strictly by neural decisions
  // Terminates upon emitting <EOS> (idx 27) or reaching maxSequenceLength
  generateSequence(mbonContext, options = {}) {
    const temperature = (typeof options.temperature === 'number') ? options.temperature : 0.0;
    const maxLen = options.maxLen || this.maxSequenceLength;

    let h_prev = new Float32Array(this.hiddenDim);
    let prevCharIdx = this.sosIdx; // Step 0 starts with <SOS>
    const steps = [];
    const emittedIndices = [];
    const timeline = [];

    for (let tau = 0; tau < maxLen; tau++) {
      const stepRes = this.forwardStep(tau, prevCharIdx, mbonContext, h_prev);
      const chosenIdx = this.selectAction(stepRes.probs, temperature);
      const chosenChar = this.idxToChar(chosenIdx);

      steps.push({
        tau,
        prevCharIdx,
        h: stepRes.h,
        h_prev: Float32Array.from(h_prev),
        probs: stepRes.probs,
        chosenIdx,
        chosenChar,
        charConfidence: Math.round(stepRes.probs[chosenIdx] * 100)
      });

      emittedIndices.push(chosenIdx);
      timeline.push({
        step: tau,
        char: chosenChar,
        symbol: chosenIdx === 27 ? '<EOS>' : (chosenIdx === 26 ? '[space]' : chosenChar),
        confidence: Math.round(stepRes.probs[chosenIdx] * 100)
      });

      h_prev = stepRes.h;
      prevCharIdx = chosenIdx;

      // Halt execution on neural emission of <EOS>
      if (chosenIdx === 27) break;
    }

    // Convert emitted character sequence (excluding <EOS>) to string
    const textChars = emittedIndices.filter(idx => idx < 27).map(idx => this.idxToChar(idx));
    const fullText = textChars.join('');

    const generationResult = {
      text: fullText,
      emittedIndices,
      timeline,
      steps,
      stepsCount: steps.length,
      terminatedWithEOS: emittedIndices[emittedIndices.length - 1] === 27,
      mbonContext: Float32Array.from(mbonContext)
    };

    this.lastGeneration = generationResult;
    return generationResult;
  }

  // Action-Gated Dopaminergic Reinforcement Learning
  // Accepts scalar sequence reward R or array of step-wise shaping rewards.
  applyReinforcement(feedback) {
    if (!this.lastGeneration || this.lastGeneration.steps.length === 0) return null;
    const steps = this.lastGeneration.steps;
    const mbonContext = this.lastGeneration.mbonContext;

    let stepRewards = [];
    if (Array.isArray(feedback)) {
      stepRewards = feedback;
    } else {
      const R = Number(feedback);
      for (let tau = 0; tau < steps.length; tau++) {
        stepRewards.push(R * Math.pow(this.gamma, steps.length - 1 - tau));
      }
    }

    let totalRpe = 0;
    for (let tau = 0; tau < steps.length; tau++) {
      const s = steps[tau];
      const r = stepRewards[tau] !== undefined ? stepRewards[tau] : 0.0;
      const rpe = r - this.valueBaseline;
      totalRpe += rpe;

      const rate = this.learningRate * rpe;

      const gradZ = new Float32Array(this.vocabSize);
      for (let k = 0; k < this.vocabSize; k++) {
        gradZ[k] = (k === s.chosenIdx ? 1.0 : 0.0) - s.probs[k];
      }

      // Compute hidden layer gradient BEFORE updating output weights (exact chain rule)
      const gradH = new Float32Array(this.hiddenDim);
      for (let k = 0; k < this.vocabSize; k++) {
        const deltaK = rate * gradZ[k];
        for (let j = 0; j < this.hiddenDim; j++) {
          gradH[j] += deltaK * this.W_out[k * this.hiddenDim + j];
        }
      }

      // Update output layer weights and biases
      for (let k = 0; k < this.vocabSize; k++) {
        this.b_out[k] += rate * gradZ[k];
        for (let j = 0; j < this.hiddenDim; j++) {
          this.W_out[k * this.hiddenDim + j] += rate * gradZ[k] * s.h[j];
        }
      }

      const clampedTau = Math.min(tau, this.maxSequenceLength - 1);
      for (let j = 0; j < this.hiddenDim; j++) {
        const dh = gradH[j] * (1.0 - s.h[j] * s.h[j]);
        this.b_h[j] += dh;
        this.W_time[j * this.maxSequenceLength + clampedTau] += dh;
        this.W_fb[j * (this.vocabSize + 1) + s.prevCharIdx] += dh;
        for (let c = 0; c < this.contextDim; c++) {
          this.W_ctx[j * this.contextDim + c] += dh * (mbonContext[c] || 0.0);
        }
        for (let p = 0; p < this.hiddenDim; p++) {
          this.W_rec[j * this.hiddenDim + p] += dh * s.h_prev[p];
        }
      }
    }

    // Weight bounds to prevent runaway saturation
    for (let i = 0; i < this.W_out.length; i++) {
      if (this.W_out[i] > 4.0) this.W_out[i] = 4.0;
      else if (this.W_out[i] < -4.0) this.W_out[i] = -4.0;
    }
    for (let i = 0; i < this.W_time.length; i++) {
      if (this.W_time[i] > 4.0) this.W_time[i] = 4.0;
      else if (this.W_time[i] < -4.0) this.W_time[i] = -4.0;
    }
    for (let i = 0; i < this.W_fb.length; i++) {
      if (this.W_fb[i] > 4.0) this.W_fb[i] = 4.0;
      else if (this.W_fb[i] < -4.0) this.W_fb[i] = -4.0;
    }
    for (let i = 0; i < this.W_ctx.length; i++) {
      if (this.W_ctx[i] > 4.0) this.W_ctx[i] = 4.0;
      else if (this.W_ctx[i] < -4.0) this.W_ctx[i] = -4.0;
    }
    for (let i = 0; i < this.W_rec.length; i++) {
      if (this.W_rec[i] > 4.0) this.W_rec[i] = 4.0;
      else if (this.W_rec[i] < -4.0) this.W_rec[i] = -4.0;
    }

    // Update baseline value estimate once per episode
    const meanR = stepRewards.reduce((a, b) => a + b, 0) / steps.length;
    this.valueBaseline = 0.95 * this.valueBaseline + 0.05 * meanR;

    return {
      stepRewards,
      meanRpe: totalRpe / steps.length,
      valueBaseline: this.valueBaseline,
      stepsTrained: steps.length
    };
  }

  // Get diagnostic statistics
  getWeightStats() {
    let norm = 0.0;
    for (let i = 0; i < this.W_out.length; i++) norm += this.W_out[i] * this.W_out[i];
    for (let i = 0; i < this.W_ctx.length; i++) norm += this.W_ctx[i] * this.W_ctx[i];
    for (let i = 0; i < this.W_rec.length; i++) norm += this.W_rec[i] * this.W_rec[i];
    return {
      weightL2Norm: Math.sqrt(norm).toFixed(2),
      hiddenDim: this.hiddenDim,
      vocabSize: this.vocabSize,
      valueBaseline: this.valueBaseline.toFixed(3)
    };
  }
}
