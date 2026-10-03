/* =====================================================================
   data.js - stofferne, opgaverne og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne,
   stofferne, de fire fanes opgaver med tallene og det, Kemichael siger.
   Kemien og tallene regnes i kemi.js; tegningen kender kun resultatet.

   Stoerrelser med et ord i saenket skrift skrives "V_før", "c_efter"
   og "V_vand" (NK.sub og Tg.rig tegner ordet saenket).
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

    /* ----- Fane 2: c eller n? -----------------------------------------------------------
       Baegerglas paa 1 L med kobber(II)sulfat. Prikkerne i et glas er
       stoffet: én prik er D.PRIK_GLAS mol, saa antallet er stofmaengden.
       Lupperne viser altid lige meget vaeske, saa ionerne i dem foelger
       koncentrationen (brugerens valg 29. sept. 2026: glas og lupper).

       glas: navn, V i mL og enten n (mol) eller c (M). kendt: det, tabellen
       i panelet viser fra start (n, V, c). etiket: koncentrationen staar
       paa glasset. prikker: prikkerne ses fra start (ellers foerst, naar
       et svar viser dem).
       spm: spoergsmaalene i raekkefoelge. hvem: svarene er glassene, og
       man kan ogsaa klikke paa et glas. svar: det rigtige har ok, de
       forkerte en forklaring. efter: linjen, naar svaret er rigtigt. vis:
       det, scenen viser bagefter (tael: prikkerne taelles, n og c: tallene
       i tabellen, etiket, prikker, enhed: enhederne, der gaar ud).
       foer: en handling, eleven goer, foer spoergsmaalet (haeld: hael V mL
       fra et glas til et andet, saml: haeld flere glas i ét, vand: vand
       fra sproejteflasken op til mL). regn: regnestykket over glassene. */
    D.PRIK_GLAS = 0.01;

    D.GLAS = [
        { id: "samme", titel: "Samme stofmængde",
          glas: [{ navn: "A", V: 400, n: 0.20, kendt: "nV" }, { navn: "B", V: 800, n: 0.20, kendt: "nV" }],
          prikker: true,
          linje: "Begge glas har fået 0,20 mol kobber(II)sulfat. Hver prik i glassene er 0,01 mol.",
          spm: [
              { tekst: "Hvilket glas har den største stofmængde?", hvem: true,
                svar: [{ t: "Glas A", glas: 0, forkl: "A har mindre vand, men ikke mere stof. Tæl prikkerne: 20 i hvert glas." },
                       { t: "Glas B", glas: 1, forkl: "B har mere vand, men ikke mere stof. Tæl prikkerne: 20 i hvert glas." },
                       { t: "De har lige meget", ok: true }],
                hint: "Stofmængden er alt stoffet i glasset. Tæl prikkerne i hvert glas.",
                efter: "Begge har 0,20 mol. Stofmængden er alt stoffet i glasset, uanset hvor meget vand der er.",
                vis: { tael: [0, 1] } },
              { tekst: "Hvilket glas har den største koncentration?", hvem: true,
                svar: [{ t: "Glas A", glas: 0, ok: true },
                       { t: "Glas B", glas: 1, forkl: "B har dobbelt så meget vand. Den samme stofmængde fordeler sig i mere vand, så koncentrationen er mindre." },
                       { t: "De har lige meget", forkl: "Stofmængden er den samme, men rumfanget er ikke. c = n / V." }],
                hint: "Koncentrationen er stofmængde pr. liter. Lupperne viser lige meget væske fra hvert glas.",
                efter: "A: c = 0,20 mol / 0,40 L = 0,50 M. B: c = 0,20 mol / 0,80 L = 0,25 M. Luppen over A har flest ioner.",
                vis: { c: [0, 1] } }
          ] },
        { id: "etiket", titel: "Etiketten",
          glas: [{ navn: "A", V: 600, n: 0.30, kendt: "nV" }],
          prikker: true,
          linje: "Glas A har 0,30 mol kobber(II)sulfat i 0,60 L.",
          spm: [
              { tekst: "Hvad skal der stå på etiketten?",
                svar: [{ t: "0,50 M", ok: true },
                       { t: "0,50 mol", forkl: "Tallet er rigtigt, men 0,50 er en koncentration. Den har enheden M, som betyder mol/L." },
                       { t: "0,30 M", forkl: "0,30 er stofmængden, og den har enheden mol. Koncentrationen er c = n / V." },
                       { t: "0,18 M", forkl: "0,18 er n · V. Koncentrationen er n / V = 0,30 mol / 0,60 L." }],
                hint: "Etiketten på en opløsning viser koncentrationen: c = n / V.",
                efter: "c = 0,30 mol / 0,60 L = 0,50 M. Etiketten viser koncentrationen, ikke stofmængden.",
                vis: { c: [0], etiket: [0] } },
              { tekst: "Hvad betyder 0,50 M?",
                svar: [{ t: "0,50 mol pr. liter vand", ok: true },
                       { t: "0,50 mol i glasset", forkl: "I glasset er der 0,30 mol. 0,50 M betyder 0,50 mol pr. liter, og glasset har kun 0,60 L." },
                       { t: "0,50 L opløsning", forkl: "M er ikke et rumfang. M betyder mol/L: mol pr. liter." }],
                hint: "M er en forkortelse. Den står for mol/L.",
                efter: "M betyder mol/L. En hel liter af opløsningen ville have 0,50 mol. Glasset har 0,60 L og derfor 0,30 mol." }
          ] },
        { id: "haeld", titel: "Hæld halvdelen over",
          glas: [{ navn: "A", V: 800, n: 0.40, kendt: "nVc", etiket: true }, { navn: "B", V: 0, n: 0, kendt: "" }],
          prikker: true,
          spm: [
              { foer: { slags: "haeld", fra: 0, til: 1, V: 400, linje: "Klik på glas A for at hælde halvdelen over i glas B.",
                        hint: "Klik på glas A. Så hælder det selv.", efter: "Halvdelen af opløsningen fra glas A er hældt over i glas B.",
                        kendt: [{ glas: 0, n: false }, { glas: 1, V: true }] },
                tekst: "Hvad er koncentrationen i glas B?",
                svar: [{ t: "0,50 M", ok: true },
                       { t: "0,25 M", forkl: "Der kom både stof og vand over i B. Det er den samme opløsning, så koncentrationen er den samme." },
                       { t: "1,00 M", forkl: "Der er ikke kommet mere stof i hver liter. Det er den samme opløsning, så koncentrationen er den samme." }],
                hint: "Det, der løber over i B, er den samme opløsning som i A. Sammenlign lupperne.",
                efter: "Det er den samme opløsning. c = 0,50 M i begge glas.",
                vis: { c: [1], etiket: [1] } },
              { tekst: "Hvad er stofmængden i glas B?",
                svar: [{ t: "0,20 mol", ok: true },
                       { t: "0,40 mol", forkl: "Der var 0,40 mol i A, før du hældte. Kun halvdelen kom over i B." },
                       { t: "0,50 mol", forkl: "0,50 er koncentrationen. Stofmængden er n = c · V = 0,50 M · 0,40 L." },
                       { t: "0,20 M", forkl: "Tallet er rigtigt, men stofmængden har enheden mol. M er koncentrationens enhed." }],
                hint: "n = c · V. Glas B har 0,40 L af en 0,50 M opløsning.",
                efter: "n = c · V = 0,50 M · 0,40 L = 0,20 mol. Stofmængden er halveret. Koncentrationen er den samme.",
                vis: { tael: [1], n: [0, 1] } }
          ] },
        { id: "saml", titel: "To glas i ét",
          glas: [{ navn: "A", V: 200, n: 0.10, kendt: "nVc", etiket: true }, { navn: "B", V: 200, n: 0.10, kendt: "nVc", etiket: true },
                 { navn: "C", V: 0, n: 0, kendt: "" }],
          prikker: true,
          spm: [
              { foer: { slags: "saml", fra: [0, 1], til: 2, linje: "Klik på glas A og glas B for at hælde dem over i glas C.",
                        hint: "Klik på glas A, og klik så på glas B.", efter: "Begge glas er hældt over i glas C.",
                        kendt: [{ glas: 2, V: true }] },
                tekst: "Hvad er koncentrationen i glas C?",
                svar: [{ t: "0,50 M", ok: true },
                       { t: "1,00 M", forkl: "Koncentrationer lægges ikke sammen. Både stoffet og vandet er fordoblet, så koncentrationen er den samme." },
                       { t: "0,25 M", forkl: "Der er kommet mere vand i C, men også mere stof. Begge er fordoblet." }],
                hint: "Begge glas havde den samme opløsning. Sammenlign lupperne.",
                efter: "c = 0,20 mol / 0,40 L = 0,50 M. Blander man to glas med den samme opløsning, er koncentrationen den samme.",
                vis: { c: [2], etiket: [2] } },
              { tekst: "Hvad er stofmængden i glas C?",
                svar: [{ t: "0,20 mol", ok: true },
                       { t: "0,10 mol", forkl: "Det er stofmængden fra ét glas. C har fået stoffet fra begge." },
                       { t: "0,50 mol", forkl: "0,50 er koncentrationen. Stofmængden er n = c · V = 0,50 M · 0,40 L." }],
                hint: "Stofmængder kan lægges sammen: alt stoffet fra A og alt stoffet fra B.",
                efter: "n = 0,10 mol + 0,10 mol = 0,20 mol. Stofmængder lægges sammen. Koncentrationer gør ikke.",
                vis: { tael: [2], n: [2] } }
          ] },
        { id: "tre", titel: "Tre glas",
          glas: [{ navn: "A", V: 200, c: 0.50, kendt: "Vc", etiket: true }, { navn: "B", V: 800, c: 0.20, kendt: "Vc", etiket: true },
                 { navn: "C", V: 100, c: 1.00, kendt: "Vc", etiket: true }],
          prikker: false,
          linje: "Etiketterne viser koncentrationen. Rumfanget kan aflæses på glasset.",
          spm: [
              { tekst: "Hvilket glas har den største koncentration?", hvem: true,
                svar: [{ t: "Glas A", glas: 0, forkl: "A har 0,50 M. Se efter på etiketterne." },
                       { t: "Glas B", glas: 1, forkl: "B har mest væske, men den laveste koncentration: 0,20 M." },
                       { t: "Glas C", glas: 2, ok: true }],
                hint: "Koncentrationen står på etiketten.",
                efter: "C har den største koncentration: 1,00 M. Luppen over C har flest ioner." },
              { tekst: "Hvilket glas har den største stofmængde?", hvem: true,
                svar: [{ t: "Glas A", glas: 0, forkl: "A har n = 0,50 M · 0,20 L = 0,10 mol." },
                       { t: "Glas B", glas: 1, ok: true },
                       { t: "Glas C", glas: 2, forkl: "C har den største koncentration, men kun 0,10 L: n = 1,00 M · 0,10 L = 0,10 mol." },
                       { t: "De har lige meget", forkl: "A og C har lige meget. Regn B ud: n = c · V." }],
                hint: "n = c · V. Regn stofmængden ud for hvert glas.",
                efter: "A: 0,10 mol. B: 0,20 M · 0,80 L = 0,16 mol. C: 0,10 mol. Den største koncentration er ikke det samme som den største stofmængde.",
                vis: { prikker: [0, 1, 2], tael: [0, 1, 2], n: [0, 1, 2] } }
          ] },
        { id: "vand", titel: "Vand i glasset",
          glas: [{ navn: "A", V: 200, n: 0.10, kendt: "nVc" }],
          prikker: true, sproejte: true,
          spm: [
              { foer: { slags: "vand", glas: 0, til: 400, linje: "Klik på sprøjteflasken for at hælde vand i glas A, til der er 0,40 L.",
                        hint: "Klik på sprøjteflasken til højre på bordet.", efter: "Der er hældt vand i glas A. Nu er der 0,40 L.",
                        kendt: [{ glas: 0, n: false, c: false }] },
                tekst: "Hvad er stofmængden i glasset nu?",
                svar: [{ t: "0,10 mol", ok: true },
                       { t: "0,05 mol", forkl: "Der er kun kommet vand i. Stoffet er det samme, så stofmængden er den samme." },
                       { t: "0,20 mol", forkl: "Vand er ikke kobber(II)sulfat. Stofmængden er den samme." }],
                hint: "Der er kommet vand i, men ikke kobber(II)sulfat. Tæl prikkerne.",
                efter: "n = 0,10 mol, som før. Der er kun kommet vand til.",
                vis: { tael: [0], n: [0] } },
              { tekst: "Hvad er koncentrationen nu?",
                svar: [{ t: "0,25 M", ok: true },
                       { t: "0,50 M", forkl: "Det var koncentrationen før. Nu fordeler stoffet sig i dobbelt så meget vand." },
                       { t: "0,25 mol", forkl: "Tallet er rigtigt, men koncentrationen har enheden M (mol/L). mol er stofmængdens enhed." },
                       { t: "1,00 M", forkl: "Mere vand giver ikke en højere koncentration. Stoffet fordeler sig i mere vand." }],
                hint: "c = n / V = 0,10 mol / 0,40 L.",
                efter: "c = 0,10 mol / 0,40 L = 0,25 M. Mere vand giver den samme stofmængde og en mindre koncentration.",
                vis: { c: [0] } }
          ] },
        { id: "enhed", titel: "Enhederne",
          glas: [{ navn: "A", V: 200, c: 0.50, kendt: "Vc", etiket: true }, { navn: "B", V: 400, n: 0.10, kendt: "nV" }],
          prikker: true,
          linje: "Enheden viser, om et tal er en stofmængde, en koncentration eller et rumfang.",
          spm: [
              { regn: "n = c · V = 0,50 M · 0,20 L = 0,10 ?", tekst: "Glas A: hvilken enhed får stofmængden?",
                svar: [{ t: "mol", ok: true },
                       { t: "M", forkl: "M er koncentrationens enhed. M betyder mol/L, og ganges det med L, går L ud: mol/L · L = mol." },
                       { t: "L", forkl: "L er rumfangets enhed. mol/L · L = mol." },
                       { t: "mol/L", forkl: "mol/L er det samme som M, koncentrationens enhed. mol/L · L = mol." }],
                hint: "Skriv M som mol/L. Hvad går ud, når der ganges med L?",
                efter: "n = 0,10 mol. Enhederne: M · L = mol/L · L = mol.",
                vis: { enhed: "n", n: [0] } },
              { regn: "c = n / V = 0,10 mol / 0,40 L = 0,25 ?", tekst: "Glas B: hvilken enhed får koncentrationen?",
                svar: [{ t: "M", ok: true },
                       { t: "mol", forkl: "mol er stofmængdens enhed. Deles mol med L, bliver det mol/L, og det er M." },
                       { t: "L", forkl: "L er rumfangets enhed. mol / L = mol/L = M." },
                       { t: "mol · L", forkl: "Der er delt med L, ikke ganget. mol / L = mol/L = M." }],
                hint: "Der deles mol med L. Hvad står der så?",
                efter: "c = 0,25 M. Enhederne: mol / L = mol/L = M.",
                vis: { enhed: "c", c: [1] } },
              { regn: "V = n / c = 0,10 mol / 0,50 M = 0,20 ?", tekst: "Glas A: hvilken enhed får rumfanget?",
                svar: [{ t: "L", ok: true },
                       { t: "mol", forkl: "mol går ud, når mol deles med mol/L: mol / (mol/L) = L." },
                       { t: "M", forkl: "M er koncentrationens enhed. mol / (mol/L) = L." },
                       { t: "mol²/L", forkl: "Der er delt med M, ikke ganget. mol / (mol/L) = L." }],
                hint: "Skriv M som mol/L. mol går ud, når mol deles med mol/L.",
                efter: "V = 0,20 L. Enhederne: mol / M = mol / (mol/L) = L.",
                vis: { enhed: "V" } }
          ] },
        { id: "blandet", titel: "To forskellige glas",
          glas: [{ navn: "A", V: 400, c: 0.20, kendt: "Vc", etiket: true }, { navn: "B", V: 100, c: 0.40, kendt: "Vc", etiket: true }],
          prikker: false,
          linje: "Etiketterne viser koncentrationen.",
          spm: [
              { tekst: "Glas B har den største koncentration. Har det også den største stofmængde?",
                svar: [{ t: "Ja", forkl: "B har 0,40 M, men kun 0,10 L: n = 0,40 M · 0,10 L = 0,04 mol. A har 0,20 M · 0,40 L = 0,08 mol." },
                       { t: "Nej, glas A har mest", ok: true },
                       { t: "De har lige meget", forkl: "A: n = 0,20 M · 0,40 L = 0,08 mol. B: n = 0,40 M · 0,10 L = 0,04 mol." }],
                hint: "n = c · V. Regn stofmængden ud for begge glas.",
                efter: "A: n = 0,20 M · 0,40 L = 0,08 mol. B: n = 0,40 M · 0,10 L = 0,04 mol.",
                vis: { prikker: [0, 1], tael: [0, 1], n: [0, 1] } },
              { foer: { slags: "haeld", fra: 1, til: 0, V: 100, linje: "Klik på glas B for at hælde det over i glas A.",
                        hint: "Klik på glas B. Så hælder det selv.", efter: "Glas B er hældt over i glas A. Nu er der 0,50 L i A.",
                        kendt: [{ glas: 0, n: false, c: false, etiket: false }] },
                tekst: "Hvad er koncentrationen i glas A nu?",
                svar: [{ t: "0,24 M", ok: true },
                       { t: "0,60 M", forkl: "Koncentrationer lægges ikke sammen. Læg stofmængderne sammen, og del med det samlede rumfang." },
                       { t: "0,30 M", forkl: "Det er gennemsnittet af 0,20 M og 0,40 M. Men der er fire gange så meget af A som af B." },
                       { t: "0,12 mol", forkl: "0,12 mol er stofmængden. Koncentrationen er c = n / V = 0,12 mol / 0,50 L." }],
                hint: "Læg stofmængderne sammen: 0,08 mol + 0,04 mol. Del med det samlede rumfang, 0,50 L.",
                efter: "n = 0,08 mol + 0,04 mol = 0,12 mol, og c = 0,12 mol / 0,50 L = 0,24 M. Koncentrationen ligger mellem 0,20 M og 0,40 M.",
                vis: { c: [0], n: [0], etiket: [0] } }
          ] }
    ];

    /* Enhedslinjerne i opgaven Enhederne. s: streges ud. fed: resultatet. */
    D.ENHEDSLINJE = {
        n: [{ t: "M · L = mol/" }, { t: "L", s: 1 }, { t: " · " }, { t: "L", s: 1 }, { t: " = " }, { t: "mol", fed: 1 }],
        c: [{ t: "mol / L = mol/L = " }, { t: "M", fed: 1 }],
        V: [{ t: "mol / (mol/L) = " }, { t: "mol", s: 1 }, { t: " · L/" }, { t: "mol", s: 1 }, { t: " = " }, { t: "L", fed: 1 }]
    };

    /* ----- Fane 3: maalekolben ----------------------------------------------------------
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

    /* ----- Fane 4: fortynding --------------------------------------------------------------
       Flasken har altid 1,00 M kobber(II)sulfat. Foerste opgave er at goere
       det selv med en pipette og en maalekolbe; resten regnes. Foer og
       efter skrives som saenket skrift (V_før), ikke med 1 og 2.
         n1   n = c_før · V_før          c2   c_efter = n / V_efter
         n2   n = c_efter · V_efter      V1   V_før = n / c_før
         V2   V_efter = n / c_efter      vand  V_vand = V_efter − V_før
         c2f  c_efter = c_før · V_før / V_efter (fortyndingsformlen i ét trin)
       Rumfangene staar i mL; i tallene hedder de stadig V1 og V2. */
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

    /* ----- Regnetrinene -------------------------------------------------------------------
       Hvert trin er et regnestykke i tre linjer: formlen (eleven vaelger
       formens skabelon og skriver bogstaverne), tallene med enheder sat ind
       og resultatet med enhed (brugerens oenske 29. sept. 2026).
       op: skabelonen. "/" en broek, "*" et produkt, "-" en forskel, og
       stjerne-skraastreg et produkt over en broekstreg. led: bogstaverne i formlen i den
       raekkefoelge, de staar. Molarmassen (op null) har kun resultatet.
       rumfang: "L" (rumfanget skal saettes ind i liter) eller "ens" (mL
       eller L, bare begge rumfang har samme enhed).
       formelHint giver formlens begyndelse, ikke hele formlen. */
    D.TRIN = {
        c: { navn: "Koncentrationen", venstre: "c", enhed: "M", op: "/", led: ["n", "V"], rumfang: "L",
             formelHint: "Du kender stofmængden og rumfanget. Koncentrationen er stofmængde pr. liter, så formlen er en brøk: c = n / …" },
        n_cV: { navn: "Stofmængden", venstre: "n", enhed: "mol", op: "*", led: ["c", "V"], rumfang: "L",
                formelHint: "Du kender koncentrationen og rumfanget. Stofmængden er koncentration gange rumfang: n = c · …" },
        V: { navn: "Rumfanget", venstre: "V", enhed: "L", op: "/", led: ["n", "c"],
             formelHint: "Du kender stofmængden og koncentrationen. Formlen er en brøk: V = n / …" },
        M: { navn: "Molarmassen", venstre: "M", enhed: "g/mol", op: null, led: [],
             formelHint: "" },
        n_mM: { navn: "Stofmængden", venstre: "n", enhed: "mol", op: "/", led: ["m", "M"],
                formelHint: "Du kender massen og molarmassen. Formlen er en brøk: n = m / …" },
        m: { navn: "Massen", venstre: "m", enhed: "g", op: "*", led: ["n", "M"],
             formelHint: "Du kender stofmængden og molarmassen. Massen er stofmængde gange molarmasse: m = n · …" },
        n1: { navn: "Stofmængden", venstre: "n", enhed: "mol", op: "*", led: ["c_før", "V_før"], rumfang: "L",
              formelHint: "Stoffet kommer fra opløsningen før fortyndingen: n = c_før · …" },
        c2: { navn: "Koncentrationen efter", venstre: "c_efter", enhed: "M", op: "/", led: ["n", "V_efter"], rumfang: "L",
              formelHint: "Stofmængden er den samme efter fortyndingen. Den fordeler sig nu i V_efter: c_efter = n / …" },
        n2: { navn: "Stofmængden", venstre: "n", enhed: "mol", op: "*", led: ["c_efter", "V_efter"], rumfang: "L",
              formelHint: "Du kender den koncentration og det rumfang, du skal ende med: n = c_efter · …" },
        V1: { navn: "Rumfanget i pipetten", venstre: "V_før", enhed: "mL", op: "/", led: ["n", "c_før"],
              formelHint: "Stofmængden skal komme fra flasken, der har c_før. Formlen er en brøk: V_før = n / …" },
        V2: { navn: "Rumfanget efter", venstre: "V_efter", enhed: "L", op: "/", led: ["n", "c_efter"],
              formelHint: "Stofmængden er den samme efter fortyndingen. Formlen er en brøk: V_efter = n / …" },
        vand: { navn: "Vandet", venstre: "V_vand", enhed: "mL", op: "-", led: ["V_efter", "V_før"], rumfang: "ens",
                formelHint: "Der er allerede V_før i glasset. Vandet er det, der mangler op til V_efter: V_vand = V_efter − …" },
        c2f: { navn: "Koncentrationen efter", venstre: "c_efter", enhed: "M", op: "*/", led: ["c_før", "V_før", "V_efter"], rumfang: "ens",
               formelHint: "Stofmængden er den samme før og efter: c_før · V_før = c_efter · V_efter. Isolér c_efter: c_efter = c_før · V_før / …" }
    };

    /* Navnene paa stoerrelserne, som de staar i en saetning */
    D.NAVN = { n: "stofmængden", c: "koncentrationen", V: "rumfanget", m: "massen", M: "molarmassen",
               c_før: "koncentrationen før", V_før: "rumfanget før", c_efter: "koncentrationen efter",
               V_efter: "rumfanget efter", V_vand: "vandet" };

    /* De tre skridt i linjen over et regnestykke (som sc4.3) */
    D.TRINBAR = ["Formlen", "Tallene ind", "Resultatet"];

    /* De skabeloner, eleven kan vaelge formlen i */
    D.SKABELONER = { 3: ["/", "*"], 4: ["/", "*", "-", "*/"] };

    /* ----- Replikkerne ------------------------------------------------------------------
       Linjen i opgavekortet siger, hvor man er (INTRO), naeste skridt,
       fejl og ros. Kemichael blander sig ikke: han siger kun noget ved
       Giv hint og Vis svaret, naar han sendes ud eller hentes, og naar der
       klikkes paa ham eller koppen. */
    D.INTRO = {
        kar: "Koncentrationen er stofmængde pr. liter.",
        glas: "Stofmængden er alt stoffet i glasset. Koncentrationen er stof pr. liter.",
        kolbe: "En opløsning laves i en målekolbe.",
        fortynd: "Ved fortynding kommer der vand til, men ikke stof."
    };
    D.FAERDIG = {
        kar: "Alle fem. Mere stof, mere vand, samme c.",
        glas: "Alle otte. Stofmængden er alt stoffet, koncentrationen er stof pr. liter.",
        kolbe: "Alle seks. Formlen, tallene og resultatet med enhed.",
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
