/* =====================================================================
   quiz.js - quizkortet i panelet

   Kortet er laast, indtil fedtindholdet er beregnet i et forsoeg med
   heptan. Svarene blandes hver gang. Der er ét forsoeg pr. spoergsmaal,
   og begrundelsen vises bagefter, ogsaa naar svaret er rigtigt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var SPOERGSMAAL = [
        {
            sp: "Hvorfor kan heptan trække fedtet ud af chipsene, mens vand ikke kan?",
            valg: [
                "Heptan og fedtstof er begge upolære",
                "Heptan er varmere end vand",
                "Fedtstof er polært ligesom heptan",
                "Vand fordamper, før det når fedtet"
            ],
            rigtig: 0,
            forklaring: "Stoffer med samme polaritet blander sig med hinanden. Fedtstof og heptan er upolære, mens vand er polært."
        },
        {
            sp: "Med vand som opløsningsmiddel var der en tynd, hvid belægning tilbage. Hvad var det?",
            valg: ["Salt fra chipsene", "Fedt fra chipsene", "Heptan", "Kalk fra glasset"],
            rigtig: 0,
            forklaring: "Salt består af ionerne Na⁺ og Cl⁻. De tiltrækkes af de polære vandmolekyler og opløses. Fedtet opløses ikke i vand."
        },
        {
            sp: "Hvorfor knuses chipsene, før opløsningsmidlet tilsættes?",
            valg: [
                "Så opløsningsmidlet hurtigere når fedtet inde i chipsene",
                "Så fedtet bliver polært",
                "Så chipsene kan løbe gennem filteret",
                "Så stivelsen opløses"
            ],
            rigtig: 0,
            forklaring: "Når chipsene knuses, bliver overfladen større. Heptanen kommer i kontakt med mere af fedtet på én gang, og ekstraktionen går hurtigere."
        },
        {
            sp: "Hvad bliver tilbage i filtrerpapiret?",
            valg: ["Stivelse og andre faste dele af chipsene", "Fedtet", "Heptanen", "Både fedtet og heptanen"],
            rigtig: 0,
            forklaring: "Filtrerpapiret holder på de faste stoffer. Fedtet er opløst i heptanen og løber igennem."
        },
        {
            sp: "Hvorfor fordamper heptanen, mens fedtet bliver tilbage i glasset?",
            valg: [
                "Heptan har et meget lavere kogepunkt end fedtstof",
                "Heptan er tungere end fedtstof",
                "Fedtet reagerer med glasset",
                "Heptan er polært"
            ],
            rigtig: 0,
            forklaring: "Heptan koger ved 98 °C. Fedtstofmolekylerne er meget større og tiltrækker hinanden kraftigere, så de fordamper ikke ved den temperatur."
        },
        {
            sp: "Hvorfor vejes den tomme petriskål, før filtratet hældes i?",
            valg: [
                "Så massen af fedtet kan findes som forskellen mellem to vejninger",
                "Så vægten kan nulstilles",
                "For at se, om skålen er ren",
                "Fordi skålen bliver lettere af at blive varmet op"
            ],
            rigtig: 0,
            forklaring: "Massen af fedtet er massen af petriskålen med fedt minus massen af den tomme petriskål."
        },
        {
            sp: "5,00 g chips giver 1,60 g fedt. Hvad er fedtindholdet?",
            valg: ["32 %", "1,6 %", "3,1 %", "0,32 %"],
            rigtig: 0,
            forklaring: "Fedtindholdet er 1,60 g / 5,00 g · 100 % = 32 %."
        },
        {
            sp: "Resultatet er lidt lavere end varedeklarationen. Hvad er en sandsynlig grund?",
            valg: [
                "Noget af opløsningen med fedt blev i filteret og chipsresterne",
                "Heptanen var ikke fordampet helt, da glasset blev vejet",
                "Chipsene indeholdt salt",
                "Den tomme petriskål blev vejet først"
            ],
            rigtig: 0,
            forklaring: "Filtrerpapiret og chipsresterne holder på lidt af opløsningen. Skylles filteret med lidt mere heptan, kommer mere af fedtet med. Rester af heptan ville give et for højt resultat."
        },
        {
            sp: "Hvorfor inddampes heptanen på en varmeplade og ikke over bunsenbrænderen, selv om begge står i stinkskabet?",
            valg: [
                "Heptandampe er brandfarlige og kan antændes af en åben flamme",
                "En bunsenbrænder er ikke varm nok",
                "Varmepladen får fedtet til at fordampe",
                "Udsugningen fjerner al brandfare"
            ],
            rigtig: 0,
            forklaring: "Heptan er meget brandfarligt. Dampene kan antændes af en flamme, også i et stinkskab. Udsugningen fjerner dampene, men ikke brandfaren."
        },
        {
            sp: "Hvilken del af et fedtstofmolekyle gør det upolært?",
            valg: [
                "De lange kæder af C og H i fedtsyrerne",
                "Glyceroldelen",
                "Oxygenatomerne",
                "Saltet i chipsene"
            ],
            rigtig: 0,
            forklaring: "Et fedtstof er opbygget af glycerol og tre fedtsyrer. Fedtsyrernes lange kulbrintekæder er upolære og udgør langt det meste af molekylet."
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
            tekst.textContent = "Låses op, når du har fundet fedtindholdet i chipsene.";
            knap.hidden = true;
        } else if (this.tilstand === "klar") {
            NK.saetTekst("quiz-taeller", n + " spørgsmål");
            tekst.textContent = "Fedtindholdet er fundet.";
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
