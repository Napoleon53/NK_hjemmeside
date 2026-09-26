/* =====================================================================
   opgave.js - opgavekortet, som alle tre faner bruger

   Der er kun ÉN knap i kortet, og den viser det naeste skridt:

     start -> Start opgave    traekker en opgave og stiller scenen op
     hint  -> Giv hint        viser et kort hint til netop denne opgave
     svar  -> Vis svaret      viser svaret i billedet og forklarer det
     ny    -> Ny opgave       rydder scenen og traekker en ny

   Loeser eleven selv opgaven undervejs, springer knappen direkte til
   "Ny opgave", og svarteksten bliver groen.

   En opgave er et objekt, som fanen selv bygger:
     tekst            spoergsmaalet
     valg, rigtig     svarmuligheder og nummeret paa det rigtige (valgfrit)
     hint, svar       de to tekster i trappen
     start(sim)       stiller scenen op
     tjek(sim)        kaldes hvert billede: true = loest,
                      en tekst = en besked til eleven undervejs
     klik(sim, atom)  et klik paa et atom: true = loest, en tekst = besked
     visSvar(sim)     viser svaret i selve billedet
     slut(sim)        rydder op, naar opgaven er afsluttet
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var KNAPTRIN = {
        start: { tekst: "Start opgave", klasse: "knap blaa" },
        hint:  { tekst: "Giv hint",     klasse: "knap" },
        svar:  { tekst: "Vis svaret",   klasse: "knap" },
        ny:    { tekst: "Ny opgave",    klasse: "knap blaa banker" }
    };

    NK.Opgaver = function (prefix, typer, sim) {
        this.p = prefix;
        this.typer = typer;
        this.sim = sim;
        this.opgave = null;
        this.sidsteType = -1;
        this.loeste = 0;

        var mig = this;
        NK.el(this.id("knap")).addEventListener("click", function () { mig.knap(); });
        NK.el(this.id("valg")).addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (b && b.hasAttribute("data-nr")) mig.vaelg(parseInt(b.getAttribute("data-nr"), 10));
        });
        this.saetTrin("start");
    };

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

    /* Er der en opgave i gang, som endnu ikke er loest eller afsloeret? */
    P.igang = function () {
        return !!(this.opgave && !this.opgave.afsluttet);
    };

    P.knap = function () {
        if (this.trin === "hint") this.visHint();
        else if (this.trin === "svar") this.visSvar();
        else this.ny();
    };

    P.ny = function () {
        this.kaldSlut(this.opgave);
        var n = this.typer.length, nr;
        do { nr = Math.floor(Math.random() * n); } while (n > 1 && nr === this.sidsteType);
        this.sidsteType = nr;
        this.startOpgave(this.typer[nr](this.sim));
    };

    /* Starter en bestemt opgave. Bruges af ny() og af _selvtest.html. */
    P.startOpgave = function (o) {
        this.kaldSlut(this.opgave);
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

    /* Afbryder en opgave uden at loese den, fx naar fanen startes forfra. */
    P.nulstil = function () {
        this.kaldSlut(this.opgave);
        this.opgave = null;
        NK.saetTekst(this.id("tekst"), "");
        var vaert = NK.el(this.id("valg"));
        vaert.innerHTML = "";
        vaert.hidden = true;
        this.besked("hint", "");
        this.besked("svar", "");
        this.saetTrin("start");
    };

    P.tegnValg = function () {
        var o = this.opgave;
        var vaert = NK.el(this.id("valg"));
        vaert.innerHTML = "";
        if (!o || !o.valg) { vaert.hidden = true; return; }
        vaert.hidden = false;
        /* Korte svar staar to og to; lange svar én pr. linje. */
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
        this.saetTrin("ny");
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
        NK.saetTekst(this.id("loest"), String(this.loeste));
        /* Er eleven kommet i gang, er tilbuddet om Kemichaels
           praesentation det samme som Nej tak (js/praesentation.js). */
        if (NK.laerer && NK.laerer.afvisTilbud) NK.laerer.afvisTilbud();
        /* Ved et valgspoergsmaal vises svaret ogsaa i billedet bagefter,
           saa eleven kan se, at det passer. */
        if (o.valg && o.visSvar) o.visSvar(this.sim);
        this.besked("svar", "Rigtigt. " + o.svar, "besked god");
        this.afslut(o);
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
            /* Beskeden gjaldt et tidligere forsoeg. Fjern den igen. */
            this.besked("svar", "");
            o.harBesked = false;
        }
    };

    /* Et klik paa et atom. Returnerer true, hvis opgaven tog imod det. */
    P.klik = function (atom) {
        var o = this.opgave;
        if (!o || o.afsluttet || !o.klik) return false;
        var r = o.klik(this.sim, atom);
        if (r === true) this.loest();
        else if (typeof r === "string") this.besked("svar", r, "besked skidt");
        return true;
    };
}());
