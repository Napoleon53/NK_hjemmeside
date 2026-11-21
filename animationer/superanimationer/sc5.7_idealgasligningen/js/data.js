/* =====================================================================
   data.js - konstanterne, opgaverne og linjerne i papirkortet

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

    /* Papirkortets plads oeverst i scenen i px: [almindelig skaerm, lav skaerm].
       Laerredet begynder tegningen under kortet (js/kort.js, zone). */
    /* Runde 3 (21. nov. 2026): pladsen er det hoejeste kort, fanen kan vise,
       maalt naar vinduet faar en ny stoerrelse (kortTilstande i sim_stempel.js
       og sim_regn.js), saa scenen ligger fast, uanset gas, lodder, beskeder og
       opgaveskift. Tallene her er kun det mindste. (Foer: stempel 178, regn 220.) */
    D.ZONE = { stempel: [150, 128], regn: [150, 128] };

    /* ======================================================================
       FANE 1: STEMPLET
       Cylinderen tager hoejst V_MAKS liter; saa staar stemplet mod stoppet.
       PR_MOL er antallet af molekyler, der tegnes pr. mol (1 figur er
       ikke 1 molekyle).
       ====================================================================== */
    D.STEMPEL = {
        V_MAKS: 60,
        T_MIN: 150, T_MAKS: 500, T_KNAP: 20,     /* 20 K pr. klik paa varmepladen (foer 25 og skyderen i panelet), saa 0 °C kan naas */
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
       forholdet, modellen skal give. tema: to-tre ord i opgaveraekken
       oeverst i scenen (runde 3, 21. nov. 2026). krav: stemplet skal vaere laast
       eller frit, mens eleven proever. Et forkert valg har sin egen
       forklaring (svar), hvis resultatet ikke siger nok alene.

       Trinvis start (brugeren 21. nov. 2026, som sb2.6): den foerste
       opgave begynder med to spoergsmaal (trin), foer forudsigelsen. I
       trin 1 er kun cylinderen fremme; et loest trin faar sin del frem
       (vis: mano = manometeret, plade = varmepladen). Trin 3 er opgaven selv. Hvert trin har tre hint og
       en kort forklaring (godt), og hvert forkert svar sin egen (svar).
       Grafen og lodderne kommer med opgave 2, gassen med opgave 3 og
       laasen med opgave 4 (VIS_FRA). */
    D.VIS_FRA = { graf: 1, hylde: 1, gas: 2, laas: 3 };

    D.FORUDSIG = [
        { id: "varme", navn: "Varmere gas", tema: "Varmere gas",
          start: { n: 1, T: 293, lodder: 0, laast: false },
          trin: [
              { vis: "mano",
                spm: "Cylinderen er fyldt med gas. Stemplet kan glide frit op og ned. Hvad holder stemplet i cylinderen oppe?",
                valg: [
                    { t: "Molekylernes stød", ok: true },
                    { t: "Luften over stemplet",
                      svar: "Luften over stemplet trykker stemplet ned, ikke op. Det, der skubber op, er under stemplet." },
                    { t: "Det svæver af sig selv",
                      svar: "Stemplet vejer noget. Uden gassen nedenunder ville stemplet falde ned til bunden." }
                ],
                hint: [
                    "Se på molekylerne lige under stemplet. Hvad gør de, når de rammer det?",
                    "Luften over stemplet og stemplets vægt trykker stemplet ned. Noget skal skubbe lige så meget op.",
                    "Molekylerne støder mod stemplet nedefra og skubber det op."
                ],
                godt: "Molekylerne støder mod stemplet nedefra. Gassens tryk holder stemplet oppe mod luftens tryk og stemplets vægt. Manometeret viser trykket i gassen." },
              { vis: "plade",
                spm: "Varmepladen under cylinderen kan gøre gassen varmere. Hvad sker der med molekylernes fart, når gassen bliver varmere?",
                valg: [
                    { t: "Farten bliver større", ok: true },
                    { t: "Farten bliver mindre",
                      svar: "Det er omvendt. Molekylerne i en varm gas farer hurtigere rundt end i en kold gas." },
                    { t: "Farten er den samme",
                      svar: "Temperaturen hænger sammen med molekylernes fart. Jo varmere gassen er, jo hurtigere farer de." }
                ],
                hint: [
                    "Temperaturen siger noget om, hvordan molekylerne bevæger sig.",
                    "En duft spreder sig hurtigere i et varmt rum end i et koldt rum.",
                    "Molekylerne i en varm gas bevæger sig hurtigere end i en kold gas."
                ],
                godt: "Jo varmere gassen er, jo hurtigere farer molekylerne. Varmepladen er kommet frem. Dens knap + varmer gassen, og − køler den." }
          ],
          spm: "Stemplet glider frit. Hvad sker der med volumenet, når gassen under det frie stempel bliver varmere?",
          valg: [
              { t: "Volumenet bliver større", ok: true },
              { t: "Volumenet bliver mindre" },
              { t: "Volumenet er det samme" }
          ],
          handling: "varm", maal: "V", forventet: { retning: 1 }, krav: { laast: false },
          proev: "Prøv det: Skru op for temperaturen.",
          hint: "Se på molekylerne, når det bliver varmere. Skubber de hårdere eller svagere på stemplet?",
          proevHint: "Tryk to gange på den røde knap + på varmepladen.",
          hvorfor: "Molekylerne fik mere fart og skubbede stemplet op, til trykket inde igen var det samme som udefra." },

        { id: "lod", navn: "Et lod på", tema: "Et lod på",
          start: { n: 1, T: 293, lodder: 0, laast: false },
          spm: "Du lægger et lod på stemplet. Trykket udefra stiger fra 1,013 bar til 2,013 bar. Hvad sker der med volumenet, når trykket udefra bliver næsten dobbelt så stort?",
          valg: [
              { t: "Det bliver næsten halvt så stort", ok: true },
              { t: "Det bliver næsten dobbelt så stort" },
              { t: "Det falder, men kun lidt" },
              { t: "Det er det samme" }
          ],
          handling: "lod", maal: "V", forventet: { forhold: 0.5 }, krav: { laast: false },
          proev: "Prøv det: Læg et lod på stemplet.",
          hint: "Gassen skal skubbe dobbelt så hårdt tilbage, og derfor skal molekylerne ramme stemplet dobbelt så ofte.",
          proevHint: "Klik på et lod på hylden, eller træk det op på stemplet.",
          hvorfor: "Ved samme n og T er p og V omvendt proportionale, så dobbelt tryk giver halvt volumen." },

        { id: "dobbelt", navn: "Dobbelt så meget gas", tema: "Mere gas",
          start: { n: 0.5, T: 293, lodder: 0, laast: false },
          spm: "Du lukker gas ind, fra 0,50 mol til 1,00 mol. Temperatur og tryk er de samme. Hvad sker der med volumenet, når stofmængden af gassen bliver dobbelt så stor?",
          valg: [
              { t: "Det bliver dobbelt så stort", ok: true },
              { t: "Det bliver halvt så stort" },
              { t: "Det er det samme" }
          ],
          handling: "dobbeltN", maal: "V", forventet: { forhold: 2 }, krav: { laast: false },
          proev: "Prøv det: Luk gas ind, til der er 1,00 mol.",
          hint: "Dobbelt så mange molekyler skal have plads ved det samme tryk.",
          proevHint: "Klik to gange på gasflasken. Hvert klik lukker 0,25 mol gas ind.",
          hvorfor: "Dobbelt så mange molekyler skal have dobbelt så meget plads, hvis trykket skal være det samme." },

        { id: "laast", navn: "Låst stempel", tema: "Låst stempel",
          start: { n: 1, T: 293, lodder: 0, laast: true },
          spm: "Stemplet er låst, så volumenet ikke kan ændre sig. Hvad sker der med trykket i den låste cylinder, når gassen bliver varmere?",
          valg: [
              { t: "Trykket stiger", ok: true },
              { t: "Trykket falder" },
              { t: "Trykket er det samme" }
          ],
          handling: "varm", maal: "p", forventet: { retning: 1 }, krav: { laast: true },
          proev: "Prøv det: Skru op for temperaturen. Se på manometeret.",
          hint: "Stemplet kan ikke give efter. Hvad gør molekylerne ved væggene, når de får mere fart?",
          proevHint: "Tryk to gange på den røde knap + på varmepladen.",
          hvorfor: "Molekylerne rammer væggene oftere og hårdere, og stemplet kan ikke give efter." },

        { id: "hvorfor", navn: "Hvorfor?", tema: "Hvorfor trykket stiger",
          start: { n: 1, T: 293, lodder: 0, laast: true, V: 24.04 },
          spm: "Hvorfor stiger trykket, når gassen i den låste cylinder bliver varmere?",
          valg: [
              { t: "Molekylerne får mere fart", ok: true },
              { t: "Molekylerne bliver større",
                svar: "Molekylerne er lige store ved alle temperaturer. Det er farten, der stiger." },
              { t: "Der dannes flere molekyler",
                svar: "Tæl molekylerne. Der er lige mange før og efter, så stofmængden er den samme." },
              { t: "Molekylerne klumper sig",
                svar: "Hvis molekylerne klumpede sig, ville trykket falde. Varme molekyler farer rundt hver for sig." }
          ],
          handling: null, maal: "p",
          hint: "Tæl molekylerne, og se på, hvor hurtigt de bevæger sig. Skru gerne op og ned for varmen.",
          hvorfor: "Hurtige molekyler rammer væggene oftere og hårdere, og trykket er netop molekylernes stød mod væggene." },

        { id: "ud", navn: "Gas ud", tema: "Gas ud",
          start: { n: 2, T: 293, lodder: 0, laast: true, V: 24.04 },
          spm: "Stemplet er låst. Hvad sker der med trykket i den låste cylinder, når du lukker 0,25 mol gas ud?",
          valg: [
              { t: "Trykket falder", ok: true },
              { t: "Trykket stiger" },
              { t: "Trykket er det samme" }
          ],
          handling: "udN", maal: "p", forventet: { retning: -1 }, krav: { laast: true },
          proev: "Prøv det: Luk 0,25 mol gas ud.",
          hint: "Færre molekyler skal ramme de samme vægge.",
          proevHint: "Klik på den røde hane ved cylinderen.",
          hvorfor: "Færre molekyler rammer de samme vægge, så trykket falder." },

        { id: "molvolumen", navn: "1 mol gas", tema: "Et mol gas",
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
          proev: "Prøv det: Sæt gassen på 1,00 mol, og tag lodderne af. Temperaturen er 293 K.",
          hint: "Mere end en sodavandsflaske, mindre end et badekar.",
          proevHint: "Klik to gange på gasflasken, og klik på lodderne på stemplet, til der ikke er flere.",
          hvorfor: "1 mol af enhver gas fylder ca. 24 L ved stuetemperatur og 1,013 bar." }
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
          tekst: "Gassen er i en cylinder med et stempel. Hvor stort er volumenet af {n} gas ved {T} og {p}?",
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
          tekst: "Hvad er temperaturen i kelvin, når {n} gas fylder {V} ved {p}?",
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
          tekst: "Hvor mange mol gas fylder {V} ved {t} og {p}?",
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
          tekst: "Gassen er ammoniak, NH₃. M(NH₃) = {M}. Hvor stort er volumenet af {m} NH₃ ved {t} og {p}?",
          slut: "Ammoniakken fylder {V}." },
        { id: "S2", niveau: "svaer", navn: "Ballon med CO₂", find: "m", beholder: "stempel", stof: "CO₂",
          std: { V: 3.00, t: 20, p: 1.013, M: 44.01 },
          tal: { V: [1.00, 2.00, 3.00, 5.00], t: [20, 25], p: [1.013] },
          tekst: "En ballon indeholder {V} carbondioxid, CO₂, ved {t} og {p}. M(CO₂) = {M}. Hvor mange gram CO₂ er der i ballonen?",
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
          tekst: "En heliumflaske på {V} har et tryk på {p} ved {t}. M(He) = {M}. Hvor mange gram helium er der i flasken?",
          slut: "Der er {m} helium i flasken." }
    ];

    /* Formlen vaelges paa kortet (brugeren 21. nov. 2026, som sc6.2: svarene
       staar i kortet, aldrig i panelet). For hvert trin med en formel (rel:x)
       den rigtige og to typiske fejl, hver med sin egen forklaring (f), og en
       kort forklaring til den rigtige (godt). Den rigtige staar ikke altid
       samme sted. */
    D.FORMELVALG = {
        "gas:V": { svar: [
            { t: "V = n · R · T / p", ok: true },
            { t: "V = p · R · T / n", f: "p og n er byttet om. Mere gas fylder mere, så n skal stå over brøkstregen." },
            { t: "V = n · R / (p · T)", f: "T skal stå over brøkstregen. En varmere gas fylder mere." }
        ], godt: "Del begge sider af p · V = n · R · T med p." },
        "gas:n": { svar: [
            { t: "n = R · T / (p · V)", f: "Brøken er vendt om. p og V skal stå over brøkstregen." },
            { t: "n = p · V / (R · T)", ok: true },
            { t: "n = p · V · R · T", f: "R og T skal stå under brøkstregen. Del p · V med R · T." }
        ], godt: "Del begge sider af p · V = n · R · T med R · T." },
        "gas:p": { svar: [
            { t: "p = V · R · T / n", f: "V og n er byttet om. Mere gas i samme volumen giver et højere tryk, så n skal stå over brøkstregen." },
            { t: "p = n · R · T · V", f: "V skal stå under brøkstregen. Del n · R · T med V." },
            { t: "p = n · R · T / V", ok: true }
        ], godt: "Del begge sider af p · V = n · R · T med V." },
        "gas:T": { svar: [
            { t: "T = p · V / (n · R)", ok: true },
            { t: "T = n · R / (p · V)", f: "Brøken er vendt om. p og V skal stå over brøkstregen." },
            { t: "T = p · V / R", f: "n mangler. Del p · V med både n og R." }
        ], godt: "Del begge sider af p · V = n · R · T med n · R." },
        "nmM:n": { svar: [
            { t: "n = m · M", f: "Massen skal deles med molarmassen, ikke ganges." },
            { t: "n = m / M", ok: true },
            { t: "n = M / m", f: "Brøken er vendt om. Massen skal stå over brøkstregen." }
        ], godt: "Stofmængden er massen delt med molarmassen." },
        "nmM:m": { svar: [
            { t: "m = n · M", ok: true },
            { t: "m = n / M", f: "Stofmængden skal ganges med molarmassen, ikke deles." },
            { t: "m = M / n", f: "Massen er stofmængden gange molarmassen. Der skal ikke deles." }
        ], godt: "Massen er stofmængden gange molarmassen." },
        "nmM:M": { svar: [
            { t: "M = n / m", f: "Brøken er vendt om. Massen skal stå over brøkstregen." },
            { t: "M = m · n", f: "Massen skal deles med stofmængden, ikke ganges." },
            { t: "M = m / n", ok: true }
        ], godt: "Molarmassen er massen delt med stofmængden." }
    };

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
        V: { navn: "Volumen", sym: "V", enhed: "L", ord: "volumenet" },
        n: { navn: "Stofmængden", sym: "n", enhed: "mol", ord: "stofmængden" },
        T: { navn: "Temperaturen i kelvin", sym: "T", enhed: "K", ord: "temperaturen" },
        t: { navn: "Temperaturen i °C", sym: "t", enhed: "°C", ord: "temperaturen i °C" },
        m: { navn: "Massen", sym: "m", enhed: "g", ord: "massen" },
        M: { navn: "Molarmassen", sym: "M", enhed: "g/mol", ord: "molarmassen" },
        R: { navn: "Gaskonstanten", sym: "R", enhed: "L·bar/(mol·K)", ord: "gaskonstanten R" }
    };

    /* ======================================================================
       LINJEN I OPGAVEKORTET
       Kortet siger, hvor man er (INTRO), naeste skridt, fejl og ros, og
       hintet eller svaret, naar eleven beder om det.
       Hoejst ca. 60 tegn pr. saetning, ingen teori.
       ====================================================================== */
    D.INTRO = {
        stempel: "En gas i en cylinder. Skru på én ting ad gangen.",
        regn: "Tre af p, V, n og T er kendt. Find den fjerde."
    };

    D.FAERDIG = {
        stempel: "Alle syv opgaver er løst. Gassen gør, hvad ligningen siger.",
        regn: "Alle tolv opgaver er løst. Kelvin og R sidder."
    };

    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst. Pænt skrevet."];

    /* Korte svar i papirkortet, naar der sker noget i scenen */
    D.SCENE = {
        stop: "Stemplet står mod stoppet. Nu stiger trykket i stedet.",
        nMaks: "Cylinderen tager højst 2,00 mol.",
        nMin: "Der skal være lidt gas i cylinderen. 0,25 mol er det mindste.",
        lodMaks: "Der er ikke flere lodder.",
        lodMin: "Der ligger ingen lodder på stemplet.",
        tMaks: "Varmepladen kan ikke blive varmere.",
        tMin: "Kølingen kan ikke blive koldere.",
        laast: "Stemplet er låst. Volumenet kan ikke ændre sig.",
        frit: "Stemplet glider frit. Trykket inde er det samme som udefra.",
        lodLaast: "Stemplet er låst, så loddet trykker på låsen, ikke på gassen.",
        manometer: "Manometeret viser trykket i gassen.",
        aeg224: "1 mol gas fylder 22,4 L ved 0 °C og 1,013 bar. Det tal står i de gamle lærebøger."
    };

    NK.Data = D;
}());
