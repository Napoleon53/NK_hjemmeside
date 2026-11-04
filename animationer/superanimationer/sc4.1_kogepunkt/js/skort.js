/* =====================================================================
   skort.js - papirkortet oeverst midt i scenen (4. nov. 2026)

   Brugerens beslutning 4. nov. 2026: alle aktive animationer faar
   papirkortet. Opgaven, spoergsmaalet, svarene, hint, beskeden ved et
   forkert svar, forklaringen og knapperne staar paa ét lyst kort oeverst
   midt i scenen, ikke i panelet og ikke i en statuslinje nederst.
   Moenstrene er sb4.4_intermolekylaere_bindinger og sc6.1_koncentration.

   new NK.Skort(navn, sim, zone) kobler kortet til en fane. I index.html:
     <div class="scenekort" id="x-skort">
       <div class="sk-ind" id="x-ind"></div>
       <div class="sk-bund" id="x-bund">
         <p class="st-tekst" id="x-besked" aria-live="polite"></p>
         <button class="knap hjaelp" id="x-hint" type="button">Giv et hint</button>
         <button class="knap indsend" id="x-indsend" type="button">Indsend svar</button>
       </div>
     </div>
   zone: [hoejden paa en almindelig skaerm, paa en lav skaerm]. Det, der
   tegnes paa laerredet, begynder under top() = 10 + zone + 10.

   Fanen har:
     kortData() -> {
       chip      etiketten (indlejret overskrift), fx "Mål 2 af 4"
       tekst     opgaven eller spoergsmaalet (ren tekst)
       ekstra    HTML under teksten (fx "Dit gæt: ...")
       svar      [{ t, prik, formel, kl, laast }]  kl: valgt, forkert,
                 rigtig, svar-vist, dim. Uden svar er kortet en opgave.
       bogstaver true: A, B, C foran svarene (ellers prik eller intet)
       bliv      { html, maerke, knap, gul }: kortet bliver paa
                 spoergsmaalet efter et rigtigt svar; forklaringen staar
                 under svarene, og knappen (knap) staar, hvor Indsend svar
                 stod. Uden knap (sidste opgave) er der ingen knap.
       hint      teksten paa hintknappen, eller null (skjult)
       indsend   { tekst, klar } eller null (skjult)
     }
     kortValg(j)   et svar paa kortet er klikket (vaelger kun)
     kortHint()    hintknappen
     kortIndsend() Indsend svar (kun naar indsend.klar)
     kortVidere()  den groenne knap

   Beskeden i kortets nederste raekke: besked(html, klasse) er den faste
   (klasse "", hint, skidt, god, gul, peger), fejl(html) er et forkert svar
   (Ikke endnu, raekken ryster, hintknappen lyser stille op), og
   kort(html, sek) er et svar paa et klik i scenen, der forsvinder igen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function papir(html) { return NK.Papir ? NK.Papir.tekst(html) : html; }

    function Skort(navn, sim, zone) {
        var mig = this;
        this.navn = navn;
        this.sim = sim;
        this.zone = zone || [150, 140];
        this.el = {
            kort: NK.el(navn + "-skort"), ind: NK.el(navn + "-ind"), bund: NK.el(navn + "-bund"),
            besked: NK.el(navn + "-besked"), hint: NK.el(navn + "-hint"), indsend: NK.el(navn + "-indsend")
        };
        this.fast = { html: "", klasse: "" };
        this.midl = null;
        this.midlT = 0;
        this.peg = false;
        this.sidst = "";
        this.el.kort.addEventListener("click", function (e) {
            var t = e.target;
            if (!t || !t.closest) return;
            if (t.closest("[data-videre]")) { if (sim.kortVidere) sim.kortVidere(); return; }
            var k = t.closest("[data-valg]");
            if (k && !k.disabled && sim.kortValg) sim.kortValg(parseInt(k.getAttribute("data-valg"), 10));
        });
        this.el.hint.addEventListener("click", function () { mig.peg = false; if (sim.kortHint) sim.kortHint(); });
        this.el.indsend.addEventListener("click", function () {
            var d = mig.data || {};
            if (!d.indsend || !d.indsend.klar) { mig.blink(); return; }
            if (sim.kortIndsend) sim.kortIndsend();
        });
    }

    var P = Skort.prototype;

    /* Hoejden, kortet har sat af oeverst i scenen */
    P.zoneH = function () { return this.zone[window.innerHeight <= 720 ? 1 : 0]; };
    P.top = function () { return 10 + this.zoneH() + 10; };

    P.svarHTML = function (d) {
        var html = '<div class="sk-svar n' + d.svar.length + '">';
        d.svar.forEach(function (s, j) {
            var tegn = d.bogstaver ? '<span class="v-bogstav">' + "ABCD".charAt(j) + "</span>" :
                (s.prik ? '<span class="v-prik" style="background:' + s.prik + '"></span>' : "");
            html += '<button type="button" class="sk-knap' + (s.kl ? " " + s.kl : "") + '" data-valg="' + j + '"' +
                (s.laast ? " disabled" : "") + ">" + tegn + "<span>" + NK.html(s.t) + "</span>" +
                (s.formel ? '<span class="sk-formel">' + s.formel + "</span>" : "") + "</button>";
        });
        return html + "</div>";
    };

    P.blivHTML = function (b) {
        var maerke = b.maerke ? '<span class="b-maerke">' + b.maerke + "</span> " : "";
        if (b.knap && NK.Papir) return NK.Papir.bliv(b.html || "", b.maerke, NK.html(b.knap), b.gul);
        return '<div class="sk-bund bliv ' + (b.gul ? "svar" : "god") + '"><p class="st-tekst">' + maerke + (b.html || "") + "</p>" +
            (b.knap ? '<button type="button" class="sk-videre" data-videre="1">' + NK.html(b.knap) + "</button>" : "") + "</div>";
    };

    /* Kortet tegnes om ud fra fanens kortData() */
    P.vis = function () {
        var d = this.sim.kortData();
        this.data = d;
        var e = this.el.kort;
        var kl = "scenekort " + (d.bliv ? "loest bliv" + (d.bliv.gul ? " svar" : "") : (d.svar ? "spm" : "opgave"));
        if (e.className.replace(" blink", "") !== kl) e.className = kl + (e.classList.contains("blink") ? " blink" : "");
        var html = '<p class="sk-tekst">' + (d.chip ? '<span class="sk-chip">' + NK.html(d.chip) + "</span>" : "") +
            papir(NK.html(d.tekst || "")) + "</p>" + (d.ekstra || "");
        if (d.svar) html += this.svarHTML(d);
        if (d.bliv) html += this.blivHTML(d.bliv);
        if (html !== this.sidst) {
            this.el.ind.innerHTML = html;
            this.sidst = html;
        }
        this.visBund();
    };

    /* Kortets nederste raekke: beskeden og knapperne */
    P.visBund = function () {
        var d = this.data || {};
        var b = this.midl || this.fast;
        var harTekst = !!b.html;
        var hint = !d.bliv && !!d.hint, ind = !d.bliv && !!d.indsend;
        if (this.el.besked.innerHTML !== b.html) this.el.besked.innerHTML = b.html;
        this.el.besked.hidden = !harTekst;
        this.el.hint.hidden = !hint;
        if (hint) {
            if (this.el.hint.textContent !== d.hint) this.el.hint.textContent = d.hint;
            this.el.hint.className = "knap hjaelp" + (d.hint === "Vis svaret" ? " svar" : "") + (this.peg ? " peg" : "");
        }
        this.el.indsend.hidden = !ind;
        if (ind) {
            var t = d.indsend.tekst || "Indsend svar";
            if (this.el.indsend.textContent !== t) this.el.indsend.textContent = t;
            this.el.indsend.className = "knap indsend " + (d.indsend.klar ? "klar" : "ikke-klar");
            this.el.indsend.setAttribute("aria-disabled", d.indsend.klar ? "false" : "true");
        }
        this.el.bund.hidden = !harTekst && !hint && !ind;
        var kl = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom");
        var ryster = this.el.bund.classList.contains("ryster");
        if (this.el.bund.className.replace(" ryster", "") !== kl) this.el.bund.className = kl + (ryster ? " ryster" : "");
    };

    /* Den faste besked (hint, naeste skridt, ros under et forsoeg) */
    P.besked = function (html, klasse) {
        this.fast = { html: html || "", klasse: klasse || "" };
        this.midl = null;
        this.midlT = 0;
        if (klasse !== "skidt") this.peg = false;
        this.visBund();
    };

    /* Et forkert svar: Ikke endnu, raekken ryster, og hintknappen lyser stille op */
    P.fejl = function (html) {
        this.besked('<span class="b-maerke">Ikke endnu</span> ' + html, "skidt");
        this.peg = true;
        this.visBund();
        var e = this.el.bund;
        e.classList.remove("ryster");
        void e.offsetWidth;
        e.classList.add("ryster");
    };

    P.hintTekst = function (html, nr, af) {
        this.besked('<span class="b-maerke">Hint' + (af > 1 ? " " + nr + " af " + af : "") + "</span> " + html, "hint");
    };

    P.svarTekst = function (html) {
        this.besked('<span class="b-maerke">Svaret</span> ' + html, "gul");
    };

    /* Et svar paa et klik i scenen, der forsvinder igen efter sek sekunder */
    P.kort = function (html, sek) {
        this.midl = { html: html, klasse: "peger" };
        this.midlT = sek || 4;
        this.visBund();
    };

    P.opdater = function (dt) {
        if (this.midlT > 0) {
            this.midlT -= dt;
            if (this.midlT <= 0) { this.midl = null; this.visBund(); }
        }
    };

    /* Kortet blinker blødt: eleven greb ud efter forsoeget, men skal foerst
       goere det, kortet siger */
    P.blink = function () {
        var e = this.el.kort;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    NK.Skort = Skort;
}());
