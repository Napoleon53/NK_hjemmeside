/* =====================================================================
   quiz.js - quizkortet i panelet

   Kortet er laast, indtil alle syv blandinger er testet. Svarene
   blandes hver gang. Der er ét forsoeg pr. spoergsmaal, og
   begrundelsen vises bagefter, ogsaa naar svaret er rigtigt.
   Kortet har kun én knap ad gangen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var SPOERGSMAAL = [
        {
            sp: "Glasset er fyldt med 6 streger H₂ og 0 streger O₂. Hvad sker der, når det holdes ind over flammen?",
            valg: [
                "Et kraftigt knald, fordi H₂ er brandbar",
                "Ingen reaktion, fordi der ikke er O₂ i glasset",
                "Der dannes vand, men uden lyd",
                "Glasset knalder altid, uanset indholdet"
            ],
            rigtig: 1,
            forklaring: "H₂ reagerer med O₂. Uden O₂ i glasset er der intet at reagere med, og der kommer ikke noget knald."
        },
        {
            sp: "Glasset er fyldt med 0 streger H₂ og 6 streger O₂. Hvad sker der?",
            valg: [
                "Et kraftigt knald, fordi O₂ er meget reaktiv",
                "Der dannes ozon i stedet for vand",
                "Ingen reaktion, fordi der ikke er H₂ at reagere med",
                "Gassen brænder langsomt af sig selv"
            ],
            rigtig: 2,
            forklaring: "O₂ brænder ikke af sig selv. Reaktionen kræver begge stoffer, og uden H₂ sker der intet."
        },
        {
            sp: "Ved hvilken blanding bliver knaldet kraftigst?",
            valg: [
                "6 streger H₂ og 0 streger O₂",
                "3 streger H₂ og 3 streger O₂",
                "4 streger H₂ og 2 streger O₂",
                "1 streg H₂ og 5 streger O₂"
            ],
            rigtig: 2,
            forklaring: "Reaktionsskemaet 2 H₂ + O₂ → 2 H₂O giver forholdet 2 : 1. Ved 4 streger H₂ og 2 streger O₂ reagerer al gassen, og der er intet overskud."
        },
        {
            sp: "Glasset indeholder 5 streger H₂ og 1 streg O₂. Hvad er der i glasset lige efter knaldet?",
            valg: [
                "Kun vanddamp",
                "Vanddamp og overskydende H₂",
                "Vanddamp og overskydende O₂",
                "H₂ og O₂ i forholdet 5 : 1"
            ],
            rigtig: 1,
            forklaring: "1 streg O₂ reagerer med 2 streger H₂. De sidste 3 streger H₂ har intet O₂ at reagere med og bliver tilbage."
        },
        {
            sp: "Hvorfor lyder der et knald, når H₂ og O₂ reagerer?",
            valg: [
                "Reaktionen er endoterm og optager energi fra omgivelserne",
                "Reaktionen er exoterm og frigiver energien på meget kort tid, så gassen udvider sig voldsomt",
                "Den dannede vanddamp udsender selv lyd",
                "Glasset slår mod braenderen"
            ],
            rigtig: 1,
            forklaring: "Reaktionen er exoterm. Energien frigives på en brøkdel af et sekund, gassen opvarmes og udvider sig pludseligt, og trykbølgen høres som et knald."
        }
    ];
    SPOERGSMAAL[4].valg[3] = "Glasset slår mod brænderen";

    NK.QUIZ = SPOERGSMAAL;

    NK.Quiz = function (antalBlandinger) {
        this.antal = antalBlandinger;
        this.testet = 0;
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

    Q.saetTestet = function (n) {
        this.testet = n;
        if (n < this.antal && this.tilstand !== "laast") this.tilstand = "laast";
        else if (n >= this.antal && this.tilstand === "laast") this.tilstand = "klar";
        this.vis();
    };

    /* Svarmulighederne i tilfaeldig raekkefoelge, men med styr paa,
       hvilken der er den rigtige. */
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
            NK.saetTekst("quiz-taeller", this.testet + "/" + this.antal + " testet");
            tekst.textContent = "Låses op, når alle syv blandinger er testet.";
            knap.hidden = true;
        } else if (this.tilstand === "klar") {
            NK.saetTekst("quiz-taeller", n + " spørgsmål");
            tekst.textContent = "Alle syv blandinger er testet.";
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
                : (this.rigtige >= n / 2 ? "Godt klaret. Tag quizzen igen, eller læs teorien for de sidste detaljer."
                : "Læs teorien, gentag forsøget, og tag quizzen igen.");
            NK.saetTekst("quiz-knap-tekst", "Tag quizzen igen");
            knap.hidden = false;
        }
    };
}());
