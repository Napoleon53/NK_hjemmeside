#!/usr/bin/env python3
"""Samler hjaelpernes fund (fund/g*.json) til en HTML-oversigt.
python3 saml.py <ud.html>"""
import base64, glob, html, io, json, os, re, sys
from PIL import Image

S = os.path.dirname(os.path.abspath(__file__))
UD = sys.argv[1]

def e(s):
    return html.escape(str(s or ""))

def kort_nr(mappe):
    m = re.match(r"s([bc])(\d+)\.(\w+?)_", mappe)
    if not m:
        return mappe
    return ("B" if m.group(1) == "b" else "C") + m.group(2) + "." + m.group(3)

def sorter_noegle(mappe):
    m = re.match(r"s([bc])(\d+)\.(\d+)", mappe)
    if not m:
        return (9, 0, 0)
    return (0 if m.group(1) == "c" else 1, int(m.group(2)), int(m.group(3)))

def billede(sti):
    if not sti:
        return ""
    for kand in (os.path.join(S, sti), os.path.join(S, "skud", sti), sti):
        if os.path.isfile(kand):
            im = Image.open(kand).convert("RGB")
            im.thumbnail((980, 980))
            b = io.BytesIO()
            im.save(b, "JPEG", quality=72)
            return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()
    return ""

data = []
for f in sorted(glob.glob(os.path.join(S, "fund", "g*.json"))):
    with open(f, encoding="utf-8") as fh:
        data.extend(json.load(fh))
data.sort(key=lambda a: sorter_noegle(a.get("mappe", "")))

def kortet(alm, fed, svar, klasse=""):
    ud = '<div class="papir %s">' % klasse
    efter = ""
    alm = str(alm or "")
    m = re.search(r"\(efter spørgsmålet:?\)\s*", alm, re.I)
    if m:
        alm, efter = alm[:m.start()].strip(), alm[m.end():].strip()
    if alm:
        ud += '<p class="alm">%s</p>' % e(alm)
    if fed:
        ud += '<p class="fed">%s</p>' % e(fed)
    elif klasse == "ny":
        ud += '<p class="daempet">(intet halvfedt spørgsmål)</p>'
    if efter:
        ud += '<p class="alm">%s</p>' % e(efter)
    if svar:
        ud += '<div class="svar">' + "".join('<span>%s</span>' % e(s) for s in svar) + "</div>"
    return ud + "</div>"

# ---------- del 1: sprog ----------
sprog_html, nr = [], 0
antal_sprog = {"tydelig": 0, "lille": 0}
for a in data:
    fund = a.get("sprog") or []
    if not fund:
        continue
    blokke = []
    for f in fund:
        nr += 1
        st = f.get("styrke", "tydelig")
        antal_sprog[st] = antal_sprog.get(st, 0) + 1
        nyt_svar = f.get("nyt_svar")
        blokke.append(
            '<div class="ret %s" data-s="%d"><label class="nr"><input type="checkbox" class="fra" value="%d"> %d</label>'
            '<div class="hv"><span class="hvor">%s</span>%s · <span class="st">%s</span></div>'
            '<div><div class="lbl">Nu</div>%s</div>'
            '<div><div class="lbl">Forslag</div>%s</div>'
            '<div class="prob">%s</div></div>' % (
                "lille" if st == "lille" else "", nr, nr, nr,
                e(f.get("fane", "")), (" · " + e(f.get("opgave"))) if f.get("opgave") else "",
                "lille ting" if st == "lille" else "tydeligt",
                kortet(f.get("nu_alm"), f.get("nu_fed"), f.get("nu_svar")),
                kortet(f.get("nyt_alm"), f.get("nyt_fed"), nyt_svar if nyt_svar else f.get("nu_svar"), "ny"),
                e(f.get("problem", ""))))
    sprog_html.append('<h3 id="s-%s">%s %s <span class="antal">%d</span></h3>%s' % (
        e(a["mappe"]), kort_nr(a["mappe"]), e(a.get("titel", "")), len(fund), "".join(blokke)))
antal_s = nr

# ---------- del 2: start ----------
start_alle = []
for a in data:
    for s in a.get("start") or []:
        start_alle.append((a, s))
ikke_fint = [(a, s) for a, s in start_alle if s.get("dom") != "fint"]
fint = [(a, s) for a, s in start_alle if s.get("dom") == "fint"]
ikke_fint.sort(key=lambda t: (t[1].get("prioritet", 3), sorter_noegle(t[0]["mappe"])))

