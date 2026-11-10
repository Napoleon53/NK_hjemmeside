/* =====================================================================
   data.js - stofferne, opgaverne og teksterne

   Kogepunkterne er tabelvaerdier ved 1 atm (CRC Handbook og NIST, de
   samme som i brugerens opgave om intermolekylaere bindinger), afrundet
   til hele grader. Kun butan har en decimal: −0,5 °C.

   smiles er stoffets skelet med C og O (H-atomerne saetter NK.Mol selv
   paa). uden er alkanen med samme form og stoerrelse, hvor OH er byttet
   ud med CH3 (homomorfen). Dens kogepunkt er det, alkoholen ville have
   uden hydrogenbindinger.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Stofferne ------------------------------------------------------ */
    /* gren: 0 er en lige kaede, 1 en forgrening (eller OH inde paa kaeden),
       2 to forgreninger paa samme C. eter: O sidder mellem to C-atomer og
       har intet H. Etherne sammenlignes kun med alkoholer, ikke med
       alkaner (dér skulle dipol-dipol-bindinger med, og dem ejer sc3.3). */
    D.STOF = {
        methan:      { navn: "methan", formel: "CH4", smiles: "C", kp: -162, M: 16.04, OH: 0, C: 1 },
        ethan:       { navn: "ethan", formel: "CH3CH3", smiles: "CC", kp: -89, M: 30.07, OH: 0, C: 2 },
        propan:      { navn: "propan", formel: "CH3CH2CH3", smiles: "CCC", kp: -42, M: 44.10, OH: 0, C: 3 },
        butan:       { navn: "butan", formel: "CH3CH2CH2CH3", smiles: "CCCC", kp: -0.5, M: 58.12, OH: 0, C: 4 },
        mpropan:     { navn: "2-methylpropan", formel: "CH3CH(CH3)CH3", smiles: "CC(C)C", kp: -12, M: 58.12, OH: 0, C: 4, gren: 1 },
        pentan:      { navn: "pentan", formel: "CH3(CH2)3CH3", smiles: "CCCCC", kp: 36, M: 72.15, OH: 0, C: 5 },
        mbutan:      { navn: "2-methylbutan", formel: "CH3CH(CH3)CH2CH3", smiles: "CC(C)CC", kp: 28, M: 72.15, OH: 0, C: 5, gren: 1 },
        dmpropan:    { navn: "2,2-dimethylpropan", formel: "C(CH3)4", smiles: "CC(C)(C)C", kp: 10, M: 72.15, OH: 0, C: 5, gren: 2 },
        hexan:       { navn: "hexan", formel: "CH3(CH2)4CH3", smiles: "CCCCCC", kp: 69, M: 86.18, OH: 0, C: 6 },
        mpentan:     { navn: "2-methylpentan", formel: "CH3CH(CH3)(CH2)2CH3", smiles: "CC(C)CCC", kp: 60, M: 86.18, OH: 0, C: 6, gren: 1 },
        dmbutan:     { navn: "2,2-dimethylbutan", formel: "CH3C(CH3)2CH2CH3", smiles: "CC(C)(C)CC", kp: 50, M: 86.18, OH: 0, C: 6, gren: 2 },
        heptan:      { navn: "heptan", formel: "CH3(CH2)5CH3", smiles: "CCCCCCC", kp: 98, M: 100.20, OH: 0, C: 7 },
        octan:       { navn: "octan", formel: "CH3(CH2)6CH3", smiles: "CCCCCCCC", kp: 126, M: 114.23, OH: 0, C: 8 },
        decan:       { navn: "decan", formel: "CH3(CH2)8CH3", smiles: "CCCCCCCCCC", kp: 174, M: 142.28, OH: 0, C: 10 },
        methanol:    { navn: "methanol", formel: "CH3OH", smiles: "CO", kp: 65, M: 32.04, OH: 1, C: 1, uden: "ethan" },
        ethanol:     { navn: "ethanol", formel: "CH3CH2OH", smiles: "CCO", kp: 78, M: 46.07, OH: 1, C: 2, uden: "propan" },
        propan1ol:   { navn: "propan-1-ol", formel: "CH3CH2CH2OH", smiles: "CCCO", kp: 97, M: 60.10, OH: 1, C: 3, uden: "butan" },
        propan2ol:   { navn: "propan-2-ol", formel: "CH3CH(OH)CH3", smiles: "CC(O)C", kp: 82, M: 60.10, OH: 1, C: 3, gren: 1, uden: "mpropan" },
        butan1ol:    { navn: "butan-1-ol", formel: "CH3(CH2)3OH", smiles: "CCCCO", kp: 118, M: 74.12, OH: 1, C: 4, uden: "pentan" },
        butan2ol:    { navn: "butan-2-ol", formel: "CH3CH(OH)CH2CH3", smiles: "CC(O)CC", kp: 100, M: 74.12, OH: 1, C: 4, gren: 1 },
        mpropan2ol:  { navn: "2-methylpropan-2-ol", formel: "(CH3)3COH", smiles: "CC(C)(C)O", kp: 82, M: 74.12, OH: 1, C: 4, gren: 2 },
        pentan1ol:   { navn: "pentan-1-ol", formel: "CH3(CH2)4OH", smiles: "CCCCCO", kp: 138, M: 88.15, OH: 1, C: 5, uden: "hexan" },
        pentan2ol:   { navn: "pentan-2-ol", formel: "CH3CH(OH)(CH2)2CH3", smiles: "CC(O)CCC", kp: 119, M: 88.15, OH: 1, C: 5, gren: 1 },
        mbutan2ol:   { navn: "2-methylbutan-2-ol", formel: "CH3CH2C(CH3)2OH", smiles: "CCC(C)(C)O", kp: 102, M: 88.15, OH: 1, C: 5, gren: 2 },
        hexan1ol:    { navn: "hexan-1-ol", formel: "CH3(CH2)5OH", smiles: "CCCCCCO", kp: 158, M: 102.17, OH: 1, C: 6 },
        octan1ol:    { navn: "octan-1-ol", formel: "CH3(CH2)7OH", smiles: "CCCCCCCCO", kp: 195, M: 130.23, OH: 1, C: 8 },
        ethandiol:   { navn: "ethan-1,2-diol", ekstra: "glykol", formel: "HOCH2CH2OH", smiles: "OCCO", kp: 197, M: 62.07, OH: 2, C: 2, uden: "butan" },
        propan12diol: { navn: "propan-1,2-diol", formel: "CH3CH(OH)CH2OH", smiles: "CC(O)CO", kp: 188, M: 76.09, OH: 2, C: 3, gren: 1 },
        propan13diol: { navn: "propan-1,3-diol", formel: "HO(CH2)3OH", smiles: "OCCCO", kp: 214, M: 76.09, OH: 2, C: 3 },
        glycerol:    { navn: "propan-1,2,3-triol", ekstra: "glycerol", formel: "HOCH2CH(OH)CH2OH", smiles: "OCC(O)CO", kp: 290, M: 92.09, OH: 3, C: 3 },
        dimethylether: { navn: "dimethylether", formel: "CH3OCH3", smiles: "COC", kp: -25, M: 46.07, OH: 0, C: 2, eter: true },
        diethylether:  { navn: "diethylether", formel: "CH3CH2OCH2CH3", smiles: "CCOCC", kp: 35, M: 74.12, OH: 0, C: 4, eter: true },
        dipropylether: { navn: "dipropylether", formel: "C3H7OC3H7", smiles: "CCCOCCC", kp: 90, M: 102.17, OH: 0, C: 6, eter: true }
    };
    Object.keys(D.STOF).forEach(function (id) {
        var st = D.STOF[id];
        st.id = id;
        st.gren = st.gren || 0;
        st.O = st.OH + (st.eter ? 1 : 0);
    });

    /* Navnet som HTML med bloede bindestreger, saa et langt navn paa et smalt
       kort deles ved en stavelsesgraense (methyl-butan), aldrig midt i et ord */
    D.navnHTML = function (st) {
        return NK.html(st.navn).replace(/(methyl|ethyl|propyl)(?=[a-z])/g, "$1&shy;")
            .replace(/(an|en)(-\d)/g, "$1$2").replace(/(?=ether$)/, "&shy;");
    };

    /* Molekylformlen paa kortene paa fane 3: C5H12. Saa ses det, at
       isomerer har de samme atomer. */
    D.sumformel = function (st) {
        return NK.formel("C" + (st.C > 1 ? st.C : "") + "H" + (2 * st.C + 2) + (st.O ? "O" + (st.O > 1 ? st.O : "") : ""));
    };

    /* ----- Tal og tekst ---------------------------------------------------- */
    /* En temperatur med dansk komma og rigtigt minus: -0.5 -> "−0,5" */
    D.grader = function (T, decimaler) {
        var d = decimaler === undefined ? 0 : decimaler;
        var s = Math.abs(T).toFixed(d).replace(".", ",");
        if (Number(Math.abs(T).toFixed(d)) === 0) return s;
        return (T < 0 ? "−" : "") + s;
    };

    /* Kogepunktet som tekst: hele grader, men butans −0,5 */
    D.kpTekst = function (st) {
        return D.grader(st.kp, Math.round(st.kp) === st.kp ? 0 : 1) + " °C";
    };

    D.formel = function (st) { return NK.formel(st.formel); };

    /* Molarmassen med dansk komma og uden decimaler: 46 g/mol */
    D.Mtekst = function (st) { return Math.round(st.M) + " g/mol"; };

    /* Navnet med det gamle navn i parentes, hvis det har et */
    D.fuldtNavn = function (st) { return st.navn + (st.ekstra ? " (" + st.ekstra + ")" : ""); };

    D.Stort = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* Saadan en OH-tekst: "én OH-gruppe", "to OH-grupper" */
    D.ohTekst = function (n) {
        return ["ingen OH-gruppe", "én OH-gruppe", "to OH-grupper", "tre OH-grupper"][n];
    };

    /* ----- Fane 1: Ethanol ---------------------------------------------------
       Ethanol i glasset, 22 molekyler i luppen. Termometeret gaar fra
       −100 til 120 °C. Fire maal i fast raekkefoelge. */
    D.ETHANOL = {
        stof: "ethanol", antal: 22, Rm: 11.6, start: 20, omr: { min: -100, max: 120 }
    };

    /* Fire opgaver. Ingen af dem loeses af sig selv, naar eleven traekker i
       termometeret (brugeren 24. okt. 2026: "90% af eleverne loeser opgaven
       ved bare uhaemmet at traekke i slideren"): et kogepunkt skal findes og
       sendes ind med Indsend svar, og spoergsmaalene sendes ogsaa ind. */
    D.E_MAAL = [
        {
            id: "kog", navn: "Ethanols kogepunkt",
            tekst: "Find ethanols kogepunkt: stil termometeret på den temperatur, hvor ethanol begynder at koge.",
            hint: [
                "Når ethanol koger, kommer der bobler i glasset, og molekylerne i luppen river sig løs.",
                "Træk termometeret op, til der kommer bobler i glasset. Køl så ned, til boblerne lige stopper.",
                "Ethanols kogepunkt ligger mellem 70 °C og 90 °C."
            ],
            loest: "Under 78 °C holder bindingerne mellem molekylerne ethanol sammen som en væske. Over 78 °C river molekylerne sig løs, og dampen fylder ballonen."
        },
        {
            id: "brydes", navn: "Hvad brydes?",
            tekst: "Hvilke bindinger brydes, når ethanol koger? Vælg alle, der passer.",
            multi: true,
            svar: [
                { t: "Hydrogenbindinger mellem molekylerne", ok: true,
                  mangler: "Molekylerne i dampen har ingen røde streger. Hydrogenbindingerne er også brudt." },
                { t: "London-kræfter mellem molekylerne", ok: true,
                  mangler: "Molekylerne i dampen har ingen grå prikker. London-kræfterne er også brudt." },
                { t: "Bindingen mellem O og H i et molekyle",
                  f: "Et ethanolmolekyle i dampen har stadig sit H på O. Bindingerne i molekylet holder." },
                { t: "Bindingen mellem C og C i et molekyle",
                  f: "Et ethanolmolekyle i dampen har stadig begge C-atomer. Bindingerne i molekylet holder." }
            ],
            hint: [
                "Klik på et ethanolmolekyle i dampen. Er det helt?",
                "Hvilke streger er der mellem molekylerne i væsken? Og i dampen?",
                "Molekylerne er hele. Kun de røde streger og de grå prikker mellem dem forsvinder."
            ],
            loest: "Kun bindingerne mellem molekylerne brydes: hydrogenbindingerne og London-kræfterne. Ethanolmolekylerne er hele, også i dampen."
        },
        {
            id: "hvilket", navn: "Find H'et",
            tekst: "Ethanol har seks H-atomer, men kun ét af dem kan danne hydrogenbindinger. Klik på sådan et H i luppen.",
            hint: [
                "En hydrogenbinding er en rød stiplet streg. Se, hvilket atom den begynder ved.",
                "Det H, du skal finde, sidder på et rødt O-atom.",
                "Klik på det lille hvide H, der sidder direkte på et rødt O."
            ],
            valgt: { H: "Du har valgt et H-atom.", O: "Du har valgt et O-atom.", C: "Du har valgt et C-atom." },
            klik: {
                HC: "Det H sidder på C. C og H trækker næsten lige meget i elektronerne, så H bliver ikke δ+.",
                O: "Det er et O-atom. O tager imod hydrogenbindingen. Find det H, der binder til O.",
                C: "Det er et C-atom. Find et H-atom."
            },
            loest: "H på O er δ+, fordi O trækker elektronerne til sig. Det tiltrækkes af O i et nabomolekyle, som er δ−. Det er en hydrogenbinding."
        },
        {
            id: "uden", navn: "Uden hydrogenbindinger",
            gaet: {
                intro: "Tænk dig, at ethanol ikke kunne danne hydrogenbindinger.",
                tekst: "Hvor ville ethanol så koge?",
                svar: [
                    { t: "Højere end 78 °C" },
                    { t: "Lidt lavere, omkring 60 °C" },
                    { t: "Meget lavere, under 0 °C", ok: true }
                ]
            },
            tekst: "Slå hydrogenbindingerne fra med kontakten til venstre. Find så kogepunktet for ethanol uden hydrogenbindinger.",
            hint: [
                "Kontakten til venstre for luppen slår hydrogenbindingerne fra og til.",
                "Uden hydrogenbindinger er ethanol damp ved 20 °C. Køl ned, til der kommer væske i glasset.",
                "Kogepunktet for ethanol uden hydrogenbindinger ligger mellem −60 °C og −20 °C."
            ],
            loest: "Uden hydrogenbindinger koger ethanol ved −42 °C ligesom propan, der har samme størrelse og form. Hydrogenbindingerne løfter kogepunktet 120 °C."
        }
    ];

    /* Saa taet paa kogepunktet skal den temperatur vaere, eleven sender ind */
    D.TOL = 4;

    /* Svaret paa en temperatur, der ikke er kogepunktet. P er proeven, saa
       teksten kan sige, hvad eleven ser: vaeske, bobler eller kun damp. */
    D.tempFejl = function (navn, T, P) {
        var kp = P.kp(), t = D.grader(T) + " °C";
        if (T < kp) return "Ved " + t + " koger " + navn + " ikke: der er ingen bobler i glasset. Kogepunktet er højere.";
        if (P.antalGas() === P.N) return "Ved " + t + " er " + navn + " kun damp. Kogepunktet er lavere: køl ned, til der kommer væske.";
        return "Ved " + t + " koger " + navn + ", men kogepunktet er lavere. Køl ned, til boblerne lige stopper.";
    };

    /* Hint til at finde et kogepunkt paa fane 2 */
    D.maalHint = function (st) {
        var lo = Math.floor((st.kp - 6) / 10) * 10, hi = lo + 20;
        return [
            "Et stof koger, når der kommer bobler i dets glas, og molekylerne i dets lup river sig løs.",
            "Træk termometeret op, til der kommer bobler i glasset med " + st.navn + ". Køl så ned, til boblerne lige stopper.",
            "Kogepunktet for " + st.navn + " ligger mellem " + D.grader(lo) + " °C og " + D.grader(hi) + " °C."
        ];
    };

    /* ----- Fane 2: Sammenlign ------------------------------------------------
       Tre par (brugeren 24. okt. 2026: "lav kun 3 opgaver i fane 2, og soerg
       for at eleverne ledes over i fane 3 bagefter"): OH-gruppen, kaeden og
       to OH-grupper. Formen og de store molekyler oeves i Rangér.
       To stoffer i hver sin lup. Eleven gaetter, hvilket der koger ved den
       hoejeste temperatur, varmer op og svarer paa hvorfor. De forkerte
       svar er de fejl, elever laver. */
    D.SAMMEN = { Rm: 8.5, omr: { min: -100, max: 220 } };

    /* Saa mange molekyler i hver lup: ca. lige meget vaeske i alle */
    D.antalILup = function (st) {
        var tunge = NK.Mol.form(st.smiles).atomer.filter(function (a) { return a.tung; }).length;
        return Math.round(36 / tunge);
    };

    D.PAR = [
        {
            id: "oh", navn: "Propan og ethanol", a: "propan", b: "ethanol", start: -60,
            intro: "Propan og ethanol er næsten lige tunge: 44 og 46 g/mol.",
            spm: "Ethanol koger 120 °C højere end propan. Hvorfor?",
            svar: [
                { t: "Ethanol er lidt tungere.",
                  f: "2 g/mol gør næsten ingen forskel. Butan er 14 g/mol tungere end propan og koger kun 42 °C højere." },
                { t: "Ethanol har en OH-gruppe, der danner hydrogenbindinger.", ok: true },
                { t: "O og H binder stærkere end C og H.",
                  f: "Bindingerne inde i molekylerne brydes ikke, når et stof koger. Det er bindingerne mellem molekylerne." }
            ],
            hint: ["Se i lupperne. Hvilke streger har ethanol, som propan ikke har?",
                   "De røde streger er hydrogenbindinger. De går fra H på O til O i et andet molekyle.",
                   "Propan har ingen OH-gruppe. Mellem propanmolekylerne er der kun London-kræfter."],
            loest: "Hydrogenbindingerne mellem OH-grupperne holder ethanolmolekylerne sammen. Propan har kun London-kræfter."
        },
        {
            id: "kaede", navn: "Ethanol og butan-1-ol", a: "ethanol", b: "butan1ol", start: 20,
            intro: "Ethanol og butan-1-ol har begge én OH-gruppe. Butan-1-ol har to C-atomer mere.",
            spm: "Butan-1-ol koger 40 °C højere end ethanol. Hvorfor?",
            svar: [
                { t: "Flere H-atomer giver flere hydrogenbindinger.",
                  f: "Kun H på O danner hydrogenbindinger. Ethanol og butan-1-ol har begge ét H på O." },
                { t: "Butan-1-ol har flere OH-grupper.", f: "Tæl efter: ethanol og butan-1-ol har begge én OH-gruppe." },
                { t: "Den lange kæde giver flere London-kræfter.", ok: true }
            ],
            hint: ["Ethanol og butan-1-ol har begge én OH-gruppe. Hvad er så forskellen?",
                   "Se på de grå prikker i lupperne. Det er London-kræfterne.",
                   "En lang kæde rører sine naboer flere steder."],
            loest: "Ethanol og butan-1-ol danner lige mange hydrogenbindinger, men den lange kæde i butan-1-ol giver flere London-kræfter."
        },
        {
            id: "diol", navn: "Ethanol og ethan-1,2-diol", a: "ethanol", b: "ethandiol", start: 20,
            intro: "Ethanol har én OH-gruppe. Ethan-1,2-diol har en OH-gruppe i hver ende.",
            spm: "Ethan-1,2-diol koger ved 197 °C, ethanol ved 78 °C. Hvorfor?",
            svar: [
                { t: "Ethan-1,2-diol er tungere.",
                  f: "Propan-1-ol vejer næsten det samme, 60 g/mol, men koger ved 97 °C. Vægten forklarer ikke 197 °C." },
                { t: "Kæden i ethan-1,2-diol er længere.", f: "Ethanol og ethan-1,2-diol har begge to C-atomer." },
                { t: "To OH-grupper giver flere hydrogenbindinger.", ok: true }
            ],
            hint: ["Tæl OH-grupperne i de to stoffer.",
                   "Tæl de røde streger i de to lupper.",
                   "Hver OH-gruppe kan danne hydrogenbindinger."],
            loest: "Hver OH-gruppe danner hydrogenbindinger. Med to OH-grupper holder hvert molekyle fast i flere naboer."
        }
    ];

    /* Tabellerne bag grafen paa fane 2 (brugerens opgave) */
    D.ALKANER = ["methan", "ethan", "propan", "butan", "pentan", "hexan"];
    D.ALKOHOLER = ["methanol", "ethanol", "propan1ol", "butan1ol", "pentan1ol"];

    /* ----- Fane 3: Rangér -------------------------------------------------------
       Seks niveauer med fem opgaver hver (brugeren 24. okt. 2026: "Kan du
       ikke inddrage langt flere forskellige molekyler og niveauer"). Stofferne
       staar i en tilfaeldig raekkefoelge; eleven saetter dem efter kogepunkt.
       Selvtesten tjekker, at hvert par i en opgave har en forklaring
       (D.grund), og at to stoffer i samme opgave koger mindst 5 °C fra
       hinanden. */
    D.RANGER_GRUPPER = [
        { id: "let", titel: "1. Let: OH eller ej", kort: "Let", fokus: "Ét af stofferne har en OH-gruppe." },
        { id: "kaede", titel: "2. Kæden", kort: "Kæden", fokus: "Stofferne er af samme slags. Se på kæderne." },
        { id: "begge", titel: "3. Kæden og OH", kort: "Kæden og OH", fokus: "Både OH-grupper og kæder tæller." },
        { id: "form", titel: "4. Formen", kort: "Formen", fokus: "Nogle af stofferne har de samme atomer. Se på formen." },
        { id: "flere", titel: "5. Flere OH og ethere", kort: "Flere OH", fokus: "Nyt: flere OH-grupper, og ethere, hvor O sidder mellem to C-atomer." },
        { id: "mester", titel: "6. Mester", kort: "Mester", fokus: "Fem stoffer og alt det, du har lært." }
    ];

    D.RANGER = [
        { id: "l1", gruppe: "let", stoffer: ["propan", "ethanol", "butan"] },
        { id: "l2", gruppe: "let", stoffer: ["methanol", "methan", "ethan"] },
        { id: "l3", gruppe: "let", stoffer: ["propan1ol", "butan", "pentan"] },
        { id: "l4", gruppe: "let", stoffer: ["hexan", "pentan1ol", "pentan"] },
        { id: "l5", gruppe: "let", stoffer: ["butan", "ethanol", "pentan"] },
        { id: "k1", gruppe: "kaede", stoffer: ["propan", "hexan", "ethan", "butan"] },
        { id: "k2", gruppe: "kaede", stoffer: ["butan1ol", "methanol", "propan1ol", "ethanol"] },
        { id: "k3", gruppe: "kaede", stoffer: ["octan", "pentan", "heptan"] },
        { id: "k4", gruppe: "kaede", stoffer: ["hexan1ol", "propan1ol", "octan1ol", "pentan1ol"] },
        { id: "k5", gruppe: "kaede", stoffer: ["decan", "methan", "hexan", "octan"] },
        { id: "b1", gruppe: "begge", stoffer: ["ethanol", "propan", "butan1ol", "pentan"] },
        { id: "b2", gruppe: "begge", stoffer: ["hexan", "propan1ol", "butan", "ethanol"] },
        { id: "b3", gruppe: "begge", stoffer: ["methanol", "butan1ol", "pentan", "propan"] },
        { id: "b4", gruppe: "begge", stoffer: ["methanol", "ethan", "propan1ol", "butan"] },
        { id: "b5", gruppe: "begge", stoffer: ["propan1ol", "pentan", "ethan", "ethanol"] },
        { id: "f1", gruppe: "form", stoffer: ["pentan", "dmpropan", "mbutan"] },
        { id: "f2", gruppe: "form", stoffer: ["hexan", "dmbutan", "mpentan"] },
        { id: "f3", gruppe: "form", stoffer: ["butan1ol", "mpropan2ol", "butan2ol"] },
        { id: "f4", gruppe: "form", stoffer: ["propan2ol", "butan", "propan1ol", "mpropan"] },
        { id: "f5", gruppe: "form", stoffer: ["pentan1ol", "mbutan2ol", "pentan2ol"] },
        { id: "o1", gruppe: "flere", stoffer: ["ethandiol", "propan1ol", "propan2ol"] },
        { id: "o2", gruppe: "flere", stoffer: ["dimethylether", "ethanol", "methanol"] },
        { id: "o3", gruppe: "flere", stoffer: ["glycerol", "ethanol", "butan1ol", "ethandiol"] },
        { id: "o4", gruppe: "flere", stoffer: ["diethylether", "ethandiol", "butan1ol"] },
        { id: "o5", gruppe: "flere", stoffer: ["dipropylether", "hexan1ol", "propan13diol", "glycerol"] },
        { id: "x1", gruppe: "mester", stoffer: ["ethanol", "heptan", "pentan", "pentan1ol", "methan"] },
        { id: "x2", gruppe: "mester", stoffer: ["ethandiol", "octan", "butan1ol", "propan2ol", "ethan"] },
        { id: "x3", gruppe: "mester", stoffer: ["glycerol", "decan", "hexan1ol", "methanol", "mbutan"] },
        { id: "x4", gruppe: "mester", stoffer: ["dimethylether", "methanol", "ethanol", "pentan2ol", "propan12diol"] },
        { id: "x5", gruppe: "mester", stoffer: ["dmbutan", "hexan", "octan", "butan2ol", "propan13diol"] }
    ];

    /* Formen som tekst for de forgrenede */
    D.FORM = {
        mpropan: "er forgrenet og mere kugleformet",
        mbutan: "er forgrenet og mere kugleformet",
        dmpropan: "er forgrenet og næsten en kugle",
        mpentan: "er forgrenet og mere kugleformet",
        dmbutan: "er dobbelt forgrenet og mere kugleformet",
        propan2ol: "har OH-gruppen i midten og er mere kugleformet",
        butan2ol: "har OH-gruppen inde på kæden og er mere kugleformet",
        mpropan2ol: "er forgrenet og næsten en kugle",
        pentan2ol: "har OH-gruppen inde på kæden og er mere kugleformet",
        mbutan2ol: "er forgrenet og mere kugleformet",
        propan12diol: "har den ene OH-gruppe inde på kæden"
    };

    /* Hvorfor hoej koger hoejere end lav: { slags, tekst }, eller null, hvis
       reglerne ikke kan forklare det (det maa ikke ske i opgaverne;
       selvtesten tjekker). slags siger, hvilket hint 1 der passer (D.HINT1). */
    D.grund = function (lav, hoej) {
        var L = typeof lav === "string" ? D.STOF[lav] : lav, H = typeof hoej === "string" ? D.STOF[hoej] : hoej;
        var Ln = L.navn, Hn = H.navn, St = D.Stort;
        var tungere = L.M > H.M + 4 ? ", selv om " + Ln + " er tungere." : ".";
        var sammeAtomer = L.C === H.C && L.O === H.O;
        /* En ether mod en alkan: dér skulle dipol-dipol-bindinger med */
        if ((L.eter && !H.OH && !H.eter) || (H.eter && !L.OH && !L.eter)) return null;
        if (H.OH > L.OH) {
            if (L.eter) {
                if (sammeAtomer) {
                    return { slags: "eter", tekst: St(Ln) + " og " + Hn + " har de samme atomer, men kun " + Hn +
                        " har H på O. " + St(Ln) + " danner ingen hydrogenbindinger." };
                }
                return { slags: "eter", tekst: St(Hn) + " har " + D.ohTekst(H.OH) + ". I " + Ln +
                    " sidder O mellem to C-atomer uden H, så " + Ln + " danner ingen hydrogenbindinger." };
            }
            if (L.OH === 0) {
                return { slags: "oh", tekst: St(Hn) + " har " + D.ohTekst(H.OH) + ", og " + Ln + " har ingen. Hydrogenbindingerne holder molekylerne sammen" + tungere };
            }
            return { slags: "oh", tekst: St(Hn) + " har " + D.ohTekst(H.OH) + ", og " + Ln + " har " + D.ohTekst(L.OH) +
                ". Flere OH-grupper giver flere hydrogenbindinger." };
        }
        if (H.OH < L.OH) {
            /* En meget lang kaede kan slaa én OH-gruppe (Mester) */
            if (H.OH === 0 && !H.eter && L.OH === 1 && H.C >= L.C + 4) {
                return { slags: "lang", tekst: St(Hn) + " har ingen OH-gruppe, men en meget længere kæde: " + H.C + " C-atomer mod " + L.C +
                    " i " + Ln + ". De mange London-kræfter holder mere end én OH-gruppe." };
            }
            return null;
        }
        if (L.eter !== H.eter) return null;
        var oh = St(Ln) + " og " + Hn + (H.OH ? " har begge " + D.ohTekst(H.OH) + ". " : " har ingen OH-gruppe. ");
        if (H.C > L.C) {
            return { slags: "kaede", tekst: oh + St(Hn) + " har den længste kæde, som rører naboerne mere, så London-kræfterne er større." };
        }
        if (sammeAtomer && L.gren > H.gren) {
            if (!H.gren) {
                return { slags: "form", tekst: St(Ln) + " og " + Hn + " har de samme atomer. " + St(Ln) + " " + D.FORM[L.id] + ", så molekylerne rører hinanden mindre." };
            }
            return { slags: "form", tekst: St(Ln) + " og " + Hn + " har de samme atomer, men " + Ln + " er mere forgrenet og kugleformet, så molekylerne rører hinanden mindre." };
        }
        return null;
    };

    D.forklar = function (lav, hoej) {
        var g = D.grund(lav, hoej);
        return g ? g.tekst : null;
    };

    /* Hint 1 paa fane 3 efter, hvad det foerste forkerte par handler om */
    D.HINT1 = {
        oh: "Tæl OH-grupperne. Hydrogenbindinger løfter kogepunktet meget.",
        eter: "Se efter H på O. Kun et H, der sidder på O, kan danne hydrogenbindinger.",
        kaede: "Se på kæderne. Jo længere kæde, jo flere London-kræfter.",
        form: "Se på formen. Et kugleformet molekyle rører sine naboer mindst.",
        lang: "Se på kædernes længde. En meget lang kæde giver rigtig mange London-kræfter."
    };

    /* Medaljen, naar alle 30 er sat rigtigt: efter antal stjerner */
    D.MEDALJE = function (stjerner, ialt) {
        if (stjerner >= ialt) return { id: "guld", navn: "Guld", tekst: "Alle " + ialt + " i første forsøg." };
        if (stjerner >= Math.ceil(ialt * 2 / 3)) return { id: "soelv", navn: "Sølv", tekst: stjerner + " af " + ialt + " i første forsøg." };
        return { id: "bronze", navn: "Bronze", tekst: stjerner + " af " + ialt + " i første forsøg." };
    };

    /* ----- Faelles tekster ----------------------------------------------------- */
    D.FAERDIG = {
        e: "Alle fire. Ethanol koger højt, fordi OH-grupperne holder fast i hinanden.",
        s: "Alle tre par er klaret. Nu skal du selv sætte stoffer i rækkefølge efter kogepunkt i Rangér.",
        r: ""
    };

    D.ROS = ["Sådan.", "Det passer.", "Godt set."];

    /* Paaskeaegget: termometerets kugle */
    D.PAASKE = {
        kold: "Termometeret er et sprittermometer. Den røde væske i det er farvet ethanol.",
        varm: "Termometeret er et sprittermometer med farvet ethanol. Over 78 °C ville spritten i et rigtigt sprittermometer koge. Dette termometer er heldigvis tegnet."
    };

    NK.Data = D;
}());
