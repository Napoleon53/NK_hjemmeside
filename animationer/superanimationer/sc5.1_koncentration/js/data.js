/* =====================================================================
   data.js - stofferne, opgaverne og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne,
   stofferne, de tre fanes opgaver med tallene og det, Kemichael siger.
   Kemien og tallene regnes i kemi.js; tegningen kender kun resultatet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atommasserne i hundrededele (som sc4.1 og sc4.5) ------------------ */
    D.ATOMMASSE = { H: 101, C: 1201, N: 1401, O: 1600, Na: 2299, S: 3206, Cl: 3545, K: 3910, Ca: 4008, Mn: 5494, Cu: 6355 };

    /* Formlen skilt ad: "Na2CO3" -> { Na: 2, C: 1, O: 3 } */
    D.atomer = function (f) {
        var ud = {}, m, re = /([A-Z][a-z]?)(\d*)/g;
        while ((m = re.exec(f)) !== null) {
            if (!m[1]) break;
            ud[m[1]] = (ud[m[1]] || 0) + (m[2] ? parseInt(m[2], 10) : 1);
        }
        return ud;
    };

    /* ----- Stofferne ---------------------------------------------------------------
       pulver: farven paa krukken og i vejebaaden. opl: opløsningens farve,
       null er farveløs. cFuld: koncentrationen, hvor farven er fuld.
       ioner: det, luppen viser, én prik pr. D.PRIK mol/L af hver. */
    var S = {
        CuSO4: { navn: "kobber(II)sulfat", pulver: "#3f8fd8", opl: "#1f76c9", cFuld: 1.0,
                 ioner: [{ t: "Cu²⁺", farve: "#2f86d6", r: 7 }, { t: "SO₄²⁻", farve: "#e9e3b8", r: 10, kort: "SO₄" }] },
        NaCl: { navn: "natriumchlorid", pulver: "#f4f5f7", opl: null, cFuld: 1 },
        KCl: { navn: "kaliumchlorid", pulver: "#eef0f3", opl: null, cFuld: 1 },
        KMnO4: { navn: "kaliumpermanganat", pulver: "#4a2150", opl: "#8e1f8e", cFuld: 0.04 },
        Na2CO3: { navn: "natriumcarbonat", pulver: "#fbfbfb", opl: null, cFuld: 1 }
    };
    Object.keys(S).forEach(function (id) {
        var st = S[id];
        st.id = id;
        st.formel = NK.formel(id);
        st.antal = D.atomer(id);
        st.M = 0;                       /* i hundrededele */
        Object.keys(st.antal).forEach(function (g) { st.M += D.ATOMMASSE[g] * st.antal[g]; });
        st.Mv = st.M / 100;             /* i g/mol */
    });
    D.STOFFER = S;
    D.stof = function (id) { return S[id]; };

    /* Molarmassen som paen beregning: "(22,99 + 35,45) g/mol" */
    D.molarLed = function (st) {
        var led = Object.keys(st.antal).map(function (g) {
            var a = st.antal[g], m = NK.komma(D.ATOMMASSE[g]);
            return a > 1 ? a + " · " + m : m;
        });
        if (led.length === 1 && st.antal[Object.keys(st.antal)[0]] === 1) return led[0] + " g/mol";
        return "(" + led.join(" + ") + ") g/mol";
    };

    /* Én prik i luppen er 0,05 mol/L af hver ion */
    D.PRIK = 0.05;

    /* Opløseligheden af CuSO₄ ved 20 °C, regnet pr. liter opløsning
       (ca. 20 g pr. 100 g vand). Over den bliver resten liggende. */
    D.C_MAKS = 1.2;

    /* ----- Fane 1: karret ------------------------------------------------------------
       start: n i mol og V i mL, naar opgaven begynder.
       valg: et gaet, der kommer foer eleven proever (det rigtige har ok).
       maal: det, karret skal vise (c i M og/eller V i mL).
       svar: det, Kemichael siger ved Vis svaret, og handlingerne, karret
       saa goer fra start: ["stof", skefulde] eller ["vand", mL]. */
    D.SKEFULD = 0.10;         /* mol pr. skefuld */
    D.TRYK = 50;              /* mL pr. tryk paa en hane */

    D.KAR = [
        { id: "stof", titel: "Mere stof", tekst: "Gør opløsningen 0,40 M.",
          start: { n: 0, V: 500 }, maal: { c: 0.40 },
          linje: "Træk en skefuld kobber(II)sulfat fra krukken ned i karret.",
          hint: "Hver skefuld er 0,10 mol, og karret har 0,50 L. Hvor mange mol giver 0,40 M?",
          svar: "n = c · V = 0,40 M · 0,50 L = 0,20 mol. Det er to skefulde.",
          goer: [["stof", 1], ["stof", 1]],
          efter: "c = 0,20 mol / 0,50 L = 0,40 M. Mere stof giver en højere koncentration." },
        { id: "vand", titel: "Mere vand", tekst: "Du hælder vand i, til der er dobbelt så meget.",
          start: { n: 0.20, V: 400 }, maal: { V: 800, c: 0.25 },
          valg: { spm: "Hvad sker der med koncentrationen?",
                  hint: "c = n / V. Stofmængden er den samme. Hvad sker der med en brøk, når nævneren bliver dobbelt så stor?",
                  svar: [{ t: "Den bliver halvt så stor", ok: true },
                         { t: "Den bliver dobbelt så stor", forkl: "Vandet gør ikke stoffet mere. Den samme stofmængde fordeler sig i dobbelt så meget vand." },
                         { t: "Den er den samme", forkl: "Stofmængden er den samme, men den fordeler sig i dobbelt så meget vand." }] },
          linje: "Prøv det: hæld vand i fra hanen, til karret viser 0,80 L.",
          hint: "Hold musen nede på den blå knap på hanen. Hvert tryk giver 0,05 L.",
          svar: "Hanen giver vand, til karret viser 0,80 L.",
          goer: [["vand", 400]],
          efter: "c = 0,20 mol / 0,80 L = 0,25 M. Dobbelt så meget vand giver det halve." },
        { id: "tap", titel: "Tap ud", tekst: "Du tapper halvdelen af opløsningen ud.",
          start: { n: 0.30, V: 600 }, maal: { V: 300, c: 0.50 },
          valg: { spm: "Hvad sker der med koncentrationen i karret?",
                  hint: "Det, der løber ud, er den samme opløsning, som bliver tilbage. Der forsvinder både stof og vand.",
                  svar: [{ t: "Den er den samme", ok: true },
                         { t: "Den bliver halvt så stor", forkl: "Der forsvinder stof, men der forsvinder også lige så meget vand." },
                         { t: "Den bliver dobbelt så stor", forkl: "Der kommer hverken stof eller vand til. Det, der er tilbage, er den samme opløsning." }] },
          linje: "Prøv det: tap ud ved den røde hane forneden, til karret viser 0,30 L.",
          hint: "Hold musen nede på den røde hane. Hvert tryk tapper 0,05 L.",
          svar: "Hanen tapper ud, til karret viser 0,30 L.",
          goer: [["tap", 300]],
          efter: "c = 0,15 mol / 0,30 L = 0,50 M. Både n og V er halveret, så c er den samme." },
        { id: "mere", titel: "Mere af det samme", tekst: "Lav 0,80 L af den samme opløsning. Koncentrationen skal stadig være 0,25 M.",
          start: { n: 0.10, V: 400 }, maal: { V: 800, c: 0.25 },
          linje: "Der skal både vand og stof i.",
          hint: "Dobbelt så meget opløsning med den samme koncentration kræver dobbelt så meget stof.",
          svar: "n = c · V = 0,25 M · 0,80 L = 0,20 mol. Der mangler 0,40 L vand og én skefuld.",
          goer: [["vand", 400], ["stof", 1]],
          efter: "c = 0,20 mol / 0,80 L = 0,25 M. Dobbelt så meget stof i dobbelt så meget vand giver den samme koncentration." },
        { id: "ny", titel: "Lav en opløsning", tekst: "Lav 0,60 L af en 0,50 M opløsning.",
          start: { n: 0, V: 0 }, maal: { V: 600, c: 0.50 },
          linje: "Karret er tomt. Hæld vand i, og kom stof i. Rækkefølgen er lige meget.",
          hint: "Regn først stofmængden ud: n = c · V.",
          svar: "n = c · V = 0,50 M · 0,60 L = 0,30 mol. Det er tre skefulde i 0,60 L.",
          goer: [["vand", 600], ["stof", 1], ["stof", 1], ["stof", 1]],
          efter: "c = 0,30 mol / 0,60 L = 0,50 M. Sådan laves en opløsning: n = c · V i det rigtige rumfang." }
    ];

    /* ----- Fane 2: maalekolben ----------------------------------------------------------
       trin: de regnetrin, eleven udfylder, i raekkefoelge.
         c    c = n / V          n_cV  n = c · V        V  V = n / c
         M    molarmassen        n_mM  n = m / M        m  m = n · M
       tal: de tal, opgaven starter med (foerste gang), og varianter,
       som "Nye tal" traekker blandt. En variant kan skifte stoffet.
       V staar altid i mL i tallene; enhed er, hvordan opgaven skriver det. */
    D.KOLBE = [
        { id: "c", titel: "Find koncentrationen", stof: "NaCl", trin: ["c"], enhed: "L",
          tekst: "{n} mol {stof} er opløst i lidt vand i en målekolbe. Der fyldes op til {V}.",
          tal: [{ n: 0.150, V: 500 }, { n: 0.200, V: 250 }, { n: 0.0500, V: 100 }, { n: 0.600, V: 1000 }] },
        { id: "n", titel: "Find stofmængden", stof: "CuSO4", trin: ["n_cV"], enhed: "L",
          tekst: "Du skal lave {V} {c} M {stof}. Hvor mange mol skal i kolben?",
          tal: [{ c: 0.400, V: 250 }, { c: 0.200, V: 500 }, { c: 0.500, V: 100 }, { c: 0.100, V: 1000 }] },
        { id: "V", titel: "Find rumfanget", stof: "KCl", trin: ["V"], enhed: "L",
          tekst: "Du har {n} mol {stof} og skal lave en {c} M opløsning. Hvor stor skal målekolben være?",
          tal: [{ n: 0.600, c: 0.300 }, { n: 0.150, c: 0.600 }, { n: 0.300, c: 0.300 }, { n: 0.0500, c: 0.100 }] },
        { id: "mc", titel: "Fra masse til koncentration", stof: "NaCl", trin: ["M", "n_mM", "c"], enhed: "mL",
          tekst: "{m} g {stof} opløses i vand i en målekolbe, og der fyldes op til {V}. Find koncentrationen.",
          tal: [{ m: 14.61, V: 250 }, { m: 29.22, V: 500 }, { m: 5.84, V: 100 }, { stof: "CuSO4", m: 7.98, V: 250 }] },
        { id: "mk", titel: "Hvor meget skal afvejes?", stof: "KMnO4", trin: ["n_cV", "M", "m"], enhed: "mL",
          tekst: "Du skal lave {V} {c} M {stof}. Hvor mange gram skal du afveje?",
          tal: [{ c: 0.0200, V: 250 }, { c: 0.0100, V: 500 }, { c: 0.0500, V: 100 }] },
        { id: "mn", titel: "Fra koncentration til masse", stof: "Na2CO3", trin: ["n_cV", "M", "m"], enhed: "mL",
          tekst: "Du skal lave {V} {c} M {stof}. Hvor mange gram skal du afveje?",
          tal: [{ c: 0.200, V: 500 }, { c: 0.100, V: 250 }, { c: 0.500, V: 100 }, { stof: "CuSO4", c: 0.250, V: 250 }] }
    ];

    /* ----- Fane 3: fortynding --------------------------------------------------------------
       Flasken har altid 1,00 M kobber(II)sulfat. Foerste opgave er at goere
       det selv med en pipette og en maalekolbe; resten regnes.
         n1   n = c₁ · V₁       c2   c₂ = n / V₂     n2  n = c₂ · V₂
         V1   V₁ = n / c₁       V2   V₂ = n / c₂     vand  V(vand) = V₂ - V₁
         c2f  c₂ = c₁ · V₁ / V₂ (fortyndingsformlen i ét trin)
       Rumfangene staar i mL. */
    D.STAM = 1.00;
    D.PIPETTER = [10, 25, 50];
    D.KOLBER = [100, 250, 500];

    D.FORTYND = [
        { id: "ti", titel: "Ti gange tyndere", slags: "goer",
          tekst: "Lav en opløsning, der er ti gange tyndere end den i flasken.",
          maal: 0.100 },
        { id: "c2", titel: "Koncentrationen efter", trin: ["n1", "c2"],
          tekst: "Du tager {V1} af flaskens 1,00 M og fylder op til {V2}. Hvad bliver koncentrationen?",
          tal: [{ V1: 25, V2: 100 }, { V1: 10, V2: 250 }, { V1: 50, V2: 250 }, { V1: 10, V2: 100 }] },
        { id: "V1", titel: "Hvor meget skal pipetteres?", trin: ["n2", "V1"],
          tekst: "Du skal lave {V2} {c2} M af flaskens 1,00 M. Hvor meget skal du tage ud med pipetten?",
          tal: [{ V2: 250, c2: 0.200 }, { V2: 100, c2: 0.100 }, { V2: 500, c2: 0.0500 }, { V2: 250, c2: 0.100 }] },
        { id: "vand", titel: "Hvor meget vand?", trin: ["n1", "V2", "vand"], glas: true,
          tekst: "Et bægerglas har {V1} {c1} M kobber(II)sulfat. Opløsningen skal være {c2} M. Hvor meget vand skal der i?",
          tal: [{ V1: 100, c1: 0.500, c2: 0.200 }, { V1: 100, c1: 0.400, c2: 0.100 }, { V1: 50, c1: 0.600, c2: 0.100 }, { V1: 150, c1: 0.400, c2: 0.200 }] },
        { id: "formel", titel: "Fortyndingsformlen", trin: ["c2f"],
          tekst: "Du tager {V1} af flaskens 1,00 M og fylder op til {V2}. Regn koncentrationen i ét trin.",
          tal: [{ V1: 10, V2: 250 }, { V1: 25, V2: 500 }, { V1: 50, V2: 100 }, { V1: 10, V2: 500 }] }
    ];

    /* ----- Regnetrinene: navnet i raekken, venstresiden og enheden -------------------
       Hintet til formlen siger, hvad man kender, ikke formlen. */
    D.TRIN = {
        c: { navn: "Koncentrationen", venstre: "c", enhed: "M", formel: "n / V",
             formelHint: "Du kender stofmængden og rumfanget. Koncentrationen er stofmængde pr. liter." },
        n_cV: { navn: "Stofmængden", venstre: "n", enhed: "mol", formel: "c · V",
                formelHint: "Du kender koncentrationen og rumfanget. Hvor mange mol er der i hver liter, og hvor mange liter er der?" },
        V: { navn: "Rumfanget", venstre: "V", enhed: "L", formel: "n / c",
             formelHint: "Du kender stofmængden og koncentrationen. Hvor mange liter skal der til, for at hver liter får c mol?" },
        M: { navn: "Molarmassen", venstre: "M", enhed: "g/mol", formel: "",
             formelHint: "" },
        n_mM: { navn: "Stofmængden", venstre: "n", enhed: "mol", formel: "m / M",
                formelHint: "Du kender massen og molarmassen. Hvor mange gange går molarmassen op i massen?" },
        m: { navn: "Massen", venstre: "m", enhed: "g", formel: "n · M",
             formelHint: "Du kender stofmængden og molarmassen. Hvert mol vejer M gram." },
        n1: { navn: "Stofmængden", venstre: "n", enhed: "mol", formel: "c₁ · V₁",
              formelHint: "Du kender koncentrationen og rumfanget før fortyndingen." },
        c2: { navn: "Koncentrationen efter", venstre: "c₂", enhed: "M", formel: "n / V₂",
              formelHint: "Stofmængden er den samme efter fortyndingen. Den fordeler sig nu i V₂." },
        n2: { navn: "Stofmængden", venstre: "n", enhed: "mol", formel: "c₂ · V₂",
              formelHint: "Du kender den koncentration og det rumfang, du skal ende med." },
        V1: { navn: "Rumfanget i pipetten", venstre: "V₁", enhed: "mL", formel: "n / c₁",
              formelHint: "Stofmængden skal komme fra flasken. Hvor meget af flaskens opløsning indeholder den?" },
        V2: { navn: "Rumfanget efter", venstre: "V₂", enhed: "L", formel: "n / c₂",
              formelHint: "Stofmængden er den samme efter fortyndingen. Hvor mange liter giver den ønskede koncentration?" },
        vand: { navn: "Vandet", venstre: "V(vand)", enhed: "mL", formel: "V₂ − V₁",
                formelHint: "Der er allerede noget i glasset. Hvor meget mangler der op til V₂?" },
        c2f: { navn: "Koncentrationen efter", venstre: "c₂", enhed: "M", formel: "c₁ · V₁ / V₂",
               formelHint: "Stofmængden er den samme før og efter: c₁ · V₁ = c₂ · V₂. Isolér c₂." }
    };

    /* ----- Replikkerne ------------------------------------------------------------------
       Linjen i opgavekortet siger, hvor man er (INTRO), naeste skridt,
       fejl og ros. Kemichael blander sig ikke: han siger kun noget ved
       Giv hint og Vis svaret, naar han sendes ud eller hentes, og naar der
       klikkes paa ham eller koppen. */
    D.INTRO = {
        kar: "Koncentrationen er stofmængde pr. liter.",
        kolbe: "En opløsning laves i en målekolbe.",
        fortynd: "Ved fortynding kommer der vand til, men ikke stof."
    };
    D.FAERDIG = {
        kar: "Alle fem. Mere stof, mere vand, samme c.",
        kolbe: "Alle seks. Formlen først, så tallet.",
        fortynd: "Alle fem. Stoffet er det samme, kun rumfanget skifter."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst."];

    D.UD_LINJE = "Fint. Jeg er på lærerværelset.";
    D.IND_LINJE = "Tilbage. Kaffen derude var ikke bedre.";

    D.KAFFE = [
        "Kold. Som altid.",
        "Nogen har fortyndet den.",
        "Den er fra i morges. Tror jeg.",
        "Kaffen er min. Koncentrationen er din.",
        "Stadig kold. Men det er min."
    ];
    D.PRIK_SIDST = "Jeg sidder her bare. Regn du.";

    NK.Data = D;
}());
