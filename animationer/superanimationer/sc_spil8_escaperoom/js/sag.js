/* =====================================================================
   sag.js - laver en sag af et sagsnummer

   NK.Sag.lav(nr) giver de fem rums tal, trin, kode og bonusrute. Den
   samme sag giver altid det samme. Intet her roerer siden; kortene
   bygges af js/sedler.js.

   Hvert rum har:
     trin   tre trin i fast raekkefoelge: { id, ting, chip, goer,
            cifre, maske }. cifre er det, trinet giver til koden.
     kode   alle trinenes cifre i raekkefoelge (den almindelige kode).
     bonus  { felter: [{ navn, maske, svar }], kode } - guldkoden.

   Rum 3 til 5 traekker tallene igen, til baade svaret og bonussvaret
   er de samme, uanset hvordan eleven runder af undervejs.
   ===================================================================== */
(function () {
    "use strict";

    var D = NK.D;
    var Sag = NK.Sag = {};

    function felt(navn, maske, svar) { return { navn: navn, maske: maske, svar: svar }; }
    function cifre(s) { return String(s).replace(/[^0-9]/g, ""); }
    function trin(id, ting, chip, goer, svar, maske) {
        return { id: id, ting: ting, chip: chip, goer: goer, cifre: svar ? cifre(svar) : "", maske: maske || "" };
    }
    /* "2,45" -> "#,##" */
    function maskeAf(tekst) { return String(tekst).replace(/[0-9]/g, "#"); }

    /* Giver alle varianterne det samme afrundede svar? */
    function robust(varianter, dec) {
        var f = NK.komma(varianter[0], dec);
        return varianter.every(function (v) { return NK.komma(v, dec) === f; });
    }

    function faerdig(r) {
        r.kode = r.trin.map(function (t) { return t.cifre; }).join("");
        r.kodeMaske = r.trin.map(function (t) { return t.maske; }).filter(Boolean).join(" ");
        r.bonus.kode = r.bonus.felter.map(function (f) { return f.svar; }).join("");
        return r;
    }

    /* ----- Rum 1: Proeve X, det periodiske system og tavlen ----------- */
    function rum1(r) {
        var ider = Object.keys(D.LAB_IONER);
        var x = r.vaelg(ider);
        var andre = r.bland(ider.filter(function (i) { return i !== x; })).slice(0, 3);
        var kendte = r.bland([x].concat(andre));
        var reak = r.vaelg(D.REAKTIONER);
        var ion = D.LAB_IONER[x];
        var A = r.vaelg(ion.isotoper);
        var neutroner = A - ion.Z, elektroner = ion.Z - ion.q;
        return faerdig({
            x: x, kendte: kendte, reaktion: reak, Z: ion.Z,
            trin: [
                trin("ion", "lab", "Dråbepladen", "Klik på dråbepladen, og find metalionen i Prøve X."),
                trin("z", "ps", "Det periodiske system", "Klik på det periodiske system, og find metallet fra Prøve X.", String(ion.Z), "##"),
                trin("afstem", "tavle", "Tavlen", "Klik på tavlen, og afstem reaktionsskemaet.", reak.k.join(""), reak.k.map(function () { return "#"; }).join(""))
            ],
            bonus: {
                A: A, neutroner: neutroner, elektroner: elektroner,
                felter: [
                    felt("Neutroner i ionen", maskeAf(neutroner), String(neutroner)),
                    felt("Elektroner i ionen", maskeAf(elektroner), String(elektroner))
                ]
            }
        });
    }

    /* ----- Rum 2: vaeskerne, tavlen og flasken ------------------------- */
    /* Hvad sker der, naar to stoffer blandes? */
    Sag.bland = function (a, b) {
        if (a.fast && b.fast) return { umuligt: true };
        if (a.polaer === b.polaer) return { etLag: true, fast: a.fast ? a : b.fast ? b : null };
        if (a.fast || b.fast) return { etLag: false, fast: a.fast ? a : b, vaeske: a.fast ? b : a };
        var let_ = a.taethed < b.taethed ? a : b;
        return { etLag: false, oeverst: let_, nederst: let_ === a ? b : a };
    };

    function rum2(r) {
        var p = r.heltal(2, 4), n = 6 - p;
        var P = [D.VAND].concat(r.bland(D.BLAND_POLAER).slice(0, p - 1));
        var U = r.bland(D.BLAND_UPOLAER).slice(0, n);
        var stoffer = [D.VAND].concat(r.bland(P.slice(1).concat(U)));
        var mP = D.POLMOLEKYLER.filter(function (m) { return m.polaer; });
        var mU = D.POLMOLEKYLER.filter(function (m) { return !m.polaer; });
        var k = r.heltal(1, 4);
        var fem = r.bland(r.bland(mP).slice(0, k).concat(r.bland(mU).slice(0, 5 - k)));
        var streg = r.vaelg(D.STREGMOLEKYLER);
        var bm = r.vaelg(D.BONUSMOLEKYLER);
        return faerdig({
            stoffer: stoffer, antalUpolaere: n, molekyler: fem, antalPolaere: k, streg: streg,
            trin: [
                trin("bland", "bland", "Væskerne", "Klik på væskerne på bordet, og find de upolære stoffer.", String(n), "#"),
                trin("polaer", "tavle", "Tavlen", "Klik på tavlen, og find de polære molekyler.", String(k), "#"),
                trin("streger", "flaske", "Flasken", "Klik på flasken på hylden, og tæl stregerne i stregformlen.", String(streg.streger), "#")
            ],
            bonus: {
                molekyle: bm,
                felter: [
                    felt("Streger i stregformlen for " + bm.navn, maskeAf(bm.streger), String(bm.streger)),
                    felt("Frie elektronpar i " + bm.navn, "#", String(bm.par))
                ]
            }
        });
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

    /* Bonus: saa meget metal er tilbage, naar en lille maengde syre er brugt op. */
    function rest(met, m, cHCl, vHCl, M1, bet) {
        var M = M1 ? NK.rund(met.M, 1) : met.M;
        var nMet = cHCl * vHCl / 1000 / met.hcl;
        if (bet) nMet = NK.betydende(nMet, 3);
        return m - nMet * M;
    }
    Sag.rest = rest;
    Sag.REST_VALG = [[false, false], [true, false], [false, true], [true, true]];

    function rum3(r) {
        var met = r.vaelg(D.METALLER);
        for (var i = 0; i < 4000; i++) {
            var m = r.trin(met.lav, met.hoej, 0.01);
            var t = r.heltal(18, 28);
            var p = r.vaelg(D.TRYK);
            var cH = r.vaelg(D.BONUS_HCL_C), vH = r.trin(10, 100, 5);
            var V = rumfang(met, m, t, p, RUM3_VALG[0]);
            if (V < 0.5 || V >= 9.995) continue;
            if (!robust(RUM3_VALG.map(function (v) { return rumfang(met, m, t, p, v); }), 2)) continue;
            var rs = Sag.REST_VALG.map(function (v) { return rest(met, m, cH, vH, v[0], v[1]); });
            if (rs[0] < 0.25 * m || rs[0] > 0.75 * m || rs[0] < 0.1 || !robust(rs, 2)) continue;
            var nMet = m / met.M, nH2 = nMet * met.forhold[1] / met.forhold[0];
            var Vt = NK.komma(V, 2), rt = NK.komma(rs[0], 2);
            return faerdig({
                metal: met, m: m, t: t, p: p, nMetal: nMet, nH2: nH2, T: t + 273.15, V: V,
                trin: [
                    trin("vej", "vaegt", "Vægten", "Klik på vægten, og find stofmængden af metallet."),
                    trin("gas", "kolbe", "Kolben", "Klik på kolben, og find stofmængden af dihydrogen."),
                    trin("rumfang", "vejr", "Vejrstationen", "Klik på vejrstationen, og beregn rumfanget af dihydrogen.", Vt, maskeAf(Vt))
                ],
                bonus: {
                    cHCl: cH, vHCl: vH, rest: rs[0],
                    felter: [felt("Metal tilbage i gram", maskeAf(rt), cifre(rt))]
                }
            });
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
    /* Bonus: pH i kolben, da der var tilsat x mL base (syre i overskud). */
    function pHUndervejs(cBase, forbrug, Vsyre, x, valg) {
        var h;
        if (valg === 1) h = (NK.betydende(cBase * forbrug / Vsyre, 3) * Vsyre - cBase * x) / (Vsyre + x);
        else if (valg === 2) h = (NK.betydende(cBase * forbrug / 1000, 3) - NK.betydende(cBase * x / 1000, 3)) / ((Vsyre + x) / 1000);
        else h = cBase * (forbrug - x) / (Vsyre + x);
        return h > 0 ? -Math.log10(h) : NaN;
    }
    Sag.pHUndervejs = pHUndervejs;

    function rum4(r) {
        var syre = r.vaelg(D.SYRER), base = r.vaelg(D.BASER);
        for (var i = 0; i < 4000; i++) {
            var Vs = r.vaelg(D.SYRE_V), cb = r.vaelg(D.BASE_C);
            var foer = r.trin(0.10, 2.50, 0.05);
            var forbrug = r.trin(8.00, 24.00, 0.05);
            var efter = NK.rund(foer + forbrug, 2);
            var x = r.heltal(3, Math.floor(forbrug) - 3);
            var ph = pH(cb, forbrug, Vs, 0);
            if (!robust([ph, pH(cb, forbrug, Vs, 3), pH(cb, forbrug, Vs, 4)], 2)) continue;
            var px = [0, 1, 2].map(function (v) { return pHUndervejs(cb, forbrug, Vs, x, v); });
            if (px.some(isNaN) || !robust(px, 2) || px[0] >= 9.995) continue;
            var pt = NK.komma(ph, 2), xt = NK.komma(px[0], 2);
            return faerdig({
                syre: syre, base: base, Vsyre: Vs, cBase: cb, foer: foer, efter: efter, forbrug: forbrug,
                nBase: cb * forbrug / 1000, cSyre: cb * forbrug / Vs, pH: ph,
                trin: [
                    trin("titrer", "burette", "Buretten", "Klik på buretten, og titrer syren."),
                    trin("konc", "kolbe", "Kolben", "Klik på kolben, og beregn koncentrationen af syren."),
                    trin("ph", "tavle", "Tavlen", "Klik på tavlen, og beregn syrens pH.", pt, maskeAf(pt))
                ],
                bonus: {
                    x: x, pH: px[0],
                    felter: [felt("pH i kolben efter " + x + " mL " + base.formel, maskeAf(xt), cifre(xt))]
                }
            });
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
    /* Bonus: masseprocent af stoffet i det, proeven er lavet af. */
    function masseprocent(red, c, Vk, mPr, valg) {
        if (valg === 1) c = NK.rund(c, 3);
        var n = c * Vk / 1000;
        if (valg === 2) n = NK.betydende(n, 3);
        return n * red.M / mPr * 100;
    }
    Sag.masseprocent = masseprocent;

    function rum5(r) {
        var red = r.vaelg(D.REDOX);
        for (var i = 0; i < 6000; i++) {
            var cMn = r.vaelg(D.MN_C), Vp = r.vaelg(D.PROEVE_V), Vk = r.vaelg(D.MAALEKOLBE_V);
            var maal = r.trin(0.100, 0.300, 0.001);
            var Vmn = NK.rund(Math.round(maal * Vp * red.forhold[0] / (red.forhold[1] * cMn) / 0.05) * 0.05, 2);
            if (Vmn < 5 || Vmn > 40) continue;
            var c = koncentration(red, cMn, Vmn, Vp, false);
            if (!robust([c, koncentration(red, cMn, Vmn, Vp, true)], 3)) continue;
            var pctMaal = red.pctLav + r.tal() * (red.pctHoej - red.pctLav);
            var mPr = NK.rund(c * Vk / 1000 * red.M / (pctMaal / 100), 2);
            var pct = [0, 1, 2].map(function (v) { return masseprocent(red, c, Vk, mPr, v); });
            if (pct[0] < red.pctLav || pct[0] > red.pctHoej + 0.4 || !robust(pct, red.pctDec)) continue;
            var ct = NK.komma(c, 3), pt = NK.komma(pct[0], red.pctDec);
            return faerdig({
                redox: red, cMn: cMn, Vproeve: Vp, Vmn: Vmn,
                nMn: cMn * Vmn / 1000, nProeve: cMn * Vmn / 1000 * red.forhold[1] / red.forhold[0], c: c,
                trin: [
                    trin("titrer", "burette", "Buretten", "Klik på buretten, og titrer prøven."),
                    trin("forhold", "tavle", "Tavlen", "Klik på tavlen, og find stofmængden af " + red.stof + "."),
                    trin("konc", "kolbe", "Kolben", "Klik på kolben, og beregn koncentrationen af " + red.stof + ".", ct, maskeAf(ct))
                ],
                bonus: {
                    Vkolbe: Vk, mProeve: mPr, pct: pct[0],
                    felter: [felt("Masseprocent " + red.bonusStof, maskeAf(pt), cifre(pt))]
                }
            });
        }
        throw new Error("rum 5 kunne ikke laves");
    }

    /* ----- Hele sagen ------------------------------------------------- */
    Sag.lav = function (nr) {
        /* Hvert rum faar sin egen stroem af tal, saa en rettelse i et rum
           ikke flytter tallene i de andre. */
        function strm(k) { return new NK.Tilfaeldig((nr * 7919 + k * 104729) >>> 0); }
        return {
            nr: nr,
            rum: [null, rum1(strm(1)), rum2(strm(2)), rum3(strm(3)), rum4(strm(4)), rum5(strm(5))]
        };
    };

    Sag.cifre = cifre;
}());
