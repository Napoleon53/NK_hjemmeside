/* =====================================================================
   laerer.js - Kemichael paa de tre faner

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.

   Hjoernet: han staar nederst i hoejre hjoerne af scenen, hvor der er
   tomt, og ses fra brystet og op. Han gaar ind og ud ad hoejre kant, saa
   han aldrig gaar hen over bordet eller glasset. Taleboblen tegnes her i
   filen (laererTegnBoble), over hans hoved i samme hjoerne og fri af det,
   fanen bruger (laererOptaget). Det, han taler om, faar en gul ramme
   (NK.Fremhaev), saa han ikke skal gaa derhen for at vise det. Eleven kan
   bruge fanen, mens han taler.

   Skalaen foelger laerredets hoejde (laererLaerredSkala). Kitlen stopper
   ved gulvet (NK.Scene.GULV): laerredets bund, og paa fane 1 oversiden af
   den nederste hylde, saa han staar oven paa den. Figurens egen skala
   (laererSkala) roeres ikke.

   Hver fane kobles paa for sig og skal have:
     this.tid               et ur, der altid gaar (sekunder)
     this.L                 laerredet
     laererOptaget()        rektangler { x, y, b, h } i laerredets pixels,
                            som boblen holder sig fri af
     laererMaalRekt(navn)   rammerne til et navn i D.INTRO[fane].maal: en
                            liste af rektangler i sidens pixels
     laererGulvPx()         (kan undlades) gulvet i laerredets pixels

   Scener:
     intro      naar eleven har sagt ja til praesentationen: tre eller
                fire korte replikker (D.INTRO), hver med sin gule ramme.
                Scenen laaser ikke, og han gaar ved knappen Spring over,
                to klik paa ham eller Esc.
     visStart   fane 3, "Start opgave": ramme om den ion, eleven kender,
                og "Start med O."
     ros        fane 3, hver tredje opgave, eleven loeser selv.
   Han forklarer ikke teori. Den staar i hintene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });

    var UDE = K.UDE, HAENGER = K.HAENGER;

    var SKALA = 0.55;       /* gange laerredets hoejde / 600 (sc2.3 bruger 0,92) */
    var BRYST = 150;        /* saa meget af kitlen, der ses under halsen, i enheder */
    var ISSE = 118;         /* fra halsen op til issen, i enheder */
    var HOEJRE = 112;       /* fra midten til hoejre side af figuren, i enheder */
    var KANT = 12;          /* luft til laerredets hoejre kant, i pixels */

    var BOBLE = {
        font: "700 15px 'Segoe UI', sans-serif",
        linje: 20, polX: 12, polY: 8, radius: 11,
        bred: 260,          /* tekstens bredde, foer der brydes */
        smal: 130,          /* smallest, hvis noget staar i vejen */
        kant: 10,           /* til laerredets kant */
        luft: 8             /* til det, der skal holdes fri */
    };

    function snit(a, b) {
        return a.x < b.x + b.b && b.x < a.x + a.b && a.y < b.y + b.h && b.y < a.y + a.h;
    }

    function udvid(r, d) { return { x: r.x - d, y: r.y - d, b: r.b + 2 * d, h: r.h + 2 * d }; }

    /* Replikken brudt i linjer, der hver er hoejst maks bred */
    function brud(ctx, tekst, maks) {
        ctx.font = BOBLE.font;
        var ord = tekst.split(" "), linjer = [], nu = "";
        for (var i = 0; i < ord.length; i++) {
            var proev = nu ? nu + " " + ord[i] : ord[i];
            if (nu && ctx.measureText(proev).width > maks) { linjer.push(nu); nu = ord[i]; }
            else nu = proev;
        }
        if (nu) linjer.push(nu);
        var bred = 0;
        linjer.forEach(function (l) { bred = Math.max(bred, ctx.measureText(l).width); });
        return { linjer: linjer, b: Math.ceil(bred) + 2 * BOBLE.polX, h: linjer.length * BOBLE.linje + 2 * BOBLE.polY };
    }

    /* Et element paa siden som rektangel i sidens pixels; null, hvis det
       ikke ses. tekst: kun selve teksten, ikke hele linjens bredde. */
    function elRekt(e, tekst) {
        if (!e) return null;
        var r;
        if (tekst) {
            var rng = document.createRange();
            rng.selectNodeContents(e);
            r = rng.getBoundingClientRect();
        } else {
            r = e.getBoundingClientRect();
        }
        return r.width > 0 && r.height > 0 ? { x: r.left, y: r.top, b: r.width, h: r.height } : null;
    }

    /* Det, der samlet fylder i et element (fx hylden, der gaar fra kant
       til kant, men kun har ioner paa midten) */
    function omkreds(e) {
        if (!e) return null;
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (var i = 0; i < e.children.length; i++) {
            var r = e.children[i].getBoundingClientRect();
            if (!r.width) continue;
            x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top);
            x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom);
        }
        return x1 > x0 ? { x: x0, y: y0, b: x1 - x0, h: y1 - y0 } : null;
    }

    /* ----- Den gule ramme --------------------------------------------------
       Om det, Kemichael taler om. Rammerne ligger oven paa siden
       (position: fixed), fanger ingen klik og skal fornyes hvert billede.
       Kommer der ikke et nyt kald i 0,2 s (fx fordi fanen er skiftet),
       forsvinder de af sig selv. */
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

    /* Scenens maal i figurens enheder: laerredet, og gulvet */
    function scenemaal(sim) {
        var s = sim.laererLaerredSkala();
        NK.Scene.BREDDE = sim.L.b / s;
        NK.Scene.HOEJDE = sim.L.h / s;
        NK.Scene.GULV = sim.laererGulv() / s;
        return s;
    }

    function kobl(P, valg) {
        K.paa(P, valg);

        /* Kemichael melder "laerer", naar han har gjort noget. Fanerne,
           der selv har en aendret(), ser bort fra det. */
        if (!P.aendret) P.aendret = function () {};

        P.laererLaerredSkala = function () {
            return NK.klamp(this.L.h / 600 * SKALA, 0.4, 0.8);
        };

        P.laererGulv = function () {
            var g = this.laererGulvPx ? this.laererGulvPx() : NaN;
            return isFinite(g) && g > 0 ? Math.min(g, this.L.h) : this.L.h;
        };

        /* Hvor han staar i hjoernet, i enheder */
        P.laererHjoerneX = function () {
            return (this.L.b - KANT) / this.laererLaerredSkala() - HOEJRE;
        };

        /* Hvert billede: hoejden efter gulvet, ind og ud ad hoejre kant,
           og rammen om det, han taler om. */
        P.opdaterLaererEkstra = function () {
            var L = this.laerer;
            if (!L || !(this.L.h > 0)) return;
            var s = scenemaal(this);
            var ude = this.L.b / s + HOEJRE + 60;
            L.y = this.laererGulv() / s - BRYST;
            /* Figuren kommer ind fra UDE til venstre. Her flyttes han ud
               til hoejre kant, saa han gaar det sidste lille stykke ind. */
            if (L.x < -HOEJRE && L.maalX > -HOEJRE) L.x = ude;
            /* Og gaar ud til hoejre. Derude saettes han paa UDE, som
               figuren regner for ude. */
            if (L.maalX === UDE && L.x > -HOEJRE) { L.maalX = ude; L.udeHoejre = ude; }
            else if (L.udeHoejre !== undefined && L.maalX !== L.udeHoejre) L.udeHoejre = undefined;
            if (L.udeHoejre !== undefined && Math.abs(L.x - L.maalX) < 1) {
                L.x = UDE; L.maalX = UDE; L.udeHoejre = undefined;
            }

            if (!L.scene) this.laererMaal = null;
            var rammer = this.laererMaal ? this.laererRammer(this.laererMaal) : [];
            if (rammer.length) NK.Fremhaev.vis(rammer);
            else if (this.laererRammerVist) NK.Fremhaev.skjul();
            this.laererRammerVist = rammer.length > 0;
        };

        /* maal: et navn (laererMaalRekt) eller en funktion, der giver
           rektanglerne i sidens pixels */
        P.laererRammer = function (maal) {
            var r = typeof maal === "function" ? maal.call(this) : (this.laererMaalRekt ? this.laererMaalRekt(maal) : null);
            return (r || []).filter(Boolean);
        };

        /* Et rektangel i laerredets pixels omregnet til sidens */
        P.laererSide = function (r) {
            if (!r) return null;
            var c = this.L.canvas.getBoundingClientRect();
            return { x: c.left + r.x, y: c.top + r.y, b: r.b, h: r.h };
        };

        /* Han kigger mod maalet. Ligger det til hoejre (panelet), peger
           han ogsaa; til venstre ville armen gaa hen over ansigtet, saa
           der klarer rammen det. Giver armens vinkel. */
        P.laererSeMod = function (maal) {
            var r = maal ? this.laererRammer(maal)[0] : null;
            if (!r) { this.laerer.hovedMaal = 0; return HAENGER; }
            var c = this.L.canvas.getBoundingClientRect();
            var m = this.laererEnheder({ x: r.x + r.b / 2 - c.left, y: r.y + r.h / 2 - c.top });
            this.laerer.hovedMaal = this.kigVinkel(m.x);
            return m.x > this.laererSkulder().x ? this.pegVinkel(m.x, m.y) : HAENGER;
        };

        /* Taleboblen: over hovedet, ude ved hoejre kant. Er den brede
           boble i vejen for noget paa fanen, brydes teksten smallere. */
        P.laererBoblePlads = function (tekst) {
            var L = this.laerer, ctx = this.L.ctx;
            var s = this.laererLaerredSkala();
            var hoejre = this.L.b - BOBLE.kant;
            var hx = L.x * s, htop = (L.y - ISSE) * s;
            var bund = htop - 12;
            var optaget = (this.laererOptaget ? this.laererOptaget() : []).filter(Boolean);
            function plads(maks) {
                var m = brud(ctx, tekst, maks);
                return { x: hoejre - m.b, y: Math.max(6, bund - m.h), b: m.b, h: m.h, linjer: m.linjer };
            }
            function iVejen(r) { return optaget.filter(function (o) { return snit(r, udvid(o, BOBLE.luft)); }); }
            ctx.save();
            var valgt = plads(BOBLE.bred), vej = iVejen(valgt);
            if (vej.length) {
                /* Smallere, saa den holder sig til hoejre for det, der er i vejen */
                var kantX = 0;
                vej.forEach(function (o) { kantX = Math.max(kantX, o.x + o.b); });
                var smal = plads(Math.max(BOBLE.smal, hoejre - kantX - BOBLE.luft - 2 * BOBLE.polX));
                if (smal.b < valgt.b) valgt = smal;
            }
            ctx.restore();
            valgt.haleX = hx - 6;
            valgt.haleY = htop - 2;
            return valgt;
        };

        P.laererTegnBoble = function (ctx) {
            var L = this.laerer;
            if (!L || !L.tale || !(L.taleAlfa > 0.01)) return;
            var r = this.laererBoblePlads(L.tale);
            this.laererBobleSidst = r;
            var fod = NK.klamp(r.haleX, r.x + 18, r.x + r.b - 18);
            ctx.save();
            ctx.globalAlpha = NK.klamp(L.taleAlfa, 0, 1);
            ctx.fillStyle = "#fffdf6";
            ctx.strokeStyle = "#2a2f36";
            ctx.lineWidth = 2;
            NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, BOBLE.radius);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(fod - 7, r.y + r.h - 1);
            ctx.lineTo(r.haleX, r.haleY);
            ctx.lineTo(fod + 7, r.y + r.h - 1);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(fod - 7, r.y + r.h);
            ctx.lineTo(r.haleX, r.haleY);
            ctx.lineTo(fod + 7, r.y + r.h);
            ctx.stroke();
            ctx.font = BOBLE.font;
            ctx.fillStyle = "#1f2328";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            r.linjer.forEach(function (l, i) {
                ctx.fillText(l, r.x + r.b / 2, r.y + BOBLE.polY + BOBLE.linje * (i + 0.5) + 1);
            });
            ctx.restore();
        };

        /* Tegnes til sidst, ovenpaa alt andet paa laerredet: figuren i
           enheder, boblen i pixels. */
        P.laererTegnOver = function (ctx) {
            var L = this.laerer;
            if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
            var s = scenemaal(this);
            ctx.save();
            ctx.scale(s, s);
            this.tegnLaerer(ctx, this.tid, { udenBoble: true });
            ctx.restore();
            this.laererTegnBoble(ctx);
        };

        /* Musen i pixels: er den over laereren? */
        P.laererUnder = function (px, py) {
            if (!this.laerer || !this.overLaerer) return false;
            var s = scenemaal(this);
            return !!this.overLaerer({ x: px / s, y: py / s });
        };

        /* Et klik i pixels: true, hvis det ramte laereren. */
        P.laererKlik = function (px, py) {
            if (!this.laererUnder(px, py)) return false;
            return this.klikLaerer();
        };

        /* Et punkt i laerredets pixels omregnet til figurens enheder. */
        P.laererEnheder = function (p) {
            var s = this.laererLaerredSkala();
            return { x: p.x / s, y: p.y / s };
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* ----- Praesentationen ------------------------------------------------
       tekst: D.INTRO[fane], linjer og maal (hvad der faar ramme om sig,
       mens linjen siges). Han gaar ind i hjoernet og bliver der. */
    function introTrin(sim, tekst) {
        var trin = [
            { kald: function () { sim.introKlikTal = 0; sim.laererMaal = null; } },
            { udtryk: { vrede: 0, humoer: 0.3, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: function () { return this.laererHjoerneX(); } },
            { tid: 0.15 }
        ];
        tekst.linjer.forEach(function (l, i) {
            var maal = tekst.maal ? tekst.maal[i] : null;
            trin.push({ kald: function () { sim.introTrin = i + 1; sim.laererMaal = maal || null; } });
            trin.push({ arm: function () { return this.laererSeMod(maal); }, tid: 0.3 });
            trin.push({ sig: l, vis: replikTid(l), tid: replikTid(l) });
        });
        return trin.concat([
            { taleFaerdig: true },
            { kald: function () { sim.introTrin = 0; sim.laererMaal = null; this.laerer.hovedMaal = 0; } },
            { arm: HAENGER, tid: 0.3 },
            { udtryk: { skeptisk: 0, humoer: 0 } },
            { gaa: UDE }
        ]);
    }

    /* knapId: knappen Spring over paa fanen */
    function introVaek(P, knapId) {
        /* Et klik under praesentationen: rammer det ham, taeller det. Andet
           klik paa ham sender ham ud, det foerste faar knappen til at blinke.
           Klik andre steder gaar videre til fanen som ellers. */
        P.laererIntroKlik = function (px, py) {
            if (!this.laererIIntro() || !this.laererUnder(px, py)) return false;
            this.introKlikTal = (this.introKlikTal || 0) + 1;
            if (this.introKlikTal >= 2) {
                this.laererIntroVaek();
            } else {
                var k = NK.el(knapId);
                k.classList.remove("puf");
                void k.offsetWidth;
                k.classList.add("puf");
            }
            return true;
        };
        P.laererIntroVaek = function () {
            var L = this.laerer;
            if (!L || !L.scene || L.scene.navn !== "intro") return false;
            L.tale = "";
            L.taleUr = 0;
            L.taleAlfa = 0;
            this.introTrin = 0;
            this.laererMaal = null;
            this.laererKoer("introUd", [
                { arm: HAENGER, tid: 0.15 },
                { kald: function () { this.laerer.hovedMaal = 0; } },
                { udtryk: { skeptisk: 0, humoer: 0 } },
                { gaa: UDE, loeb: true }
            ], false);
            return true;
        };
        P.laererIIntro = function () {
            var L = this.laerer;
            return !!(L && L.scene && L.scene.navn === "intro");
        };
    }

    /* Praesentationen paa en fane. startIntro(tving) kaldes ved faneskift
       og med K; foerste gang i browseren, eller altid med tving (js/app.js
       viser tilbuddet i stedet, se js/praesentation.js). opdaterIntro(dt)
       hvert billede: knappen Spring over staar over boblen, og tilbuddet
       staar i hjoernet oven paa gulvet. */
    function praesentation(P, fane, knapId, tilbudId) {
        var noegle = "nk-sc2.2-intro-" + fane;

        P.laererIntro = function () {
            if (!this.laerer) return;
            this.laererKoer("intro", introTrin(this, D.INTRO[fane]), false);
        };
        introVaek(P, knapId);

        P.startIntro = function (tving) {
            if (!this.laererIntro) return;
            if (!tving && NK.hent(noegle, false)) return;
            NK.gem(noegle, true);
            this.introVent = tving ? 0.1 : 0.9;
        };
        P.springIntro = function () {
            this.introVent = 0;
            return !!(this.laererIntroVaek && this.laererIntroVaek());
        };

        /* Knappen staar over den hoejeste af fanens bobler, saa den ikke
           hopper, naar en replik er en linje laengere end den forrige. */
        P.laererPlacerSpring = function (knap) {
            if (!this.laerer || !(this.L.h > 0)) return;
            var mig = this, top = Infinity;
            D.INTRO[fane].linjer.forEach(function (l) { top = Math.min(top, mig.laererBoblePlads(l).y); });
            knap.style.top = Math.max(6, top - knap.offsetHeight - 8) + "px";
            knap.style.right = BOBLE.kant + "px";
        };

        P.opdaterIntro = function (dt) {
            if (this.introVent > 0) {
                this.introVent -= dt;
                if (this.introVent <= 0 && this.laererIntro) this.laererIntro();
            }
            var iIntro = !!(this.laererIIntro && this.laererIIntro());
            var knap = NK.el(knapId);
            if (iIntro !== this.visesSpring) {
                this.visesSpring = iIntro;
                knap.hidden = !iIntro;
            }
            if (iIntro) this.laererPlacerSpring(knap);
            var tilbud = NK.el(tilbudId);
            if (tilbud && !tilbud.hidden && this.L.h > 0) {
                tilbud.style.bottom = Math.round(this.L.h - this.laererGulv() + 12) + "px";
            }
        };
    }

    /* Hjoernet, som bordet og glasset holder fri (NK.Bord.layout og
       NK.SimVand.maal): plads til den smalleste boble, i pixels */
    var HJOERNE = 190;
    if (NK.Bord) NK.Bord.prototype.hjoerne = HJOERNE;
    if (NK.SimVand) NK.SimVand.prototype.hjoerne = HJOERNE;

    /* Bordets kort og lynlaas i laerredets pixels (fane 1 og 3) */
    function bordRekt(bord) {
        var g = bord && bord.g;
        if (!g) return null;
        var top = g.zy - g.gab - g.hc;
        return { x: g.x0 - 10, y: top - 10, b: g.felter * g.U + 20, h: 2 * (g.gab + g.hc) + 20 };
    }

    /* Det, boblen holder sig fri af paa bordet: kortene, maerket til
       hoejre for dem og formlen under dem */
    function bordOptaget(bord) {
        var r = bordRekt(bord), g = bord && bord.g;
        if (!r) return null;
        var hoejre = r.x + r.b;
        if (!isNaN(bord.maerkeX)) hoejre = Math.max(hoejre, bord.maerkeX + 36);
        return { x: r.x, y: r.y, b: hoejre - r.x, h: Math.max(r.h, g.y1 - r.y) };
    }

    /* ----- Fane 1: bordet ------------------------------------------------ */
    if (NK.SimBord) {
        var PB = NK.SimBord.prototype;
        kobl(PB, { fredet: [] });
        praesentation(PB, "fane-bord", "bord-spring", "bord-tilbud");

        /* Han staar oven paa den nederste hylde */
        PB.laererGulvPx = function () {
            var h = this.bord.hyldeBund;
            if (!h) return NaN;
            return h.getBoundingClientRect().top - this.L.canvas.getBoundingClientRect().top;
        };
        PB.laererOptaget = function () { return [bordOptaget(this.bord)]; };
        PB.laererMaalRekt = function (navn) {
            if (navn === "bord") return [this.laererSide(bordRekt(this.bord))];
            if (navn === "hylder") return [omkreds(this.bord.hyldeTop), omkreds(this.bord.hyldeBund)];
            if (navn === "opgave") return [elRekt(NK.el("bord-opgaveknap"))];
            return [];
        };
    }

    /* ----- Fane 2: vandet ------------------------------------------------ */
    if (NK.SimVand) {
        var PV = NK.SimVand.prototype;
        kobl(PV, { fredet: [] });
        praesentation(PV, "fane-vand", "vand-spring", "vand-tilbud");

        PV.laererGlas = function () {
            var G = this.G;
            return G ? { x: G.x, y: G.y, b: G.b, h: G.h } : null;
        };
        PV.laererOptaget = function () { return [this.laererGlas()]; };
        PV.laererMaalRekt = function (navn) {
            if (navn === "glas") return [this.laererSide(this.laererGlas())];
            if (navn === "salt") return [elRekt(NK.el("vand-saltkort"))];
            if (navn === "opgave") return [elRekt(NK.el("vand-opgaveknap"))];
            return [];
        };
    }

    /* ----- Fane 3: den ukendte ion --------------------------------------- */
    if (NK.SimUkendt) {
        var PU = NK.SimUkendt.prototype;
        kobl(PU, { fredet: ["intro", "visStart", "ros"] });
        praesentation(PU, "fane-ukendt", "ukendt-spring", "ukendt-tilbud");

        PU.laererOptaget = function () {
            var p = this.plakater || {};
            return [bordOptaget(this.bord), p.pt, p.ioner];
        };
        PU.laererMaalRekt = function (navn) {
            var p = this.plakater || {};
            if (navn === "formel") return [elRekt(NK.el("ukendt-uf"), true)];
            if (navn === "trin") return [elRekt(document.querySelector("#ukendt-opgavekort .trin"))];
            if (navn === "plakater") return [this.laererSide(p.pt), this.laererSide(p.ioner)];
            if (navn === "opgave") return [elRekt(NK.el("ukendt-opgaveknap"))];
            return [];
        };

        /* {ion} er den kendte ion. Replikkerne er korte og toerre. */
        var START = [
            "Start med {ion}. Den kender du.",
            "{ion} først. Den er til at finde.",
            "Den kendte først: {ion}.",
            "Begynd med {ion}. Den ved du noget om."
        ];
        var ROS = [
            "Tre mere. Formlerne afslører sig selv nu.",
            "Det gik op. Som en lynlås.",
            "Ukendt ion. Kendt nu."
        ];

        /* "Start opgave": punkt() giver midten af den kendte ions kort i
           pixels (kortene glider paa plads, mens han gaar ind). Kortet faar
           rammen. Er han midt i praesentationen, holder han op med den og
           viser starten i stedet; det er det, praesentationen beder om. */
        PU.laererVisStart = function (punkt, ion) {
            var L = this.laerer;
            if (!L) return;
            if (this.laererIIntro()) {
                L.tale = "";
                L.taleUr = 0;
                L.taleAlfa = 0;
                this.introTrin = 0;
            }
            var mig = this;
            function kort() {
                var g = mig.bord.g, c = punkt();
                if (!g || !c) return [];
                return [mig.laererSide({ x: c.x - g.U / 2 + 3, y: c.y - g.hc / 2, b: g.U - 6, h: g.hc })];
            }
            var replik = K.replik("visStart", START).replace("{ion}", ion.formel);
            this.laererKoer("visStart", [
                { udtryk: { vrede: 0, humoer: 0.3, roed: 0, skeptisk: 0.3, briller: 1 } },
                { gaa: function () { return this.laererHjoerneX(); } },
                { kald: function () { this.laererMaal = kort; } },
                { arm: function () { return this.laererSeMod(kort); }, tid: 0.3 },
                { sig: replik, vis: 2.8, tid: 2.8 },
                { taleFaerdig: true },
                { kald: function () { this.laererMaal = null; this.laerer.hovedMaal = 0; } },
                { arm: HAENGER, tid: 0.3 },
                { udtryk: { skeptisk: 0, briller: 0 } },
                { gaa: UDE }
            ], false);
        };

        /* Ros: kort og toer. */
        PU.laererRos = function () {
            var L = this.laerer;
            if (!L || L.scene) return;
            this.laererKoer("ros", [
                { udtryk: { vrede: 0, humoer: 0.8, roed: 0 } },
                { gaa: function () { return this.laererHjoerneX(); } },
                { tid: 0.3 },
                { sig: K.replik("rosUkendt", ROS), vis: 2.6, tid: 2.6,
                  hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 5; } },
                { kald: function () { this.laerer.nik = 0; } }
            ].concat(K.ros(), [
                { gaa: UDE }
            ]), false);
        };
    }
}());
