/* =====================================================================
   tekstboks.js - spoergsmaalet paa kortet i scenen

   Brugerens oenske 23. okt. 2026: teksten maa ikke staa oppe i hoejre
   hjoerne, men inde i scenen, saa den faar blikfang. Boksen staar derfor
   paa kortet med formlen (forneden eller til hoejre for formlen, se
   bordLayout i js/bord.js) og har faste pladser, der ikke flytter sig:

     tekst    opgaven eller spoergsmaalet (fed)
     svar     svarknapperne (Polaert / Upolaert ...), venstre
     knap     den ene knap: Giv hint -> Vis svaret -> Naeste, hoejre
     linje    det, der staar til opgaven: forsoeget, hint, fejl, ros

   Der er ingen linje nederst i scenen; alt staar her.

   Brug: var tb = new NK.Tekstboks("forsoeg");
         tb.vedKnap = function () { ... };
         tb.tekst(html); tb.svar(liste, vedSvar); tb.svarTilstand({ id: "rigtig" }, laast);
         tb.knap("Giv hint", "hjaelp"); tb.knap(null);   (null: pladsen staar tom)
         tb.linje(html, "god" | "skidt" | "hint" | ""); tb.ryst();
   Elementerne hedder <prefix>-tb, -tb-tekst, -tb-svar, -tb-knap, -tb-linje.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function Tekstboks(prefix) {
        this.boks = NK.el(prefix + "-tb");
        this.eTekst = NK.el(prefix + "-tb-tekst");
        this.eSvar = NK.el(prefix + "-tb-svar");
        this.eKnap = NK.el(prefix + "-tb-knap");
        this.eLinje = NK.el(prefix + "-tb-linje");
        this.svarNoegle = null;
        this.knapper = {};
        this.vaerdi = {};
        var mig = this;
        this.eKnap.addEventListener("click", function () {
            mig.eKnap.blur();
            if (mig.vedKnap) mig.vedKnap();
        });
    }

    var P = Tekstboks.prototype;

    /* r: { x, y, b, h } i laerredets pixels; side: boksen staar til hoejre for formlen */
    P.placer = function (r, side) {
        var s = this.boks.style;
        s.left = Math.round(r.x) + "px";
        s.top = Math.round(r.y) + "px";
        s.width = Math.round(r.b) + "px";
        s.height = Math.round(r.h) + "px";
        this.boks.classList.toggle("side", !!side);
        this.boks.classList.toggle("smal", r.b < 380);
    };

    P.saet = function (navn, vaerdi, fn) {
        if (this.vaerdi[navn] === vaerdi) return false;
        this.vaerdi[navn] = vaerdi;
        fn.call(this);
        return true;
    };

    P.tekst = function (html) {
        this.saet("tekst", html, function () { this.eTekst.innerHTML = html; });
    };

    P.linje = function (html, klasse) {
        this.saet("linje", html, function () { this.eLinje.innerHTML = html; });
        this.saet("linjeKlasse", klasse || "", function () { this.eLinje.className = "tb-linje" + (klasse ? " " + klasse : ""); });
    };

    /* Svarknapperne bygges kun om, naar listen er en anden */
    P.svar = function (liste, vedSvar) {
        liste = liste || [];
        this.vedSvar = vedSvar;
        var noegle = liste.map(function (x) { return x.id + ":" + x.tekst; }).join("|");
        if (noegle === this.svarNoegle) return;
        this.svarNoegle = noegle;
        this.eSvar.innerHTML = "";
        this.knapper = {};
        this.vaerdi.svarTilstand = null;
        var mig = this;
        liste.forEach(function (x) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "tb-svarknap";
            b.textContent = x.tekst;
            b.setAttribute("data-svar", x.id);
            b.addEventListener("click", function () {
                b.blur();
                if (mig.vedSvar) mig.vedSvar(x.id);
            });
            mig.eSvar.appendChild(b);
            mig.knapper[x.id] = b;
        });
    };

    /* tilstande: { id: "rigtig" | "forkert" | "valgt" }; laast: knapperne kan ikke trykkes */
    P.svarTilstand = function (tilstande, laast) {
        var mig = this;
        tilstande = tilstande || {};
        this.saet("svarTilstand", JSON.stringify(tilstande) + (laast ? "L" : ""), function () {
            Object.keys(mig.knapper).forEach(function (id) {
                var b = mig.knapper[id];
                b.className = "tb-svarknap" + (tilstande[id] ? " " + tilstande[id] : "");
                b.disabled = !!laast;
            });
        });
    };

    /* tekst null: knappen er vaek, men pladsen staar */
    P.knap = function (tekst, klasse) {
        var mig = this;
        this.saet("knap", tekst === null ? null : tekst + "|" + (klasse || ""), function () {
            if (tekst === null) {
                mig.eKnap.className = "tb-knap skjult";
                mig.eKnap.disabled = true;
                return;
            }
            mig.eKnap.textContent = tekst;
            mig.eKnap.className = "tb-knap" + (klasse ? " " + klasse : "");
            mig.eKnap.disabled = false;
        });
    };

    /* Linjen ryster (forkert svar), og knappen lyser stille op */
    P.ryst = function () {
        var e = this.eLinje;
        e.classList.remove("ryst");
        void e.offsetWidth;
        e.classList.add("ryst");
        this.eKnap.classList.add("peg");
    };

    P.nulstil = function () {
        this.vaerdi = {};
        this.svarNoegle = null;
        this.eKnap.classList.remove("peg");
    };

    NK.Tekstboks = Tekstboks;
}());
