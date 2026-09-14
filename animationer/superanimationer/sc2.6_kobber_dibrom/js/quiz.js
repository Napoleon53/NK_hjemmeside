/* =====================================================================
   quiz.js - quizkortet i panelet

   Kortet er laast, indtil begge tests er lavet. Svarene blandes hver
   gang. Der er ét forsoeg pr. spoergsmaal, og begrundelsen vises
   bagefter, ogsaa naar svaret er rigtigt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var SPOERGSMAAL = [
        {
            sp: "Hvilken iagttagelse viser, at al Br₂ i kolben har reageret?",
            valg: [
                "Den orange farve er forsvundet",
                "Der er kobber tilbage i kolben",
                "Kolben bliver kold",
                "Der dannes bobler ved kobberet"
            ],
            rigtig: 0,
            forklaring: "Br₂ er det stof, der giver bromvand den orange farve. Når farven er væk, er der ikke mere Br₂."
        },
        {
            sp: "Hvilket reaktionsskema passer til reaktionen i kolben?",
            valg: [
                "Cu + Br₂ → Cu²⁺ + 2 Br⁻",
                "Cu + Br₂ → Cu²⁺ + Br⁻",
                "Cu + 2 Br₂ → Cu²⁺ + 4 Br⁻",
                "Cu²⁺ + 2 Br⁻ → Cu + Br₂"
            ],
            rigtig: 0,
            forklaring: "Både atomer og ladning skal gå op. Til venstre er ladningen 0, og til højre er den +2 + 2 · (−1) = 0."
        },
        {
            sp: "Hvad sker der med et kobberatom i reaktionen?",
            valg: [
                "Det afgiver 2 elektroner og bliver til Cu²⁺",
                "Det optager 2 elektroner og bliver til Cu²⁺",
                "Det deler elektroner med Br og danner et molekyle",
                "Det forbliver neutralt og opløses i vandet"
            ],
            rigtig: 0,
            forklaring: "Et Cu-atom har lige mange protoner og elektroner. Når det afgiver 2 elektroner til Br₂, har det 2 positive ladninger i overskud."
        },
        {
            sp: "Hvorfor er der kobber tilbage i kolben, når farven ikke ændrer sig mere?",
            valg: [
                "Kobber var i overskud, så Br₂ blev brugt op først",
                "Reaktionen stopper, når kolben ikke rystes mere",
                "Br₂ var i overskud",
                "Kobberet er dækket af bundfald"
            ],
            rigtig: 0,
            forklaring: "Reaktionen stopper, når et af stofferne er brugt op. Der var mere kobber, end Br₂ kunne reagere med."
        },
        {
            sp: "Et glas får tilsat AgNO₃, og der dannes et lysegult bundfald. Hvilken ion påviser det i opløsningen?",
            valg: ["Br⁻", "Cu²⁺", "NO₃⁻", "Ag⁺"],
            rigtig: 0,
            forklaring: "Ag⁺ fra sølvnitraten og Br⁻ fra opløsningen danner det tungtopløselige salt AgBr: Ag⁺ + Br⁻ → AgBr(s)."
        },
        {
            sp: "Hvilken ion viser den mørkeblå farve, når der dryppes NH₃ i et af glassene?",
            valg: ["Cu²⁺", "Br⁻", "Br₂", "NO₃⁻"],
            rigtig: 0,
            forklaring: "NH₃-molekyler binder sig til Cu²⁺, fire pr. ion. Ionen [Cu(NH₃)₄]²⁺ er mørkeblå."
        },
        {
            sp: "Hvorfor laves forsøget i stinkskab med udsugning?",
            valg: [
                "Br₂ fordamper let, og dampene er giftige at indånde",
                "Kobber afgiver en giftig gas, når det rystes",
                "Reaktionen kræver en luftstrøm for at forløbe",
                "Udsugningen køler kolben"
            ],
            rigtig: 0,
            forklaring: "Bromvand afgiver Br₂-damp, som er giftig. Udsugningen fjerner dampene, før de når ud i lokalet."
        }
    ];

    NK.QUIZ = SPOERGSMAAL;

    NK.Quiz = function () {
        this.laast = true;
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
        this.aktuel.valg.forEach(function (tekst, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "valgknap";
            b.textContent = tekst;
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
            tekst.textContent = "Låses op, når begge tests er lavet.";
            knap.hidden = true;
        } else if (this.tilstand === "klar") {
            NK.saetTekst("quiz-taeller", n + " spørgsmål");
            tekst.textContent = "Begge tests er lavet.";
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
