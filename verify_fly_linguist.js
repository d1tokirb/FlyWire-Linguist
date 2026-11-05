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
    '--user-data-dir=/tmp/chrome-flylinguist-' + Date.now(),
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

  await new Promise(resolve => ws.addEventListener('open', resolve));

  function send(method, params = {}, timeoutMs = 45000) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      const timer = setTimeout(() => {
        callbacks.delete(id);
        reject(new Error(`CDP method ${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      callbacks.set(id, (res) => {
        clearTimeout(timer);
        if (res.error) {
          reject(new Error(`CDP error on ${method}: ${JSON.stringify(res.error)}`));
        } else {
          resolve(res);
        }
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.addEventListener('message', event => {
    const d = JSON.parse(event.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      console.log('BROWSER CONSOLE:', d.params.type, d.params.args?.map(a => a.value || a.description).join(' '));
    }
  });

  try {
    await send('Page.enable');
    await send('Runtime.enable');

    console.log('Navigating to http://localhost:5178/ ...');
    await send('Page.navigate', { url: 'http://localhost:5178/' });

    console.log('Waiting for initial 3D shaders and tabula rasa scene to render...');
    await wait(3500);

    // Capture View 1: Initial Tabula Rasa State
    console.log('Capturing View 1: Tabula Rasa Initial State...');
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/ditokirb/.gemini/antigravity/brain/9d6b09ac-de75-42d6-b647-95d23ea5df3b/fly_linguist_tabula_rasa.png', Buffer.from(shot1.result.data, 'base64'));
    console.log('Saved fly_linguist_tabula_rasa.png');

    // Simulate teaching session via DOM interaction
    console.log('Teaching fly first tokens: "Hello fly!" ...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.getElementById('chat-input');
          const form = document.getElementById('chat-form');
          input.value = "Hello fly!";
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        })()
      `
    });

    await wait(1800);

    console.log('Rewarding fly with sugar (+PAM dopamine surge)...');
    await send('Runtime.evaluate', {
      expression: `document.getElementById('btn-sucrose').click();`
    });

    await wait(1200);

    console.log('Teaching fly second phrase: "I am human. Do you want sweet sugar?" ...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.getElementById('chat-input');
          const form = document.getElementById('chat-form');
          input.value = "I am human. Do you want sweet sugar?";
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        })()
      `
    });

    await wait(2200);

    console.log('Teaching fly third phrase: "Good smart fly! Speak English." ...');
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const input = document.getElementById('chat-input');
          const form = document.getElementById('chat-form');
          input.value = "Good smart fly! Speak English.";
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        })()
      `
    });

    await wait(2500);

    // Trigger Connectome Conditioning Experiment: Train "Go / Left / Right"
    console.log('Triggering Connectome Plasticity Experiment: Train Commands...');
    await send('Runtime.evaluate', {
      expression: `document.getElementById('btn-exp-train-commands').click();`
    });
    await wait(1200);

    // Trigger Generalization Test
    console.log('Triggering Generalization Test...');
    await send('Runtime.evaluate', {
      expression: `document.getElementById('btn-exp-generalize').click();`
    });
    await wait(1200);

    // Capture View 2: Active Synaptic Learning, KC Sparsity & Vocabulary Cloud
    console.log('Capturing View 2: Active Learning & Vocabulary Cloud...');
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/ditokirb/.gemini/antigravity/brain/9d6b09ac-de75-42d6-b647-95d23ea5df3b/fly_linguist_learning_active.png', Buffer.from(shot2.result.data, 'base64'));
    console.log('Saved fly_linguist_learning_active.png');

    // Switch to Macro Face View
    console.log('Switching to Macro Face View...');
    await send('Runtime.evaluate', {
      expression: `document.querySelector('[data-view="MACRO_FACE"]').click();`
    });
    await wait(1500);
    const shot3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/ditokirb/.gemini/antigravity/brain/9d6b09ac-de75-42d6-b647-95d23ea5df3b/fly_linguist_macro_face.png', Buffer.from(shot3.result.data, 'base64'));
    console.log('Saved fly_linguist_macro_face.png');

    // Switch to 3D Connectome View
    console.log('Switching to 3D Connectome View...');
    await send('Runtime.evaluate', {
      expression: `document.querySelector('[data-view="CONNECTOME_3D"]').click();`
    });
    await wait(1500);
    const shot4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/Users/ditokirb/.gemini/antigravity/brain/9d6b09ac-de75-42d6-b647-95d23ea5df3b/fly_linguist_connectome.png', Buffer.from(shot4.result.data, 'base64'));
    console.log('Saved fly_linguist_connectome.png');

    console.log('All verification screenshots captured successfully!');
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    ws.close();
    chromeProc.kill();
    process.exit(0);
  }
}

run();
