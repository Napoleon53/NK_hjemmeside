/* =====================================================================
   tekst.js - al prosa i forsoeget

   Ét sted for hvert ord, eleven laeser: titlen, introen, panelets kort,
   rundvisningens stop og senere trinnenes tekster, hints, quizzen og
   billedteksterne. Det gaar to veje: en oevelsesvejledning kan
   oversaettes til denne ene fil, og hele forsoegets sprog kan laeses
   igennem paa fem minutter uden at aabne kode.

   Noeglerne er id'er i index.html. side.js skriver dem ind ved start:
   en streng bliver til indholdet, en liste bliver til punkter.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    NK.TEKST = {
        /* ----- Toplinjen ----------------------------------------------- */
        "titel": "Indgreb i en kemisk ligevægt",
        "undertitel": "Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺",

        /* ----- Introen -------------------------------------------------- */
        "intro-titel": "Indgreb i en kemisk ligevægt",
        "intro-formaal":
            "Jernthiocyanat-komplekset FeSCN²⁺ er blodrødt, mens jern(III) er svagt gult og " +
            "thiocyanat farveløst. Farven fortæller altså direkte, hvor ligevægten ligger. " +
            "Du laver et indgreb i hvert glas og sammenligner med glas 7, der ikke bliver rørt.",
        "intro-trin": [
            "Fyld stamopløsning fra kolben i glas 1 til 8. Glas 7 er referencen.",
            "Glas 1 til 3 får en spatelspids fast stof: Fe(NO₃)₃, ascorbinsyre og KSCN.",
            "Glas 4 får et par dråber AgNO₃, som fjerner SCN⁻ som hvidt bundfald.",
            "Glas 5 i vandbadet, glas 6 i isbadet. Mål temperaturen med termometeret.",
            "Sammenlign hvert glas med glas 7, og notér om det blev mørkere eller lysere."
        ],
        "intro-uheld":
            "Forkerte handlinger afvises ikke. Det, der kan gå galt, går galt, og Kemichael rydder op.",

        /* ----- Panelet --------------------------------------------------- */
        "glas-tom-start":
            "Klik på et glas for at se rumfang, temperatur og indhold. Alt andet gør du ved at trække.",
        "teori-kort":
            "Reaktionen er exoterm (ΔH = −20 kJ/mol), så varme flytter ligevægten mod venstre og " +
            "kulde mod højre. Tilsættes Fe³⁺ eller SCN⁻, flytter den mod højre; fjernes en af dem, " +
            "mod venstre. Ascorbinsyre reducerer Fe³⁺ til Fe²⁺, og AgNO₃ fælder SCN⁻ som AgSCN.",
        "uheld-tekst":
            "Rystes et glas for voldsomt, skvulper det ud. Et reagensglas kan ikke stå på bordet. " +
            "Glas, der slippes foran bordkanten, falder på gulvet. Kemichael rydder op.",

        /* ----- Forløbets trin ---------------------------------------------
           Hvert trin har en tekst (hvad eleven skal), et kort navn til
           listen og et hint. Betingelsen for, hvornår trinnet er gjort,
           står i js/forloeb.js — teksten og betingelsen holdes adskilt,
           så sproget kan læses og rettes uden at røre logikken. */
        "trin": {
            "fyld":  { kort: "Fyld de otte glas",
                       tekst: "Hæld stamopløsning fra kolben i glas 1 til 8 — omkring 3 mL i hvert.",
                       hint: "Tag fat i kolben, og slip den over et glas. Den bliver hængende, så et klik hælder igen." },
            "glas1": { kort: "Glas 1: mere Fe³⁺",
                       tekst: "Giv glas 1 en spatelspids Fe(NO₃)₃, og rør rundt. Hvad sker der med farven?",
                       hint: "Slip spatlen over pulverglasset med Fe(NO₃)₃, og derefter over glas 1. Rør med glasstaven." },
            "glas2": { kort: "Glas 2: C-vitamin",
                       tekst: "Giv glas 2 en spatelspids ascorbinsyre. Den reducerer Fe³⁺ til Fe²⁺.",
                       hint: "Ascorbinsyre er C-vitamin. Spatelspidsen tages i pulverglasset og slippes over glas 2." },
            "glas3": { kort: "Glas 3: mere SCN⁻",
                       tekst: "Giv glas 3 en spatelspids KSCN, og rør rundt.",
                       hint: "Pulverglasset med KSCN står ved siden af de to andre." },
            "glas4": { kort: "Glas 4: AgNO₃",
                       tekst: "Dryp AgNO₃ i glas 4. Sølv fælder thiocyanat som hvidt AgSCN.",
                       hint: "Dråbeflasken med AgNO₃ står på hylden. Slip den over glas 4 — et par dråber er nok." },
            "varme": { kort: "Glas 5: varme",
                       tekst: "Sæt glas 5 i vandbadet, og tænd varmepladen. Mål temperaturen med termometeret.",
                       hint: "Slip glas 5 over vandbadet, og klik på varmepladens kontakt." },
            "kulde": { kort: "Glas 6: kulde",
                       tekst: "Sæt glas 6 i isbadet, og lad det stå, til det er koldt.",
                       hint: "Isbadet står til højre. Slip glas 6 ned i det." },
            "billede": { kort: "Tag billedet",
                       tekst: "Tag et billede af stativet, og notér under hvert glas, om det blev mørkere, lysere eller ser ud som glas 7.",
                       hint: "Knappen Tag billede står her i panelet. Glassene på billedet bliver stående, som de ser ud nu." },
            "ryd":   { kort: "Ryd op",
                       tekst: "Hæld glassene ud i dunken med surt uorganisk affald, ét ad gangen.",
                       hint: "Tag et glas, og slip det over affaldsdunken." }
        },
        "forloeb-slut": "Alle ni trin er gjort. Bordet er ryddet, og billedet er noteret.",

        /* ----- Billedet ------------------------------------------------- */
        "billede-titel": "Billedet",
        "billede-tekst": "Glassene, som de så ud, da du trykkede. Notér under hvert glas, hvordan det ser ud i forhold til glas 7, som ikke fik noget indgreb.",

        /* ----- Bemærkninger undervejs --------------------------------- */
        "sig-reference": "Glas 7 skulle stå urørt. Nu er der ingen reference at sammenligne med.",
        "sig-to-indgreb": "Der er lavet to forskellige indgreb i samme glas. Så kan man ikke sige, hvad der virkede.",
        "sig-kig-igen": "Et af glassene er noteret anderledes, end det ser ud. Kig på billedet en gang til.",

        /* ----- Rundvisningen --------------------------------------------- */
        "rundvisning": [
            { sel: "#scene", titel: "Bordet", tekst: "Klik viser, træk gør. Tag fat i kolben, og slip den over et glas for at hælde." },
            { sel: "#glas-kort", titel: "Det valgte glas", tekst: "Klik på et glas, og se rumfang, temperatur, indhold og partiklerne i zoomboblen." },
            { sel: "#teori-kort", titel: "Teorien", tekst: "Den korte forklaring på, hvad hvert indgreb gør ved ligevægten." },
            { sel: "#logbog-kort", titel: "Logbog", tekst: "Notér dine aflæsninger undervejs. Knappen skriver det valgte glas' tal ind." },
            { sel: "#uheld-kort", titel: "Uheld", tekst: "Det, der kan gå galt, går galt. Kemichael kommer og tørrer op." },
            { sel: "#forfraknap", titel: "Start forfra", tekst: "Rydder bordet og stiller alt tilbage." }
        ]
    };
}());
