/* =====================================================================
   Kan du løse opgaven? - data
   Alt indhold står her: kasserne og pilene fra Word-flowchartet (samme
   placering, koordinater i et felt på 960 x 1200), udfordringerne efter
   hvert Ja og Nej, teksterne i "Gør det!"-kasserne og slutteksterne.

   En udfordring: { spm, svar: [ { t, ok, r, til } ] }
     t   svaret, eleven kan vælge
     ok  true: svaret holder, brikken følger pilen
     r   flowchartets kommentar til svaret
     til (valgfri) hvor et forkert svar sender hen, ellers fejlTil
   undskyldning: true betyder, at alle svar fører videre ad pilen.
   ===================================================================== */

var NK = window.NK || {};
window.NK = NK;

NK.D = (function () {
    "use strict";

    var D = {};

    D.BREDDE = 960;
    D.HOEJDE = 1200;
    D.VIEW = [-6, -34, 972, 1234];   // lidt luft over A, så brikken kan stå på kassen
    D.START = "A";
    D.SLUT = "Z";

    /* ---------------------------------------------------------------
       KASSERNE
       slags: spm (Ja/Nej), handling (én knap), slut
       kant:  tyk (start og slut) eller dobbelt (hånden i vejret)
       brik:  hvor brikken står, når den er i kassen (fod på kanten)
       --------------------------------------------------------------- */
    D.KASSER = {
        A: { x: 250, y: 38,  w: 278, h: 64,  slags: "spm", kant: "tyk", midt: true,
             linjer: ["Kan du løse opgaven?"] },
        B: { x: 680, y: 128, w: 208, h: 93,  slags: "spm",
             linjer: ["Har du prøvet", "ordentligt?"] },
        C: { x: 362, y: 145, w: 196, h: 50,  slags: "handling", midt: true, brik: [548, 145],
             linjer: ["Gør dig umage!"] },
        D: { x: 648, y: 284, w: 258, h: 86,  slags: "spm",
             linjer: ["Har du snakket med", "sidemanden om det?"] },
        E: { x: 136, y: 262, w: 236, h: 93,  slags: "spm",
             linjer: ["Kan I løse den ved", "fælles hjælp?"] },
        F: { x: 470, y: 388, w: 124, h: 48,  slags: "handling", midt: true, brik: [560, 388],
             linjer: ["Gør det!"] },
        G: { x: 112, y: 458, w: 290, h: 107, slags: "spm", brik: [370, 458],
             linjer: ["Har I slået op i bogen?"],
             lille: ["(find relevante eksempler,", "sætninger og lign.)"] },
        H: { x: 148, y: 612, w: 168, h: 74,  slags: "spm", brik: [286, 612],
             linjer: ["Fandt I noget", "brugbart?"] },
        I: { x: 540, y: 488, w: 356, h: 116, slags: "spm", brik: [860, 488],
             linjer: ["Har I spurgt andre i klassen?"],
             lille: ["(Også nogle af dem, I ikke plejer at spørge", "eller som I ikke lige sidder i nærheden af?)"] },
        J: { x: 395, y: 655, w: 222, h: 56,  slags: "spm", midt: true, brik: [600, 655],
             linjer: ["Kan I løse den nu?"] },
        K: { x: 724, y: 700, w: 118, h: 48,  slags: "handling", midt: true, brik: [826, 700],
             linjer: ["Gør det!"] },
        L: { x: 138, y: 780, w: 264, h: 127, slags: "handling", kant: "dobbelt", brik: [372, 780],
             linjer: ["Ræk hånden i vejret", "og vent til det bliver", "din/jeres tur"] },
        M: { x: 316, y: 940, w: 184, h: 76,  slags: "spm", brik: [470, 940],
             linjer: ["Kan du hjælpe", "andre imens?"] },
        N: { x: 108, y: 1020, w: 124, h: 48, slags: "handling", midt: true, brik: [136, 1020],
             linjer: ["Gør det!"] },
        O: { x: 614, y: 886, w: 320, h: 160, slags: "handling", brik: [904, 886],
             linjer: ["Kig på de næste opgaver,", "mens du venter."],
             lille: ["(Forbered konkrete spørgsmål. \"Jeg kan", "ikke finde ud af det\" er ikke et", "spørgsmål.)"] },
        Z: { x: 300, y: 1103, w: 362, h: 78, slags: "slut", kant: "tyk", midt: true, stor: true, brik: [600, 1103],
             linjer: ["GODT ARBEJDE!"] }
    };

    /* ---------------------------------------------------------------
       PILENE (i den rækkefølge, de står i flowchartet)
       p:  knækpunkter fra kassen, pilen går ud af, til pilespidsen
       ov: hvor ordet Ja eller Nej står
       --------------------------------------------------------------- */
    D.PILE = [
        { id: "A-ja",  fra: "A", til: "Z", ord: "Ja",  ov: [226, 88],  p: [[250, 66], [14, 66], [14, 1166], [300, 1166]] },
        { id: "A-nej", fra: "A", til: "B", ord: "Nej", ov: [558, 92],  p: [[528, 72], [784, 72], [784, 128]] },
        { id: "B-nej", fra: "B", til: "C", ord: "Nej", ov: [638, 160], p: [[680, 175], [558, 171]] },
        { id: "C-A",   fra: "C", til: "A",             p: [[436, 145], [436, 102]] },
        { id: "B-ja",  fra: "B", til: "D", ord: "Ja",  ov: [806, 254], p: [[784, 221], [784, 284]] },
        { id: "D-ja",  fra: "D", til: "E", ord: "Ja",  ov: [616, 296], p: [[648, 308], [372, 308]] },
        { id: "D-nej", fra: "D", til: "F", ord: "Nej", ov: [766, 396], p: [[736, 370], [736, 412], [594, 412]] },
        { id: "F-E",   fra: "F", til: "E",             p: [[470, 412], [326, 412], [326, 355]] },
        { id: "E-ja",  fra: "E", til: "Z", ord: "Ja",  ov: [100, 292], p: [[136, 306], [30, 306], [30, 1152], [300, 1152]] },
        { id: "E-nej", fra: "E", til: "G", ord: "Nej", ov: [176, 400], p: [[210, 355], [210, 458]] },
        { id: "G-nej", fra: "G", til: "F", ord: "Nej", ov: [430, 506], p: [[402, 486], [498, 486], [498, 436]] },
        { id: "G-ja",  fra: "G", til: "H", ord: "Ja",  ov: [180, 592], p: [[208, 565], [208, 612]] },
        { id: "H-ja",  fra: "H", til: "Z", ord: "Ja",  ov: [100, 656], p: [[148, 634], [46, 634], [46, 1138], [300, 1138]] },
        { id: "H-nej", fra: "H", til: "I", ord: "Nej", ov: [350, 612], p: [[316, 650], [540, 548]] },
        { id: "I-ja",  fra: "I", til: "J", ord: "Ja",  ov: [590, 632], p: [[576, 604], [536, 655]] },
        { id: "I-nej", fra: "I", til: "K", ord: "Nej", ov: [806, 650], p: [[778, 604], [778, 700]] },
        { id: "K-J",   fra: "K", til: "J",             p: [[724, 726], [617, 684]] },
        { id: "J-ja",  fra: "J", til: "Z", ord: "Ja",  ov: [354, 702], p: [[408, 711], [62, 776], [62, 1124], [300, 1124]] },
        { id: "J-nej", fra: "J", til: "L", ord: "Nej", ov: [520, 744], p: [[492, 711], [492, 833], [402, 833]] },
        { id: "L-M",   fra: "L", til: "M",             p: [[276, 907], [322, 944]] },
        { id: "M-ja",  fra: "M", til: "N", ord: "Ja",  ov: [262, 968], p: [[316, 972], [176, 1020]] },
        { id: "M-nej", fra: "M", til: "O", ord: "Nej", ov: [540, 948], p: [[500, 966], [614, 966]] },
        { id: "N-Z",   fra: "N", til: "Z",             p: [[232, 1044], [380, 1103]] },
        { id: "O-Z",   fra: "O", til: "Z",             p: [[778, 1046], [778, 1134], [662, 1134]] }
    ];

    /* Den fælles "Gør det!" efter sidemanden og bogen skifter tekst efter,
       hvor brikken kom fra. */
    D.KONTEKST = { D: "sidemand", E: "sidemand", G: "bog" };

    /* ---------------------------------------------------------------
       UDFORDRINGERNE (nøgle = pilens id, O = kassen med spørgsmålet)
       --------------------------------------------------------------- */
    D.UDFORDRINGER = {
        "A-ja": { fejlTil: "C", varianter: [
            { spm: "Nå da. Hvordan ved du det?", svar: [
                { t: "Jeg har et svar og kan forklare, hvordan jeg fik det.", ok: true, r: "Så er du færdig. Hvorfor sidder du og klikker i et flowchart?" },
                { t: "Jeg har et svar.", r: "Det har en papegøje også. Kan du ikke forklare det, er du ikke færdig." },
                { t: "Sidemanden har vist mig sit.", r: "Så kan sidemanden løse opgaven. Tillykke til sidemanden." },
                { t: "Det føles rigtigt.", r: "Følelser er fine. De er bare ikke en forklaring." }
            ] },
            { spm: "Fint. Hvad svarer du, hvis læreren spørger hvorfor?", svar: [
                { t: "Jeg kan forklare hvert skridt med mine egne ord.", ok: true, r: "Så har du ikke brug for det her flowchart. Videre til næste opgave." },
                { t: "Fordi det står i facitlisten.", r: "Facitlisten ved det. Du ved det ikke endnu." },
                { t: "Fordi vi gjorde sådan sidst.", r: "Det er en vane. Ikke en forklaring." },
                { t: "Hvorfor ikke?", r: "Et modspørgsmål er ikke et svar." }
            ] }
        ] },

        "A-nej": { fejlTil: "C", varianter: [
            { spm: "Hvad er det præcis, du ikke kan?", svar: [
                { t: "Jeg kan pege på det sted, hvor jeg går i stå.", ok: true, r: "Godt. Så ved du, hvor du skal kigge." },
                { t: "Der er et ord i opgaven, jeg ikke forstår.", ok: true, r: "Et konkret problem. Det kan man arbejde med." },
                { t: "Det hele.", r: "Det hele er ikke et sted. Find den første sætning, du ikke forstår." },
                { t: "Jeg gider ikke.", r: "Det er ikke det samme som ikke at kunne. Der er ingen kasse til det." }
            ] },
            { spm: "Hvor langt kommer du, før det går galt?", svar: [
                { t: "Jeg ved, hvad jeg skal finde, men ikke hvordan.", ok: true, r: "Så ved du, hvad du leder efter. Det er en start." },
                { t: "Jeg går i stå i et bestemt skridt.", ok: true, r: "Et bestemt skridt. Det kan man spørge om." },
                { t: "Jeg er ikke gået i gang.", r: "Så ved du ikke, om du kan. Prøv først." },
                { t: "Til opgavens nummer.", r: "Nummeret er fint. Resten mangler." }
            ] }
        ] },

        "B-ja": { fejlTil: "C", varianter: [
            { spm: "Bevis det. Hvad har du gjort?", svar: [
                { t: "Læst opgaven igen og prøvet mindst én vej.", ok: true, r: "Det er at prøve. Videre." },
                { t: "Kigget på den. Længe.", r: "At kigge er ikke at prøve. Opgaven løser sig ikke af at blive stirret på." },
                { t: "Læst den én gang.", r: "Én gang er at læse. Ikke at prøve." },
                { t: "Søgt efter svaret på nettet.", r: "Så har nettet prøvet ordentligt. Du har ikke." }
            ] },
            { spm: "Hvad står der på dit papir?", svar: [
                { t: "Det, jeg ved, og et forsøg på en løsning.", ok: true, r: "Noget på papiret. Det tæller som bevis." },
                { t: "Opgavens nummer.", r: "Et flot nummer. Det er bare ikke et forsøg." },
                { t: "Ingenting. Jeg har det i hovedet.", r: "Hovedet er et godt sted at tænke. Papiret er et bedre sted at prøve." },
                { t: "En tegning af en hest.", r: "Pæn hest. Den hjælper ikke med opgaven." }
            ] }
        ] },

        "B-nej": { undskyldning: true, varianter: [
            { spm: "Ærligt. Det er da noget. Hvorfor ikke?", svar: [
                { t: "Jeg troede, det gik hurtigere at spørge.", r: "Læreren er én. I er mange. Regn selv på det." },
                { t: "Den så svær ud.", r: "Det gør de fleste opgaver, før man prøver." },
                { t: "Jeg ville se, hvad der sker, hvis man trykker Nej.", r: "Nu ved du det." }
            ] }
        ] },

        "D-ja": { fejlTil: "F", varianter: [
            { spm: "Hvad sagde sidemanden?", svar: [
                { t: "Vi har sammenlignet, hvor langt vi hver er nået.", ok: true, r: "Samarbejde. Sjældent set. Altid velkomment." },
                { t: "Sidemanden sidder fast samme sted.", ok: true, r: "Så er I to om det. To hoveder er bedre end ét." },
                { t: "Vi snakkede om noget andet.", r: "Weekenden er et spændende emne. Opgaven er næsten lige så spændende." },
                { t: "Jeg spurgte, om jeg måtte se sidemandens.", r: "Det er at kopiere. Ikke at snakke." }
            ] },
            { spm: "Hvad fik du ud af snakken?", svar: [
                { t: "En idé til, hvordan vi kan komme videre.", ok: true, r: "En idé. Det var det, vi håbede på." },
                { t: "At sidemanden heller ikke gider.", r: "Så har I noget til fælles. Men ingen løsning." },
                { t: "Et svar, jeg ikke forstår.", r: "Så har du et svar. Ikke en forståelse. Snak videre." },
                { t: "Ingenting. Sidemanden havde høretelefoner på.", r: "Så har du snakket med et par høretelefoner. Prøv igen." }
            ] }
        ] },

        "D-nej": { undskyldning: true, varianter: [
            { spm: "Hvorfor ikke?", svar: [
                { t: "Sidemanden ved heller ikke noget.", r: "Så ved I ingenting sammen. Det er et fint sted at starte." },
                { t: "Vi er ikke venner.", r: "I skal ikke være venner. I skal løse en opgave." },
                { t: "Jeg sidder alene.", r: "Stole kan flyttes. Det er det, benene er til." },
                { t: "Sidemanden er i gang med noget andet.", r: "Det overlever sidemanden. Spørg." }
            ] }
        ] },

        "E-ja": { fejlTil: "F", varianter: [
            { spm: "Kan I begge forklare løsningen?", svar: [
                { t: "Ja, begge to.", ok: true, r: "To, der kan forklare den. Det er godt arbejde." },
                { t: "Den ene af os kan.", r: "Så har den ene løst den. Forklar den for den anden." },
                { t: "Vi har skrevet det samme.", r: "At skrive det samme er ikke at forstå det samme." }
            ] },
            { spm: "Hvem kom på løsningen?", svar: [
                { t: "Vi fandt den sammen, og vi kan begge forklare den.", ok: true, r: "Sammen. Det var hele pointen." },
                { t: "Sidemanden. Jeg nikkede.", r: "Nikken er ikke en løsningsmetode." },
                { t: "Nettet. Vi søgte sammen.", r: "Så løste nettet den. Med jer som publikum." }
            ] }
        ] },

        "E-nej": { fejlTil: "F", varianter: [
            { spm: "Hvor længe har I arbejdet på den sammen?", svar: [
                { t: "Længe nok til at vide, hvor vi går i stå.", ok: true, r: "Så ved I, hvad I skal slå op." },
                { t: "Et par sekunder.", r: "Det er ikke fælles hjælp. Det er en hilsen." },
                { t: "Vi har ikke nået at snakke.", r: "Så har I ikke prøvet fælles hjælp. Gør det." }
            ] },
            { spm: "Hvad har I prøvet sammen?", svar: [
                { t: "To veje. Ingen af dem virkede.", ok: true, r: "Ærligt forsøgt. Videre til bogen." },
                { t: "Vi har ventet på, at den anden fandt ud af det.", r: "To, der venter på hinanden. Det kan vare længe." },
                { t: "Vi har kigget på hinanden.", r: "Øjenkontakt er godt. Det løser bare ikke opgaver." }
            ] }
        ] },

        "G-ja": { fejlTil: "F", varianter: [
            { spm: "Hvor i bogen kiggede I?", svar: [
                { t: "I kapitlet om emnet og i eksemplerne.", ok: true, r: "Det er at slå op. Godt." },
                { t: "Vi fandt ordet i stikordsregistret.", ok: true, r: "Stikordsregistret. Det findes, og I har brugt det." },
                { t: "På forsiden.", r: "Forsiden er flot. Der står bare ikke så meget på den." },
                { t: "Vi bladrede, til vi blev trætte.", r: "At bladre er ikke at læse." }
            ] },
            { spm: "Hvad slog I op?", svar: [
                { t: "Et eksempel, der ligner vores opgave.", ok: true, r: "Et eksempel. Det er det, bogen er bedst til." },
                { t: "Svaret.", r: "Bogen har ikke svaret. Den har det, der skal til for at finde det." },
                { t: "Vi kiggede efter billeder.", r: "Billeder er fine. Læs også teksten ved siden af." }
            ] }
        ] },

        "G-nej": { undskyldning: true, varianter: [
            { spm: "Hvorfor ikke?", svar: [
                { t: "Vi har ikke bogen med.", r: "Den findes sikkert også digitalt. Den vejer nul gram." },
                { t: "Bogen forklarer det dårligt.", r: "Det kan man først vide, når man har læst den." },
                { t: "Vi troede, bogen var til pynt.", r: "Den er meget pæn. Den er også fyldt med forklaringer." },
                { t: "Det tager for lang tid.", r: "Kortere tid end at vente på læreren." }
            ] }
        ] },

        "H-ja": { fejlTil: "G", varianter: [
            { spm: "Hvad fandt I?", svar: [
                { t: "Et eksempel, vi kunne bruge på vores opgave.", ok: true, r: "Så har bogen gjort sit. Og I har gjort jeres." },
                { t: "Svaret på en anden opgave.", r: "Det er brugbart. Bare ikke til den her." },
                { t: "En formel, vi ikke ved, hvad betyder.", r: "En formel, man ikke forstår, er pynt. Læs teksten omkring den." }
            ] },
            { spm: "Hvad gjorde I med det, I fandt?", svar: [
                { t: "Vi brugte det og løste opgaven.", ok: true, r: "Brugt og løst. Sådan skal det være." },
                { t: "Vi skrev det af.", r: "Så har I skrevet af. Bogen er ikke en facitliste." },
                { t: "Vi læste det og nikkede.", r: "Nikken igen. Brug det på opgaven." }
            ] }
        ] },

        "H-nej": { fejlTil: "G", varianter: [
            { spm: "Hvor kiggede I?", svar: [
                { t: "I kapitlet og eksemplerne. Det hjalp ikke.", ok: true, r: "Så har I prøvet. Bogen kan ikke alt." },
                { t: "Vi bladrede lidt.", r: "Lidt bladren er ikke at slå op. Tilbage til bogen." },
                { t: "Kun i indholdsfortegnelsen.", r: "Den siger, hvor I skal kigge. Den er ikke stedet." }
            ] },
            { spm: "Fandt I slet ingenting?", svar: [
                { t: "Noget om emnet, men intet, der ligner opgaven.", ok: true, r: "Ærligt svar. Så må I have hjælp udefra." },
                { t: "Vi nåede ikke at kigge.", r: "Så har I ikke slået op. Og så har I heller ikke fundet noget." },
                { t: "Bogen var lukket.", r: "Det er den tit. Den skal åbnes først." }
            ] }
        ] },

        "I-ja": { fejlTil: "K", varianter: [
            { spm: "Hvem spurgte I?", svar: [
                { t: "Nogle, vi ikke plejer at spørge.", ok: true, r: "Modigt. Det står også i kassen." },
                { t: "En gruppe, der er længere fremme.", ok: true, r: "Godt valgt. De har været der før jer." },
                { t: "Sidemanden. Igen.", r: "Sidemanden er brugt. Find en ny." },
                { t: "Vi råbte ud i lokalet.", r: "Et råb er ikke et spørgsmål. Gå hen til nogen." }
            ] },
            { spm: "Hvad svarede de?", svar: [
                { t: "De viste os, hvordan de kom i gang.", ok: true, r: "Så har I fået hjælp. Ikke bare et svar." },
                { t: "Vi hørte ikke efter.", r: "Så har I spurgt, men ikke lyttet. Prøv igen." },
                { t: "De gav os deres svar.", r: "Et svar er ikke en forklaring. Spørg, hvordan de fik det." }
            ] }
        ] },

        "I-nej": { undskyldning: true, varianter: [
            { spm: "Hvorfor ikke?", svar: [
                { t: "De andre har travlt.", r: "De overlever en afbrydelse på et halvt minut." },
                { t: "Jeg kender dem ikke.", r: "Det er en fin anledning." },
                { t: "Det er pinligt.", r: "Mindre pinligt end at vente i tyve minutter." },
                { t: "De ved sikkert heller ikke noget.", r: "Det finder man kun ud af ved at spørge." }
            ] }
        ] },

        "J-ja": { fejlTil: "K", varianter: [
            { spm: "Kan du forklare den uden at kigge i dine noter?", svar: [
                { t: "Ja.", ok: true, r: "Så er den din. Det er godt arbejde." },
                { t: "Næsten.", r: "Næsten er tæt på. Det er bare ikke færdigt. Spørg én gang til." },
                { t: "Nej, men jeg har skrevet det ned.", r: "Så har papiret løst den. Du har ikke." }
            ] },
            { spm: "Hvad var det, der manglede før?", svar: [
                { t: "Jeg kan pege på det skridt, jeg ikke forstod.", ok: true, r: "Så har du lært noget. Det var meningen." },
                { t: "Ingen anelse. Men nu står der et svar.", r: "Et svar uden en anelse er et gæt." },
                { t: "Det gør ikke noget. Den er løst.", r: "Det gør noget. Næste opgave ligner den her." }
            ] }
        ] },

        "J-nej": { fejlTil: "K", varianter: [
            { spm: "Hvad har I prøvet, siden I spurgte?", svar: [
                { t: "Vi har prøvet det, de sagde. Det virkede ikke.", ok: true, r: "Så har I gjort det hele. Nu er det lærerens tur." },
                { t: "Vi har ventet på, at det gik over.", r: "Opgaver går ikke over. De bliver bare liggende." },
                { t: "Vi forstod ikke, hvad de sagde.", r: "Så spørg igen. Og bed dem vise det." }
            ] },
            { spm: "Hvor sidder I fast nu?", svar: [
                { t: "Stadig i samme skridt, selv med hjælpen.", ok: true, r: "Så er det et rigtigt spørgsmål til læreren." },
                { t: "Alle steder.", r: "Alle steder er ikke et sted. Spørg nogen, der kan pege." },
                { t: "Det ved vi ikke. Vi har ikke kigget siden.", r: "Så kig. Og spørg igen." }
            ] }
        ] },

        "M-ja": { fejlTil: "O", varianter: [
            { spm: "Hvordan hjælper du bedst?", svar: [
                { t: "Jeg forklarer, hvordan jeg selv tænkte.", ok: true, r: "Det er at hjælpe. Og man lærer det selv bedre." },
                { t: "Jeg giver dem mit svar.", r: "Du har ikke noget svar. Det var derfor, du rakte hånden op." },
                { t: "Jeg løser den for dem.", r: "Så har de ikke lært noget, og du har lavet to opgaver." }
            ] },
            { spm: "Hvem vil du hjælpe?", svar: [
                { t: "En, der sidder fast i en opgave, jeg kan.", ok: true, r: "Godt valgt. Så bliver ventetiden brugt." },
                { t: "Min ven, med noget helt andet.", r: "Det andet kan vente til frikvarteret." },
                { t: "Læreren.", r: "Læreren klarer sig. Tak for tilbuddet." }
            ] }
        ] },

        "M-nej": { undskyldning: true, varianter: [
            { spm: "Hvorfor ikke?", svar: [
                { t: "Jeg kan jo ikke selv løse opgaven.", r: "Rimeligt. Men måske kan du de andre." },
                { t: "Ingen har spurgt.", r: "Man må godt tilbyde det." },
                { t: "Jeg har travlt med at vente.", r: "Vent med noget i hænderne. Det står i næste kasse." }
            ] }
        ] },

        "O": { fejlTil: "O", varianter: [
            { spm: "Lad høre. Hvad vil du spørge læreren om?", svar: [
                { t: "Hvorfor gør man sådan i det andet skridt?", ok: true, r: "Et konkret spørgsmål. Læreren bliver glad. Måske." },
                { t: "Jeg kan ikke finde ud af det.", r: "Det er ikke et spørgsmål. Det står i kassen. I en parentes." },
                { t: "Hvad er svaret?", r: "Det er et spørgsmål. Bare ikke et godt." },
                { t: "Kan du ikke bare gøre det?", r: "Nej." }
            ] },
            { spm: "Lad høre. Hvad vil du spørge læreren om?", svar: [
                { t: "Hvad betyder det her ord i opgaven?", ok: true, r: "Konkret og kort. Sådan skal det være." },
                { t: "Er alt det her rigtigt?", r: "Hele siden på én gang? Peg på det, du er i tvivl om." },
                { t: "Hvad skal vi?", r: "I skal løse opgaven. Det var ikke det, du ville spørge om." },
                { t: "Jeg kan ikke finde ud af det.", r: "Det er ikke et spørgsmål. Det står i kassen. I en parentes." }
            ] }
        ] }
    };

    /* ---------------------------------------------------------------
       "GØR DET!"-KASSERNE: hvad man konkret gør, og knappen
       F har to udgaver efter, hvor brikken kom fra (D.KONTEKST).
       --------------------------------------------------------------- */
    D.HANDLINGER = {
        C: { trin: ["Læs opgaven igen. Langsomt.", "Skriv ned, hvad du ved, og hvad du skal finde.", "Prøv én vej. Også selv om den måske er forkert."],
             knap: "Jeg har gjort mig umage" },
        F: {
            sidemand: { trin: ["Vis sidemanden, hvor du går i stå.", "Hør, hvor langt sidemanden er nået.", "Prøv at løse den sammen."],
                        knap: "Vi har snakket" },
            bog:      { trin: ["Find kapitlet, opgaven handler om.", "Kig efter et eksempel, der ligner.", "Slå de ord op, I ikke forstår."],
                        knap: "Vi har slået op" }
        },
        K: { trin: ["Gå hen til en anden gruppe.", "Gerne en, I ikke plejer at spørge.", "Spørg, hvordan de kom i gang. Ikke hvad de fik."],
             knap: "Vi har spurgt" },
        L: { trin: ["Ræk hånden op.", "Arbejd videre, mens du venter.", "Armen må gerne hvile. Læreren har set den. Sikkert."],
             knap: "Hånden er oppe" },
        N: { trin: ["Find en, der sidder fast.", "Forklar, hvordan du tænker.", "Giv ikke bare dit svar."],
             knap: "Jeg har hjulpet" },
        O: { trin: ["Kig på de næste opgaver.", "Skriv et konkret spørgsmål ned til læreren."],
             knap: "Jeg har et spørgsmål klar", udfordring: "O" }
    };

    /* ---------------------------------------------------------------
       TEKSTER I PANELET
       --------------------------------------------------------------- */
    D.TEKST = {
        start: "Svar ærligt. Det bliver tjekket.",
        ok: "Godkendt.",
        fejl: "Sendt tilbage.",
        undskyldning: "Undskyldning afvist.",
        stempel: "TILBAGE!",
        koe: "Hånden er oppe. Du er nummer {n} i køen.",
        paaskeaeg: "Pænt forsøgt. Man kan ikke klikke sig til godt arbejde.",
        konfetti: "Konfetti er dyrt. Her er tre stykker.",
        paastand: "Du svarede {ord} til:",
        paastandO: "Du siger, du har et spørgsmål klar.",
        undervejs: "Brikken er på vej.",
        undervejsTilbage: "Brikken bliver sendt tilbage."
    };

    /* GODT ARBEJDE: efter vejen (den kasse, brikken kom fra) */
    D.SLUTTEKST = {
        A: "Løst på egen hånd. Flowchartet var bare til pynt.",
        E: "Løst ved fælles hjælp. Det tæller stadig.",
        H: "Bogen hjalp. Det gør den, når den bliver åbnet.",
        J: "Klassen hjalp. Husk at hjælpe tilbage.",
        N: "Du hjalp andre, mens du ventede. Læreren er rørt. Lidt.",
        O: "Du har et rigtigt spørgsmål klar. Læreren kommer. Før eller siden."
    };

    /* Bemærkningen om antallet af gange, brikken blev sendt tilbage */
    D.OMVEJE = [
        { fra: 0, t: "Ingen omveje. Imponerende. Eller mistænkeligt." },
        { fra: 1, t: "Én omvej. Det sker for de bedste." },
        { fra: 2, t: "Et par omveje. Det er sådan, man lærer det." },
        { fra: 4, t: "Mange omveje. Det er også en slags motion." }
    ];

    return D;
})();
