/* =====================================================================
   data.js - alkanerne, maalene, blandingerne og replikkerne

   Alt, der kan staa som data, staar her.

   Smelte- og kogepunkterne er ved 1 atm fra CRC Handbook of Chemistry
   and Physics (97. udgave), rundet til én decimal. Molarmassen af
   C5H12 er regnet med IUPAC's atommasser (C 12,01, H 1,008).

   Damptrykket under kogepunktet regnes med Troutons regel:
   fordampningsentropien er ca. 88 J/(mol·K) for alle alkanerne, saa
   p / p0 = exp(-(88 / R) · (Tk / T - 1)). Det bruges kun til de faa
   molekyler, der er damp over vaesken (D.DAMP).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Stofferne -----------------------------------------------------------
       id, navn, formel, antal C, smeltepunkt (°C), kogepunkt (°C), form.
       form: "kaede" (lige kaede), "methylbutan" (én gren), "dimethylpropan"
       (to grene paa samme C, kugleformet). grene: antal grene. */
    var S = [
        ["metan",          "metan",              "CH4",    1, -182.5, -161.5, "kaede"],
        ["ethan",          "ethan",              "C2H6",   2, -182.8,  -88.6, "kaede"],
        ["propan",         "propan",             "C3H8",   3, -187.6,  -42.1, "kaede"],
        ["butan",          "butan",              "C4H10",  4, -138.3,   -0.5, "kaede"],
        ["pentan",         "pentan",             "C5H12",  5, -129.7,   36.1, "kaede"],
        ["hexan",          "hexan",              "C6H14",  6,  -95.3,   68.7, "kaede"],
        ["heptan",         "heptan",             "C7H16",  7,  -90.6,   98.4, "kaede"],
        ["octan",          "octan",              "C8H18",  8,  -56.8,  125.6, "kaede"],
        ["nonan",          "nonan",              "C9H20",  9,  -53.5,  150.8, "kaede"],
        ["decan",          "decan",              "C10H22", 10, -29.7,  174.1, "kaede"],
        ["icosan",         "icosan",             "C20H42", 20,  36.7,  343.0, "kaede"],
        ["methylbutan",    "2-methylbutan",      "C5H12",  5, -159.8,   27.9, "methylbutan"],
        ["dimethylpropan", "2,2-dimethylpropan", "C5H12",  5,  -16.5,    9.5, "dimethylpropan"]
    ];

    /* Antal molekyler i proeven paa fane 1, saa der er ca. 120 C-kugler
       (metan og ethan faar lidt faerre, ellers bliver det et kuglehav) */
    var ANTAL = { metan: 44, ethan: 32, propan: 28, butan: 26, pentan: 24, hexan: 20,
                  heptan: 17, octan: 15, nonan: 13, decan: 12, icosan: 6 };

    D.STOFFER = S.map(function (r, i) {
        var navn = r[1];
        return {
            nr: i, id: r[0], navn: navn,
            /* Stort begyndelsesbogstav, men ikke foran et tal (2-methylbutan) */
            Navn: /^[a-z]/.test(navn) ? navn.charAt(0).toUpperCase() + navn.slice(1) : navn,
            formel: r[2], nC: r[3], smp: r[4], kp: r[5], form: r[6],
            grene: r[6] === "methylbutan" ? 1 : (r[6] === "dimethylpropan" ? 2 : 0),
            antal: ANTAL[r[0]] || 14
        };
    });

    var efterId = {};
    D.STOFFER.forEach(function (st) { efterId[st.id] = st; });
    D.stof = function (id) { return efterId[id] || null; };

    /* Hylden paa fane 1: de ti foerste ligekaedede og icosan */
    D.HYLDE = ["metan", "ethan", "propan", "butan", "pentan", "hexan", "heptan",
               "octan", "nonan", "decan", "icosan"].map(D.stof);

    /* De tre isomerer af C5H12 paa fane 2 */
    D.ISOMERER = ["pentan", "methylbutan", "dimethylpropan"].map(D.stof);

    /* Molarmassen af C5H12 i g/mol: 5 · 12,01 + 12 · 1,008 */
    D.M_C5H12 = "72,15";

    /* ----- Temperatur og tryk ------------------------------------------------- */
    /* Hoejden, papirkortet har sat af oeverst i scenen: [almindelig skaerm, lav skaerm,
       smalt kort til hoejre for reolen paa en lav scene (fane 1)] */
    D.ZONE = { varm: [112, 110, 150], form: [192, 172], spil: [170, 154] };
    D.STUE = 20;                               /* stuetemperatur, °C */
    D.T_VARM = { min: -200, max: 360 };        /* kammeret paa fane 1 og 3 */
    D.T_FORM = { min: 0, max: 50 };            /* vandbadet paa fane 2 */
    D.TROUTON = 88;                            /* J/(mol·K) */
    D.R = 8.314;
    D.DAMP = 0.12;                             /* hoejst saa stor en del er damp under kp */

    /* Damptrykket i atm ved temperaturen T (°C). 1 ved kogepunktet. */
    D.damptryk = function (st, T) {
        var Tk = st.kp + 273.15, TT = T + 273.15;
        if (TT <= 1) return 0;
        return Math.exp(-(D.TROUTON / D.R) * (Tk / TT - 1));
    };

    /* ----- Tal og tekst ---------------------------------------------------------- */
    /* En temperatur med dansk komma og rigtigt minus: -0.5 -> "−0,5" */
    D.grader = function (T, decimaler) {
        var d = decimaler === undefined ? 1 : decimaler;
        var s = Math.abs(T).toFixed(d).replace(".", ",");
        if (Number(Math.abs(T).toFixed(d)) === 0) return s;
        return (T < 0 ? "−" : "") + s;
    };

    D.gradTekst = function (T, decimaler) { return D.grader(T, decimaler) + " °C"; };

    D.formel = function (st) { return NK.formel(st.formel); };

    /* ----- Fane 1: Varm op ------------------------------------------------------
       Fire maal i raekkefoelge. slags:
         koge     kogepunktet for stoffet id er fundet
         flere    kogepunktet er fundet for antal andre end pentan
         gaet     et gaet paa kurven og saa kogepunktet maalt (stoffet vaelges
                  af fanen: decan, eller den laengste, der ikke er maalt)
       efter: beskeden, naar maalet er naaet (fane 1 bygger den til gaet). */
    D.MAAL = [
        { slags: "koge", id: "pentan", tekst: "Få pentan til at koge.",
          hint: "Træk termometeret op, til der kommer bobler i glasset.",
          efter: "Pentan koger ved 36,1 °C. Molekylerne river sig løs fra hinanden og fylder ballonen." },
        { slags: "flere", antal: 3, tekst: "Find kogepunktet for tre andre alkaner.",
          hint: "Træk et glas fra hylden ned i kammeret. Varm det op, eller køl det ned, til det skifter mellem væske og gas.",
          efter: "Kurven stiger. Jo længere kæden er, jo højere er kogepunktet." },
        { slags: "gaet", tekst: "Gæt kogepunktet for {navn}. Træk ? på kurven, og mål det.",
          hint: "{Navn} har to C-atomer mere end {ned}. Forlæng kurven fra de korte kæder.",
          efter: "" },
        { slags: "koge", id: "icosan", tekst: "Kog icosan, C₂₀H₄₂. Det findes i stearinlys.",
          hint: "Icosan står yderst til højre på hylden. Temperaturen skal helt op over 300 °C.",
          efter: "Icosan koger først ved 343 °C. Lange kæder holder godt fast i hinanden." }
    ];

    /* Gaettet paa fane 1 er godt, naar det er saa taet paa */
    D.GAET_GODT = 25;

    /* ----- Fane 2: Formen --------------------------------------------------------- */
    D.FORM_SPM = "Hvilken ballon fyldes først?";
    D.FORM_HINT = "Alle tre stoffer har formlen C₅H₁₂. Kun molekylernes form er forskellig.";
    D.FORM_VARM_HINT = "Træk termometeret op over 36 °C, så alle tre stoffer koger.";

    D.HVORFOR = {
        spm: "Hvorfor koger 2,2-dimethylpropan først?",
        hint: "Samme atomer og samme masse. Se på formen. Hvor meget kan molekylerne røre hinanden?",
        valg: [
            { t: "Molekylerne rører hinanden mindst", rigtig: true,
              svar: "Et kugleformet molekyle har mindst berøringsflade. Derfor tiltrækker molekylerne hinanden svagest." },
            { t: "Molekylet har færrest atomer",
              svar: "Alle tre stoffer har formlen C₅H₁₂, så molekylerne har præcis de samme atomer." },
            { t: "Molekylet er lettest",
              svar: "Samme formel giver samme masse, så alle tre stoffer har M = 72,15 g/mol." },
            { t: "Bindingerne i molekylet er svagest",
              svar: "Når et stof koger, går molekylerne fra hinanden. Molekylerne selv er hele." }
        ]
    };

    /* ----- Fane 3: Hvem koger først? ---------------------------------------------
       En blanding: stofferne og starttemperaturen, hvor de alle er vaesker.
       Kammeret varmer op til midt mellem de to laveste kogepunkter. */
    D.SPIL_NIVEAUER = [
        { navn: "Kædelængde", hint: "Tæl C-atomerne i hvert molekyle. Hvilke molekyler rører hinanden mindst?" },
        { navn: "Formen", hint: "Alle stofferne har formlen C₅H₁₂. Hvilket molekyle er mest kugleformet?" },
        { navn: "Begge dele", hint: "Tæl C-atomerne først. Formen tæller kun, når molekylerne har lige mange C-atomer." }
    ];

    D.BLANDINGER = [
        { niveau: 0, stoffer: ["metan", "ethan"], start: -175 },
        { niveau: 0, stoffer: ["propan", "octan"], start: -52 },
        { niveau: 0, stoffer: ["butan", "hexan"], start: -15 },
        { niveau: 0, stoffer: ["hexan", "decan"], start: 55 },
        { niveau: 0, stoffer: ["ethan", "butan", "pentan"], start: -100 },
        { niveau: 0, stoffer: ["pentan", "octan", "decan"], start: 20 },
        { niveau: 1, stoffer: ["pentan", "dimethylpropan"], start: -5 },
        { niveau: 1, stoffer: ["pentan", "methylbutan"], start: 15 },
        { niveau: 1, stoffer: ["methylbutan", "dimethylpropan"], start: -5 },
        { niveau: 1, stoffer: ["pentan", "methylbutan", "dimethylpropan"], start: -5 },
        { niveau: 2, stoffer: ["butan", "dimethylpropan"], start: -12 },
        { niveau: 2, stoffer: ["butan", "methylbutan"], start: -15 },
        { niveau: 2, stoffer: ["dimethylpropan", "hexan"], start: -5 },
        { niveau: 2, stoffer: ["propan", "methylbutan"], start: -55 },
        { niveau: 2, stoffer: ["butan", "methylbutan", "dimethylpropan"], start: -12 },
        { niveau: 2, stoffer: ["methylbutan", "hexan"], start: 15 }
    ].map(function (b, i) {
        b.nr = i;
        b.st = b.stoffer.map(D.stof);
        var kp = b.st.map(function (s) { return s.kp; }).sort(function (x, y) { return x - y; });
        b.foerst = b.st.filter(function (s) { return s.kp === kp[0]; })[0];
        b.maal = (kp[0] + kp[1]) / 2;
        return b;
    });

    D.RUNDE = [3, 3, 3];                  /* blandinger pr. niveau i en runde */
    D.SPIL_FARVER = ["#e8c547", "#4fc3b0", "#e0719b"];
    D.OPVARMNING = 16;                    /* °C pr. sekund, naar kammeret varmer op */

    /* Forklaringen efter et svar: hvorfor det rigtige stof koger foer det
       valgte (eller foer de andre, naar svaret var rigtigt). */
    D.hvorfor = function (rigtig, anden) {
        if (rigtig.nC === anden.nC) {
            return "Stofferne har samme formel, og det mest forgrenede molekyle rører sine naboer mindst.";
        }
        if (rigtig.nC < anden.nC && anden.grene > rigtig.grene) {
            return "Flere C-atomer løfter kogepunktet mere, end grenene sænker det.";
        }
        if (rigtig.grene > anden.grene) {
            return rigtig.Navn + " har en kortere og mere forgrenet kæde, så molekylerne rører hinanden mindst.";
        }
        return "Den korte kæde rører sine naboer mindst.";
    };

    /* ----- Kemichael -------------------------------------------------------------
       Praesentationen (../kemichael/praesentation.js): ét trin ad gangen,
       og eleven trykker Naeste. Hvert trin er to til fire hele saetninger i
       Kemibogens sprog: hvad fanen traener, og hvordan tingene bruges. sel:
       det, han peger paa, og som faar en gul ramme, der blinker (CSS-
       selectorer; felterne paa laerredet er de usynlige .anker fra
       rundvisningen). Ingen vittigheder i praesentationen. */
    D.INTRO_VARM = [
        { tekst: "I denne fane undersøger du, hvordan kogepunktet for en alkan afhænger af kædens længde. Du trækker et glas fra hylden ned i kammeret. Ballonen på glasset fanger gassen, når stoffet koger.",
          sel: ["#varm-anker-hylde", "#varm-anker-kammer"] },
        { tekst: "Du varmer kammeret op eller køler det ned ved at trække i håndtaget på termometeret. Vinduet i midten viser molekylerne i glasset helt tæt på. Kuglerne er grå i et fast stof, orange i en væske og blå i en gas.",
          sel: ["#varm-anker-termometer", "#varm-anker-zoom"] },
        { tekst: "Papirkortet øverst i scenen giver dig ét mål ad gangen, og der er fire mål i alt. Du trykker Indsend svar, når målet er nået, og den gule knap giver et hint og derefter svaret. Kurven i panelet viser de kogepunkter, du har fundet.",
          sel: ["#varm-skort", "#varm-kurve-kort"] }
    ];
    D.INTRO_FORM = [
        { tekst: "I denne fane undersøger du, om molekylernes form påvirker kogepunktet. De tre glas i vandbadet indeholder pentan, 2-methylbutan og 2,2-dimethylpropan, som alle har formlen C₅H₁₂. Vinduet over hvert glas viser molekylerne i glasset.",
          sel: ["#form-anker-bad", "#form-anker-zoom"] },
        { tekst: "Først gætter du på papirkortet, hvilken ballon der fyldes først, og trykker Indsend svar. Du kan også vælge et glas ved at klikke på det. Derefter varmer du vandbadet op ved at trække i håndtaget på termometeret.",
          sel: ["#form-skort", "#form-anker-termometer"] },
        { tekst: "Når alle tre stoffer har kogt, spørger papirkortet, hvorfor ét af stofferne koger før de to andre. Den gule knap på kortet giver et hint og derefter svaret. Kogepunkterne kommer på listen i panelet, og knappen under listen viser, hvor molekylerne rører hinanden.",
          sel: ["#form-skort", "#form-tabel-kort"] }
    ];
    D.INTRO_SPIL = [
        { tekst: "I denne fane gætter du, hvilket stof i en blanding der koger først. Glasset i kammeret indeholder en blanding af to eller tre alkaner. Vinduet viser molekylerne af hvert stof i sin egen farve.",
          sel: ["#spil-anker-kammer", "#spil-anker-zoom"] },
        { tekst: "Du vælger et svar på papirkortet eller klikker på et af molekylerne og trykker Indsend svar. Derefter varmer kammeret selv op, til det første stof er kogt væk. Papirkortet forklarer bagefter, hvorfor netop det stof kogte først.",
          sel: "#spil-skort" },
        { tekst: "Den gule knap på papirkortet giver et hint og derefter svaret, men du får ikke point for et svar, du har set. En runde består af ni blandinger fra tre niveauer. Kortet Runden i panelet tæller dine rigtige svar og husker din rekord.",
          sel: ["#spil-skort", "#spil-runde"] }
    ];

    /* Ros, naar en hel fane er klaret. Det er sammen med taendstikken de
       eneste gange, han kommer ind af sig selv (brugerens regel 4. nov.
       2026). Fane 1: alle fire maal. Fane 2: hvorfor er besvaret (kun
       foerste gang i browseren). Fane 3: runden er slut. */
    D.MAAL_FAERDIG = "Du har nået alle fire mål, og stearinlyset har overlevet.";
    D.FORM_FAERDIG = "Du har kogt forklaringen ned til molekylernes form.";
    D.RUNDE_REPLIK = [
        [0, "Runden kogte over. Der er heldigvis flere blandinger på lageret."],
        [4, "Runden gik ikke dårligt, men et par af svarene fordampede."],
        [7, "Runden gik flot. Du holder hovedet koldt, selv når kammeret er varmt."],
        [9, "Du har ni rigtige ud af ni. Jeg er næsten målløs."]
    ];
    D.REKORD_REPLIK = "Du har sat en ny rekord. Jeg skriver rekorden ned et sted.";

    /* Paaskeaegget: taendstikken i ballonen, foerste gang og de naeste gange */
    D.BRAND = "Ballonen var fuld af gas, og gas brænder.";
    D.BRAND_IGEN = [
        "Ballonen brændte igen. Ballonerne er talte.",
        "En ballon med gas er ikke et stearinlys.",
        "Jeg har flere balloner, men jeg har ikke uendeligt mange."
    ];
    D.NY_BALLON = "Den nye ballon er ikke til fødselsdage.";
    D.TOM_BALLON = "Ballonen er tom. Stoffet er lukket inde i glasset.";

    NK.Data = D;
}());
