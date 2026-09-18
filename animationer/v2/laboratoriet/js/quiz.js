/* =====================================================================
   quiz.js - quizzen som faelles ramme

   Alle otte gamle forsoeg havde deres egen quiz, og de var 70 % ens: ti
   spoergsmaal med fire svar, blandet hver gang, ét forsoeg pr. spoergsmaal,
   og en begrundelse bagefter - ogsaa naar svaret er rigtigt, for det er
   dér, der bliver lært noget. Her staar maskineriet én gang. Forsoeget
   leverer kun spoergsmaalene og betingelsen for, hvornaar quizzen aabner.

   Spoergsmaalene staar i forsoegets js/tekst.js under noeglen "quiz", saa
   al prosa i et forsoeg stadig kan laeses ét sted:

     "quiz": {
         laast: "Laases op, naar der er taget billede af glas 1 til 7.",
         klar:  "Billedet af glassene er taget.",
         spoergsmaal: [
             { sp: "Hvilket stof giver farven?",
               valg: ["FeSCN²⁺", "Fe³⁺", "SCN⁻", "NO₃⁻"],
               rigtig: 0,
               forklaring: "Komplekset FeSCN²⁺ er roedt …" }
         ]
     }

   Et svar er enten en streng eller { tekst, farve }. Med farve vises en
   lille farveproeve foran teksten; farve: null betyder farveloes og vises
   ternet. rigtig er nummeret paa det rigtige svar, FOER blandingen.

   Forsoeget aabner quizzen med et vilkaar (vilkaar.js) i sidens valg:

     NK.Side.start({ … quiz: { krav: { journal: "billede", faerdig: true } } })

   krav er et almindeligt vilkaar og maa derfor ogsaa vaere en funktion
   (bord, forloeb) - fx "alle syv blandinger er proevet", som den gamle
   sc1.3 havde. Uden krav er quizzen aaben fra begyndelsen.

   Siden bygger quizzen, hvis den har kortet #quiz-kort, og beder den selv
   se efter sit krav, hver gang panelet opdateres. Al stil staar allerede i
   laboratoriet/css/grund.css (.valg, .valgknap, .farveprove, .quiz-score).

   Markup'en i forsoegets index.html:

     <div class="kort opgavekort" id="quiz-kort">
         <h2><span>Quiz</span> <span class="taeller" id="quiz-taeller"></span></h2>
         <p class="besked" id="quiz-tekst"></p>
         <div class="valg" id="quiz-valg" hidden></div>
         <p class="besked" id="quiz-forklaring" hidden></p>
         <div class="quiz-score" id="quiz-score" hidden></div>
         <button class="knap stor blaa" id="quiz-knap" type="button" hidden>
             <span id="quiz-knap-tekst">Start quiz</span><span class="tegn">→</span>
         </button>
     </div>
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Rammens egne ord. Forsoeget skriver kun laast og klar. */
    var ORD = {
        start: "Start quiz",
        naeste: "Næste spørgsmål",
        resultat: "Se resultatet",
        igen: "Tag quizzen igen",
        rigtigt: "Rigtigt. ",
        forkert: "Forkert. ",
        spoergsmaal: " spørgsmål",
        alle: "Alle svar er rigtige.",
        godt: "Godt klaret.",
        oev: "Prøv igen.",
        medTeori: { godt: "Godt klaret. Tag quizzen igen, eller læs teorien.",
                    oev: "Læs teorien, og tag quizzen igen." },
        laast: "Quizzen er ikke låst op endnu.",
        klar: "Quizzen er klar."
    };

    function el(id) { return NK.el(id); }

    /* tilstand: laast | klar | sp | slut */
    function Quiz(valg, side) {
        this.valg = valg || {};
        this.side = side || null;
        this.spoergsmaal = [];
        this.ord = {};
        this.tilstand = "laast";
        this.nr = 0;
        this.rigtige = 0;
        this.aktuel = null;
        this.svaret = false;
        this.saetIndhold(this.valg.indhold);
        var mig = this;
        if (el("quiz-knap")) el("quiz-knap").addEventListener("click", function () { mig.knap(); });
        this.opdaterLaas();
    }

    var Q = Quiz.prototype;

    /* Indholdet fra forsoegets tekst.js: { laast, klar, spoergsmaal } */
    Q.saetIndhold = function (indhold) {
        indhold = indhold || {};
        this.spoergsmaal = indhold.spoergsmaal || [];
        this.ord = { laast: indhold.laast || ORD.laast, klar: indhold.klar || ORD.klar };
    };

    Q.antal = function () { return this.spoergsmaal.length; };

    /* ----- Laasen -------------------------------------------------------
       Kravet er et vilkaar over verden (vilkaar.js) eller en funktion. Den
       proeves, hver gang panelet opdateres, saa quizzen aabner af sig selv
       i samme oejeblik, eleven har gjort det, der skulle til. */
    Q.aaben = function () {
        var krav = this.valg.krav;
        if (krav === undefined || krav === null) return true;
        if (!NK.Vilkaar) return true;
        var bord = this.side && this.side.bord ? this.side.bord() : null;
        return !!NK.Vilkaar.opfyldt(krav, bord, NK.Forloeb && NK.Forloeb.nu);
    };

    Q.opdaterLaas = function () {
        var aaben = this.aaben();
        if (!aaben && this.tilstand !== "laast") this.tilstand = "laast";
        else if (aaben && this.tilstand === "laast") this.tilstand = "klar";
        this.vis();
    };

    Q.nulstil = function () {
        this.tilstand = "laast";
        this.nr = 0;
        this.rigtige = 0;
        this.aktuel = null;
        this.svaret = false;
        if (el("quiz-valg")) el("quiz-valg").innerHTML = "";
        this.opdaterLaas();
    };

    /* ----- Spoergsmaalene ------------------------------------------------ */
    Q.bland = function (sp) {
        var n = (sp.valg || []).length;
        var orden = NK.bland(sp.valg.map(function (_, i) { return i; }));
        return {
            sp: sp.sp,
            forklaring: sp.forklaring,
            valg: orden.map(function (i) { return sp.valg[i]; }),
            rigtig: orden.indexOf(sp.rigtig),
            antalValg: n
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
            if (this.nr >= this.antal()) this.tilstand = "slut";
            else this.nyt();
        }
        this.vis();
        if (this.tilstand !== "laast" && el("quiz-kort")) el("quiz-kort").scrollIntoView({ block: "nearest" });
    };

    Q.nyt = function () {
        this.aktuel = this.bland(this.spoergsmaal[this.nr]);
        this.svaret = false;
        var boks = el("quiz-valg");
        if (!boks) return;
        boks.innerHTML = "";
        var mig = this;
        this.aktuel.valg.forEach(function (valg, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "valgknap";
            if (typeof valg === "string") {
                b.textContent = valg;
            } else {
                /* { tekst, farve }: en lille farveproeve foran teksten */
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
        if (this.svaret || this.tilstand !== "sp") return false;
        this.svaret = true;
        var rigtigt = i === this.aktuel.rigtig;
        if (rigtigt) this.rigtige++;
        var boks = el("quiz-valg");
        var knapper = boks ? boks.querySelectorAll(".valgknap") : [];
        for (var k = 0; k < knapper.length; k++) {
            knapper[k].disabled = true;
            if (k === this.aktuel.rigtig) knapper[k].classList.add("rigtig");
            else if (k === i) knapper[k].classList.add("forkert");
        }
        var fk = el("quiz-forklaring");
        if (fk) {
            fk.textContent = (rigtigt ? ORD.rigtigt : ORD.forkert) + (this.aktuel.forklaring || "");
            fk.className = "besked " + (rigtigt ? "god" : "skidt");
        }
        this.vis();
        if (el("quiz-knap")) el("quiz-knap").scrollIntoView({ block: "nearest" });
        return rigtigt;
    };

    /* Svar paa det rigtige uden at klikke - til selvtesten */
    Q.svarRigtigt = function () { return this.svar(this.aktuel ? this.aktuel.rigtig : -1); };

    /* ----- Visningen ------------------------------------------------------ */
    Q.slutTekst = function () {
        var n = this.antal();
        if (this.rigtige === n) return ORD.alle;
        var medTeori = !!el("teori");
        if (this.rigtige >= n / 2) return medTeori ? ORD.medTeori.godt : ORD.godt;
        return medTeori ? ORD.medTeori.oev : ORD.oev;
    };

    Q.vis = function () {
        var tekst = el("quiz-tekst"), valg = el("quiz-valg"), fk = el("quiz-forklaring");
        var score = el("quiz-score"), knap = el("quiz-knap");
        var n = this.antal();
        if (!tekst) return;

        if (valg) valg.hidden = this.tilstand !== "sp";
        if (fk) fk.hidden = !(this.tilstand === "sp" && this.svaret);
        if (score) score.hidden = this.tilstand !== "slut";
        if (knap) knap.classList.toggle("banker", this.tilstand === "klar");

        if (this.tilstand === "laast") {
            NK.saetTekst("quiz-taeller", "");
            tekst.textContent = this.ord.laast;
            if (knap) knap.hidden = true;
        } else if (this.tilstand === "klar") {
            NK.saetTekst("quiz-taeller", n + ORD.spoergsmaal);
            tekst.textContent = this.ord.klar;
            NK.saetTekst("quiz-knap-tekst", ORD.start);
            if (knap) knap.hidden = false;
        } else if (this.tilstand === "sp") {
            NK.saetTekst("quiz-taeller", (this.nr + 1) + "/" + n);
            tekst.textContent = this.aktuel.sp;
            NK.saetTekst("quiz-knap-tekst", this.nr === n - 1 ? ORD.resultat : ORD.naeste);
            if (knap) knap.hidden = !this.svaret;
        } else {
            NK.saetTekst("quiz-taeller", "Resultat");
            if (score) score.textContent = this.rigtige + " / " + n;
            tekst.textContent = this.slutTekst();
            NK.saetTekst("quiz-knap-tekst", ORD.igen);
            if (knap) knap.hidden = false;
        }
    };

    NK.Quiz = {
        ORD: ORD,
        /* Bygges af side.js, naar siden har #quiz-kort og forsoeget har
           spoergsmaal. valg: { indhold, krav } */
        lav: function (valg, side) { return new Quiz(valg, side); }
    };
}());
