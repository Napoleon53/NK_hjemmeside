/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel 3

   Forklaringerne er kopieret ordret fra Kemibogens fagordliste til
   kapitel 3 (NK_Undervisning/Kemibogen/fagord/kapitel-3.qmd) den
   1. nov. 2026; sænkede tal er skrevet som tegn (H₂O, N₂).
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det) */
    NK.KAPITEL = "3";
    NK.ANTAL_FAGORD = 21;

    NK.FORKLARING = {
        /* 3.1 Elektronparbindinger */
        "fælles elektronpar": "To elektroner, som to atomer deler. De hører til begge atomer på én gang og holder dem sammen.",
        "elektronparbinding": "Det, der holder atomerne sammen i et molekyle. To ikke-metaller deler elektroner med hinanden.",
        "molekyle": "Atomer af ikke-metaller, der er bundet sammen, for eksempel H₂O og O₂.",
        "frit elektronpar": "To elektroner i yderste skal, som sidder sammen uden at være med i en binding. Oxygenatomet i vand har to sådanne par.",
        "elektronprikformel": "Tegning, hvor elektronerne i yderste skal er vist som små punkter omkring atomets symbol.",
        "stregformel": "Tegning af et molekyle, hvor hvert fælles elektronpar er en linje mellem atomerne. Den viser, hvilke atomer der er bundet sammen.",
        "enkeltbinding": "Her deler to atomer kun ét elektronpar. Tegnes med én streg i en stregformel.",
        "dobbeltbinding": "Her deler to atomer to elektronpar. Tegnes med to streger, som mellem C og O i carbondioxid.",
        "tripelbinding": "Her deler to atomer tre elektronpar. Tegnes med tre streger, som i dinitrogenmolekylet N₂.",
        /* 3.2 Navngivning og molekylers form */
        "talforstavelse": "Del af et molekyles navn, der angiver, hvor mange atomer der er af et grundstof. Di betyder 2, og tri betyder 3.",
        "tetraeder": "Pyramide med fire ens, trekantede sider. Fire elektronpar omkring et atom peger ud mod dens hjørner, som i methan.",
        "trekantet pyramide": "Formen af ammoniak. De tre hydrogenatomer danner bunden, og nitrogenatomet sidder i toppen.",
        "vinklet molekyle": "Formen af vand, hvor de tre atomer ikke ligger på en ret linje. De frie elektronpar skubber de to bindinger sammen.",
        /* 3.3 Elektronegativitet og polære bindinger */
        "elektronegativitet": "Mål for, hvor kraftigt et atom trækker i de fælles elektroner i en binding. Fluor har den højeste af alle grundstoffer.",
        "upolær binding": "Her deler to atomer elektronparret ligeligt. Forskellen i elektronegativitet er under 0,5, som i C−H.",
        "polær binding": "Her ligger det fælles elektronpar tættest på det ene atom, som bliver delvist negativt. O−H i vand er et eksempel.",
        /* 3.4 Polære molekyler og blandbarhed */
        "polært molekyle": "Partikel af flere atomer med en positiv og en negativ ende. Vand og ammoniak er eksempler.",
        "polær gruppe": "Del af et stort molekyle med et oxygenatom, for eksempel −OH. Der skal 4 carbonatomer til at ophæve virkningen af én.",
        "blandbarhed": "Fortæller, om to væsker bliver til én, når de hældes sammen. Det gør de, når begge er polære, eller begge er upolære.",
        "polært stof": "Består af molekyler med en positiv og en negativ ende. Det kan opløses i vand, som ethanol og sukker.",
        "upolært stof": "Består af molekyler uden ladede ender. Det kan ikke opløses i vand, som olie og heptan."
    };

    /* Fagord fra listen, der med vilje ikke er paa en figur */
    NK.UDELADT = [];

    /* Fagord fra et tidligere kapitel, som eleven saetter paa igen
       (brugeren 1. nov. 2026: "der maa gerne vaere lidt repeterende
       oevelser"). Forklaringen er fra det kapitels fagordliste. */
    NK.TIDLIGERE = {
        "ionbinding": "Den elektriske tiltrækning mellem partikler med modsat ladning, for eksempel Na⁺ og Cl⁻."
    };
    Object.keys(NK.TIDLIGERE).forEach(function (o) { NK.FORKLARING[o] = NK.TIDLIGERE[o]; });

    /* Fagord, der med vilje staar paa mere end én figur: ionbinding i 3.1
       ved siden af elektronparbindingen og i 3.3 ved siden af de polaere */
    NK.GENTAGET = ["ionbinding"];

    /* De fire faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#form */
    NK.FANER = [
        { id: "binding", nr: "3.1", titel: "Elektronparbindinger", hash: ["binding", "elektronparbindinger", "3.1"] },
        { id: "form",    nr: "3.2", titel: "Navngivning og form",  hash: ["form", "navngivning", "navne-og-form", "3.2"] },
        { id: "en",      nr: "3.3", titel: "Elektronegativitet",   hash: ["en", "elektronegativitet", "polaere-bindinger", "3.3"] },
        { id: "polaer",  nr: "3.4", titel: "Polære molekyler",     hash: ["polaer", "polaere-molekyler", "blandbarhed", "3.4"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.form = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());
