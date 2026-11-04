/* =====================================================================
   laerer.js - Kemichael paa de tre faner

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.

   Hjoernet: han staar nederst i hoejre hjoerne af scenen, hvor der er
   tomt, og ses fra brystet og op. Han gaar ind og ud ad hoejre kant, saa
   han aldrig gaar hen over bordet eller glasset. Taleboblen paa
   laerredet tegnes her i filen (laererTegnBoble), over hans hoved i samme
   hjoerne og fri af det, fanen bruger (laererOptaget). Det, han taler om,
   faar en gul ramme (NK.Fremhaev, ../kemichael/praesentation.js), saa han
   ikke skal gaa derhen for at vise det. Eleven kan bruge fanen, mens han
   taler.

   Skalaen foelger laerredets hoejde (laererLaerredSkala). Kitlen stopper
   ved gulvet (NK.Scene.GULV): laerredets bund, og paa fane 1 oversiden af
   den nederste hylde, saa han staar oven paa den. Figurens egen skala
   (laererSkala) roeres ikke.

   Hver fane kobles paa for sig og skal have:
     this.tid               et ur, der altid gaar (sekunder)
     this.L                 laerredet
     laererOptaget()        rektangler { x, y, b, h } i laerredets pixels,
                            som boblen holder sig fri af
     introFelt(navn)        det, der er tegnet paa laerredet, og som
                            praesentationen peger paa (D.INTRO, felt)
     laererGulvPx()         (kan undlades) gulvet i laerredets pixels

   Scener:
     intro      naar eleven har sagt ja til praesentationen. Koden er
                faelles (NK.Praesentation.trin): to til fire trin
                (D.INTRO), hvert med to til fire hele saetninger i en
                taleboble med Naeste og Spring praesentationen over. Det,
                trinnet handler om, faar en gul ramme. Han gaar foerst
                videre, naar eleven trykker Naeste.
     visStart   fane 3, "Start opgave": ramme om den ion, eleven kender,
                og én replik, fx "Du har ikke mødt sulfit endnu, men du
                kender ladningen på Na. Derfor kan du regne ladningen på
                sulfit ud." (brugerens oenske 4. nov. 2026).
   Han roser ikke laengere hver tredje opgave (brugerens regel 4. nov.
   2026: han kommer kun ind, naar noget er helt gennemfoert, eller naar
   eleven goer noget vildt). Han forklarer ikke teori. Den staar i
   hintene.
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

        /* maal: en funktion, der giver rektanglerne i sidens pixels */
        P.laererRammer = function (maal) {
            var r = typeof maal === "function" ? maal.call(this) : null;
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

        /* Under praesentationen staar teksten i HTML-boblen i stedet */
        P.laererTegnBoble = function (ctx) {
            var L = this.laerer;
            if (this.kmIntro || !L || !L.tale || !(L.taleAlfa > 0.01)) return;
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
       Faelles (../kemichael/praesentation.js): ét trin ad gangen med
       Naeste og Spring praesentationen over i en taleboble ved hans
       hoved. Trinnene staar i D.INTRO[fane]. Han gaar ind i hjoernet og
       bliver der, til eleven trykker Afslut eller springer over.

       startIntro(tving) kaldes ved faneskift og med K. js/app.js pakker
       den ind (NK.Praesentation.pakInd), saa der foerste gang staar Start
       praesentation og Nej tak. opdaterIntro(dt) hvert billede: ventetiden,
       boblen og tilbuddet, der staar i hjoernet oven paa gulvet. */
    function praesentation(P, fane, tilbudId) {
        var noegle = "nk-sc2.2-intro-" + fane;

        P.introLinjer = function () { return D.INTRO[fane]; };
        /* Han staar i hjoernet, uanset hvad han viser */
        P.laererPlads = function () { return this.laererHjoerneX(); };
        NK.Praesentation.trin(P);

        /* Til venstre for ham peger han ikke, for i hjoernet ville armen
           gaa hen over ansigtet eller ud af scenen. Han kigger derhen, og
           rammen viser det. Mod panelet til hoejre peger han. Den faelles
           kode giver armen NED (skraat ned foran kroppen), naar maalet
           staar til venstre for skulderen; her haenger den i stedet. */
        var NED = 1.85, vis = P.introVis;
        P.introVis = function (n) {
            vis.call(this, n);
            var sc = this.laerer && this.laerer.scene;
            if (!sc || sc.navn !== "intro") return;
            sc.trin.forEach(function (tr) {
                if (typeof tr.arm !== "function") return;
                var arm = tr.arm;
                tr.arm = function () {
                    var v = arm.apply(this, arguments);
                    return Math.abs(v - NED) < 1e-9 ? HAENGER : v;
                };
            });
        };

        P.startIntro = function (tving) {
            if (!this.laererIntro) return;
            if (!tving && NK.hent(noegle, false)) return;
            NK.gem(noegle, true);
            if (!this.laererIIntro()) this.introVent = tving ? 0.1 : 0.9;
        };
        P.springIntro = function () {
            this.introVent = 0;
            return !!(this.laererIntroVaek && this.laererIntroVaek());
        };

        P.opdaterIntro = function (dt) {
            if (this.introVent > 0) {
                this.introVent -= dt;
                if (this.introVent <= 0 && this.laererIntro) this.laererIntro();
            }
            if (this.kmIntro) this.introOpdaterBoble();
            var tilbud = NK.el(tilbudId);
            if (tilbud && !tilbud.hidden && this.L.h > 0) {
                tilbud.style.bottom = Math.round(this.L.h - this.laererGulv() + 12) + "px";
            }
        };

        /* En ny opgave (laererNyt) afbryder praesentationen */
        P.laererNytEkstra = function () {
            if (this.kmIntro) this.laererIntroVaek();
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
        praesentation(PB, "fane-bord", "bord-tilbud");

        /* Han staar oven paa den nederste hylde */
        PB.laererGulvPx = function () {
            var h = this.bord.hyldeBund;
            if (!h) return NaN;
            return h.getBoundingClientRect().top - this.L.canvas.getBoundingClientRect().top;
        };
        PB.laererOptaget = function () { return [bordOptaget(this.bord)]; };
        /* Det, praesentationen peger paa paa laerredet */
        PB.introFelt = function (navn) {
            return navn === "bord" ? bordRekt(this.bord) : null;
        };
    }

    /* ----- Fane 2: vandet ------------------------------------------------ */
    if (NK.SimVand) {
        var PV = NK.SimVand.prototype;
        kobl(PV, { fredet: [] });
        praesentation(PV, "fane-vand", "vand-tilbud");

        PV.laererGlas = function () {
            var G = this.G;
            return G ? { x: G.x, y: G.y, b: G.b, h: G.h } : null;
        };
        PV.laererOptaget = function () { return [this.laererGlas()]; };
        PV.introFelt = function (navn) {
            return navn === "glas" ? this.laererGlas() : null;
        };
    }

    /* ----- Fane 3: den ukendte ion --------------------------------------- */
    if (NK.SimUkendt) {
        var PU = NK.SimUkendt.prototype;
        kobl(PU, { fredet: ["intro", "visStart"] });
        praesentation(PU, "fane-ukendt", "ukendt-tilbud");

        PU.laererOptaget = function () {
            var p = this.plakater || {};
            return [bordOptaget(this.bord), p.pt, p.ioner];
        };
        /* Formlen over bordet (kun teksten, ikke hele linjens bredde),
           bordet og de to plakater, i laerredets pixels */
        PU.introFelt = function (navn) {
            var p = this.plakater || {};
            if (navn === "bord") return bordRekt(this.bord);
            if (navn === "pt") return p.pt || null;
            if (navn === "ioner") return p.ioner || null;
            if (navn === "formel") {
                var e = NK.el("ukendt-uf");
                if (!e) return null;
                var rng = document.createRange();
                rng.selectNodeContents(e);
                var r = rng.getBoundingClientRect(), c = this.L.canvas.getBoundingClientRect();
                return r.width > 0 ? { x: r.left - c.left, y: r.top - c.top, b: r.width, h: r.height } : null;
            }
            return null;
        };

        /* "Start opgave": én replik i to saetninger. Den siger, hvorfor
           ionen er ukendt (en sammensat ion, eleven ikke har moedt, eller
           et metal med flere ladninger), og at ladningen kan regnes ud,
           fordi eleven kender den anden ion. Brugeren 4. nov. 2026: sulfit
           var forvirrende uden den forklaring, og Kemichael skal sige det. */
        function startReplik(sim) {
            var u = sim.ion, k = sim.kendt;
            var navn = u.sammensat ? u.navn : u.grund;
            return (u.sammensat ? "Du har ikke mødt " + navn + " endnu" : NK.stort(navn) + " kan have flere ladninger")
                + ", men du kender ladningen på " + k.formel + ". Derfor kan du regne ladningen på " + navn + " ud.";
        }
        PU.laererStartReplik = function () { return startReplik(this); };

        /* "Start opgave": punkt() giver midten af den kendte ions kort i
           pixels (kortene glider paa plads, mens han gaar ind). Kortet faar
           rammen. Er han midt i praesentationen, holder han op med den og
           viser starten i stedet; det er det, praesentationen beder om. */
        PU.laererVisStart = function (punkt, ion) {
            var L = this.laerer;
            if (!L) return;
            if (this.laererIIntro()) this.laererIntroVaek(true);
            var mig = this;
            function kort() {
                var g = mig.bord.g, c = punkt();
                if (!g || !c) return [];
                return [mig.laererSide({ x: c.x - g.U / 2 + 3, y: c.y - g.hc / 2, b: g.U - 6, h: g.hc })];
            }
            var replik = startReplik(this);
            this.laererKoer("visStart", [
                { udtryk: { vrede: 0, humoer: 0.3, roed: 0, skeptisk: 0.3, briller: 1 } },
                { gaa: function () { return this.laererHjoerneX(); } },
                { kald: function () { this.laererMaal = kort; } },
                { arm: function () { return this.laererSeMod(kort); }, tid: 0.3 },
                { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
                { taleFaerdig: true },
                { kald: function () { this.laererMaal = null; this.laerer.hovedMaal = 0; } },
                { arm: HAENGER, tid: 0.3 },
                { udtryk: { skeptisk: 0, briller: 0 } },
                { gaa: UDE }
            ], false);
        };
    }
}());
