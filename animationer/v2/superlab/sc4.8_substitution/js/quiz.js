/* =====================================================================
   quiz.js - quizkortet i panelet

   Kortet er laast, indtil begge glas er testet med pH-papir og AgNO3.
   Svarene blandes hver gang. Der er ét forsoeg pr. spoergsmaal, og
   begrundelsen vises bagefter, ogsaa naar svaret er rigtigt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var SPOERGSMAAL = [
        {
            sp: "Hexan lægger sig oven på bromvandet. Hvorfor?",
            valg: [
                "Hexan har lavere densitet end vand og blandes ikke med det",
                "Hexan er tungere end vand",
                "Hexan opløses i vandet",
                "Br₂ skubber hexanen op"
            ],
            rigtig: 0,
            forklaring: "Hexan er upolært og blandes ikke med det polære vand. Hexan har lavere densitet og lægger sig derfor øverst."
        },
        {
            sp: "Hvorfor flytter den orange farve op i hexanlaget, når glasset rystes?",
            valg: [
                "Br₂ er upolært og opløses bedst i det upolære hexan",
                "Br₂ er lettere end vand",
                "Br₂ reagerer med hexan med det samme",
                "Vandet bliver varmt"
            ],
            rigtig: 0,
            forklaring: "Br₂ er et upolært molekyle. Det opløses langt bedre i upolært hexan end i polært vand og vandrer derfor over i hexanlaget."
        },
        {
            sp: "Hvad viser det, at den orange farve forsvinder i lyset?",
            valg: [
                "Br₂ er brugt op i en kemisk reaktion",
                "Br₂ er fordampet",
                "Br₂ er gået tilbage i vandet",
                "Lyset bleger hexanen"
            ],
            rigtig: 0,
            forklaring: "Farven skyldes Br₂. Når den forsvinder, er Br₂ omdannet til andre stoffer: bromhexan og hydrogenbromid."
        },
        {
            sp: "Hvilket reaktionsskema beskriver reaktionen i lyset?",
            valg: [
                "C₆H₁₄ + Br₂ → C₆H₁₃Br + HBr",
                "C₆H₁₄ + Br₂ → C₆H₁₄Br₂",
                "C₆H₁₄ + Br₂ → C₆H₁₂ + 2 HBr",
                "C₆H₁₄ + Br₂ → C₆H₁₃ + HBr₂"
            ],
            rigtig: 0,
            forklaring: "Et H-atom i hexan udskiftes med et Br-atom. Det andet Br-atom binder sig til det frigjorte H-atom som HBr."
        },
        {
            sp: "Hvorfor kaldes reaktionen en substitution?",
            valg: [
                "Et atom i molekylet erstattes af et andet",
                "To molekyler lægges sammen til ét",
                "Molekylet spaltes i to",
                "Br₂ opløses i hexan"
            ],
            rigtig: 0,
            forklaring: "Substitution betyder udskiftning. Et H-atom i hexan erstattes af et Br-atom. Ved en addition ville Br₂ i stedet lægge sig til en dobbeltbinding."
        },
        {
            sp: "Hvad er lysets rolle i reaktionen?",
            valg: [
                "Lyset leverer energi til at spalte Br₂ i to Br-atomer",
                "Lyset varmer hexanen op, så den koger",
                "Lyset gør hexan polært",
                "Lyset har ingen betydning"
            ],
            rigtig: 0,
            forklaring: "Bindingen i Br₂ brydes af lysenergi. Uden lys dannes der ingen Br-atomer, og reaktionen går i stå. Det viste glasset i mørke."
        },
        {
            sp: "pH-papiret blev rødt i vandfasen fra glasset i lyset. Hvad skyldes det?",
            valg: [
                "HBr er en syre og afgiver H⁺ til vand, så der dannes H₃O⁺",
                "Br₂ er en syre",
                "Hexan er en syre",
                "Bromhexan opløses i vandet"
            ],
            rigtig: 0,
            forklaring: "Det dannede HBr er polært og opløses i vandfasen. HBr er en stærk syre: HBr + H₂O → H₃O⁺ + Br⁻. Det giver en lav pH."
        },
        {
            sp: "Hvad viser det lysegule bundfald med AgNO₃?",
            valg: [
                "Der er bromidioner, Br⁻, i vandfasen",
                "Der er Br₂ i vandfasen",
                "Der er sølv i hexanen",
                "Vandfasen er basisk"
            ],
            rigtig: 0,
            forklaring: "Ag⁺ danner et tungtopløseligt bundfald med Br⁻: Ag⁺ + Br⁻ → AgBr(s). Bromidionerne stammer fra HBr."
        },
        {
            sp: "Hvorfor står det ene glas i mørke?",
            valg: [
                "Som kontrol, der viser, at det er lyset, der får reaktionen til at ske",
                "For at Br₂ kan opløses bedre",
                "Fordi bromvand skal beskyttes mod lys",
                "For at reaktionen skal gå hurtigere"
            ],
            rigtig: 0,
            forklaring: "Et kontrolforsøg er magen til, bortset fra den ene ting, der undersøges. Glasset i mørke beholder farven, og der findes hverken syre eller bromid i vandfasen."
        },
        {
            sp: "Hvor skal resterne fra forsøget hen?",
            valg: [
                "I beholderen til halogenholdigt organisk affald",
                "I vasken med rigeligt vand",
                "I beholderen til tungmetalaffald",
                "I skraldespanden"
            ],
            rigtig: 0,
            forklaring: "Bromhexan er et halogeneret organisk stof og må ikke hældes i vasken. Det afleveres som halogenholdigt organisk affald."
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
            tekst.textContent = "Låses op, når begge glas er testet med pH-papir og AgNO₃.";
            knap.hidden = true;
        } else if (this.tilstand === "klar") {
            NK.saetTekst("quiz-taeller", n + " spørgsmål");
            tekst.textContent = "Begge glas er testet.";
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
