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
       maerker     tallet over ioner, der venter paa en partner
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
    D.FALD_TID = 0.045;     /* brikker, der falder ned bagefter, sekunder pr. raekke */
    D.RYD_TID = 0.3;        /* fulde raekker blinker, foer de forsvinder */
    D.MIN_TID = 0.05;       /* hurtigste fald, sekunder pr. raekke */
    D.BRIKKER_PR_NIVEAU = 30; /* nyt niveau (hurtigere fald) for hver 30 brikker */

    /* ----- Kemichael -------------------------------------------------------
       To eller tre replikker paa hoejst ca. 60 tegn pr. sværhedsgrad. Under
       linjen D.INTRO_PEG peger han paa det, der staar i INTRO_PEG_PAA. */
    D.INTRO = {
        "let": [
            "Farvede brikker er ioner. Plus skal mødes med minus.",
            "Lav alle salte i panelet, så har du vundet.",
            "De grå sten forsvinder kun i fulde rækker. Held og lykke."
        ],
        middel: [
            "Middel. Nu kommer Al³⁺ og N³⁻ også.",
            "Ni salte skal laves. Al₂O₃ kræver fem brikker.",
            "Stenene venter ikke på, at du bliver færdig."
        ],
        svaer: [
            "Svær. Sammensatte ioner og ingen tal over dem.",
            "Atten salte. To kan være på vej på samme tid.",
            "Jeg nåede selv halvdelen. Det var et valg."
        ]
    };
    D.INTRO_PEG = 1;
    D.INTRO_PEG_PAA = { "let": "saltkort", middel: "saltkort", svaer: "saltkort" };

    /* Naar spillet slutter. vundet: alle salte (rekord: hurtigste tid).
       mange: mindst halvdelen af saltene. Ellers faa. */
    D.SLUT = {
        rekord: ["Alle salte, og ny rekord. Jeg tjekker lige facit.", "Rekordtid. Jeg skriver den ikke på tavlen."],
        vundet: ["Alle salte. Lageret er komplet.", "Alle salte. Så kan stenene få fri."],
        mange: ["Stenene vandt. Men der blev lavet salt.", "Over halvdelen. Stenene fik resten."],
        faa: ["Stenene vandt. Det gør de tit første gang.", "Loftet kom før saltet. Det sker."]
    };

    /* ----- Linjen under brættet -------------------------------------------
       {x} erstattes af spillet. */
    D.BESKED = {
        klar: "Tryk Start spil eller Enter.",
        styring: "← → flytter, ↑ drejer, mellemrum slipper brikken.",
        regel: "Plus mod minus. De grå sten forsvinder kun i fulde rækker.",
        pause: "Pause. Enter fortsætter.",
        slut: "Brættet er fuldt. Enter starter et nyt spil.",
        vundet: "Alle salte er lavet. Enter starter et nyt spil.",
        mangler: "{gruppe} mangler {tal} {tegn}.",
        laeg: " Læg {ion} op ad {dem}.",
        blandet: "Et salt har kun én slags plus og én slags minus.",
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
