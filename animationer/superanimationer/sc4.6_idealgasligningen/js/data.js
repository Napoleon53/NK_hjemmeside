/* =====================================================================
   data.js - konstanterne, opgaverne og Kemichaels replikker

   Alt, der kan staa som data, staar her. Svarene regnes af modellen i
   js/gas.js; intet facit er skrevet i haanden. Enhederne er dem fra
   kompendiet til Basiskemi C: tryk i bar, volumen i L, temperatur i K
   og R = 0,0831 L·bar/(mol·K).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Konstanterne -------------------------------------------------------
       R = 8,3145 J/(mol·K) = 0,083145 L·bar/(mol·K) (Databogen), skrevet med
       tre betydende cifre som i kompendiet. Lufttrykket er 1,013 bar. */
    D.R = 0.0831;
    D.R_TEKST = "0,0831 L·bar/(mol·K)";
    D.P_LUFT = 1.013;
    D.KELVIN = 273;

    /* ======================================================================
       FANE 1: STEMPLET
       Cylinderen tager hoejst V_MAKS liter; saa staar stemplet mod stoppet.
       PR_MOL er antallet af molekyler, der tegnes pr. mol (1 figur er
       ikke 1 molekyle).
       ====================================================================== */
    D.STEMPEL = {
        V_MAKS: 60,
        T_MIN: 150, T_MAKS: 500, T_KNAP: 25,
        N_MIN: 0.25, N_MAKS: 2.0, N_TRIN: 0.25,
        LOD: 1.0, LOD_MAKS: 3,
        PR_MOL: 40
    };

    /* Forudsigelserne. start: gassen, naar opgaven begynder (V kun ved et
       laast stempel). handling: det, eleven skal goere, efter at have
       valgt: varm (mindst 30 K op), lod (et lod paa), dobbeltN (dobbelt
       saa meget gas), udN (0,25 mol ud), maal (gassen stillet som i
       start.maal) eller null (spoergsmaalet besvares uden forsoeg).
       maal: det, der maales (V eller p). forventet: retningen eller
       forholdet, modellen skal give. krav: stemplet skal vaere laast
       eller frit, mens eleven proever. Et forkert valg har sin egen
       forklaring (svar), hvis resultatet ikke siger nok alene. */
    D.FORUDSIG = [
        { id: "varme", navn: "Varmere gas",
          start: { n: 1, T: 293, lodder: 0, laast: false },
          spm: "Stemplet glider frit. Hvad sker der med volumen, når gassen bliver varmere?",
          valg: [
              { t: "Volumen bliver større", ok: true },
              { t: "Volumen bliver mindre" },
              { t: "Volumen er det samme" }
          ],
          handling: "varm", maal: "V", forventet: { retning: 1 }, krav: { laast: false },
          proev: "Prøv det: skru op for temperaturen.",
          hint: "Se på molekylerne, når det bliver varmere. Skubber de hårdere eller svagere på stemplet?",
          proevHint: "Træk skyderen Temperatur mod højre, eller tryk på den røde knap på varmepladen.",
          hvorfor: "Molekylerne fik mere fart og skubbede stemplet op, til trykket inde igen var det samme som udefra." },

        { id: "lod", navn: "Et lod på",
          start: { n: 1, T: 293, lodder: 0, laast: false },
          spm: "Du lægger et lod på. Trykket udefra stiger fra 1,013 bar til 2,013 bar, næsten det dobbelte. Hvad sker der med volumen?",
          valg: [
              { t: "Det bliver næsten halvt så stort", ok: true },
              { t: "Det bliver næsten dobbelt så stort" },
              { t: "Det falder, men kun lidt" },
              { t: "Det er det samme" }
          ],
          handling: "lod", maal: "V", forventet: { forhold: 0.5 }, krav: { laast: false },
          proev: "Prøv det: læg et lod på stemplet.",
          hint: "Gassen skal skubbe dobbelt så hårdt igen. Så skal molekylerne ramme stemplet dobbelt så tit.",
          proevHint: "Træk et lod fra hylden op på stemplet, eller tryk + ved Lodder.",
          hvorfor: "Ved samme n og T er p og V omvendt proportionale: dobbelt tryk giver halvt volumen." },

        { id: "dobbelt", navn: "Dobbelt så meget gas",
          start: { n: 0.5, T: 293, lodder: 0, laast: false },
          spm: "Du fordobler stofmængden fra 0,50 mol til 1,00 mol. Temperaturen og trykket er de samme. Hvad sker der med volumen?",
          valg: [
              { t: "Det bliver dobbelt så stort", ok: true },
              { t: "Det bliver halvt så stort" },
              { t: "Det er det samme" }
          ],
          handling: "dobbeltN", maal: "V", forventet: { forhold: 2 }, krav: { laast: false },
          proev: "Prøv det: luk gas ind, til der er 1,00 mol.",
          hint: "Dobbelt så mange molekyler skal have plads ved det samme tryk.",
          proevHint: "Klik på gasflasken to gange, eller tryk + ved Gas.",
          hvorfor: "Dobbelt så mange molekyler skal have dobbelt så meget plads, hvis trykket skal være det samme." },

        { id: "laast", navn: "Låst stempel",
          start: { n: 1, T: 293, lodder: 0, laast: true },
          spm: "Stemplet er låst, så volumen ikke kan ændre sig. Hvad sker der med trykket, når gassen bliver varmere?",
          valg: [
              { t: "Trykket stiger", ok: true },
              { t: "Trykket falder" },
              { t: "Trykket er det samme" }
          ],
          handling: "varm", maal: "p", forventet: { retning: 1 }, krav: { laast: true },
          proev: "Prøv det: skru op for temperaturen. Se på manometeret.",
          hint: "Stemplet kan ikke give efter. Hvad gør molekylerne ved væggene, når de får mere fart?",
          proevHint: "Træk skyderen Temperatur mod højre, eller tryk på den røde knap på varmepladen.",
          hvorfor: "Molekylerne rammer væggene oftere og hårdere, og stemplet kan ikke give efter." },

        { id: "hvorfor", navn: "Hvorfor?",
          start: { n: 1, T: 293, lodder: 0, laast: true, V: 24.04 },
          spm: "Hvorfor stiger trykket, når gassen i den låste cylinder bliver varmere?",
          valg: [
              { t: "Molekylerne bevæger sig hurtigere og rammer væggene oftere og hårdere", ok: true },
              { t: "Molekylerne bliver større, når de bliver varme",
                svar: "Molekylerne er lige store ved alle temperaturer. Det er farten, der stiger." },
              { t: "Der dannes flere molekyler",
                svar: "Tæl dem: der er lige mange før og efter. Stofmængden er den samme." },
              { t: "Molekylerne klumper sig sammen",
                svar: "Så ville trykket falde. Varme molekyler farer rundt hver for sig." }
          ],
          handling: null, maal: "p",
          hint: "Tæl molekylerne, og se på, hvor hurtigt de bevæger sig. Skru gerne op og ned for varmen.",
          hvorfor: "Hurtige molekyler rammer væggene oftere og hårdere. Det er det, trykket er." },

        { id: "ud", navn: "Gas ud",
          start: { n: 2, T: 293, lodder: 0, laast: true, V: 24.04 },
          spm: "Stemplet er låst. Du lukker 0,25 mol gas ud. Hvad sker der med trykket?",
          valg: [
              { t: "Trykket falder", ok: true },
              { t: "Trykket stiger" },
              { t: "Trykket er det samme" }
          ],
          handling: "udN", maal: "p", forventet: { retning: -1 }, krav: { laast: true },
          proev: "Prøv det: luk 0,25 mol gas ud.",
          hint: "Færre molekyler skal ramme de samme vægge.",
          proevHint: "Klik på den røde hane ved cylinderen, eller tryk − ved Gas.",
          hvorfor: "Færre molekyler rammer de samme vægge, så trykket falder." },

        { id: "molvolumen", navn: "1 mol gas",
          start: { n: 0.5, T: 293, lodder: 2, laast: false },
          maalTilstand: { n: 1, T: 293, lodder: 0, laast: false },
          spm: "Hvor meget fylder 1,00 mol gas ved 20 °C og 1,013 bar?",
          valg: [
              { t: "Ca. 2,4 L" },
              { t: "Ca. 24 L", ok: true },
              { t: "Ca. 240 L" },
              { t: "Det afhænger af, hvilken gas det er",
                svar: "Idealgasligningen har ingen plads til, hvilken gas det er. Kun n, T og p tæller." }
          ],
          handling: "maal", maal: "V", forventet: {},
          proev: "Prøv det: sæt gassen på 1,00 mol, og tag lodderne af. Temperaturen er 293 K.",
          hint: "Mere end en sodavandsflaske, mindre end et badekar.",
          proevHint: "Tryk + ved Gas to gange, og tryk − ved Lodder, til der ikke er flere.",
          hvorfor: "Det gælder alle gasser: 1 mol fylder ca. 24 L ved stuetemperatur og 1,013 bar." }
    ];

    /* ======================================================================
       FANE 2: BEREGNINGEN
       Kendte stoerrelser: n (mol), T (K), t (°C), p (bar), V (L), VmL (mL),
       m (g) og M (g/mol). find er den, der spoerges om. Trinene foelger af
       det: er temperaturen i °C, regnes den om foerst; er massen kendt,
       regnes stofmaengden foerst; spoerges der om massen eller
       molarmassen, regnes stofmaengden foerst og saa det sidste.
       std: tallene foerste gang. tal: det, "Nye tal" traekker imellem.
       gasser (kun S3): den ukendte gas traekkes blandt dem.
       beholder: stempel (cylinderen med stempel) eller lukket (laast).
       ====================================================================== */
    D.NIVEAUER = [
        { id: "let", navn: "Let" },
        { id: "middel", navn: "Middel" },
        { id: "svaer", navn: "Svær" }
    ];

    D.REGN = [
        /* ----- Let: temperaturen staar i kelvin ----- */
        { id: "L1", niveau: "let", navn: "Gas i et stempel", find: "V", beholder: "stempel",
          std: { n: 1.50, T: 293, p: 1.013 },
          tal: { n: [0.500, 0.750, 1.20, 1.50, 2.00, 2.50], T: [273, 293, 298, 310, 350], p: [1.013, 1.50, 2.00] },
          tekst: "Der er {n} gas i en cylinder med et stempel ved {T} og {p}. Hvor stort er volumen?",
          slut: "Gassen fylder {V}." },
        { id: "L2", niveau: "let", navn: "Ballonen", find: "n", beholder: "stempel",
          std: { V: 5.00, T: 293, p: 1.013 },
          tal: { V: [2.50, 4.00, 5.00, 8.00, 12.0], T: [288, 293, 298], p: [1.013, 1.05] },
          tekst: "En ballon fylder {V} ved {T} og {p}. Hvor mange mol gas er der i ballonen?",
          slut: "Der er {n} gas i ballonen." },
        { id: "L3", niveau: "let", navn: "Flasken", find: "p", beholder: "lukket",
          std: { n: 0.500, V: 2.00, T: 293 },
          tal: { n: [0.200, 0.250, 0.400, 0.500, 0.800], V: [1.00, 1.50, 2.00, 5.00], T: [293, 298] },
          tekst: "En lukket flaske på {V} indeholder {n} gas ved {T}. Hvad er trykket i flasken?",
          slut: "Trykket i flasken er {p}." },
        { id: "L4", niveau: "let", navn: "Temperaturen", find: "T", beholder: "stempel",
          std: { n: 2.00, V: 40.0, p: 1.013 },
          tal: { n: [1.00, 1.50, 2.00], V: [30.0, 40.0, 50.0], p: [1.013, 1.20] },
          tekst: "{n} gas fylder {V} ved {p}. Hvad er temperaturen i kelvin?",
          slut: "Temperaturen er {T}." },

        /* ----- Middel: temperaturen staar i grader celsius ----- */
        { id: "M1", niveau: "middel", navn: "Vanddamp", find: "V", beholder: "stempel",
          std: { n: 2.00, t: 100, p: 1.013 },
          tal: { n: [0.500, 1.00, 2.00, 3.00], t: [100, 110, 120, 150], p: [1.013, 0.500, 2.00] },
          tekst: "Hvor meget fylder {n} vanddamp ved {t} og {p}?",
          slut: "Vanddampen fylder {V}." },
        { id: "M2", niveau: "middel", navn: "Stofmængden", find: "n", beholder: "stempel",
          std: { V: 65.8, t: 20, p: 1.013 },
          tal: { V: [10.0, 24.0, 36.5, 65.8, 80.0], t: [0, 20, 25], p: [1.013, 1.10] },
          tekst: "En gas fylder {V} ved {t} og {p}. Hvor mange mol gas er det?",
          slut: "Det er {n} gas." },
        { id: "M3", niveau: "middel", navn: "Spraydåsen", find: "p", beholder: "lukket",
          std: { n: 0.0400, V: 0.300, t: 25 },
          tal: { n: [0.0300, 0.0400, 0.0500], V: [0.250, 0.300, 0.400], t: [20, 25] },
          tekst: "En spraydåse på {V} indeholder {n} gas ved {t}. Hvad er trykket i dåsen?",
          slut: "Trykket i dåsen er {p}." },
        { id: "M4", niveau: "middel", navn: "Cykeldækket", find: "t", beholder: "lukket",
          std: { n: 0.370, V: 2.00, p: 4.50 },
          tal: { t: [5, 12, 20, 28, 35], V: [1.80, 2.00, 2.20], p: [3.50, 4.00, 4.50, 5.00] },
          tekst: "Et cykeldæk på {V} indeholder {n} luft ved {p}. Hvad er temperaturen i grader celsius?",
          slut: "Luften i dækket er {t}." },

        /* ----- Svaer: massen er kendt eller spoergsmaalet ----- */
        { id: "S1", niveau: "svaer", navn: "Ammoniak", find: "V", beholder: "stempel", stof: "NH₃",
          std: { m: 10.0, M: 17.03, t: 135, p: 0.550 },
          tal: { m: [5.00, 10.0, 15.0], t: [100, 135, 150], p: [0.550, 1.013, 2.00] },
          tekst: "Hvor stort et volumen fylder {m} ammoniak, NH₃, ved {t} og {p}? M(NH₃) = {M}.",
          slut: "Ammoniakken fylder {V}." },
        { id: "S2", niveau: "svaer", navn: "Ballon med CO₂", find: "m", beholder: "stempel", stof: "CO₂",
          std: { V: 3.00, t: 20, p: 1.013, M: 44.01 },
          tal: { V: [1.00, 2.00, 3.00, 5.00], t: [20, 25], p: [1.013] },
          tekst: "En ballon indeholder {V} carbondioxid, CO₂, ved {t} og {p}. Hvor mange gram CO₂ er der i ballonen? M(CO₂) = {M}.",
          slut: "Der er {m} CO₂ i ballonen." },
        { id: "S3", niveau: "svaer", navn: "Den ukendte gas", find: "M", beholder: "stempel",
          std: { VmL: 180, t: 20, p: 1.013, gas: "butan" },
          tal: { VmL: [150, 180, 200, 240], t: [20, 22], p: [1.013] },
          gasser: ["butan", "propan", "argon", "dinitrogen"],
          tekst: "{m} af en ukendt gas fylder {VmL} ved {t} og {p}. Hvad er gassens molarmasse?",
          slut: "Molarmassen er {M}." },
        { id: "S4", niveau: "svaer", navn: "Heliumflasken", find: "m", beholder: "lukket", stof: "He",
          std: { V: 10.0, p: 200, t: 20, M: 4.00 },
          tal: { V: [5.00, 10.0, 20.0], p: [150, 200, 300], t: [15, 20] },
          tekst: "En heliumflaske på {V} har et tryk på {p} ved {t}. Hvor mange gram helium er der i flasken? M(He) = {M}.",
          slut: "Der er {m} helium i flasken." }
    ];

    /* Gasserne, den ukendte gas i S3 kan vaere (molarmasser fra IUPAC 2021) */
    D.GASSER = {
        butan: { navn: "butan", formel: "C₄H₁₀", M: 58.12 },
        propan: { navn: "propan", formel: "C₃H₈", M: 44.10 },
        argon: { navn: "argon", formel: "Ar", M: 39.95 },
        dinitrogen: { navn: "dinitrogen", formel: "N₂", M: 28.02 }
    };

    /* Navnene paa trinene og stoerrelserne */
    D.STR = {
        p: { navn: "Trykket", sym: "p", enhed: "bar", ord: "trykket" },
        V: { navn: "Volumen", sym: "V", enhed: "L", ord: "volumen" },
        n: { navn: "Stofmængden", sym: "n", enhed: "mol", ord: "stofmængden" },
        T: { navn: "Temperaturen i kelvin", sym: "T", enhed: "K", ord: "temperaturen" },
        t: { navn: "Temperaturen i °C", sym: "t", enhed: "°C", ord: "temperaturen i °C" },
        m: { navn: "Massen", sym: "m", enhed: "g", ord: "massen" },
        M: { navn: "Molarmassen", sym: "M", enhed: "g/mol", ord: "molarmassen" },
        R: { navn: "Gaskonstanten", sym: "R", enhed: "L·bar/(mol·K)", ord: "gaskonstanten R" }
    };

    /* ======================================================================
       LINJEN I OPGAVEKORTET OG KEMICHAEL VED KATEDERET
       Kortet siger, hvor man er, naeste skridt, fejl og ros. Kemichael
       blander sig ikke: han siger kun noget, naar eleven beder om et hint
       eller svaret, naar han sendes ud eller hentes (UD_LINJE, IND_LINJE)
       eller klikkes paa (KAFFE, PRIK_SIDST). K faar ham til at sige INTRO.
       Hoejst ca. 60 tegn pr. saetning, ingen teori.
       ====================================================================== */
    D.INTRO = {
        stempel: "En gas i en cylinder. Skru på én ting ad gangen.",
        regn: "Tre af p, V, n og T er kendt. Find den fjerde."
    };

    D.FAERDIG = {
        stempel: "Alle syv. Gassen gør, hvad ligningen siger.",
        regn: "Alle tolv. Kelvin og R sidder."
    };

    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst. Pænt skrevet."];

    /* Naar han sendes ud, og naar han hentes igen */
    D.UD_LINJE = "Fint. Jeg er på lærerværelset.";
    D.IND_LINJE = "Tilbage. Kaffen derude var ikke bedre.";

    /* Klik paa koppen: han drikker og siger noget om kaffen */
    D.KAFFE = [
        "Kold. Som altid.",
        "Den er ved stuetemperatur. Desværre.",
        "Kaffen er min. Gassen er din.",
        "Nogen har fortyndet den.",
        "Stadig kold. Men det er min."
    ];
    /* Klik paa ham, naar prik-puljerne er brugt op */
    D.PRIK_SIDST = "Jeg sidder her bare. Skru du.";

    /* Korte svar i opgavekortet, naar der sker noget i scenen */
    D.SCENE = {
        stop: "Stemplet står mod stoppet. Nu stiger trykket i stedet.",
        nMaks: "Cylinderen tager højst 2,00 mol.",
        nMin: "Der skal være lidt gas i cylinderen. 0,25 mol er det mindste.",
        lodMaks: "Der er ikke flere lodder. Kaffekoppen er ikke et lod.",
        lodMin: "Der ligger ingen lodder på stemplet.",
        tMaks: "Varmepladen kan ikke blive varmere.",
        tMin: "Kølingen kan ikke blive koldere.",
        laast: "Stemplet er låst. Volumen kan ikke ændre sig.",
        frit: "Stemplet glider frit. Trykket inde er det samme som udefra.",
        lodLaast: "Stemplet er låst, så loddet trykker på låsen, ikke på gassen.",
        manometer: "Manometeret viser trykket i gassen.",
        aeg224: "22,4 L ved 0 °C og 1,013 bar. Det tal står i de gamle lærebøger."
    };

    NK.Data = D;
}());
