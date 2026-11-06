/* =====================================================================
   kort.js - papirkortet oeverst midt i scenen (alle tre faner)

   Brugerens valg 4. nov. 2026: alle aktive animationer har papirkortet.
   Kopi af sc5.2's fil (6. nov. 2026) med en notelinje ekstra: .note(html)
   viser en kort besked fra scenen (fx "0,25 mol gas mere") under teksten.
   Opgaven, spoergsmaalet, svarene, hintet, beskeden ved et forkert svar,
   forklaringen ved et rigtigt svar og knapperne staar paa ét lyst kort
   oeverst i scenen, ikke i panelet og ikke i en linje nederst.
   Udseendet er faelles (../faelles/papirkort.css og papirkort.js);
   pladsen og opbygningen staar sidst i css/stil.css.

   I index.html har hver fane:
     <div class="scenekort opgave" id="x-skort">
       <div id="x-ind"></div>                    chip, tekst og svarknapper
       <div class="sk-bund tom" id="x-bund">      beskeden, Giv hint, Indsend svar
         <p class="st-tekst" id="x-besked"></p>
         <button class="knap hjaelp" id="x-knap">Giv hint</button>
         <button class="knap indsend ikke-klar" id="x-indsend">Indsend svar</button>
       </div>
       <div id="x-bliv"></div>                   forklaringen og Naeste (NK.Papir.bliv)
     </div>

   new NK.SceneKort(navn, { valg(j), hint(), indsend(), videre() })
     .vis({ kl, chip, tekst, efter, svar: [{ j, t, valgt, rigtig, forkert, dim }], laast })
     .besked(html, klasse)        "", "skidt", "gul", "god" eller "peger"
     .knapper({ hint, peg, indsend, klar, indsendTekst })
     .bliv(tekst, maerke, knap, slags)   slags: "god", "svar" (gul) eller "nej"
     .blink()
     .zone(basis)                 den plads, kortet har oeverst i scenen
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Et tal og dets enhed deles ikke over to linjer ("28,06 g/mol") */
    function fast(html) {
        return String(html).replace(/(\d) (g\/mol|g|mol|mL|L|u)(?![A-Za-zæøå])/g, "$1 $2");
    }

    function SceneKort(navn, cb) {
        var mig = this;
        this.navn = navn;
        this.cb = cb || {};
        this.e = NK.el(navn + "-skort");
        this.ind = NK.el(navn + "-ind");
        this.bundEl = NK.el(navn + "-bund");
        this.beskedEl = NK.el(navn + "-besked");
        this.hintEl = NK.el(navn + "-knap");
        this.indsendEl = NK.el(navn + "-indsend");
        this.blivEl = NK.el(navn + "-bliv");
        this.noteEl = NK.el(navn + "-note");
        this.sidst = "";
        this.blivSidst = null;
        this.e.addEventListener("click", function (ev) {
            var t = ev.target;
            if (!t || !t.closest) return;
            if (t.closest("[data-videre]")) { if (mig.cb.videre) mig.cb.videre(); return; }
            var k = t.closest("[data-valg]");
            if (k && !k.disabled && mig.cb.valg) { mig.cb.valg(k.getAttribute("data-valg")); return; }
            if (t.closest("#" + navn + "-knap")) { if (mig.cb.hint) mig.cb.hint(); return; }
            if (t.closest("#" + navn + "-indsend")) { if (mig.cb.indsend) mig.cb.indsend(); }
        });
    }

    var P = SceneKort.prototype;

    /* Kortets tekst og svar */
    P.vis = function (d) {
        var kl = "scenekort " + (d.kl || "opgave");
        if (this.e.className.replace(" blink", "") !== kl) {
            var blinker = this.e.classList.contains("blink");
            this.e.className = kl + (blinker ? " blink" : "");
        }
        var tekst = NK.Papir ? NK.Papir.tekst(d.tekst || "") : (d.tekst || "");
        var html = '<p class="sk-tekst">' + (d.chip ? '<span class="sk-chip">' + NK.html(d.chip) + "</span>" : "") +
            tekst + "</p>" + (d.efter || "");
        if (d.svar) {
            html += '<div class="sk-svar n' + d.svar.length + '">';
            d.svar.forEach(function (s) {
                var c = (s.valgt ? " valgt" : "") + (s.rigtig ? " rigtig" : "") + (s.forkert ? " forkert" : "") +
                    (s.svarVist ? " svar-vist" : "") + (s.dim ? " dim" : "");
                html += '<button type="button" class="sk-knap' + c + '" data-valg="' + s.j + '"' +
                    (d.laast ? " disabled" : "") + ">" + s.t + "</button>";
            });
            html += "</div>";
        }
        html = fast(html);
        if (html !== this.sidst) {
            this.ind.innerHTML = html;
            this.sidst = html;
        }
        return this;
    };

    /* Beskeden i kortets nederste raekke */
    P.besked = function (html, klasse) {
        html = fast(html || "");
        this.beskedEl.innerHTML = html;
        this.beskedEl.hidden = !html;
        var kl = "sk-bund" + (klasse ? " " + klasse : "") + (html ? "" : " tom");
        this.bundEl.className = kl;
        if (klasse === "skidt") {
            this.bundEl.classList.remove("ryster");
            void this.bundEl.offsetWidth;
            this.bundEl.classList.add("ryster");
        }
        return this;
    };

    P.beskedTekst = function () { return this.beskedEl.textContent.replace(/ /g, " "); };

    /* Giv hint (stille knap med gul kant) og Indsend svar (graa, til der er noget at sende) */
    P.knapper = function (k) {
        var h = this.hintEl, s = this.indsendEl;
        h.hidden = !k.hint;
        if (k.hint) {
            h.textContent = k.hint;
            h.className = "knap hjaelp" + (k.hint !== "Giv hint" ? " svar" : "") + (k.peg ? " peg" : "");
        }
        if (s) {
            s.hidden = !k.indsend;
            s.textContent = k.indsendTekst || "Indsend svar";
            s.classList.toggle("klar", !!k.klar);
            s.classList.toggle("ikke-klar", !k.klar);
            s.setAttribute("aria-disabled", k.klar ? "false" : "true");
        }
        return this;
    };

    /* Kortet bliver paa spoergsmaalet: forklaringen og knappen videre staar,
       hvor beskeden og Indsend svar stod. knap null: ingen knap (sidste opgave). */
    P.bliv = function (tekst, maerke, knap, slags) {
        if (tekst === null || tekst === undefined) {
            if (this.blivSidst !== null) { this.blivEl.innerHTML = ""; this.blivSidst = null; }
            this.blivEl.hidden = true;
            this.bundEl.hidden = false;
            return this;
        }
        var html;
        if (knap) {
            html = NK.Papir.bliv(tekst, maerke, NK.html(knap), slags === "svar" || slags === "nej");
            if (slags === "nej") html = html.replace("sk-bund bliv svar", "sk-bund bliv nej");
        } else {
            html = '<div class="sk-bund bliv ' + (slags === "svar" ? "svar" : (slags === "nej" ? "nej" : "god")) +
                ' uden-knap"><p class="st-tekst">' + (maerke ? '<span class="b-maerke">' + maerke + "</span> " : "") + tekst + "</p></div>";
        }
        html = fast(html);
        if (html !== this.blivSidst) { this.blivEl.innerHTML = html; this.blivSidst = html; }
        this.blivEl.hidden = false;
        this.bundEl.hidden = true;
        return this;
    };

    /* En kort besked fra scenen under teksten ("" skjuler den) */
    P.note = function (html) {
        if (!this.noteEl) return this;
        html = fast(html || "");
        if (this.noteEl.innerHTML !== html) this.noteEl.innerHTML = html;
        this.noteEl.hidden = !html;
        return this;
    };

    P.blivTekst = function () {
        var t = this.blivEl.querySelector(".st-tekst");
        return t ? t.textContent.replace(/\u00a0/g, " ") : "";
    };

    P.blivAaben = function () { return !this.blivEl.hidden; };

    /* Et klik i scenen, foer kortet er klaret: ét bloedt blink */
    P.blink = function () {
        var e = this.e;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* Pladsen oeverst i scenen: kortets top (10 px), kortet og 8 px luft.
       basis: [almindelig skaerm, lav skaerm]. Kortet faar mindst basis,
       saa scenen ikke flytter sig, hver gang kortet skifter lidt. */
    P.zone = function (basis) {
        var b = basis[window.innerHeight <= 720 ? 1 : 0];
        var h = this.e.offsetParent ? this.e.offsetHeight : 0;
        return 10 + Math.max(b, h) + 8;
    };

    NK.SceneKort = SceneKort;
}());
