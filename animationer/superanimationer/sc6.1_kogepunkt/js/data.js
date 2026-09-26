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
        { slags: "gaet", tekst: "Gæt, hvor {navn} koger. Træk ? på kurven, og mål så.",
          hint: "{Navn} har to C-atomer mere end {ned}. Følg kurven fra de korte kæder.",
          efter: "" },
        { slags: "koge", id: "icosan", tekst: "Kog icosan, C₂₀H₄₂. Det findes i stearinlys.",
          hint: "Icosan står yderst til højre på hylden. Det skal helt op over 300 °C.",
          efter: "Icosan koger først ved 343 °C. Lange kæder holder godt fast i hinanden." }
    ];

    /* Gaettet paa fane 1 er godt, naar det er saa taet paa */
    D.GAET_GODT = 25;

    /* ----- Fane 2: Formen --------------------------------------------------------- */
    D.FORM_SPM = "Hvilken ballon fyldes først?";
    D.FORM_HINT = "Alle tre har formlen C₅H₁₂. Det er kun formen, der er forskellig.";
    D.FORM_VARM_HINT = "Træk termometeret op over 36 °C. Så koger alle tre.";

    D.HVORFOR = {
        spm: "Hvorfor koger 2,2-dimethylpropan først?",
        hint: "Samme atomer og samme masse. Se på formen: hvor meget kan molekylerne røre hinanden?",
        valg: [
            { t: "Molekylerne rører hinanden mindst", rigtig: true,
              svar: "Et kugleformet molekyle har mindst berøringsflade. Derfor tiltrækker molekylerne hinanden svagest." },
            { t: "Det har færrest atomer",
              svar: "Alle tre er C₅H₁₂. De har præcis de samme atomer." },
            { t: "Det er lettest",
              svar: "Samme formel giver samme masse. Alle tre har M = 72,15 g/mol." },
            { t: "Bindingerne inde i molekylet er svagest",
              svar: "Når et stof koger, går molekylerne fra hinanden. Molekylerne selv er hele." }
        ]
    };

    /* ----- Fane 3: Hvem koger først? ---------------------------------------------
       En blanding: stofferne og starttemperaturen, hvor de alle er vaesker.
       Kammeret varmer op til midt mellem de to laveste kogepunkter. */
    D.SPIL_NIVEAUER = [
        { navn: "Kædelængde", hint: "Tæl C-atomerne i hvert molekyle. Hvilke molekyler rører hinanden mindst?" },
        { navn: "Formen", hint: "Alle har formlen C₅H₁₂. Hvilket molekyle er mest kugleformet?" },
        { navn: "Begge dele", hint: "Tæl C-atomerne først. Formen afgør det kun, når antallet er det samme." }
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
            return "Samme formel. Det mest forgrenede molekyle rører sine naboer mindst.";
        }
        if (rigtig.nC < anden.nC && anden.grene > rigtig.grene) {
            return "Flere C-atomer løfter kogepunktet mere, end grenene sænker det.";
        }
        if (rigtig.grene > anden.grene) {
            return "Den er både kortere og mere forgrenet. Molekylerne rører hinanden mindst.";
        }
        return "Den korte kæde rører sine naboer mindst.";
    };

    /* ----- Kemichael ------------------------------------------------------------- */
    D.INTRO_VARM = [
        "Her varmer vi alkaner op. De står på hylden.",
        "Træk i termometeret. Ballonen fanger gassen.",
        "Tændstikkerne er til stearinlyset. Kun til det."
    ];
    D.INTRO_FORM = [
        "Tre stoffer med samme formel, C₅H₁₂.",
        "Gæt, hvilken ballon der fyldes først.",
        "Vandbadet er bare vand. Det drikker vi ikke."
    ];
    D.INTRO_SPIL = [
        "Blandinger. Hvem koger først?",
        "Du gætter. Kammeret varmer op og viser svaret."
    ];

    D.MAAL_FAERDIG = "Fire mål. Stearinlyset overlevede.";
    D.FORM_FAERDIG = "Det kogte du godt ned.";
    D.RUNDE_REPLIK = [
        [0, "Det kogte over. En runde til?"],
        [4, "Ikke dårligt. Et par fordampede."],
        [7, "Flot. Du holder hovedet koldt."],
        [9, "Ni af ni. Jeg er målløs. Næsten."]
    ];
    D.REKORD_REPLIK = "Ny rekord. Den skriver jeg ned. Et sted.";

    /* Taendstikken i ballonen: foerste gang og de naeste gange */
    D.BRAND = "Ballonen var fuld af gas. Gas brænder.";
    D.BRAND_IGEN = [
        "Igen. Ballonerne er talte.",
        "Det er ikke et stearinlys.",
        "Jeg har flere balloner. Ikke uendeligt mange."
    ];
    D.NY_BALLON = "Ny ballon. Den her er ikke til fødselsdage.";
    D.TOM_BALLON = "Ballonen er tom. Stoffet er lukket inde i glasset.";

    NK.Data = D;
}());