start_html, tnr = [], 0
prio_navn = {1: "Prioritet 1: tydeligt for meget, stor gevinst", 2: "Prioritet 2: god idé", 3: "Prioritet 3: kan overvejes"}
sidste_prio = None
oversigt_t = []
for a, s in ikke_fint:
    p = s.get("prioritet", 3)
    if p != sidste_prio:
        start_html.append('<h3 class="prio">%s</h3>' % prio_navn.get(p, "Prioritet %s" % p))
        sidste_prio = p
    tnr += 1
    img = billede(s.get("billede"))
    trin = s.get("forslag") or []
    trin_html = "".join(
        '<li>%s<div class="derefter">Derefter: %s</div></li>' % (kortet(t.get("alm"), t.get("fed"), t.get("svar"), "ny"), e(t.get("derefter", "")))
        for t in trin)
    oversigt_t.append('<li><a href="#t%d">T%d</a> %s %s, fane %s</li>' % (tnr, tnr, kort_nr(a["mappe"]), e(a.get("titel", "")), e(s.get("fane", ""))))
    start_html.append(
        '<div class="start" id="t%d"><div class="shoved"><label class="nr"><input type="checkbox" class="byg" value="T%d"> T%d</label> '
        '<span class="hvor">%s %s</span> · fane %s · <span class="dom">%s</span></div>'
        '<div class="sgrid"><div>%s</div><div>'
        '<p><b>Fremme fra start:</b> %s</p><p><b>Første opgave bruger:</b> %s</p>'
        '%s<p class="gevinst">%s</p></div></div>'
        '%s</div>' % (
            tnr, tnr, tnr, kort_nr(a["mappe"]), e(a.get("titel", "")), e(s.get("fane", "")), e(s.get("dom", "")),
            ('<img src="%s" alt="Startskærm" class="skud" title="Klik for at se billedet stort">' % img) if img else '<p class="daempet">(intet skærmbillede)</p>',
            e(s.get("fremme", "")), e(s.get("bruges", "")),
            ('<p><b>Andre greb:</b> %s</p>' % e(s["andet"])) if s.get("andet") else "",
            e(s.get("gevinst", "")),
            ('<details open><summary>Forslag til trin (%d)</summary><ol class="trin">%s</ol></details>' % (len(trin), trin_html)) if trin else ""))

fint_html = "".join('<li>%s %s, fane %s</li>' % (kort_nr(a["mappe"]), e(a.get("titel", "")), e(s.get("fane", ""))) for a, s in fint)

bem = [(a, a.get("bemaerk")) for a in data if a.get("bemaerk")]
bem_html = "".join('<li><b>%s %s:</b> %s</li>' % (kort_nr(a["mappe"]), e(a.get("titel", "")), e(b)) for a, b in bem)

menu_s = "".join('<a href="#s-%s">%s</a>' % (e(a["mappe"]), kort_nr(a["mappe"])) for a in data if a.get("sprog"))

