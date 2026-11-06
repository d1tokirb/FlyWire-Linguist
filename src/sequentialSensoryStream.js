// ============================================================================
// Sequential Sensory Stream: Character-by-Character Neural Input Transduction
// ============================================================================
// Maps streams of letters, spaces, word boundaries, and timing into the 209
// FlyWire Projection Neurons (FAFB v783 calyx inputs).
//
// Scientific Boundary Documentation:
// - This is an engineered character sensory transducer, NOT a biological ear
//   or Johnston's organ. In Drosophila, mechanosensation naturally transduces
//   200 Hz wing acoustics and mechanical vibrations.
// - This component maps orthographic character sequences into the 209 PN input
//   channels using tonotopic frequency bands without hardcoded semantic categories
//   or token dictionaries. Arbitrary unfamiliar strings (e.g. 'dax', 'wug') are
//   transduced identically to standard English words.

export class SequentialSensoryStream {
  constructor(numPNs = 209) {
    this.numPNs = numPNs;
    this.pnActivity = new Float32Array(this.numPNs);
    this.historyTrace = new Float32Array(this.numPNs);
    this.decayRate = 0.60; // Temporal memory retention across sequential symbols

    // Character symbol vocabulary (28 symbols: 26 lowercase letters, space, EOS)
    this.alphabet = 'abcdefghijklmnopqrstuvwxyz <EOS>'.split('');
    this.symbolToIdx = new Map();
    for (let i = 0; i < 26; i++) {
      this.symbolToIdx.set(String.fromCharCode(97 + i), i);
    }
    this.symbolToIdx.set(' ', 26);
    this.symbolToIdx.set('<EOS>', 27);
    this.symbolToIdx.set('<SOS>', 28);

    // Tonotopic frequency channel map for character symbols
    // Based on Drosophila acoustic frequency tiling (0..49 channels)
    this.phonemeMap = {
      'a': [10, 35, 48], 'e': [8, 25, 45],  'i': [5, 28, 49],
      'o': [8, 20, 38],  'u': [6, 18, 36],  'y': [6, 30, 46],
      'b': [12, 18],     'd': [22, 28],     'g': [15, 24],
      'p': [14, 20],     't': [25, 32],     'k': [18, 27],
      'm': [30, 38],     'n': [36, 44],
      's': [40, 46, 49], 'z': [38, 44, 48], 'f': [34, 42], 'v': [32, 40],
      'l': [24, 36],     'r': [22, 34],     'w': [15, 28], 'h': [26, 38],
      'c': [16, 26],     'j': [20, 30],     'q': [17, 27], 'x': [42, 47]
    };
  }

  // Reset temporal sensory memory to silence
  reset() {
    this.pnActivity.fill(0.0);
    this.historyTrace.fill(0.0);
  }

  // Transduce a single sequential character event
  stepCharacter(charSymbol, isTerminal = false) {
    const sym = (charSymbol || '').toLowerCase();

    // Decay preceding history trace
    for (let i = 0; i < this.numPNs; i++) {
      this.historyTrace[i] *= this.decayRate;
    }

    // Reset current frame activity
    this.pnActivity.fill(0.0);

    let activeChannels = [];
    if (sym === ' ') {
      // Space activates inter-word boundary channels (channels 45..47 in Bank A)
      activeChannels = [45, 47];
    } else if (sym === '<EOS>') {
      // End-of-sequence boundary channels (channels 48..49 in Bank A)
      activeChannels = [48, 49];
    } else if (this.phonemeMap[sym]) {
      activeChannels = this.phonemeMap[sym];
    } else {
      const code = sym.charCodeAt(0) || 0;
      activeChannels = [10 + (code % 35)];
    }

    // Bank A (Even PNs: 0, 2, 4...): Instantaneous current focal character
    // Bank B (Odd PNs: 1, 3, 5...): Temporal history trace of preceding sequence
    for (let c of activeChannels) {
      const evenIdx = (c % 50) * 2;
      const oddIdx = ((c % 50) * 2) + 1;
      if (evenIdx < this.numPNs) {
        this.pnActivity[evenIdx] = 0.90;
      }
      if (oddIdx < this.numPNs) {
        this.historyTrace[oddIdx] = Math.min(1.0, this.historyTrace[oddIdx] + 0.85);
      }
    }

    // Copy sustained history trace to odd PNs
    for (let i = 1; i < this.numPNs; i += 2) {
      this.pnActivity[i] = this.historyTrace[i];
    }

    return Float32Array.from(this.pnActivity);
  }

  // Transduce an entire string into the connectome step-by-step
  // Returns an array of PN activity frames over time [t_0, t_1, ..., t_L]
  encodeSequence(text) {
    this.reset();
    const cleanText = (text || '').toLowerCase().trim();
    const frames = [];

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const pnFrame = this.stepCharacter(char, false);
      frames.push(pnFrame);
    }

    // Final frame includes terminal sequence marker
    const eosFrame = this.stepCharacter('<EOS>', true);
    frames.push(eosFrame);

    return frames;
  }

  // Get cumulative PN representation at the end of the input sequence
  encodeStringToTerminalPN(text) {
    const frames = this.encodeSequence(text);
    return frames[frames.length - 1];
  }
}
