/* =====================================================================
   data.js - tekster: Kemichaels praesentation og linjen under scenen

   Praesentationen (../kemichael/praesentation.js): ét trin ad gangen, og
   eleven trykker Naeste. Hvert trin er to til fire hele saetninger i
   Kemibogens sprog, uden vittigheder og uden teori (brugerens regler
   4. nov. 2026). sel: det, han peger paa, og som faar en gul ramme, der
   blinker (CSS-selectorer). felt: noget paa tavlen, som PT.introFelt i
   js/laerer.js finder ("start": startpunktet, hvor en kaede begynder).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Kemichaels praesentation ------------------------------------------- */
    D.INTRO_TEGN = [
        { tekst: "I tegnebrættet tegner du molekyler, som de er tegnet i bogen. Du tegner en kæde ved at trække fra et atom på tavlen, og et klik på en binding gør den til en dobbelt- eller tripelbinding. Et højreklik sletter et atom.",
          felt: "start" },
        { tekst: "Kortet Tegn med har grundstofferne, de funktionelle grupper, ringene og pilene til et reaktionsskema. Skriver du navnet på et molekyle eller et helt reaktionsskema i feltet Skriv et navn, tegner tegnebrættet molekylerne for dig.",
          sel: ["#tb-vaerktoej", "#tb-navnkort"] },
        { tekst: "Kortet Molekyler på tavlen viser navn, stofklasse, molekylformel og molarmasse for hvert molekyle. Knappen Kopiér billede kopierer tegningen, så du kan sætte den ind i rapporten. Knappen Gem som SVG gemmer tegningen som en fil, som du senere kan åbne og rette i.",
          sel: ["#tb-molekyle", "#tb-rapport"] }
    ];

    /* ----- Linjen under scenen: naeste skridt ----------------------------------- */
    D.STATUS = {
        tegnebraet: "Træk fra et atom for at tegne. Klik på en binding: dobbelt eller tripel. Træk i tom tavle for at flytte udsnittet."
    };

    NK.Data = D;
}());
