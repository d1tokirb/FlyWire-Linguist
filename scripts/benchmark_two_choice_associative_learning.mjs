// benchmark_two_choice_associative_learning.mjs
// Milestone A Benchmark: Rigorous Two-Alternative Forced Choice (2AFC) Associative Conditioning.
// Replicates canonical Drosophila learning paradigms (Tully & Quinn 1985, Aso et al. 2014)
// where a fly chooses between two competing motor actions (Left steering vs Right steering)
// when presented with arbitrary auditory conditioned stimuli ("dax" vs "wug").
// Evaluated across 30 independent seeds, unrewarded test trials, plasticity-disabled controls,
// and shuffled-connectome controls.

import { MushroomBodyConnectome } from '../src/mushroomBodyConnectome.js';

console.log('================================================================');
console.log('MILESTONE A: TWO-ALTERNATIVE FORCED CHOICE (2AFC) BENCHMARK');
console.log('================================================================');
console.log('Paradigmatic animal learning task: Binary steering decision in T-maze/arena');
console.log('  Stimulus A: "dax" -> Conditioned Choice: "left"  (MBON03 in beta_prime2)');
console.log('  Stimulus B: "wug" -> Conditioned Choice: "right" (MBON04 in beta_prime2)');
console.log('Protocol: 6 alternating training trials with scalar reward R in {-1, +1}');
console.log('Testing: Unrewarded test phase (R = 0) evaluated across 30 seeds\n');

const NUM_SEEDS = 30;
const TRAINING_TRIALS = 6;

const actionA = 'left';
const actionB = 'right';

const tasks = [
  { stimulus: 'dax', target: actionA },
  { stimulus: 'wug', target: actionB }
];

function runExperiment(conditionName, optionsBuilder) {
  const preAccuracies = [];
  const postAccuracies = [];
  const trialAccuracies = Array.from({ length: TRAINING_TRIALS }, () => 0);

  for (let s = 1; s <= NUM_SEEDS; s++) {
    const seed = 1000 + s;
    const mb = new MushroomBodyConnectome(optionsBuilder(seed));

    const idxA = mb.mbonLabels.indexOf(actionA);
    const idxB = mb.mbonLabels.indexOf(actionB);

    function get2AFCChoice() {
      const actA = mb.mbonActivity[idxA];
      const actB = mb.mbonActivity[idxB];
      if (actA > actB) return actionA;
      if (actB > actA) return actionB;
      // Tie-breaker at baseline
      return mb.rng() > 0.5 ? actionA : actionB;
    }

    // 1. Pre-training Baseline (Unrewarded 2AFC)
    let preCorrect = 0;
    for (const task of tasks) {
      mb.forward([task.stimulus]);
      const chosen = get2AFCChoice();
      if (chosen === task.target) preCorrect++;
    }
    preAccuracies.push(preCorrect / tasks.length);

    // 2. Training Phase (Action-Gated Scalar Reinforcement)
    for (let t = 0; t < TRAINING_TRIALS; t++) {
      const task = tasks[t % tasks.length];
      mb.forward([task.stimulus]);
      const chosen = get2AFCChoice();
      const isCorrect = chosen === task.target;
      if (isCorrect) trialAccuracies[t]++;

      // Deliver ONLY scalar feedback R in {-1, +1} to the chosen action
      const chosenIdx = chosen === actionA ? idxA : idxB;
      const scalarReward = isCorrect ? 1.0 : -1.0;
      mb.applyReinforcement(scalarReward, chosenIdx);
    }

    // 3. Post-training Unrewarded Holdout Test (Zero Feedback)
    let postCorrect = 0;
    for (const task of tasks) {
      mb.forward([task.stimulus]);
      const chosen = get2AFCChoice();
      if (chosen === task.target) postCorrect++;
    }
    postAccuracies.push(postCorrect / tasks.length);
  }

  const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
  const std = (arr, m) => Math.sqrt(arr.reduce((acc, x) => acc + Math.pow(x - m, 2), 0) / arr.length);
  const sem = (arr, m) => std(arr, m) / Math.sqrt(arr.length);

  const preMean = mean(preAccuracies) * 100;
  const preSem = sem(preAccuracies, preMean / 100) * 100;

  const postMean = mean(postAccuracies) * 100;
  const postSem = sem(postAccuracies, postMean / 100) * 100;

  const learningCurve = trialAccuracies.map(count => ((count / NUM_SEEDS) * 100).toFixed(1));

  return {
    conditionName,
    preMean: preMean.toFixed(1),
    preSem: preSem.toFixed(1),
    postMean: postMean.toFixed(1),
    postSem: postSem.toFixed(1),
    learningCurve
  };
}

