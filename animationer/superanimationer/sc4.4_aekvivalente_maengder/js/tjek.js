/* =====================================================================
   tjek.js - tjek af det, eleven skriver

   Tre slags svar: antal i hotdogordrerne (fane 1), koefficienter, naar
   skemaet skal afstemmes (fane 3, Svaer), og stofmaengder (fane 3). Et
   forkert tal faar en besked, der passer til fejlen: broeken vendt om,
   den kendte stofmaengde skrevet af, kun ganget eller kun divideret,
   koefficienten i stedet for stofmaengden, et andet stofs svar og kommaet.

   Svarene er { ok, besked, tom }. En stofmaengde er rigtig, naar den
   hoejst er 1 % fra facit.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var TOL = 0.01;

    /* ----- Tallet, eleven har skrevet ----------------------------------------
       "1,5", "1.5", "1,5 mol", " 16 " og "16 stk" er tal. Giver tallet eller null. */
    T.tal = function (raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        s = s.replace(/(mol|stk\.?|skiver|agurkeskiver|pølser|brød|hotdogs?)$/i, "");
        if (!/^[-+]?\d+(?:[.,]\d+)?$/.test(s)) return null;
        return parseFloat(s.replace(",", "."));
    };

    function naer(a, b, tol) {
        if (b === 0) return Math.abs(a) < 1e-9;
        return Math.abs(a - b) <= Math.abs(b) * (tol === undefined ? TOL : tol);
    }

    function n(id) { return "n(" + D.stof(id).formel + ")"; }

    /* Broeken skrevet paa én linje, fx "1/2" */
    T.broek = function (op, ned) { return op + "/" + ned; };

    /* ----- Fane 1: ordrerne ved poelsevognen ------------------------------------
       o: ordren (js/data.js) med opskriften (o.ops), antal pr. stk. (o.k),
       antallet (o.P) og ved "begr" det, der ligger (o.fyld), den
       begraensende ingrediens (o.begr) og overskuddet (o.over). */
    function helTal(raa) {
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv et antal." };
        var v = T.tal(raa);
        if (v === null) return { besked: "Skriv et tal, fx 6." };
        if (v !== Math.round(v)) return { besked: "Skriv et helt antal. Der er ingen halve." };
        return { v: v };
    }

    /* Hvor meget af ingrediensen id der skal bruges til o.P stk. */
    T.antal = function (raa, id, o) {
        var h = helTal(raa);
        if (h.v === undefined) return h;
        var v = h.v, P = o.P, k = o.k[id], ing = D.ingrediens(id), ops = o.ops;
        if (v === P * k) return { ok: true };
        if (k > 1) {
            if (v === P) return { besked: "Det er antallet af " + ops.flertal + ". Hver " + ops.navn + " skal have " + k + " " + ing.flertal + "." };
            if (v * k === P) return { besked: "Du har divideret med " + k + ". Der skal " + k + " pr. " + ops.navn + ", så der skal flere end " + ops.flertal + "." };
            if (v === P + k) return { besked: "Du har lagt " + k + " til. Der skal " + k + " til hver " + ops.navn + ", så gang med " + k + "." };
        } else {
            if (v === 2 * P || v === 3 * P) return { besked: "Der skal kun 1 " + ing.navn + " pr. " + ops.navn + "." };
            if (v * 2 === P) return { besked: "1 " + ing.navn + " pr. " + ops.navn + ". Der skal lige så mange som " + ops.flertal + "." };
        }
        return { besked: "Opskriften: " + k + " " + (k === 1 ? ing.navn : ing.flertal) + " pr. " + ops.navn + "." };
    };

    /* Den begraensende ingrediens: id er det, eleven har valgt */
    T.begr = function (id, o) {
        if (id === o.begr) return { ok: true };
        var ing = D.ingrediens(id), ops = o.ops, r = o.rakker[id];
        var faerrest = o.ops.led.every(function (l) { return l[0] === id || o.fyld[l[0]] > o.fyld[id]; });
        if (faerrest) return { besked: "Der er færrest " + ing.flertal + ", men de rækker til " + D.produkt(ops, r) + ". Hvad rækker de andre til?" };
        return { besked: D.stort(ing.bestemt) + " rækker til " + D.produkt(ops, r) + ". Hvad rækker de andre til?" };
    };

    /* Hvor mange stk. det, der ligger, rækker til */
    T.produkter = function (raa, o) {
        var h = helTal(raa);
        if (h.v === undefined) return h;
        var v = h.v, P = o.P, B = D.ingrediens(o.begr), nB = o.fyld[o.begr], kB = o.k[o.begr], ops = o.ops;
        if (v === P) return { ok: true };
        if (kB > 1 && v === nB) return { besked: "Det er antallet af " + B.flertal + ". Der går " + kB + " på hver " + ops.navn + "." };
        if (kB > 1 && v === nB * kB) return { besked: "Du har ganget med " + kB + ". Der går " + kB + " " + B.flertal + " på hver, så de rækker til færre." };
        var mindst = null;
        ops.led.forEach(function (l) { if (mindst === null || o.fyld[l[0]] < o.fyld[mindst]) mindst = l[0]; });
        if (v === o.fyld[mindst] && mindst !== o.begr) {
            return { besked: "Det er antallet af " + D.ingrediens(mindst).flertal + ". Men " + B.bestemt + " slipper op før." };
        }
        var sum = 0;
        ops.led.forEach(function (l) { sum += o.fyld[l[0]]; });
        if (v === sum) return { besked: "Det er alle ingredienserne lagt sammen. Hvor mange hele " + ops.flertal + " bliver det?" };
        if (v > P) return { besked: "Så mange er der ikke " + B.flertal + " til." };
        return { besked: "Der er " + B.flertal + " til flere end det." };
    };

    /* Overskuddet af ingrediensen id */
    T.overskud = function (raa, id, o) {
        var h = helTal(raa);
        if (h.v === undefined) return h;
        var v = h.v, ing = D.ingrediens(id), k = o.k[id], n = o.fyld[id], brugt = o.P * k, c = n - brugt;
        if (v === c) return { ok: true };
        if (v < 0) return { besked: "Overskuddet kan ikke være under 0." };
        if (v === brugt) return { besked: "Det er de " + ing.flertal + ", der bliver brugt. Hvor mange ligger der tilbage?" };
        if (v === n) return { besked: "Det er alle " + ing.bestemt + ". Nogle af dem bliver brugt." };
        if (k > 1 && v === n - o.P) return { besked: "Der går " + k + " " + ing.flertal + " på hver " + o.ops.navn + "." };
        return { besked: "Overskuddet er det, der ligger, minus det, der bliver brugt." };
    };

    /* ----- Fane 3: koefficienterne, naar skemaet skal afstemmes ----------------
       raa: det, der staar i felterne, i ledenes raekkefoelge. */
    T.koefficienter = function (raa, r) {
        if (raa.some(function (x) { return !String(x || "").trim(); })) {
            return { tom: true, besked: "Skriv en koefficient foran hvert stof. Skriv 1, hvis der kun skal være ét." };
        }
        var k = raa.map(function (x) { return T.tal(x); });
        if (k.some(function (x) { return x === null || x !== Math.round(x) || x < 1; })) {
            return { besked: "Koefficienterne er hele tal, mindst 1." };
        }
        var a = D.afstemt(r, k);
        if (!a.ok) {
            return { besked: "Der er " + a.v + " " + a.grundstof + " til venstre og " + a.h + " " + a.grundstof + " til højre.",
                grundstof: a.grundstof };
        }
        var g = k.reduce(function (x, y) { return NK.gcd(x, y); });
        if (g > 1) return { besked: "Skemaet er afstemt, men forkort til de mindste hele tal." };
        return { ok: true, k: k };
    };

    /* ----- Fane 3: en stofmaengde ------------------------------------------------
       o: opgaven, j: ledet, eleven skriver stofmaengden for. */
    T.mol = function (raa, o, j) {
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv stofmængden i mol." };
        var v = T.tal(raa);
        if (v === null) return { besked: "Skriv et tal, fx 1,5." };
        var r = o.r, led = r.led[j], kendt = r.led[o.kendt];
        var facit = o.svar[j].v, nk = o.n, kj = led.k, kk = kendt.k;
        var X = D.stof(led.s).formel, K = D.stof(kendt.s).formel;
        if (naer(v, facit)) return { ok: true };
        if (kj !== kk && naer(v, nk * kk / kj)) {
            return { besked: "Brøken er vendt om. Koefficienten for " + X + " skal stå øverst: " + n(led.s) + " = " +
                T.broek(kj, kk) + " · " + n(kendt.s) + "." };
        }
        if (kj !== kk && naer(v, nk)) {
            return { besked: "Det er stofmængden af " + K + ". " + X + " og " + K + " reagerer i forholdet " + kj + " : " + kk + ", ikke 1 : 1." };
        }
        if (kk !== 1 && naer(v, nk * kj)) return { besked: "Du har ganget med " + kj + ", men ikke divideret med " + kk + "." };
        if (kj !== 1 && naer(v, nk / kk)) return { besked: "Du har divideret med " + kk + ", men ikke ganget med " + kj + "." };
        if (naer(v, kj) && !naer(kj, facit)) return { besked: "Det er koefficienten. Den giver forholdet, ikke stofmængden." };
        for (var m = 0; m < r.led.length; m++) {
            if (m === j || m === o.kendt) continue;
            if (naer(v, o.svar[m].v) && !naer(o.svar[m].v, facit)) {
                return { besked: "Det er stofmængden af " + D.stof(r.led[m].s).formel + ". Her skal du finde " + X + "." };
            }
        }
        if (naer(v, facit * 10) || naer(v, facit / 10) || naer(v, facit * 100) || naer(v, facit / 100)) {
            return { besked: "Tjek kommaet. Tallet er for " + (v > facit ? "stort." : "lille.") };
        }
        if (naer(v, facit, 0.05)) return { besked: "Tæt på. Regn efter." };
        return { besked: "Brug forholdet mellem koefficienterne: " + n(led.s) + " = " + T.broek(kj, kk) + " · " + n(kendt.s) + "." };
    };

    NK.Tjek = T;
}());
