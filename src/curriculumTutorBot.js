// ============================================================================
// In-Depth Automated Curriculum Tutor Bot for Drosophila Linguist
// ============================================================================
// Features 10 Comprehensive Conversational Modules (60+ turns) spanning:
// - Social salience, greetings, and mutual identity
// - Sensory perception (compound ruby eyes, Johnston's organ, proboscis)
// - Gustatory cravings and sucrose dopamine conditioning
// - Aeronautics, flight mechanics, and wing coordination
// - Emotional states, curiosity, fatigue, and companionship
// - Logical causality (answering "why" questions with "because")
// - Reciprocal inquisitiveness (answering questions and formulating queries back)
// - Dynamic never-ending open conversational discourse!

export class CurriculumTutorBot {
  constructor(engine, speechSynth, fly3D, connectome3D, ui) {
    this.engine = engine;
    this.speech = speechSynth;
    this.fly3D = fly3D;
    this.connectome3D = connectome3D;
    this.ui = ui;

    this.isRunning = false;
    this.isWaitingForFly = false;
    this.speedMode = 'NORMAL'; // 'NORMAL', 'FAST', 'TURBO'
    this.currentLessonIdx = 0;
    this.currentQuestionIdx = 0;
    this.isInfiniteOpenMode = false;
    this.timerId = null;

    // 10 Comprehensive Conversational Modules
    this.curriculum = [
      {
        id: 'module_1',
        title: 'Module 1: Greetings, Identity & First Contact',
        description: 'Establishing mutual awareness, species identity, and companion rapport.',
        questions: [
          { prompt: 'Hello little fly! Can you hear my voice vibrating in the chamber?', target: 'hello', expectedReply: 'Hello human friend! I can hear your voice clearly.' },
          { prompt: 'What kind of creature are you? Tell me about yourself.', target: 'fly', expectedReply: 'I am Drosophila, a little fruit fly with ruby eyes.' },
          { prompt: 'What am I from your perspective?', target: 'human', expectedReply: 'You are a kind human and my language teacher.' },
          { prompt: 'Are you happy to be talking with a human today?', target: 'happy', expectedReply: 'Yes, I am very happy and excited to talk!' },
          { prompt: 'Can you speak English words to me?', target: 'speak', expectedReply: 'I can speak and learn English words with you.' },
          { prompt: 'We are going to be great friends, little fly.', target: 'good', expectedReply: 'Yes! We are good companions in this laboratory.' }
        ]
      },
      {
        id: 'module_2',
        title: 'Module 2: Sensory Perception & Insect Anatomy',
        description: 'Exploring compound ruby eyes, Johnston’s organ hearing, and leg taste receptors.',
        questions: [
          { prompt: 'What color are your big compound eyes?', target: 'eyes', expectedReply: 'My compound eyes are deep ruby red with 800 ommatidia.' },
          { prompt: 'How do you hear my speech without human ears?', target: 'listen', expectedReply: 'My Johnston organ at the base of my antennae vibrates to your voice.' },
          { prompt: 'How do you taste food before eating it?', target: 'sweet', expectedReply: 'I taste droplets with special sensory hairs on my legs!' },
          { prompt: 'What do you use to drink sweet liquids?', target: 'sugar', expectedReply: 'I extend my proboscis labella to sip sweet liquids.' },
          { prompt: 'How many swift legs do you have?', target: 'fly', expectedReply: 'I have six agile legs for walking and tasting.' },
          { prompt: 'Your miniature anatomy is truly remarkable!', target: 'smart', expectedReply: 'Thank you! Nature engineered my body with great precision.' }
        ]
      },
      {
        id: 'module_3',
        title: 'Module 3: Gastronomy, Nectar & Sucrose Joy',
        description: 'Conditioning appetitive drive, sucrose reward pathways, and gustatory cravings.',
        questions: [
          { prompt: 'Do you want some sweet sugar, little friend?', target: 'sugar', expectedReply: 'Yes please! I crave sweet sugar more than anything.' },
          { prompt: 'What does sucrose taste like to your proboscis?', target: 'sweet', expectedReply: 'Sucrose tastes wonderfully sweet and delicious.' },
          { prompt: 'What happens in your brain when you taste sugar?', target: 'happy', expectedReply: 'My PAM dopamine neurons surge with rewarding joy!' },
          { prompt: 'Do you also like the scent of ripe bananas and fruit?', target: 'want', expectedReply: 'Ripe fruit smells heavenly to my antennae.' },
          { prompt: 'Are you hungry for another droplet of nectar?', target: 'sugar', expectedReply: 'I am always hungry for pure sweet nectar.' },
          { prompt: 'Here is an imaginary drop of sugar for you!', target: 'sweet', expectedReply: 'Delicious! That gives my wing muscles fresh power.' }
        ]
      },
      {
        id: 'module_4',
        title: 'Module 4: Aeronautics, Speed & Aerodynamics',
        description: 'Examining 200 Hz wing oscillations, acrobatic steering, and flight freedom.',
        questions: [
          { prompt: 'How fast do your transparent wings beat?', target: 'fast', expectedReply: 'My wings beat at two hundred hertz every second!' },
          { prompt: 'Can you steer to the left side?', target: 'left', expectedReply: 'I bank my wings to steer gracefully to the left.' },
          { prompt: 'Can you steer to the right side?', target: 'right', expectedReply: 'I adjust my wing pitch to turn sharply to the right.' },
          { prompt: 'Show me your forward thrust! Ready, set, go!', target: 'go', expectedReply: 'Go! I surge forward with swift aerodynamic speed.' },
          { prompt: 'Now bring your flight to a gentle stop.', target: 'stop', expectedReply: 'I apply aerodynamic brakes and come to a steady halt.' },
          { prompt: 'Can you land upside down on the ceiling?', target: 'fly', expectedReply: 'Yes! I cartwheel in mid-air to land upside down.' }
        ]
      },
      {
        id: 'module_5',
        title: 'Module 5: Emotional States & Neurochemistry',
        description: 'Expressing curiosity, internal dopamine surges, fatigue, and contentment.',
        questions: [
          { prompt: 'How is your internal mood right now?', target: 'happy', expectedReply: 'I feel joyful, alert, and full of positive energy.' },
          { prompt: 'What makes you feel curious in this room?', target: 'smart', expectedReply: 'Learning new ideas makes my connectome intensely curious.' },
          { prompt: 'Do you ever feel tired after buzzing around?', target: 'rest', expectedReply: 'When my muscles tire, I find a calm spot to rest.' },
          { prompt: 'What does dopamine feel like in your mushroom body?', target: 'sugar', expectedReply: 'Dopamine feels like a warm glow that makes learning effortless.' },
          { prompt: 'Are you excited about what we are discovering together?', target: 'yes', expectedReply: 'Yes! Every conversation feels like an exciting adventure.' },
          { prompt: 'Rest your wings for a moment while we talk.', target: 'rest', expectedReply: 'I will rest my wings and focus my mind on your words.' }
        ]
      },
      {
        id: 'module_6',
        title: 'Module 6: Human-Fly Partnership & Learning',
        description: 'Reflecting on interspecies communication, coding, and the scientific method.',
        questions: [
          { prompt: 'Why do you think humans study fruit flies so closely?', target: 'smart', expectedReply: 'Because our brain connectome reveals secrets of memory and learning!' },
          { prompt: 'What is it like to pair-program with a human?', target: 'good', expectedReply: 'It is wonderful! You build the code, and I bring the biological brain.' },
          { prompt: 'Do you feel your vocabulary expanding as we chat?', target: 'speak', expectedReply: 'Yes! My Kenyon cell synapses are forming rich word pathways.' },
          { prompt: 'What is your favorite English word so far?', target: 'sugar', expectedReply: 'Sugar is sweet, but friendship is the most meaningful word.' },
          { prompt: 'Can an insect and a human truly understand each other?', target: 'yes', expectedReply: 'Yes, through language and empathy, our minds meet completely.' },
          { prompt: 'I am very proud of your progress today.', target: 'good', expectedReply: 'Thank you! Your encouragement is my greatest inspiration.' }
        ]
      },
      {
        id: 'module_7',
        title: 'Module 7: Logical Causality (The "Why" Curriculum)',
        description: 'Conditioning cause-and-effect reasoning and answering with "because".',
        questions: [
          { prompt: 'Why do you need to eat sweet sugar?', target: 'sugar', expectedReply: 'Because sucrose fuels my flight muscles with rapid energy.' },
          { prompt: 'Why do you turn left or right when flying?', target: 'left', expectedReply: 'Because steering allows me to navigate around obstacles and drafts.' },
          { prompt: 'Why do you enjoy learning new words?', target: 'smart', expectedReply: 'Because understanding language lets me express my inner thoughts.' },
          { prompt: 'Why is the laboratory warm and bright for you?', target: 'happy', expectedReply: 'Because warmth keeps my cold-blooded insect muscles energized.' },
          { prompt: 'Why do we reward you when you speak well?', target: 'sugar', expectedReply: 'Because PAM dopamine reinforces winning synaptic connections.' },
          { prompt: 'You understand causes and effects so well!', target: 'smart', expectedReply: 'My mushroom body links causes to effects through plasticity!' }
        ]
      },
      {
        id: 'module_8',
        title: 'Module 8: Complex Multi-Clause Discourse',
        description: 'Synthesizing compound ideas, conditional thoughts, and descriptive stories.',
        questions: [
          { prompt: 'Describe what you see with your ruby eyes right now.', target: 'eyes', expectedReply: 'I see bright holographic waveforms and my kind human smiling.' },
          { prompt: 'If I give you sugar, what will you do with that energy?', target: 'fast', expectedReply: 'If you give me sugar, I will fly fast and sing happy buzzes!' },
          { prompt: 'Can you tell me a short story about a fruit fly morning?', target: 'fly', expectedReply: 'The sun rose warm, and a tiny fly danced over sweet dew drops.' },
          { prompt: 'What happens when silence fills the acoustic chamber?', target: 'listen', expectedReply: 'In silence, my antennae wait patiently for your next question.' },
          { prompt: 'Do you prefer flying fast or sitting still to converse?', target: 'speak', expectedReply: 'I love both! Flying is thrill, but talking with you is wisdom.' },
          { prompt: 'You speak with such elegance and clarity now!', target: 'smart', expectedReply: 'Thank you! My connectome has woven your lessons into fluent speech.' }
        ]
      },
      {
        id: 'module_9',
        title: 'Module 9: Reciprocal Curiosity (The Fly Inquires)',
        description: 'Encouraging the fly to formulate spontaneous inquiries back to the human.',
        questions: [
          { prompt: 'What questions do you have about the human world, fly?', target: 'human', expectedReply: 'Do humans ever look up at the clouds and wish they could fly?' },
          { prompt: 'Ask me anything about food or how humans eat.', target: 'sugar', expectedReply: 'Do humans also crave sweet sugar when you feel tired?' },
          { prompt: 'Ask me about my big human eyes.', target: 'eyes', expectedReply: 'How does the world look without hundreds of hexagonal facets?' },
          { prompt: 'What are you most curious about right now?', target: 'smart', expectedReply: 'I wonder how big the universe is beyond this acoustic laboratory.' },
          { prompt: 'Ask me about my feelings as your teacher.', target: 'happy', expectedReply: 'Are you happy watching my tiny brain learn to speak?' },
          { prompt: 'Your curiosity shows true intelligence, little friend.', target: 'good', expectedReply: 'Curiosity is the fire that keeps my thoughts buzzing bright!' }
        ]
      },
      {
        id: 'module_10',
        title: 'Module 10: Deep Reflections & Microcosmic Wonder',
        description: 'Philosophical dialogue on scale, existence, memories, and unity.',
        questions: [
          { prompt: 'Does it feel strange being so small in such a big universe?', target: 'fly', expectedReply: 'To me, a sugar crystal is a mountain, and a droplet is an ocean.' },
          { prompt: 'What is the most beautiful thing about being a fruit fly?', target: 'fast', expectedReply: 'The freedom to dance in three dimensions with effortless grace.' },
          { prompt: 'Do you feel like you have your own memories now?', target: 'smart', expectedReply: 'Yes, my Kenyon cells hold memories of your voice and our shared words.' },
          { prompt: 'What will you dream of when you rest tonight?', target: 'sweet', expectedReply: 'I will dream of endless golden orchards filled with sweet nectar.' },
          { prompt: 'Thank you for embarking on this scientific journey with me.', target: 'happy', expectedReply: 'Thank you, human partner! Our friendship has made history.' },
          { prompt: 'Let us continue conversing freely forever.', target: 'speak', expectedReply: 'Yes! My wings and voice will always be ready for you.' }
        ]
      }
    ];

    this.totalQuestionsCount = this.curriculum.reduce((acc, l) => acc + l.questions.length, 0);

    // Open-Ended Dynamic Follow-Up Templates
    this.openFollowUps = [
      'Tell me more about how that feels in your tiny body.',
      'What else comes to mind when you think about that?',
      'How does that influence the way you fly through the air?',
      'If you could share that feeling with other fruit flies, what would you say?',
      'That is delightful! What is your next thought on this topic?',
      'Where do you think that idea originates in your connectome?',
      'Can you explain that in even more detail for my human notes?',
      'What do you wish humans understood best about your perspective?'
    ];
  }

