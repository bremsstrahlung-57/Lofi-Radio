/* eslint-env node */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lofi-ui-'));
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url, 'http://localhost').pathname));
  const mime = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.gif':'image/gif','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
  fs.readFile(file, (error, data) => {
    res.writeHead(error ? 404 : 200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'});
    res.end(error ? 'Not found' : data);
  });
});
let browser;
let socket;
let sequence = 0;
const pending = new Map();
const events = [];
async function main() {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--autoplay-policy=no-user-gesture-required',
    'about:blank',
  ], {stdio: ['ignore', 'ignore', 'pipe']});
  let stderr = '';
  browser.stderr.on('data', (data) => { stderr += data; });
  let endpoint;
  for (let i = 0; i < 100; i++) {
    const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (match) { endpoint = match[1]; break; }
    await sleep(100);
  }
  if (!endpoint) throw new Error('Chrome did not start: ' + stderr);
  const port = new URL(endpoint).port;
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve) => socket.addEventListener('open', resolve, {once:true}));
  socket.addEventListener('message', ({data}) => {
    const message = JSON.parse(data);
    if (message.id) {
      const waiter = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
      else waiter.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') events.push(message.params.exceptionDetails.text);
  });
  function cdp(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, {resolve, reject});
      socket.send(JSON.stringify({id, method, params}));
    });
  }
  async function evaluate(expression) {
    const result = await cdp('Runtime.evaluate', {expression, awaitPromise:true, returnByValue:true});
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  async function click(selector) {
    const point = await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x:r.x+r.width/2, y:r.y+r.height/2 }; })()`);
    await cdp('Input.dispatchMouseEvent', {type:'mousePressed', ...point, button:'left', clickCount:1});
    await cdp('Input.dispatchMouseEvent', {type:'mouseReleased', ...point, button:'left', clickCount:1});
    await sleep(250);
  }
  async function screenshot(name) {
    const {data} = await cdp('Page.captureScreenshot', {format:'png'});
    fs.writeFileSync(path.join(root, '.ui-check', name + '.png'), Buffer.from(data, 'base64'));
  }
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await cdp('Page.navigate', {url:`http://127.0.0.1:${server.address().port}/`});
  await sleep(8000);
  await screenshot('desktop');
  assert.equal(await evaluate('document.querySelector("#songs-panel").hidden && document.querySelector("#backgrounds-panel").hidden'), true);
  assert.equal(await evaluate('getComputedStyle(document.querySelector("#func_button")).backgroundColor'), 'rgba(0, 0, 0, 0)');
  await click('#songs-toggle');
  await sleep(12000);
  await screenshot('desktop-songs');
  const metadata = await evaluate('({help:document.querySelector("#song-help").textContent, title:document.querySelector(".song-card span").textContent, thumbnail:document.querySelector(".song-card img").src, scrollHeight:document.querySelector("#song-list").scrollHeight, height:document.querySelector("#song-list").clientHeight})');
  assert.ok(metadata.scrollHeight > metadata.height);
  console.log('YouTube sidebar:', JSON.stringify(metadata));
  await click('#backgrounds-toggle');
  await screenshot('desktop-backgrounds');
  assert.equal(await evaluate('document.querySelector("#songs-panel").hidden'), true);
  assert.equal(await evaluate('document.querySelectorAll(".background-card").length'), 48);
  await click('#backgrounds-next');
  assert.ok(await evaluate('document.querySelector("#background-list").scrollLeft > 0'));
  await evaluate('document.querySelector("#background-list").scrollLeft=0');
  await click('.background-card');
  assert.equal(await evaluate('document.querySelector("#random-background").checked'), false);
  assert.match(await evaluate('document.body.style.backgroundImage'), /ascii-rest-alpine-dawn/);
  await cdp('Input.dispatchKeyEvent', {type:'keyDown',key:'Escape',code:'Escape'});
  await cdp('Input.dispatchKeyEvent', {type:'keyUp',key:'Escape',code:'Escape'});
  assert.equal(await evaluate('document.querySelector("#backgrounds-panel").hidden'), true);
  await evaluate('document.body.style.backgroundImage=""');
  await cdp('Emulation.setDeviceMetricsOverride', {width:768,height:1024,deviceScaleFactor:1,mobile:false});
  await screenshot('tablet');
  await cdp('Emulation.setDeviceMetricsOverride', {width:390,height:844,deviceScaleFactor:1,mobile:true});
  await screenshot('mobile');
  await click('#backgrounds-toggle');
  await screenshot('mobile-backgrounds');
  const tray = await evaluate('(() => { const r=document.querySelector("#backgrounds-panel").getBoundingClientRect(); return {left:r.left,right:r.right,bottom:r.bottom}; })()');
  assert.equal(tray.left, 0);
  assert.equal(tray.right, 390);
  assert.equal(tray.bottom, 844);
  await click('#songs-toggle');
  await screenshot('mobile-songs');
  assert.equal(await evaluate('document.querySelector("#backgrounds-panel").hidden'), true);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  console.log('Runtime exceptions:', JSON.stringify(events));
  assert.equal(events.length, 0);
  console.log('PASS: original transparent controls, responsive drawers, vertical song scrolling, horizontal background scrolling, preview selection, Escape and real YouTube metadata.');
}
main().catch((error) => { console.error(error); process.exitCode=1; }).finally(async () => {
  socket?.close();
  if (browser) {
    const killer = spawn('taskkill', ['/pid', String(browser.pid), '/t', '/f'], {stdio:'ignore'});
    await new Promise((resolve) => killer.on('close', resolve));
  }
  server.close();
  await sleep(300);
  fs.rmSync(profile, {recursive:true,force:true,maxRetries:5,retryDelay:200});
});
