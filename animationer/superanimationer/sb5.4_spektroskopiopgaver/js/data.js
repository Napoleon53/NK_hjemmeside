/* =====================================================================
   data.js - opgaverne, teksterne og tallene

   Alt, der kan staa som data, staar her. Ordene er Kemibogens (afsnit
   B5.2 og B5.3): ekstinktionskoefficienten ε, lysvejen l, standardkurven
   fra regnearket A = a · c + b, hældningen a = ε · l, c = (A − b) / a,
   fortyndingsformlen c_før · V_før = c_efter · V_efter, det lineære
   område og indholdet som n = c · V og m = n · M.

   Seks opgaver i tre faner (som den gamle b9.5 havde seks faner):
     fane 1 Standardkurven:      permanganat og jern i en tablet (ε og c)
     fane 2 Indholdet:           paracetamol (masse pr. liter), glutamat i
                                 bouillon (fortynding) og kobber i en
                                 messingskrue (masse)
     fane 3 Det lineære område:  prilocain i en blodproeve

   Tabellerne er den gamle b9.5's, undtagen to (se README): kobberkomplekset
   havde ε ≈ 1,24 · 10³ M⁻¹ · cm⁻¹, hvor tabellerne siger ca. 50, og
   bouillonen maales nu som NADH ved 340 nm (ε = 6,22 · 10³) som bogens
   "Stoffer uden farve". Hældning og skæring regnes af tabellen med mindste
   kvadraters metode, praecis som regnearkets lineære tendenslinje.

   Formler skrives som "MnO_4^-": _ saenker, ^ haever, {} samler. D.u
   giver unicode til kortet, og D.sub laver HTML med <sub> og <sup>.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Farverne (som bogens figurer i B5.3) --------------------------- */
    D.FARVE = {
        blaek: "#1d2433",
        daempet: "#556766",
        linje: "#0f766e",        /* standardkurven */
        proeve: "#b45309",       /* proevens punkt og de stiplede linjer */
        forkert: "#c0392b",      /* elevens forkerte linje eller punkt */
        gul: "#d69e0c",
        groen: "#2f9a5f"
    };

    D.L = 1.00;                  /* lysvejen i cm i alle opgaver */
    D.TOL_EPS = 0.03;            /* saa taet skal ε vaere paa regnearkets */
    D.TOL = 0.025;               /* og de andre tal (godtager c = A / a uden b) */

    /* ----- Enhederne i vaelgeren -------------------------------------------
       f regner tallet om til grundenheden: M⁻¹ · cm⁻¹ for ε, M for c,
       mg for masser. cm: har enheden cm⁻¹ med (ε skal have det). */
    D.ENHED = {
        eps: [
            { k: "Mcm", t: "M⁻¹ · cm⁻¹", f: 1, cm: true },
            { k: "mMcm", t: "mM⁻¹ · cm⁻¹", f: 1e3, cm: true },
            { k: "uMcm", t: "µM⁻¹ · cm⁻¹", f: 1e6, cm: true },
            { k: "M", t: "M⁻¹", f: 1, cm: false },
            { k: "mM", t: "mM⁻¹", f: 1e3, cm: false },
            { k: "uM", t: "µM⁻¹", f: 1e6, cm: false }
        ],
        konc: [
            { k: "M", t: "M", f: 1 },
            { k: "mM", t: "mM", f: 1e-3 },
            { k: "uM", t: "µM", f: 1e-6 }
        ],
        masse: [
            { k: "mg", t: "mg", f: 1 },
            { k: "g", t: "g", f: 1000 }
        ]
    };
    D.TABEL_ENHED = { mM: { f: 1e-3, t: "mM", eps: "mMcm" }, uM: { f: 1e-6, t: "µM", eps: "uMcm" } };

    /* ----- Opgaverne ---------------------------------------------------------
       c og A: standardraekken. lineaer: hvor mange punkter regnearkets linje
       bygger paa (prilocain: de fem i det lineære område). figur: det, der
       staar til venstre paa tavlen. trin: delopgaverne i raekkefoelge. */
    D.OPG = {
        mno4: {
            id: "mno4", navn: "Permanganat", stof: "MnO_4^-", stofNavn: "permanganat", epsStof: "permanganat",
            lambda: 528, enhed: "mM",
            c: [0.075, 0.150, 0.225, 0.300, 0.375], A: [0.187, 0.363, 0.556, 0.729, 0.924],
            cTekst: ["0,075", "0,150", "0,225", "0,300", "0,375"],
            proeveA: 0.442,
            note: "Standardopløsninger af permanganat, målt ved 528 nm i kuvetter med lysvejen 1,00 cm.",
            figur: { genstand: "flaske", gNavn: "Prøven", farve: "#b273c9", kolbe: null },
            trin: ["eps", "konc"]
        },
        jern: {
            id: "jern", navn: "Jern i en tablet", stof: "Fe^2+", stofNavn: "Fe²⁺", epsStof: "[Fe(phen)₃]²⁺",
            lambda: 510, enhed: "uM",
            c: [10.0, 20.0, 30.0, 40.0, 50.0], A: [0.112, 0.219, 0.336, 0.441, 0.558],
            cTekst: ["10,0", "20,0", "30,0", "40,0", "50,0"],
            proeveA: 0.306,
            note: "Jern(II) gjort orangerødt med phenanthrolin, målt ved 510 nm med lysvejen 1,00 cm.",
            figur: { genstand: "tablet", gNavn: "Tabletten", farve: "#ee9a6c", kolbe: { tekst: "opløst", farve: "#ee9a6c" } },
            trin: ["eps", "konc"]
        },
        para: {
            id: "para", navn: "Paracetamol i en pille", stof: "paracetamol", stofNavn: "paracetamol", epsStof: "paracetamol",
            lambda: 243, enhed: "mM",
            c: [0.020, 0.040, 0.060, 0.080, 0.100], A: [0.199, 0.392, 0.593, 0.784, 0.989],
            cTekst: ["0,020", "0,040", "0,060", "0,080", "0,100"],
            proeveA: 0.739,
            M: 151.16,
            note: "Standardopløsninger af paracetamol, målt med UV-lys ved 243 nm med lysvejen 1,00 cm.",
            figur: { genstand: "pille", gNavn: "Pillen", farve: null, uv: true, kolbe: { tekst: "opløst", farve: null } },
            trin: ["eps", "konc", "literMasse"]
        },
        bouillon: {
            id: "bouillon", navn: "Glutamat i bouillon", stof: "glutamat", stofNavn: "glutamat", epsStof: "NADH",
            lambda: 340, enhed: "mM",
            c: [0.030, 0.060, 0.090, 0.120, 0.150], A: [0.189, 0.379, 0.562, 0.752, 0.935],
            cTekst: ["0,030", "0,060", "0,090", "0,120", "0,150"],
            proeveA: 0.626,
            vFoer: 2.00, vEfter: 200.0, vFoerTekst: "2,00 mL", vEfterTekst: "200,0 mL",
            note: "Glutamat omdannet af et enzym til NADH, målt med UV-lys ved 340 nm med lysvejen 1,00 cm.",
            figur: { genstand: "terning", gNavn: "Bouillon", farve: null, uv: true, kolbe: { V: "200,0 mL", pil: "2,00 mL", farve: null } },
            trin: ["eps", "konc", "fortynd"]
        },
        messing: {
            id: "messing", navn: "Kobber i en skrue", stof: "Cu^2+", stofNavn: "Cu²⁺", epsStof: "[Cu(NH₃)₄]²⁺",
            lambda: 600, enhed: "mM",
            c: [3.0, 6.0, 9.0, 12.0, 15.0], A: [0.155, 0.311, 0.460, 0.617, 0.766],
            cTekst: ["3,0", "6,0", "9,0", "12,0", "15,0"],
            proeveA: 0.599,
            M: 63.55, V: 0.2500, VTekst: "250,0 mL",
            note: "Kobber(II) gjort dybblåt med ammoniak, målt ved 600 nm med lysvejen 1,00 cm.",
            figur: { genstand: "skrue", gNavn: "Skruen", farve: "#4f86d4", kolbe: { V: "250,0 mL", farve: "#4f86d4", tekst: "opløst" } },
            trin: ["eps", "konc", "masse"]
        },
        pril: {
            id: "pril", navn: "Prilocain i en blodprøve", stof: "prilocain", stofNavn: "prilocain", epsStof: "prilocain",
            lambda: 235, enhed: "uM",
            c: [25.0, 50.0, 100, 175, 250, 325, 400, 475], A: [0.104, 0.213, 0.417, 0.741, 1.056, 1.267, 1.459, 1.588],
            cTekst: ["25,0", "50,0", "100", "175", "250", "325", "400", "475"],
            lineaer: 5,
            proeveA: 0.633,
            hoejA: 1.52,
            note: "Prilocain trukket ud af en blodprøve, målt med UV-lys ved 235 nm med lysvejen 1,00 cm.",
            figur: { genstand: "blodproeve", gNavn: "Blodprøven", farve: null, uv: true, kolbe: { tekst: "trukket ud", farve: null } },
            trin: ["omraade", "eps", "konc", "hoej"]
        }
    };

    D.FANER = {
        k: { titel: "Standardkurven", opgaver: ["mno4", "jern"] },
        i: { titel: "Indholdet", opgaver: ["para", "bouillon", "messing"] },
        l: { titel: "Det lineære område", opgaver: ["pril"] }
    };
    D.FANE_RAEKKE = ["k", "i", "l"];

    /* ----- Regnearkets linje og kaeden af tal --------------------------------- */
    D.regression = function (xs, ys) {
        var n = xs.length, sx = 0, sy = 0, sxx = 0, sxy = 0, i;
        for (i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; sxy += xs[i] * ys[i]; }
        var a = (n * sxy - sx * sy) / (n * sxx - sx * sx), b = (sy - a * sx) / n;
        var my = sy / n, sst = 0, sse = 0;
        for (i = 0; i < n; i++) { sst += (ys[i] - my) * (ys[i] - my); sse += (ys[i] - a * xs[i] - b) * (ys[i] - a * xs[i] - b); }
        return { a: a, b: b, r2: 1 - sse / sst };
    };

    /* Alle tallene i en opgave. c og cM er proevens koncentration i
       tabellens enhed og i M; c0 er det samme uden b (c = A / a). */
    D.kaede = function (o) {
        var n = o.lineaer || o.c.length;
        var r = D.regression(o.c.slice(0, n), o.A.slice(0, n));
        var te = D.TABEL_ENHED[o.enhed];
        r.f = te.f;
        r.eps = r.a / D.L;                    /* i tabellens enhed (mM⁻¹ · cm⁻¹) */
        r.epsM = r.eps / te.f;                /* i M⁻¹ · cm⁻¹ */
        r.c = (o.proeveA - r.b) / r.a;
        r.c0 = o.proeveA / r.a;
        r.cM = r.c * te.f;
        if (o.vEfter) r.cFoer = r.c * o.vEfter / o.vFoer;           /* i tabellens enhed */
        if (o.M && !o.V) { r.n = r.cM * 1.00; r.mg = r.n * o.M * 1000; }   /* i 1,00 L */
        if (o.M && o.V) { r.n = r.cM * o.V; r.mg = r.n * o.M * 1000; }
        if (o.hoejA) {
            var hoejst = o.A[n - 1];
            r.hoejst = hoejst;
        }
        return r;
    };

    /* ----- Tal som tekst --------------------------------------------------------- */
    D.eksp = function (v) { return Math.floor(Math.log(Math.abs(v)) / Math.LN10 + 1e-9); };

    D.mantisse = function (v, cifre) {
        var e = D.eksp(v), f = Math.pow(10, cifre - 1);
        var m = Math.round(Math.abs(v) / Math.pow(10, e) * f * (1 + 1e-12)) / f;
        if (m >= 10) { m /= 10; e++; }
        var t = m.toFixed(cifre - 1);
        return { m: m, e: e, t: (v < 0 ? "−" : "") + t.replace(".", ",") };
    };

    /* En potens med unicode: 2,45 · 10³. Tal fra 1 til 999 skrives uden potens */
    D.potensU = function (v, cifre) {
        var m = D.mantisse(v, cifre || 3);
        if (m.e >= 0 && m.e <= 2) return NK.betydende(v, cifre || 3);
        return m.t + " · 10" + NK.haevet(m.e);
    };
    /* Samme til laerredet: 2,45 · 10^{3} */
    D.potensC = function (v, cifre) {
        var m = D.mantisse(v, cifre || 3);
        if (m.e >= 0 && m.e <= 2) return NK.betydende(v, cifre || 3);
        return m.t + " · 10^{" + m.e + "}";
    };
    /* ε i M⁻¹ · cm⁻¹ altid som potens, naar den er over 1000 (som bogens tabel) */
    D.epsU = function (v) { return v >= 1000 ? D.potensU(v, 3) : NK.betydende(v, 3); };
    D.epsC = function (v) { return v >= 1000 ? D.potensC(v, 3) : NK.betydende(v, 3); };

    D.tal3 = function (v) { return NK.betydende(v, 3); };
    /* Absorbansen med tre decimaler: 0,442 */
    D.abs = function (v) { return v.toFixed(3).replace(".", ","); };
    /* Skaeringen b med fire decimaler og fortegn: −0,0002 og 0,0039 */
    D.bTekst = function (b) { return (b < 0 ? "−" : "") + Math.abs(b).toFixed(4).replace(".", ","); };
    /* Hældningen med tre betydende cifre: 2,45 og 0,0111 */
    D.aTekst = function (a) { return NK.betydende(a, 3); };

    /* "MnO_4^-" -> "MnO₄⁻" */
    D.u = function (s) {
        return String(s).replace(/_\{([^}]*)\}|_([0-9a-z]+)/g, function (m, a, b) { return NK.saenket(a || b); })
            .replace(/\^\{([^}]*)\}|\^([0-9+\-]+)/g, function (m, a, b) { return NK.haevet(a || b); })
            .replace(/-/g, "−");
    };

    var SAENKET = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };
    var HAEVET = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "−" };
    D.sub = function (html) {
        return String(html)
            .replace(/\^\{([^}]*)\}/g, "<sup>$1</sup>")
            .replace(/[₀-₉]+/g, function (m) { return "<sub>" + m.split("").map(function (c) { return SAENKET[c]; }).join("") + "</sub>"; })
            .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, function (m) { return "<sup>" + m.split("").map(function (c) { return HAEVET[c]; }).join("") + "</sup>"; })
            /* Et tal og dets enhed deles ikke over to linjer: 0,180 mM */
            .replace(/(\d) · 10/g, "$1&nbsp;·&nbsp;10")
            .replace(/(\d|<\/sup>) (mM|µM|M|mg|g|mL|nm|cm)(?![A-Za-zÆØÅæøå])/g, "$1&nbsp;$2");
    };

    /* ----- Elevens tal -------------------------------------------------------------
       Godtager komma og punktum, − og -, mellemrum og potenser skrevet med et
       gangetegn: 2,45·10^3, 2,45 · 10³, 2,45*10^3, 2,45e3. "11100" er 11100
       (ikke 11 · 10⁰): en potens kraever gangetegnet eller e. */
    D.tolk = function (tekst) {
        var t = NK.ascii(tekst || "").replace(/\s+/g, "").replace(/,/g, ".").replace(/[·×xX*]/g, "*");
        if (!t) return NaN;
        var m = /^([-+]?\d*\.?\d+)\*10\^?\(?([-+]?\d+)\)?$/.exec(t);
        if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2], 10));
        m = /^10\^\(?([-+]?\d+)\)?$/.exec(t);
        if (m) return Math.pow(10, parseInt(m[1], 10));
        if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t)) return NaN;
        return parseFloat(t);
    };

    /* Elevens tal skrevet paent paa kortet: "2,45*10^3" -> "2,45 · 10³" */
    D.pynt = function (tekst) {
        var t = String(tekst || "").trim().replace(/\./g, ",");
        var m = /^([-+−]?[\d,]+)\s*(?:[·×xX*]\s*10\s*\^?\s*\(?\s*([-+−⁻]?[\d⁰¹²³⁴⁵⁶⁷⁸⁹]+)\s*\)?|[eE]([-+]?\d+))$/.exec(t);
        if (!m) return t;
        var e = NK.ascii(m[2] || m[3]).replace(/^\+/, "");
        return m[1] + " · 10" + NK.haevet(e);
    };

    D.naer = function (a, b, rel) { return isFinite(a) && b !== 0 && Math.abs(a - b) <= Math.abs(b) * rel; };

    /* Den enhed i listen, hvor tallet v passer med sand (i grundenheden), eller null */
    D.passerI = function (v, liste, sand, tol) {
        for (var i = 0; i < liste.length; i++) if (D.naer(v * liste[i].f, sand, tol || D.TOL)) return liste[i];
        return null;
    };
    D.enhedVed = function (liste, k) {
        for (var i = 0; i < liste.length; i++) if (liste[i].k === k) return liste[i];
        return null;
    };

    /* ----- Trinnene --------------------------------------------------------------------
       Hvert trin har: titel (rammen paa tavlen), slags ("tal" eller "valg"),
       enheder (vaelgeren), felt (teksten foran feltet), tekst, hint, forkl
       (ved et rigtigt svar), sand (det rigtige tal i grundenheden), svar
       (tallet og enheden, naar svaret vises) og fejl (de typiske fejl). */
    function cFelt(o) { return "c(" + D.u(o.stof) + ") ="; }
    function tabelE(o) { return D.TABEL_ENHED[o.enhed]; }

    D.TRIN = {
        eps: {
            titel: ["Ekstinktions-", "koefficienten"], kort: "ε", slags: "tal", enheder: "eps",
            felt: function () { return "ε ="; },
            tekst: function (o) {
                var ind = o.id === "mno4" ? "Kopiér tabellen i panelet til et regneark, og lav standardkurven med en lineær tendenslinje." :
                    (o.id === "jern" ? "Jernet fra en tablet er gjort orangerødt med phenanthrolin. Lav standardkurven i regnearket." :
                    (o.id === "para" ? "En hovedpinepille er opløst i vand. Lav standardkurven for paracetamol i regnearket." :
                    (o.id === "bouillon" ? "Et enzym danner ét NADH pr. glutamat, og NADH absorberer ved 340 nm. Lav standardkurven i regnearket." :
                    (o.id === "messing" ? "Kobberet fra en messingskrue er gjort dybblåt med ammoniak. Lav standardkurven i regnearket." :
                    "Lav standardkurven kun med de fem punkter i det lineære område."))));
                return ind + " Hvad er ε for " + o.epsStof + " ved " + o.lambda + " nm?";
            },
            hint: function (o) {
                var te = tabelE(o);
                return ["Hældningen a står foran x i regnearkets ligning y = a · x + b. Lysvejen er l = 1,00 cm, og ε = a / l.",
                    "Koncentrationerne er i " + te.t + ", så a har enheden " + te.t + "⁻¹, og ε får enheden " + te.t + "⁻¹ · cm⁻¹."];
            },
            forkl: function (o, r) {
                var te = tabelE(o);
                return "Regnearket giver hældningen a = " + D.aTekst(r.a) + " " + te.t + "⁻¹. Da a = ε · l og l = 1,00 cm, er ε = " +
                    D.epsU(r.epsM) + " M⁻¹ · cm⁻¹.";
            },
            sand: function (o, r) { return r.epsM; },
            svar: function (o, r) { return { tal: D.epsU(r.epsM), enhed: "Mcm" }; }
        },
        konc: {
            titel: ["Koncentrationen"], slags: "tal", enheder: "konc",
            felt: cFelt,
            tekst: function (o) {
                var hvor = o.id === "mno4" ? "Prøven" : (o.id === "bouillon" ? "Den fortyndede prøve" : (o.id === "messing" ? "Opløsningen i målekolben" :
                    (o.id === "jern" ? "Opløsningen fra tabletten" : (o.id === "para" ? "Opløsningen fra pillen" : "Opløsningen fra blodprøven"))));
                var i = o.id === "mno4" ? "i prøven" : (o.id === "bouillon" ? "i den fortyndede prøve" : (o.id === "messing" ? "i målekolben" : "i opløsningen"));
                return hvor + " har absorbansen " + D.abs(o.proeveA) + ". Hvad er koncentrationen af " + o.stofNavn + " " + i + "?";
            },
            hint: function () {
                return ["Isolér c i standardkurvens ligning A = a · c + b. Hældningen a og skæringen b står på grafen.",
                    "c = (A − b) / a. Koncentrationen får samme enhed som tabellens koncentrationer."];
            },
            forkl: function (o, r) {
                return "Prøvens absorbans sat ind i standardkurvens ligning giver c(" + D.u(o.stof) + ") = " + D.tal3(r.c) + " " + tabelE(o).t +
                    ". Punktet ligger på standardkurven.";
            },
            sand: function (o, r) { return r.cM; },
            ogsaa: function (o, r) { return r.c0 * r.f; },    /* c = A / a uden b godtages ogsaa */
            svar: function (o, r) { return { tal: D.tal3(r.c), enhed: o.enhed === "uM" ? "uM" : "mM" }; }
        },
        fortynd: {
            titel: ["Fortyndingen"], slags: "tal", enheder: "konc",
            felt: function () { return "c_før ="; },
            tekst: function (o) {
                return "Prøven er " + o.vFoerTekst + " bouillon fortyndet til " + o.vEfterTekst + " i en målekolbe. Hvad er koncentrationen af glutamat i bouillonen?";
            },
            hint: function (o) {
                return ["Bouillonen er fortyndet fra " + o.vFoerTekst + " til " + o.vEfterTekst + ", så bouillonen er stærkere end prøven.",
                    "c_før · V_før = c_efter · V_efter, så c_før = c_efter · V_efter / V_før."];
            },
            forkl: function (o, r) {
                return "Prøven er fortyndet " + Math.round(o.vEfter / o.vFoer) + " gange, så bouillonen har en " + Math.round(o.vEfter / o.vFoer) +
                    " gange så stor koncentration: c = " + D.tal3(r.cFoer) + " mM.";
            },
            sand: function (o, r) { return r.cFoer * r.f; },
            svar: function (o, r) { return { tal: D.tal3(r.cFoer), enhed: "mM" }; }
        },
        literMasse: {
            titel: ["Massen i 1 L"], slags: "tal", enheder: "masse",
            felt: function () { return "m i 1,00 L ="; },
            tekst: function (o) {
                return "Paracetamol har molarmassen " + NK.komma(Math.round(o.M * 100)) + " g/mol. Hvor mange mg paracetamol er der i 1,00 L af opløsningen?";
            },
            hint: function () {
                return ["Find først stofmængden i 1,00 L: n = c · V. Husk at regne mM om til M.",
                    "Massen er m = n · M. 1 g = 1000 mg."];
            },
            forkl: function (o, r) { return "Der er " + D.tal3(r.mg) + " mg paracetamol pr. liter. Regnestykket står på tavlen."; },
            sand: function (o, r) { return r.mg; },
            svar: function (o, r) { return { tal: D.tal3(r.mg), enhed: "mg" }; }
        },
        masse: {
            titel: ["Massen"], slags: "tal", enheder: "masse",
            felt: function () { return "m(Cu) ="; },
            tekst: function (o) {
                return "Hele skruen er opløst i de " + o.VTekst + ", og kobber har molarmassen 63,55 g/mol. Hvor mange mg kobber var der i skruen?";
            },
            hint: function (o) {
                return ["Stofmængden i målekolben er n = c · V med V = " + o.VTekst + " = 0,2500 L. Husk at regne mM om til M.",
                    "Massen er m = n · M. 1 g = 1000 mg."];
            },
            forkl: function (o, r) { return "Skruen indeholdt " + D.tal3(r.mg) + " mg kobber. Regnestykket står på tavlen."; },
            sand: function (o, r) { return r.mg; },
            svar: function (o, r) { return { tal: D.tal3(r.mg), enhed: "mg" }; }
        },
        omraade: {
            titel: ["Det lineære", "område"], slags: "valg",
            tekst: function () {
                return "Prilocain fra en blodprøve er målt ved 235 nm. Afbild alle otte punkter. I hvilket område er A ligefrem proportional med c?";
            },
            svar: ["25,0 til 475 µM", "25,0 til 250 µM", "100 til 400 µM", "325 til 475 µM"],
            omr: [[0, 7], [0, 4], [2, 6], [5, 7]],          /* punkterne i hvert svar */
            rigtig: 1,
            fejl: [
                "Fra 325 µM ligger punkterne under linjen gennem de første. A / c falder fra 0,0042 til 0,0033 µM⁻¹.",
                null,
                "Punkterne fra 25,0 µM ligger også på linjen, og fra 325 µM ligger punkterne under den.",
                "Det er netop her, punkterne ligger under linjen. A / c falder fra 0,0039 til 0,0033 µM⁻¹."
            ],
            hint: function () {
                return ["Regn A / c for hvert punkt. I det lineære område er A / c næsten det samme.",
                    "A / c er 0,0042 µM⁻¹ op til 250 µM og falder bagefter."];
            },
            forkl: function () {
                return "A / c er næsten konstant op til 250 µM. Over 250 µM ligger punkterne under linjen, og Lambert-Beers lov gælder ikke længere.";
            }
        },
        hoej: {
            titel: ["For høj", "absorbans"], slags: "valg",
            tekst: function (o) {
                return "En anden blodprøve giver absorbansen " + D.abs(o.hoejA) + ". Hvad gør du for at finde koncentrationen af prilocain?";
            },
            svar: ["Fortynder og måler igen", "Aflæser c på kurven", "Regner c = (A − b) / a", "Måler i en ny kuvette"],
            rigtig: 0,
            fejl: [
                null,
                "Over 250 µM bøjer kurven af, så en lille fejl i A giver en stor fejl i c. Standardkurven gælder kun i det lineære område.",
                "Standardkurven gælder kun i det lineære område, og A = 1,520 ligger over den højeste standard i området, 1,056.",
                "En ny kuvette giver samme absorbans. A = 1,520 ligger stadig over det lineære område."
            ],
            hint: function () {
                return ["Sammenlign 1,520 med absorbansen af den højeste standard i det lineære område.",
                    "Standardkurven kan kun bruges i det lineære område. Hvordan får du prøvens absorbans ned?"];
            },
            forkl: function () {
                return "A = 1,520 ligger over det lineære område. Prøven fortyndes, så A kommer ned under 1,056, og koncentrationen ganges op bagefter.";
            }
        }
    };

    /* ----- De typiske fejl med tal ---------------------------------------------------
       v er elevens tal i grundenheden (eller NaN), e er den valgte enhed.
       Giver forklaringen, eller null for den almindelige. */
    D.fejlTal = function (id, o, r, tal, e, liste) {
        var te = tabelE(o);
        var sand = D.TRIN[id].sand(o, r);
        var v = tal * e.f;
        var anden = D.passerI(tal, liste, sand, id === "eps" ? D.TOL_EPS : D.TOL);
        if (id === "eps") {
            if (!e.cm && anden && anden.k.replace("cm", "") === e.k) return "Tallet passer, men enheden mangler cm⁻¹. ε = a / l, og lysvejen l er i cm.";
            if (!e.cm) return "Enheden mangler cm⁻¹. ε = a / l, og lysvejen l er i cm.";
            if (anden) return "Tallet passer til enheden " + anden.t + ", ikke " + e.t + ". 1 " + te.t + "⁻¹ = " + (te.f === 1e-3 ? "1000" : "10⁶") + " M⁻¹.";
            if (D.naer(tal, 1 / r.a, 0.03)) return "Det er c / A. Hældningen er A / c: hvor meget A stiger, når c stiger med 1 " + te.t + ".";
            if (Math.abs(r.b) > 1e-6 && Math.abs(tal - r.b) < Math.max(0.0006, Math.abs(r.b) * 0.1)) return "Det er skæringen b. Hældningen a er tallet foran x i regnearkets ligning.";
            return null;
        }
        if (id === "konc") {
            if (anden) return "Tallet passer til " + anden.t + ", ikke " + e.t + ". Koncentrationen får tabellens enhed, " + te.t + ".";
            var gange = o.proeveA * r.a * te.f;            /* A · a i M */
            if (D.naer(v, gange, 0.04) || D.passerI(tal, liste, gange, 0.04)) return "Du har ganget A med hældningen. c = (A − b) / a: divider med a.";
            if (D.passerI(tal, liste, r.a / o.proeveA * te.f, 0.04)) return "Du har divideret a med A. c = (A − b) / a: A står i tælleren.";
            return null;
        }
        if (id === "fortynd") {
            if (anden) return "Tallet passer til " + anden.t + ", ikke " + e.t + ".";
            if (D.passerI(tal, liste, r.cM, D.TOL)) return "Det er koncentrationen i den fortyndede prøve. Bouillonen blev fortyndet fra " + o.vFoerTekst + " til " + o.vEfterTekst + ".";
            if (D.passerI(tal, liste, r.cM * o.vFoer / o.vEfter, D.TOL)) return "Bouillonen er stærkere end prøven, ikke svagere. Gang med V_efter / V_før.";
            return null;
        }
        if (id === "literMasse" || id === "masse") {
            if (anden) return "Tallet passer til " + anden.t + ", ikke " + e.t + ". 1 g = 1000 mg.";
            if (D.passerI(tal, liste, r.mg * 1000, D.TOL)) return "Koncentrationen er i mM. Regn den om til M, før du ganger: 1 mM = 0,001 M.";
            if (D.naer(tal, r.n * 1000, D.TOL) || D.naer(tal, r.n, D.TOL)) return "Det er stofmængden. Massen er m = n · M.";
            if (id === "masse" && D.passerI(tal, liste, r.mg / o.V, D.TOL)) return "Det er massen i 1,00 L. Målekolben har kun " + o.VTekst + ", så V = 0,2500 L.";
            return null;
        }
        return null;
    };

    /* Den almindelige forklaring, naar ingen af de typiske fejl passer */
    D.fejlAndet = function (id, o) {
        if (id === "eps") return "Linjen med din ε (rød) går ikke gennem punkterne. Find hældningen a i regnearkets ligning igen.";
        if (id === "konc") return "Med dit tal ligger prøvens punkt (rødt) ikke på standardkurven. c = (A − b) / a.";
        if (id === "fortynd") return "Ikke rigtigt. c_før · V_før = c_efter · V_efter, og c_efter er koncentrationen i prøven.";
        if (id === "literMasse") return "Ikke rigtigt. Regn først n = c · V med c i M og V = 1,00 L, og så m = n · M.";
        return "Ikke rigtigt. Regn først n = c · V med c i M og V = 0,2500 L, og så m = n · M.";
    };

    D.FANE_SLUT = {
        k: "Begge standardkurver er klaret.",
        i: "Alle tre prøver er regnet helt igennem.",
        l: "Prilocain er klaret, også prøven med for høj absorbans."
    };

    NK.Data = D;
}());
