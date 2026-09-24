/* =====================================================================
   opgave.js - opgavekortet paa fane 1 og 2

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

    NK.saetKnaptrin = function (id, trin) {
        NK.saetTekst(id, KNAPTRIN[trin].tekst);
        NK.saetKlasse(id, KNAPTRIN[trin].klasse);
    };

    /* p: forstavelsen paa elementernes id, fx "kurve" */
    function Opgavekort(p, liste, sim) {
        this.p = p;
        this.liste = liste;
        this.sim = sim;
        this.trin = "start";
        this.opgave = null;
        this.antalLoest = 0;
        this.naesteNr = 0;          /* foerste gang i listens raekkefoelge */
        this.sidste = null;
        this.knapper = [];
        var mig = this;
        NK.el(p + "-opgaveknap").addEventListener("click", function () { mig.tryk(); });
        NK.el(p + "-afslut").addEventListener("click", function () { mig.afslut(); });
        this.vis();
    }

    var P = Opgavekort.prototype;

    P.tryk = function () {
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
            this.trin = "ny";
        }
        this.vis();
    };

    P.valgNaeste = function () {
        var liste = this.liste, def;
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
        if (!o.vist) this.antalLoest++;
        this.saet("besked", tekst || ("Rigtigt. " + (o.rigtigTekst || "")), "besked god");
        this.trin = "ny";
        this.vis();
    };

    P.afslut = function () {
        this.opgave = null;
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
        NK.saetKnaptrin(this.p + "-opgaveknap", this.trin);
        NK.saetTekst(this.p + "-loest", String(this.antalLoest));
        NK.saetTekst(this.p + "-opgavetekst", this.opgave ? this.opgave.tekst : this.starttekst());
        NK.el(this.p + "-afslut").hidden = !this.opgave;
    };

    P.starttekst = function () {
        return NK.el(this.p + "-opgavetekst").getAttribute("data-start") || "";
    };

    NK.Opgavekort = Opgavekort;
}());
