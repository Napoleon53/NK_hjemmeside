"""Spørgsmål og trinvis start i superanimationerne, 21. nov. 2026 (Niels: "Jeg er faktisk enig i alle dine forslag").
Rettelserne står som lister i ret/*.json ved siden af dette script, én fil pr. hjælper:
  [{"nr": 57, "fil": "sc3.4_blandbarhed/js/data.js", "gammel": "...", "ny": "...", "hvor": "fane 1, mål 2, spørgsmålet"}]
nr er sprogforslagets nummer i oversigten i Dropbox/2026.2027 ("Animationer - spørgsmål og trinvis start - 21. nov. 2026.html"),
se sprogforslag_nr.json. Et nummer kan have flere poster (spørgsmål, svar, hint, selvtest). "gammel" skal stå præcis én gang i filen.
Stier i "fil" er relative til animationer/superanimationer.
  python3 ret.py anvend ret/g01.json       sætter postene i filen ind (springer dem over, der allerede står)
  python3 ret.py tilbage 5 17               sætter nr. 5 og 17 tilbage til den gamle tekst (alle ret/*.json)
  python3 ret.py tjek                       viser poster, hvis nye tekst ikke står i filen"""
import glob, json, os, sys

ROD = os.path.expanduser("~/NK_hjemmeside/animationer/superanimationer")
HER = os.path.dirname(os.path.abspath(__file__))


def laes(sti):
    return json.load(open(sti, encoding="utf-8"))


def alle():
    ud = []
    for f in sorted(glob.glob(os.path.join(HER, "ret", "*.json"))):
        ud += laes(f)
    return ud


def skift(fil, fra, til, nr, frem=True):
    """frem: gammel -> ny (springes over, hvis ny allerede står der, også når gammel står inde i ny).
    tilbage: ny -> gammel (kun hvis ny står der præcis én gang)."""
    sti = os.path.join(ROD, fil)
    s = open(sti, encoding="utf-8").read()
    if frem and til in s:
        return 0
    if s.count(fra) == 1:
        open(sti, "w", encoding="utf-8").write(s.replace(fra, til))
        return 1
    if not frem and til in s and fra not in s:
        return 0
    print(f"nr. {nr}: teksten står {s.count(fra)} gange i {fil}, ikke præcis én gang")
    return 0


if len(sys.argv) > 2 and sys.argv[1] == "anvend":
    n = 0
    for sti in sys.argv[2:]:
        for r in laes(sti if os.path.isabs(sti) else os.path.join(HER, sti) if not os.path.exists(sti) else sti):
            n += skift(r["fil"], r["gammel"], r["ny"], r["nr"])
    print(f"{n} rettelser sat ind")
elif len(sys.argv) > 2 and sys.argv[1] == "tilbage":
    numre = {str(n) for n in sys.argv[2:]}
    for r in reversed(alle()):
        if str(r["nr"]) in numre and skift(r["fil"], r["ny"], r["gammel"], r["nr"], frem=False):
            print(f"nr. {r['nr']} sat tilbage i {r['fil']}")
elif len(sys.argv) > 1 and sys.argv[1] == "tjek":
    mangler = 0
    for r in alle():
        s = open(os.path.join(ROD, r["fil"]), encoding="utf-8").read()
        if r["ny"] not in s:
            mangler += 1
            print(f"nr. {r['nr']}: den nye tekst står ikke i {r['fil']}")
    print(f"{len(alle())} poster, {mangler} mangler")
else:
    print(__doc__)