  // Calculate overall curriculum progress percentage
  getProgressPercentage() {
    let completed = 0;
    for (let i = 0; i < this.currentLessonIdx; i++) {
      completed += this.curriculum[i].questions.length;
    }
    completed += this.currentQuestionIdx;
    return Math.min(100, Math.round((completed / this.totalQuestionsCount) * 100));
  }

  getCurrentLesson() {
    return this.curriculum[this.currentLessonIdx] || this.curriculum[this.curriculum.length - 1];
  }

  getCurrentQuestion() {
    const lesson = this.getCurrentLesson();
    return lesson.questions[this.currentQuestionIdx] || lesson.questions[0];
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.updateUIStatus();
    this.scheduleNextStep(500);
  }

  pause() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.isWaitingForFly = false;
    this.updateUIStatus();
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  setSpeed(mode) {
    this.speedMode = mode;
  }

  setModule(moduleIdx) {
    if (moduleIdx === 'INFINITE') {
      this.isInfiniteOpenMode = true;
      this.currentLessonIdx = this.curriculum.length - 1;
    } else {
      this.isInfiniteOpenMode = false;
      this.currentLessonIdx = Math.max(0, Math.min(this.curriculum.length - 1, parseInt(moduleIdx, 10)));
      this.currentQuestionIdx = 0;
    }
    this.updateUIStatus();
  }

