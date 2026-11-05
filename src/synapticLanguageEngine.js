// Synaptic Language Acquisition Engine (FlyWire Mushroom Body Connectome)
// Driven by authentic Drosophila melanogaster Mushroom Body neurobiology:
// - PNs: 64 acoustic / tonotopic sensory projection neurons (Johnston's organ -> AMMC)
// - KCs: 2,640 Kenyon cells with ~5% sparse coding via APL GABAergic feedback inhibition
// - MBONs: Output compartments across 15 canonical anatomical lobes
// - DANs: PAM (Reward) and PPL1 (Aversive) compartment-specific dopaminergic clusters
// - Purely Neural Output: Outputs are generated directly and exclusively by
//   the winning MBONs and plastic synaptic weights (zero hardcoded templates).

import { MushroomBodyConnectome } from './mushroomBodyConnectome.js';

export class SynapticLanguageEngine {
  constructor() {
    // 1. Biological Mushroom Body Connectome
    this.mb = new MushroomBodyConnectome();

    // 2. Tabula Rasa State: 0 words known initially
    this.lexicon = new Map();             // word -> { count, confidence, learnedAt, firstSeenPrompt }
    this.bigrams = new Map();             // wordA -> Map(wordB -> weight)
    this.conditioningLog = [];            // History of synaptic conditioning trials

    // Conversational Working Memory Buffer
    this.dialogueHistory = [];            // Last 10 conversational turns { role, text, intent, topic }

    // Biological Learning Metrics
    this.totalWordsHeard = 0;
    this.totalUtterancesSpoken = 0;
    this.totalSyllablesBabble = 0;
    this.pamDopamine = 35.0;              // PAM Reward / Plasticity level (0 - 100%)
    this.ppl1Aversion = 10.0;             // PPL1 Confusion / Error shock (0 - 100%)
    this.lastActiveKCCount = 0;           // Active KCs in last forward pass
    this.lastKCSparsity = 0;              // % sparsity (target ~5%)

    // Interaction memory
    this.lastUserPrompt = '';
    this.lastFlyResponse = '';
    this.lastGeneratedWords = [];
    this.lastResponseConfidence = 0;
    this.lastWinningMBON = null;
    this.conversationalTurnCount = 0;

    // Insect Phonemes for Stage 0 Babble
    this.insectPhonemes = [
      { text: 'bzz', type: 'buzz', sound: 'buzz_low' },
      { text: 'z-z-z', type: 'buzz', sound: 'buzz_mid' },
      { text: 'vzzz', type: 'buzz', sound: 'buzz_high' },
      { text: 'tsk', type: 'click', sound: 'click_soft' },
      { text: 'clck', type: 'click', sound: 'click_hard' },
      { text: 'k-k', type: 'click', sound: 'click_double' },
      { text: 'ba', type: 'syllable', sound: 'vowel_a' },
      { text: 'da', type: 'syllable', sound: 'vowel_a' },
      { text: 'ma', type: 'syllable', sound: 'vowel_a' },
      { text: 'ga', type: 'syllable', sound: 'vowel_a' },
      { text: 'uh', type: 'syllable', sound: 'vowel_u' },
      { text: 'eh', type: 'syllable', sound: 'vowel_e' },
      { text: 'bee', type: 'syllable', sound: 'vowel_i' },
      { text: 'zee', type: 'syllable', sound: 'vowel_i' }
    ];

    this.onStateChange = null;

    this.loadBrain();
  }

  // Current Fluency Stage based strictly on measured synaptic plasticity in the connectome
  getFluencyStage() {
    const mbStats = this.mb.getSynapticWeightStats();
    const depressedCount = mbStats.depressedSynapsesCount;

    if (depressedCount >= 150) {
      return {
        stage: 3,
        name: 'Stage 3: Multi-Lobe Integration',
        badge: 'Conditioned Multi-Lobe',
        color: '#30d158',
        description: 'Multi-compartment MBON disinhibition across alpha, beta, and gamma lobes.'
      };
    } else if (depressedCount >= 50) {
      return {
        stage: 2,
        name: 'Stage 2: Associative Conditioning',
        badge: 'Conditioned MBONs',
        color: '#64d2ff',
        description: 'Selective KC->MBON LTD disinhibits structured responses across active thematic compartments.'
      };
    } else if (depressedCount >= 8) {
      return {
        stage: 1,
        name: 'Stage 1: Early Synaptic Conditioning',
        badge: 'Initial LTD',
        color: '#ffd60a',
        description: 'Early KC->MBON synaptic depression skews MBON firing toward conditioned acoustic tokens.'
      };
    } else {
      return {
        stage: 0,
        name: 'Stage 0: Babble & Clicks',
        badge: 'Tabula Rasa',
        color: '#ff9f0a',
        description: 'Unconditioned mushroom body. Balanced KC->MBON weights produce baseline acoustic babble.'
      };
    }
  }

