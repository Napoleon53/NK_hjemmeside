/* =====================================================================
   quiz.js - quizkortet i panelet

   Kortet er laast, indtil der er taget billede af glas 1 til 7. Svarene
   blandes hver gang. Der er ét forsoeg pr. spoergsmaal, og begrundelsen
   vises bagefter, ogsaa naar svaret er rigtigt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var SPOERGSMAAL = [
        {
            sp: "Hvilket stof giver stamopløsningen den rødbrune farve?",
            valg: ["FeSCN²⁺", "Fe³⁺", "SCN⁻", "NO₃⁻"],
            rigtig: 0,
            forklaring: "Komplekset FeSCN²⁺ er rødt. Fe³⁺ er svagt gult, og SCN⁻ og NO₃⁻ er farveløse. Jo mere FeSCN²⁺, jo mørkere farve."
        },
        {
            sp: "I glas 1 tilsættes fast Fe(NO₃)₃. Hvad sker der?",
            valg: [
                "Ligevægten forskydes mod højre, og farven bliver mørkere",
                "Ligevægten forskydes mod venstre, og farven bliver lysere",
                "Ligevægten ændrer sig ikke, men farven bliver gul",
                "K bliver større, og farven bliver mørkere"
            ],
            rigtig: 0,
            forklaring: "Mere Fe³⁺ gør Y mindre end K. Ligevægten forskydes mod højre, indtil Y igen er lig med K, og der dannes mere FeSCN²⁺. K er uændret."
        },
        {
            sp: "Hvorfor bliver glas 2 lysere, når der tilsættes ascorbinsyre?",
            valg: [
                "Ascorbinsyre reducerer Fe³⁺ til Fe²⁺, så ligevægten forskydes mod venstre",
                "Ascorbinsyre fortynder opløsningen",
                "Ascorbinsyre fælder SCN⁻ som et bundfald",
                "Ascorbinsyre gør opløsningen varmere"
            ],
            rigtig: 0,
            forklaring: "2 Fe³⁺ + C₆H₈O₆ → 2 Fe²⁺ + C₆H₆O₆ + 2 H⁺. Fe²⁺ indgår ikke i ligevægten. Når c(Fe³⁺) falder, forskydes ligevægten mod venstre, og FeSCN²⁺ bliver brugt op."
        },
        {
            sp: "I glas 3 er der tilsat KSCN, og en ny ligevægt har indstillet sig. Hvad er der sket med koncentrationen af frie Fe³⁺-ioner?",
            valg: ["Den er faldet", "Den er steget", "Den er uændret", "Den er blevet nul"],
            rigtig: 0,
            forklaring: "Mere SCN⁻ forskyder ligevægten mod højre. Noget af det frie Fe³⁺ bindes i FeSCN²⁺, så c(Fe³⁺) falder."
        },
        {
            sp: "Hvad viser forundersøgelsen med KSCN og AgNO₃ i glas 8?",
            valg: [
                "At Ag⁺ og SCN⁻ danner et hvidt bundfald",
                "At Ag⁺ og Fe³⁺ danner et bundfald",
                "At KSCN-opløsning er rød",
                "At AgNO₃ gør opløsningen varm"
            ],
            rigtig: 0,
            forklaring: "I glas 8 er der ingen jernioner. Det hvide bundfald må derfor være AgSCN: Ag⁺ + SCN⁻ → AgSCN(s). Så ved man, hvad Ag⁺ gør ved SCN⁻ i glas 4."
        },
        {
            sp: "Hvorfor bliver glas 4 lysere, når der dryppes AgNO₃ i?",
            valg: [
                "Ag⁺ fjerner SCN⁻, og ligevægten forskydes mod venstre",
                "Ag⁺ reagerer med Fe³⁺, så der dannes mere FeSCN²⁺",
                "Bundfaldet dækker for farven",
                "AgNO₃ fortynder opløsningen"
            ],
            rigtig: 0,
            forklaring: "Når SCN⁻ fældes, falder c(SCN⁻), og Y bliver større end K. Ligevægten forskydes mod venstre, og FeSCN²⁺ bliver brugt op."
        },
        {
            sp: "Glas 5 i det varme vandbad bliver lysere. Hvad viser det om reaktionen Fe³⁺ + SCN⁻ → FeSCN²⁺?",
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
            sp: "Hvad sker der med K, når glas 6 står i isbadet?",
            valg: ["K bliver større", "K bliver mindre", "K er uændret", "K bliver nul"],
            rigtig: 0,
            forklaring: "K afhænger kun af temperaturen. Reaktionen mod højre er exoterm, så K bliver større, når temperaturen falder. Y er nu mindre end K, og ligevægten forskydes mod højre."
        },
        {
            sp: "Hvorfor tilsættes Fe(NO₃)₃ og KSCN som fast stof i glas 1 og 3?",
            valg: [
                "En opløsning ville også fortynde glasset, så der ikke er variabelkontrol",
                "Fast stof reagerer hurtigere end opløste ioner",
                "Fast stof giver altid en mørkere farve",
                "En opløsning ville fælde jernet"
            ],
            rigtig: 0,
            forklaring: "Med fast stof ændres kun koncentrationen af det tilsatte stof. En opløsning ville samtidig fortynde, og fortynding er selv et indgreb, der forskyder ligevægten."
        },
        {
            sp: "Ligevægtsblandingen fortyndes til dobbelt volumen og ses ovenfra. Hvad sker der?",
            valg: [
                "Den bliver lysere, fordi Y bliver større end K, og ligevægten forskydes mod venstre",
                "Den ser ens ud, fordi antallet af farvede partikler er det samme",
                "Den bliver mørkere, fordi Y bliver mindre end K",
                "Den bliver lysere, fordi vandet ødelægger FeSCN²⁺"
            ],
            rigtig: 0,
            forklaring: "Når alle koncentrationer halveres, fordobles Y. Y er større end K, så ligevægten forskydes mod venstre, og der bliver færre FeSCN²⁺. Frugtfarve ser derimod ens ud ovenfra, fordi antallet af farvestofmolekyler er det samme."
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
            tekst.textContent = "Låses op, når der er taget billede af glas 1 til 7.";
            knap.hidden = true;
        } else if (this.tilstand === "klar") {
            NK.saetTekst("quiz-taeller", n + " spørgsmål");
            tekst.textContent = "Billedet af glassene er taget.";
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
