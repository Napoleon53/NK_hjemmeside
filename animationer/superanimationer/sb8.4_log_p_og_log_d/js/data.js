/* =====================================================================
   data.js - stofferne, modellen, trinnene og teksterne

   Alt, der kan staa som data, staar her. Ordene og tallene er Kemibogens
   (afsnit B8.4 Log P og log D): octan-1-ol og vand, fordelingskonstanten
   K_F = [stof i octanol] / [stof i vand], log P = log K_F, log D for en
   syre og en base, genvejen (log D falder 1 pr. pH-enhed) og optagelsen
   i kroppen. Acetylsalicylsyre (log P 1,2, pKₛ 3,5), amfetamin (log P 1,8,
   pKₛ 9,9), glucose (−3,0) og ibuprofen (4,0) er bogens tal. Paracetamol
   faar 15 og 5 molekyler i luppen, dvs. K_F = 3,0 og log P = 0,48 (bogen
   siger 0,5). Lidocain (log P 2,4, pKₛ 7,9) er det ukendte stof i fane 3
   og er tabelvaerdier efter hukommelsen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Farverne er bogens (b8-fordeling-octanol, b8-logd-syre-base,
       b8-membran) ---------------------------------------------------------- */
    D.FARVE = {
        octanol: "#f3e2a6",     /* det oeverste lag, svagt gult */
        octanolKant: "#b08a1e",
        octanolTekst: "#8a6514",
        vand: "#cfe4f5",        /* det nederste lag, svagt blaat */
        vandKant: "#3f7cb8",
        vandTekst: "#2c64a0",
        syre: "#a93226",        /* acetylsalicylsyres kurve og BH⁺ */
        base: "#1d4ed8",        /* amfetamins kurve og A⁻ */
        ukendt: "#7c3aed",      /* det ukendte stof */
        prik: "#0f766e",        /* punkterne paa kurven (bogens groenne) */
        blaek: "#14201f",
        daempet: "#556766",
        hydron: "#b45309"
    };

    D.ANTAL_MOL = 20;           /* molekylerne i luppen */
    D.PH_SKRIDT = 0.1;          /* skyderen gaar i trin paa 0,1 */
    D.DAEKNING = 0.95;          /* saa meget af pH 0-14 skal vaere tegnet */
    D.TEGNEFART = 4;            /* pH pr. sekund, mens kurven tegnes (som sb7.7) */
    D.Y_MIN = -5;               /* log D-aksen som i bogens figur */
    D.Y_MAX = 3;

    /* =====================================================================
       Stofferne. slags: "neutral" (hverken syre eller base), "syre" eller
       "base". pks gaelder for syren HA eller for basens ladede form BH⁺.
       u og ion er teksterne paa kuglerne i luppen.
       ===================================================================== */
    D.STOFFER = {
        para: { id: "para", navn: "paracetamol", logP: Math.log(3) / Math.LN10, slags: "neutral", om: "et smertestillende lægemiddel" },
        glu: { id: "glu", navn: "glucose", logP: -3.0, slags: "neutral", om: "fem OH-grupper" },
        ibu: { id: "ibu", navn: "ibuprofen", logP: 4.0, slags: "neutral", om: "en benzenring og to carbonkæder" },
        asa: { id: "asa", navn: "acetylsalicylsyre", logP: 1.2, pks: 3.5, slags: "syre", u: "HA", ion: "A^-", farve: "#a93226" },
        amf: { id: "amf", navn: "amfetamin", logP: 1.8, pks: 9.9, slags: "base", u: "B", ion: "BH^+", farve: "#1d4ed8" },
        lid: { id: "lid", navn: "lidocain", logP: 2.4, pks: 7.9, slags: "base", u: "B", ion: "BH^+", skjultU: "X", skjultIon: "ion", farve: "#7c3aed", skjult: "ukendt stof" }
    };

    /* Andelen af stoffet i vandet, der er uladet */
    D.uladet = function (s, ph) {
        if (s.slags === "syre") return 1 / (1 + Math.pow(10, ph - s.pks));
        if (s.slags === "base") return 1 / (1 + Math.pow(10, s.pks - ph));
        return 1;
    };

    /* log D som i bogen: log D = log P − log(1 + 10^(pH − pKₛ)) for en syre
       og med pKₛ − pH for en base */
    D.logD = function (s, ph) { return s.logP + Math.log(D.uladet(s, ph)) / Math.LN10; };

    /* Hvor mange af de 20 molekyler der er i octanol, uladede i vand og
       ioner i vand. Lige store rumfang: n(oct) / n(vand) = D. Tallene
       fordeles med stoerste rest, saa summen altid er 20. */
    D.fordeling = function (s, ph, n) {
        n = n || D.ANTAL_MOL;
        var d = Math.pow(10, D.logD(s, ph)), f = D.uladet(s, ph);
        var oct = n * d / (1 + d), vand = n / (1 + d);
        var r = [oct, vand * f, vand * (1 - f)];
        var hel = r.map(Math.floor), sum = hel[0] + hel[1] + hel[2];
        var rest = r.map(function (x, i) { return { i: i, r: x - hel[i] }; }).sort(function (p, q) { return q.r - p.r || p.i - q.i; });
        for (var k = 0; sum < n; k++, sum++) hel[rest[k % 3].i]++;
        return { oct: hel[0], u: hel[1], ion: hel[2] };
    };

    /* Kroppens omraader paa pH-aksen (bogens b8-fordeling-asa) */
    D.KROP = [
        { navn: "mavesæk", fra: 1, til: 3, farve: "rgba(240, 150, 130, 0.30)", tekst: "#a6452f" },
        { navn: "tyndtarm", fra: 6, til: 7, farve: "rgba(236, 200, 80, 0.38)", tekst: "#8a6514" },
        { navn: "blod", fra: 7.3, til: 7.5, farve: "rgba(90, 140, 230, 0.32)", tekst: "#2c64a0" }
    ];

    /* =====================================================================
       Fane 1: Log P. Fire trin med paracetamol og stof X.
         ryst   eleven klikker paa skilletragten, og stoffet fordeler sig
         tal    eleven taeller i luppen og skriver et tal
         x      stof X rystes, og eleven vaelger, hvilket stof det er
       ===================================================================== */
    D.LOGP = [
        {
            id: "ryst", slags: "ryst", navn: "Ryst skilletragten", stof: "para",
            tekst: "Skilletragten indeholder octan-1-ol over en opløsning af paracetamol i vand. Klik på skilletragten for at ryste den.",
            hint: ["Skilletragten står til venstre på tavlen.", "Klik én gang på glasset i skilletragten."],
            forkl: "Paracetamol har fordelt sig mellem de to lag. Fordelingen er en ligevægt: stof(vand) ⇌ stof(octanol)."
        },
        {
            id: "kf", slags: "tal", navn: "Fordelingskonstanten", felt: "K<sub>F</sub> =", maal: 3, tol: 0.051,
            tekst: "Luppen viser lige store rumfang af de to lag. Tæl molekylerne af paracetamol, og beregn fordelingskonstanten Kꜰ.",
            hint: ["Kꜰ = [stof i octanol] / [stof i vand]. Rumfangene er lige store, så du kan bruge antallet af molekyler.",
                   "Der er 15 molekyler i octanollaget og 5 i vandlaget."],
            fejl: [
                { lig: 1 / 3, tol: 0.02, t: "Du har divideret antallet i vand med antallet i octanol. Koncentrationen i octanol står i tælleren." },
                { lig: 15, tol: 0.01, t: "15 er antallet i octanollaget. Kꜰ er antallet i octanol divideret med antallet i vand." },
                { lig: 5, tol: 0.01, t: "5 er antallet i vandlaget. Kꜰ er antallet i octanol divideret med antallet i vand." },
                { lig: 20, tol: 0.01, t: "20 er alle molekylerne. Kꜰ er antallet i octanol divideret med antallet i vand." }
            ],
            fejlAndet: "Tæl igen. Der er flere molekyler i octanollaget end i vandlaget.",
            forkl: "Kꜰ = 15 / 5 = 3,0. Koncentrationen af paracetamol er 3 gange større i octanol end i vand."
        },
        {
            id: "logp", slags: "tal", navn: "Log P", felt: "log <i>P</i> =", maal: Math.log(3) / Math.LN10, tol: 0.025,
            tekst: "Beregn log P for paracetamol ud fra Kꜰ = 3,0.",
            hint: ["log P = log Kꜰ.", "Beregn log(3,0) på lommeregneren. Brug log, ikke ln."],
            fejl: [
                { lig: 3, tol: 0.01, t: "3,0 er Kꜰ. Log P er logaritmen til Kꜰ." },
                { lig: -Math.log(3) / Math.LN10, tol: 0.025, t: "Logaritmen til et tal over 1 er positiv." },
                { lig: Math.log(3), tol: 0.02, t: "Du har brugt ln. Brug log, logaritmen med grundtallet 10." }
            ],
            fejlAndet: "Log P er logaritmen til Kꜰ. Beregn log(3,0) på lommeregneren.",
            forkl: "log P = log(3,0) = 0,48. En positiv log P betyder, at der er mest stof i octanol."
        },
        {
            id: "x", slags: "x", navn: "Stof X", stof: "ibu",
            rystTekst: "Paracetamol er skiftet ud med et andet lægemiddel, stof X. Klik på skilletragten for at ryste den.",
            tekst: "Glucose har fem OH-grupper. Ibuprofen har en benzenring og to carbonkæder. Hvilket stof er X?",
            svar: ["glucose", "paracetamol", "ibuprofen"], rigtig: 2,
            hint: ["Se, hvor molekylerne af stof X er i luppen.", "Et hydrofobt stof går over i octan-1-ol. Benzenringe og carbonkæder hæver log P."],
            fejl: ["Glucose er hydrofilt og ville blive i vandlaget. Stof X er gået over i octanol.",
                   "Paracetamol fordelte sig med 15 i octanol og 5 i vand. Stof X er næsten kun i octanol."],
            forkl: "Stof X er ibuprofen med log P = 4,0. Koncentrationen er 10 000 gange større i octanol end i vand, så luppen viser næsten aldrig et molekyle i vandlaget."
        }
    ];
    D.LOGP_FAERDIG = "Du kan nu ryste de tre stoffer i panelet.";
    D.LOGP_STOFFER = ["glu", "para", "ibu"];

    /* =====================================================================
       Fane 2: Log D og pH. Acetylsalicylsyre, HA, med en pH-skyder.
         spor   eleven traekker skyderen fra pH 0 til 14, og kurven tegnes
         spm    et spoergsmaal med svar paa kortet
         tal    eleven regner og skriver et tal
       ===================================================================== */
    D.LOGD = [
        {
            id: "spor", slags: "spor", navn: "Tegn kurven",
            tekst: "Acetylsalicylsyre, HA, er rystet med octan-1-ol og vand. Træk pH-skyderen langsomt fra 0 til 14, og se, hvad der sker i luppen.",
            hint: ["pH-skyderen står under kurven.", "Træk knappen på skyderen helt fra pH 0 til pH 14."],
            forkl: "Kurven viser log D. Ved høj pH er acetylsalicylsyre blevet til ionen A⁻, og næsten alt stof er i vandlaget."
        },
        {
            id: "hvorfor", slags: "spm", navn: "Ionen bliver i vandet",
            tekst: "Hvorfor går acetylsalicylsyre næsten ikke over i octanol ved høj pH?",
            svar: ["Ionen A⁻ er ladet og bliver i vand", "Octan-1-ol bliver polært", "HA reagerer med octan-1-ol"], rigtig: 0,
            hint: ["Stil skyderen på pH 10, og se på luppen.", "De blå kugler er ionen A⁻. Der er ingen blå kugler i octanollaget."],
            fejl: [null, "Octan-1-ol er det samme stof ved alle pH. Se på molekylerne i vandlaget ved høj pH.",
                   "Der sker ingen reaktion med octan-1-ol. Se, hvilken form acetylsalicylsyre har i vandlaget ved høj pH."],
            forkl: "Ved høj pH afgiver HA en hydron og bliver til A⁻. Ionen er ladet, og kun den uladede form går over i octan-1-ol."
        },
        {
            id: "regn", slags: "tal", navn: "Log D i tyndtarmen", felt: "log <i>D</i> =", maal: 1.2 - Math.log(1001) / Math.LN10, tol: 0.051, ph: 6.5,
            punkt: "tyndtarm",
            tekst: "Beregn log D for acetylsalicylsyre i tyndtarmen ved pH 6,5. Acetylsalicylsyre har log P = 1,2 og pKₛ = 3,5.",
            formel: "For en syre: log <i>D</i> = log <i>P</i> − log(1 + 10<sup>pH − p<i>K</i><sub>s</sub></sup>)",
            hint: ["Sæt tallene ind: log D = 1,2 − log(1 + 10^(6,5 − 3,5)).", "10^(6,5 − 3,5) = 10^3 = 1000, og log(1 + 1000) = 3,0. Træk 3,0 fra 1,2."],
            fejl: [
                { lig: 1.2, tol: 0.03, t: "Du har byttet om på pH og pKₛ. For en syre står pH først: 10^(6,5 − 3,5)." },
                { lig: 1.8, tol: 0.06, t: "Fortegnet er forkert. Log D er mindre end log P, når en del af stoffet er ladet." },
                { lig: 1.2 - 1001, tol: 2, t: "Husk log foran parentesen: log(1 + 1000) = 3,0." },
                { lig: 1.2 - 1000, tol: 2, t: "Husk log foran parentesen: log(1 + 1000) = 3,0." },
                { lig: -3, tol: 0.03, t: "−3,0 er kun det sidste led. Træk 3,0 fra log P = 1,2." }
            ],
            fejlAndet: "Regn trin for trin: først 10^(6,5 − 3,5), så log(1 + 1000) og til sidst 1,2 minus resultatet.",
            forkl: "log D = 1,2 − log(1 + 10^(6,5 − 3,5)) = 1,2 − 3,0 = −1,8. Kurven viser det samme ved pH 6,5."
        },
        {
            id: "genvej", slags: "spm", navn: "Genvejen",
            tekst: "Ved pH over pKₛ = 3,5 er kurven en ret linje. Hvor meget falder log D, når pH stiger med 1?",
            svar: ["0,1", "1", "3,5", "10"], rigtig: 1,
            hint: ["Stil skyderen på pH 6, og aflæs log D. Gør det samme ved pH 7.", "Ved pH 6 er log D ca. −1,3, og ved pH 7 er log D ca. −2,3."],
            fejl: ["Stil skyderen på pH 6 og pH 7, og aflæs log D begge steder.", null,
                   "3,5 er pKₛ, hvor kurven knækker. Se på, hvor meget kurven falder fra pH 6 til pH 7.",
                   "D bliver 10 gange mindre, men log D falder med log(10) = 1."],
            forkl: "Log D falder med 1 for hver pH-enhed. For hver pH-enhed bliver der 10 gange så mange ioner pr. uladet molekyle."
        }
    ];
    D.LOGD_FAERDIG = "Skyderen er fri, og du kan selv undersøge kurven.";

    /* =====================================================================
       Fane 3: Syre eller base. Amfetamin, B, og til sidst et ukendt stof.
       ===================================================================== */
    D.BASE = [
        {
            id: "spor", slags: "spor", navn: "Tegn kurven for basen",
            tekst: "Amfetamin er en base, B. Basen kan optage en hydron og blive til ionen BH⁺. Træk pH-skyderen fra 0 til 14.",
            hint: ["pH-skyderen står under kurven.", "Træk knappen på skyderen helt fra pH 0 til pH 14."],
            forkl: "Kurven for basen er spejlvendt i forhold til kurven for syren. Amfetamin er uladet og går over i octan-1-ol ved høj pH."
        },
        {
            id: "regn", slags: "tal", navn: "Log D i blodet", felt: "log <i>D</i> ≈", maal: 1.8 - (9.9 - 7.4), tol: 0.051, ph: 7.4,
            punkt: "blod",
            tekst: "Beregn log D for amfetamin i blodet ved pH 7,4. Amfetamin har log P = 1,8 og pKₛ = 9,9.",
            formel: "Genvejen for en base: log <i>D</i> ≈ log <i>P</i> − (p<i>K</i><sub>s</sub> − pH)",
            hint: ["Sæt tallene ind: log D ≈ 1,8 − (9,9 − 7,4).", "9,9 − 7,4 = 2,5. Træk 2,5 fra 1,8."],
            fejl: [
                { lig: 1.8 - (7.4 - 9.9), tol: 0.03, t: "For en base står pKₛ først: pKₛ − pH = 9,9 − 7,4." },
                { lig: 0.7, tol: 0.03, t: "Fortegnet er forkert. 1,8 − 2,5 er et negativt tal." },
                { lig: -2.5, tol: 0.03, t: "−2,5 er kun parentesen. Træk 2,5 fra log P = 1,8." },
                { lig: 2.5, tol: 0.03, t: "2,5 er kun parentesen. Træk 2,5 fra log P = 1,8." }
            ],
            fejlAndet: "Regn først parentesen 9,9 − 7,4, og træk den fra log P = 1,8.",
            forkl: "log D ≈ 1,8 − (9,9 − 7,4) = −0,7. Genvejen kan bruges, fordi pH ligger mere end 1,5 fra pKₛ."
        },
        {
            id: "krop", slags: "spm", navn: "Optagelsen i kroppen", krop: true,
            tekst: "Kun den uladede form kan passere tarmens cellemembraner. Hvor bliver amfetamin bedst optaget?",
            svar: ["i mavesækken", "i tyndtarmen"], rigtig: 1,
            hint: ["Mavesækken og tyndtarmen er farvet på kurven. Stil skyderen i hvert område.", "Log D er højest dér, hvor flest molekyler er uladede."],
            fejl: ["Stil skyderen i mavesækken. Amfetamin er næsten kun ionen BH⁺, og log D er meget lav.", null],
            forkl: "I tyndtarmen er pH højere, så flere molekyler er uladede, og log D er højere. Amfetamin bliver derfor først optaget i tyndtarmen."
        },
        {
            id: "ukendt", slags: "ukendt", navn: "Et ukendt stof", stof: "lid", felt: "log <i>P</i> =", maal: 2.4, tol: 0.21,
            tekst: "Et ukendt lægemiddel er rystet med octan-1-ol og vand. Træk pH-skyderen fra 0 til 14. Hvad er log P, og er stoffet en syre eller en base?",
            svar: ["en syre", "en base"], rigtig: 1,
            hint: ["Træk skyderen hele vejen fra pH 0 til 14, så hele kurven bliver tegnet.",
                   "Log P er højden af den vandrette del af kurven, hvor stoffet er uladet. En base er uladet ved høj pH."],
            fejlSlags: "Kurven er højest ved høj pH. Hvilken slags stof er uladet ved høj pH?",
            fejlLogP: "Log P er højden af den vandrette del af kurven, hvor stoffet er uladet.",
            fejlIntet: "Vælg syre eller base, og skriv log P.",
            forkl: "Stoffet er lidocain, som bruges til lokalbedøvelse. Lidocain er en base med log P = 2,4 og pKₛ = 7,9."
        }
    ];
    D.BASE_FAERDIG = "Du kan nu vælge et stof i panelet og tegne dets kurve.";
    D.BASE_STOFFER = ["asa", "amf", "lid"];

    /* ----- Tal og tekst ---------------------------------------------------- */
    D.komma1 = function (v) { return (Math.round(v * 10) / 10).toFixed(1).replace(".", ",").replace("-", "−"); };
    D.komma2 = function (v) { return (Math.round(v * 100) / 100).toFixed(2).replace(".", ",").replace("-", "−"); };

    /* Et tal, eleven har skrevet: komma eller punktum, minus som − eller - */
    D.laesTal = function (s) {
        s = String(s || "").replace(/log|K_?F|Kꜰ|P|D|≈|=|\s/gi, "").replace(",", ".").replace(/[−–]/g, "-");
        if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
        return parseFloat(s);
    };

    /* Saenkede tegn som HTML (<sub>): tal, s og F (pKₛ og Kꜰ) */
    var SAENKET = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
                    "ₛ": "s", "ꜰ": "F" };
    D.sub = function (html) {
        return String(html).replace(/[₀-₉ₛꜰ]+/g, function (m) {
            return "<sub>" + m.split("").map(function (c) { return SAENKET[c]; }).join("") + "</sub>";
        }).replace(/A⁻/g, "A<sup>−</sup>").replace(/BH⁺/g, "BH<sup>+</sup>");
    };

    NK.Data = D;
}());
