/* =====================================================================
   data.js - teksterne til syntesen af Salenvir

   Ti trin efter syntesevejledningen. Hvert trin har dele, som eleven
   goer i scenen; kortet viser den foerste del, der ikke er gjort. Et
   trin kan have et gaet foer forsoeget (gaet), et spoergsmaal efter
   (spm) eller et felt (felt). slut er forklaringen paa det groenne kort.

   Del:  id       navnet, som js/sim.js kender delen paa
         tekst    det, eleven skal goere, som en hel saetning (hoejst 95 tegn)
         knap     teksten paa den groenne knap ved tingen (kort). Knappen goer
                  delen med den rigtige maengde, saa intet maales forkert
         paa      den ting i scenen, knappen og den gule ring sidder ved
         auto     delen sker af sig selv (opvarmningen), ingen knap
         hint     hinttrappen (hver hoejst 100 tegn): hvorfor delen goeres.
                  Sidste trin paa hjaelpeknappen er Vis svaret.

   Tal, der afhaenger af elevens eget forsoeg, saettes ind af js/sim.js
   (funktioner, der faar tallene som argument).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function k(v, d) { return NK.Data.komma(v, d); }

    var TRIN = [
        /* ----- 1 ---------------------------------------------------------- */
        {
            id: "magnet", navn: "Magneten",
            dele: [
                { id: "magnet", tekst: "Læg magneten ned i den koniske kolbe.",
                  knap: "Læg magneten i kolben", paa: "magnet",
                  hint: ["Magneten er den lille hvide stav på bordet. Den skal røre i væsken, når omrøreren tændes."] }
            ],
            slut: "Magneten ligger i bunden af kolben. Når omrøreren tændes, drejer den rundt og rører i væsken."
        },
        /* ----- 2 ---------------------------------------------------------- */
        {
            id: "sal", navn: "1,4 mL salicylaldehyd",
            dele: [
                { id: "sal-sug", tekst: "Afmål 1,4 mL salicylaldehyd med pipetten.",
                  knap: "Sug 1,4 mL op", paa: "pip2",
                  hint: ["Pipettebolden suger væsken op i pipetten. Tallet ved pipetten viser, hvor meget der er i."] },
                { id: "sal-toem", tekst: "Kom de 1,4 mL salicylaldehyd i den koniske kolbe.",
                  knap: "Tøm pipetten i kolben", paa: "pip2",
                  hint: ["Pipetten føres hen over kolben, og bolden presser væsken ud."] }
            ],
            slut: "Kolben har fået 1,4 mL salicylaldehyd. Det er en næsten farveløs væske."
        },
        /* ----- 3 ---------------------------------------------------------- */
        {
            id: "ethanol", navn: "100 mL ethanol",
            dele: [
                { id: "eth-maal", tekst: "Afmål 100 mL ethanol i måleglasset.",
                  knap: "Hæld 100 mL i måleglasset", paa: "fl-eth",
                  hint: ["Et måleglas måler rumfang mere præcist end stregerne på kolben."] },
                { id: "eth-haeld", tekst: "Hæld de 100 mL ethanol fra måleglasset over i den koniske kolbe.",
                  knap: "Hæld i kolben", paa: "maaleglas",
                  hint: ["Måleglasset tømmes helt ned i kolben."] }
            ],
            slut: "Ethanolen er opløsningsmidlet. Både salicylaldehyd og ethylendiamin kan opløses i den."
        },
        /* ----- 4 ---------------------------------------------------------- */
        {
            id: "varme", navn: "Omrøring og varme",
            dele: [
                { id: "omroer", tekst: "Tænd for omrøringen på magnetomrøreren.",
                  knap: "Tænd omrøringen", paa: "knap-omroer",
                  hint: ["Knappen med den runde pil er omrøringen. Magneten drejer rundt i kolben."] },
                { id: "varme", tekst: "Tænd for varmen på magnetomrøreren.",
                  knap: "Tænd varmen", paa: "knap-varme",
                  hint: ["Knappen med de tre bølger er varmen."] },
                { id: "termo", tekst: "Sæt termometret ned i kolben, så du kan følge temperaturen.",
                  knap: "Sæt termometret i", paa: "termo",
                  hint: ["Termometret ligger på bordet foran kolben."] },
                { id: "varm", tekst: "Opløsningen bliver varmet op til omkring 75 °C.", auto: true,
                  hint: ["Se på termometret, mens opløsningen bliver varm."] }
            ],
            slut: "Opløsningen er 75 °C. Det er varmt nok til, at reaktionen går hurtigt, og under ethanols kogepunkt på 78 °C."
        },
        /* ----- 5 ---------------------------------------------------------- */
        {
            id: "en", navn: "0,5 mL ethylendiamin",
            gaet: {
                intro: "Ethylendiamin er en farveløs væske. Om lidt drypper du den ned i den varme opløsning af salicylaldehyd.",
                tekst: "Hvad ser du, når ethylendiamin kommer i kolben?",
                svar: [
                    { t: "Ingenting. Alle stofferne er farveløse.", ok: false },
                    { t: "Opløsningen bliver gul.", ok: true },
                    { t: "Det bruser af en gas.", ok: false }
                ]
            },
            dele: [
                { id: "en-sug", tekst: "Afmål 0,5 mL ethylendiamin med den lille pipette.",
                  knap: "Sug 0,5 mL op", paa: "pip1",
                  hint: ["Det er en pipette på 1 mL. Ethylendiamin er ætsende, så det afmåles med pipettebold."] },
                { id: "en-toem", tekst: "Dryp de 0,5 mL ethylendiamin ned i kolben, én dråbe ad gangen.",
                  knap: "Dryp i kolben", paa: "pip1",
                  hint: ["Dråbe for dråbe giver en rolig reaktion. Se, hvad der sker, hvor dråberne rammer."] }
            ],
            slut: "Opløsningen blev gul. Det gule er Salenvir, der dannes, hvor dråberne rammer."
        },
        /* ----- 6 ---------------------------------------------------------- */
        {
            id: "tlc", navn: "TLC",
            dele: [
                { id: "tlc-p", tekst: "Sæt en plet af prøven fra kolben ved P på TLC-pladen.",
                  knap: "Sæt en prøve ved P", paa: "spids-p",
                  hint: ["P er prøven fra kolben. Pletten sættes på blyantsstregen nederst på pladen."] },
                { id: "tlc-r", tekst: "Sæt en plet af referencen ved R med den anden pipettespids.",
                  knap: "Sæt referencen ved R", paa: "spids-r",
                  hint: ["Referenceglasset har fortyndet salicylaldehyd. Så kan du se, hvor højt salicylaldehyd løber."] },
                { id: "tlc-koer", tekst: "Stil TLC-pladen i bægerglasset med løbevæske.",
                  knap: "Stil pladen i glasset", paa: "plade",
                  hint: ["Løbevæsken suges op ad pladen og tager stofferne med sig, hvert stof sit eget stykke."] },
                { id: "tlc-uv", tekst: "Se på TLC-pladen under UV-lampen.",
                  knap: "Stil pladen under lampen", paa: "plade",
                  hint: ["Stofferne er farveløse, men de ses som mørke pletter i UV-lys."] }
            ],
            /* Spoergsmaalet bygges af js/sim.js ud fra pladen, se tlcVurdering */
            slut: "Salicylaldehyden er brugt op, og reaktionen er færdig."
        },
        /* ----- 7 ---------------------------------------------------------- */
        {
            id: "koel", navn: "Afkøling",
            dele: [
                { id: "sluk", tekst: "Sluk for varmen og omrøringen på magnetomrøreren.",
                  knap: "Sluk varmen", paa: "knap-varme",
                  hint: ["Reaktionen er færdig, så der skal ikke varmes mere."] },
                { id: "isbad", tekst: "Sæt kolben i isbadet, så opløsningen bliver kold.",
                  knap: "Sæt kolben i isbadet", paa: "kolbe",
                  hint: ["Se i kolben, mens den bliver kold."] }
            ],
            spm: {
                tekst: "Hvorfor skal opløsningen køles, før krystallerne filtreres fra?",
                svar: [
                    { t: "Kold ethanol kan opløse mindre Salenvir.", ok: true },
                    { t: "Reaktionen bliver først færdig i kulden.", ok: false,
                      f: "TLC-pladen viste, at reaktionen allerede er færdig. Kulden ændrer, hvor meget der kan være opløst." },
                    { t: "Filtrerpapiret tåler ikke varm ethanol.", ok: false,
                      f: "Papiret tåler godt varm ethanol. Se på kolben: der kom krystaller, da den blev kold." }
                ],
                hint: ["Se i kolben. Hvad kom der til syne, da den blev kold?"],
                godt: "Rigtigt. Jo koldere ethanolen er, jo mindre Salenvir kan den opløse. Resten fælder ud som gule krystaller."
            },
            slut: "Jo koldere ethanolen er, jo mindre Salenvir kan den opløse. Resten fælder ud som gule krystaller."
        },
        /* ----- 8 ---------------------------------------------------------- */
        {
            id: "filtr", navn: "Sugefiltrering",
            dele: [
                { id: "filtr-fugt", tekst: "Fugt filtrerpapiret i Büchnertragten med ethanol fra sprøjteflasken.",
                  knap: "Fugt filtrerpapiret", paa: "sproejte",
                  hint: ["Et vådt papir ligger tæt i tragten, så krystallerne ikke løber ind under det."] },
                { id: "filtr-sug", tekst: "Åbn for suget på hanen ved væggen.",
                  knap: "Åbn for suget", paa: "hane",
                  hint: ["Slangen går fra hanen til sugekolben. Suget trækker ethanolen gennem papiret."] },
                { id: "filtr-haeld", tekst: "Hæld kolbens indhold ned i Büchnertragten.",
                  knap: "Hæld kolben i tragten", paa: "kolbe",
                  hint: ["Krystallerne bliver på papiret, og ethanolen løber ned i sugekolben."] },
                { id: "filtr-skyl", tekst: "Skyl kolben med lidt ethanol, og hæld det i tragten.",
                  knap: "Skyl kolben", paa: "sproejte",
                  hint: ["Der sidder stadig krystaller i kolben. Skylningen får dem med."] }
            ],
            slut: "Krystallerne ligger på filtrerpapiret, og ethanolen er løbet ned i sugekolben."
        },
        /* ----- 9 ---------------------------------------------------------- */
        {
            id: "vej", navn: "Tørring og vejning",
            dele: [
                { id: "vej-tom", tekst: "Vej det tomme urglas.",
                  knap: "Stil urglasset på vægten", paa: "urglas",
                  hint: ["Urglassets egen masse skal trækkes fra bagefter. Massen kommer i skemaet til højre."] },
                { id: "vej-skrab", tekst: "Skrab krystallerne fra tragten over på urglasset med spatlen.",
                  knap: "Skrab krystallerne over", paa: "spatel",
                  hint: ["Spatlen tager krystallerne fra filtrerpapiret i tragten."] },
                { id: "vej-toer", tekst: "Lad krystallerne tørre under varmelampen.",
                  knap: "Stil urglasset under lampen", paa: "urglas",
                  hint: ["Krystallerne er våde af ethanol. Våde krystaller er mørke og klumper; tørre er lyse."] },
                { id: "vej-fuld", tekst: "Vej urglasset med de tørre krystaller.",
                  knap: "Stil urglasset på vægten", paa: "urglas",
                  hint: ["Massen kommer i skemaet til højre."] }
            ],
            felt: {
                tekst: "Hvad er dit praktiske udbytte, altså massen af Salenvir?",
                enhed: "g",
                hint: function (t) {
                    return ["Træk massen af det tomme urglas fra massen af urglasset med krystallerne.",
                            "m = " + k(t.mFuld, 2) + " g − " + k(t.mTom, 2) + " g"];
                },
                fejl: function (svar, t) {
                    if (Math.abs(svar - t.mFuld) < 0.006) return "Det er massen af urglasset med krystallerne. Træk urglassets egen masse fra.";
                    if (Math.abs(svar - t.mTom) < 0.006) return "Det er massen af det tomme urglas. Du skal finde krystallernes masse.";
                    if (Math.abs(svar - (t.mFuld + t.mTom)) < 0.02) return "Massen af urglasset skal trækkes fra, ikke lægges til.";
                    return "Se på skemaet til højre: træk urglassets masse fra massen med krystallerne.";
                },
                godt: function (t) {
                    return "Rigtigt. Du fik " + k(t.svar, 2) + " g Salenvir.";
                }
            },
            slut: function (t) { return "Rigtigt. Du fik " + k(t.svar, 2) + " g Salenvir. Om lidt ser du på, hvor rent det er."; }
        },
        /* ----- 10 --------------------------------------------------------- */
        {
            id: "smp", navn: "Smeltepunkt",
            dele: [
                { id: "smp-fyld", tekst: "Fyld lidt krystaller i smeltepunktsrøret.",
                  knap: "Fyld røret", paa: "roer",
                  hint: ["Smeltepunktsrøret er det tynde glasrør. Det skal kun have lidt krystaller i bunden."] },
                { id: "smp-ind", tekst: "Sæt smeltepunktsrøret i smeltepunktsapparatet.",
                  knap: "Sæt røret i apparatet", paa: "roer",
                  hint: ["Hullet sidder på oversiden af apparatet."] },
                { id: "smp-taend", tekst: "Tænd for smeltepunktsapparatet.",
                  knap: "Tænd apparatet", paa: "smp-knap",
                  hint: ["Apparatet varmer prøven langsomt op, og linsen viser den forstørret."] },
                { id: "smp-start", tekst: "Se i linsen, og klik, når krystallerne begynder at smelte.",
                  knap: "Det smelter nu", paa: "linse",
                  hint: ["Når de første krystaller bliver til klar væske, klikker du."] },
                { id: "smp-slut", tekst: "Klik igen, når alle krystallerne er smeltet.",
                  knap: "Alt er smeltet", paa: "linse",
                  hint: ["Når hele prøven er klar, gul væske, klikker du igen."] }
            ],
            /* Spoergsmaalet bygges af js/sim.js ud fra elevens aflaesning, se smpVurdering */
            slut: function (t) {
                return "Syntesen er færdig. Du fik " + k(t.m, 2) + " g Salenvir, og det smeltede ved " + k(t.a, 1) + " til " + k(t.b, 1) + " °C.";
            }
        }
    ];

    /* Spoergsmaalet efter en TLC-plade. Hvilket svar der er rigtigt, afgoer
       js/sim.js ud fra pladen. */
    var TLC_SPM = {
        tekst: "Se på TLC-pladen under UV-lampen. Er reaktionen færdig?",
        svar: [
            { t: "Ja: P har ingen plet ud for R." },
            { t: "Nej: P har stadig en plet ud for R." },
            { t: "Ja: P har fået en ny plet." }
        ],
        /* Forklaringer til et forkert svar: [rigtigt svar][valgt svar] */
        fejl: {
            ikkeFaerdigMenJa: "Se en gang til: prøven P har en plet i samme højde som referencen R. Det er salicylaldehyd.",
            nyPlet: "Prøven P har fået en ny plet: Salenvir. Reaktionen er først færdig, når salicylaldehyden er brugt op.",
            faerdigMenNej: "Se en gang til: prøven P har ingen plet i højde med R. Salicylaldehyden er brugt op."
        },
        hint: ["Referencen R er salicylaldehyd. Har prøven P en plet i samme højde som R?"],
        ikkeFaerdig: "Rigtigt. Der er stadig salicylaldehyd, så reaktionen er ikke færdig. Vent 10 minutter, og kør en ny plade.",
        faerdig: "Rigtigt. Salicylaldehyden er brugt op, og reaktionen er færdig.",
        overskud: "Rigtigt, der er stadig salicylaldehyd. Kolben fik mere, end ethylendiaminen kan omsætte, så pletten bliver. Reaktionen er færdig."
    };

    /* Spoergsmaalet efter smeltepunktet */
    var SMP_SPM = {
        tekst: function (a, b) {
            return "Salenvir smelter ved 127-128 °C. Dit stof smeltede ved " + k(a, 1) + " til " + k(b, 1) + " °C. Hvad viser det?";
        },
        svar: [
            { t: "Stoffet er rent og tørt." },
            { t: "Stoffet er urent eller vådt." }
        ],
        fejlRent: "Et rent stof smelter skarpt, højst et par grader under 128 °C. Dit stof smeltede lavere og over flere grader.",
        fejlUrent: "Dit stof smeltede inden for et par grader fra 127-128 °C. Det er tegn på et rent og tørt stof.",
        hint: ["Et rent stof smelter ved det rigtige smeltepunkt og over højst et par grader."],
        godtRent: "Rigtigt. Stoffet smelter skarpt og ved det rigtige smeltepunkt, så det er rent og tørt.",
        godtUrent: function (vaad) {
            return vaad ? "Rigtigt. Der var stadig ethanol i krystallerne. Det sænker smeltepunktet og gør intervallet bredere."
                        : "Rigtigt. Urenheder sænker smeltepunktet og gør intervallet bredere.";
        }
    };

    /* Beskeder, der kommer, naar eleven goer noget andet end kortet siger */
    var BESKED = {
        ikkeVejet: "Urglasset blev ikke vejet tomt, så krystallernes masse kan ikke findes. Vej et nyt urglas, og flyt krystallerne over.",
        tragtFuld: "Tragten er fuld. Uden sug løber ethanolen kun langsomt igennem.",
        varmFiltr: function (T) { return "Kolben er " + Math.round(T) + " °C. Noget Salenvir er stadig opløst og løber ned i sugekolben."; },
        ikkeFugtet: "Filtrerpapiret er ikke fugtet. Nogle krystaller løber under papiret.",
        intetSug: "Der er ikke åbnet for suget, så ethanolen løber kun langsomt igennem."
    };

    /* Etiketterne paa flaskerne */
    var ETIKET = {
        "fl-sal": ["Salicyl-", "aldehyd"],
        "fl-en": ["Ethylen-", "diamin"],
        "fl-eth": ["Ethanol", "absolut"],
        "vial": ["Ref."]
    };

    var FAERDIG = "Syntesen er færdig.";

    /* Dansk komma med d decimaler */
    function komma(v, d) {
        if (d === undefined) d = 1;
        return (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d).replace(".", ",").replace("-", "−");
    }

    NK.Data = {
        TRIN: TRIN,
        TLC_SPM: TLC_SPM,
        SMP_SPM: SMP_SPM,
        BESKED: BESKED,
        ETIKET: ETIKET,
        FAERDIG: FAERDIG,
        komma: komma
    };
}());
