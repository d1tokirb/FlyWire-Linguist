// ============================================================================
// Language Implant Engine: Biologically Grounded Neural State Imprinting
// ============================================================================
// Creates reproducible, distinct neural starting states across 5 experimental
// conditions for comparative linguistic research in Drosophila connectome-derived circuits:
//
// 1. BLANK: Tabula Rasa control (0 depressed synapses, baseline connectome, random generator)
// 2. VOCABULARY: Pretrained isolated lexical associations grounded in simulated rewards/actions
// 3. GRAMMAR: Pretrained sequence and structural priors (agent -> action -> object)
// 4. COMBINED: Integrated Mini-English foundation (vocabulary + structural patterns)
// 5. SCRAMBLED: Permuted weight control matching L2 norm but with scrambled linguistic structure
//
// STRICT SCIENTIFIC SAFEGUARDS:
// - Knowledge resides strictly in neural synaptic weights (W_ctx, W_rec, W_out, W_fb, W_time, KC->MBON).
// - Zero hardcoded grammar rules or regex templates in JavaScript output pathways.
// - Held-out test sentences (e.g. 'you have sugar') are strictly excluded from all implants.

import { NeuralCheckpoint } from './neuralCheckpoint.js';

export class LanguageImplantEngine {
  // Mini-English Lexicon and Grounded Semantic Entities
  static LEXICON = {
    agents: ['i', 'you'],
    actions: ['want', 'have', 'go'],
    objects: ['sugar', 'water', 'left'],
    allWords: ['i', 'you', 'want', 'have', 'sugar', 'water', 'go', 'left']
  };

  // Structured Mini-English Pretraining Corpus
  static PRETRAINING_CORPUS = [
    { prompt: 'craving sweet', target: 'i want sugar', desc: 'Agent i + action want + object sugar' },
    { prompt: 'hydrate thirst', target: 'you want water', desc: 'Agent you + action want + object water' },
    { prompt: 'possess drink', target: 'i have water', desc: 'Agent i + action have + object water' },
    { prompt: 'locomote port', target: 'i go left', desc: 'Agent i + action go + object left' }
  ];

  // Held-Out Generalization Evaluation Challenges (Never seen during implantation or training)
  static HELDOUT_CHALLENGES = [
    { prompt: 'possess sweet', target: 'you have sugar', desc: 'Held-out compositional combination (you + have + sugar)' },
    { prompt: 'locomote partner', target: 'you go left', desc: 'Held-out compositional combination (you + go + left)' }
  ];

  // Map intensity string to pretraining exposure trials
  static getTrialCountForIntensity(intensity) {
    switch ((intensity || '').toUpperCase()) {
      case 'LIGHT': return 60;
      case 'HEAVY': return 250;
      case 'MEDIUM':
      default:
        return 140;
    }
  }

  // Apply specified implant condition directly to an engine instance
  static applyImplant(engine, condition = 'BLANK', options = {}) {
    const intensity = options.intensity || 'MEDIUM';
    const seed = options.seed || 42;
    const trialsPerItem = LanguageImplantEngine.getTrialCountForIntensity(intensity);

    // Reset to pure Tabula Rasa baseline before establishing condition
    engine.resetToTabulaRasa();

    const conditionUpper = (condition || 'BLANK').toUpperCase();

    switch (conditionUpper) {
      case 'BLANK':
        return LanguageImplantEngine.applyBlankCondition(engine, seed);

      case 'VOCABULARY':
        return LanguageImplantEngine.applyVocabularyImplant(engine, trialsPerItem, seed);

      case 'GRAMMAR':
        return LanguageImplantEngine.applyGrammarImplant(engine, trialsPerItem, seed);

      case 'COMBINED':
        return LanguageImplantEngine.applyCombinedImplant(engine, trialsPerItem, seed);

      case 'SCRAMBLED':
        return LanguageImplantEngine.applyScrambledControl(engine, trialsPerItem, seed);

      default:
        console.warn(`[LanguageImplantEngine] Unknown condition '${condition}', falling back to BLANK.`);
        return LanguageImplantEngine.applyBlankCondition(engine, seed);
    }
  }

