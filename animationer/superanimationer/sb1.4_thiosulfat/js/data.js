/* =====================================================================
   data.js - tekster, blandinger og opgaver

   Alt, der er tekst eller tal, og som man kan rette uden at roere
   tegningen: Kemichaels praesentation, blandingerne paa fane 1 og 3
   og opgaverne paa alle tre faner.

   Et opgaveobjekt (samme form som i sb1.1) har
     tekst    spoergsmaalet
     valg     [{ tekst, rigtig, forklaring }] - de forkerte er de fejl,
              elever faktisk laver, og forklaringen svarer paa fejlen
     hint     et hint til netop denne opgave
     opsaet   hvordan scenen stilles op, mens opgaven staar (her null)
   Tallene i opgaverne regnes af modellen, saa de passer med det, eleven
   kan maale.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;
    var D = {};

    /* ----- Kemichael ----------------------------------------------------
       Tre replikker pr. fane, hoejst ca. 60 tegn. Under linjen INTRO_PEG
       peger han paa elementet i PEG, og det lyser op. */
    D.INTRO = {
        kryds: [
            "Et kryds, et glas og et stopur. Mere skal der ikke til.",
            "Tilsæt syren herovre, og stop uret, når krydset er væk.",
            "Det lugter af SO₂ bagefter. Det er ikke mig."
        ],
        konc: [
            "Nu bestemmer du blandingen. Uret stopper selv.",
            "Vælg rumfangene herovre, og tryk Bland og mål.",
            "Regn koncentrationerne ud. Grafen venter på dig."
        ],
        temp: [
            "Samme blanding hver gang. Kun temperaturen skifter.",
            "Vælg temperaturen herovre, og mål.",
            "Min kaffe har også stuetemperatur. Desværre."
        ]
    };
    D.INTRO_PEG = 1;
    D.PEG = { kryds: "kryds-maaling", konc: "konc-forsoeg", temp: "temp-forsoeg" };

    /* ----- Fane 1: tre blandinger. Syren er altid 5 mL 1,0 M HCl, og
       der er vand til 45 mL i glasset, saa der er 50 mL i alt. -------- */
    D.SYRE_ML = 5;
    D.GLAS_ML = 45;
    D.KRYDS_BLANDINGER = [40, 30, 20];
    D.MAKS_KRYDS = 5;          /* maalinger, der bliver staaende */

    /* ----- Fane 2 og 3 --------------------------------------------------- */
    D.MAKS_FORSOEG = 8;        /* raekker i tabellen */
    D.TRIN_ML = 5;
    D.MAKS_ML = 50;
    D.KONC_START = { thio: 20, syre: 5, vand: 25 };
    D.TEMP_BLANDING = { thio: 20, syre: 5, vand: 25 };
    D.TEMP_MIN = 5;
    D.TEMP_MAKS = 60;
    D.TEMP_TRIN = 5;

    function s(v) { return NK.tal(v, v < 10 ? 1 : 0) + " s"; }
    function sek(v) { return Math.round(v) + " s"; }
    function molaer(v) { return NK.bet(v, 2) + " M"; }
    function dt(vThio, vSyre, vVand, T) { return M.tidTilKryds(vThio, vSyre, vVand, T); }

    /* ================================================================
       FANE 1: KRYDSET
       ================================================================ */
    D.KRYDS_OPGAVER = [
        {
            id: "hvorfor",
            lav: function () {
                return {
                    tekst: "Hvorfor forsvinder krydset?",
                    valg: [
                        { tekst: "Der dannes svovl, som gør væsken uklar", rigtig: true,
                          forklaring: "Svovl er et fast stof. De små korn spreder lyset, så man ikke kan se gennem væsken." },
                        { tekst: "Der dannes SO₂, som farver væsken", rigtig: false,
                          forklaring: "SO₂ er farveløs. Den kan lugtes, men ikke ses." },
                        { tekst: "Syren opløser krydset", rigtig: false,
                          forklaring: "Krydset sidder på papiret under glasset. Det er væsken, der bliver uklar." },
                        { tekst: "Thiosulfatet bliver brugt op", rigtig: false,
                          forklaring: "Thiosulfat er farveløst og skjuler ikke noget. Det er svovlet, der gør." }
                    ],
                    hint: "Se på reaktionsskemaet. Hvilket stof er et fast stof (s)?",
                    opsaet: null
                };
            }
        },
        {
            id: "samme",
            lav: function () {
                return {
                    tekst: "Hvad er det samme, hver gang krydset forsvinder?",
                    valg: [
                        { tekst: "Mængden af dannet svovl", rigtig: true,
                          forklaring: "Der skal lige meget svovl til at skjule krydset. Alle kurverne når den stiplede streg." },
                        { tekst: "Tiden", rigtig: false,
                          forklaring: "Tiden er netop det, der er forskelligt. Det er den, du måler." },
                        { tekst: "Alt thiosulfat er brugt", rigtig: false,
                          forklaring: "Kun omkring 1 % er brugt. Reaktionen fortsætter længe efter." },
                        { tekst: "Hastigheden", rigtig: false,
                          forklaring: "Hastigheden er forskellig. Det er derfor, tiderne er forskellige." }
                    ],
                    hint: "Lav to målinger med forskellige blandinger. Hvor ender kurverne på grafen?",
                    opsaet: null
                };
            }
        },
        {
            id: "hurtigere",
            par: [[20, 40], [15, 45], [25, 50], [12, 36]],
            nr: 0,
            lav: function () {
                var p = this.par[this.nr++ % this.par.length];
                var a = p[0], b = p[1], f = b / a;
                return {
                    tekst: "Blanding A tog " + a + " s, og blanding B tog " + b + " s. Hvor mange gange hurtigere gik A?",
                    valg: [
                        { tekst: NK.faktor(f) + " gange", rigtig: true,
                          forklaring: "Samme mængde svovl på kortere tid. 1/Δt er " + NK.bet(1 / a, 3) + " s⁻¹ mod " + NK.bet(1 / b, 3) + " s⁻¹: " + NK.faktor(f) + " gange større." },
                        { tekst: NK.tal(a / b, 2) + " gange", rigtig: false,
                          forklaring: "A brugte kortest tid, så A gik hurtigst. Kort tid betyder stor hastighed." },
                        { tekst: (b - a) + " gange", rigtig: false,
                          forklaring: "Forskellen i sekunder siger ikke, hvor mange gange hurtigere. Sammenlign 1/Δt." },
                        { tekst: NK.faktor(f * f) + " gange", rigtig: false,
                          forklaring: "Hastigheden er proportional med 1/Δt, ikke med 1/Δt². 1/Δt bliver kun " + NK.faktor(f) + " gange større." }
                    ],
                    hint: "Samme mængde svovl blev dannet i begge. Hastigheden er proportional med 1/Δt.",
                    opsaet: null
                };
            }
        },
        {
            id: "brugtOp",
            lav: function () {
                var bl = M.blanding(40, D.SYRE_ML, D.GLAS_ML - 40);
                var pct = M.S_KRYDS / bl.c * 100;
                return {
                    tekst: "Med 40 mL Na₂S₂O₃ er [S₂O₃²⁻] = " + NK.bet(bl.c, 3) + " M i glasset. Krydset er væk, når der er dannet " +
                        NK.bet(M.S_KRYDS, 2) + " M svovl. Hvor meget af thiosulfatet er brugt?",
                    valg: [
                        { tekst: "Ca. " + NK.tal(pct, 0) + " %", rigtig: true,
                          forklaring: "Der dannes ét S pr. S₂O₃²⁻: " + NK.bet(M.S_KRYDS, 2) + " M af " + NK.bet(bl.c, 3) +
                              " M er ca. " + NK.tal(pct, 0) + " %. Koncentrationen er næsten den samme under hele målingen." },
                        { tekst: "Det hele", rigtig: false,
                          forklaring: "Så ville væsken være meget mere uklar. Krydset forsvinder allerede ved lidt svovl." },
                        { tekst: "Ca. halvdelen", rigtig: false,
                          forklaring: "Del mængden af svovl med [S₂O₃²⁻]: " + NK.bet(M.S_KRYDS, 2) + " M / " + NK.bet(bl.c, 3) + " M." },
                        { tekst: "Ca. " + NK.tal(pct * 10, 0) + " %", rigtig: false,
                          forklaring: "Tjek kommaet: " + NK.bet(M.S_KRYDS, 2) + " M / " + NK.bet(bl.c, 3) + " M = " + NK.bet(M.S_KRYDS / bl.c, 2) + "." }
                    ],
                    hint: "Der dannes ét S for hver S₂O₃²⁻, der reagerer. Del den dannede mængde med startkoncentrationen.",
                    opsaet: null
                };
            }
        },
        {
            id: "enhed",
            lav: function () {
                return {
                    tekst: "1/Δt bruges som mål for hastigheden. Hvilken enhed har 1/Δt?",
                    valg: [
                        { tekst: "s⁻¹", rigtig: true,
                          forklaring: "1 delt med sekunder giver s⁻¹. 1/Δt er ikke selve hastigheden, men den er proportional med den." },
                        { tekst: "M/s", rigtig: false,
                          forklaring: "M/s er enheden for v = Δ[S]/Δt. 1/Δt har ingen koncentration i tælleren." },
                        { tekst: "s", rigtig: false,
                          forklaring: "Det er enheden for Δt. Her deles 1 med tiden." },
                        { tekst: "Ingen enhed", rigtig: false,
                          forklaring: "Δt har enheden s, så 1/Δt har enheden 1/s = s⁻¹." }
                    ],
                    hint: "Δt måles i sekunder. Hvad bliver 1 delt med sekunder?",
                    opsaet: null
                };
            }
        }
    ];

    /* ================================================================
       FANE 2: KONCENTRATION
       ================================================================ */
    D.KONC_OPGAVER = [
        {
            id: "vand",
            lav: function () {
                return {
                    tekst: "Hvorfor fyldes der op med vand, så der altid er 50 mL i glasset?",
                    valg: [
                        { tekst: "Så kun én koncentration ændres, og lyset går gennem lige meget væske", rigtig: true,
                          forklaring: "Med samme rumfang ændres kun det stof, du skruer på. Og krydset ses gennem den samme højde væske." },
                        { tekst: "Vandet får reaktionen til at gå hurtigere", rigtig: false,
                          forklaring: "Vand fortynder. Det gør reaktionen langsommere, hvis det ændrer koncentrationerne." },
                        { tekst: "For at glasset ikke løber over", rigtig: false,
                          forklaring: "Glasset kan rumme 100 mL. Det handler om koncentrationerne." },
                        { tekst: "Det er ligegyldigt", rigtig: false,
                          forklaring: "Prøv uden vand: så ændres begge koncentrationer, og væsken bliver lavere." }
                    ],
                    hint: "Hvad sker der med [H₃O⁺], hvis du bruger mindre Na₂S₂O₃ og ikke fylder op?",
                    opsaet: null
                };
            }
        },
        {
            id: "beregn",
            saet: [[25, 5, 20], [10, 5, 35], [30, 10, 10], [15, 5, 30]],
            nr: 0,
            lav: function () {
                var b = this.saet[this.nr++ % this.saet.length];
                var v = b[0] + b[1] + b[2];
                var c = M.C_THIO * b[0] / v;
                var forkert = [
                    { v: M.C_THIO, f: "Det er koncentrationen i flasken. Blandingen er fortyndet til " + v + " mL." },
                    { v: M.C_THIO * b[0] / b[2], f: "Du har delt med vandets rumfang. Del med det samlede rumfang, " + v + " mL." },
                    { v: M.C_THIO * b[0] / (b[0] + b[1]), f: "Vandet tæller med: " + b[0] + " + " + b[1] + " + " + b[2] + " = " + v + " mL." }
                ];
                return {
                    tekst: "Beregn [S₂O₃²⁻] i en blanding af " + b[0] + " mL " + M.THIO_TEKST + " Na₂S₂O₃, " + b[1] + " mL HCl og " + b[2] + " mL vand.",
                    valg: [{ tekst: molaer(c), rigtig: true,
                        forklaring: "[S₂O₃²⁻] = " + M.THIO_TEKST + " · " + b[0] + " mL / " + v + " mL = " + molaer(c) + "." }]
                        .concat(forkert.map(function (x) { return { tekst: molaer(x.v), rigtig: false, forklaring: x.f }; })),
                    hint: "c = c(flaske) · V(Na₂S₂O₃) / V(i alt). Læg alle tre rumfang sammen.",
                    opsaet: null
                };
            }
        },
        {
            id: "halver",
            lav: function () {
                return {
                    tekst: "Du halverer [S₂O₃²⁻] og holder resten ens. Hvad sker der med Δt?",
                    valg: [
                        { tekst: "Δt fordobles", rigtig: true,
                          forklaring: "Hastigheden halveres, så det tager dobbelt så lang tid at danne den samme mængde svovl." },
                        { tekst: "Δt halveres", rigtig: false,
                          forklaring: "Mindre thiosulfat giver en langsommere reaktion. Det tager længere tid." },
                        { tekst: "Δt er den samme", rigtig: false,
                          forklaring: "Mål 40 mL og 20 mL Na₂S₂O₃, begge fyldt op til 50 mL. Tiderne er forskellige." },
                        { tekst: "Δt firdobles", rigtig: false,
                          forklaring: "1/Δt er proportional med [S₂O₃²⁻], ikke med [S₂O₃²⁻]². Se grafen." }
                    ],
                    hint: "Se på grafen for 1/Δt mod [S₂O₃²⁻]. Hvad sker der med 1/Δt, når [S₂O₃²⁻] halveres?",
                    opsaet: null
                };
            }
        },
        {
            id: "syre",
            lav: function () {
                var a = dt(20, 5, 25), b = dt(20, 10, 20);
                return {
                    tekst: "Du fordobler [H₃O⁺] og holder [S₂O₃²⁻] ens. Hvad sker der med hastigheden?",
                    valg: [
                        { tekst: "Den stiger kun lidt", rigtig: true,
                          forklaring: "Med 5 mL HCl tager det " + sek(a) + " og med 10 mL " + sek(b) + ". Der skal være syre, men mere syre hjælper ikke meget." },
                        { tekst: "Den fordobles", rigtig: false,
                          forklaring: "Det gælder thiosulfat. Lav forsøgene med syren, og se grafen for [H₃O⁺]." },
                        { tekst: "Den firdobles, fordi der står 2 H₃O⁺ i skemaet", rigtig: false,
                          forklaring: "Tallene i reaktionsskemaet bestemmer ikke hastigheden. Den skal måles." },
                        { tekst: "Den falder", rigtig: false,
                          forklaring: "Mere syre gør ikke reaktionen langsommere. Se grafen for [H₃O⁺]." }
                    ],
                    hint: "Lav forsøg med 5, 10 og 20 mL HCl og samme mængde Na₂S₂O₃. Skift grafen til [H₃O⁺].",
                    opsaet: null
                };
            }
        },
        {
            id: "graf",
            lav: function () {
                return {
                    tekst: "Hvordan ser grafen for 1/Δt mod [S₂O₃²⁻] ud?",
                    valg: [
                        { tekst: "En ret linje gennem (0,0)", rigtig: true,
                          forklaring: "1/Δt er proportional med [S₂O₃²⁻]. Uden thiosulfat dannes der intet svovl, så linjen går gennem (0,0)." },
                        { tekst: "En vandret linje", rigtig: false,
                          forklaring: "Det er næsten sådan for syren. For thiosulfat stiger 1/Δt." },
                        { tekst: "En kurve, der flader ud", rigtig: false,
                          forklaring: "Punkterne ligger på en ret linje. Lav flere forsøg, og se efter." },
                        { tekst: "En ret linje, der falder", rigtig: false,
                          forklaring: "Det er Δt, der falder. 1/Δt stiger med [S₂O₃²⁻]." }
                    ],
                    hint: "Lav mindst tre forsøg med forskellig mængde Na₂S₂O₃, fyldt op til 50 mL, og regn [S₂O₃²⁻] ud.",
                    opsaet: null
                };
            }
        },
        {
            id: "forudsig",
            saet: [[40, 10], [40, 20], [30, 15]],
            nr: 0,
            lav: function () {
                var p = this.saet[this.nr++ % this.saet.length];
                var a = dt(p[0], 5, 45 - p[0]), f = p[0] / p[1];
                var svar = a * f;
                return {
                    tekst: "Med " + p[0] + " mL Na₂S₂O₃ tog det " + sek(a) + ". Hvor lang tid tager det med " + p[1] +
                        " mL, når der stadig er 5 mL HCl og vand til 50 mL?",
                    valg: [
                        { tekst: "Ca. " + sek(svar), rigtig: true,
                          forklaring: "[S₂O₃²⁻] bliver " + NK.faktor(f) + " gange mindre, så Δt bliver " + NK.faktor(f) + " gange længere." },
                        { tekst: "Ca. " + sek(a / f), rigtig: false,
                          forklaring: "Mindre thiosulfat giver en langsommere reaktion, så tiden bliver længere." },
                        { tekst: "Ca. " + sek(a), rigtig: false,
                          forklaring: "Tiden afhænger af [S₂O₃²⁻]. Den er ændret." },
                        { tekst: "Ca. " + sek(a * f * f), rigtig: false,
                          forklaring: "Hastigheden er proportional med [S₂O₃²⁻], ikke med [S₂O₃²⁻]²." }
                    ],
                    hint: "Hvor mange gange mindre bliver [S₂O₃²⁻]? Hastigheden bliver lige så mange gange mindre.",
                    opsaet: null
                };
            }
        }
    ];

    /* ================================================================
       FANE 3: TEMPERATUR
       ================================================================ */
    function tempDt(T) {
        var b = D.TEMP_BLANDING;
        return dt(b.thio, b.syre, b.vand, T);
    }

    D.TEMP_OPGAVER = [
        {
            id: "faktor",
            par: [[20, 30], [30, 40], [15, 25], [40, 50]],
            nr: 0,
            lav: function () {
                var p = this.par[this.nr++ % this.par.length];
                var a = tempDt(p[0]), b = tempDt(p[1]), f = a / b;
                return {
                    tekst: "Ved " + p[0] + " °C tog det " + s(a) + " og ved " + p[1] + " °C " + s(b) +
                        ". Hvor mange gange hurtigere gik det ved " + p[1] + " °C?",
                    valg: [
                        { tekst: "Ca. " + NK.tal(f, 1) + " gange", rigtig: true,
                          forklaring: "1/Δt blev " + NK.bet(1 / b, 3) + " s⁻¹ mod " + NK.bet(1 / a, 3) + " s⁻¹. Det er ca. " + NK.tal(f, 1) + " gange større." },
                        { tekst: "Ca. " + NK.tal(1 / f, 1) + " gange", rigtig: false,
                          forklaring: "Det er forholdet mellem tiderne den forkerte vej. Kortere tid betyder større hastighed." },
                        { tekst: "Ca. " + NK.tal(p[1] / p[0], 1) + " gange", rigtig: false,
                          forklaring: "Det er forholdet mellem temperaturerne. Hastigheden er ikke proportional med °C." },
                        { tekst: "10 gange", rigtig: false,
                          forklaring: "Der er 10 °C imellem, men det giver ikke 10 gange. Sammenlign 1/Δt." }
                    ],
                    hint: "Hastigheden er proportional med 1/Δt. Del 1/Δt ved " + p[1] + " °C med 1/Δt ved " + p[0] + " °C.",
                    opsaet: null
                };
            }
        },
        {
            id: "regel",
            lav: function () {
                var f1 = tempDt(20) / tempDt(30), f2 = tempDt(30) / tempDt(40);
                return {
                    tekst: "En tommelfingerregel siger, at hastigheden fordobles for hver 10 °C. Passer det her?",
                    valg: [
                        { tekst: "Ja, nogenlunde", rigtig: true,
                          forklaring: "Fra 20 °C til 30 °C bliver 1/Δt " + NK.tal(f1, 1) + " gange større, og fra 30 °C til 40 °C " + NK.tal(f2, 1) + " gange." },
                        { tekst: "Nej, den stiger lige meget for hver grad", rigtig: false,
                          forklaring: "Så ville grafen være en ret linje. Den bliver stejlere og stejlere." },
                        { tekst: "Nej, den fordobles for hver grad", rigtig: false,
                          forklaring: "Fra 20 °C til 25 °C ændrer Δt sig langt fra så meget. Mål og se." },
                        { tekst: "Nej, hastigheden falder, når det bliver varmere", rigtig: false,
                          forklaring: "Varme gør reaktionen hurtigere: Δt bliver kortere, og 1/Δt større." }
                    ],
                    hint: "Mål ved 20 °C, 30 °C og 40 °C. Hvor mange gange større bliver 1/Δt for hver 10 °C?",
                    opsaet: null
                };
            }
        },
        {
            id: "forudsig",
            lav: function () {
                var a = tempDt(20), b = tempDt(40);
                return {
                    tekst: "Ved 20 °C tog det " + s(a) + ". Omtrent hvor lang tid tager det ved 40 °C?",
                    valg: [
                        { tekst: "Ca. " + sek(a / 4), rigtig: true,
                          forklaring: "To gange 10 °C giver to fordoblinger: 4 gange hurtigere. Modellen giver " + s(b) + "." },
                        { tekst: "Ca. " + sek(a / 2), rigtig: false,
                          forklaring: "Fra 20 °C til 40 °C er der to gange 10 °C, altså to fordoblinger." },
                        { tekst: "Ca. " + sek(a * 2), rigtig: false,
                          forklaring: "Varme gør reaktionen hurtigere, så tiden bliver kortere." },
                        { tekst: "Ca. " + sek(a * 4), rigtig: false,
                          forklaring: "Hastigheden bliver 4 gange større, så tiden bliver 4 gange kortere." }
                    ],
                    hint: "Hvor mange gange 10 °C er der fra 20 °C til 40 °C? Hver gang fordobles hastigheden.",
                    opsaet: null
                };
            }
        },
        {
            id: "hvorfor",
            lav: function () {
                return {
                    tekst: "Hvorfor går reaktionen hurtigere ved højere temperatur?",
                    valg: [
                        { tekst: "Partiklerne bevæger sig hurtigere, så flere sammenstød har energi nok", rigtig: true,
                          forklaring: "Flere sammenstød pr. sekund, og en større del af dem kommer over aktiveringsenergien. Se 1.2 Energidiagram." },
                        { tekst: "Der dannes mere svovl", rigtig: false,
                          forklaring: "Krydset forsvinder ved den samme mængde svovl. Den dannes bare hurtigere." },
                        { tekst: "Koncentrationen af thiosulfat stiger", rigtig: false,
                          forklaring: "Blandingen er den samme. Kun temperaturen er ændret." },
                        { tekst: "Svovl ses bedre i varmt vand", rigtig: false,
                          forklaring: "Svovlet skjuler krydset lige godt ved alle temperaturer. Det dannes bare hurtigere." }
                    ],
                    hint: "Tænk på partiklerne. Hvad ændrer sig ved dem, når det bliver varmere?",
                    opsaet: null
                };
            }
        },
        {
            id: "kold",
            lav: function () {
                var a = tempDt(20), b = tempDt(10);
                return {
                    tekst: "Blandingen køles til 10 °C. Hvad sker der med Δt i forhold til 20 °C?",
                    valg: [
                        { tekst: "Den bliver ca. dobbelt så lang", rigtig: true,
                          forklaring: "10 °C koldere halverer omtrent hastigheden: " + s(a) + " ved 20 °C og " + s(b) + " ved 10 °C." },
                        { tekst: "Reaktionen stopper helt", rigtig: false,
                          forklaring: "Den går langsommere, men den stopper ikke. Prøv 10 °C." },
                        { tekst: "Den bliver kortere", rigtig: false,
                          forklaring: "Kulde gør reaktionen langsommere, så tiden bliver længere." },
                        { tekst: "Den er den samme", rigtig: false,
                          forklaring: "10 °C gør en stor forskel. Prøv at måle." }
                    ],
                    hint: "Tommelfingerreglen virker begge veje: 10 °C koldere, og hastigheden halveres.",
                    opsaet: null
                };
            }
        }
    ];

    NK.Data = D;
}());
