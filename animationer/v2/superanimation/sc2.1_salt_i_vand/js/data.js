/* =====================================================================
   data.js - ionerne, saltene og alt hvad der kan slaas op om dem

   Oploeselighederne er omtrentlige tabelvaerdier i gram salt pr. 100 mL
   vand ved 0, 20, 40, 60, 80 og 100 °C. De er runde nok til et
   C-niveau, men forholdene mellem saltene er rigtige: NaCl er naesten
   uafhaengig af temperaturen, og KNO₃ stiger voldsomt.

   Et nyt salt kraever én linje i SALTE - resten regner animationen selv.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};
    NK.Data = D;

    /* ----- Ionerne ---------------------------------------------------- */
    /* r er ionens stoerrelse i forhold til de andre. Tallene er ikke
       maalfaste, men raekkefoelgen er rigtig: Na⁺ er mindre end Cl⁻. */
    D.IONER = {
        Na:  { formel: "Na",  q:  1, navn: "natrium",  r: 0.70 },
        K:   { formel: "K",   q:  1, navn: "kalium",   r: 0.88 },
        Ag:  { formel: "Ag",  q:  1, navn: "sølv",     r: 0.80 },
        Ca:  { formel: "Ca",  q:  2, navn: "calcium",  r: 0.76 },
        Ba:  { formel: "Ba",  q:  2, navn: "barium",   r: 0.94 },
        Cu:  { formel: "Cu",  q:  2, navn: "kobber",   r: 0.64, romertal: "II" },

        Cl:  { formel: "Cl",  q: -1, navn: "chlorid",  r: 1.00 },
        OH:  { formel: "OH",  q: -1, navn: "hydroxid", r: 0.94, sammensat: true, atomer: "O(aq) + H(aq)" },
        NO3: { formel: "NO₃", q: -1, navn: "nitrat",   r: 1.14, sammensat: true, atomer: "N(aq) + 3 O(aq)" },
        CO3: { formel: "CO₃", q: -2, navn: "carbonat", r: 1.14, sammensat: true, atomer: "C(aq) + 3 O(aq)" },
        SO4: { formel: "SO₄", q: -2, navn: "sulfat",   r: 1.22, sammensat: true, atomer: "S(aq) + 4 O(aq)" }
    };

    D.ion = function (id) { return D.IONER[id]; };

    /* Na⁺ · Cl⁻ · SO₄²⁻ */
    D.ionTekst = function (ion) {
        return ion.formel + NK.ladningHaevet(ion.q);
    };

    /* ----- Temperaturerne, oploeselighederne er maalt ved -------------- */
    D.TEMPER = [0, 20, 40, 60, 80, 100];

    /* ----- Saltene ------------------------------------------------------ */
    /* p og n er antallet af positive og negative ioner i formlen.
       kurve er gram pr. 100 mL vand ved temperaturerne i D.TEMPER.
       pulver er farven paa det faste stof. */
    D.SALTE = [
        { id: "NaCl",  kat: "Na", an: "Cl",  p: 1, n: 1,
          formel: "NaCl",    navn: "natriumchlorid",
          hverdag: "almindeligt køkkensalt",
          kurve: [35.7, 36.0, 36.4, 37.1, 38.0, 39.2] },

        { id: "KNO3",  kat: "K",  an: "NO3", p: 1, n: 1,
          formel: "KNO₃",    navn: "kaliumnitrat",
          hverdag: "salpeter, bruges i gødning",
          kurve: [13.3, 31.6, 63.9, 110, 169, 246] },

        { id: "CaCl2", kat: "Ca", an: "Cl",  p: 1, n: 2,
          formel: "CaCl₂",   navn: "calciumchlorid",
          hverdag: "tøsalt på vejene om vinteren",
          kurve: [59.5, 74.5, 115, 137, 147, 159] },

        { id: "CuSO4", kat: "Cu", an: "SO4", p: 1, n: 1,
          formel: "CuSO₄",   navn: "kobber(II)sulfat",
          hverdag: "farver opløsningen klart blå",
          vandfarve: "#2f7fb8", pulver: "#5aa6dc",
          kurve: [23.1, 32.0, 44.6, 61.8, 83.8, 114] },

        { id: "CaCO3", kat: "Ca", an: "CO3", p: 1, n: 1,
          formel: "CaCO₃",   navn: "calciumcarbonat",
          hverdag: "kridt, kalk og marmor",
          kurve: [0.0015, 0.0014, 0.0013, 0.0012, 0.0011, 0.0010] },

        { id: "AgCl",  kat: "Ag", an: "Cl",  p: 1, n: 1,
          formel: "AgCl",    navn: "sølvchlorid",
          hverdag: "det hvide bundfald i fældningsforsøg",
          kurve: [0.00007, 0.00015, 0.00040, 0.00080, 0.00140, 0.00210] }
    ];

    D.salt = function (id) {
        for (var i = 0; i < D.SALTE.length; i++) {
            if (D.SALTE[i].id === id) return D.SALTE[i];
        }
        return D.SALTE[0];
    };

    D.pulverfarve = function (salt) { return salt.pulver || "#e8eef5"; };

    /* ----- Oploeseligheden ved en vilkaarlig temperatur ----------------- */
    /* En glat kurve gennem tabelpunkterne (monoton kubisk interpolation).
       Den rammer tabelvaerdierne praecist, knaekker ikke ved hvert 20 °C
       og kan aldrig bue op over eller ned under to naboværdier - en
       stigende kurve bliver ved med at stige. */
    function tangenter(salt) {
        if (salt._tangenter) return salt._tangenter;
        var y = salt.kurve, n = y.length, h = 20, d = [], m = [], k;
        for (k = 0; k < n - 1; k++) d.push((y[k + 1] - y[k]) / h);
        m[0] = d[0];
        m[n - 1] = d[n - 2];
        for (k = 1; k < n - 1; k++) m[k] = d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2;
        for (k = 0; k < n - 1; k++) {
            if (d[k] === 0) { m[k] = 0; m[k + 1] = 0; continue; }
            var a = m[k] / d[k], b = m[k + 1] / d[k], s = a * a + b * b;
            if (s > 9) {
                var t = 3 / Math.sqrt(s);
                m[k] = t * a * d[k];
                m[k + 1] = t * b * d[k];
            }
        }
        salt._tangenter = m;
        return m;
    }

    D.oploeselighed = function (salt, temp) {
        var sidst = D.TEMPER.length - 1;
        var t = NK.klamp(temp, D.TEMPER[0], D.TEMPER[sidst]);
        var i = Math.min(Math.floor(t / 20), sidst - 1);
        var u = (t - D.TEMPER[i]) / 20;
        var y = salt.kurve, m = tangenter(salt);
        var u2 = u * u, u3 = u2 * u;
        return (2 * u3 - 3 * u2 + 1) * y[i] + (u3 - 2 * u2 + u) * 20 * m[i] +
               (-2 * u3 + 3 * u2) * y[i + 1] + (u3 - u2) * 20 * m[i + 1];
    };

    /* Den temperatur, hvor der netop kan opløses gram g. Kun for salte,
       hvis kurve stiger. NaN, hvis det ikke kan lade sig goere mellem
       0 og 100 °C. */
    D.temperaturFor = function (salt, gram) {
        if (gram < D.oploeselighed(salt, 0) || gram > D.oploeselighed(salt, 100)) return NaN;
        var lav = 0, hoej = 100;
        for (var i = 0; i < 40; i++) {
            var midt = (lav + hoej) / 2;
            if (D.oploeselighed(salt, midt) < gram) lav = midt; else hoej = midt;
        }
        return (lav + hoej) / 2;
    };

    D.stoersteOploeselighed = function (salt) {
        return Math.max.apply(null, salt.kurve);
    };

    /* Graensen mellem let og tungt: 1 gram pr. 100 mL vand ved 20 °C. */
    D.erTung = function (salt) {
        return D.oploeselighed(salt, 20) < 1;
    };

    D.typeNavn = function (salt) {
        return D.erTung(salt) ? "tungtopløseligt" : "letopløseligt";
    };

    /* ----- Oploesningsligningen ----------------------------------------- */
    function led(antal, tekst) { return (antal > 1 ? antal + " " : "") + tekst; }

    D.venstreLed = function (salt) { return salt.formel + "(s)"; };
    D.katLed = function (salt) { return led(salt.p, D.ionTekst(D.ion(salt.kat))) + "(aq)"; };
    D.anLed  = function (salt) { return led(salt.n, D.ionTekst(D.ion(salt.an)))  + "(aq)"; };
    D.hoejreSide = function (salt) { return D.katLed(salt) + " + " + D.anLed(salt); };

    D.ligningHTML = function (salt) {
        return '<span class="fast">' + D.venstreLed(salt) + "</span>" +
               '<span class="pil">→</span>' +
               '<span class="fk">' + D.katLed(salt) + "</span> + " +
               '<span class="fa">' + D.anLed(salt) + "</span>";
    };

    /* Forkerte hoejresider til opgaven om ligningen. Hver af dem er en
       typisk fejl: koefficienten glemt, ionerne slaaet sammen, den
       sammensatte ion gaaet i stykker, ladningerne glemt eller vendt, og
       ionerne stadig som fast stof. De mest sigende kommer foerst. */
    D.forkerteHoejresider = function (salt) {
        var kat = D.ion(salt.kat), an = D.ion(salt.an);
        var katT = D.ionTekst(kat), anT = D.ionTekst(an);
        var liste = [];
        if (salt.n > 1) {
            liste.push(katT + "(aq) + " + anT + "(aq)");
            liste.push(katT + "(aq) + " + an.formel + NK.saenket(salt.n) + NK.ladningHaevet(an.q * salt.n) + "(aq)");
        }
        if (salt.p > 1) liste.push(katT + "(aq) + " + anT + "(aq)");
        if (an.sammensat) liste.push(led(salt.p, katT) + "(aq) + " + an.atomer);
        liste.push(led(salt.p, kat.formel) + "(aq) + " + led(salt.n, an.formel) + "(aq)");
        liste.push(led(salt.p, katT) + "(s) + " + led(salt.n, anT) + "(s)");
        liste.push(led(salt.p, kat.formel + NK.ladningHaevet(-kat.q)) + "(aq) + " +
                   led(salt.n, an.formel + NK.ladningHaevet(-an.q)) + "(aq)");
        var ret = D.hoejreSide(salt), unikke = [];
        liste.forEach(function (s) { if (s !== ret && unikke.indexOf(s) < 0) unikke.push(s); });
        return unikke;
    };

    /* ----- Hvor meget gaar der i oploesning paa fane 1? ------------------ */
    /* Laerredet viser ét bittelille udsnit af en krystal. Et letoploeseligt
       salt forsvinder helt; et tungtoploeseligt slipper kun nogle faa ioner
       og staar saa stille. Tallene er valgt, saa forskellen kan ses -
       i virkeligheden slipper der endnu faerre. */
    D.frieIoner = function (salt, temp) {
        var s = D.oploeselighed(salt, temp);
        if (s >= 5)     return Infinity;
        if (s >= 0.5)   return 10;
        if (s >= 0.05)  return 6;
        if (s >= 0.001) return 4;
        return 2;
    };

    /* ----- Den valgfrie teoriboks ---------------------------------------- */
    D.TEORI = [
        { h: "Vandmolekylet er skævt",
          p: ["De to hydrogenatomer sidder på samme side af oxygenatomet. Oxygen trækker hårdest i elektronerne, " +
              "så <b>oxygen-enden bliver en lille smule negativ (δ−)</b>, og hydrogen-enderne bliver en lille smule positive (δ+).",
              "Molekylet er stadig neutralt i alt. Ladningen er bare fordelt skævt."] },

        { h: "Derfor kan vand trække i ioner",
          p: ["Plus og minus tiltrækker hinanden. Vandmolekylerne vender δ−-enden mod de positive ioner " +
              "og δ+-enderne mod de negative.",
              "Trækker nok vandmolekyler samme vej, river de ionen løs fra krystallen. Bagefter bliver de " +
              "siddende hele vejen rundt om ionen."] },

        { h: "Fra (s) til (aq)",
          p: ["<b>(s)</b> betyder fast stof: ionerne sidder fast i krystallen. <b>(aq)</b> betyder opløst i vand: " +
              "ionen svømmer frit rundt med vand omkring sig.",
              "NaCl(s) → <span class=\"fk\">Na⁺(aq)</span> + <span class=\"fa\">Cl⁻(aq)</span>"] },

        { h: "Saltet bliver ikke til noget nyt",
          p: ["Det er de samme ioner hele vejen igennem. De er bare kommet fra hinanden. Na⁺ er stadig Na⁺, " +
              "og en sammensat ion som SO₄²⁻ går ikke i stykker.",
              "Damper man vandet væk, ligger saltet der igen."] },

        { h: "Der er en grænse: mættet",
          p: ["Vandet kan ikke rumme uendelig meget. Når der ikke kan opløses mere, er opløsningen <b>mættet</b>, " +
              "og resten bliver liggende i bunden som <b>bundfald</b>.",
              "Grænsen kaldes stoffets <b>opløselighed</b> og skrives som gram pr. 100 mL vand."] },

        { h: "Let- og tungtopløselige salte",
          p: ["Grænsen er vidt forskellig fra salt til salt. Der kan opløses 36 g køkkensalt i 100 mL vand, " +
              "men kun 0,0002 g sølvchlorid.",
              "Kan der opløses under 1 g pr. 100 mL, kalder vi saltet <b>tungtopløseligt</b>. Så bliver næsten " +
              "det hele liggende som bundfald."] },

        { h: "Hvad temperatur og omrøring gør",
          p: ["Jo varmere vandet er, jo hurtigere farer vandmolekylerne rundt, og jo hurtigere river de ionerne løs. " +
              "For de fleste salte kan der også <b>opløses mere</b> i varmt vand: kurven på fane 2 stiger.",
              "Omrøring knuser krystallen og giver mere overflade, som vandet kan tage fat i. Saltet opløses " +
              "<b>hurtigere</b>, men grænsen for, hvor meget der kan opløses, er den samme."] },

        { h: "Om tegningen",
          p: ["Lupen viser et voldsomt forstørret og forenklet udsnit. Selv det mindste saltkorn består af mange " +
              "milliarder ioner, og der er langt flere vandmolekyler, end der er plads til at tegne.",
              "Ved de tungtopløselige salte er der tegnet nogle få ioner ude i vandet, så man kan se, at der faktisk " +
              "går en lille smule i opløsning. I virkeligheden er det endnu færre."] }
    ];

    /* ----- Quizzen -------------------------------------------------------- */
    /* rigtig er nummeret paa det rigtige svar, foer svarene blandes.
       Svarene er holdt omtrent lige lange, saa det rigtige ikke kan
       genkendes paa, at det er det mest omhyggeligt formulerede. */
    D.QUIZ = [
        { q: "Hvorfor kan vand opløse et salt?",
          svar: ["Vand kan opløse alle faste stoffer, også salte",
                 "Vandmolekylet har en positiv og en negativ ende",
                 "Saltet smelter, når det kommer i kontakt med vand",
                 "Ionerne mister deres ladning, når de bliver våde"],
          rigtig: 1,
          hvorfor: "Den skæve ladning er forklaringen. Den negative ende trækker i de positive ioner, og den positive ende trækker i de negative." },

        { q: "Hvilken ende af vandmolekylet vender ind mod en Na⁺-ion?",
          svar: ["Oxygen-enden, som er lidt negativ",
                 "Hydrogen-enderne, som er lidt positive",
                 "Det er tilfældigt, hvilken ende der vender ind",
                 "Begge ender vender lige meget ind mod ionen"],
          rigtig: 0,
          hvorfor: "Na⁺ er positiv, så den trækker i den negative ende: oxygen. Ved en negativ ion som Cl⁻ er det omvendt." },

        { q: "Hvad betyder (aq) i Na⁺(aq)?",
          svar: ["Ionen sidder fast i krystallen",
                 "Ionen er blevet til en gas",
                 "Ionen er opløst i vand",
                 "Ionen har mistet sin ladning"],
          rigtig: 2,
          hvorfor: "(aq) betyder opløst i vand. (s) betyder fast stof, altså ionerne, mens de stadig sidder i krystallen." },

        { q: "Hvad betyder det, at en opløsning er mættet?",
          svar: ["Alt det tilsatte stof er blevet opløst",
                 "Vandet er fordampet, og saltet er tilbage",
                 "Ionerne er gået i stykker i vandet",
                 "Der kan ikke opløses mere af stoffet"],
          rigtig: 3,
          hvorfor: "Mættet betyder, at grænsen er nået. Hælder man mere i, bliver det liggende som bundfald." },

        { q: "Der kan opløses 36 g NaCl i 100 mL vand. Hvad sker der, hvis man kommer 50 g i?",
          svar: ["Alle 50 g opløses, men det tager længere tid",
                 "36 g opløses, og 14 g bliver liggende",
                 "14 g opløses, og 36 g bliver liggende",
                 "Der opløses slet ingenting, fordi det er for meget"],
          rigtig: 1,
          hvorfor: "Opløseligheden er en grænse. Alt over grænsen bliver liggende som bundfald: 50 g − 36 g = 14 g." },

        { q: "Hvad kendetegner et tungtopløseligt salt som AgCl?",
          svar: ["Det kan slet ikke opløses i vand",
                 "Der kan kun opløses meget lidt af det",
                 "Det opløses kun, hvis vandet er kogende varmt",
                 "Det er tungere end vand og synker til bunds"],
          rigtig: 1,
          hvorfor: "Der går en lille smule i opløsning, men så lidt, at det næsten ikke kan måles. Resten ligger som bundfald." },

        { q: "Du rører rundt i et glas med salt og vand. Hvad sker der?",
          svar: ["Der kan opløses mere salt, end der kunne før",
                 "Saltet opløses hurtigere, men grænsen er den samme",
                 "Saltet opløses langsommere, fordi vandet bevæger sig",
                 "Der sker ingenting, for kun temperaturen virker"],
          rigtig: 1,
          hvorfor: "Omrøringen knuser krystallen, så vandet kan tage fat flere steder på én gang. Hvor meget vandet kan rumme, ændrer sig ikke." },

        { q: "Hvad sker der som regel, når man varmer vandet op?",
          svar: ["Saltet holder helt op med at blive opløst",
                 "Vandmolekylerne bevæger sig langsommere end før",
                 "Saltet opløses hurtigere, og der kan opløses mere",
                 "Ionerne mister deres ladning i det varme vand"],
          rigtig: 2,
          hvorfor: "Varmt vand betyder hurtigere vandmolekyler. De fleste salte kan også opløses bedre, men for NaCl ændrer det næsten intet." },

        { q: "Bliver ionerne til nye stoffer, når saltet opløses?",
          svar: ["Ja, de bliver til atomer uden ladning igen",
                 "Ja, de reagerer med vandet og danner en gas",
                 "Nej, det er de samme ioner, bare adskilt",
                 "Kun de negative ioner ændrer sig i vandet"],
          rigtig: 2,
          hvorfor: "Der sker ingen reaktion med ionerne. Damper man vandet væk, ligger saltet der igen." }
    ];
}());