  // 1. BLANK: Tabula Rasa Baseline
  static applyBlankCondition(engine, seed) {
    engine.resetToTabulaRasa();
    return {
      condition: 'BLANK',
      description: 'Tabula Rasa: Zero implanted knowledge. FlyWire empirical baseline weights.',
      synapticModifications: 0,
      trialsExposed: 0
    };
  }

  // 2. VOCABULARY IMPLANT: Isolated Grounded Word Associations
  // Trains associations for individual words without sentence-level structure
  static applyVocabularyImplant(engine, trialsPerWord, seed) {
    const vocabPairs = [
      { prompt: 'sugar', target: 'sugar', rewardMb: 1.0 },
      { prompt: 'water', target: 'water', rewardMb: 0.8 },
      { prompt: 'left', target: 'left', rewardMb: 0.9 },
      { prompt: 'go', target: 'go', rewardMb: 0.9 },
      { prompt: 'want', target: 'want', rewardMb: 0.6 },
      { prompt: 'have', target: 'have', rewardMb: 0.6 },
      { prompt: 'i', target: 'i', rewardMb: 0.5 },
      { prompt: 'you', target: 'you', rewardMb: 0.5 }
    ];

    let totalTrials = 0;
    const lrBackup = engine.generator.learningRate;
    engine.generator.learningRate = 0.08;

    for (const item of vocabPairs) {
      for (let t = 0; t < trialsPerWord; t++) {
        totalTrials++;
        const temp = Math.max(0.12, 0.75 - (t / (trialsPerWord * 0.8)) * 0.60);
        engine.generateResponse(item.prompt, { temperature: temp, maxLen: item.target.length + 2 });
        engine.rewardSequence(item.target);
      }
    }

    engine.generator.learningRate = lrBackup;
    const mbStats = engine.mb.getSynapticWeightStats();

    return {
      condition: 'VOCABULARY',
      description: 'Lexical Implant: Pretrained associations for 8 grounded words. Zero syntactic sentence structure.',
      synapticModifications: mbStats.depressedSynapsesCount,
      trialsExposed: totalTrials,
      implantedWords: vocabPairs.map(v => v.target)
    };
  }

  // 3. GRAMMAR IMPLANT: Pretrained Structural Priors Without Lexical Semantics
  // Trains recurrent sequence working memory on agent -> action -> object slot transition
  // dynamics using abstract structural patterns, leaving Mushroom Body context ungrounded.
  static applyGrammarImplant(engine, trialsPerPattern, seed) {
    // Abstract token frames representing agent -> action -> object transition timing
    const structuralFrames = [
      { prompt: 'frame alpha', target: 'x vy wq' },
      { prompt: 'frame beta', target: 'z kl mr' },
      { prompt: 'frame gamma', target: 'u ab cd' },
      { prompt: 'frame delta', target: 'v ef gh' }
    ];

    let totalTrials = 0;
    const lrBackup = engine.generator.learningRate;
    engine.generator.learningRate = 0.08;

    for (const item of structuralFrames) {
      for (let t = 0; t < trialsPerPattern; t++) {
        totalTrials++;
        const temp = Math.max(0.12, 0.75 - (t / (trialsPerPattern * 0.8)) * 0.60);
        engine.generateResponse(item.prompt, { temperature: temp, maxLen: item.target.length + 2 });
        engine.rewardSequence(item.target);
      }
    }

    // Reset Mushroom Body connectome weights to pure empirical baseline W0
    // so that NO specific lexical MBON depression is retained, preserving grammar strictly
    // in the recurrent working memory layer (W_rec, W_time, W_fb).
    engine.mb.resetWeights();
    engine.generator.learningRate = lrBackup;

    return {
      condition: 'GRAMMAR',
      description: 'Syntactic Prior Implant: Pretrained agent-action-object transition timing in working memory. Connectome ungrounded.',
      synapticModifications: 0, // Mushroom Body connectome clean
      trialsExposed: totalTrials,
      implantedStructures: ['agent -> action -> object sequential transition priors']
    };
  }

