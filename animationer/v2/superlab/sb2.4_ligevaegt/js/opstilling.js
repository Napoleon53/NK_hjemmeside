/* =====================================================================
   opstilling.js - bordet i sb2.4

   Stofferne, reaktionerne og redoxparrene staar i den faelles tabel
   ../../../laboratoriet/js/stoftabel.js. Her vaelges kun, hvad der staar
   paa bordet. Kemien i forsoeget er:

       Fe³⁺ + SCN⁻  ⇌  FeSCN²⁺        K = 0,14 mM⁻¹, ΔH = −20 kJ/mol

   og de fire indgreb:
       glas 1   Fe(NO₃)₃(s)     mere Fe³⁺       -> moerkere
       glas 2   ascorbinsyre    faerre Fe³⁺     -> lysere  (reduceres til Fe²⁺)
       glas 3   KSCN(s)         mere SCN⁻       -> moerkere
       glas 4   AgNO₃           faerre SCN⁻     -> lysere  (AgSCN faelder)
       glas 5   vandbad         varme           -> lysere  (exoterm)
       glas 6   isbad           kulde           -> moerkere
       glas 7   reference       intet indgreb
       glas 8   forundersoegelse: KSCN 0,1 M + AgNO₃ giver hvidt bundfald

   Stamoploesningen: 20 mL 0,10 M Fe(NO₃)₃ og 20 mL 0,10 M KSCN fortyndet
   til 400 mL, altsaa 5 mM af hver. Ved ligevaegt giver det ca. 1,5 mM
   FeSCN²⁺, som er tydeligt roedt i et reagensglas uden at vaere sort.
   Motoren regner selv ligevaegten frem; her staar kun det, der blev
   blandet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function opl(V, mM) { return { V: V, T: 20, mM: mM }; }
    function pulver(navn, x, y, etiket, titel, stof) {
        var u = {};
        u[stof] = 30000;
        return { navn: navn, type: "pulverglas", x: x, y: y, etiket: etiket, titel: titel,
                 indhold: { V: 0, T: 20, umol: u }, pulverMaks: 30000 };
    }

    /* Laboratoriet er 1040 bredt. Det oeverste venstre hjoerne er zoomboblens
       (BOBLE); hylderne og alt, der er hoejere end kolben, holder sig fri af
       det. Reagenserne staar paa hylderne over stativet, saa bordet kun har
       det, man arbejder med. */
    var BOBLE = { x: 172, y: 192 };        /* centrum; radius i BORD_VALG */
    var HYLDE_KAFFE = 268;                 /* kaffen, koekkenrullen og pulverglassene */
    var HYLDE_FLASKER = 170;               /* flasken, draabeflasken og sproejteflasken */
    var HYLDE_HOEJRE = 230;                /* det tomme baegerglas */

    /* Stamoploesningen: Fe³⁺ og SCN⁻ 5 mM, plus modionerne */
    var STAM = { "Fe3+": 5, "SCN-": 5, "K+": 5, "NO3-": 15 };

    NK.OPSTILLING = [
        /* Venstre ende af bordet, under zoomboblen: affaldet og kolben */
        { navn: "dunk", type: "affaldsdunk", x: 70, etiket: ["AFFALD", "surt uorg."] },
        { navn: "kolbe", type: "kolbe", x: 200, titel: "kolben med stamopløsning", indhold: opl(200, STAM) },

        /* Hylden over stativet: koekkenrullen (kaffen stilles selv ved
           venstre ende) og pulverglassene til glas 1, 2 og 3 */
        { navn: "papir", type: "koekkenrulle", x: 460, y: HYLDE_KAFFE },
        pulver("pulver_fe",   540, HYLDE_KAFFE, "Fe(NO₃)₃", "pulverglasset med Fe(NO₃)₃", "Fe(NO3)3(s)"),
        pulver("pulver_asc",  590, HYLDE_KAFFE, "C-vitamin", "pulverglasset med ascorbinsyre", "Asc(s)"),
        pulver("pulver_kscn", 640, HYLDE_KAFFE, "KSCN", "pulverglasset med KSCN", "KSCN(s)"),

        /* Den oeverste hylde: flasken, draabeflasken og sproejteflasken */
        { navn: "fl_kscn", type: "flaske", x: 400, y: HYLDE_FLASKER, etiket: ["KSCN", "0,1 M"],
          titel: "flasken med KSCN", indhold: opl(200, { "K+": 100, "SCN-": 100 }) },
        { navn: "ag", type: "draabeflaske", x: 470, y: HYLDE_FLASKER, etiket: ["AgNO₃", "0,1 M"],
          titel: "dråbeflasken med AgNO₃", indhold: opl(60, { "Ag+": 100, "NO3-": 100 }) },
        { navn: "vand", type: "sproejteflaske", x: 560, y: HYLDE_FLASKER, titel: "sprøjteflasken med vand",
          indhold: opl(500, {}) },

        /* De otte reagensglas i stativet */
        { navn: "stativ", type: "stativ", p: { x: 330, y: 400, v: 0 } },
        { navn: "glas1", type: "reagensglas", stativ: "stativ", hul: 0, nr: 1, titel: "glas 1" },
        { navn: "glas2", type: "reagensglas", stativ: "stativ", hul: 1, nr: 2, titel: "glas 2" },
        { navn: "glas3", type: "reagensglas", stativ: "stativ", hul: 2, nr: 3, titel: "glas 3" },
        { navn: "glas4", type: "reagensglas", stativ: "stativ", hul: 3, nr: 4, titel: "glas 4" },
        { navn: "glas5", type: "reagensglas", stativ: "stativ", hul: 4, nr: 5, titel: "glas 5" },
        { navn: "glas6", type: "reagensglas", stativ: "stativ", hul: 5, nr: 6, titel: "glas 6" },
        { navn: "glas7", type: "reagensglas", stativ: "stativ", hul: 6, nr: 7, titel: "glas 7" },
        { navn: "glas8", type: "reagensglas", stativ: "stativ", hul: 7, nr: 8, titel: "glas 8" },

        /* Spatlen, glasstaven og termometeret ligger forrest paa bordpladen */
        { navn: "spatel", type: "spatel", p: { x: 290, y: 550, v: 0 } },
        { navn: "glasstav", type: "glasstav", x: 820, y: 546 },
        { navn: "termometer", type: "termometer", x: 900, y: 562 },

        /* Vandbadet staar paa varmepladen og varmes, naar eleven taender
           den. Isbadet holdes paa 2 grader (holdT: isen fyldes efter).
           Begge er udstyret "bad": et stort baegerglas, man saetter
           reagensglas ned i, og glasset tager badets temperatur. */
        { navn: "plade", type: "varmeplade", p: { x: 715, y: 428, v: 0 } },
        { navn: "vandbad", type: "bad", paa: "plade", x: 791, titel: "vandbadet", holdT: 80,
          indhold: opl(180, {}) },
        { navn: "isbad", type: "bad", x: 965, titel: "isbadet", holdT: 2,
          indhold: { V: 180, T: 2, mM: {} } },

        /* Hylden til hoejre: det tomme baegerglas */
        { navn: "baeger", type: "baegerStor", x: 790, y: HYLDE_HOEJRE, titel: "bægerglasset" }
    ];

    /* Tegnebordet er 1040 bredt i stedet for 1520, saa alt er omkring 45 %
       stoerre paa skaermen. Bordpladen er 64 dyb, saa der er plads til at
       stille ting foran stativet. Tegnebordet staar forneden i laerredet
       (lodret: "bund"), og zoomboblen staar i laboratoriets oeverste
       venstre hjoerne med radius 135. Kuglerne og skriften inde i den er
       en fjerdedel mindre end standard (bobleIndhold), saa der er luft
       mellem dem. Den foerste hylde er kaffens (lavKaffekop). */
    NK.BORD_VALG = {
        bredde: 1040, hoejde: 650, bord: 500, bordDybde: 64, lodret: "bund",
        hylder: [
            { x0: 340, x1: 690, y: HYLDE_KAFFE },
            { x0: 340, x1: 690, y: HYLDE_FLASKER },
            { x0: 715, x1: 1025, y: HYLDE_HOEJRE }
        ],
        plakat: { x: 880, y: 70 },
        boble: BOBLE, bobleR: 135, bobleIndhold: 0.75, partikler: 6
    };
}());
