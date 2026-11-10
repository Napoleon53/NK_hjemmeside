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
                           er en graa knap til venstre (Gaet forfra, Start
                           forfra), aldrig dér, hvor knappen videre stod
     blink()               kortet blinker (eller knappen videre, naar det er groent)
     ryst()                raekken ryster ved et forkert svar
     indsend(vis, klar)    knappen Indsend svar (x-indsend, paa begge faner)
     kortBesked(tekst, sek) en besked, der forsvinder efter sek sekunder (tik)

   Papirkortet (brugerens valg 3. nov. 2026, ../faelles/papirkort.css og
   papirkort.js): spoergsmaalet staar halvfedt (NK.Kort.tekst), et svar
   eller et gaet vaelger kun, og Indsend svar bedoemmer det. Efter svaret
   bliver kortet paa spoergsmaalet (NK.Kort.bliv): svaret er groent (gult,
   naar det blev vist), forklaringen staar under svarene, og knappen videre
   staar, hvor Indsend svar stod.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var BOGST = ["A", "B", "C", "D"];

    NK.Kort = function (navn, valg) {
        var mig = this;
        this.el = {
            kort: NK.el(navn + "-skort"), ind: NK.el(navn + "-ind"), bund: NK.el(navn + "-status"),
            besked: NK.el(navn + "-besked"), knap: NK.el(navn + "-knap"), indsend: NK.el(navn + "-indsend")
        };
        this.html = null;
        this.klasse = null;
        this.fast = { tekst: "", klasse: "" };
        this.kortT = 0;
        this.el.kort.addEventListener("click", function (e) {
            if (e.target.closest("[data-videre]")) { valg.videre(); return; }
            var k = e.target.closest("[data-valg]");
            if (k && !k.disabled) valg.valg(parseInt(k.getAttribute("data-valg"), 10));
        });
        this.el.knap.addEventListener("click", function () { valg.knap(); });
        if (this.el.indsend) this.el.indsend.addEventListener("click", function () { valg.indsend(); });
    };

    var P = NK.Kort.prototype;

    P.vis = function (klasse, html) {
        var k = "scenekort " + klasse;
        if (k !== this.klasse) { this.el.kort.className = k; this.klasse = k; }
        if (html !== this.html) { this.el.ind.innerHTML = html; this.html = html; }
    };

    P.bund = function (tekst, klasse) {
        this.fast = { tekst: tekst, klasse: klasse };
        this.kortT = 0;
        this.visBund(tekst, klasse);
    };

    P.visBund = function (tekst, klasse) {
        this.el.besked.innerHTML = tekst ? NK.htmlPotens(tekst) : "";
        var tom = !tekst && this.knapperVaek();
        this.el.bund.className = "sk-bund" + (klasse ? " " + klasse : "") + (tom ? " tom" : "");
    };

    /* Raekken er tom, naar der hverken er tekst, den gule knap eller Indsend svar */
    P.knapperVaek = function () { return this.el.knap.hidden && (!this.el.indsend || this.el.indsend.hidden); };

    /* En kort besked (fx naar Indsend svar trykkes uden et valgt svar). Den
       faste linje kommer igen efter sek sekunder, saa et hint eller
       forklaringen til et forkert svar ikke forsvinder. */
    P.kortBesked = function (tekst, sek, klasse) {
        this.kortT = sek || 3.5;
        this.visBund(tekst, klasse || "peger");
    };

    P.tik = function (dt) {
        if (this.kortT <= 0) return;
        this.kortT -= dt;
        if (this.kortT <= 0) { this.kortT = 0; this.visBund(this.fast.tekst, this.fast.klasse); }
    };

    /* Indsend svar: fremme under et spoergsmaal, graa, til et svar er valgt */
    P.indsend = function (vis, klar) {
        var e = this.el.indsend;
        if (!e) return;
        e.hidden = !vis;
        e.classList.toggle("klar", !!(vis && klar));
        e.classList.toggle("ikke-klar", !(vis && klar));
        e.setAttribute("aria-disabled", vis && klar ? "false" : "true");
        if (!this.el.besked.textContent && this.knapperVaek()) this.el.bund.classList.add("tom");
        else this.el.bund.classList.remove("tom");
    };

    P.knap = function (tekst, klasse) {
        var k = this.el.knap;
        if (tekst === null) {
            k.hidden = true;
        } else {
            k.hidden = false;
            k.textContent = tekst;
            /* "almindelig" er Gaet forfra og Start forfra: en graa knap til venstre,
               saa den ikke staar, hvor knappen videre stod (brugeren 3. nov. 2026) */
            k.className = klasse === "almindelig" ? "knap forfra" : "knap hjaelp" + (klasse ? " " + klasse : "");
        }
        if (!this.el.besked.textContent && this.knapperVaek()) this.el.bund.classList.add("tom");
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

    /* Kortets tekst: etiketten foran og spoergsmaalet (saetningen med ?)
       halvfedt paa papirkortet. intro er indledningen foran spoergsmaalet. */
    function papir(html) { return NK.Papir ? NK.Papir.tekst(html) : html; }

    NK.Kort.tekst = function (chip, tekst, intro) {
        return '<p class="sk-tekst">' + NK.Kort.chip(chip) +
            (intro ? '<span class="sk-intro">' + papir(NK.htmlPotens(intro)) + "</span> " : "") + papir(NK.htmlPotens(tekst)) + "</p>";
    };

    /* Kortet bliver paa spoergsmaalet: forklaringen og knappen videre under svarene */
    NK.Kort.bliv = function (tekst, svaret, knap) {
        return NK.Papir.bliv(tekst, svaret ? "Svaret" : "Rigtigt", knap, svaret);
    };

    /* Fire svarknapper. tilstand(i) giver "", "valgt", "rigtig", "forkert",
       "svar-vist" eller "dim"; laast slaar alle knapperne fra. */
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
        return '<div class="sk-slut"><div class="sk-slut-tekst">' +
            '<p class="sk-tekst">' + NK.Kort.chip(chip) + tekst + "</p></div>" +
            (knap ? '<button type="button" class="sk-videre" data-videre>' + knap + "</button>" : "") + "</div>";
    };

    NK.Kort.BOGST = BOGST;
}());
