/* =====================================================================
   quiz.js - quizkortet i panelet

   Kortet er laast, indtil Ko er beregnet. Svarene blandes hver
   gang. Der er ét forsoeg pr. spoergsmaal, og begrundelsen vises
   bagefter, ogsaa naar svaret er rigtigt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var SPOERGSMAAL = [
        {
            sp: "Hvilket stof er det gule bundfald?",
            valg: ["PbI₂", "KNO₃", "Pb(NO₃)₂", "KI"],
            rigtig: 0,
            forklaring: "Pb²⁺ og I⁻ danner det tungtopløselige salt PbI₂. KNO₃ er letopløseligt og bliver i opløsningen."
        },
        {
            sp: "Hvilket reaktionsskema beskriver ligevægten mellem bundfaldet og opløsningen?",
            valg: [
                "PbI₂(s) ⇌ Pb²⁺(aq) + 2 I⁻(aq)",
                "PbI₂(s) ⇌ Pb²⁺(aq) + I⁻(aq)",
                "PbI₂(s) ⇌ Pb²⁺(aq) + I₂²⁻(aq)",
                "Pb(NO₃)₂(s) ⇌ Pb²⁺(aq) + 2 NO₃⁻(aq)"
            ],
            rigtig: 0,
            forklaring: "Bundfaldet er PbI₂. Én formelenhed giver én Pb²⁺ og to I⁻, så atomer og ladninger går op."
        },
        {
            sp: "Hvordan ser udtrykket for opløselighedsproduktet for PbI₂ ud?",
            valg: [
                "Kₒ = [Pb²⁺] · [I⁻]²",
                "Kₒ = [Pb²⁺] · [I⁻]",
                "Kₒ = [Pb²⁺] · 2 · [I⁻]",
                "Kₒ = [Pb²⁺] · [I⁻]² / [PbI₂]"
            ],
            rigtig: 0,
            forklaring: "Koefficienten 2 foran I⁻ bliver til en eksponent. PbI₂ er et fast stof og indgår ikke i udtrykket."
        },
        {
            sp: "Hvorfor kan Kₒ beregnes netop ved den temperatur, hvor de første krystaller kommer?",
            valg: [
                "Opløsningen er netop mættet, og alt stoffet er stadig opløst",
                "Alt PbI₂ er fældet ud ved den temperatur",
                "Vandet er varmest ved den temperatur",
                "Koncentrationerne af Pb²⁺ og I⁻ er lige store ved den temperatur"
            ],
            rigtig: 0,
            forklaring: "Lige når krystallerne kommer, er reaktionsbrøken Y lig med Kₒ. Koncentrationerne kendes, fordi alt det afvejede stof stadig er opløst."
        },
        {
            sp: "I en opløsning er Y = [Pb²⁺] · [I⁻]² større end Kₒ. Hvad sker der?",
            valg: [
                "Der fældes PbI₂, til Y er lig med Kₒ",
                "Der opløses mere PbI₂, til Y er lig med Kₒ",
                "Der sker ingenting, for opløsningen er umættet",
                "Kₒ stiger, til den er lig med Y"
            ],
            rigtig: 0,
            forklaring: "Opløsningen er overmættet. Ionerne samles til fast PbI₂, så koncentrationerne falder, til Y er lig med Kₒ."
        },
        {
            sp: "Hvilken enhed har Kₒ for PbI₂?",
            valg: ["M³", "M²", "M", "g pr. 100 mL"],
            rigtig: 0,
            forklaring: "Kₒ = [Pb²⁺] · [I⁻]². Det er M · M², altså M³."
        },
        {
            sp: "Der er opløst 3,0·10⁻⁴ mol Pb(NO₃)₂ i 100 mL vand. Hvad er [Pb²⁺]?",
            valg: ["3,0·10⁻³ M", "3,0·10⁻⁴ M", "3,0·10⁻⁵ M", "3,0·10⁻⁶ M"],
            rigtig: 0,
            forklaring: "c = n / V = 3,0·10⁻⁴ mol / 0,100 L = 3,0·10⁻³ M. Volumen skal regnes i liter."
        },
        {
            sp: "I en mættet opløsning er [Pb²⁺] = 3,0·10⁻³ M og [I⁻] = 6,0·10⁻³ M. Hvad er Kₒ?",
            valg: ["1,1·10⁻⁷ M³", "1,8·10⁻⁵ M³", "3,6·10⁻⁵ M³", "4,3·10⁻⁷ M³"],
            rigtig: 0,
            forklaring: "Kₒ = [Pb²⁺] · [I⁻]² = 3,0·10⁻³ M · (6,0·10⁻³ M)² = 1,1·10⁻⁷ M³. [I⁻] sættes i anden og ganges ikke med 2 først."
        },
        {
            sp: "Med mere stof i glasset kommer de første krystaller ved en højere temperatur. Hvad fortæller det om Kₒ for PbI₂?",
            valg: [
                "Kₒ stiger med temperaturen",
                "Kₒ falder med temperaturen",
                "Kₒ er den samme ved alle temperaturer",
                "Kₒ afhænger af, hvor meget stof der er i glasset"
            ],
            rigtig: 0,
            forklaring: "Mere stof giver en større reaktionsbrøk. Opløsningen er mættet ved en højere temperatur, så Kₒ er større dér. En ligevægtskonstant afhænger af temperaturen, ikke af mængden af stof."
        },
        {
            sp: "Hvor skal resterne fra forsøget hen?",
            valg: [
                "I beholderen til tungmetalaffald",
                "I vasken med rigeligt vand",
                "I beholderen til organisk affald",
                "I skraldespanden"
            ],
            rigtig: 0,
            forklaring: "Resterne indeholder bly, som er giftigt og skadeligt for miljøet. Det afleveres som tungmetalaffald."
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
            tekst.textContent = "Låses op, når Kₒ er beregnet.";
            knap.hidden = true;
        } else if (this.tilstand === "klar") {
            NK.saetTekst("quiz-taeller", n + " spørgsmål");
            tekst.textContent = "Kₒ er beregnet.";
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