CSS = """
:root { --bg:#fbfaf7; --kort:#ffffff; --blaek:#1c2422; --daempet:#5d6b68; --kant:#dfe6e4; --groen:#0f766e; --gul:#fff1a8; --roed:#b42318; --papir:#fbf8ef; --papirkant:#e4dcc6; --guld:#8a6a00; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#161a19; --kort:#1f2524; --blaek:#e8eeec; --daempet:#9fb0ac; --kant:#33403d; --groen:#4fd1c5; --gul:#6b5d12; --roed:#ff8a80; --papir:#2a2a24; --papirkant:#4a4636; --guld:#e0c060; } }
body { margin:0; background:var(--bg); color:var(--blaek); font:16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
main { max-width:1150px; margin:0 auto; padding:24px 16px 120px; }
h1 { font-size:1.6rem; margin:0 0 .3rem; } .intro { color:var(--daempet); max-width:80ch; }
h2 { font-size:1.3rem; margin:2.4rem 0 .6rem; border-bottom:2px solid var(--groen); padding-bottom:.2rem; }
h3 { font-size:1.05rem; margin:1.6rem 0 .4rem; scroll-margin-top:12px; } h3.prio { color:var(--groen); font-size:1.15rem; }
.menu { display:flex; flex-wrap:wrap; gap:.3rem .7rem; font-size:.9rem; margin:.6rem 0 0; } .menu a { color:var(--groen); }
.antal { font-weight:400; color:var(--daempet); font-size:.9rem; }
.boks { background:var(--kort); border:1px solid var(--kant); border-radius:10px; padding:.8rem 1rem; margin:.8rem 0; }
.boks ul { margin:.3rem 0; padding-left:1.2rem; }
.ret { display:grid; grid-template-columns:64px 1fr 1fr; gap:.4rem 1rem; background:var(--kort); border:1px solid var(--kant); border-radius:10px; padding:.7rem .9rem; margin:.5rem 0; }
.ret.valgt, .start.valgt { border-color:var(--roed); box-shadow:inset 4px 0 0 var(--roed); }
.start.bygvalgt, .boks.bygvalgt { border-color:var(--groen); box-shadow:inset 4px 0 0 var(--groen); }
.nr { grid-row:span 3; cursor:pointer; white-space:nowrap; font-weight:600; }
.hv { color:var(--daempet); font-size:.88rem; grid-column:2 / 4; } .hvor { font-weight:600; color:var(--blaek); }
.st { font-size:.8rem; } .ret.lille .st { color:var(--daempet); }
.prob { grid-column:2 / 4; font-size:.9rem; color:var(--daempet); }
.lbl { font-size:.75rem; text-transform:uppercase; letter-spacing:.05em; color:var(--daempet); margin-bottom:.15rem; }
.papir { background:var(--papir); border:1px solid var(--papirkant); border-radius:8px; padding:.45rem .7rem; font-size:.95rem; }
.papir.ny { border-color:var(--groen); }
.papir p { margin:.1rem 0; } .papir .fed { font-weight:650; }
.svar { display:flex; flex-wrap:wrap; gap:.3rem; margin-top:.35rem; }
.svar span { border:1px solid var(--papirkant); border-radius:6px; padding:.05rem .45rem; font-size:.85rem; background:var(--kort); }
.svar span:first-child { }
.start { background:var(--kort); border:1px solid var(--kant); border-radius:10px; padding:.8rem 1rem; margin:.7rem 0 1rem; scroll-margin-top:12px; }
.shoved { margin-bottom:.5rem; } .dom { font-weight:600; color:var(--roed); }
.sgrid { display:grid; grid-template-columns:minmax(0,1.1fr) minmax(0,1fr); gap:1rem; }
.sgrid img { width:100%; border:1px solid var(--kant); border-radius:6px; }
.sgrid p { margin:.2rem 0 .5rem; font-size:.93rem; }
.gevinst { color:var(--groen); font-weight:600; }
ol.trin { padding-left:1.4rem; display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:.6rem 1.6rem; }
ol.trin li { margin:.2rem 0; } .derefter { font-size:.88rem; color:var(--daempet); margin-top:.25rem; }
details summary { cursor:pointer; font-weight:600; margin-top:.6rem; }
.daempet { color:var(--daempet); }
img.skud { cursor:zoom-in; }
img.skud.stor { position:fixed; inset:0; margin:auto; width:auto !important; max-width:96vw; max-height:94vh; z-index:20; cursor:zoom-out; box-shadow:0 0 0 100vmax rgba(0,0,0,.6); }
.bjaelke { position:fixed; left:0; right:0; bottom:0; background:var(--kort); border-top:1px solid var(--kant); padding:.7rem 16px; }
.bjaelke div { max-width:1150px; margin:0 auto; display:flex; gap:1rem; align-items:center; flex-wrap:wrap; }
button { font:inherit; padding:.4rem .9rem; border-radius:8px; border:1px solid var(--groen); background:var(--groen); color:#fff; cursor:pointer; }
#tekst { flex:1; min-width:200px; font-size:.95rem; }
@media (max-width:760px) { .ret { grid-template-columns:1fr; } .nr { grid-row:auto; } .hv, .prob { grid-column:auto; } .sgrid { grid-template-columns:1fr; } }
"""

