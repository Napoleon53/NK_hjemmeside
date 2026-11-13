"""Laver HTML-oversigten over sprogrettelserne i animationerne med før og nu og flueben til at vælge numre fra.
  python3 ~/NK_hjemmeside/.claude/sprogrunde/oversigt.py <ud.html> [fra-nr] [til-nr] [titel]"""
import difflib, html, json, os, re, sys

HER = os.path.dirname(os.path.abspath(__file__))
ROD = os.path.expanduser("~/NK_hjemmeside/animationer/superanimationer")
ud = sys.argv[1]
FRA = int(sys.argv[2]) if len(sys.argv) > 2 else 0
TIL = int(sys.argv[3]) if len(sys.argv) > 3 else 10 ** 9
L = [r for r in json.load(open(os.path.join(HER, "ret.json"), encoding="utf-8")) if r.get("hvor") != "selvtest" and FRA <= r["nr"] <= TIL]
L.sort(key=lambda r: r["nr"])


def titel(mappe):
    if mappe in ("faelles", "kemichael") or "kopier" in mappe:
        return "Fælles for flere animationer"
    if mappe.startswith("sc_spil"):
        try:
            s = open(os.path.join(ROD, mappe, "index.html"), encoding="utf-8").read()
            return "Spil: " + html.unescape(re.search(r"<title>(.*?)</title>", s, re.S).group(1)).strip()
        except Exception:
            return mappe
    try:
        s = open(os.path.join(ROD, mappe, "index.html"), encoding="utf-8").read()
        t = html.unescape(re.search(r"<title>(.*?)</title>", s, re.S).group(1)).strip()
    except Exception:
        t = mappe
    nr = re.match(r"s([bc])(\d+\.\w+?)_", mappe)
    return (f"{nr.group(1).upper()}{nr.group(2)} " if nr else "") + t


def diff(a, b):
    a = a.replace('\\"', '"').replace("\\'", "'").replace("\\n", " ")
    b = b.replace('\\"', '"').replace("\\'", "'").replace("\\n", " ")
    ta, tb = re.findall(r"\S+|\s+", a), re.findall(r"\S+|\s+", b)
    fa, fb = [], []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, ta, tb, autojunk=False).get_opcodes():
        A, B = html.escape("".join(ta[i1:i2])), html.escape("".join(tb[j1:j2]))
        if op == "equal":
            fa.append(A); fb.append(B)
        else:
            fa.append(f"<del>{A}</del>" if A.strip() else A)
            fb.append(f"<ins>{B}</ins>" if B.strip() else B)
    return "".join(fa), "".join(fb)


noegle = 'sprogrunde_animationer' + ('' if FRA == 0 else '_' + str(FRA))
grupper = []
for r in L:
    mappe = r["fil"].split("/")[0]
    if r.get("kopier"):
        mappe = "faelles"
    n = titel(mappe)
    if not grupper or grupper[-1][0] != n:
        grupper.append((n, mappe, []))
    grupper[-1][2].append(r)
rows, menu = [], []
for k, (n, mappe, rs) in enumerate(grupper):
    link = "" if mappe == "faelles" else f' <a href="https://kemiformler.dk/animationer/superanimationer/{mappe}/index.html?alene">åbn</a>'
    rows.append(f'<h2 id="g{k}">{html.escape(n)} <span class="antal">{len(rs)} rettelser · nr. {rs[0]["nr"]} til {rs[-1]["nr"]}</span>{link}</h2>')
    menu.append(f'<a href="#g{k}">{html.escape(n.split(" ")[0])}</a>')
    for r in rs:
        a, b = diff(r["gammel"], r["ny"])
        rows.append(f'<div class="ret"><label class="nr"><input type="checkbox" value="{r["nr"]}"> <b>{r["nr"]}</b></label>'
                    f'<div><div class="lbl">Før</div>{a}</div><div><div class="lbl">Nu</div>{b}</div>'
                    f'<div class="hv"><span class="hvor">{html.escape(r["hvor"])}</span> · {html.escape(r["hvorfor"])}</div></div>')
