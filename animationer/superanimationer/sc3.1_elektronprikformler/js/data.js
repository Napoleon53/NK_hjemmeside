/* =====================================================================
   data.js - grundstoffer, opgaver og geometri for sc3.1

   ELEMENTER: symbol, navn, valenselektroner (v), gruppe i det periodiske
   system (g, bruges til at taeste i lommeversionen af tabellen).

   OPGAVER: hver opgave er ét molekyle. "atomer" er en liste af atomnumre
   i den raekkefoelge, byggepladserne placeres i banen. "hint" vises kun,
   naar eleven selv beder om det - se js/sim_byg.js.

   GEOMETRI: idealiseret 2D-bindingsvinkel pr. opgave, indekseret til
   OPGAVER[].atomer. type "kaede": atomerne ligger på en ret linje i
   array-raekkefoelge (lineaere molekyler). type "stjerne": "hub" er
   centralatomet (ved origo); "vinkler" giver retningen (grader) hvert
   andet atom sidder i, så den virkelige bindingsvinkel genskabes.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    NK.ELEMENTER = {
        1:  { s: "H",  n: "Hydrogen",  v: 1, g: 1 },
        6:  { s: "C",  n: "Carbon",    v: 4, g: 14 },
        7:  { s: "N",  n: "Nitrogen",  v: 5, g: 15 },
        8:  { s: "O",  n: "Oxygen",    v: 6, g: 16 },
        17: { s: "Cl", n: "Chlor",     v: 7, g: 17 },
        35: { s: "Br", n: "Brom",      v: 7, g: 17 }
    };

    NK.OPGAVER = [
        {
            f: "H₂O", navn: "Vand", atomer: [1, 8, 1], sprite: "molekyle_h2o.svg",
            hint: "Tæl ilts valenselektroner. Hvor mange bruges på de to bindinger til hydrogen - og hvor mange bliver tilbage som frie par?"
        },
        {
            f: "NH₃", navn: "Ammoniak", atomer: [1, 7, 1, 1], sprite: "molekyle_nh3.svg",
            hint: "Nitrogen har 5 valenselektroner. Tre bruges på bindingerne til hydrogen - hvad sker der med den femte?"
        },
        {
            f: "Br₂", navn: "Dibrom", atomer: [35, 35], sprite: "molekyle_br2.svg",
            hint: "Brom har 7 valenselektroner hver. Én binding giver hvert atom del i to elektroner mere - tæl efter, om det rækker til oktetreglen."
        },
        {
            f: "CO₂", navn: "Kuldioxid", atomer: [8, 6, 8], sprite: "molekyle_co2.svg",
            hint: "Prøv at tælle, hvor mange elektroner kulstof når op på med kun enkeltbindinger til begge iltatomer. Er det nok?"
        },
        {
            f: "CH₄", navn: "Methan", atomer: [6, 1, 1, 1, 1], sprite: "molekyle_ch4.svg",
            hint: "Kulstof har 4 valenselektroner og danner 4 bindinger. Bliver der noget tilbage til frie par?"
        },
        {
            f: "HCN", navn: "Blåsyre", atomer: [1, 6, 7], sprite: "molekyle_hcn.svg",
            hint: "Kulstof skal i alt bruge 4 elektroner på bindinger. Én går til hydrogen - hvor stærk skal bindingen til nitrogen så være?"
        },
        {
            f: "N₂", navn: "Kvælstof", atomer: [7, 7], sprite: "molekyle_n2.svg",
            hint: "Nitrogen har 5 valenselektroner. Med kun én binding mangler der elektroner i oktetten - prøv en stærkere binding."
        },
        {
            f: "CH₂O", navn: "Formaldehyd", atomer: [8, 6, 1, 1], sprite: "molekyle_ch2o.svg",
            hint: "Kulstof skal bruge 4 elektroner på bindinger i alt. To går til hydrogenatomerne - hvor stærk skal bindingen til ilt så være?"
        },
        {
            f: "C₂H₂", navn: "Ethyn", atomer: [1, 6, 6, 1], sprite: "molekyle_c2h2.svg",
            hint: "Hvert kulstof binder kun til ét hydrogen og det andet kulstof. Hvor stærk skal bindingen mellem de to kulstofatomer være, for at begge kulstofatomer når oktetreglen?"
        }
    ];

    NK.OPGAVE_GEOMETRI = [
        { type: "stjerne", hub: 1, vinkler: { 0: 217.75, 2: 322.25 } },          // H2O ~104,5°
        { type: "stjerne", hub: 1, vinkler: { 0: 270, 2: 30, 3: 150 } },         // NH3 (fladtrykt, 120° imellem)
        { type: "kaede" },                                                       // Br2
        { type: "kaede" },                                                       // CO2 (lineaer)
        { type: "stjerne", hub: 0, vinkler: { 1: 45, 2: 135, 3: 225, 4: 315 } }, // CH4 (fladtrykt kryds)
        { type: "kaede" },                                                       // HCN (lineaer)
        { type: "kaede" },                                                       // N2
        { type: "stjerne", hub: 1, vinkler: { 0: 270, 2: 30, 3: 150 } },         // CH2O ~120°
        { type: "kaede" }                                                        // C2H2 (lineaer)
    ];

    NK.PT_KORT = [
        1, 0, 0, 0, 0, 0, 0, 2,
        3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18,
        0, 0, 0, 0, 0, 0, 35, 0
    ];
}());
