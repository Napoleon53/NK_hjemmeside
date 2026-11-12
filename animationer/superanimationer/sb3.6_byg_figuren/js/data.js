/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel B3

   Forklaringerne er kopieret ordret fra B-bogens fagordliste til
   kapitel B3 (NK_Undervisning/Kemibogen/b/fagord/kapitel-b3.qmd) den
   2. nov. 2026 med et lille script; saenkede tal er skrevet som tegn
   (C₄H₁₀), og kursiv er taget af.
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det).
       Afsnittene hedder B3.1 til B3.4. */
    NK.KAPITEL = "B3";
    NK.ANTAL_FAGORD = 31;

    NK.FORKLARING = {
        /* B3.1 Alkoholer og carboxylsyrer */
        "carbonhydrid": "Stof, der kun indeholder de to grundstoffer C og H. Alkaner, alkener og alkyner er eksempler.",
        "zigzagformel": "Tegning af et molekyle, hvor hvert knæk og hver ende er et carbonatom. Hydrogenatomerne på carbon tegnes ikke.",
        "funktionel gruppe": "Bestemt kombination af atomer, som giver et organisk stof dets særlige egenskaber. −OH i en alkohol er et eksempel.",
        "stofklasse": "Familie af stoffer med samme funktionelle gruppe. Alkoholer og carboxylsyrer er to eksempler.",
        "R": "Bogstav, der står for resten af molekylet, når kun den funktionelle gruppe er vigtig. Resten er en carbonkæde af en eller anden længde.",
        "carbonylgruppe": "Et C-atom og et O-atom bundet med en dobbeltbinding, C=O. Findes blandt andet i aldehyder og ketoner.",
        /* B3.2 Intermolekylære bindinger */
        "intermolekylær binding": "Svag tiltrækning mellem molekyler, som holder dem sammen i væsker og faste stoffer. Jo stærkere den er, jo højere er kogepunktet.",
        "midlertidig dipol": "Kortvarig skæv elektronfordeling, som giver et molekyle en negativ og en positiv ende. Den skyldes, at elektronerne hele tiden er i bevægelse.",
        "londonbinding": "Tiltrækning mellem midlertidige dipoler i nabomolekyler. Den findes mellem alle molekyler og er den svageste mellem små molekyler.",
        "permanent dipol": "Delvist negativ og delvist positiv ende, som et polært molekyle har hele tiden. Den skyldes forskelle i elektronegativitet.",
        "dipol-dipolbinding": "Tiltrækning mellem polære molekyler. Molekylerne orienterer sig, så den negative ende af ét molekyle vender mod den positive ende af nabomolekylet.",
        "hydrogenbinding": "Den stærkeste tiltrækning mellem små molekyler. Et H-atom bundet til O eller N tiltrækkes af et frit elektronpar på O eller N i nabomolekylet.",
        "hydrofil": "Vandelskende. Siges om en gruppe, der kan danne hydrogenbindinger til vand, for eksempel OH-gruppen i en alkohol.",
        "hydrofob": "Vandskyende. Siges om en carbonkæde, fordi den kun kan danne londonbindinger. Er kæden lang, er stoffet tungtopløseligt i vand.",
        /* B3.3 Strukturisomeri */
        "isomerer": "Forskellige stoffer med samme molekylformel. Butan og 2-methylpropan har for eksempel begge molekylformlen C₄H₁₀.",
        "strukturisomerer": "Stoffer med samme molekylformel, hvor atomerne er bundet sammen i forskellig rækkefølge. Der er tre slags.",
        "kædeisomerer": "Stoffer med samme molekylformel, hvis carbonkæder har forskellig forgrening. Butan er uforgrenet, og 2-methylpropan er forgrenet.",
        "stillingsisomerer": "Stoffer med samme carbonkæde, hvor den funktionelle gruppe har forskellig placering. Propan-1-ol og propan-2-ol er et eksempel.",
        "funktionsisomerer": "Stoffer med samme molekylformel, som hører til hver sin stofklasse. Ethanol er en alkohol, og dimethylether er en ether.",
        "ether": "Stof med et oxygenatom bundet mellem to carbonatomer, R−O−R′. Stoffet har samme molekylformel som en alkohol, men intet hydrogenatom på oxygen.",
        /* B3.4 Stereoisomeri */
        "stereoisomerer": "Stoffer med atomerne bundet i samme rækkefølge, men med forskellig placering i rummet. De har samme molekylformel.",
        "cis-trans-isomeri": "Kan forekomme ved en dobbeltbinding, fordi molekylet ikke kan drejes om den. To grupper kan sidde på samme side af dobbeltbindingen eller på hver sin side.",
        "cis-form": "Udgave af en alken, hvor de to grupper sidder på samme side af dobbeltbindingen. De fleste naturlige umættede fedtsyrer har denne form.",
        "trans-form": "Udgave af en alken, hvor de to grupper sidder på hver sin side af dobbeltbindingen. En fedtsyre med denne form har en næsten lige kæde, som kan pakkes tæt.",
        "Z": "Bogstav for den udgave, hvor de to vigtigste grupper sidder på samme side af C=C. Kommer af det tyske ord zusammen.",
        "E": "Bogstav for den udgave, hvor de to vigtigste grupper sidder på hver sin side af C=C. Kommer af det tyske ord entgegen.",
        "spejlbilledisomerer": "To stoffer, der forholder sig til hinanden som en højre og en venstre hånd. Molekylerne kan ikke bringes til at dække hinanden.",
        "asymmetrisk carbonatom": "C-atom bundet til fire forskellige grupper. Det mærkes med en stjerne, og molekylet findes i to former, der er hinandens spejlbilleder.",
        "prioritet": "Rækkefølgen af grupperne på et carbonatom. Gruppen, hvis første atom har det højeste atomnummer, får nummer 1.",
        "R-form": "Den spejlbilledform, hvor grupperne 1, 2 og 3 følger hinanden med uret. Gruppe 4 skal pege væk fra dig.",
        "S-form": "Den spejlbilledform, hvor grupperne 1, 2 og 3 følger hinanden mod uret. Gruppe 4 skal pege væk fra dig."
    };

    /* Fagord fra listen, der med vilje ikke er paa en figur. Brugeren
       2. nov. 2026, da figurerne var lavet: "R er et underligt fagord..
       og det passer ikke rigtig ind her ... i hvert fald ikke paa denne
       maade". R sad paa bogstavet i R−OH under ethanol i B3.1; kortet er
       fjernet med det. */
    NK.UDELADT = ["R"];

    /* Ingen ord fra andre kapitler. */
    NK.TIDLIGERE = {};

    /* Ingen fagord staar paa mere end én figur. */
    NK.GENTAGET = [];

    /* De fire faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#b3.4 */
    NK.FANER = [
        { id: "stofklasser", nr: "B3.1", titel: "Alkoholer og syrer",       hash: ["stofklasser", "alkoholer", "zigzag", "b3.1"] },
        { id: "inter",       nr: "B3.2", titel: "Intermolekylære bindinger", hash: ["inter", "intermolekylaere", "bindinger", "b3.2"] },
        { id: "struktur",    nr: "B3.3", titel: "Strukturisomeri",          hash: ["struktur", "strukturisomeri", "b3.3"] },
        { id: "stereo",      nr: "B3.4", titel: "Stereoisomeri",            hash: ["stereo", "stereoisomeri", "cis-trans", "spejlbilleder", "b3.4"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.stofklasser = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());
