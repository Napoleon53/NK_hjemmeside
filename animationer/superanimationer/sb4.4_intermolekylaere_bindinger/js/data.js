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

    D.E_MAAL = [
        {
            id: "kog", navn: "Kog ethanol",
            prompt: "Glasset i kammeret indeholder ethanol ved 20 °C. Luppen viser molekylerne i væsken. Træk termometeret op, og varm ethanol op, til den koger.",
            hint: [
                "Termometeret til højre styrer temperaturen i kammeret. Træk i det runde håndtag.",
                "Ethanol er en væske ved 20 °C. Den skal varmes op over sit kogepunkt.",
                "Træk termometeret op over 80 °C, og vent, til ballonen er fuld."
            ],
            loest: "Ethanol koger ved 78 °C. Molekylerne river sig løs fra hinanden, og dampen fylder ballonen."
        },
        {
            id: "brydes", navn: "Hvad brydes?",
            prompt: "Når ethanol koger, brydes nogle bindinger. Hvilke? Se i luppen, mens ethanol koger, og vælg et svar.",
            svar: [
                { t: "Bindingen mellem O og H. H-atomet flyver af.",
                  f: "Se på et molekyle i dampen. Det har stadig sit H på O. Bindingerne inde i molekylet holder." },
                { t: "Bindingerne mellem molekylerne. Molekylerne er hele.", ok: true },
                { t: "Bindingen mellem de to C-atomer. Molekylet deles i to.",
                  f: "Se på et molekyle i dampen. Det har stadig begge C-atomer. Molekylet er helt." }
            ],
            hint: [
                "Varm ethanol op over 78 °C, og se på et molekyle, der er fløjet op i dampen.",
                "Klik på et molekyle i dampen. Har det stadig 2 C, 6 H og 1 O?",
                "Molekylerne er hele. Det er de røde og grå streger mellem dem, der forsvinder."
            ],
            loest: "Kun bindingerne mellem molekylerne brydes: hydrogenbindingerne og London-kræfterne. Molekylerne er hele, også i dampen."
        },
        {
            id: "hvilket", navn: "Find H'et",
            prompt: "Ethanol har seks H-atomer, men kun ét af dem kan danne hydrogenbindinger. Klik på sådan et H i luppen.",
            hint: [
                "Hydrogenbindingen er den røde stiplede streg. Se, hvor den begynder.",
                "Det H, du skal finde, sidder på det røde O-atom.",
                "Klik på det lille hvide H, der sidder direkte på et rødt O."
            ],
            klik: {
                HC: "Det H sidder på C. C og H trækker næsten lige meget i elektronerne, så H bliver ikke positivt nok til en hydrogenbinding.",
                O: "Det er O. Det tager imod hydrogenbindingen med sine frie elektronpar. Find det H, der binder til det.",
                C: "Det er C. Find et H-atom."
            },
            loest: "H på O er δ+, fordi O trækker elektronerne til sig. Det tiltrækkes af et frit elektronpar på O i et nabomolekyle. Det er en hydrogenbinding."
        },
        {
            id: "uden", navn: "Uden hydrogenbindinger",
            prompt: "Tænk dig, at ethanol ikke kunne danne hydrogenbindinger. Hvor ville den så koge? Gæt først.",
            prompt2: "Slå hydrogenbindingerne fra med kontakten over luppen. Find så kogepunktet: køl ned, til ethanol bliver en væske igen, eller varm op, til den koger.",
            svar: [
                { t: "Højere end 78 °C" },
                { t: "Lidt lavere, omkring 60 °C" },
                { t: "Meget lavere, under 0 °C", ok: true }
            ],
            hint: [
                "Kontakten over luppen slår hydrogenbindingerne fra og til.",
                "Uden hydrogenbindinger koger ethanol allerede ved stuetemperatur. Køl ned, til den bliver en væske igen.",
                "Slå hydrogenbindingerne fra, og træk termometeret ned under −50 °C."
            ],
            loest: "Uden hydrogenbindinger koger ethanol ved −42 °C, ligesom propan, der har samme størrelse og form. Hydrogenbindingerne løfter kogepunktet 120 °C."
        }
    ];

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
                  f: "2 g/mol gør næsten ingen forskel. Propan og butan er 14 g/mol fra hinanden og koger kun 42 °C fra hinanden." },
                { t: "Ethanol har en OH-gruppe. Molekylerne danner hydrogenbindinger til hinanden.", ok: true },
                { t: "Bindingen mellem O og H er stærkere end bindingen mellem C og H.",
                  f: "Bindingerne inde i molekylerne brydes ikke, når et stof koger. Det er bindingerne mellem molekylerne." }
            ],
            hint: ["Se i lupperne. Hvilke streger har ethanol, som propan ikke har?",
                   "De røde streger er hydrogenbindinger. De går fra H på O til O i et andet molekyle.",
                   "Propan har ingen OH-gruppe og kun London-kræfter."],
            loest: "Hydrogenbindingerne mellem OH-grupperne holder ethanolmolekylerne sammen. Propan har kun London-kræfter."
        },
        {
            id: "kaede", navn: "Ethanol og butan-1-ol", a: "ethanol", b: "butan1ol", start: 20,
            intro: "Begge har én OH-gruppe. Butan-1-ol har to C-atomer mere.",
            spm: "Butan-1-ol koger 40 °C højere end ethanol. Hvorfor?",
            svar: [
                { t: "Butan-1-ol har flere H-atomer, så den danner flere hydrogenbindinger.",
                  f: "Kun H på O danner hydrogenbindinger. Begge har ét H på O." },
                { t: "Butan-1-ol har flere OH-grupper.", f: "Tæl efter: begge har én OH-gruppe." },
                { t: "Den lange kæde rører sine naboer mere, så London-kræfterne er større.", ok: true }
            ],
            hint: ["Begge har én OH-gruppe. Hvad er så forskellen?",
                   "Se på de grå streger i lupperne. Det er London-kræfterne.",
                   "En lang kæde rører sine naboer flere steder."],
            loest: "Hydrogenbindingerne er de samme, men den lange kæde giver flere London-kræfter."
        },
        {
            id: "form", navn: "Propan-1-ol og propan-2-ol", a: "propan2ol", b: "propan1ol", start: 20,
            intro: "Samme atomer og samme molarmasse, 60 g/mol. OH-gruppen sidder for enden eller i midten.",
            spm: "Propan-1-ol koger 15 °C højere end propan-2-ol. Hvorfor?",
            svar: [
                { t: "Propan-2-ol er lettere.", f: "De har de samme atomer, så de vejer det samme: 60 g/mol." },
                { t: "Propan-2-ol er mere kugleformet. Molekylerne rører hinanden mindre.", ok: true },
                { t: "Propan-2-ol kan ikke danne hydrogenbindinger.",
                  f: "Propan-2-ol har også en OH-gruppe. Se i luppen: den har røde streger." }
            ],
            hint: ["Begge har én OH-gruppe, og de vejer det samme. Se på formen.",
                   "Propan-1-ol er en lige kæde. I propan-2-ol sidder OH-gruppen i midten.",
                   "Et kugleformet molekyle rører sine naboer færre steder end et langt."],
            loest: "Begge danner hydrogenbindinger. Propan-1-ol er langt og lige og rører sine naboer mere, så London-kræfterne er større."
        },
        {
            id: "diol", navn: "Ethanol og ethan-1,2-diol", a: "ethanol", b: "ethandiol", start: 20,
            intro: "Ethan-1,2-diol har en OH-gruppe i hver ende.",
            spm: "Ethan-1,2-diol koger ved 197 °C, ethanol ved 78 °C. Hvorfor?",
            svar: [
                { t: "Ethan-1,2-diol er tungere.",
                  f: "Propan-1-ol vejer næsten det samme, 60 g/mol, og koger ved 97 °C. Vægten forklarer ikke 197 °C." },
                { t: "Kæden er længere.", f: "Begge har to C-atomer." },
                { t: "To OH-grupper giver dobbelt så mange hydrogenbindinger.", ok: true }
            ],
            hint: ["Tæl OH-grupperne i de to stoffer.",
                   "Tæl de røde streger i de to lupper.",
                   "Hver OH-gruppe kan danne hydrogenbindinger."],
            loest: "Hver OH-gruppe danner hydrogenbindinger. Med to OH-grupper holder hvert molekyle fast i flere naboer."
        },
        {
            id: "lang", navn: "Hexan og pentan-1-ol", a: "hexan", b: "pentan1ol", start: 20,
            intro: "Næsten lige tunge, 86 og 88 g/mol, ligesom propan og ethanol. Men større.",
            spm: "Her er forskellen 69 °C. Mellem propan og ethanol var den 120 °C. Hvorfor er den mindre?",
            svar: [
                { t: "Hexan har også hydrogenbindinger.",
                  f: "Hexan har ingen OH-gruppe. Se i luppen: der er ingen røde streger." },
                { t: "Pentan-1-ol har færre OH-grupper end ethanol.", f: "Begge har én OH-gruppe." },
                { t: "Den lange kæde giver mange London-kræfter. Én OH-gruppe betyder mindre i et stort molekyle.", ok: true }
            ],
            hint: ["Se på grafen i panelet. Hvad sker der med afstanden mellem alkanen og alkoholen?",
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
        var oh = H.OH ? "Begge har " + D.ohTekst(H.OH) + ". " : "Ingen af dem har en OH-gruppe. ";
        if (H.C > L.C) {
            return oh + D.Stort(Hn) + " har den længste kæde. Den rører sine naboer mere, så London-kræfterne er større.";
        }
        if (H.C === L.C && D.FORM[L.id] && !D.FORM[H.id]) {
            return "De har de samme atomer. " + D.Stort(Ln) + " " + D.FORM[L.id] + ", så molekylerne rører hinanden mindre.";
        }
        return null;
    };

    /* ----- Faelles tekster ----------------------------------------------------- */
    D.FAERDIG = {
        e: "Alle fire. Ethanol koger højt, fordi OH-grupperne holder fast i hinanden.",
        s: "Alle fem. OH-gruppen betyder mest, når molekylerne er små.",
        r: "Alle tolv. Nu kan du klare dig uden tabellen."
    };

    D.ROS = ["Sådan.", "Det passer.", "Rigtig rækkefølge."];

    /* Paaskeaegget: termometerets kugle */
    D.PAASKE = {
        kold: "Termometeret er et sprittermometer. Den røde væske i det er farvet ethanol.",
        varm: "Termometeret er et sprittermometer med farvet ethanol. Over 78 °C ville spritten i et rigtigt sprittermometer koge. Dette termometer er heldigvis tegnet."
    };

    NK.Data = D;
}());