  // 4. COMBINED IMPLANT: Integrated Lexical Semantics + Sentence Structure
  // Pretrained on the 4 canonical Mini-English training sentences, EXCLUDING held-out sentences
  static applyCombinedImplant(engine, trialsPerSentence, seed) {
    const corpus = LanguageImplantEngine.PRETRAINING_CORPUS;
    let totalTrials = 0;
    const lrBackup = engine.generator.learningRate;
    engine.generator.learningRate = 0.08;

    for (const item of corpus) {
      for (let t = 0; t < trialsPerSentence; t++) {
        totalTrials++;
        const temp = Math.max(0.12, 0.75 - (t / (trialsPerSentence * 0.8)) * 0.60);
        engine.generateResponse(item.prompt, { temperature: temp, maxLen: item.target.length + 2 });
        engine.rewardSequence(item.target);
      }
    }

    engine.generator.learningRate = lrBackup;
    const mbStats = engine.mb.getSynapticWeightStats();

    return {
      condition: 'COMBINED',
      description: 'Mini-English Foundation: Grounded vocabulary integrated with agent-action-object structural priors.',
      synapticModifications: mbStats.depressedSynapsesCount,
      trialsExposed: totalTrials,
      implantedSentences: corpus.map(c => c.target)
    };
  }

  // 5. SCRAMBLED IMPLANT: Matched L2 Norm Weight Control with Disrupted Syntax
  // First trains the Combined implant, then randomly permutes the sequence generator weights
  // and connectome depressions to match weight magnitude without coherent linguistic structure.
  static applyScrambledControl(engine, trialsPerSentence, seed) {
    // 1. Train combined foundation
    LanguageImplantEngine.applyCombinedImplant(engine, trialsPerSentence, seed);

    // 2. Permute / scramble sequence generator weights using seed-based shuffle
    let rngSeed = seed + 7777;
    const rng = () => { rngSeed = (rngSeed * 1664525 + 1013904223) >>> 0; return rngSeed / 4294967296; };

    const shuffleFloat32Array = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
    };

    const gen = engine.generator;
    shuffleFloat32Array(gen.W_ctx);
    shuffleFloat32Array(gen.W_rec);
    shuffleFloat32Array(gen.W_fb);
    shuffleFloat32Array(gen.W_time);
    shuffleFloat32Array(gen.W_out);
    shuffleFloat32Array(gen.b_h);
    shuffleFloat32Array(gen.b_out);

    // Also permute KC->MBON synaptic weight deviations from baseline
    const mb = engine.mb;
    const deviations = new Float32Array(mb.kcToMbonWeights.length);
    for (let i = 0; i < mb.kcToMbonWeights.length; i++) {
      deviations[i] = mb.kcToMbonWeights[i] - mb.kcToMbonBaselineWeights[i];
    }
    shuffleFloat32Array(deviations);
    for (let i = 0; i < mb.kcToMbonWeights.length; i++) {
      mb.kcToMbonWeights[i] = Math.max(0.1, mb.kcToMbonBaselineWeights[i] + deviations[i]);
    }

    const mbStats = mb.getSynapticWeightStats();

    return {
      condition: 'SCRAMBLED',
      description: 'Permuted Weight Control: Matches Combined implant weight magnitude and entropy, but with scrambled linguistic structure.',
      synapticModifications: mbStats.depressedSynapsesCount,
      trialsExposed: trialsPerSentence * LanguageImplantEngine.PRETRAINING_CORPUS.length
    };
  }

  // Create a standalone neural checkpoint for a given implant condition
  static createImplantCheckpoint(engineFactory, condition, options = {}) {
    const tempEngine = engineFactory();
    LanguageImplantEngine.applyImplant(tempEngine, condition, options);
    return NeuralCheckpoint.createCheckpoint(tempEngine, {
      condition,
      implantIntensity: options.intensity || 'MEDIUM',
      notes: `Pre-generated ${condition} implant checkpoint`
    });
  }
}
