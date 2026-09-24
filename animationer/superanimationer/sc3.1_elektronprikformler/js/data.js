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

   FEJL: Kemichaels tegninger til fanen Find fejlen, se js/sim_fejl.js.
   INTRO: hans praesentation af de to faner, se js/laerer.js.
   valensHint og taelleHint: hint, der passer til den fejl, eleven laver.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    NK.ELEMENTER = {
        1:  { s: "H",  n: "Hydrogen",  v: 1, g: 1,  p: 1 },
        6:  { s: "C",  n: "Carbon",    v: 4, g: 14, p: 2 },
        7:  { s: "N",  n: "Nitrogen",  v: 5, g: 15, p: 2 },
        8:  { s: "O",  n: "Oxygen",    v: 6, g: 16, p: 2 },
        17: { s: "Cl", n: "Chlor",     v: 7, g: 17, p: 3 },
        35: { s: "Br", n: "Brom",      v: 7, g: 17, p: 4 }
    };

    /* Et forkert antal valenselektroner giver et hint, der passer til
       fejlen: atomnummeret (alle elektronerne), det antal atomet mangler,
       eller periodens nummer i stedet for gruppens. */
    NK.valensHint = function (z, tal) {
        var el = NK.ELEMENTER[z];
        if (tal === z) return el.s + " har atomnummer " + z + ". Det er alle elektronerne, ikke kun dem i yderste skal.";
        if (z !== 1 && tal === 8 - el.v) return "Det er det antal, " + el.n.toLowerCase() + " mangler for at få 8. Hvor mange har det?";
        if (tal === el.p) return el.s + " står i periode " + el.p + ". Det er rækken. Se på kolonnen.";
        return "Se på, hvilken hovedgruppe " + el.s + " står i.";
    };

    NK.OPGAVER = [
        {
            f: "H₂O", navn: "Vand", atomer: [1, 8, 1], sprite: "molekyle_h2o.svg",
            hint: "Oxygen har 6 valenselektroner. Hvor mange bruges på de to bindinger til hydrogen, og hvor mange bliver tilbage som frie elektronpar?"
        },
        {
            f: "NH₃", navn: "Ammoniak", atomer: [1, 7, 1, 1], sprite: "molekyle_nh3.svg",
            hint: "Nitrogen har 5 valenselektroner. Tre bruges på bindingerne til hydrogen. Hvad sker der med de to sidste?"
        },
        {
            f: "Br₂", navn: "Dibrom", atomer: [35, 35], sprite: "molekyle_br2.svg",
            hint: "Brom har 7 valenselektroner og mangler én. Hvor mange bindinger skal der så være mellem de to bromatomer?"
        },
        {
            f: "CO₂", navn: "Kuldioxid", atomer: [8, 6, 8], sprite: "molekyle_co2.svg",
            hint: "Med to enkeltbindinger har carbon kun 6 elektroner omkring sig. Klik på de fælles elektroner mellem to atomer for at lave en dobbeltbinding."
        },
        {
            f: "CH₄", navn: "Methan", atomer: [6, 1, 1, 1, 1], sprite: "molekyle_ch4.svg",
            hint: "Carbon har 4 valenselektroner og danner 4 bindinger. Bliver der nogen elektroner tilbage til frie elektronpar?"
        },
        {
            f: "HCN", navn: "Blåsyre", atomer: [1, 6, 7], sprite: "molekyle_hcn.svg",
            hint: "Carbon skal have 4 bindinger i alt, og én går til hydrogen. Hvor mange skal der så være til nitrogen? Klik flere gange på de fælles elektroner for at lave flere bindinger."
        },
        {
            f: "N₂", navn: "Kvælstof", atomer: [7, 7], sprite: "molekyle_n2.svg",
            hint: "Nitrogen har 5 valenselektroner og mangler 3. Hvor mange elektronpar skal de to nitrogenatomer dele?"
        },
        {
            f: "CH₂O", navn: "Formaldehyd", atomer: [8, 6, 1, 1], sprite: "molekyle_ch2o.svg",
            hint: "Carbon skal have 4 bindinger i alt, og to går til hydrogen. Hvor mange skal der så være til oxygen?"
        },
        {
            f: "C₂H₂", navn: "Ethyn", atomer: [1, 6, 6, 1], sprite: "molekyle_c2h2.svg",
            hint: "Hvert carbonatom binder til ét hydrogenatom og til det andet carbonatom. Hvor mange bindinger skal der være mellem de to carbonatomer, før begge har 8 elektroner?"
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

    /* ----- Find fejlen: Kemichaels tegninger ------------------------------
       Hver tegning er ét molekyle, tegnet med præcis de samme regler som
       byggefanen. frie er det, Kemichael har tegnet forkert: { atomindeks:
       antal frie elektroner }. Atomer uden frie tegnes, som de skal.
       Hvilket atom der er forkert, og hvor mange elektroner det har,
       regnes ud af tegningen (NK.atomStatus), ikke skrevet her.

       Fejlene er dem, elever faktisk laver: glemte frie par, for mange
       frie par, frie par paa hydrogen, hydrogen i midten, for faa eller
       for mange bindinger til carbon. Tre tegninger er rigtige.

       ret er den rettede tegning: som standard samme atomer, geometri og
       bindinger uden frie, ellers det, der staar i ret. */
    var GEO_H2O = { type: "stjerne", hub: 1, vinkler: { 0: 217.75, 2: 322.25 } };
    var GEO_TREKANT = { type: "stjerne", hub: 1, vinkler: { 0: 270, 2: 30, 3: 150 } };
    var GEO_KRYDS = { type: "stjerne", hub: 0, vinkler: { 1: 270, 2: 0, 3: 90, 4: 180 } };
    var KAEDE = { type: "kaede" };

    NK.FEJL = [
        {
            f: "H₂O", atomer: [1, 8, 1], geo: GEO_H2O,
            bindinger: [[1, 0, 1], [1, 2, 1]], frie: { 1: 0 },
            hint: "Oxygen har 6 valenselektroner, og to bruges på bindingerne. Hvor er resten?",
            forklaring: "Oxygen har kun 4 elektroner omkring sig. Med to frie elektronpar har det 8."
        },
        {
            f: "HCl", atomer: [1, 17], geo: KAEDE,
            bindinger: [[0, 1, 1]], frie: { 1: 4 },
            hint: "Chlor har 7 valenselektroner, og én bruges på bindingen. Hvor mange frie skal der så være?",
            forklaring: "Chlor har kun 6 elektroner omkring sig. Med tre frie elektronpar har det 8."
        },
        {
            f: "H₂O", atomer: [1, 8, 1], geo: GEO_H2O,
            bindinger: [[1, 0, 1], [1, 2, 1]],
            hint: "Tæl om oxygen: både de frie elektroner og dem i bindingerne. Hydrogen skal have 2.",
            forklaring: "Oxygen har 4 elektroner i bindingerne og 4 i de frie par: 8."
        },
        {
            f: "NH₃", atomer: [1, 7, 1, 1], geo: GEO_TREKANT,
            bindinger: [[1, 0, 1], [1, 2, 1], [1, 3, 1]], frie: { 1: 4 },
            hint: "Nitrogen har 5 valenselektroner, og tre bruges på bindingerne. Hvor mange er der tilbage?",
            forklaring: "Nitrogen har 10 elektroner omkring sig. Med ét frit elektronpar har det 8."
        },
        {
            f: "CH₄", atomer: [6, 1, 1, 1, 1], geo: GEO_KRYDS,
            bindinger: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], frie: { 2: 2 },
            hint: "Hydrogen har plads til 2 elektroner, ikke 8. Tæl om hvert hydrogenatom.",
            forklaring: "Et hydrogenatom har 4 elektroner omkring sig. Hydrogen har kun sin binding."
        },
        {
            f: "CO₂", atomer: [8, 6, 8], geo: KAEDE,
            bindinger: [[0, 1, 1], [1, 2, 1]], frie: { 0: 6, 1: 0, 2: 6 },
            ret: { bindinger: [[0, 1, 2], [1, 2, 2]] },
            hint: "Carbon har 4 valenselektroner og danner 4 bindinger. Hvor mange bindinger har det her?",
            forklaring: "Carbon har kun 4 elektroner omkring sig. Med to dobbeltbindinger har alle atomer 8."
        },
        {
            f: "N₂", atomer: [7, 7], geo: KAEDE,
            bindinger: [[0, 1, 3]],
            hint: "Tæl om hvert nitrogenatom. Alle 6 elektroner i tripelbindingen tæller med hos begge.",
            forklaring: "Hvert nitrogen har 6 elektroner i tripelbindingen og 2 i det frie par: 8."
        },
        {
            f: "H₂O", atomer: [1, 1, 8], geo: KAEDE,
            bindinger: [[0, 1, 1], [1, 2, 1]], frie: { 2: 6 },
            ret: { atomer: [1, 8, 1], geo: GEO_H2O, bindinger: [[1, 0, 1], [1, 2, 1]] },
            hint: "Hydrogen kan kun danne én binding. Passer det her?",
            forklaring: "Hydrogen i midten har 4 elektroner. Hydrogen danner kun én binding, så oxygen sidder i midten."
        },
        {
            f: "CH₂O", atomer: [8, 6, 1, 1], geo: GEO_TREKANT,
            bindinger: [[1, 0, 1], [1, 2, 1], [1, 3, 1]], frie: { 0: 6, 1: 0 },
            ret: { bindinger: [[1, 0, 2], [1, 2, 1], [1, 3, 1]] },
            hint: "Carbon danner 4 bindinger. Hvor mange har det her?",
            forklaring: "Carbon har kun 6 elektroner omkring sig. Med en dobbeltbinding til oxygen har begge 8."
        },
        {
            f: "Br₂", atomer: [35, 35], geo: KAEDE,
            bindinger: [[0, 1, 1]], frie: { 0: 8 },
            hint: "Brom har 7 valenselektroner, og én bruges på bindingen. Hvor mange frie er der så?",
            forklaring: "Det ene bromatom har 10 elektroner omkring sig. Med tre frie elektronpar har det 8."
        },
        {
            f: "C₂H₂", atomer: [1, 6, 6, 1], geo: KAEDE,
            bindinger: [[0, 1, 1], [1, 2, 3], [2, 3, 1]],
            hint: "Tæl om hvert carbonatom: bindingen til hydrogen og alle elektroner i tripelbindingen.",
            forklaring: "Hvert carbon har 2 elektroner i bindingen til hydrogen og 6 i tripelbindingen: 8."
        },
        {
            f: "CO₂", atomer: [8, 6, 8], geo: KAEDE,
            bindinger: [[0, 1, 3], [1, 2, 2]], frie: { 0: 2, 1: 0, 2: 4 },
            ret: { bindinger: [[0, 1, 2], [1, 2, 2]] },
            hint: "Carbon danner 4 bindinger. Tæl dem her.",
            forklaring: "Carbon har 5 bindinger og 10 elektroner omkring sig. Med to dobbeltbindinger har alle 8."
        }
    ];

    /* Et forkert elektrontal paa fanen Find fejlen giver et hint, der
       passer til maaden, der er talt forkert paa. st er atomStatus. */
    NK.taelleHint = function (st, tal) {
        if (st.bindingssum > 0 && tal === st.frie + st.bindingssum) return "Begge elektroner i en binding tæller med hos atomet, ikke kun den ene.";
        if (st.bindingssum > 0 && tal === st.frie) return "Husk elektronerne i bindingerne. De tæller med.";
        if (st.frie > 0 && tal === 2 * st.bindingssum) return "Husk de frie elektroner. De tæller også med.";
        if (tal === st.maal) return "Det er det antal, der skal være. Tæl, hvor mange der er.";
        return "Tæl igen. Alle prikker om atomet tæller, også dem i bindingerne.";
    };

    /* ----- Kemichael praesenterer fanerne -------------------------------
       To eller tre replikker paa hoejst ca. 60 tegn. Mens han siger linjen
       INTRO_PEG, peger han paa det, den handler om. */
    NK.INTRO = {
        byg: [
            "Her bygger du molekyler af atomer.",
            "Først: hvor mange elektroner i yderste skal?",
            "Elektronerne tæller du selv. Jeg drikker kaffe."
        ],
        fejl: [
            "Jeg har tegnet prikformler i nat. Nogle er forkerte.",
            "Klik på det atom, jeg har tegnet forkert.",
            "Nogle er rigtige. Det sker også for mig."
        ]
    };
    NK.INTRO_PEG = 1;

    NK.PT_KORT = [
        1, 0, 0, 0, 0, 0, 0, 2,
        3, 4, 5, 6, 7, 8, 9, 10,
        11, 12, 13, 14, 15, 16, 17, 18,
        0, 0, 0, 0, 0, 0, 35, 0
    ];
}());
