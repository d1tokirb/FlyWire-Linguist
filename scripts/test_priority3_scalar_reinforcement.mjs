// test_priority3_scalar_reinforcement.mjs
// Verifies Priority 3: Rewards and punishments are independent of the target answer.
// Network chooses output FIRST; environment delivers only a scalar reward R in [-1, +1].

import { MushroomBodyConnectome } from '../src/mushroomBodyConnectome.js';

console.log('=== TEST: ACTION-GATED SCALAR REINFORCEMENT LEARNING ===');

const mb = new MushroomBodyConnectome();

// 1. Initial presentation of novel stimulus "dax"
console.log('\n--- Trial 1: Novel input "dax" ---');
const res1 = mb.forward(['dax']);
const initialChoice = res1.chosenLabel;
const initialChoiceIdx = res1.chosenIdx;
console.log(`Fly chose action: "${initialChoice}" (index ${initialChoiceIdx}, activity: ${res1.winningActivity.toFixed(3)})`);

// 2. Suppose the environment wanted a DIFFERENT action (e.g. goal is not initialChoice)
// Environment provides SCALAR PUNISHMENT R = -1.0
console.log('\n--- Delivering Scalar Punishment R = -1.0 (No target passed!) ---');
const punishReport = mb.applyReinforcement(-1.0);
console.log(`Punishment applied to chosen action "${punishReport.actionLabel}" (Idx: ${punishReport.actionIdx})`);
console.log(`Depressed synapses onto erroneous action: ${punishReport.depressedSynapsesThisTrial}`);

if (punishReport.actionIdx !== initialChoiceIdx) {
  console.error('FAIL: Punishment was not applied to the chosen action!');
  process.exit(1);
}
console.log('PASS: Punishment applied strictly to the chosen action without target leakage.');

// 3. Second presentation of "dax" after punishment
console.log('\n--- Trial 2: Present "dax" again after negative feedback ---');
const res2 = mb.forward(['dax']);
console.log(`Previous choice activity dropped from ${res1.winningActivity.toFixed(3)} to ${mb.mbonActivity[initialChoiceIdx].toFixed(3)}`);
console.log(`New top choice: "${res2.winningToken}" (activity: ${res2.winningActivity.toFixed(3)})`);

if (mb.mbonActivity[initialChoiceIdx] >= res1.winningActivity) {
  console.error('FAIL: Erroneous choice activity was not suppressed!');
  process.exit(1);
}
console.log('PASS: Synaptic depression suppressed erroneous choice activity.');

// 4. Now suppose the environment accepts the new choice and delivers SCALAR REWARD R = +1.0
const newChoiceIdx = res2.chosenIdx;
console.log(`\n--- Delivering Scalar Reward R = +1.0 for action "${res2.chosenLabel}" ---`);
const rewardReport = mb.applyReinforcement(1.0);
console.log(`Reward applied for chosen action "${rewardReport.actionLabel}". Depressed competing synapses: ${rewardReport.depressedSynapsesThisTrial}`);

// 5. Test retention on third presentation (testing without reward)
console.log('\n--- Trial 3: Unrewarded test trial of "dax" ---');
const res3 = mb.forward(['dax']);
console.log(`Final winning action: "${res3.winningToken}" (activity: ${res3.winningActivity.toFixed(3)})`);
if (res3.chosenIdx === newChoiceIdx) {
  console.log(`PASS: Learned association "${res3.winningToken}" retained under unrewarded testing.`);
} else {
  console.error('FAIL: Rewarded action was not retained.');
  process.exit(1);
}

console.log('\nALL PRIORITY 3 VERIFICATION TESTS PASSED SUCCESSFULLY.');
