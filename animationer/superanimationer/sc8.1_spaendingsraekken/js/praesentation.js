/* =====================================================================
   praesentation.js - Kemichaels praesentation: tilbuddet, trinnene og
   den gule ramme

   Foerste gang en fane aabnes i en browser, kommer Kemichael ikke af sig
   selv. Midt foroven i scenen staar to knapper: "Start praesentation" og
   "Nej tak". Saa kan eleven kigge sig omkring foerst og selv vaelge,
   hvornaar han skal tale, eller sige nej.

   Valget huskes i browseren under fanens noegle. Tilbuddet forsvinder
   ogsaa, naar eleven har gjort noget paa fanen (fanen kalder
   afvisTilbud), for saa er eleven kommet i gang. K viser praesentationen
   igen uden at spoerge.

   Praesentationen gaar ét trin ad gangen (brugerens oenske 3. okt. 2026):
   Kemichael siger én ting og bliver staaende med taleboblen, til eleven
   trykker "Naeste". Boblen er et HTML-element oven paa scenen, saa intet
   i tegningen kan daekke den, og knapperne Naeste og Spring over staar
   i den. Den staar over hans hoved eller ved siden af det: den plads,
   der ikke daekker det, han peger paa. Det, han peger paa, faar en gul
   ramme, der blinker (NK.Fremhaev). Trinnene staar i js/data.js
   (D.INTRO_*): en tekst og en CSS-selector for det, der skal blinke.
   Selve figuren styres i js/laerer.js (laererIntro, introNaeste,
   introStatus, introHoved).

   Brug: NK.Praesentation.kobl(Prototype, { noegle, tilbud, spring })
         og kald this.bygTilbud() fra fanens konstruktoer. spring er id
         paa taleboblen med Naeste og Spring over.
         En aeldre animation med sin egen startIntro bruger i stedet
         NK.Praesentation.pakInd (se nederst), kaldt fra js/app.js.

   Filen bygger paa den faelles praesentation.js fra sc1.2. Trinnene med
   Naeste og rammen er nye her og er moensteret for andre praesentationer
   (se ../kemichael/README.md).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* ----- Den gule ramme --------------------------------------------------
       Om det, Kemichael peger paa. Rammerne ligger oven paa siden
       (position: fixed), fanger ingen klik og skal fornyes hvert billede.
       Kommer der ikke et nyt kald i 0,2 s (fx fordi fanen er skiftet),
       forsvinder de af sig selv. Samme kode som i sc2.2. */
    NK.Fremhaev = (function () {
        var rammer = [], sidst = 0, vagt = false;
        function ramme(i) {
            if (!rammer[i]) {
                var e = document.createElement("div");
                e.className = "fremhaev-ramme";
                e.setAttribute("aria-hidden", "true");
                e.hidden = true;
                document.body.appendChild(e);
                rammer[i] = e;
            }
            return rammer[i];
        }
        function skjul() { rammer.forEach(function (e) { e.hidden = true; }); }
        function tjek() {
            if (window.performance.now() - sidst > 200) { skjul(); vagt = false; return; }
            window.requestAnimationFrame(tjek);
        }
        function vis(liste) {
            liste = (liste || []).filter(function (r) { return r && r.b > 0 && r.h > 0; });
            var i;
            for (i = 0; i < liste.length; i++) {
                var e = ramme(i), r = liste[i], p = 5;
                e.style.left = (r.x - p) + "px";
                e.style.top = (r.y - p) + "px";
                e.style.width = (r.b + 2 * p) + "px";
                e.style.height = (r.h + 2 * p) + "px";
                e.hidden = false;
            }
            for (; i < rammer.length; i++) rammer[i].hidden = true;
            sidst = window.performance.now();
            if (!vagt) { vagt = true; window.requestAnimationFrame(tjek); }
        }
        function synlige() {
            return rammer.filter(function (e) { return !e.hidden; }).map(function (e) { return e.getBoundingClientRect(); });
        }
        return { vis: vis, skjul: skjul, synlige: synlige };
    }());

    /* Den samlede kasse om alt synligt, en selector rammer, i sidens
       pixels: { x, y, b, h }. Intet synligt: null. */
    function rekt(sel) {
        if (!sel) return null;
        var liste = document.querySelectorAll(sel);
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (var i = 0; i < liste.length; i++) {
            var r = liste[i].getBoundingClientRect();
            if (!r.width && !r.height) continue;
            x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top);
            x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom);
        }
        return x1 > x0 ? { x: x0, y: y0, b: x1 - x0, h: y1 - y0 } : null;
    }

    function kobl(P, v) {
        P.bygTilbud = function () {
            var mig = this, boks = NK.el(v.tilbud);
            if (!boks) return;
            boks.querySelector(".tilbud-start").addEventListener("click", function () { mig.tagTilbud(); });
            boks.querySelector(".tilbud-nej").addEventListener("click", function () { mig.afvisTilbud(); });
            this.tilbudVises = false;
            var linje = NK.el(v.spring);
            linje.querySelector(".intro-naeste").addEventListener("click", function () { if (mig.introNaeste) mig.introNaeste(); });
            linje.querySelector(".intro-spring").addEventListener("click", function () { mig.springIntro(); });
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

        /* Nej tak, Esc eller foerste gang eleven goer noget paa fanen */
        P.afvisTilbud = function () {
            if (!this.tilbudVises) return false;
            NK.gem(v.noegle, true);
            this.visTilbud(false);
            if (this.fokus) this.fokus();
            return true;
        };

        /* Esc og Spring over: foerst tilbuddet, saa praesentationen */
        P.springIntro = function () {
            if (this.afvisTilbud()) return true;
            this.introVent = 0;
            return !!(this.laererIntroVaek && this.laererIntroVaek());
        };

        /* Hvert billede: taleboblen med Naeste ved hans hoved, og rammen
           om det, han peger paa */
        P.opdaterIntro = function (dt) {
            if (this.introVent > 0) {
                this.introVent -= dt;
                if (this.introVent <= 0 && this.laererIntro) this.laererIntro();
            }
            var st = this.introStatus ? this.introStatus() : null;
            var vis = !!st;
            var boble = NK.el(v.spring);
            if (vis !== this.visesSpring) {
                this.visesSpring = vis;
                boble.hidden = !vis;
                if (!vis) { NK.Fremhaev.skjul(); this.introVist = ""; }
            }
            if (!st) return;
            var noegle = st.nr + "/" + st.antal;
            if (noegle !== this.introVist) {
                this.introVist = noegle;
                boble.querySelector(".intro-tekst").textContent = st.tekst;
                boble.querySelector(".intro-tal").textContent = (st.nr + 1) + "/" + st.antal;
                boble.querySelector(".intro-naeste").innerHTML = st.nr >= st.antal - 1 ? "Afslut <span>✓</span>" : "Næste <span>→</span>";
            }
            var r = rekt(st.sel);
            if (r) NK.Fremhaev.vis([r]);
            else NK.Fremhaev.skjul();
            var hoved = this.introHoved ? this.introHoved() : null;
            if (hoved) plasserBoble(boble, hoved, r);
        };
    }

    /* Hvor meget to kasser { x, y, b, h } daekker hinanden (areal) */
    function faelles(a, c) {
        var b = Math.min(a.x + a.b, c.x + c.b) - Math.max(a.x, c.x);
        var h = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
        return b > 0 && h > 0 ? b * h : 0;
    }

    /* Taleboblen har tre pladser: over hans hoved, over hovedet helt
       ude ved scenens venstre kant og til hoejre for hovedet. Den plads
       vinder, der daekker mindst af det, han peger paa (maal, i sidens
       pixels) og af hans eget ansigt; staar de lige, vinder den foerste.
       hoved: { x, top, bund, venstre, hoejre, mund } i scenens pixels. */
    function plasserBoble(boble, hoved, maal) {
        var scene = boble.parentNode, s = scene.getBoundingClientRect();
        var W = scene.clientWidth, H = scene.clientHeight - 54;      /* linjen under scenen */
        var bb = boble.offsetWidth, bh = boble.offsetHeight;
        var m = maal ? { x: maal.x - s.left, y: maal.y - s.top, b: maal.b, h: maal.h } : null;
        var ansigt = { x: hoved.venstre, y: hoved.top, b: hoved.hoejre - hoved.venstre, h: hoved.bund - hoved.top };
        var overY = Math.max(6, hoved.top - 18 - bh);
        var pladser = [
            { x: NK.klamp(hoved.x - 70, 8, Math.max(8, W - bb - 8)), y: overY, siden: false },
            { x: 8, y: overY, siden: false },
            { x: hoved.hoejre + 20, y: NK.klamp(hoved.mund - bh / 2, 6, Math.max(6, H - bh - 6)), siden: true }
        ];
        var valg = null, bedst = Infinity;
        pladser.forEach(function (k) {
            if (k.x + bb > W - 4) return;
            var kasse = { x: k.x, y: k.y, b: bb, h: bh };
            var daekker = (m ? faelles(kasse, m) : 0) + 3 * faelles(kasse, ansigt);
            if (daekker < bedst - 1) { bedst = daekker; valg = k; }
        });
        if (!valg) valg = pladser[0];
        boble.style.left = Math.round(valg.x) + "px";
        boble.style.top = Math.round(valg.y) + "px";
        boble.classList.toggle("ved-siden", valg.siden);
        var hale = valg.siden ? NK.klamp(hoved.mund - valg.y, 18, bh - 18) : NK.klamp(hoved.x + 26 - valg.x, 22, bb - 22);
        boble.style.setProperty("--hale", Math.round(hale) + "px");
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

    NK.Praesentation = { kobl: kobl, pakInd: pakInd, rekt: rekt };
}());
