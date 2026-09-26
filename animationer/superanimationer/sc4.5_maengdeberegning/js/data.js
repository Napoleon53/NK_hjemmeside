/* =====================================================================
   data.js - stofferne, reaktionerne, opgaverne og Kemichaels replikker

   Alt, der kan staa som data, staar her. Molarmasserne regnes af
   atommasserne i hundrededele (heltal), saa 2 · 1,01 + 16,00 giver
   praecis 18,02. Svarene regnes af modellen; intet facit er skrevet i
   haanden. Opgaverne paa fane 2 er de fem fra den gamle c4.5 (kul,
   methan, Haber-Bosch og propan; magnesium og saltsyre er flyttet til
   fane 3) plus fotosyntesen, hvor produktet er kendt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atommasserne i hundrededele ---------------------------------------
       IUPAC 2021 rundet til to decimaler, som i sc4.1 (S 32,06). */
    D.ATOMMASSE = { H: 101, C: 1201, N: 1401, O: 1600, Mg: 2431, Al: 2698, S: 3206, Cl: 3545, Fe: 5585 };

    /* Formlen skilt ad: "Fe2O3" -> { Fe: 2, O: 3 } */
    D.atomer = function (f) {
        var ud = {}, m, re = /([A-Z][a-z]?)(\d*)/g;
        while ((m = re.exec(f)) !== null) {
            if (!m[1]) break;
            ud[m[1]] = (ud[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
        }
        return ud;
    };

    /* ----- Stofferne ------------------------------------------------------------
       f: formlen med almindelige tal. farve: posens og pulverets farve.
       slags: fast, vaeske eller gas. Farveloese gasser faar en lys, klar pose. */
    var S = {
        Fe:      { f: "Fe", navn: "jern", farve: "#6f737b", slags: "fast" },
        S:       { f: "S", navn: "svovl", farve: "#e3c93a", slags: "fast" },
        FeS:     { f: "FeS", navn: "jernsulfid", farve: "#3e3d3b", slags: "fast" },
        Mg:      { f: "Mg", navn: "magnesium", farve: "#b4b9c1", slags: "fast" },
        MgO:     { f: "MgO", navn: "magnesiumoxid", farve: "#f1f1ec", slags: "fast" },
        Al:      { f: "Al", navn: "aluminium", farve: "#c9cdd4", slags: "fast" },
        Al2O3:   { f: "Al2O3", navn: "aluminiumoxid", farve: "#f3f2ee", slags: "fast" },
        Fe2O3:   { f: "Fe2O3", navn: "jern(III)oxid", farve: "#9a3b22", slags: "fast" },
        C:       { f: "C", navn: "carbon", farve: "#2e2f34", slags: "fast" },
        O2:      { f: "O2", navn: "dioxygen", farve: "#dfe8f0", slags: "gas" },
        CO2:     { f: "CO2", navn: "carbondioxid", farve: "#dfe8f0", slags: "gas" },
        H2O:     { f: "H2O", navn: "vand", farve: "#6fb3e6", slags: "vaeske" },
        CH4:     { f: "CH4", navn: "methan", farve: "#dfe8f0", slags: "gas" },
        N2:      { f: "N2", navn: "dinitrogen", farve: "#dfe8f0", slags: "gas" },
        H2:      { f: "H2", navn: "dihydrogen", farve: "#dfe8f0", slags: "gas" },
        NH3:     { f: "NH3", navn: "ammoniak", farve: "#dfe8f0", slags: "gas" },
        C3H8:    { f: "C3H8", navn: "propan", farve: "#dfe8f0", slags: "gas" },
        C6H12O6: { f: "C6H12O6", navn: "glucose", farve: "#f5f1e3", slags: "fast" },
        HCl:     { f: "HCl", navn: "hydrogenchlorid", farve: "#dfe8f0", slags: "gas" },
        MgCl2:   { f: "MgCl2", navn: "magnesiumchlorid", farve: "#eeede8", slags: "fast" },
        Cl2:     { f: "Cl2", navn: "dichlor", farve: "#cfd96a", slags: "gas" },
        AlCl3:   { f: "AlCl3", navn: "aluminiumchlorid", farve: "#efeee4", slags: "fast" }
    };

    Object.keys(S).forEach(function (id) {
        var st = S[id];
        st.id = id;
        st.formel = NK.formel(st.f);
        st.antal = D.atomer(st.f);
        /* Molarmassen i hundrededele og som tal */
        st.M = 0;
        Object.keys(st.antal).forEach(function (g) { st.M += D.ATOMMASSE[g] * st.antal[g]; });
        st.Mv = st.M / 100;
    });
    D.STOFFER = S;
    D.stof = function (id) { return S[id]; };

    /* Molarmassen som paen beregning: "(12,01 + 2 · 16,00) g/mol". Et enkelt
       grundstof uden tal skrives bare "55,85 g/mol". */
    D.molarLed = function (st) {
        var led = Object.keys(st.antal).map(function (g) {
            var a = st.antal[g], m = NK.komma(D.ATOMMASSE[g]);
            return a > 1 ? a + " · " + m : m;
        });
        if (led.length === 1 && st.antal[Object.keys(st.antal)[0]] === 1) return led[0] + " g/mol";
        return "(" + led.join(" + ") + ") g/mol";
    };

    /* ----- Reaktionerne -----------------------------------------------------------
       venstre og hoejre: [stof, koefficient]. */
    var R = [
        { id: "jernsulfid", navn: "Jern og svovl", venstre: [["Fe", 1], ["S", 1]], hoejre: [["FeS", 1]] },
        { id: "magnesiumoxid", navn: "Magnesium brænder", venstre: [["Mg", 2], ["O2", 1]], hoejre: [["MgO", 2]] },
        { id: "aluminiumoxid", navn: "Aluminium brænder", venstre: [["Al", 4], ["O2", 3]], hoejre: [["Al2O3", 2]] },
        { id: "jernoxid", navn: "Jern af jernoxid", venstre: [["Fe2O3", 2], ["C", 3]], hoejre: [["Fe", 4], ["CO2", 3]] },
        { id: "kul", navn: "Kul brænder", venstre: [["C", 1], ["O2", 1]], hoejre: [["CO2", 1]] },
        { id: "ammoniak", navn: "Haber-Bosch", venstre: [["N2", 1], ["H2", 3]], hoejre: [["NH3", 2]] },
        { id: "methan", navn: "Methan brænder", venstre: [["CH4", 1], ["O2", 2]], hoejre: [["CO2", 1], ["H2O", 2]] },
        { id: "propan", navn: "Propan brænder", venstre: [["C3H8", 1], ["O2", 5]], hoejre: [["CO2", 3], ["H2O", 4]] },
        { id: "fotosyntese", navn: "Fotosyntese", venstre: [["CO2", 6], ["H2O", 6]], hoejre: [["C6H12O6", 1], ["O2", 6]] },
        { id: "saltsyre", navn: "Magnesium og saltsyre", venstre: [["Mg", 1], ["HCl", 2]], hoejre: [["MgCl2", 1], ["H2", 1]] },
        { id: "knaldgas", navn: "Knaldgas", venstre: [["H2", 2], ["O2", 1]], hoejre: [["H2O", 2]] },
        { id: "aluminiumchlorid", navn: "Aluminium og chlor", venstre: [["Al", 2], ["Cl2", 3]], hoejre: [["AlCl3", 2]] }
    ];
    D.REAKTIONER = R.map(function (r) {
        var led = [];
        r.venstre.forEach(function (x) { led.push({ s: x[0], k: x[1], side: 0 }); });
        r.hoejre.forEach(function (x) { led.push({ s: x[0], k: x[1], side: 1 }); });
        return { id: r.id, navn: r.navn, led: led };
    });
    D.reaktion = function (id) {
        for (var i = 0; i < D.REAKTIONER.length; i++) if (D.REAKTIONER[i].id === id) return D.REAKTIONER[i];
        return null;
    };
    /* Ledets plads i reaktionen for et stof */
    D.plads = function (r, s) {
        for (var j = 0; j < r.led.length; j++) if (r.led[j].s === s) return j;
        return -1;
    };

    /* Skemaet som tekst: "4 Al + 3 O₂ ⟶ 2 Al₂O₃". En koefficient paa 1 skrives ikke. */
    D.skema = function (r) {
        var v = [], h = [];
        r.led.forEach(function (l) {
            (l.side === 0 ? v : h).push((l.k > 1 ? l.k + " " : "") + D.stof(l.s).formel);
        });
        return v.join(" + ") + " ⟶ " + h.join(" + ");
    };

    /* Er koefficienterne k afstemt? Giver det foerste grundstof, der ikke passer. */
    D.afstemt = function (r, k) {
        var sum = [{}, {}];
        r.led.forEach(function (l, i) {
            var st = D.stof(l.s);
            Object.keys(st.antal).forEach(function (g) { sum[l.side][g] = (sum[l.side][g] || 0) + st.antal[g] * k[i]; });
        });
        var alle = [];
        [0, 1].forEach(function (sd) { Object.keys(sum[sd]).forEach(function (g) { if (alle.indexOf(g) < 0) alle.push(g); }); });
        /* Raekkefoelgen, man normalt afstemmer i: metallerne, C, N, S, H og O til sidst */
        var orden = ["Mg", "Al", "Fe", "Cl", "C", "N", "S", "H", "O"];
        alle.sort(function (a, b) { return orden.indexOf(a) - orden.indexOf(b); });
        for (var i = 0; i < alle.length; i++) {
            var g = alle[i];
            if ((sum[0][g] || 0) !== (sum[1][g] || 0)) return { ok: false, grundstof: g, v: sum[0][g] || 0, h: sum[1][g] || 0 };
        }
        return { ok: true };
    };

    /* Hintet, naar skemaet skal afstemmes: hvor man begynder */
    D.AFSTEM_HINT = {
        ammoniak: "Der er 2 N i N₂, så der skal 2 NH₃. Tæl så H.",
        methan: "Der er 4 H i CH₄, så der skal 2 H₂O. Tæl så O på højre side.",
        propan: "Start med C: 3 C giver 3 CO₂. Så H: 8 H giver 4 H₂O. Til sidst O.",
        fotosyntese: "Der er 6 C i glucose, så der skal 6 CO₂. Tæl så H og til sidst O."
    };

    /* ----- Tal ------------------------------------------------------------------
       Masser og molarmasser med to decimaler, stofmaengder med tre betydende
       cifre (c4.10 ejer betydende cifre; et svar med flere cifre godkendes). */
    D.tekstMasse = function (g) { return NK.tal2(g); };
    D.tekstMolar = function (st) { return NK.komma(st.M); };
    D.tekstN = function (n) { return NK.betydende(n, 3); };

    /* ======================================================================
       FANE 1: VEJEN
       Et kendt stof paa vaegten til venstre, et soegt stof til hoejre. Det
       andet stof er i overskud. Kun faste stoffer, saa begge kan vejes.
       n: de stofmaengder, opgaven kan starte med. Masserne gaar op i hele
       hundrededele (tjekkes af selvtesten).
       ====================================================================== */
    D.VEJ = [
        { id: "jernsulfid", r: "jernsulfid", kendt: "Fe", soegt: "FeS", n: [1, 2, 3],
          tekst: "Jern varmes med rigeligt svovl. Hvor meget jernsulfid dannes der?" },
        { id: "magnesiumoxid", r: "magnesiumoxid", kendt: "Mg", soegt: "MgO", n: [1, 2, 3],
          tekst: "Magnesium brænder i luft. Hvor meget magnesiumoxid dannes der?" },
        { id: "aluminiumoxid", r: "aluminiumoxid", kendt: "Al", soegt: "Al2O3", n: [2, 3, 4],
          tekst: "Aluminiumpulver brænder i luft. Hvor meget aluminiumoxid dannes der?" },
        { id: "jernoxid", r: "jernoxid", kendt: "Fe2O3", soegt: "Fe", n: [0.5, 1, 1.5, 2],
          tekst: "Jernoxid varmes med rigeligt kul. Hvor meget jern dannes der?" }
    ];

    /* ======================================================================
       FANE 2: SKEMAET
       givet: stoffet med den kendte masse. spoerg: felterne i den
       raekkefoelge, de laases op i (som den gamle c4.5): "afstem", og
       [stof, raekke] med raekkerne "M", "n" og "m". massebevarelse: alle
       masser findes, og skaalvaegten viser summerne.
       ====================================================================== */
    D.SKEMA = [
        { id: "kul", r: "kul", givet: "C", n: [2, 3, 4, 5, 6, 8],
          tekst: "Kul brænder i rigeligt oxygen. Hvor meget CO₂ dannes der? O₂ regner vi ikke på.",
          spoerg: [["C", "M"], ["CO2", "M"], ["C", "n"], ["CO2", "n"], ["CO2", "m"]] },
        { id: "ammoniak", r: "ammoniak", givet: "N2", n: [0.5, 1, 1.5, 2], afstem: true,
          tekst: "Ammoniak laves af N₂ og rigeligt H₂. Afstem skemaet, og find massen af NH₃.",
          spoerg: ["afstem", ["N2", "M"], ["NH3", "M"], ["N2", "n"], ["NH3", "n"], ["NH3", "m"]] },
        { id: "methan", r: "methan", givet: "CH4", n: [1, 2, 3], afstem: true, massebevarelse: true,
          tekst: "Methan brænder fuldstændigt. Afstem skemaet, og udfyld alle felterne.",
          spoerg: ["afstem", ["CH4", "M"], ["O2", "M"], ["CO2", "M"], ["H2O", "M"],
                   ["CH4", "n"], ["O2", "n"], ["CO2", "n"], ["H2O", "n"], ["O2", "m"], ["CO2", "m"], ["H2O", "m"]] },
        { id: "propan", r: "propan", givet: "C3H8", n: [1, 2, 3], afstem: true, massebevarelse: true,
          tekst: "Flaskegas er propan. Afstem skemaet, og udfyld alle felterne.",
          spoerg: ["afstem", ["C3H8", "M"], ["O2", "M"], ["CO2", "M"], ["H2O", "M"],
                   ["C3H8", "n"], ["O2", "n"], ["CO2", "n"], ["H2O", "n"], ["O2", "m"], ["CO2", "m"], ["H2O", "m"]] },
        { id: "fotosyntese", r: "fotosyntese", givet: "C6H12O6", n: [0.5, 1, 1.5, 2], afstem: true,
          tekst: "En plante danner glucose. Hvor meget CO₂ skal den optage? Afstem skemaet først.",
          spoerg: ["afstem", ["C6H12O6", "M"], ["CO2", "M"], ["C6H12O6", "n"], ["CO2", "n"], ["CO2", "m"]] }
    ];

    /* ======================================================================
       FANE 3: BEGRAENSENDE MAENGDE
       a og b: de to reaktanter med kendt masse. p: produktet, der spoerges
       om. std: tallene foerste gang: det stof, der slipper op (L), hvor
       mange hele saet der reagerer, og hvor mange mol af det andet stof,
       der er til overs. "Nye tal" traekker nye inden for samme rammer.
       ====================================================================== */
    D.BEGR = [
        { id: "jernsulfid", r: "jernsulfid", a: "Fe", b: "S", p: "FeS", std: { L: "S", saet: 2, rest: 1 },
          tekst: "Jern og svovl varmes sammen. Hvor meget jernsulfid dannes der?" },
        { id: "saltsyre", r: "saltsyre", a: "Mg", b: "HCl", p: "H2", std: { L: "HCl", saet: 1, rest: 0.5 },
          tekst: "Magnesium kommes i saltsyre. Hvor meget H₂ dannes der?" },
        { id: "knaldgas", r: "knaldgas", a: "H2", b: "O2", p: "H2O", std: { L: "H2", saet: 1, rest: 0.5 },
          tekst: "Knaldgas eksploderer. Hvor meget vand dannes der?" },
        { id: "ammoniak", r: "ammoniak", a: "N2", b: "H2", p: "NH3", std: { L: "H2", saet: 1, rest: 0.5 },
          tekst: "Ammoniak laves af N₂ og H₂. Hvor meget NH₃ kan der laves?" },
        { id: "methan", r: "methan", a: "CH4", b: "O2", p: "CO2", std: { L: "O2", saet: 1, rest: 1 },
          tekst: "Methan brænder i en lukket beholder. Hvor meget CO₂ dannes der?" },
        { id: "aluminiumchlorid", r: "aluminiumchlorid", a: "Al", b: "Cl2", p: "AlCl3", std: { L: "Cl2", saet: 1, rest: 1 },
          tekst: "Aluminium reagerer med chlor. Hvor meget aluminiumchlorid dannes der?" }
    ];
    /* Hoejst saa mange poser af hvert stof paa bakken */
    D.BEGR_MAKS = 6;

    /* ======================================================================
       LINJEN I OPGAVEKORTET OG KEMICHAEL VED KATEDERET
       Kortet siger, hvor man er (INTRO), naeste skridt, fejl og ros
       (ROS, ROS_OPGAVE, FAERDIG). Kemichael blander sig ikke: han siger kun
       noget, naar eleven beder om et hint, og naar han sendes ud eller
       hentes (UD_LINJE, IND_LINJE) eller klikkes paa (KAFFE, PRIK_SIDST).
       Hoejst ca. 60 tegn pr. saetning, ingen teori.
       ====================================================================== */
    D.INTRO = {
        vej: "Fra gram til gram går vejen over mol.",
        skema: "Hele skemaet, som det skal stå i en rapport.",
        begr: "To kendte masser. Den, der slipper op først, bestemmer."
    };

    D.FAERDIG = {
        vej: "Alle fire. Gram, mol, mol, gram: det er hele vejen.",
        skema: "Alle fem opgaver er løst. Skemaet sidder.",
        begr: "Alle seks. Noget slipper altid op først."
    };

    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst. Pænt skrevet."];

    /* Naar han sendes ud, og naar han hentes igen */
    D.UD_LINJE = "Fint. Jeg er på lærerværelset.";
    D.IND_LINJE = "Tilbage. Kaffen derude var ikke bedre.";

    /* Klik paa koppen: han drikker og siger noget om kaffen */
    D.KAFFE = [
        "Kold. Som altid.",
        "Den er fra i morges. Tror jeg.",
        "Kaffen er min. Mængdeberegningen er din.",
        "Nogen har fortyndet den.",
        "Fjerde kop i dag. Den regner jeg ikke på.",
        "Stadig kold. Men det er min."
    ];
    /* Klik paa ham, naar prik-puljerne er brugt op */
    D.PRIK_SIDST = "Jeg sidder her bare. Regn du.";

    NK.Data = D;
}());
