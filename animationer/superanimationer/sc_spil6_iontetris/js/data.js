/* =====================================================================
   data.js - ionerne, stenene, sværhedsgraderne og teksterne

   Alt, der kan rettes uden at roere koden, staar her: hvilke ioner der
   falder paa hver sværhedsgrad, hvor mange af brikkerne der er sten, hvor
   hurtigt det gaar, og hvad Kemichael og linjen under brættet siger.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Ionerne -------------------------------------------------------
       q er ladningen. sammensat: ionen saettes i parentes i formlen, naar
       der er mere end én (Al₂(SO₄)₃).
       Farverne: positive ioner er blå, negative røde. Jo større ladning,
       jo mørkere: Na⁺ lyseblå, Mg²⁺ blå, Al³⁺ mørkeblå; Cl⁻ lyserød, O²⁻
       rød, N³⁻ mørkerød. Ioner med samme ladning skilles ved en lille
       forskel i tonen (K⁺ mod det turkise, Br⁻ og NO₃⁻ mod det orange,
       OH⁻ mod det lyserøde). Farven hoerer til ionen, ikke til formen. */
    D.IONER = {
        Na:  { id: "Na",  sym: "Na",  q: 1,  farve: "#4ea6f2" },
        K:   { id: "K",   sym: "K",   q: 1,  farve: "#2fb9cf" },
        Mg:  { id: "Mg",  sym: "Mg",  q: 2,  farve: "#2e6bd4" },
        Al:  { id: "Al",  sym: "Al",  q: 3,  farve: "#243b9c" },
        Cl:  { id: "Cl",  sym: "Cl",  q: -1, farve: "#f0695c" },
        Br:  { id: "Br",  sym: "Br",  q: -1, farve: "#ec8b4e" },
        O:   { id: "O",   sym: "O",   q: -2, farve: "#cf3131" },
        N:   { id: "N",   sym: "N",   q: -3, farve: "#8a1c22" },
        OH:  { id: "OH",  sym: "OH",  q: -1, farve: "#ee6f93", sammensat: true },
        NO3: { id: "NO3", sym: "NO₃", q: -1, farve: "#ef8a5e", sammensat: true },
        SO4: { id: "SO4", sym: "SO₄", q: -2, farve: "#c42f6c", sammensat: true },
        PO4: { id: "PO4", sym: "PO₄", q: -3, farve: "#86204e", sammensat: true }
    };

    /* ----- Sværhedsgraderne ----------------------------------------------
       kat, an     de ioner, der falder. Alle par af dem er rigtige salte,
                   og alle skal laves for at vinde.
       sten        andelen af brikkerne, der er graa sten. Brugeren foreslog
                   3 af 4; saa vandt robotspilleren aldrig (0 af 11), saa
                   andelen er sat, saa alle tre kan vindes med pres:
                   Let 1/2, Middel 1/4, Svær 1/6 (Svær har 18 salte)
       start       sekunder pr. raekke paa niveau 1
       faktor      tiden pr. raekke ganges med den for hvert niveau
       blandes     1: ionerne til ét salt kommer lige efter hinanden (i
                   tilfaeldig raekkefoelge). 2: to salte blandes sammen.
       intro       de foerste ioner i hvert spil, en rolig start
       maerker     tallet over en ramme: den ladning, den har tilbage
       glimt       skyggen lyser groen, hvis brikken bliver til salt dér
       hint        linjen under brættet siger, hvad der mangler */
    D.NIVEAUER = {
        "let": {
            id: "let", navn: "Let", under: "simple ioner",
            kat: ["Na", "K", "Mg"], an: ["Cl", "Br", "O"],
            sten: 0.5, start: 1.1, faktor: 0.9, blandes: 1,
            intro: ["Na", "Cl"],
            maerker: true, glimt: true, hint: true
        },
        middel: {
            id: "middel", navn: "Middel", under: "også Al³⁺ og N³⁻",
            kat: ["Na", "Mg", "Al"], an: ["Cl", "O", "N"],
            sten: 0.25, start: 0.9, faktor: 0.9, blandes: 1,
            intro: ["Na", "Cl"],
            maerker: true, glimt: false, hint: true
        },
        svaer: {
            id: "svaer", navn: "Svær", under: "sammensatte ioner, ingen hjælp",
            kat: ["Na", "Mg", "Al"], an: ["Cl", "O", "OH", "NO3", "SO4", "PO4"],
            sten: 0.17, start: 0.75, faktor: 0.9, blandes: 2,
            intro: null,
            maerker: false, glimt: false, hint: false
        }
    };
    D.NIVEAU_ORDEN = ["let", "middel", "svaer"];

    /* Hvor tit et salt kommer i koeen. De store (mange ioner) kommer
       sjældnere; et salt, der ikke er lavet endnu, kommer D.MANGLER gange
       saa tit, saa man ikke venter for evigt paa det sidste. */
    D.VAEGT = { 2: 1, 3: 1, 4: 0.8, 5: 0.7 };
    D.MANGLER = 10;

    /* ----- Brættet og styringen ----------------------------------------- */
    D.BREDDE = 10;
    D.HOEJDE = 20;          /* synlige raekker */
    D.SKJULT = 2;           /* raekker over brættet, hvor brikkerne starter */
    D.NAESTE = 3;           /* brikker i koeen */
    D.LAAS = 0.5;           /* sekunder, en brik kan skubbes, efter den er landet */
    D.LAAS_FLYT = 15;       /* saa mange flyt nulstiller laasetiden */
    D.DAS = 0.17;           /* holdt pil: ventetid foer brikken glider */
    D.ARR = 0.05;           /* og tiden mellem hvert skridt */
    D.BLOED = 0.035;        /* pil ned: sekunder pr. raekke */
    D.PULVER_TID = 0.45;    /* saltet lyser op og bliver til pulver */
    D.SPRAENG = 1;          /* saltet spraenger de stenfelter, der ligger hoejst saa mange
                               felter fra det. 0: ingen, 1: side mod side, 1.5: ogsaa paa
                               skraa, 2: to felter ud. Sat efter robottest, se README */
    D.FALD_TID = 0.045;     /* brikker, der falder ned bagefter, sekunder pr. raekke */
    D.RYD_TID = 0.3;        /* fulde raekker blinker, foer de forsvinder */
    D.MIN_TID = 0.05;       /* hurtigste fald, sekunder pr. raekke */
    D.BRIKKER_PR_NIVEAU = 30; /* nyt niveau (hurtigere fald) for hver 30 brikker */

    /* ----- Baggrundsmusik --------------------------------------------------
       En lydfil i spillets mappe, der spilles i loekke, mens der spilles, og
       holder pause sammen med spillet. Findes filen ikke, er der ingen musik.
       "" slaar musikken helt fra. Styrken er fra 0 til 1; 0.2 lader spillets
       egne lyde kunne hoeres over musikken (nummeret er indspillet kraftigt). */
    D.MUSIK = "musik.mp3";
    D.MUSIK_STYRKE = 0.2;

    /* ----- Kemichael -------------------------------------------------------
       Praesentationen pr. sværhedsgrad (../kemichael/praesentation.js): ét
       trin ad gangen, og eleven trykker Naeste. Hvert trin er to til fire
       hele saetninger i Kemibogens sprog (brugerens regler 4. nov. 2026).
       sel er det, han peger paa, og som faar en gul ramme, der blinker
       (brættet, gem og koeen er de usynlige .omraade over laerredet). */
    D.INTRO = {
        "let": [
            { tekst: "I dette spil laver du salte af ioner, der falder ned på brættet. Blå brikker er positive ioner, og røde brikker er negative ioner. En positiv og en negativ ion, der rører hinanden, bliver til salt, når ladningerne går lige op.",
              sel: "#braet-omraade" },
            { tekst: "Kortet Salte viser de ni salte, du skal lave på Let, og hvert salt, du laver, lyser op. Når du har lavet alle saltene, har du vundet, og rekorden er den hurtigste tid.",
              sel: "#saltkort" },
            { tekst: "Går ladningerne ikke op, kommer der en gul ramme om ionerne, og tallet over rammen er den ladning, rammen har tilbage. Grå sten reagerer ikke, men et salt sprænger de grå felter, det ligger op ad. Kortet Styring viser tasterne, og knappen Regler forklarer resten.",
              sel: ["#styrekort", "#regelknap"] }
        ],
        middel: [
            { tekst: "På sværhedsgraden Middel laver du salte af ioner med større ladninger, fordi Al³⁺ og N³⁻ også falder. Al³⁺ skal for eksempel bruge tre Cl⁻, før ladningerne går lige op, og Al₂O₃ kræver fem brikker.",
              sel: "#braet-omraade" },
            { tekst: "Kortet Salte viser de ni salte, du skal lave på Middel. Når du har lavet alle saltene, har du vundet, og rekorden er den hurtigste tid.",
              sel: "#saltkort" },
            { tekst: "Skyggen under brikken lyser ikke grønt på Middel, så du skal selv se, om brikken bliver til salt. Køen viser de næste tre brikker, og tasten C gemmer en ion, der ikke har en partner endnu.",
              sel: ["#naeste-omraade", "#gem-omraade"] }
        ],
        svaer: [
            { tekst: "På sværhedsgraden Svær laver du salte med sammensatte ioner som OH⁻, NO₃⁻, SO₄²⁻ og PO₄³⁻. En sammensat ion står i parentes i formlen, når der er mere end én af den, som i Al₂(SO₄)₃.",
              sel: "#braet-omraade" },
            { tekst: "Kortet Salte viser de 18 salte, du skal lave på Svær. Når du har lavet alle saltene, har du vundet, og rekorden er den hurtigste tid.",
              sel: "#saltkort" },
            { tekst: "På Svær kan to salte være blandet i køen, og der står ingen tal over rammerne. Du skal derfor selv holde regnskab med ladningerne.",
              sel: "#naeste-omraade" }
        ]
    };

    /* Naar spillet er slut, kommer han ind og siger én replik. Det er den
       eneste gang, han kommer af sig selv. vundet: alle salte (rekord:
       hurtigste tid). mange: mindst halvdelen af saltene. Ellers faa. */
    D.SLUT = {
        rekord: ["Du har lavet alle saltene på ny rekordtid. Jeg tjekker facit for en sikkerheds skyld.", "Det er ny rekordtid, men jeg skriver den ikke på tavlen."],
        vundet: ["Du har lavet alle saltene, og lageret er nu komplet.", "Du har lavet alle saltene, så stenene kan få fri."],
        mange: ["Stenene vandt denne gang, men du nåede at lave mindst halvdelen af saltene.", "Du lavede mindst halvdelen af saltene, og stenene fik resten."],
        faa: ["Stenene vandt denne gang. Det gør de ofte i det første spil.", "Brikkerne nåede loftet, før saltene var lavet. Det sker for de fleste."]
    };

    /* ----- Linjen under brættet -------------------------------------------
       {x} erstattes af spillet. */
    D.BESKED = {
        klar: "Tryk Start spil eller Enter.",
        styring: "← → flytter, ↑ drejer, mellemrum slipper brikken.",
        regel: "Plus mod minus. Salt sprænger de grå felter, det ligger op ad.",
        pause: "Pause. Enter fortsætter.",
        slut: "Brættet er fuldt. Enter starter et nyt spil.",
        vundet: "Alle salte er lavet. Enter starter et nyt spil.",
        mangler: "{gruppe} mangler {tal} {tegn}.",
        laeg: " Læg {ion} op ad den.",
        ramme: "Rammen med {gruppe} mangler {mangler}.",
        laegRamme: " Læg {ion} op ad rammen.",
        fremmed: "{ion} kom ikke med i rammen. Den mangler {mangler}.",
        kaede: "Kædereaktion ×{n}.",
        kaedeStor: "Kædereaktion ×{n}. Pulveret fyger.",
        raekker: "{n} rækker på én gang.",
        vaek: "{ion} forsvandt med rækken. En ny er på vej.",
        niveau: "Niveau {n}. Det går hurtigere nu.",
        foerst: "Nyt salt: {formel}. {mangler} tilbage.",
        sidste: "Nyt salt: {formel}. Kun ét tilbage.",
        igen: "{formel} har du. Der mangler {mangler} andre."
    };

    D.TAL = ["nul", "én", "to", "tre", "fire", "fem", "seks", "syv", "otte", "ni"];

    NK.Data = D;
}());
