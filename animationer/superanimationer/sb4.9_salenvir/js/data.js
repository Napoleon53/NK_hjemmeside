/* =====================================================================
   data.js - teksterne til syntesen af Salenvir

   Ti trin efter syntesevejledningen. Hvert trin har dele, som eleven
   goer i scenen; kortet viser den foerste del, der ikke er gjort. Et
   trin kan have et gaet foer forsoeget (gaet), et spoergsmaal efter
   (spm) eller et felt (felt). slut er forklaringen paa det groenne kort.

   Del:  id       navnet, som js/sim.js kender delen paa
         tekst    det, eleven skal goere, som en hel saetning (hoejst 95 tegn)
         hint     hinttrappen (hver hoejst 100 tegn). Sidste trin paa
                  hjaelpeknappen er Vis svaret: animationen goer delen.
         skilt    det gule skilt ved tingen, der skal bruges (kort)
         paa      den ting i scenen, skiltet og den gule ring sidder paa

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
                { id: "magnet", tekst: "Træk magneten ned i den koniske kolbe.",
                  skilt: "Træk mig ned i kolben", paa: "magnet",
                  hint: ["Magneten er den lille hvide stav på bordet. Træk den hen over kolben, og slip."] }
            ],
            slut: "Magneten ligger i bunden af kolben. Når omrøreren tændes, drejer den rundt og rører i væsken."
        },
        /* ----- 2 ---------------------------------------------------------- */
        {
            id: "sal", navn: "1,4 mL salicylaldehyd",
            dele: [
                { id: "sal-ned", tekst: "Træk pipetten ned i flasken med salicylaldehyd.",
                  skilt: "Træk mig ned i flasken", paa: "pip2",
                  hint: ["Pipetten står i holderen. Træk den hen over den brune flaske, og slip."] },
                { id: "sal-sug", tekst: "Hold på knappen Sug op, til pipetten viser 1,4 mL.",
                  skilt: "Hold: sug op", paa: "pip2-sug",
                  hint: ["Hold musen nede på knappen ▲ Sug op ved pipettebolden. Slip ved 1,4 mL.",
                         "Fik du for meget? Hold på ▼ Tøm, mens pipetten står i flasken."] },
                { id: "sal-over", tekst: "Træk pipetten med 1,4 mL salicylaldehyd hen over den koniske kolbe.",
                  skilt: "Træk mig hen over kolben", paa: "pip2",
                  hint: ["Træk pipetten, så spidsen er lige over kolbens åbning, og slip."] },
                { id: "sal-toem", tekst: "Hold på knappen Tøm, til pipetten er tom.",
                  skilt: "Hold: tøm", paa: "pip2-toem",
                  hint: ["Hold musen nede på knappen ▼ Tøm ved pipettebolden, til der ikke er mere i pipetten."] }
            ],
            slut: function (t) {
                if (t.vSal > 1.55) return "Kolben fik " + k(t.vSal, 1) + " mL salicylaldehyd. Opskriften siger 1,4 mL, så noget af det bliver til overs.";
                return "Kolben har fået " + k(t.vSal, 1) + " mL salicylaldehyd. Det er en næsten farveløs væske.";
            }
        },
        /* ----- 3 ---------------------------------------------------------- */
        {
            id: "ethanol", navn: "100 mL ethanol",
            dele: [
                { id: "eth-maal", tekst: "Hæld ethanol i måleglasset, til det viser 100 mL.",
                  skilt: "Hold mig over måleglasset", paa: "fl-eth",
                  hint: ["Træk flasken med ethanol hen over måleglasset, og hold den der. Slip ved 100 mL.",
                         "Stregen øverst på måleglasset er 100 mL. Et tal over flasken viser, hvor meget der er i."] },
                { id: "eth-haeld", tekst: "Hæld de 100 mL ethanol fra måleglasset over i den koniske kolbe.",
                  skilt: "Hold mig over kolben", paa: "maaleglas",
                  hint: ["Træk måleglasset hen over kolbens åbning, og hold det der, til det er tomt."] }
            ],
            slut: "Ethanolen er opløsningsmidlet. Både salicylaldehyd og ethylendiamin kan opløses i den."
        },
        /* ----- 4 ---------------------------------------------------------- */
        {
            id: "varme", navn: "Omrøring og varme",
            dele: [
                { id: "omroer", tekst: "Tænd for omrøringen: klik på den højre knap på magnetomrøreren.",
                  skilt: "Klik: omrøring", paa: "knap-omroer",
                  hint: ["Knappen med den runde pil er omrøringen. Klik på den."] },
                { id: "varme", tekst: "Tænd for varmen: klik på den venstre knap på magnetomrøreren.",
                  skilt: "Klik: varme", paa: "knap-varme",
                  hint: ["Knappen med de tre bølger er varmen. Den sætter pladen til 100 °C."] },
                { id: "termo", tekst: "Sæt termometret ned i kolben, så du kan følge temperaturen.",
                  skilt: "Træk mig ned i kolben", paa: "termo",
                  hint: ["Termometret ligger på bordet. Træk det hen over kolben, og slip."] }
            ],
            slut: "Pladen er sat til 100 °C, men ethanol koger ved 78 °C. Hold øje med termometret, mens opløsningen bliver varm."
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
                { id: "en-vent", tekst: "Vent, til termometret viser omkring 75 °C. Spol frem med knappen ⏩.",
                  skilt: "Spol frem", paa: "ur",
                  hint: ["Varmen er tændt. Knappen ⏩ 2 min får tiden til at gå hurtigere."] },
                { id: "en-ned", tekst: "Træk den lille pipette ned i flasken med ethylendiamin.",
                  skilt: "Træk mig ned i flasken", paa: "pip1",
                  hint: ["Det er en pipette på 1 mL. Træk den hen over den brune flaske med ethylendiamin."] },
                { id: "en-sug", tekst: "Hold på knappen Sug op, til pipetten viser 0,5 mL.",
                  skilt: "Hold: sug op", paa: "pip1-sug",
                  hint: ["Hold musen nede på knappen ▲ Sug op. Slip ved 0,5 mL."] },
                { id: "en-toem", tekst: "Træk pipetten hen over kolben, og tøm den dråbe for dråbe.",
                  skilt: "Træk mig hen over kolben", paa: "pip1",
                  hint: ["Træk pipetten hen over kolben. Hold så på ▼ Tøm: den drypper én dråbe ad gangen."] }
            ],
            slut: function (t) {
                var s = "Opløsningen blev gul. Det gule er Salenvir, der dannes, hvor dråberne rammer.";
                if (t.enVedT !== null && t.enVedT < 60) s += " Opløsningen var kun " + Math.round(t.enVedT) + " °C, så reaktionen går langsomt.";
                return s;
            }
        },
        /* ----- 6 ---------------------------------------------------------- */
        {
            id: "tlc", navn: "TLC",
            dele: [
                { id: "tlc-p", tekst: "Dyp en pipettespids i kolben, og sæt en plet på TLC-pladen ved P.",
                  skilt: "Træk mig ned i kolben", paa: "spids-p",
                  hint: ["Træk den venstre pipettespids ned i kolben. Træk den så hen til stregen ved P på pladen, og slip."] },
                { id: "tlc-r", tekst: "Dyp den anden spids i referenceglasset, og sæt en plet ved R.",
                  skilt: "Træk mig ned i referencen", paa: "spids-r",
                  hint: ["Referenceglasset har fortyndet salicylaldehyd. Træk spidsen derned og så hen til R på pladen."] },
                { id: "tlc-koer", tekst: "Stil TLC-pladen i bægerglasset med løbevæske, og vent, til væsken næsten er oppe.",
                  skilt: "Træk mig ned i glasset", paa: "plade",
                  hint: ["Træk pladen ned i bægerglasset. Løbevæsken suges op og tager stofferne med sig."] },
                { id: "tlc-uv", tekst: "Stil TLC-pladen under UV-lampen, så du kan se pletterne.",
                  skilt: "Træk mig under lampen", paa: "plade",
                  hint: ["Stofferne er farveløse, men de ses som mørke pletter i UV-lys. Træk pladen hen under lampen."] }
            ],
            /* Spoergsmaalet bygges af js/sim.js ud fra pladen, se tlcSpm */
            slut: "Salicylaldehyden er brugt op, og reaktionen er færdig."
        },
        /* ----- 7 ---------------------------------------------------------- */
        {
            id: "koel", navn: "Afkøling",
            dele: [
                { id: "sluk", tekst: "Sluk for varmen på magnetomrøreren: klik på den venstre knap.",
                  skilt: "Klik: sluk varmen", paa: "knap-varme",
                  hint: ["Knappen med de tre bølger er varmen. Lampen ved knappen slukker, når varmen er slukket."] },
                { id: "isbad", tekst: "Sæt kolben i isbadet, så opløsningen bliver kold.",
                  skilt: "Træk kolben herned", paa: "isbad",
                  hint: ["Tag fat i kolben, og træk den ned i skålen med is og vand. Termometret følger med."] }
            ],
            spm: {
                tekst: "Hvorfor skal opløsningen køles, før krystallerne filtreres fra?",
                svar: [
                    { t: "Kold ethanol kan opløse mindre Salenvir.", ok: true },
                    { t: "Reaktionen bliver først færdig i kulden.", ok: false,
                      f: "TLC-pladen viste, at reaktionen allerede er færdig. Kulden ændrer, hvor meget der kan være opløst." },
                    { t: "Filtrerpapiret tåler ikke varm ethanol.", ok: false,
                      f: "Papiret tåler godt varm ethanol. Se, hvad der sker i kolben, mens den bliver kold." }
                ],
                hint: ["Se i kolben, mens den bliver kold. Hvad kommer der til syne?"],
                godt: "Rigtigt. Jo koldere ethanolen er, jo mindre Salenvir kan den opløse. Resten fælder ud som gule krystaller."
            },
            slut: "Jo koldere ethanolen er, jo mindre Salenvir kan den opløse. Resten fælder ud som gule krystaller."
        },
        /* ----- 8 ---------------------------------------------------------- */
        {
            id: "filtr", navn: "Sugefiltrering",
            dele: [
                { id: "filtr-kold", tekst: "Vent, til termometret i kolben viser under 25 °C. Spol frem med ⏩.",
                  skilt: "Spol frem", paa: "ur",
                  hint: ["Isbadet køler kolben. Knappen ⏩ 2 min får tiden til at gå hurtigere."] },
                { id: "filtr-fugt", tekst: "Fugt filtrerpapiret i Büchnertragten med ethanol fra sprøjteflasken.",
                  skilt: "Hold mig over tragten", paa: "sproejte",
                  hint: ["Træk sprøjteflasken hen over tragten, og hold den der et øjeblik."] },
                { id: "filtr-sug", tekst: "Åbn for suget: klik på hanen på væggen.",
                  skilt: "Klik: åbn hanen", paa: "hane",
                  hint: ["Hanen sidder på røret til højre. Slangen går fra hanen til sugekolben."] },
                { id: "filtr-haeld", tekst: "Hæld kolbens indhold ned i Büchnertragten.",
                  skilt: "Hold mig over tragten", paa: "kolbe",
                  hint: ["Tag fat i kolben i isbadet, og hold den over tragten, til den er tom."] },
                { id: "filtr-skyl", tekst: "Skyl kolben med lidt ethanol fra sprøjteflasken, og hæld det i tragten.",
                  skilt: "Hold mig over kolben", paa: "sproejte",
                  hint: ["Der sidder krystaller tilbage i kolben. Sprøjt lidt ethanol i kolben, og hæld den i tragten igen."] }
            ],
            slut: function (t) {
                var s = "Krystallerne ligger på filtrerpapiret, og ethanolen er løbet ned i sugekolben.";
                if (t.filtrT !== null && t.filtrT > 30) s += " Kolben var " + Math.round(t.filtrT) + " °C, så en del Salenvir var stadig opløst.";
                else if (!t.vaad) s += " Papiret var ikke fugtet, så nogle krystaller løb under det.";
                return s;
            }
        },
        /* ----- 9 ---------------------------------------------------------- */
        {
            id: "vej", navn: "Tørring og vejning",
            dele: [
                { id: "vej-tom", tekst: "Vej det tomme urglas: stil det på vægten.",
                  skilt: "Træk mig op på vægten", paa: "urglas",
                  hint: ["Træk urglasset op på vægten. Massen kommer i skemaet til højre."] },
                { id: "vej-skrab", tekst: "Skrab krystallerne fra tragten over på urglasset med spatlen.",
                  skilt: "Træk mig hen til tragten", paa: "spatel",
                  hint: ["Træk spatlen hen til krystallerne i tragten. Træk den så hen over urglasset, og slip."] },
                { id: "vej-toer", tekst: "Stil urglasset under varmelampen, og lad krystallerne tørre.",
                  skilt: "Træk mig under lampen", paa: "urglas",
                  hint: ["Træk urglasset hen under lampen, og spol frem med ⏩. Våde krystaller er mørke og klumper."] },
                { id: "vej-fuld", tekst: "Vej urglasset med krystallerne.",
                  skilt: "Træk mig op på vægten", paa: "urglas",
                  hint: ["Træk urglasset fra lampen op på vægten. Massen kommer i skemaet til højre."] },
                { id: "vej-igen", tekst: "Tør krystallerne lidt mere under lampen, og vej igen, til massen er den samme to gange.",
                  skilt: "Træk mig under lampen", paa: "urglas",
                  hint: ["Massen falder, så længe der fordamper ethanol. Giver to vejninger det samme, er krystallerne tørre."] }
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
                { id: "smp-fyld", tekst: "Fyld lidt krystaller i smeltepunktsrøret: træk røret ned i krystallerne.",
                  skilt: "Træk mig ned i krystallerne", paa: "roer",
                  hint: ["Smeltepunktsrøret er det tynde glasrør. Træk det hen over krystallerne på urglasset."] },
                { id: "smp-ind", tekst: "Sæt smeltepunktsrøret i hullet øverst på smeltepunktsapparatet.",
                  skilt: "Træk mig hen i hullet", paa: "roer",
                  hint: ["Hullet sidder på oversiden af apparatet, til venstre."] },
                { id: "smp-taend", tekst: "Tænd for smeltepunktsapparatet: klik på knappen I/O.",
                  skilt: "Klik: tænd", paa: "smp-knap",
                  hint: ["Knappen sidder nederst til venstre på apparatet."] },
                { id: "smp-start", tekst: "Klik på linsen, når krystallerne begynder at smelte.",
                  skilt: "Klik, når det smelter", paa: "linse",
                  hint: ["Se i linsen. Når de første krystaller bliver til klar væske, klikker du."] },
                { id: "smp-slut", tekst: "Klik på linsen igen, når alle krystallerne er smeltet.",
                  skilt: "Klik, når alt er smeltet", paa: "linse",
                  hint: ["Når hele prøven er klar, gul væske, klikker du igen."] }
            ],
            /* Spoergsmaalet bygges af js/sim.js ud fra elevens aflaesning, se smpSpm */
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
        ikkeFaerdig: "Rigtigt. Der er stadig salicylaldehyd, så reaktionen er ikke færdig. Spol et par minutter frem, og kør en ny plade.",
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
        overloeb: "Måleglasset løb over. Hæld det, der er i, over i kolben, og fyld op til 100 mL.",
        pipFuld: "Pipetten er fuld.",
        tragtFuld: "Tragten er fuld. Uden sug løber ethanolen kun langsomt igennem.",
        hurtigEn: "Ethylendiamin skal dryppes i. Tøm pipetten langsomt, dråbe for dråbe.",
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
