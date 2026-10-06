/* =====================================================================
   model.js - de 100 personer aar for aar

   Figuren har tal for seks aar. Modellen goer tre ting:

   1. Tallene for hvert af de seks aar skaleres, saa de giver 100, og
      afrundes til hele personer (stoerste rest foerst).
   2. Mellem to aar med tal flytter personerne én ad gangen, jaevnt
      fordelt over aarene. Det svarer til figurens rette linjer.
      Hvert erhverv gaar derfor kun én vej mellem to aar med tal, og
      der er altid 100 personer.
   3. Hver person har en fast plads i sin raekke. Den sidst ankomne
      staar yderst og er den foerste, der gaar igen. Pladserne er
      regnet for alle aar paa forhaand, saa et aar altid ser ens ud,
      uanset hvordan eleven har trukket i skyderen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var N = 100;
    var E = D.ERHVERV.length;
    var FOERSTE = D.FOERSTE, SIDSTE = D.SIDSTE;

    /* Hele personer, der giver 100: stoerste rest faar den naeste person. */
    function heltal(vaerdier) {
        var sum = 0, i;
        for (i = 0; i < vaerdier.length; i++) sum += vaerdier[i];
        var gulv = [], rest = [], brugt = 0;
        for (i = 0; i < vaerdier.length; i++) {
            var skaleret = vaerdier[i] * N / sum;
            gulv.push(Math.floor(skaleret + 1e-9));
            rest.push({ i: i, r: skaleret - gulv[i] });
            brugt += gulv[i];
        }
        rest.sort(function (a, b) { return (b.r - a.r) || (a.i - b.i); });
        for (i = 0; i < N - brugt; i++) gulv[rest[i].i]++;
        return gulv;
    }

    /* Flytningerne mellem to aar med tal: [{ aar, fra, til }], i raekkefoelge.
       Hvert erhverv afgiver eller modtager sine personer jaevnt over aarene.
       Flytninger inden for samme sektor parres foerst. Saa gaar ogsaa hver
       sektors sum kun én vej mellem to aar med tal. */
    function flytninger(aarA, aarB, antalA, antalB) {
        var n = aarB - aarA;
        var ud = [], ind = [], k, j;
        for (k = 0; k < E; k++) {
            var forskel = antalB[k] - antalA[k];
            var liste = forskel < 0 ? ud : ind;
            for (j = 1; j <= Math.abs(forskel); j++) {
                liste.push({ k: k, t: (j - 0.5) / Math.abs(forskel), sektor: D.ERHVERV[k].sektor, brugt: false });
            }
        }
        function efterTid(a, b) { return (a.t - b.t) || (a.k - b.k); }
        ud.sort(efterTid);
        ind.sort(efterTid);

        var flyt = [];
        function par(u, i) {
            u.brugt = true;
            i.brugt = true;
            var t = (u.t + i.t) / 2;
            var trin = Math.min(n, Math.max(1, Math.ceil(t * n - 1e-9)));
            flyt.push({ aar: aarA + trin, fra: u.k, til: i.k, t: t });
        }
        function parrer(sammeSektor) {
            for (var a = 0; a < ud.length; a++) {
                if (ud[a].brugt) continue;
                for (var b = 0; b < ind.length; b++) {
                    if (ind[b].brugt) continue;
                    if (sammeSektor && ind[b].sektor !== ud[a].sektor) continue;
                    par(ud[a], ind[b]);
                    break;
                }
            }
        }
        parrer(true);
        parrer(false);
        flyt.sort(function (a, b) { return (a.aar - b.aar) || (a.t - b.t); });
        return flyt;
    }

    /* ----- Regn alle aar igennem én gang ---------------------------------- */
    var antalIAar = {};      /* aar -> [antal pr. erhverv] */
    var pladsIAar = {};      /* aar -> [{ r: raekke, s: plads } pr. person] */
    var flytIAar = {};       /* aar -> [{ fra, til }] der sker paa vej ind i aaret */

    (function regn() {
        var taelleaar = D.AAR;
        var tal = [], a, k, i;
        for (a = 0; a < taelleaar.length; a++) {
            var raekke = [];
            for (k = 0; k < E; k++) raekke.push(D.ERHVERV[k].tal[a]);
            tal.push(heltal(raekke));
        }

        /* Stakken for hvert erhverv: personernes numre, den yderste sidst. */
        var stak = [], nr = 0;
        for (k = 0; k < E; k++) {
            stak.push([]);
            for (i = 0; i < tal[0][k]; i++) stak[k].push(nr++);
        }

        function gem(aar) {
            var antal = [], plads = new Array(N);
            for (var kk = 0; kk < E; kk++) {
                antal.push(stak[kk].length);
                for (var s = 0; s < stak[kk].length; s++) plads[stak[kk][s]] = { r: kk, s: s };
            }
            antalIAar[aar] = antal;
            pladsIAar[aar] = plads;
        }

        gem(taelleaar[0]);
        flytIAar[taelleaar[0]] = [];
        for (a = 0; a < taelleaar.length - 1; a++) {
            var flyt = flytninger(taelleaar[a], taelleaar[a + 1], tal[a], tal[a + 1]);
            var f = 0;
            for (var aar = taelleaar[a] + 1; aar <= taelleaar[a + 1]; aar++) {
                flytIAar[aar] = [];
                while (f < flyt.length && flyt[f].aar === aar) {
                    stak[flyt[f].til].push(stak[flyt[f].fra].pop());
                    flytIAar[aar].push({ fra: flyt[f].fra, til: flyt[f].til });
                    f++;
                }
                gem(aar);
            }
        }
    }());

    function klampAar(aar) {
        return Math.min(SIDSTE, Math.max(FOERSTE, Math.round(aar)));
    }

    function antal(aar) { return antalIAar[klampAar(aar)]; }
    function pladser(aar) { return pladsIAar[klampAar(aar)]; }

    function erhvervNr(id) {
        for (var k = 0; k < E; k++) if (D.ERHVERV[k].id === id) return k;
        return -1;
    }

    function antalI(aar, id) { return antal(aar)[erhvervNr(id)]; }

    function sektorSum(aar, sektor) {
        var a = antal(aar), sum = 0;
        for (var k = 0; k < E; k++) if (D.ERHVERV[k].sektor === sektor) sum += a[k];
        return sum;
    }

    /* Det stoerste antal, en raekke faar brug for: bestemmer personernes stoerrelse. */
    function stoersteRaekke() {
        var st = 0;
        for (var aar = FOERSTE; aar <= SIDSTE; aar++) {
            var a = antalIAar[aar];
            for (var k = 0; k < E; k++) if (a[k] > st) st = a[k];
        }
        return st;
    }

    function erTaelleaar(aar) { return D.AAR.indexOf(aar) >= 0; }

    /* ----- Svarene paa opgaverne, regnet af modellen ---------------------- */
    function foersteAar(betingelse) {
        for (var aar = FOERSTE; aar <= SIDSTE; aar++) if (betingelse(aar)) return aar;
        return null;
    }

    var svar = (function () {
        var overhaler = foersteAar(function (aar) { return antalI(aar, "industri") > antalI(aar, "landbrug"); });
        var halvdel = foersteAar(function (aar) { return sektorSum(aar, "t") > N / 2; });
        var topAntal = 0, topAar = [], aar;
        for (aar = FOERSTE; aar <= SIDSTE; aar++) topAntal = Math.max(topAntal, sektorSum(aar, "s"));
        for (aar = FOERSTE; aar <= SIDSTE; aar++) if (sektorSum(aar, "s") === topAntal) topAar.push(aar);
        return { overhaler: overhaler, halvdel: halvdel, topAntal: topAntal, topAar: topAar };
    }());

    /* Bedoemmer et aar i en find-opgave: { ok, grund, ... } */
    function bedoem(opgaveId, aar) {
        aar = klampAar(aar);
        if (opgaveId === "overhaler") {
            var ind = antalI(aar, "industri"), land = antalI(aar, "landbrug");
            if (aar === svar.overhaler) return { ok: true, a: ind, b: land };
            if (ind < land) return { ok: false, grund: "foer", a: ind, b: land };
            if (ind === land) return { ok: false, grund: "lige", a: ind, b: land };
            return { ok: false, grund: "efter", a: ind, b: land };
        }
        if (opgaveId === "top") {
            var s = sektorSum(aar, "s");
            if (s === svar.topAntal) return { ok: true, a: s };
            return { ok: false, grund: aar < svar.topAar[0] ? "foer" : "efter", a: s };
        }
        if (opgaveId === "halvdel") {
            var t = sektorSum(aar, "t");
            if (aar === svar.halvdel) return { ok: true, a: t };
            return { ok: false, grund: t > N / 2 ? "efter" : "foer", a: t };
        }
        return { ok: false };
    }

    /* Det aar, Vis svaret stiller skyderen paa. */
    function svarAar(opgaveId) {
        if (opgaveId === "overhaler") return svar.overhaler;
        if (opgaveId === "halvdel") return svar.halvdel;
        if (opgaveId === "top") {
            /* det taelleaar, der ligger i toppen, ellers midten af toppen */
            for (var i = 0; i < svar.topAar.length; i++) if (erTaelleaar(svar.topAar[i])) return svar.topAar[i];
            return svar.topAar[Math.floor(svar.topAar.length / 2)];
        }
        return null;
    }

    NK.Model = {
        N: N,
        antal: antal,
        antalI: antalI,
        pladser: pladser,
        sektorSum: sektorSum,
        flytninger: function (aar) { return flytIAar[klampAar(aar)]; },
        stoersteRaekke: stoersteRaekke,
        erTaelleaar: erTaelleaar,
        erhvervNr: erhvervNr,
        klampAar: klampAar,
        heltal: heltal,
        svar: svar,
        bedoem: bedoem,
        svarAar: svarAar
    };
}());
