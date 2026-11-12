/* =====================================================================
   sag.js - laver en sag af et sagsnummer

   NK.Sag.lav(nr) giver de fem rums tal, svar og felter i laasen. Den
   samme sag giver altid det samme. Intet her roerer siden; kortene
   bygges af js/sedler.js.

   Rum 3 til 5 traekker tallene igen, til svaret er det samme, uanset
   hvordan eleven runder af undervejs (se robust nedenfor).
   ===================================================================== */
(function () {
    "use strict";

    var D = NK.D;
    var Sag = NK.Sag = {};

    /* Et felt i laasen: navn, maske ("#,##": cifre og faste tegn) og
       svaret som cifre uden komma. */
    function felt(navn, maske, svar) { return { navn: navn, maske: maske, svar: svar }; }
    function cifre(s) { return String(s).replace(/[^0-9]/g, ""); }

    /* Giver alle varianterne det samme afrundede svar? */
    function robust(varianter, dec) {
        var f = NK.komma(varianter[0], dec);
        return varianter.every(function (v) { return NK.komma(v, dec) === f; });
    }

    /* ----- Rum 1: Proeve X og tavlen --------------------------------- */
    function rum1(r) {
        var ider = Object.keys(D.LAB_IONER);
        var x = r.vaelg(ider);
        var andre = r.bland(ider.filter(function (i) { return i !== x; })).slice(0, 3);
        var kendte = r.bland([x].concat(andre));
        var reak = r.vaelg(D.REAKTIONER);
        var Z = D.LAB_IONER[x].Z;
        return {
            x: x, kendte: kendte, reaktion: reak,
            svar: { Z: Z, k: reak.k.slice() },
            felter: [
                felt("Atomnummeret på metallet i Prøve X", "##", String(Z)),
                felt("Koefficienterne på tavlen fra venstre", reak.k.map(function () { return "#"; }).join(" "), reak.k.join(""))
            ]
        };
    }

    /* ----- Rum 2: flasken, tavlen og notesbogen ---------------------- */
    function kanBlandes(a, b) {
        if (a.fast && b.fast) return false;
        if (a.kun && a.kun.indexOf(b.navn) < 0) return false;
        if (b.kun && b.kun.indexOf(a.navn) < 0) return false;
        return true;
    }
    function kanKrydses(a, b) {           /* a polaer, b upolaer */
        if (!a.kryds || (a.fast && b.fast)) return false;
        if (b.krydsKun && b.krydsKun.indexOf(a.navn) < 0) return false;
        return true;
    }
    Sag.kanBlandes = kanBlandes;
    Sag.kanKrydses = kanKrydses;

    /* Et tilfaeldigt traee: hvert stof kaedes til et, der allerede er med. */
    function trae(r, gruppe, kanter) {
        var orden = r.bland(gruppe);
        for (var i = 1; i < orden.length; i++) {
            var mulige = orden.slice(0, i).filter(function (o) { return kanBlandes(o, orden[i]); });
            if (!mulige.length) return false;
            kanter.push({ a: r.vaelg(mulige), b: orden[i], blandes: true });
        }
        return true;
    }
    function harKant(kanter, a, b) {
        return kanter.some(function (k) { return (k.a === a && k.b === b) || (k.a === b && k.b === a); });
    }

    function blandingsgaade(r) {
        for (var forsoeg = 0; forsoeg < 200; forsoeg++) {
            var p = r.heltal(2, 4), n = 6 - p;
            var P = [D.VAND].concat(r.bland(D.BLAND_POLAER).slice(0, p - 1));
            var U = r.bland(D.BLAND_UPOLAER).slice(0, n);
            var kanter = [];
            if (!trae(r, P, kanter) || !trae(r, U, kanter)) continue;
            var kryds = [];
            P.forEach(function (a) { U.forEach(function (b) { if (kanKrydses(a, b)) kryds.push({ a: a, b: b, blandes: false }); }); });
            if (!kryds.length) continue;
            var k1 = r.vaelg(kryds);
            kanter.push(k1);
            /* Den sjette raekke: et par mere, der ogsaa passer */
            var ekstra = kryds.filter(function (k) { return k !== k1; });
            [P, U].forEach(function (g) {
                for (var i = 0; i < g.length; i++) for (var j = i + 1; j < g.length; j++) {
                    if (kanBlandes(g[i], g[j]) && !harKant(kanter, g[i], g[j])) ekstra.push({ a: g[i], b: g[j], blandes: true });
                }
            });
            if (!ekstra.length) continue;
            kanter.push(r.vaelg(ekstra));
            var raekker = r.bland(kanter).map(function (k) {
                var par = r.tal() < 0.5 ? [k.a.navn, k.b.navn] : [k.b.navn, k.a.navn];
                return { a: par[0], b: par[1], blandes: k.blandes };
            });
            return {
                raekker: raekker,
                polaere: P.map(function (s) { return s.navn; }),
                upolaere: U.map(function (s) { return s.navn; }),
                antalUpolaere: n
            };
        }
        throw new Error("blandingsgåden kunne ikke laves");
    }

    function rum2(r) {
        var streg = r.vaelg(D.STREGMOLEKYLER);
        var P = D.POLMOLEKYLER.filter(function (m) { return m.polaer; });
        var U = D.POLMOLEKYLER.filter(function (m) { return !m.polaer; });
        var k = r.heltal(1, 4);
        var fem = r.bland(r.bland(P).slice(0, k).concat(r.bland(U).slice(0, 5 - k)));
        var bl = blandingsgaade(r);
        return {
            streg: streg, molekyler: fem, blanding: bl,
            svar: { streger: streg.streger, polaere: k, upolaere: bl.antalUpolaere },
            felter: [
                felt("Streger i stregformlen for " + streg.formel, "#", String(streg.streger)),
                felt("Polære molekyler på tavlen", "#", String(k)),
                felt("Upolære stoffer i notesbogen", "#", String(bl.antalUpolaere))
            ]
        };
    }

    /* ----- Rum 3: gasrumfanget ---------------------------------------- */
    /* Rumfanget af dihydrogen regnet paa en bestemt maade. */
    function rumfang(met, m, t, p, valg) {
        var M = valg.M1 ? NK.rund(met.M, 1) : met.M;
        var T = valg.T273 ? t + 273 : t + 273.15;
        var R = valg.R4 ? 0.0831 : D.R;
        var nMet = m / M;
        if (valg.bet) nMet = NK.betydende(nMet, 3);
        var nH2 = nMet * met.forhold[1] / met.forhold[0];
        if (valg.bet) nH2 = NK.betydende(nH2, 3);
        return nH2 * R * T / p;
    }
    Sag.rumfang = rumfang;
    var RUM3_VALG = [];
    [false, true].forEach(function (M1) { [false, true].forEach(function (T273) {
        [false, true].forEach(function (R4) { [false, true].forEach(function (bet) {
            RUM3_VALG.push({ M1: M1, T273: T273, R4: R4, bet: bet });
        }); });
    }); });
    Sag.RUM3_VALG = RUM3_VALG;

    function rum3(r) {
        var met = r.vaelg(D.METALLER);
        for (var i = 0; i < 500; i++) {
            var m = r.trin(met.lav, met.hoej, 0.01);
            var t = r.heltal(18, 28);
            var p = r.vaelg(D.TRYK);
            var V = rumfang(met, m, t, p, RUM3_VALG[0]);
            if (V < 0.5 || V >= 9.995) continue;
            var alle = RUM3_VALG.map(function (v) { return rumfang(met, m, t, p, v); });
            if (!robust(alle, 2)) continue;
            var tekst = NK.komma(V, 2);
            return {
                metal: met, m: m, t: t, p: p, V: V,
                svar: { V: tekst },
                felter: [felt("Rumfanget af dihydrogen i liter", "#,##", cifre(tekst))]
            };
        }
        throw new Error("rum 3 kunne ikke laves");
    }

    /* ----- Rum 4: titrering og pH ------------------------------------- */
    function pH(cBase, forbrug, Vsyre, valg) {
        var c = cBase * forbrug / Vsyre;
        if (valg === 3) c = NK.betydende(c, 3);
        if (valg === 4) c = NK.betydende(c, 4);
        return -Math.log10(c);
    }
    Sag.pH = pH;

    function rum4(r) {
        var syre = r.vaelg(D.SYRER), base = r.vaelg(D.BASER);
        for (var i = 0; i < 500; i++) {
            var Vs = r.vaelg(D.SYRE_V), cb = r.vaelg(D.BASE_C);
            var foer = r.trin(0.10, 2.50, 0.05);
            var forbrug = r.trin(5.00, 24.00, 0.05);
            var efter = NK.rund(foer + forbrug, 2);
            var ph = pH(cb, forbrug, Vs, 0);
            if (!robust([ph, pH(cb, forbrug, Vs, 3), pH(cb, forbrug, Vs, 4)], 2)) continue;
            var tekst = NK.komma(ph, 2);
            return {
                syre: syre, base: base, Vsyre: Vs, cBase: cb, foer: foer, efter: efter, forbrug: forbrug,
                cSyre: cb * forbrug / Vs, pH: ph,
                svar: { pH: tekst },
                felter: [felt("pH i " + syre.bestemt, "#,##", cifre(tekst))]
            };
        }
        throw new Error("rum 4 kunne ikke laves");
    }

    /* ----- Rum 5: permanganattitrering -------------------------------- */
    function koncentration(red, cMn, Vmn, Vp, bet) {
        var n = cMn * Vmn / 1000;
        if (bet) n = NK.betydende(n, 3);
        var nP = n * red.forhold[1] / red.forhold[0];
        if (bet) nP = NK.betydende(nP, 3);
        return nP / (Vp / 1000);
    }
    Sag.koncentration = koncentration;

    function rum5(r) {
        var red = r.vaelg(D.REDOX);
        for (var i = 0; i < 500; i++) {
            var cMn = r.vaelg(D.MN_C), Vp = r.vaelg(D.PROEVE_V);
            var maal = r.trin(0.040, 0.300, 0.001);
            var Vmn = NK.rund(Math.round(maal * Vp * red.forhold[0] / (red.forhold[1] * cMn) / 0.05) * 0.05, 2);
            if (Vmn < 5 || Vmn > 40) continue;
            var c = koncentration(red, cMn, Vmn, Vp, false);
            if (!robust([c, koncentration(red, cMn, Vmn, Vp, true)], 3)) continue;
            var tekst = NK.komma(c, 3);
            return {
                redox: red, cMn: cMn, Vproeve: Vp, Vmn: Vmn, c: c,
                svar: { c: tekst },
                felter: [felt("Koncentrationen af " + red.stof + " i mol/L", "#,###", cifre(tekst))]
            };
        }
        throw new Error("rum 5 kunne ikke laves");
    }

    /* ----- Hele sagen ------------------------------------------------- */
    Sag.lav = function (nr) {
        /* Hvert rum faar sin egen strøm af tal, saa en rettelse i et rum
           ikke flytter tallene i de andre. */
        function strm(k) { return new NK.Tilfaeldig((nr * 7919 + k * 104729) >>> 0); }
        return {
            nr: nr,
            rum: [null, rum1(strm(1)), rum2(strm(2)), rum3(strm(3)), rum4(strm(4)), rum5(strm(5))]
        };
    };

    /* Den kode, laasen vil have i et rum (alle felternes cifre). */
    Sag.kode = function (rum) {
        return rum.felter.map(function (f) { return f.svar; }).join("");
    };
    Sag.cifre = cifre;
}());
