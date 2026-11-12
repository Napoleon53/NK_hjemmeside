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
       Praesentationen (../kemichael/praesentation.js): ét trin ad gangen,
       og eleven trykker Naeste. Hvert trin er to til fire hele saetninger
       i Kemibogens sprog: hvad fanen traener, og hvordan tingene bruges.
       sel: kort og knapper paa siden, der faar en gul ramme. felt: det,
       der er tegnet paa laerredet (glas, oppefra, ur og graf; se
       introFelt i js/laerer.js). Ingen vittigheder i praesentationen. */
    D.INTRO = {
        kryds: [
            { tekst: "I denne fane måler du, hvor lang tid der går, før krydset under bægerglasset forsvinder. I kortet Blandingen vælger du, hvor meget Na₂S₂O₃ der er i glasset. Derefter trækker du måleglasset med saltsyre hen over bægerglasset, og uret starter, når syren rammer.",
              felt: "glas", sel: "#kryds-blanding" },
            { tekst: "Krydset set oppefra viser, hvad du ser, når du kigger ned gennem væsken i glasset. Du stopper selv uret, når krydset ikke længere kan ses. Uret stopper, når du klikker på stopuret eller trykker Stop uret.",
              felt: ["oppefra", "ur"] },
            { tekst: "Grafen viser bagefter, hvor meget svovl der er dannet. En god måling ender på den stiplede linje, hvor krydset er væk. Kortet Måling samler dine målinger i en tabel med Δt og 1/Δt.",
              felt: "graf", sel: "#kryds-maaling" },
            { tekst: "Når du har lavet et par målinger, starter du quizzen på kortet øverst i scenen. Quizzen har fem spørgsmål, og du sender hvert svar med Indsend svar. Knappen Giv et hint giver først et hint og derefter svaret.",
              sel: "#kryds-skort" }
        ],
        konc: [
            { tekst: "I denne fane undersøger du, hvordan koncentrationerne af thiosulfat og syre påvirker reaktionshastigheden. Du vælger rumfangene af Na₂S₂O₃, HCl og vand og trykker Bland og mål. Uret stopper selv, når krydset er væk.",
              sel: "#konc-forsoeg" },
            { tekst: "Hvert forsøg bliver en række i tabellen under grafen. Du regner selv [S₂O₃²⁻] og [H₃O⁺] i glasset ud og skriver tallene i tabellen. Efter to rigtige tal i en kolonne regnes resten af kolonnen for dig.",
              sel: "#konc-tabel" },
            { tekst: "En rigtig koncentration i tabellen giver et punkt på grafen for 1/Δt. Knapperne over grafen skifter den vandrette akse. Kortet øverst i scenen stiller opgaver om forsøgene.",
              felt: "graf", sel: ["#konc-akse", "#konc-skort"] }
        ],
        temp: [
            { tekst: "I denne fane undersøger du, hvordan temperaturen påvirker reaktionshastigheden. Blandingen er den samme i alle forsøg, så du vælger kun temperaturen og måler med den grønne knap.",
              sel: "#temp-forsoeg" },
            { tekst: "Hvert forsøg bliver et punkt på grafen og en række i tabellen under grafen. Grafen viser 1/Δt mod temperaturen, og punkterne bliver forbundet med en linje.",
              felt: "graf", sel: "#temp-tabel" },
            { tekst: "Når du har målt ved nogle temperaturer, starter du en opgave på kortet øverst i scenen. Du sender dit svar med Indsend svar, og knappen Giv et hint giver først et hint og derefter svaret.",
              sel: "#temp-skort" }
        ]
    };

    /* ----- Fane 1: tre blandinger. Syren er altid 5 mL 1,0 M HCl, og
       der er vand til 45 mL i glasset, saa der er 50 mL i alt. Rumfanget
       af Na₂S₂O₃ fordobles fra blanding til blanding: 0,10 M, 0,20 M og
       0,40 M i glasset, og krydset er vaek efter ca. 20 s, 10 s og 5 s. */
    D.SYRE_ML = 5;
    D.GLAS_ML = 45;
    D.KRYDS_BLANDINGER = [10, 20, 40];
    D.MAKS_KRYDS = 5;          /* maalinger, der bliver staaende */

    /* ----- Fane 2 og 3 --------------------------------------------------- */
    D.MAKS_FORSOEG = 8;        /* raekker i tabellen */
    D.TRIN_ML = 5;
    D.MAKS_ML = 50;
    D.KONC_START = { thio: 20, syre: 5, vand: 25 };
    D.TEMP_BLANDING = { thio: 10, syre: 5, vand: 35 };      /* 0,10 M: 20 s ved 20 °C */
    D.TEMP_MIN = 5;
    D.TEMP_MAKS = 60;
    D.TEMP_TRIN = 5;

    function s(v) { return NK.tal(v, v < 10 ? 1 : 0) + " s"; }
    function sek(v) { return Math.round(v) + " s"; }
    function molaer(v) { return NK.bet(v, 2) + " M"; }
    function dt(vThio, vSyre, vVand, T) { return M.tidTilKryds(vThio, vSyre, vVand, T); }

    /* Fane 1: blandingen med ml mL Na₂S₂O₃ og tiden, som forsoeget boer give */
    function krydsBlanding(ml) { return M.blanding(ml, D.SYRE_ML, D.GLAS_ML - ml); }
    function krydsDt(ml) { return Math.round(dt(ml, D.SYRE_ML, D.GLAS_ML - ml)); }

    /* ================================================================
       FANE 1: KRYDSET
       De fem spoergsmaal er quizzen (js/opgave.js). Tallene er dem,
       forsoeget boer give. Har et spoergsmaal flere saet tal (par, nr),
       faar eleven et nyt saet, naar det kommer igen.
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
                          forklaring: "Thiosulfat er farveløst og skjuler ikke noget. Det er svovlet, der skjuler krydset." }
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
                          forklaring: "Tiden Δt er forskellig fra måling til måling, og det er Δt, du måler." },
                        { tekst: "Alt thiosulfat er brugt", rigtig: false,
                          forklaring: "Kun omkring 1 % af thiosulfatet er forbrugt, når krydset forsvinder. Reaktionen fortsætter længe efter." },
                        { tekst: "Hastigheden", rigtig: false,
                          forklaring: "Hastigheden er forskellig fra blanding til blanding, og derfor er tiderne forskellige." }
                    ],
                    hint: "Lav to målinger med forskellige blandinger. Hvor ender kurverne på grafen?",
                    opsaet: null
                };
            }
        },
        {
            id: "hurtigere",
            /* To af de tre blandinger (plads i D.KRYDS_BLANDINGER): den langsomme og den hurtige */
            par: [[0, 1], [1, 2], [0, 2]],
            nr: 0,
            lav: function () {
                var p = this.par[this.nr++ % this.par.length];
                var blA = krydsBlanding(D.KRYDS_BLANDINGER[p[0]]), blB = krydsBlanding(D.KRYDS_BLANDINGER[p[1]]);
                var a = krydsDt(blA.vThio), b = krydsDt(blB.vThio), f = a / b;
                var cA = molaer(blA.c), cB = molaer(blB.c);
                return {
                    tekst: "Med [S₂O₃²⁻] = " + cA + " i glasset var Δt = " + a + " s, og med [S₂O₃²⁻] = " + cB + " var Δt = " + b +
                        " s. Hvor mange gange større var hastigheden med " + cB + "?",
                    valg: [
                        { tekst: NK.faktor(f) + " gange", rigtig: true,
                          forklaring: "Den samme mængde svovl blev dannet på kortere tid. 1/Δt er " + NK.bet(1 / b, 2) + " s⁻¹ mod " + NK.bet(1 / a, 2) + " s⁻¹ og dermed " + NK.faktor(f) + " gange større." },
                        { tekst: NK.tal(b / a, 2) + " gange", rigtig: false,
                          forklaring: "Med " + cB + " gik der kortest tid, så den reaktion gik hurtigst. Kort tid betyder stor hastighed." },
                        { tekst: (a - b) + " gange", rigtig: false,
                          forklaring: "Forskellen i sekunder siger ikke, hvor mange gange større hastigheden er. Sammenlign 1/Δt." },
                        { tekst: NK.faktor(f * f) + " gange", rigtig: false,
                          forklaring: "Hastigheden er proportional med 1/Δt, ikke med 1/Δt². 1/Δt bliver kun " + NK.faktor(f) + " gange større." }
                    ],
                    hint: "Den samme mængde svovl blev dannet i begge forsøg. Hastigheden er proportional med 1/Δt.",
                    opsaet: null
                };
            }
        },
        {
            id: "brugtOp",
            /* De to foerste blandinger: 1,5 % og 0,75 % */
            nr: 0,
            lav: function () {
                var bl = krydsBlanding(D.KRYDS_BLANDINGER[this.nr++ % 2]);
                var pct = M.S_KRYDS / bl.c * 100;
                var c = molaer(bl.c), sv = NK.bet(M.S_KRYDS, 2) + " M";
                return {
                    tekst: "Med " + bl.vThio + " mL Na₂S₂O₃ er [S₂O₃²⁻] = " + c + " i glasset. Krydset er væk, når der er dannet " +
                        sv + " svovl. Hvor stor en del af thiosulfatet er forbrugt?",
                    valg: [
                        { tekst: "Ca. " + NK.bet(pct, 2) + " %", rigtig: true,
                          forklaring: "Der dannes ét S pr. S₂O₃²⁻, og " + sv + " af " + c +
                              " er ca. " + NK.bet(pct, 2) + " %. [S₂O₃²⁻] er derfor næsten den samme under hele målingen." },
                        { tekst: "Det hele", rigtig: false,
                          forklaring: "Hvis alt thiosulfatet var forbrugt, ville væsken være meget mere uklar. Krydset forsvinder allerede ved en lille mængde svovl." },
                        { tekst: "Ca. halvdelen", rigtig: false,
                          forklaring: "Divider koncentrationen af dannet svovl med [S₂O₃²⁻]: " + sv + " / " + c + "." },
                        { tekst: "Ca. " + NK.bet(pct * 10, 2) + " %", rigtig: false,
                          forklaring: "Tjek kommaet: " + sv + " / " + c + " = " + NK.bet(M.S_KRYDS / bl.c, 2) + "." }
                    ],
                    hint: "Der dannes ét S for hver S₂O₃²⁻, der reagerer. Divider koncentrationen af dannet svovl med [S₂O₃²⁻] ved start.",
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
                          forklaring: "1 divideret med sekunder giver s⁻¹. 1/Δt er ikke selve hastigheden, men er proportional med hastigheden." },
                        { tekst: "M/s", rigtig: false,
                          forklaring: "M/s er enheden for v = Δ[S]/Δt. 1/Δt har ingen koncentration i tælleren." },
                        { tekst: "s", rigtig: false,
                          forklaring: "s er enheden for Δt. I 1/Δt divideres 1 med tiden." },
                        { tekst: "Ingen enhed", rigtig: false,
                          forklaring: "Δt har enheden s, så 1/Δt har enheden 1/s = s⁻¹." }
                    ],
                    hint: "Δt måles i sekunder. Hvilken enhed får 1 divideret med sekunder?",
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
                          forklaring: "Med samme samlede rumfang ændres kun koncentrationen af ét stof ad gangen. Krydset ses også gennem den samme højde væske." },
                        { tekst: "Vandet får reaktionen til at gå hurtigere", rigtig: false,
                          forklaring: "Vand fortynder blandingen, og lavere koncentrationer gør reaktionen langsommere." },
                        { tekst: "For at glasset ikke løber over", rigtig: false,
                          forklaring: "Bægerglasset kan rumme 100 mL. Vandet tilsættes af hensyn til koncentrationerne." },
                        { tekst: "Det er ligegyldigt", rigtig: false,
                          forklaring: "Uden vand ændres begge koncentrationer, og væsken i bægerglasset bliver lavere." }
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
                    { v: M.C_THIO, f: "Dit svar er koncentrationen i flasken med Na₂S₂O₃. Blandingen har et samlet rumfang på " + v + " mL." },
                    { v: M.C_THIO * b[0] / b[2], f: "Du har divideret med vandets rumfang. Divider med det samlede rumfang, " + v + " mL." },
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
                    tekst: "Du halverer [S₂O₃²⁻] og holder alt andet konstant. Hvad sker der med Δt?",
                    valg: [
                        { tekst: "Δt fordobles", rigtig: true,
                          forklaring: "Hastigheden halveres, så det tager dobbelt så lang tid at danne den samme mængde svovl." },
                        { tekst: "Δt halveres", rigtig: false,
                          forklaring: "En lavere [S₂O₃²⁻] giver en mindre hastighed, så Δt bliver længere." },
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
                    tekst: "Du fordobler [H₃O⁺] ved konstant [S₂O₃²⁻]. Hvad sker der med hastigheden?",
                    valg: [
                        { tekst: "Den stiger kun lidt", rigtig: true,
                          forklaring: "Med 5 mL HCl er Δt = " + sek(a) + ", og med 10 mL HCl er Δt = " + sek(b) + ". Reaktionen kræver syre, men mere syre øger kun hastigheden lidt." },
                        { tekst: "Den fordobles", rigtig: false,
                          forklaring: "Hastigheden fordobles, når [S₂O₃²⁻] fordobles. Lav forsøg med forskellige rumfang HCl, og se grafen for [H₃O⁺]." },
                        { tekst: "Den firdobles, fordi der står 2 H₃O⁺ i skemaet", rigtig: false,
                          forklaring: "Koefficienterne i reaktionsskemaet viser ikke, hvordan hastigheden afhænger af [H₃O⁺]. Det skal måles." },
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
                          forklaring: "Grafen for [H₃O⁺] er næsten vandret. Grafen for [S₂O₃²⁻] stiger." },
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
            saet: [[40, 10], [40, 20], [20, 10]],
            nr: 0,
            lav: function () {
                var p = this.saet[this.nr++ % this.saet.length];
                var a = dt(p[0], 5, 45 - p[0]), f = p[0] / p[1];
                var svar = a * f;
                return {
                    tekst: "Med " + p[0] + " mL Na₂S₂O₃ var Δt = " + sek(a) + ". Hvor stor bliver Δt med " + p[1] +
                        " mL Na₂S₂O₃, når der stadig er 5 mL HCl og vand til 50 mL?",
                    valg: [
                        { tekst: "Ca. " + sek(svar), rigtig: true,
                          forklaring: "[S₂O₃²⁻] bliver " + NK.faktor(f) + " gange mindre, så Δt bliver " + NK.faktor(f) + " gange længere." },
                        { tekst: "Ca. " + sek(a / f), rigtig: false,
                          forklaring: "Mindre thiosulfat giver en langsommere reaktion, så tiden bliver længere." },
                        { tekst: "Ca. " + sek(a), rigtig: false,
                          forklaring: "Δt afhænger af [S₂O₃²⁻], og [S₂O₃²⁻] er ændret." },
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
                    tekst: "Ved " + p[0] + " °C var Δt = " + s(a) + ", og ved " + p[1] + " °C var Δt = " + s(b) +
                        ". Hvor mange gange større var hastigheden ved " + p[1] + " °C?",
                    valg: [
                        { tekst: "Ca. " + NK.tal(f, 1) + " gange", rigtig: true,
                          forklaring: "1/Δt blev " + NK.bet(1 / b, 3) + " s⁻¹ mod " + NK.bet(1 / a, 3) + " s⁻¹. Det er ca. " + NK.tal(f, 1) + " gange større." },
                        { tekst: "Ca. " + NK.tal(1 / f, 1) + " gange", rigtig: false,
                          forklaring: "Du har divideret den korte tid med den lange. Kortere tid betyder større hastighed." },
                        { tekst: "Ca. " + NK.tal(p[1] / p[0], 1) + " gange", rigtig: false,
                          forklaring: "Dit svar er forholdet mellem temperaturerne. Hastigheden er ikke proportional med temperaturen i °C." },
                        { tekst: "10 gange", rigtig: false,
                          forklaring: "Temperaturen stiger 10 °C, men hastigheden bliver ikke 10 gange større. Sammenlign 1/Δt." }
                    ],
                    hint: "Hastigheden er proportional med 1/Δt. Divider 1/Δt ved " + p[1] + " °C med 1/Δt ved " + p[0] + " °C.",
                    opsaet: null
                };
            }
        },
        {
            id: "regel",
            lav: function () {
                var f1 = tempDt(20) / tempDt(30), f2 = tempDt(30) / tempDt(40);
                return {
                    tekst: "Fordobles hastigheden i målingerne for hver 10 °C, som en tommelfingerregel siger?",
                    valg: [
                        { tekst: "Ja, nogenlunde", rigtig: true,
                          forklaring: "Fra 20 °C til 30 °C bliver 1/Δt " + NK.tal(f1, 1) + " gange større, og fra 30 °C til 40 °C " + NK.tal(f2, 1) + " gange." },
                        { tekst: "Nej, hastigheden stiger lige meget pr. grad", rigtig: false,
                          forklaring: "Grafen er ikke en ret linje, men bliver stejlere og stejlere." },
                        { tekst: "Nej, hastigheden fordobles pr. grad", rigtig: false,
                          forklaring: "En fordobling pr. grad passer ikke med Δt ved 20 °C og 25 °C." },
                        { tekst: "Nej, hastigheden falder, når det bliver varmere", rigtig: false,
                          forklaring: "Ved højere temperatur bliver Δt kortere, og 1/Δt bliver større." }
                    ],
                    hint: "Mål ved 20, 30 og 40 °C. Hvor mange gange større bliver 1/Δt pr. 10 °C?",
                    opsaet: null
                };
            }
        },
        {
            id: "forudsig",
            lav: function () {
                var a = tempDt(20), b = tempDt(40);
                return {
                    tekst: "Ved 20 °C var Δt = " + s(a) + ". Hvor stor er Δt omtrent ved 40 °C?",
                    valg: [
                        { tekst: "Ca. " + sek(a / 4), rigtig: true,
                          forklaring: "To trin på 10 °C giver to fordoblinger, så hastigheden bliver 4 gange større. Målingen i animationen giver " + s(b) + "." },
                        { tekst: "Ca. " + sek(a / 2), rigtig: false,
                          forklaring: "Fra 20 °C til 40 °C er der to trin på 10 °C og dermed to fordoblinger." },
                        { tekst: "Ca. " + sek(a * 2), rigtig: false,
                          forklaring: "En højere temperatur gør reaktionen hurtigere, så Δt bliver kortere." },
                        { tekst: "Ca. " + sek(a * 4), rigtig: false,
                          forklaring: "Hastigheden bliver 4 gange større, så tiden bliver 4 gange kortere." }
                    ],
                    hint: "Hvor mange trin på 10 °C er der fra 20 °C til 40 °C? For hvert trin fordobles hastigheden.",
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
                          forklaring: "Der sker flere sammenstød pr. sekund, og en større del af sammenstødene har en energi over aktiveringsenergien. Se animationen 1.2 Energidiagram." },
                        { tekst: "Der dannes mere svovl", rigtig: false,
                          forklaring: "Krydset forsvinder ved den samme mængde svovl, men svovlet dannes hurtigere." },
                        { tekst: "Koncentrationen af thiosulfat stiger", rigtig: false,
                          forklaring: "Blandingen er den samme. Kun temperaturen er ændret." },
                        { tekst: "Svovl ses bedre i varmt vand", rigtig: false,
                          forklaring: "Svovlet skjuler krydset lige godt ved alle temperaturer, men svovlet dannes hurtigere ved højere temperatur." }
                    ],
                    hint: "Hvad sker der med partiklernes bevægelse, når temperaturen stiger?",
                    opsaet: null
                };
            }
        },
        {
            id: "kold",
            lav: function () {
                var a = tempDt(20), b = tempDt(10);
                return {
                    tekst: "Blandingen køles til 10 °C. Hvad sker der med Δt i forhold til Δt ved 20 °C?",
                    valg: [
                        { tekst: "Den bliver ca. dobbelt så lang", rigtig: true,
                          forklaring: "Når temperaturen falder 10 °C, halveres hastigheden omtrent. Δt er " + s(a) + " ved 20 °C og " + s(b) + " ved 10 °C." },
                        { tekst: "Reaktionen stopper helt", rigtig: false,
                          forklaring: "Den går langsommere, men den stopper ikke. Prøv 10 °C." },
                        { tekst: "Den bliver kortere", rigtig: false,
                          forklaring: "En lavere temperatur gør reaktionen langsommere, så Δt bliver længere." },
                        { tekst: "Den er den samme", rigtig: false,
                          forklaring: "Et fald på 10 °C ændrer Δt meget. Mål ved begge temperaturer." }
                    ],
                    hint: "Tommelfingerreglen gælder begge veje. Falder temperaturen 10 °C, halveres hastigheden omtrent.",
                    opsaet: null
                };
            }
        }
    ];

    NK.Data = D;
}());
