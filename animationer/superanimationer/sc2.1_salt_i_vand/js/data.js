/* =====================================================================
   data.js - ionerne, saltene og alt hvad der kan slaas op om dem

   Oploeselighederne er omtrentlige tabelvaerdier i gram salt pr. 100 mL
   vand ved 0, 20, 40, 60, 80 og 100 °C. De er runde nok til et
   C-niveau, men forholdene mellem saltene er rigtige: NaCl er naesten
   uafhaengig af temperaturen, KNO₃ stiger voldsomt, og Ca(OH)₂ falder.

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
        OH:  { formel: "OH",  q: -1, navn: "hydroxid", r: 0.94, sammensat: true },
        NO3: { formel: "NO₃", q: -1, navn: "nitrat",   r: 1.14, sammensat: true },
        CO3: { formel: "CO₃", q: -2, navn: "carbonat", r: 1.14, sammensat: true },
        SO4: { formel: "SO₄", q: -2, navn: "sulfat",   r: 1.22, sammensat: true }
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
       kurve er gram pr. 100 mL vand ved temperaturerne i D.TEMPER. */
    D.SALTE = [
        { id: "NaCl",  kat: "Na", an: "Cl",  p: 1, n: 1,
          formel: "NaCl",    navn: "natriumchlorid",
          hverdag: "almindeligt køkkensalt",
          kurve: [35.7, 36.0, 36.4, 37.1, 38.0, 39.2] },

        { id: "KNO3",  kat: "K",  an: "NO3", p: 1, n: 1,
          formel: "KNO₃",    navn: "kaliumnitrat",
          hverdag: "salpeter — bruges i gødning",
          kurve: [13.3, 31.6, 63.9, 110, 169, 246] },

        { id: "CaCl2", kat: "Ca", an: "Cl",  p: 1, n: 2,
          formel: "CaCl₂",   navn: "calciumchlorid",
          hverdag: "tøsalt på vejene om vinteren",
          kurve: [59.5, 74.5, 115, 137, 147, 159] },

        { id: "K2SO4", kat: "K",  an: "SO4", p: 2, n: 1,
          formel: "K₂SO₄",   navn: "kaliumsulfat",
          hverdag: "gødning til markerne",
          kurve: [7.4, 11.1, 14.8, 18.2, 21.4, 24.1] },

        { id: "CuSO4", kat: "Cu", an: "SO4", p: 1, n: 1,
          formel: "CuSO₄",   navn: "kobber(II)sulfat",
          hverdag: "farver opløsningen klart blå",
          vandfarve: "#2f7fb8",
          kurve: [23.1, 32.0, 44.6, 61.8, 83.8, 114] },

        { id: "CaOH2", kat: "Ca", an: "OH",  p: 1, n: 2,
          formel: "Ca(OH)₂", navn: "calciumhydroxid",
          hverdag: "læsket kalk — det, kalkvand er lavet af",
          kurve: [0.189, 0.173, 0.141, 0.121, 0.094, 0.077] },

        { id: "CaCO3", kat: "Ca", an: "CO3", p: 1, n: 1,
          formel: "CaCO₃",   navn: "calciumcarbonat",
          hverdag: "kridt, kalk og marmor",
          kurve: [0.0015, 0.0014, 0.0013, 0.0012, 0.0011, 0.0010] },

        { id: "BaSO4", kat: "Ba", an: "SO4", p: 1, n: 1,
          formel: "BaSO₄",   navn: "bariumsulfat",
          hverdag: "kontrastmiddel før en røntgenundersøgelse",
          kurve: [0.00019, 0.00024, 0.00030, 0.00034, 0.00038, 0.00041] },

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

    /* ----- Oploeseligheden ved en vilkaarlig temperatur ----------------- */
    /* Ret linje mellem de to naermeste tabelvaerdier. Det er praecist nok:
       kurverne er glatte, og tabellen har et punkt for hver 20 °C. */
    D.oploeselighed = function (salt, temp) {
        var sidst = D.TEMPER.length - 1;
        var t = NK.klamp(temp, D.TEMPER[0], D.TEMPER[sidst]);
        var i = Math.min(Math.floor(t / 20), sidst - 1);
        var andel = (t - D.TEMPER[i]) / (D.TEMPER[i + 1] - D.TEMPER[i]);
        return NK.lerp(salt.kurve[i], salt.kurve[i + 1], andel);
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

    D.ligningHTML = function (salt) {
        return '<span class="fast">' + D.venstreLed(salt) + "</span>" +
               '<span class="pil">→</span>' +
               '<span class="fk">' + D.katLed(salt) + "</span> + " +
               '<span class="fa">' + D.anLed(salt) + "</span>";
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
          p: ["Det er de samme ioner hele vejen igennem — de er bare kommet fra hinanden. Na⁺ er stadig Na⁺, " +
              "og en sammensat ion som SO₄²⁻ går ikke i stykker.",
              "Damper man vandet væk, ligger saltet der igen."] },

        { h: "Der er en grænse: mættet",
          p: ["Vandet kan ikke rumme uendelig meget. Når der ikke kan opløses mere, er opløsningen <b>mættet</b>, " +
              "og resten bliver liggende i bunden som <b>bundfald</b>.",
              "Grænsen kaldes stoffets <b>opløselighed</b> og skrives som gram pr. 100 mL vand."] },

        { h: "Let- og tungtopløselige salte",
          p: ["Grænsen er vidt forskellig fra salt til salt. Der kan opløses 36 g køkkensalt i 100 mL vand — " +
              "men kun 0,0002 g sølvchlorid.",
              "Kan der opløses under 1 g pr. 100 mL, kalder vi saltet <b>tungtopløseligt</b>. Så bliver næsten " +
              "det hele liggende som bundfald."] },

        { h: "Hvad temperaturen gør",
          p: ["Jo varmere vandet er, jo hurtigere farer vandmolekylerne rundt, og jo hurtigere river de ionerne løs. " +
              "Saltet opløses altså <b>hurtigere</b>.",
              "For de fleste salte kan der <b>også opløses mere</b> i varmt vand. Men ikke for alle: " +
              "calciumhydroxid opløses dårligere, jo varmere vandet bliver."] },

        { h: "Om tegningen",
          p: ["Billedet er voldsomt forstørret og forenklet. Selv det mindste saltkorn består af mange milliarder ioner, " +
              "og der er langt flere vandmolekyler, end der er plads til at tegne.",
              "Ved de tungtopløselige salte er der tegnet nogle få ioner ude i vandet, så man kan se, at der faktisk " +
              "går en lille smule i opløsning. I virkeligheden er det endnu færre."] }
    ];

    /* ----- Quizzen -------------------------------------------------------- */
    /* rigtig er nummeret paa det rigtige svar, foer svarene blandes. */
    D.QUIZ = [
        { q: "Hvorfor kan vand opløse et salt?",
          svar: ["Vandmolekylet er lidt positivt i den ene ende og lidt negativt i den anden",
                 "Vand kan opløse alle stoffer",
                 "Saltet smelter, når det bliver vådt",
                 "Ionerne skubber hinanden væk i vand"],
          rigtig: 0,
          hvorfor: "Den skæve ladning er hele forklaringen. Den negative ende trækker i de positive ioner, og den positive ende trækker i de negative." },

        { q: "Hvilken ende af vandmolekylet vender ind mod en Na⁺-ion?",
          svar: ["Oxygen-enden, som er lidt negativ",
                 "Hydrogen-enderne, som er lidt positive",
                 "Det er tilfældigt, hvad der vender ind",
                 "Vandmolekylet vender altid den samme vej"],
          rigtig: 0,
          hvorfor: "Na⁺ er positiv, så den trækker i den negative ende — oxygen. Ved en negativ ion som Cl⁻ er det omvendt." },

        { q: "Hvad betyder (aq) i Na⁺(aq)?",
          svar: ["Ionen er opløst i vand",
                 "Ionen sidder fast i krystallen",
                 "Ionen er blevet til en gas",
                 "Ionen har mistet sin ladning"],
          rigtig: 0,
          hvorfor: "(aq) betyder opløst i vand. (s) betyder fast stof — altså ionerne, mens de stadig sidder i krystallen." },

        { q: "Hvad betyder det, at en opløsning er mættet?",
          svar: ["Der kan ikke opløses mere salt — resten bliver liggende i bunden",
                 "Alt saltet er opløst",
                 "Vandet er blevet til salt",
                 "Ionerne er gået i stykker"],
          rigtig: 0,
          hvorfor: "Mættet betyder, at grænsen er nået. Hælder man mere i, bliver det liggende som bundfald." },

        { q: "Der kan opløses 36 g NaCl i 100 mL vand. Hvad sker der, hvis man kommer 50 g i?",
          svar: ["36 g opløses, og 14 g bliver liggende i bunden",
                 "Alle 50 g opløses",
                 "Der opløses ingenting",
                 "Vandet kan pludselig rumme mere"],
          rigtig: 0,
          hvorfor: "Opløseligheden er en grænse. Alt over grænsen bliver liggende som bundfald." },

        { q: "Hvad kendetegner et tungtopløseligt salt som AgCl?",
          svar: ["Der kan kun opløses en meget lille mængde af det",
                 "Det kan slet ikke opløses",
                 "Det opløses kun i kogende vand",
                 "Det er tungere end vand"],
          rigtig: 0,
          hvorfor: "Der går en lille smule i opløsning — men så lidt, at det næsten ikke kan måles. Resten ligger som bundfald." },

        { q: "Hvad sker der som regel, når man varmer vandet op?",
          svar: ["Saltet opløses hurtigere, og for de fleste salte kan der opløses mere",
                 "Saltet holder op med at opløses",
                 "Ionerne mister deres ladning",
                 "Vandmolekylerne bevæger sig langsommere"],
          rigtig: 0,
          hvorfor: "Varmt vand betyder hurtigere vandmolekyler. Der er dog undtagelser: Ca(OH)₂ opløses dårligere i varmt vand." },

        { q: "Bliver ionerne til nye stoffer, når saltet opløses?",
          svar: ["Nej — det er de samme ioner, de er bare kommet fra hinanden",
                 "Ja, de bliver til atomer igen",
                 "Ja, de reagerer med vandet",
                 "Kun de negative ioner ændrer sig"],
          rigtig: 0,
          hvorfor: "Der sker ingen reaktion med ionerne. Damper man vandet væk, ligger saltet der igen." }
    ];
}());
