// ============================================================================
// Neural Checkpoint: Complete Neural State Serialization & Transplant Engine
// ============================================================================
// Provides exact, versioned serialization and deserialization of biological
// connectome weights (FlyWire FAFB v783) and recurrent sequence generator weights
// (Central Complex model).
//
// Guarantees zero shared mutable memory references via Float32Array deep copying.

export class NeuralCheckpoint {
  static FORMAT_VERSION = 'flywire-linguist-checkpoint-v1.0';

  // Serialize a Float32Array losslessly to a standard array preserving full precision
  static encodeFloat32Array(arr) {
    if (!arr) return [];
    return Array.from(arr);
  }

  // Deserialize to a new Float32Array
  static decodeFloat32Array(raw, expectedLength = null) {
    if (!raw) return new Float32Array(expectedLength || 0);
    const arr = new Float32Array(raw);
    if (expectedLength !== null && arr.length !== expectedLength) {
      console.warn(`[NeuralCheckpoint] Dimension mismatch: expected ${expectedLength}, got ${arr.length}`);
    }
    return arr;
  }

  // Create a complete serializable checkpoint from an engine instance
  static createCheckpoint(engine, metadata = {}) {
    if (!engine || !engine.mb || !engine.generator) {
      throw new Error('[NeuralCheckpoint] Invalid engine instance provided for checkpoint creation.');
    }

    const mb = engine.mb;
    const gen = engine.generator;

    return {
      format: NeuralCheckpoint.FORMAT_VERSION,
      timestamp: new Date().toISOString(),
      metadata: {
        flyId: metadata.flyId || 'fly_0',
        condition: metadata.condition || 'BLANK',
        name: metadata.name || 'Simulated Drosophila',
        seed: metadata.seed || gen.seed || 42,
        rngState: gen.seed,
        implantIntensity: metadata.implantIntensity || 'NONE',
        notes: metadata.notes || 'Full connectome and sequence generator weight checkpoint',
        trialsTrained: metadata.trialsTrained || engine.totalEpisodesRun || 0,
        totalTrials: metadata.totalTrials || 0,
        totalSuccesses: metadata.totalSuccesses || 0,
        rollingAcc: metadata.rollingAcc || 0.0,
        trialsToCriterion: metadata.trialsToCriterion || null,
        accuracyHistory: metadata.accuracyHistory || [],
        ...metadata
      },
      connectome: {
        numKCs: mb.numKCs,
        numMBONs: mb.numMBONs,
        numEdges: mb.kcToMbonWeights.length,
        kcToMbonWeights: NeuralCheckpoint.encodeFloat32Array(mb.kcToMbonWeights),
        baselineWeights: NeuralCheckpoint.encodeFloat32Array(mb.kcToMbonBaselineWeights),
        conditioningTrials: mb.conditioningTrials || 0
      },
      sequenceGenerator: {
        hiddenDim: gen.hiddenDim,
        vocabSize: gen.vocabSize,
        contextDim: gen.contextDim,
        maxSequenceLength: gen.maxSequenceLength,
        learningRate: gen.learningRate,
        valueBaseline: gen.valueBaseline,
        seed: gen.seed,
        W_ctx: NeuralCheckpoint.encodeFloat32Array(gen.W_ctx),
        W_time: NeuralCheckpoint.encodeFloat32Array(gen.W_time),
        W_fb: NeuralCheckpoint.encodeFloat32Array(gen.W_fb),
        W_rec: NeuralCheckpoint.encodeFloat32Array(gen.W_rec),
        W_out: NeuralCheckpoint.encodeFloat32Array(gen.W_out),
        b_h: NeuralCheckpoint.encodeFloat32Array(gen.b_h),
        b_out: NeuralCheckpoint.encodeFloat32Array(gen.b_out)
      },
      telemetry: {
        pamDopamine: engine.pamDopamine,
        ppl1Aversion: engine.ppl1Aversion,
        totalEpisodesRun: engine.totalEpisodesRun,
        totalCharactersEmitted: engine.totalCharactersEmitted,
        lexiconSize: engine.lexicon ? engine.lexicon.size : 0
      }
    };
  }

  // Restore checkpoint alias for seamless compatibility
  static restoreCheckpoint(engine, checkpointData) {
    return NeuralCheckpoint.loadCheckpoint(engine, checkpointData);
  }