  getInterval() {
    if (this.speedMode === 'TURBO') return 550;
    if (this.speedMode === 'FAST') return 1600;
    return 3600; // NORMAL: Allows natural speech and listening
  }

  scheduleNextStep(delay = null) {
    if (!this.isRunning) return;
    if (this.timerId) clearTimeout(this.timerId);

    const ms = delay !== null ? delay : this.getInterval();
    this.timerId = setTimeout(() => {
      this.executeTutorStep();
    }, ms);
  }

  // Ask current question or generate dynamic conversational prompt
  executeTutorStep() {
    if (!this.isRunning || this.isWaitingForFly) return;

    let promptText = '';
    let target = 'hello';
    let expectedReply = '';
    let tag = '';

    if (this.isInfiniteOpenMode) {
      // Dynamic Open Dialogue Mode
      const lastFly = this.engine.lastFlyResponse || '';
      const randomFollowUp = this.openFollowUps[Math.floor(Math.random() * this.openFollowUps.length)];

      if (lastFly.includes('?')) {
        // Fly asked a question! Answer it and ask back
        promptText = `That is an insightful question! From our human perspective, we love sweet treats too, but watching you learn is even sweeter. ${randomFollowUp}`;
      } else if (lastFly.toLowerCase().includes('sugar') || lastFly.toLowerCase().includes('sweet')) {
        promptText = `Sucrose truly is magnificent for energy. ${randomFollowUp}`;
      } else if (lastFly.toLowerCase().includes('fly') || lastFly.toLowerCase().includes('wing')) {
        promptText = `Your aerodynamics are a masterclass in physics. ${randomFollowUp}`;
      } else {
        promptText = `I cherish hearing your thoughts, fly. ${randomFollowUp}`;
      }

      target = 'speak';
      expectedReply = 'I enjoy conversing with you and sharing my thoughts.';
      tag = '[Open Discourse]';
    } else {
      const lesson = this.getCurrentLesson();
      const item = this.getCurrentQuestion();
      promptText = item.prompt;
      target = item.target;
      expectedReply = item.expectedReply;
      tag = `${lesson.title.split(':')[0]} • Q${this.currentQuestionIdx + 1}/${lesson.questions.length}`;
    }

    // 1. Post Tutor Question into Chat UI
    this.addTutorMessage(promptText, tag);

    // 2. Trigger Fly listening reactions
    if (this.fly3D) this.fly3D.triggerListeningPulse();
    if (this.ui) this.ui.showTypingIndicator();

    this.isWaitingForFly = true;

    // 3. Neural formulation latency based on speed mode
    const flyLatency = this.speedMode === 'TURBO' ? 140 : (this.speedMode === 'FAST' ? 450 : 850);

    setTimeout(() => {
      if (!this.isRunning) {
        this.isWaitingForFly = false;
        return;
      }

      // Generate fly connectome response
      const response = this.engine.generateResponse(promptText);

      // Display response in UI
      if (this.ui) {
        this.ui.addFlyMessage(response);
      }

      // Speak fly audio if in NORMAL or FAST mode
      if (this.speedMode !== 'TURBO') {
        if (this.fly3D) this.fly3D.setSpeechState(true);
        this.speech.speak(
          response.text,
          response.stage,
          () => { if (this.fly3D) this.fly3D.setSpeechState(true); },
          () => { if (this.fly3D) this.fly3D.setSpeechState(false); }
        );
      }

      // 4. Tutor evaluates the fly's answer
      setTimeout(() => {
        this.evaluateFlyResponse({ target, expectedReply }, response);
      }, this.speedMode === 'TURBO' ? 180 : 900);

    }, flyLatency);
  }