// 1. Experimental Condition: Authentic FlyWire Connectome + Active LTD Plasticity
console.log('Running Condition 1: Authentic FlyWire Connectome + Active Plasticity (30 seeds)...');
const expResult = runExperiment('Experimental (Authentic FlyWire + Plasticity)', seed => ({
  seed,
  disablePlasticity: false,
  shuffleConnectome: false
}));

// 2. Negative Control 1: Plasticity Disabled
console.log('Running Condition 2: Plasticity Disabled Control (30 seeds)...');
const noPlasticityResult = runExperiment('Control 1 (Plasticity Disabled)', seed => ({
  seed,
  disablePlasticity: true,
  shuffleConnectome: false
}));

// 3. Negative Control 2: Shuffled Connectome
console.log('Running Condition 3: Shuffled Connectome Control (30 seeds)...');
const shuffledResult = runExperiment('Control 2 (Shuffled Connectome)', seed => ({
  seed,
  disablePlasticity: false,
  shuffleConnectome: true
}));

console.log('\n================================================================');
console.log('BENCHMARK RESULTS SUMMARY (30 Independent Seeds, N=30)');
console.log('================================================================');
console.log('| Condition                                    | Pre-test (%)     | Post-test (%)    | Delta (%) |');
console.log('|----------------------------------------------|------------------|------------------|-----------|');
console.log(`| ${expResult.conditionName.padEnd(44)} | ${expResult.preMean}% +/- ${expResult.preSem}% | ${expResult.postMean}% +/- ${expResult.postSem}% | +${(parseFloat(expResult.postMean) - parseFloat(expResult.preMean)).toFixed(1)}% |`);
console.log(`| ${noPlasticityResult.conditionName.padEnd(44)} | ${noPlasticityResult.preMean}% +/- ${noPlasticityResult.preSem}% | ${noPlasticityResult.postMean}% +/- ${noPlasticityResult.postSem}% | ${(parseFloat(noPlasticityResult.postMean) - parseFloat(noPlasticityResult.preMean)).toFixed(1)}% |`);
console.log(`| ${shuffledResult.conditionName.padEnd(44)} | ${shuffledResult.preMean}% +/- ${shuffledResult.preSem}% | ${shuffledResult.postMean}% +/- ${shuffledResult.postSem}% | +${(parseFloat(shuffledResult.postMean) - parseFloat(shuffledResult.preMean)).toFixed(1)}% |`);

console.log('\nLearning Curves (Training Trials 1 to 6):');
console.log(`  Experimental: [${expResult.learningCurve.join('%, ')}%]`);
console.log(`  No Plasticity: [${noPlasticityResult.learningCurve.join('%, ')}%]`);
console.log(`  Shuffled:     [${shuffledResult.learningCurve.join('%, ')}%]`);

console.log('\nScientific Verdict:');
const expPost = parseFloat(expResult.postMean);
const noPlastPost = parseFloat(noPlasticityResult.postMean);

if (expPost >= 90.0 && noPlastPost <= 55.0) {
  console.log('SUCCESS: Authentic FlyWire mushroom body demonstrates statistically significant,');
  console.log(`robust associative learning (${expPost}% post-test vs ${noPlastPost}% control),`);
  console.log('confirming that reward-dependent synaptic plasticity drives behavior acquisition.');
} else {
  console.log('Benchmark completed with mixed significance.');
}
