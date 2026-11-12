/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel B4

   Forklaringerne er kopieret ordret fra B-bogens fagordliste til
   kapitel B4 (NK_Undervisning/Kemibogen/b/fagord/kapitel-b4.qmd) den
   2. nov. 2026 med et lille script; saenkede tal er skrevet som tegn
   (−NH₂), og kursiv er taget af.
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det).
       Afsnittene hedder B4.1 til B4.7. */
    NK.KAPITEL = "B4";
    NK.ANTAL_FAGORD = 47;

    NK.FORKLARING = {
        /* B4.1 Carbonhydriders reaktioner */
        "substitution": "Reaktion, hvor et atom erstattes af et andet atom. Alkaner reagerer sådan med dichlor og dibrom, når blandingen belyses.",
        "halogenalkan": "Stof, hvor hydrogenatomer i en carbonkæde er erstattet af chlor-, brom- eller iodatomer. Chlormethan og 2-brompropan er eksempler.",
        "umættet": "Siges om et carbonhydrid med dobbelt- eller tripelbindinger mellem carbonatomer. Det gælder alkener og alkyner.",
        "addition": "Reaktion, hvor en dobbeltbinding åbner sig, og der bindes et atom til hvert carbonatom. To stoffer bliver til ét.",
        "polyaddition": "Reaktion, hvor tusindvis af alkenmolekyler bindes sammen til ét kædeformet molekyle. Dobbeltbindingerne åbner sig, og mange slags plast fremstilles sådan.",
        "monomer": "Det lille molekyle, der bliver sat sammen i tusindvis til en lang kæde. Ethen er et eksempel.",
        "polymer": "Den lange kæde, der dannes, når tusindvis af små molekyler bliver sat sammen. Plasten i poser og flasker er et eksempel.",
        "makromolekyle": "Meget stor partikel, hvor tusindvis af atomer er bundet sammen. Polyethen og proteiner er eksempler.",
        "aromatisk": "Siges om et stof med en benzenring. Ringen er særlig stabil og reagerer ved substitution, ikke ved addition.",
        "elimination": "Reaktion, hvor to atomer eller grupper på nabocarbonatomer fraspaltes, så der dannes C=C. Ét stof bliver til to.",
        /* B4.2 Alkoholer */
        "alkohol": "Organisk stof med OH-grupper bundet til carbonatomer, der kun har enkeltbindinger. Navnet ender på -ol.",
        "hydroxygruppe": "Atomerne −OH bundet til et carbonatom. De findes i alkoholer og phenoler.",
        "phenol": "Stof, hvor en OH-gruppe sidder direkte på en benzenring. Stoffet er en svag syre, mens alkoholer praktisk talt ikke afgiver hydroner til vand.",
        "primær alkohol": "OH-gruppen sidder på et carbonatom, der er bundet til ét andet carbonatom. Ethanol er et eksempel.",
        "sekundær alkohol": "OH-gruppen sidder på et carbonatom, der er bundet til to andre carbonatomer. Propan-2-ol er et eksempel.",
        "tertiær alkohol": "OH-gruppen sidder på et carbonatom, der er bundet til tre andre carbonatomer. Carbonatomet sidder derfor ved en forgrening.",
        "gæring": "Proces, hvor levende celler omdanner glucose til ethanol og carbondioxid. Ethanolen i øl og vin dannes på den måde.",
        /* B4.3 Aldehyder og ketoner */
        "carbonylgruppe": "Et C-atom og et O-atom bundet med en dobbeltbinding, C=O. Findes blandt andet i aldehyder og ketoner.",
        "aldehyd": "Stof, hvor C=O sidder for enden af kæden med et hydrogenatom på carbonatomet. Navnet ender på -al.",
        "keton": "Stof, hvor C=O sidder inde i kæden, så carbonatomet er bundet til to andre carbonatomer. Navnet ender på -on.",
        "DNPH": "Stof, der giver gult eller orange bundfald med både aldehyder og ketoner. Et bundfald viser, at stoffet er et aldehyd eller en keton.",
        "Tollens' test": "Påvisning af aldehyder med sølv(I)ioner i basisk opløsning. Et aldehyd giver et sølvspejl, mens en keton intet sølvspejl giver.",
        /* B4.4 Carboxylsyrer */
        "carboxylsyre": "Organisk stof med gruppen −COOH, som kan afgive en hydron. Findes i eddike, citroner og yoghurt.",
        "carboxylgruppe": "Atomerne −COOH. C=O og OH sidder på det samme C-atom, og hydrogenatomet kan afgives som en hydron.",
        "svag syre": "Stof, hvor kun en lille del af molekylerne har afgivet en hydron i vand. I en 0,1 M opløsning af ethansyre er det omkring 1 %.",
        "sæbe": "Natriumsalte af fedtsyrer. Fedtsyrens baseform har en ladet, hydrofil ende og en lang, hydrofob hale, så fedt kan fordeles som små dråber i vand.",
        /* B4.5 Estere */
        "ester": "Stof, der dannes af en carboxylsyre og en alkohol, mens der fraspaltes vand. Mange dufter af frugt.",
        "kondensation": "Reaktion, hvor to molekyler sættes sammen, og der fraspaltes et lille molekyle. Det er næsten altid vand.",
        "estergruppe": "Atomerne −COO−, som holder delen fra syren og delen fra alkoholen sammen. De opstår ved en kondensation.",
        "hydrolyse": "Spaltning af et molekyle med vand, for eksempel en ester til carboxylsyre og alkohol. Det modsatte af en kondensation.",
        "sur hydrolyse": "Spaltning af en ester med vand, hvor en syre er katalysator. Reaktionen er en ligevægt.",
        "forsæbning": "Spaltning af en ester i stærkt basisk miljø. Syren bliver straks til sin baseform, så reaktionen forløber fuldstændig.",
        "teoretisk udbytte": "Den masse af produkt, der kan dannes, hvis hele den begrænsende faktor bliver omdannet.",
        "udbytteprocent": "Forholdet mellem den fremstillede og den størst mulige masse af produkt, gange 100 %. Et eksempel er 60 %.",
        /* B4.6 Aminer */
        "amin": "Organisk stof, hvor et eller flere hydrogenatomer i ammoniak er erstattet af carbonkæder.",
        "aminogruppe": "Atomerne −NH₂ bundet til en carbonkæde. Nitrogenatomet har et frit elektronpar og kan optage en hydron.",
        "primær amin": "Nitrogenatomet er bundet til én carbonkæde og to hydrogenatomer. Skrives R−NH₂.",
        "sekundær amin": "Nitrogenatomet er bundet til to carbonkæder og ét hydrogenatom. Skrives R−NH−R′.",
        "tertiær amin": "Nitrogenatomet er bundet til tre carbonkæder og har intet hydrogenatom. Molekylerne kan derfor ikke danne hydrogenbindinger med hinanden.",
        "svag base": "Stof, hvor kun en lille del af molekylerne har optaget en hydron i vand. Ammoniak er et eksempel.",
        "amidgruppe": "Atomerne −CO−NH−, som opstår, når en carboxylsyre og en amin kondenserer. De holder aminosyrerne sammen i et protein.",
        "aminosyre": "Molekyle med både −NH₂ og −COOH. Hundredvis af dem sat sammen giver et protein.",
        "protein": "Makromolekyle af typisk hundredvis af aminosyrer. Det dannes ved polykondensation.",
        "polykondensation": "Reaktion, hvor molekyler med en reaktiv gruppe i hver ende danner en lang kæde. Der fraspaltes vand, og sådan dannes både proteiner og nylon.",
        /* B4.7 Overblik: reaktionstyper og test */
        "oxidation": "Reaktion, hvor et carbonatom får flere bindinger til oxygen eller færre til hydrogen. En primær alkohol bliver sådan til et aldehyd.",
        "reduktion": "Det modsatte af en oxidation. C=O i propanon bliver for eksempel omdannet til OH i propan-2-ol.",
        "syntese": "Fremstilling af et stof ud fra andre stoffer, ofte i flere trin. Den planlægges baglæns fra produktet."
    };

    /* Fagord fra listen, der med vilje ikke er paa en figur.
       makromolekyle: bogens eksempler er polyethen (B4.1) og proteiner
       (B4.6), men paa polyethen passer polymer ogsaa, og paa et protein
       passer protein ogsaa. Brugerens regel fra B3 (2. nov. 2026): ord, der
       kun betyder det samme i et saertilfaelde, skal have hver sin figur,
       hvor kun det ene passer, og et fagord skal ikke tvinges ind ("R er et
       underligt fagord"). Der er ingen naturlig figur, hvor kun
       makromolekyle passer, saa det er taget ud, til brugeren har sagt til. */
    NK.UDELADT = ["makromolekyle"];

    /* Ingen ord fra andre kapitler. */
    NK.TIDLIGERE = {};

    /* Ingen fagord staar paa mere end én figur. */
    NK.GENTAGET = [];

    /* De syv faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#b4.5 */
    NK.FANER = [
        { id: "carbonhydrider", nr: "B4.1", titel: "Reaktioner",        hash: ["carbonhydrider", "reaktionstyper", "b4.1"] },
        { id: "alkoholer",      nr: "B4.2", titel: "Alkoholer",         hash: ["alkoholer", "b4.2"] },
        { id: "carbonyl",       nr: "B4.3", titel: "Aldehyder",         hash: ["carbonyl", "aldehyder", "ketoner", "b4.3"] },
        { id: "syrer",          nr: "B4.4", titel: "Syrer",             hash: ["syrer", "carboxylsyrer", "b4.4"] },
        { id: "estere",         nr: "B4.5", titel: "Estere",            hash: ["estere", "b4.5"] },
        { id: "aminer",         nr: "B4.6", titel: "Aminer",            hash: ["aminer", "b4.6"] },
        { id: "overblik",       nr: "B4.7", titel: "Overblik",          hash: ["overblik", "syntese", "b4.7"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.estere = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());
