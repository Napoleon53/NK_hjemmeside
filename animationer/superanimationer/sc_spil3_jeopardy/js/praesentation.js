/* =====================================================================
   praesentation.js - tilbuddet om Kemichaels praesentation

   Foerste gang en fane aabnes i en browser, kommer Kemichael ikke af sig
   selv. Midt foroven i scenen staar to knapper: "Start praesentation" og
   "Nej tak". Saa kan eleven kigge sig omkring foerst og selv vaelge,
   hvornaar han skal tale, eller sige nej.

   Valget huskes i browseren under fanens noegle. Tilbuddet forsvinder
   ogsaa, naar eleven har loest den foerste opgave paa fanen (fanen kalder
   afvisTilbud), for saa er eleven kommet i gang. K viser praesentationen
   igen uden at spoerge.

   Under praesentationen staar knappen "Spring praesentationen over" samme
   sted, og han gaar kun ved den, ved to klik paa ham eller ved Esc
   (laererIntroVaek i js/laerer.js).

   Brug: NK.Praesentation.kobl(Prototype, { noegle, tilbud, spring })
         og kald this.bygTilbud() fra fanens konstruktoer.
         En aeldre animation med sin egen startIntro bruger i stedet
         NK.Praesentation.pakInd (se nederst), kaldt fra js/app.js.

   Filen er den samme i alle superanimationer, der har en praesentation.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function kobl(P, v) {
        P.bygTilbud = function () {
            var mig = this, boks = NK.el(v.tilbud);
            if (!boks) return;
            boks.querySelector(".tilbud-start").addEventListener("click", function () { mig.tagTilbud(); });
            boks.querySelector(".tilbud-nej").addEventListener("click", function () { mig.afvisTilbud(); });
            this.tilbudVises = false;
        };

        P.visTilbud = function (vis) {
            this.tilbudVises = !!vis;
            var boks = NK.el(v.tilbud);
            if (boks) boks.hidden = !vis;
        };

        /* Kaldes, hver gang fanen vises. tving: K, praesentationen straks */
        P.startIntro = function (tving) {
            if (!this.laererIntro) return;
            if (tving) {
                this.visTilbud(false);
                NK.gem(v.noegle, true);
                if (!(this.laererIIntro && this.laererIIntro())) this.introVent = 0.1;
                return;
            }
            if (NK.hent(v.noegle, false)) return;
            this.visTilbud(true);
        };

        P.tagTilbud = function () {
            NK.gem(v.noegle, true);
            this.visTilbud(false);
            this.introVent = 0.15;
        };

        /* Nej tak, Esc eller foerste loeste opgave */
        P.afvisTilbud = function () {
            if (!this.tilbudVises) return false;
            NK.gem(v.noegle, true);
            this.visTilbud(false);
            if (this.fokus) this.fokus();
            return true;
        };

        /* Esc: foerst tilbuddet, saa praesentationen */
        P.springIntro = function () {
            if (this.afvisTilbud()) return true;
            this.introVent = 0;
            return !!(this.laererIntroVaek && this.laererIntroVaek());
        };

        P.opdaterIntro = function (dt) {
            if (this.introVent > 0) {
                this.introVent -= dt;
                if (this.introVent <= 0 && this.laererIntro) this.laererIntro();
            }
            var iIntro = !!(this.laererIIntro && this.laererIIntro());
            if (iIntro !== this.visesSpring) {
                this.visesSpring = iIntro;
                NK.el(v.spring).hidden = !iIntro;
            }
            if (this.pegPaaFelt) this.pegPaaFelt(iIntro && this.introTrin === 2);
        };
    }

    /* ----- Til de aeldre animationer ------------------------------------
       De har deres egen startIntro, som starter praesentationen af sig
       selv. pakInd lader den blive, men viser tilbuddet i stedet, naar
       den ikke er tvunget (K). Start kalder den gamle med tving.

       v.tilbud    id paa tilbuddets element, eller en funktion (id) -> id
       v.set(id)   er der allerede valgt paa denne fane?   (this = objektet)
       v.husk(id)  husk valget (Nej tak eller Esc)
       v.medId     startIntro tager (id, tving) i stedet for (tving)
       v.esc       navnet paa den metode, Esc kalder, hvis den skal vaere
                   det samme som Nej tak (fx "springIntro"). Er den ogsaa
                   brugt ved faneskift (stopIntro), kaldes afvisTilbud i
                   stedet direkte fra Esc i app.js. */
    function pakInd(P, v) {
        var start = P.startIntro;
        function element(mig, id) {
            return NK.el(typeof v.tilbud === "function" ? v.tilbud.call(mig, id) : v.tilbud);
        }
        function byg(mig, e) {
            if (!e || e.getAttribute("data-bundet")) return;
            e.setAttribute("data-bundet", "1");
            e.querySelector(".tilbud-start").addEventListener("click", function () { mig.tagTilbud(); });
            e.querySelector(".tilbud-nej").addEventListener("click", function () { mig.afvisTilbud(); });
        }
        P.visTilbud = function (vis, id) {
            var gammel = this.tilbudVises ? element(this, this.tilbudFor) : null;
            if (gammel) gammel.hidden = true;
            this.tilbudVises = !!vis;
            this.tilbudFor = vis ? id : null;
            if (vis) {
                var e = element(this, id);
                byg(this, e);
                if (e) e.hidden = false;
            }
        };
        P.startIntro = function (a, b) {
            var id = v.medId ? a : null, tving = v.medId ? b : a;
            if (tving) {
                this.visTilbud(false);
                return start.apply(this, arguments);
            }
            if (v.set.call(this, id)) { this.visTilbud(false); return; }
            this.visTilbud(true, id);
        };
        P.tagTilbud = function () {
            var id = this.tilbudFor;
            this.visTilbud(false);
            return v.medId ? start.call(this, id, true) : start.call(this, true);
        };
        P.afvisTilbud = function () {
            if (!this.tilbudVises) return false;
            v.husk.call(this, this.tilbudFor);
            this.visTilbud(false);
            return true;
        };
        /* Faneskift: tilbuddet skjules uden at blive husket */
        P.skjulTilbud = function () { this.visTilbud(false); };
        if (v.esc && P[v.esc]) {
            var esc = P[v.esc];
            P[v.esc] = function () {
                if (this.afvisTilbud()) return true;
                return esc.apply(this, arguments);
            };
        }
    }

    NK.Praesentation = { kobl: kobl, pakInd: pakInd };
}());
