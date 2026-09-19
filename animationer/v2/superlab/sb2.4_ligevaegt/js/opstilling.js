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

   Del 2 er fortyndingen: fire baegerglas, to og to i par. Par 1 faar
   frugtfarve, par 2 ligevaegtsblanding fra den samme kolbe. Det ene glas
   i hvert par fortyndes med vand, og de fire ses ovenfra (js/ovenfra.js).

   De to dele deler ét bord. Hver genstand har et `del`, og js/dele.js
   skjuler den anden dels ting (motorens `skjult`, som tegningen,
   traefningen og slipmaalet allerede spoerger om). Det, der bruges i
   begge dele - affaldet, kolben, koekkenrullen og sproejteflasken - har
   intet `del` og staar hele tiden.

   Stamoploesningen: 12 mL 0,10 M Fe(NO₃)₃ og 12 mL 0,10 M KSCN fortyndet
   til 400 mL, altsaa 3 mM af hver. Ved ligevaegt giver det 0,73 mM
   FeSCN²⁺ og 2,28 mM frit Fe³⁺.

   Hvorfor ikke mere? Fordi en KRAFTIG stamoploesning gaar doed i
   fortyndingsproeven. Jo mere koncentreret blandingen er, jo stoerre en
   del er allerede bundet i komplekset, og jo mindre rykker en fortynding:
   ved 8 mM er der 71 % af komplekset tilbage efter en fortynding til det
   dobbelte, ved 3 mM kun 63 % - og des mere frit Fe³⁺ er der til at
   traede frem som gult. Farven er i stedet gjort kraftig med
   ekstinktionskoefficienten k for FeSCN²⁺ i stoftabellen: dét er knappen
   paa farvedybden, mens koncentrationen er knappen paa, hvor meget
   ligevaegten kan flytte sig. Motoren regner selv ligevaegten frem; her
   staar kun det, der blev blandet.

   Spatelspidserne (S12): hvert pulverglas har sin egen, fordi glassene
   kun har 12 µmol Fe³⁺ og 12 µmol SCN⁻ at arbejde med. Motorens 1,5 mmol
   ville goere glas 1 sort (375 mM Fe³⁺) og glas 2 farveloest. Med 8 µmol
   Fe(NO₃)₃ bliver glas 1 tydeligt moerkere, men stadig roedorange; 3 µmol
   ascorbinsyre reducerer halvdelen af jernet, saa glas 2 bliver lysere og
   ikke farveloest (og al ascorbinsyren bruges, saa pH ender omkring 2,8 af
   de to H⁺, redoxen afgiver - F25, S11); 30 µmol KSCN giver glas 3 mere
   end dobbelt saa meget kompleks. Draabeflasken er 0,1 M: én draabe
   lysner lidt, to tydeligt, og tre fjerner al SCN⁻, saa kun Fe³⁺'s gule
   farve er tilbage.
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
    function pulver(navn, x, y, etiket, titel, stof, spids) {
        var u = {};
        u[stof] = 30000;
        return { navn: navn, type: "pulverglas", x: x, y: y, etiket: etiket, titel: titel, del: 1,
                 indhold: { V: 0, T: 20, umol: u }, pulverMaks: 30000, spatelspids: spids };
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

    /* Stamoploesningen: Fe³⁺ og SCN⁻ 3 mM, plus modionerne */
    var STAM = { "Fe3+": 3, "SCN-": 3, "K+": 3, "NO3-": 9 };

    /* Frugtfarve: et blaat farvestof, der ikke indgaar i nogen reaktion.
       Flasken er en stamflaske paa 100 mL og 35 mM - ti gange saa
       kraftig som den farve, der skal staa i glassene, saa den doseres og
       ikke haeldes op. En portion er derfor lille (FARVE_PORTION), og
       resten af rumfanget er vand fra sproejteflasken. Saadan bruger man
       ogsaa frugtfarve i et koekken: et par draaber i en skaal. */
    var FRUGTFARVE = { "farve": 35 };

    /* De syv reagensglas rummer en tredjedel mindre end udstyrets
       reagensglas: 20 mL i stedet for 30 (F33). Rumfanget foelger
       tegningen (rumfangFoelger), saa de er (2/3)^(1/3) = 87 % saa store i
       hver retning, og en portion - en femtedel af glasset - er 4 mL af sig
       selv. De staar i stativets huller, som de er, saa der er luft mellem
       dem. Et kortere glas synker ned i hullet, til det staar paa
       stativets bund (bundY), saa vaesken staar frit mellem stativets to
       braedder. */
    var GLAS_SKALA = Math.cbrt(2 / 3);
    /* Skiltene: glas 7 er referencen R (F31). Forundersoegelsen i glas 8
       er fjernet igen (F48), og glas 4 hedder 4 igen. */
    var SKILT = { 7: "R" };
    function glas(nr) {
        var s = SKILT[nr] || String(nr);
        return { navn: "glas" + nr, type: "reagensglas", stativ: "stativ", hul: nr - 1, nr: s,
                 titel: "glas " + s, del: 1, skala: GLAS_SKALA, rumfangFoelger: true };
    }

    /* Stativet til sb2.4: som udstyrets stativ, men med syv huller og uden
       tal paa bunden, for glassene har selv deres skilte (1-6 og R). Spriten
       ligger i forsoegets egen sprites/. (F31 havde et ottende hul for sig
       til forundersoegelsen; det gik ud med den i F48.) */
    (function () {
        var s = NK.Udstyr.type("stativ"), ny = {}, n;
        for (n in s) if (Object.prototype.hasOwnProperty.call(s, n)) ny[n] = s[n];
        ny.sprite = "stativ7";
        ny.fil = "stativ_7.svg";
        ny.mappe = "sprites/";
        ny.b = 320;
        ny.huller = [34, 76, 118, 160, 202, 244, 286];
        NK.Udstyr.tilfoej("stativ7", ny);
    }());

    /* De fire baegerglas i del 2, to og to i par med luft imellem. De
       staar paa hvert sit hvide underlag paa bordpladen, og det staar
       forrest paa papiret, hvad parret skal have (F32): det skal vaere
       helt tydeligt, at par 1 er frugtfarve og par 2 stamoploesning. */
    var PAR1 = [380, 470], PAR2 = [660, 750], PAR_BUND = 532;
    function baeger(nr, x) {
        return { navn: "baeger" + nr, type: "baegerLille", x: x, y: PAR_BUND, del: 2,
                 titel: "bægerglas " + nr };
    }
    function underlag(par, tekst) {
        return { x0: par[0] - 56, x1: par[1] + 56, y0: 503, y1: 562, tekst: tekst,
                 vis: function () { return !NK.DELE || NK.DELE.nu() === 2; } };
    }

    NK.OPSTILLING = [
        /* Venstre ende af bordet, under zoomboblen: affaldet og kolben */
        { navn: "dunk", type: "affaldsdunk", x: 70, etiket: ["AFFALD", "surt uorg."] },
        /* F53: haandvasken med demineraliseret vand staar lige ved
           affaldsdunken: kummen i bordpladen og hanen over den */
        { navn: "vask", type: "kumme", x: 190, y: 543, titel: "vasken" },
        { navn: "hane", type: "vandhane", x: 202, y: 524, titel: "hanen med demineraliseret vand" },
        /* 150 mL i en kolbe paa 200: den skal ikke staa til kanten, og
           inddelingens oeverste streg er netop 150. Det raekker til del 1
           (7 glas a 4 mL) og til del 2 (to portioner a 40 mL). */
        { navn: "kolbe", type: "kolbe", x: 296, titel: "kolben med stamopløsning", indhold: opl(150, STAM),
          /* Hældes den i affaldet, fylder Kemichael den igen (S16) */
          genopfyld: true },

        /* Hylden over stativet: koekkenrullen (kaffen stilles selv ved
           venstre ende) og pulverglassene til glas 1, 2 og 3 */
        { navn: "papir", type: "koekkenrulle", x: 460, y: HYLDE_KAFFE },
        pulver("pulver_fe",   540, HYLDE_KAFFE, "Fe(NO₃)₃", "pulverglasset med Fe(NO₃)₃", "Fe(NO3)3(s)", 8),
        pulver("pulver_asc",  590, HYLDE_KAFFE, "C-vitamin", "pulverglasset med ascorbinsyre", "Asc(s)", 3),
        pulver("pulver_kscn", 640, HYLDE_KAFFE, "KSCN", "pulverglasset med KSCN", "KSCN(s)", 30),

        /* Den oeverste hylde: draabeflasken og sproejteflasken, og i del 2
           frugtfarven. (KSCN-flasken til forundersoegelsen er fjernet, F48:
           nysgerrige kan selv lave den med det faste salt.) */
        { navn: "fl_farve", type: "flaskeFarve", x: 400, y: HYLDE_FLASKER, etiket: ["frugt-", "farve"], del: 2,
          titel: "flasken med frugtfarve", indhold: opl(100, FRUGTFARVE) },
        { navn: "ag", type: "draabeflaske", x: 470, y: HYLDE_FLASKER, etiket: ["AgNO₃", "0,1 M"], del: 1,
          titel: "dråbeflasken med AgNO₃", indhold: opl(60, { "Ag+": 100, "NO3-": 100 }) },
        { navn: "vand", type: "sproejteflaske", x: 560, y: HYLDE_FLASKER, titel: "sprøjteflasken med vand",
          indhold: opl(500, {}) },

        /* De syv reagensglas i stativet */
        { navn: "stativ", type: "stativ7", p: { x: 346, y: 400, v: 0 }, del: 1 },
        glas(1), glas(2), glas(3), glas(4), glas(5), glas(6), glas(7),

        /* Spatlen, glasstaven og termometeret ligger forrest paa bordpladen */
        { navn: "spatel", type: "spatel", p: { x: 290, y: 550, v: 0 }, del: 1 },
        /* F44/F52: kurven til snavset udstyr forrest til venstre (i begge
           dele) og boetten med rene spatler lige ved siden af den */
        { navn: "kurv", type: "kurv", x: 58, y: 564, etiket: ["SNAVSET", "udstyr"] },
        { navn: "spatler", type: "spatelboette", x: 124, y: 562, del: 1 },
        { navn: "glasstav", type: "glasstav", x: 820, y: 546, del: 1 },
        { navn: "termometer", type: "termometer", x: 900, y: 562, del: 1 },

        /* Vandbadet staar paa varmepladen og varmes, naar eleven taender
           den. Isbadet holdes paa 2 grader (holdT: isen fyldes efter).
           Begge er udstyret "bad": et stort baegerglas, man saetter
           reagensglas ned i, og glasset tager badets temperatur. */
        { navn: "plade", type: "varmeplade", p: { x: 715, y: 428, v: 0 }, del: 1 },
        { navn: "vandbad", type: "bad", paa: "plade", x: 791, titel: "vandbadet", holdT: 80, del: 1,
          indhold: opl(180, {}) },
        { navn: "isbad", type: "bad", x: 965, titel: "isbadet", holdT: 2, del: 1, is: true,
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
       paa boblen viser den stor.

       Tilskuerionerne siges her ved at sige, hvad der IKKE er tilskuer:
       forsoeget handler om Fe3+, SCN-, FeSCN2+ og de to indgreb, der
       fjerner dem (Ag+ faelder, Fe2+ er det reducerede jern). Alt andet
       ionisk - K+, NO3-, H+, OH- - er tilskuer og skjules i boblen og i
       panelets tabel, til eleven saetter flueben. Motoren kan selv finde
       de ioner, der ikke tager del i nogen reaktion, men H+ GOER det her
       (redoxen afgiver to pr. ascorbinsyre) uden at betyde noget for det,
       der skal laeres. Det ved forsoeget, og motoren kan ikke gaette
       det: i en titrering ville H+ vaere hovedpersonen. Boblens skala er
       fast: 3 mM giver 6 kugler (partikelRef), saa FeSCN2+ bliver flere,
       naar der tilsaettes Fe3+ eller SCN-. Tallet er lavt med vilje: gaar
       det hoejere, rammer et glas med en stamoploesning loftet paa 20
       kugler (Stof.PARTIKEL_LOFT), og saa kan et indgreb ikke laengere
       ses som FLERE komplekser, kun som en anden fordeling.
       Den foerste hylde er kaffens
       (lavKaffekop). */
    NK.BORD_VALG = {
        bredde: 1040, hoejde: 650, bord: 500, bordDybde: 64, lodret: "bund",
        hylder: [
            { x0: 340, x1: 690, y: HYLDE_KAFFE },
            { x0: 340, x1: 690, y: HYLDE_FLASKER },
            { x0: 715, x1: 1025, y: HYLDE_HOEJRE }
        ],
        plakat: { x: 880, y: 70 },
        /* F43: pilen til del 2 paa vaeggen ved plakaten, over baegerglasset
           paa hylden til hoejre */
        pil: { x: 688, y: 26, b: 186, h: 62, tekst: "Videre til del 2" },
        bagBord: KEMICHAEL,
        boble: BOBLE, bobleR: 135, bobleIndhold: 0.9, partikler: 6, partikelRef: 3,
        tilskuere: { centrale: ["Fe3+", "SCN-", "FeSCN2+", "Ag+", "Fe2+"] },
        underlag: [underlag(PAR1, "Par 1 · frugtfarve"), underlag(PAR2, "Par 2 · stamopløsning")]
    };
}());
