/* =====================================================================
   data.js - alkanerne, maalene, blandingerne og replikkerne

   Alt, der kan staa som data, staar her.

   Smelte- og kogepunkterne er ved 1 atm fra CRC Handbook of Chemistry
   and Physics (97. udgave), rundet til én decimal. Molarmassen af
   C5H12 er regnet med IUPAC's atommasser (C 12,01, H 1,008).

   Damptrykket under kogepunktet regnes med Troutons regel:
   fordampningsentropien er ca. 88 J/(mol·K) for alle alkanerne, saa
   p / p0 = exp(-(88 / R) · (Tk / T - 1)). Det bruges kun til de faa
   molekyler, der er damp over vaesken (D.DAMP).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Stofferne -----------------------------------------------------------
       id, navn, formel, antal C, smeltepunkt (°C), kogepunkt (°C), form.
       form: "kaede" (lige kaede), "methylbutan" (én gren), "dimethylpropan"
       (to grene paa samme C, kugleformet). grene: antal grene. */
    var S = [
        ["metan",          "methan",             "CH4",    1, -182.5, -161.5, "kaede"],
        ["ethan",          "ethan",              "C2H6",   2, -182.8,  -88.6, "kaede"],
        ["propan",         "propan",             "C3H8",   3, -187.6,  -42.1, "kaede"],
        ["butan",          "butan",              "C4H10",  4, -138.3,   -0.5, "kaede"],
        ["pentan",         "pentan",             "C5H12",  5, -129.7,   36.1, "kaede"],
        ["hexan",          "hexan",              "C6H14",  6,  -95.3,   68.7, "kaede"],
        ["heptan",         "heptan",             "C7H16",  7,  -90.6,   98.4, "kaede"],
        ["octan",          "octan",              "C8H18",  8,  -56.8,  125.6, "kaede"],
        ["nonan",          "nonan",              "C9H20",  9,  -53.5,  150.8, "kaede"],
        ["decan",          "decan",              "C10H22", 10, -29.7,  174.1, "kaede"],
        ["icosan",         "icosan",             "C20H42", 20,  36.7,  343.0, "kaede"],
        ["methylbutan",    "2-methylbutan",      "C5H12",  5, -159.8,   27.9, "methylbutan"],
        ["dimethylpropan", "2,2-dimethylpropan", "C5H12",  5,  -16.5,    9.5, "dimethylpropan"]
    ];

    /* Antal molekyler i proeven paa fane 1, saa der er ca. 120 C-kugler
       (methan og ethan faar lidt faerre, ellers bliver det et kuglehav) */
    var ANTAL = { metan: 44, ethan: 32, propan: 28, butan: 26, pentan: 24, hexan: 20,
                  heptan: 17, octan: 15, nonan: 13, decan: 12, icosan: 6 };

    D.STOFFER = S.map(function (r, i) {
        var navn = r[1];
        return {
            nr: i, id: r[0], navn: navn,
            /* Stort begyndelsesbogstav, men ikke foran et tal (2-methylbutan) */
            Navn: /^[a-z]/.test(navn) ? navn.charAt(0).toUpperCase() + navn.slice(1) : navn,
            formel: r[2], nC: r[3], smp: r[4], kp: r[5], form: r[6],
            grene: r[6] === "methylbutan" ? 1 : (r[6] === "dimethylpropan" ? 2 : 0),
            antal: ANTAL[r[0]] || 14
        };
    });

    var efterId = {};
    D.STOFFER.forEach(function (st) { efterId[st.id] = st; });
    D.stof = function (id) { return efterId[id] || null; };

    /* Hylden paa fane 1: de ti foerste ligekaedede og icosan */
    D.HYLDE = ["metan", "ethan", "propan", "butan", "pentan", "hexan", "heptan",
               "octan", "nonan", "decan", "icosan"].map(D.stof);

    /* De tre isomerer af C5H12 paa fane 2 */
    D.ISOMERER = ["pentan", "methylbutan", "dimethylpropan"].map(D.stof);

    /* Molarmassen af C5H12 i g/mol: 5 · 12,01 + 12 · 1,008 */
    D.M_C5H12 = "72,15";

    /* ----- Temperatur og tryk ------------------------------------------------- */
    /* Hoejden, papirkortet har sat af oeverst i scenen: [almindelig skaerm, lav skaerm,
       smalt kort til hoejre for reolen paa en lav scene (fane 1)] */
    /* varm: kortet under opgaveraekken paa fane 1 (T9): [almindelig, lav skaerm] */
    D.ZONE = { varm: [212, 178], form: [192, 172], spil: [170, 154] };
    D.STUE = 20;                               /* stuetemperatur, °C */
    D.T_VARM = { min: -200, max: 360 };        /* kammeret paa fane 1 og 3 */
    D.T_FORM = { min: 0, max: 50 };            /* vandbadet paa fane 2 */
    D.TROUTON = 88;                            /* J/(mol·K) */
    D.R = 8.314;
    D.DAMP = 0.12;                             /* hoejst saa stor en del er damp under kp */

    /* Damptrykket i atm ved temperaturen T (°C). 1 ved kogepunktet. */
    D.damptryk = function (st, T) {
        var Tk = st.kp + 273.15, TT = T + 273.15;
        if (TT <= 1) return 0;
        return Math.exp(-(D.TROUTON / D.R) * (Tk / TT - 1));
    };

    /* ----- Tal og tekst ---------------------------------------------------------- */
    /* En temperatur med dansk komma og rigtigt minus: -0.5 -> "−0,5" */
    D.grader = function (T, decimaler) {
        var d = decimaler === undefined ? 1 : decimaler;
        var s = Math.abs(T).toFixed(d).replace(".", ",");
        if (Number(Math.abs(T).toFixed(d)) === 0) return s;
        return (T < 0 ? "−" : "") + s;
    };

    D.gradTekst = function (T, decimaler) { return D.grader(T, decimaler) + " °C"; };

    D.formel = function (st) { return NK.formel(st.formel); };

    /* ----- Fane 1: Varm op ------------------------------------------------------
       Runde T9 (22. nov. 2026): fem opgaver i fast raekkefoelge efter
       Kemibogens C 4.1. Motoren er js/varm_opgaver.js; trintyperne og
       felterne staar beskrevet dér. s er fanen (js/sim_varm.js):
         s.saetGlas(id)  glasset med stoffet id ned i kammeret
         s.saetT(T)      kammeret paa temperaturen T med det samme
         s.glem(id)      kogepunktet for id er ikke fundet endnu
         s.koger(id)     glasset med id er i kammeret og koger
         s.erGlas(id)    glasset med id staar i kammeret (og er landet)
       tillad: det, eleven maa traekke i ("termo", "glas:<id>", "kurve").
       el og boble: det, der har gul ramme og boble, og teksten i boblen. */
    function stofHer(s, id) { return s.erGlas(id); }
    function glasEllerTermo(id, op) {
        return {
            tillad: ["glas:" + id, "termo"],
            el: function (s) { return stofHer(s, id) ? "termo" : "glas:" + id; },
            boble: function (s) { return stofHer(s, id) ? (op ? "Træk: varm op" : "Træk: køl ned") : "Træk: til kammeret"; }
        };
    }
    function flet(a, b) { Object.keys(b).forEach(function (k) { a[k] = b[k]; }); return a; }

    D.OPG_VARM = [
        {
            id: "pentan", navn: "Pentan koger",
            opsaet: function (s) { s.glem("pentan"); s.saetGlas("pentan"); s.saetT(D.STUE); },
            trin: [
                {
                    type: "valg", skjul: ["hylde", "kurve", "forklaring"],
                    tekst: "Vinduet viser molekylerne i glasset med pentan, C₅H₁₂.",
                    spm: "Hvilken tilstandsform har pentan i glasset ved 20 °C?",
                    svar: [
                        { t: "Væske", ok: true },
                        { t: "Gas", nej: "De fleste molekyler ligger samlet i bunden af glasset. Kun få farer rundt over væsken." },
                        { t: "Fast stof", nej: "I et fast stof ligger molekylerne stille i faste rækker. Pentanmolekylerne glider rundt mellem hinanden." }
                    ],
                    hint: ["Se på vinduet. Hvor ligger de fleste molekyler?",
                        "I en gas farer molekylerne rundt i hele glasset. I en væske ligger de tæt i bunden.",
                        "De fleste pentanmolekyler ligger tæt i bunden af glasset og glider rundt mellem hinanden."],
                    slut: "Pentan er en væske ved 20 °C. Molekylerne ligger tæt og holder fast i hinanden. I vinduet er en væske orange og en gas blå."
                },
                {
                    type: "handling", skjul: ["hylde", "kurve"], tillad: ["termo"], el: "termo", boble: "Træk: varm op",
                    spm: "Træk termometeret op, til pentan koger.",
                    maal: function (s) { return s.koger("pentan"); },
                    ikkeEndnu: "Pentan koger ikke endnu. Der kommer ingen bobler i glasset.",
                    hint: ["Håndtaget sidder i toppen af den røde søjle i termometeret.",
                        "Når pentan koger, kommer der bobler i glasset, og ballonen bliver fyldt.",
                        "Pentan koger ved 36,1 °C."],
                    svarTekst: "Kammeret varmer op, til pentan koger.",
                    visSvar: function (s) { s.varmTil(D.stof("pentan").kp + 12, 40); }
                },
                {
                    type: "valg", skjul: ["hylde", "kurve"],
                    tekst: "Pentan koger, og ballonen bliver fyldt med gas.",
                    spm: "Hvad sker der med pentanmolekylerne, når pentan koger?",
                    svar: [
                        { t: "De slipper hinanden", ok: true },
                        { t: "De går i stykker til atomer", nej: "Molekylerne er hele, også i gassen. Hvert blåt molekyle i vinduet har stadig fem kugler." },
                        { t: "De bliver større", nej: "Molekylerne har samme størrelse som før. Det er afstanden mellem molekylerne, der bliver større." }
                    ],
                    hint: ["Se på vinduet, mens pentan koger.",
                        "Tæl kuglerne i et blåt molekyle. Er molekylet helt?",
                        "I væsken holder molekylerne fast i hinanden. I gassen farer de rundt hver for sig."],
                    slut: "Molekylerne slipper hinanden og bliver til gas, men hvert molekyle er helt. Pentan koger ved 36,1 °C."
                }
            ]
        },
        {
            id: "butan", navn: "Gasserne på hylden",
            opsaet: function (s) { s.glem("butan"); s.saetGlas("pentan"); s.saetT(D.STUE); },
            trin: [
                {
                    type: "valg",
                    tekst: "Glassene på hylden er lukket med en prop og står ved 20 °C.",
                    spm: "Hvilke alkaner på hylden er gasser ved 20 °C?",
                    svar: [
                        { t: "Methan, ethan, propan og butan", ok: true },
                        { t: "Hexan til decan", nej: "Glassene med hexan til decan har en væske i bunden. En gas ligger ikke i bunden, men fylder hele glasset." },
                        { t: "Icosan", nej: "Glasset med icosan har et hvidt fast stof i bunden. En gas fylder hele glasset." }
                    ],
                    hint: ["En væske ligger i bunden af glasset. En gas fylder hele glasset.",
                        "Find de glas, der ikke har noget i bunden.",
                        "Glassene på den øverste hylde har intet i bunden. Gassen fylder hele glasset."],
                    slut: "Methan, ethan, propan og butan er gasser, der fylder hele glasset. Deres kogepunkt ligger under 20 °C."
                },
                {
                    type: "valg",
                    spm: "Koger butan, C₄H₁₀, ved en lavere eller en højere temperatur end pentan, C₅H₁₂?",
                    svar: [
                        { t: "Ved en lavere temperatur", ok: true },
                        { t: "Ved en højere temperatur", nej: "Butan er allerede en gas ved 20 °C. Pentan er en væske ved 20 °C og koger først ved 36,1 °C." },
                        { t: "Ved den samme temperatur", nej: "Så ville butan og pentan begge være væsker eller begge gasser ved 20 °C. Butan er en gas, og pentan er en væske." }
                    ],
                    hint: ["Butan er en gas ved 20 °C. Pentan er en væske ved 20 °C.",
                        "Et stof er en gas, når temperaturen er over stoffets kogepunkt.",
                        "Butans kogepunkt ligger under 20 °C. Pentans kogepunkt er 36,1 °C."],
                    slut: "Butan har ét C-atom mindre end pentan og koger ved en lavere temperatur. Butan er allerede kogt ved 20 °C."
                },
                {
                    type: "handling", tillad: ["glas:butan"], el: "glas:butan", boble: "Træk: til kammeret",
                    spm: "Træk glasset med butan, C₄H₁₀, ned i kammeret.",
                    maal: function (s) { return s.erGlas("butan"); },
                    ikkeEndnu: "Glasset i kammeret indeholder pentan. Træk glasset med C₄H₁₀ fra hylden ned i kammeret.",
                    hint: ["Butan, C₄H₁₀, står yderst til højre på den øverste hylde.",
                        "Tag fat i glasset, og slip det over kammeret.",
                        "Glasset med C₄H₁₀ har en gul ramme."],
                    svarTekst: "Glasset med butan sættes i kammeret.",
                    visSvar: function (s) { s.saetGlas("butan"); }
                },
                {
                    type: "handling", tillad: ["termo"], el: "termo", boble: "Træk: køl ned",
                    tekst: "Butan er en gas, og ballonen er fyldt.",
                    spm: "Træk termometeret ned, til butan bliver til en væske.",
                    maal: function (s) { return s.erGlas("butan") && s.fundet.indexOf("butan") >= 0 && s.proeve.T < D.stof("butan").kp - 0.5; },
                    ikkeEndnu: "Butan er stadig en gas. Ballonen er fyldt.",
                    hint: ["Træk håndtaget på termometeret nedad.",
                        "Butan bliver til en væske under butans kogepunkt.",
                        "Butan fortætter ved −0,5 °C."],
                    svarTekst: "Kammeret køler ned, til butan fortætter.",
                    visSvar: function (s) { s.varmTil(D.stof("butan").kp - 12, 40); },
                    slut: "Butan fortætter ved −0,5 °C. Et stof fortætter og koger ved samme temperatur. Derfor er −0,5 °C også butans kogepunkt."
                }
            ]
        },
        {
            id: "laengere", navn: "Længere kæder",
            opsaet: function (s) { s.glem("hexan"); s.glem("octan"); s.saetT(D.STUE); },
            trin: [
                flet({
                    type: "handling",
                    tekst: "Kurven viser kogepunktet for butan og pentan.",
                    spm: "Find kogepunktet for hexan, C₆H₁₄. Træk glasset ned i kammeret, og varm det op.",
                    maal: function (s) { return s.koger("hexan"); },
                    ikkeEndnu: function (s) { return s.erGlas("hexan") ? "Hexan koger ikke endnu. Varm kammeret mere op." : "Træk glasset med C₆H₁₄ fra hylden ned i kammeret."; },
                    hint: ["Hexan, C₆H₁₄, står på den midterste hylde.",
                        "Når glasset står i kammeret, trækker du termometeret op.",
                        "Hexan koger ved 68,7 °C."],
                    svarTekst: "Glasset med hexan sættes i, og kammeret varmer op.",
                    visSvar: function (s) { s.saetGlas("hexan"); s.varmTil(D.stof("hexan").kp + 12, 50); }
                }, glasEllerTermo("hexan", true)),
                flet({
                    type: "handling",
                    spm: "Find kogepunktet for octan, C₈H₁₈.",
                    maal: function (s) { return s.koger("octan"); },
                    ikkeEndnu: function (s) { return s.erGlas("octan") ? "Octan koger ikke endnu. Varm kammeret mere op." : "Træk glasset med C₈H₁₈ fra hylden ned i kammeret."; },
                    hint: ["Octan, C₈H₁₈, står yderst til højre på den midterste hylde.",
                        "Når glasset står i kammeret, trækker du termometeret op.",
                        "Octan koger ved 125,6 °C."],
                    svarTekst: "Glasset med octan sættes i, og kammeret varmer op.",
                    visSvar: function (s) { s.saetGlas("octan"); s.varmTil(D.stof("octan").kp + 12, 60); }
                }, glasEllerTermo("octan", true)),
                {
                    type: "valg",
                    tekst: "Kurven viser kogepunkterne for alkaner med 4, 5, 6 og 8 C-atomer.",
                    spm: "Hvad sker der med kogepunktet, når kæden bliver længere?",
                    svar: [
                        { t: "Kogepunktet stiger", ok: true },
                        { t: "Kogepunktet falder", nej: "Octan med 8 C-atomer koger ved 125,6 °C. Butan med 4 C-atomer koger ved −0,5 °C." },
                        { t: "Kogepunktet er det samme", nej: "Punkterne på kurven ligger ikke i samme højde. Hver alkan har sit eget kogepunkt." }
                    ],
                    hint: ["Se på kurven til højre.",
                        "Gå fra venstre mod højre på kurven. Så bliver kæden længere.",
                        "Butan koger ved −0,5 °C, og octan koger ved 125,6 °C."],
                    slut: "Kogepunktet stiger, når kæden bliver længere. Lange molekyler rører hinanden på en større flade."
                }
            ]
        },
        {
            id: "decan", navn: "Gæt decan",
            opsaet: function (s) { s.glem("decan"); s.nytGaet("decan"); s.saetT(D.STUE); },
            trin: [
                {
                    type: "indsend", tillad: ["kurve"], el: "kurve", boble: "Træk: dit gæt",
                    tekst: "Decan, C₁₀H₂₂, har 10 C-atomer.",
                    spm: "Træk ? på kurven til dit gæt på kogepunktet for decan, og tryk Indsend svar.",
                    klar: function (s) { return !!(s.gaet && s.gaet.sat); },
                    hint: ["Kurven stiger fra butan til octan. Forlæng den til 10 C-atomer.",
                        "Octan har 8 C-atomer og koger ved 125,6 °C. Decan har to C-atomer mere."],
                    visSvar: function (s) { s.gaet.t = Math.round(D.stof("decan").kp / 5) * 5; s.gaet.sat = true; }
                },
                flet({
                    type: "handling",
                    tekst: function (s) { return "Dit gæt er " + D.gradTekst(s.gaet ? s.gaet.t : 0, 0) + "."; },
                    spm: "Mål kogepunktet for decan. Træk glasset ned i kammeret, og varm det op.",
                    maal: function (s) { return s.koger("decan"); },
                    ikkeEndnu: function (s) { return s.erGlas("decan") ? "Decan koger ikke endnu. Varm kammeret mere op." : "Træk glasset med C₁₀H₂₂ fra hylden ned i kammeret."; },
                    hint: ["Decan, C₁₀H₂₂, står på den nederste hylde.",
                        "Når glasset står i kammeret, trækker du termometeret op.",
                        "Decan koger ved 174,1 °C."],
                    svarTekst: "Glasset med decan sættes i, og kammeret varmer op.",
                    visSvar: function (s) { s.saetGlas("decan"); s.varmTil(D.stof("decan").kp + 12, 70); },
                    slut: function (s) {
                        var st = D.stof("decan"), g = s.gaet ? s.gaet.t : 0;
                        return "Du gættede " + D.gradTekst(g, 0) + ", og decan koger ved " + D.gradTekst(st.kp) + ". " +
                            (Math.abs(g - st.kp) <= D.GAET_GODT ? "Godt ramt." : "Kurven flader lidt ud, jo længere kæden er.");
                    }
                }, glasEllerTermo("decan", true))
            ]
        },
        {
            id: "icosan", navn: "Stearinlyset",
            opsaet: function (s) { s.glem("icosan"); s.saetGlas("icosan"); s.saetT(D.STUE); },
            trin: [
                {
                    type: "valg", skjul: ["forklaring"],
                    tekst: "Glasset i kammeret indeholder nu icosan, C₂₀H₄₂, som findes i stearinlys.",
                    spm: "Hvilken tilstandsform har icosan ved 20 °C?",
                    svar: [
                        { t: "Fast stof", ok: true },
                        { t: "Væske", nej: "Molekylerne i vinduet ligger stille i faste rækker. I en væske glider molekylerne rundt mellem hinanden." },
                        { t: "Gas", nej: "Ballonen er tom, og molekylerne ligger samlet i bunden af glasset." }
                    ],
                    hint: ["Se på vinduet. Bevæger molekylerne sig?",
                        "I vinduet er et fast stof gråt, en væske orange og en gas blå.",
                        "Icosanmolekylerne ligger stille i faste rækker."],
                    slut: "Icosan er et fast stof ved 20 °C. Alkaner med 18 eller flere C-atomer er faste stoffer ved stuetemperatur."
                },
                {
                    type: "handling", tillad: ["termo"], el: "termo", boble: "Træk: varm op",
                    spm: "Varm icosan op, til det koger.",
                    maal: function (s) { return s.koger("icosan"); },
                    ikkeEndnu: "Icosan koger ikke endnu. Der kommer ingen bobler i glasset.",
                    hint: ["Træk håndtaget på termometeret helt op.",
                        "Icosan smelter først og bliver til en væske. Derefter koger det.",
                        "Icosan koger ved 343 °C."],
                    svarTekst: "Kammeret varmer op, til icosan koger.",
                    visSvar: function (s) { s.varmTil(D.stof("icosan").kp + 12, 90); }
                },
                {
                    type: "valg",
                    tekst: "Icosan smeltede ved 36,7 °C og kogte først ved 343 °C.",
                    spm: "Hvorfor koger icosan ved en meget højere temperatur end pentan?",
                    svar: [
                        { t: "Molekylerne rører hinanden på en stor flade", ok: true },
                        { t: "Bindingerne i molekylet skal brydes", nej: "Når et stof koger, slipper molekylerne hinanden. Molekylerne selv er hele, også i gassen." },
                        { t: "Icosan er fast ved 20 °C", nej: "Icosan smelter allerede ved 36,7 °C. Det er væsken, der koger, og den koger først ved 343 °C." }
                    ],
                    hint: ["Et icosanmolekyle har 20 C-atomer. Et pentanmolekyle har 5.",
                        "Molekylerne holder fast i hinanden, hvor de rører hinanden.",
                        "Jo længere kæden er, jo større er den flade, hvor to molekyler rører hinanden."],
                    slut: "Lange molekyler rører hinanden på en stor flade og holder godt fast i hinanden."
                }
            ]
        }
    ];

    /* Gaettet paa fane 1 er godt, naar det er saa taet paa */
    D.GAET_GODT = 25;

    /* ----- Fane 2: Formen --------------------------------------------------------- */
    D.FORM_SPM = "Hvilket af de tre stoffer koger først, når vandbadet varmes op?";
    D.FORM_HINT = "Alle tre stoffer har formlen C₅H₁₂. Kun molekylernes form er forskellig.";
    D.FORM_VARM_HINT = "Træk termometeret op over 36 °C, så alle tre stoffer koger.";

    D.HVORFOR = {
        spm: "Hvorfor koger 2,2-dimethylpropan først?",
        hint: "Samme atomer og samme masse. Se på formen. Hvor meget kan molekylerne røre hinanden?",
        valg: [
            { t: "Molekylerne rører hinanden mindst", rigtig: true,
              svar: "Et kugleformet molekyle har mindst berøringsflade. Derfor tiltrækker molekylerne hinanden svagest." },
            { t: "Molekylet har færrest atomer",
              svar: "Alle tre stoffer har formlen C₅H₁₂, så molekylerne har præcis de samme atomer." },
            { t: "Molekylet er lettest",
              svar: "Samme formel giver samme masse, så alle tre stoffer har M = 72,15 g/mol." },
            { t: "Bindingerne i molekylet er svagest",
              svar: "Når et stof koger, går molekylerne fra hinanden. Molekylerne selv er hele." }
        ]
    };

    /* ----- Fane 3: Hvem koger først? ---------------------------------------------
       En blanding: stofferne og starttemperaturen, hvor de alle er vaesker.
       Kammeret varmer op til midt mellem de to laveste kogepunkter. */
    D.SPIL_NIVEAUER = [
        { navn: "Kædelængde", hint: "Tæl C-atomerne i hvert molekyle. Hvilke molekyler rører hinanden mindst?" },
        { navn: "Formen", hint: "Alle stofferne har formlen C₅H₁₂. Hvilket molekyle er mest kugleformet?" },
        { navn: "Begge dele", hint: "Tæl C-atomerne først. Formen tæller kun, når molekylerne har lige mange C-atomer." }
    ];

    D.BLANDINGER = [
        { niveau: 0, stoffer: ["metan", "ethan"], start: -175 },
        { niveau: 0, stoffer: ["propan", "octan"], start: -52 },
        { niveau: 0, stoffer: ["butan", "hexan"], start: -15 },
        { niveau: 0, stoffer: ["hexan", "decan"], start: 55 },
        { niveau: 0, stoffer: ["ethan", "butan", "pentan"], start: -100 },
        { niveau: 0, stoffer: ["pentan", "octan", "decan"], start: 20 },
        { niveau: 1, stoffer: ["pentan", "dimethylpropan"], start: -5 },
        { niveau: 1, stoffer: ["pentan", "methylbutan"], start: 15 },
        { niveau: 1, stoffer: ["methylbutan", "dimethylpropan"], start: -5 },
        { niveau: 1, stoffer: ["pentan", "methylbutan", "dimethylpropan"], start: -5 },
        { niveau: 2, stoffer: ["butan", "dimethylpropan"], start: -12 },
        { niveau: 2, stoffer: ["butan", "methylbutan"], start: -15 },
        { niveau: 2, stoffer: ["dimethylpropan", "hexan"], start: -5 },
        { niveau: 2, stoffer: ["propan", "methylbutan"], start: -55 },
        { niveau: 2, stoffer: ["butan", "methylbutan", "dimethylpropan"], start: -12 },
        { niveau: 2, stoffer: ["methylbutan", "hexan"], start: 15 }
    ].map(function (b, i) {
        b.nr = i;
        b.st = b.stoffer.map(D.stof);
        var kp = b.st.map(function (s) { return s.kp; }).sort(function (x, y) { return x - y; });
        b.foerst = b.st.filter(function (s) { return s.kp === kp[0]; })[0];
        b.maal = (kp[0] + kp[1]) / 2;
        return b;
    });

    D.RUNDE = [3, 3, 3];                  /* blandinger pr. niveau i en runde */
    D.SPIL_FARVER = ["#e8c547", "#4fc3b0", "#e0719b"];
    D.OPVARMNING = 16;                    /* °C pr. sekund, naar kammeret varmer op */

    /* Forklaringen efter et svar: hvorfor det rigtige stof koger foer det
       valgte (eller foer de andre, naar svaret var rigtigt). */
    D.hvorfor = function (rigtig, anden) {
        if (rigtig.nC === anden.nC) {
            return "Stofferne har samme formel, og det mest forgrenede molekyle rører sine naboer mindst.";
        }
        if (rigtig.nC < anden.nC && anden.grene > rigtig.grene) {
            return "Flere C-atomer løfter kogepunktet mere, end grenene sænker det.";
        }
        if (rigtig.grene > anden.grene) {
            return rigtig.Navn + " har en kortere og mere forgrenet kæde, så molekylerne rører hinanden mindst.";
        }
        return "Den korte kæde rører sine naboer mindst.";
    };

    /* ----- Kemichael -------------------------------------------------------------
       Praesentationen (../kemichael/praesentation.js): ét trin ad gangen,
       og eleven trykker Naeste. Hvert trin er to til fire hele saetninger i
       Kemibogens sprog: hvad fanen traener, og hvordan tingene bruges. sel:
       det, han peger paa, og som faar en gul ramme, der blinker (CSS-
       selectorer; felterne paa laerredet er de usynlige .anker fra
       rundvisningen). Ingen vittigheder i praesentationen. */
    D.INTRO_VARM = [
        { tekst: "I denne fane undersøger du, hvordan kogepunktet for en alkan afhænger af kædens længde. Du trækker et glas fra hylden ned i kammeret. Ballonen på glasset fanger gassen, når stoffet koger.",
          sel: ["#varm-anker-hylde", "#varm-anker-kammer"] },
        { tekst: "Du varmer kammeret op eller køler det ned ved at trække i håndtaget på termometeret. Vinduet i midten viser molekylerne i glasset helt tæt på. Kuglerne er grå i et fast stof, orange i en væske og blå i en gas.",
          sel: ["#varm-anker-termometer", "#varm-anker-zoom"] },
        { tekst: "Kortet øverst i scenen stiller ét spørgsmål ad gangen, og rækken over kortet viser de fem opgaver. Den gule knap på kortet giver et hint og derefter svaret. Kurven til højre viser de kogepunkter, du har fundet.",
          sel: ["#varm-skort", "#varm-kurve-ark"] }
    ];
    D.INTRO_FORM = [
        { tekst: "I denne fane undersøger du, om molekylernes form påvirker kogepunktet. De tre glas i vandbadet indeholder pentan, 2-methylbutan og 2,2-dimethylpropan, som alle har formlen C₅H₁₂. Vinduet over hvert glas viser molekylerne i glasset.",
          sel: ["#form-anker-bad", "#form-anker-zoom"] },
        { tekst: "Først gætter du på papirkortet, hvilken ballon der fyldes først, og trykker Indsend svar. Du kan også vælge et glas ved at klikke på det. Derefter varmer du vandbadet op ved at trække i håndtaget på termometeret.",
          sel: ["#form-skort", "#form-anker-termometer"] },
        { tekst: "Når alle tre stoffer har kogt, spørger papirkortet, hvorfor ét af stofferne koger før de to andre. Den gule knap på kortet giver et hint og derefter svaret. Kogepunkterne kommer på listen i panelet, og knappen under listen viser, hvor molekylerne rører hinanden.",
          sel: ["#form-skort", "#form-tabel-kort"] }
    ];
    D.INTRO_SPIL = [
        { tekst: "I denne fane gætter du, hvilket stof i en blanding der koger først. Glasset i kammeret indeholder en blanding af to eller tre alkaner. Vinduet viser molekylerne af hvert stof i sin egen farve.",
          sel: ["#spil-anker-kammer", "#spil-anker-zoom"] },
        { tekst: "Du vælger et svar på papirkortet eller klikker på et af molekylerne og trykker Indsend svar. Derefter varmer kammeret selv op, til det første stof er kogt væk. Papirkortet forklarer bagefter, hvorfor netop det stof kogte først.",
          sel: "#spil-skort" },
        { tekst: "Den gule knap på papirkortet giver et hint og derefter svaret, men du får ikke point for et svar, du har set. En runde består af ni blandinger fra tre niveauer. Kortet Runden i panelet tæller dine rigtige svar og husker din rekord.",
          sel: ["#spil-skort", "#spil-runde"] }
    ];

    /* Ros, naar en hel fane er klaret. Det er sammen med taendstikken de
       eneste gange, han kommer ind af sig selv (brugerens regel 4. nov.
       2026). Fane 1: alle fire maal. Fane 2: hvorfor er besvaret (kun
       foerste gang i browseren). Fane 3: runden er slut. */
    D.MAAL_FAERDIG = "Du har løst alle fem opgaver. Kogepunktet stiger, når kæden bliver længere.";
    D.FORM_FAERDIG = "Du har kogt forklaringen ned til molekylernes form.";
    D.RUNDE_REPLIK = [
        [0, "Runden kogte over. Der er heldigvis flere blandinger på lageret."],
        [4, "Runden gik ikke dårligt, men et par af svarene fordampede."],
        [7, "Runden gik flot. Du holder hovedet koldt, selv når kammeret er varmt."],
        [9, "Du har ni rigtige ud af ni. Jeg er næsten målløs."]
    ];
    D.REKORD_REPLIK = "Du har sat en ny rekord. Jeg skriver rekorden ned et sted.";

    /* Paaskeaegget: taendstikken i ballonen, foerste gang og de naeste gange */
    D.BRAND = "Gassen i ballonen brændte. Alkanen reagerede med dioxygen i luften og blev til carbondioxid og vand.";
    D.BRAND_IGEN = [
        "Gassen brændte igen til carbondioxid og vand.",
        "Alkangassen reagerer med dioxygen, når der kommer en flamme til.",
        "Jeg har flere balloner, men jeg har ikke uendeligt mange."
    ];
    D.NY_BALLON = "Her er et nyt glas med en ny ballon.";
    D.TOM_BALLON = "Ballonen er tom. Stoffet er lukket inde i glasset.";

    NK.Data = D;
}());
