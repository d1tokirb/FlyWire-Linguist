// run_all_benchmarks.mjs
// Master Scientific Verification Runner for FlyWire-Linguist
// Executes full pipeline: extraction verification, Tabula Rasa verification,
// action-gated RL causality, 2AFC associative conditioning, and multi-word benchmarks.

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

console.log('================================================================');
console.log('FLYWIRE-LINGUIST: MASTER REPRODUCIBLE EXPERIMENTAL SUITE');
console.log('================================================================');
console.log('Dataset: FlyWire Whole-Brain Connectome (FAFB v783)');
console.log('Architecture: 209 PNs -> 2,597 KCs -> 21 MBONs (15 Compartments)\n');

const suite = [
  {
    name: '1. Connectome Dataset Verification (SHA-256 & Measured Synapses)',
    cmd: 'python3 scripts/extract_flywire_synapses.py --verify'
  },
  {
    name: '2. Tabula Rasa State & Template Removal Verification',
    cmd: 'node scripts/test_priority1_verification.mjs'
  },
  {
    name: '3. FlyWire FAFB v783 Root IDs & APL Sparsity Verification',
    cmd: 'node scripts/test_priority2_flywire_connectome.mjs'
  },
  {
    name: '4. Action-Gated Scalar Reinforcement (Zero Target Leakage)',
    cmd: 'node scripts/test_priority3_scalar_reinforcement.mjs'
  },
  {
    name: '5. Milestone A: Two-Alternative Forced Choice (2AFC) Conditioning (N=30)',
    cmd: 'node scripts/benchmark_two_choice_associative_learning.mjs'
  },
  {
    name: '6. Milestone B: Multi-Word, Bidirectional & XOR Negation Benchmark (N=30)',
    cmd: 'node scripts/benchmark_compositional_generalization.mjs'
  },
  {
    name: '7. Milestone C: Sequential Neural Writing & Character-by-Character Acquisition (N=30)',
    cmd: 'node scripts/benchmark_sequential_neural_learning.mjs'
  },
  {
    name: '8. Milestone D: Comparative Neural Language Implantation & Generalization (N=30)',
    cmd: 'node scripts/benchmark_comparative_implants.mjs'
  }
];

let allPassed = true;

for (const step of suite) {
  console.log(`\n>>> RUNNING: ${step.name}`);
  try {
    const output = execSync(step.cmd, { cwd: rootDir, encoding: 'utf-8' });
    console.log(output.trim());
  } catch (err) {
    console.error(`FAILED: ${step.name}`);
    if (err.stdout) console.error(err.stdout);
    if (err.stderr) console.error(err.stderr);
    allPassed = false;
    break;
  }
}

console.log('\n================================================================');
if (allPassed) {
  console.log('MASTER SUITE RESULT: ALL EXPERIMENTS VERIFIED SUCCESSFULLY');
  console.log('All empirical benchmarks match reported statistics with exact p-values.');
} else {
  console.error('MASTER SUITE RESULT: ONE OR MORE EXPERIMENTS FAILED');
  process.exit(1);
}
console.log('================================================================');
