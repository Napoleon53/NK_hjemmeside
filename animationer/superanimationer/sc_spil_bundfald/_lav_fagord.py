"""Laver js/fagord.js til Bundfald ud fra Kemibogens fagordslister (C- og B-bogen).

Kør det igen, når fagordslisterne i bogen er rettet:

    python _lav_fagord.py

Kilderne er fagord/*.qmd og b/fagord/*.qmd i NK_Undervisning/Kemibogen, i den rækkefølge,
de står i bogens _quarto.yml. Programmet låner reglerne for brikken (kortside: hele
forklaringen, når den er højst 90 tegn, ellers første sætning) fra bogens
vaerktoej/tjek_fagord.py, så spillet viser den samme tekst som Kort og godt og bogens link.
A-bogen er ikke med (den er skjult, se hukommelsen om kemibogen.dk).
"""
import datetime
import json
import os
import pathlib
import re
import sys

HER = pathlib.Path(__file__).resolve().parent


def find_bogen():
    kandidater = [os.environ.get("KEMIBOGEN_KILDE"),
                  pathlib.Path.home() / "NK_Undervisning" / "Kemibogen",
                  pathlib.Path("C:/NK_Undervisning/Kemibogen")]
    for k in kandidater:
        if k and (pathlib.Path(k) / "vaerktoej" / "tjek_fagord.py").exists():
            return pathlib.Path(k)
    sys.exit("Fandt ikke Kemibogens kilder (NK_Undervisning/Kemibogen). Sæt KEMIBOGEN_KILDE.")


BOG = find_bogen()
sys.path.insert(0, str(BOG / "vaerktoej"))
import tjek_fagord as T  # noqa: E402

SAENKET = dict(zip("0123456789+-−()aehiklmnoprstuvx",
                   "₀₁₂₃₄₅₆₇₈₉₊₋₋₍₎ₐₑₕᵢₖₗₘₙₒₚᵣₛₜᵤᵥₓ"))
HAEVET = dict(zip("0123456789+-−()n",
                  "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁻⁽⁾ⁿ"))


def omsaet(tekst, tabel):
    if all(t in tabel for t in tekst):
        return "".join(tabel[t] for t in tekst)
    return tekst


def ren(md):
    """Markdown til ren tekst med sænkede og hævede tegn: H~2~O bliver H₂O, 10^−7^ bliver 10⁻⁷."""
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", md)
    s = re.sub(r"\[([^\]]*)\]\{[^}]*\}", r"\1", s)
    s = s.replace("\\", "")
    s = re.sub(r"~([^~\s]+)~", lambda m: omsaet(m[1], SAENKET), s)
    s = re.sub(r"\^([^\^\s]+)\^", lambda m: omsaet(m[1], HAEVET), s)
    s = re.sub(r"[*`]", "", s)
    return re.sub(r"\s+", " ", s).strip()


def sider(yml, moenster):
    ud = []
    for linje in yml.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\s*-\s*fagord/(" + moenster + r")\.qmd\s*$", linje)
        if m and m[1] not in ud:
            ud.append(m[1])
    return ud


def laes_kapitel(fil, bog_id, slug):
    tekst = fil.read_text(encoding="utf-8")
    titel = re.search(r"^# Fagord til (.+?)\s*(\{[^}]*\})?\s*$", tekst, flags=re.M)[1].strip()
    if titel.startswith("Tema:"):
        nr = ""
        navn = titel
    else:
        nr = titel.replace("kapitel", "").strip()          # "1" eller "B1"
        link = re.search(r"\[([^\]]+)\]\(\.\./indledninger/", tekst)
        navn = link[1] if link else titel
    raekker, fejl = T.laes_side(fil)
    if fejl:
        sys.exit(f"{fil}: {fejl}")
    afsnit = []
    for _nr, afsnitstitel, ord_, _maal, forklaring in raekker:
        if not afsnit or afsnit[-1]["titel"] != afsnitstitel:
            afsnit.append({"titel": ren(afsnitstitel), "ord": []})
        lang = ren(forklaring)
        kort = T.kortside(lang)
        post = [ren(ord_), kort] + ([lang] if lang != kort else [])
        afsnit[-1]["ord"].append(post)
    return {"id": bog_id + "-" + slug, "nr": nr, "navn": navn, "afsnit": afsnit}


def som_js(dato, boeger):
    """JSON med ét fagord pr. linje, så filen er til at læse og sammenligne."""
    j = lambda x: json.dumps(x, ensure_ascii=False)  # noqa: E731
    ud = ["{", ' "dato": ' + j(dato) + ",", ' "boeger": [']
    for bi, b in enumerate(boeger):
        ud.append('  {"id": ' + j(b["id"]) + ', "navn": ' + j(b["navn"]) + ', "kapitler": [')
        for ki, k in enumerate(b["kapitler"]):
            ud.append('   {"id": ' + j(k["id"]) + ', "nr": ' + j(k["nr"]) + ', "navn": ' + j(k["navn"]) + ', "afsnit": [')
            for ai, a in enumerate(k["afsnit"]):
                ud.append('    {"titel": ' + j(a["titel"]) + ', "ord": [')
                ud += ["     " + j(o) + ("," if oi < len(a["ord"]) - 1 else "") for oi, o in enumerate(a["ord"])]
                ud.append("    ]}" + ("," if ai < len(k["afsnit"]) - 1 else ""))
            ud.append("   ]}" + ("," if ki < len(b["kapitler"]) - 1 else ""))
        ud.append("  ]}" + ("," if bi < len(boeger) - 1 else ""))
    ud.append(" ]")
    ud.append("}")
    return "\n".join(ud)


def main():
    boeger = [
        {"id": "c", "navn": "Kemi C", "kapitler": [
            laes_kapitel(BOG / "fagord" / (s + ".qmd"), "c", s)
            for s in sider(BOG / "_quarto.yml", r"kapitel-\d+|tema-[a-z-]+")]},
        {"id": "b", "navn": "Kemi B", "kapitler": [
            laes_kapitel(BOG / "b" / "fagord" / (s + ".qmd"), "b", s)
            for s in sider(BOG / "b" / "_quarto.yml", r"kapitel-b\d+")]},
    ]
    antal = {b["id"]: sum(len(a["ord"]) for k in b["kapitler"] for a in k["afsnit"]) for b in boeger}
    dato = datetime.date.today().isoformat()
    linjer = [
        "/* =====================================================================",
        "   fagord.js - Kemibogens fagordslister (C og B) til Bundfald",
        "",
        "   Lavet af _lav_fagord.py " + dato + " ud fra fagord/*.qmd og",
        "   b/fagord/*.qmd i NK_Undervisning/Kemibogen. Ret ikke i haanden: ret i",
        "   bogens fagordsliste, og koer scriptet igen.",
        "",
        "   Hvert fagord er [fagord, brik, lang]: brikken er hele forklaringen,",
        "   naar den er hoejst 90 tegn, ellers foerste saetning (samme regel som",
        "   Kort og godt og bogens link). lang er kun med, naar den er laengere.",
        "   ===================================================================== */",
        "window.NK = window.NK || {};",
        "NK.FAGORD = " + som_js(dato, boeger) + ";",
        "",
    ]
    (HER / "js").mkdir(exist_ok=True)
    (HER / "js" / "fagord.js").write_text("\n".join(linjer), encoding="utf-8", newline="\n")
    print("js/fagord.js:", ", ".join(f"{b['navn']} {antal[b['id']]} fagord i {len(b['kapitler'])} lister" for b in boeger))


if __name__ == "__main__":
    main()
