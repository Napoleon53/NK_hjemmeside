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
        { id: "citron", navn: "Citronsaft", ph: 2.3, hylde: 0, note: "Citronsyre gør citronsaft sur." },
        { id: "cola", navn: "Cola", ph: 2.5, hylde: 0, note: "Phosphorsyre gør cola næsten lige så sur som citronsaft." },
        { id: "kaffe", navn: "Kaffe", ph: 5.0, hylde: 0, note: "Svagt sur." },
        { id: "maelk", navn: "Mælk", ph: 6.7, hylde: 0, note: "Næsten neutral." },
        { id: "natron", navn: "Natron i vand", ph: 8.3, hylde: 0, note: "Natron er NaHCO₃. Svagt basisk." },
        { id: "afloebsrens", navn: "Afløbsrens", ph: 13.5, hylde: 0, note: "Afløbsrens indeholder natriumhydroxid og er ætsende." },
        { id: "mavesaft", navn: "Mavesaft", ph: 1.5, hylde: 1, note: "Mavesaft indeholder saltsyre fra mavens væg." },
        { id: "oel", navn: "Øl", ph: 4.5, hylde: 1, note: "Øl indeholder kulsyre og syrer fra gæringen." },
        { id: "regnvand", navn: "Regnvand", ph: 5.6, hylde: 1, note: "CO₂ fra luften gør regnvand svagt surt." },
        { id: "blod", navn: "Blod", ph: 7.4, hylde: 1, note: "Kroppen holder blodets pH mellem 7,35 og 7,45." },
        { id: "saebevand", navn: "Sæbevand", ph: 9.5, hylde: 1, note: "Sæbe er svagt basisk." },
        { id: "klorin", navn: "Klorin", ph: 12.5, hylde: 1, note: "Klorin indeholder natriumhydroxid og er ætsende." }
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
       start: pH, naar maalet begynder (der, hvor det forrige sluttede).
       ph: maalet er naaet, naar maerket er sluppet paa den pH, og luppen
       er faerdig med at zoome. slags "valg": vaelg det rigtige svar.
       Luppen zoomer selv (se lup.js og NK.Kemi.autoZoom). */
    D.LUP_MAAL = [
        { tekst: "Rent vand har pH 7. Gør vandet surere, så der er 10 gange så mange H₃O⁺.",
          start: 7, ph: 6,
          hint: "Træk pH-mærket mod venstre. Der er 10 røde H₃O⁺ i luppen nu. Hvornår er der 100?",
          efter: "Ved pH 6 er der 100 H₃O⁺ i stedet for 10, og antallet af OH⁻ er faldet fra 10 til 1. Ét trin på skalaen svarer til en faktor 10." },
        { tekst: "Træk pH-mærket videre til pH 5, og se, hvad luppen gør.",
          start: 6, ph: 5,
          hint: "Træk mærket ét trin mere mod venstre. Hold øje med luppen, når der bliver over 100 H₃O⁺.",
          efter: "Luppen zoomede ind, fordi der blev over 100 H₃O⁺. Rummet i luppen er 10 gange mindre, og der er stadig 100 H₃O⁺, så koncentrationen af H₃O⁺ er 10 gange større end ved pH 6." },
        { tekst: "Gå til pH 2. Tæl, hvor mange gange luppen zoomer ind.",
          start: 5, ph: 2,
          hint: "Træk mærket hen til 2 på skalaen. Den gule ring viser, hvor luppen zoomer ind.",
          efter: "Tre gange. Luppen zoomer én gang for hvert trin fra pH 5 til pH 2, og hvert zoom viser et 10 gange mindre rum." },
        { slags: "valg", start: 2,
          tekst: "Hvor mange gange så mange H₃O⁺ er der ved pH 2 som i rent vand?",
          valg: [
              ["5 gange", "5 er antallet af trin fra pH 7 til pH 2. Hvert trin giver 10 gange flere H₃O⁺."],
              ["50 gange", "Du har lagt 10 sammen fem gange. Hvert trin ganger med 10."],
              ["10.000 gange", "Tæl trinene fra pH 7 til pH 2 igen. Der er fem."],
              ["100.000 gange", ""]
          ], rigtig: 3,
          hint: "Der er fem trin fra pH 7 til pH 2, og hvert trin ganger med 10: 10 · 10 · 10 · 10 · 10.",
          efter: "Fem trin: 10 · 10 · 10 · 10 · 10 = 100.000 gange så mange H₃O⁺ som i rent vand." },
        { tekst: "Gå over på den basiske side til pH 12. Hvilken ion er der nu flest af i luppen?",
          start: 2, ph: 12,
          hint: "Træk mærket helt over til 12. Luppen zoomer ud hen mod 7 og ind igen på den anden side.",
          efter: "OH⁻. Over pH 7 er der flest OH⁻, og luppen zoomer efter dem. Ved pH 12 er der 100.000 gange så mange OH⁻ som i rent vand." }
    ];

    /* ----- Fane 3: maalene ved fortyndingsbordet --------------------------------
       slags: valg (vaelg foerst, og fortynd saa for at se det), glas (naa et
       glas), tal (skriv et tal), basisk (kan ikke naas; se sim_fortynd.js).
       serie og k: saa mange fortyndinger skal der vaere i den serie. */
    D.MAKS_GLAS = 9;           /* fortyndinger pr. serie; saa er bordet fuldt */
    D.START_C = 0.1;           /* saltsyre og natriumhydroxid, mol/L */

    D.FORTYND_MAAL = [
        { slags: "valg", serie: "syre", k: 1,
          tekst: "Saltsyren har pH 1. Hvad bliver pH, når den fortyndes 10 gange?",
          valg: [
              ["pH 0,1", "pH 0,1 ville betyde, at saltsyren var blevet surere. Vand gør ikke en syre surere."],
              ["pH 1,1", "Ti gange mere vand giver ti gange færre H₃O⁺. Det er et helt trin."],
              ["pH 2", ""],
              ["pH 10", "pH 10 er basisk. Vand gør ikke en syre basisk."]
          ], rigtig: 2,
          hint: "Fortyndingen giver ti gange færre H₃O⁺. Hvor langt er det på skalaen?",
          efter: "pH 2. Ti gange mere vand giver ti gange færre H₃O⁺, og pH stiger ét trin. Luppen zoomede ud for at finde 100 H₃O⁺ igen." },
        { slags: "glas", serie: "syre", k: 4,
          tekst: "Fortynd saltsyren, til pH er 5.",
          hint: "pH stiger ét trin for hver fortynding. Fra pH 1 til pH 5 er der fire trin.",
          efter: "Der skulle fire fortyndinger til. pH er steget fire trin, og luppen har zoomet ud fire gange." },
        { slags: "tal", svar: 10000,
          tekst: "Hvor mange gange er glasset med pH 5 fortyndet i forhold til saltsyren?",
          fejl: [
              [4, "4 er antallet af fortyndinger. Hver fortynding ganger med 10."],
              [40, "Du har lagt 10 sammen fire gange. Hver fortynding ganger med 10."],
              [5, "5 er glassets pH. Spørgsmålet er, hvor mange gange glasset er fortyndet."],
              [1000, "Tæl fortyndingerne fra pH 1 til pH 5 igen."],
              [100000, "Tæl fortyndingerne fra pH 1 til pH 5 igen."]
          ],
          hint: "Hver fortynding er 10 gange. Der er fire: 10 · 10 · 10 · 10.",
          efter: "Glasset er fortyndet 10 · 10 · 10 · 10 = 10.000 gange, og pH er steget fire trin." },
        { slags: "basisk", serie: "syre",
          tekst: "Fortynd saltsyren, til den bliver basisk.",
          hint: "Se på pH og luppen, når pH i glassene nærmer sig 7. Hvilken ion er der flest af?",
          efter: "Saltsyren bliver aldrig basisk. Vand har selv lige mange H₃O⁺ og OH⁻, så pH nærmer sig 7 uden at komme over." },
        { slags: "valg", serie: "base", k: 3,
          tekst: "Natriumhydroxiden har pH 13. Hvad bliver pH, når den fortyndes 1.000 gange?",
          valg: [
              ["pH 16", "Mere vand bringer pH tættere på 7. For en base går pH ned."],
              ["pH 13", "Der er 1.000 gange færre OH⁻ efter fortyndingen, og det ændrer pH."],
              ["pH 10", ""],
              ["pH 7", "En fortynding på 1.000 gange bringer ikke pH helt ned til 7. Der skal flere fortyndinger til."]
          ], rigtig: 2,
          hint: "1.000 gange er tre fortyndinger. For en base går pH ned mod 7.",
          efter: "pH 10. Tre fortyndinger giver tre trin ned mod 7." }
    ];

    /* ----- Kemichael ----------------------------------------------------------
       Praesentationen (../kemichael/praesentation.js): ét trin ad gangen,
       og eleven trykker Naeste. Hvert trin er to til fire hele saetninger
       i Kemibogens sprog: hvad fanen traener, og hvordan tingene bruges.
       sel: det, han peger paa, og som faar en gul ramme, der blinker
       (CSS-selectorer; felterne paa laerredet er de usynlige .anker fra
       rundvisningen). felt "skilt": skiltet paa fane 3 (introFelt i
       js/laerer.js). Ingen vittigheder og ingen teori i praesentationen. */
    D.INTRO_SKALA = [
        { tekst: "I denne fane placerer du tolv hverdagsstoffer på pH-skalaen. Skalaen går fra −1 til 15, og farverne er universalindikatorens farver ved hver pH.",
          sel: "#skala-anker-skala" },
        { tekst: "Du trækker et stof fra bordet op på skalaen, der hvor du tror, at stoffet hører til. pH-metret måler derefter stoffet, og stoffet flyver hen til sin rigtige plads over skalaen. En gul trekant under skalaen viser dit gæt.",
          sel: ["#skala-anker-stoffer", "#skala-anker-meter"] },
        { tekst: "Der er to hylder med seks stoffer på hver, og kortet øverst i scenen viser, hvilken hylde du er nået til. Knappen Giv hint på kortet giver først et hint og derefter svaret. Tabellen Gæt og målt samler dine gæt og de målte værdier.",
          sel: ["#skala-skort", "#skala-gaetkort"] }
    ];
    D.INTRO_LUP = [
        { tekst: "I denne fane ser du, hvordan antallet af H₃O⁺ og OH⁻ ændrer sig, når pH ændrer sig. Du ændrer pH ved at trække pH-mærket på skalaen eller klikke på skalaen. Piletasterne på tastaturet flytter også pH-mærket.",
          sel: "#lup-anker-skala" },
        { tekst: "Luppen viser et lille rum af væsken i glasset, og hver prik er én ion. De røde prikker er H₃O⁺, og de blå prikker er OH⁻. Bliver der mere end 100 ioner af én slags, zoomer luppen selv ind på et rum, der er 10 gange mindre.",
          sel: ["#lup-anker-lup", "#lup-anker-zoom"] },
        { tekst: "Kortet øverst i scenen giver dig fem mål ét ad gangen. Du flytter mærket og trykker Indsend svar, og knappen Giv hint giver først et hint og derefter svaret. Kortet I luppen viser antallet af ioner og koncentrationerne ved den pH, du har valgt.",
          sel: ["#lup-skort", "#lup-maaling"] }
    ];
    D.INTRO_FORTYND = [
        { tekst: "I denne fane undersøger du, hvad der sker med pH, når saltsyre og natriumhydroxid bliver fortyndet med vand. Saltsyren har pH 1, og natriumhydroxiden har pH 13. Hvert nyt glas står under sin pH på skalaen.",
          sel: ["#fortynd-anker-flasker", "#fortynd-anker-skala"] },
        { tekst: "Knappen Fortynd 10 gange laver et nyt glas med 1\u00a0mL fra glasset før og 9\u00a0mL vand. Den venstre knap fortynder saltsyren, og den højre knap fortynder natriumhydroxiden. Knappen virker kun, når målet på kortet øverst i scenen skal bruge den.",
          felt: "skilt", sel: "#fortynd-anker-knapper" },
        { tekst: "Luppen viser ionerne i det nyeste glas, og et klik på et andet glas viser det glas i luppen. Kortet øverst i scenen giver dig fem mål ét ad gangen, og knappen Giv hint giver først et hint og derefter svaret.",
          sel: ["#fortynd-anker-lup", "#fortynd-skort"] }
    ];

    /* Ros, foerste gang en hel fane er klaret. Det er de eneste gange, han
       kommer ind af sig selv, ud over paaskeaegget (brugerens regler
       4. nov. 2026). */
    D.ROS_SKALA = "Du har målt alle tolv stoffer. Klorin og syre må aldrig blandes, og det er ikke bare et quizspørgsmål.";
    D.LUP_FAERDIG = "Du har nået alle fem mål i luppen. Jeg vil også gerne have en lup, der selv zoomer.";
    D.FORTYND_FAERDIG = "Du har nået alle fem mål ved fortyndingsbordet. Pipetten er stadig hel, og det skriver jeg ned.";

    /* Paaskeaegget: et gaet paa fane 1, der rammer inden for 0,1 */
    D.AEG_PRAECIS = "Dit gæt rammer pH præcist. Du har vel ikke smagt på stoffet?";

    NK.Data = D;
}());