  // Restore weights and state into an engine instance from checkpoint data
  static loadCheckpoint(engine, checkpointData) {
    if (!checkpointData || checkpointData.format !== NeuralCheckpoint.FORMAT_VERSION) {
      throw new Error(`[NeuralCheckpoint] Incompatible or invalid checkpoint format: ${checkpointData?.format}`);
    }

    const cConn = checkpointData.connectome;
    const cGen = checkpointData.sequenceGenerator;

    if (!cConn || !cGen) {
      throw new Error('[NeuralCheckpoint] Checkpoint missing connectome or sequence generator state.');
    }

    // 1. Restore Mushroom Body Connectome weights
    const mb = engine.mb;
    if (cConn.kcToMbonWeights && cConn.kcToMbonWeights.length === mb.kcToMbonWeights.length) {
      mb.kcToMbonWeights.set(NeuralCheckpoint.decodeFloat32Array(cConn.kcToMbonWeights));
    }
    if (cConn.baselineWeights && cConn.baselineWeights.length === mb.kcToMbonBaselineWeights.length) {
      mb.kcToMbonBaselineWeights.set(NeuralCheckpoint.decodeFloat32Array(cConn.baselineWeights));
    }
    if (typeof cConn.conditioningTrials === 'number') {
      mb.conditioningTrials = cConn.conditioningTrials;
    }

    // 2. Restore Neural Sequence Generator weights
    const gen = engine.generator;
    if (cGen.hiddenDim !== gen.hiddenDim || cGen.vocabSize !== gen.vocabSize || cGen.contextDim !== gen.contextDim) {
      throw new Error(`[NeuralCheckpoint] Generator architecture mismatch: ` +
        `expected [${gen.hiddenDim}, ${gen.vocabSize}, ${gen.contextDim}], got [${cGen.hiddenDim}, ${cGen.vocabSize}, ${cGen.contextDim}]`);
    }

    gen.W_ctx.set(NeuralCheckpoint.decodeFloat32Array(cGen.W_ctx, gen.W_ctx.length));
    gen.W_time.set(NeuralCheckpoint.decodeFloat32Array(cGen.W_time, gen.W_time.length));
    gen.W_fb.set(NeuralCheckpoint.decodeFloat32Array(cGen.W_fb, gen.W_fb.length));
    gen.W_rec.set(NeuralCheckpoint.decodeFloat32Array(cGen.W_rec, gen.W_rec.length));
    gen.W_out.set(NeuralCheckpoint.decodeFloat32Array(cGen.W_out, gen.W_out.length));
    gen.b_h.set(NeuralCheckpoint.decodeFloat32Array(cGen.b_h, gen.b_h.length));
    gen.b_out.set(NeuralCheckpoint.decodeFloat32Array(cGen.b_out, gen.b_out.length));

    if (typeof cGen.valueBaseline === 'number') {
      gen.valueBaseline = cGen.valueBaseline;
    }
    if (typeof cGen.seed === 'number') {
      gen.seed = cGen.seed;
    }

    // 3. Restore telemetry states
    if (checkpointData.telemetry) {
      engine.pamDopamine = checkpointData.telemetry.pamDopamine || 35.0;
      engine.ppl1Aversion = checkpointData.telemetry.ppl1Aversion || 10.0;
    }

    if (engine.onStateChange) engine.onStateChange();

    return {
      success: true,
      metadata: checkpointData.metadata,
      restoredTimestamp: checkpointData.timestamp
    };
  }

  // Clone an engine's neural state into another engine (deep memory copy, zero shared references)
  static cloneState(sourceEngine, targetEngine, newMetadata = {}) {
    const checkpoint = NeuralCheckpoint.createCheckpoint(sourceEngine, newMetadata);
    return NeuralCheckpoint.loadCheckpoint(targetEngine, checkpoint);
  }

  // Export checkpoint to JSON string
  static exportToJSON(engine, metadata = {}) {
    const cp = NeuralCheckpoint.createCheckpoint(engine, metadata);
    return JSON.stringify(cp, null, 2);
  }

  // Parse checkpoint from JSON string
  static importFromJSON(jsonString) {
    const parsed = JSON.parse(jsonString);
    if (!parsed || parsed.format !== NeuralCheckpoint.FORMAT_VERSION) {
      throw new Error(`[NeuralCheckpoint] Invalid checkpoint JSON format.`);
    }
    return parsed;
  }
}
