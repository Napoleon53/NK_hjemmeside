/* =====================================================================
   cifre.js - modellen: tal som cifre

   Alt regnes paa cifferstrenge, ikke med kommatal i maskinen. Saa bliver
   100422 afrundet til ét ciffer altid 1 · 10⁵ og aldrig 99999,99999, og
   0,1 + 0,2 bliver aldrig 0,30000000000000004. Samme tanke som i den
   gamle c4.10 (placeDecimal og generateFormattedAnswer), men her er hele
   tallet en streng hele vejen.

   Et tal er { s, p, neg }:
     s    cifrene fra det foerste, der ikke er nul. Nuller til sidst
          bliver staaende, for de er maalt.
     p    tierpotensen for det foerste ciffer
     neg  negativt
   0,0250 er { s: "250", p: -2 }, 4500 er { s: "4500", p: 3 } og 12,46
   er { s: "1246", p: 1 }. Tallet 0 har s = "".

   Reglen (som i den gamle): alle cifre er betydende, undtagen nullerne
   foran det foerste ciffer, der ikke er nul. Ogsaa nullerne til sidst i
   et helt tal taeller, saa 4500 har fire. Skal de ikke taelle, skrives
   tallet i videnskabelig notation: 4,5 · 10³.

   Opgaverne laves her (lav), tjekkes her (tjek), og hint, svar og
   forklaring skrives her. Ingen DOM.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var C = {};

    /* Kan byttes ud i selvtesten */
    C.rnd = Math.random;
    function heltal(a, b) { return a + Math.floor(C.rnd() * (b - a + 1)); }
    function vaelg(liste) { return liste[Math.floor(C.rnd() * liste.length)]; }
    function nuller(n) { return n > 0 ? new Array(n + 1).join("0") : ""; }

    function tal(s, p, neg) { return { s: s, p: s ? p : 0, neg: !!(neg && s) }; }
    C.tal = tal;

    /* ----- Laesning ------------------------------------------------------------
       Et almindeligt tal med komma, fx "0,0250". Punktum er ogsaa komma,
       som i den gamle, medmindre der er flere punktummer eller baade
       punktum og komma: saa er punktummerne tusindtalsskilletegn. */
    C.fraTekst = function (tekst) {
        var t = String(tekst === undefined || tekst === null ? "" : tekst)
            .replace(/[\s  ]/g, "").replace(/[−–]/g, "-");
        var punkter = (t.match(/\./g) || []).length;
        if (punkter > 1 || (punkter && t.indexOf(",") >= 0)) t = t.replace(/\./g, "");
        else t = t.replace(".", ",");
        var m = /^([+-]?)(\d*)(?:,(\d*))?$/.exec(t);
        if (!m || (m[2] + (m[3] || "")) === "") return null;
        var hel = m[2], alle = hel + (m[3] || "");
        var f = alle.search(/[1-9]/);
        if (f < 0) return tal("", 0, false);
        return tal(alle.slice(f), hel.length - f - 1, m[1] === "-");
    };

    /* Det, eleven skriver: tallet og eventuelt eksponenten i det lille
       felt ved 10-tallet. Skrives potensen i selve feltet (4,56e3,
       4,56*10^3, 4,56·10^3), forstaas den ogsaa. */
    C.laesSvar = function (mantisse, eksp) {
        var m = String(mantisse || "").replace(/[\s  ]/g, "").replace(/[−–]/g, "-");
        var e = String(eksp || "").replace(/[\s  ]/g, "").replace(/[−–]/g, "-");
        var ind = /^(.*?)(?:[eE]|[*·×xX]10\^?)([+-]?\d+)$/.exec(m);
        if (ind) {
            if (e !== "") return { fejl: "Skriv eksponenten ét sted." };
            m = ind[1];
            e = ind[2];
        }
        m = m.replace(/[*·×xX]10\^?$/, "");
        if (m === "" && e === "") return { tom: true };
        if (m === "") return { fejl: "Skriv tallet foran 10-tallet." };
        var mt = C.fraTekst(m);
        if (!mt) return { fejl: "Det kan ikke læses som et tal. Brug kun cifre og komma." };
        if (e === "") return { tal: mt, mantisse: mt, eksp: null, potens: false, raa: m };
        if (!/^[+-]?\d+$/.test(e)) return { fejl: "Eksponenten skal være et helt tal, fx 3 eller −4." };
        var ek = parseInt(e, 10);
        return { tal: tal(mt.s, mt.p + ek, mt.neg), mantisse: mt, eksp: ek, potens: true, raa: m };
    };

    /* ----- Taelling og sammenligning ---------------------------------------------- */
    C.antal = function (t) { return t.s.length; };

    function kerne(t) { return t.s.replace(/0+$/, ""); }

    /* Samme vaerdi, uanset hvor mange nuller der staar til sidst */
    C.ens = function (a, b) {
        var ka = kerne(a), kb = kerne(b);
        if (!ka && !kb) return true;
        return ka === kb && a.p === b.p && a.neg === b.neg;
    };

    /* Samme cifre, men en anden stoerrelse: giver forskellen i tierpotens
       (a er 10^k gange b), ellers null */
    C.tiGange = function (a, b) {
        var ka = kerne(a), kb = kerne(b);
        if (!ka || ka !== kb || a.neg !== b.neg || a.p === b.p) return null;
        return a.p - b.p;
    };

    /* ----- Afrunding ------------------------------------------------------------------ */
    function plusEn(s) {
        var a = s.split(""), i = a.length - 1;
        while (i >= 0) {
            if (a[i] === "9") { a[i] = "0"; i--; } else { a[i] = String(+a[i] + 1); return a.join(""); }
        }
        return "1" + a.join("");
    }

    /* Til n betydende cifre. 5 og derover rundes op. */
    C.afrund = function (t, n) {
        if (!t.s) return t;
        if (t.s.length <= n) return tal(t.s + nuller(n - t.s.length), t.p, t.neg);
        var behold = t.s.slice(0, n), p = t.p;
        if (t.s.charAt(n) >= "5") {
            behold = plusEn(behold);
            if (behold.length > n) { behold = behold.slice(0, n); p++; }
        }
        return tal(behold, p, t.neg);
    };

    /* Skaaret af i stedet for afrundet */
    C.afskaar = function (t, n) {
        if (t.s.length <= n) return C.afrund(t, n);
        return tal(t.s.slice(0, n), t.p, t.neg);
    };

    /* Afrundet ved tierpotensen k: cifrene med potens k og derover
       bliver. To decimaler er k = -2. */
    C.afrundVed = function (t, k) {
        var n = t.p - k + 1;
        if (n >= 1) return C.afrund(t, n);
        if (n === 0 && t.s.charAt(0) >= "5") return tal("1", k, t.neg);
        return tal("", 0, false);
    };

    /* Det foerste ciffer, der fjernes ved afrunding til n cifre */
    C.naesteCiffer = function (t, n) {
        return t.s.length > n ? +t.s.charAt(n) : 0;
    };

    /* ----- Skrivemaader ------------------------------------------------------------------
       Et helt tal kan kun skrives almindeligt, hvis der ikke skal fyldes
       nuller paa, som ville taelle med: 46 000 med to betydende cifre
       skal skrives 4,6 · 10⁴. */
    C.kanAlmindelig = function (t) { return !t.s || t.p <= t.s.length - 1; };

    /* Den uskrevne regel (brugerens oenske 25. sept. 2026): et tal fra
       0,01 til 100 skrives som almindeligt tal, ikke i videnskabelig
       notation. Ingen opgave lægger op til det modsatte, og et svar med
       10-tallet i det omraade godkendes med en note. */
    C.iOmraade = function (t) {
        if (!t.s) return false;
        if (t.p >= -2 && t.p <= 1) return true;
        return t.p === 2 && kerne(t) === "1";
    };

    C.almindelig = function (t) {
        if (!t.s) return "0";
        var s = t.s, p = t.p, ud;
        if (p < 0) ud = "0," + nuller(-p - 1) + s;
        else if (p >= s.length - 1) ud = s + nuller(p - (s.length - 1));
        else ud = s.slice(0, p + 1) + "," + s.slice(p + 1);
        return (t.neg ? "−" : "") + ud;
    };

    /* Tusindtalsskilletegn (et smalt mellemrum) i tal med fem cifre eller
       flere foran kommaet. Fire cifre skrives uden, som i den gamle. */
    C.skillerum = function (str) {
        var m = /^(−?)(\d+)(,\d*)?$/.exec(str);
        if (!m) return str;
        var hel = m[2];
        if (hel.length >= 5) hel = hel.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        return m[1] + hel + (m[3] || "");
    };

    C.mantisse = function (t) {
        if (!t.s) return "0";
        return (t.neg ? "−" : "") + t.s.charAt(0) + (t.s.length > 1 ? "," + t.s.slice(1) : "");
    };

    /* Eksponenten med rigtigt minus (−3) og haevet (⁻³) */
    function eksTekst(p) { return p < 0 ? "−" + (-p) : String(p); }

    C.potensTekst = function (t) {
        return C.mantisse(t) + " · 10" + NK.haevet(String(t.p));
    };

    C.potensHTML = function (t) {
        return C.mantisse(t) + " · 10<sup>" + eksTekst(t.p) + "</sup>";
    };

    /* Sådan skrives et facit: almindeligt, naar det kan, ellers i
       videnskabelig notation */
    C.tekst = function (t) {
        return C.kanAlmindelig(t) ? C.skillerum(C.almindelig(t)) : C.potensTekst(t);
    };

    C.html = function (t) {
        return C.kanAlmindelig(t) ? C.skillerum(C.almindelig(t)) : C.potensHTML(t);
    };

    /* Vaerdien uden nuller til sidst, som en lommeregner viser den */
    C.lommeregner = function (t) {
        var k = kerne(t);
        return k ? tal(k, t.p, t.neg) : t;
    };

    /* Det, eleven skrev, sat pænt op igen */
    C.svarHTML = function (sv) {
        if (!sv || !sv.tal) return "";
        var m = C.skillerum(C.almindelig(sv.mantisse));
        return sv.potens ? m + " · 10<sup>" + eksTekst(sv.eksp) + "</sup>" : m;
    };

    function flertal(n, en, flere) { return n === 1 ? en : flere; }
    function cifre(n) { return n + " " + flertal(n, "betydende ciffer", "betydende cifre"); }
    function pladser(n) { return n + " " + flertal(n, "plads", "pladser"); }
    C.cifreTekst = cifre;

    /* ----- Brikkerne paa tavlen ---------------------------------------------------------
       Et tal skrevet som tekst bliver til brikker: et ciffer pr. brik og
       kommaet for sig. mellemrum: der staar et lille mellemrum foran
       brikken (tusindtal). i: nummeret paa cifferet fra venstre. */
    C.brikker = function (str) {
        var ud = [], i = 0, ren = String(str).replace(/[ \s]/g, "");
        var komma = ren.indexOf(","), hel = komma < 0 ? ren.replace(/^−/, "").length : komma - (ren.charAt(0) === "−" ? 1 : 0);
        var pos = 0;
        for (var j = 0; j < ren.length; j++) {
            var c = ren.charAt(j);
            if (c === ",") { ud.push({ tegn: ",", komma: true }); continue; }
            if (c === "−") { ud.push({ tegn: "−", fortegn: true }); continue; }
            var mellem = pos < hel && hel >= 5 && pos > 0 && (hel - pos) % 3 === 0;
            ud.push({ tegn: c, ciffer: true, i: i, mellemrum: mellem });
            i++;
            pos++;
        }
        return ud;
    };

    /* Hvilke cifre (nummer fra venstre) er betydende i et tal skrevet som tekst */
    C.betydendeI = function (str) {
        var cif = String(str).replace(/[^\d]/g, ""), f = cif.search(/[1-9]/), ud = [];
        if (f < 0) return ud;
        for (var i = f; i < cif.length; i++) ud.push(i);
        return ud;
    };

    /* Hvad slags nuller et tal har: foran, i midten, til sidst efter
       kommaet og til sidst i et helt tal */
    C.nulTyper = function (str) {
        var ren = String(str).replace(/[ \s−]/g, "");
        var komma = ren.indexOf(","), cif = ren.replace(",", "");
        var f = cif.search(/[1-9]/), l = cif.search(/0+$/);
        var r = { foran: f > 0, midte: false, sidstDec: false, sidstHel: false };
        var sidste = l >= 0 ? l : cif.length;
        for (var i = f + 1; i < sidste; i++) if (cif.charAt(i) === "0") r.midte = true;
        if (l > f && l >= 0) {
            if (komma >= 0) r.sidstDec = true;
            else r.sidstHel = true;
        }
        return r;
    };

    /* =================================================================================
       OPGAVERNE
       Typerne er de fem fra den gamle c4.10: tael (optaelling), afrund
       (afrunding), potens og almindelig (notation begge veje), regn
       (regneregler, nu ogsaa division) og enhed (mL, L og µL i den gamle,
       nu ogsaa masse, stofmaengde, koncentration og tryk).
       runde er fanens runde; den husker, om der har vaeret en opgave med
       ét betydende ciffer (hoejst én pr. runde, som i den gamle).
       ================================================================================= */
    C.TYPENAVN = {
        tael: "Betydende cifre",
        afrund: "Afrunding",
        regn: "Regneregler",
        potens: "Videnskabelig notation",
        almindelig: "Videnskabelig notation",
        enhed: "Enheder"
    };

    function tekstAf(v) { return String(v).replace(".", ","); }

    /* ----- Optaelling -------------------------------------------------------------------
       Tre slags tal som i den gamle: 0,00-tal med nuller foran, hele tal
       med nuller til sidst og kommatal op til 500. foran: et tal med
       nuller foran (den foerste opgave i en runde). */
    function lavTael(runde, foran) {
        var s, t, forsoeg = 0;
        do {
            var r = foran ? 0 : C.rnd();
            if (r < 0.3) {
                var sf = heltal(1, 3), del = Math.floor(C.rnd() * Math.pow(10, sf));
                if (!del) del = 1;
                s = "0," + nuller(heltal(1, 3)) + del;
            } else if (r < 0.6) {
                s = heltal(1, 98) + nuller(heltal(1, 3));
            } else {
                s = tekstAf((C.rnd() * 500).toFixed(heltal(1, 3)));
            }
            t = C.fraTekst(s);
            forsoeg++;
        } while ((!t || !t.s) && forsoeg < 50);
        return {
            type: "tael", spm: "Hvilke cifre er betydende? Klik på dem.",
            vis: s, tal: t, facit: t.s.length, betydende: C.betydendeI(s)
        };
    }

    /* ----- Afrunding --------------------------------------------------------------------
       Som den gamle: 1 til 4 betydende cifre (1 hoejst én gang pr. runde),
       hele tal op til 900 000 eller kommatal op til 500, hoejst 7 tegn.
       Nyt: tallet har altid flere cifre end der skal afrundes til, saa
       der er noget at runde. */
    function lavAfrund(runde) {
        var n = 3, r = C.rnd();
        if (r < 0.15) {
            if (!runde.enCiffer) { n = 1; runde.enCiffer = true; } else n = 2;
        } else if (r < 0.4) n = 2;
        else if (r < 0.8) n = 3;
        else n = 4;
        var base, t, f, forsoeg = 0;
        do {
            if (C.rnd() < 0.3) {
                base = String(Math.floor(C.rnd() * 900000 + 1));
            } else {
                var v = C.rnd() * 500, dec = Math.max(2, n - 1);
                if (v > 100) dec = Math.min(dec, 3);
                base = tekstAf(v.toFixed(dec));
                if (base.length > 7) base = base.substring(0, 7);
            }
            t = C.fraTekst(base);
            f = t && t.s ? C.afrund(t, n) : null;
            forsoeg++;
            /* 67 med ét ciffer skal efter reglen skrives 7 · 10¹, men tal
               mellem 0,01 og 100 skrives ikke i videnskabelig notation. Den
               slags springes over (den gamle sprang kun 1 · 10¹ over). */
        } while ((!t || !t.s || t.s.length <= n || (!C.kanAlmindelig(f) && C.iOmraade(f))) && forsoeg < 80);
        return {
            type: "afrund", spm: "Afrund til " + cifre(n) + ".",
            vis: base, tal: t, n: n, facit: f
        };
    }

    /* ----- Regneregler ------------------------------------------------------------------
       Parrene fra den gamle. Hver faktor skrives med 1 til 3 betydende
       cifre. Nyt: division, hvor produktet deles med den ene faktor. Et
       facit, der kun kan skrives som potens, springes over. */
    var PAR = [
        { a: 2, b: 3 }, { a: 2, b: 4 }, { a: 3, b: 3 }, { a: 5, b: 2 },
        { a: 1.5, b: 2 }, { a: 2.5, b: 2 }, { a: 4, b: 0.5 }, { a: 1.2, b: 2 }
    ];

    function skrivFaktor(v) {
        var r = C.rnd();
        v = Math.round(v * 1000) / 1000;
        if (v === Math.round(v)) {
            if (r < 0.3) return String(v);
            if (r < 0.7) return tekstAf(v.toFixed(1));
            return tekstAf(v.toFixed(2));
        }
        if (r < 0.5) return tekstAf(String(v));
        return tekstAf(v.toFixed(2));
    }

    /* Produktet af to tal, uden afrunding */
    C.gange = function (a, b) {
        var ia = parseInt(a.s, 10), ib = parseInt(b.s, 10);
        var e = (a.p - (a.s.length - 1)) + (b.p - (b.s.length - 1));
        var d = String(ia * ib);
        return tal(d, d.length - 1 + e, a.neg !== b.neg);
    };

    function lavRegn() {
        var o, forsoeg = 0;
        do {
            var par = vaelg(PAR), dele = C.rnd() < 0.4;
            var sa, sb, praecis;
            if (dele) {
                sa = skrivFaktor(par.a * par.b);
                sb = skrivFaktor(par.a);
                praecis = C.fraTekst(tekstAf(String(par.b)));
            } else {
                sa = skrivFaktor(par.a);
                sb = skrivFaktor(par.b);
            }
            var A = C.fraTekst(sa), B = C.fraTekst(sb);
            if (!dele) praecis = C.gange(A, B);
            var n = Math.min(A.s.length, B.s.length);
            o = {
                type: "regn", spm: "Regn ud, og afrund korrekt.",
                a: sa, b: sb, A: A, B: B, op: dele ? "/" : "·",
                praecis: C.lommeregner(praecis), n: n, facit: C.afrund(praecis, n),
                mindst: A.s.length <= B.s.length ? sa : sb
            };
            forsoeg++;
        } while (!C.kanAlmindelig(o.facit) && forsoeg < 50);
        return o;
    }

    /* ----- Videnskabelig notation -------------------------------------------------------
       Som den gamle: 40 % smaa tal, ellers 10² til 10⁶, og 1 til 4
       betydende cifre. retning: "potens" (skriv i videnskabelig notation)
       eller "almindelig" (skriv som almindeligt tal). Efter den uskrevne
       regel (C.iOmraade) skal et tal mellem 0,01 og 100 ikke skrives i
       videnskabelig notation, saa i den retning er de smaa tal 10⁻³ til
       10⁻⁵ og ikke 10⁻² til 10⁻⁴ som i den gamle, og 100 selv springes
       over. Den anden vej er det som i den gamle. */
    function lavNotation(retning) {
        var t, pot, sf, forsoeg = 0;
        var fra = retning === "potens" ? 3 : 2;
        do {
            var lille = C.rnd() < 0.4;
            pot = lille ? -heltal(fra, fra + 2) : heltal(2, 6);
            sf = heltal(1, 4);
            var dec = sf - 1;
            var maks = 10 - Math.pow(10, -dec);
            var m = C.fraTekst(tekstAf(Math.min(C.rnd() * 9 + 1, maks).toFixed(dec)));
            t = tal(m.s, m.p + pot, false);
            forsoeg++;
        } while (retning === "potens" && C.iOmraade(t) && forsoeg < 50);
        if (retning === "almindelig") {
            return {
                type: "almindelig", spm: "Skriv som almindeligt tal.",
                tal: t, n: sf, facit: t, vis: C.mantisse(t), eksp: pot
            };
        }
        return {
            type: "potens", spm: "Skriv i videnskabelig notation med " + cifre(sf) + ".",
            tal: t, n: sf, facit: t, vis: C.almindelig(t)
        };
    }

    /* ----- Enheder ----------------------------------------------------------------------
       Den gamle havde mL, L og µL. Nu fem slags maengder, alle med
       forstavelser, saa kommaet flyttes (brugerens oenske 25. sept. 2026).
       eksp er enhedens tierpotens i forhold til grundenheden. vaegt er,
       hvor ofte slagsen kommer; volumen oftest, som i den gamle. Et par
       med samme potens (mL og cm³) og et spring paa mere end 10⁶ bruges
       ikke. */
    C.ENHEDER = {
        volumen: { vaegt: 3, eksp: { "m³": 3, "L": 0, "dm³": 0, "dL": -1, "mL": -3, "cm³": -3, "µL": -6 } },
        masse: { vaegt: 2, eksp: { "kg": 3, "g": 0, "mg": -3, "µg": -6 } },
        stofmaengde: { vaegt: 2, eksp: { "mol": 0, "mmol": -3, "µmol": -6 } },
        koncentration: { vaegt: 1, eksp: { "mol/L": 0, "mmol/L": -3, "µmol/L": -6 } },
        tryk: { vaegt: 1, eksp: { "kPa": 3, "hPa": 2, "Pa": 0 } }
    };

    /* Tallene i hver enhed, saa de ligner rigtige maengder: 250 mL, 1,5 L
       og 500 µL (som i den gamle), 0,025 mol, 101,3 kPa, 1013 hPa. hel:
       antal cifre foran kommaet (0: tallet er under 1). dec: antal
       decimaler (et vaelges). Er der flere, vaelges et af dem. */
    var ENHED_TAL = {
        "m³": [{ hel: 1, dec: [1, 2] }],
        "L": [{ hel: 1, dec: [1, 2, 2] }],
        "dm³": [{ hel: 1, dec: [1, 2, 2] }],
        "dL": [{ hel: 1, dec: [0, 1] }],
        "mL": [{ hel: 3, dec: [0, 0, 1] }],
        "cm³": [{ hel: 3, dec: [0, 0, 1] }],
        "µL": [{ hel: 4, dec: [0, 0, 0] }],
        "kg": [{ hel: 1, dec: [1, 2, 3] }],
        "g": [{ hel: 2, dec: [1, 2] }, { hel: 0, dec: [2, 3] }],
        "mg": [{ hel: 3, dec: [0, 0, 1] }],
        "µg": [{ hel: 3, dec: [0] }],
        "mol": [{ hel: 0, dec: [3, 4] }, { hel: 1, dec: [2, 3] }],
        "mmol": [{ hel: 2, dec: [0, 1, 2] }, { hel: 3, dec: [0] }],
        "µmol": [{ hel: 3, dec: [0] }],
        "mol/L": [{ hel: 0, dec: [2, 3, 4] }, { hel: 1, dec: [2, 3] }],
        "mmol/L": [{ hel: 2, dec: [0, 1] }, { hel: 3, dec: [0] }],
        "µmol/L": [{ hel: 3, dec: [0] }],
        "kPa": [{ hel: 3, dec: [0, 1] }],
        "hPa": [{ hel: 4, dec: [0] }],
        "Pa": [{ hel: 6, dec: [0] }]
    };

    C.ENHED_EKSP = {};
    Object.keys(C.ENHEDER).forEach(function (s) {
        var e = C.ENHEDER[s].eksp;
        Object.keys(e).forEach(function (n) { C.ENHED_EKSP[n] = e[n]; });
    });

    function vaelgSlags() {
        var navne = Object.keys(C.ENHEDER), sum = 0, r;
        navne.forEach(function (n) { sum += C.ENHEDER[n].vaegt; });
        r = C.rnd() * sum;
        for (var i = 0; i < navne.length; i++) {
            r -= C.ENHEDER[navne[i]].vaegt;
            if (r < 0) return navne[i];
        }
        return navne[0];
    }

    function lavEnhed(slags) {
        var e, enheder, fra, til, k;
        slags = slags || vaelgSlags();
        e = C.ENHEDER[slags].eksp;
        enheder = Object.keys(e);
        do {
            fra = vaelg(enheder);
            til = vaelg(enheder);
            k = e[fra] - e[til];
        } while (k === 0 || Math.abs(k) > 6);
        var o = vaelg(ENHED_TAL[fra]);
        var d = vaelg(o.dec);
        var h = o.hel > 0 ? Math.floor(C.rnd() * (Math.pow(10, o.hel) - 1)) + 1 : 0;
        var rest = d > 0 ? Math.floor(C.rnd() * Math.pow(10, d)) : 0;
        if (!h && !rest) rest = 1;
        var base = tekstAf((h + rest / Math.pow(10, d)).toFixed(d));
        var t = C.fraTekst(base);
        return {
            type: "enhed", spm: "Omregn til " + til + ".", slags: slags,
            vis: base, tal: t, fra: fra, til: til, k: k,
            facit: C.lommeregner(tal(t.s, t.p + k, false))
        };
    }
    C.lavEnhed = lavEnhed;

    /* 1 kg = 1000 g: den store enhed udtrykt i den lille */
    C.enhedRelation = function (opg) {
        var stor = opg.k > 0 ? opg.fra : opg.til, lille = opg.k > 0 ? opg.til : opg.fra;
        return "1 " + stor + " = " + C.skillerum("1" + nuller(Math.abs(opg.k))) + " " + lille;
    };

    /* type: tael, afrund, regn, potens, almindelig, notation (en af de to) eller enhed */
    C.lav = function (type, runde, valg) {
        runde = runde || {};
        valg = valg || {};
        if (type === "notation") type = C.rnd() < 0.5 ? "potens" : "almindelig";
        if (type === "tael") return lavTael(runde, valg.foran);
        if (type === "afrund") return lavAfrund(runde);
        if (type === "regn") return lavRegn();
        if (type === "potens" || type === "almindelig") return lavNotation(type);
        if (type === "enhed") return lavEnhed();
        return null;
    };

    /* =================================================================================
       TJEK
       Giver { tom, ok, besked, note }. besked er HTML til linjen under
       svarfeltet. Et forkert svar faar en besked, der passer til fejlen,
       uden at facit staar i den.
       ================================================================================= */
    function rigtigt(opg) { return C.forklaring(opg); }

    /* Optaelling: valgt er en liste med cifrenes numre fra venstre */
    function tjekTael(opg, valgt) {
        if (!valgt || !valgt.length) return { tom: true, besked: "Klik på de cifre, der er betydende. Tryk så Tjek." };
        var ret = {}, cif = opg.vis.replace(/[^\d]/g, "");
        opg.betydende.forEach(function (i) { ret[i] = true; });
        var v = {};
        valgt.forEach(function (i) { v[i] = true; });
        var forMange = valgt.filter(function (i) { return !ret[i]; });
        var mangler = opg.betydende.filter(function (i) { return !v[i]; });
        if (!forMange.length && !mangler.length) return { ok: true, besked: rigtigt(opg) };
        if (forMange.length) {
            return { ok: false, besked: forMange.length === 1 ?
                "Et af dine cifre er et nul foran det første ciffer, der ikke er nul. Det tæller ikke." :
                "Nogle af dine cifre er nuller foran det første ciffer, der ikke er nul. De tæller ikke." };
        }
        /* Hvad slags cifre mangler der? */
        var komma = opg.vis.indexOf(",") >= 0, sidsteIkkeNul = cif.search(/0*$/) - 1;
        var ikkeNul = mangler.some(function (i) { return cif.charAt(i) !== "0"; });
        var sidst = mangler.some(function (i) { return cif.charAt(i) === "0" && i > sidsteIkkeNul; });
        var midte = mangler.some(function (i) { return cif.charAt(i) === "0" && i < sidsteIkkeNul; });
        if (ikkeNul) return { ok: false, besked: "Du mangler et ciffer, der ikke er nul. De tæller altid." };
        if (midte) return { ok: false, besked: "Du mangler et nul mellem to andre cifre. Det tæller med." };
        if (sidst && komma) return { ok: false, besked: "Du mangler et nul til sidst. Et nul til sidst efter kommaet tæller med: det er målt." };
        if (sidst) return { ok: false, besked: "Du mangler nullerne til sidst. I et helt tal tæller de også med." };
        return { ok: false, besked: "Ikke helt. Tæl igen." };
    }

    /* Afrunding: fejlene, elever faktisk laver */
    function tjekAfrund(opg, sv, udgangspunkt, n, faktorTekst) {
        var f = opg.facit, u = sv.tal, k = C.antal(u);
        if (C.ens(u, f)) {
            if (k === n) {
                var r = { ok: true, besked: rigtigt(opg) };
                if (sv.potens && (sv.mantisse.p !== 0)) r.note = "I videnskabelig notation står der ét ciffer foran kommaet: " + C.potensHTML(f) + ".";
                return r;
            }
            if (k > n && !sv.potens && !C.kanAlmindelig(f)) {
                return { ok: false, besked: "Tallet er rigtigt, men " + C.skillerum(C.almindelig(u)) + " har " + cifre(k) +
                    ". Nullerne til sidst tæller med. Brug feltet ved 10-tallet, så de forsvinder." };
            }
            if (faktorTekst) return { ok: false, besked: "Tallet er rigtigt, men svaret skal have " + cifre(n) + ", lige som " + faktorTekst + ". Dit har " + k + "." };
            if (k < n) return { ok: false, besked: "Tallet er rigtigt, men det har kun " + cifre(k) + ". Det skal have " + n + ". Nuller til sidst efter kommaet tæller med." };
            return { ok: false, besked: "Tallet er rigtigt, men det har " + cifre(k) + ". Det skal have " + n + "." };
        }
        var d = C.naesteCiffer(udgangspunkt, n);
        var skaaret = C.afskaar(udgangspunkt, n);
        var s1 = plusEn(skaaret.s);
        var opad = s1.length > n ? tal(s1.slice(0, n), skaaret.p + 1, skaaret.neg) : tal(s1, skaaret.p, skaaret.neg);
        if (d >= 5 && C.ens(u, skaaret)) {
            return { ok: false, besked: "Du har skåret cifrene af. Det første ciffer, der fjernes, er " + d + ". Det er 5 eller mere, så der rundes op." };
        }
        if (d < 5 && udgangspunkt.s.length > n && C.ens(u, opad)) {
            return { ok: false, besked: "Det første ciffer, der fjernes, er " + d + ". Det er under 5, så der rundes ned." };
        }
        var dec = C.afrundVed(udgangspunkt, -n);
        if (udgangspunkt.p < 0 && dec.s && C.ens(u, dec)) {
            return { ok: false, besked: "Du har afrundet til " + n + " " + flertal(n, "decimal", "decimaler") +
                ". Det er betydende cifre, der tælles, fra det første ciffer, der ikke er nul." };
        }
        var g = C.tiGange(u, f);
        if (g !== null) {
            return { ok: false, besked: "Cifrene er rigtige, men tallet er " + C.skillerum("1" + nuller(Math.abs(g))) + " gange for " +
                (g > 0 ? "stort" : "lille") + ". Afrunding ændrer ikke tallets størrelse." };
        }
        if (faktorTekst && C.ens(u, C.afrund(opg.praecis, Math.max(C.antal(opg.A), C.antal(opg.B))))) {
            return { ok: false, besked: "Du har afrundet efter den mest præcise faktor. Det er den mindst præcise, der bestemmer." };
        }
        if (k > n) return { ok: false, besked: "Dit tal har " + cifre(k) + ". Det skal have " + n + ". Tæl fra det første ciffer, der ikke er nul." };
        return { ok: false, besked: "Ikke rigtigt. Tæl " + n + " cifre fra det første, der ikke er nul, og se på det næste ciffer." };
    }

    function tjekRegn(opg, sv) {
        var u = sv.tal;
        if (!C.ens(u, opg.facit) && C.ens(u, opg.praecis)) {
            return { ok: false, besked: "Det er lommeregnerens tal. Afrund til " + cifre(opg.n) + ", lige som " + opg.mindst + "." };
        }
        return tjekAfrund(opg, sv, opg.praecis, opg.n, opg.mindst);
    }

    function tjekPotens(opg, sv) {
        var f = opg.facit, u = sv.tal, n = opg.n;
        if (!sv.potens) {
            if (C.ens(u, f)) return { ok: false, besked: "Tallet er rigtigt, men det skal skrives i videnskabelig notation. Skriv eksponenten i feltet ved 10-tallet." };
            return { ok: false, besked: "Skriv tallet med ét ciffer foran kommaet, og eksponenten i feltet ved 10-tallet." };
        }
        var mt = sv.mantisse, godMantisse = mt.p === 0;
        if (C.ens(u, f)) {
            if (!godMantisse) return { ok: false, besked: "Værdien passer, men der skal stå ét ciffer (1 til 9) foran kommaet." };
            if (C.antal(u) !== n) return { ok: false, besked: "Værdien passer, men tallet foran 10-tallet skal have " + cifre(n) + ". Dit har " + C.antal(u) + "." };
            return { ok: true, besked: rigtigt(opg) };
        }
        if (godMantisse && kerne(mt) === kerne(f)) {
            if (sv.eksp === -f.p && f.p !== 0) {
                return { ok: false, besked: f.p < 0 ? "Fortegnet på eksponenten er forkert. Et tal under 1 har negativ eksponent." :
                    "Fortegnet på eksponenten er forkert. Et tal over 10 har positiv eksponent." };
            }
            return { ok: false, besked: "Cifrene er rigtige, men eksponenten er " + (sv.eksp > f.p ? "for stor" : "for lille") +
                ". Tæl, hvor mange pladser kommaet flytter sig." };
        }
        if (!godMantisse) return { ok: false, besked: "Der skal stå ét ciffer (1 til 9) foran kommaet. Flyt kommaet, og tæl pladserne." };
        return { ok: false, besked: "Ikke rigtigt. Flyt kommaet, til der står ét ciffer foran det. Antallet af pladser er eksponenten." };
    }

    function tjekAlmindelig(opg, sv) {
        var f = opg.facit, u = sv.tal;
        if (sv.potens) {
            if (C.ens(u, f)) return { ok: false, besked: "Tallet er rigtigt, men det skal skrives uden 10-tallet, som et almindeligt tal." };
            return { ok: false, besked: "Skriv tallet uden 10-tallet, som et almindeligt tal." };
        }
        if (C.ens(u, f)) return { ok: true, besked: rigtigt(opg) };
        var g = C.tiGange(u, f);
        if (g !== null) {
            var e = opg.eksp;
            if (g === -2 * e) {
                return { ok: false, besked: e < 0 ? "Negativ eksponent betyder et tal under 1. Kommaet skal flyttes til venstre." :
                    "Positiv eksponent betyder et tal over 10. Kommaet skal flyttes til højre." };
            }
            return { ok: false, besked: "Cifrene er rigtige, men kommaet er flyttet " + pladser(Math.abs(g)) + " for " +
                ((g > 0) === (e > 0) ? "meget" : "lidt") + ". Eksponenten er " + eksTekst(e) + "." };
        }
        return { ok: false, besked: "Ikke rigtigt. 10-tallets eksponent siger, hvor mange pladser kommaet flyttes." };
    }

    function tjekEnhed(opg, sv) {
        var f = opg.facit, u = sv.tal;
        if (C.ens(u, f)) return { ok: true, besked: rigtigt(opg) };
        var g = C.tiGange(u, f);
        if (g !== null) {
            if (g === -2 * opg.k) {
                var stoerre = opg.k > 0;
                return { ok: false, besked: "Tallet skal blive " + (stoerre ? "større" : "mindre") + ", ikke " + (stoerre ? "mindre" : "større") +
                    ": 1 " + opg.fra + " er " + (stoerre ? "mere" : "mindre") + " end 1 " + opg.til + "." };
            }
            if (Math.abs(opg.k) === 6 && Math.abs(g) === 3) {
                return { ok: false, besked: "Fra " + opg.fra + " til " + opg.til + " er der to trin på 1000: " + C.enhedRelation(opg) + "." };
            }
            return { ok: false, besked: "Cifrene er rigtige, men kommaet er flyttet forkert. " + C.enhedRelation(opg) + "." };
        }
        return { ok: false, besked: "Ikke rigtigt. " + C.enhedRelation(opg) + ". Flyt kommaet, og lad cifrene være." };
    }

    /* svar: { valgt } ved optaelling, ellers { mantisse, eksp } som tekst */
    C.tjek = function (opg, svar) {
        if (opg.type === "tael") return tjekTael(opg, svar && svar.valgt);
        var sv = C.laesSvar(svar && svar.mantisse, svar && svar.eksp);
        if (sv.tom) return { tom: true, besked: "Skriv dit svar i feltet, og tryk Tjek." };
        if (sv.fejl) return { tom: true, besked: sv.fejl };
        var r;
        if (opg.type === "afrund") r = tjekAfrund(opg, sv, opg.tal, opg.n, null);
        else if (opg.type === "regn") r = tjekRegn(opg, sv);
        else if (opg.type === "potens") r = tjekPotens(opg, sv);
        else if (opg.type === "almindelig") r = tjekAlmindelig(opg, sv);
        else r = tjekEnhed(opg, sv);
        /* Den uskrevne regel: rigtigt, men et tal mellem 0,01 og 100
           skriver man normalt uden 10-tallet */
        if (r.ok && sv.potens && opg.type !== "potens" && C.iOmraade(sv.tal) && C.kanAlmindelig(sv.tal)) {
            r.note = "Et tal mellem 0,01 og 100 skriver man normalt uden 10-tallet: " + C.skillerum(C.almindelig(sv.tal)) + ".";
        }
        r.svar = sv;
        return r;
    };

    /* =================================================================================
       HINT, SVAR OG FORKLARING
       Hintet hoerer til den konkrete opgave. Svaret giver facit og hvorfor.
       Forklaringen kommer ogsaa ved et rigtigt svar (én saetning).
       ================================================================================= */
    function visTal(str) { return C.skillerum(str); }

    function opgaveTal(opg) {
        if (opg.type === "almindelig") return C.potensHTML(opg.tal);
        if (opg.type === "regn") return opg.a + " " + opg.op + " " + opg.b;
        return visTal(opg.vis);
    }
    C.opgaveHTML = opgaveTal;

    function nulSaetning(str) {
        var t = C.nulTyper(str);
        if (t.foran) return "Nullerne foran det første ciffer, der ikke er nul, tæller ikke.";
        if (t.sidstDec) return "Nullet til sidst efter kommaet tæller med.";
        if (t.sidstHel) return "Nullerne til sidst tæller også med.";
        if (t.midte) return "Nullet mellem de andre cifre tæller med.";
        return "Alle cifrene tæller.";
    }

    function venstreHoejre(k) { return k > 0 ? "højre" : "venstre"; }

    C.hint = function (opg) {
        if (opg.type === "tael") {
            return "Alle cifre tæller, undtagen nullerne foran det første ciffer, der ikke er nul. Også nuller til sidst tæller.";
        }
        if (opg.type === "afrund") {
            return "Tæl " + opg.n + " cifre fra det første, der ikke er nul. Se så på det næste ciffer: er det 5 eller mere, rundes der op." +
                (C.kanAlmindelig(opg.facit) ? "" : " Et almindeligt tal får her for mange cifre, så brug feltet ved 10-tallet.");
        }
        if (opg.type === "regn") {
            return "Det tal i regnestykket, der har færrest betydende cifre, bestemmer. Regn ud, og afrund til " +
                cifre(opg.n) + ".";
        }
        if (opg.type === "potens") {
            return "Flyt kommaet, til der står ét ciffer foran det. Antallet af pladser er eksponenten." +
                (opg.tal.p < 0 ? " Et tal under 1 får negativ eksponent." : "") +
                " Tallet foran 10-tallet skal have " + cifre(opg.n) + ".";
        }
        if (opg.type === "almindelig") {
            return "10<sup>" + eksTekst(opg.eksp) + "</sup> betyder, at kommaet flyttes " + pladser(Math.abs(opg.eksp)) +
                " til " + venstreHoejre(opg.eksp) + ". Mangler der cifre, fyldes der nuller på.";
        }
        return C.enhedRelation(opg) + ". Kommaet flyttes lige så mange pladser, som der er nuller. Tænk over, om tallet skal blive større eller mindre.";
    };

    C.svar = function (opg) {
        if (opg.type === "tael") {
            return visTal(opg.vis) + " har " + cifre(opg.facit) + ". " + nulSaetning(opg.vis);
        }
        if (opg.type === "afrund") {
            var d = C.naesteCiffer(opg.tal, opg.n);
            return visTal(opg.vis) + " med " + cifre(opg.n) + " er <b>" + C.html(opg.facit) + "</b>. Det næste ciffer er " + d +
                ", så der rundes " + (d >= 5 ? "op" : "ned") + "." +
                (C.kanAlmindelig(opg.facit) ? "" : " Et almindeligt tal ville få for mange cifre.");
        }
        if (opg.type === "regn") {
            return "Lommeregneren giver " + C.html(opg.praecis) + ". Med " + cifre(opg.n) + ", lige som " + opg.mindst +
                ": <b>" + C.html(opg.facit) + "</b>.";
        }
        if (opg.type === "potens") {
            var fl = opg.facit.p;
            return visTal(opg.vis) + " = <b>" + C.potensHTML(opg.facit) + "</b>. Kommaet flyttes " + pladser(Math.abs(fl)) +
                " til " + (fl >= 0 ? "venstre" : "højre") + ".";
        }
        if (opg.type === "almindelig") {
            return C.potensHTML(opg.tal) + " = <b>" + visTal(C.almindelig(opg.facit)) + "</b>. Kommaet flyttes " +
                pladser(Math.abs(opg.eksp)) + " til " + venstreHoejre(opg.eksp) + ".";
        }
        return visTal(opg.vis) + " " + opg.fra + " = <b>" + visTal(C.almindelig(opg.facit)) + " " + opg.til + "</b>. " +
            C.enhedRelation(opg) + ", så kommaet flyttes " + pladser(Math.abs(opg.k)) + " til " + venstreHoejre(opg.k) + ".";
    };

    C.forklaring = function (opg) {
        if (opg.type === "tael") return cifre(opg.facit) + ". " + nulSaetning(opg.vis);
        if (opg.type === "afrund") {
            var d = C.naesteCiffer(opg.tal, opg.n);
            return "Det næste ciffer er " + d + ", så der rundes " + (d >= 5 ? "op" : "ned") + "." +
                (C.kanAlmindelig(opg.facit) ? "" : " Et almindeligt tal ville få for mange cifre.");
        }
        if (opg.type === "regn") return "Den mindst præcise faktor, " + opg.mindst + ", har " + cifre(opg.n) + ".";
        if (opg.type === "potens") return "Kommaet er flyttet " + pladser(Math.abs(opg.facit.p)) + ".";
        if (opg.type === "almindelig") return "Kommaet er flyttet " + pladser(Math.abs(opg.eksp)) + " til " + venstreHoejre(opg.eksp) + ".";
        return C.enhedRelation(opg) + ", så kommaet flyttes " + pladser(Math.abs(opg.k)) + ".";
    };

    /* Facit som tekst til listen over runden */
    C.facitHTML = function (opg) {
        if (opg.type === "tael") return cifre(opg.facit);
        if (opg.type === "potens") return C.potensHTML(opg.facit);
        if (opg.type === "almindelig" || opg.type === "enhed") return visTal(C.almindelig(opg.facit)) + (opg.til ? " " + opg.til : "");
        return C.html(opg.facit);
    };

    NK.Cifre = C;
}());
