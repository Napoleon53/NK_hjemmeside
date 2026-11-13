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
        lid: { id: "lid", navn: "lidocain", logP: 2.4, pks: 7.9, slags: "base", u: "B", ion: "BH^+", farve: "#7c3aed" },
        z: { id: "z", navn: "stof Z", logP: Math.log(9) / Math.LN10, slags: "neutral" }
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
       Fane 1: Log P. Fire trin med paracetamol og stof X (glucose eller
       ibuprofen), saa tre ekstraopgaver uden hints.
         ryst   eleven klikker paa skilletragten, og stoffet fordeler sig
         tal    eleven taeller i luppen og skriver et tal (ryst: skilletragten
                skal rystes foerst)
         x      stof X rystes, og eleven vaelger mellem de to strukturformler
       Strukturformlerne staar til hoejre paa tavlen (js/struktur.js).
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
            forkl: "log P = log(3,0) = 0,48. Benzenringen i paracetamol er upolær, men OH-gruppen og amidgruppen danner hydrogenbindinger til vand. Derfor er log P tæt på 0."
        },
        {
            id: "x", slags: "x", navn: "Glucose eller ibuprofen", stof: "ibu",
            rystTekst: "Stof X er enten glucose eller ibuprofen. Se på de to strukturformler til højre, og klik på skilletragten for at ryste den.",
            tekst: "Glucose har fem OH-grupper. Ibuprofen har en benzenring og to carbonkæder. Hvilket af de to stoffer er X?",
            svar: ["glucose", "ibuprofen"], rigtig: 1,
            hint: ["Se, i hvilket lag molekylerne af stof X er i luppen.",
                   "OH-grupper danner hydrogenbindinger til vand. Benzenringe og carbonkæder er upolære og går over i octan-1-ol."],
            fejl: ["Glucose er hydrofilt og bliver i vandlaget. Stof X er gået over i octan-1-ol.", null],
            forkl: "Stof X er ibuprofen med log P = 4,0. Koncentrationen er 10 000 gange større i octanol end i vand, så luppen viser næsten aldrig et molekyle i vandlaget."
        }
    ];
    D.LOGP_FAERDIG = "Ekstraopgaverne står i panelet.";
    D.LOGP_STOFFER = ["glu", "para", "ibu"];

    /* Ekstraopgaver uden hints (kun Vis svaret) */
    D.LOGP_EKSTRA = [
        {
            id: "z", slags: "tal", ryst: true, stof: "z", navn: "Stof Z", felt: "log <i>P</i> =", maal: Math.log(9) / Math.LN10, tol: 0.025,
            tekst: "Ryst skilletragten med stof Z, og beregn log P for stof Z.",
            fejl: [
                { lig: 9, tol: 0.01, t: "9,0 er Kꜰ. Log P er logaritmen til Kꜰ." },
                { lig: -Math.log(9) / Math.LN10, tol: 0.025, t: "Du har divideret antallet i vand med antallet i octanol." }
            ],
            fejlAndet: "Tæl molekylerne i de to lag, beregn Kꜰ, og tag logaritmen.",
            forkl: "Kꜰ = 18 / 2 = 9,0, og log P = log(9,0) = 0,95."
        },
        {
            id: "ibu", slags: "tal", navn: "Ibuprofen", felt: "Svar:", maal: 10000, tol: 0.5,
            tekst: "Ibuprofen har log P = 4,0. Hvor mange gange større er koncentrationen af ibuprofen i octanol end i vand?",
            fejl: [{ lig: 4, tol: 0.01, t: "4,0 er log P. Kꜰ er 10 opløftet til log P." }, { lig: 40, tol: 0.01, t: "Kꜰ er 10 opløftet til log P, ikke 10 gange log P." }],
            fejlAndet: "Kꜰ er 10 opløftet til log P.",
            forkl: "Kꜰ = 10^4,0 = 10 000. Koncentrationen er 10 000 gange større i octanol end i vand."
        },
        {
            id: "glu", slags: "tal", navn: "Glucose", felt: "Svar:", maal: 1000, tol: 0.5,
            tekst: "Glucose har log P = −3,0. Hvor mange gange større er koncentrationen af glucose i vand end i octanol?",
            fejl: [{ lig: 0.001, tol: 0.00001, t: "0,001 er Kꜰ. Koncentrationen i vand er 1 / Kꜰ gange større." }, { lig: 3, tol: 0.01, t: "3 er log P uden fortegn. Beregn først Kꜰ = 10^−3,0." }],
            fejlAndet: "Beregn Kꜰ = 10^−3,0, og divider 1 med Kꜰ.",
            forkl: "Kꜰ = 10^−3,0 = 0,001. Koncentrationen er 1 / 0,001 = 1000 gange større i vand end i octanol."
        }
    ];

    /* =====================================================================
       Fane 2: Log D og pH. Acetylsalicylsyre, HA, med en pH-skyder.
       Kvalitativt (brugeren 13. nov. 2026: "rolig kvalitativ måde",
       formlen er ikke kemi A-pensum og ligger bag kontakten Svær).
         spm    et spoergsmaal med svar paa kortet
         spor   eleven traekker skyderen fra pH 0 til 14, og kurven tegnes
         tal    eleven aflaeser eller regner og skriver et tal
         find   eleven stiller skyderen og trykker Indsend svar
       ===================================================================== */
    D.LOGD = [
        {
            id: "form", slags: "spm", navn: "Den uladede form",
            tekst: "Acetylsalicylsyre, HA, kan afgive en hydron og blive til ionen A⁻. Se på strukturformlerne under luppen. Hvilken form går over i octan-1-ol?",
            svar: ["HA, den uladede syre", "A⁻, den negative ion", "begge former"], rigtig: 0,
            hint: ["Octan-1-ol er næsten upolært og ligner fedt. Lige opløser lige.",
                   "Ionen A⁻ er ladet. Ladede partikler bliver i det polære vand."],
            fejl: [null, "Ionen A⁻ er ladet. Ladede partikler opløses godt i vand, men ikke i octan-1-ol.",
                   "Kun den ene form går over i octan-1-ol. Se, hvilken form der er ladet."],
            forkl: "Den uladede syre HA går over i octan-1-ol. Ionen A⁻ er ladet og bliver i det polære vand."
        },
        {
            id: "spor", slags: "spor", navn: "Tegn kurven",
            tekst: "Vandlagets pH bestemmes af skyderen. Træk pH-skyderen langsomt fra 0 til 14, og se, hvad der sker i luppen.",
            hint: ["pH-skyderen står under kurven.", "Træk knappen på skyderen helt fra pH 0 til pH 14."],
            forkl: "Ved høj pH afgiver HA en hydron og bliver til A⁻, som bliver i vandet. Kurven viser log D, og den falder, når syren bliver til ionen."
        },
        {
            id: "krop", slags: "spm", navn: "Mavesæk eller blod", krop: true,
            tekst: "Kroppens områder er farvet på kurven. Hvor går acetylsalicylsyre lettest over i cellernes fedt, i mavesækken eller i blodet?",
            svar: ["i mavesækken", "i blodet"], rigtig: 0,
            hint: ["Stil skyderen i mavesækken og derefter i blodet. Se på luppen og kurven.", "Jo højere log D er, jo lettere går stoffet over i fedt."],
            fejl: [null, "I blodet ved pH 7,4 er acetylsalicylsyre næsten kun ionen A⁻, og log D er meget lav."],
            forkl: "I mavesækken er acetylsalicylsyre næsten kun den uladede syre HA, og log D er høj. Syren kan derfor begynde at blive optaget allerede i mavesækken."
        },
        {
            id: "logp", slags: "tal", navn: "Log D og log P", felt: "log <i>D</i> =", maal: 1.2, tol: 0.151, ph: 1.5, punkt: "mavesæk",
            tekst: "Ved lav pH er acetylsalicylsyre næsten kun HA. Aflæs log D i mavesækken ved pH 1,5 på kurven.",
            hint: ["Stil skyderen på pH 1,5, og se, i hvilken højde prikken står på kurven.", "Kurven er vandret ved lav pH, og den vandrette del ligger lidt over 1."],
            fejl: [{ lig: 1.5, tol: 0.05, t: "1,5 er pH. Aflæs højden af kurven på log D-aksen ved pH 1,5." }],
            fejlAndet: "Find pH 1,5 under kurven, og aflæs log D på den lodrette akse.",
            forkl: "Log D er 1,2, og det er log P for acetylsalicylsyre. Når stoffet er uladet, er log D lig med log P."
        },
        {
            id: "genvej", slags: "spm", navn: "Kurven falder",
            tekst: "Ved pH over pKₛ = 3,5 er kurven en ret linje. Hvor meget falder log D, når pH stiger med 1?",
            svar: ["0,1", "1", "3,5", "10"], rigtig: 1,
            hint: ["Stil skyderen på pH 6, og aflæs log D. Gør det samme ved pH 7.", "Ved pH 6 er log D ca. −1,3, og ved pH 7 er log D ca. −2,3."],
            fejl: ["Stil skyderen på pH 6 og pH 7, og aflæs log D begge steder.", null,
                   "3,5 er pKₛ, hvor kurven knækker. Se på, hvor meget kurven falder fra pH 6 til pH 7.",
                   "D bliver 10 gange mindre, men log D falder med log(10) = 1."],
            forkl: "Log D falder med 1 for hver pH-enhed. For hver pH-enhed bliver der 10 gange så mange ioner pr. uladet molekyle."
        }
    ];
    D.LOGD_FAERDIG = "Ekstraopgaverne står i panelet.";

    /* pH, hvor to stoffer har samme log D, eller hvor log D = 0 (halvering) */
    D.lovD = function (f, a, b) {
        for (var i = 0; i < 60; i++) { var m = (a + b) / 2; if ((f(a) > 0) === (f(m) > 0)) a = m; else b = m; }
        return (a + b) / 2;
    };

    D.LOGD_EKSTRA = [
        {
            id: "lige", slags: "find", navn: "Lige meget i begge lag", tol: 0.21,
            maal: D.lovD(function (ph) { return D.logD(D.STOFFER.asa, ph); }, 0, 14),
            tekst: "Find den pH, hvor koncentrationen af acetylsalicylsyre er lige stor i octanol og i vand.",
            fejlLav: "Ved pH {ph} er koncentrationen størst i octanol.", fejlHoej: "Ved pH {ph} er koncentrationen størst i vand.",
            forkl: "Ved pH 4,7 er log D = 0, så D = 1. Koncentrationen er lige stor i de to lag."
        },
        {
            id: "gange", slags: "tal", navn: "Hvor mange gange?", felt: "Svar:", maal: Math.pow(10, 1.2) / 1.01, tol: 1.3,
            tekst: "Hvor mange gange større er koncentrationen af acetylsalicylsyre i octanol end i vand i mavesækken ved pH 1,5?",
            fejl: [{ lig: 1.2, tol: 0.05, t: "1,2 er log D. D er 10 opløftet til log D." }, { lig: 12, tol: 0.05, t: "D er 10 opløftet til log D, ikke 10 gange log D." }],
            fejlAndet: "Aflæs log D, og beregn D = 10^log D.",
            forkl: "Log D = 1,2, så D = 10^1,2 = 16. Koncentrationen er ca. 16 gange større i octanol end i vand."
        },
        {
            id: "regn", slags: "tal", svaer: true, navn: "Log D med formlen", felt: "log <i>D</i> =", maal: 1.2 - Math.log(1001) / Math.LN10, tol: 0.051, ph: 6.5,
            punkt: "tyndtarm",
            tekst: "Beregn log D for acetylsalicylsyre i tyndtarmen ved pH 6,5. Acetylsalicylsyre har log P = 1,2 og pKₛ = 3,5.",
            formel: "For en syre: log <i>D</i> = log <i>P</i> − log(1 + 10<sup>pH − p<i>K</i><sub>s</sub></sup>)",
            fejl: [
                { lig: 1.2, tol: 0.03, t: "Du har byttet om på pH og pKₛ. For en syre står pH først: 10^(6,5 − 3,5)." },
                { lig: 1.8, tol: 0.06, t: "Fortegnet er forkert. Log D er mindre end log P, når en del af stoffet er ladet." },
                { lig: 1.2 - 1001, tol: 2, t: "Husk log foran parentesen: log(1 + 1000) = 3,0." },
                { lig: 1.2 - 1000, tol: 2, t: "Husk log foran parentesen: log(1 + 1000) = 3,0." },
                { lig: -3, tol: 0.03, t: "−3,0 er kun det sidste led. Træk 3,0 fra log P = 1,2." }
            ],
            fejlAndet: "Regn trin for trin: først 10^(6,5 − 3,5), så log(1 + 1000) og til sidst 1,2 minus resultatet.",
            forkl: "log D = 1,2 − log(1 + 10^(6,5 − 3,5)) = 1,2 − 3,0 = −1,8. Kurven viser det samme ved pH 6,5."
        }
    ];

    /* =====================================================================
       Fane 3: Syre eller base. Amfetamin, B, og til sidst lidocain.
       ===================================================================== */
    D.BASE = [
        {
            id: "spor", slags: "spor", navn: "Tegn kurven for basen",
            tekst: "Amfetamin er en base, B. Basen kan optage en hydron og blive til ionen BH⁺. Træk pH-skyderen fra 0 til 14.",
            hint: ["pH-skyderen står under kurven.", "Træk knappen på skyderen helt fra pH 0 til pH 14."],
            forkl: "Kurven for basen er spejlvendt i forhold til kurven for syren. Amfetamin er uladet og går over i octan-1-ol ved høj pH."
        },
        {
            id: "hvorfor", slags: "spm", navn: "Basen bliver uladet",
            tekst: "Se på strukturformlerne under luppen. Hvorfor stiger log D for amfetamin, når pH stiger?",
            svar: ["BH⁺ afgiver H⁺ og bliver uladet", "B optager H⁺ og bliver ladet", "Octan-1-ol bliver polært"], rigtig: 0,
            hint: ["Stil skyderen på pH 12, og se på luppen.", "Ved høj pH er der kun grå kugler, B, og de er i octanollaget."],
            fejl: [null, "B optager en hydron ved lav pH. Så bliver amfetamin ladet, og log D falder.",
                   "Octan-1-ol er det samme stof ved alle pH. Se, hvilken form amfetamin har ved høj pH."],
            forkl: "Ved høj pH afgiver BH⁺ en hydron og bliver til den uladede base B. B går over i octan-1-ol, og log D stiger."
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
            id: "lidocain", slags: "spm", navn: "Lidocain", stof: "lid", krop: true,
            tekst: "Lidocain er en anden base. Træk pH-skyderen fra 0 til 14. Hvilken base går lettest over i fedt i blodet ved pH 7,4?",
            svar: ["amfetamin", "lidocain"], rigtig: 1,
            hint: ["Stil skyderen på blodets pH, 7,4, og sammenlign de to kurver.", "Den kurve, der ligger højest ved pH 7,4, har den højeste log D."],
            fejl: ["Ved pH 7,4 ligger kurven for lidocain højere end kurven for amfetamin.", null],
            forkl: "Ved pH 7,4 er log D ca. 1,8 for lidocain og ca. −0,7 for amfetamin. Lidocain går derfor lettest over i fedt."
        }
    ];
    D.BASE_FAERDIG = "Ekstraopgaverne står i panelet.";
    D.BASE_STOFFER = ["asa", "amf", "lid"];

    D.BASE_EKSTRA = [
        {
            id: "nul", slags: "find", stof: "amf", navn: "Lige meget i begge lag", tol: 0.21,
            maal: D.lovD(function (ph) { return -D.logD(D.STOFFER.amf, ph); }, 0, 14),
            tekst: "Find den pH, hvor koncentrationen af amfetamin er lige stor i octanol og i vand.",
            fejlLav: "Ved pH {ph} er koncentrationen størst i vand.", fejlHoej: "Ved pH {ph} er koncentrationen størst i octanol.",
            forkl: "Ved pH 8,1 er log D = 0, og koncentrationen af amfetamin er lige stor i de to lag."
        },
        {
            id: "kryds", slags: "find", stof: "amf", navn: "Samme log D", tol: 0.21,
            maal: D.lovD(function (ph) { return D.logD(D.STOFFER.asa, ph) - D.logD(D.STOFFER.amf, ph); }, 0, 14),
            tekst: "Find den pH, hvor acetylsalicylsyre og amfetamin har samme log D.",
            fejlLav: "Ved pH {ph} har acetylsalicylsyre den højeste log D.", fejlHoej: "Ved pH {ph} har amfetamin den højeste log D.",
            forkl: "Ved pH 6,4 er log D ca. −1,7 for begge stoffer. Det er dér, de to kurver krydser."
        },
        {
            id: "regn", slags: "tal", svaer: true, stof: "amf", navn: "Log D med genvejen", felt: "log <i>D</i> ≈", maal: 1.8 - (9.9 - 7.4), tol: 0.051, ph: 7.4,
            punkt: "blod",
            tekst: "Beregn log D for amfetamin i blodet ved pH 7,4. Amfetamin har log P = 1,8 og pKₛ = 9,9.",
            formel: "Genvejen for en base: log <i>D</i> ≈ log <i>P</i> − (p<i>K</i><sub>s</sub> − pH)",
            fejl: [
                { lig: 1.8 - (7.4 - 9.9), tol: 0.03, t: "For en base står pKₛ først: pKₛ − pH = 9,9 − 7,4." },
                { lig: 0.7, tol: 0.03, t: "Fortegnet er forkert. 1,8 − 2,5 er et negativt tal." },
                { lig: -2.5, tol: 0.03, t: "−2,5 er kun parentesen. Træk 2,5 fra log P = 1,8." },
                { lig: 2.5, tol: 0.03, t: "2,5 er kun parentesen. Træk 2,5 fra log P = 1,8." }
            ],
            fejlAndet: "Regn først parentesen 9,9 − 7,4, og træk den fra log P = 1,8.",
            forkl: "log D ≈ 1,8 − (9,9 − 7,4) = −0,7. Genvejen kan bruges, fordi pH ligger mere end 1,5 fra pKₛ."
        }
    ];

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
        }).replace(/A⁻/g, "A<sup>−</sup>").replace(/BH⁺/g, "BH<sup>+</sup>").replace(/H⁺/g, "H<sup>+</sup>")
          .replace(/10\^\(([^)]*)\)/g, "10<sup>$1</sup>").replace(/10\^(−?[0-9]+(?:,[0-9]+)?)/g, "10<sup>$1</sup>");
    };

    NK.Data = D;
}());
