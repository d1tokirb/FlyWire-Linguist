import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const port = 9399;
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--user-data-dir=/tmp/chrome-flytutor-' + Date.now(),
    '--window-size=1440,900',
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--hide-scrollbars'
  ]);

  console.log('Spawned Chrome process PID:', chromeProc.pid);

  let pageWsUrl = null;
  for (let i = 0; i < 20; i++) {
    await wait(600);
    try {
      const data = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json/list`, res => {
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(JSON.parse(body)));
        }).on('error', reject);
      });
      if (Array.isArray(data) && data.length > 0) {
        const page = data.find(t => t.type === 'page') || data[0];
        pageWsUrl = page.webSocketDebuggerUrl;
        console.log('Attached to target:', page.id);
        break;
      }
    } catch (e) {}
  }

  if (!pageWsUrl) {
    console.error('Failed to attach to Chrome');
    chromeProc.kill();
    process.exit(1);
  }

  const ws = new WebSocket(pageWsUrl);
  let msgId = 1;
  const callbacks = new Map();

  ws.addEventListener('message', event => {
    const res = JSON.parse(event.data);
    if (res.id && callbacks.has(res.id)) {
      callbacks.get(res.id)(res);
      callbacks.delete(res.id);
    }
  });

  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise(resolve => ws.addEventListener('open', resolve));
  console.log('WebSocket connected to Chrome DevTools Protocol');

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  await send('Page.navigate', { url: 'http://localhost:5178/' });
  console.log('Navigating to http://localhost:5178/ ...');

  console.log('Waiting for initial 3D shaders and tabula rasa scene to render...');
  await wait(3500);

  // 1. Set Tutor Speed to FAST and start Auto-Tutor
  console.log('Starting Auto-Tutor in FAST mode...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const speedSelect = document.getElementById('tutor-speed-select');
        speedSelect.value = 'FAST';
        speedSelect.dispatchEvent(new Event('change'));

        const toggleBtn = document.getElementById('btn-toggle-tutor');
        toggleBtn.click();
      })()
    `
  });

  // Let the tutor bot train for ~12 seconds across multiple in-depth questions
  console.log('Auto-Tutor is actively interrogating and conditioning the fly across conversational modules...');
  await wait(12500);

  // 2. Pause tutor and have user ask a rich conversational question
  console.log('User asks deep question: "Tell me about your ruby eyes and your wings!" ...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const toggleBtn = document.getElementById('btn-toggle-tutor');
        if (toggleBtn.classList.contains('tutor-active')) toggleBtn.click();

        const input = document.getElementById('chat-input');
        const form = document.getElementById('chat-form');
        input.value = "Tell me about your ruby eyes and how your wings fly!";
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      })()
    `
  });

  await wait(3000);

  // 3. Read live metrics from the page
  const evalMetrics = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const vocab = document.getElementById('val-vocab-size')?.textContent;
        const stage = document.getElementById('stage-capsule-lbl')?.textContent;
        const score = document.getElementById('val-fluency-score')?.textContent;
        const progress = document.getElementById('tutor-progress-pct')?.textContent;
        const lesson = document.getElementById('tutor-lesson-label')?.textContent;
        const activeKCs = document.getElementById('val-active-kcs')?.textContent;
        const depressed = document.getElementById('val-depressed-synapses')?.textContent;
        const lastMsg = document.querySelector('.chat-message-row:last-child .bubble-text')?.textContent;
        return JSON.stringify({ vocab, stage, score, progress, lesson, activeKCs, depressed, lastMsg });
      })()
    `
  });

  const parsedMetrics = JSON.parse(evalMetrics.result.result.value);
  console.log('Live Training Metrics after Deep Conversational Session:', parsedMetrics);

  // 4. Capture high-res screenshot of the Deep Conversation in action
  console.log('Capturing Deep Conversation screenshot...');
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = '/Users/ditokirb/.gemini/antigravity/brain/9d6b09ac-de75-42d6-b647-95d23ea5df3b/fly_linguist_deep_conversation.png';
  fs.writeFileSync(outPath, Buffer.from(shot.result.data, 'base64'));
  console.log('Saved screenshot to:', outPath);

  ws.close();
  chromeProc.kill();
  console.log('Verification completed successfully!');
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
