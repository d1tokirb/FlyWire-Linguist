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
// - Interleaved exposure across all trials to eliminate recency bias and catastrophic forgetting.
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

  // Structured Mini-English Pretraining Corpus (Explicit, Unambiguous Mappings)
  static PRETRAINING_CORPUS = [
    { prompt: 'self crave sweet', target: 'i want sugar', desc: 'Agent self (i) + action crave (want) + object sweet (sugar)' },
    { prompt: 'other crave drink', target: 'you want water', desc: 'Agent other (you) + action crave (want) + object drink (water)' },
    { prompt: 'self possess drink', target: 'i have water', desc: 'Agent self (i) + action possess (have) + object drink (water)' },
    { prompt: 'self steer port', target: 'i go left', desc: 'Agent self (i) + action steer (go) + object port (left)' }
  ];

  // Held-Out Generalization Evaluation Challenges (Never seen during implantation or training)
  static HELDOUT_CHALLENGES = [
    { prompt: 'other possess sweet', target: 'you have sugar', desc: 'Unseen compositional combination (other [you] + possess [have] + sweet [sugar])' },
    { prompt: 'other steer port', target: 'you go left', desc: 'Unseen compositional combination (other [you] + steer [go] + port [left])' }
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
    const opts = typeof options === 'string' ? { intensity: options } : (options || {});
    const intensity = opts.intensity || 'MEDIUM';
    const seed = typeof opts.seed === 'number' ? opts.seed : 42;
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
  // Fully interleaved across all vocabulary items to prevent recency bias
  static applyVocabularyImplant(engine, trialsPerWord, seed) {
    const vocabPairs = [
      { prompt: 'self', target: 'i' },
      { prompt: 'other', target: 'you' },
      { prompt: 'crave', target: 'want' },
      { prompt: 'possess', target: 'have' },
      { prompt: 'steer', target: 'go' },
      { prompt: 'sweet', target: 'sugar' },
      { prompt: 'drink', target: 'water' },
      { prompt: 'port', target: 'left' }
    ];

    const totalTrials = trialsPerWord * vocabPairs.length;
    const lrBackup = engine.generator.learningRate;
    engine.generator.learningRate = 0.08;

    // Interleaved presentation across all vocabulary items
    for (let t = 0; t < totalTrials; t++) {
      const item = vocabPairs[t % vocabPairs.length];
      const progress = t / totalTrials;
      const temp = Math.max(0.10, 0.75 - progress * 0.65);
      engine.generateResponse(item.prompt, { temperature: temp, maxLen: item.target.length + 2 });
      engine.rewardSequence(item.target);
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
  // Trains recurrent sequence working memory on agent -> action and action -> object slot transition
  // dynamics using syntactic transition pairs, leaving Mushroom Body connectome ungrounded.
  static applyGrammarImplant(engine, trialsPerPattern, seed, preserveConnectome = false) {
    // Syntactic transition frames representing agent -> action and action -> object transitions
    const structuralFrames = [
      { prompt: 'agent action', target: 'i want' },
      { prompt: 'agent action', target: 'you want' },
      { prompt: 'agent action', target: 'i have' },
      { prompt: 'agent action', target: 'i go' },
      { prompt: 'action object', target: 'want sugar' },
      { prompt: 'action object', target: 'want water' },
      { prompt: 'action object', target: 'have water' },
      { prompt: 'action object', target: 'go left' }
    ];

    const totalTrials = trialsPerPattern * structuralFrames.length;
    const lrBackup = engine.generator.learningRate;
    engine.generator.learningRate = 0.08;

    // Interleaved training across structural frames
    for (let t = 0; t < totalTrials; t++) {
      const item = structuralFrames[t % structuralFrames.length];
      const progress = t / totalTrials;
      const temp = Math.max(0.10, 0.75 - progress * 0.65);
      engine.generateResponse(item.prompt, { temperature: temp, maxLen: item.target.length + 2 });
      engine.rewardSequence(item.target);
    }

    if (!preserveConnectome) {
      // Reset Mushroom Body connectome weights to pure empirical baseline W0
      // so that NO specific lexical MBON depression is retained, preserving grammar strictly
      // in the recurrent working memory layer (W_rec, W_time, W_fb).
      engine.mb.resetWeights();
    }
    engine.generator.learningRate = lrBackup;

    return {
      condition: 'GRAMMAR',
      description: 'Syntactic Prior Implant: Pretrained agent-action-object transition timing in working memory. Connectome ungrounded.',
      synapticModifications: preserveConnectome ? engine.mb.getSynapticWeightStats().depressedSynapsesCount : 0,
      trialsExposed: totalTrials,
      implantedStructures: ['agent -> action -> object sequential transition priors']
    };
  }

  // 4. COMBINED IMPLANT: Integrated Lexical Semantics + Sentence Structure
  // Scientifically constructed by combining the Vocabulary implant and the Grammar implant!
  // Pretrained on the canonical Mini-English training sentences using strictly interleaved exposure.
  static applyCombinedImplant(engine, trialsPerSentence, seed) {
    const halfTrials = Math.max(20, Math.floor(trialsPerSentence * 0.4));

    // 1. Apply vocabulary grounding
    LanguageImplantEngine.applyVocabularyImplant(engine, halfTrials, seed);

    // 2. Apply grammar transition prior (preserving the grounded connectome)
    LanguageImplantEngine.applyGrammarImplant(engine, halfTrials, seed, true);

    // 3. Interleaved training on Mini-English sentences
    const corpus = LanguageImplantEngine.PRETRAINING_CORPUS;
    const totalTrials = trialsPerSentence * corpus.length;
    const lrBackup = engine.generator.learningRate;
    engine.generator.learningRate = 0.08;

    for (let t = 0; t < totalTrials; t++) {
      const item = corpus[t % corpus.length];
      const progress = t / totalTrials;
      const temp = Math.max(0.10, 0.75 - progress * 0.65);
      engine.generateResponse(item.prompt, { temperature: temp, maxLen: item.target.length + 2 });
      engine.rewardSequence(item.target);
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

  // 5. SCRAMBLED IMPLANT: Exact Frobenius-Norm Preserved Weight Control
  // First trains the Combined implant, then performs a pure in-place Fisher-Yates permutation
  // within each weight matrix. This rigorously guarantees that the Frobenius L2 norm, mean,
  // and variance are preserved exactly, without clipping distortions.
  static applyScrambledControl(engine, trialsPerSentence, seed) {
    // 1. Train combined foundation
    LanguageImplantEngine.applyCombinedImplant(engine, trialsPerSentence, seed);

    // 2. Deterministic PRNG for exact permutation
    let rngSeed = (seed + 7777) >>> 0;
    const rng = () => {
      rngSeed = (rngSeed * 1664525 + 1013904223) >>> 0;
      return rngSeed / 4294967296;
    };

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

    // Permute KC->MBON synaptic weight array directly without clipping
    const mb = engine.mb;
    shuffleFloat32Array(mb.kcToMbonWeights);

    const mbStats = mb.getSynapticWeightStats();

    return {
      condition: 'SCRAMBLED',
      description: 'Permuted Weight Control: Exactly preserves Combined implant Frobenius L2 norm, mean, and variance, but with scrambled linguistic structure.',
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
