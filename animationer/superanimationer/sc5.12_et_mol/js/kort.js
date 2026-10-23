/* =====================================================================
   kort.js - scenekortet oeverst midt i scenen (moensteret fra sc7.5 og
   sb2.4, skaaret ned til det, de to faner bruger)

   Al tekst staar paa kortet, fordi eleverne klikker, foer de laeser
   (brugerens valg 9. okt. 2026): spoergsmaalet med de fire svar, hintet,
   forklaringen til et forkert svar, svaret og knappen videre. Der er
   ingen tekstlinje nederst i scenen.

   I index.html: <div class="scenekort" id="x-skort"> med <div id="x-ind">
   (kortets indhold) og raekken <div class="sk-bund" id="x-status"> med
   x-besked og den gule knap x-knap.

     vis(klasse, html)     kortets udgave (spm, koer, loest, facit, info) og indhold
     bund(tekst, klasse)   raekken nederst: hint, fejl (skidt), ros (god), peger
     knap(tekst, klasse)   den gule knap (null skjuler den); klasse "svar"
                           er kun et omrids, "peg" lyser stille, "almindelig"
                           er en graa knap (Gaet forfra)
     blink()               kortet blinker (eller knappen videre, naar det er groent)
     ryst()                raekken ryster ved et forkert svar
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var BOGST = ["A", "B", "C", "D"];

    NK.Kort = function (navn, valg) {
        var mig = this;
        this.el = {
            kort: NK.el(navn + "-skort"), ind: NK.el(navn + "-ind"), bund: NK.el(navn + "-status"),
            besked: NK.el(navn + "-besked"), knap: NK.el(navn + "-knap")
        };
        this.html = null;
        this.klasse = null;
        this.el.kort.addEventListener("click", function (e) {
            if (e.target.closest("[data-videre]")) { valg.videre(); return; }
            var k = e.target.closest("[data-valg]");
            if (k && !k.disabled) valg.valg(parseInt(k.getAttribute("data-valg"), 10));
        });
        this.el.knap.addEventListener("click", function () { valg.knap(); });
    };

    var P = NK.Kort.prototype;

    P.vis = function (klasse, html) {
        var k = "scenekort " + klasse;
        if (k !== this.klasse) { this.el.kort.className = k; this.klasse = k; }
        if (html !== this.html) { this.el.ind.innerHTML = html; this.html = html; }
    };

    P.bund = function (tekst, klasse) {
        this.el.besked.innerHTML = tekst ? NK.htmlPotens(tekst) : "";
        var tom = !tekst && this.el.knap.hidden;
        this.el.bund.className = "sk-bund" + (klasse ? " " + klasse : "") + (tom ? " tom" : "");
    };

    P.knap = function (tekst, klasse) {
        var k = this.el.knap;
        if (tekst === null) {
            k.hidden = true;
        } else {
            k.hidden = false;
            k.textContent = tekst;
            k.className = klasse === "almindelig" ? "knap" : "knap hjaelp" + (klasse ? " " + klasse : "");
        }
        if (!this.el.besked.textContent && k.hidden) this.el.bund.classList.add("tom");
        else this.el.bund.classList.remove("tom");
    };

    P.blink = function () {
        var k = this.el.kort;
        k.classList.remove("blink");
        void k.offsetWidth;
        k.classList.add("blink");
    };

    P.ryst = function () {
        var b = this.el.bund;
        b.classList.remove("ryster");
        void b.offsetWidth;
        b.classList.add("ryster");
    };

    P.hoejde = function () { return this.el.kort.offsetHeight; };

    /* ----- HTML til kortet --------------------------------------------------- */
    NK.Kort.chip = function (tekst) {
        return '<span class="sk-chip">' + tekst + "</span>";
    };

    /* Fire svarknapper. tilstand(i) giver "", "valgt", "rigtig" eller "forkert";
       laast slaar alle knapperne fra. */
    NK.Kort.svarknapper = function (svar, tilstand, laast) {
        var h = '<div class="sk-svar n4">';
        svar.forEach(function (s, i) {
            var t = tilstand ? tilstand(i) : "";
            var fra = laast || t === "forkert" || t === "rigtig";
            h += '<button type="button" class="sk-knap' + (t ? " " + t : "") + '" data-valg="' + i + '"' + (fra ? " disabled" : "") + ">" +
                '<span class="v-bogstav">' + BOGST[i] + "</span><span>" + NK.htmlPotens(s.t) + "</span></button>";
        });
        return h + "</div>";
    };

    /* Det groenne (eller blaa) kort: teksten til venstre og knappen videre til hoejre */
    NK.Kort.slut = function (chip, tekst, knap) {
        return '<div class="sk-slut"><div class="sk-slut-tekst">' + NK.Kort.chip(chip) +
            '<p class="sk-tekst">' + tekst + "</p></div>" +
            (knap ? '<button type="button" class="sk-videre" data-videre>' + knap + "</button>" : "") + "</div>";
    };

    NK.Kort.BOGST = BOGST;
}());
