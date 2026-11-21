// Tager et skaermbillede af startskaermen paa hver fane i hver superanimation.
// node skud.mjs <udmappe> <mappe1> <mappe2> ...
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROD = '/home/niels/NK_hjemmeside';
const UD = process.argv[2];
const MAPPER = process.argv.slice(3);
fs.mkdirSync(UD, { recursive: true });

const TYPER = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json',
  '.mp3': 'audio/mpeg', '.ttf': 'font/ttf', '.woff': 'font/woff' };
const server = http.createServer((req, res) => {
  const p = path.join(ROD, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPER[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const udd = path.join(UD, '_chrome');
fs.rmSync(udd, { recursive: true, force: true });
const chrome = spawn('google-chrome', ['--headless=new', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=0',
  '--user-data-dir=' + udd, '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows', '--hide-scrollbars', '--mute-audio', 'about:blank'], { stdio: 'ignore' });
let dport;
for (let i = 0; i < 100 && !dport; i++) {
  await new Promise(r => setTimeout(r, 200));
  try { dport = fs.readFileSync(path.join(udd, 'DevToolsActivePort'), 'utf8').split('\n')[0]; } catch {}
}
const liste = await (await fetch(`http://127.0.0.1:${dport}/json/list`)).json();
const side = liste.find(t => t.type === 'page');
const ws = new WebSocket(side.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let nr = 0; const venter = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && venter.has(m.id)) { venter.get(m.id)(m); venter.delete(m.id); } });
const cdp = (method, params = {}) => new Promise(r => { const id = ++nr; venter.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const vent = ms => new Promise(r => setTimeout(r, ms));
const ev = async (expr) => (await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1400, height: 860, deviceScaleFactor: 1, mobile: false });

const skyd = async (navn) => {
  const r = await cdp('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(UD, navn + '.png'), Buffer.from(r.result.data, 'base64'));
};

const log = [];
for (const d of MAPPER) {
  try {
    await cdp('Page.navigate', { url: `http://127.0.0.1:${port}/animationer/superanimationer/${d}/index.html` });
    await vent(3500);
    const faner = await ev(`(() => { const k = [...document.querySelectorAll('.faneknap, [role=tab]')]; const u = [...new Set(k)].filter(x => x.offsetParent !== null); window.__faner = u; return u.map(x => (x.textContent || x.title || '').trim().replace(/\\s+/g,' ')); })()`) || [];
    await skyd(`${d}__0`);
    log.push(`${d}\t0\t${faner[0] || '(ingen faner)'}`);
    for (let i = 1; i < faner.length; i++) {
      await ev(`window.__faner[${i}].click()`);
      await vent(2200);
      await skyd(`${d}__${i}`);
      log.push(`${d}\t${i}\t${faner[i]}`);
    }
  } catch (e) { log.push(`${d}\tFEJL\t${e}`); }
  fs.writeFileSync(path.join(UD, '_faner.tsv'), log.join('\n') + '\n');
}
ws.close(); chrome.kill('SIGKILL'); server.close();
fs.rmSync(udd, { recursive: true, force: true });
console.log('faerdig', log.length);
process.exit(0);
