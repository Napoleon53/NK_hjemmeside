/* =====================================================================
   fritopgave.js - opgaven i det frie forsøg

   Eleven markerer alle de jern(III)salte og sulfider, der er
   tungtopløselige, og trykker Tjek svar. Der er ingen hints: er bare
   ét salt forkert, er svaret "Forkert. Prøv igen." Opgaven er til de
   dygtige, som kan dryppe sig frem til svaret med Na₂S og Fe(NO₃)₃.

   Listen af salte kommer fra D.FRIT_OPGAVE i data.js. Fe₂S₃ staar i
   begge grupper; de to knapper foelges ad.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    NK.FritOpgave = function (forsoeg) {
        this.f = forsoeg;
        this.valgt = {};
        this.loest = false;
        this.besked = null;
        var mig = this;
        this.bygKnapper();
        NK.el("frit-tjek").addEventListener("click", function () { mig.tjek(); });
    };

    var F = NK.FritOpgave.prototype;

    F.bygKnapper = function () {
        var mig = this;
        var boks = NK.el("frit-grupper");
        boks.innerHTML = "";
        D.FRIT_OPGAVE.forEach(function (gruppe) {
            var etiket = document.createElement("div");
            etiket.className = "gruppe-etiket";
            etiket.textContent = gruppe.navn;
            boks.appendChild(etiket);
            var raekke = document.createElement("div");
            raekke.className = "saltvalg";
            gruppe.salte.forEach(function (s) {
                var k = document.createElement("button");
                k.type = "button";
                k.className = "saltchip";
                k.dataset.salt = s.noegle;
                k.textContent = s.formel;
                k.addEventListener("click", function () { mig.skift(s.noegle); });
                raekke.appendChild(k);
            });
            boks.appendChild(raekke);
        });
        this.vis();
    };

    /* Alle salte én gang, selv om Fe₂S₃ staar i begge grupper. */
    F.salte = function () {
        var set = {}, ud = [];
        D.FRIT_OPGAVE.forEach(function (g) {
            g.salte.forEach(function (s) {
                if (set[s.noegle]) return;
                set[s.noegle] = true;
                ud.push(s);
            });
        });
        return ud;
    };

    F.skift = function (noegle) {
        if (this.loest) return;
        this.valgt[noegle] = !this.valgt[noegle];
        this.besked = null;
        this.vis();
    };

    F.tjek = function () {
        if (this.loest) return true;
        var mig = this;
        var rigtigt = this.salte().every(function (s) { return !!mig.valgt[s.noegle] === s.tung; });
        if (rigtigt) {
            this.loest = true;
            this.besked = { tekst: "Rigtigt.", slags: "god" };
            this.f.laerer.replik("ros");
            this.f.aendret("frit-loest");
        } else {
            this.besked = { tekst: "Forkert. Prøv igen.", slags: "skidt" };
        }
        this.vis(true);
        return rigtigt;
    };

    F.vis = function (blink) {
        var chips = NK.el("frit-grupper").querySelectorAll(".saltchip");
        for (var i = 0; i < chips.length; i++) {
            var v = !!this.valgt[chips[i].dataset.salt];
            chips[i].classList.toggle("valgt", v);
            chips[i].classList.toggle("rigtig", this.loest && v);
            chips[i].setAttribute("aria-pressed", v ? "true" : "false");
            chips[i].disabled = this.loest;
        }
        NK.el("frit-tjek").hidden = this.loest;
        var bk = NK.el("frit-besked");
        bk.hidden = !this.besked;
        if (this.besked) {
            bk.textContent = this.besked.tekst;
            bk.className = "besked " + this.besked.slags;
            /* Samme besked to gange i træk skal ogsaa kunne ses */
            if (blink) { void bk.offsetWidth; bk.classList.add("blink"); }
        }
    };
}());
