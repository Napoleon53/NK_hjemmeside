/* =====================================================================
   data.js - stofferne paa hylderne, maalene paa fane 2 og 3 og
   replikkerne

   Alt, der kan staa som data, staar her. pH-vaerdierne for
   hverdagsstofferne er typiske vaerdier (se README); de varierer fra
   produkt til produkt. Facit i fane 2 og 3 regnes af modellen i kemi.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Fane 1: hverdagsstofferne ------------------------------------------
       id er ogsaa navnet paa spritet. note: én linje efter maalingen. */
    D.STOFFER = [
        { id: "citron", navn: "Citronsaft", ph: 2.3, hylde: 0, note: "Citronsyre gør den sur." },
        { id: "cola", navn: "Cola", ph: 2.5, hylde: 0, note: "Phosphorsyre. Næsten lige så sur som citron." },
        { id: "kaffe", navn: "Kaffe", ph: 5.0, hylde: 0, note: "Svagt sur." },
        { id: "maelk", navn: "Mælk", ph: 6.7, hylde: 0, note: "Næsten neutral." },
        { id: "natron", navn: "Natron i vand", ph: 8.3, hylde: 0, note: "Natron er NaHCO₃. Svagt basisk." },
        { id: "afloebsrens", navn: "Afløbsrens", ph: 13.5, hylde: 0, note: "Natriumhydroxid. Ætsende." },
        { id: "mavesaft", navn: "Mavesaft", ph: 1.5, hylde: 1, note: "Saltsyre fra mavens væg." },
        { id: "oel", navn: "Øl", ph: 4.5, hylde: 1, note: "Kulsyre og syrer fra gæringen." },
        { id: "regnvand", navn: "Regnvand", ph: 5.6, hylde: 1, note: "CO₂ fra luften gør regnvand svagt surt." },
        { id: "blod", navn: "Blod", ph: 7.4, hylde: 1, note: "Kroppen holder det mellem 7,35 og 7,45." },
        { id: "saebevand", navn: "Sæbevand", ph: 9.5, hylde: 1, note: "Sæbe er svagt basisk." },
        { id: "klorin", navn: "Klorin", ph: 12.5, hylde: 1, note: "Indeholder natriumhydroxid. Ætsende." }
    ];

    D.stof = function (id) {
        for (var i = 0; i < D.STOFFER.length; i++) if (D.STOFFER[i].id === id) return D.STOFFER[i];
        return null;
    };

    D.HYLDER = [
        { navn: "Køkkenet", hint: "Frugt og sodavand er sure. Et middel, der opløser fedt i afløbet, er stærkt basisk." },
        { navn: "Rundt omkring", hint: "Maven skal kunne nedbryde maden. Blod er tæt på neutralt. Klorin er et rengøringsmiddel." }
    ];
    D.HYLDER.forEach(function (h, i) {
        h.stoffer = D.STOFFER.filter(function (s) { return s.hylde === i; });
    });

    /* Hvor godt et gaet er: hoejst 1 fra er taet paa */
    D.gaetDom = function (fejl) {
        if (fejl <= 1.0) return { ord: "Tæt på", klasse: "god" };
        if (fejl <= 2.5) return { ord: "Nogenlunde", klasse: "gul" };
        return { ord: "Langt fra", klasse: "skidt" };
    };

    /* ----- Fane 2: maalene i luppen ------------------------------------------
       start: pH og zoom, naar maalet begynder. Et maal er naaet, naar
       pH er maal.ph (med én decimal) og zoom er inden for zMin-zMaks. */
    D.LUP_MAAL = [
        { tekst: "Rent vand har pH 7. Gør vandet surere, så der er 10 gange så mange H₃O⁺.",
          start: { ph: 7, z: 8 }, maal: { ph: 6 },
          hint: "Træk pH-mærket mod venstre. Tæl de røde H₃O⁺ i luppen undervejs.",
          efter: "pH 6: 10 gange så mange H₃O⁺. Se også OH⁻: 10 gange færre." },
        { tekst: "Gør vandet basisk, så der er 100 gange så mange OH⁻ som i rent vand.",
          start: { ph: 7, z: 8 }, maal: { ph: 9 },
          hint: "Ét trin op på skalaen giver 10 gange så mange OH⁻. Hvor mange trin giver 100 gange?",
          efter: "pH 9: to trin op. 10 · 10 = 100 gange så mange OH⁻." },
        { tekst: "Gå til pH 2. Zoom ind, til du kan tælle H₃O⁺ i luppen.",
          start: { ph: 7, z: 8 }, maal: { ph: 2, zMin: 2, zMaks: 5 },
          hint: "Tryk på + ved luppen. Hvert klik viser et 10 gange mindre rum.",
          efter: "" },
        { tekst: "Bliv på pH 2. Zoom ud, til der er mindst én OH⁻ i luppen.",
          start: { ph: 2, z: 4 }, maal: { ph: 2, zMin: 12 },
          hint: "OH⁻ er de blå. Ved pH 2 er der meget langt imellem dem. Tryk på − mange gange.",
          efter: "Ved pH 2 er der 10 milliarder H₃O⁺ for hver OH⁻." },
        { tekst: "Gå fra pH 1 til pH 13. Zoom ud, til luppen igen viser 10 H₃O⁺.",
          start: { ph: 1, z: 2 }, maal: { ph: 13, zMin: 14, zMaks: 14 },
          hint: "Ét pH-trin er ét klik. Hvor mange trin er der fra 1 til 13?",
          efter: "12 klik ud. Ved pH 13 er der 10¹² gange færre H₃O⁺ end ved pH 1. Det er en billion." }
    ];

    /* ----- Fane 3: maalene ved fortyndingsbordet --------------------------------
       slags: valg (vaelg foerst, og fortynd saa for at se det), glas (naa et
       glas), tal (skriv et tal), basisk (kan ikke naas; se sim_fortynd.js).
       serie og k: saa mange fortyndinger skal der vaere i den serie. */
    D.MAKS_GLAS = 9;           /* fortyndinger pr. serie; saa er bordet fuldt */
    D.START_C = 0.1;           /* saltsyre og natronlud, mol/L */

    D.FORTYND_MAAL = [
        { slags: "valg", serie: "syre", k: 1,
          tekst: "Saltsyren har pH 1. Hvad bliver pH, når den fortyndes 10 gange?",
          valg: [
              ["pH 0,1", "Så ville den være blevet surere. Vand gør ikke en syre surere."],
              ["pH 1,1", "Ti gange mere vand giver ti gange færre H₃O⁺. Det er et helt trin."],
              ["pH 2", ""],
              ["pH 10", "pH 10 er basisk. Vand gør ikke en syre basisk."]
          ], rigtig: 2,
          hint: "Ti gange færre H₃O⁺. Hvor langt er det på skalaen?",
          efter: "pH 2. Ti gange mere vand giver ti gange færre H₃O⁺: ét trin op." },
        { slags: "glas", serie: "syre", k: 4,
          tekst: "Fortynd saltsyren, til pH er 5.",
          hint: "Ét trin pr. fortynding. Fra pH 1 til pH 5 er der fire trin.",
          efter: "Fire fortyndinger. Fire trin op ad skalaen." },
        { slags: "tal", svar: 10000,
          tekst: "Hvor mange gange er glasset med pH 5 fortyndet i forhold til saltsyren?",
          fejl: [
              [4, "Det er antallet af fortyndinger. Hver af dem gør det 10 gange tyndere."],
              [40, "Du har lagt 10 sammen fire gange. Hver fortynding ganger med 10."],
              [5, "Det er glassets pH. Spørgsmålet er, hvor mange gange det er fortyndet."],
              [1000, "Tæl fortyndingerne fra pH 1 til pH 5 igen."],
              [100000, "Tæl fortyndingerne fra pH 1 til pH 5 igen."]
          ],
          hint: "Hver fortynding er 10 gange. Der er fire: 10 · 10 · 10 · 10.",
          efter: "10 · 10 · 10 · 10 = 10.000 gange. Fire trin på skalaen." },
        { slags: "basisk", serie: "syre",
          tekst: "Fortynd saltsyren, til den bliver basisk.",
          hint: "Se på pH og luppen, når glassene nærmer sig 7. Hvilken ion er der flest af?",
          efter: "Den bliver aldrig basisk. Vandet har selv lige mange H₃O⁺ og OH⁻, så pH går mod 7 og stopper der." },
        { slags: "valg", serie: "base", k: 3,
          tekst: "Natronluden har pH 13. Hvad bliver pH, når den fortyndes 1.000 gange?",
          valg: [
              ["pH 16", "Mere vand bringer pH tættere på 7. For en base går pH ned."],
              ["pH 13", "Der er 1.000 gange færre OH⁻ nu. Det kan pH-metret se."],
              ["pH 10", ""],
              ["pH 7", "1.000 gange er ikke nok til det. Der skal flere fortyndinger til."]
          ], rigtig: 2,
          hint: "1.000 gange er tre fortyndinger. For en base går pH ned mod 7.",
          efter: "pH 10. Tre fortyndinger og tre trin ned mod 7." }
    ];

    /* ----- Kemichael ----------------------------------------------------------
       Hoejst ca. 60 tegn pr. replik og ingen teori. */
    D.INTRO_SKALA = [
        "pH-skalaen. Hvert stof på bordet skal have en plads.",
        "Træk et stof op, hvor du tror, det hører til.",
        "Ingen smager på noget. Heller ikke på colaen."
    ];
    D.INTRO_LUP = [
        "Luppen viser ionerne i et bitte lille rum.",
        "Træk pH-mærket, og zoom med plus og minus.",
        "Vandmolekylerne har jeg skjult. De fyldte alt."
    ];
    D.INTRO_FORTYND = [
        "Fortyndingsbordet. Saltsyre, natronlud og masser af vand.",
        "Tryk Fortynd under saltsyren eller natronluden.",
        "Pipetten er ny. Den gamle ligger i vasken."
    ];

    D.HYLDE_ROS = [
        "Køkkenet er målt. Også min kaffe. Det var ikke aftalt.",
        "Klorin og syre må aldrig blandes. Det er ikke en quiz."
    ];
    D.LUP_FAERDIG = "Tolv klik ud. En billion. Og du zoomede selv.";
    D.FORTYND_BASISK = "Det er vand nu. Meget dyrt vand.";
    D.FORTYND_FAERDIG = "Fem mål, og pipetten er hel. Det skriver jeg ned.";

    /* Paaskeaeg */
    D.AEG_PRAECIS = "Præcis. Du har vel ikke smagt på den?";
    D.AEG_ZOOM = "En halv millimeter. Den kan man næsten se.";

    NK.Data = D;
}());
