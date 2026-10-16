/* =====================================================================
   data.js - tekster: Kemichaels replikker, linjerne under scenen og
   rosen, naar en serie er klaret

   Replikkerne er hoejst ca. 60 tegn og uden teori. Sarkasmen rammer
   handlingen, aldrig eleven.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Kemichaels praesentation af hver fane ----------------------------- */
    D.INTRO_ZIGZAG = [
        "Zigzag. Opgaven hænger på tavlen.",
        "Træk fra C-atomet. Kæden knækker af sig selv.",
        "H-atomerne tegner vi ikke. Det sparer tusch."
    ];
    D.INTRO_NAVNE = [
        "Navne. Byg molekylet, eller giv det navn.",
        "Navnet skriver du i feltet til højre.",
        "Bindestreger tæller. Kemikere er pedantiske."
    ];
    D.INTRO_ISOMERER = [
        "Isomerer. Formlen står til højre.",
        "Tegn alle de molekyler, der passer til den.",
        "Vendt om er ikke nyt. Det har jeg prøvet."
    ];
    D.INTRO_OPLOES = [
        "Opløselighed. Heptan øverst, vand nederst.",
        "Træk molekylet ned i det lag, det opløses i.",
        "Tager du fejl, flytter molekylet selv. Det er stædigt."
    ];

    /* ----- Ros, naar en serie eller et niveau er klaret ------------------------ */
    D.ROS = {
        tegn: "Ti zigzagformler. Ikke én lige kæde.",
        atomer: "Ti formler. Hvert eneste H talt med.",
        byg: "Ti molekyler. Præcis som navnene sagde.",
        navn: "Ti navne. Alle bindestreger på plads.",
        isomer: "Alle isomerer. Ingen talt to gange.",
        isomerAlle: "C₇ klaret. Ni isomerer. Jeg tæller efter.",
        oploes: "Hele bunken sorteret. Ikke en dråbe spildt.",
        oploesVist: "Bunken er igennem. Næste gang uden facitlisten.",
        /* Klaret, men med for mange viste svar: intet fra skuffen */
        forMangeSvar: "Klaret. Skuffen åbner kun, når du selv svarer."
    };

    /* ----- Linjen under scenen: naeste skridt ----------------------------------- */
    D.STATUS = {
        tegnStart: "Træk fra C-atomet på tavlen for at tegne kæden. Klik på en binding for at gøre den dobbelt.",
        tegnVidere: "Tegn videre. Højreklik på en ende for at slette den.",
        tegnFuld: "Alle C-atomer er brugt. Er det ikke rigtigt, så højreklik på en ende og tegn om.",
        atomerC: "Klik på hvert knæk og hver ende for at sætte et C-atom.",
        atomerH: "Klik på et C for at sætte et H på. Højreklik fjerner et H.",
        atomerFormel: "Skriv molekylformlen i feltet til højre, fx C5H12.",
        navnSkriv: "Skriv navnet i feltet til højre, og tryk Enter.",
        isomer: "Tegn et molekyle med formlen. Når alle C-atomer er brugt, tjekkes det.",
        loest: "Klik på knappen til højre for at gå videre.",
        oploesStart: "Træk molekylet ned i det lag, det opløses i: heptan øverst eller vand nederst.",
        oploesTraek: "Slip molekylet i heptan eller i vand.",
        oploesHint: "De blå grupper er polære. Træk molekylet ned i heptan eller vand.",
        oploesSlut: "Klik på Nyt spil til højre for en ny bunke."
    };

    D.SERIE_LAENGDE = 10;

    NK.Data = D;
}());
