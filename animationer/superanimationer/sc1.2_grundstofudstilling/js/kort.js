/* =====================================================================
   kort.js - papirkortet oeverst midt i scenen paa fane 1 og 2

   Brugerens beslutning 4. nov. 2026: alle aktive animationer har
   papirkortet. Opgaveteksten, feltet, eleven skriver i, hint, beskeden
   ved et forkert svar, forklaringen ved et rigtigt svar og knapperne
   staar paa ét lyst kort oeverst midt i scenen (udseendet er det
   faelles ../faelles/papirkort.css). Der er ingen linje nederst i
   scenen, og panelet har kun oversigten og fremskridtet.

   NK.Kort.paa(P, navn) laegger metoderne paa fanens prototype. navn er
   forstavelsen paa id'erne (montre, formler). Fanen SKAL have:

     kortData() -> { chip, tekst (ren tekst), felt (true: der skal
       skrives), pladsholder, aria, numerisk, facit: { tekst, svar } |
       null, bliv: { tekst (html), maerke, knap, svar } | null }
     indsendKlik(), knap() (hintknappen), videre() (den groenne knap)

   Indsend svar er graa, til der staar noget i feltet. Enter i feltet
   er Indsend svar. Naar kortet bliver paa trinnet efter et rigtigt svar
   (bliv), er feltet skiftet ud med svaret i groent, forklaringen staar
   under, og knappen, der foerer videre, staar, hvor Indsend svar stod.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function paa(P, navn) {
        function el(id) { return NK.el(navn + "-" + id); }

        P.kortInit = function () {
            var mig = this;
            var e = this.el;
            e.skort = el("skort");
            e.spm = el("spm");
            e.raekke = el("raekke");
            e.input = el("input");
            e.facit = el("facit");
            e.knapper = el("knapper");
            e.indsend = el("indsend");
            e.status = el("status");
            e.besked = el("besked");
            e.bliv = el("bliv");
            e.knap = el("knap");
            e.knap.addEventListener("click", function () { mig.knap(); });
            e.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            e.input.addEventListener("keydown", function (ev) {
                if (ev.key === "Enter") { ev.preventDefault(); mig.indsendKlik(); }
            });
            e.input.addEventListener("input", function () { mig.visIndsend(); });
            e.input.addEventListener("focus", function () { mig.fokuseret = true; });
            e.input.addEventListener("blur", function () { mig.fokuseret = false; });
            e.bliv.addEventListener("click", function (ev) {
                if (ev.target.closest && ev.target.closest("[data-videre]")) mig.videre();
            });
            this.kortBesked = { html: "", klasse: "" };
        };

        /* Hoejden, kortet har sat af oeverst i scenen. Det, der tegnes,
           begynder under kortTop(). Selvtesten maaler kortet i alle trin
           med det laengste hint og den laengste besked. */
        P.kortZone = function () {
            return window.innerHeight <= 720 ? 132 : 150;
        };

        P.kortTop = function () { return 10 + this.kortZone() + 8; };

        P.visKortet = function () {
            var e = this.el, k = this.kortData();
            var bliv = k.bliv;
            var kl = "scenekort " + (bliv ? "loest bliv" + (bliv.svar ? " svar" : "") : "opgave");
            if (e.skort.className.replace(" blink", "") !== kl) e.skort.className = kl;
            var chip = k.chip ? '<span class="sk-chip">' + NK.html(k.chip) + "</span>" : "";
            var tekst = NK.Papir ? NK.Papir.tekst(NK.html(k.tekst)) : NK.html(k.tekst);
            NK.saetHTML(navn + "-spm", chip + tekst);

            var felt = !!k.felt && !bliv;
            e.input.hidden = !felt;
            e.input.disabled = !felt;
            if (felt) {
                if (e.input.placeholder !== k.pladsholder) e.input.placeholder = k.pladsholder || "";
                e.input.setAttribute("aria-label", k.aria || "Svar");
                e.input.setAttribute("inputmode", k.numerisk ? "numeric" : "text");
            }
            e.facit.hidden = !k.facit;
            if (k.facit) {
                e.facit.className = "sk-facit " + (k.facit.svar ? "svar-vist" : "rigtig");
                e.facit.textContent = k.facit.tekst;
            }
            e.knapper.hidden = !!bliv;
            e.raekke.hidden = !felt && !k.facit && !!bliv;
            NK.saetHTML(navn + "-bliv", bliv && NK.Papir
                ? NK.Papir.bliv(bliv.tekst || "", bliv.maerke || "", NK.html(bliv.knap), bliv.svar)
                : "");
            this.visKnap();
            this.visBund();
        };

        /* Hintknappen: Giv et hint, saa Vis svaret. Den lyser stille op
           efter et forkert svar. */
        P.visKnap = function () {
            var o = this.opg;
            var tekst = o && o.hjaelp > 0 ? "Vis svaret" : "Giv et hint";
            this.el.knap.textContent = tekst;
            this.el.knap.className = "knap hjaelp" + (o && o.hjaelp > 0 ? " svar" : "") + (this.pegKnap ? " peg" : "");
            this.visIndsend();
        };

        P.visIndsend = function () {
            var e = this.el.indsend, inp = this.el.input;
            var vis = !inp.hidden;
            e.hidden = !vis;
            if (!vis) return;
            var kan = inp.value.replace(/\s/g, "") !== "";
            e.classList.toggle("klar", kan);
            e.classList.toggle("ikke-klar", !kan);
            e.setAttribute("aria-disabled", kan ? "false" : "true");
        };

        /* Beskeden i kortets nederste raekke: hint, forkert svar eller et
           svar paa et klik i scenen. Raekken er vaek, naar den er tom, og
           naar kortet bliver paa trinnet. */
        P.besked = function (html, klasse) {
            this.kortBesked = { html: html || "", klasse: klasse || "" };
            this.el.besked.innerHTML = this.kortBesked.html;
            this.visBund();
        };

        P.visBund = function () {
            var b = this.kortBesked || { html: "", klasse: "" };
            var bliv = /\bbliv\b/.test(this.el.skort.className);
            this.el.status.hidden = !b.html || bliv;
            var ryster = this.el.status.classList.contains("ryster");
            this.el.status.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (ryster ? " ryster" : "");
        };

        P.fejlBesked = function (tekst) {
            this.besked('<span class="b-maerke">Ikke rigtigt</span> ' + tekst, "skidt");
            this.pegKnap = true;
            this.visKnap();
            var s = this.el.status;
            s.classList.remove("ryster");
            void s.offsetWidth;
            s.classList.add("ryster");
        };

        P.kortBlink = function () {
            var s = this.el.skort;
            s.classList.remove("blink");
            void s.offsetWidth;
            s.classList.add("blink");
        };

        P.kortTekst = function () { return this.el.skort.textContent; };
    }

    NK.Kort = { paa: paa };
}());
