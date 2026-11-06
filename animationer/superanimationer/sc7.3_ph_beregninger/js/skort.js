/* =====================================================================
   skort.js - papirkortet oeverst midt i scenen (6. nov. 2026)

   Samme fil i sc7.1, sc7.2 og sc7.3. Al tekst til opgaven staar paa ét
   lyst kort over laerredet (brugerens regler, se ../faelles/papirkort.css
   og NK_hjemmeside/CLAUDE.md): etiketten og opgaveteksten, evt.
   svarknapper og nederst en raekke med beskeden (hint, fejl), Giv hint
   og Indsend svar. Svarknapper vaelger kun; Indsend svar sender ind.
   Naar opgaven er klaret, bliver kortet staaende: svaret er groent,
   forklaringen staar under (NK.Papir.bliv), og knappen videre staar,
   hvor Indsend svar stod. Start forfra staar aldrig paa kortet.

   new NK.Skort(p, h): p er forstavelsen paa id'erne i index.html
   (p-skort, p-ind, p-status, p-besked, p-knap, p-indsend).
   h: { valg(j), indsend(), hjaelp(), videre() }.

   vis(o) tegner kortet (DOM'en roeres kun, naar noget skifter):
     chip      etiketten foran teksten ("Reaktion 3 af 10")
     tekst     opgaveteksten som HTML (spoergsmaalet bliver halvfedt)
     ekstra    HTML mellem teksten og svarene
     svar      [{ html, kl }], kl: valgt, forkert, rigtig, svar-vist, dim
     laast     svarknapperne er laast
     bliv      { tekst, knap, vist, maerke }: opgaven er klaret
     besked    { html, klasse }, klasse: skidt, god, gul, peger
     hint      { tekst, svar, peg, laast } eller null (ingen knap)
     indsend   { tekst, klar } eller null (ingen knap)
   blink(): kortet blinker blødt (et klik i scenen paa det forkerte).
   ryst(): beskeden toner frem igen (et forkert svar).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var BOGSTAV = "ABCDEFGH";

    function Skort(p, h) {
        var mig = this;
        this.p = p;
        this.h = h || {};
        this.e = {
            kort: NK.el(p + "-skort"), ind: NK.el(p + "-ind"), bund: NK.el(p + "-status"),
            besked: NK.el(p + "-besked"), knap: NK.el(p + "-knap"), indsend: NK.el(p + "-indsend")
        };
        this.sidst = {};
        this.klar = false;
        this.e.kort.addEventListener("click", function (ev) {
            var t = ev.target;
            if (!t || !t.closest) return;
            if (t.closest("[data-videre]")) { if (mig.h.videre) mig.h.videre(); return; }
            var k = t.closest("[data-valg]");
            if (k && !k.disabled && mig.h.valg) mig.h.valg(parseInt(k.getAttribute("data-valg"), 10));
        });
        this.e.knap.addEventListener("click", function () { if (mig.h.hjaelp) mig.h.hjaelp(); });
        this.e.indsend.addEventListener("click", function () {
            if (!mig.klar) { mig.blink(); return; }
            if (mig.h.indsend) mig.h.indsend();
        });
    }

    var P = Skort.prototype;

    P.saet = function (noegle, el, felt, v) {
        if (this.sidst[noegle] === v) return;
        this.sidst[noegle] = v;
        el[felt] = v;
    };

    P.vis = function (o) {
        var e = this.e, bliv = o.bliv || null;
        var kl = "scenekort " + (bliv ? "loest" + (bliv.vist ? " svar" : "") : (o.svar ? "spm" : "opgave"));
        if (e.kort.classList.contains("blink")) kl += " blink";
        this.saet("kl", e.kort, "className", kl);

        var html = '<p class="sk-tekst">' + (o.chip ? '<span class="sk-chip">' + NK.html(o.chip) + "</span>" : "") +
            (NK.Papir ? NK.Papir.tekst(o.tekst || "") : (o.tekst || "")) + "</p>" + (o.ekstra || "");
        if (o.svar) {
            html += '<div class="sk-svar n' + o.svar.length + '">';
            o.svar.forEach(function (s, j) {
                var k = s.kl || "";
                var laast = o.laast || /forkert/.test(k);
                html += '<button type="button" class="sk-knap' + (k ? " " + k : "") + '" data-valg="' + j + '"' + (laast ? " disabled" : "") + ">" +
                    '<span class="v-bogstav">' + BOGSTAV.charAt(j) + "</span><span>" + s.html + "</span></button>";
            });
            html += "</div>";
        }
        if (bliv) {
            var maerke = bliv.maerke || (bliv.vist ? "Svaret" : "Rigtigt");
            var b = NK.Papir.bliv(bliv.tekst || "", maerke, NK.html(bliv.knap || ""), !!bliv.vist);
            if (!bliv.knap) b = b.replace(/<button[^>]*data-videre[^>]*>[^<]*<\/button>/, "");
            html += b;
        }
        this.saet("ind", e.ind, "innerHTML", html);

        /* Den nederste raekke: beskeden, Giv hint og Indsend svar */
        var bs = o.besked || { html: "", klasse: "" };
        this.saet("bundSkjult", e.bund, "hidden", !!bliv);
        var bkl = "sk-bund" + (bs.klasse ? " " + bs.klasse : "") + (bs.html ? "" : " tom");
        if (e.bund.classList.contains("ryster")) bkl += " ryster";
        this.saet("bundKl", e.bund, "className", bkl);
        this.saet("besked", e.besked, "innerHTML", bs.html || "");
        this.saet("beskedSkjult", e.besked, "hidden", !bs.html);
        var hint = bliv ? null : (o.hint || null);
        this.saet("knapSkjult", e.knap, "hidden", !hint);
        if (hint) {
            this.saet("knapTekst", e.knap, "textContent", hint.tekst);
            this.saet("knapKl", e.knap, "className", "knap hjaelp" + (hint.svar ? " svar" : "") + (hint.peg ? " peg" : ""));
            this.saet("knapLaast", e.knap, "disabled", !!hint.laast);
        }
        var ind = bliv ? null : (o.indsend || null);
        this.saet("indsendSkjult", e.indsend, "hidden", !ind);
        this.klar = !!(ind && ind.klar);
        if (ind) {
            this.saet("indsendTekst", e.indsend, "textContent", ind.tekst || "Indsend svar");
            this.saet("indsendKl", e.indsend, "className", "knap indsend " + (this.klar ? "klar" : "ikke-klar"));
            e.indsend.setAttribute("aria-disabled", this.klar ? "false" : "true");
        }
    };

    P.blink = function () {
        var k = this.e.kort;
        k.classList.remove("blink");
        void k.offsetWidth;
        k.classList.add("blink");
        this.sidst.kl = k.className;
    };

    P.ryst = function () {
        var b = this.e.bund;
        b.classList.remove("ryster");
        void b.offsetWidth;
        b.classList.add("ryster");
        this.sidst.bundKl = b.className;
    };

    /* Kortets hoejde lige nu (selvtesten maaler den mod kortZone) */
    P.hoejde = function () { return this.e.kort.offsetHeight; };

    /* Den plads, kortet har faaet sat af oeverst i scenen: lav paa lave
       skaerme (hoejst 720 px), hoej ellers, og lidt mere, naar scenen er
       smal, saa teksten faar flere linjer. Laerredet tegner det, eleven skal
       se, under 10 + zone + 8. */
    Skort.zone = function (canvas, lav, hoej, smal) {
        var z = window.innerHeight <= 720 ? lav : hoej;
        var b = canvas ? canvas.clientWidth : 1000;
        if (b && b < 720) z += smal === undefined ? 28 : smal;
        return z;
    };

    /* Et maerke foran en besked: "Hint", "Ikke endnu" (papirkort.css saetter
       kolon eller punktum efter) */
    Skort.maerke = function (ord, html) {
        return '<span class="b-maerke">' + ord + "</span>" + html;
    };

    NK.Skort = Skort;
}());
