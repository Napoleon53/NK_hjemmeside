/* =====================================================================
   data.js - tekster: Kemichaels praesentation, rosen, naar en hel fane
   er klaret, og linjerne under scenen

   Kemichael taler formelt i hele saetninger som i Kemibogen (brugerens
   regel 4. nov. 2026). Sarkasmen rammer handlingen, aldrig eleven.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Kemichaels praesentation af hver fane -----------------------------
       ../kemichael/praesentation.js: ét trin ad gangen, og eleven trykker
       Naeste. Hvert trin er to til fire hele saetninger: hvad fanen
       traener, og hvordan tingene bruges. sel: det, han peger paa, og som
       faar en gul ramme (CSS-selectorer; tavlen og papiret er de usynlige
       .anker fra rundvisningen). felt "tegning": kassen om atomerne paa
       tavlen (introFelt i laerer.js). Ingen vittigheder i praesentationen.
       Fane 1 har et andet trin 2 i retningen Zigzag -> strukturformel. */
    var ZZ_START = { tekst: "I denne fane øver du dig i at skifte mellem strukturformler og zigzagformler. Knapperne øverst i panelet vælger, om du tegner zigzagformlen ud fra strukturformlen eller omvendt. Hver retning er en serie på ti molekyler, der bliver sværere.",
                     sel: "#zz-retning" };
    var ZZ_SLUT = { tekst: "Opgavekortet viser opgaven, og knappen på kortet giver et hint og derefter svaret. Serien viser, hvilke af de ti molekyler du har løst. En serie giver et klistermærke til tegnebrættet, når du højst har set tre af svarene.",
                    sel: ["#zz-kort", "#zz-serie"] };
    D.INTRO_ZIGZAG = [
        ZZ_START,
        { tekst: "Strukturformlen hænger på papiret øverst på tavlen. Du tegner samme molekyle som zigzagformel ved at trække fra C-atomet, og kæden knækker af sig selv. Et klik på en binding gør den til en dobbeltbinding.",
          sel: "#zz-anker-papir", felt: "tegning" },
        ZZ_SLUT
    ];
    D.INTRO_ZIGZAG_ATOMER = [
        ZZ_START,
        { tekst: "Zigzagformlen står på tavlen. Du klikker på hvert knæk og hver ende for at sætte et C-atom og derefter på C-atomerne for at sætte H-atomer på. Til sidst skriver du molekylformlen i feltet på opgavekortet.",
          felt: "tegning" },
        ZZ_SLUT
    ];
    D.INTRO_NAVNE = [
        { tekst: "I denne fane øver du dig i at give alkaner og alkener navne. Knapperne øverst i panelet vælger, om du bygger molekylet ud fra navnet eller giver molekylet på tavlen et navn. Knapperne lige under vælger alkaner eller alkener.",
          sel: ["#nv-retning", "#nv-slags"] },
        { tekst: "Du bygger molekylet ved at trække fra C-atomet på tavlen, og et klik på en binding gør den dobbelt. De sidste alkener har cis eller trans, så tegningen skal vende rigtigt. Navnet skriver du i feltet på opgavekortet, og Enter tjekker navnet.",
          felt: "tegning" },
        { tekst: "Knappen på opgavekortet giver et hint og derefter svaret. Serien viser, hvilke af de ti molekyler du har løst. En serie giver et klistermærke til tegnebrættet, når du højst har set tre af svarene.",
          sel: ["#nv-kort", "#nv-serie"] }
    ];
    D.INTRO_ISOMERER = [
        { tekst: "I denne fane finder du alle isomerer af en alkan, altså alle molekyler med samme molekylformel. Knapperne øverst i panelet vælger formlen, fra C₄H₁₀ med to isomerer til C₇H₁₆ med ni isomerer.",
          sel: "#is-niveau" },
        { tekst: "Du tegner et molekyle med formlen ved at trække fra C-atomet på tavlen, og tegningen bliver tjekket, når alle C-atomer er brugt. Et stof, du ikke har fundet før, kommer på listen Isomererne. Tegner du et stof, du allerede har fundet, ryster stoffets plads i listen.",
          sel: "#is-liste-kort", felt: "tegning" },
        { tekst: "Knappen på opgavekortet giver et hint og derefter svaret. Hver formel giver et klistermærke til tegnebrættet, når du højst har set halvdelen af svarene.",
          sel: "#is-kort" }
    ];
    D.INTRO_OPLOES = [
        { tekst: "I denne fane afgør du, om et molekyle opløses i vand eller i heptan. Molekylet står på tavlen, og bægerglasset har heptan øverst og vand nederst.",
          sel: ["#op-anker-mol", "#op-anker-glas"] },
        { tekst: "Du trækker molekylet ned i det lag, det opløses i, eller du klikker på laget. Er svaret forkert, flytter molekylet selv over i det rigtige lag, og du mister et af dine tre liv.",
          sel: ["#op-anker-glas", "#op-liv"] },
        { tekst: "Knappen på opgavekortet giver et hint og derefter svaret, men et vist svar giver ikke point. Bunken viser de 15 molekyler, du skal sortere. Knapperne øverst i panelet tegner molekylet som zigzagformel eller med alle atomer.",
          sel: ["#op-kort", "#op-bunke", "#op-tegning"] }
    ];

    /* ----- Ros, naar en hel fane er klaret -------------------------------------
       zz, nv, is: fanens sidste klistermaerke er laast op (laerer.js).
       oploes: hele bunken er sorteret med hoejst tre viste svar,
       oploesVist: med flere viste svar. */
    D.ROS = {
        zz: "Du har klaret begge serier på fanen, og ikke én af kæderne er blevet tegnet lige.",
        nv: "Du har klaret alle fire serier med navne, og alle bindestreger står på deres plads.",
        is: "Du har fundet alle isomerer fra C₄H₁₀ til C₇H₁₆. Jeg tæller dem efter senere.",
        oploes: "Du har sorteret hele bunken, og der er ikke spildt en eneste dråbe.",
        oploesVist: "Du er igennem hele bunken. Næste gang klarer du den uden at se svarene."
    };

    /* ----- Opgavekortet, naar en quiz er klaret med for mange viste svar ---------
       (tidligere Kemichaels "Skuffen aabner kun, naar du selv svarer") */
    D.KLISTER_KRAV = {
        serie: "Serien er klaret, men klistermærket kræver, at du højst har set tre af svarene.",
        isomer: "Isomererne af {formel} er fundet, men klistermærket kræver, at du højst har set halvdelen af svarene."
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
