/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel B1

   Forklaringerne er kopieret ordret fra B-bogens fagordliste til
   kapitel B1 (NK_Undervisning/Kemibogen/b/fagord/kapitel-b1.qmd) den
   1. nov. 2026 med et lille script; sænkede tal er skrevet som tegn
   (v₀, Eₐ), og kursiv er taget af.
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det).
       Afsnittene hedder B1.1 til B1.5. */
    NK.KAPITEL = "B1";
    NK.ANTAL_FAGORD = 21;

    NK.FORKLARING = {
        /* B1.1 Reaktionshastighed */
        "reaktionshastighed": "Angiver, hvor meget koncentrationen af et stof ændrer sig pr. sekund. Symbolet er v, og enheden er M/s.",
        "gennemsnitshastighed": "Ændringen i koncentrationen i et tidsrum divideret med den tid, der er gået. På grafen er det hældningen på linjen mellem to punkter på kurven.",
        "tangent": "Ret linje, der rører kurven i et punkt og har samme hældning som kurven dér. Hældningen viser reaktionshastigheden til netop det tidspunkt.",
        "starthastighed": "Reaktionshastigheden i det øjeblik, reaktionen begynder (t = 0 s). Symbolet er v₀.",
        /* B1.2 Koncentration og sammenstød */
        "sammenstødsmodel": "Forklaring, der siger, at partikler kun kan reagere, når de rammer hinanden. Jo oftere det sker, jo hurtigere går reaktionen.",
        "hastighedsudtryk": "Formel, der viser, hvordan reaktionshastigheden afhænger af koncentrationerne. Eksponenterne i formlen kan kun findes ved forsøg.",
        "hastighedskonstant": "Konstanten k i formlen for reaktionshastigheden. Den har én værdi for den enkelte reaktion ved en bestemt temperatur.",
        "eksponent": "Tal, som en koncentration er opløftet til i formlen for reaktionshastigheden. Tallet findes ved forsøg og er som regel 0, 1 eller 2.",
        /* B1.3 Aktiveringsenergi */
        "energiprofil": "Graf, der viser stoffernes energi under en reaktion. Vejen fra reaktanter til produkter går over en bakke.",
        "det aktiverede kompleks": "Tilstanden på toppen af bakken i en energiprofil. De gamle bindinger er ved at blive brudt, og de nye er ved at blive dannet.",
        "aktiveringsenergi": "Den mindste energi, molekylerne skal støde sammen med for at kunne reagere. Symbolet er Eₐ, og enheden er kJ/mol.",
        "exoterm": "Siges om en reaktion, hvor produkterne har mindre energi end reaktanterne. Energiforskellen afgives til omgivelserne, som regel som varme.",
        "endoterm": "Siges om en reaktion, hvor produkterne har mere energi end reaktanterne. Reaktionen optager energi fra omgivelserne, som i en kuldepose.",
        /* B1.4 Temperatur */
        "temperatur": "Mål for, hvor meget bevægelsesenergi molekylerne har i gennemsnit. Jo højere temperaturen er, jo hurtigere bevæger molekylerne sig.",
        /* B1.5 Katalysatorer og enzymer */
        "katalysator": "Stof, der får en reaktion til at gå hurtigere uden selv at blive brugt. Stoffet giver reaktionen en vej med lavere aktiveringsenergi.",
        "inhibitor": "Stof, der får en reaktion til at gå langsommere. Mange inhibitorer binder sig til katalysatoren, så den mister sin virkning.",
        "enzym": "Protein, der virker som katalysator i en levende organisme. Navnet ender som regel på -ase.",
        "substrat": "Stoffet, som et enzym arbejder på. For enzymet amylase i spyt er det stivelse.",
        "aktivt center": "Fordybning i et enzym, hvor substratet passer præcis ind som en nøgle i en lås.",
        "optimum": "Den temperatur, hvor et enzym arbejder hurtigst. Ved højere temperatur begynder enzymet at miste sin form.",
        "denaturere": "At miste sin form, som et enzym gør ved for høj temperatur. Bagefter virker enzymet ikke."
    };

    /* Fagord fra listen, der med vilje ikke er paa en figur. Brugeren
       1. nov. 2026, da figurerne var lavet: "Fjern hele delen med
       sammenstødsmodel" (vinduerne med sammenstoed i B1.2) og "fjern
       energidiagrammet fra 1.5", hvor katalysator sad paa den lave kurve.
       Brugeren vil senere slaa afsnit i kapitel B1 sammen (B1.2 og B1.4),
       saa kapitlet faar 3 eller 4 afsnit. */
    NK.UDELADT = ["sammenstødsmodel", "katalysator"];

    /* Ingen ord fra andre kapitler. Ordet tommelfingerregel (titlen paa
       bogens boks i B1.4) var med som ord, der er vaerd at traene, men er
       taget ud paa brugerens oenske 1. nov. 2026. */
    NK.TIDLIGERE = {};

    /* Fagord, der med vilje staar paa mere end én figur (brugeren 1. nov.
       2026: "der maa gerne vaere lidt repeterende oevelser"):
       reaktionshastighed i B1.1 og ved soejlerne i B1.4,
       aktiveringsenergi i B1.3 og ved energifordelingen i B1.4. */
    NK.GENTAGET = ["reaktionshastighed", "aktiveringsenergi"];

    /* De fem faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#b1.3 */
    NK.FANER = [
        { id: "hastighed",   nr: "B1.1", titel: "Reaktionshastighed", hash: ["hastighed", "reaktionshastighed", "b1.1"] },
        { id: "sammenstoed", nr: "B1.2", titel: "Koncentration",      hash: ["sammenstoed", "koncentration", "hastighedsudtryk", "b1.2"] },
        { id: "aktivering",  nr: "B1.3", titel: "Aktiveringsenergi",  hash: ["aktivering", "aktiveringsenergi", "energiprofil", "b1.3"] },
        { id: "temperatur",  nr: "B1.4", titel: "Temperatur",         hash: ["temperatur", "b1.4"] },
        { id: "katalyse",    nr: "B1.5", titel: "Enzymer",            hash: ["katalyse", "katalysatorer", "enzymer", "b1.5"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.hastighed = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());
