/* =====================================================================
   ez.js - modellen: prioriteten, E og Z, og alle beskederne

   Prioriteten regnes som i bogen (Cahn-Ingold-Prelog, kort udgave):
     1. Det atom, der sidder paa C-atomet: hoejest atomnummer vinder.
     2. Er det det samme atom, sammenlignes de atomer, der sidder paa det,
        det stoerste foerst. En C=O taeller som to O.
   Grupperne i data.js er valgt, saa to forskellige grupper altid er
   afgjort efter trin 2.

   Et molekyle er pos = [venstre oppe, venstre nede, hoejre oppe, hoejre nede].
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var EZ = {};

    function g(id) { return D.G[id]; }
    function zListe(id) {
        return g(id).naeste.map(function (a) { return D.Z[a]; }).sort(function (a, b) { return b - a; });
    }

    /* >0: a har hoejest prioritet, <0: b, 0: ens */
    EZ.sammenlign = function (a, b) {
        if (a === b) return 0;
        var za = D.Z[g(a).atom], zb = D.Z[g(b).atom];
        if (za !== zb) return za - zb;
        var la = zListe(a), lb = zListe(b);
        for (var i = 0; i < Math.max(la.length, lb.length); i++) {
            var va = la[i] || 0, vb = lb[i] || 0;
            if (va !== vb) return va - vb;
        }
        return 0;
    };

    /* "Cl (17)" eller "C (6) i CH₂CH₃" */
    function atomDel(id) {
        var a = g(id).atom, t = D.tekst(id);
        return t === a ? a + " (" + D.Z[a] + ")" : a + " (" + D.Z[a] + ") i " + t;
    }

    function naesteTekst(id) {
        var n = g(id).naeste.slice().sort(function (x, y) { return D.Z[y] - D.Z[x]; });
        return n.join(", ") + (id === "COOH" ? " (C=O tæller som to O)" : "");
    }

    /* Hvorfor vinder den ene? Én saetning til beskeder og hint */
    EZ.hvorfor = function (a, b) {
        var d = EZ.sammenlign(a, b);
        if (d === 0) return "De to grupper er ens: " + D.tekst(a) + " og " + D.tekst(b) + ".";
        var v = d > 0 ? a : b, t = d > 0 ? b : a;
        if (g(v).atom !== g(t).atom) return atomDel(v) + " slår " + atomDel(t) + ".";
        var la = zListe(v), lb = zListe(t), i = 0;
        while (i < la.length && (la[i] || 0) === (lb[i] || 0)) i++;
        var navnV = sym(la[i]), navnT = lb[i] ? sym(lb[i]) : "ingenting";
        return "Begge starter med " + g(v).atom + " (" + D.Z[g(v).atom] + "). Så ser man på atomerne på " + g(v).atom + ": " +
            D.tekst(v) + " har " + naesteTekst(v) + ", og " + D.tekst(t) + " har " + naesteTekst(t) + ". " +
            navnV + " slår " + navnT + ".";
    };

    function sym(z) {
        for (var k in D.Z) if (D.Z[k] === z) return k;
        return "?";
    }

    /* Er de to grupper afgjort allerede ved det foerste atom? */
    EZ.foersteAtom = function (a, b) { return g(a).atom !== g(b).atom; };

    /* ----- Molekylet ----------------------------------------------------------------- */
    EZ.analyser = function (pos) {
        var sv = EZ.sammenlign(pos[0], pos[1]), sh = EZ.sammenlign(pos[2], pos[3]);
        var r = { pos: pos.slice(), ensV: sv === 0, ensH: sh === 0,
                  v: sv === 0 ? -1 : (sv > 0 ? 0 : 1), h: sh === 0 ? -1 : (sh > 0 ? 2 : 3) };
        if (sv === 0 || sh === 0) r.type = "ingen";
        else r.type = ((r.v === 0) === (r.h === 2)) ? "Z" : "E";
        return r;
    };

    EZ.TYPENAVN = { E: "E", Z: "Z", ingen: "ingen E/Z-isomeri" };

    /* Konklusionen i én saetning */
    EZ.dom = function (r) {
        if (r.type === "ingen") {
            var side = r.ensV ? 0 : 2;
            return "Det " + (side === 0 ? "venstre" : "højre") + " C-atom har to ens grupper (" + D.tekst(r.pos[side]) + " og " +
                D.tekst(r.pos[side + 1]) + "). Så er der ingen E/Z-isomeri.";
        }
        var a = D.tekst(r.pos[r.v]), b = D.tekst(r.pos[r.h]);
        var par = a === b ? "De to " + a : a + " og " + b;
        return r.type === "Z" ?
            par + " har højest prioritet og sidder på samme side. Det er Z." :
            par + " har højest prioritet og sidder på hver sin side. Det er E.";
    };

    /* ----- Et forkert svar: forklaringen passer til fejlen ----------------------------- */
    EZ.fejl = function (r, svar) {
        var p = r.pos;
        if (r.type === "ingen") {
            return EZ.dom(r);
        }
        if (svar === "ingen") {
            return "Begge C-atomer har to forskellige grupper, så der findes to former. Find den gruppe, der vinder på hvert C-atom.";
        }
        /* Cis-faelden: den samme gruppe sidder paa begge C-atomer, paa samme
           side (eleven svarede Z) eller paa hver sin side (eleven svarede E),
           men den vinder ikke paa begge */
        var vinderV = p[r.v], vinderH = p[r.h];
        var faelde = null;
        var par = svar === "Z" ? [[0, 2], [1, 3]] : [[0, 3], [1, 2]];
        par.forEach(function (pr) {
            if (faelde) return;
            if (p[pr[0]] === p[pr[1]] && !(pr[0] === r.v && pr[1] === r.h)) faelde = pr;
        });
        var vinderTekst = "De to vindere er " + D.tekst(vinderV) + " til venstre og " + D.tekst(vinderH) + " til højre";
        var sideTekst = r.type === "Z" ? "De sidder på samme side: Z." : "De sidder på hver sin side: E.";
        if (faelde) {
            var ens = D.tekst(p[faelde[0]]);
            var tabSide = faelde[0] !== r.v ? 0 : 2;
            var vinder = tabSide === 0 ? vinderV : vinderH, taber = p[faelde[tabSide === 0 ? 0 : 1]];
            return "De to " + ens + " sidder på " + (svar === "Z" ? "samme side" : "hver sin side") +
                ", men det er ikke dem, der tæller. Til " + (tabSide === 0 ? "venstre" : "højre") + " slår " + D.tekst(vinder) +
                " " + D.tekst(taber) + ". " + vinderTekst + ". " + sideTekst;
        }
        /* Stoerrelsesfaelden: den lange gruppe taber til et enkelt atom */
        var stor = null;
        [[0, 1, r.v], [2, 3, r.h]].forEach(function (s) {
            var tab = s[2] === s[0] ? s[1] : s[0];
            if (D.tekst(p[tab]).length > D.tekst(p[s[2]]).length + 1 && EZ.foersteAtom(p[tab], p[s[2]])) stor = { v: p[s[2]], t: p[tab] };
        });
        if (stor) {
            return "Det er ikke gruppens størrelse, der tæller, men atomnummeret på det atom, der sidder på C-atomet: " +
                EZ.hvorfor(stor.v, stor.t) + " " + vinderTekst + ". " + sideTekst;
        }
        return vinderTekst + ". " + sideTekst;
    };

    /* ----- Hinttrapperne paa fane 2 -------------------------------------------------- */
    EZ.hintSide = function (pos, side) {
        var i = side === "v" ? 0 : 2, a = pos[i], b = pos[i + 1];
        var navn = side === "v" ? "venstre" : "højre";
        var d = EZ.sammenlign(a, b);
        var t2;
        if (d === 0) t2 = "Til " + navn + " står " + D.tekst(a) + " og " + D.tekst(b) + ". De er ens.";
        else if (EZ.foersteAtom(a, b)) t2 = "Til " + navn + ": " + atomDel(a) + " og " + atomDel(b) + ".";
        else t2 = "Til " + navn + " starter begge grupper med " + g(a).atom + ". Se på atomerne på " + g(a).atom + ": " +
            D.tekst(a) + " har " + naesteTekst(a) + ", og " + D.tekst(b) + " har " + naesteTekst(b) + ".";
        var vinder = d > 0 ? a : b;
        return [
            "Se kun på det " + navn + " C-atom. Find atomnummeret på det atom i hver gruppe, der sidder på C-atomet. Det højeste vinder.",
            t2,
            d === 0 ? "Klik på en af dem. To ens grupper betyder, at der ikke er nogen E/Z-isomeri." :
                "Klik på " + D.tekst(vinder) + ". Den har højest prioritet til " + navn + "."
        ];
    };

    EZ.hintSvar = function (r) {
        if (r.type === "ingen") {
            return [
                "Et C-atom med to ens grupper giver kun én form af molekylet.",
                "Det " + (r.ensV ? "venstre" : "højre") + " C-atom har to ens grupper.",
                "Vælg Ingen E/Z-isomeri."
            ];
        }
        var a = D.tekst(r.pos[r.v]), b = D.tekst(r.pos[r.h]);
        return [
            "Z (zusammen) betyder, at de to vindere sidder på samme side. E (entgegen) betyder på hver sin side.",
            "Følg den stiplede linje mellem " + a + " og " + b + ". Går den lige over, eller går den på skrå?",
            r.type === "Z" ? a + " og " + b + " sidder på samme side. Vælg Z." : a + " og " + b + " sidder på hver sin side. Vælg E."
        ];
    };

    /* ----- Byg selv: kravene ---------------------------------------------------------- */
    function harPaa(pos, id, side) {
        return side === "v" ? (pos[0] === id || pos[1] === id) : (pos[2] === id || pos[3] === id);
    }

    EZ.tjekByg = function (o, pos) {
        if (pos.some(function (x) { return !x; })) return { ok: false, tekst: "Der mangler en gruppe på en af pladserne." };
        var r = EZ.analyser(pos);
        var typeTekst = r.type === "ingen" ? "uden E/Z-isomeri" : r.type;
        var nu = " Som det står nu, er molekylet " + typeTekst + ".";
        if (o.krav === "brcl") {
            if (!((harPaa(pos, "Br", "v") && harPaa(pos, "Cl", "h")) || (harPaa(pos, "Cl", "v") && harPaa(pos, "Br", "h"))))
                return { ok: false, tekst: "Der skal være Br på det ene C-atom og Cl på det andet." + nu };
            if (r.type !== "Z") return { ok: false, tekst: EZ.dom(r) + " Der skal stå Z." };
        } else if (o.krav === "ch3e") {
            var ens = (pos[0] === "CH3" && pos[2] === "CH3") || (pos[1] === "CH3" && pos[3] === "CH3");
            if (!ens) return { ok: false, tekst: "De to CH₃ skal sidde på hvert sit C-atom og på samme side, fx begge øverst." + nu };
            if (r.type !== "E") return { ok: false, tekst: EZ.dom(r) + " Der skal stå E, selv om CH₃ sidder på samme side." };
        } else if (o.krav === "ingenH") {
            if (pos.indexOf("H") >= 0) return { ok: false, tekst: "Ingen af grupperne må være H." + nu };
            if (r.type !== "ingen") return { ok: false, tekst: "Begge C-atomer har to forskellige grupper, så der er E/Z-isomeri." + nu };
        } else if (o.krav === "fireZ") {
            var forsk = pos.filter(function (x, i) { return pos.indexOf(x) === i; }).length === 4;
            if (!forsk) return { ok: false, tekst: "De fire grupper skal være forskellige." + nu };
            if (r.type !== "Z") return { ok: false, tekst: EZ.dom(r) + " Der skal stå Z." };
        }
        return { ok: true, tekst: EZ.dom(r), r: r };
    };

    EZ.hintByg = function (o) {
        return {
            brcl: [
                "Z betyder, at de to grupper med højest prioritet sidder på samme side.",
                "Sæt H ved siden af Br og ved siden af Cl. Så har Br og Cl højest prioritet på hvert sit C-atom.",
                "Sæt Br øverst til venstre og Cl øverst til højre, og H på de to andre pladser."
            ],
            ch3e: [
                "E betyder, at de to grupper med højest prioritet sidder på hver sin side.",
                "Sæt CH₃ øverst på begge C-atomer. Så skal CH₃ tabe på det ene C-atom til en gruppe med et højere atomnummer.",
                "Sæt H under CH₃ til venstre og Br under CH₃ til højre."
            ],
            ingenH: [
                "Der er ingen E/Z-isomeri, når det ene C-atom har to ens grupper.",
                "Sæt to ens grupper på det samme C-atom, fx to CH₃.",
                "Sæt CH₃ og CH₃ til venstre og Cl og Br til højre."
            ],
            fireZ: [
                "Fire forskellige grupper, og de to vindere skal sidde på samme side.",
                "Find vinderen på hvert C-atom med atomnumrene. Br (35) slår C (6) i CH₃, og Cl (17) slår H (1).",
                "Sæt Br og CH₃ til venstre og Cl og H til højre, med Br og Cl øverst."
            ]
        }[o.krav];
    };

    /* ----- Spillet: et tilfaeldigt molekyle af en bestemt slags ------------------------
       Hver fjerde E eller Z er en faelde: den samme gruppe paa begge C-atomer,
       men den vinder kun paa det ene. */
    EZ.tilfaeldigt = function (type, faelde) {
        var ids = D.PALET;
        for (var n = 0; n < 4000; n++) {
            var pos = [NK.tilfaeldig(ids), NK.tilfaeldig(ids), NK.tilfaeldig(ids), NK.tilfaeldig(ids)];
            if (pos.every(function (x) { return x === "H"; })) continue;
            var r = EZ.analyser(pos);
            if (r.type !== type) continue;
            if (type === "ingen" && pos[0] === pos[1] && pos[2] === pos[3]) continue;
            if (faelde && type !== "ingen") {
                var f = (pos[0] === pos[2] && r.v !== 0) || (pos[1] === pos[3] && r.v !== 1) ||
                        (pos[0] === pos[3] && r.v !== 0) || (pos[1] === pos[2] && r.v !== 1);
                if (!f) continue;
            }
            return pos;
        }
        return type === "Z" ? ["Cl", "H", "Cl", "H"] : (type === "E" ? ["Cl", "H", "H", "Cl"] : ["H", "H", "Cl", "H"]);
    };

    NK.EZ = EZ;
}());
