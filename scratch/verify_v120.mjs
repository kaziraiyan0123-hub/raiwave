import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const targetDir = 'C:\\Users\\Win11_25H2\\.gemini\\antigravity\\brain\\ef7f03c5-ca52-49e5-ab4c-1afa9c05d115';
const port = 9888;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--user-data-dir=' + path.join(targetDir, 'scratch', 'chrome-profile-v120')
  ], { stdio: 'ignore' });

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    try {
      const res = await fetch('http://127.0.0.1:' + port + '/json/version');
      if (res.ok) {
        const json = await res.json();
        wsUrl = json.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  const tabRes = await fetch('http://127.0.0.1:' + port + '/json/new?https://raiwave.vercel.app/', { method: 'PUT' });
  const tabJson = await tabRes.json();
  const tabWs = tabJson.webSocketDebuggerUrl;

  const ws = new WebSocket(tabWs);
  let id = 1;
  const callbacks = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      callbacks.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      if (data.error) cb.reject(data.error);
      else cb.resolve(data.result);
    }
  };

  await new Promise(resolve => ws.onopen = resolve);
  await send('Page.enable');
  await send('Runtime.enable');
  await sleep(4000);

  // Play first track so player & recently played are active
  await send('Runtime.evaluate', {
    expression: `
      const playBtn = document.querySelector('button[title*="Play"]') || document.querySelector('button');
      if (playBtn) playBtn.click();
    `
  });
  await sleep(2000);

  // 1. Desktop Screenshot
  console.log('Capturing Desktop v1.2.0...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(1000);
  const deskShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(targetDir, 'raiwave_v120_desktop.png'), Buffer.from(deskShot.data, 'base64'));

  // 2. Mobile Mini-Player Floating Position Screenshot
  console.log('Capturing Mobile Mini-Player v1.2.0...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(1000);
  const mobShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(targetDir, 'raiwave_v120_mobile_home.png'), Buffer.from(mobShot.data, 'base64'));

  // 3. Open Mobile Full Player (Click Mini Player)
  console.log('Opening Mobile Full Player...');
  await send('Runtime.evaluate', {
    expression: `
      const mini = document.getElementById('mobile-mini-player');
      if (mini) mini.click();
    `
  });
  await sleep(1200);
  const fullPlayerShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(targetDir, 'raiwave_v120_full_player_wave.png'), Buffer.from(fullPlayerShot.data, 'base64'));

  console.log('All screenshots captured!');
  ws.close();
  chrome.kill();
}

main().catch(console.error);
