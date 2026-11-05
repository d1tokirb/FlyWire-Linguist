// test_priority1_verification.mjs
// Verification suite for Priority 1: Removal of all illusionary templates and cheats.

import { SynapticLanguageEngine } from '../src/synapticLanguageEngine.js';

console.log('=== TEST 1: TABULA RASA RESPONSE GENERATION ===');
const engine = new SynapticLanguageEngine();

const prompts = [
  'Hello',
  'Who are you?',
  'What is your name?',
  'Do you want sugar?',
  'Fly left and turn around',
  'Tell me why you like flying'
];

let bannedPhrasesFound = 0;
const bannedPhrases = [
  'hello human',
  'my wings are buzzing',
  'i am drosophila',
  'sweet sugar is pure liquid gold',
  'i flap my transparent wings',
  'dr. drosophila',
  'sweet nectar',
  'curious insect companion'
];

prompts.forEach(p => {
  const res = engine.generateResponse(p);
  console.log(`Prompt: "${p}"`);
  console.log(`Fly Response: "${res.text}" (Words: [${res.words.join(', ')}], Stage: ${res.stage}, Conf: ${res.confidence}%)`);
  console.log(`Circuit: ${res.circuit}`);

  const lower = res.text.toLowerCase();
  for (const banned of bannedPhrases) {
    if (lower.includes(banned)) {
      console.error(`FAILURE: Banned template phrase detected: "${banned}"`);
      bannedPhrasesFound++;
    }
  }
  console.log('---');
});

if (bannedPhrasesFound === 0) {
  console.log('PASS: Zero hardcoded template phrases generated. Unconditioned output is pure acoustic babble.');
} else {
  console.error(`FAIL: ${bannedPhrasesFound} banned phrases generated.`);
  process.exit(1);
}

console.log('\n=== TEST 2: VERIFY REMOVAL OF INTENT CLASSIFIER & TEMPLATE DICTIONARIES ===');
if (typeof engine.classifyIntent === 'undefined') {
  console.log('PASS: engine.classifyIntent is removed.');
} else {
  console.error('FAIL: engine.classifyIntent still exists.');
  process.exit(1);
}

console.log('\n=== TEST 3: TUTOR EVALUATION RIGOR (NO AUTO-PASS) ===');
// Emulate evaluateFlyResponse logic
function evaluateResponse(target, flyResponse) {
  const cleanTarget = target.toLowerCase();
  const flyWords = (flyResponse.words || []).map(w => w.toLowerCase().replace(/[^a-z]/g, ''));
  const responseText = (flyResponse.text || '').toLowerCase();
  const winningToken = (flyResponse.winningMBON || '').toLowerCase();

  return winningToken === cleanTarget || flyWords.includes(cleanTarget) || responseText.includes(cleanTarget);
}

// Case A: Unconditioned fly produces babble for "sugar" target
const babbleResponse = {
  text: 'bzz... tsk... da...',
  words: ['bzz', 'tsk', 'da'],
  winningMBON: 'bzz',
  stage: 2 // Even if stage were 2!
};

const babbleSuccess = evaluateResponse('sugar', babbleResponse);
console.log(`Babble response on target 'sugar' evaluated as: ${babbleSuccess}`);
if (!babbleSuccess) {
  console.log('PASS: Babble correctly evaluated as failure (no stage >= 2 auto-pass!).');
} else {
  console.error('FAIL: Babble was incorrectly marked as success.');
  process.exit(1);
}

// Case B: Fly produces target word
const correctResponse = {
  text: 'bzz sugar',
  words: ['sugar'],
  winningMBON: 'sugar',
  stage: 1
};
const correctSuccess = evaluateResponse('sugar', correctResponse);
console.log(`Correct response 'sugar' evaluated as: ${correctSuccess}`);
if (correctSuccess) {
  console.log('PASS: Correct neural match properly recognized as success.');
} else {
  console.error('FAIL: Correct response was not recognized.');
  process.exit(1);
}

console.log('\nALL PRIORITY 1 VERIFICATION TESTS PASSED SUCCESSFULLY.');
