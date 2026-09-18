/* =====================================================================
   opgave.js - det, fane 2-4 har til faelles: svarknapperne, trinlisten
   og valget af naeste opgave.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Fire svarknapper. vedSvar(valgmulighed, rigtig) kaldes ved hvert
       klik. En forkert knap bliver roed og kan ikke vaelges igen - en
       rigtig laaser resten, saa man kan se, hvad der var svaret. */
    NK.Svarknapper = function (container, vedSvar) {
        this.el = container;
        this.vedSvar = vedSvar;
        this.valg = [];
        this.knapper = [];
        this.faerdig = false;
    };

    NK.Svarknapper.prototype.vis = function (valg) {
        var mig = this;
        this.valg = valg;
        this.faerdig = false;
        this.el.innerHTML = "";
        this.knapper = valg.map(function (v, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "valgknap";
            b.textContent = v.tekst;
            b.addEventListener("click", function () { mig.klik(i); });
            mig.el.appendChild(b);
            return b;
        });
    };

    NK.Svarknapper.prototype.klik = function (i) {
        if (this.faerdig) return;
        var v = this.valg[i];
        if (v.rigtig) {
            this.knapper[i].classList.add("rigtig");
            this.laas();
        } else {
            this.knapper[i].classList.add("forkert");
            this.knapper[i].disabled = true;
        }
        this.vedSvar(v, v.rigtig);
    };

    NK.Svarknapper.prototype.rigtig = function () {
        for (var i = 0; i < this.valg.length; i++) if (this.valg[i].rigtig) return this.valg[i];
        return null;
    };

    NK.Svarknapper.prototype.visRigtig = function () {
        for (var i = 0; i < this.valg.length; i++) {
            if (this.valg[i].rigtig) this.knapper[i].classList.add("rigtig");
        }
        this.laas();
    };

    NK.Svarknapper.prototype.laas = function () {
        this.faerdig = true;
        this.knapper.forEach(function (b) { b.disabled = true; });
    };

    NK.Svarknapper.prototype.ryd = function () {
        this.el.innerHTML = "";
        this.valg = [];
        this.knapper = [];
        this.faerdig = false;
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
