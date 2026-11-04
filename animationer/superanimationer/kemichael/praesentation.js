/* =====================================================================
   kemichael/praesentation.js - Kemichaels praesentation i alle
   superanimationer: tilbuddet, trinnene med Naeste og den gule ramme

   Brugerens oenske 4. nov. 2026: Kemichael taler formelt (som Kemibogen),
   siger mere ad gangen og gaar foerst videre, naar eleven trykker. Taleboblen
   har to knapper: "Naeste" (paa sidste trin "Afslut") og "Spring
   praesentationen over". Filen er faelles, saa boblen, knapperne og rammen
   er ens i alle animationer og kun rettes her.

   Indlaeses i index.html foer fanernes egne filer:
     <link rel="stylesheet" href="../kemichael/praesentation.css">
     <script src="../kemichael/praesentation.js"></script>

   Tre dele:

   1. NK.Praesentation.trin(P, valg)  (kaldes i js/laerer.js efter K.paa)
      Laegger praesentationen paa en fanes prototype: laererIntro,
      introNaeste, introStatus, introHoved, laererIntroKlik,
      laererIntroVaek, laererIIntro og introOpdaterBoble. Fanen skal have
      introLinjer() med trinnene, this.L (laerredet med .canvas),
      laererLaerredSkala() og laererPlads(). Et trin er
        { tekst: "To til fire hele saetninger.",
          sel:  "#css-selector" eller en liste af dem,
          felt: "navn" eller en liste af navne }
      sel peger paa noget paa siden (panelet, kortet, en knap). felt peger
      paa noget, der er tegnet paa laerredet: fanen svarer med
      introFelt(navn) -> { x, y, b, h } i laerredets pixels. Alt, trinnet
      peger paa, faar en gul ramme, der blinker, og armen peger paa det
      foerste (felterne foer selectorerne).
      Taleboblen bygges af sig selv i scenen (laerredets foraelder) med id
      valg.boble eller "<laerredets id>-boble". valg.plads (this = fanen)
      giver en egen plads under praesentationen i figurens enheder;
      ellers staar han ved laererPlads(). Under praesentationen
      tegnes laerredets egen taleboble ikke, andre replikker venter, og
      kaffen kan ikke drikkes. Enter og pil til hoejre er Naeste, Esc
      springer over.

   2. NK.Praesentation.kobl(P, { noegle, tilbud })   (fanerne)
      Tilbuddet "Start praesentation" / "Nej tak" foerste gang en fane
      aabnes. Kald this.bygTilbud() fra fanens konstruktoer og
      this.opdaterIntro(dt) hvert billede.

   3. NK.Praesentation.pakInd(P, v)   (de aeldre med egen startIntro)
      Uaendret fra den gamle faelles fil; se kommentaren nederst.

   NK.Fremhaev.vis([rekt]) og NK.Praesentation.rekt(sel) kan ogsaa bruges
   af rundvisningen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK = window.NK || {};

    var TEKST = {
        naeste: "Næste",
        afslut: "Afslut",
        spring: "Spring præsentationen over"
    };

    function el(id) { return document.getElementById(id); }
    function klamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    /* ----- Den gule ramme --------------------------------------------------
       Om det, Kemichael peger paa. Rammerne ligger oven paa siden
       (position: fixed), fanger ingen klik og skal fornyes hvert billede.
       Kommer der ikke et nyt kald i 0,25 s (fx fordi fanen er skiftet),
       forsvinder de af sig selv. */
    NK.Fremhaev = (function () {
        var rammer = [], sidst = 0, vagt = false;
        function ramme(i) {
            if (!rammer[i]) {
                var e = document.createElement("div");
                e.className = "km-ramme";
                e.setAttribute("aria-hidden", "true");
                e.hidden = true;
                document.body.appendChild(e);
                rammer[i] = e;
            }
            return rammer[i];
        }
        function skjul() { rammer.forEach(function (e) { e.hidden = true; }); }
        function tjek() {
            if (window.performance.now() - sidst > 250) { skjul(); vagt = false; return; }
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

    /* Det, et trin peger paa, i sidens pixels: felterne paa laerredet
       foerst, saa selectorerne */
    function maalAf(sim, linje) {
        var ud = [];
        if (!linje) return ud;
        var felter = linje.felt ? [].concat(linje.felt) : [];
        if (felter.length && sim.introFelt && sim.L && sim.L.canvas) {
            var c = sim.L.canvas.getBoundingClientRect();
            felter.forEach(function (navn) {
                var r = sim.introFelt(navn);
                if (r && r.b > 0 && r.h > 0) ud.push({ x: c.left + r.x, y: c.top + r.y, b: r.b, h: r.h });
            });
        }
        (linje.sel ? [].concat(linje.sel) : []).forEach(function (s) {
            var r = rekt(s);
            if (r) ud.push(r);
        });
        return ud;
    }

    /* Hvor meget to kasser { x, y, b, h } daekker hinanden (areal) */
    function faelles(a, c) {
        var b = Math.min(a.x + a.b, c.x + c.b) - Math.max(a.x, c.x);
        var h = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
        return b > 0 && h > 0 ? b * h : 0;
    }

    /* Taleboblen staar ved hans hoved: over det, til hoejre eller til
       venstre for det, eller oppe i et af scenens hjoerner. Den plads
       vinder, der daekker den mindste del af det, han peger paa, og af
       hans eget ansigt (maalt som andel af hvert maal, saa et stort maal
       som hele braettet ikke jager boblen op i hjoernet); staar de lige,
       vinder den foerste. Hjoernerne vinder kun, naar pladserne ved
       hovedet daekker over en tiendedel af et maal. Halen peger mod munden.
       hoved: { x, top, bund, venstre, hoejre, mund } i scenens pixels. */
    function plasserBoble(boble, hoved, maal) {
        var scene = boble.parentNode, s = scene.getBoundingClientRect();
        var W = scene.clientWidth, H = scene.clientHeight;
        var bb = boble.offsetWidth, bh = boble.offsetHeight;
        var m = maal.map(function (r) { return { x: r.x - s.left, y: r.y - s.top, b: r.b, h: r.h }; });
        var ansigt = { x: hoved.venstre, y: hoved.top, b: hoved.hoejre - hoved.venstre, h: hoved.bund - hoved.top };
        var overY = Math.max(8, hoved.top - 18 - bh);
        var sideY = klamp(hoved.mund - bh / 2, 8, Math.max(8, H - bh - 8));
        var pladser = [
            { x: klamp(hoved.x - 70, 8, Math.max(8, W - bb - 8)), y: overY, hale: "ned" },
            { x: hoved.hoejre + 20, y: sideY, hale: "venstre" },
            { x: hoved.venstre - 20 - bb, y: sideY, hale: "hoejre" },
            { x: 8, y: 8, hale: "ingen" },
            { x: W - bb - 8, y: 8, hale: "ingen" }
        ];
        var valg = null, bedst = Infinity;
        function andel(kasse, r) { return r.b > 0 && r.h > 0 ? faelles(kasse, r) / (r.b * r.h) : 0; }
        pladser.forEach(function (k) {
            if (k.x < 4 || k.x + bb > W - 4) return;
            var kasse = { x: k.x, y: k.y, b: bb, h: bh };
            var daekker = 3 * andel(kasse, ansigt);
            m.forEach(function (r) { daekker += andel(kasse, r); });
            if (k.hale === "ingen") daekker += 0.1;              /* hellere ved hovedet */
            if (daekker < bedst - 0.001) { bedst = daekker; valg = k; }
        });
        if (!valg) valg = pladser[0];
        boble.style.left = Math.round(valg.x) + "px";
        boble.style.top = Math.round(valg.y) + "px";
        boble.setAttribute("data-hale", valg.hale);
        var hale = valg.hale === "ned" ? klamp(hoved.x + 26 - valg.x, 22, bb - 22) : klamp(hoved.mund - valg.y, 18, bh - 18);
        boble.style.setProperty("--hale", Math.round(hale) + "px");
    }

    /* ----- Taleboblen ---------------------------------------------------------
       Bygges i scenen foerste gang, en fane praesenterer. Knapperne kalder
       den fane, der praesenterer lige nu (boble.kmSim). */
    function boble(sim) {
        var cv = sim.L && sim.L.canvas;
        if (!cv || !cv.parentNode) return null;
        var id = sim.kmBobleId || ((cv.id || "km") + "-boble");
        var e = el(id);
        if (!e) {
            e = document.createElement("div");
            e.id = id;
            cv.parentNode.appendChild(e);
        }
        if (!e.getAttribute("data-km")) {
            e.setAttribute("data-km", "1");
            e.className = "km-boble";
            e.hidden = true;
            e.setAttribute("role", "dialog");
            e.setAttribute("aria-label", "Kemichaels præsentation");
            e.innerHTML =
                '<p class="km-tekst" aria-live="polite"></p>' +
                '<div class="km-linje">' +
                    '<button class="km-naeste" type="button"></button>' +
                    '<span class="km-tal"></span>' +
                    '<button class="km-spring" type="button">' + TEKST.spring + '</button>' +
                '</div>' +
                '<span class="km-hale" aria-hidden="true"></span>';
            e.querySelector(".km-naeste").addEventListener("click", function () {
                if (e.kmSim) e.kmSim.introNaeste();
            });
            e.querySelector(".km-spring").addEventListener("click", function () {
                var s = e.kmSim;
                if (!s) return;
                if (s.springIntro) s.springIntro(); else s.laererIntroVaek();
            });
            /* Klik i boblen naar ikke scenen bagved */
            ["pointerdown", "mousedown", "touchstart", "click"].forEach(function (t) {
                e.addEventListener(t, function (ev) { ev.stopPropagation(); });
            });
        }
        e.kmSim = sim;
        return e;
    }

    /* ----- De faner, der praesenterer lige nu ---------------------------------
       Boblen og rammen opdateres hvert billede, saa laenge en praesentation
       staar, ogsaa paa en fane, eleven har forladt midt i den. Tasterne
       gaar til den praesentation, eleven kan se, og fanges, foer
       animationens egne taster faar dem, saa Enter ikke ogsaa indsender
       et svar. */
    var iIntro = [], loekke = false;

    function koer() {
        iIntro = iIntro.filter(function (s) { return !!s.kmIntro; });
        if (!iIntro.length) { loekke = false; return; }
        iIntro.forEach(function (s) { s.introOpdaterBoble(); });
        window.requestAnimationFrame(koer);
    }

    function startLoekke(sim) {
        if (iIntro.indexOf(sim) < 0) iIntro.push(sim);
        if (!loekke) { loekke = true; window.requestAnimationFrame(koer); }
    }

    function synligSim() {
        for (var i = iIntro.length - 1; i >= 0; i--) {
            var s = iIntro[i], b = el(s.kmBobleAktiv);
            if (s.kmIntro && s.kmIntro.nr >= 0 && b && !b.hidden && b.offsetParent) return s;
        }
        return null;
    }

    window.addEventListener("keydown", function (e) {
        var sim = synligSim();
        if (!sim) return;
        var maal = e.target && e.target.tagName;
        var felt = maal === "INPUT" || maal === "TEXTAREA" || maal === "SELECT";
        if (e.key === "Escape") {
            if (sim.springIntro) sim.springIntro(); else sim.laererIntroVaek();
        } else if ((e.key === "ArrowRight" && !felt) || (e.key === "Enter" && maal !== "BUTTON" && maal !== "TEXTAREA")) {
            /* Enter er Naeste, ogsaa naar markoeren staar i et svarfelt */
            sim.introNaeste();
        } else {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
    }, true);

    /* ----- 1. Praesentationen paa en fanes prototype -------------------------- */
    function trin(P, valg) {
        valg = valg || {};
        var K = NK.Kemichael;
        if (!K) return;
        var UDE = K.UDE, HAENGER = K.HAENGER;
        var NED = 1.85;      /* armen skraat ned foran kroppen: maalet staar lige ved ham */
        if (valg.boble) P.kmBobleId = valg.boble;

        function skala(sim) { return sim.laererLaerredSkala ? sim.laererLaerredSkala() : 1; }

        /* Midten af en kasse i sidens pixels, i figurens enheder */
        function punkt(sim, r) {
            var c = sim.L.canvas.getBoundingClientRect(), s = skala(sim);
            return { x: (r.x + r.b / 2 - c.left) / s, y: (r.y + r.h / 2 - c.top) / s };
        }

        /* Laerredets taleboble tegnes ikke under praesentationen */
        var tegnBoble = P.tegnLaererBoble;
        if (tegnBoble) {
            P.tegnLaererBoble = function () {
                if (this.kmIntro) return;
                return tegnBoble.apply(this, arguments);
            };
        }

        /* Andre replikker (ros, glimt, paaskeaeg) venter, til han er
           faerdig: den sidste, der kom under praesentationen, siger han,
           naar eleven trykker Afslut eller springer over */
        var koerScene = P.laererKoer;
        P.laererKoer = function (navn) {
            if (this.kmIntro && navn !== "intro" && navn !== "introUd") {
                this.kmVenter = Array.prototype.slice.call(arguments);
                return;
            }
            return koerScene.apply(this, arguments);
        };

        /* Et klik i taleboblen er aldrig et klik paa ham, ogsaa naar
           animationen fanger klik paa ham med en lytter hoejere oppe
           (px, py i laerredets pixels) */
        var under = P.laererUnder;
        if (under) {
            P.laererUnder = function (px, py) {
                if (this.kmIntro && this.L && this.L.canvas) {
                    var b = el(this.kmBobleAktiv);
                    if (b && !b.hidden) {
                        var c = this.L.canvas.getBoundingClientRect(), r = b.getBoundingClientRect();
                        var x = c.left + px, y = c.top + py;
                        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return false;
                    }
                }
                return under.apply(this, arguments);
            };
        }

        /* Kaffen er ikke med i praesentationen */
        var klikKop = P.klikKop;
        if (klikKop) {
            P.klikKop = function () {
                if (this.kmIntro) return false;
                return klikKop.apply(this, arguments);
            };
        }

        P.laererIntro = function () {
            if (!this.laerer || !this.introLinjer || !this.introLinjer().length) return;
            var sim = this, L = this.laerer;
            this.kmIntro = { nr: -1, antal: this.introLinjer().length };
            /* Eleven har bedt om den: en replik, der staar endnu, viger straks */
            L.tale = "";
            L.taleUr = 0;
            L.taleAlfa = 0;
            this.laererKoer("intro", [
                { udtryk: { vrede: 0, humoer: 0.3, roed: 0, skeptisk: 0, briller: 0 } },
                { gaa: function () { return valg.plads ? valg.plads.call(sim) : sim.laererPlads(); } },
                { tid: 0.15 },
                { kald: function () { sim.introVis(0); } }
            ], false);
            startLoekke(this);
        };

        /* Trin n: munden gaar, teksten staar i boblen, og armen gaar hen
           mod det, der blinker */
        P.introVis = function (n) {
            var L = this.laerer, linje = this.introLinjer()[n], sim = this;
            if (!L || !linje || !this.kmIntro) return;
            this.kmIntro.nr = n;
            L.taleUr = 0;
            this.laererKoer("intro", [
                { sig: linje.tekst, vis: 2, tid: 0.05 },
                {
                    arm: function () {
                        var maal = maalAf(sim, linje);
                        var p = maal.length ? punkt(sim, maal[0]) : null;
                        /* En fane kan selv bestemme armen: introArm(punkt, linje)
                           (punkt i figurens enheder eller null) giver vinklen */
                        if (sim.introArm) return sim.introArm(p, linje);
                        L.hovedMaal = p ? sim.kigVinkel(p.x) : 0;
                        if (!p) return HAENGER;
                        return p.x < sim.laererSkulder().x + 90 ? NED : sim.pegVinkel(p.x, p.y);
                    },
                    tid: 0.35
                }
            ], false);
        };

        /* Naeste, Enter og pil til hoejre. Efter det sidste trin gaar han. */
        P.introNaeste = function () {
            var i = this.kmIntro;
            if (!i || i.nr < 0) return false;
            if (i.nr >= i.antal - 1) return this.laererIntroVaek(true);
            this.introVis(i.nr + 1);
            return true;
        };

        /* Hvilket trin, teksten og det, der skal blinke */
        P.introStatus = function () {
            var i = this.kmIntro;
            if (!i || i.nr < 0) return null;
            var linje = this.introLinjer()[i.nr];
            return { nr: i.nr, antal: i.antal, tekst: linje.tekst, sel: linje.sel || null, felt: linje.felt || null };
        };

        /* Hans hoved i laerredets pixels: midten, kassen om hovedet og
           munden (hovedet er 110 x 130 enheder, issen 116 over halsen og
           munden 97 under issen). En animation, der tegner ham forskudt,
           skriver sin egen introHoved efter kaldet. */
        P.introHoved = function () {
            if (!this.laerer) return null;
            var s = skala(this), krop = this.laererKrop();
            return {
                x: krop.x * s, top: (krop.y - 116) * s, bund: (krop.y + 14) * s,
                venstre: (krop.x - 58) * s, hoejre: (krop.x + 58) * s, mund: (krop.y - 19) * s
            };
        };

        /* Hvert billede: teksten, knappen, rammen og pladsen ved hovedet */
        P.introOpdaterBoble = function () {
            var b = boble(this);
            if (!b) return;
            this.kmBobleAktiv = b.id;
            var st = this.introStatus();
            var synlig = !!this.L.canvas.offsetParent;
            if (!st || !synlig) {
                if (!b.hidden) { b.hidden = true; b.kmVist = ""; }
                if (!st) NK.Fremhaev.skjul();
                return;
            }
            b.hidden = false;
            var noegle = st.nr + "/" + st.antal;
            if (b.kmVist !== noegle) {
                b.kmVist = noegle;
                b.querySelector(".km-tekst").textContent = st.tekst;
                b.querySelector(".km-tal").textContent = (st.nr + 1) + "/" + st.antal;
                b.querySelector(".km-naeste").innerHTML = st.nr >= st.antal - 1
                    ? TEKST.afslut + " <span>✓</span>" : TEKST.naeste + " <span>→</span>";
            }
            var maal = maalAf(this, st);
            if (maal.length) NK.Fremhaev.vis(maal); else NK.Fremhaev.skjul();
            var hoved = this.introHoved();
            if (hoved) plasserBoble(b, hoved, maal);
        };

        /* Et klik paa ham under praesentationen viser, hvor Naeste er */
        P.laererIntroKlik = function (px, py) {
            if (!this.kmIntro || !this.laererUnder || !this.laererUnder(px, py)) return false;
            var b = boble(this), k = b && b.querySelector(".km-naeste");
            if (k) {
                k.classList.remove("puf");
                void k.offsetWidth;
                k.classList.add("puf");
            }
            return true;
        };

        /* Spring over, Esc eller Afslut (rolig: han gaar, ellers loeber han) */
        P.laererIntroVaek = function (rolig) {
            var L = this.laerer;
            if (!L || !this.kmIntro) return false;
            this.kmIntro = null;
            L.tale = "";
            L.taleUr = 0;
            L.taleAlfa = 0;
            L.hovedMaal = 0;
            this.introOpdaterBoble();
            var venter = this.kmVenter;
            this.kmVenter = null;
            if (venter) {
                /* En replik ventede: han bliver og siger den (scenen slutter selv med at gaa) */
                koerScene.apply(this, venter);
            } else {
                this.laererKoer("introUd", [
                    { arm: HAENGER, tid: 0.15 },
                    { udtryk: { skeptisk: 0, humoer: 0 } },
                    { gaa: UDE, loeb: !rolig }
                ], false);
            }
            if (this.fokus) this.fokus();
            return true;
        };

        P.laererIIntro = function () { return !!this.kmIntro; };
    }

    /* ----- 2. Tilbuddet paa fanerne ------------------------------------------- */
    function kobl(P, v) {
        P.bygTilbud = function () {
            var mig = this, boks = el(v.tilbud);
            if (!boks) return;
            boks.querySelector(".tilbud-start").addEventListener("click", function () { mig.tagTilbud(); });
            boks.querySelector(".tilbud-nej").addEventListener("click", function () { mig.afvisTilbud(); });
            this.tilbudVises = false;
        };

        P.visTilbud = function (vis) {
            this.tilbudVises = !!vis;
            var boks = el(v.tilbud);
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

        /* Esc og Spring praesentationen over: foerst tilbuddet, saa praesentationen */
        P.springIntro = function () {
            if (this.afvisTilbud()) return true;
            this.introVent = 0;
            return !!(this.laererIntroVaek && this.laererIntroVaek());
        };

        /* Hvert billede fra fanen: ventetiden og boblen */
        P.opdaterIntro = function (dt) {
            if (this.introVent > 0) {
                this.introVent -= dt;
                if (this.introVent <= 0 && this.laererIntro) this.laererIntro();
            }
            if (this.introOpdaterBoble && (this.kmIntro || this.kmBobleAktiv)) this.introOpdaterBoble();
        };
    }

    /* ----- 3. Til de aeldre animationer ------------------------------------
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
            return el(typeof v.tilbud === "function" ? v.tilbud.call(mig, id) : v.tilbud);
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

    /* ----- Til selvtestene ------------------------------------------------------
       NK.Praesentation.selvtest(sim, koer) koerer praesentationen igennem
       paa en fane, der vises, og giver en liste af [paastand, ok, note].
       koer(sek) skal lade fanens tid gaa (selvtestens koerTid). Den
       tjekker ogsaa teksterne: to til fem trin, hele saetninger, der
       slutter med punktum, og ingen linje, der begynder med "Her". */
    function selvtest(sim, koer, start) {
        var ud = [];
        /* start(): starter praesentationen straks (som tasten K). Uden den
           kaldes sim.startIntro(true); de aeldre med pakInd og medId giver
           fx function () { sim.startIntro(id, true); }. */
        start = start || function () { sim.startIntro(true); };
        function p(navn, ok, note) { ud.push([navn, !!ok, note === undefined ? "" : String(note)]); }
        /* Trinnene laeses, efter praesentationen er startet, for en laerer
           med flere praesentationer vaelger dem ved start (introId) */
        start();
        koer(0.05);
        var linjer = sim.introLinjer ? sim.introLinjer() : [];
        p("der er 2 til 5 trin", linjer.length >= 2 && linjer.length <= 5, linjer.length);
        var sprogOk = true, sprogNote = "";
        linjer.forEach(function (l, i) {
            var t = l.tekst || "";
            if (!/[.?]$/.test(t) || /^Her\b/.test(t) || t.length < 50 || t.length > 420 || /\s[-–—]\s/.test(t)) {
                sprogOk = false; sprogNote = "trin " + (i + 1) + ": " + t.slice(0, 60);
            }
        });
        p("teksterne er hele saetninger (50-420 tegn, punktum, ikke 'Her ...')", sprogOk, sprogNote);

        var b = boble(sim);
        p("boblen vises ikke, foer han staar der", !b || b.hidden);
        /* Han gaar ind; vent, til han staar (hoejst 8 s) */
        for (var vent = 0; vent < 8 && !(sim.introStatus() && sim.introStatus().nr === 0); vent += 0.25) koer(0.25);
        koer(0.3);
        b = boble(sim);
        var st = sim.introStatus();
        p("praesentationen staar paa trin 1 med Naeste og Spring praesentationen over",
            sim.laererIIntro() && !!st && st.nr === 0 && b && !b.hidden &&
            window.getComputedStyle(b).display !== "none" &&
            b.querySelector(".km-tekst").textContent === linjer[0].tekst &&
            /Næste/.test(b.querySelector(".km-naeste").textContent) &&
            b.querySelector(".km-spring").textContent === TEKST.spring,
            b ? b.querySelector(".km-tekst").textContent.slice(0, 40) : "ingen boble");
        if (!b) return ud;
        koer(25);
        p("han gaar ikke videre af sig selv (25 s)", sim.laererIIntro() && sim.introStatus().nr === 0 && !b.hidden);
        var sR = b.parentNode.getBoundingClientRect(), bR = b.getBoundingClientRect();
        p("boblen staar inde i scenen", bR.left >= sR.left - 1 && bR.top >= sR.top - 1 && bR.right <= sR.right + 1 && bR.bottom <= sR.bottom + 1);

        var trinOk = true, rammeOk = true, daekOk = true, note = "";
        for (var t = 0; t < linjer.length; t++) {
            if (t > 0) { b.querySelector(".km-naeste").click(); koer(1); }
            sim.introOpdaterBoble();
            var s2 = sim.introStatus();
            if (!s2 || s2.nr !== t || b.querySelector(".km-tekst").textContent !== linjer[t].tekst ||
                    b.querySelector(".km-tal").textContent !== (t + 1) + "/" + linjer.length) { trinOk = false; note = "trin " + (t + 1); }
            var maal = maalAf(sim, linjer[t]), rammer = NK.Fremhaev.synlige();
            var antalMaal = (linjer[t].sel ? [].concat(linjer[t].sel).length : 0) + (linjer[t].felt ? [].concat(linjer[t].felt).length : 0);
            if (maal.length !== antalMaal || rammer.length !== maal.length) {
                rammeOk = false; note = "trin " + (t + 1) + ": " + maal.length + " af " + antalMaal + " maal fundet, " + rammer.length + " rammer";
                continue;
            }
            var br = b.getBoundingClientRect();
            maal.forEach(function (m) {
                var fb = Math.min(br.right, m.x + m.b) - Math.max(br.left, m.x), fh = Math.min(br.bottom, m.y + m.h) - Math.max(br.top, m.y);
                var del = fb > 0 && fh > 0 ? fb * fh / (m.b * m.h) : 0;
                if (del > 0.25) { daekOk = false; note = "trin " + (t + 1) + ": boblen daekker " + Math.round(del * 100) + " % af et maal"; }
            });
        }
        p("Naeste viser de " + linjer.length + " trin ét ad gangen", trinOk, note);
        p("alt, han peger paa, findes og har en gul ramme", rammeOk, note);
        p("boblen daekker ikke det, han peger paa", daekOk, note);
        p("sidste trin hedder Afslut", /Afslut/.test(b.querySelector(".km-naeste").textContent));
        b.querySelector(".km-naeste").click();
        koer(3);
        p("Afslut sender ham ud, og boblen og rammen forsvinder",
            !sim.laererIIntro() && b.hidden && NK.Fremhaev.synlige().length === 0, sim.laerer ? Math.round(sim.laerer.x) : "");
        start();
        for (var vent2 = 0; vent2 < 8 && !(sim.introStatus() && sim.introStatus().nr === 0); vent2 += 0.25) koer(0.25);
        b.querySelector(".km-naeste").click();
        koer(0.5);
        var midt = sim.introStatus();
        b.querySelector(".km-spring").click();
        koer(3);
        p("Spring praesentationen over stopper den midt i (trin 2)",
            !!midt && midt.nr === 1 && !sim.laererIIntro() && b.hidden && NK.Fremhaev.synlige().length === 0);
        return ud;
    }

    NK.Praesentation = { trin: trin, kobl: kobl, pakInd: pakInd, rekt: rekt, TEKST: TEKST, selvtest: selvtest };
}());