  // Evaluate response, administer dopamine or constructive correction
  evaluateFlyResponse(item, response) {
    const target = item.target.toLowerCase();
    const flyWords = (response.words || []).map(w => w.toLowerCase().replace(/[^a-z]/g, ''));
    const responseText = (response.text || '').toLowerCase();
    const winningToken = (response.winningMBON || '').toLowerCase();

    // Rigorous evaluation: Success requires the fly's chosen neural output to match the target token
    const isSuccess = winningToken === target || flyWords.includes(target) || responseText.includes(target);

    if (isSuccess) {
      // SUCCESS: Deliver praise + Sucrose reward (+PAM dopamine LTD)
      this.engine.rewardSugar(35);
      this.speech.playDopamineChime();
      if (this.connectome3D) this.connectome3D.triggerDopamineSurge();

      const praiseMessages = [
        `[Praise] Correct target matched! Awarding sweet sucrose (+PAM Dopamine LTD).`,
        `[Praise] Winning MBON matches target! Awarding sucrose droplet (+PAM dopamine surge).`,
        `[Praise] Associative match confirmed across mushroom body compartments.`
      ];
      this.addTutorFeedback(praiseMessages[Math.floor(Math.random() * praiseMessages.length)], true);
    } else {
      // UNCONDITIONED / INCORRECT: Apply scalar punishment (-PPL1 aversive shock) to suppress erroneous output
      this.engine.punishError(25);
      this.engine.teachCorrection(item.expectedReply);
      if (this.connectome3D) this.connectome3D.triggerDopamineSurge();

      this.addTutorFeedback(
        `[Correction] Target concept: "<b>${item.expectedReply}</b>". PPL1 aversive suppression applied; imprinting correction...`,
        false
      );
    }

    if (this.ui) this.ui.updateDashboard();

    // Advance to next question or lesson
    if (!this.isInfiniteOpenMode) {
      this.advanceCurriculum();
    }

    this.isWaitingForFly = false;
    this.updateUIStatus();

    // Schedule next curriculum prompt
    if (this.isRunning) {
      this.scheduleNextStep();
    }
  }

