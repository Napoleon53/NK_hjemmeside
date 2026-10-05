/* =====================================================================
   opgave.js - opgavekortet paa alle tre faner (samme som i sb1.1)

   Der er kun ÉN knap i opgavekortet, og den viser det naeste skridt:

     start -> Start opgave   traekker en opgave
     hint  -> Giv hint       et hint, der passer til opgaven
     svar  -> Vis svaret     viser det rigtige svar og forklaringen
     ny    -> Ny opgave      traekker en ny

   Svarer eleven rigtigt undervejs, springer knappen direkte til "Ny
   opgave". Et forkert svar giver forklaringen paa netop den fejl, og
   knappen bliver staaende, saa man kan proeve igen. Afslut foerer
   tilbage til frit spil. Moenstret er det samme som i sc2.2.

   Kortet kalder fanen:
     sim.opsaetOpgave(o)   stil scenen op til opgaven
     sim.slutOpgave()      frit spil igen
     sim.visSvar(o)        (kun opgaver uden svarknapper) vis svaret
   Fanen kalder kortet.klaret(), naar en opgave uden svarknapper er loest.
   Den foerste loeste opgave fjerner ogsaa tilbuddet om Kemichaels
   praesentation (sim.afvisTilbud), for saa er eleven kommet i gang.

   QUIZ (fane 1): new NK.Opgavekort(p, liste, sim, { videreTekst, videre })
   Listens spoergsmaal stilles ét ad gangen, og hvert faar ét svar. Et
   forkert svar (eller Vis svaret) viser det rigtige, og spoergsmaalet
   kommer igen til sidst, med nye tal, hvis det har flere saet. Naar alle
   er besvaret rigtigt, fejres det, og knappen foerer videre
   (quiz.videre). Prikkerne i kortets hoved viser, hvor mange der er
   rigtige. Elementer ud over de faelles: p-prikker og p-fejring.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var KNAPTRIN = {
        start: { tekst: "Start opgave", klasse: "knap stor blaa" },
        hint:  { tekst: "Giv hint",     klasse: "knap stor" },
        svar:  { tekst: "Vis svaret",   klasse: "knap stor" },
        ny:    { tekst: "Ny opgave",    klasse: "knap stor blaa banker" }
    };

    /* Quizzen bruger de samme trin med sine egne ord */
    var QUIZTRIN = {
        start: { tekst: "Start quiz",       klasse: "knap stor blaa" },
        hint:  KNAPTRIN.hint,
        svar:  KNAPTRIN.svar,
        ny:    { tekst: "Næste spørgsmål",  klasse: "knap stor blaa banker" },
        slut:  { tekst: "Videre",           klasse: "knap stor groen" }
    };

    var KONFETTI = ["#f2c53d", "#57d18c", "#5fb6f0", "#c9a6ff", "#ff8a80", "#f0a830"];

    NK.saetKnaptrin = function (id, trin, quiz) {
        var t = (quiz ? QUIZTRIN : KNAPTRIN)[trin];
        NK.saetTekst(id, trin === "slut" && quiz.videreTekst ? quiz.videreTekst : t.tekst);
        NK.saetKlasse(id, t.klasse);
    };

    /* p: forstavelsen paa elementernes id, fx "kurve". quiz: se oeverst */
    function Opgavekort(p, liste, sim, quiz) {
        this.p = p;
        this.liste = liste;
        this.sim = sim;
        this.quiz = quiz || null;
        this.koe = [];              /* quiz: de spoergsmaal, der mangler et rigtigt svar */
        this.def = null;
        this.rigtige = 0;
        this.trin = "start";
        this.opgave = null;
        this.antalLoest = 0;
        this.naesteNr = 0;          /* foerste gang i listens raekkefoelge */
        this.sidste = null;
        this.knapper = [];
        var mig = this;
        NK.el(p + "-opgaveknap").addEventListener("click", function () { mig.tryk(); });
        NK.el(p + "-afslut").addEventListener("click", function () { mig.lilleKnap(); });
        this.vis();
    }

    var P = Opgavekort.prototype;

    P.tryk = function () {
        if (this.trin === "slut") { if (this.quiz.videre) this.quiz.videre(); return; }
        if (this.trin === "start" || this.trin === "ny") { this.ny(); return; }
        if (this.trin === "hint") {
            this.saet("hint", "Hint: " + this.opgave.hint, "hint");
            this.trin = "svar";
        } else if (this.trin === "svar") {
            this.opgave.vist = true;
            if (this.opgave.valg) {
                var mig = this;
                this.opgave.valg.forEach(function (v, i) {
                    if (v.rigtig) mig.knapper[i].classList.add("rigtig");
                    mig.knapper[i].disabled = true;
                });
                var r = this.opgave.valg.filter(function (v) { return v.rigtig; })[0];
                this.saet("besked", "Svaret er " + r.tekst + ". " + r.forklaring, "besked gul");
            } else {
                this.sim.visSvar(this.opgave);
                this.saet("besked", this.opgave.rigtigTekst, "besked gul");
            }
            if (this.quiz) this.koe.push(this.def);
            this.trin = "ny";
        }
        this.vis();
    };

    P.valgNaeste = function () {
        var liste = this.liste, def;
        if (this.quiz) {
            if (!this.opgave) { this.koe = liste.slice(); this.rigtige = 0; }
            return this.koe.shift();
        }
        if (this.naesteNr < liste.length) {
            def = liste[this.naesteNr++];
        } else {
            var mig = this;
            var andre = liste.filter(function (d) { return d !== mig.sidste; });
            def = NK.tilfaeldig(andre.length ? andre : liste);
        }
        this.sidste = def;
        return def;
    };

    P.ny = function () {
        var def = this.valgNaeste();
        this.def = def;
        this.opgave = def.lav();
        this.opgave.id = def.id;
        this.opgave.vist = false;
        this.opgave.loest = false;
        this.saet("hint", "", "besked hint");
        this.saet("besked", "", "besked");
        this.bygValg();
        this.sim.opsaetOpgave(this.opgave);
        this.trin = "hint";
        this.vis();
    };

    P.bygValg = function () {
        var boks = NK.el(this.p + "-valg");
        boks.innerHTML = "";
        this.knapper = [];
        var o = this.opgave, mig = this;
        if (!o.valg) return;
        /* Svarmulighederne i tilfaeldig raekkefoelge */
        o.valg = NK.bland(o.valg);
        o.valg.forEach(function (v, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "valgknap";
            b.textContent = v.tekst;
            b.addEventListener("click", function () { mig.svar(i); });
            boks.appendChild(b);
            mig.knapper.push(b);
        });
    };

    P.svar = function (i) {
        var o = this.opgave;
        if (!o || o.loest || o.vist) return;
        var v = o.valg[i];
        if (v.rigtig) {
            this.knapper[i].classList.add("rigtig");
            this.knapper.forEach(function (b) { b.disabled = true; });
            this.klaret("Rigtigt. " + v.forklaring);
        } else if (this.quiz) {
            /* Ét svar pr. spoergsmaal: det rigtige vises, og spoergsmaalet kommer igen */
            var mig = this;
            o.vist = true;
            o.valg.forEach(function (x, j) {
                if (x.rigtig) mig.knapper[j].classList.add("rigtig");
                mig.knapper[j].disabled = true;
            });
            this.knapper[i].classList.add("forkert");
            this.koe.push(this.def);
            this.saet("besked", v.forklaring, "besked skidt");
            this.trin = "ny";
            this.vis();
        } else {
            this.knapper[i].classList.add("forkert");
            this.knapper[i].disabled = true;
            this.saet("besked", v.forklaring, "besked skidt");
        }
    };

    /* Opgaven er loest: af et rigtigt svar eller af fanen selv */
    P.klaret = function (tekst) {
        var o = this.opgave;
        if (!o || o.loest) return;
        o.loest = true;
        if (!o.vist) { this.antalLoest++; this.rigtige++; }
        this.saet("besked", tekst || ("Rigtigt. " + (o.rigtigTekst || "")), "besked god");
        this.trin = this.quiz && !this.koe.length ? "slut" : "ny";
        this.vis();
        if (this.trin === "slut") this.fejr();
        if (this.sim.afvisTilbud) this.sim.afvisTilbud();
    };

    /* Quizzen er klaret: konfetti ud fra kortets hoved */
    P.fejr = function () {
        var kort = NK.el(this.p + "-opgavekort");
        if (!kort) return;
        var r = kort.getBoundingClientRect();
        var boks = document.createElement("div");
        boks.className = "konfetti";
        boks.setAttribute("aria-hidden", "true");
        boks.style.left = (r.left + r.width / 2) + "px";
        boks.style.top = (r.top + 18) + "px";
        for (var i = 0; i < 46; i++) {
            var b = document.createElement("i"), v = NK.r(-Math.PI * 0.95, -Math.PI * 0.05), fart = NK.r(70, 210);
            b.style.backgroundColor = KONFETTI[i % KONFETTI.length];
            b.style.setProperty("--dx", (Math.cos(v) * fart * 1.15).toFixed(0) + "px");
            b.style.setProperty("--op", (Math.sin(v) * fart).toFixed(0) + "px");
            b.style.setProperty("--ned", NK.r(160, 340).toFixed(0) + "px");
            b.style.setProperty("--rot", NK.r(-720, 720).toFixed(0) + "deg");
            b.style.animationDelay = NK.r(0, 0.18).toFixed(2) + "s";
            if (i % 3 === 0) b.style.borderRadius = "50%";
            boks.appendChild(b);
        }
        document.body.appendChild(boks);
        window.setTimeout(function () { if (boks.parentNode) boks.parentNode.removeChild(boks); }, 2600);
    };

    /* Den lille knap i kortets hoved: Afslut, eller quizzen forfra, naar den er klaret */
    P.lilleKnap = function () {
        var igen = this.trin === "slut";
        this.afslut();
        if (igen) this.ny();
    };

    P.afslut = function () {
        this.opgave = null;
        this.def = null;
        this.koe = [];
        this.rigtige = 0;
        this.trin = "start";
        NK.el(this.p + "-valg").innerHTML = "";
        this.knapper = [];
        this.saet("hint", "", "besked hint");
        this.saet("besked", "", "besked");
        this.sim.slutOpgave();
        this.vis();
    };

    P.aktiv = function () {
        return !!this.opgave;
    };

    P.saet = function (del, tekst, klasse) {
        var id = this.p + "-" + del;
        NK.saetTekst(id, tekst);
        NK.saetKlasse(id, klasse);
    };

    P.vis = function () {
        NK.saetKnaptrin(this.p + "-opgaveknap", this.trin, this.quiz);
        NK.saetTekst(this.p + "-loest", String(this.antalLoest));
        NK.saetTekst(this.p + "-opgavetekst", this.opgave ? this.opgave.tekst : this.starttekst());
        NK.el(this.p + "-afslut").hidden = !this.opgave;
        if (this.quiz) this.visQuiz();
    };

    /* Quiz: prikkerne, linjen med fejringen og den lille knap */
    P.visQuiz = function () {
        var n = this.liste.length, h = "", slut = this.trin === "slut";
        for (var i = 0; i < n; i++) h += i < this.rigtige ? '<i class="rigtig"></i>' : "<i></i>";
        NK.saetHTML(this.p + "-prikker", h);
        var prikker = NK.el(this.p + "-prikker");
        if (prikker) {
            prikker.setAttribute("aria-label", this.rigtige + " af " + n + " rigtige");
            prikker.classList.toggle("alle", slut);
        }
        NK.saetTekst(this.p + "-fejring", slut ? "Alle " + n + " rigtige. Godt klaret!" : "");
        NK.saetTekst(this.p + "-afslut", slut ? "Tag quizzen igen" : "Afslut");
        var kort = NK.el(this.p + "-opgavekort");
        if (kort) kort.classList.toggle("klaret", slut);
        if (this.opgave) this.rulTil();
    };

    /* Quiz: panelet ruller, saa hele kortet med svaret og knappen kan ses */
    P.rulTil = function () {
        var kort = NK.el(this.p + "-opgavekort"), panel = kort && kort.parentNode;
        if (!panel || panel.scrollHeight <= panel.clientHeight + 1) return;
        var k = kort.getBoundingClientRect(), r = panel.getBoundingClientRect();
        if (k.bottom > r.bottom - 10) panel.scrollTop += Math.min(k.bottom - r.bottom + 12, k.top - r.top - 10);
        else if (k.top < r.top + 10) panel.scrollTop -= r.top + 10 - k.top;
    };

    P.starttekst = function () {
        return NK.el(this.p + "-opgavetekst").getAttribute("data-start") || "";
    };

    NK.Opgavekort = Opgavekort;
}());