JS = """
function opdater() {
  var fra = [].slice.call(document.querySelectorAll('input.fra:checked')).map(function (x) { return x.value; });
  var byg = [].slice.call(document.querySelectorAll('input.byg:checked')).map(function (x) { return x.value; });
  document.querySelectorAll('input.fra').forEach(function (x) { x.closest('.ret').classList.toggle('valgt', x.checked); });
  document.querySelectorAll('input.byg').forEach(function (x) { var b = x.closest('.start, .boks'); if (b) b.classList.toggle('bygvalgt', x.checked); });
  var t = 'Sprogforslag fravalgt: ' + (fra.length ? fra.join(', ') : 'ingen') + '. Byg: ' + (byg.length ? byg.join(', ') : 'ingen') + '.';
  document.getElementById('tekst').textContent = t;
}
document.addEventListener('change', opdater);
document.addEventListener('click', function (ev) {
  var stor = document.querySelector('img.skud.stor');
  if (stor) { stor.classList.remove('stor'); return; }
  if (ev.target.matches && ev.target.matches('img.skud')) ev.target.classList.add('stor');
});
document.getElementById('kopi').addEventListener('click', function () {
  var t = document.getElementById('tekst').textContent;
  if (navigator.clipboard) navigator.clipboard.writeText(t);
  this.textContent = 'Kopieret';
  var b = this; setTimeout(function () { b.textContent = 'Kopiér'; }, 1500);
});
opdater();
"""

antal_anim = len(data)
side = """<!doctype html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Animationer: spørgsmål og start</title><style>%s</style></head><body><main>
<h1>Animationer: spørgsmål og start</h1>
<p class="intro">%d animationer er gennemgået for to ting: halvfede spørgsmål, der ikke kan læses alene, og startskærme med for meget på én gang. Intet er rettet endnu. Sæt flueben ved de sprogforslag, du <b>ikke</b> vil have, og ved de startskærme, du <b>vil</b> have bygget i trin. Kopiér så linjen nederst ind i chatten.</p>
<div class="boks"><b>Kort fortalt.</b> %d sprogforslag (%d tydelige, %d små) og %d faner, hvor starten kan gøres mere trinvis (heraf %d med prioritet 1). %d faner er vurderet fine, som de er.
<ul><li><a href="#sprog">Del 1: Spørgsmål, der ikke kan stå alene</a></li><li><a href="#start">Del 2: For meget på én gang ved starten</a></li>%s</ul></div>
<h2 id="sprog">Del 1: Spørgsmål, der ikke kan stå alene</h2>
<p class="intro">Venstre side er kortet, som det står nu, og højre side er forslaget. Den halvfede linje er spørgsmålet. Testen er: Kan eleven forstå det halvfede uden at læse den almindelige skrift?</p>
<div class="boks"><label class="nr"><input type="checkbox" class="byg" value="G1"> G1</label> <b>Fælles greb: Spørgsmålet på sin egen linje i alle animationer.</b> I dag står det halvfede spørgsmål inde i samme afsnit som indledningen i 71 animationer. Kun Rumfang og fortynding har det på sin egen linje. Med en lille ændring i den fælles fil kommer spørgsmålet på sin egen linje overalt på én gang. Det virker kun godt, når spørgsmålene kan stå alene, så det hører sammen med forslagene herunder. Nogle kort bliver en linje højere, og det skal tjekkes animation for animation. Sæt flueben, hvis du vil have det.</div>
<nav class="menu">%s</nav>
%s
<h2 id="start">Del 2: For meget på én gang ved starten</h2>
<p class="intro">Hver boks viser startskærmen på fanen, hvad der er fremme, og et forslag til trin som i Rumfang og fortynding: Et spørgsmål ad gangen, og delen dukker op i scenen, når spørgsmålet er besvaret. Det rigtige svar står først i forslagene. Klik på et billede for at se det stort.</p>
<div class="boks"><b>Oversigt</b><ul>%s</ul></div>
%s
<details class="boks"><summary>Faner, der er fine, som de er (%d)</summary><ul>%s</ul></details>
%s
</main>
<div class="bjaelke"><div><span id="tekst"></span><button id="kopi">Kopiér</button></div></div>
<script>%s</script></body></html>""" % (
    CSS, antal_anim, antal_s, antal_sprog.get("tydelig", 0), antal_sprog.get("lille", 0), len(ikke_fint),
    sum(1 for _, s in ikke_fint if s.get("prioritet") == 1), len(fint),
    '<li><a href="#andet">Andet set undervejs</a></li>' if bem else "",
    menu_s, "".join(sprog_html), "".join(oversigt_t), "".join(start_html), len(fint), fint_html,
    ('<h2 id="andet">Andet set undervejs</h2><ul class="boks">%s</ul>' % bem_html) if bem else "", JS)

with open(UD, "w", encoding="utf-8") as fh:
    fh.write(side)
print("animationer", antal_anim, "sprog", antal_s, antal_sprog, "start ikke fint", len(ikke_fint), "fint", len(fint), "bemaerk", len(bem))
