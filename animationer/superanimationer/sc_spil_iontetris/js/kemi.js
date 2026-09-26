/* =====================================================================
   kemi.js - formler, ionligninger og reglen for, hvornaar ioner bliver
   til salt

   Reglen: brikker, der roerer hinanden, bliver til salt, naar de er
   praecis én formelenhed af ét salt. Det er én slags positiv ion og én
   slags negativ ion i det forhold, der faar ladningerne til at gaa lige
   op: Al³⁺ og tre Cl⁻ bliver til AlCl₃, to Al³⁺ og tre O²⁻ til Al₂O₃.
   Brikkerne skal hænge sammen, men ikke alle behoever at roere den
   positive ion: tre Cl⁻ i en kaede, hvor den ene roerer Al³⁺, er nok.

   Kan flere grupper reagere, vaelges den, der har den nye brik med,
   saa den mindste, saa den med de aeldste brikker. Saa bliver en
   tilovers ion ikke til en prop, der blokerer alt, den roerer: Mg²⁺ og
   O²⁻ reagerer, selv om en Na⁺ ogsaa roerer dem.

   Filen tegner ikke og kender ikke brættet. Den faar brikkerne som en
   graf: noder { id: { ion, orden } } og kanter { id: { id2: true } }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function ion(id) { return D.IONER[id]; }

    /* Na⁺, SO₄²⁻ */
    function ionTekst(i) {
        return i.sym + NK.ladningHaevet(i.q);
    }

    /* Forholdet mellem ionerne: x positive for hver y negative. */
    function forhold(kat, an) {
        var g = NK.gcd(kat.q, an.q);
        return { x: Math.abs(an.q) / g, y: kat.q / g };
    }

    function del(i, n) {
        if (n === 1) return i.sym;
        return (i.sammensat ? "(" + i.sym + ")" : i.sym) + NK.saenket(n);
    }

    /* Formlen for saltet: NaCl, MgCl₂, Al₂O₃, Mg(OH)₂, Al₂(SO₄)₃ */
    function formel(kat, an) {
        var f = forhold(kat, an);
        return del(kat, f.x) + del(an, f.y);
    }

    /* 2 Al³⁺ + 3 O²⁻ → Al₂O₃ */
    function ionligning(kat, an) {
        var f = forhold(kat, an);
        return (f.x > 1 ? f.x + " " : "") + ionTekst(kat) + " + "
            + (f.y > 1 ? f.y + " " : "") + ionTekst(an) + " → " + formel(kat, an);
    }

    /* Alle salte paa en sværhedsgrad, i den raekkefoelge de staar i panelet */
    function salte(niveau) {
        var ud = [];
        niveau.kat.forEach(function (k) {
            niveau.an.forEach(function (a) {
                var kat = ion(k), an = ion(a), f = forhold(kat, an);
                ud.push({ noegle: k + "-" + a, kat: kat, an: an, x: f.x, y: f.y,
                          stoerrelse: f.x + f.y, formel: formel(kat, an) });
            });
        });
        return ud;
    }

    /* Ionerne til én formelenhed, som en liste af ion-id'er */
    function enhedsIoner(salt) {
        var ud = [], i;
        for (i = 0; i < salt.x; i++) ud.push(salt.kat.id);
        for (i = 0; i < salt.y; i++) ud.push(salt.an.id);
        return ud;
    }

    /* ----- Reaktionssoegningen ------------------------------------------ */

    /* Alle sammenhaengende delmaengder med praecis x af kat og y af an,
       bygget kun af brikker med de to ioner. Hver delmaengde kaldes én gang
       med listen af id'er. */
    function gennemgaa(noder, kanter, kat, an, x, y, hver) {
        var tilladt = {}, starter = [];
        Object.keys(noder).forEach(function (id) {
            var i = noder[id].ion.id;
            if (i === kat.id || i === an.id) { tilladt[id] = true; starter.push(id); }
        });
        var set = {}, stak = starter.map(function (id) { return [id]; });
        var maks = x + y;
        while (stak.length) {
            var S = stak.pop();
            var noegle = S.slice().sort().join(",");
            if (set[noegle]) continue;
            set[noegle] = true;
            var nk = 0, na = 0;
            S.forEach(function (id) { if (noder[id].ion.id === kat.id) nk++; else na++; });
            if (nk > x || na > y) continue;
            if (S.length === maks) { hver(S); continue; }
            for (var i = 0; i < S.length; i++) {
                var nb = kanter[S[i]];
                if (!nb) continue;
                for (var n in nb) {
                    if (tilladt[n] && S.indexOf(n) < 0) stak.push(S.concat([n]));
                }
            }
        }
    }

    /* Den bedste reaktion i grafen, eller null.
       nyId: den brik, der lige er landet (kan mangle). */
    function findReaktion(noder, kanter, nyId) {
        var katArter = {}, anArter = {};
        Object.keys(noder).forEach(function (id) {
            var i = noder[id].ion;
            if (i.q > 0) katArter[i.id] = i; else if (i.q < 0) anArter[i.id] = i;
        });
        var bedst = null;
        function bedre(a, b) {
            if (!b) return true;
            if (a.medNy !== b.medNy) return a.medNy;
            if (a.ids.length !== b.ids.length) return a.ids.length < b.ids.length;
            if (a.alder !== b.alder) return a.alder < b.alder;
            return a.noegle < b.noegle;
        }
        Object.keys(katArter).forEach(function (k) {
            Object.keys(anArter).forEach(function (a) {
                var kat = katArter[k], an = anArter[a], f = forhold(kat, an);
                gennemgaa(noder, kanter, kat, an, f.x, f.y, function (S) {
                    var alder = 0;
                    S.forEach(function (id) { alder += noder[id].orden; });
                    var kand = {
                        ids: S.slice().sort(), kat: kat, an: an, x: f.x, y: f.y,
                        formel: formel(kat, an), ligning: ionligning(kat, an),
                        medNy: nyId !== undefined && S.indexOf(String(nyId)) >= 0,
                        alder: alder
                    };
                    kand.noegle = kand.ids.join(",");
                    if (bedre(kand, bedst)) bedst = kand;
                });
            });
        });
        return bedst;
    }

    /* Sammenhaengende grupper af brikker, der venter, med deres samlede
       ladning. Bruges til tallene over ionerne og til hintene. */
    function grupper(noder, kanter) {
        var set = {}, ud = [];
        Object.keys(noder).forEach(function (start) {
            if (set[start]) return;
            var stak = [start], ids = [];
            set[start] = true;
            while (stak.length) {
                var id = stak.pop();
                ids.push(id);
                for (var n in (kanter[id] || {})) {
                    if (noder[n] && !set[n]) { set[n] = true; stak.push(n); }
                }
            }
            var q = 0, arter = {};
            ids.forEach(function (id) { q += noder[id].ion.q; arter[noder[id].ion.id] = noder[id].ion; });
            ud.push({ ids: ids, q: q, arter: arter });
        });
        return ud;
    }

    NK.Kemi = {
        ion: ion,
        ionTekst: ionTekst,
        forhold: forhold,
        formel: formel,
        ionligning: ionligning,
        salte: salte,
        enhedsIoner: enhedsIoner,
        findReaktion: findReaktion,
        grupper: grupper
    };
}());
