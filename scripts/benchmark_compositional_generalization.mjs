// benchmark_compositional_generalization.mjs
// Milestone B Benchmark: Sequence Learning, Word Order Sensitivity, and Compositional Generalization.
// Tests whether the measured FlyWire mushroom body circuit can:
// 1. Distinguish word order ("go left" vs "left go") via temporal delay line channels.
// 2. Learn multi-word sequence commands and generalize direction to novel carrier words.
// Evaluated across 30 independent seeds with unrewarded holdout testing.

import { MushroomBodyConnectome } from '../src/mushroomBodyConnectome.js';

console.log('================================================================');
console.log('MILESTONE B: COMPOSITIONAL & SEQUENCE LEARNING BENCHMARK');
console.log('================================================================');

const NUM_SEEDS = 30;

// -----------------------------------------------------------------------------
// TEST 1: WORD ORDER REPRESENTATION SENSITIVITY
// -----------------------------------------------------------------------------
console.log('\n--- PART 1: Word Order Representation Sensitivity ("go left" vs "left go") ---');

const similarities = [];
const overlaps = [];

for (let s = 1; s <= NUM_SEEDS; s++) {
  const seed = 2000 + s;
  const mb = new MushroomBodyConnectome({ seed });

  const overlap = mb.computePatternOverlap(['go', 'left'], ['left', 'go']);
  similarities.push(parseFloat(overlap.cosineSimilarity));
  overlaps.push(overlap.overlappingKCs);
}

const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
const meanSim = mean(similarities);
const meanOver = mean(overlaps);

console.log(`Mean Cosine Similarity ("go left" vs "left go"): ${meanSim.toFixed(3)} across 30 seeds`);
console.log(`Mean Shared Kenyon Cells: ${meanOver.toFixed(1)} / ~130 active KCs`);

if (meanSim < 0.40) {
  console.log('PASS: Temporal delay line ensures "go left" and "left go" excite distinct KC ensembles (Cosine Sim < 0.40).');
} else {
  console.error('FAIL: Word order representation failed to differentiate sequences!');
  process.exit(1);
}

// -----------------------------------------------------------------------------
// TEST 2: COMPOSITIONAL GENERALIZATION TO NOVEL CARRIER WORDS
// -----------------------------------------------------------------------------
console.log('\n--- PART 2: Compositional Generalization to Unfamiliar Carriers ---');
console.log('Training Set:');
console.log('  1. "go left"  -> "left"  (MBON03 in beta_prime2)');
console.log('  2. "go right" -> "right" (MBON04 in beta_prime2)');
console.log('Test Set (Unfamiliar carrier "fly", never paired with directions during training):');
console.log('  1. "fly left"  -> Target: "left"');
console.log('  2. "fly right" -> Target: "right"\n');

const trainTasks = [
  { stimulus: ['go', 'left'], target: 'left' },
  { stimulus: ['go', 'right'], target: 'right' }
];

const testTasks = [
  { stimulus: ['fly', 'left'], target: 'left' },
  { stimulus: ['fly', 'right'], target: 'right' }
];

let trainedAccuracies = [];
let holdoutAccuracies = [];

for (let s = 1; s <= NUM_SEEDS; s++) {
  const seed = 3000 + s;
  const mb = new MushroomBodyConnectome({ seed });

  const idxLeft = mb.mbonLabels.indexOf('left');
  const idxRight = mb.mbonLabels.indexOf('right');

  function getChoice() {
    const a = mb.mbonActivity[idxLeft];
    const b = mb.mbonActivity[idxRight];
    if (a > b) return 'left';
    if (b > a) return 'right';
    return mb.rng() > 0.5 ? 'left' : 'right';
  }

  // Train on "go left" and "go right" for 8 trials
  for (let t = 0; t < 8; t++) {
    const task = trainTasks[t % trainTasks.length];
    mb.forward(task.stimulus);
    const chosen = getChoice();
    const isCorrect = chosen === task.target;
    const chosenIdx = chosen === 'left' ? idxLeft : idxRight;
    const scalarReward = isCorrect ? 1.0 : -1.0;
    mb.applyReinforcement(scalarReward, chosenIdx);
  }

  // Evaluate memorization on training set (unrewarded)
  let trainCorrect = 0;
  for (const task of trainTasks) {
    mb.forward(task.stimulus);
    if (getChoice() === task.target) trainCorrect++;
  }
  trainedAccuracies.push(trainCorrect / trainTasks.length);

  // Evaluate generalization on holdout set with unfamiliar carrier "fly" (unrewarded)
  let holdoutCorrect = 0;
  for (const task of testTasks) {
    mb.forward(task.stimulus);
    if (getChoice() === task.target) holdoutCorrect++;
  }
  holdoutAccuracies.push(holdoutCorrect / testTasks.length);
}

const trainMean = (mean(trainedAccuracies) * 100).toFixed(1);
const holdoutMean = (mean(holdoutAccuracies) * 100).toFixed(1);

console.log('================================================================');
console.log('MILESTONE B RESULTS SUMMARY (N=30 Independent Seeds)');
console.log('================================================================');
console.log(`Training Set Accuracy ("go left" / "go right"):        ${trainMean}%`);
console.log(`Holdout Generalization ("fly left" / "fly right"):     ${holdoutMean}%`);

if (parseFloat(trainMean) >= 95.0 && parseFloat(holdoutMean) >= 80.0) {
  console.log('\nSUCCESS: FlyWire mushroom body demonstrates successful compositional generalization');
  console.log('to unfamiliar word combinations while maintaining word order sensitivity.');
} else {
  console.log('\nMilestone B completed with partial generalization.');
}
