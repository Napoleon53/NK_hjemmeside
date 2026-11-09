/* =====================================================================
   kemi.js - modellen: indikatorens farve ved en pH og det, en farve
   fortaeller om pH

   K.farve(id, ph)       farven paa farvekortet (som bogens gradient)
   K.vaeske(id, ph)      farven i et glas: farveloest er rent vand
   K.navn(id, ph)        farvens navn ("gul", "svagt lyserød")
   K.tolk(id, ph)        nummeret paa det omraade (fane 2), pH ligger i
   K.omraade(tests)      { lo, hi }: hvor pH kan vaere efter testene
   K.passer(runde, t)    de ting i runden, der passer med testene
   K.minTest(runde)      det mindste antal indikatorer, der skal til
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = {};

    function hex(h) {
        h = h.replace("#", "");
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }
    function tilHex(c) {
        return "#" + c.map(function (v) {
            var s = Math.round(NK.klamp(v, 0, 255)).toString(16);
            return s.length < 2 ? "0" + s : s;
        }).join("");
    }
    K.bland = function (a, b, t) {
        var x = hex(a), y = hex(b);
        return tilHex([0, 1, 2].map(function (i) { return x[i] + (y[i] - x[i]) * t; }));
    };
    K.moerk = function (a, t) { return K.bland(a, "#000000", t); };
    K.lys = function (a, t) { return K.bland(a, "#ffffff", t); };

    function gradient(stop, ph) {
        if (ph <= stop[0][0]) return stop[0][1];
        for (var i = 1; i < stop.length; i++) {
            if (ph <= stop[i][0]) {
                var a = stop[i - 1], b = stop[i];
                return K.bland(a[1], b[1], (ph - a[0]) / (b[0] - a[0]));
            }
        }
        return stop[stop.length - 1][1];
    }

    K.farve = function (id, ph) { return gradient(D.ind(id).stop, ph); };

    /* I glasset er farveloest det samme som rent vand */
    K.vaeske = function (id, ph) {
        var stop = D.ind(id).stop.map(function (s) { return [s[0], s[1] === "#ffffff" ? D.VAND : s[1]]; });
        return gradient(stop, ph);
    };

    K.navn = function (id, ph) {
        var f = D.ind(id).farver;
        for (var i = 0; i < f.length; i++) if (ph <= f[i].til) return f[i].navn;
        return f[f.length - 1].navn;
    };

    K.tolk = function (id, ph) {
        var t = D.ind(id).tolk;
        for (var i = 0; i < t.length; i++) if (ph > t[i].fra && ph <= t[i].til) return i;
        return -1;
    };

    /* tests: [{ ind, nr }] med nr = det omraade, eleven har fundet */
    K.omraade = function (tests) {
        var lo = -D.UEND, hi = D.UEND;
        (tests || []).forEach(function (t) {
            var o = D.ind(t.ind).tolk[t.nr];
            lo = Math.max(lo, o.fra);
            hi = Math.min(hi, o.til);
        });
        return { lo: lo, hi: hi };
    };

    K.passer = function (runde, tests) {
        var o = K.omraade(tests);
        return runde.ting.filter(function (id) { var ph = D.TING[id].ph; return ph > o.lo && ph <= o.hi; });
    };

    /* Testene, som de ville se ud med den hemmelige ting i proeven */
    K.testFor = function (runde, indListe) {
        var ph = D.TING[runde.hemmelig].ph;
        return indListe.map(function (id) { return { ind: id, nr: K.tolk(id, ph) }; });
    };

    /* Det mindste antal indikatorer, der udelukker alle andre ting */
    K.minTest = function (runde) {
        var I = D.PROEVE_IND, bedst = 99;
        for (var maske = 1; maske < (1 << I.length); maske++) {
            var valg = I.filter(function (id, i) { return maske & (1 << i); });
            if (valg.length >= bedst) continue;
            if (K.passer(runde, K.testFor(runde, valg)).length === 1) bedst = valg.length;
        }
        return bedst;
    };

    /* De indikatorer, der alene udelukker alle andre ting */
    K.alene = function (runde) {
        return D.PROEVE_IND.filter(function (id) { return K.passer(runde, K.testFor(runde, [id])).length === 1; });
    };

    /* Hvor mange forskellige farvenavne en indikator har i de syv glas */
    K.antalFarver = function (id) {
        var set = {};
        D.GLAS_PH.forEach(function (ph) { set[K.navn(id, ph)] = 1; });
        return Object.keys(set).length;
    };

    NK.Kemi = K;
}());
