/* =====================================================================
   data.js - tekster, opgaver og reaktioner

   Alt, der er tekst eller tal, og som man kan rette uden at roere
   tegningen: Kemichaels praesentation, opgaverne paa fane 1 og 2 og
   reaktionerne paa fane 3.

   Et opgaveobjekt har
     tekst    spoergsmaalet
     valg     [{ tekst, rigtig, forklaring }] - de forkerte er de fejl,
              elever faktisk laver, og forklaringen svarer paa fejlen
     hint     et hint til netop denne opgave
     opsaet   hvordan scenen stilles op, mens opgaven staar
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var B = NK.Model.bromat;
    var D = {};

    /* ----- Kemichael ----------------------------------------------------
       To eller tre replikker pr. fane, hoejst ca. 60 tegn. Under linjen
       INTRO_PEG peger han paa elementet i PEG, og det lyser op. */
    D.INTRO = {
        kurve: [
            "Bogens reaktion. Der dannes brom, og glasset bliver gult.",
            "Tryk Afspil herovre, og løs opgaverne nedenunder.",
            "Glasset klarer det selv. Du skal bare måle."
        ],
        sammenstoed: [
            "Her er partiklerne. De reagerer kun, når de støder sammen.",
            "Skru på antallet herovre, og tæl sammenstødene.",
            "De farer rundt sådan hele dagen. Det kalder vi kemi."
        ],
        udtryk: [
            "En ukendt reaktion. Du laver forsøgene, jeg holder kaffen.",
            "Vælg koncentrationer herovre, og mål starthastigheden.",
            "Tallene i reaktionsskemaet er ikke svaret. Alle prøver."
        ]
    };
    D.INTRO_PEG = 1;
    D.PEG = { kurve: "kurve-reaktion", sammenstoed: "sam-opstilling", udtryk: "udtryk-forsoeg" };

    function ms(v) { return NK.sci(v, 2) + " M/s"; }

    /* ================================================================
       FANE 1: KURVEN
       ================================================================ */
    D.KURVE_OPGAVER = [
        {
            id: "hurtigst",
            lav: function () {
                return {
                    tekst: "Hvornår er reaktionshastigheden størst?",
                    valg: [
                        { tekst: "Lige i starten", rigtig: true,
                          forklaring: "Kurven for Br₂ er stejlest ved t = 0. Her er der flest BrO₃⁻, og hastigheden er størst." },
                        { tekst: "Til sidst, hvor der er mest Br₂", rigtig: false,
                          forklaring: "Der er mest Br₂ til sidst, men kurven er næsten vandret. Hastigheden er hældningen, ikke højden." },
                        { tekst: "Den er den samme hele tiden", rigtig: false,
                          forklaring: "Så ville kurven være en ret linje. Den bliver fladere og fladere." },
                        { tekst: "Der, hvor de to kurver krydser", rigtig: false,
                          forklaring: "I krydset er de to koncentrationer lige store. Det siger intet om hældningen." }
                    ],
                    hint: "Hastigheden er, hvor hurtigt kurven stiger. Hvor er den stejlest?",
                    opsaet: { vaerktoej: "aflaes", stof: "br2", t: 0, helKurve: true }
                };
            }
        },
        {
            id: "gennemsnit",
            /* Foerste gang bogens interval, derefter et andet. t1 er aldrig
               0, ellers ville [Br₂]/t₂ tilfaeldigvis vaere rigtigt. */
            intervaller: [[80, 120], [100, 200], [50, 150], [150, 250], [40, 80], [200, 300], [120, 240]],
            nr: 0,
            lav: function () {
                var iv = this.intervaller[this.nr++ % this.intervaller.length];
                var t1 = iv[0], t2 = iv[1];
                var c1 = B.br2(t1), c2 = B.br2(t2), dc = c2 - c1, dt = t2 - t1;
                return {
                    tekst: "Beregn gennemsnitshastigheden v(Br₂) fra t₁ = " + t1 + " s til t₂ = " + t2 + " s.",
                    valg: [
                        { tekst: ms(dc / dt), rigtig: true,
                          forklaring: "Δ[Br₂] = " + NK.sci(dc, 2) + " M og Δt = " + dt + " s. Hastigheden er Δ[Br₂]/Δt, hældningen af sekanten." },
                        { tekst: ms(c2 / t2), rigtig: false,
                          forklaring: "Det er [Br₂] delt med t₂. Brug ændringen: [Br₂] ved t₂ minus [Br₂] ved t₁." },
                        { tekst: ms(dc / t2), rigtig: false,
                          forklaring: "Ændringen er rigtig, men den skal deles med Δt = t₂ − t₁, ikke med t₂." },
                        { tekst: NK.sci(dt / dc, 2) + " s/M", rigtig: false,
                          forklaring: "Tiden er delt med koncentrationen. Hastighed er ændring i koncentration pr. tid." }
                    ],
                    hint: "Δ[Br₂] = [Br₂] ved t₂ − [Br₂] ved t₁. Del med Δt = t₂ − t₁.",
                    opsaet: { vaerktoej: "sekant", stof: "br2", t1: t1, t2: t2, laas: true, skjul: true }
                };
            }
        },
        {
            id: "tangent",
            tider: [100, 50, 200, 150, 250],
            nr: 0,
            lav: function () {
                var t = this.tider[this.nr++ % this.tider.length];
                return {
                    tekst: "Læg tangenten ved t = " + t + " s. Drej linealen i enderne, til den kun rører kurven i punktet.",
                    tangent: true,
                    t: t,
                    hint: "En tangent følger kurven lige i punktet. Den må ikke skære kurven over eller under punktet.",
                    rigtigTekst: "Linealen er en tangent. Dens hældning er hastigheden i det øjeblik: v(Br₂) = " + ms(B.v("br2", t)) + ".",
                    opsaet: { vaerktoej: "tangent", stof: "br2", tT: t, laas: true, skjul: true, lineal: 0 }
                };
            }
        },
        {
            id: "koefficient",
            tider: [100, 40, 160],
            nr: 0,
            lav: function () {
                var t = this.tider[this.nr++ % this.tider.length];
                var x = B.v("br2", t);
                return {
                    tekst: "Ved t = " + t + " s dannes Br₂ med v(Br₂) = " + ms(x) + ". Hvor hurtigt bruges BrO₃⁻?",
                    valg: [
                        { tekst: "v(BrO₃⁻) = " + ms(x / 3), rigtig: true,
                          forklaring: "Der dannes 3 Br₂, hver gang én BrO₃⁻ bruges. Så går BrO₃⁻ tre gange langsommere." },
                        { tekst: "v(BrO₃⁻) = " + ms(3 * x), rigtig: false,
                          forklaring: "Du har ganget med 3. Br₂ har den største koefficient, så det er Br₂, der går hurtigst." },
                        { tekst: "v(BrO₃⁻) = " + ms(x), rigtig: false,
                          forklaring: "Koefficienterne er forskellige: 3 Br₂ for hver BrO₃⁻." },
                        { tekst: "v(BrO₃⁻) = " + ms(-x / 3), rigtig: false,
                          forklaring: "Hastigheden er altid positiv. Minus i definitionen vender fortegnet, fordi [BrO₃⁻] falder." }
                    ],
                    hint: "Se på reaktionsskemaet: hvor mange Br₂ dannes der, når én BrO₃⁻ bruges?",
                    opsaet: { vaerktoej: "tangent", stof: "br2", tT: t, laas: true, lineal: "tangent" }
                };
            }
        },
        {
            id: "sekantTangent",
            tider: [200, 300, 150],
            nr: 0,
            lav: function () {
                var t = this.tider[this.nr++ % this.tider.length];
                return {
                    tekst: "Er gennemsnitshastigheden fra 0 til " + t + " s større eller mindre end hastigheden præcis ved " + t + " s?",
                    valg: [
                        { tekst: "Større", rigtig: true,
                          forklaring: "Kurven flader ud. Gennemsnittet tager den stejle start med, så sekanten er stejlere end tangenten ved " + t + " s." },
                        { tekst: "Mindre", rigtig: false,
                          forklaring: "Så skulle kurven blive stejlere med tiden. Den bliver fladere." },
                        { tekst: "Lige store", rigtig: false,
                          forklaring: "Det gælder kun for en ret linje. Sammenlign sekanten med kurvens hældning ved " + t + " s." }
                    ],
                    hint: "Sekanten går fra 0 til " + t + " s. Er den stejlere eller fladere end kurven lige ved " + t + " s?",
                    opsaet: { vaerktoej: "sekant", stof: "br2", t1: 0, t2: t, laas: true }
                };
            }
        },
        {
            id: "enhed",
            lav: function () {
                return {
                    tekst: "Hvilken enhed har reaktionshastighed?",
                    valg: [
                        { tekst: "M/s", rigtig: true,
                          forklaring: "Ændring i koncentration (M) pr. tid (s). Langsomme reaktioner måles også i M/min." },
                        { tekst: "s/M", rigtig: false,
                          forklaring: "Det er tid pr. koncentration, altså omvendt." },
                        { tekst: "M", rigtig: false,
                          forklaring: "M er en koncentration. Hastigheden er, hvor meget den ændrer sig pr. tid." },
                        { tekst: "M·s", rigtig: false,
                          forklaring: "Koncentrationen skal deles med tiden, ikke ganges." }
                    ],
                    hint: "Hastighed er ændring pr. tid. Hvad ændrer sig, og hvad måles tiden i?",
                    opsaet: { vaerktoej: "aflaes", stof: "br2", helKurve: true }
                };
            }
        }
    ];

    /* ================================================================
       FANE 2: SAMMENSTOED
       ================================================================ */
    D.SAM_OPGAVER = [
        {
            id: "fordoblA",
            lav: function () {
                return {
                    tekst: "Du fordobler antallet af A, og B er det samme. Hvad sker der med sammenstødene mellem A og B pr. sekund?",
                    valg: [
                        { tekst: "De fordobles", rigtig: true,
                          forklaring: "Hver B har dobbelt så mange A at ramme. Prøv 12 A og derefter 24 A." },
                        { tekst: "De firdobles", rigtig: false,
                          forklaring: "Det sker kun, hvis både A og B fordobles." },
                        { tekst: "De er de samme", rigtig: false,
                          forklaring: "Med flere A møder hver B en A oftere. Prøv 12 A og derefter 24 A." },
                        { tekst: "De halveres", rigtig: false,
                          forklaring: "Der bliver ikke mindre plads til at støde sammen. Der bliver flere at støde ind i." }
                    ],
                    hint: "Tænk på én B. Hvor mange A kan den ramme?",
                    opsaet: { opstilling: "opl", nA: 12, nB: 12 }
                };
            }
        },
        {
            id: "fordoblBegge",
            lav: function () {
                return {
                    tekst: "Du fordobler både A og B. Hvad sker der med sammenstødene mellem A og B pr. sekund?",
                    valg: [
                        { tekst: "De firdobles", rigtig: true,
                          forklaring: "Dobbelt så mange B, og hver af dem møder dobbelt så mange A: 2 · 2 = 4." },
                        { tekst: "De fordobles", rigtig: false,
                          forklaring: "Hver B møder dobbelt så mange A, og der er også dobbelt så mange B. Prøv 12 + 12 og 24 + 24." },
                        { tekst: "De er de samme", rigtig: false,
                          forklaring: "Der er både flere A og flere B at ramme. Prøv 12 + 12 og 24 + 24." }
                    ],
                    hint: "Først fordobles A. Hvad gør det? Så fordobles B oveni.",
                    opsaet: { opstilling: "opl", nA: 12, nB: 12 }
                };
            }
        },
        {
            id: "fladerUd",
            lav: function () {
                return {
                    tekst: "Hvorfor bliver kurven fladere, jo længere tid der går?",
                    valg: [
                        { tekst: "Der er færre A og B tilbage, så de støder sjældnere sammen", rigtig: true,
                          forklaring: "Hver reaktion fjerner en A og en B. Tælleren for sammenstød falder, og kurven flader ud." },
                        { tekst: "Partiklerne bliver langsommere", rigtig: false,
                          forklaring: "Farten er den samme hele tiden. Se på dem. Det er antallet, der falder." },
                        { tekst: "Produktet står i vejen", rigtig: false,
                          forklaring: "Produktet fylder lidt, men det er ikke grunden. Tæl A og B." },
                        { tekst: "Reaktionen løber tør for energi", rigtig: false,
                          forklaring: "Temperaturen er den samme hele tiden. Det er A og B, der løber tør." }
                    ],
                    hint: "Start forfra, og hold øje med tælleren for sammenstød, mens A og B bliver brugt.",
                    opsaet: { opstilling: "opl", nA: 12, nB: 12 }
                };
            }
        },
        {
            id: "pulver",
            lav: function () {
                return {
                    tekst: "Samme mængde magnesium som én klump og som pulver. Hvad giver flest H₂ pr. sekund?",
                    valg: [
                        { tekst: "Pulveret", rigtig: true,
                          forklaring: "Pulveret har større overflade. H⁺ kan ramme mange flere Mg-atomer ad gangen." },
                        { tekst: "Klumpen", rigtig: false,
                          forklaring: "Klumpen har lige så mange Mg-atomer, men de fleste sidder inde i den, hvor H⁺ ikke kan nå dem." },
                        { tekst: "De giver lige mange", rigtig: false,
                          forklaring: "Der er lige mange Mg-atomer, men ikke lige mange, som H⁺ kan nå. Prøv begge." }
                    ],
                    hint: "Hvilke Mg-atomer kan H⁺ ramme? Kun dem, der sidder yderst.",
                    opsaet: { opstilling: "metal", metal: "klump" }
                };
            }
        }
    ];

    /* ================================================================
       FANE 3: HASTIGHEDSUDTRYK
       Hastighedsudtrykkenes form er fra litteraturen. k er valgt, saa
       starthastigheden ved 0,10 M af alle reaktanter er et tal, der er
       let at regne med; for 2 NO + 2 H₂ er tallene fra kompendiets
       opgave (0,10 M og 0,10 M giver 1,2 mM/s).
       ================================================================ */
    D.KONC = [0.10, 0.20, 0.30];      /* M, de startkoncentrationer, man kan vaelge */
    D.MAKS_FORSOEG = 6;

    D.REAKTIONER = [
        { id: "no_h2", ligning: "2 NO(g) + 2 H₂(g) → N₂(g) + 2 H₂O(g)",
          reaktanter: [{ id: "NO", formel: "NO", koef: 2 }, { id: "H2", formel: "H₂", koef: 2 }],
          produkt: { id: "N2", formel: "N₂", koef: 1 }, orden: { NO: 2, H2: 1 }, k: 1.2 },
        { id: "h2_i2", ligning: "H₂(g) + I₂(g) → 2 HI(g)",
          reaktanter: [{ id: "H2", formel: "H₂", koef: 1 }, { id: "I2", formel: "I₂", koef: 1 }],
          produkt: { id: "HI", formel: "HI", koef: 2 }, orden: { H2: 1, I2: 1 }, k: 0.030 },
        { id: "n2o5", ligning: "2 N₂O₅(g) → 4 NO₂(g) + O₂(g)",
          reaktanter: [{ id: "N2O5", formel: "N₂O₅", koef: 2 }],
          produkt: { id: "O2", formel: "O₂", koef: 1 }, orden: { N2O5: 1 }, k: 5.0e-3 },
        { id: "no2_co", ligning: "NO₂(g) + CO(g) → NO(g) + CO₂(g)",
          reaktanter: [{ id: "NO2", formel: "NO₂", koef: 1 }, { id: "CO", formel: "CO", koef: 1 }],
          produkt: { id: "CO2", formel: "CO₂", koef: 1 }, orden: { NO2: 2, CO: 0 }, k: 0.20 },
        { id: "etbr", ligning: "CH₃CH₂Br(aq) + OH⁻(aq) → CH₃CH₂OH(aq) + Br⁻(aq)",
          reaktanter: [{ id: "EtBr", formel: "CH₃CH₂Br", koef: 1 }, { id: "OH", formel: "OH⁻", koef: 1 }],
          produkt: { id: "Br", formel: "Br⁻", koef: 1 }, orden: { EtBr: 1, OH: 1 }, k: 0.060 },
        { id: "tbubr", ligning: "(CH₃)₃CBr(aq) + OH⁻(aq) → (CH₃)₃COH(aq) + Br⁻(aq)",
          reaktanter: [{ id: "tBuBr", formel: "(CH₃)₃CBr", koef: 1 }, { id: "OH", formel: "OH⁻", koef: 1 }],
          produkt: { id: "Br", formel: "Br⁻", koef: 1 }, orden: { tBuBr: 1, OH: 0 }, k: 0.015 },
        { id: "no_o2", ligning: "2 NO(g) + O₂(g) → 2 NO₂(g)",
          reaktanter: [{ id: "NO", formel: "NO", koef: 2 }, { id: "O2", formel: "O₂", koef: 1 }],
          produkt: { id: "NO2", formel: "NO₂", koef: 2 }, orden: { NO: 2, O2: 1 }, k: 0.80 },
        { id: "bromat", ligning: "5 Br⁻(aq) + BrO₃⁻(aq) + 6 H⁺(aq) → 3 Br₂(aq) + 3 H₂O(l)",
          reaktanter: [{ id: "Br", formel: "Br⁻", koef: 5 }, { id: "BrO3", formel: "BrO₃⁻", koef: 1 }, { id: "H", formel: "H⁺", koef: 6 }],
          produkt: { id: "Br2", formel: "Br₂", koef: 3 }, orden: { Br: 1, BrO3: 1, H: 2 }, k: 24 }
    ];

    /* Hastighedsudtrykket som tekst: v(N₂) = k·[NO]²·[H₂]
       Eksponent 1 skrives ikke, og en reaktant med eksponent 0 er ikke med. */
    D.udtrykTekst = function (R, orden) {
        var s = "v(" + R.produkt.formel + ") = k";
        R.reaktanter.forEach(function (r) {
            var n = orden[r.id];
            if (n === 0) return;
            s += "·[" + r.formel + "]" + (n === 1 ? "" : NK.haevet(n));
        });
        return s;
    };

    NK.Data = D;
}());
