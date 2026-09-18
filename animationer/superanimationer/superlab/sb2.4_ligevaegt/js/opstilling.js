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
    function pulver(navn, x, etiket, titel, stof) {
        var u = {};
        u[stof] = 30000;
        return { navn: navn, type: "pulverglas", x: x, etiket: etiket, titel: titel,
                 indhold: { V: 0, T: 20, umol: u }, pulverMaks: 30000 };
    }

    var HYLDE = 322;

    /* Stamoploesningen: Fe³⁺ og SCN⁻ 5 mM, plus modionerne */
    var STAM = { "Fe3+": 5, "SCN-": 5, "K+": 5, "NO3-": 15 };

    NK.OPSTILLING = [
        /* Venstre: affald, koekkenrulle, kolben med stamoploesning */
        { navn: "dunk", type: "affaldsdunk", x: 70, etiket: ["AFFALD", "surt uorg."] },
        { navn: "papir", type: "koekkenrulle", x: 170, y: 268 },
        { navn: "kolbe", type: "kolbe", x: 200, titel: "kolben med stamopløsning", indhold: opl(200, STAM) },
        { navn: "baeger", type: "baegerStor", x: 310, titel: "bægerglasset" },

        /* Pulverglassene til glas 1, 2 og 3, og spatlen */
        pulver("pulver_fe",   410, "Fe(NO₃)₃", "pulverglasset med Fe(NO₃)₃", "Fe(NO3)3(s)"),
        pulver("pulver_asc",  454, "C-vitamin", "pulverglasset med ascorbinsyre", "Asc(s)"),
        pulver("pulver_kscn", 498, "KSCN", "pulverglasset med KSCN", "KSCN(s)"),
        { navn: "spatel", type: "spatel", p: { x: 548, y: 495, v: 0 } },

        /* Flasken og draabeflasken paa hylden bag bordet */
        { navn: "fl_kscn", type: "flaske", x: 320, y: HYLDE, etiket: ["KSCN", "0,1 M"],
          titel: "flasken med KSCN", indhold: opl(200, { "K+": 100, "SCN-": 100 }) },
        { navn: "ag", type: "draabeflaske", x: 390, y: HYLDE, etiket: ["AgNO₃", "0,1 M"],
          titel: "dråbeflasken med AgNO₃", indhold: opl(60, { "Ag+": 100, "NO3-": 100 }) },

        /* De otte reagensglas i stativet */
        { navn: "stativ", type: "stativ", p: { x: 610, y: 400, v: 0 } },
        { navn: "glas1", type: "reagensglas", stativ: "stativ", hul: 0, nr: 1, titel: "glas 1" },
        { navn: "glas2", type: "reagensglas", stativ: "stativ", hul: 1, nr: 2, titel: "glas 2" },
        { navn: "glas3", type: "reagensglas", stativ: "stativ", hul: 2, nr: 3, titel: "glas 3" },
        { navn: "glas4", type: "reagensglas", stativ: "stativ", hul: 3, nr: 4, titel: "glas 4" },
        { navn: "glas5", type: "reagensglas", stativ: "stativ", hul: 4, nr: 5, titel: "glas 5" },
        { navn: "glas6", type: "reagensglas", stativ: "stativ", hul: 5, nr: 6, titel: "glas 6" },
        { navn: "glas7", type: "reagensglas", stativ: "stativ", hul: 6, nr: 7, titel: "glas 7" },
        { navn: "glas8", type: "reagensglas", stativ: "stativ", hul: 7, nr: 8, titel: "glas 8" },

        /* Maaleudstyret */
        { navn: "glasstav", type: "glasstav", x: 1010 },
        { navn: "termometer", type: "termometer", x: 1060 },

        /* Vandbadet staar paa varmepladen og varmes, naar eleven taender
           den. Isbadet holdes paa 2 grader (holdT: isen fyldes efter).
           Begge er udstyret "bad": et stort baegerglas, man saetter
           reagensglas ned i, og glasset tager badets temperatur. */
        { navn: "plade", type: "varmeplade", p: { x: 1120, y: 428, v: 0 } },
        { navn: "vandbad", type: "bad", paa: "plade", x: 1196, titel: "vandbadet", holdT: 80,
          indhold: opl(180, {}) },
        { navn: "isbad", type: "bad", x: 1390, titel: "isbadet", holdT: 2,
          indhold: { V: 180, T: 2, mM: {} } },

        { navn: "vand", type: "sproejteflaske", x: 1470, titel: "sprøjteflasken med vand",
          indhold: opl(500, {}) }
    ];

    NK.BORD_VALG = {
        bredde: 1520, hoejde: 600, bord: 500,
        hylder: [{ x0: 16, x1: 230, y: 268 }, { x0: 280, x1: 470, y: HYLDE }],
        plakat: { x: 1330, y: 90 },
        bobleR: 128, partikler: 6
    };
}());
