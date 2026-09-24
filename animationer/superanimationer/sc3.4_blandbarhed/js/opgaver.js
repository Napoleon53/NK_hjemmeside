/* =====================================================================
   opgaver.js - opgavekortet med én knap

   Knappen viser det naeste skridt:
     start  -> Start opgave    stiller bassinet op til opgaven
     hint   -> Giv hint        et kort hint til netop denne opgave
     svar   -> Vis svaret      viser det i bassinet og forklarer
     ny     -> Ny opgave       naeste opgave
     forfra -> Start forfra    alle seks igen

   Opgaverne staar i D.OPGAVER (js/tekster.js) og koeres i raekkefoelge,
   fordi de bygger paa hinanden. En opgave med valg er en forudsigelse:
   eleven vaelger, og saa sker det i bassinet. Et forkert valg giver den
   forklaring, der passer til netop den fejl. En byg-opgave loeses ved at
   goere noget i bassinet; den er loest, naar tilstanden har holdt i
   halvandet sekund.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var KNAP = {
        start:  { tekst: "Start opgave", klasse: "knap stor blaa" },
        hint:   { tekst: "Giv hint", klasse: "knap stor" },
        svar:   { tekst: "Vis svaret", klasse: "knap stor" },
        ny:     { tekst: "Ny opgave", klasse: "knap stor blaa banker" },
        forfra: { tekst: "Start forfra", klasse: "knap stor" }
    };

    /* Tjek til byg-opgaverne: sand, naar bassinet viser det, der skal til */
    var TJEK = {
        olieNederst: function (a, m) {
            var fo = m.fase[D.nr("olie")], fv = m.fase[D.nr("vand")], iv = D.nr("vand");
            if (a.uklart) return false;
            var olie = null, polaer = null;
            a.lag.forEach(function (l) {
                if (l.fase === fo && (!olie || l.n > olie.n)) olie = l;
                if (l.fase === fv && l.stoffer.indexOf(iv) >= 0 && (!polaer || l.n > polaer.n)) polaer = l;
            });
            if (!olie || !polaer || olie.n < 60) return false;
            return olie.fra === 0 && olie.fra + olie.til < polaer.fra + polaer.til;
        }
    };

    function Opgaver(bassin, temp) {
        this.b = bassin;
        this.temp = temp;              /* saetter temperaturen, ogsaa paa skyderen */
        this.nr = -1;
        this.loest = 0;
        this.o = null;
        this.holdt = 0;
        var mig = this;
        NK.el("opg-knap").addEventListener("click", function () { mig.knap(); });
        NK.el("opg-valg").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("button") : null;
            if (k && k.hasAttribute("data-nr")) mig.vaelg(parseInt(k.getAttribute("data-nr"), 10));
        });
        this.saetTrin("start");
        this.visTal();
    }

    var P = Opgaver.prototype;

    P.saetTrin = function (trin) {
        this.trin = trin;
        var k = NK.el("opg-knap");
        k.textContent = KNAP[trin].tekst;
        k.className = KNAP[trin].klasse;
    };

    P.besked = function (id, tekst, klasse) {
        var e = NK.el(id);
        e.textContent = tekst || "";
        e.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visTal = function () { NK.saetTekst("opg-loest", String(this.loest)); };

    P.knap = function () {
        if (this.trin === "hint") this.visHint();
        else if (this.trin === "svar") this.visSvar();
        else if (this.trin === "forfra") { this.nr = -1; this.loest = 0; this.visTal(); this.ny(); }
        else this.ny();
    };

    P.ny = function () {
        this.nr++;
        if (this.nr >= D.OPGAVER.length) {
            this.o = null;
            NK.saetTekst("opg-tekst", "Alle seks er gennemført. Tag quizzen, eller start forfra.");
            NK.el("opg-valg").innerHTML = "";
            this.besked("opg-hint", "");
            this.besked("opg-svar", "");
            this.saetTrin("forfra");
            if (this.vedSlut) this.vedSlut(this.loest);
            return;
        }
        var o = D.OPGAVER[this.nr];
        this.o = { d: o, afsluttet: false, hjulpet: false };
        this.holdt = 0;
        this.temp(20);
        this.b.nulstil(o.start.fyld, o.start.blandet);
        NK.saetTekst("opg-tekst", (this.nr + 1) + ". " + o.tekst);
        var vaert = NK.el("opg-valg");
        vaert.innerHTML = "";
        (o.valg || []).forEach(function (v, i) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "valgknap";
            k.textContent = v.tekst;
            k.setAttribute("data-nr", String(i));
            vaert.appendChild(k);
        });
        this.besked("opg-hint", "");
        this.besked("opg-svar", "");
        this.saetTrin("hint");
    };

    /* Handlingen i bassinet, naar eleven har valgt (eller svaret vises) */
    P.udfoer = function (h) {
        if (!h) return;
        var b = this.b;
        if (h.haeld) [].concat(h.haeld).forEach(function (s) { b.haeld(s); });
        if (h.T !== undefined) this.temp(h.T);
        if (h.ryst) {
            if (h.haeld) this.rystSenere = 0.9 * [].concat(h.haeld).length + 0.5;
            else b.ryst(h.ryst);
        }
    };

    P.laasValg = function (valgt) {
        var o = this.o.d, knapper = NK.el("opg-valg").querySelectorAll("button");
        for (var i = 0; i < knapper.length; i++) {
            knapper[i].disabled = true;
            if (o.valg[i].rigtig) knapper[i].classList.add("rigtig");
            else if (i === valgt) knapper[i].classList.add("forkert");
            else knapper[i].classList.add("mat");
        }
    };

    P.vaelg = function (i) {
        var o = this.o;
        if (!o || o.afsluttet || !o.d.valg) return;
        var v = o.d.valg[i];
        o.afsluttet = true;
        this.laasValg(i);
        this.udfoer(o.d.handling);
        if (v.rigtig) {
            if (!o.hjulpet) { this.loest++; this.visTal(); }
            this.besked("opg-hint", "");
            this.besked("opg-svar", "Rigtigt. " + o.d.svar, "god");
        } else {
            this.besked("opg-hint", v.fejl, "skidt");
            this.besked("opg-svar", o.d.svar);
        }
        this.saetTrin("ny");
    };

    P.visHint = function () {
        if (!this.o) return;
        this.o.hjulpet = true;
        this.besked("opg-hint", this.o.d.hint, "gul");
        this.saetTrin("svar");
    };

    P.visSvar = function () {
        var o = this.o;
        if (!o || o.afsluttet) return;
        o.afsluttet = true;
        o.hjulpet = true;
        if (o.d.valg) {
            this.laasValg(-1);
            this.udfoer(o.d.handling);
        } else {
            this.udfoer(o.d.visSvar);
        }
        this.besked("opg-svar", o.d.svar);
        this.saetTrin("ny");
    };

    /* Kaldes hvert billede: byg-opgaverne tjekkes, og en rystning efter en
       haeldning venter, til der er haeldt */
    P.opdater = function (dt) {
        if (this.rystSenere > 0) {
            this.rystSenere -= dt;
            if (this.rystSenere <= 0 && !this.b.m.haelder()) this.b.ryst(1.2);
            else if (this.rystSenere <= 0) this.rystSenere = 0.2;
        }
        var o = this.o;
        if (!o || o.afsluttet || !o.d.byg) return;
        this.tjekUr = (this.tjekUr || 0) - dt;
        if (this.tjekUr > 0) return;
        this.tjekUr = 0.25;
        var ok = !this.b.m.haelder() && TJEK[o.d.byg](this.b.analyse(), this.b.m);
        this.holdt = ok ? this.holdt + 0.25 : 0;
        if (this.holdt >= 1.5) {
            o.afsluttet = true;
            if (!o.hjulpet) { this.loest++; this.visTal(); }
            this.besked("opg-hint", "");
            this.besked("opg-svar", "Sådan. " + o.d.svar, "god");
            this.saetTrin("ny");
        }
    };

    Opgaver.TJEK = TJEK;
    NK.Opgaver = Opgaver;
}());
