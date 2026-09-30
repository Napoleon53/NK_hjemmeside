/* =====================================================================
   tal.js - modellen: tal som cifre, tierpotenser, forstavelser og enheder

   Alt regnes paa cifferstrenge, ikke med kommatal i maskinen. Saa bliver
   0,1 + 0,2 aldrig 0,30000000000000004, og 2,5 km bliver praecis 2500 m.
   Samme tanke som i kemiens sc4.10, men her er det fysikkens stige fra
   10⁻⁹ til 10⁹ og omregning mellem enheder, ogsaa m², m³ og liter.

   Et tal er { s, p, neg }:
     s    cifrene fra det foerste, der ikke er nul
     p    tierpotensen for det foerste ciffer
     neg  negativt
   2500 er { s: "25", p: 3 }, 0,0250 er { s: "250", p: -2 }.
   Tallet 0 har s = "".

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

    var TYNDT = " ";   /* smalt mellemrum mellem tusinderne */

    /* ----- Laesning ---------------------------------------------------
       Et almindeligt tal med komma, fx "0,0250". Punktum laeses ogsaa som
       komma, medmindre der er flere punktummer eller baade punktum og
       komma: saa er punktummerne tusindtalsskilletegn. */
    C.fraTekst = function (str) {
        var t = NK.ascii(String(str)).replace(/[\s  ]/g, "");
        if (t.indexOf(",") >= 0 || (t.split(".").length > 2)) t = t.replace(/\./g, "");
        else t = t.replace(".", ",");
        var m = /^([+-]?)(\d*)(?:,(\d*))?$/.exec(t);
        if (!m || (m[2] + (m[3] || "")) === "") return null;
        var hel = m[2], alle = hel + (m[3] || "");
        var f = alle.search(/[1-9]/);
        if (f < 0) return tal("", 0, false);
        return tal(alle.slice(f), hel.length - f - 1, m[1] === "-");
    };

    /* Det, eleven skriver: tallet og eventuelt eksponenten i det lille
       felt ved 10-tallet. Skrives potensen i selve feltet (3,2e4,
       3,2*10^4, 3,2·10^4), forstaas den ogsaa. */
    C.laesSvar = function (mantisse, eksp) {
        var m = String(mantisse || "").replace(/[\s  ]/g, "").replace(/[−–]/g, "-");
        var e = String(eksp || "").replace(/[\s  ]/g, "").replace(/[−–]/g, "-");
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

    /* ----- Sammenligning ---------------------------------------------- */
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

    /* ----- Skrivemaader ------------------------------------------------ */
    C.almindelig = function (t) {
        if (!t.s) return "0";
        var s = t.s, p = t.p, ud;
        if (p < 0) ud = "0," + nuller(-p - 1) + s;
        else if (p >= s.length - 1) ud = s + nuller(p - (s.length - 1));
        else ud = s.slice(0, p + 1) + "," + s.slice(p + 1);
        return (t.neg ? "−" : "") + ud;
    };

    /* Tusindtalsgrupper med et smalt mellemrum, baade foran og efter
       kommaet, naar der er fem cifre eller flere: 1 000 000 og 0,000 002 */
    C.skillerum = function (str) {
        var m = /^(−?)(\d+)(?:,(\d*))?$/.exec(String(str).replace(/[\s  ]/g, ""));
        if (!m) return String(str);
        var hel = m[2], dec = m[3];
        if (hel.length >= 5) hel = hel.replace(/\B(?=(\d{3})+(?!\d))/g, TYNDT);
        if (dec && dec.length >= 5) dec = dec.replace(/(\d{3})(?=\d)/g, "$1" + TYNDT);
        return m[1] + hel + (dec === undefined ? "" : "," + dec);
    };

    C.mantisse = function (t) {
        if (!t.s) return "0";
        return (t.neg ? "−" : "") + t.s.charAt(0) + (t.s.length > 1 ? "," + t.s.slice(1) : "");
    };

    /* Eksponenten med rigtigt minus (−3) */
    function eksTekst(p) { return p < 0 ? "−" + (-p) : String(p); }
    C.eksTekst = eksTekst;

    /* 10⁴ uden noget foran, naar mantissen er 1 */
    function reneTi(p) { return "10" + NK.haevet(eksTekst(p)); }
    C.reneTi = reneTi;

    function reneTiHTML(p) { return "10<sup>" + eksTekst(p) + "</sup>"; }
    C.reneTiHTML = reneTiHTML;

    C.potensTekst = function (t) {
        if (kerne(t) === "1") return (t.neg ? "−" : "") + reneTi(t.p);
        return C.mantisse(t) + " · " + reneTi(t.p);
    };

    C.potensHTML = function (t) {
        if (kerne(t) === "1") return (t.neg ? "−" : "") + reneTiHTML(t.p);
        return C.mantisse(t) + " · " + reneTiHTML(t.p);
    };

    /* Vaerdien uden nuller til sidst, som en lommeregner viser den */
    C.lommeregner = function (t) {
        var k = kerne(t);
        return k ? tal(k, t.p, t.neg) : t;
    };

    /* Det, eleven skrev, sat paent op igen */
    C.svarHTML = function (sv) {
        if (!sv || !sv.tal) return "";
        var m = C.skillerum(C.almindelig(sv.mantisse));
        return sv.potens ? m + " · " + reneTiHTML(sv.eksp) : m;
    };

    function flertal(n, en, flere) { return n === 1 ? en : flere; }
    function pladser(n) { return n + " " + flertal(n, "plads", "pladser"); }
    C.pladser = pladser;
    function venstreHoejre(k) { return k > 0 ? "højre" : "venstre"; }

    /* ----- Brikkerne paa tavlen ---------------------------------------
       Et tal skrevet som tekst bliver til brikker: et ciffer pr. brik og
       kommaet for sig. Et mellemrum i teksten bliver til luft foran den
       naeste brik. */
    C.brikker = function (str) {
        var ud = [], i = 0, mellem = false, s = String(str);
        for (var j = 0; j < s.length; j++) {
            var c = s.charAt(j);
            if (c === " " || c === " " || c === TYNDT) { mellem = true; continue; }
            if (c === ",") { ud.push({ tegn: ",", komma: true }); continue; }
            if (c === "−" || c === "-") { ud.push({ tegn: "−", fortegn: true }); continue; }
            if (c < "0" || c > "9") { ud.push({ tegn: c, andet: true }); mellem = false; continue; }
            ud.push({ tegn: c, ciffer: true, i: i, mellemrum: mellem });
            i++;
            mellem = false;
        }
        return ud;
    };

    /* =================================================================
       FORSTAVELSERNE
       Fysikkens stige fra nano til giga. "" er grundenheden selv.
       ================================================================= */
    C.FORSTAVELSER = { "G": 9, "M": 6, "k": 3, "h": 2, "da": 1, "": 0, "d": -1, "c": -2, "m": -3, "µ": -6, "n": -9 };
    C.NAVNE = { "G": "giga", "M": "mega", "k": "kilo", "h": "hekto", "da": "deka", "d": "deci", "c": "centi", "m": "milli", "µ": "mikro", "n": "nano" };

    /* Stigen, som den tegnes i scenen: fra venstre mod hoejre */
    C.STIGE = ["n", "µ", "m", "c", "d", "", "da", "h", "k", "M", "G"];
    /* Dem, eleven kan vaelge imellem i fane 2 */
    C.VALGBARE = ["n", "µ", "m", "c", "d", "da", "h", "k", "M", "G"];
    /* Dem, opgaverne spoerger om. da og h staar paa stigen og i teorien,
       men bruges naesten aldrig i fysik, saa de er kun med som valg. */
    C.SPOERGES = ["n", "µ", "m", "c", "d", "k", "M", "G"];

    /* "k er kilo (1000)" og "µ er mikro (1/1 000 000)" */
    C.forstavelseTekst = function (f) {
        var p = C.FORSTAVELSER[f];
        var v = C.skillerum("1" + nuller(Math.abs(p)));
        return f + " er " + C.NAVNE[f] + " (" + (p < 0 ? "1/" : "") + v + ")";
    };

    C.forstavelsePotens = function (f) {
        return f + " (" + C.NAVNE[f] + ") er " + reneTiHTML(C.FORSTAVELSER[f]);
    };

    /* =================================================================
       ENHEDERNE
       En enhed er { sym, e, f, grund, dim }: symbolet, tierpotensen i
       forhold til familiens grundenhed, forstavelsen, grundenheden og
       dimensionen (1, 2 eller 3). For m² og m³ er e allerede ganget med
       dimensionen: 1 cm² = 10⁻⁴ m², 1 cm³ = 10⁻⁶ m³.
       ================================================================= */
    function enh(sym, e, f, grund, dim) {
        return { sym: sym, e: e, f: f, grund: grund, dim: dim || 1 };
    }

    /* Grundenheder til fane 1 og 2 */
    C.GRUNDENHEDER = [
        { sym: "m", navn: "meter", slags: "længde", metrisk: true },
        { sym: "s", navn: "sekund", slags: "tid" },
        { sym: "g", navn: "gram", slags: "masse" },
        { sym: "W", navn: "watt", slags: "effekt" },
        { sym: "J", navn: "joule", slags: "energi" },
        { sym: "N", navn: "newton", slags: "kraft" },
        { sym: "Hz", navn: "hertz", slags: "frekvens" },
        { sym: "V", navn: "volt", slags: "spænding" },
        { sym: "A", navn: "ampere", slags: "strøm" },
        { sym: "L", navn: "liter", slags: "rumfang", metrisk: true }
    ];

    C.grundNavn = function (sym) {
        for (var i = 0; i < C.GRUNDENHEDER.length; i++) {
            if (C.GRUNDENHEDER[i].sym === sym) return C.GRUNDENHEDER[i].navn;
        }
        return sym;
    };

    /* Niveauerne i fane 3. Hvert niveau er en liste af enheder, der maa
       blandes med hinanden. */
    var LAENGDE = [
        enh("km", 3, "k", "m"), enh("m", 0, "", "m"), enh("dm", -1, "d", "m"),
        enh("cm", -2, "c", "m"), enh("mm", -3, "m", "m"), enh("µm", -6, "µ", "m"), enh("nm", -9, "n", "m")
    ];
    var LITER = [
        enh("L", 0, "", "L"), enh("dL", -1, "d", "L"), enh("cL", -2, "c", "L"),
        enh("mL", -3, "m", "L"), enh("µL", -6, "µ", "L")
    ];
    var MASSE = [enh("kg", 3, "k", "g"), enh("g", 0, "", "g"), enh("mg", -3, "m", "g"), enh("µg", -6, "µ", "g")];
    var TID = [enh("s", 0, "", "s"), enh("ms", -3, "m", "s"), enh("µs", -6, "µ", "s"), enh("ns", -9, "n", "s")];
    var EFFEKT = [enh("GW", 9, "G", "W"), enh("MW", 6, "M", "W"), enh("kW", 3, "k", "W"), enh("W", 0, "", "W"), enh("mW", -3, "m", "W")];
    var ENERGI = [enh("MJ", 6, "M", "J"), enh("kJ", 3, "k", "J"), enh("J", 0, "", "J"), enh("mJ", -3, "m", "J")];
    var KRAFT = [enh("MN", 6, "M", "N"), enh("kN", 3, "k", "N"), enh("N", 0, "", "N"), enh("mN", -3, "m", "N")];
    var FREKVENS = [enh("GHz", 9, "G", "Hz"), enh("MHz", 6, "M", "Hz"), enh("kHz", 3, "k", "Hz"), enh("Hz", 0, "", "Hz")];
    var SPAENDING = [enh("kV", 3, "k", "V"), enh("V", 0, "", "V"), enh("mV", -3, "m", "V"), enh("µV", -6, "µ", "V")];
    var STROEM = [enh("A", 0, "", "A"), enh("mA", -3, "m", "A"), enh("µA", -6, "µ", "A"), enh("nA", -9, "n", "A")];

    var AREAL = [
        enh("km²", 6, "k", "m²", 2), enh("m²", 0, "", "m²", 2), enh("dm²", -2, "d", "m²", 2),
        enh("cm²", -4, "c", "m²", 2), enh("mm²", -6, "m", "m²", 2)
    ];
    /* Rumfang: baade m³-enhederne og litermaalene, alle regnet i m³, saa
       1 L = 1 dm³ og 1 mL = 1 cm³ falder ud af sig selv */
    var RUMFANG = [
        enh("m³", 0, "", "m³", 3), enh("dm³", -3, "d", "m³", 3), enh("cm³", -6, "c", "m³", 3), enh("mm³", -9, "m", "m³", 3),
        enh("L", -3, "", "L"), enh("mL", -6, "m", "L"), enh("µL", -9, "µ", "L")
    ];

    C.NIVEAUER = {
        laengde: { navn: "Længde og liter", note: "km, m, dm, cm og mm, og L, dL, cL og mL.", saet: [LAENGDE, LITER], vaegt: [6, 4] },
        andre: { navn: "Masse, tid og el", note: "kg, g, mg og µg, s, ms og µs, og W, J, N, Hz, V og A.", saet: [MASSE, TID, EFFEKT, ENERGI, KRAFT, FREKVENS, SPAENDING, STROEM], vaegt: [3, 3, 2, 2, 1, 2, 2, 2] },
        areal: { navn: "Arealer (m²)", note: "km², m², dm², cm² og mm². Forstavelsen står i anden potens.", saet: [AREAL], vaegt: [1] },
        rumfang: { navn: "Rumfang (m³)", note: "m³, dm³, cm³ og mm³ sammen med L, dL, cL og mL.", saet: [RUMFANG], vaegt: [1] }
    };
    C.NIVEAU_RAEKKE = ["laengde", "andre", "areal", "rumfang"];

    /* =================================================================
       OPGAVERNE
       udskriv        10⁴ m skrives som almindeligt tal
       potensform     32 000 m skrives som 10-talspotens
       vaelg          0,000 002 s = 2 ⬚s: hvilken forstavelse?
       enhedspotens   1 GW er hvor mange W, skrevet som 10-talspotens?
       omregn         2,5 km omregnes til m (ogsaa m², m³ og liter)
       ================================================================= */
    C.TYPENAVN = {
        udskriv: "Tierpotens til tal",
        potensform: "Tal til tierpotens",
        vaelg: "Vælg forstavelsen",
        enhedspotens: "Forstavelse til potens",
        omregn: "Omregning"
    };

    /* ----- Tierpotenser ------------------------------------------------
       Eksponenten gaar fra −9 til 9. Er den stor, er der kun ét ciffer
       foran 10-tallet, saa det almindelige tal kan staa paa tavlen. */
    function eksponent() {
        var e = heltal(1, 9);
        if (C.rnd() < 0.45) e = -e;
        return e;
    }

    function mantisseCifre(e) {
        var plads = 12 - Math.abs(e);
        var sf = Math.abs(e) >= 7 ? 1 : heltal(1, plads >= 4 ? 3 : 2);
        return sf;
    }

    function lavMantisse(sf) {
        var s = String(heltal(1, 9));
        for (var i = 1; i < sf; i++) s += heltal(0, 9);
        return s.replace(/0+$/, "") || s.charAt(0);
    }

    function lavUdskriv() {
        var e = eksponent(), sf = mantisseCifre(e);
        var m = lavMantisse(sf);
        var t = tal(m, e, false);
        var u = vaelg(C.GRUNDENHEDER);
        return {
            type: "udskriv", spm: "Skriv det som et almindeligt tal.",
            tal: t, facit: t, eksp: e, enhed: u.sym,
            vis: C.potensTekst(t)
        };
    }

    function lavPotensform() {
        var e = eksponent(), sf = mantisseCifre(e);
        /* Et tal mellem 0,001 og 1000 er let at laese som det staar, saa
           opgaven bliver foerst interessant laengere ude paa stigen */
        if (Math.abs(e) < 2) e = e < 0 ? -2 : 2;
        var m = lavMantisse(sf);
        var t = tal(m, e, false);
        var u = vaelg(C.GRUNDENHEDER);
        return {
            type: "potensform", spm: "Skriv det som en 10-talspotens.",
            tal: t, facit: t, eksp: e, enhed: u.sym,
            vis: C.almindelig(t)
        };
    }

    /* ----- Vaelg forstavelsen -------------------------------------------
       Tallet vises enten som almindeligt tal eller som tierpotens, og
       eleven vaelger den forstavelse, der goer det til et pent tal. */
    function lavVaelg() {
        var f = vaelg(C.SPOERGES), F = C.FORSTAVELSER[f];
        /* c og d bruges i praksis kun paa meter og liter */
        var smaa = ["c", "d"].indexOf(f) >= 0;
        var u = smaa ? vaelg([C.GRUNDENHEDER[0], C.GRUNDENHEDER[9]]) : vaelg(C.GRUNDENHEDER);
        var sf = Math.abs(F) >= 6 ? heltal(1, 2) : heltal(1, 3);
        var m = lavMantisse(sf);
        var koef = tal(m, m.length - 1, false);           /* tallet foran forstavelsen, 1 til 999 */
        var t = tal(m, m.length - 1 + F, false);          /* den samme stoerrelse i grundenheden */
        var somPotens = C.rnd() < 0.45;
        return {
            type: "vaelg", spm: "Hvilken forstavelse passer i det tomme felt?",
            tal: t, facit: f, eksp: F, enhed: u.sym, koef: koef,
            koefTekst: C.almindelig(koef),
            somPotens: somPotens,
            vis: C.almindelig(t),
            visHTML: somPotens ? C.potensHTML(t) : C.skillerum(C.almindelig(t))
        };
    }

    /* ----- Forstavelse til potens ---------------------------------------
       ned: 1 GW = 10⁹ W.   op: der gaar 10⁶ µs paa 1 s. */
    function lavEnhedspotens() {
        var f = vaelg(C.SPOERGES), F = C.FORSTAVELSER[f];
        var smaa = ["c", "d"].indexOf(f) >= 0;
        var u = smaa ? vaelg([C.GRUNDENHEDER[0], C.GRUNDENHEDER[9]]) : vaelg(C.GRUNDENHEDER);
        /* "Hvor mange mV går der på 1 V" giver kun mening, naar
           forstavelsen er mindre end grundenheden */
        var op = F < 0 && C.rnd() < 0.5;
        var e = op ? -F : F;
        return {
            type: "enhedspotens",
            spm: op ? "Hvor mange " + f + u.sym + " går der på 1 " + u.sym + "? Skriv det som en 10-talspotens."
                : "Hvor mange " + u.sym + " er 1 " + f + u.sym + "? Skriv det som en 10-talspotens.",
            f: f, F: F, op: op, grund: u.sym, enhed: op ? f + u.sym : u.sym,
            fra: op ? "1 " + u.sym : "1 " + f + u.sym,
            facit: tal("1", e, false), eksp: e,
            vis: op ? "1 " + u.sym : "1 " + f + u.sym
        };
    }

    /* ----- Omregning ---------------------------------------------------- */
    function vaegtetSaet(niv) {
        var i, sum = 0, n = niv.vaegt.length;
        for (i = 0; i < n; i++) sum += niv.vaegt[i];
        var r = C.rnd() * sum;
        for (i = 0; i < n; i++) {
            r -= niv.vaegt[i];
            if (r <= 0) return niv.saet[i];
        }
        return niv.saet[n - 1];
    }

    /* Et pent maaletal med 1 til 3 betydende cifre */
    function pentTal(store) {
        var sf = heltal(1, 3);
        var s = lavMantisse(sf);
        var p = store ? heltal(0, 2) : heltal(-3, 2);
        return C.almindelig(tal(s, p, false));
    }

    var MAKS_SPRING = 6;

    function lavOmregn(niveauId, runde) {
        var niv = C.NIVEAUER[niveauId] || C.NIVEAUER.laengde;
        /* k = 0 er 1 L = 1 dm³ og 1 mL = 1 cm³: en pointe, men kun nu og da */
        var nulOK = C.rnd() < 0.25;
        var fra, til, k, saet, ok, forsoeg = 0, base, t, facit;
        do {
            saet = vaegtetSaet(niv);
            fra = vaelg(saet);
            til = vaelg(saet);
            k = fra.e - til.e;
            ok = fra.sym !== til.sym && Math.abs(k) <= MAKS_SPRING && (k !== 0 || (nulOK && fra.grund !== til.grund));
            forsoeg++;
        } while (!ok && forsoeg < 400);
        if (!ok) { fra = saet[0]; til = saet[1]; k = fra.e - til.e; }

        forsoeg = 0;
        do {
            base = pentTal(k < 0);
            t = C.fraTekst(base);
            facit = C.lommeregner(tal(t.s, t.p + k, false));
            forsoeg++;
        } while ((base.replace(/[^\d]/g, "").length > 4 || C.almindelig(facit).length > 13) && forsoeg < 120);

        return {
            type: "omregn", spm: "Omregn til " + til.sym + ".",
            niveau: niveauId, fraE: fra, tilE: til, k: k,
            vis: base, tal: t, fra: fra.sym, til: til.sym, enhed: til.sym,
            facit: facit
        };
    }
    C.lavOmregn = lavOmregn;

    /* type: udskriv, potensform, potens (en af de to), vaelg,
       enhedspotens, forstavelse (en af vaelg/enhedspotens) eller omregn */
    C.lav = function (type, runde, valg) {
        runde = runde || {};
        valg = valg || {};
        if (type === "potens") type = C.rnd() < 0.5 ? "udskriv" : "potensform";
        if (type === "udskriv") return lavUdskriv();
        if (type === "potensform") return lavPotensform();
        if (type === "vaelg") return lavVaelg();
        if (type === "enhedspotens") return lavEnhedspotens();
        if (type === "omregn") return lavOmregn(valg.niveau || vaelg(C.NIVEAU_RAEKKE), runde);
        return null;
    };

    /* =================================================================
       TJEK
       Giver { tom, ok, besked }. besked er HTML til statuslinjen. Et
       forkert svar faar en besked, der passer til fejlen, uden at facit
       staar i den.
       ================================================================= */
    function rigtigt(opg) { return C.forklaring(opg); }

    function tjekVaelg(opg, valgt) {
        if (!valgt) return { tom: true, besked: "Vælg en forstavelse nedenfor." };
        if (valgt === opg.facit) return { ok: true, besked: rigtigt(opg) };
        var F = C.FORSTAVELSER[valgt];
        var d = F - opg.eksp;
        if (F === -opg.eksp && opg.eksp !== 0) {
            return { ok: false, besked: C.NAVNE[valgt] + " går den forkerte vej. " +
                (opg.eksp < 0 ? "Tallet er mindre end 1, så forstavelsen skal gøre enheden mindre." :
                    "Tallet er større end 1, så forstavelsen skal gøre enheden større.") };
        }
        return { ok: false, besked: C.forstavelseTekst(valgt) + ". Det er " + C.skillerum("1" + nuller(Math.abs(d))) +
            " gange for " + (d > 0 ? "meget" : "lidt") + "." };
    }

    /* ----- Svar, der skal staa som en 10-talspotens ---------------------- */
    function tjekPotensSvar(opg, sv) {
        var f = opg.facit, u = sv.tal;
        /* "10" i det store felt: feltet ganges med 10-tallet, saa der
           kommer et 10-tal for meget */
        if (sv.potens && kerne(sv.mantisse) === "1" && sv.mantisse.p === 1 && C.ens(tal("1", sv.eksp, false), f)) {
            return { ok: false, besked: "Det store felt ganges med 10-tallet, så der står 10 · " + reneTiHTML(sv.eksp) +
                ". Skriv 1 i det store felt, når svaret er 10 opløftet i en potens." };
        }
        if (!sv.potens) {
            if (C.ens(u, f)) return { ok: false, besked: "Værdien er rigtig, men den skal skrives som en 10-talspotens. Skriv eksponenten i det lille felt ved 10-tallet." };
            return { ok: false, besked: "Skriv svaret som en 10-talspotens: tallet i det store felt og eksponenten i det lille." };
        }
        if (C.ens(u, f)) {
            if (sv.mantisse.p !== 0) return { ok: false, besked: "Værdien passer, men der skal stå ét ciffer (1 til 9) foran kommaet." };
            return { ok: true, besked: rigtigt(opg) };
        }
        var godMantisse = sv.mantisse.p === 0;
        if (godMantisse && kerne(sv.mantisse) === kerne(f)) {
            if (sv.eksp === -f.p && f.p !== 0) {
                return { ok: false, besked: "Fortegnet på eksponenten er forkert. " +
                    (f.p < 0 ? "Tallet er mindre end 1, så eksponenten er negativ." : "Tallet er større end 10, så eksponenten er positiv.") };
            }
            return { ok: false, besked: "Cifrene er rigtige, men eksponenten er " + (sv.eksp > f.p ? "for stor" : "for lille") +
                ". Tæl, hvor mange pladser kommaet flytter sig." };
        }
        if (!godMantisse) return { ok: false, besked: "Der skal stå ét ciffer (1 til 9) foran kommaet. Flyt kommaet derhen, og tæl pladserne." };
        return { ok: false, besked: null };
    }

    /* ----- Svar, der skal staa som et almindeligt tal --------------------- */
    function tjekTalSvar(opg, sv) {
        var f = opg.facit, u = sv.tal;
        if (sv.potens && opg.type === "udskriv") {
            if (C.ens(u, f)) return { ok: false, besked: "Værdien er rigtig, men den skal skrives uden 10-tallet, som et almindeligt tal." };
            return { ok: false, besked: "Skriv tallet uden 10-tallet, som et almindeligt tal." };
        }
        if (C.ens(u, f)) return { ok: true, besked: rigtigt(opg) };
        var g = C.tiGange(u, f);
        if (g !== null) return { ok: false, besked: kommaBesked(opg, g) };
        return { ok: false, besked: null };
    }

    /* g: elevens tal er 10^g gange for stort (positivt) eller for lille */
    function kommaBesked(opg, g) {
        var rigtigVej = opg.type === "omregn" ? opg.k : (opg.type === "udskriv" ? opg.eksp : -opg.eksp);
        if (rigtigVej !== 0 && g === -2 * rigtigVej) {
            if (opg.type === "omregn") {
                var stoerre = opg.k > 0;
                return "Tallet skal blive " + (stoerre ? "større" : "mindre") + ", ikke " + (stoerre ? "mindre" : "større") +
                    ": 1 " + opg.fra + " er " + (stoerre ? "mere" : "mindre") + " end 1 " + opg.til + ".";
            }
            return "Kommaet er flyttet den forkerte vej. " +
                (opg.eksp < 0 ? "En negativ eksponent betyder et tal under 1." : "En positiv eksponent betyder et tal over 1.");
        }
        var n = Math.abs(g), forMeget = (g > 0) === (rigtigVej > 0);
        var hale = opg.type === "omregn" ? " " + C.enhedRelation(opg) + "." : "";
        return "Cifrene er rigtige, men kommaet er flyttet " + pladser(n) + " for " +
            (forMeget ? "meget" : "lidt") + "." + hale;
    }

    /* Fald tilbage, naar ingen af de kendte fejl passer */
    function sidsteUdvej(opg) {
        if (opg.type === "omregn") return "Ikke rigtigt. " + C.enhedRelation(opg) + ". Flyt kommaet, og lad cifrene være.";
        if (opg.type === "udskriv") return "Ikke rigtigt. Eksponenten siger, hvor mange pladser kommaet flyttes.";
        if (opg.type === "potensform") return "Ikke rigtigt. Flyt kommaet, til der står ét ciffer foran det. Antallet af pladser er eksponenten.";
        return "Ikke rigtigt. Tænk på, hvad forstavelsen betyder.";
    }

    /* svar: { valgt } ved forstavelser, ellers { mantisse, eksp } som tekst */
    C.tjek = function (opg, svar) {
        if (opg.type === "vaelg") return tjekVaelg(opg, svar && svar.valgt);
        var sv = C.laesSvar(svar && svar.mantisse, svar && svar.eksp);
        if (sv.tom) return { tom: true, besked: "Skriv dit svar i feltet, og tryk Tjek." };
        if (sv.fejl) return { tom: true, besked: sv.fejl };
        var kravPotens = opg.type === "potensform" || opg.type === "enhedspotens";
        var r = kravPotens ? tjekPotensSvar(opg, sv) : tjekTalSvar(opg, sv);
        if (!r.ok && !r.besked) r.besked = sidsteUdvej(opg);
        r.svar = sv;
        return r;
    };

    /* =================================================================
       RELATIONER OG FORKLARINGER
       ================================================================= */
    /* 1 km = 1000 m: den store enhed udtrykt i den lille */
    C.enhedRelation = function (opg) {
        if (opg.k === 0) return "1 " + opg.fra + " = 1 " + opg.til;
        var stor = opg.k > 0 ? opg.fra : opg.til, lille = opg.k > 0 ? opg.til : opg.fra;
        return "1 " + stor + " = " + C.skillerum("1" + nuller(Math.abs(opg.k))) + " " + lille;
    };

    /* Hvorfor cm² er 10⁻⁴ m² og ikke 10⁻²: forstavelsen staar i anden
       eller tredje potens. Tom tekst for de almindelige enheder. */
    C.dimForklaring = function (e) {
        if (e.dim < 2 || !e.f) return "";
        var F = C.FORSTAVELSER[e.f], grund = e.grund.charAt(0);
        return "1 " + e.f + grund + " = " + reneTiHTML(F) + " " + grund + ", så 1 " + e.sym +
            " = (" + reneTiHTML(F) + " " + grund + ")" + (e.dim === 2 ? "²" : "³") + " = " + reneTiHTML(e.e) + " " + e.grund;
    };

    /* Litermaalene i m³: 1 L = 1 dm³ */
    C.literBro = function (opg) {
        var a = opg.fraE, b = opg.tilE;
        var l = a.grund === "L" ? a : (b.grund === "L" ? b : null);
        var k = a.grund === "m³" ? a : (b.grund === "m³" ? b : null);
        if (!l || !k) return "";
        return "1 L = 1 dm³, altså " + reneTiHTML(-3) + " m³";
    };

    /* ----- Hintet som en trappe paa tre trin -----------------------------
       Ét trin pr. tryk: hvad opgaven handler om, hvad man skal vide, og
       hvad man skal goere. Det sidste trin siger ikke facit. */
    C.hintTrin = function (opg) {
        var t = opg.type;
        if (t === "udskriv") {
            return [
                "Eksponenten siger, hvor mange pladser kommaet skal flyttes.",
                reneTiHTML(opg.eksp) + " betyder " + pladser(Math.abs(opg.eksp)) + " til " + venstreHoejre(opg.eksp) +
                    ". " + (opg.eksp < 0 ? "Negativ eksponent: tallet bliver mindre." : "Positiv eksponent: tallet bliver større."),
                "Start ved " + C.mantisse(opg.tal) + ", flyt kommaet " + pladser(Math.abs(opg.eksp)) + " til " +
                    venstreHoejre(opg.eksp) + ", og fyld nuller på de tomme pladser."
            ];
        }
        if (t === "potensform") {
            return [
                "Der skal stå ét ciffer fra 1 til 9 foran kommaet.",
                "Flyt kommaet hen bag det første ciffer, der ikke er nul, og tæl pladserne undervejs.",
                "Antallet af pladser er eksponenten. " + (opg.eksp < 0 ?
                    "Tallet er under 1, så eksponenten bliver negativ." : "Tallet er over 10, så eksponenten bliver positiv.")
            ];
        }
        if (t === "vaelg") {
            return [
                "Forstavelsen skal gøre enheden så meget " + (opg.eksp > 0 ? "større" : "mindre") + ", at tallet bliver " + opg.koefTekst + ".",
                opg.visHTML + " " + opg.enhed + " er " + opg.koefTekst + " · " + reneTiHTML(opg.eksp) + " " + opg.enhed + ".",
                "Find den forstavelse på stigen, der svarer til " + reneTiHTML(opg.eksp) + "."
            ];
        }
        if (t === "enhedspotens") {
            return [
                "Forstavelsen " + opg.f + " har et navn. Hvad hedder den?",
                opg.f + " er " + C.NAVNE[opg.f] + ".",
                opg.op ? "1 " + opg.f + opg.grund + " er mindre end 1 " + opg.grund + ", så der går mange af dem på én. Eksponenten bliver positiv."
                    : C.NAVNE[opg.f] + " er en fast tierpotens. Skriv den som 10 opløftet i den potens."
            ];
        }
        /* omregn */
        var trin = [];
        var stoerre = opg.k > 0;
        trin.push(opg.k === 0 ? "De to enheder er lige store. Det er ikke en fejl."
            : "1 " + opg.fra + " er " + (stoerre ? "større" : "mindre") + " end 1 " + opg.til +
                ", så tallet skal blive " + (stoerre ? "større" : "mindre") + ".");
        var dim = C.dimForklaring(opg.fraE) || C.dimForklaring(opg.tilE);
        var bro = C.literBro(opg);
        if (dim) trin.push(dim + ".");
        else if (bro) trin.push(bro + ".");
        trin.push(C.enhedRelation(opg) + ".");
        if (trin.length < 3) {
            trin.push(opg.k === 0 ? "Tallet er det samme. Skriv det, der står, med den nye enhed."
                : "Flyt kommaet " + pladser(Math.abs(opg.k)) + " til " + venstreHoejre(opg.k) + ", og lad cifrene være.");
        }
        return trin.slice(0, 3);
    };

    /* ----- Svaret ------------------------------------------------------- */
    C.svar = function (opg) {
        var t = opg.type;
        if (t === "udskriv") {
            return C.potensHTML(opg.tal) + " " + opg.enhed + " = <b>" + C.skillerum(C.almindelig(opg.facit)) + " " + opg.enhed +
                "</b>. Kommaet flyttes " + pladser(Math.abs(opg.eksp)) + " til " + venstreHoejre(opg.eksp) + ".";
        }
        if (t === "potensform") {
            return C.skillerum(opg.vis) + " " + opg.enhed + " = <b>" + C.potensHTML(opg.facit) + " " + opg.enhed +
                "</b>. Kommaet flyttes " + pladser(Math.abs(opg.eksp)) + " til " + (opg.eksp > 0 ? "venstre" : "højre") + ".";
        }
        if (t === "vaelg") {
            return opg.visHTML + " " + opg.enhed + " = " + opg.koefTekst + " · " + reneTiHTML(opg.eksp) + " " + opg.enhed +
                " = <b>" + opg.koefTekst + " " + opg.facit + opg.enhed + "</b>. " + C.forstavelseTekst(opg.facit) + ".";
        }
        if (t === "enhedspotens") {
            return opg.vis + " = <b>" + C.potensHTML(opg.facit) + " " + opg.enhed + "</b> = " +
                C.skillerum(C.almindelig(opg.facit)) + " " + opg.enhed + ". " + C.forstavelseTekst(opg.f) + ".";
        }
        var dim = C.dimForklaring(opg.fraE) || C.dimForklaring(opg.tilE);
        var hale = dim ? " " + dim + "." : (C.literBro(opg) ? " " + C.literBro(opg) + "." : "");
        return C.skillerum(opg.vis) + " " + opg.fra + " = <b>" + C.skillerum(C.almindelig(opg.facit)) + " " + opg.til + "</b>. " +
            C.enhedRelation(opg) + (opg.k === 0 ? ", så tallet er det samme." :
                ", så kommaet flyttes " + pladser(Math.abs(opg.k)) + " til " + venstreHoejre(opg.k) + ".") + hale;
    };

    /* ----- Én saetning ved et rigtigt svar -------------------------------- */
    C.forklaring = function (opg) {
        var t = opg.type;
        if (t === "udskriv" || t === "potensform") {
            return "Kommaet er flyttet " + pladser(Math.abs(opg.eksp)) + ".";
        }
        if (t === "vaelg") return C.forstavelseTekst(opg.facit) + ".";
        if (t === "enhedspotens") return opg.f + " er " + C.NAVNE[opg.f] + ", altså " + reneTiHTML(opg.F) + ".";
        if (opg.k === 0) return C.enhedRelation(opg) + ". De to enheder er lige store.";
        var dim = C.dimForklaring(opg.fraE) || C.dimForklaring(opg.tilE);
        return C.enhedRelation(opg) + ", så kommaet flyttes " + pladser(Math.abs(opg.k)) + "." + (dim ? " " + dim + "." : "");
    };

    /* ----- Opgaven og facit, som de staar i listen over runden ------------- */
    C.opgaveHTML = function (opg) {
        if (opg.type === "udskriv") return C.potensHTML(opg.tal) + " " + opg.enhed;
        if (opg.type === "enhedspotens") return opg.vis;
        if (opg.type === "vaelg") return opg.visHTML + " " + opg.enhed;
        if (opg.type === "omregn") return C.skillerum(opg.vis) + " " + opg.fra;
        return C.skillerum(opg.vis) + " " + opg.enhed;
    };

    C.kortOpgave = function (opg) {
        if (opg.type === "omregn") return C.skillerum(opg.vis) + " " + opg.fra + " <em>i " + opg.til + "</em>";
        if (opg.type === "vaelg") return opg.visHTML + " " + opg.enhed + " <em>med forstavelse</em>";
        if (opg.type === "enhedspotens") return opg.vis + " <em>i " + opg.enhed + "</em>";
        return C.opgaveHTML(opg);
    };

    C.facitHTML = function (opg) {
        if (opg.type === "vaelg") return C.skillerum(opg.koefTekst) + " " + opg.facit + opg.enhed;
        if (opg.type === "potensform" || opg.type === "enhedspotens") return C.potensHTML(opg.facit) + " " + opg.enhed;
        return C.skillerum(C.almindelig(opg.facit)) + " " + opg.enhed;
    };

    /* ----- Stigen ---------------------------------------------------------
       js/stige.js tegner mærker paa aksen fra 10⁻⁹ til 10⁹. Ét trin paa
       aksen er én plads for kommaet, ogsaa for m² og m³: en enhed ligger
       ved sin egen tierpotens, saa cm² staar fire trin fra m², ikke to.
       Buen bærer relationen (1 km = 1000 m) og vises foerst, naar eleven
       har faaet hjaelp eller svaret. */
    function relationTekst(a, b, sym_a, sym_b) {
        var k = a - b;
        if (k === 0) return "1 " + sym_a + " = 1 " + sym_b;
        var stor = k > 0 ? sym_a : sym_b, lille = k > 0 ? sym_b : sym_a;
        var n = Math.abs(k);
        var vaerdi = n <= 4 ? C.skillerum("1" + nuller(n)) : reneTi(n);
        return "1 " + stor + " = " + vaerdi + " " + lille;
    }

    C.stigePunkter = function (opg) {
        var t = opg.type;
        if (t === "udskriv" || t === "potensform") {
            /* Kun ét mærke: hvor tierpotensen ligger blandt forstavelserne */
            return { fra: opg.eksp, til: opg.eksp, fraTekst: reneTi(opg.eksp), tilTekst: reneTi(opg.eksp), bue: false };
        }
        if (t === "vaelg") {
            return { fra: 0, til: opg.eksp, fraTekst: opg.enhed, tilTekst: opg.facit + opg.enhed,
                relation: relationTekst(opg.eksp, 0, opg.facit + opg.enhed, opg.enhed), skjulMaal: true, bue: true };
        }
        if (t === "enhedspotens") {
            return { fra: 0, til: opg.F, fraTekst: opg.grund, tilTekst: opg.f + opg.grund,
                relation: relationTekst(opg.F, 0, opg.f + opg.grund, opg.grund), skjulMaal: true, bue: true };
        }
        if (t === "omregn") {
            /* Ingen forstavelse lyser her: en enhed staar ved sin egen
               tierpotens, og cm² ligger ved 10⁻⁴, ikke ved c. */
            return { fra: opg.fraE.e, til: opg.tilE.e, fraTekst: opg.fra, tilTekst: opg.til,
                relation: C.enhedRelation(opg), bue: true, ingenLys: true };
        }
        return null;
    };

    NK.Tal = C;
}());