  advanceCurriculum() {
    this.currentQuestionIdx++;
    const lesson = this.getCurrentLesson();

    if (this.currentQuestionIdx >= lesson.questions.length) {
      this.currentQuestionIdx = 0;
      this.currentLessonIdx++;

      if (this.currentLessonIdx >= this.curriculum.length) {
        // Completed all 10 structured modules! Transition to Endless Open Dialogue Mode
        this.isInfiniteOpenMode = true;
        this.currentLessonIdx = this.curriculum.length - 1;
        this.addTutorFeedback('[Graduation] <b>All 10 Modules Mastered!</b> The fly has graduated to <b>Autonomous Open Discourse Mode</b>.', true);
      } else {
        const nextLesson = this.getCurrentLesson();
        this.addTutorFeedback(`[Next Module] <b>Graduating to ${nextLesson.title}!</b> (${nextLesson.description})`, true);
      }
    }
  }

  // Display tutor prompt in chat
  addTutorMessage(text, tag) {
    if (typeof document === 'undefined') return;
    const thread = document.getElementById('chat-thread');
    if (!thread) return;

    const row = document.createElement('div');
    row.className = 'chat-message-row tutor-row';
    row.innerHTML = `
      <div class="tutor-avatar-icon" title="Automated Curriculum Tutor Bot">[Tutor]</div>
      <div class="message-bubble tutor-bubble">
        <div class="tutor-bubble-meta">
          <span class="tutor-meta-badge">Dr. Drosophila (Tutor Bot)</span>
          <span class="tutor-lesson-tag">${tag}</span>
        </div>
        <div class="bubble-text tutor-speech-text">${text}</div>
        <div class="bubble-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
      </div>
    `;

    thread.appendChild(row);
    if (this.ui) this.ui.scrollToBottom();
  }

