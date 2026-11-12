"""Sprogrunden i superanimationerne fra 12. nov. 2026 (Niels: intet indforstået, skarpt men letforståeligt sprog).
Listen står i ret.json ved siden af: {"nr", "fil", "gammel", "ny", "hvorfor", "hvor"} (+ "kopier" for fælles filer,
der står ens i flere animationer). nr er nummeret i HTML-oversigten i Dropbox/2026.2027. Køres fra hvor som helst:
  python3 ~/NK_hjemmeside/.claude/sprogrunde/ret.py anvend          sætter alle rettelser ind (springer dem over, der allerede står)
  python3 ~/NK_hjemmeside/.claude/sprogrunde/ret.py tilbage 5 17    sætter nr. 5 og 17 tilbage til den gamle tekst
Stier i "fil" og "kopier" er relative til animationer/superanimationer."""
import json, os, sys

ROD = os.path.expanduser("~/NK_hjemmeside/animationer/superanimationer")
liste = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "ret.json"), encoding="utf-8"))


def skift(fil, fra, til, nr):
    sti = os.path.join(ROD, fil)
    s = open(sti, encoding="utf-8").read()
    if s.count(fra) == 1:
        open(sti, "w", encoding="utf-8").write(s.replace(fra, til))
        return True
    if s.count(til) >= 1:
        return False
    print(f"nr. {nr}: teksten findes ikke præcis én gang i {fil}")
    return False


if len(sys.argv) > 1 and sys.argv[1] == "tilbage":
    numre = {int(n) for n in sys.argv[2:]}
    for r in reversed(liste):
        if r["nr"] in numre:
            for fil in [r["fil"]] + r.get("kopier", []):
                if skift(fil, r["ny"], r["gammel"], r["nr"]):
                    print(f"nr. {r['nr']} sat tilbage i {fil}")
elif len(sys.argv) > 1 and sys.argv[1] == "anvend":
    n = 0
    for r in liste:
        for fil in [r["fil"]] + r.get("kopier", []):
            n += skift(fil, r["gammel"], r["ny"], r["nr"])
    print(f"{n} rettelser sat ind")
else:
    print(__doc__)