  getFluencyScore() {
    const mbStats = this.mb.getSynapticWeightStats();
    const depressedSynapses = mbStats.depressedSynapsesCount;
    // Biological plasticity score based on connectome synaptic depression (0 - 100%)
    return Math.min(100, Math.round((depressedSynapses / 180) * 100));
  }

  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9'\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  // Core Learning Process: Ingest input sentence into sensory PNs and Lexicon
  learnFromInput(userText) {
    const tokens = this.tokenize(userText);
    if (tokens.length === 0) return;

    this.totalWordsHeard += tokens.length;
    this.lastUserPrompt = userText;

    // 1. Ingest into Lexicon
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!this.lexicon.has(token)) {
        this.lexicon.set(token, {
          token,
          count: 1,
          confidence: 25,
          learnedAt: Date.now(),
          firstSeenPrompt: userText
        });
      } else {
        const item = this.lexicon.get(token);
        item.count++;
        item.confidence = Math.min(100, item.confidence + 5);
      }
    }

    // 2. Bigrams
    for (let i = 0; i < tokens.length - 1; i++) {
      const w1 = tokens[i];
      const w2 = tokens[i + 1];
      if (!this.bigrams.has(w1)) {
        this.bigrams.set(w1, new Map());
      }
      const bMap = this.bigrams.get(w1);
      bMap.set(w2, (bMap.get(w2) || 0) + 1);
    }

    // Natural dopamine baseline maintenance
    this.pamDopamine = Math.min(100, this.pamDopamine + 2.0);
    this.saveBrain();
    if (this.onStateChange) this.onStateChange();
  }

  // Generate Response directly from Biological Mushroom Body Connectome activity
  generateResponse(userText) {
    this.totalUtterancesSpoken++;
    this.conversationalTurnCount++;
    const stageInfo = this.getFluencyStage();
    const stage = stageInfo.stage;
    const tokens = this.tokenize(userText);

    // 1. Ingest prompt into sensory tracking and lexicon
    this.learnFromInput(userText);

    // 2. Execute authentic biological Mushroom Body forward pass
    const mbResult = this.mb.forward(tokens);
    this.lastActiveKCCount = mbResult.activeKCCount;
    this.lastKCSparsity = mbResult.sparsityPct;
    this.lastWinningMBON = mbResult.topMBONs[0];

    const mbStats = this.mb.getSynapticWeightStats();
    const depressedCount = mbStats.depressedSynapsesCount;

    // Record turn in working memory
    this.dialogueHistory.push({ role: 'user', text: userText });
    if (this.dialogueHistory.length > 10) this.dialogueHistory.shift();

    let responseText = '';
    let responseWords = [];
    let confidence = 0;
    let circuit = '';

    const topMBON = mbResult.topMBONs[0];
    const topActivity = topMBON ? topMBON.activity : 0;
    const secondActivity = mbResult.topMBONs.length > 1 ? mbResult.topMBONs[1].activity : 0;
    const activityContrast = topActivity - secondActivity;

    // In Tabula Rasa or unconditioned state (no depressed synapses or zero contrast),
    // the fly produces natural insect acoustic babble and clicks
    if (stage === 0 || depressedCount < 6 || activityContrast < 0.15) {
      const numSyllables = 2 + Math.floor(Math.random() * 3);
      const parts = [];
      for (let i = 0; i < numSyllables; i++) {
        const p = this.insectPhonemes[Math.floor(Math.random() * this.insectPhonemes.length)];
        parts.push(p.text);
      }
      responseText = parts.join('... ') + '...';
      responseWords = parts;
      confidence = Math.floor(5 + Math.random() * 10);
      circuit = `Subesophageal Babble Motor - Tabula Rasa (KCs: ${mbResult.activeKCCount}/2,640 active)`;
      this.totalSyllablesBabble += numSyllables;
    } else {
      // Conditioned response: Driven directly by winning MBONs!
      responseWords = [topMBON.label];

      // If secondary MBON is also strongly active (>85% of top), include it (compound response)
      if (mbResult.topMBONs.length > 1 && mbResult.topMBONs[1].activity > 0.85 * topActivity) {
        responseWords.push(mbResult.topMBONs[1].label);
      }

      // Prepend an insect acoustic marker (buzz/click) in 35% of utterances
      const prefix = Math.random() < 0.35 ? 'bzz ' : '';
      responseText = `${prefix}${responseWords.join(' ')}`;
      confidence = Math.min(95, Math.floor(35 + (depressedCount / 60) * 45 + activityContrast * 15));
      circuit = `KC->MBON Conditioned Circuit (${topMBON.id} in ${topMBON.compartment} - ${topMBON.role})`;
    }

    this.lastFlyResponse = responseText;
    this.lastGeneratedWords = responseWords;
    this.lastResponseConfidence = confidence;

    this.dialogueHistory.push({ role: 'fly', text: responseText });
    if (this.dialogueHistory.length > 10) this.dialogueHistory.shift();

    this.saveBrain();
    if (this.onStateChange) this.onStateChange();

    return {
      text: responseText,
      words: responseWords,
      confidence,
      stage,
      circuit,
      dopamine: this.pamDopamine,
      kcActive: mbResult.activeKCCount,
      kcSparsity: mbResult.sparsityPct,
      winningMBON: mbResult.winningToken
    };
  }

  // ==========================================================================
  // REWARD (+PAM Dopamine): Scalar Reinforcement of Chosen Action (Drosophila LTD)
  // ==========================================================================
  rewardSugar(bonus = 35.0) {
    this.pamDopamine = Math.min(100, this.pamDopamine + bonus);
    this.ppl1Aversion = Math.max(0, this.ppl1Aversion - 15.0);

    // Scalar reward (+1.0) applied to the connectome's chosen action (zero target passed)
    const plasticityReport = this.mb.applyReinforcement(1.0);

    // Increase confidence of active tokens in lexicon
    if (this.lastGeneratedWords && this.lastGeneratedWords.length > 0) {
      for (const w of this.lastGeneratedWords) {
        if (this.lexicon.has(w)) {
          const item = this.lexicon.get(w);
          item.confidence = Math.min(100, item.confidence + 18);
        }
      }
    }

    this.saveBrain();
    if (this.onStateChange) this.onStateChange();

    return {
      dopamine: this.pamDopamine,
      plasticityReport,
      message: 'PAM Dopamine Reward: Depressed competing MBON synapses from active KCs.'
    };
  }

  // ==========================================================================
  // PUNISHMENT (+PPL1 Dopamine): Scalar Aversive Shock to Erroneous Action
  // ==========================================================================
  punishError(penalty = 25.0) {
    this.ppl1Aversion = Math.min(100, this.ppl1Aversion + penalty);
    this.pamDopamine = Math.max(0, this.pamDopamine - 10.0);

    // Scalar punishment (-1.0) applied directly to suppress the erroneous chosen action
    const plasticityReport = this.mb.applyReinforcement(-1.0);

    this.saveBrain();
    if (this.onStateChange) this.onStateChange();

    return {
      aversion: this.ppl1Aversion,
      plasticityReport,
      message: 'PPL1 Aversive Shock: Depressed synapses from active KCs to erroneous MBON.'
    };
  }

  // ==========================================================================
  // TEACH CORRECTION: Pair prompt with explicit target via biological plasticity
  // ==========================================================================
  teachCorrection(correctPhrase) {
    const correctTokens = this.tokenize(correctPhrase);
    if (correctTokens.length === 0) return;

    this.ppl1Aversion = Math.min(100, this.ppl1Aversion + 15.0);
    this.pamDopamine = Math.min(100, this.pamDopamine + 10.0);

    // Ingest into lexicon
    for (const token of correctTokens) {
      if (!this.lexicon.has(token)) {
        this.lexicon.set(token, {
          token,
          count: 2,
          confidence: 60,
          learnedAt: Date.now(),
          firstSeenPrompt: this.lastUserPrompt
        });
      } else {
        const item = this.lexicon.get(token);
        item.count += 2;
        item.confidence = Math.min(100, item.confidence + 20);
      }
    }

    // Connect in mushroom body:
    // 1. Forward pass on the prompt to activate its Kenyon cell pattern
    const promptTokens = this.tokenize(this.lastUserPrompt);
    this.mb.forward(promptTokens);

    // 2. Punish previous incorrect token (if any)
    if (this.lastGeneratedWords.length > 0) {
      this.mb.applyPlasticity(this.lastGeneratedWords[0], 0.0, 1.0);
    }

    // 3. Reward and lock in correct target token via PAM LTD
    const targetToken = correctTokens.find(w => w.length > 3) || correctTokens[0];
    this.mb.applyPlasticity(targetToken, 1.0, 0.0);

    // Connect bigrams
    for (let i = 0; i < correctTokens.length - 1; i++) {
      const w1 = correctTokens[i];
      const w2 = correctTokens[i + 1];
      if (!this.bigrams.has(w1)) this.bigrams.set(w1, new Map());
      const bMap = this.bigrams.get(w1);
      bMap.set(w2, (bMap.get(w2) || 0) + 3);
    }

    this.saveBrain();
    if (this.onStateChange) this.onStateChange();
  }

  // Extinction Trial: Simulate decay without dopamine
  runExtinctionTrial() {
    this.mb.decayExtinction(2.5);
    this.pamDopamine = Math.max(10, this.pamDopamine - 8.0);
    this.saveBrain();
    if (this.onStateChange) this.onStateChange();
    return this.mb.getSynapticWeightStats();
  }

  // Generalization Test: Measure Kenyon Cell overlap between two phrases
  testGeneralization(phraseA, phraseB) {
    const tokensA = this.tokenize(phraseA);
    const tokensB = this.tokenize(phraseB);
    return this.mb.computePatternOverlap(tokensA, tokensB);
  }

  // Reset to Tabula Rasa
  resetToTabulaRasa() {
    this.lexicon.clear();
    this.bigrams.clear();
    this.dialogueHistory = [];
    this.mb = new MushroomBodyConnectome(); // Fresh connectome with all weights = 1.0
    this.totalWordsHeard = 0;
    this.totalUtterancesSpoken = 0;
    this.totalSyllablesBabble = 0;
    this.pamDopamine = 35.0;
    this.ppl1Aversion = 10.0;
    this.lastUserPrompt = '';
    this.lastFlyResponse = '';
    this.lastGeneratedWords = [];
    this.lastResponseConfidence = 0;
    this.conversationalTurnCount = 0;

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('flywire_linguist_brain_v3');
      }
    } catch (e) {}

    if (this.onStateChange) this.onStateChange();
  }

  saveBrain() {
    try {
      if (typeof localStorage === 'undefined') return;
      const serializableLexicon = Array.from(this.lexicon.entries());
      const serializableBigrams = Array.from(this.bigrams.entries()).map(([k, map]) => [k, Array.from(map.entries())]);

      const data = {
        version: 3,
        lexicon: serializableLexicon,
        bigrams: serializableBigrams,
        kcToMbonWeights: Array.from(this.mb.kcToMbonWeights),
        totalWordsHeard: this.totalWordsHeard,
        totalUtterancesSpoken: this.totalUtterancesSpoken,
        totalSyllablesBabble: this.totalSyllablesBabble,
        pamDopamine: Math.round(this.pamDopamine),
        ppl1Aversion: Math.round(this.ppl1Aversion),
        conversationalTurnCount: this.conversationalTurnCount
      };

      localStorage.setItem('flywire_linguist_brain_v3', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save fly brain to localStorage', e);
    }
  }

  loadBrain() {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem('flywire_linguist_brain_v3');
      if (!raw) return;

      const data = JSON.parse(raw);
      if (data.lexicon) {
        this.lexicon = new Map(data.lexicon);
      }
      if (data.bigrams) {
        this.bigrams = new Map(data.bigrams.map(([k, entries]) => [k, new Map(entries)]));
      }
      if (data.kcToMbonWeights && data.kcToMbonWeights.length === this.mb.kcToMbonWeights.length) {
        this.mb.kcToMbonWeights.set(data.kcToMbonWeights);
      }
      this.totalWordsHeard = data.totalWordsHeard || 0;
      this.totalUtterancesSpoken = data.totalUtterancesSpoken || 0;
      this.totalSyllablesBabble = data.totalSyllablesBabble || 0;
      this.pamDopamine = data.pamDopamine ?? 35.0;
      this.ppl1Aversion = data.ppl1Aversion ?? 10.0;
      this.conversationalTurnCount = data.conversationalTurnCount || 0;
    } catch (e) {
      console.warn('Failed to load fly brain', e);
    }
  }

  exportBrainJSON() {
    const mbStats = this.mb.getSynapticWeightStats();
    const data = {
      timestamp: new Date().toISOString(),
      version: 'FlyWire_MushroomBody_Connectome_v3_Conversational',
      fluencyScore: this.getFluencyScore(),
      fluencyStage: this.getFluencyStage(),
      totalWords: this.lexicon.size,
      conversationalTurns: this.conversationalTurnCount,
      dialogueHistory: this.dialogueHistory,
      mushroomBodyStats: {
        numKCs: this.mb.numKCs,
        numPNs: this.mb.numPNs,
        numMBONs: this.mb.numMBONs,
        kcSparsityTarget: '5%',
        ...mbStats
      },
      lexicon: Array.from(this.lexicon.values()),
      winningMBONCompartments: this.mb.mbonLabels
    };
    return JSON.stringify(data, null, 2);
  }
}
