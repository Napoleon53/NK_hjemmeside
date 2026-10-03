/* =====================================================================
   kiral.js - modellen: prioriteten, R og S og de asymmetriske C-atomer

   Prioriteten (som i sb4.6, den korte udgave af Cahn-Ingold-Prelog):
     1. Det atom, der sidder paa C-atomet: hoejest atomnummer vinder.
     2. Er det det samme atom, sammenlignes de atomer, der sidder paa det,
        det stoerste foerst. En C=O taeller som to O.

   R og S: med gruppe 4 vendt vaek fra den, der kigger, gaar 1 > 2 > 3
   med uret (R) eller mod uret (S). I rummet her (x mod hoejre, y nedad,
   z ind i skaermen) er det fortegnet paa v1 · (v2 × v3): negativt er R.
   Selvtesten tjekker det mod det, man ser paa skaermen.

   Fane 2: et C-atom er asymmetrisk, naar det har fire forskellige
   grupper. Grupperne sammenlignes som traeer (ringe lukkes med et
   maerke), saa de to veje rundt i en ring ogsaa kan skelnes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var R = NK.Rum;
    var K = {};

    function g(id) { return D.G[id]; }
    function zListe(id) {
        return g(id).naeste.map(function (a) { return D.Z[a]; }).sort(function (a, b) { return b - a; });
    }
    function sym(z) { for (var s in D.Z) if (D.Z[s] === z) return s; return "?"; }

    /* >0: a har hoejest prioritet, <0: b, 0: ens */
    K.sammenlign = function (a, b) {
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

    /* Pladserne (0-3) sorteret efter prioritet, hoejest foerst */
    K.raekkefoelge = function (grupper) {
        return [0, 1, 2, 3].sort(function (i, j) { return K.sammenlign(grupper[j], grupper[i]) || i - j; });
    };

    K.chiralt = function (grupper) {
        for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) if (grupper[i] === grupper[j]) return false;
        return true;
    };

    function atomDel(id) {
        var a = g(id).atom, t = D.tekst(id);
        return t === a ? a + " (" + D.Z[a] + ")" : a + " (" + D.Z[a] + ") i " + t;
    }
    K.atomDel = atomDel;

    function naesteTekst(id) {
        var n = g(id).naeste.slice().sort(function (x, y) { return D.Z[y] - D.Z[x]; });
        return n.join(", ") + (id === "COOH" || id === "CHO" ? " (C=O tæller som to O)" : "");
    }

    /* Hvorfor vinder den ene? */
    K.hvorfor = function (a, b) {
        var d = K.sammenlign(a, b);
        if (d === 0) return "De to grupper er ens.";
        var v = d > 0 ? a : b, t = d > 0 ? b : a;
        if (g(v).atom !== g(t).atom) return atomDel(v) + " slår " + atomDel(t) + ".";
        var la = zListe(v), lb = zListe(t), i = 0;
        while (i < la.length && (la[i] || 0) === (lb[i] || 0)) i++;
        return "Begge starter med " + g(v).atom + ". Atomerne på " + g(v).atom + ": " + D.tekst(v) + " har " + naesteTekst(v) +
            ", og " + D.tekst(t) + " har " + naesteTekst(t) + ". " + sym(la[i]) + " slår " + (lb[i] ? sym(lb[i]) : "ingenting") + ".";
    };

    /* De grupper, der endnu ikke har faaet et nummer, med deres foerste atom */
    K.tilbageTekst = function (grupper, rest) {
        return rest.map(function (i) { return atomDel(grupper[i]); }).join(", ");
    };

    /* Er de grupper, der er tilbage, kun afgjort ved naeste atom? */
    K.uafgjortVedFoerste = function (grupper, rest) {
        var bedst = rest.map(function (i) { return D.Z[g(grupper[i]).atom]; }).sort(function (a, b) { return b - a; });
        return bedst.length > 1 && bedst[0] === bedst[1];
    };

    /* ----- R og S ----------------------------------------------------------------- */
    K.rs = function (grupper, retninger) {
        if (!K.chiralt(grupper)) return null;
        var o = K.raekkefoelge(grupper);
        var v1 = retninger[o[0]], v2 = retninger[o[1]], v3 = retninger[o[2]];
        return R.prik(v1, R.kryds(v2, v3)) < 0 ? "R" : "S";
    };

    /* Peger gruppe 4 vaek fra den, der kigger? (z er ind i skaermen) */
    K.firePegerVaek = function (grupper, retninger, graense) {
        var o = K.raekkefoelge(grupper);
        return retninger[o[3]][2] > (graense === undefined ? 0.94 : graense);
    };

    /* ----- Fane 2: molekyler fra molekylemotoren ---------------------------------------- */
    function bind(mol, a, b) { return mol.binding(a, b); }

    /* Gruppen fra atomet a ud gennem naboen b, som et traer skrevet som tekst */
    function trae(mol, b, fra, sti, dybde) {
        var at = mol.atom(b);
        if (sti[b]) return at.el + "*";
        if (dybde > 14) return at.el + "…";
        var ny = Object.create(sti);
        ny[b] = true;
        var boern = [];
        mol.naboer(b).forEach(function (n) {
            if (n === fra) return;
            var bd = bind(mol, b, n);
            boern.push((bd && bd.orden > 1 ? "=" + bd.orden : "") + trae(mol, n, b, ny, dybde + 1));
        });
        for (var h = 0; h < mol.implicitH(b); h++) boern.push("H");
        boern.sort();
        return at.el + (at.q ? "q" + at.q : "") + "(" + boern.join(",") + ")";
    }

    /* De fire grupper paa et C-atom: [{ n (atom-id eller null for H), noegle }] */
    K.grupperPaa = function (mol, id) {
        var ud = [];
        mol.naboer(id).forEach(function (n) {
            var bd = bind(mol, id, n);
            var start = {}; start[id] = true;
            ud.push({ n: n, orden: bd ? bd.orden : 1, noegle: (bd && bd.orden > 1 ? "=" : "") + trae(mol, n, id, start, 0) });
        });
        for (var h = 0; h < mol.implicitH(id); h++) ud.push({ n: null, orden: 1, noegle: "H" });
        return ud;
    };

    /* Hvorfor er det IKKE et asymmetrisk C-atom? (null, hvis det er) */
    K.grund = function (mol, id) {
        var a = mol.atom(id);
        if (a.el !== "C") return "Det er et " + a.el + "-atom. Kun C-atomer kan være asymmetriske her.";
        var gr = K.grupperPaa(mol, id);
        if (gr.some(function (x) { return x.orden > 1; }) || gr.length < 4) {
            return "Det C-atom har en dobbeltbinding og derfor kun tre grupper.";
        }
        var h = gr.filter(function (x) { return x.noegle === "H"; }).length;
        if (h >= 2) return "Det C-atom har " + (h === 3 ? "tre" : "to") + " H.";
        for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) {
            if (gr[i].noegle === gr[j].noegle) {
                var t = K.gruppeTekst(mol, gr[i].n, id);
                return "Det C-atom har to ens grupper: " + t + " og " + t + ".";
            }
        }
        return null;
    };

    K.asymmetriske = function (mol) {
        return mol.atomer.filter(function (a) { return a.el === "C" && K.grund(mol, a.id) === null; }).map(function (a) { return a.id; });
    };

    /* ----- Gruppen skrevet som en kort formel: CH₂CH₃, COOH, CH(CH₃)₂ --------------------- */
    function harRing(mol, n, fra) {
        /* Grenen fra n (uden fra) indeholder en ring, hvis der er flere
           bindinger end atomer minus én */
        var atomer = {}, ko = [n];
        atomer[n] = true;
        while (ko.length) {
            var x = ko.shift();
            mol.naboer(x).forEach(function (y) {
                if (y === fra || atomer[y]) return;
                atomer[y] = true;
                ko.push(y);
            });
        }
        var ids = Object.keys(atomer).map(Number);
        var bd = mol.bindinger.filter(function (b) { return atomer[b.a] && atomer[b.b]; }).length;
        return bd >= ids.length;
    }

    function hT(h) { return h ? "H" + (h > 1 ? NK.saenket(h) : "") : ""; }

    function formel(mol, b, fra) {
        var a = mol.atom(b), h = mol.implicitH(b);
        var boern = mol.naboer(b).filter(function (n) { return n !== fra; });
        if (a.el === "O") return boern.length ? "O" + formel(mol, boern[0], b) : "OH";
        if (a.el === "N") return "N" + hT(h) + boern.map(function (n) { return formel(mol, n, b); }).join("");
        if (a.el !== "C") return a.el;
        var dO = boern.filter(function (n) { var x = bind(mol, b, n); return mol.atom(n).el === "O" && x && x.orden === 2; });
        if (dO.length) {
            var rest = boern.filter(function (n) { return dO.indexOf(n) < 0; });
            var oh = rest.filter(function (n) { return mol.atom(n).el === "O" && mol.implicitH(n) === 1; });
            if (oh.length) return "COOH";
            if (h === 1) return "CHO";
            return "CO" + rest.map(function (n) { return formel(mol, n, b); }).join("");
        }
        var tekster = boern.map(function (n) { return formel(mol, n, b); });
        if (!tekster.length) return "C" + hT(h);
        if (tekster.length === 1) return "C" + hT(h) + tekster[0];
        /* Flere grene: de ens samles i en parentes med tal, den laengste staar sidst */
        tekster.sort(function (x, y) { return x.length - y.length; });
        var sidste = tekster.pop(), taelling = {};
        tekster.forEach(function (t) { taelling[t] = (taelling[t] || 0) + 1; });
        var foran = Object.keys(taelling).map(function (t) { return "(" + t + ")" + (taelling[t] > 1 ? NK.saenket(taelling[t]) : ""); }).join("");
        if (taelling[sidste] && !foran.match(/\)[₂₃]/)) {
            return "C" + hT(h) + "(" + sidste + ")" + NK.saenket(taelling[sidste] + 1);
        }
        return "C" + hT(h) + foran + sidste;
    }

    K.gruppeTekst = function (mol, n, fra) {
        if (n === null) return "H";
        if (harRing(mol, n, fra)) return "en gren med en ring";
        return formel(mol, n, fra);
    };

    /* De fire grupper som tekst, til hintet: "H, CH₃, OH og CH₂CH₃" */
    K.grupperTekst = function (mol, id) {
        var t = K.grupperPaa(mol, id).map(function (x) { return K.gruppeTekst(mol, x.n, id); });
        return t.slice(0, -1).join(", ") + " og " + t[t.length - 1];
    };

    NK.Kiral = K;
}());
