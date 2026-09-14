/* =====================================================================
   data.js - ionerne, draabeflaskerne, skemaet og kemien

   Alt, der har med kemien at goere, staar her. Resten af animationen
   regner ud fra disse tabeller: formlerne, reaktionsskemaerne,
   hvilke felter der giver bundfald, og hvor mange ioner der er i
   luppen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};
    NK.Data = D;

    /* ----- Ionerne ---------------------------------------------------- */
    /* r er radius i luppen. Farverne er de samme som i den gamle
       animation, saa ionerne kan genkendes. */
    D.IONER = {
        Ag:  { id: "Ag",  tegn: "Ag",  q:  1, farve: "#dfe3e8", r: 12 },
        Ba:  { id: "Ba",  tegn: "Ba",  q:  2, farve: "#4db6ac", r: 13 },
        Cu:  { id: "Cu",  tegn: "Cu",  q:  2, farve: "#5aa9ec", r: 11 },
        Na:  { id: "Na",  tegn: "Na",  q:  1, farve: "#c38ad0", r: 11 },
        NO3: { id: "NO3", tegn: "NO₃", q: -1, farve: "#ff8a65", r: 14, sammensat: true },
        Cl:  { id: "Cl",  tegn: "Cl",  q: -1, farve: "#aed581", r: 13 },
        SO4: { id: "SO4", tegn: "SO₄", q: -2, farve: "#ffd54f", r: 15, sammensat: true },
        CO3: { id: "CO3", tegn: "CO₃", q: -2, farve: "#a9bac2", r: 14, sammensat: true },
        PO4: { id: "PO4", tegn: "PO₄", q: -3, farve: "#ff7a50", r: 15, sammensat: true }
    };
    D.ION_ORDEN = ["Ag", "Ba", "Cu", "Na", "NO3", "Cl", "SO4", "CO3", "PO4"];

    /* ----- Draabeflaskerne -------------------------------------------- */
    /* Hver opløsning er ét salt: p kationer og n anioner pr. formelenhed.
       farve er opløsningens farve (kun CuSO₄ er farvet). */
    D.OPLOESNINGER = [
        { id: "AgNO3",  kat: "Ag", p: 1, an: "NO3", n: 1, navn: "sølvnitrat" },
        { id: "BaCl2",  kat: "Ba", p: 1, an: "Cl",  n: 2, navn: "bariumchlorid" },
        { id: "CuSO4",  kat: "Cu", p: 1, an: "SO4", n: 1, navn: "kobber(II)sulfat", farve: [60, 140, 225] },
        { id: "NaCl",   kat: "Na", p: 1, an: "Cl",  n: 1, navn: "natriumchlorid" },
        { id: "Na2SO4", kat: "Na", p: 2, an: "SO4", n: 1, navn: "natriumsulfat" },
        { id: "Na2CO3", kat: "Na", p: 2, an: "CO3", n: 1, navn: "natriumcarbonat" },
        { id: "Na3PO4", kat: "Na", p: 3, an: "PO4", n: 1, navn: "natriumphosphat" }
    ];

    /* Skemaet paa folien: én opløsning over hver søjle og én ud for
       hver række. Et felt er søjlens opløsning plus rækkens. */
    D.SOEJLER = ["AgNO3", "BaCl2", "CuSO4"];
    D.RAEKKER = ["NaCl", "Na2SO4", "Na2CO3", "Na3PO4"];

    /* ----- Bundfaldene ------------------------------------------------ */
    /* farve er bundfaldets farve. taethed under 1 giver et tyndere
       bundfald (Ag₂SO₄ er det mindst tungtopløselige af dem). */
    D.BUNDFALD = {
        "Ag-Cl":  { farve: [242, 242, 236], ord: "hvidt" },
        "Ag-SO4": { farve: [236, 238, 232], ord: "hvidt", taethed: 0.6 },
        "Ag-CO3": { farve: [238, 224, 168], ord: "lysegult" },
        "Ag-PO4": { farve: [240, 204, 62],  ord: "gult" },
        "Ba-SO4": { farve: [246, 246, 242], ord: "hvidt" },
        "Ba-CO3": { farve: [242, 242, 238], ord: "hvidt" },
        "Ba-PO4": { farve: [240, 240, 234], ord: "hvidt" },
        "Cu-CO3": { farve: [104, 190, 172], ord: "blågrønt" },
        "Cu-PO4": { farve: [128, 192, 234], ord: "lyseblåt" }
    };

    /* Samme huskeregel som i sc2.2: nitrater og alle salte med natrium,
       kalium og ammonium er letopløselige. Af resten er AgCl, BaSO₄,
       Ag₂SO₄ og alle carbonater og phosphater tungtopløselige. */
    D.tungtoploeseligt = function (kat, an) {
        if (an === "NO3" || kat === "Na" || kat === "K" || kat === "NH4") return false;
        if (an === "Cl") return kat === "Ag";
        if (an === "SO4") return kat === "Ba" || kat === "Ca" || kat === "Ag";
        return an === "CO3" || an === "PO4";
    };

    /* ----- Formler og tekst --------------------------------------------- */
    D.stort = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    D.ionTekst = function (id) {
        var ion = D.IONER[id];
        return ion.tegn + NK.ladningHaevet(ion.q);
    };

    /* Formlen for p af kationen og n af anionen: Ba₃(PO₄)₂ */
    D.formel = function (kat, p, an, n) {
        var a = D.IONER[an];
        var venstre = D.IONER[kat].tegn + (p > 1 ? NK.saenket(p) : "");
        var hoejre = a.tegn;
        if (n > 1) hoejre = (a.sammensat ? "(" + a.tegn + ")" : a.tegn) + NK.saenket(n);
        return venstre + hoejre;
    };

    /* De mindste hele tal, der faar ladningerne til at gaa op. */
    D.koefficienter = function (kat, an) {
        var qk = D.IONER[kat].q, qa = -D.IONER[an].q;
        var g = NK.gcd(qk, qa);
        return { kat: qa / g, an: qk / g };
    };

    D.bundfaldFormel = function (kat, an) {
        var k = D.koefficienter(kat, an);
        return D.formel(kat, k.kat, an, k.an);
    };

    /* 3 Ag⁺(aq) + PO₄³⁻(aq) → Ag₃PO₄(s) */
    D.reaktionsskema = function (kat, an) {
        var k = D.koefficienter(kat, an);
        function led(tal, id) { return (tal > 1 ? tal + " " : "") + D.ionTekst(id) + "(aq)"; }
        return led(k.kat, kat) + " + " + led(k.an, an) + " → " + D.bundfaldFormel(kat, an) + "(s)";
    };

    var OPL = {};
    D.OPLOESNINGER.forEach(function (o, i) {
        o.nr = i;
        o.formel = D.formel(o.kat, o.p, o.an, o.n);
        OPL[o.id] = o;
    });
    D.opl = function (id) { return OPL[id]; };

    /* ----- Felterne ------------------------------------------------------ */
    D.FELTER = [];
    D.RAEKKER.forEach(function (raekke, r) {
        D.SOEJLER.forEach(function (soejle, c) {
            D.FELTER.push({ nr: D.FELTER.length, c: c, r: r, soejle: soejle, raekke: raekke });
        });
    });

    D.feltNavn = function (felt) {
        return D.opl(felt.soejle).formel + " + " + D.opl(felt.raekke).formel;
    };

    /* Hvad sker der i en draabe? draaber: { AgNO3: 1, NaCl: 1 }
       Svaret er opløsningerne, ionerne og de bundfald, der dannes. */
    D.analyser = function (draaber) {
        var opl = [], kat = [], an = [], bundfald = [];
        D.OPLOESNINGER.forEach(function (o) {
            if (!(draaber[o.id] > 0)) return;
            opl.push(o.id);
            if (kat.indexOf(o.kat) < 0) kat.push(o.kat);
            if (an.indexOf(o.an) < 0) an.push(o.an);
        });
        kat.forEach(function (k) {
            an.forEach(function (a) {
                if (!D.tungtoploeseligt(k, a)) return;
                var noegle = k + "-" + a;
                bundfald.push({ kat: k, an: a, noegle: noegle, info: D.BUNDFALD[noegle] });
            });
        });
        return { opl: opl, kationer: kat, anioner: an, bundfald: bundfald };
    };

    /* Er feltet udfoert efter skemaet: mindst én draabe af søjlens og
       rækkens opløsning, og intet andet? */
    D.udfoert = function (felt, draaber) {
        for (var id in draaber) {
            if (draaber[id] > 0 && id !== felt.soejle && id !== felt.raekke) return false;
        }
        return draaber[felt.soejle] > 0 && draaber[felt.raekke] > 0;
    };

    D.fremmede = function (felt, draaber) {
        var ud = [];
        D.OPLOESNINGER.forEach(function (o) {
            if (draaber[o.id] > 0 && o.id !== felt.soejle && o.id !== felt.raekke) ud.push(o.id);
        });
        return ud;
    };

    /* Det, feltet giver, naar det er udfoert rigtigt. */
    D.forventet = function (felt) {
        var d = {};
        d[felt.soejle] = 1;
        d[felt.raekke] = 1;
        return D.analyser(d);
    };
}());
