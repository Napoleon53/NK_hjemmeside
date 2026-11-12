/* =====================================================================
   data.js - opgaverne, trinnene, teksterne og tallene

   Alt, der kan staa som data, staar her. Ordene og tallene er Kemibogens
   (afsnit B7.7 Aminosyrer): aminogruppe, carboxylgruppe, sidekaede,
   amfoion, syreform med ladningen +1, baseform med ladningen −1,
   fordelingsdiagram, pH = pKₛ, hvor to kurver krydser, og det
   isoelektriske punkt som gennemsnittet af de to pKₛ-vaerdier. Valins
   pKₛ-vaerdier (2,32 og 9,62) og pHᵢₛₒ = 5,97 er bogens regneeksempel.
   Glycin er ikke med: hans isoelektriske punkt er elevernes eget forsoeg.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Farverne er bogens (b7-amfoion og b7-aminosyre-fordeling) ------ */
    D.FARVE = {
        syre: "#a93226",       /* gruppen med hydronen, syreformen */
        amfo: "#0f766e",       /* amfoionen: bogens groenne */
        base: "#1d4ed8",       /* gruppen uden hydronen, baseformen */
        hydron: "#b45309",     /* hydronen, der flytter (orange som i bogen) */
        blaek: "#14201f",
        daempet: "#556766"
    };

    /* =====================================================================
       Aminosyrerne. Hver gruppe har sin pKₛ-vaerdi (for den form, der har
       hydronen). amino: −NH₃⁺ / −NH₂, carboxyl: −COOH / −COO⁻.
       Valin er bogens tal; asparaginsyre og lysin er tabelvaerdier.
       ===================================================================== */
    D.AMINOSYRER = {
        val: { id: "val", navn: "valin", kort: "Val", side: "val", om: "upolær sidekæde",
               grupper: { carboxyl: 2.32, amino: 9.62 } },
        asp: { id: "asp", navn: "asparaginsyre", kort: "Asp", side: "asp", om: "sur sidekæde",
               grupper: { carboxyl: 1.88, amino: 9.60, side: 3.65 }, sideSlags: "carboxyl" },
        lys: { id: "lys", navn: "lysin", kort: "Lys", side: "lys", om: "basisk sidekæde",
               grupper: { carboxyl: 2.18, amino: 8.95, side: 10.53 }, sideSlags: "amino" },
        glu: { id: "glu", navn: "glutaminsyre", kort: "Glu", side: "ukendt", n: 2, ende: "carboxyl", om: "sur sidekæde",
               grupper: { carboxyl: 2.19, amino: 9.67, side: 4.25 }, sideSlags: "carboxyl" }
    };

    /* De ukendte aminosyrer sidst i fane 3: n CH₂-grupper i sidekæden og en
       gruppe for enden, som eleven skal finde ud fra forsoeget */
    D.UKENDTE = {
        x: { id: "x", navn: "X", kort: "X", n: 2, facit: "carboxyl", rigtig: "glu" },
        y: { id: "y", navn: "Y", kort: "Y", n: 4, facit: "amino", rigtig: "lys" }
    };
    D.UKENDT_RAEKKE = ["x", "y"];
    D.ENDER = ["CH3", "OH", "carboxyl", "amino"];
    D.ENDE_TEKST = { CH3: "−CH₃", OH: "−OH", carboxyl: "−COOH", amino: "−NH₂" };
    D.ENDE_PKS = { carboxyl: 4.25, amino: 10.53 };
    D.VALIN = D.AMINOSYRER.val;
    D.PKS1 = D.VALIN.grupper.carboxyl;      /* syreformen afgiver en hydron fra −COOH */
    D.PKS2 = D.VALIN.grupper.amino;         /* amfoionen afgiver en hydron fra −NH₃⁺ */
    D.ISO = (D.PKS1 + D.PKS2) / 2;          /* 5,97 */

    /* Andelen af valins tre former ved en bestemt pH (bogens fordelingsdiagram) */
    D.andele = function (ph) {
        var h = Math.pow(10, -ph), k1 = Math.pow(10, -D.PKS1), k2 = Math.pow(10, -D.PKS2);
        var n = h * h + k1 * h + k1 * k2;
        return { syre: h * h / n, amfo: k1 * h / n, base: k1 * k2 / n };
    };

    /* Hvor stor en del af en gruppe der har sin hydron */
    D.protoneret = function (pks, ph) { return 1 / (1 + Math.pow(10, ph - pks)); };

    /* Den samlede ladning (som gennemsnit) af en aminosyre ved en pH */
    D.ladning = function (aa, ph) {
        var q = 0;
        Object.keys(aa.grupper).forEach(function (g) {
            var slags = g === "side" ? aa.sideSlags : g, f = D.protoneret(aa.grupper[g], ph);
            q += slags === "amino" ? f : -(1 - f);
        });
        return q;
    };

    /* Den form, der er mest af: 1 for hver gruppe, der har sin hydron */
    D.tilstand = function (aa, ph) {
        var t = {};
        Object.keys(aa.grupper).forEach(function (g) { t[g] = ph < aa.grupper[g] ? 1 : 0; });
        return t;
    };

    /* Ladningen af en tilstand (et helt tal) */
    D.tilstandLadning = function (aa, t) {
        var q = 0;
        Object.keys(aa.grupper).forEach(function (g) {
            var slags = g === "side" ? aa.sideSlags : g;
            if (slags === "amino" && t[g]) q += 1;
            if (slags === "carboxyl" && !t[g]) q -= 1;
        });
        return q;
    };

    /* Navnet paa valins form ud fra grupperne (null for den uladede formel) */
    D.formNavn = function (t) {
        if (t.amino && t.carboxyl) return "syreform";
        if (t.amino && !t.carboxyl) return "amfoion";
        if (!t.amino && !t.carboxyl) return "baseform";
        return null;
    };
    D.formFarve = function (navn) { return navn === "syreform" ? D.FARVE.syre : (navn === "baseform" ? D.FARVE.base : D.FARVE.amfo); };

    /* =====================================================================
       Fane 1: Tre former. Tre trin med valin.
         traek   eleven traekker hydronen fra carboxylgruppen til
                 aminogruppen; bagefter et spoergsmaal om ladningen
         klik    eleven klikker paa den gruppe, der optager eller afgiver en
                 hydron; bagefter kommer oxoniumionen eller hydroxidionen
       ===================================================================== */
    D.FORMER = [
        {
            id: "amfoion", slags: "traek", navn: "Amfoionen",
            traekTekst: "En aminosyre har en sur og en basisk gruppe, så der kan ske en hydronoverførsel inden i molekylet. Træk hydronen fra carboxylgruppen over til aminogruppen.",
            traekHint: ["Hydronen er det orange H i carboxylgruppen til højre.",
                        "Træk det orange H hen på gruppen −NH₂ til venstre, og slip det dér."],
            tekst: "Hvilken samlet ladning har den ion, der er dannet?",
            svar: ["+1", "0", "−1"], rigtig: 1,
            fejl: { 0: "Ionen har også en negativ ladning på gruppen −COO⁻. Læg de to ladninger sammen.",
                    2: "Ionen har også en positiv ladning på gruppen −NH₃⁺. Læg de to ladninger sammen." },
            hint: ["Find ladningen på hver af de to grupper.",
                   "Gruppen −NH₃⁺ har ladningen +1, og gruppen −COO⁻ har ladningen −1."],
            forkl: "Ionen har en positiv og en negativ ladning, så den samlede ladning er 0. En sådan ion kaldes en amfoion. I vand findes valin næsten kun som amfoion."
        },
        {
            id: "sur", slags: "klik", navn: "Sur opløsning",
            tekst: "Der tilsættes saltsyre til opløsningen, så pH falder til 1. Hvilken gruppe optager en hydron? Klik på den, og tryk Indsend svar.",
            rigtig: "carboxyl",
            fejl: { amino: "Gruppen −NH₃⁺ har allerede optaget en hydron. Find den gruppe, der kan optage en." },
            hint: ["Kun en gruppe, der har afgivet sin hydron, kan optage en ny.",
                   "Gruppen −COO⁻ kan optage en hydron og blive til −COOH."],
            forkl: "Gruppen −COO⁻ optager en hydron fra en oxoniumion og bliver til −COOH. Derved dannes syreformen med den samlede ladning +1.",
            reak: { slags: "giv", partner: "H3O", ph0: 7, ph1: 1 }
        },
        {
            id: "basisk", slags: "klik", navn: "Basisk opløsning",
            forTekst: "Der tilsættes natriumhydroxid til opløsningen, og pH stiger. Først afgiver gruppen −COOH sin hydron til en hydroxidion.",
            for: { slags: "tag", partner: "OH", ph0: 1, ph1: 7, gruppe: "carboxyl" },
            tekst: "Ved pH 7 er valin igen en amfoion. Hvilken gruppe afgiver en hydron, når pH stiger til 13? Klik på den, og tryk Indsend svar.",
            rigtig: "amino",
            fejl: { carboxyl: "Gruppen −COO⁻ har allerede afgivet sin hydron. Find den gruppe, der stadig har en hydron at afgive." },
            hint: ["Kun en gruppe, der har en ekstra hydron, kan afgive en.",
                   "Gruppen −NH₃⁺ kan afgive en hydron og blive til −NH₂."],
            forkl: "Gruppen −NH₃⁺ afgiver en hydron til en hydroxidion og bliver til −NH₂. Derved dannes baseformen med den samlede ladning −1.",
            reak: { slags: "tag", partner: "OH", ph0: 7, ph1: 13 }
        }
    ];
    D.FORMER_FAERDIG = "Træk nu selv i pH-skyderen, og se valin skifte form.";
    D.GRUPPE_TEKST = { amino: { 1: "−NH₃⁺", 0: "−NH₂" }, carboxyl: { 1: "−COOH", 0: "−COO⁻" } };

    /* =====================================================================
       Fane 2: Fordelingsdiagrammet. Tre trin med 20 valinmolekyler.
       ===================================================================== */
    D.ANTAL_MOL = 20;
    D.PH_SKRIDT = 0.1;          /* skyderen gaar i trin paa 0,1 */
    D.DAEKNING = 0.95;          /* saa meget af pH 0-14 skal vaere tegnet */
    D.TEGNEFART = 4;            /* pH pr. sekund, mens diagrammet tegnes (brugeren 12. nov. 2026: "det går for hurtigt") */
    D.FORDELING = [
        {
            id: "spor", slags: "spor", navn: "Tegn diagrammet",
            tekst: "Vinduet viser 20 valinmolekyler. Træk pH-skyderen fra pH 0 til pH 14, og se diagrammet blive tegnet.",
            hint: ["Træk den mørke knap på skyderen under diagrammet mod højre.",
                   "Diagrammet er færdigt, når du har trukket skyderen fra pH 0 til pH 14."],
            forkl: "Fordelingsdiagrammet viser andelen af valinmolekylerne på hver form som funktion af pH fra 0 til 14."
        },
        {
            id: "pks", slags: "find", navn: "Find pKₛ",
            tekst: "Ved hvilken pH er koncentrationerne af syreformen og amfoionen lige store? Træk skyderen dertil, og tryk Indsend svar.",
            maal: D.PKS1, tol: 0.25,
            hint: ["Find det sted, hvor den røde og den grønne kurve skærer hinanden.",
                   "Kurverne skærer hinanden lidt over pH 2. Dér er 10 molekyler på syreformen og 10 amfoioner."],
            forkl: "Kurverne skærer hinanden ved pH 2,32, og dér er pH lig med pKₛ for syreformen. Det andet skæringspunkt ved pH 9,62 giver pKₛ for amfoionen."
        },
        {
            id: "iso", slags: "tal", navn: "Det isoelektriske punkt",
            tekst: "De to pKₛ-værdier er 2,32 og 9,62. Hvad er valins isoelektriske punkt, pHᵢₛₒ? Skriv tallet, og tryk Indsend svar.",
            maal: Math.round(D.ISO * 100) / 100,
            fejlSum: "Du har lagt de to pKₛ-værdier sammen. Det isoelektriske punkt er gennemsnittet, så summen skal divideres med 2.",
            fejlDiff: "Det isoelektriske punkt er gennemsnittet af de to pKₛ-værdier, ikke forskellen.",
            fejlAfrund: "Dit svar er tæt på. Angiv pH med to decimaler.",
            fejlAndet: "Det isoelektriske punkt ligger midt mellem de to pKₛ-værdier, 2,32 og 9,62.",
            fejlIntet: "Skriv et tal, for eksempel 4,50.",
            hint: ["Det isoelektriske punkt er gennemsnittet af de to pKₛ-værdier.",
                   "pHᵢₛₒ = ½ · (2,32 + 9,62)"],
            forkl: "pHᵢₛₒ = ½ · (2,32 + 9,62) = 5,97. Ved det isoelektriske punkt er næsten alle molekyler amfoioner, og den samlede ladning er 0."
        }
    ];
    D.FORDELING_FAERDIG = "Træk gerne videre i skyderen.";

    /* Beskeden til et forkert sted paa skyderen */
    D.findFejl = function (ph) {
        var a = D.andele(ph), s = Math.round(a.syre * 100), m = Math.round(a.amfo * 100);
        return "Ved pH " + D.komma1(ph) + " er der " + s + " % syreform og " + m + " % amfoion. Find stedet, hvor den røde og den grønne kurve skærer hinanden.";
    };

    /* =====================================================================
       Fane 3: Det elektriske felt. Seks trin. De fire foerste med tre
       aminosyrer, de to sidste med to ukendte (brugeren 12. nov. 2026: "måske
       med en ukendt opgave.. hvor man skal bruge metoden til at løse en
       struktur. Det skal gerne være lidt forsimplet"). Eleven
       finder foerst formerne ved pH 6 (stilladset, brugeren 12. nov. 2026:
       "Det ville være bedre, hvis man først blev stilladseret om hvilke
       former de er på inden man skal forudsige hvilken der ryger til
       minuspolen").
       ===================================================================== */
    D.FELT_RAEKKE = ["asp", "val", "lys"];
    D.VANDRING = 0.4;           /* en ladning paa 1 flytter 0,4 af den halve strimmel */
    D.FELT = [
        {
            id: "former", slags: "former", navn: "Formerne ved pH 6", ph: 6,
            tekst: "Ved pH 6 har carboxylgrupper afgivet deres hydron, og aminogrupper har optaget en. Klik på grupperne, så formlerne passer til pH 6, og tryk Indsend svar.",
            hint: ["Klik på hver −COOH og hver −NH₂ i de tre formler.",
                   "Asparaginsyre har en ekstra −COOH i sidekæden, og lysin har en ekstra −NH₂."],
            fejlCarboxyl: "Ved pH 6 har carboxylgruppen afgivet sin hydron. Se på −COOH i {navn}.",
            fejlAmino: "Ved pH 6 har aminogruppen optaget en hydron. Se på −NH₂ i {navn}.",
            fejlSideCarboxyl: "Asparaginsyres sidekæde har en carboxylgruppe, som også har afgivet sin hydron ved pH 6.",
            fejlSideAmino: "Lysins sidekæde har en aminogruppe, som også har optaget en hydron ved pH 6.",
            fejlIntet: "Klik på en af grupperne i formlerne først.",
            forkl: "Asparaginsyre har to negative grupper og én positiv, så ladningen er −1. Valin har ladningen 0, og lysin har ladningen +1."
        },
        {
            id: "minuspol", slags: "spm", navn: "Minuspolen",
            tekst: "Formlerne viser ladningerne ved pH 6. Hvilken aminosyre vandrer mod minuspolen, når strømmen sluttes?",
            svar: ["Asparaginsyre", "Valin", "Lysin"], rigtig: 2,
            fejl: { 0: "Asparaginsyre har ladningen −1, og en negativ ion vandrer mod pluspolen.",
                    1: "Valin har den samlede ladning 0 ved pH 6, så den vandrer ikke." },
            hint: ["Positive og negative ladninger tiltrækker hinanden.",
                   "Find den aminosyre, der har en positiv samlet ladning."],
            forkl: "Lysin har ladningen +1 og vandrer mod minuspolen. Asparaginsyre vandrer mod pluspolen, og valin bliver liggende."
        },
        {
            id: "stroem", slags: "forsoeg", navn: "Strømmen", ph: 6,
            tekst: "Tryk Slut strømmen, og se, om din forudsigelse passer.",
            koerer: "Strømmen er sluttet. Se, hvor aminosyrerne vandrer hen.",
            efter: "Lysin vandrede mod minuspolen og asparaginsyre mod pluspolen, mens valin blev liggende ved startlinjen.",
            knap: "Slut strømmen"
        },
        {
            id: "ph1", slags: "spm", navn: "En anden pH", ph: 1,
            tekst: "Valin blev liggende, fordi pH 6 er tæt på valins isoelektriske punkt. Ved hvilken pH vandrer alle tre aminosyrer mod minuspolen?",
            svar: ["pH 1", "pH 6", "pH 13"], rigtig: 0,
            fejl: { 1: "Ved pH 6 vandrede asparaginsyre mod pluspolen, og valin blev liggende.",
                    2: "Ved pH 13 har grupperne afgivet deres hydroner, så alle tre aminosyrer er negativt ladede." },
            hint: ["Alle tre aminosyrer skal have en positiv samlet ladning.",
                   "I sur opløsning har alle grupperne en hydron."],
            forkl: "Ved pH 1 har alle grupperne en hydron. Valin og asparaginsyre har ladningen +1, og lysin har ladningen +2 og vandrer længst."
        },
        {
            id: "ukendt", slags: "forsoeg", ukendt: true, navn: "To ukendte", ph: 6,
            tekst: "To ukendte aminosyrer, X og Y, sættes på et papir med pH 6. Tryk Slut strømmen, og se, hvor de vandrer hen.",
            koerer: "Strømmen er sluttet. Se, hvor X og Y vandrer hen.",
            efter: "X vandrede mod pluspolen, og Y vandrede mod minuspolen. Brug vandringen til at finde gruppen for enden af hver sidekæde.",
            knap: "Slut strømmen"
        },
        {
            id: "struktur", slags: "struktur", ukendt: true, navn: "Sidekæderne", ph: 6,
            tekst: "Hvilken gruppe sidder for enden af sidekæden i X og i Y? Klik på ?, til grupperne passer med forsøget, og tryk Indsend svar.",
            hint: ["Find først ladningen ved pH 6. X er negativ, og Y er positiv.",
                   "En ekstra −COOH giver ladningen −1 ved pH 6, og en ekstra −NH₂ giver +1."],
            fejlIntet: "Klik på ? i sidekæderne først.",
            fejlMangler: "Vælg en gruppe for enden af sidekæden i {navn}.",
            fejlNeutral: "Med {gruppe} i sidekæden har {navn} ladningen 0 ved pH 6 og bliver liggende.",
            fejlAmino: "Med −NH₂ i sidekæden får {navn} ladningen +1 ved pH 6 og vandrer mod minuspolen.",
            fejlCarboxyl: "Med −COOH i sidekæden får {navn} ladningen −1 ved pH 6 og vandrer mod pluspolen.",
            forkl: "X er glutaminsyre med en carboxylgruppe i sidekæden og ladningen −1 ved pH 6. Y er lysin med en aminogruppe i sidekæden og ladningen +1."
        }
    ];
    D.FELT_FAERDIG = "Træk nu selv i pH-skyderen. X og Y vandrer igen, når du slipper den.";

    /* ----- Smaa hjaelpere -------------------------------------------------------- */
    D.komma1 = function (v) { return (Math.round(v * 10) / 10).toFixed(1).replace(".", ","); };
    D.komma2 = function (v) { return (Math.round(v * 100) / 100).toFixed(2).replace(".", ","); };

    /* Saenkede tegn som HTML (<sub>): tal, n, s, i og o (pKₛ og pHᵢₛₒ) */
    var SAENKET = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
                    "ₙ": "n", "ₛ": "s", "ᵢ": "i", "ₒ": "o" };
    D.sub = function (html) {
        return String(html).replace(/[₀-₉ₙₛᵢₒ]+/g, function (m) {
            return "<sub>" + m.split("").map(function (c) { return SAENKET[c]; }).join("") + "</sub>";
        });
    };

    NK.Data = D;
}());
