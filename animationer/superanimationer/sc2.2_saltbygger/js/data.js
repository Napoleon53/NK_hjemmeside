/* =====================================================================
   data.js - ionerne, og alt hvad der kan regnes ud fra dem

   Alle ioner staar i IONER. Resten af animationen regner selv formler,
   navne, ladningsbalance, atomtal og de forkerte svarmuligheder ud fra
   dem. En ny ion kraever kun én linje her - plus en tegning af
   atomerne, hvis den er sammensat.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};
    NK.Data = D;

    /* ----- Tegningerne af de sammensatte ioner ------------------------ */
    /* Hvert atom: [symbol, x, y, bundet til]. Enheden er én binding;
       tegning.js centrerer og skalerer selv. */
    var K = 0.707;
    function kryds(c, l) {           /* tetraeder set ovenfra: SO₄, PO₄ */
        return [[c, 0, 0], [l, -K, -K, 0], [l, K, -K, 0], [l, K, K, 0], [l, -K, K, 0]];
    }
    function trekant(c, l) {         /* plan trekant: NO₃, CO₃ */
        return [[c, 0, 0], [l, 0, -1, 0], [l, 0.866, 0.5, 0], [l, -0.866, 0.5, 0]];
    }

    /* navn:     den del, der bruges i saltets navn. Positive ioner faar
                 "-ion" bagpaa, naar de staar alene (natriumion), negative
                 ikke (sulfat).
       variabel: metallet kan have flere ladninger, saa ladningen skal
                 staa i navnet med romertal. grund er navnet uden.
       gruppe:   hovedgruppen 1-8, som i bogen og i sc2.3, for de ioner,
                 hvis ladning kan udledes af den (fane 3). Nummeret er
                 antallet af elektroner i yderste skal. */
    D.IONER = [
        { id: "Na",   formel: "Na",   q: 1,  navn: "natrium", grundstof: "natrium", gruppe: 1 },
        { id: "K",    formel: "K",    q: 1,  navn: "kalium", grundstof: "kalium", gruppe: 1 },
        { id: "Ag",   formel: "Ag",   q: 1,  navn: "sølv" },
        { id: "NH4",  formel: "NH₄",  q: 1,  navn: "ammonium", sammensat: true,
          atomer: [["N", 0, 0], ["H", -0.64, -0.64, 0], ["H", 0.64, -0.64, 0], ["H", 0.64, 0.64, 0], ["H", -0.64, 0.64, 0]] },
        { id: "Mg",   formel: "Mg",   q: 2,  navn: "magnesium", grundstof: "magnesium", gruppe: 2 },
        { id: "Ca",   formel: "Ca",   q: 2,  navn: "calcium", grundstof: "calcium", gruppe: 2 },
        { id: "Ba",   formel: "Ba",   q: 2,  navn: "barium", grundstof: "barium", gruppe: 2 },
        { id: "Cu",   formel: "Cu",   q: 2,  navn: "kobber(II)", grund: "kobber", variabel: true },
        { id: "Fe2",  formel: "Fe",   q: 2,  navn: "jern(II)", grund: "jern", variabel: true },
        { id: "Al",   formel: "Al",   q: 3,  navn: "aluminium", grundstof: "aluminium", gruppe: 3 },
        { id: "Fe3",  formel: "Fe",   q: 3,  navn: "jern(III)", grund: "jern", variabel: true },

        { id: "Cl",   formel: "Cl",   q: -1, navn: "chlorid", grundstof: "chlor", gruppe: 7 },
        { id: "O",    formel: "O",    q: -2, navn: "oxid", grundstof: "oxygen", gruppe: 6 },
        { id: "S",    formel: "S",    q: -2, navn: "sulfid", grundstof: "svovl", gruppe: 6 },
        { id: "OH",   formel: "OH",   q: -1, navn: "hydroxid", sammensat: true,
          atomer: [["O", 0, 0], ["H", 0.66, -0.36, 0]] },
        { id: "NO3",  formel: "NO₃",  q: -1, navn: "nitrat", sammensat: true, atomer: trekant("N", "O") },
        { id: "HCO3", formel: "HCO₃", q: -1, navn: "hydrogencarbonat", sammensat: true,
          atomer: trekant("C", "O").concat([["H", -1.2, 1.02, 3]]) },
        { id: "CO3",  formel: "CO₃",  q: -2, navn: "carbonat", sammensat: true, atomer: trekant("C", "O") },
        { id: "SO4",  formel: "SO₄",  q: -2, navn: "sulfat", sammensat: true, atomer: kryds("S", "O") },
        { id: "PO4",  formel: "PO₄",  q: -3, navn: "phosphat", sammensat: true, atomer: kryds("P", "O") }
    ];

    /* Fane 3: ioner, der ikke ligger paa hylden. Eleven finder deres
       ladning ud fra formlen. Metallerne kan have flere ladninger, saa
       ladningen staar i navnet med romertal. */
    D.UKENDTE = [
        { id: "Cr3",  formel: "Cr",   q: 3,  navn: "chrom(III)",   grund: "chrom",   variabel: true },
        { id: "Sn2",  formel: "Sn",   q: 2,  navn: "tin(II)",      grund: "tin",     variabel: true },
        { id: "Sn4",  formel: "Sn",   q: 4,  navn: "tin(IV)",      grund: "tin",     variabel: true },
        { id: "Pb2",  formel: "Pb",   q: 2,  navn: "bly(II)",      grund: "bly",     variabel: true },
        { id: "Pb4",  formel: "Pb",   q: 4,  navn: "bly(IV)",      grund: "bly",     variabel: true },
        { id: "Mn2",  formel: "Mn",   q: 2,  navn: "mangan(II)",   grund: "mangan",  variabel: true },
        { id: "Mn4",  formel: "Mn",   q: 4,  navn: "mangan(IV)",   grund: "mangan",  variabel: true },
        { id: "Co2",  formel: "Co",   q: 2,  navn: "cobalt(II)",   grund: "cobalt",  variabel: true },
        { id: "Ni2",  formel: "Ni",   q: 2,  navn: "nikkel(II)",   grund: "nikkel",  variabel: true },
        { id: "Cu1",  formel: "Cu",   q: 1,  navn: "kobber(I)",    grund: "kobber",  variabel: true },
        { id: "Ti4",  formel: "Ti",   q: 4,  navn: "titan(IV)",    grund: "titan",   variabel: true },

        { id: "CrO4", formel: "CrO₄", q: -2, navn: "chromat", sammensat: true, atomer: kryds("Cr", "O") },
        { id: "MnO4", formel: "MnO₄", q: -1, navn: "permanganat", sammensat: true, atomer: kryds("Mn", "O") },
        { id: "S2O3", formel: "S₂O₃", q: -2, navn: "thiosulfat", sammensat: true,
          atomer: [["S", 0, 0], ["S", -K, -K, 0], ["O", K, -K, 0], ["O", K, K, 0], ["O", -K, K, 0]] },
        { id: "ClO",  formel: "ClO",  q: -1, navn: "hypochlorit", sammensat: true, atomer: [["Cl", 0, 0], ["O", 1, 0, 0]] },
        { id: "ClO3", formel: "ClO₃", q: -1, navn: "chlorat", sammensat: true, atomer: trekant("Cl", "O") },
        { id: "NO2",  formel: "NO₂",  q: -1, navn: "nitrit", sammensat: true,
          atomer: [["N", 0, 0], ["O", -0.87, 0.5, 0], ["O", 0.87, 0.5, 0]] },
        { id: "SO3",  formel: "SO₃",  q: -2, navn: "sulfit", sammensat: true, atomer: trekant("S", "O") },
        { id: "C2O4", formel: "C₂O₄", q: -2, navn: "oxalat", sammensat: true,
          atomer: [["C", -0.5, 0], ["C", 0.5, 0, 0], ["O", -1.0, -0.85, 0], ["O", -1.0, 0.85, 0], ["O", 1.0, -0.85, 1], ["O", 1.0, 0.85, 1]] },
        { id: "AsO4", formel: "AsO₄", q: -3, navn: "arsenat", sammensat: true, atomer: kryds("As", "O") }
    ];
    D.UKENDTE.forEach(function (ion) { ion.ukendt = true; });

    var efterId = {};
    D.IONER.concat(D.UKENDTE).forEach(function (ion) { efterId[ion.id] = ion; });
    D.ion = function (id) { return efterId[id] || null; };
    D.KATIONER = D.IONER.filter(function (i) { return i.q > 0; });
    D.ANIONER = D.IONER.filter(function (i) { return i.q < 0; });

    /* ----- Det periodiske system, periode 1-6 (uden lanthaniderne) -----
       Samme tabel som i sc2.3. [symbol, dansk navn, periode, soejle 1-18,
       slags]; slags: m metal, i ikke-metal, h halvmetal, a aedelgas */
    var PT = [
        ["H", "hydrogen", 1, 1, "i"], ["He", "helium", 1, 18, "a"],
        ["Li", "lithium", 2, 1, "m"], ["Be", "beryllium", 2, 2, "m"], ["B", "bor", 2, 13, "h"], ["C", "carbon", 2, 14, "i"],
        ["N", "nitrogen", 2, 15, "i"], ["O", "oxygen", 2, 16, "i"], ["F", "fluor", 2, 17, "i"], ["Ne", "neon", 2, 18, "a"],
        ["Na", "natrium", 3, 1, "m"], ["Mg", "magnesium", 3, 2, "m"], ["Al", "aluminium", 3, 13, "m"], ["Si", "silicium", 3, 14, "h"],
        ["P", "phosphor", 3, 15, "i"], ["S", "svovl", 3, 16, "i"], ["Cl", "chlor", 3, 17, "i"], ["Ar", "argon", 3, 18, "a"],
        ["K", "kalium", 4, 1, "m"], ["Ca", "calcium", 4, 2, "m"], ["Sc", "scandium", 4, 3, "m"], ["Ti", "titan", 4, 4, "m"],
        ["V", "vanadium", 4, 5, "m"], ["Cr", "chrom", 4, 6, "m"], ["Mn", "mangan", 4, 7, "m"], ["Fe", "jern", 4, 8, "m"],
        ["Co", "cobalt", 4, 9, "m"], ["Ni", "nikkel", 4, 10, "m"], ["Cu", "kobber", 4, 11, "m"], ["Zn", "zink", 4, 12, "m"],
        ["Ga", "gallium", 4, 13, "m"], ["Ge", "germanium", 4, 14, "h"], ["As", "arsen", 4, 15, "h"], ["Se", "selen", 4, 16, "i"],
        ["Br", "brom", 4, 17, "i"], ["Kr", "krypton", 4, 18, "a"],
        ["Rb", "rubidium", 5, 1, "m"], ["Sr", "strontium", 5, 2, "m"], ["Y", "yttrium", 5, 3, "m"], ["Zr", "zirconium", 5, 4, "m"],
        ["Nb", "niobium", 5, 5, "m"], ["Mo", "molybdæn", 5, 6, "m"], ["Tc", "technetium", 5, 7, "m"], ["Ru", "ruthenium", 5, 8, "m"],
        ["Rh", "rhodium", 5, 9, "m"], ["Pd", "palladium", 5, 10, "m"], ["Ag", "sølv", 5, 11, "m"], ["Cd", "cadmium", 5, 12, "m"],
        ["In", "indium", 5, 13, "m"], ["Sn", "tin", 5, 14, "m"], ["Sb", "antimon", 5, 15, "h"], ["Te", "tellur", 5, 16, "h"],
        ["I", "iod", 5, 17, "i"], ["Xe", "xenon", 5, 18, "a"],
        ["Cs", "cæsium", 6, 1, "m"], ["Ba", "barium", 6, 2, "m"], ["La", "lanthan", 6, 3, "m"], ["Hf", "hafnium", 6, 4, "m"],
        ["Ta", "tantal", 6, 5, "m"], ["W", "wolfram", 6, 6, "m"], ["Re", "rhenium", 6, 7, "m"], ["Os", "osmium", 6, 8, "m"],
        ["Ir", "iridium", 6, 9, "m"], ["Pt", "platin", 6, 10, "m"], ["Au", "guld", 6, 11, "m"], ["Hg", "kviksølv", 6, 12, "m"],
        ["Tl", "thallium", 6, 13, "m"], ["Pb", "bly", 6, 14, "m"], ["Bi", "bismuth", 6, 15, "m"], ["Po", "polonium", 6, 16, "m"],
        ["At", "astat", 6, 17, "i"], ["Rn", "radon", 6, 18, "a"]
    ];

    D.GRUNDSTOFFER = PT.map(function (r) {
        return { s: r[0], navn: r[1], periode: r[2], soejle: r[3], slags: r[4] };
    });

    var efterSymbol = {};
    D.GRUNDSTOFFER.forEach(function (g) { efterSymbol[g.s] = g; });
    D.grundstof = function (s) { return efterSymbol[s] || null; };

    /* Hovedgruppenummeret 1-8, som det staar i bogen. Soejle 3-12 er
       overgangsmetallerne, som ikke har et hovedgruppenummer. */
    D.hovedgruppe = function (s) {
        var g = efterSymbol[s];
        if (!g) return null;
        if (g.soejle <= 2) return g.soejle;
        if (g.soejle >= 13) return g.soejle - 10;
        return null;
    };

    /* Metaller, der kan danne ioner med forskellig ladning. Samme liste
       som i sc2.3 plus de ukendte metaller paa fane 3. */
    D.FLERE_LADNINGER = ["Ti", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Sn", "Pb", "Hg"];

    /* De sammensatte ioner paa plakaten, samme som paa hylden. */
    D.PLAKAT_IONER = ["NH4", "OH", "NO3", "HCO3", "CO3", "SO4", "PO4"];

    /* SO₄²⁻ */
    D.ionTekst = function (ion) { return ion.formel + NK.ladningHaevet(ion.q); };
    /* natriumion, sulfat */
    D.ionNavn = function (ion) { return ion.q > 0 ? ion.navn + "ion" : ion.navn; };

    /* Hvilke atomer er ionen lavet af? Laeses direkte ud af formlen,
       saa der ikke er to steder, der kan komme ud af trit:
       "HCO₃" -> [["H", 1], ["C", 1], ["O", 3]] */
    var CIFFER = { "₀": 0, "₁": 1, "₂": 2, "₃": 3, "₄": 4, "₅": 5, "₆": 6, "₇": 7, "₈": 8, "₉": 9 };
    D.sammensaetning = function (ion) {
        if (ion._atomer) return ion._atomer;
        var ud = [], re = /([A-Z][a-z]?)([₀-₉]*)/g, m;
        while ((m = re.exec(ion.formel))) {
            var n = 0;
            for (var i = 0; i < m[2].length; i++) n = n * 10 + CIFFER[m[2][i]];
            ud.push([m[1], n || 1]);
        }
        ion._atomer = ud;
        return ud;
    };

    /* ----- Formler og navne ------------------------------------------- */
    /* Det mindste forhold, hvor plus og minus gaar lige op. */
    D.forhold = function (kat, an) {
        var a = kat.q, b = -an.q, g = NK.gcd(a, b);
        return { p: b / g, n: a / g };
    };

    /* Én ion med sit antal: Na₂, (SO₄)₃ - parentes kun om sammensatte. */
    D.formeldel = function (ion, antal) {
        if (antal === 1) return ion.formel;
        return ion.sammensat ? "(" + ion.formel + ")" + NK.saenket(antal) : ion.formel + NK.saenket(antal);
    };

    D.formel = function (kat, an, p, n) {
        if (p === undefined) { var f = D.forhold(kat, an); p = f.p; n = f.n; }
        return D.formeldel(kat, p) + D.formeldel(an, n);
    };

    /* Samme, farvelagt: den positive del roed, den negative blaa. */
    D.formelHTML = function (kat, an, p, n) {
        if (p === undefined) { var f = D.forhold(kat, an); p = f.p; n = f.n; }
        return '<span class="fk">' + D.formeldel(kat, p) + '</span><span class="fa">' + D.formeldel(an, n) + "</span>";
    };

    D.saltnavn = function (kat, an) { return kat.navn + an.navn; };

    D.salt = function (katId, anId) {
        var kat = D.ion(katId), an = D.ion(anId), f = D.forhold(kat, an);
        return { kat: kat, an: an, p: f.p, n: f.n, formel: D.formel(kat, an, f.p, f.n), navn: D.saltnavn(kat, an) };
    };

    /* Atomerne i formlen talt sammen, i den raekkefoelge de staar:
       Al₂(SO₄)₃ -> [["Al", 2], ["S", 3], ["O", 12]] */
    D.atomtal = function (kat, p, an, n) {
        var ud = [], plads = {};
        function laeg(ion, antal) {
            D.sammensaetning(ion).forEach(function (a) {
                if (plads[a[0]] === undefined) { plads[a[0]] = ud.length; ud.push([a[0], 0]); }
                ud[plads[a[0]]][1] += a[1] * antal;
            });
        }
        laeg(kat, p);
        laeg(an, n);
        return ud;
    };

    D.atomTekst = function (liste) {
        return liste.map(function (a) { return a[0] + " " + a[1]; }).join("  ·  ");
    };

    /* ----- Findes stoffet, og kan det opløses? ------------------------ */
    /* Formlen kan godt skrives rigtigt for et stof, der ikke findes.
       Det faar eleven at vide - men formlen er stadig rigtig. */
    var FINDES_IKKE = {
        "Al-CO3": 1, "Fe3-CO3": 1, "Al-HCO3": 1, "Fe3-HCO3": 1, "Cu-HCO3": 1, "Ag-HCO3": 1,
        "Ag-OH": 1, "NH4-O": 1,
        "NH4-OH": "Ammoniumhydroxid findes ikke som fast stof. Det er ammoniak opløst i vand."
    };

    D.findesIkke = function (kat, an) {
        var v = FINDES_IKKE[kat.id + "-" + an.id];
        if (!v) return "";
        return typeof v === "string" ? v : "Stoffet findes ikke som fast stof, men formlen er rigtigt skrevet.";
    };

    /* "let" | "tung" | "findes-ikke" | "reagerer" (oxider og sulfider)
       Huskereglen fra fældningsopgaverne: nitrater og alle salte med
       natrium, kalium og ammonium er letopløselige. */
    D.oploeselighed = function (kat, an) {
        if (FINDES_IKKE[kat.id + "-" + an.id]) return "findes-ikke";
        if (an.id === "O" || an.id === "S") return "reagerer";
        if (an.id === "NO3" || kat.id === "Na" || kat.id === "K" || kat.id === "NH4") return "let";
        switch (an.id) {
            case "Cl":   return kat.id === "Ag" ? "tung" : "let";
            case "SO4":  return (kat.id === "Ba" || kat.id === "Ca" || kat.id === "Ag") ? "tung" : "let";
            case "OH":   return kat.id === "Ba" ? "let" : "tung";
            case "HCO3": return "let";      /* de resterende findes kun opløst i vand */
            default:     return "tung";     /* carbonater og phosphater */
        }
    };

    /* ----- Opløsning i vand -------------------------------------------- */
    function led(tal, tekst) { return (tal > 1 ? tal + " " : "") + tekst; }

    /* 2 Na⁺(aq) */
    D.ionLed = function (ion, antal) { return led(antal, D.ionTekst(ion)) + "(aq)"; };
    D.oploesVenstre = function (s) { return s.formel + "(s)"; };
    D.oploesHoejre = function (s) { return D.ionLed(s.kat, s.p) + " + " + D.ionLed(s.an, s.n); };

    /* ----- Opgaverne ------------------------------------------------------ */
    function liste(par) {
        return par.map(function (x) { return { kat: x[0], an: x[1], trin: x[2] || 1 }; });
    }

    /* Byggefanen, navn -> formel. trin 1: én af hver, 2: to af den ene, 3: tre af den ene
       eller 2 : 3. Opgaverne bliver svaerere, efterhaanden som eleven
       loeser dem. Alle stofferne findes. */
    D.NAVN_OPGAVER = liste([
        ["Na", "NO3", 1], ["K", "OH", 1], ["NH4", "Cl", 1], ["Na", "HCO3", 1], ["Ag", "NO3", 1], ["Ca", "CO3", 1],
        ["Ba", "SO4", 1], ["Cu", "SO4", 1], ["Mg", "SO4", 1], ["Fe2", "SO4", 1], ["Al", "PO4", 1], ["NH4", "NO3", 1],
        ["Fe3", "PO4", 1],
        ["Ca", "OH", 2], ["Mg", "NO3", 2], ["NH4", "SO4", 2], ["Na", "CO3", 2], ["K", "SO4", 2], ["Ba", "NO3", 2],
        ["Cu", "NO3", 2], ["Ca", "HCO3", 2], ["Fe2", "OH", 2], ["Mg", "OH", 2], ["NH4", "CO3", 2], ["Cu", "OH", 2],
        ["Na", "SO4", 2], ["Ba", "OH", 2], ["Ag", "SO4", 2],
        ["Al", "OH", 3], ["Fe3", "OH", 3], ["Al", "NO3", 3], ["Fe3", "NO3", 3], ["Na", "PO4", 3], ["K", "PO4", 3],
        ["NH4", "PO4", 3], ["Ag", "PO4", 3], ["Ca", "PO4", 3], ["Mg", "PO4", 3], ["Ba", "PO4", 3], ["Al", "SO4", 3],
        ["Fe3", "SO4", 3], ["Cu", "PO4", 3], ["Fe2", "PO4", 3]
    ]);

    /* Byggefanen, formel -> navn. Mange med jern og kobber, fordi det er dér, formlen skal
       bruges til at finde ladningen. */
    D.FORMEL_OPGAVER = liste([
        ["Fe3", "SO4"], ["Fe2", "SO4"], ["Fe3", "OH"], ["Fe2", "OH"], ["Fe3", "NO3"], ["Fe2", "NO3"],
        ["Fe3", "PO4"], ["Fe2", "PO4"], ["Fe2", "CO3"], ["Cu", "NO3"], ["Cu", "SO4"], ["Cu", "OH"],
        ["NH4", "SO4"], ["NH4", "NO3"], ["NH4", "PO4"], ["NH4", "CO3"], ["NH4", "HCO3"], ["Ca", "PO4"],
        ["Mg", "OH"], ["Al", "SO4"], ["Na", "HCO3"], ["K", "NO3"], ["Ba", "OH"], ["Ca", "HCO3"],
        ["K", "CO3"], ["Na", "PO4"], ["Ag", "NO3"], ["Ag", "SO4"], ["Ba", "SO4"], ["Al", "OH"], ["Mg", "NO3"]
    ]);

    /* Vandfanen. Kun letopløselige salte, de andre bliver liggende. */
    D.VAND_OPGAVER = liste([
        ["Na", "NO3"], ["K", "NO3"], ["NH4", "NO3"], ["Na", "SO4"], ["K", "SO4"], ["NH4", "SO4"],
        ["Na", "CO3"], ["K", "CO3"], ["NH4", "CO3"], ["Na", "PO4"], ["K", "PO4"], ["NH4", "PO4"],
        ["Na", "HCO3"], ["K", "HCO3"], ["Ca", "NO3"], ["Mg", "NO3"], ["Ba", "NO3"], ["Cu", "NO3"],
        ["Fe3", "NO3"], ["Al", "NO3"], ["Ag", "NO3"], ["Mg", "SO4"], ["Cu", "SO4"], ["Fe2", "SO4"],
        ["Al", "SO4"], ["Fe3", "SO4"], ["Na", "OH"], ["K", "OH"], ["Ba", "OH"], ["NH4", "Cl"]
    ]);

    /* De negative ioner, man kan vaelge frit paa vandfanen. Oxid og
       sulfid er udeladt: de reagerer med vandet i stedet for bare at
       gaa i opløsning. */
    D.VAND_ANIONER = ["Cl", "OH", "NO3", "HCO3", "CO3", "SO4", "PO4"];

    /* Fane 3: den ukendte ion. Den ene ion i saltet ligger ikke paa
       hylden, og eleven finder dens ladning ud fra formlen. Med et
       ukendt metal skal saltet saa navngives med romertal. Med en ukendt
       sammensat ion skal den bruges i et nyt salt med partneren (partner
       er en positiv ion fra hylden). Alle stofferne findes. Oxiderne
       SnO₂, PbO₂, MnO₂ og TiO₂ er med, fordi det lille tal ved O dér er
       forkortet vaek: tin har ikke ladningen 2+ i SnO₂. */
    D.UKENDT_OPGAVER = [
        { kat: "Cr3", an: "Cl" }, { kat: "Cr3", an: "SO4" }, { kat: "Cr3", an: "O" },
        { kat: "Sn2", an: "Cl" }, { kat: "Sn4", an: "O" }, { kat: "Sn2", an: "O" },
        { kat: "Pb2", an: "NO3" }, { kat: "Pb2", an: "O" }, { kat: "Pb4", an: "O" },
        { kat: "Mn2", an: "SO4" }, { kat: "Mn4", an: "O" }, { kat: "Co2", an: "Cl" },
        { kat: "Ni2", an: "OH" }, { kat: "Cu1", an: "Cl" }, { kat: "Cu1", an: "O" }, { kat: "Ti4", an: "O" },

        { kat: "K", an: "CrO4", partner: "Ba" }, { kat: "Mg", an: "CrO4", partner: "K" },
        { kat: "K", an: "MnO4", partner: "Ca" }, { kat: "Na", an: "S2O3", partner: "Ba" },
        { kat: "Na", an: "ClO", partner: "Ca" }, { kat: "Ca", an: "ClO", partner: "Na" },
        { kat: "K", an: "ClO3", partner: "Ba" }, { kat: "Na", an: "NO2", partner: "Ca" },
        { kat: "Na", an: "SO3", partner: "Ca" }, { kat: "Ca", an: "C2O4", partner: "Na" },
        { kat: "Na", an: "AsO4", partner: "Ca" }
    ];
    D.UKENDT_OPGAVER.forEach(function (o) { o.side = D.ion(o.kat).ukendt ? "kat" : "an"; });

    /* Hvilke ladninger kan eleven indstille paa den ukendte ion? */
    D.UKENDT_MIN = 1;
    D.UKENDT_MAKS = 4;

    /* ----- Svarmuligheder ------------------------------------------------ */
    /* Hver forkert mulighed er en typisk fejl, og den har sin egen
       forklaring med. Den foerste fejltype, der passer, kommer med
       foerst - derfor er raekkefoelgen i hver funktion vigtig. */
    function samler(rigtig) {
        var kand = [], brugt = {};
        brugt[rigtig] = true;
        return {
            kand: kand,
            laeg: function (tekst, forklaring) {
                if (brugt[tekst]) return;
                brugt[tekst] = true;
                kand.push({ tekst: tekst, rigtig: false, forklaring: forklaring });
            }
        };
    }

    function afslut(s, rigtig) {
        var valg = s.kand.slice(0, 3);
        valg.push(rigtig);
        return NK.bland(valg);
    }

    function udenParentes(ion, antal) { return ion.formel + (antal > 1 ? NK.saenket(antal) : ""); }

    function atomformel(kat, p, an, n) {
        return D.atomtal(kat, p, an, n).map(function (a) { return a[0] + (a[1] > 1 ? NK.saenket(a[1]) : ""); }).join("");
    }

    function ladningstjek(kat, an, p, n) {
        var plus = p * kat.q, minus = n * -an.q;
        if (plus === minus) {
            var g = NK.gcd(p, n);
            return "Ladningen går op, men " + p + " : " + n + " kan forkortes til " + (p / g) + " : " + (n / g)
                + ". Formlen viser det mindste forhold.";
        }
        return p + " " + D.ionTekst(kat) + " og " + n + " " + D.ionTekst(an) + " giver " + NK.fortegn(plus) + " og "
            + NK.fortegn(-minus) + ". Ladningen går ikke op.";
    }

    /* Byggefanen: hvordan skrives formlen? */
    D.formelValg = function (kat, an) {
        var f = D.forhold(kat, an), p = f.p, n = f.n;
        var rigtig = D.formel(kat, an, p, n);
        var s = samler(rigtig);

        var grp = (an.sammensat && n > 1) ? an : ((kat.sammensat && p > 1) ? kat : null);
        var grpAntal = grp === an ? n : p;
        if (grp) {
            s.laeg(udenParentes(kat, p) + udenParentes(an, n),
                "Uden parentes smelter tallene sammen, så " + grp.formel + NK.saenket(grpAntal)
                + " ligner ét langt tal. Parentesen viser, at hele " + grp.formel + " er med " + grpAntal + " gange.");
        }
        if (p !== n) s.laeg(D.formel(kat, an, n, p), "Tallene er byttet om. " + ladningstjek(kat, an, n, p));
        if (kat.sammensat || an.sammensat) {
            s.laeg(atomformel(kat, p, an, n), "Atomerne er talt rigtigt, men så kan man ikke se ionerne. "
                + "En sammensat ion skrives samlet og i parentes, hvis der er flere af den.");
        }
        if (p !== 1 || n !== 1) s.laeg(D.formel(kat, an, 1, 1), ladningstjek(kat, an, 1, 1));
        s.laeg(D.formel(kat, an, 2 * p, 2 * n), ladningstjek(kat, an, 2 * p, 2 * n));
        s.laeg(D.formel(kat, an, 1, kat.q), ladningstjek(kat, an, 1, kat.q));
        s.laeg(D.formel(kat, an, -an.q, 1), ladningstjek(kat, an, -an.q, 1));
        s.laeg(D.formel(kat, an, p + 1, n), ladningstjek(kat, an, p + 1, n));
        s.laeg(D.formel(kat, an, p, n + 1), ladningstjek(kat, an, p, n + 1));

        var hvorfor;
        if (grp) hvorfor = "Parentesen viser, at hele " + grp.formel + " er med " + grpAntal + " gange.";
        else if (p === 1 && n === 1) hvorfor = "Én af hver, fordi ladningerne er lige store.";
        else hvorfor = p + " " + D.ionTekst(kat) + " giver " + NK.fortegn(p * kat.q) + ", og " + n + " " + D.ionTekst(an)
            + " giver " + NK.fortegn(n * an.q) + ".";
        return afslut(s, { tekst: rigtig, rigtig: true, forklaring: hvorfor });
    };

    /* Navne, der let forveksles med det rigtige. */
    var FORVEKSLING = {
        sulfat:   [["sulfid", "Sulfid er S²⁻ uden oxygen. SO₄²⁻ hedder sulfat."],
                   ["sulfit", "Sulfit er SO₃²⁻ med ét oxygen mindre. SO₄²⁻ hedder sulfat."]],
        nitrat:   [["nitrid", "Nitrid er N³⁻ uden oxygen. NO₃⁻ hedder nitrat."],
                   ["nitrit", "Nitrit er NO₂⁻ med ét oxygen mindre. NO₃⁻ hedder nitrat."]],
        phosphat: [["phosphid", "Phosphid er P³⁻ uden oxygen. PO₄³⁻ hedder phosphat."],
                   ["phosphit", "Phosphit er PO₃³⁻ med ét oxygen mindre. PO₄³⁻ hedder phosphat."]],
        carbonat: [["hydrogencarbonat", "Hydrogencarbonat er HCO₃⁻ med et H. CO₃²⁻ hedder carbonat."]],
        hydrogencarbonat: [["carbonat", "Carbonat er CO₃²⁻. Med H'et hedder HCO₃⁻ hydrogencarbonat."]],
        hydroxid: [["oxid", "Oxid er O²⁻. OH⁻ hedder hydroxid."]],
        oxid:     [["hydroxid", "Hydroxid er OH⁻. O²⁻ hedder oxid."]],
        chlorid:  [["chlorat", "Chlorat er ClO₃⁻ med oxygen. Cl⁻ hedder chlorid."]],
        sulfid:   [["sulfat", "Sulfat er SO₄²⁻ med oxygen. S²⁻ hedder sulfid."]]
    };
    var PRAEFIKS = ["", "", "di", "tri", "tetra", "penta", "hexa"];
    var ROMERTAL = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    /* Byggefanen: hvad hedder stoffet? */
    D.navneValg = function (kat, an) {
        var f = D.forhold(kat, an), p = f.p, n = f.n;
        var rigtig = D.saltnavn(kat, an);
        var s = samler(rigtig);

        if (kat.variabel) {
            var anden = null;
            D.KATIONER.forEach(function (k) { if (k.grund === kat.grund && k !== kat) anden = k; });
            s.laeg((anden ? anden.navn : kat.grund + "(" + ROMERTAL[kat.q - 1] + ")") + an.navn,
                "Tjek ladningen: " + n + " " + D.ionTekst(an) + " giver " + NK.fortegn(n * an.q) + ", så "
                + (p > 1 ? "hver af de " + p + " " + kat.grund + "ioner har" : kat.grund + "ionen har")
                + " ladningen " + kat.q + "+.");
            s.laeg(kat.grund + an.navn, stort(kat.grund)
                + " kan have flere forskellige ladninger, så ladningen skal stå i navnet med romertal.");
        }
        (FORVEKSLING[an.navn] || []).forEach(function (x) { s.laeg(kat.navn + x[0], x[1]); });
        if (kat.id === "NH4") s.laeg("ammoniak" + an.navn, "Ammoniak er NH₃, et molekyle. Ionen NH₄⁺ hedder ammonium.");
        if ((p > 1 || n > 1) && !(kat.q === 1 && an.id === "PO4")) {
            s.laeg(PRAEFIKS[p] + kat.navn + PRAEFIKS[n] + an.navn,
                "I navnet på et salt står antallet ikke. Det er givet af ionernes ladninger.");
        }
        s.laeg(kat.navn + "ion" + an.navn, "Når ionen står i et saltnavn, mister den endelsen -ion.");
        s.laeg(an.navn + kat.navn, "Den positive ion skal nævnes først.");

        var hvorfor = "Den positive ion først, så den negative: " + kat.navn + " + " + an.navn + ".";
        if (kat.variabel) hvorfor += " Romertallet (" + ROMERTAL[kat.q] + ") viser ladningen " + kat.q + "+.";
        return afslut(s, { tekst: rigtig, rigtig: true, forklaring: hvorfor });
    };

    /* Fane 3, trin 1: hvilken ladning har den kendte ion? For et
       grundstof i en hovedgruppe kan den udledes af gruppen: metaller
       afgiver elektronerne i yderste skal, ikke-metaller optager dem, der
       mangler i at have 8. Fejlene er fortegnet byttet om og antallet af
       elektroner i yderste skal brugt som ladning. En sammensat ions
       ladning skal man kende fra oversigten. */
    function elektroner(n) { return n + (n === 1 ? " elektron" : " elektroner"); }

    D.kendtValg = function (ion) {
        var rigtig = D.ionTekst(ion);
        var s = samler(rigtig);
        function med(q) { return ion.formel + NK.ladningHaevet(q); }
        var hvorfor;
        if (ion.gruppe) {
            var v = ion.gruppe;              /* hovedgruppen = elektroner i yderste skal */
            var navn = stort(ion.grundstof), m = 8 - v;
            if (ion.q > 0) {
                s.laeg(med(-v), navn + " er et metal. Metaller afgiver elektroner og bliver positive.");
                s.laeg(med(-m), navn + " har " + elektroner(v) + " i yderste skal. Det er lettere at afgive "
                    + v + " end at optage " + m + ".");
                s.laeg(med(v + 1), navn + " har kun " + elektroner(v) + " i yderste skal, så den kan kun afgive " + v + ".");
                hvorfor = navn + " står i hovedgruppe " + ion.gruppe + " og har " + elektroner(v) + " i yderste skal. "
                    + "Den afgiver " + (v === 1 ? "den" : "dem") + " og bliver " + rigtig + ".";
            } else {
                s.laeg(med(v), navn + " har " + elektroner(v) + " i yderste skal. Det er lettere at optage "
                    + m + " end at afgive " + v + ".");
                s.laeg(med(m), navn + " er et ikke-metal. Ikke-metaller optager elektroner og bliver negative.");
                s.laeg(med(-v), navn + " optager kun " + m + ". Så har den 8 elektroner i yderste skal.");
                hvorfor = navn + " står i hovedgruppe " + ion.gruppe + " og har " + elektroner(v) + " i yderste skal. "
                    + "Den optager " + m + " og bliver " + rigtig + ".";
            }
        } else {
            var a = Math.abs(ion.q), fortegn = ion.q > 0 ? 1 : -1;
            [a + 1, a - 1, a + 2].forEach(function (x) {
                if (x >= 1 && x <= 4) s.laeg(med(fortegn * x), "Ladningen på en sammensat ion skal man kende. "
                    + stort(ion.navn) + " er " + rigtig + ".");
            });
            s.laeg(med(-ion.q), stort(ion.navn) + " er en " + (ion.q > 0 ? "positiv" : "negativ") + " ion.");
            hvorfor = rigtig + " står i oversigten over sammensatte ioner.";
        }
        return afslut(s, { tekst: rigtig, rigtig: true, forklaring: hvorfor });
    };

    /* Fane 3: hvad hedder saltet med det ukendte metal? Fejlene er dem,
       man laver, naar man laeser formlen forkert: romertallet som den
       samlede ladning, som det lille tal ved den negative ion (i SnO₂
       er 2 antallet af O²⁻, ikke tins ladning) eller som antallet af
       metalioner. Og romertallet glemt. */
    D.romertalValg = function (kat, an) {
        var f = D.forhold(kat, an), p = f.p, n = f.n, q = kat.q;
        var rigtig = D.saltnavn(kat, an);
        var s = samler(rigtig);
        var minus = NK.fortegn(n * an.q);
        function navn(r) { return kat.grund + "(" + ROMERTAL[r] + ")" + an.navn; }
        var regnskab = n + " " + D.ionTekst(an) + " giver " + minus + (p > 1 ? ", fordelt på " + p + " " + kat.formel : "")
            + ", så " + (p > 1 ? "hver " : "") + kat.formel + " er " + D.ionTekst(kat) + ".";

        if (p > 1) {
            s.laeg(navn(p * q), "Romertallet er ladningen på én " + kat.grund + "ion. " + p + " " + kat.formel
                + " har tilsammen " + NK.fortegn(p * q) + ", så hver er " + D.ionTekst(kat) + ".");
        }
        if (n !== q) {
            s.laeg(navn(n), "Det lille tal ved " + an.formel + " er antallet af " + D.ionTekst(an) + ", ikke ladningen. " + regnskab);
        }
        if (p > 1 && p !== q) {
            s.laeg(navn(p), "Det lille tal ved " + kat.formel + " er antallet af " + kat.grund + "ioner, ikke ladningen. " + regnskab);
        }
        s.laeg(kat.grund + an.navn, stort(kat.grund) + " kan have flere ladninger, så ladningen skal stå i navnet med romertal.");
        if (q < D.UKENDT_MAKS) s.laeg(navn(q + 1), regnskab);
        if (q > 1) s.laeg(navn(q - 1), regnskab);
        s.laeg(kat.navn + "ion" + an.navn, "Når ionen står i et saltnavn, mister den endelsen -ion.");

        var hvorfor = regnskab + " Romertallet (" + ROMERTAL[q] + ") viser ladningen.";
        return afslut(s, { tekst: rigtig, rigtig: true, forklaring: hvorfor });
    };

    /* Vandfanen: hvad kommer der ud i vandet? Kun hoejresiden - venstre-
       siden (saltet) staar i spoergsmaalet. */
    D.oploesValg = function (salt) {
        var kat = salt.kat, an = salt.an, p = salt.p, n = salt.n;
        var rigtig = D.oploesHoejre(salt);
        var s = samler(rigtig);
        var begge = p + " " + D.ionTekst(kat) + " og " + n + " " + D.ionTekst(an);

        function grp(ion, antal) {              /* (NO₃)₂²⁻(aq) */
            if (antal === 1) return D.ionLed(ion, 1);
            return D.formeldel(ion, antal) + NK.ladningHaevet(antal * ion.q) + "(aq)";
        }
        function atomer(ion, antal) {           /* S(aq) + 4 O(aq) */
            return D.sammensaetning(ion).map(function (a) { return led(a[1] * antal, a[0]) + "(aq)"; }).join(" + ");
        }

        if (p > 1 || n > 1) {
            s.laeg(grp(kat, p) + " + " + grp(an, n),
                "Ionerne svømmer rundt hver for sig. Det lille tal i formlen bliver til et tal foran ionen.");
        }
        var brud = an.sammensat ? an : (kat.sammensat ? kat : null);
        if (brud) {
            s.laeg(brud === an ? D.ionLed(kat, p) + " + " + atomer(an, n) : atomer(kat, p) + " + " + D.ionLed(an, n),
                "Den sammensatte ion går ikke i stykker i vand. " + D.ionTekst(brud) + " er stadig én ion, ligesom i krystallen.");
        }
        s.laeg(salt.formel + "(aq)", "Et salt er ikke et molekyle. Når det opløses, går ionerne fra hinanden.");
        if (p > 1 || n > 1) {
            s.laeg(D.ionLed(kat, 1) + " + " + D.ionLed(an, 1), "Tæl efter: formlen har " + begge + ", og de kommer alle ud i vandet.");
        }
        if (p !== n) s.laeg(D.ionLed(kat, n) + " + " + D.ionLed(an, p), "Tallene er byttet om. Formlen har " + begge + ".");
        var sam = D.sammensaetning(an);
        if (p === 1 && n === 1 && an.sammensat && sam.length > 1) {
            var foerste = sam[0][0] + (sam[0][1] > 1 ? NK.saenket(sam[0][1]) : "");
            var rest = an.formel.slice(foerste.length);
            s.laeg(kat.formel + foerste + NK.ladningHaevet(kat.q) + "(aq) + " + rest + NK.ladningHaevet(an.q) + "(aq)",
                "Delt det forkerte sted. " + an.formel + " hører sammen og er én ion: " + D.ionTekst(an) + ".");
        }
        s.laeg(led(p, kat.formel + NK.ladningHaevet(-kat.q)) + "(aq) + " + led(n, an.formel + NK.ladningHaevet(-an.q)) + "(aq)",
            "Fortegnene er byttet om: " + D.ionTekst(kat) + " er positiv, og " + D.ionTekst(an) + " er negativ.");

        var hvorfor = (p + n === 2 ? "Begge ioner" : "Alle " + (p + n) + " ioner") + " kommer ud i vandet hver for sig: " + begge + ".";
        return afslut(s, { tekst: rigtig, rigtig: true, forklaring: hvorfor });
    };

    /* Vandfanen, anden opgavetype: ionerne svoemmer i glasset - hvilket
       salt er det? k er antallet af formelenheder i glasset. */
    D.saltValg = function (salt, k) {
        var kat = salt.kat, an = salt.an;
        var s = samler(salt.formel);
        if (k > 1) {
            s.laeg(D.formel(kat, an, k * salt.p, k * salt.n),
                "Det er alle ionerne i glasset. Formlen viser det mindste forhold: " + salt.p + " : " + salt.n + ".");
        }
        D.formelValg(kat, an).forEach(function (v) { if (!v.rigtig) s.laeg(v.tekst, v.forklaring); });
        var hvorfor = "Der er " + salt.p + " " + D.ionTekst(kat) + " for hver " + (salt.n > 1 ? salt.n + " " : "") + D.ionTekst(an) + ".";
        return afslut(s, { tekst: salt.formel, rigtig: true, forklaring: hvorfor });
    };

    /* ----- Kemichaels praesentation af fanerne --------------------------
       Foerste gang en fane aabnes (js/laerer.js). Hoejst ca. 60 tegn pr.
       replik: hvor man er, hvad man goer, og en toer bemaerkning. Ingen
       teori. peg er den replik, han peger under. */
    D.INTRO = {
        "fane-bord": { peg: 1, linjer: [
            "Saltbyggeren. Her bygger man salte af ioner.",
            "Træk ionerne ned på bordet, til lynlåsen lukker.",
            "Går plus og minus op, er det et salt. Resten er detaljer."
        ] },
        "fane-vand": { peg: 1, linjer: [
            "Vandet. Her går saltene i opløsning.",
            "Vælg et salt til højre, og læg det i glasset.",
            "Glasset er vasket op. Denne gang."
        ] },
        "fane-ukendt": { peg: 2, linjer: [
            "Ukendte ioner. Formlen ved mere, end man tror.",
            "Tryk Start opgave, så viser jeg, hvor du begynder.",
            "Plakaterne på væggen er gratis at kigge på."
        ] }
    };
}());
