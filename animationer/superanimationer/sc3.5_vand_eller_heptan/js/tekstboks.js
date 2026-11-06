/* =====================================================================
   tekstboks.js - papirkortet oeverst i midten af scenen

   Brugerens oensker: 23. okt. 2026 kom spoergsmaalet ind i scenen (paa
   kortet med formlen). 4.-6. nov. 2026 blev det et lyst papirkort
   oeverst i midten af scenen som i alle aktive animationer
   (../faelles/papirkort.css og papirkort.js). Kortet har faste dele:

     chip     den indlejrede overskrift ("Spørgsmål 1 af 3", stoffets navn)
     tekst    opgaven eller spoergsmaalet (papirkort.js goer spoergsmaalet halvfedt)
     raekke   svarknapperne til venstre, Giv et hint og Indsend svar til hoejre
     linje    det, der staar til opgaven: forsoeget, hint, fejl, forklaring

   Indsend svar er hovedknappen: et svar vaelges kun ved et klik, og
   Indsend svar sender det ind (graa, til der er valgt noget). Efter et
   rigtigt svar bliver kortet staaende (bliv): det valgte svar er groent,
   forklaringen staar under svarene, og knappen, der foerer videre, staar,
   hvor Indsend svar stod. Der er ingen linje nederst i scenen.

   Brug: var tb = new NK.Tekstboks("forsoeg");
         tb.vedKnap = function () { ... };      Giv hint / Vis svaret / Naeste
         tb.vedIndsend = function () { ... };   Indsend uden valgt svar (fx grupperne)
         tb.vedValg = function (id) { ... };    et svar er valgt (ikke sendt)
         tb.chip(tekst); tb.tekst(html); tb.svar(liste, vedSvar);
         tb.svarTilstand({ id: "rigtig" | "forkert" | "valgt" | "svar-vist" }, laast);
         tb.indsend(vis, ekstraKlar);           Indsend svar vises / kan sendes
         tb.knap("Giv hint", "hjaelp"); tb.knap("Næste →", "naeste"); tb.knap(null);
         tb.linje(html, "god" | "skidt" | "hint" | ""); tb.ryst(); tb.blink();
   Elementerne hedder <prefix>-tb, -tb-chip, -tb-tekst, -tb-raekke,
   -tb-svar, -tb-knap, -tb-indsend, -tb-bund og -tb-linje.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var KNAPTEKST = { "Giv hint": "Giv et hint" };

    function Tekstboks(prefix) {
        this.boks = NK.el(prefix + "-tb");
        this.eChip = NK.el(prefix + "-tb-chip");
        this.eTekst = NK.el(prefix + "-tb-tekst");
        this.eRaekke = NK.el(prefix + "-tb-raekke");
        this.eSvar = NK.el(prefix + "-tb-svar");
        this.eKnap = NK.el(prefix + "-tb-knap");
        this.eIndsend = NK.el(prefix + "-tb-indsend");
        this.eLinje = NK.el(prefix + "-tb-linje");
        this.eBund = NK.el(prefix + "-tb-bund");
        this.svarNoegle = null;
        this.knapper = {};
        this.vaerdi = {};
        this.valgt = null;
        this.laast = false;
        this.visIndsend = false;
        this.ekstraKlar = false;
        this.knapKlasse = "";
        var mig = this;
        this.eKnap.addEventListener("click", function () {
            mig.eKnap.blur();
            if (mig.vedKnap) mig.vedKnap();
        });
        this.eIndsend.addEventListener("click", function () {
            mig.eIndsend.blur();
            mig.indsendKlik();
        });
    }

    var P = Tekstboks.prototype;

    P.saet = function (navn, vaerdi, fn) {
        if (this.vaerdi[navn] === vaerdi) return false;
        this.vaerdi[navn] = vaerdi;
        fn.call(this);
        return true;
    };

    P.chip = function (tekst) {
        this.saet("chip", tekst || "", function () {
            this.eChip.textContent = tekst || "";
            this.eChip.hidden = !tekst;
        });
    };

    P.tekst = function (html) {
        this.saet("tekst", html, function () { this.eTekst.innerHTML = NK.Papir ? NK.Papir.tekst(html) : html; });
    };

    P.linje = function (html, klasse) {
        this.saet("linje", html, function () { this.eLinje.innerHTML = html; });
        /* Farven staar paa raekken om linjen (papirkort.css): god groen,
           skidt roed, hint gul, ellers en neutral boks */
        this.saet("linjeKlasse", klasse || "", function () {
            this.eLinje.className = "st-tekst tb-linje" + (klasse ? " " + klasse : "");
            this.eBund.className = "sk-bund tb-bund " + ({ god: "god", skidt: "skidt", hint: "gul" }[klasse] || "peger");
        });
        this.eBund.hidden = !html;
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
        this.valgt = null;
        this.vaerdi.svarTilstand = null;
        var mig = this;
        liste.forEach(function (x) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "sk-knap tb-svarknap";
            b.textContent = x.tekst;
            b.setAttribute("data-svar", x.id);
            b.addEventListener("click", function () {
                b.blur();
                mig.vaelg(x.id);
            });
            mig.eSvar.appendChild(b);
            mig.knapper[x.id] = b;
        });
        this.eSvar.hidden = liste.length === 0;
        this.visKnapper();
    };

    /* Et klik paa et svar vaelger det kun; Indsend svar sender det ind */
    P.vaelg = function (id) {
        var b = this.knapper[id];
        if (!b || b.disabled || this.laast) return;
        this.valgt = id;
        this.vaerdi.svarTilstand = null;
        this.tegnSvar();
        if (this.vedValg) this.vedValg(id);
        this.visKnapper();
    };

    P.fravaelg = function () {
        if (this.valgt === null) return;
        this.valgt = null;
        this.vaerdi.svarTilstand = null;
        this.tegnSvar();
        this.visKnapper();
    };

    P.klar = function () { return this.valgt !== null || !!this.ekstraKlar; };

    P.indsendKlik = function () {
        if (!this.visIndsend || this.laast) return;
        if (!this.klar()) { this.blink(); return; }
        if (this.valgt !== null) {
            var id = this.valgt;
            this.valgt = null;
            this.vaerdi.svarTilstand = null;
            if (this.vedSvar) this.vedSvar(id);
        } else if (this.vedIndsend) this.vedIndsend();
        this.visKnapper();
    };

    /* tilstande: { id: "rigtig" | "forkert" | "valgt" | "svar-vist" }; laast: knapperne kan ikke trykkes */
    P.svarTilstand = function (tilstande, laast) {
        tilstande = tilstande || {};
        this.tilstande = tilstande;
        this.laast = !!laast;
        if (laast) this.valgt = null;
        this.saet("svarTilstand", JSON.stringify(tilstande) + (laast ? "L" : ""), function () { this.tegnSvar(); });
    };

    P.tegnSvar = function () {
        var mig = this, t = this.tilstande || {};
        Object.keys(this.knapper).forEach(function (id) {
            var b = mig.knapper[id], k = t[id] || (mig.valgt === id ? "valgt" : "");
            /* Laast efter et rigtigt svar: de andre svar er tonet ned */
            if (!k && mig.laast) k = "dim";
            b.className = "sk-knap tb-svarknap" + (k ? " " + k : "");
            b.disabled = mig.laast || t[id] === "forkert";
        });
    };

    /* Indsend svar: vis (der er noget at sende ind her), ekstraKlar (der er
       valgt noget uden for svarknapperne, fx polaere grupper i formlen) */
    P.indsend = function (vis, ekstraKlar) {
        this.visIndsend = !!vis;
        this.ekstraKlar = !!ekstraKlar;
        this.visKnapper();
    };

    /* tekst null: ingen hintknap. Klassen naeste: kortet bliver paa
       spoergsmaalet, og knappen, der foerer videre, staar, hvor Indsend svar stod. */
    P.knap = function (tekst, klasse) {
        var mig = this;
        this.saet("knap", tekst === null ? null : tekst + "|" + (klasse || ""), function () {
            mig.eKnap.classList.remove("peg");
            mig.knapKlasse = tekst === null ? "" : (klasse || "");
            if (tekst !== null) mig.eKnap.textContent = KNAPTEKST[tekst] || tekst;
            mig.eKnap.hidden = tekst === null;
            mig.eKnap.disabled = tekst === null;
            mig.vaerdi.vis = null;
        });
        this.visKnapper();
    };

    /* Raekkens knapper og kortets udgave (spm eller bliv) */
    P.visKnapper = function () {
        var naeste = this.knapKlasse === "naeste";
        var klar = this.klar();
        var noegle = [naeste, this.visIndsend, klar, this.knapKlasse, this.eKnap.hidden, this.eSvar.hidden].join("|");
        this.saet("vis", noegle, function () {
            var k = this.knapKlasse;
            this.eKnap.className = naeste ? "sk-videre tb-knap" : "knap hjaelp tb-knap" + (k === "svar" ? " svar" : "");
            this.eIndsend.hidden = naeste || !this.visIndsend;
            this.eIndsend.className = "knap indsend tb-indsend " + (klar ? "klar" : "ikke-klar");
            this.eIndsend.setAttribute("aria-disabled", klar ? "false" : "true");
            /* Raekken er vaek, naar der hverken er svar eller knapper */
            this.eRaekke.hidden = this.eSvar.hidden && this.eKnap.hidden && this.eIndsend.hidden;
            this.boks.classList.toggle("loest", naeste);
            this.boks.classList.toggle("bliv", naeste);
        });
        this.boks.classList.toggle("svar", naeste && /\bhint\b/.test(this.eLinje.className));
    };

    /* Forkert svar: linjen ryster, og hintknappen lyser stille op */
    P.ryst = function () {
        var e = this.eLinje;
        e.classList.remove("ryst");
        void e.offsetWidth;
        e.classList.add("ryst");
        if (this.knapKlasse !== "naeste") {
            this.eKnap.classList.remove("peg");
            void this.eKnap.offsetWidth;
            this.eKnap.classList.add("peg");
        }
    };

    /* Kortet blinker blødt: eleven greb ud efter forsoeget, men skal foerst svare */
    P.blink = function () {
        var e = this.boks;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    P.nulstil = function () {
        this.vaerdi = {};
        this.svarNoegle = null;
        this.valgt = null;
        this.eKnap.classList.remove("peg");
    };

    NK.Tekstboks = Tekstboks;
}());