TITEL = sys.argv[4] if len(sys.argv) > 4 else "Animationer: sprogrettelser"
side = f'''<!doctype html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{TITEL}</title>
<style>
:root {{ --bg:#fbfaf7; --kort:#ffffff; --blaek:#1c2422; --daempet:#5d6b68; --kant:#dfe6e4; --groen:#0f766e; --gul:#fff1a8; --roed:#b42318; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg:#161a19; --kort:#1f2524; --blaek:#e8eeec; --daempet:#9fb0ac; --kant:#33403d; --groen:#4fd1c5; --gul:#6b5d12; --roed:#ff8a80; }} }}
body {{ margin:0; background:var(--bg); color:var(--blaek); font:16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }}
main {{ max-width:1100px; margin:0 auto; padding:24px 16px 120px; }}
h1 {{ font-size:1.6rem; margin:0 0 .3rem; }} .intro {{ color:var(--daempet); max-width:75ch; }}
.menu {{ display:flex; flex-wrap:wrap; gap:.3rem .7rem; font-size:.9rem; margin:.8rem 0 0; }}
.menu a, h2 a {{ color:var(--groen); }}
h2 {{ font-size:1.15rem; margin:2rem 0 .6rem; border-bottom:2px solid var(--groen); padding-bottom:.2rem; scroll-margin-top:12px; }}
h2 a {{ font-size:.85rem; font-weight:400; margin-left:.5rem; }}
.antal {{ font-weight:400; color:var(--daempet); font-size:.9rem; }}
.ret {{ display:grid; grid-template-columns:70px 1fr 1fr; gap:.4rem 1rem; background:var(--kort); border:1px solid var(--kant); border-radius:10px; padding:.7rem .9rem; margin:.5rem 0; }}
.ret.valgt {{ border-color:var(--roed); box-shadow:inset 4px 0 0 var(--roed); }}
.nr {{ grid-row:span 2; cursor:pointer; white-space:nowrap; }}
.lbl {{ font-size:.75rem; text-transform:uppercase; letter-spacing:.05em; color:var(--daempet); }}
.hv {{ grid-column:2 / 4; color:var(--daempet); font-size:.88rem; }} .hvor {{ font-weight:600; }}
del {{ color:var(--roed); text-decoration:line-through; }} ins {{ background:var(--gul); text-decoration:none; border-radius:3px; padding:0 1px; }}
.bjaelke {{ position:fixed; left:0; right:0; bottom:0; background:var(--kort); border-top:1px solid var(--kant); padding:.7rem 16px; }}
.bjaelke div {{ max-width:1100px; margin:0 auto; display:flex; gap:1rem; align-items:center; flex-wrap:wrap; }}
button {{ font:inherit; padding:.4rem .9rem; border-radius:8px; border:1px solid var(--groen); background:var(--groen); color:#fff; cursor:pointer; }}
#tekst {{ flex:1; min-width:200px; }}
@media (max-width:720px) {{ .ret {{ grid-template-columns:1fr; }} .nr {{ grid-row:auto; }} .hv {{ grid-column:auto; }} }}
</style></head><body><main>
<h1>{TITEL}</h1>
<p class="intro">{len(L)} rettelser i {len(grupper)} animationer og spil er sat ind i animationerne på din computer. De kommer på kemiformler.dk, når du trykker Synkroniser. Overstreget rødt er den gamle tekst, gult er den nye, og den fede tekst under hver rettelse siger, hvor eleven ser teksten. Sæt flueben ved de rettelser, du vil have sat tilbage, og kopiér linjen nederst ind i chatten.</p>
<nav class="menu">{"".join(menu)}</nav>
{"".join(rows)}
</main><div class="bjaelke"><div><span id="tekst">Ingen rettelser valgt.</span><button id="kopi">Kopiér</button></div></div>
<script>
const bokse=[...document.querySelectorAll('input[type=checkbox]')];
function opdater(){{const v=bokse.filter(b=>b.checked).map(b=>b.value);
bokse.forEach(b=>b.closest('.ret').classList.toggle('valgt',b.checked));
document.getElementById('tekst').textContent=v.length?('Sæt disse rettelser i animationerne tilbage: '+v.join(', ')):'Ingen rettelser valgt.';
try{{localStorage.setItem('{noegle}',JSON.stringify(v))}}catch(e){{}}}}
try{{const g=JSON.parse(localStorage.getItem('{noegle}')||'[]');bokse.forEach(b=>b.checked=g.includes(b.value))}}catch(e){{}}
bokse.forEach(b=>b.addEventListener('change',opdater));opdater();
document.getElementById('kopi').onclick=()=>{{const t=document.getElementById('tekst').textContent;
navigator.clipboard&&navigator.clipboard.writeText(t).then(()=>{{document.getElementById('kopi').textContent='Kopieret';setTimeout(()=>document.getElementById('kopi').textContent='Kopiér',1500)}})}};
</script></body></html>'''
open(ud, "w", encoding="utf-8").write(side)
print(len(L), "rettelser i", ud)
