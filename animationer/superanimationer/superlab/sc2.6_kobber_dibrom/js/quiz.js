/* =====================================================================
   quiz.js - quizkortet i panelet

   Kortet er laast, indtil begge tests er lavet. Svarene blandes hver
   gang. Der er ét forsoeg pr. spoergsmaal, og begrundelsen vises
   bagefter, ogsaa naar svaret er rigtigt.

   Et svar er enten en tekst eller { tekst, farve }. Med farve vises en
   lille farveproeve foran teksten; farve: null betyder farveloes og
   vises ternet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;

    function farve(navn) {
        var f = M.FARVE[navn];
        return NK.css({ r: f.r, g: f.g, b: f.b, a: 1 });
    }

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
            sp: "Efter rystningen er opløsningen i kolben svagt blågrøn. Hvilken ion giver farven?",
            valg: ["Cu²⁺", "Br⁻", "Br₂", "Kobberatomer, der svæver i væsken"],
            rigtig: 0,
            forklaring: "Br₂ er brugt op, og Br⁻-ioner er farveløse. Farven kommer fra Cu²⁺-ionerne i opløsningen."
        },
        {
            sp: "Hvilken farve har opløsningen med Ag⁺ i dråbeflasken, før den dryppes i reagensglasset?",
            valg: [
                { tekst: "Farveløs", farve: null },
                { tekst: "Brun", farve: "#7a3f16" },
                { tekst: "Lysegul", farve: farve("bundfald") },
                { tekst: "Mørkeblå", farve: farve("kompleks") }
            ],
            rigtig: 0,
            forklaring: "AgNO₃(aq) er farveløs, ligesom NH₃(aq). Flasken er brun, fordi sølvnitrat påvirkes af lys. Farven i glasset opstår først ved reaktionen."
        },
        {
            sp: "Hvilken farve har bundfaldet, der dannes, når AgNO₃ dryppes i glasset?",
            valg: [
                { tekst: "Lysegul", farve: farve("bundfald") },
                { tekst: "Hvid", farve: "#f4f6f8" },
                { tekst: "Mørkeblå", farve: farve("kompleks") },
                { tekst: "Rødbrun", farve: "#8a3b17" }
            ],
            rigtig: 0,
            forklaring: "Bundfaldet er sølvbromid, AgBr, som er lysegult. Hverken Ag⁺ eller Br⁻ har farve i opløsning, men det faste stof har."
        },
        {
            sp: "Bundfaldet med AgNO₃ påviser en ion i opløsningen fra kolben. Hvilken?",
            valg: ["Br⁻", "Cu²⁺", "NO₃⁻", "Ag⁺"],
            rigtig: 0,
            forklaring: "Ag⁺ fra sølvnitraten og Br⁻ fra opløsningen danner det tungtopløselige salt AgBr: Ag⁺ + Br⁻ → AgBr(s)."
        },
        {
            sp: "Hvilket stof er mørkeblåt i glasset med NH₃?",
            valg: [
                "Ionen [Cu(NH₃)₄]²⁺, hvor fire NH₃ er bundet til hver Cu²⁺",
                "NH₃, fordi ammoniakvand er blåt",
                "Br⁻, som skifter farve, når NH₃ tilsættes",
                "Kobberspåner, som er opløst af NH₃"
            ],
            rigtig: 0,
            forklaring: "NH₃(aq) er farveløs, og opløsningen var kun svagt blågrøn før. Hver Cu²⁺ binder fire NH₃-molekyler, og ionen [Cu(NH₃)₄]²⁺ er mørkeblå. Derfor påviser farven Cu²⁺."
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
        this.tilstand = "laast";      /* laast | klar | sp | slut */
        this.nr = 0;
        this.rigtige = 0;
        this.aktuel = null;
        this.svaret = false;

        var mig = this;
        NK.el("quiz-knap").addEventListener("click", function () { mig.knap(); });
        this.vis();
    };

    NK.Quiz.valgTekst = function (v) {
        return typeof v === "string" ? v : v.tekst;
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
            if (typeof valg === "string") {
                b.textContent = valg;
            } else {
                b.classList.add("medfarve");
                var proeve = document.createElement("span");
                proeve.className = "farveprove" + (valg.farve ? "" : " farveloes");
                if (valg.farve) proeve.style.backgroundColor = valg.farve;
                b.appendChild(proeve);
                b.appendChild(document.createTextNode(valg.tekst));
            }
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
