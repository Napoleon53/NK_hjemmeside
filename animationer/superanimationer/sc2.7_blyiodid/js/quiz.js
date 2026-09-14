/* =====================================================================
   quiz.js - quizkortet i panelet

   Kortet er laast, indtil der er tre maalinger. Svarene blandes hver
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
            sp: "Hvilket reaktionsskema beskriver fældningen?",
            valg: [
                "Pb²⁺(aq) + 2 I⁻(aq) → PbI₂(s)",
                "Pb²⁺(aq) + I⁻(aq) → PbI(s)",
                "Pb⁺(aq) + I⁻(aq) → PbI(s)",
                "K⁺(aq) + NO₃⁻(aq) → KNO₃(s)"
            ],
            rigtig: 0,
            forklaring: "Pb²⁺ har to positive ladninger, og I⁻ har én negativ. Der skal to I⁻ til hver Pb²⁺, før PbI₂ er neutral."
        },
        {
            sp: "Hvilke ioner er tilskuerioner?",
            valg: ["K⁺ og NO₃⁻", "Pb²⁺ og I⁻", "K⁺ og I⁻", "Pb²⁺ og NO₃⁻"],
            rigtig: 0,
            forklaring: "K⁺ og NO₃⁻ er i opløsningen både før og efter fældningen. De deltager ikke i reaktionen."
        },
        {
            sp: "Hvorfor forsvinder bundfaldet, når vandet varmes op?",
            valg: [
                "Opløseligheden af PbI₂ stiger med temperaturen",
                "PbI₂ fordamper",
                "PbI₂ reagerer med vandet og bliver til et nyt stof",
                "Omrøringen knuser krystallerne, så de ikke kan ses"
            ],
            rigtig: 0,
            forklaring: "I varmt vand kan der opløses mere PbI₂. Ved en bestemt temperatur er der plads til det hele, og ionerne er frie i opløsningen igen."
        },
        {
            sp: "Hvad er de glinsende krystaller, der kommer ved afkøling?",
            valg: [
                "PbI₂, der krystalliserer, fordi opløseligheden falder",
                "Is, der dannes i det kolde vand",
                "KNO₃, der fældes ud",
                "Urenheder fra bægerglasset"
            ],
            rigtig: 0,
            forklaring: "Når temperaturen falder, kan der ikke længere være så meget PbI₂ opløst. Ionerne samles igen til krystaller af PbI₂."
        },
        {
            sp: "Hvorfor afvejes samme masse Pb(NO₃)₂ og KI?",
            valg: [
                "M(Pb(NO₃)₂) er næsten det dobbelte af M(KI), så der bliver dobbelt så mange mol KI",
                "Fordi massen er bevaret i en kemisk reaktion",
                "Fordi de to stoffer har samme molare masse",
                "Fordi der så dannes mest KNO₃"
            ],
            rigtig: 0,
            forklaring: "Reaktionen kræver 2 mol KI pr. mol Pb(NO₃)₂. M(Pb(NO₃)₂) = 331,2 g/mol og M(KI) = 166,0 g/mol, så samme masse giver netop dobbelt så mange mol KI."
        },
        {
            sp: "Der bruges 0,10 g Pb(NO₃)₂ og 0,10 g KI. Hvor meget PbI₂ kan der højst dannes? M(PbI₂) = 461,0 g/mol.",
            valg: ["0,14 g", "0,10 g", "0,20 g", "0,28 g"],
            rigtig: 0,
            forklaring: "n(Pb(NO₃)₂) = 0,10 g / 331,2 g/mol = 0,30 mmol. Der dannes 0,30 mmol PbI₂, og 0,30 mmol · 461,0 g/mol = 0,14 g."
        },
        {
            sp: "Bundfaldet med 0,14 g PbI₂ i 100 mL vand forsvandt ved 52 °C. Hvad fortæller det?",
            valg: [
                "Opløseligheden af PbI₂ ved 52 °C er ca. 0,14 g pr. 100 mL",
                "PbI₂ smelter ved 52 °C",
                "Ved 52 °C kan der ikke opløses PbI₂",
                "Opløseligheden er 0,14 g pr. 100 mL ved alle temperaturer"
            ],
            rigtig: 0,
            forklaring: "Ved netop den temperatur er opløsningen mættet med 0,14 g PbI₂. Det er et punkt på opløselighedskurven."
        },
        {
            sp: "Opløseligheden af PbI₂ er 0,069 g pr. 100 mL ved 20 °C. Er PbI₂ tungtopløseligt?",
            valg: [
                "Ja, det er under 1 g pr. 100 mL",
                "Nej, fordi det kan opløses i varmt vand",
                "Nej, fordi der opløses lidt",
                "Ja, fordi det er gult"
            ],
            rigtig: 0,
            forklaring: "Grænsen er 1 g pr. 100 mL. PbI₂ ligger langt under, selv om opløseligheden stiger meget, når vandet varmes op."
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
            tekst.textContent = "Låses op, når der er tre målinger.";
            knap.hidden = true;
        } else if (this.tilstand === "klar") {
            NK.saetTekst("quiz-taeller", n + " spørgsmål");
            tekst.textContent = "Tre målinger er noteret.";
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
