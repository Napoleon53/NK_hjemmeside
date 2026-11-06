/* =====================================================================
   opgave.js - det, de to fanes opgaver har til faelles: den ene
   opgaveknap, svarknapperne, trinlisten og valget af naeste opgave.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Opgaveknappen paa papirkortet (6. nov. 2026) viser det naeste skridt:

         start -> Start opgave    traekker en opgave (groen, foerer videre)
         hint  -> Giv hint        et hint, der passer til opgaven (stille, gul kant)
         svar  -> Vis svaret      loeser den og forklarer hvorfor
         ny    -> Naeste opgave   traekker en ny (groen, dér hvor Indsend svar stod)

       Ved siden af staar Indsend svar, der bedoemmer. Den er graa, til der
       er noget at sende, og vaek, naar opgaven er loest. Man faar aldrig
       mere hjaelp, end man selv har bedt om. */
    var KNAPTRIN = {
        start: { tekst: "Start opgave →",  klasse: "sk-videre" },
        hint:  { tekst: "Giv hint",        klasse: "knap hjaelp" },
        svar:  { tekst: "Vis svaret",      klasse: "knap hjaelp svar" },
        ny:    { tekst: "Næste opgave →",  klasse: "sk-videre" }
    };

    NK.saetKnaptrin = function (id, trin) {
        NK.saetTekst(id, KNAPTRIN[trin].tekst);
        NK.saetKlasse(id, KNAPTRIN[trin].klasse);
    };

    /* Indsend svar: graa (ikke-klar), til der er noget at sende */
    NK.visIndsend = function (id, vis, klar) {
        var e = NK.el(id);
        e.hidden = !vis;
        e.classList.toggle("klar", !!klar);
        e.classList.toggle("ikke-klar", !klar);
        e.setAttribute("aria-disabled", klar ? "false" : "true");
    };

    /* Kortet blinker bloedt, naar eleven griber ud efter noget, kortet ikke
       beder om lige nu */
    NK.kortBlink = function (id) {
        var e = NK.el(id);
        if (!e) return;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* Den plads, der er sat af til kortet oeverst i scenen: basis[0] paa en
       almindelig skaerm, basis[1] paa en lav. Bliver kortet hoejere, faar
       det den plads, det fylder. Selvtesten maaler det. */
    NK.kortZone = function (id, basis) {
        var b = window.innerHeight <= 720 ? basis[1] : basis[0];
        var e = NK.el(id);
        return Math.max(b, e && e.offsetHeight ? e.offsetHeight : 0);
    };

    /* Fire svarknapper paa papirkortet. Et klik vaelger kun (blaat); sendInd()
       bedoemmer det valgte svar og kalder vedSvar(valgmulighed, rigtig). En
       forkert knap bliver roed og kan ikke vaelges igen - en rigtig bliver
       groen og laaser resten, saa man kan se, hvad der var svaret. */
    NK.Svarknapper = function (container, vedSvar) {
        this.el = container;
        this.vedSvar = vedSvar;
        this.valg = [];
        this.knapper = [];
        this.valgt = -1;
        this.faerdig = false;
        this.vedValg = null;     /* kaldes, naar et svar vaelges (Indsend svar bliver klar) */
    };

    NK.Svarknapper.prototype.vis = function (valg) {
        var mig = this;
        this.valg = valg;
        this.faerdig = false;
        this.valgt = -1;
        this.el.innerHTML = "";
        this.knapper = valg.map(function (v, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "valgknap sk-knap";
            b.textContent = v.tekst;
            b.addEventListener("click", function () { mig.klik(i); });
            mig.el.appendChild(b);
            return b;
        });
        if (this.vedValg) this.vedValg();
    };

    NK.Svarknapper.prototype.klik = function (i) {
        if (this.faerdig || this.knapper[i].disabled) return;
        this.valgt = i;
        this.knapper.forEach(function (b, j) { b.classList.toggle("valgt", j === i); });
        if (this.vedValg) this.vedValg();
    };

    NK.Svarknapper.prototype.aaben = function () { return this.valg.length > 0 && !this.faerdig; };
    NK.Svarknapper.prototype.harValgt = function () { return this.aaben() && this.valgt >= 0; };

    /* Indsend svar: det valgte svar bedoemmes */
    NK.Svarknapper.prototype.sendInd = function () {
        if (!this.harValgt()) return false;
        var i = this.valgt, v = this.valg[i];
        this.valgt = -1;
        this.knapper[i].classList.remove("valgt");
        if (v.rigtig) {
            this.knapper[i].classList.add("rigtig");
            this.laas();
        } else {
            this.knapper[i].classList.add("forkert");
            this.knapper[i].disabled = true;
        }
        this.vedSvar(v, v.rigtig);
        if (this.vedValg) this.vedValg();
        return true;
    };

    NK.Svarknapper.prototype.rigtig = function () {
        for (var i = 0; i < this.valg.length; i++) if (this.valg[i].rigtig) return this.valg[i];
        return null;
    };

    NK.Svarknapper.prototype.visRigtig = function () {
        for (var i = 0; i < this.valg.length; i++) {
            this.knapper[i].classList.remove("valgt");
            if (this.valg[i].rigtig) this.knapper[i].classList.add("svar-vist");
        }
        this.laas();
    };

    NK.Svarknapper.prototype.laas = function () {
        this.faerdig = true;
        this.knapper.forEach(function (b) {
            b.disabled = true;
            if (!b.classList.contains("rigtig") && !b.classList.contains("forkert") && !b.classList.contains("svar-vist")) b.classList.add("dim");
        });
    };

    NK.Svarknapper.prototype.ryd = function () {
        this.el.innerHTML = "";
        this.valg = [];
        this.knapper = [];
        this.valgt = -1;
        this.faerdig = false;
        if (this.vedValg) this.vedValg();
    };

    /* Trinlisten: hvert punkt er "", "aktiv", "ok" eller "fejl". */
    NK.saetTrin = function (id, tilstand) {
        NK.saetKlasse(id, "trin-punkt" + (tilstand ? " " + tilstand : ""));
    };

    /* Naeste opgave: aldrig én af de seneste, og kun fra de trin,
       eleven er naaet til. */
    NK.Opgavevaelger = function (liste, huske) {
        this.liste = liste;
        this.huske = huske || 5;
        this.seneste = [];
    };

    NK.Opgavevaelger.prototype.naeste = function (maksTrin) {
        var seneste = this.seneste;
        var pulje = this.liste.filter(function (o) { return (o.trin || 1) <= (maksTrin || 99); });
        var friske = pulje.filter(function (o) { return seneste.indexOf(o) < 0; });
        var o = NK.tilfaeldig(friske.length ? friske : pulje);
        seneste.push(o);
        while (seneste.length > Math.min(this.huske, pulje.length - 1)) seneste.shift();
        return o;
    };

    NK.stort = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
}());
