/* =====================================================================
   Kan du løse opgaven? - kernen
   Tilstanden uden tegning: hvor brikken står, hvilken udfordring der er
   fremme, og hvor et svar fører hen. Kan køres uden DOM (_selvtest.html).

   Faser:  spm         kassen er fremme (Ja/Nej eller knappen i "Gør det!")
           udfordring  eleven skal stå inde for sit svar
           flytter     brikken er på vej (flyt er sat)
           slut        GODT ARBEJDE
   ===================================================================== */

var NK = window.NK || {};
window.NK = NK;

NK.Kerne = function (D, tilfaeldig) {
    "use strict";

    var rnd = tilfaeldig || Math.random;
    var s = null;

    var pileById = {};
    D.PILE.forEach(function (p) { pileById[p.id] = p; });

    function nulstil() {
        s = {
            node: D.START,
            fase: "spm",
            besvaret: 0,
            tilbage: 0,
            besoegt: {},
            pile: {},          // pil-id -> "frem" | "tilbage"
            via: null,         // kassen, brikken sidst kom fra
            kontekst: "sidemand",
            sidst: {},         // sidste variant pr. udfordring (så den skifter)
            udf: null,
            flyt: null,
            haand: false,
            koe: 0
        };
        s.besoegt[D.START] = true;
    }

    function pil(id) { return pileById[id] || null; }

    function udgaaende(node) {
        return D.PILE.filter(function (p) { return p.fra === node; });
    }

    /* Pilen mellem to kasser i den ene eller den anden retning */
    function pilMellem(a, b) {
        for (var i = 0; i < D.PILE.length; i++) {
            var p = D.PILE[i];
            if (p.fra === a && p.til === b) return { pil: p, baglaens: false };
        }
        for (var j = 0; j < D.PILE.length; j++) {
            var q = D.PILE[j];
            if (q.fra === b && q.til === a) return { pil: q, baglaens: true };
        }
        return null;
    }

    function blandet(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(rnd() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    function lavUdfordring(noegle, pilId, ord) {
        var u = D.UDFORDRINGER[noegle];
        var n = u.varianter.length;
        var i = Math.floor(rnd() * n);
        if (n > 1 && i === s.sidst[noegle]) i = (i + 1) % n;
        s.sidst[noegle] = i;
        var v = u.varianter[i];
        s.udf = {
            noegle: noegle,
            pilId: pilId,
            ord: ord || null,
            variant: i,
            spm: v.spm,
            undskyldning: !!u.undskyldning,
            fejlTil: u.fejlTil || null,
            svar: blandet(v.svar.slice())
        };
        s.fase = "udfordring";
        return s.udf;
    }

    /* Ja eller Nej i en spørgsmålskasse */
    function vaelg(ord) {
        if (s.fase !== "spm") return null;
        var k = D.KASSER[s.node];
        if (k.slags !== "spm") return null;
        var p = udgaaende(s.node).filter(function (x) { return x.ord === ord; })[0];
        if (!p) return null;
        return lavUdfordring(p.id, p.id, ord);
    }

    /* Knappen i en "Gør det!"-kasse: enten en udfordring (O) eller videre */
    function goer() {
        if (s.fase !== "spm") return null;
        var k = D.KASSER[s.node];
        if (k.slags !== "handling") return null;
        var h = D.HANDLINGER[s.node];
        var ud = udgaaende(s.node)[0];
        if (h && h.udfordring) {
            return { udf: lavUdfordring(h.udfordring, ud.id, null) };
        }
        if (s.node === "L") {
            s.haand = true;
            s.koe = 2 + Math.floor(rnd() * 5);
        }
        s.flyt = { fra: s.node, til: ud.til, pil: ud.id, baglaens: false, tilbage: false };
        s.fase = "flytter";
        return { flyt: s.flyt };
    }

    /* Eleven vælger et af svarene i udfordringen */
    function svar(i) {
        if (s.fase !== "udfordring" || !s.udf) return null;
        var u = s.udf;
        var sv = u.svar[i];
        if (!sv) return null;
        s.besvaret++;

        var udfald = u.undskyldning ? "undskyldning" : (sv.ok ? "ok" : "fejl");
        var flyt;
        if (udfald !== "fejl") {
            var p = pil(u.pilId);
            flyt = { fra: s.node, til: p.til, pil: p.id, baglaens: false, tilbage: false };
        } else {
            var til = sv.til || u.fejlTil || s.node;
            var m = til === s.node ? null : pilMellem(s.node, til);
            flyt = { fra: s.node, til: til, pil: m ? m.pil.id : null, baglaens: m ? m.baglaens : false, tilbage: true };
            s.tilbage++;
        }
        s.flyt = flyt;
        s.fase = "flytter";
        return { svar: sv, udfald: udfald, flyt: flyt };
    }

    /* Brikken er fremme */
    function ankom() {
        var f = s.flyt;
        if (!f) return s.node;
        if (f.pil) {
            if (f.tilbage) s.pile[f.pil] = "tilbage";
            else if (s.pile[f.pil] !== "tilbage") s.pile[f.pil] = "frem";
        }
        if (f.til === "F" && D.KONTEKST[f.fra]) s.kontekst = D.KONTEKST[f.fra];
        s.via = f.fra;
        s.node = f.til;
        s.besoegt[f.til] = true;
        s.udf = null;
        s.flyt = null;
        s.fase = s.node === D.SLUT ? "slut" : "spm";
        return s.node;
    }

    /* Teksterne i den "Gør det!"-kasse, brikken står i */
    function handling(node) {
        var h = D.HANDLINGER[node || s.node];
        if (!h) return null;
        if (h.sidemand) return h[s.kontekst] || h.sidemand;
        return h;
    }

    function omveje(n) {
        var t = D.OMVEJE[0].t;
        D.OMVEJE.forEach(function (o) { if (n >= o.fra) t = o.t; });
        return t;
    }

    nulstil();

    return {
        get s() { return s; },
        nulstil: nulstil,
        vaelg: vaelg,
        goer: goer,
        svar: svar,
        ankom: ankom,
        handling: handling,
        omveje: omveje,
        pil: pil,
        udgaaende: udgaaende,
        pilMellem: pilMellem
    };
};