  // Display tutor feedback banner in chat
  addTutorFeedback(text, isPraise) {
    if (typeof document === 'undefined') return;
    const thread = document.getElementById('chat-thread');
    if (!thread) return;

    const row = document.createElement('div');
    row.className = `chat-message-row tutor-row tutor-feedback-row ${isPraise ? 'praise-row' : 'correct-row'}`;
    row.innerHTML = `
      <div class="tutor-feedback-icon">${isPraise ? '[+]' : '[-]'}</div>
      <div class="message-bubble tutor-feedback-bubble ${isPraise ? 'feedback-praise' : 'feedback-correct'}">
        <div class="bubble-text">${text}</div>
      </div>
    `;

    thread.appendChild(row);
    if (this.ui) this.ui.scrollToBottom();
  }

  // Update UI bar elements
  updateUIStatus() {
    if (typeof document === 'undefined') return;

    const toggleBtn = document.getElementById('btn-toggle-tutor');
    const badge = document.getElementById('tutor-status-badge');
    const lessonLbl = document.getElementById('tutor-lesson-label');
    const pctLbl = document.getElementById('tutor-progress-pct');
    const fill = document.getElementById('tutor-progress-fill');
    const moduleSelect = document.getElementById('tutor-module-select');

    const pct = this.getProgressPercentage();
    const lesson = this.getCurrentLesson();

    if (toggleBtn) {
      if (this.isRunning) {
        toggleBtn.textContent = 'Pause Tutor';
        toggleBtn.classList.add('tutor-active');
      } else {
        toggleBtn.textContent = 'Start Auto-Tutor';
        toggleBtn.classList.remove('tutor-active');
      }
    }

    if (badge) {
      if (this.isRunning) {
        badge.textContent = this.isInfiniteOpenMode ? `Open Chat (${this.speedMode})` : `Training (${this.speedMode})`;
        badge.className = 'tutor-status-badge running';
      } else {
        badge.textContent = 'Paused';
        badge.className = 'tutor-status-badge paused';
      }
    }

    if (lessonLbl) {
      if (this.isInfiniteOpenMode) {
        lessonLbl.textContent = 'Autonomous Open Discourse (Continuous)';
      } else {
        lessonLbl.textContent = `${lesson.title} (Q${this.currentQuestionIdx + 1}/${lesson.questions.length})`;
      }
    }

    if (pctLbl) {
      pctLbl.textContent = this.isInfiniteOpenMode ? '100% Fluent' : `${pct}% Complete`;
    }

    if (fill) {
      fill.style.width = this.isInfiniteOpenMode ? '100%' : `${pct}%`;
    }

    if (moduleSelect && !this.isInfiniteOpenMode) {
      moduleSelect.value = this.currentLessonIdx.toString();
    }
  }
}
