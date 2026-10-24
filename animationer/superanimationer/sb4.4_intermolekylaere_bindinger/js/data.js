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
    D.STOF = {
        methan:      { navn: "methan", formel: "CH4", smiles: "C", kp: -162, M: 16.04, OH: 0, C: 1 },
        ethan:       { navn: "ethan", formel: "CH3CH3", smiles: "CC", kp: -89, M: 30.07, OH: 0, C: 2 },
        propan:      { navn: "propan", formel: "CH3CH2CH3", smiles: "CCC", kp: -42, M: 44.10, OH: 0, C: 3 },
        butan:       { navn: "butan", formel: "CH3CH2CH2CH3", smiles: "CCCC", kp: -0.5, M: 58.12, OH: 0, C: 4 },
        mpropan:     { navn: "2-methylpropan", formel: "CH3CH(CH3)CH3", smiles: "CC(C)C", kp: -12, M: 58.12, OH: 0, C: 4, gren: true },
        pentan:      { navn: "pentan", formel: "CH3(CH2)3CH3", smiles: "CCCCC", kp: 36, M: 72.15, OH: 0, C: 5 },
        hexan:       { navn: "hexan", formel: "CH3(CH2)4CH3", smiles: "CCCCCC", kp: 69, M: 86.18, OH: 0, C: 6 },
        methanol:    { navn: "methanol", formel: "CH3OH", smiles: "CO", kp: 65, M: 32.04, OH: 1, C: 1, uden: "ethan" },
        ethanol:     { navn: "ethanol", formel: "CH3CH2OH", smiles: "CCO", kp: 78, M: 46.07, OH: 1, C: 2, uden: "propan" },
        propan1ol:   { navn: "propan-1-ol", formel: "CH3CH2CH2OH", smiles: "CCCO", kp: 97, M: 60.10, OH: 1, C: 3, uden: "butan" },
        propan2ol:   { navn: "propan-2-ol", formel: "CH3CH(OH)CH3", smiles: "CC(O)C", kp: 82, M: 60.10, OH: 1, C: 3, gren: true, uden: "mpropan" },
        butan1ol:    { navn: "butan-1-ol", formel: "CH3(CH2)3OH", smiles: "CCCCO", kp: 118, M: 74.12, OH: 1, C: 4, uden: "pentan" },
        mpropan2ol:  { navn: "2-methylpropan-2-ol", formel: "(CH3)3COH", smiles: "CC(C)(C)O", kp: 82, M: 74.12, OH: 1, C: 4, gren: true },
        pentan1ol:   { navn: "pentan-1-ol", formel: "CH3(CH2)4OH", smiles: "CCCCCO", kp: 138, M: 88.15, OH: 1, C: 5, uden: "hexan" },
        ethandiol:   { navn: "ethan-1,2-diol", ekstra: "glykol", formel: "HOCH2CH2OH", smiles: "OCCO", kp: 197, M: 62.07, OH: 2, C: 2, uden: "butan" },
        glycerol:    { navn: "propan-1,2,3-triol", ekstra: "glycerol", formel: "HOCH2CH(OH)CH2OH", smiles: "OCC(O)CO", kp: 290, M: 92.09, OH: 3, C: 3 }
    };
    Object.keys(D.STOF).forEach(function (id) { D.STOF[id].id = id; });

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
            id: "form", navn: "Propan-1-ol og propan-2-ol", a: "propan2ol", b: "propan1ol", start: 20,
            intro: "Propan-1-ol og propan-2-ol har samme atomer og samme molarmasse: 60 g/mol. OH-gruppen sidder for enden eller i midten.",
            spm: "Propan-1-ol koger 15 °C højere end propan-2-ol. Hvorfor?",
            svar: [
                { t: "Propan-2-ol er lettere.", f: "Propan-1-ol og propan-2-ol har de samme atomer, så de vejer det samme: 60 g/mol." },
                { t: "Propan-2-ol er kugleformet og rører naboerne mindre.", ok: true },
                { t: "Propan-2-ol kan ikke danne hydrogenbindinger.",
                  f: "Propan-2-ol har også en OH-gruppe. Se i luppen med propan-2-ol: der er røde streger." }
            ],
            hint: ["Propan-1-ol og propan-2-ol har begge én OH-gruppe og vejer det samme. Se på formen.",
                   "Propan-1-ol er en lige kæde. I propan-2-ol sidder OH-gruppen i midten.",
                   "Et kugleformet molekyle rører sine naboer færre steder end et langt."],
            loest: "Propan-1-ol og propan-2-ol danner begge hydrogenbindinger. Propan-1-ol er langt og lige og rører sine naboer mere, så London-kræfterne er større."
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
        },
        {
            id: "lang", navn: "Hexan og pentan-1-ol", a: "hexan", b: "pentan1ol", start: 20,
            intro: "Hexan og pentan-1-ol er næsten lige tunge: 86 og 88 g/mol. De er større end propan og ethanol.",
            spm: "Ethanol koger 120 °C over propan. Pentan-1-ol kun 69 °C over hexan. Hvorfor?",
            svar: [
                { t: "Hexan har også hydrogenbindinger.",
                  f: "Hexan har ingen OH-gruppe. Se i luppen med hexan: der er ingen røde streger." },
                { t: "Pentan-1-ol har færre OH-grupper end ethanol.", f: "Pentan-1-ol og ethanol har begge én OH-gruppe." },
                { t: "OH-gruppen betyder mindre, når kæden er lang.", ok: true }
            ],
            hint: ["Se på grafen til højre. Hvad sker der med afstanden mellem alkanen og alkoholen?",
                   "Hexan og pentan-1-ol har lange kæder med mange London-kræfter.",
                   "Der er stadig kun én OH-gruppe, men nu er der meget mere kæde."],
            loest: "I store molekyler holder London-kræfterne mest. Én OH-gruppe løfter stadig kogepunktet, men mindre."
        }
    ];

    /* Tabellerne bag grafen paa fane 2 (brugerens opgave) */
    D.ALKANER = ["methan", "ethan", "propan", "butan", "pentan", "hexan"];
    D.ALKOHOLER = ["methanol", "ethanol", "propan1ol", "butan1ol", "pentan1ol"];

    /* ----- Fane 3: Rangér -------------------------------------------------------
       Stofferne staar i en tilfaeldig raekkefoelge; eleven saetter dem efter
       kogepunkt. Selvtesten tjekker, at hvert par har en forklaring. */
    D.RANGER = [
        { id: "l1", gruppe: "let", stoffer: ["propan", "ethanol", "butan"] },
        { id: "l2", gruppe: "let", stoffer: ["methanol", "methan", "ethan"] },
        { id: "l3", gruppe: "let", stoffer: ["propan1ol", "butan", "pentan"] },
        { id: "l4", gruppe: "let", stoffer: ["hexan", "pentan1ol", "pentan"] },
        { id: "m1", gruppe: "middel", stoffer: ["butan1ol", "methanol", "propan1ol", "ethanol"] },
        { id: "m2", gruppe: "middel", stoffer: ["ethanol", "propan", "butan1ol", "pentan"] },
        { id: "m3", gruppe: "middel", stoffer: ["hexan", "propan1ol", "butan", "ethanol"] },
        { id: "m4", gruppe: "middel", stoffer: ["methanol", "butan1ol", "pentan", "propan"] },
        { id: "s1", gruppe: "svaer", stoffer: ["ethandiol", "propan1ol", "propan2ol"] },
        { id: "s2", gruppe: "svaer", stoffer: ["propan2ol", "butan", "propan1ol", "mpropan"] },
        { id: "s3", gruppe: "svaer", stoffer: ["glycerol", "ethanol", "butan1ol", "ethandiol"] },
        { id: "s4", gruppe: "svaer", stoffer: ["pentan1ol", "mpropan2ol", "ethandiol", "hexan"] }
    ];
    D.RANGER_GRUPPER = [
        { id: "let", titel: "Let: OH eller ej" },
        { id: "middel", titel: "Middel: kæden og OH" },
        { id: "svaer", titel: "Svær: formen og flere OH" }
    ];

    /* Formen som tekst for de forgrenede */
    D.FORM = {
        mpropan: "er forgrenet og mere kugleformet",
        propan2ol: "har OH-gruppen i midten og er mere kugleformet",
        mpropan2ol: "er forgrenet og mere kugleformet"
    };

    /* Hvorfor hoej koger hoejere end lav. null, hvis reglerne ikke kan
       forklare det (det maa ikke ske i opgaverne; selvtesten tjekker). */
    D.forklar = function (lav, hoej) {
        var L = typeof lav === "string" ? D.STOF[lav] : lav, H = typeof hoej === "string" ? D.STOF[hoej] : hoej;
        var Ln = L.navn, Hn = H.navn;
        if (H.OH > L.OH) {
            if (L.OH === 0) {
                return D.Stort(Hn) + " har " + D.ohTekst(H.OH) + ", og " + Ln + " har ingen. Hydrogenbindingerne holder molekylerne i " +
                    Hn + " sammen" + (L.M > H.M + 4 ? ", selv om " + Ln + " er tungere." : ".");
            }
            return D.Stort(Hn) + " har " + D.ohTekst(H.OH) + ", og " + Ln + " har " + D.ohTekst(L.OH) +
                ". Flere OH-grupper giver flere hydrogenbindinger.";
        }
        if (H.OH < L.OH) return null;
        var oh = D.Stort(Ln) + " og " + Hn + (H.OH ? " har begge " + D.ohTekst(H.OH) + ". " : " har ingen OH-gruppe. ");
        if (H.C > L.C) {
            return oh + D.Stort(Hn) + " har den længste kæde, som rører naboerne mere, så London-kræfterne er større.";
        }
        if (H.C === L.C && D.FORM[L.id] && !D.FORM[H.id]) {
            return D.Stort(Ln) + " og " + Hn + " har de samme atomer. " + D.Stort(Ln) + " " + D.FORM[L.id] + ", så molekylerne rører hinanden mindre.";
        }
        return null;
    };

    /* ----- Faelles tekster ----------------------------------------------------- */
    D.FAERDIG = {
        e: "Alle fire. Ethanol koger højt, fordi OH-grupperne holder fast i hinanden.",
        s: "Alle fem. OH-gruppen betyder mest, når molekylerne er små.",
        r: "Alle tolv. Nu kan du klare dig uden tabellen."
    };

    D.ROS = ["Sådan.", "Det passer.", "Godt set."];

    /* Paaskeaegget: termometerets kugle */
    D.PAASKE = {
        kold: "Termometeret er et sprittermometer. Den røde væske i det er farvet ethanol.",
        varm: "Termometeret er et sprittermometer med farvet ethanol. Over 78 °C ville spritten i et rigtigt sprittermometer koge. Dette termometer er heldigvis tegnet."
    };

    NK.Data = D;
}());
