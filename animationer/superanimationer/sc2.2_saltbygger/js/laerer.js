/* =====================================================================
   laerer.js - Kemichael paa de tre faner

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Fanerne
   har intet fast tegnebord, saa han tegnes skaleret efter laerredets
   hoejde (laererLaerredSkala), som i sc2.1 og sc2.3. Figurens egen
   skala (laererSkala) roeres ikke.

   Benene: kitlen fortsaetter ned til scenens gulv (NK.Scene.GULV). Uden
   gulv fortsatte den 1500 enheder, og i et hoejt vindue blev benene
   lange. Her saettes gulvet til laerredets bund, hver gang han tegnes
   (samme loesning som F84 i det virtuelle laboratorium, men uden at
   roere den faelles fil), og skalaen er 0,92 som i sc2.3.

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet

   Scener:
     intro      hver fane, foerste gang den aabnes: to eller tre korte
                replikker (D.INTRO). Scenen laaser ikke, og han gaar kun,
                naar eleven vil det: knappen, to klik paa ham eller Esc.
     visStart   fane 3, "Start opgave": han peger paa den ion, eleven
                kender, og siger, at man skal starte der.
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

    /* Scenens maal i figurens enheder: laerredet, og gulvet ved dets bund. */
    function scenemaal(sim) {
        var s = sim.laererLaerredSkala();
        NK.Scene.BREDDE = sim.L.b / s;
        NK.Scene.HOEJDE = sim.L.h / s;
        NK.Scene.GULV = sim.L.h / s;
        return s;
    }

    function kobl(P, valg) {
        K.paa(P, valg);

        /* Kemichael melder "laerer", naar han har gjort noget. Fanerne,
           der selv har en aendret(), ser bort fra det. */
        if (!P.aendret) P.aendret = function () {};

        P.laererLaerredSkala = function () {
            return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
        };

        /* Tegnes til sidst, ovenpaa alt andet paa laerredet. */
        P.laererTegnOver = function (ctx) {
            var L = this.laerer;
            if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
            var s = scenemaal(this);
            ctx.save();
            ctx.scale(s, s);
            this.tegnLaerer(ctx, this.tid);
            ctx.restore();
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

        /* Saa langt til venstre, han kan staa uden at blive skaaret af
           laerredets kant, i pixels. Han fylder omkring 105 enheder til
           hver side. */
        P.laererVenstrePx = function () {
            return 108 * this.laererLaerredSkala() + 8;
        };

        /* Et punkt i laerredets pixels omregnet til figurens enheder. */
        P.laererEnheder = function (p) {
            var s = this.laererLaerredSkala();
            return { x: p.x / s, y: p.y / s };
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* ----- Praesentationen ------------------------------------------------
       Samme opbygning som i sc2.3. standX(): hvor han stiller sig, i
       enheder. peg: { linje, punkt() } - punktet i pixels, han peger paa,
       mens han siger den linje. */
    function introTrin(sim, linjer, standX, peg) {
        var trin = [
            { kald: function () { sim.introKlikTal = 0; } },
            { udtryk: { vrede: 0, humoer: 0.35, roed: 0, skeptisk: 0.3, briller: 0 } },
            { gaa: standX },
            { tid: 0.2 }
        ];
        linjer.forEach(function (l, i) {
            trin.push({ kald: function () { sim.introTrin = i + 1; } });
            if (peg && i === peg.linje) {
                trin.push({ arm: function () { var m = this.laererEnheder(peg.punkt()); return this.pegVinkel(m.x, m.y); }, tid: 0.45 });
            }
            trin.push({ sig: l, vis: replikTid(l), tid: replikTid(l) });
            if (peg && i === peg.linje) trin.push({ arm: HAENGER, tid: 0.35 });
        });
        return trin.concat([
            { taleFaerdig: true },
            { udtryk: { skeptisk: 0, humoer: 0 } },
            { kald: function () { sim.introTrin = 0; } },
            { gaa: UDE }
        ]);
    }

    /* knapId: knappen Spring praesentationen over paa fanen */
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
            this.laererKoer("introUd", [
                { arm: HAENGER, tid: 0.15 },
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

    /* Praesentationen paa en fane: hvor han staar (pixels fra venstre),
       og hvad han peger paa (et punkt i pixels) under linjen D.INTRO.peg.
       startIntro(tving) kaldes ved faneskift og med K; foerste gang i
       browseren, eller altid med tving. opdaterIntro(dt) hvert billede. */
    function praesentation(P, fane, knapId, standPx, pegPunkt) {
        var noegle = "nk-sc2.2-intro-" + fane;

        P.laererIntro = function () {
            if (!this.laerer) return;
            var mig = this, tekst = D.INTRO[fane];
            this.laererKoer("intro", introTrin(this, tekst.linjer,
                function () { return standPx.call(mig) / mig.laererLaerredSkala(); },
                { linje: tekst.peg, punkt: function () { return pegPunkt.call(mig); } }), false);
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
        P.opdaterIntro = function (dt) {
            if (this.introVent > 0) {
                this.introVent -= dt;
                if (this.introVent <= 0 && this.laererIntro) this.laererIntro();
            }
            var iIntro = !!(this.laererIIntro && this.laererIIntro());
            if (iIntro !== this.visesSpring) {
                this.visesSpring = iIntro;
                NK.el(knapId).hidden = !iIntro;
            }
        };
    }

    /* ----- Fane 1: bordet ------------------------------------------------ */
    if (NK.SimBord) {
        var PB = NK.SimBord.prototype;
        kobl(PB, { fredet: [] });
        /* Han staar til venstre for bordet og peger op paa hylden */
        praesentation(PB, "fane-bord", "bord-spring",
            function () { return this.laererVenstrePx(); },
            function () {
                var g = this.bord.g;
                return g ? { x: g.x0 + g.U * 2, y: g.y0 - 30 } : { x: 400, y: 120 };
            });
    }

    /* ----- Fane 2: vandet ------------------------------------------------ */
    if (NK.SimVand) {
        var PV = NK.SimVand.prototype;
        kobl(PV, { fredet: [] });
        /* Han staar til venstre for glasset og peger over paa panelet */
        praesentation(PV, "fane-vand", "vand-spring",
            function () { return Math.max(this.laererVenstrePx(), this.L.b * 0.14); },
            function () { return { x: this.L.b + 60, y: this.L.h * 0.3 }; });
    }

    /* ----- Fane 3: den ukendte ion --------------------------------------- */
    if (NK.SimUkendt) {
        var PU = NK.SimUkendt.prototype;
        kobl(PU, { fredet: ["intro", "visStart", "ros"] });
        /* Han staar til venstre og peger paa plakaten med det periodiske
           system, naar han siger, at plakaterne er til at kigge paa */
        praesentation(PU, "fane-ukendt", "ukendt-spring",
            function () { return this.laererVenstrePx(); },
            function () {
                var p = this.plakater && this.plakater.pt;
                return p ? { x: p.x + p.b * 0.6, y: p.y + p.h * 0.6 } : { x: 120, y: 60 };
            });

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
           pixels (kortene glider paa plads, mens han gaar ind). Er han
           midt i praesentationen, holder han op med den og viser starten
           i stedet; det er det, praesentationen beder eleven om. */
        PU.laererVisStart = function (punkt, ion) {
            var L = this.laerer;
            if (!L) return;
            if (this.laererIIntro()) {
                L.tale = "";
                L.taleUr = 0;
                L.taleAlfa = 0;
                this.introTrin = 0;
            }
            var replik = K.replik("visStart", START).replace("{ion}", ion.formel);
            this.laererKoer("visStart", [
                { udtryk: { vrede: 0, humoer: 0.3, roed: 0, skeptisk: 0.3, briller: 1 } },
                { gaa: function () { return this.laererVenstrePx() / this.laererLaerredSkala(); } },
                { kald: function () { this.laerer.hovedMaal = this.kigVinkel(this.laererEnheder(punkt()).x); } },
                { arm: function () { var m = this.laererEnheder(punkt()); return this.pegVinkel(m.x, m.y); }, tid: 0.45 },
                { sig: replik, vis: 2.8, tid: 2.8 },
                { taleFaerdig: true },
                { arm: HAENGER, tid: 0.35 },
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
                { gaa: function () { return this.laererVenstrePx() / this.laererLaerredSkala(); } },
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
