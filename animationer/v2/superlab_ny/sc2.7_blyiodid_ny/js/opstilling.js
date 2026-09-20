/* =====================================================================
   opstilling.js - bordet i sc2.7

   Stofferne, reaktionerne og PbI2's oploselighed staar i den faelles
   tabel ../../../laboratoriet/js/stoftabel.js. Her vaelges kun, hvad der
   staar paa bordet. Kemien i forsoeget er:

       Pb²⁺(aq) + 2 I⁻(aq)  ⇌  PbI₂(s)

   med oploselighedsproduktet K(T), der stiger kraftigt med temperaturen
   (ΔH og ΔCp i stoftabellen): 0,044 / 0,069 / 0,41 g PbI2 pr. 100 mL ved
   0 / 20 / 100 °C. Eleven afvejer ca. 0,100 g Pb(NO3)2 og samme masse KI,
   haelder dem i 100 mL vand, varmer bundfaldet i oploesning og noterer
   temperaturen, naar de foerste krystaller kommer igen. Tre gange, med ca.
   0,050 g mere af hvert stof hver gang: ca. 52, 70 og 83 °C.

   M(Pb(NO3)2) = 331,2 g/mol er naesten 2 · M(KI) = 332 g/mol, saa samme
   masse giver forholdet 1 : 2 - det, faeldningen skal bruge.

   Afvejningen er som i den gamle sc2.7 (din beslutning): en spatelspids
   er 0,038-0,062 g, forskellig hver gang (spatelGram paa pulverglassene),
   og en tom spatel tager 0,004-0,016 g af igen fra vejebaaden (spatelGram
   paa den). Vaegten viser tre decimaler og er tareret med vejebaaden fra
   start. Hvilke masser der maa haeldes i, er forsoegets regel (js/app.js,
   NK.MAALING.regel): foerste gang 0,090-0,110 g Pb(NO3)2, derefter
   0,040-0,060 g, og KI samme masse som Pb(NO3)2, hoejst 0,010 g fra.

   Varmepladen har en magnetomroerer (kan.omroerer, hoejre knap) og en
   effekt paa 1100 W: 100 mL vand stiger 2,6 °C i sekundet, som i den
   gamle, og pladen er varm i 2,2 s efter, at der er slukket (traeghed).
   Afkoelingen mod stuen har motorens tidskonstant (40 s).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function opl(V, mM) { return { V: V, T: 20, mM: mM }; }

    /* Pulverglassene er halvanden gang saa store som motorens (F73), saa
       formlen og faremaerkerne kan laeses. Paa etiketten staar kun formlen;
       navnet staar i panelet, naar glasset er valgt. */
    var PULVER_SKALA = 1.45;
    function pulver(navn, x, y, etiket, titel, stof) {
        var u = {};
        u[stof] = 30000;
        return { navn: navn, type: "pulverglas", x: x, y: y, skala: PULVER_SKALA, etiket: etiket, titel: titel,
                 indhold: { V: 0, T: 20, umol: u }, pulverMaks: 30000,
                 spatelGram: SPATEL.spids };
    }

    /* Spatlen (som den gamle sc2.7's SPATEL): en spatelspids og det, en
       tom spatel tager af igen, i gram */
    var SPATEL = { spids: [0.038, 0.062], af: [0.004, 0.016] };
    NK.SPATEL = SPATEL;

    /* Laboratoriet er 1040 bredt som sb2.4's. Det oeverste venstre hjoerne
       er zoomboblens (BOBLE); under den staar kun det, der er lavere end
       147 (dunken og vaegten). Reagenserne staar paa hylden til hoejre,
       over den frie del af bordet, hvor der er plads til at arbejde. */
    var BOBLE = { x: 172, y: 192 };
    var HYLDE = 230;
    /* Kemichaels plan bag bordet, som i sb2.4 (K3 prøver, om planet er
       generisk nok): halsen i 358, saa issen naar op under hylden */
    var KEMICHAEL = { y: 358, skala: 0.82 };

    NK.OPSTILLING = [
        /* Venstre ende: dunken til tungmetalaffald og vaegten med
           vejebaaden, tareret fra start */
        { navn: "dunk", type: "affaldsdunk", x: 70, etiket: ["TUNGMETAL", "affald"], titel: "dunken til tungmetalaffald" },
        { navn: "vaegt", type: "vaegt", p: { x: 150, y: 438, v: 0 }, decimaler: 3, tareret: true },
        { navn: "baad", type: "vejebaad", paa: "vaegt", x: 220, spatelGram: SPATEL.af },

        /* Varmepladen med magnetomroerer og bægerglasset paa den. Et tryk
           fra maaleglasset giver hele dets indhold (modtager, haeldMl) */
        { navn: "plade", type: "varmeplade", p: { x: 330, y: 428, v: 0 }, effekt: 1100, traeghed: 2.2,
          kan: { omroerer: true }, titel: "varmepladen" },
        { navn: "baeger", type: "baegerLille", paa: "plade", x: 420, titel: "bægerglasset", modtager: 100 },
        { navn: "maaleglas", type: "maaleglas", x: 560, titel: "måleglasset med 100 mL vand",
          indhold: opl(100, {}), haeldMl: 100 },

        /* Hylden: de to pulverglas og koekkenrullen. Kaffen staar ved
           plakaten (motoren stiller den selv) */
        pulver("pb", 662, HYLDE, "Pb(NO₃)₂", "glasset med blynitrat, Pb(NO₃)₂", "Pb(NO3)2(s)"),
        pulver("ki", 728, HYLDE, "KI", "glasset med kaliumiodid, KI", "KI(s)"),
        { navn: "papir", type: "koekkenrulle", x: 808, y: HYLDE },

        /* Forrest paa bordpladen: kurven til snavset udstyr og boetten med
           rene spatler til venstre (F44, F52), spatlen og termometeret */
        { navn: "kurv", type: "kurv", x: 58, y: 564, etiket: ["SNAVSET", "udstyr"] },
        { navn: "spatler", type: "spatelboette", x: 124, y: 562 },
        { navn: "spatel", type: "spatel", p: { x: 300, y: 552, v: 0 } },
        { navn: "termometer", type: "termometer", x: 720, y: 562 }
    ];

    /* Scenen som sb2.4's: tegnebordet 1040 × 650 forneden i laerredet, en
       bordplade med dybde, zoomboblen i hjoernet og Kemichael bag bordet.
       Boblens skala: 1 mM giver 6 kugler (partikelRef), saa 0,3 mM Pb2+
       i et glas med 0,1 g Pb(NO3)2 giver to, og krystallen i bunden er
       Stof.gitter. Tilskuerionerne er K+ og NO3- (alt andet end de
       centrale). */
    /* ----- Bord og zoom (M19) ---------------------------------------------
       Zoom er laerredets bredde delt med bordets: paa en skaerm i 1366 x 768
       er laerredet 936 x 715, saa dette bord (1040 x 650) staar i 0,90.
       1920 x 1080 giver 1,43, og 1280 x 720 giver 0,82. Hoejden saetter
       loftet paa samme maade (715 / 650 = 1,10), saa bredden bestemmer her.

       sc2.7 bruger lidt udstyr: paa bordet staar dunken (90), vaegten med
       vejebaaden (140), varmepladen med bægerglasset (180) og maaleglasset
       (44) i den bageste raekke - 454 i alt - og kurven (110), spatelboetten
       (40), spatlen (96) og termometeret (120) forrest, 366 i alt. Paa
       hylden staar to pulverglas og koekkenrullen, 224. Zoomboblen fylder
       270 i hjoernet, og Kemichael bag bordet 178.

       Vurdering: bordet kan komme ned paa ca. 760 x 620, hvis raekkerne
       rykkes sammen (boblen bliver i hjoernet, hylden flyttes ind over
       bordet). Det giver zoom 1,23 ved 1366 x 768 - godt en tredjedel
       stoerre end nu - og det er nok det hoejeste, forsoeget kan komme op
       paa, saa laenge Kemichael skal kunne staa bag bordet. Det koster nye
       koordinater i hele opstillingen og et gennemsyn af rundvisningen,
       saa det er ikke gjort endnu. */
    NK.BORD_VALG = {
        bredde: 1040, hoejde: 650, bord: 500, bordDybde: 64, lodret: "bund",
        hylder: [
            { x0: 620, x1: 1000, y: HYLDE }
        ],
        plakat: { x: 880, y: 104 },
        bagBord: KEMICHAEL,
        boble: BOBLE, bobleR: 135, bobleIndhold: 0.9, partikler: 6, partikelRef: 1,
        tilskuere: { centrale: ["Pb2+", "I-", "PbI2(s)"] }
    };
}());
