/* =====================================================================
   opgave.js - opgavekortet, som begge faner bruger

   Der er kun ÉN knap i kortet, og den viser det naeste skridt:

     start  -> Start opgave    traekker en opgave og stiller scenen op
     hint   -> Giv hint        viser et kort hint til netop denne opgave
     svar   -> Vis svaret      viser svaret i billedet og forklarer det
     ny     -> Ny opgave       rydder scenen og traekker en ny
     slut   -> Se resultatet   runden er gennemfoert
     forfra -> Start forfra    en ny runde med alle opgaverne igen

   Loeser eleven selv opgaven undervejs, springer knappen direkte til
   "Ny opgave", og svarteksten bliver groen.

   En runde er hver opgavetype én gang i tilfaeldig raekkefoelge. Naar
   runden er slut, vises resultatet, og laereren kommer med en kort ros.

   En opgave er et objekt, som fanen selv bygger:
     tekst            spoergsmaalet
     valg, rigtig     svarmuligheder og nummeret paa det rigtige (valgfrit)
     hint, svar       de to tekster i trappen
     start(sim)       stiller scenen op
     tjek(sim)        kaldes hvert billede: true = loest,
                      en tekst = en besked til eleven undervejs
     klik(sim, x, y)  et klik i billedet: true = loest, en tekst = besked
     visSvar(sim)     viser svaret i selve billedet
     slut(sim)        rydder op, naar opgaven er afsluttet
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var KNAPTRIN = {
        start:  { tekst: "Start opgave",  klasse: "knap blaa" },
        hint:   { tekst: "Giv hint",      klasse: "knap" },
        svar:   { tekst: "Vis svaret",    klasse: "knap" },
        ny:     { tekst: "Ny opgave",     klasse: "knap blaa banker" },
        slut:   { tekst: "Se resultatet", klasse: "knap groen banker" },
        forfra: { tekst: "Start forfra",  klasse: "knap" }
    };

    var TALORD = ["nul", "én", "to", "tre", "fire", "fem", "seks"];

    NK.Opgaver = function (prefix, typer, sim, fanenavn) {
        this.p = prefix;
        this.typer = typer;
        this.sim = sim;
        this.fanenavn = fanenavn || "";
        this.opgave = null;
        this.koe = [];
        this.gennemfoert = 0;
        this.loeste = 0;
        this.faerdig = false;
        NK.Opgaver.alle.push(this);

        var mig = this;
        NK.el(this.id("knap")).addEventListener("click", function () { mig.knap(); });
        NK.el(this.id("valg")).addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (b && b.hasAttribute("data-nr")) mig.vaelg(parseInt(b.getAttribute("data-nr"), 10));
        });
        this.visStatus();
        this.saetTrin("start");
    };

    NK.Opgaver.alle = [];

    var P = NK.Opgaver.prototype;

    P.id = function (navn) { return this.p + "-opg-" + navn; };

    P.saetTrin = function (trin) {
        this.trin = trin;
        NK.saetTekst(this.id("knap"), KNAPTRIN[trin].tekst);
        NK.saetKlasse(this.id("knap"), KNAPTRIN[trin].klasse);
    };

    P.besked = function (hvor, tekst, klasse) {
        NK.saetTekst(this.id(hvor), tekst);
        NK.saetKlasse(this.id(hvor), klasse || "besked");
    };

    P.visStatus = function () {
        NK.saetTekst(this.id("nr"), String(this.gennemfoert));
        NK.saetTekst(this.id("antal"), String(this.typer.length));
    };

    /* Er der en opgave i gang, som endnu ikke er loest eller afsloeret? */
    P.igang = function () {
        return !!(this.opgave && !this.opgave.afsluttet);
    };

    P.knap = function () {
        if (this.trin === "hint") this.visHint();
        else if (this.trin === "svar") this.visSvar();
        else if (this.trin === "slut") this.visResultat();
        else if (this.trin === "forfra") { this.nyRunde(); this.ny(); }
        else this.ny();
    };

    P.nyRunde = function () {
        this.koe = [];
        this.gennemfoert = 0;
        this.loeste = 0;
        this.faerdig = false;
        var kort = NK.el(this.id("kort"));
        if (kort) kort.classList.remove("sejr");
        this.visStatus();
    };

    P.ny = function () {
        this.kaldSlut(this.opgave);
        if (!this.koe.length) {
            this.koe = NK.bland(this.typer.map(function (_, i) { return i; }));
            if (this.gennemfoert >= this.typer.length) this.nyRunde();
        }
        var nr = this.koe.shift();

        var o = this.typer[nr](this.sim);
        o.afsluttet = false;
        this.opgave = o;
        if (o.start) o.start(this.sim);

        NK.saetTekst(this.id("tekst"), o.tekst);
        this.tegnValg();
        this.besked("hint", "");
        this.besked("svar", "");
        this.saetTrin(o.hint ? "hint" : "svar");
    };

    P.kaldSlut = function (o) {
        if (!o || o.sluttet) return;
        o.sluttet = true;
        if (o.slut) o.slut(this.sim);
    };

    P.tegnValg = function () {
        var o = this.opgave;
        var vaert = NK.el(this.id("valg"));
        vaert.innerHTML = "";
        if (!o || !o.valg) { vaert.hidden = true; return; }
        vaert.hidden = false;
        /* Korte svar (tal) staar to og to; lange svar (ligninger) én pr. linje. */
        var kort = o.valg.every(function (t) { return t.length <= 12; });
        vaert.className = "valg" + (kort ? "" : " en-spalte");
        o.valg.forEach(function (tekst, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "valgknap";
            b.textContent = tekst;
            b.setAttribute("data-nr", String(i));
            vaert.appendChild(b);
        });
    };

    P.markerValg = function (i, klasse) {
        var b = NK.el(this.id("valg")).querySelector('[data-nr="' + i + '"]');
        if (b) { b.classList.add(klasse); b.disabled = true; }
    };

    P.laasValg = function () {
        var alle = NK.el(this.id("valg")).querySelectorAll("button");
        for (var i = 0; i < alle.length; i++) alle[i].disabled = true;
    };

    P.vaelg = function (i) {
        var o = this.opgave;
        if (!o || o.afsluttet || !o.valg) return;
        if (i === o.rigtig) { this.loest(); return; }
        this.markerValg(i, "forkert");
        this.besked("svar", "Ikke rigtigt. Prøv igen.", "besked skidt");
    };

    P.visHint = function () {
        var o = this.opgave;
        if (!o) return;
        this.besked("hint", o.hint, "besked gul");
        this.saetTrin("svar");
    };

    P.afslut = function (o) {
        o.afsluttet = true;
        if (o.valg) { this.markerValg(o.rigtig, "rigtig"); this.laasValg(); }
        this.kaldSlut(o);
        this.gennemfoert++;
        this.visStatus();
        this.saetTrin(this.koe.length ? "ny" : "slut");
    };

    P.visSvar = function () {
        var o = this.opgave;
        if (!o || o.afsluttet) return;
        if (o.visSvar) o.visSvar(this.sim);
        this.besked("svar", o.svar, "besked");
        this.afslut(o);
    };

    P.loest = function () {
        var o = this.opgave;
        if (!o || o.afsluttet) return;
        this.loeste++;
        /* Ved et valgspoergsmaal vises svaret ogsaa i billedet bagefter,
           saa eleven kan se, at det passer. */
        if (o.valg && o.visSvar) o.visSvar(this.sim);
        this.besked("svar", "Rigtigt. " + o.svar, "besked god");
        this.afslut(o);
    };

    /* Runden er slut: resultatet i kortet og en kort ros fra laereren. */
    P.visResultat = function () {
        var n = this.typer.length;
        this.faerdig = true;
        this.opgave = null;
        NK.saetTekst(this.id("tekst"), "Alle " + (TALORD[n] || n) + " opgaver på fanen er gennemført.");
        this.tegnValg();
        this.besked("hint", "Du løste " + this.loeste + " af " + n + " uden at se svaret.",
                    this.loeste === n ? "besked god" : "besked");
        var mangler = NK.Opgaver.alle.filter(function (a) { return a !== this && !a.faerdig; }, this);
        this.besked("svar", mangler.length ? "Fanen " + mangler[0].fanenavn + " har også opgaver." : "");
        var kort = NK.el(this.id("kort"));
        if (kort) kort.classList.add("sejr");
        this.saetTrin("forfra");
        if (this.sim.laererRos) this.sim.laererRos();
    };

    /* Kaldes af fanen hvert billede. */
    P.opdater = function () {
        var o = this.opgave;
        if (!o || o.afsluttet || !o.tjek) return;
        var r = o.tjek(this.sim);
        if (r === true) { this.loest(); return; }
        if (typeof r === "string") {
            this.besked("svar", r, "besked skidt");
            o.harBesked = true;
        } else if (o.harBesked) {
            /* Beskeden gjaldt et tidligere forsoeg - fjern den igen. */
            this.besked("svar", "");
            o.harBesked = false;
        }
    };

    /* Et klik i billedet. Returnerer true, hvis opgaven tog imod det. */
    P.klik = function (x, y) {
        var o = this.opgave;
        if (!o || o.afsluttet || !o.klik) return false;
        var r = o.klik(this.sim, x, y);
        if (r === true) this.loest();
        else if (typeof r === "string") this.besked("svar", r, "besked skidt");
        return true;
    };
}());
