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

   Del 2 er fortyndingen: fire baegerglas, to og to i par. Par 1 faar
   frugtfarve, par 2 ligevaegtsblanding fra den samme kolbe. Det ene glas
   i hvert par fortyndes med vand, og de fire ses ovenfra (js/ovenfra.js).

   De to dele deler ét bord. Hver genstand har et `del`, og js/dele.js
   skjuler den anden dels ting (motorens `skjult`, som tegningen,
   traefningen og slipmaalet allerede spoerger om). Det, der bruges i
   begge dele - affaldet, kolben, koekkenrullen og sproejteflasken - har
   intet `del` og staar hele tiden.

   Stamoploesningen: 32 mL 0,10 M Fe(NO₃)₃ og 32 mL 0,10 M KSCN fortyndet
   til 400 mL, altsaa 8 mM af hver. Ved ligevaegt giver det ca. 3,2 mM
   FeSCN²⁺, som staar kraftigt roedt i et reagensglas uden at gaa mod
   sort, og som ogsaa kan ses, naar der kigges ned i et baegerglas, hvor
   lysvejen er kortere. Der er 4,8 mM frit Fe³⁺ tilbage, og det er dét,
   der traeder frem som gult, naar blandingen fortyndes og komplekset
   bruges op. Motoren regner selv ligevaegten frem; her staar kun det,
   der blev blandet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function opl(V, mM) { return { V: V, T: 20, mM: mM }; }

    /* Frugtfarveflasken er en stamflaske: den doseres i smaa portioner og
       haeldes ikke op. Derfor faar forsoeget sin egen udgave af flasken
       med en lille portion; alt andet er flaskens egne maal. */
    var FARVE_PORTION = 4;      /* mL pr. haeldning */
    (function () {
        var f = NK.Udstyr.type("flaske"), ny = {}, n;
        for (n in f) if (Object.prototype.hasOwnProperty.call(f, n)) ny[n] = f[n];
        ny.haeldMl = FARVE_PORTION;
        ny.titel = "flasken med frugtfarve";
        NK.Udstyr.tilfoej("flaskeFarve", ny);
    }());
    function pulver(navn, x, y, etiket, titel, stof) {
        var u = {};
        u[stof] = 30000;
        return { navn: navn, type: "pulverglas", x: x, y: y, etiket: etiket, titel: titel, del: 1,
                 indhold: { V: 0, T: 20, umol: u }, pulverMaks: 30000 };
    }

    /* Laboratoriet er 1040 bredt. Det oeverste venstre hjoerne er zoomboblens
       (BOBLE); hylderne og alt, der er hoejere end kolben, holder sig fri af
       det. Reagenserne staar paa hylderne over stativet, saa bordet kun har
       det, man arbejder med. */
    var BOBLE = { x: 172, y: 192 };        /* centrum; radius i BORD_VALG */

    /* Kemichaels plan bag bordet. Han bor ikke her: han er ude det meste af
       tiden og kommer kun ind, naar han har noget at sige. Hvor han saa
       standser, regnes ud i oejeblikket (laererPlads i kemichael.js) - saa
       taet paa det, han taler om, som der er plads til - og derfor staar der
       intet x her. y er halsens hoejde, saa issen naar op under den nederste
       hylde til hoejre (230) uden at krydse den, og skala er planets: bag
       bordet er han laengere vaek og tegnes mindre. */
    var KEMICHAEL = { y: 358, skala: 0.82 };
    var HYLDE_KAFFE = 268;                 /* kaffen, koekkenrullen og pulverglassene */
    var HYLDE_FLASKER = 170;               /* flasken, draabeflasken og sproejteflasken */
    var HYLDE_HOEJRE = 230;                /* det tomme baegerglas */

    /* Stamoploesningen: Fe³⁺ og SCN⁻ 5 mM, plus modionerne */
    var STAM = { "Fe3+": 8, "SCN-": 8, "K+": 8, "NO3-": 24 };

    /* Frugtfarve: et blaat farvestof, der ikke indgaar i nogen reaktion.
       Flasken er en stamflaske paa 100 mL og 35 mM - ti gange saa
       kraftig som den farve, der skal staa i glassene, saa den doseres og
       ikke haeldes op. En portion er derfor lille (FARVE_PORTION), og
       resten af rumfanget er vand fra sproejteflasken. Saadan bruger man
       ogsaa frugtfarve i et koekken: et par draaber i en skaal. */
    var FRUGTFARVE = { "farve": 35 };

    /* De fire baegerglas i del 2, to og to i par med luft imellem */
    var PAR1 = [380, 470], PAR2 = [660, 750];
    function baeger(nr, x) {
        return { navn: "baeger" + nr, type: "baegerLille", x: x, del: 2,
                 titel: "bægerglas " + nr };
    }

    NK.OPSTILLING = [
        /* Venstre ende af bordet, under zoomboblen: affaldet og kolben */
        { navn: "dunk", type: "affaldsdunk", x: 70, etiket: ["AFFALD", "surt uorg."] },
        /* 150 mL i en kolbe paa 200: den skal ikke staa til kanten, og
           inddelingens oeverste streg er netop 150. Det raekker til del 1
           (8 glas a 6 mL) og til del 2 (to portioner a 40 mL). */
        { navn: "kolbe", type: "kolbe", x: 200, titel: "kolben med stamopløsning", indhold: opl(150, STAM) },

        /* Hylden over stativet: koekkenrullen (kaffen stilles selv ved
           venstre ende) og pulverglassene til glas 1, 2 og 3 */
        { navn: "papir", type: "koekkenrulle", x: 460, y: HYLDE_KAFFE },
        pulver("pulver_fe",   540, HYLDE_KAFFE, "Fe(NO₃)₃", "pulverglasset med Fe(NO₃)₃", "Fe(NO3)3(s)"),
        pulver("pulver_asc",  590, HYLDE_KAFFE, "C-vitamin", "pulverglasset med ascorbinsyre", "Asc(s)"),
        pulver("pulver_kscn", 640, HYLDE_KAFFE, "KSCN", "pulverglasset med KSCN", "KSCN(s)"),

        /* Den oeverste hylde: flasken, draabeflasken og sproejteflasken.
           I del 2 staar frugtfarven paa KSCN-flaskens plads - de to er
           aldrig fremme samtidig. */
        { navn: "fl_kscn", type: "flaske", x: 400, y: HYLDE_FLASKER, etiket: ["KSCN", "0,1 M"], del: 1,
          titel: "flasken med KSCN", indhold: opl(200, { "K+": 100, "SCN-": 100 }) },
        { navn: "fl_farve", type: "flaskeFarve", x: 400, y: HYLDE_FLASKER, etiket: ["frugt-", "farve"], del: 2,
          titel: "flasken med frugtfarve", indhold: opl(100, FRUGTFARVE) },
        { navn: "ag", type: "draabeflaske", x: 470, y: HYLDE_FLASKER, etiket: ["AgNO₃", "0,1 M"], del: 1,
          titel: "dråbeflasken med AgNO₃", indhold: opl(60, { "Ag+": 100, "NO3-": 100 }) },
        { navn: "vand", type: "sproejteflaske", x: 560, y: HYLDE_FLASKER, titel: "sprøjteflasken med vand",
          indhold: opl(500, {}) },

        /* De otte reagensglas i stativet */
        { navn: "stativ", type: "stativ", p: { x: 330, y: 400, v: 0 }, del: 1 },
        { navn: "glas1", type: "reagensglas", stativ: "stativ", hul: 0, nr: 1, titel: "glas 1", del: 1 },
        { navn: "glas2", type: "reagensglas", stativ: "stativ", hul: 1, nr: 2, titel: "glas 2", del: 1 },
        { navn: "glas3", type: "reagensglas", stativ: "stativ", hul: 2, nr: 3, titel: "glas 3", del: 1 },
        { navn: "glas4", type: "reagensglas", stativ: "stativ", hul: 3, nr: 4, titel: "glas 4", del: 1 },
        { navn: "glas5", type: "reagensglas", stativ: "stativ", hul: 4, nr: 5, titel: "glas 5", del: 1 },
        { navn: "glas6", type: "reagensglas", stativ: "stativ", hul: 5, nr: 6, titel: "glas 6", del: 1 },
        { navn: "glas7", type: "reagensglas", stativ: "stativ", hul: 6, nr: 7, titel: "glas 7", del: 1 },
        { navn: "glas8", type: "reagensglas", stativ: "stativ", hul: 7, nr: 8, titel: "glas 8", del: 1 },

        /* Spatlen, glasstaven og termometeret ligger forrest paa bordpladen */
        { navn: "spatel", type: "spatel", p: { x: 290, y: 550, v: 0 }, del: 1 },
        { navn: "glasstav", type: "glasstav", x: 820, y: 546, del: 1 },
        { navn: "termometer", type: "termometer", x: 900, y: 562, del: 1 },

        /* Vandbadet staar paa varmepladen og varmes, naar eleven taender
           den. Isbadet holdes paa 2 grader (holdT: isen fyldes efter).
           Begge er udstyret "bad": et stort baegerglas, man saetter
           reagensglas ned i, og glasset tager badets temperatur. */
        { navn: "plade", type: "varmeplade", p: { x: 715, y: 428, v: 0 }, del: 1 },
        { navn: "vandbad", type: "bad", paa: "plade", x: 791, titel: "vandbadet", holdT: 80, del: 1,
          indhold: opl(180, {}) },
        { navn: "isbad", type: "bad", x: 965, titel: "isbadet", holdT: 2, del: 1,
          indhold: { V: 180, T: 2, mM: {} } },

        /* Hylden til hoejre: det store baegerglas med dagens
           stamoploesning. 500 mL af de 600, det kan rumme - nok til begge
           dele, saa kolben er den haandterlige portion og baegerglasset
           forraadet. Det staar fremme i begge dele. */
        { navn: "baeger", type: "baegerStor", x: 790, y: HYLDE_HOEJRE,
          titel: "bægerglasset med stamopløsning", indhold: opl(500, STAM) },

        /* Del 2: de fire baegerglas paa bordet, to og to i par */
        baeger(1, PAR1[0]), baeger(2, PAR1[1]),
        baeger(3, PAR2[0]), baeger(4, PAR2[1])
    ];

    /* Kemichael taler bag bordet (bagBord) og kommer om for enden, naar der
       skal ryddes op eller hentes kaffe. Tegnebordet er 1040 bredt
       i stedet for 1520, saa alt er omkring 45 %
       stoerre paa skaermen. Bordpladen er 64 dyb, saa der er plads til at
       stille ting foran stativet. Tegnebordet staar forneden i laerredet
       (lodret: "bund"), og zoomboblen staar i laboratoriets oeverste
       venstre hjoerne med radius 135. Kuglerne og skriften inde i den er
       en tiendedel mindre end standard (bobleIndhold), saa der er luft
       mellem dem, og skriften stadig kan laeses ved 1366 x 768. Et klik
       paa boblen viser den stor. Tilskuerionerne (K+ og NO3-) findes ud fra
       opstillingen og reaktionerne og er skjult i boblen og i panelets
       tabel, til eleven saetter flueben (tilskuere: true). Boblens skala er
       fast: 3 mM giver 6 kugler (partikelRef), saa FeSCN2+ bliver flere,
       naar der tilsaettes Fe3+ eller SCN-. Den foerste hylde er kaffens
       (lavKaffekop). */
    NK.BORD_VALG = {
        bredde: 1040, hoejde: 650, bord: 500, bordDybde: 64, lodret: "bund",
        hylder: [
            { x0: 340, x1: 690, y: HYLDE_KAFFE },
            { x0: 340, x1: 690, y: HYLDE_FLASKER },
            { x0: 715, x1: 1025, y: HYLDE_HOEJRE }
        ],
        plakat: { x: 880, y: 70 },
        bagBord: KEMICHAEL,
        boble: BOBLE, bobleR: 135, bobleIndhold: 0.9, tilskuere: true, partikler: 6, partikelRef: 3
    };
}());
