/* =====================================================================
   quiz.js - quizkortet i panelet

   Kortet er laast, indtil glassene er sammenlignet med referencen.
   Svarene blandes hver gang. Der er ét forsoeg pr. spoergsmaal, og
   begrundelsen vises bagefter, ogsaa naar svaret er rigtigt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var SPOERGSMAAL = [
        {
            sp: "Hvilket stof giver opløsningen den røde farve?",
            valg: ["FeSCN²⁺", "Fe³⁺", "SCN⁻", "K⁺"],
            rigtig: 0,
            forklaring: "Komplekset FeSCN²⁺ er rødt. Fe³⁺ er svagt gult, og SCN⁻ og K⁺ er farveløse. Jo mere FeSCN²⁺, jo mørkere farve."
        },
        {
            sp: "Hvorfor skal ét glas stå urørt?",
            valg: [
                "Det er referencen, som de andre glas sammenlignes med",
                "Det skal bruges, hvis et andet glas bliver spildt",
                "Ligevægten skal have tid til at indstille sig",
                "Det viser, hvor meget vand der fordamper"
            ],
            rigtig: 0,
            forklaring: "Et glas kan kun kaldes mørkere eller lysere i forhold til noget. Referencen er magen til de andre glas, bortset fra indgrebet."
        },
        {
            sp: "Der dryppes Fe(NO₃)₃ i et glas. Hvad sker der?",
            valg: [
                "Ligevægten forskydes mod højre, og farven bliver mørkere",
                "Ligevægten forskydes mod venstre, og farven bliver lysere",
                "Ligevægten ændrer sig ikke, men farven bliver gul",
                "K bliver større, og farven bliver mørkere"
            ],
            rigtig: 0,
            forklaring: "Noget af det tilsatte Fe³⁺ reagerer med SCN⁻, så der dannes mere FeSCN²⁺. K er uændret, fordi temperaturen er den samme."
        },
        {
            sp: "Der er tilsat KSCN, og en ny ligevægt har indstillet sig. Hvad er der sket med koncentrationen af frie Fe³⁺-ioner?",
            valg: ["Den er faldet", "Den er steget", "Den er uændret", "Den er blevet nul"],
            rigtig: 0,
            forklaring: "Mere SCN⁻ forskyder ligevægten mod højre. Noget af det frie Fe³⁺ bindes i FeSCN²⁺, så c(Fe³⁺) falder."
        },
        {
            sp: "Hvad er det hvide bundfald, der dannes med AgNO₃?",
            valg: ["AgSCN", "AgNO₃", "Fe(SCN)₃", "FeSCN²⁺"],
            rigtig: 0,
            forklaring: "Ag⁺ og SCN⁻ danner det tungtopløselige salt AgSCN: Ag⁺ + SCN⁻ → AgSCN(s)."
        },
        {
            sp: "Hvorfor bliver glasset med AgNO₃ lysere?",
            valg: [
                "Ag⁺ fjerner SCN⁻, og ligevægten forskydes mod venstre",
                "Ag⁺ reagerer med Fe³⁺, så der dannes mere FeSCN²⁺",
                "Bundfaldet dækker for farven",
                "AgNO₃ fortynder opløsningen"
            ],
            rigtig: 0,
            forklaring: "Når SCN⁻ fældes, falder c(SCN⁻). Ligevægten forskydes mod venstre, og FeSCN²⁺ bliver brugt op."
        },
        {
            sp: "Glasset i det varme vandbad bliver lysere. Hvad viser det om reaktionen Fe³⁺ + SCN⁻ → FeSCN²⁺?",
            valg: [
                "Den er exoterm",
                "Den er endoterm",
                "Den går hurtigere, men ligevægten er den samme",
                "Den stopper ved høj temperatur"
            ],
            rigtig: 0,
            forklaring: "Ved opvarmning forskydes en ligevægt i den endoterme retning. Farven bliver lysere, så ligevægten forskydes mod venstre. Reaktionen mod højre er derfor exoterm."
        },
        {
            sp: "Hvad sker der med K, når glasset opvarmes?",
            valg: ["K bliver mindre", "K bliver større", "K er uændret", "K bliver negativ"],
            rigtig: 0,
            forklaring: "K afhænger kun af temperaturen. For en exoterm reaktion bliver K mindre, når temperaturen stiger."
        },
        {
            sp: "Glasset fra vandbadet stilles tilbage i stativet og køler af. Hvad sker der?",
            valg: ["Farven bliver mørkere igen", "Farven forbliver lys", "Der dannes bundfald", "Farven bliver gul"],
            rigtig: 0,
            forklaring: "Ligevægten indstiller sig efter temperaturen. Når glasset køler af, bliver K større igen, og der dannes mere FeSCN²⁺."
        },
        {
            sp: "Hvorfor kigger man ned gennem glassene mod hvidt papir?",
            valg: [
                "Lyset går gennem mere væske, så forskelle i farven ses tydeligere",
                "Det hvide papir reagerer med opløsningen",
                "Så kan bundfaldet ikke ses",
                "Farven findes kun, når glasset ses ovenfra"
            ],
            rigtig: 0,
            forklaring: "Set ovenfra går lyset gennem hele væskesøjlen. Jo længere lysvej, jo kraftigere farve, og små forskelle bliver tydelige."
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
            tekst.textContent = "Låses op, når glassene er sammenlignet med referencen.";
            knap.hidden = true;
        } else if (this.tilstand === "klar") {
            NK.saetTekst("quiz-taeller", n + " spørgsmål");
            tekst.textContent = "Glassene er sammenlignet.";
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
