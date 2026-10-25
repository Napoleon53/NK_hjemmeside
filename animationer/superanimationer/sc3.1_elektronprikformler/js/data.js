/* =====================================================================
   data.js - grundstofferne, molekylerne, elevtegningerne og teksterne

   Alt, der er kemi eller tekst, staar her. Reglerne for, hvordan
   elektronerne parres og tegnes, staar i js/prik.js.

   EL: symbol, navn (som i bogen), atomnavn (til "et oxygenatom"),
   valenselektroner v (= hovedgruppen), hovedgruppe g, periode p og
   farven paa atomets egne elektroner. Bogen farver elektronerne efter
   atomet (oxygen blaa, hydrogen groen), saa man kan se, at et faelles
   elektronpar har én elektron fra hvert atom.

   MOLEKYLER: atomerne i den raekkefoelge, de ligger paa bordet fra
   start, facit (gitterpladser og bindinger, bruges af Vis svaret og
   selvtesten), om (det atom, eleven taeller omkring) og hint.

   FEJL: elevtegningerne til fanen Find fejlen (fra den gamle udgave,
   hvor Kemichael havde tegnet dem). frie er det antal frie elektroner,
   tegningen har ved et atom; atomer uden frie er tegnet, som de skal.
   Hvilket atom der er forkert, regnes ud af tegningen (NK.Prik.fejlAtomer),
   ikke skrevet her.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Grundstofferne ---------------------------------------------- */
    D.EL = {
        1:  { s: "H",  navn: "hydrogen", atom: "hydrogenatom", v: 1, g: 1, p: 1, farve: "#5fd38a" },
        6:  { s: "C",  navn: "carbon",   atom: "carbonatom",   v: 4, g: 4, p: 2, farve: "#ffad5c" },
        7:  { s: "N",  navn: "nitrogen", atom: "nitrogenatom", v: 5, g: 5, p: 2, farve: "#c59bff" },
        8:  { s: "O",  navn: "oxygen",   atom: "oxygenatom",   v: 6, g: 6, p: 2, farve: "#5aa7ff" },
        17: { s: "Cl", navn: "chlor",    atom: "chloratom",    v: 7, g: 7, p: 3, farve: "#4fd1c5" },
        35: { s: "Br", navn: "brom",     atom: "bromatom",     v: 7, g: 7, p: 4, farve: "#ff8fb1" }
    };

    /* Det periodiske system med hovedgrupperne 1 til 8 (som bogens figur).
       [symbol, atomnummer] eller null. */
    D.PT = [
        [["H", 1], null, null, null, null, null, null, ["He", 2]],
        [["Li", 3], ["Be", 4], ["B", 5], ["C", 6], ["N", 7], ["O", 8], ["F", 9], ["Ne", 10]],
        [["Na", 11], ["Mg", 12], ["Al", 13], ["Si", 14], ["P", 15], ["S", 16], ["Cl", 17], ["Ar", 18]],
        [["K", 19], ["Ca", 20], ["Ga", 31], ["Ge", 32], ["As", 33], ["Se", 34], ["Br", 35], ["Kr", 36]]
    ];

    /* Paaskeaegget: et klik paa en aedelgas i det periodiske system */
    D.AEDELGAS = {
        He: "Helium har allerede 2 elektroner i sin skal og deler dem ikke med nogen. Det er derfor, en heliumballon ikke brænder.",
        Ne: "Neon har 8 elektroner i yderste skal og danner ingen bindinger. Neon har allerede det, de andre atomer prøver at få.",
        Ar: "Argon har 8 elektroner i yderste skal. Næsten 1 % af luften er argon, og det reagerer ikke med noget.",
        Kr: "Krypton har 8 elektroner i yderste skal og er lige så tilfreds som de andre ædelgasser."
    };

    /* ----- Molekylerne paa fanen Byg ------------------------------------
       facit.pos er gitterpladsen for hvert atom (x til hoejre, y nedad),
       facit.b er bindingerne [atom, atom, antal elektronpar]. */
    D.MOLEKYLER = [
        {
            id: "h2", f: "H₂", navn: "hydrogen", atomer: [1, 1], om: 0,
            bygt: "Alle elektroner er parret. De to hydrogenatomer deler 1 elektronpar: en enkeltbinding.",
            facit: { pos: [[0, 0], [1, 0]], b: [[0, 1, 1]] },
            hint: ["Hvert hydrogenatom har 1 uparret elektron. Træk den ene hen på den anden, så deler de to atomer et elektronpar."]
        },
        {
            id: "h2o", f: "H₂O", navn: "vand", atomer: [1, 8, 1], om: 1,
            bygt: "Alle elektroner er parret. Vand har 2 fælles elektronpar og 2 frie elektronpar på oxygen.",
            facit: { pos: [[-1, 0], [0, 0], [1, 0]], b: [[0, 1, 1], [1, 2, 1]] },
            hint: ["Oxygen har 2 uparrede elektroner, og hvert hydrogenatom har 1. Hvor mange bindinger kan oxygen så danne?",
                "Træk den uparrede elektron fra hvert hydrogenatom hen på hver sin uparrede elektron på oxygen."]
        },
        {
            id: "nh3", f: "NH₃", navn: "ammoniak", atomer: [1, 7, 1, 1], om: 1,
            bygt: "Alle elektroner er parret. Ammoniak har 3 fælles elektronpar og 1 frit elektronpar på nitrogen.",
            facit: { pos: [[-1, 0], [0, 0], [1, 0], [0, 1]], b: [[0, 1, 1], [1, 2, 1], [1, 3, 1]] },
            hint: ["Nitrogen har 3 uparrede elektroner, og hvert hydrogenatom har 1. Hver uparret elektron på nitrogen kan danne en binding til et hydrogenatom."]
        },
        {
            id: "ch4", f: "CH₄", navn: "methan", atomer: [1, 1, 6, 1, 1], om: 2,
            bygt: "Alle elektroner er parret. Methan har 4 fælles elektronpar og ingen frie elektronpar.",
            facit: { pos: [[0, -1], [-1, 0], [0, 0], [1, 0], [0, 1]], b: [[0, 2, 1], [1, 2, 1], [2, 3, 1], [2, 4, 1]] },
            hint: ["Carbon har 4 uparrede elektroner og danner derfor 4 bindinger. Der er ét hydrogenatom til hver uparret elektron."]
        },
        {
            id: "br2", f: "Br₂", navn: "brom", atomer: [35, 35], om: 0,
            bygt: "Alle elektroner er parret. De to bromatomer deler 1 elektronpar, og hvert bromatom har 3 frie elektronpar.",
            facit: { pos: [[0, 0], [1, 0]], b: [[0, 1, 1]] },
            hint: ["Hvert bromatom har 1 uparret elektron. De to bromatomer deler dem i ét fælles elektronpar."]
        },
        {
            id: "co2", f: "CO₂", navn: "carbondioxid", atomer: [8, 6, 8], om: 1,
            bygt: "Alle elektroner er parret. Carbon deler 2 elektronpar med hvert oxygenatom: to dobbeltbindinger.",
            facit: { pos: [[-1, 0], [0, 0], [1, 0]], b: [[0, 1, 2], [1, 2, 2]] },
            hint: ["Carbon har 4 uparrede elektroner, og hvert oxygenatom har 2. Carbon skal derfor dele 2 elektronpar med hvert oxygenatom.",
                "Når carbon og oxygen deler ét elektronpar, så træk endnu en uparret elektron fra carbon hen på samme oxygenatom. Så bliver det en dobbeltbinding."]
        },
        {
            id: "ch2o", f: "CH₂O", navn: "methanal (formaldehyd)", atomer: [1, 6, 8, 1], om: 2,
            bygt: "Alle elektroner er parret. Carbon og oxygen deler 2 elektronpar: en dobbeltbinding.",
            facit: { pos: [[-1, 0], [0, 0], [0, -1], [1, 0]], b: [[0, 1, 1], [1, 2, 2], [1, 3, 1]] },
            hint: ["Hydrogen kan kun danne én binding, så et hydrogenatom kan ikke sidde mellem to andre atomer. Begynd med at binde de to hydrogenatomer til carbon.",
                "Med to hydrogenatomer har carbon 2 uparrede elektroner tilbage, og oxygen har 2. Carbon og oxygen deler 2 elektronpar: en dobbeltbinding."]
        },
        {
            id: "n2", f: "N₂", navn: "nitrogen", atomer: [7, 7], om: 0,
            bygt: "Alle elektroner er parret. De to nitrogenatomer deler 3 elektronpar: en tripelbinding.",
            facit: { pos: [[0, 0], [1, 0]], b: [[0, 1, 3]] },
            hint: ["Hvert nitrogenatom har 3 uparrede elektroner. Hvor mange elektronpar skal de to nitrogenatomer så dele?",
                "Træk alle tre uparrede elektroner fra det ene nitrogenatom over på det andet, én ad gangen. Så bliver det en tripelbinding."]
        },
        {
            id: "hcn", f: "HCN", navn: "hydrogencyanid", atomer: [1, 6, 7], om: 1,
            bygt: "Alle elektroner er parret. Carbon og nitrogen deler 3 elektronpar: en tripelbinding.",
            facit: { pos: [[-1, 0], [0, 0], [1, 0]], b: [[0, 1, 1], [1, 2, 3]] },
            hint: ["Hydrogen danner 1 binding, carbon 4 og nitrogen 3. Hvilket atom kan sidde i midten?",
                "Carbon sidder i midten. Bind hydrogen til carbon, og lad carbon og nitrogen dele 3 elektronpar: en tripelbinding."]
        },
        {
            id: "c2h2", f: "C₂H₂", navn: "ethyn", atomer: [1, 6, 6, 1], om: 1,
            bygt: "Alle elektroner er parret. De to carbonatomer deler 3 elektronpar: en tripelbinding.",
            facit: { pos: [[-1, 0], [0, 0], [1, 0], [2, 0]], b: [[0, 1, 1], [1, 2, 3], [2, 3, 1]] },
            hint: ["Hvert carbonatom binder ét hydrogenatom. Hvor mange uparrede elektroner har hvert carbonatom så tilbage?",
                "Hvert carbonatom har 3 uparrede elektroner tilbage. De to carbonatomer deler 3 elektronpar: en tripelbinding."]
        }
    ];

    /* ----- Elevtegningerne paa fanen Find fejlen -------------------------
       pos og b som ovenfor. frie: { atom: antal frie elektroner }.
       ret er den rettede tegning; uden ret er det de samme atomer og
       bindinger, tegnet som de skal. */
    var VAND = { atomer: [1, 8, 1], pos: [[-1, 0], [0, 0], [1, 0]], b: [[0, 1, 1], [1, 2, 1]] };
    var CO2 = [[-1, 0], [0, 0], [1, 0]];

    D.FEJL = [
        {
            f: "H₂O", atomer: VAND.atomer, pos: VAND.pos, b: VAND.b, frie: { 1: 0 },
            hint: "Oxygen har 6 elektroner i yderste skal, og 2 af dem er med i bindingerne. Hvor er resten?",
            forklaring: "Oxygen har kun 4 elektroner omkring sig. Med to frie elektronpar har det 8."
        },
        {
            f: "HCl", atomer: [1, 17], pos: [[0, 0], [1, 0]], b: [[0, 1, 1]], frie: { 1: 4 },
            hint: "Chlor har 7 elektroner i yderste skal, og 1 af dem er med i bindingen. Hvor mange frie skal der så være?",
            forklaring: "Chlor har kun 6 elektroner omkring sig. Med tre frie elektronpar har det 8."
        },
        {
            f: "H₂O", atomer: VAND.atomer, pos: VAND.pos, b: VAND.b,
            hint: "Tæl omkring oxygen: både de frie elektroner og begge elektroner i hver binding. Hvert hydrogenatom skal have 2.",
            forklaring: "Oxygen har 4 elektroner i de fælles elektronpar og 4 i de frie elektronpar: 8. Hvert hydrogenatom har 2."
        },
        {
            f: "NH₃", atomer: [1, 7, 1, 1], pos: [[-1, 0], [0, 0], [1, 0], [0, 1]], b: [[0, 1, 1], [1, 2, 1], [1, 3, 1]], frie: { 1: 4 },
            hint: "Nitrogen har 5 elektroner i yderste skal, og 3 af dem er med i bindingerne. Hvor mange er der tilbage?",
            forklaring: "Nitrogen har 10 elektroner omkring sig. Med ét frit elektronpar har det 8."
        },
        {
            f: "CH₄", atomer: [6, 1, 1, 1, 1], pos: [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], frie: { 2: 2 },
            hint: "Hydrogen skal kun have 2 elektroner omkring sig, ikke 8. Tæl omkring hvert hydrogenatom.",
            forklaring: "Et hydrogenatom har 4 elektroner omkring sig. Hydrogen har kun sin binding og ingen frie elektronpar."
        },
        {
            f: "CO₂", atomer: [8, 6, 8], pos: CO2, b: [[0, 1, 1], [1, 2, 1]], frie: { 0: 6, 1: 0, 2: 6 },
            ret: { b: [[0, 1, 2], [1, 2, 2]] },
            hint: "Carbon har 4 elektroner i yderste skal og danner 4 bindinger. Hvor mange bindinger har carbon på tegningen?",
            forklaring: "Carbon har kun 4 elektroner omkring sig. Med to dobbeltbindinger har alle atomer 8."
        },
        {
            f: "N₂", atomer: [7, 7], pos: [[0, 0], [1, 0]], b: [[0, 1, 3]],
            hint: "Tæl omkring hvert nitrogenatom. Alle 6 elektroner i tripelbindingen tæller med hos begge atomer.",
            forklaring: "Hvert nitrogenatom har 6 elektroner i tripelbindingen og 2 i det frie elektronpar: 8."
        },
        {
            f: "H₂O", atomer: [1, 1, 8], pos: CO2, b: [[0, 1, 1], [1, 2, 1]], frie: { 2: 6 },
            ret: VAND,
            hint: "Hydrogen kan kun danne én binding. Hvor mange bindinger har hydrogenatomet i midten?",
            forklaring: "Hydrogenatomet i midten har 4 elektroner omkring sig. Hydrogen danner kun én binding, så oxygen sidder i midten."
        },
        {
            f: "CH₂O", atomer: [8, 6, 1, 1], pos: [[0, -1], [0, 0], [-1, 0], [1, 0]], b: [[1, 0, 1], [1, 2, 1], [1, 3, 1]], frie: { 0: 6, 1: 0 },
            ret: { b: [[1, 0, 2], [1, 2, 1], [1, 3, 1]] },
            hint: "Carbon danner 4 bindinger. Hvor mange bindinger har carbon på tegningen?",
            forklaring: "Carbon har kun 6 elektroner omkring sig. Med en dobbeltbinding til oxygen har både carbon og oxygen 8."
        },
        {
            f: "Br₂", atomer: [35, 35], pos: [[0, 0], [1, 0]], b: [[0, 1, 1]], frie: { 0: 8 },
            hint: "Brom har 7 elektroner i yderste skal, og 1 af dem er med i bindingen. Hvor mange frie er der så?",
            forklaring: "Det ene bromatom har 10 elektroner omkring sig. Med tre frie elektronpar har det 8."
        },
        {
            f: "C₂H₂", atomer: [1, 6, 6, 1], pos: [[-1, 0], [0, 0], [1, 0], [2, 0]], b: [[0, 1, 1], [1, 2, 3], [2, 3, 1]],
            hint: "Tæl omkring hvert carbonatom: bindingen til hydrogen og alle elektroner i tripelbindingen.",
            forklaring: "Hvert carbonatom har 2 elektroner i bindingen til hydrogen og 6 i tripelbindingen: 8."
        },
        {
            f: "CO₂", atomer: [8, 6, 8], pos: CO2, b: [[0, 1, 3], [1, 2, 2]], frie: { 0: 2, 1: 0, 2: 4 },
            ret: { b: [[0, 1, 2], [1, 2, 2]] },
            hint: "Carbon danner 4 bindinger. Tæl bindingerne til carbon på tegningen: en tripelbinding tæller som 3.",
            forklaring: "Carbon har 5 bindinger og 10 elektroner omkring sig. Med to dobbeltbindinger har alle atomer 8."
        }
    ];

    /* ----- Tekster, der bygges af modellen ------------------------------ */

    /* Et forkert antal elektroner i atomet giver et hint, der passer til
       fejlen: atomnummeret, det antal atomet mangler, periodens nummer. */
    D.antalHint = function (z, tal) {
        var el = D.EL[z];
        if (tal === z && z !== 1) return el.s + " har atomnummer " + z + ". Det er alle elektronerne, ikke kun dem i yderste skal.";
        if (z !== 1 && tal === 8 - el.v && tal !== el.v) return "Det er det antal, " + el.navn + " mangler for at få 8. Hvor mange har " + el.navn + " i yderste skal?";
        if (tal === el.p && el.p !== el.g) return el.s + " står i periode " + el.p + ". Perioden er rækken. Hovedgruppen er kolonnen.";
        if (tal < el.v) return "Der mangler elektroner. Se, hvilken hovedgruppe " + el.s + " står i.";
        return "Der er for mange elektroner. Se, hvilken hovedgruppe " + el.s + " står i.";
    };

    D.FORDELING = "Antallet er rigtigt, men de første fire elektroner skal have hver sin side af symbolet. Først derefter danner de par.";

    /* Det, kortet siger, naar et atom er tegnet rigtigt: tallet og
       de uparrede elektroner, som er dem, der kan danne bindinger
       (bogens figur over atomernes prikformler). */
    D.atomRigtigt = function (z) {
        var el = D.EL[z];
        var u = el.v <= 4 ? el.v : 8 - el.v;
        var start = NK.stort(el.navn) + " står i hovedgruppe " + el.g + " og har " + el.v + (el.v === 1 ? " elektron" : " elektroner") + " i yderste skal.";
        if (u === 1) return start + " " + NK.stort(el.navn) + " har 1 uparret elektron og kan derfor danne 1 binding.";
        if (u === el.v) return start + " Alle " + u + " er uparrede, så " + el.navn + " kan danne " + u + " bindinger.";
        return start + " De " + u + " uparrede elektroner kan danne " + u + " bindinger.";
    };

    /* Optaellingen omkring et atom: st er NK.Prik.status */
    D.taelForklaring = function (z, st) {
        var navn = NK.stort(D.EL[z].navn);
        var faelles = st.bs === 1 ? "det fælles elektronpar" : "de " + st.bs + " fælles elektronpar";
        if (z === 1) return navn + " har 2 elektroner omkring sig, begge i det fælles elektronpar. Hydrogen skal kun have 2.";
        if (st.frie === 0) return navn + " har " + st.nu + " elektroner omkring sig, alle i " + faelles + ".";
        return navn + " har " + st.nu + " elektroner omkring sig: " + (2 * st.bs) + " i " + faelles + " og " + st.frie + " i de frie elektronpar.";
    };

    /* Et forkert elektrontal giver et hint efter den maade, der er talt
       forkert paa. */
    D.taelleHint = function (st, tal) {
        if (st.bs > 0 && tal === st.frie + st.bs) return "Begge elektroner i et fælles elektronpar tæller med, ikke kun den ene.";
        if (st.bs > 0 && st.frie > 0 && tal === st.frie) return "Husk elektronerne i de fælles elektronpar. De tæller med.";
        if (st.frie > 0 && tal === 2 * st.bs) return "Husk de frie elektroner. De tæller også med.";
        if (tal === st.maal && tal !== st.nu) return "Det er det antal, der skal være. Tæl, hvor mange der er på tegningen.";
        return "Tæl igen. Alle prikker omkring atomet tæller, også dem i de fælles elektronpar.";
    };

    /* Det andet hint til en optaelling: parrene, der skal taelles */
    D.taelHint2 = function (z, st) {
        var navn = NK.stort(D.EL[z].navn);
        var par = st.frie / 2;
        var t = navn + " har " + st.bs + (st.bs === 1 ? " fælles elektronpar" : " fælles elektronpar");
        if (st.frie % 2) return t + " og " + st.frie + " frie elektroner. Et par er 2 elektroner.";
        t += par ? " og " + par + (par === 1 ? " frit elektronpar" : " frie elektronpar") : " og ingen frie elektronpar";
        return t + ". Hvert par er 2 elektroner.";
    };

    /* Navnet paa det atom, eleven skal taelle omkring: "oxygenatomet",
       eller "hvert nitrogenatom", naar der er to ens i midten. */
    D.omNavn = function (mol) {
        var z = mol.atomer[mol.om];
        var ens = mol.atomer.filter(function (x) { return x === z; }).length;
        return ens > 1 ? "hvert " + D.EL[z].atom : D.EL[z].atom + "et";
    };

    D.FAERDIG = {
        b: "Du har bygget alle ti molekyler. Prøv Find fejlen.",
        f: "Du har tjekket alle tolv tegninger."
    };

    NK.Data = D;
}());
