// Koerer _selvtest.html i superanimationer gennem en lokal server og headless Chrome.
// node selvtest.mjs <mappe1> <mappe2> ...      (mapper i animationer/superanimationer)
// Skriver for hver mappe: "ALT OK (n påstande)" eller FEJL-linjerne.
// Hver koersel har sin egen server og sin egen Chrome, saa flere kan koere paa én gang.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROD = '/home/niels/NK_hjemmeside';
const MAPPER = process.argv.slice(2).map(m => m.replace(/\/+$/, '').replace(/^.*superanimationer\//, ''));
const TYPER = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json',
  '.mp3': 'audio/mpeg', '.ttf': 'font/ttf', '.woff': 'font/woff', '.gif': 'image/gif' };
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

const udd = fs.mkdtempSync(path.join(os.tmpdir(), 'nk-selvtest-'));
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
const ev = async (expr) => { const r = await Promise.race([cdp('Runtime.evaluate', { expression: expr, returnByValue: true }), vent(8000).then(() => null)]); return r?.result?.result?.value; };

await cdp('Page.enable');
await cdp('Runtime.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });

let samletFejl = 0;
for (const d of MAPPER) {
  const fil = path.join(ROD, 'animationer/superanimationer', d, '_selvtest.html');
  if (!fs.existsSync(fil)) { console.log(`${d}: (ingen _selvtest.html)`); continue; }
  await cdp('Page.navigate', { url: `http://127.0.0.1:${port}/animationer/superanimationer/${d}/_selvtest.html` });
  let tekst = '', forrige = '', ens = 0, t0 = Date.now();
  const hale = t => t.trim().split('\n').slice(-3).join('\n');
  while (Date.now() - t0 < 300000) {
    await vent(1000);
    tekst = (await ev(`(document.getElementById('ud') || document.body || {}).innerText || ''`)) || tekst;
    ens = tekst === forrige ? ens + 1 : 0; forrige = tekst;
    if (/ALT OK|\d+ FEJL/.test(hale(tekst)) && ens >= 3) break;
  }
  const slut = hale(tekst).split('\n').slice(-2).join(' ').replace(/\s+/g, ' ');
  const fejl = tekst.split('\n').filter(l => /^\s*FEJL\b/.test(l));
  const ok = /ALT OK/.test(hale(tekst)) && !/\d+ FEJL/.test(hale(tekst));
  if (ok) console.log(`${d}: ALT OK (${slut})`);
  else {
    samletFejl++;
    console.log(`${d}: ${/ALT OK|\d+ FEJL/.test(hale(tekst)) ? slut : 'BLEV IKKE FÆRDIG: ' + hale(tekst).replace(/\n/g, ' | ')}`);
    for (const l of fejl) console.log('   ' + l.trim());
  }
}
ws.close(); chrome.kill('SIGKILL'); server.close();
try { fs.rmSync(udd, { recursive: true, force: true }); } catch {}
process.exit(samletFejl ? 1 : 0);
