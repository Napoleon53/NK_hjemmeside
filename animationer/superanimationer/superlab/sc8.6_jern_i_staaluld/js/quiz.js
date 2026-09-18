/* =====================================================================
   quiz.js - quizkortet i panelet

   Kortet er laast, indtil jernindholdet er beregnet i et forsoeg med
   svovlsyre. Svarene blandes hver gang. Der er ét forsoeg pr.
   spoergsmaal, og begrundelsen vises bagefter, ogsaa naar svaret er
   rigtigt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var SPOERGSMAAL = [
        {
            sp: "Hvad sker der med jernet, når stålulden opløses i syren?",
            valg: [
                "Fe oxideres til Fe²⁺, og H⁺ reduceres til H₂",
                "Fe reduceres til Fe²⁺, og H⁺ oxideres til H₂",
                "Fe opløses som atomer uden at reagere",
                "Fe oxideres direkte til Fe³⁺ af syren"
            ],
            rigtig: 0,
            forklaring: "Hvert Fe-atom afgiver to elektroner og bliver til Fe²⁺. To H⁺ optager elektronerne og bliver til H₂, som ses som bobler."
        },
        {
            sp: "Hvorfor opløses stålulden i svovlsyre og ikke i saltsyre?",
            valg: [
                "MnO₄⁻ kan også oxidere Cl⁻, så der bruges for meget KMnO₄",
                "Saltsyre kan ikke opløse jern",
                "Svovlsyre farver opløsningen lyserød ved endepunktet",
                "Saltsyre fordamper under titreringen"
            ],
            rigtig: 0,
            forklaring: "Permanganat oxiderer chloridioner til dichlor. Så bruges der mere KMnO₄, end jernet alene kræver, og resultatet bliver for højt. Sulfationen oxideres ikke."
        },
        {
            sp: "Hvordan ses endepunktet i titreringen?",
            valg: [
                "Opløsningen får en svag, blivende lyserød farve",
                "Opløsningen bliver helt farveløs",
                "Der dannes bobler i kolben",
                "Opløsningen bliver grøn"
            ],
            rigtig: 0,
            forklaring: "Så længe der er Fe²⁺, reduceres den lilla MnO₄⁻ til den næsten farveløse Mn²⁺. Når Fe²⁺ er brugt op, bliver MnO₄⁻ i opløsningen og farver den."
        },
        {
            sp: "Hvorfor skal der ikke bruges en indikator i titreringen?",
            valg: [
                "Permanganationen er selv stærkt farvet",
                "Fe³⁺ er lyserød",
                "Svovlsyren virker som indikator",
                "Mn²⁺ er stærkt lilla"
            ],
            rigtig: 0,
            forklaring: "MnO₄⁻ er intenst lilla, mens Mn²⁺ er næsten farveløs. Titranten virker derfor selv som indikator."
        },
        {
            sp: "Hvad er oxidationstallet for Mn i MnO₄⁻?",
            valg: ["+7", "+2", "+4", "−1"],
            rigtig: 0,
            forklaring: "O har oxidationstallet −2. Fire O giver −8, og ionens ladning er −1, så Mn har oxidationstallet +7."
        },
        {
            sp: "Hvorfor reagerer én MnO₄⁻ med netop fem Fe²⁺?",
            valg: [
                "Mn optager 5 elektroner, og hver Fe²⁺ afgiver 1 elektron",
                "Der er 5 gange så meget jern som permanganat i kolben",
                "MnO₄⁻ indeholder 5 atomer",
                "Fe²⁺ afgiver 5 elektroner, og Mn optager 1 elektron"
            ],
            rigtig: 0,
            forklaring: "Mn går fra +7 til +2 og optager 5 elektroner. Fe går fra +2 til +3 og afgiver 1 elektron. Der skal afgives lige så mange elektroner, som der optages."
        },
        {
            sp: "Der bruges 20,00 mL 0,0200 M KMnO₄. Hvad er stofmængden af Fe²⁺?",
            valg: ["2,00·10⁻³ mol", "4,00·10⁻⁴ mol", "8,00·10⁻⁵ mol", "2,00 mol"],
            rigtig: 0,
            forklaring: "n(MnO₄⁻) = 0,0200 M · 0,02000 L = 4,00·10⁻⁴ mol. n(Fe²⁺) = 5 · 4,00·10⁻⁴ mol = 2,00·10⁻³ mol."
        },
        {
            sp: "Titreringen fortsættes, til opløsningen er kraftigt lilla. Hvordan påvirker det resultatet?",
            valg: [
                "Jernindholdet bliver for højt",
                "Jernindholdet bliver for lavt",
                "Det påvirker ikke resultatet",
                "Jernindholdet kan ikke beregnes"
            ],
            rigtig: 0,
            forklaring: "Der er aflæst et større volumen KMnO₄, end jernet kræver. Beregningen giver derfor mere jern, end der var."
        },
        {
            sp: "Der var stadig ståluld i kolben, da titreringen begyndte. Hvordan påvirker det resultatet?",
            valg: [
                "Jernindholdet bliver for lavt",
                "Jernindholdet bliver for højt",
                "Det påvirker ikke resultatet",
                "Opløsningen bliver lilla med det samme"
            ],
            rigtig: 0,
            forklaring: "Kun Fe²⁺ i opløsningen reagerer med MnO₄⁻. Jern, der ikke er opløst, bliver ikke talt med."
        },
        {
            sp: "Hvorfor aflæses buretten både før og efter titreringen?",
            valg: [
                "Det forbrugte volumen er forskellen mellem de to aflæsninger",
                "For at kontrollere, at buretten er ren",
                "Fordi koncentrationen ændrer sig undervejs",
                "For at se, om der er luftbobler i spidsen"
            ],
            rigtig: 0,
            forklaring: "Buretten står sjældent præcis på 0,00 mL, når titreringen begynder. Forbruget er slutaflæsningen minus startaflæsningen."
        }
    ];

    NK.QUIZ = SPOERGSMAAL;

    NK.Quiz = function () {
        this.tilstand = "laast";      /* laast | klar | sp | slut */
        this.nr = 0;
        this.rigtige = 0;
        this.aktuel = null;
        this.svaret = false;

        var mig = this;
        NK.el("quiz-knap").addEventListener("click", function () { mig.knap(); });
        this.vis();
    };

    var Q = NK.Quiz.prototype;

    Q.saetLaast = function (laast) {
        if (laast && this.tilstand !== "laast") this.tilstand = "laast";
        else if (!laast && this.tilstand === "laast") this.tilstand = "klar";
        this.vis();
    };

    Q.bland = function (sp) {
        var orden = NK.bland([0, 1, 2, 3]);
        return {
            sp: sp.sp,
            forklaring: sp.forklaring,
            valg: orden.map(function (i) { return sp.valg[i]; }),
            rigtig: orden.indexOf(sp.rigtig)
        };
    };

    Q.knap = function () {
        if (this.tilstand === "klar" || this.tilstand === "slut") {
            this.tilstand = "sp";
            this.nr = 0;
            this.rigtige = 0;
            this.nyt();
        } else if (this.tilstand === "sp" && this.svaret) {
            this.nr++;
            if (this.nr >= SPOERGSMAAL.length) this.tilstand = "slut";
            else this.nyt();
        }
        this.vis();
        if (this.tilstand !== "laast") NK.el("quiz-kort").scrollIntoView({ block: "nearest" });
    };

    Q.nyt = function () {
        this.aktuel = this.bland(SPOERGSMAAL[this.nr]);
        this.svaret = false;
        var boks = NK.el("quiz-valg");
        boks.innerHTML = "";
        var mig = this;
        this.aktuel.valg.forEach(function (valg, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "valgknap";
            b.textContent = valg;
            b.addEventListener("click", function () { mig.svar(i); });
            boks.appendChild(b);
        });
    };

    Q.svar = function (i) {
        if (this.svaret) return;
        this.svaret = true;
        var rigtigt = i === this.aktuel.rigtig;
        if (rigtigt) this.rigtige++;
        var knapper = NK.el("quiz-valg").querySelectorAll(".valgknap");
        for (var k = 0; k < knapper.length; k++) {
            knapper[k].disabled = true;
            if (k === this.aktuel.rigtig) knapper[k].classList.add("rigtig");
            else if (k === i) knapper[k].classList.add("forkert");
        }
        var fk = NK.el("quiz-forklaring");
        fk.textContent = (rigtigt ? "Rigtigt. " : "Forkert. ") + this.aktuel.forklaring;
        fk.className = "besked " + (rigtigt ? "god" : "skidt");
        this.vis();
        NK.el("quiz-knap").scrollIntoView({ block: "nearest" });
    };

    Q.vis = function () {
        var tekst = NK.el("quiz-tekst");
        var valg = NK.el("quiz-valg");
        var fk = NK.el("quiz-forklaring");
        var score = NK.el("quiz-score");
        var knap = NK.el("quiz-knap");
        var n = SPOERGSMAAL.length;

        valg.hidden = this.tilstand !== "sp";
        fk.hidden = !(this.tilstand === "sp" && this.svaret);
        score.hidden = this.tilstand !== "slut";
        knap.classList.toggle("banker", this.tilstand === "klar");

        if (this.tilstand === "laast") {
            NK.saetTekst("quiz-taeller", "");
            tekst.textContent = "Låses op, når du har fundet jernindholdet i et forsøg med svovlsyre.";
            knap.hidden = true;
        } else if (this.tilstand === "klar") {
            NK.saetTekst("quiz-taeller", n + " spørgsmål");
            tekst.textContent = "Jernindholdet er fundet.";
            NK.saetTekst("quiz-knap-tekst", "Start quiz");
            knap.hidden = false;
        } else if (this.tilstand === "sp") {
            NK.saetTekst("quiz-taeller", (this.nr + 1) + "/" + n);
            tekst.textContent = this.aktuel.sp;
            NK.saetTekst("quiz-knap-tekst", this.nr === n - 1 ? "Se resultatet" : "Næste spørgsmål");
            knap.hidden = !this.svaret;
        } else {
            NK.saetTekst("quiz-taeller", "Resultat");
            score.textContent = this.rigtige + " / " + n;
            tekst.textContent = this.rigtige === n ? "Alle svar er rigtige."
                : (this.rigtige >= n / 2 ? "Godt klaret. Tag quizzen igen, eller læs teorien."
                : "Læs teorien, og tag quizzen igen.");
            NK.saetTekst("quiz-knap-tekst", "Tag quizzen igen");
            knap.hidden = false;
        }
    };
}());
