/* =====================================================================
   opgaver.js - de tilfaeldige molekyler i opgaverne og isomerlisterne

   Sværhedstrinnene er de samme som i de gamle 6.2 og 6.4. Et trin siger,
   hvor lang hovedkaeden er, hvor mange sidegrupper der er, og hvor store
   de er. Sidegrupperne placeres, saa de aldrig giver en laengere kaede
   end den tilsigtede (reglen s + max(p, L - p + 1) <= L fra den gamle
   6.4). Navnet kommer altid fra NK.Navn.analyser af det faerdige
   molekyle, saa opgave og tjek aldrig kan vaere uenige.

   Et opgavemolekyle er { mol, res, navn, navnUden, formel, antal, stereo }.
   mol har koordinater som zigzag (NK.Layout.zigzag).

   Isomererne af CnH2n+2 (fanen Isomerer) laves ved at saette et C-atom paa alle
   pladser i alle isomerer med ét C mindre. De naevnes, og to med samme
   navn er samme stof.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function tilf(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
    function vaelg(l) { return l[Math.floor(Math.random() * l.length)]; }

    /* ----- Sidegruppernes pladser ---------------------------------------------
       udenfor: kaedeatomer, der ikke maa have en sidegruppe (dobbeltbindingens
       to C-atomer, saa cis/trans bliver den klassiske med ét H paa hvert). */
    function placer(L, antal, stoerrelser, udenfor) {
        if (!antal) return [];
        udenfor = udenfor || {};
        forsoeg:
        for (var f = 0; f < 300; f++) {
            if (L <= 2) return null;
            var placeret = [], paaPlads = {};
            for (var i = 0; i < antal; i++) {
                var p = tilf(2, L - 1);
                if (udenfor[p]) continue forsoeg;
                var s = vaelg(stoerrelser);
                if ((paaPlads[p] || 0) >= 2) continue forsoeg;
                if (s + Math.max(p, L - p + 1) > L) continue forsoeg;
                for (var j = 0; j < placeret.length; j++) {
                    var o = placeret[j];
                    var p1 = Math.min(p, o.p), p2 = Math.max(p, o.p);
                    var s1 = p === p1 ? s : o.s, s2 = p === p1 ? o.s : s;
                    if (s1 + s2 + (p2 - p1 + 1) > L) continue forsoeg;
                }
                placeret.push({ p: p, s: s });
                paaPlads[p] = (paaPlads[p] || 0) + 1;
            }
            return placeret;
        }
        return null;
    }

    /* Molekylet ud fra kaedelaengde, sidegrupper og dobbeltbinding */
    function byg(L, sidegrupper, dbLok) {
        var m = new NK.Molekyle(), kaede = [], i;
        for (i = 0; i < L; i++) kaede.push(m.tilfoej("C", 0, 0).id);
        for (i = 0; i < L - 1; i++) m.bind(kaede[i], kaede[i + 1], dbLok === i + 1 ? 2 : 1);
        sidegrupper.forEach(function (g) {
            var forrige = kaede[g.p - 1];
            for (var k = 0; k < g.s; k++) {
                var n = m.tilfoej("C", 0, 0).id;
                m.bind(forrige, n, 1);
                forrige = n;
            }
        });
        return m;
    }

    /* Et faerdigt opgavemolekyle: navngivet, lagt ud som zigzag og tjekket */
    function faerdig(m, stereo) {
        var res = NK.Navn.analyser(m);
        if (!res.navn) return null;
        NK.Layout.zigzag(m, res, stereo);
        var res2 = NK.Navn.analyser(m);
        if (res2.navnUdenStereo !== res.navnUdenStereo) return null;
        if (stereo && res2.stereo !== stereo) return null;
        /* Kan molekylet ikke tegnes med luft mellem atomerne, tages et andet */
        var A = m.atomer;
        for (var a = 0; a < A.length; a++) {
            for (var b = a + 1; b < A.length; b++) {
                if (Math.hypot(A[a].x - A[b].x, A[a].y - A[b].y) < 0.6) return null;
            }
        }
        return {
            mol: m, res: res2, navn: res2.navn, navnUden: res2.navnUdenStereo,
            formel: m.formel(), antal: m.atomer.length, stereo: res2.stereo
        };
    }

    /* ----- Et molekyle fra et trin --------------------------------------------------
       trin: { type: "alkan"|"alken", L: [fra, til], grene: [fra, til],
               stoerrelser: [..], stereo: sand (dobbeltbinding midt i kaeden,
               cis eller trans), ende: sand (dobbeltbinding for enden) } */
    function fraTrin(trin) {
        for (var f = 0; f < 80; f++) {
            var L = tilf(trin.L[0], trin.L[1]);
            var antal = tilf(trin.grene[0], trin.grene[1]);
            if (trin.type === "alkan") {
                antal = Math.min(antal, Math.max(0, (L - 2) * 2));
                var pl = placer(L, antal, trin.stoerrelser);
                if (pl === null) continue;
                var ud = faerdig(byg(L, pl, 0), null);
                if (!ud) continue;
                if (antal > 0 && !ud.res.sub.length) continue;
                if (ud.res.kaede.length !== L) continue;
                return ud;
            }
            if (L < 2) continue;
            var p;
            if (trin.stereo) { if (L < 4) continue; p = tilf(2, L - 2); }
            else if (trin.ende) p = 1;
            else p = tilf(1, L - 1);
            var uden = {};
            uden[p] = true;
            uden[p + 1] = true;
            var pl2 = placer(L, antal, trin.stoerrelser, uden);
            if (pl2 === null) continue;
            var st = trin.stereo ? (Math.random() < 0.5 ? "cis" : "trans") : null;
            var ud2 = faerdig(byg(L, pl2, p), st);
            if (!ud2) continue;
            if (antal > 0 && !ud2.res.sub.length) continue;
            if (trin.stereo && !ud2.stereo) continue;
            if (!trin.stereo && ud2.res.stereoMulig && trin.udenStereo) continue;
            return ud2;
        }
        return null;
    }

    /* Ti forskellige molekyler, ét fra hvert trin */
    function serie(trinListe) {
        var liste = [], brugt = {};
        trinListe.forEach(function (trin) {
            var m = null;
            for (var f = 0; f < 25; f++) {
                var k = fraTrin(trin);
                if (!k) continue;
                if (!brugt[k.navn]) { m = k; break; }
                if (!m) m = k;
            }
            if (!m) m = fraTrin(trinListe[0]);
            brugt[m.navn] = true;
            liste.push(m);
        });
        return liste;
    }

    /* ----- Trinnene ------------------------------------------------------------------ */
    var A = "alkan", E = "alken";

    /* Fanen Zigzag, strukturformel -> zigzag (gamle 6.2 fane 1): op til 10 C,
       alkaner og alkener, ingen cis/trans */
    var ZIGZAG = [
        { type: A, L: [2, 3], grene: [0, 0], stoerrelser: [1] },
        { type: A, L: [3, 4], grene: [0, 0], stoerrelser: [1] },
        { type: A, L: [4, 5], grene: [1, 1], stoerrelser: [1] },
        { type: E, L: [3, 4], grene: [0, 0], stoerrelser: [1] },
        { type: A, L: [5, 6], grene: [1, 1], stoerrelser: [1, 2] },
        { type: E, L: [4, 5], grene: [0, 1], stoerrelser: [1] },
        { type: A, L: [6, 7], grene: [1, 2], stoerrelser: [1, 2, 3] },
        { type: E, L: [5, 6], grene: [1, 1], stoerrelser: [1, 2] },
        { type: A, L: [7, 9], grene: [2, 2], stoerrelser: [1, 2, 3] },
        { type: E, L: [7, 9], grene: [1, 2], stoerrelser: [1, 2, 3] }
    ];

    /* Fanen Zigzag, zigzag -> strukturformel (gamle 6.2 fane 2): hoejst 7 C */
    var ATOMER = [
        { type: A, L: [2, 3], grene: [0, 0], stoerrelser: [1] },
        { type: A, L: [4, 4], grene: [0, 0], stoerrelser: [1] },
        { type: A, L: [3, 4], grene: [1, 1], stoerrelser: [1] },
        { type: A, L: [5, 5], grene: [0, 0], stoerrelser: [1] },
        { type: A, L: [4, 5], grene: [1, 1], stoerrelser: [1, 2] },
        { type: E, L: [2, 3], grene: [0, 0], stoerrelser: [1] },
        { type: E, L: [4, 4], grene: [0, 0], stoerrelser: [1] },
        { type: A, L: [4, 5], grene: [1, 2], stoerrelser: [1] },
        { type: E, L: [5, 6], grene: [0, 1], stoerrelser: [1] },
        { type: E, L: [4, 5], grene: [1, 1], stoerrelser: [1, 2] }
    ];

    /* Fane 2, alkaner (gamle 6.4, Byg og Navngiv) */
    var ALKANER = [
        { type: A, L: [3, 4], grene: [1, 1], stoerrelser: [1] },
        { type: A, L: [4, 5], grene: [1, 1], stoerrelser: [1, 2] },
        { type: A, L: [5, 5], grene: [1, 2], stoerrelser: [1, 2] },
        { type: A, L: [5, 6], grene: [2, 2], stoerrelser: [1, 2, 3] },
        { type: A, L: [6, 7], grene: [2, 2], stoerrelser: [1, 2, 3] },
        { type: A, L: [6, 7], grene: [2, 3], stoerrelser: [1, 2, 3] },
        { type: A, L: [7, 8], grene: [3, 3], stoerrelser: [1, 2, 3] },
        { type: A, L: [8, 9], grene: [3, 3], stoerrelser: [1, 2, 3] },
        { type: A, L: [8, 9], grene: [3, 4], stoerrelser: [1, 2, 3] },
        { type: A, L: [9, 10], grene: [4, 4], stoerrelser: [1, 2, 3] }
    ];

    /* Fane 2, alkener (gamle 6.4 "Byg alkener"): de foerste fem med
       dobbeltbindingen for enden, de sidste fem med cis/trans */
    var ALKENER = [
        { type: E, L: [4, 4], grene: [0, 1], stoerrelser: [1, 2, 3], ende: true },
        { type: E, L: [4, 5], grene: [0, 1], stoerrelser: [1, 2, 3], ende: true },
        { type: E, L: [5, 6], grene: [1, 1], stoerrelser: [1, 2, 3], ende: true },
        { type: E, L: [5, 6], grene: [1, 2], stoerrelser: [1, 2, 3], ende: true },
        { type: E, L: [6, 7], grene: [1, 2], stoerrelser: [1, 2, 3], ende: true },
        { type: E, L: [4, 5], grene: [0, 1], stoerrelser: [1, 2, 3], stereo: true },
        { type: E, L: [5, 6], grene: [1, 1], stoerrelser: [1, 2, 3], stereo: true },
        { type: E, L: [6, 7], grene: [1, 2], stoerrelser: [1, 2, 3], stereo: true },
        { type: E, L: [7, 8], grene: [1, 2], stoerrelser: [1, 2, 3], stereo: true },
        { type: E, L: [7, 9], grene: [2, 3], stoerrelser: [1, 2, 3], stereo: true }
    ];

    /* ----- Isomererne af CnH2n+2 ---------------------------------------------------- */
    var isoLager = {};
    function isomerer(n) {
        if (isoLager[n]) return isoLager[n];
        var lag = [new NK.Molekyle()];
        lag[0].tilfoej("C", 0, 0);
        for (var k = 2; k <= n; k++) {
            var ny = [], set = {};
            lag.forEach(function (m) {
                m.atomer.forEach(function (a) {
                    if (m.grad(a.id) >= 4) return;
                    var m2 = m.kopi();
                    var b = m2.tilfoej("C", 0, 0);
                    m2.bind(a.id, b.id, 1);
                    var navn = NK.Navn.analyser(m2).navn;
                    if (!set[navn]) { set[navn] = true; ny.push(m2); }
                });
            });
            lag = ny;
        }
        var ud = lag.map(function (m) { return faerdig(m, null); });
        /* Laengste kaede foerst, som i den gamle 6.3's liste (mest forgrenet nederst) */
        ud.sort(function (a, b) {
            var d = b.res.kaede.length - a.res.kaede.length;
            return d || (a.navn < b.navn ? -1 : 1);
        });
        isoLager[n] = ud;
        return ud;
    }

    NK.Opgaver = {
        fraTrin: fraTrin,
        serie: serie,
        byg: byg,
        faerdig: faerdig,
        isomerer: isomerer,
        ZIGZAG: ZIGZAG,
        ATOMER: ATOMER,
        ALKANER: ALKANER,
        ALKENER: ALKENER
    };
}());
