/* =====================================================================
   sim.js - scenen: laboratoriebordet, udstyret og elevens haender

   Verden er 1000 x 470 enheder med bordets overflade ved y 430. Alt
   tegnes i verdens koordinater; layout() finder skala og forskydning.

   Udstyret har en ankerpost (et punkt og en drejning). Mens eleven
   holder noget, foelger ankeret musen; holdes en flaske, et maaleglas,
   en kolbe eller en sproejteflaske over det, den skal haeldes i, saetter
   den sig i haeldestilling og haelder, saa laenge den holdes der.
   Klik viser ikke noget her: knapperne paa omroereren, hanen og
   smeltepunktsapparatet klikkes, alt andet traekkes.

   Trinnenes logik (hvilken del eleven er ved) staar nederst: delNu,
   linje, skiltNu og goer. Kortet oeverst er js/trin.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Km = NK.Kemi;
    var Tg = NK.Tg;
    var D = NK.Data;

    var VB = 1000, VH = 470, BORD = 430, FORAN = 452;
    var F_TID = 0.5;        /* laboratoriets minutter pr. sekund */
    var SPOL_FART = 9;      /* minutter pr. sekund, naar der spoles */

    /* ----- Glassenes inderside (spritets koordinater) ---------------------- */
    var KOLBE_INDRE = [[60, 6], [60, 62], [15, 180], [16, 186], [19, 190], [24, 192], [126, 192], [131, 190],
                       [134, 186], [135, 180], [90, 62], [90, 6]];
    var MAALEGLAS_INDRE = [[19, 12], [41, 12], [41, 222], [19, 222]];
    var FLASKE_INDRE = [[40, 40], [60, 40], [60, 50], [86, 66], [91, 80], [91, 204], [9, 204], [9, 80], [14, 66], [40, 50]];
    var VIAL_INDRE = [[8, 22], [32, 22], [32, 75], [8, 75]];

    /* ----- Udstyret: sprite, skala og ankerpunkt i spritet ------------------- */
    var UDSTYR = {
        kolbe:     { sprite: "kolbe", s: 0.9, a: [75, 4] },
        maaleglas: { sprite: "maaleglas100", s: 0.9, a: [30, 10] },
        "fl-eth":  { sprite: "flaske_klar", s: 0.9, a: [50, 5] },
        sproejte:  { sprite: "sproejteflaske", s: 0.8, a: [8, 34] },
        termo:     { sprite: "termometer", s: 0.85, a: [30, 249] },
        urglas:    { sprite: "urglas", s: 0.6, a: [110, 72] },
        spatel:    { sprite: "spatel", s: 0.7, a: [22, 20] }
    };

    /* ----- Faste pladser i verden ---------------------------------------------- */
    var G = {
        plade: { x: 100, y: 366 },
        knapVarme: { x: 170, y: 402, r: 15 },
        knapOmroer: { x: 270, y: 402, r: 15 },
        kolbePlade: { x: 220, y: 367 - 173.7 },        /* kolbens aabning paa pladen */
        isbad: { x: 335, y: 338 },
        kolbeIsbad: { x: 440, y: 424 - 173.7 },
        flaske: { x: 520 },                               /* de brune flasker */
        holder: { x: 650 },                               /* pipetteholderen */
        flEth: { x: 520, y: BORD - 208 * 0.9 + 5 * 0.9 },
        maaleglas: { x: 650, y: BORD - 249 * 0.9 + 10 * 0.9 },
        termoBord: { x: 610, y: FORAN - 7, v: -Math.PI / 2 },
        magnet: { x: 470, y: FORAN },
        spidsHolder: { x: 430 },
        plade_tlc: { x: 520 },
        vial: { x: 600 },
        kammer: { x: 660, y: 310 },
        uv: { x: 799, y: 277 },
        sugekolbe: { x: 572.5, y: 250 },
        tragt: { x: 581.5, y: 166 },
        hane: { x: 850, y: 236 },
        sproejte: { x: 746 + 8 * 0.8, y: 326 + 34 * 0.8 },
        lampe: { x: 232, y: 190 },
        underLampe: { x: 280, y: BORD },
        urglasHjem: [{ x: 440, y: BORD }, { x: 140, y: BORD }],
        urglasSmp: { x: 310, y: BORD },
        vaegt: { x: 730, y: 332.5 },
        paaVaegt: { x: 820, y: 341 },
        spatel: { x: 470, y: FORAN - 6 },
        roerHolder: { x: 455 },
        app: { x: 556, y: 214, s: 1.2 }
    };
    /* Afledte punkter */
    G.tragtMidt = { x: 640, y: G.tragt.y + 12 * 0.9, rx: 47.7, ry: 5.85 };
    G.tragtRand = { x: 640, y: G.tragt.y + 10 * 0.9 };
    G.armEnde = { x: G.sugekolbe.x + 144 * 0.9, y: G.sugekolbe.y + 26 * 0.9 };
    G.dyse = { x: G.hane.x + 4 * 0.9, y: G.hane.y + 61 * 0.9 };
    G.haandtag = { x: G.hane.x + 56 * 0.9, y: G.hane.y + 50 * 0.9 };
    G.slot = { x: G.app.x + 62 * G.app.s, y: G.app.y + 30 * G.app.s };
    G.display = { x: G.app.x + 22 * G.app.s, y: G.app.y + 60 * G.app.s, b: 84 * G.app.s, h: 32 * G.app.s };
    G.linse = { x: G.app.x + 166 * G.app.s, y: G.app.y + 92 * G.app.s, r: 36 * G.app.s };
    G.appKnap = { x: G.app.x + 42 * G.app.s, y: G.app.y + 146 * G.app.s, r: 13 * G.app.s };
    G.paere = { x: G.lampe.x + 60 * 0.8, y: G.lampe.y + 86 * 0.8 };
    G.markP = { x: 512, y: 416 };
    G.markR = { x: 532, y: 416 };

    /* Hvilke trin (0-9) udstyret staar fremme i */
    function synlig(id, t, S) {
        switch (id) {
            case "stativ": case "plade": case "kolbe": return t <= 7;
            case "magnet": return t === 0 && S.magnet.sted !== "kolbe";
            case "fl-sal": case "pip2": return t === 1;
            case "fl-eth": case "maaleglas": return t === 2;
            case "termo": return t === 7 ? S.termo.sted === "kolbe" : (t >= 3 && t <= 6);
            case "fl-en": case "pip1": return t === 4;
            case "tlc": return t === 5;
            case "isbad": return t === 6 || t === 7;
            case "filter": return t === 7 || t === 8;
            case "hane": case "sproejte": return t === 7;
            case "urglas": return t >= 8;
            case "urglas2": return t >= 8 && S.urglas2;
            case "spatel": case "vaegt": case "lampe": return t === 8;
            case "roer": case "app": return t === 9;
        }
        return false;
    }

    /* ----- Tilstanden ------------------------------------------------------------- */
    function rund2(v) { return Math.round(v * 100) / 100; }

    function nyPlade() {
        return { sted: "bord", P: null, R: null, front: 0, iKammer: false, udviklet: false, uvT: 0, set: false, cirkler: false, frontEnd: 0 };
    }

    function nyTilstand() {
        var m1 = rund2(23.2 + Math.random() * 3.4), m2 = rund2(23.2 + Math.random() * 3.4);
        return {
            ur: 0, spol: 0,
            K: Km.nyKolbe(), kolbeSted: "plade",
            plade: { varme: false, omroer: false, T: Km.STUE },
            magnet: { sted: "bord" },
            pip: {
                pip2: { sted: "holder", V: 0, cap: 2, stof: null },
                pip1: { sted: "holder", V: 0, cap: 1, stof: null }
            },
            maaleglas: { V: 0, overloeb: false },
            termo: { sted: "bord" },
            spids: { p: { indhold: null }, r: { indhold: null } },
            tlc: nyPlade(), plader: [],
            tragt: Km.nyTragt(), sug: false,
            urglas: [Km.nytUrglas(m1), Km.nytUrglas(m2)], urglasSted: ["bord", "bord"], urglas2: false, aktivU: 0,
            lampeTid: [0, 0],
            spatel: { m: 0, w: 0 },
            vaegtVis: 0, vaegtRo: 0, vejninger: [],
            roer: { sted: "holder", fyldt: false },
            app: { taendt: false, T: 25, start: null, slut: null, smp: null },
            skub: (Math.random() - 0.5) * 0.4,
            feltSvar: null, skyllet: false, skylMl: 0, haeldt: false,
            enHurtigBesked: false
        };
    }

    /* ======================================================================
       Simulationen
       ====================================================================== */
    NK.Sim = function () {
        this.L = new NK.Laerred(NK.el("laerred"));
        this.tid = 0;
        this.S = nyTilstand();
        this.greb = null;
        this.hold = null;           /* en knap, der holdes nede: {id: "pip2", h: "sug"} */
        this.draaber = [];
        this.skyer = [];
        this.bobler = [];
        this.stroemme = [];
        this.magnetVinkel = 0;
        this.hoppe = 0;             /* paaskeaegget: magnetloppen hopper */
        this.klikTider = [];
        this.lay = null;
        this.mus = null;
        this.startTrin();
        this.koblMus();
        var mig = this;
        NK.el("spolknap").addEventListener("click", function () {
            /* Tiden maa ogsaa gaa, mens kortet beder om at vente paa en ny TLC-plade */
            if (mig.fase !== "mellem" && mig.spaer()) return;
            mig.S.spol += 2;
        });
    };

    var P = NK.Sim.prototype;

    /* ----- Layout --------------------------------------------------------------- */
    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var top = 10 + this.kortZone() + 8;
        var s = Math.min(W / VB, (H - top) / VH);
        s = Math.max(0.3, s);
        this.lay = { s: s, ox: (W - VB * s) / 2, oy: H - VH * s, top: top, W: W, H: H };
        /* Uret staar oeverst til hoejre under kortet */
        var ur = NK.el("ur");
        if (ur) { ur.style.top = Math.round(top) + "px"; }
        this.ankre();
    };

    P.kortZone = function () {
        return window.innerHeight <= 720 ? 156 : 184;
    };

    P.tilVerden = function (pt) {
        var l = this.lay;
        return { x: (pt.x - l.ox) / l.s, y: (pt.y - l.oy) / l.s };
    };

    P.tilSkaerm = function (x, y) {
        var l = this.lay;
        return { x: l.ox + x * l.s, y: l.oy + y * l.s };
    };

    /* Usynlige felter oven paa laerredet, som rundvisningen peger paa */
    P.ankre = function () {
        if (!this.lay) return;
        var mig = this;
        function saet(id, x, y, b, h) {
            var e = NK.el("anker-" + id);
            if (!e) return;
            var a = mig.tilSkaerm(x, y);
            e.style.left = Math.round(a.x) + "px";
            e.style.top = Math.round(a.y) + "px";
            e.style.width = Math.round(b * mig.lay.s) + "px";
            e.style.height = Math.round(h * mig.lay.s) + "px";
        }
        saet("opstilling", 40, 10, 310, 420);
        saet("bord", 370, 150, 630, 300);
    };

    /* ======================================================================
       Poser: hvor tingene er lige nu
       ====================================================================== */

    /* Kolbens aabning og drejning */
    P.kolbePose = function () {
        if (this.greb && this.greb.id === "kolbe") return this.grebPose("kolbe");
        var S = this.S;
        if (S.kolbeSted === "isbad") return { x: G.kolbeIsbad.x, y: G.kolbeIsbad.y, v: 0 };
        return { x: G.kolbePlade.x, y: G.kolbePlade.y, v: 0 };
    };

    P.grebPose = function (id) {
        var g = this.greb;
        if (g.pose) return g.pose;
        return { x: g.x, y: g.y, v: 0 };
    };

    /* Tegn et udstyr ud fra dets pose. Giver spritets oeverste venstre hjoerne. */
    function tl(u, p) {
        var d = UDSTYR[u];
        return { x: p.x - d.a[0] * d.s, y: p.y - d.a[1] * d.s };
    }

    function indre(u, pkt, p) {
        var d = UDSTYR[u], t = tl(u, p);
        return Tg.flyt(pkt, t.x, t.y, d.s, p.v || 0, p.x, p.y);
    }

    /* Pipetten: spidsens plads */
    P.pipPose = function (id) {
        if (this.greb && this.greb.id === id) return this.grebPose(id);
        var p = this.S.pip[id];
        if (p.sted === "flaske") return { x: G.flaske.x, y: BORD - 16 };
        if (p.sted === "kolbe") { var k = this.kolbePose(); return { x: k.x, y: k.y + 8 }; }
        return { x: G.holder.x, y: BORD - 4 };
    };

    var PIP_L = 150;

    /* Knapperne ved pipettebolden */
    P.pipKnapper = function (id) {
        var p = this.pipPose(id), top = p.y - PIP_L;
        return {
            sug: { x: p.x + 24, y: top - 40, b: 82, h: 24 },
            toem: { x: p.x + 24, y: top - 12, b: 82, h: 24 }
        };
    };

    P.termoPose = function () {
        if (this.greb && this.greb.id === "termo") return this.grebPose("termo");
        if (this.S.termo.sted === "kolbe") {
            var k = this.kolbePose();
            return { x: k.x + 12, y: k.y + 150, v: 0.07 };
        }
        return { x: G.termoBord.x, y: G.termoBord.y, v: G.termoBord.v };
    };

    P.magnetPos = function () {
        if (this.greb && this.greb.id === "magnet") return { x: this.greb.x, y: this.greb.y };
        return { x: G.magnet.x, y: G.magnet.y };
    };

    P.spidsPose = function (id) {
        if (this.greb && this.greb.id === "spids-" + id) return this.grebPose("spids-" + id);
        return { x: G.spidsHolder.x + (id === "p" ? -10 : 10), y: BORD - 6 };
    };

    P.pladePose = function () {
        if (this.greb && this.greb.id === "plade") return this.grebPose("plade");
        var st = this.S.tlc.sted;
        if (st === "kammer") return { x: 710, y: 423 };
        if (st === "uv") return { x: 880, y: BORD };
        return { x: G.plade_tlc.x, y: BORD };
    };

    P.urglasPose = function (i) {
        var id = i ? "urglas2" : "urglas";
        if (this.greb && this.greb.id === id) return this.grebPose(id);
        var st = this.S.urglasSted[i];
        if (st === "vaegt") return { x: G.paaVaegt.x, y: G.paaVaegt.y, v: 0 };
        if (st === "lampe") return { x: G.underLampe.x, y: G.underLampe.y, v: 0 };
        if (this.trinNr === 9) return { x: G.urglasSmp.x, y: G.urglasSmp.y, v: 0 };
        return { x: G.urglasHjem[i].x, y: G.urglasHjem[i].y, v: 0 };
    };

    P.spatelPose = function () {
        if (this.greb && this.greb.id === "spatel") return this.grebPose("spatel");
        return { x: G.spatel.x, y: G.spatel.y, v: 0 };
    };

    P.roerPose = function () {
        if (this.greb && this.greb.id === "roer") return this.grebPose("roer");
        if (this.S.roer.sted === "apparat") return { x: G.slot.x, y: G.slot.y + 34 };
        return { x: G.roerHolder.x, y: BORD - 6 };
    };

    P.maaleglasPose = function () {
        if (this.greb && this.greb.id === "maaleglas") return this.grebPose("maaleglas");
        return { x: G.maaleglas.x, y: G.maaleglas.y, v: 0 };
    };

    P.flEthPose = function () {
        if (this.greb && this.greb.id === "fl-eth") return this.grebPose("fl-eth");
        return { x: G.flEth.x, y: G.flEth.y, v: 0 };
    };

    P.sproejtePose = function () {
        if (this.greb && this.greb.id === "sproejte") return this.grebPose("sproejte");
        return { x: G.sproejte.x, y: G.sproejte.y, v: 0 };
    };

    /* Kasser til ringe, hit-test og skilte (verden) */
    P.kasse = function (id) {
        var S = this.S, p, k, t;
        switch (id) {
            case "magnet": p = this.magnetPos(); return { x: p.x - 16, y: p.y - 6, b: 32, h: 12 };
            case "pip2": case "pip1":
                p = this.pipPose(id); return { x: p.x - 18, y: p.y - PIP_L - 44, b: 36, h: PIP_L + 46 };
            case "pip2-sug": case "pip1-sug": return this.pipKnapper(id.slice(0, 4)).sug;
            case "pip2-toem": case "pip1-toem": return this.pipKnapper(id.slice(0, 4)).toem;
            case "fl-sal": case "fl-en": return { x: G.flaske.x - 40, y: BORD - 150, b: 80, h: 150 };
            case "fl-eth": p = this.flEthPose(); if (p.v) return { x: p.x - 50, y: p.y - 50, b: 100, h: 100 };
                t = tl("fl-eth", p); return { x: t.x, y: t.y, b: 90, h: 189 };
            case "maaleglas": p = this.maaleglasPose(); if (p.v) return { x: p.x - 30, y: p.y - 30, b: 60, h: 60 };
                t = tl("maaleglas", p); return { x: t.x + 10, y: t.y, b: 34, h: 225 };
            case "kolbe": p = this.kolbePose(); if (p.v) return { x: p.x - 60, y: p.y - 60, b: 120, h: 120 };
                return { x: p.x - 66, y: p.y - 4, b: 132, h: 178 };
            case "knap-varme": return { x: G.knapVarme.x - 17, y: G.knapVarme.y - 17, b: 34, h: 34 };
            case "knap-omroer": return { x: G.knapOmroer.x - 17, y: G.knapOmroer.y - 17, b: 34, h: 34 };
            case "termo": p = this.termoPose();
                if (Math.abs(p.v) > 1) return { x: p.x - 214, y: p.y - 26, b: 218, h: 52 };
                /* I kolben kan kun hovedet gribes, saa kolben selv kan tages */
                if (this.S.termo.sted === "kolbe" && !(this.greb && this.greb.id === "termo")) return { x: p.x - 26, y: p.y - 214, b: 52, h: 58 };
                return { x: p.x - 26, y: p.y - 214, b: 52, h: 216 };
            case "ur": return null;
            case "spids-p": case "spids-r": p = this.spidsPose(id.slice(6)); return { x: p.x - 6, y: p.y - 74, b: 12, h: 76 };
            case "plade": p = this.pladePose(); return { x: p.x - 26, y: p.y - 112, b: 52, h: 112 };
            case "isbad": return { x: G.isbad.x, y: G.isbad.y + 10, b: 210, h: 82 };
            case "sproejte": p = this.sproejtePose(); t = { x: p.x - 8 * 0.8, y: p.y - 34 * 0.8 };
                return { x: t.x + 20, y: t.y + 6, b: 58, h: 98 };
            case "hane": return { x: G.hane.x + 30, y: G.hane.y + 20, b: 50, h: 56 };
            case "urglas": case "urglas2": p = this.urglasPose(id === "urglas2" ? 1 : 0);
                return { x: p.x - 66, y: p.y - 38, b: 132, h: 40 };
            case "spatel": p = this.spatelPose(); return { x: p.x - 16, y: p.y - 12, b: 112, h: 24 };
            case "roer": p = this.roerPose(); return { x: p.x - 6, y: p.y - 66, b: 12, h: 68 };
            case "smp-knap": return { x: G.appKnap.x - 16, y: G.appKnap.y - 16, b: 32, h: 32 };
            case "linse": return { x: G.linse.x - G.linse.r - 2, y: G.linse.y - G.linse.r - 2, b: 2 * G.linse.r + 4, h: 2 * G.linse.r + 4 };
            case "tragt": return { x: 581, y: 166, b: 118, h: 30 };
        }
        return null;
    };

    function inde(k, x, y, m) {
        m = m || 0;
        return k && x >= k.x - m && x <= k.x + k.b + m && y >= k.y - m && y <= k.y + k.h + m;
    }

    /* ======================================================================
       Opdatering
       ====================================================================== */
    P.opdater = function (dt) {
        this.tid += dt;
        var S = this.S;
        var dl = this.koerer() ? dt * F_TID : 0;
        if (S.spol > 0) {
            var e = Math.min(S.spol, dt * SPOL_FART);
            dl += e;
            S.spol -= e;
        }
        this.handlinger(dt);
        var n = Math.max(1, Math.ceil(dl / 0.04));
        for (var i = 0; i < n; i++) this.model(dl / n);
        this.animer(dt);
        this.kortOpdater(dt);
    };

    /* Uret staar stille under et gaet og et spoergsmaal i de foerste trin */
    P.koerer = function () {
        return this.trinNr >= 3 || this.S.plade.varme;
    };

    /* Laboratoriets tid gaar: modellen */
    P.model = function (dm) {
        if (dm <= 0) return;
        var S = this.S;
        S.ur += dm;
        /* Pladen */
        var maal = S.plade.varme ? Km.PLADE_SAT : Km.STUE;
        S.plade.T += (maal - S.plade.T) * (1 - Math.exp(-0.5 * dm));
        /* Kolben */
        var holdt = this.greb && this.greb.id === "kolbe";
        var sted = holdt ? "bord" : S.kolbeSted;
        var omroer = S.plade.omroer && sted === "plade";
        Km.opdaterKolbe(S.K, dm, sted, S.plade, omroer);
        /* TLC-pladen i glasset */
        var pl = S.tlc;
        if (pl.sted === "kammer" && !(this.greb && this.greb.id === "plade")) {
            pl.front = Math.min(0.92, pl.front + dm / 2.2);
            if (pl.front >= 0.6) pl.udviklet = true;
        }
        /* Tragten */
        Km.opdaterTragt(S.tragt, dm, S.sug);
        /* Urglassene */
        for (var i = 0; i < 2; i++) {
            var lampe = S.urglasSted[i] === "lampe" && this.trinNr === 8 && !(this.greb && this.greb.id === (i ? "urglas2" : "urglas"));
            Km.opdaterUrglas(S.urglas[i], dm, lampe);
            if (lampe && S.urglas[i].mKryst > 0) S.lampeTid[i] += dm;
        }
    };

    /* Handlinger i rigtig tid: knapper, der holdes nede, og haeldning */
    P.handlinger = function (dt) {
        var S = this.S, mig = this;
        /* Pipettens knapper */
        if (this.hold && this.trinNr !== null) {
            var h = this.hold, pp = S.pip[h.id];
            h.t = (h.t || 0) + dt;
            if (h.h === "sug" && pp.sted === "flaske") {
                var trinTid = 0.24;
                while (h.t >= trinTid) {
                    h.t -= trinTid;
                    if (pp.V < pp.cap - 1e-6) { pp.V = rund1(pp.V + 0.1); pp.stof = h.id === "pip2" ? "sal" : "en"; }
                    else this.kortBesked(D.BESKED.pipFuld, 2);
                }
            } else if (h.h === "toem" && pp.sted === "flaske") {
                while (h.t >= 0.2) { h.t -= 0.2; pp.V = Math.max(0, rund1(pp.V - 0.1)); }
            } else if (h.h === "toem" && pp.sted === "kolbe" && pp.V > 0) {
                var draabe = pp.stof === "en" ? 0.05 : 0.1;
                var takt = pp.stof === "en" ? 0.34 : 0.15;
                while (h.t >= takt && pp.V > 1e-6) {
                    h.t -= takt;
                    var d = Math.min(draabe, pp.V);
                    pp.V = Math.max(0, Math.round((pp.V - d) * 100) / 100);
                    this.slipDraabe(h.id, d, pp.stof);
                }
            }
        }
        /* Haeldning: det holdte glas staar i haeldestilling over noget */
        var g = this.greb;
        if (g && g.over) {
            if (g.id === "fl-eth" && g.over === "maaleglas") {
                var mg = S.maaleglas;
                mg.V += 22 * dt;
                if (mg.V > 116) { mg.V = 116; if (!mg.overloeb) { mg.overloeb = true; this.kortBesked(D.BESKED.overloeb, 4); } }
                this.stroem("fl-eth", "maaleglas");
            } else if (g.id === "maaleglas" && g.over === "kolbe" && S.maaleglas.V > 0) {
                var dv = Math.min(S.maaleglas.V, 45 * dt);
                S.maaleglas.V -= dv;
                Km.tilsaet(S.K, "ethanol", dv, S.ur);
                if (S.maaleglas.V < 0.3) S.maaleglas.V = 0;
                this.stroem("maaleglas", "kolbe");
            } else if (g.id === "kolbe" && g.over === "tragt") {
                this.haeldITragt(dt);
            } else if (g.id === "sproejte") {
                var ml = 7 * dt;
                if (g.over === "tragt") {
                    S.tragt.mL += ml * 0.4;
                    S.tragt.vaadT = (S.tragt.vaadT || 0) + dt;
                    if (S.tragt.vaadT > 0.5) S.tragt.vaad = true;
                    this.stroem("sproejte", "tragt");
                } else if (g.over === "kolbe") {
                    Km.tilsaet(S.K, "ethanol", ml, S.ur);
                    if (S.haeldt) S.skylMl += ml;
                    this.stroem("sproejte", "kolbe");
                }
            }
        }
        /* Strømmene lever kort */
        this.stroemme = this.stroemme.filter(function (s) { s.t -= dt; return s.t > 0; });
        void mig;
    };

    function rund1(v) { return Math.round(v * 10) / 10; }

    /* Kolben haeldes i tragten */
    P.haeldITragt = function (dt) {
        var S = this.S, K = S.K, Tr = S.tragt;
        var V = Km.rumfang(K);
        if (V <= 0.05) { if (K.mKryst > 0.004 && S.skylMl > 0) { /* intet */ } return; }
        if (Tr.mL >= Km.TRAGT_MAX) {
            if (!this.tragtFuldVist) { this.tragtFuldVist = true; this.kortBesked(D.BESKED.tragtFuld, 4); }
            return;
        }
        if (!S.haeldt) {
            S.haeldt = true;
            Tr.filtrT = K.T;
            Tr.aSal = K.nSal0 > 0 ? K.nSal / K.nSal0 : 0;
            if (K.T > 30) this.kortBesked(D.BESKED.varmFiltr(K.T), 5);
            else if (!Tr.vaad) this.kortBesked(D.BESKED.ikkeFugtet, 5);
            else if (!S.sug) this.kortBesked(D.BESKED.intetSug, 5);
        }
        var dv = Math.min(V, 30 * dt, Km.TRAGT_MAX - Tr.mL);
        var andel = dv / V;
        /* Krystallerne foelger med vaesken; noget bliver siddende i kolben,
           til den er skyllet */
        var sidder = S.skylMl > 2 ? 0.15 : 0.06;
        var krAndel = andel >= 0.999 ? (1 - sidder) : andel * (1 - sidder);
        var ud = Km.haeldUd(K, andel, krAndel);
        Km.iTragt(Tr, ud);
        if (S.skylMl > 2 && Km.rumfang(K) < 0.5) S.skyllet = true;
        this.stroem("kolbe", "tragt");
    };

    P.stroem = function (fra, til) {
        this.stroemme = this.stroemme.filter(function (s) { return s.fra !== fra; });
        this.stroemme.push({ fra: fra, til: til, t: 0.08 });
    };

    /* En draabe fra pipetten falder ned i kolben */
    P.slipDraabe = function (id, mL, stof) {
        var S = this.S;
        var p = this.pipPose(id);
        var ov = this.kolbeOverflade || (p.y + 100);
        this.draaber.push({ x: p.x, y: p.y + 2, vy: 40, maal: ov, stof: stof });
        Km.tilsaet(S.K, stof, mL, S.ur);
        if (stof === "en") {
            var T = S.K.T;
            if (T < 60 && !S.enKoldBesked) { S.enKoldBesked = true; }
        }
    };

    P.animer = function (dt) {
        var S = this.S, mig = this;
        /* Draaberne */
        this.draaber = this.draaber.filter(function (d) {
            d.vy += 900 * dt;
            d.y += d.vy * dt;
            if (d.y >= d.maal) {
                if (d.stof === "en") mig.skyer.push({ x: d.x, y: d.maal + 6, r: 4, a: 0.9 });
                return false;
            }
            return true;
        });
        this.skyer = this.skyer.filter(function (s) {
            s.r += 26 * dt;
            s.a -= 0.45 * dt;
            return s.a > 0;
        });
        /* Magneten drejer */
        var rundt = S.plade.omroer && S.magnet.sted === "kolbe" && S.kolbeSted === "plade" && !(this.greb && this.greb.id === "kolbe");
        if (rundt) this.magnetVinkel += dt * (this.hoppe > 0 ? 40 : 14);
        if (this.hoppe > 0) this.hoppe = Math.max(0, this.hoppe - dt);
        /* Bobler, naar det koger */
        if (S.K.kog > 0 && Math.random() < S.K.kog * dt * 30) {
            this.bobler.push({ u: Math.random(), y: 0, v: 0.6 + Math.random() * 0.6 });
        }
        this.bobler = this.bobler.filter(function (b) { b.y += b.v * dt; return b.y < 1 && S.K.kog > 0; });
        /* Smeltepunktsapparatet varmer */
        var A = S.app;
        if (A.taendt && this.trinNr === 9) {
            var fart = A.T < 112 ? 9 : 0.85;
            if (S.spol > 0) fart *= 3;
            A.T = Math.min(140, A.T + fart * dt);
        }
        /* Vaegten: displayet falder til ro, og vejningen skrives i skemaet */
        this.opdaterVaegt(dt);
        /* TLC-pladen under UV-lampen */
        var pl = S.tlc;
        if (pl.sted === "uv" && !(this.greb && this.greb.id === "plade")) {
            pl.uvT += dt;
            if (pl.uvT > 0.9 && pl.udviklet && !pl.set) {
                pl.set = true;
                pl.cirkler = true;
                this.logPlade();
            }
        }
    };

    P.opdaterVaegt = function (dt) {
        var S = this.S;
        if (this.trinNr !== 8) return;
        var paa = -1;
        for (var i = 0; i < 2; i++) {
            if (S.urglasSted[i] === "vaegt" && !(this.greb && this.greb.id === (i ? "urglas2" : "urglas")) && (i === 0 || S.urglas2)) paa = i;
        }
        var maal = paa >= 0 ? Km.urglasMasse(S.urglas[paa]) : 0;
        var foer = S.vaegtVis;
        S.vaegtVis += (maal - S.vaegtVis) * (1 - Math.exp(-10 * dt));
        if (Math.abs(S.vaegtVis - maal) < 0.004) S.vaegtVis = maal;
        if (Math.abs(S.vaegtVis - foer) < 1e-4 && paa >= 0) S.vaegtRo += dt; else S.vaegtRo = 0;
        if (paa >= 0 && S.vaegtRo > 0.35 && !S.vejetNu) {
            S.vejetNu = true;
            var U = S.urglas[paa];
            var m = rund2(Km.urglasMasse(U));
            if (U.mKryst <= 0) { U.vejetTom = true; S.vejninger.push({ m: m, tom: true, u: paa }); }
            else S.vejninger.push({ m: m, tom: false, u: paa, lampe: S.lampeTid[paa], w: U.w });
        }
        if (paa < 0) S.vejetNu = false;
    };

    /* ======================================================================
       TLC
       ====================================================================== */
    P.logPlade = function () {
        var S = this.S, pl = S.tlc;
        S.plader.push({
            nr: S.plader.length + 1,
            min: S.K.tEn !== null ? Math.max(0, Math.round(pl.tProeve - S.K.tEn)) : 0,
            P: pl.P, R: pl.R, front: pl.front
        });
    };

    /* Spoergsmaalet efter pladen. Giver hvilket svar der er rigtigt. */
    P.tlcVurdering = function () {
        var S = this.S, pl = S.tlc;
        var salIP = (pl.P || []).some(function (x) { return x.stof === "sal"; });
        var faerdig = pl.faerdig;
        if (!salIP) return { rigtig: 0, faerdig: true, tekst: D.TLC_SPM.faerdig };
        if (faerdig) return { rigtig: 1, faerdig: true, tekst: D.TLC_SPM.overskud };
        return { rigtig: 1, faerdig: false, tekst: D.TLC_SPM.ikkeFaerdig };
    };

    /* ======================================================================
       Smeltepunktet
       ====================================================================== */
    P.proevenSmp = function () {
        var S = this.S, A = S.app;
        if (!A.smp) {
            var U = S.urglas[S.aktivU];
            var u = Km.urenhed(S.tragt.aSal === null ? 0 : S.tragt.aSal, S.skyllet);
            A.smp = Km.smeltepunkt(U.w, u, S.skub);
            A.w = U.w; A.u = u;
        }
        return A.smp;
    };

    /* Hvor meget af proeven, der er smeltet (0-1) ved apparatets temperatur */
    P.smeltet = function () {
        var A = this.S.app, s = this.proevenSmp();
        if (A.T <= s.start) return 0;
        if (A.T >= s.slut) return 1;
        return (A.T - s.start) / (s.slut - s.start);
    };

    P.smpVurdering = function () {
        var A = this.S.app;
        var a = A.start, b = A.slut;
        var rent = a >= 125.5 && (b - a) <= 2.4;
        return { rigtig: rent ? 0 : 1, rent: rent, a: a, b: b, vaad: (A.w || 0) > 0.01 };
    };

    /* ======================================================================
       Musen
       ====================================================================== */
    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            var pt = mig.tilVerden(mig.L.punkt(e));
            mig.mus = pt;
            if (mig.greb) { mig.flyt(pt); return; }
            var u = mig.hvad(pt);
            c.style.cursor = u ? (u.klik ? "pointer" : "grab") : "default";
        });
        c.addEventListener("pointerleave", function () { mig.mus = null; });
        c.addEventListener("pointerdown", function (e) {
            if (e.button !== undefined && e.button !== 0) return;
            var pt = mig.tilVerden(mig.L.punkt(e));
            mig.mus = pt;
            var u = mig.hvad(pt);
            /* Laasen: under et gaet, et spoergsmaal og et groent kort blinker
               kortet ved et klik i scenen */
            if (mig.fase !== "forsoeg") { mig.spaer(); return; }
            if (!u) return;
            e.preventDefault();
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
            if (u.klik) { mig.klik(u.id); return; }
            if (u.hold) { mig.hold = { id: u.id, h: u.hold, t: u.hold === "sug" ? 0.2 : 0.3 }; return; }
            mig.grib(u.id, pt);
            c.style.cursor = "grabbing";
        });
        function slip(e) {
            if (mig.hold) { mig.hold = null; }
            if (!mig.greb) return;
            var pt = mig.tilVerden(mig.L.punkt(e));
            mig.slip(pt);
            c.style.cursor = "default";
        }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
    };

    /* Hvad er under musen? Det oeverste foerst. */
    P.hvad = function (pt) {
        var S = this.S, t = this.trinNr, mig = this;
        function k(id) { return inde(mig.kasse(id), pt.x, pt.y, 3); }
        /* Knapper */
        if (synlig("plade", t, S) && t >= 3 && (k("knap-varme"))) return { id: "knap-varme", klik: true };
        if (synlig("plade", t, S) && t >= 3 && (k("knap-omroer"))) return { id: "knap-omroer", klik: true };
        if (synlig("hane", t, S) && k("hane")) return { id: "hane", klik: true };
        if (synlig("app", t, S) && k("smp-knap")) return { id: "smp-knap", klik: true };
        if (synlig("app", t, S) && Math.hypot(pt.x - G.linse.x, pt.y - G.linse.y) < G.linse.r + 3) return { id: "linse", klik: true };
        var pips = ["pip2", "pip1"];
        for (var i = 0; i < pips.length; i++) {
            var id = pips[i], pp = S.pip[id];
            if (!synlig(id, t, S)) continue;
            if (pp.sted === "flaske" || pp.sted === "kolbe") {
                var kn = this.pipKnapper(id);
                if (pp.sted === "flaske" && inde(kn.sug, pt.x, pt.y, 2)) return { id: id, hold: "sug" };
                if (inde(kn.toem, pt.x, pt.y, 2)) return { id: id, hold: "toem" };
            }
            if (k(id)) return { id: id };
        }
        /* Ting, der kan traekkes, i omvendt tegneorden */
        var liste = ["roer", "spatel", "urglas2", "urglas", "sproejte", "spids-p", "spids-r", "plade",
                     "termo", "maaleglas", "fl-eth", "magnet", "kolbe"];
        for (i = 0; i < liste.length; i++) {
            var n = liste[i];
            var syn = n === "spids-p" || n === "spids-r" || n === "plade" ? synlig("tlc", t, S) : synlig(n, t, S);
            if (n === "termo" && S.termo.sted === "kolbe" && t >= 7) syn = false;
            if (n === "kolbe" && t < 6) syn = false;
            if (n === "kolbe" && t === 7 && S.haeldt && Km.rumfang(S.K) < 0.2 && S.skyllet) syn = false;
            if (!syn) continue;
            if (k(n)) return { id: n };
        }
        return null;
    };

    P.grib = function (id, pt) {
        var p;
        switch (id) {
            case "kolbe": p = this.kolbePose(); break;
            case "maaleglas": p = this.maaleglasPose(); break;
            case "fl-eth": p = this.flEthPose(); break;
            case "sproejte": p = this.sproejtePose(); break;
            case "termo": p = this.termoPose(); break;
            case "pip2": case "pip1": p = this.pipPose(id); break;
            case "magnet": p = this.magnetPos(); break;
            case "spids-p": p = this.spidsPose("p"); break;
            case "spids-r": p = this.spidsPose("r"); break;
            case "plade": p = this.pladePose(); break;
            case "urglas": p = this.urglasPose(0); break;
            case "urglas2": p = this.urglasPose(1); break;
            case "spatel": p = this.spatelPose(); break;
            case "roer": p = this.roerPose(); break;
        }
        if (id === "termo" && Math.abs(p.v || 0) > 1) {
            /* Termometret ligger ned: det rejser sig, saa spidsen er under musen */
            p = { x: pt.x, y: pt.y + 150, v: 0 };
        }
        this.greb = { id: id, x: p.x, y: p.y, dx: p.x - pt.x, dy: p.y - pt.y, pose: null, over: null };
        if (id === "kolbe" && this.S.termo.sted === "kolbe" && this.trinNr >= 7) this.S.termo.sted = "bord";
        this.tragtFuldVist = false;
        this.nulstilHjaelp();
        this.flyt(pt);
    };

    /* Musen flytter det, eleven holder. Holdes et glas over det, det skal
       haeldes i, saetter det sig i haeldestilling. */
    P.flyt = function (pt) {
        var g = this.greb, S = this.S, t = this.trinNr;
        g.x = pt.x + g.dx;
        g.y = pt.y + g.dy;
        g.pose = null;
        g.over = null;
        var k, mund;
        if (g.id === "fl-eth") {
            mund = { x: G.maaleglas.x, y: G.maaleglas.y };
            if (Math.abs(g.x - mund.x) < 70 && g.y > mund.y - 110 && g.y < mund.y + 60) {
                g.pose = { x: mund.x - 6, y: mund.y - 12, v: 1.95 };
                g.over = "maaleglas";
            }
        } else if (g.id === "maaleglas") {
            k = this.kolbePose();
            if (Math.abs(g.x - k.x) < 75 && g.y > k.y - 120 && g.y < k.y + 60) {
                g.pose = { x: k.x + 8, y: k.y - 14, v: -1.95 };
                g.over = "kolbe";
            }
        } else if (g.id === "kolbe" && t === 7) {
            if (Math.abs(pt.x - G.tragtRand.x) < 85 && pt.y > G.tragtRand.y - 110 && pt.y < G.tragtRand.y + 70) {
                g.pose = { x: G.tragtRand.x - 34, y: G.tragtRand.y - 24, v: 1.95 };
                g.over = "tragt";
            }
        } else if (g.id === "sproejte") {
            if (Math.abs(pt.x - G.tragtRand.x) < 75 && pt.y > G.tragtRand.y - 100 && pt.y < G.tragtRand.y + 60) {
                g.pose = { x: G.tragtRand.x + 10, y: G.tragtRand.y - 30, v: 0.25 };
                g.over = "tragt";
            } else {
                k = this.kolbePose();
                if (Math.abs(pt.x - k.x) < 70 && pt.y > k.y - 100 && pt.y < k.y + 80) {
                    g.pose = { x: k.x + 8, y: k.y - 26, v: 0.25 };
                    g.over = "kolbe";
                }
            }
        } else if (g.id === "spids-p" || g.id === "spids-r") {
            var sp = S.spids[g.id.slice(6)];
            k = this.kolbePose();
            if (Math.abs(g.x - k.x) < 18 && g.y > k.y + 4 && g.y < k.y + 120) sp.indhold = "kolbe";
            if (Math.abs(g.x - G.vial.x) < 14 && g.y > BORD - 78 && g.y < BORD) sp.indhold = "ref";
        } else if (g.id === "spatel") {
            this.spatelOver(g);
        } else if (g.id === "roer") {
            var U = S.urglas[S.aktivU];
            var up = this.urglasPose(S.aktivU);
            if (U.mKryst > 0 && Math.abs(g.x - up.x) < 45 && g.y > up.y - 40 && g.y < up.y + 6) {
                if (!S.roer.fyldt) { S.roer.fyldt = true; }
            }
        }
    };

    /* Spatlen: henter krystaller i tragten eller paa et urglas */
    P.spatelOver = function (g) {
        var S = this.S, sp = S.spatel;
        if (sp.m > 0) return;
        if (Math.abs(g.x - G.tragtMidt.x) < 50 && Math.abs(g.y - G.tragtMidt.y) < 30 && S.tragt.mKryst > 0.01) {
            sp.m = S.tragt.mKryst * 0.97;
            sp.w = S.tragt.w;
            sp.fra = "tragt";
            S.tragt.mKryst -= sp.m;
            return;
        }
        /* Fra det urglas, der ikke blev vejet, over paa det nye */
        if (S.urglas2 && S.aktivU === 1 && S.urglas[0].mKryst > 0) {
            var u0 = this.urglasPose(0);
            if (Math.abs(g.x - u0.x) < 50 && g.y > u0.y - 40 && g.y < u0.y + 8) {
                sp.m = S.urglas[0].mKryst * 0.98;
                sp.w = S.urglas[0].w;
                sp.fra = "urglas";
                S.urglas[0].mKryst = 0;
            }
        }
    };

    P.slip = function (pt) {
        var g = this.greb, S = this.S, t = this.trinNr;
        this.greb = null;
        var id = g.id, k;
        if (id === "magnet") {
            k = this.kolbePose();
            if (Math.abs(g.x - k.x) < 75 && g.y > k.y - 100 && g.y < k.y + 180) S.magnet.sted = "kolbe";
        } else if (id === "pip2" || id === "pip1") {
            var pp = S.pip[id];
            k = this.kolbePose();
            if (Math.abs(g.x - G.flaske.x) < 50 && g.y > BORD - 200 && g.y < BORD + 10) pp.sted = "flaske";
            else if (Math.abs(g.x - k.x) < 60 && g.y > k.y - 90 && g.y < k.y + 120) pp.sted = "kolbe";
            else pp.sted = "holder";
        } else if (id === "termo") {
            k = this.kolbePose();
            if (t <= 7 && Math.abs(g.x - k.x) < 70 && g.y - 150 > k.y - 160 && g.y - 150 < k.y + 120) S.termo.sted = "kolbe";
            else S.termo.sted = "bord";
        } else if (id === "spids-p" || id === "spids-r") {
            this.saetPlet(id.slice(6), g);
        } else if (id === "plade") {
            var pl = S.tlc;
            if (g.x > 650 && g.x < 770 && g.y > 340 && g.y < 470) {
                pl.sted = "kammer";
                if (!pl.iKammer) { pl.iKammer = true; pl.tProeve = pl.tProeve === undefined ? S.ur : pl.tProeve; }
            } else if (g.x > 800 && g.x < 960 && g.y > 330 && g.y < 480) {
                pl.sted = "uv"; pl.uvT = 0;
            } else pl.sted = "bord";
        } else if (id === "kolbe") {
            if (inde({ x: G.isbad.x - 10, y: G.isbad.y - 90, b: 230, h: 200 }, pt.x, pt.y)) S.kolbeSted = "isbad";
            else if (inde({ x: 90, y: 280, b: 260, h: 160 }, pt.x, pt.y) && t <= 6) S.kolbeSted = "plade";
        } else if (id === "urglas" || id === "urglas2") {
            var i = id === "urglas2" ? 1 : 0;
            if (inde({ x: 720, y: 290, b: 200, h: 160 }, pt.x, pt.y) && t === 8) S.urglasSted[i] = "vaegt";
            else if (inde({ x: 200, y: 330, b: 160, h: 130 }, pt.x, pt.y) && t === 8) S.urglasSted[i] = "lampe";
            else S.urglasSted[i] = "bord";
        } else if (id === "spatel") {
            this.spatelSlip(g);
        } else if (id === "roer") {
            if (Math.abs(g.x - G.slot.x) < 26 && g.y > G.slot.y - 30 && g.y < G.slot.y + 60) {
                S.roer.sted = "apparat";
                if (!S.roer.fyldt) this.kortBesked("Smeltepunktsrøret er tomt. Fyld først lidt krystaller i det.", 4);
            } else S.roer.sted = "holder";
            if (S.roer.sted === "apparat" && !S.roer.fyldt) S.roer.sted = "holder";
        }
        this.tjekTrin();
    };

    /* En plet paa TLC-pladen ved P eller R */
    P.saetPlet = function (hvilken, g) {
        var S = this.S, pl = S.tlc, sp = S.spids[hvilken];
        if (pl.sted !== "bord" || !sp.indhold) return;
        var mark = null;
        if (Math.hypot(g.x - G.markP.x, g.y - G.markP.y) < 16) mark = "P";
        else if (Math.hypot(g.x - G.markR.x, g.y - G.markR.y) < 16) mark = "R";
        if (!mark) return;
        if (mark === "P" && sp.indhold !== "kolbe") { this.kortBesked("Ved P skal der en prøve fra kolben. Referencen skal ved R.", 4); return; }
        if (mark === "R" && sp.indhold !== "ref") { this.kortBesked("Ved R skal der en prøve fra referenceglasset. Prøven fra kolben skal ved P.", 4); return; }
        if (mark === "P") {
            pl.P = Km.tlcProeve(S.K);
            pl.faerdig = Km.faerdig(S.K);
            pl.tProeve = S.ur;
        } else pl.R = Km.tlcReference();
        sp.indhold = null;
    };

    P.spatelSlip = function (g) {
        var S = this.S, sp = S.spatel;
        if (sp.m <= 0) return;
        /* Over hvilket urglas? */
        for (var i = 1; i >= 0; i--) {
            if (i === 1 && !S.urglas2) continue;
            if (sp.fra === "urglas" && i === 0) continue;
            var up = this.urglasPose(i);
            if (Math.abs(g.x - up.x) < 60 && g.y > up.y - 50 && g.y < up.y + 10) {
                var U = S.urglas[i];
                U.mKryst += sp.m;
                U.w = sp.w;
                sp.m = 0; sp.fra = null;
                if (!U.vejetTom && i === 0) {
                    /* Urglasset blev ikke vejet tomt */
                    S.urglas2 = true;
                    S.aktivU = 1;
                    this.kortBesked(D.BESKED.ikkeVejet, 7);
                } else S.aktivU = i;
                return;
            }
        }
    };

    /* Klik paa knapper i scenen */
    P.klik = function (id) {
        var S = this.S;
        if (id === "knap-varme") {
            S.plade.varme = !S.plade.varme;
        } else if (id === "knap-omroer") {
            S.plade.omroer = !S.plade.omroer;
            /* Paaskeaeg: fire klik paa knappen hurtigt efter hinanden giver fuld
               fart, og magnetloppen hopper */
            var nu = this.tid;
            this.klikTider = this.klikTider.filter(function (x) { return nu - x < 2.2; });
            this.klikTider.push(nu);
            if (this.klikTider.length >= 5 && S.magnet.sted === "kolbe") {
                this.hoppe = 3;
                S.plade.omroer = true;
                this.klikTider = [];
                this.kortBesked("Fuld fart: magnetloppen hopper i kolben. Den falder til ro igen.", 3);
            }
        } else if (id === "hane") {
            S.sug = !S.sug;
        } else if (id === "smp-knap") {
            if (S.roer.sted !== "apparat") { this.kortBesked("Sæt først smeltepunktsrøret i apparatet.", 3); return; }
            S.app.taendt = !S.app.taendt;
        } else if (id === "linse") {
            this.klikLinse();
        }
        this.tjekTrin();
    };

    P.klikLinse = function () {
        var S = this.S, A = S.app;
        if (!A.taendt || S.roer.sted !== "apparat") { this.kortBesked("Tænd først for smeltepunktsapparatet.", 3); return; }
        var s = this.proevenSmp();
        if (A.start === null) {
            if (A.T < s.start - 1.2) { this.kortBesked("Krystallerne er ikke begyndt at smelte endnu. Se godt efter i linsen.", 3); return; }
            A.start = Math.round(A.T * 10) / 10;
        } else if (A.slut === null) {
            if (A.T < s.slut - 0.6) { this.kortBesked("Der er stadig faste krystaller i linsen. Vent, til alt er klar væske.", 3); return; }
            A.slut = Math.round(A.T * 10) / 10;
            A.taendt = false;
        }
    };

    /* ======================================================================
       Tegning
       ====================================================================== */
    P.tegn = function () {
        var L = this.L, ctx = L.ctx, l = this.lay;
        if (!l) return;
        L.ryd("#14141a");
        ctx.save();
        ctx.translate(l.ox, l.oy);
        ctx.scale(l.s, l.s);
        this.tegnRum(ctx);
        this.tegnUdstyr(ctx);
        ctx.restore();
        this.tegnSejr(ctx, l.W, l.H);
    };

    P.tegnRum = function (ctx) {
        var l = this.lay;
        /* Vaeggen fylder hele laerredet over bordet */
        var top = -l.oy / l.s, bredV = -l.ox / l.s;
        var vg = ctx.createLinearGradient(0, top, 0, BORD);
        vg.addColorStop(0, "#16171d");
        vg.addColorStop(1, "#22242d");
        ctx.fillStyle = vg;
        ctx.fillRect(bredV, top, l.W / l.s, BORD - top);
        /* Fliser bag bordet */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
        ctx.lineWidth = 1;
        for (var x = Math.floor(bredV / 60) * 60; x < bredV + l.W / l.s; x += 60) {
            ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, BORD - 8); ctx.stroke();
        }
        for (var y = 300; y < BORD; y += 40) {
            ctx.beginPath(); ctx.moveTo(bredV, y); ctx.lineTo(bredV + l.W / l.s, y); ctx.stroke();
        }
        /* Bordet */
        var bg = ctx.createLinearGradient(0, BORD - 8, 0, VH + 40);
        bg.addColorStop(0, "#3b3f4b");
        bg.addColorStop(0.18, "#30333d");
        bg.addColorStop(1, "#24262e");
        ctx.fillStyle = bg;
        ctx.fillRect(bredV, BORD - 8, l.W / l.s, VH - BORD + 60);
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(bredV, BORD - 8, l.W / l.s, 1.5);
    };

    P.tegnUdstyr = function (ctx) {
        var S = this.S, t = this.trinNr, g = this.greb;
        var holdt = function (id) { return g && g.id === id; };

        /* Vaeggen: roeret med vakuum og hanen */
        if (synlig("hane", t, S)) this.tegnHane(ctx);

        /* Opstillingen til venstre */
        if (synlig("plade", t, S)) this.tegnPlade(ctx);
        if (synlig("isbad", t, S)) NK.Sprites.tegn(ctx, "isbad_bag", G.isbad.x, G.isbad.y, 1);
        if (synlig("kolbe", t, S) && !holdt("kolbe")) this.tegnKolbe(ctx);
        if (synlig("isbad", t, S)) NK.Sprites.tegn(ctx, "isbad_for", G.isbad.x, G.isbad.y, 1);
        if (synlig("stativ", t, S)) NK.Sprites.tegn(ctx, "stativ", 42, 10, 1);
        if (synlig("termo", t, S) && S.termo.sted === "kolbe" && !holdt("termo") && !holdt("kolbe")) this.tegnTermo(ctx);

        /* Trin 2 og 5: flaske og pipette */
        if (synlig("fl-sal", t, S)) this.tegnBrunFlaske(ctx, "fl-sal");
        if (synlig("fl-en", t, S)) this.tegnBrunFlaske(ctx, "fl-en");
        if (synlig("pip2", t, S) || synlig("pip1", t, S)) this.tegnHolder(ctx);
        if (synlig("pip2", t, S) && !holdt("pip2")) this.tegnPipette(ctx, "pip2");
        if (synlig("pip1", t, S) && !holdt("pip1")) this.tegnPipette(ctx, "pip1");

        /* Trin 3: ethanol og maaleglas */
        if (synlig("maaleglas", t, S) && !holdt("maaleglas")) this.tegnMaaleglas(ctx);
        if (synlig("fl-eth", t, S) && !holdt("fl-eth")) this.tegnFlEth(ctx);

        /* Trin 6: TLC */
        if (synlig("tlc", t, S)) this.tegnTLC(ctx);

        /* Trin 8 og 9: sugefiltreringen */
        if (synlig("filter", t, S)) this.tegnFilter(ctx);
        if (synlig("sproejte", t, S) && !holdt("sproejte")) this.tegnSproejte(ctx);

        /* Trin 9 */
        if (synlig("vaegt", t, S)) this.tegnVaegt(ctx);
        if (synlig("lampe", t, S)) this.tegnLampe(ctx);
        if (synlig("urglas2", t, S) && !holdt("urglas2")) this.tegnUrglas(ctx, 1);
        if (synlig("urglas", t, S) && !holdt("urglas")) this.tegnUrglas(ctx, 0);

        /* Trin 10 */
        if (synlig("app", t, S)) this.tegnApparat(ctx);
        if (synlig("roer", t, S)) this.tegnRoerHolder(ctx);
        if (synlig("roer", t, S) && !holdt("roer") && S.roer.sted !== "apparat") this.tegnRoer(ctx);

        /* Det, der ligger foran paa bordet */
        if (synlig("magnet", t, S) && !holdt("magnet")) this.tegnMagnetBord(ctx);
        if (synlig("termo", t, S) && S.termo.sted === "bord" && !holdt("termo")) this.tegnTermo(ctx);
        if (synlig("spatel", t, S) && !holdt("spatel")) this.tegnSpatel(ctx);

        /* Draaber og stroemme */
        this.tegnStroemme(ctx);
        this.tegnDraaber(ctx);

        /* Det, eleven holder, oeverst */
        if (g) this.tegnHoldt(ctx, g.id);

        /* Aflaesninger, knapper, ringe og skilte */
        this.tegnAflaesning(ctx);
        this.tegnHjaelp(ctx);
    };

    P.tegnHoldt = function (ctx, id) {
        switch (id) {
            case "kolbe": this.tegnKolbe(ctx); if (this.S.termo.sted === "kolbe") this.tegnTermo(ctx); break;
            case "maaleglas": this.tegnMaaleglas(ctx); break;
            case "fl-eth": this.tegnFlEth(ctx); break;
            case "sproejte": this.tegnSproejte(ctx); break;
            case "termo": this.tegnTermo(ctx); break;
            case "pip2": case "pip1": this.tegnPipette(ctx, id); break;
            case "magnet": this.tegnMagnetBord(ctx); break;
            case "spids-p": case "spids-r": this.tegnSpids(ctx, id.slice(6)); break;
            case "plade": this.tegnPladeTLC(ctx); break;
            case "urglas": this.tegnUrglas(ctx, 0); break;
            case "urglas2": this.tegnUrglas(ctx, 1); break;
            case "spatel": this.tegnSpatel(ctx); break;
            case "roer": this.tegnRoer(ctx); break;
        }
    };

    /* ----- Magnetomroereren ---------------------------------------------------- */
    P.tegnPlade = function (ctx) {
        var S = this.S;
        NK.Sprites.tegn(ctx, "varmeplade", G.plade.x, G.plade.y, 1);
        /* Pladen gloeder, naar den er varm */
        var gl = NK.klamp((S.plade.T - 30) / 70, 0, 1);
        if (gl > 0) {
            ctx.fillStyle = "rgba(255, 110, 40, " + (0.55 * gl).toFixed(3) + ")";
            NK.rundtRekt(ctx, G.plade.x + 8, G.plade.y, 224, 10, 3);
            ctx.fill();
        }
        /* Drejeknapperne */
        this.tegnKnap(ctx, G.knapVarme, S.plade.varme, "#e6892a");
        this.tegnKnap(ctx, G.knapOmroer, S.plade.omroer, "#3d9ee0");
        /* Lamperne */
        ctx.fillStyle = S.plade.varme ? "#ff8a3d" : "#2a2f37";
        ctx.beginPath(); ctx.arc(G.plade.x + 36, G.plade.y + 36, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = S.plade.omroer ? "#5ab8ff" : "#2a2f37";
        ctx.beginPath(); ctx.arc(G.plade.x + 204, G.plade.y + 36, 4, 0, Math.PI * 2); ctx.fill();
    };

    P.tegnKnap = function (ctx, k, til, farve) {
        ctx.save();
        var gr = ctx.createRadialGradient(k.x - 4, k.y - 4, 2, k.x, k.y, k.r);
        gr.addColorStop(0, "#5b6270");
        gr.addColorStop(1, "#262a33");
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(k.x, k.y, 13, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = til ? farve : "#7e8590";
        ctx.lineWidth = 2;
        ctx.stroke();
        var v = til ? 0.6 : -2.3;
        ctx.strokeStyle = til ? farve : "#c8ced6";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(k.x + Math.cos(v) * 3, k.y + Math.sin(v) * 3);
        ctx.lineTo(k.x + Math.cos(v) * 10, k.y + Math.sin(v) * 10);
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Kolben ----------------------------------------------------------------- */
    /* Farven paa en opløsning med c g Salenvir pr. 100 mL: fra klar over
       lysegul til kraftigt gul. Uden Salenvir er den klar (med
       salicylaldehyd en anelse gullig). */
    function gulFarve(c, sal) {
        var base = sal ? [232, 230, 205, 0.24] : [205, 220, 236, 0.2];
        var lys = [252, 238, 165, 0.5], staerk = [255, 212, 40, 0.88];
        var g = NK.klamp(c / 0.6, 0, 1);
        if (g < 0.3) return Tg.bland(base, lys, g / 0.3);
        return Tg.bland(lys, staerk, Math.pow((g - 0.3) / 0.7, 0.8));
    }

    P.vaeskeFarve = function (K) {
        var V = Math.max(1, K.vEth);
        return gulFarve(Km.mOploest(K) / V * 100, K.vSal > 0.01);
    };

    P.tegnKolbe = function (ctx) {
        var S = this.S, K = S.K, p = this.kolbePose();
        var d = UDSTYR.kolbe, top = tl("kolbe", p);
        var pkt = indre("kolbe", KOLBE_INDRE, p);
        var V = Km.rumfang(K);
        var f = V / 250;
        var farve = this.vaeskeFarve(K);
        var ov = null;
        if (f > 0) ov = Tg.fyld(ctx, pkt, f, Tg.rgba(farve));
        this.kolbeOverflade = ov ? ov.y : (p.y + 170);
        /* Bobler, naar det koger */
        if (ov && !p.v && S.K.kog > 0) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
            ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
            ctx.lineWidth = 1;
            var bund = p.y + 168;
            this.bobler.forEach(function (b) {
                var x = p.x - 40 + b.u * 80, y = bund - (bund - ov.y) * b.y;
                ctx.beginPath(); ctx.arc(x, y, 2.2 + b.y * 1.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            });
            /* Damp over aabningen */
            ctx.strokeStyle = "rgba(255, 255, 255, " + (0.12 * S.K.kog).toFixed(3) + ")";
            ctx.lineWidth = 6;
            for (var i = 0; i < 3; i++) {
                var fase = this.tid * 1.3 + i * 2.1, h = (fase % 1);
                ctx.beginPath();
                ctx.moveTo(p.x - 8 + i * 8, p.y - 4 - h * 30);
                ctx.quadraticCurveTo(p.x + Math.sin(fase * 3) * 10, p.y - 18 - h * 30, p.x - 4 + i * 6, p.y - 34 - h * 30);
                ctx.stroke();
            }
        }
        /* Gule skyer, hvor draaberne af ethylendiamin rammer */
        this.skyer.forEach(function (s) {
            var gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
            gr.addColorStop(0, "rgba(250, 205, 30, " + (0.8 * s.a).toFixed(3) + ")");
            gr.addColorStop(1, "rgba(250, 205, 30, 0)");
            ctx.fillStyle = gr;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        });
        /* Krystallerne */
        this.tegnKrystaller(ctx, p, pkt, ov);
        /* Magneten */
        if (S.magnet.sted === "kolbe" && !p.v) this.tegnMagnet(ctx, p.x, p.y + 168, true);
        Tg.drejetSprite(ctx, "kolbe", top.x, top.y, d.s, p.v || 0, p.x, p.y);
    };

    /* Gule krystaller: i bunden, eller rundt i vaesken, naar der roeres */
    P.tegnKrystaller = function (ctx, p, pkt, ov) {
        var K = this.S.K;
        if (K.mKryst < 0.01 || !ov) return;
        var n = Math.round(NK.klamp(K.mKryst / 1.7, 0, 1) * 90) + 4;
        var roerer = this.S.plade.omroer && this.S.kolbeSted === "plade" && this.S.magnet.sted === "kolbe" && !p.v;
        ctx.save();
        Tg.sti(ctx, ov.pkt);
        ctx.clip();
        var bund = Math.max.apply(null, ov.pkt.map(function (q) { return q[1]; }));
        var minX = Math.min.apply(null, ov.pkt.map(function (q) { return q[0]; }));
        var maxX = Math.max.apply(null, ov.pkt.map(function (q) { return q[0]; }));
        /* En bunke i bunden */
        if (!roerer && !p.v) {
            var hb = NK.klamp(K.mKryst * 6, 2, 14);
            ctx.fillStyle = "rgba(240, 196, 30, 0.9)";
            ctx.beginPath();
            ctx.moveTo(minX, bund);
            ctx.quadraticCurveTo((minX + maxX) / 2, bund - hb * 2, maxX, bund);
            ctx.closePath();
            ctx.fill();
        }
        for (var i = 0; i < n; i++) {
            var r1 = ((i * 9301 + 49297) % 233280) / 233280, r2 = ((i * 4253 + 7919) % 1000) / 1000;
            var x, y;
            if (roerer) {
                var v = this.tid * (1.2 + r2) + r1 * 6.28;
                x = (minX + maxX) / 2 + Math.sin(v) * (maxX - minX) * 0.38 * (0.4 + r1 * 0.6);
                y = ov.y + 6 + (bund - ov.y - 10) * (0.25 + 0.75 * r2);
            } else {
                x = minX + 6 + (maxX - minX - 12) * r1;
                y = bund - 2 - r2 * 9;
            }
            ctx.fillStyle = i % 3 ? "rgba(250, 210, 40, 0.95)" : "rgba(255, 232, 120, 0.95)";
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(r1 * 6 + (roerer ? this.tid * 2 : 0));
            ctx.fillRect(-2.6, -1.1, 5.2, 2.2);
            ctx.restore();
        }
        ctx.restore();
    };

    P.tegnMagnet = function (ctx, x, y, iKolbe) {
        var b = 13;
        var hop = this.hoppe > 0 && iKolbe ? Math.abs(Math.sin(this.tid * 18)) * 18 : 0;
        if (iKolbe) b = 13 * Math.abs(Math.cos(this.magnetVinkel)) + 4;
        ctx.save();
        ctx.fillStyle = "#f4f6f8";
        ctx.strokeStyle = "#9aa4b0";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, x - b, y - 7 - hop, 2 * b, 7, 3.5);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };

    P.tegnMagnetBord = function (ctx) {
        var p = this.magnetPos();
        ctx.save();
        ctx.fillStyle = "#f4f6f8";
        ctx.strokeStyle = "#9aa4b0";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, p.x - 15, p.y - 4, 30, 8, 4);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Termometret ----------------------------------------------------------------- */
    P.tegnTermo = function (ctx) {
        var p = this.termoPose(), d = UDSTYR.termo, t0 = tl("termo", p);
        Tg.drejetSprite(ctx, "termometer", t0.x, t0.y, d.s, p.v || 0, p.x, p.y);
        if (Math.abs(p.v || 0) > 1) return;
        /* Displayet: temperaturen i kolben, ellers i rummet */
        var T = this.S.termo.sted === "kolbe" && !(this.greb && this.greb.id === "termo") ? this.S.K.T : Km.STUE;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v || 0);
        ctx.translate(-p.x, -p.y);
        ctx.fillStyle = "#9ff0c0";
        ctx.font = "700 14px " + Tg.SKRIFT;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(D.komma(T, 1), t0.x + 30 * d.s, t0.y + 21.5 * d.s);
        ctx.fillStyle = "#e6edf3";
        ctx.font = "700 9px " + Tg.SKRIFT;
        ctx.fillText("°C", t0.x + 47 * d.s, t0.y + 47 * d.s);
        ctx.restore();
    };

    /* ----- Flasker og pipetter ------------------------------------------------------------- */
    P.tegnBrunFlaske = function (ctx, id) {
        var x = G.flaske.x - 40, y = BORD - 150;
        NK.Sprites.tegn(ctx, "flaske_brun", x, y, 1);
        Tg.etiket(ctx, x + 11, y + 70, 58, 54, D.ETIKET[id], { str: 10.5, fare: id === "fl-en" });
    };

    P.tegnHolder = function (ctx) {
        var x = G.holder.x;
        ctx.save();
        var gr = ctx.createLinearGradient(0, BORD - 22, 0, BORD);
        gr.addColorStop(0, "#9b7448");
        gr.addColorStop(1, "#6e4f2e");
        ctx.fillStyle = gr;
        NK.rundtRekt(ctx, x - 26, BORD - 20, 52, 20, 3);
        ctx.fill();
        ctx.fillStyle = "#2a1d10";
        ctx.beginPath(); ctx.ellipse(x, BORD - 20, 6, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    };

    P.tegnPipette = function (ctx, id) {
        var S = this.S, pp = S.pip[id], p = this.pipPose(id);
        var x = p.x, tip = p.y, top = tip - PIP_L;
        var nul = tip - 16, skala = 110 / pp.cap;
        ctx.save();
        /* Vaesken */
        if (pp.V > 0.001) {
            var lvl = nul - pp.V * skala;
            ctx.fillStyle = pp.stof === "en" ? "rgba(225, 235, 245, 0.55)" : "rgba(240, 232, 190, 0.6)";
            ctx.beginPath();
            ctx.moveTo(x - 0.8, tip);
            ctx.lineTo(x - 2, tip - 14);
            ctx.lineTo(x - 2, lvl);
            ctx.lineTo(x + 2, lvl);
            ctx.lineTo(x + 2, tip - 14);
            ctx.lineTo(x + 0.8, tip);
            ctx.closePath();
            ctx.fill();
        }
        /* Glasset */
        ctx.strokeStyle = "rgba(220, 236, 248, 0.85)";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(x - 3.5, top + 6);
        ctx.lineTo(x - 3.5, tip - 14);
        ctx.lineTo(x - 1, tip);
        ctx.lineTo(x + 1, tip);
        ctx.lineTo(x + 3.5, tip - 14);
        ctx.lineTo(x + 3.5, top + 6);
        ctx.stroke();
        ctx.fillStyle = "rgba(212, 235, 250, 0.08)";
        ctx.fillRect(x - 3.5, top + 6, 7, PIP_L - 20);
        /* Inddelingen */
        ctx.strokeStyle = "rgba(238, 246, 252, 0.7)";
        ctx.lineWidth = 0.8;
        for (var v = 0; v <= pp.cap + 1e-6; v += 0.1) {
            var y = nul - v * skala;
            var lang = Math.abs(v * 2 - Math.round(v * 2)) < 1e-6;
            ctx.beginPath();
            ctx.moveTo(x - 3.5, y);
            ctx.lineTo(x - 3.5 + (lang ? 5 : 2.8), y);
            ctx.stroke();
        }
        ctx.restore();
        /* Bolden */
        NK.Sprites.tegn(ctx, "bold", x - 22 * 0.75, top - 62 * 0.75 + 8, 0.75);
    };

    P.tegnMaaleglas = function (ctx) {
        var S = this.S, p = this.maaleglasPose(), d = UDSTYR.maaleglas, t0 = tl("maaleglas", p);
        var pkt = indre("maaleglas", MAALEGLAS_INDRE, p);
        if (S.maaleglas.V > 0) Tg.fyld(ctx, pkt, S.maaleglas.V / 116.7, "rgba(212, 228, 242, 0.32)");
        Tg.drejetSprite(ctx, "maaleglas100", t0.x, t0.y, d.s, p.v || 0, p.x, p.y);
    };

    P.tegnFlEth = function (ctx) {
        var p = this.flEthPose(), d = UDSTYR["fl-eth"], t0 = tl("fl-eth", p);
        var pkt = indre("fl-eth", FLASKE_INDRE, p);
        Tg.fyld(ctx, pkt, 0.62, "rgba(212, 228, 242, 0.26)");
        Tg.drejetSprite(ctx, "flaske_klar", t0.x, t0.y, d.s, p.v || 0, p.x, p.y);
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.v || 0); ctx.translate(-p.x, -p.y);
        Tg.etiket(ctx, t0.x + 14 * d.s, t0.y + 112 * d.s, 72 * d.s, 50 * d.s, D.ETIKET["fl-eth"], { str: 11 });
        ctx.restore();
    };

    P.tegnSproejte = function (ctx) {
        var p = this.sproejtePose(), d = UDSTYR.sproejte, t0 = tl("sproejte", p);
        Tg.drejetSprite(ctx, "sproejteflaske", t0.x, t0.y, d.s, p.v || 0, p.x, p.y);
    };

    /* ----- TLC ------------------------------------------------------------------------- */
    P.tegnTLC = function (ctx) {
        var S = this.S, g = this.greb;
        /* Holderen med pipettespidserne: et lille glas */
        var hx = G.spidsHolder.x;
        ctx.save();
        ctx.fillStyle = "rgba(212, 235, 250, 0.1)";
        ctx.strokeStyle = "rgba(220, 236, 248, 0.8)";
        ctx.lineWidth = 1.3;
        NK.rundtRekt(ctx, hx - 22, BORD - 36, 44, 36, 4);
        ctx.fill(); ctx.stroke();
        ctx.restore();
        if (!(g && g.id === "spids-p")) this.tegnSpids(ctx, "p");
        if (!(g && g.id === "spids-r")) this.tegnSpids(ctx, "r");
        Tg.tekst(ctx, "Spidser", hx, BORD + 14, { str: 11, farve: "#a9b0ba" });
        /* Referenceglasset */
        var vx = G.vial.x - 20, vy = BORD - 80;
        var vp = Tg.flyt(VIAL_INDRE, vx, vy, 1);
        Tg.fyld(ctx, vp, 0.55, "rgba(236, 232, 205, 0.3)");
        NK.Sprites.tegn(ctx, "vial", vx, vy, 1);
        Tg.etiket(ctx, vx + 7, vy + 38, 26, 18, ["R"], { str: 10 });
        Tg.tekst(ctx, "Reference", G.vial.x, BORD + 14, { str: 11, farve: "#a9b0ba" });
        /* Glasset med loebevaeske og filtrerpapir */
        var kx = G.kammer.x, ky = G.kammer.y;
        ctx.fillStyle = "rgba(245, 246, 240, 0.16)";
        ctx.fillRect(kx + 14, ky + 24, 72, 88);
        ctx.fillStyle = "rgba(200, 220, 240, 0.28)";
        ctx.fillRect(kx + 11, ky + 106, 79, 8.5);
        if (S.tlc.sted === "kammer" && !(g && g.id === "plade")) this.tegnPladeTLC(ctx);
        NK.Sprites.tegn(ctx, "baegerglas", kx, ky, 0.5);
        NK.Sprites.tegn(ctx, "urglas", kx - 5, ky - 6, 0.5);
        Tg.tekst(ctx, "Løbevæske", kx + 50, BORD + 14, { str: 11, farve: "#a9b0ba" });
        /* UV-lampen */
        var uvTaendt = S.tlc.sted === "uv" && !(g && g.id === "plade");
        if (uvTaendt) {
            var gr = ctx.createLinearGradient(0, G.uv.y + 36, 0, BORD);
            gr.addColorStop(0, "rgba(170, 120, 255, 0.45)");
            gr.addColorStop(1, "rgba(170, 120, 255, 0.05)");
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.moveTo(G.uv.x + 18, G.uv.y + 37);
            ctx.lineTo(G.uv.x + 144, G.uv.y + 37);
            ctx.lineTo(G.uv.x + 156, BORD);
            ctx.lineTo(G.uv.x + 6, BORD);
            ctx.closePath();
            ctx.fill();
        }
        NK.Sprites.tegn(ctx, "uvlampe", G.uv.x, G.uv.y, 0.9);
        if (uvTaendt) {
            ctx.fillStyle = "rgba(200, 160, 255, 0.95)";
            ctx.fillRect(G.uv.x + 16, G.uv.y + 32.5, 130, 5);
        }
        /* Pladen paa bordet eller under lampen */
        if (S.tlc.sted !== "kammer" && !(g && g.id === "plade")) this.tegnPladeTLC(ctx);
    };

    P.tegnSpids = function (ctx, id) {
        var p = this.spidsPose(id), sp = this.S.spids[id];
        ctx.save();
        ctx.strokeStyle = "rgba(225, 238, 248, 0.9)";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y - 70);
        ctx.stroke();
        ctx.fillStyle = id === "p" ? "#3d9ee0" : "#9b6bd6";
        NK.rundtRekt(ctx, p.x - 3.5, p.y - 76, 7, 12, 2);
        ctx.fill();
        if (sp.indhold) {
            ctx.fillStyle = sp.indhold === "kolbe" ? "rgba(250, 210, 50, 0.95)" : "rgba(240, 236, 210, 0.95)";
            ctx.fillRect(p.x - 1.3, p.y - 10, 2.6, 10);
        }
        ctx.restore();
    };

    /* TLC-pladen: 50 x 110, ankeret er bundens midte */
    P.tegnPladeTLC = function (ctx) {
        var S = this.S, pl = S.tlc, p = this.pladePose();
        var x0 = p.x - 25, y0 = p.y - 110, b = 50, h = 110;
        var uv = pl.sted === "uv" && !(this.greb && this.greb.id === "plade");
        ctx.save();
        ctx.fillStyle = uv ? "#a8f0b0" : "#f2f2ec";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 0.8;
        ctx.fillRect(x0, y0, b, h);
        ctx.strokeRect(x0, y0, b, h);
        /* Loebevaeskens front */
        var linje = p.y - 14, frontY = linje - (linje - y0 - 4) * pl.front;
        if (pl.front > 0) {
            ctx.fillStyle = uv ? "rgba(60, 140, 80, 0.12)" : "rgba(160, 175, 190, 0.18)";
            ctx.fillRect(x0, frontY, b, p.y - frontY);
            if (pl.cirkler || pl.sted === "kammer") {
                ctx.strokeStyle = "rgba(90, 90, 90, 0.6)";
                ctx.setLineDash([3, 2]);
                ctx.beginPath(); ctx.moveTo(x0, frontY); ctx.lineTo(x0 + b, frontY); ctx.stroke();
                ctx.setLineDash([]);
            }
        }
        /* Blyantsstregen og bogstaverne */
        ctx.strokeStyle = "#555a60";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0 + 3, linje); ctx.lineTo(x0 + b - 3, linje); ctx.stroke();
        ctx.fillStyle = "#3a3f45";
        ctx.font = "700 9px " + Tg.SKRIFT;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        var px = x0 + 17, rx = x0 + 37;
        ctx.fillText("P", px, linje + 2);
        ctx.fillText("R", rx, linje + 2);
        /* Pletterne */
        var mig = this;
        function pletter(liste, lx) {
            if (!liste) return;
            liste.forEach(function (s) {
                var y = linje - (linje - frontY) * s.rf * (pl.front > 0 ? 1 : 0);
                if (pl.front <= 0.05) y = linje;
                mig.tegnPlet(ctx, lx, y, s, uv, pl.cirkler && uv);
            });
        }
        pletter(pl.P, px);
        pletter(pl.R, rx);
        ctx.restore();
    };

    P.tegnPlet = function (ctx, x, y, s, uv, cirkel) {
        ctx.save();
        if (uv) {
            ctx.fillStyle = "rgba(60, 30, 110, " + (0.85 * s.styrke).toFixed(3) + ")";
            ctx.beginPath(); ctx.ellipse(x, y, 5.5, 4, 0, 0, Math.PI * 2); ctx.fill();
        } else if (s.stof === "salen") {
            ctx.fillStyle = "rgba(235, 190, 20, " + (0.6 * s.styrke).toFixed(3) + ")";
            ctx.beginPath(); ctx.ellipse(x, y, 5, 3.6, 0, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = "rgba(120, 120, 110, 0.18)";
            ctx.beginPath(); ctx.ellipse(x, y, 3.5, 2.6, 0, 0, Math.PI * 2); ctx.fill();
        }
        if (cirkel) {
            ctx.strokeStyle = "#4a4f55";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.ellipse(x, y, 8, 6, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
    };

    /* ----- Sugefiltreringen ----------------------------------------------------------- */
    P.tegnHane = function (ctx) {
        var S = this.S;
        ctx.save();
        var gr = ctx.createLinearGradient(G.hane.x + 72, 0, G.hane.x + 83, 0);
        gr.addColorStop(0, "#7b8591"); gr.addColorStop(0.45, "#e6ebf0"); gr.addColorStop(1, "#6a7480");
        ctx.fillStyle = gr;
        ctx.fillRect(G.hane.x + 72, -200, 10.8, BORD + 200);
        ctx.restore();
        NK.Sprites.tegn(ctx, "vakuumhane", G.hane.x, G.hane.y, 0.9);
        /* Haandtaget */
        var v = S.sug ? -Math.PI / 2 : 0;
        ctx.save();
        ctx.translate(G.haandtag.x, G.haandtag.y);
        ctx.rotate(v);
        ctx.fillStyle = S.sug ? "#3fae72" : "#e05446";
        NK.rundtRekt(ctx, -4, -4, 34, 8, 4);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#c99a3a";
        ctx.beginPath(); ctx.arc(G.haandtag.x, G.haandtag.y, 5, 0, Math.PI * 2); ctx.fill();
        Tg.tekst(ctx, S.sug ? "Åben" : "Lukket", G.hane.x + 48, G.hane.y + 108, { str: 11, farve: S.sug ? "#7ee0a8" : "#ffb3aa", vaegt: "700" });
    };

    P.tegnFilter = function (ctx) {
        var S = this.S, Tr = S.tragt;
        /* Filtratet i sugekolben */
        var sk = { x: G.sugekolbe.x, y: G.sugekolbe.y };
        var pkt = Tg.flyt(KOLBE_INDRE, sk.x, sk.y, 0.9);
        if (Tr.filtrat > 0.1) {
            var c = Tr.filtratSalen / Math.max(1, Tr.filtrat) * 100;
            Tg.fyld(ctx, pkt, Tr.filtrat / 250, Tg.rgba(gulFarve(c, false)));
        }
        /* Slangen fra sugekolben til hanen */
        if (synlig("hane", this.trinNr, S)) {
            ctx.save();
            ctx.strokeStyle = "rgba(170, 60, 50, 0.9)";
            ctx.lineWidth = 7;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(G.armEnde.x - 4, G.armEnde.y);
            ctx.bezierCurveTo(G.armEnde.x + 50, G.armEnde.y + 40, G.dyse.x - 60, G.dyse.y + 40, G.dyse.x + 2, G.dyse.y);
            ctx.stroke();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "sugekolbe", sk.x, sk.y, 0.9);
        NK.Sprites.tegn(ctx, "buechner", G.tragt.x, G.tragt.y, 0.9);
        /* Indholdet i tragten: papiret, vaesken og krystallerne */
        var m = G.tragtMidt;
        ctx.save();
        ctx.fillStyle = Tr.vaad ? "#cfd6dc" : "#f4f5f2";
        ctx.beginPath(); ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2); ctx.fill();
        if (Tr.mKryst > 0.005) {
            var tyk = NK.klamp(Tr.mKryst / 1.6, 0.15, 1);
            var vaad = NK.klamp(Tr.w / 0.9, 0, 1);
            ctx.fillStyle = Tg.rgba(Tg.bland([250, 214, 50, 1], [196, 150, 20, 1], vaad));
            ctx.beginPath(); ctx.ellipse(m.x, m.y, m.rx * (0.55 + 0.4 * tyk), m.ry * (0.55 + 0.4 * tyk), 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "rgba(255, 240, 160, 0.8)";
            for (var i = 0; i < 18; i++) {
                var a = i * 2.39, r = (i % 6) / 6;
                ctx.fillRect(m.x + Math.cos(a) * m.rx * 0.8 * r - 1.5, m.y + Math.sin(a) * m.ry * 0.8 * r - 0.8, 3, 1.6);
            }
        }
        if (Tr.mL > 0.2) {
            var c2 = (Tr.filtratSalen + 0.001) / Math.max(1, Tr.filtrat + Tr.mL) * 100;
            ctx.fillStyle = Tg.rgba(gulFarve(c2, false), 1.3);
            var hv = NK.klamp(Tr.mL / Km.TRAGT_MAX, 0, 1);
            ctx.beginPath(); ctx.ellipse(m.x, m.y - hv * 2, m.rx * (0.9 + 0.1 * hv), m.ry, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
        /* Draaber fra stilken, mens der loeber noget igennem */
        if (Tr.mL > 0.2 && !S.sug) {
            var fase = (this.tid * 1.8) % 1;
            ctx.fillStyle = "rgba(220, 230, 240, 0.7)";
            ctx.beginPath(); ctx.arc(640, G.tragt.y + 118 + fase * 30, 2, 0, Math.PI * 2); ctx.fill();
        } else if (Tr.mL > 0.2 && S.sug) {
            ctx.strokeStyle = "rgba(220, 230, 240, 0.5)";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(640, G.tragt.y + 118); ctx.lineTo(640, G.tragt.y + 150); ctx.stroke();
        }
    };

    /* ----- Toerring og vejning ---------------------------------------------------------- */
    P.tegnVaegt = function (ctx) {
        var S = this.S;
        NK.Sprites.tegn(ctx, "vaegt", G.vaegt.x, G.vaegt.y, 0.75);
        var dx = G.vaegt.x + 72 * 0.75, dy = G.vaegt.y + 68 * 0.75;
        ctx.save();
        ctx.fillStyle = "#9ff0c0";
        ctx.font = "700 17px " + Tg.SKRIFT;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(D.komma(S.vaegtVis, 2) + " g", dx + 96 * 0.75 - 4, dy + 26 * 0.75 / 2);
        ctx.restore();
    };

    P.tegnLampe = function (ctx) {
        var gr = ctx.createLinearGradient(0, G.paere.y, 0, BORD);
        gr.addColorStop(0, "rgba(255, 150, 70, 0.32)");
        gr.addColorStop(1, "rgba(255, 150, 70, 0.04)");
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.moveTo(G.paere.x - 26, G.paere.y);
        ctx.lineTo(G.paere.x + 26, G.paere.y);
        ctx.lineTo(G.paere.x + 70, BORD);
        ctx.lineTo(G.paere.x - 70, BORD);
        ctx.closePath();
        ctx.fill();
        NK.Sprites.tegn(ctx, "varmelampe", G.lampe.x, G.lampe.y, 0.8);
        var g2 = ctx.createRadialGradient(G.paere.x, G.paere.y, 2, G.paere.x, G.paere.y, 26);
        g2.addColorStop(0, "rgba(255, 220, 160, 1)");
        g2.addColorStop(1, "rgba(255, 110, 40, 0.6)");
        ctx.fillStyle = g2;
        ctx.beginPath(); ctx.ellipse(G.paere.x, G.paere.y, 24, 4.6, 0, 0, Math.PI * 2); ctx.fill();
    };

    P.tegnUrglas = function (ctx, i) {
        var S = this.S, U = S.urglas[i], p = this.urglasPose(i), d = UDSTYR.urglas, t0 = tl("urglas", p);
        NK.Sprites.tegn(ctx, "urglas", t0.x, t0.y, d.s);
        if (U.mKryst > 0.005) {
            var cx = p.x, cy = t0.y + 30 * d.s;
            var bunke = NK.klamp(U.mKryst / 1.6, 0.25, 1);
            var vaad = NK.klamp(U.w / 0.5, 0, 1);
            ctx.save();
            ctx.fillStyle = Tg.rgba(Tg.bland([252, 218, 60, 1], [190, 140, 18, 1], vaad));
            ctx.beginPath();
            ctx.ellipse(cx, cy + 2, 36 * bunke + 6, 6 * bunke + 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(cx - 30 * bunke, cy + 2);
            ctx.quadraticCurveTo(cx, cy - 12 * bunke - 2, cx + 30 * bunke, cy + 2);
            ctx.fill();
            /* Toerre krystaller glimter, vaade er mørke og klumper */
            ctx.fillStyle = vaad > 0.3 ? "rgba(120, 90, 10, 0.5)" : "rgba(255, 245, 190, 0.9)";
            for (var j = 0; j < 14; j++) {
                var a = j * 2.39, r = (j % 5) / 5;
                ctx.fillRect(cx + Math.cos(a) * 26 * bunke * r - 1.4, cy - 2 + Math.sin(a) * 4 * r - 0.8, 2.8, 1.6);
            }
            ctx.restore();
        }
        /* Et lille maerke: urglasset hedder 1 eller 2 */
        if (S.urglas2) Tg.boble(ctx, p.x + 60, p.y - 30, "Urglas " + (i + 1), { str: 10, vaegt: "700" });
    };

    P.tegnSpatel = function (ctx) {
        var S = this.S, p = this.spatelPose(), d = UDSTYR.spatel, t0 = tl("spatel", p);
        NK.Sprites.tegn(ctx, "spatel", t0.x, t0.y, d.s);
        if (S.spatel.m > 0) {
            ctx.fillStyle = "rgba(240, 200, 40, 0.95)";
            ctx.beginPath(); ctx.ellipse(p.x, p.y - 3, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
        }
    };

    /* ----- Smeltepunktet -------------------------------------------------------------- */
    P.tegnRoerHolder = function (ctx) {
        var x = G.roerHolder.x;
        ctx.save();
        ctx.fillStyle = "rgba(212, 235, 250, 0.1)";
        ctx.strokeStyle = "rgba(220, 236, 248, 0.8)";
        ctx.lineWidth = 1.3;
        NK.rundtRekt(ctx, x - 18, BORD - 34, 36, 34, 4);
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "rgba(225, 238, 248, 0.7)";
        ctx.lineWidth = 2;
        [-8, 8].forEach(function (dx) { ctx.beginPath(); ctx.moveTo(x + dx, BORD - 6); ctx.lineTo(x + dx, BORD - 66); ctx.stroke(); });
        ctx.restore();
        Tg.tekst(ctx, "Smeltepunktsrør", x, BORD + 14, { str: 11, farve: "#a9b0ba" });
    };

    P.tegnRoer = function (ctx) {
        var p = this.roerPose(), S = this.S;
        ctx.save();
        ctx.strokeStyle = "rgba(225, 238, 248, 0.95)";
        ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 64); ctx.stroke();
        if (S.roer.fyldt) {
            ctx.fillStyle = "rgba(245, 205, 40, 1)";
            ctx.fillRect(p.x - 1.3, p.y - 9, 2.6, 9);
        }
        ctx.restore();
    };

    P.tegnApparat = function (ctx) {
        var S = this.S, A = S.app, s = G.app.s;
        /* Roeret stikker op af hullet, naar det er sat i (tegnes bag apparatet) */
        NK.Sprites.tegn(ctx, "smeltepunkt", G.app.x, G.app.y, s);
        /* Displayet */
        ctx.save();
        ctx.fillStyle = A.taendt || A.slut !== null ? "#9ff0c0" : "#2f3a34";
        ctx.font = "700 22px " + Tg.SKRIFT;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText((A.taendt || A.slut !== null ? D.komma(A.T, 1) : "--,-") + " °C", G.display.x + G.display.b - 6, G.display.y + G.display.h / 2);
        ctx.restore();
        /* Taendknappen */
        ctx.fillStyle = A.taendt ? "#5ad18a" : "#2a2f37";
        ctx.beginPath(); ctx.arc(G.appKnap.x, G.appKnap.y, 6, 0, Math.PI * 2); ctx.fill();
        /* Linsen: proeven forstørret */
        this.tegnLinse(ctx);
    };

    P.tegnLinse = function (ctx) {
        var S = this.S, A = S.app, L = G.linse;
        ctx.save();
        ctx.beginPath(); ctx.arc(L.x, L.y, L.r, 0, Math.PI * 2); ctx.clip();
        var lys = A.taendt || A.slut !== null;
        ctx.fillStyle = lys ? "#2b3644" : "#141a20";
        ctx.fillRect(L.x - L.r, L.y - L.r, 2 * L.r, 2 * L.r);
        if (S.roer.sted === "apparat") {
            /* Roeret forstørret: et lodret glasroer */
            var rb = 22, top = L.y - L.r - 4, bund = L.y + L.r * 0.72;
            ctx.fillStyle = "rgba(220, 236, 248, 0.15)";
            ctx.fillRect(L.x - rb / 2, top, rb, bund - top);
            ctx.strokeStyle = "rgba(220, 236, 248, 0.6)";
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(L.x - rb / 2, top); ctx.lineTo(L.x - rb / 2, bund); ctx.arc(L.x, bund, rb / 2, Math.PI, 0, true); ctx.lineTo(L.x + rb / 2, top); ctx.stroke();
            if (S.roer.fyldt) {
                var f = this.smeltet();
                var hFast = 40 * (1 - f), hFl = 27 * f;
                /* Fast stof: et uigennemsigtigt gult pulver */
                if (hFast > 0.5) {
                    ctx.fillStyle = lys ? "#f2c83a" : "#7a6420";
                    ctx.fillRect(L.x - rb / 2 + 1.5, bund - hFl - hFast, rb - 3, hFast);
                    ctx.fillStyle = "rgba(255, 245, 190, 0.6)";
                    for (var i = 0; i < 8; i++) ctx.fillRect(L.x - rb / 2 + 3 + (i * 5) % 12, bund - hFl - hFast + 3 + (i * 7) % Math.max(1, hFast - 4), 2, 2);
                }
                /* Smeltet: klar gul vaeske i bunden */
                if (hFl > 0.3) {
                    ctx.fillStyle = lys ? "rgba(255, 210, 60, 0.55)" : "rgba(120, 100, 30, 0.6)";
                    ctx.beginPath();
                    ctx.moveTo(L.x - rb / 2 + 1.5, bund - hFl);
                    ctx.lineTo(L.x + rb / 2 - 1.5, bund - hFl);
                    ctx.lineTo(L.x + rb / 2 - 1.5, bund);
                    ctx.arc(L.x, bund, rb / 2 - 1.5, 0, Math.PI);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
                    ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(L.x - rb / 2 + 2, bund - hFl); ctx.quadraticCurveTo(L.x, bund - hFl + 3, L.x + rb / 2 - 2, bund - hFl); ctx.stroke();
                }
            }
        }
        ctx.restore();
        ctx.strokeStyle = "rgba(160, 175, 190, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(L.x, L.y, L.r, 0, Math.PI * 2); ctx.stroke();
        /* Roeret ses ogsaa over hullet */
        if (S.roer.sted === "apparat" && !(this.greb && this.greb.id === "roer")) {
            ctx.strokeStyle = "rgba(225, 238, 248, 0.95)";
            ctx.lineWidth = 2.6;
            ctx.beginPath(); ctx.moveTo(G.slot.x, G.slot.y); ctx.lineTo(G.slot.x, G.slot.y - 30); ctx.stroke();
        }
    };

    /* ----- Strømme og draaber ----------------------------------------------------------- */
    P.tegnStroemme = function (ctx) {
        var mig = this;
        this.stroemme.forEach(function (s) {
            var fra = mig.mundPunkt(s.fra), til = mig.maalPunkt(s.til);
            if (!fra || !til) return;
            var farve = s.fra === "kolbe" ? Tg.rgba(mig.vaeskeFarve(mig.S.K), 1.1) : "rgba(215, 230, 244, 0.55)";
            Tg.stroem(ctx, fra.x, fra.y, til.x, til.y, farve, s.fra === "sproejte" ? 1.8 : 3.2);
        });
    };

    /* Hvor vaesken kommer ud af det holdte glas */
    P.mundPunkt = function (id) {
        var g = this.greb;
        if (!g || g.id !== id || !g.pose) return null;
        if (id === "sproejte") return { x: g.pose.x, y: g.pose.y };
        return { x: g.pose.x, y: g.pose.y + 2 };
    };

    P.maalPunkt = function (id) {
        if (id === "maaleglas") {
            var lvl = G.maaleglas.y + (222 - 10) * 0.9 - this.S.maaleglas.V * 1.8 * 0.9;
            return { x: G.maaleglas.x, y: lvl };
        }
        if (id === "kolbe") { var k = this.kolbePose(); return { x: k.x, y: this.kolbeOverflade || k.y + 120 }; }
        if (id === "tragt") return { x: G.tragtMidt.x - 10, y: G.tragtMidt.y };
        return null;
    };

    P.tegnDraaber = function (ctx) {
        this.draaber.forEach(function (d) {
            ctx.fillStyle = d.stof === "en" ? "rgba(230, 240, 250, 0.9)" : "rgba(240, 232, 190, 0.9)";
            ctx.beginPath();
            ctx.ellipse(d.x, d.y, 2.2, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    /* ----- Aflaesninger: tal ved pipetten, maaleglasset og termometret ---------------- */
    P.tegnAflaesning = function (ctx) {
        var S = this.S, t = this.trinNr, mig = this;
        ["pip2", "pip1"].forEach(function (id) {
            if (!synlig(id, t, S)) return;
            var pp = S.pip[id], p = mig.pipPose(id), top = p.y - PIP_L;
            var grebet = mig.greb && mig.greb.id === id;
            if (pp.V > 0 || pp.sted !== "holder" || grebet) {
                Tg.boble(ctx, p.x - 24, top - 26, D.komma(pp.V, 1) + " mL", { hoejre: true, str: 15 });
            }
            if ((pp.sted === "flaske" || pp.sted === "kolbe") && !grebet) {
                var kn = mig.pipKnapper(id);
                var nede = mig.hold && mig.hold.id === id ? mig.hold.h : null;
                if (pp.sted === "flaske") Tg.pille(ctx, kn.sug, "▲ Sug op", true, nede === "sug");
                Tg.pille(ctx, kn.toem, "▼ Tøm", pp.V > 0, nede === "toem");
            }
        });
        if (synlig("maaleglas", t, S)) {
            var mp = this.maaleglasPose();
            if (!mp.v) Tg.boble(ctx, mp.x + 26, mp.y + 40, Math.round(S.maaleglas.V) + " mL", { str: 15, venstre: true });
        }
        if (synlig("filter", t, S) && S.tragt.filtrat > 1) {
            Tg.boble(ctx, G.sugekolbe.x + 67, BORD + 18, "Filtrat " + Math.round(S.tragt.filtrat) + " mL", { str: 11, vaegt: "600" });
        }
    };

    /* ======================================================================
       Skilte og ringe: det, kortet beder om lige nu
       ====================================================================== */
    P.tegnHjaelp = function (ctx) {
        if (this.fase !== "forsoeg" || this.greb) return;
        var s = this.skiltNu();
        if (!s) return;
        var k = this.kasse(s.paa);
        if (!k) return;
        Tg.ring(ctx, k, this.tid);
        var x = k.x + k.b / 2, y = k.y - 8;
        var opad = /-toem$/.test(s.paa);
        if (opad) y = k.y + k.h + 8;
        if (y - 44 < -this.lay.oy / this.lay.s + this.lay.top / this.lay.s) { y = k.y + k.h + 8; opad = true; }
        Tg.skilt(ctx, x, y, s.tekst, this.tid, opad);
    };

    P.tegnSejr = function (ctx, W, H) {
        if (this.sejrT === undefined || this.sejrT === null || this.sejrT > 0.9) return;
        ctx.save();
        ctx.globalAlpha = 0.14 * (1 - this.sejrT / 0.9);
        ctx.fillStyle = "#3fae72";
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
    };

    /* ======================================================================
       Trinnene: hvilken del eleven er ved, og hvad animationen goer ved
       Vis svaret
       ====================================================================== */
    var OPSKRIFT = Km.OPSKRIFT;

    /* Den del af trinnet, eleven er ved, eller null, naar trinnets forsoeg
       er gjort */
    P.delNu = function () {
        var S = this.S, K = S.K, t = this.trinNr, pp, mangler;
        switch (t) {
            case 0: return S.magnet.sted === "kolbe" ? null : "magnet";
            case 1: case 4:
                var id = t === 1 ? "pip2" : "pip1", pre = t === 1 ? "sal" : "en";
                var maal = t === 1 ? OPSKRIFT.sal : OPSKRIFT.en;
                var iKolbe = t === 1 ? K.vSal : K.vEn;
                pp = S.pip[id];
                mangler = Math.round((maal - iKolbe) * 100) / 100;
                if (t === 4 && iKolbe < 0.01 && pp.V < 0.01 && pp.sted === "holder" && K.T < 70 && !S.ventet) return "en-vent";
                if (mangler <= 0.05 && pp.V < 0.03) return null;
                if (pp.V < 0.03) return pp.sted === "flaske" ? pre + "-sug" : pre + "-ned";
                if (pp.sted === "kolbe") return t === 1 ? "sal-toem" : "en-toem";
                if (Math.abs(pp.V - mangler) <= 0.05) return t === 1 ? "sal-over" : "en-toem";
                return pp.sted === "flaske" ? pre + "-sug" : pre + "-ned";
            case 2:
                if (K.vEth >= 90) return null;
                if (S.maaleglas.V + K.vEth < 95 && !(this.greb && this.greb.id === "maaleglas")) return "eth-maal";
                return "eth-haeld";
            case 3:
                if (!S.plade.omroer) return "omroer";
                if (!S.plade.varme) return "varme";
                if (S.termo.sted !== "kolbe") return "termo";
                return null;
            case 5:
                var pl = S.tlc;
                if (!pl.P) return "tlc-p";
                if (!pl.R) return "tlc-r";
                if (!pl.udviklet) return "tlc-koer";
                if (!pl.set) return "tlc-uv";
                return null;
            case 6:
                if (S.plade.varme) return "sluk";
                if (S.kolbeSted !== "isbad") return "isbad";
                return null;
            case 7:
                var Tr = S.tragt;
                if (!Tr.vaad && !S.haeldt) return "filtr-fugt";
                if (!S.sug && !S.haeldt) return "filtr-sug";
                if (K.T >= 25 && !S.haeldt) return "filtr-kold";
                if (!S.skyllet && (Km.rumfang(K) > 0.5 && S.skylMl < 2)) return "filtr-haeld";
                if (!S.skyllet) return "filtr-skyl";
                return null;
            case 8:
                var U = S.urglas[S.aktivU];
                var fulde = this.fuldeVejninger();
                if (!U.vejetTom && U.mKryst <= 0) return "vej-tom";
                if (U.mKryst <= 0) return "vej-skrab";
                if (S.lampeTid[S.aktivU] < 0.5 && !fulde.length) return "vej-toer";
                if (!fulde.length) return "vej-fuld";
                /* Konstant masse: to vejninger i traek, der giver det samme */
                if (fulde.length < 2 || Math.abs(fulde[fulde.length - 1].m - fulde[fulde.length - 2].m) > 0.0101) return "vej-igen";
                return null;
            case 9:
                if (!S.roer.fyldt) return "smp-fyld";
                if (S.roer.sted !== "apparat") return "smp-ind";
                if (S.app.start === null && !S.app.taendt) return "smp-taend";
                if (S.app.start === null) return "smp-start";
                if (S.app.slut === null) return "smp-slut";
                return null;
        }
        return null;
    };

    /* Vejningerne af urglasset med krystaller (det aktive urglas) */
    P.fuldeVejninger = function () {
        var S = this.S;
        return S.vejninger.filter(function (v) { return !v.tom && v.u === S.aktivU; });
    };

    /* En ekstra linje til kortet: det, eleven skal vide ud over kortets tekst */
    P.linje = function (del) {
        var S = this.S, K = S.K;
        switch (del) {
            case "sal-sug": case "sal-ned": case "sal-over": case "sal-toem":
                if (K.vSal > 0 && K.vSal < 1.35) return "Kolben har fået " + D.komma(K.vSal, 1) + " mL salicylaldehyd. Der mangler " + D.komma(1.4 - K.vSal, 1) + " mL.";
                if (del === "sal-sug" && S.pip.pip2.V > 1.45) return "Pipetten viser " + D.komma(S.pip.pip2.V, 1) + " mL. Hold på ▼ Tøm for at lade lidt løbe tilbage.";
                return "";
            case "en-ned": case "en-sug": case "en-toem":
                if (K.vEn > 0 && K.vEn < 0.45) return "Kolben har fået " + D.komma(K.vEn, 2) + " mL ethylendiamin. Der mangler lidt.";
                if (del === "en-sug" && S.pip.pip1.V > 0.55) return "Pipetten viser " + D.komma(S.pip.pip1.V, 1) + " mL. Hold på ▼ Tøm for at lade lidt løbe tilbage.";
                if (K.T < 60 && K.vEn === 0) return "Termometret viser " + Math.round(K.T) + " °C. Opskriften siger omkring 75 °C.";
                return "";
            case "eth-maal": case "eth-haeld":
                if (S.maaleglas.V > 105) return "Måleglasset viser " + Math.round(S.maaleglas.V) + " mL. Det er mere end 100 mL.";
                return "";
            case "tlc-koer":
                if (S.tlc.iKammer && S.tlc.sted !== "kammer" && !S.tlc.udviklet) return "Løbevæsken nåede kun lidt op. Stil pladen tilbage i glasset.";
                return "";
            case "tlc-uv":
                return "";
            case "filtr-kold":
                return "Termometret viser " + D.komma(K.T, 1) + " °C.";
            case "vej-fuld":
                return "";
            case "vej-igen":
                var f = this.fuldeVejninger();
                if (f.length === 1) return "Urglasset med krystaller vejede " + D.komma(f[0].m, 2) + " g.";
                if (f.length >= 2) return "Urglasset med krystaller vejede " + D.komma(f[f.length - 2].m, 2) + " g og så " + D.komma(f[f.length - 1].m, 2) + " g.";
                return "";
        }
        return "";
    };

    /* Skiltet og ringen: hvilken ting, og hvad der staar paa skiltet */
    P.skiltNu = function () {
        var del = this.delNu(), S = this.S;
        if (!del) return null;
        var d = this.delData(del);
        var s = { paa: d.paa, tekst: d.skilt };
        var pp;
        switch (del) {
            case "sal-sug": case "en-sug":
                pp = S.pip[del === "sal-sug" ? "pip2" : "pip1"];
                if (pp.sted !== "flaske") return { paa: del === "sal-sug" ? "pip2" : "pip1", tekst: "Træk mig ned i flasken" };
                if (pp.V > (del === "sal-sug" ? 1.45 : 0.55)) return { paa: (del === "sal-sug" ? "pip2" : "pip1") + "-toem", tekst: "Hold: tøm lidt" };
                return s;
            case "sal-toem":
                if (S.pip.pip2.sted !== "kolbe") return { paa: "pip2", tekst: "Træk mig hen over kolben" };
                return s;
            case "en-toem":
                pp = S.pip.pip1;
                if (pp.sted === "kolbe") return { paa: "pip1-toem", tekst: "Hold: dryp" };
                return s;
            case "eth-haeld":
                if (S.maaleglas.V + S.K.vEth < 95) return { paa: "fl-eth", tekst: "Hold mig over måleglasset" };
                return s;
            case "tlc-p":
                if (S.spids.p.indhold === "kolbe") return { paa: "plade", tekst: "Sæt pletten ved P" };
                return s;
            case "tlc-r":
                if (S.spids.r.indhold === "ref") return { paa: "plade", tekst: "Sæt pletten ved R" };
                return s;
            case "tlc-uv":
                if (S.tlc.sted === "uv") return null;
                return s;
            case "tlc-koer":
                if (S.tlc.sted === "kammer") return null;
                return s;
            case "filtr-skyl":
                if (S.skylMl >= 2) return { paa: "kolbe", tekst: "Hold mig over tragten" };
                return s;
            case "vej-skrab":
                if (S.spatel.m > 0) return { paa: S.aktivU ? "urglas2" : "urglas", tekst: "Træk spatlen herhen" };
                if (S.urglas2 && S.aktivU === 1 && S.urglas[0].mKryst > 0) return { paa: "spatel", tekst: "Træk mig hen til urglas 1" };
                return s;
            case "vej-tom": case "vej-toer": case "vej-fuld":
                return { paa: S.aktivU ? "urglas2" : "urglas", tekst: d.skilt };
            case "vej-igen":
                var uid = S.aktivU ? "urglas2" : "urglas", st = S.urglasSted[S.aktivU];
                if (st === "vaegt" || st === "bord") return { paa: uid, tekst: "Træk mig under lampen" };
                if (S.lampeTid[S.aktivU] - (this.fuldeVejninger().slice(-1)[0] || { lampe: 0 }).lampe >= 1.5) return { paa: uid, tekst: "Træk mig op på vægten" };
                return null;
            case "en-vent": case "filtr-kold":
                return null;
            case "smp-start": case "smp-slut":
                return s;
        }
        return s;
    };

    P.delData = function (id) {
        var TR = D.TRIN;
        for (var i = 0; i < TR.length; i++) {
            for (var j = 0; j < TR[i].dele.length; j++) if (TR[i].dele[j].id === id) return TR[i].dele[j];
        }
        return null;
    };

    /* Spol modellen frem, indtil betingelsen er opfyldt (hoejst max minutter) */
    P.spolTil = function (betingelse, max) {
        var n = 0;
        while (!betingelse() && n < max / 0.05) { this.model(0.05); n++; }
    };

    /* Vis svaret: animationen goer delen for eleven */
    P.goer = function (del) {
        var S = this.S, K = S.K, mig = this;
        var pp;
        switch (del) {
            case "magnet": S.magnet.sted = "kolbe"; break;
            case "sal-ned": case "en-ned": S.pip[del === "sal-ned" ? "pip2" : "pip1"].sted = "flaske"; break;
            case "sal-sug": case "en-sug":
                pp = S.pip[del === "sal-sug" ? "pip2" : "pip1"];
                pp.sted = "flaske";
                pp.stof = del === "sal-sug" ? "sal" : "en";
                pp.V = Math.round(((del === "sal-sug" ? OPSKRIFT.sal - K.vSal : OPSKRIFT.en - K.vEn)) * 10) / 10;
                break;
            case "sal-over": S.pip.pip2.sted = "kolbe"; break;
            case "sal-toem": case "en-toem":
                pp = S.pip[del === "sal-toem" ? "pip2" : "pip1"];
                if (pp.V < 0.03) this.goer(del === "sal-toem" ? "sal-sug" : "en-sug");
                pp.sted = "kolbe";
                Km.tilsaet(K, pp.stof || (del === "sal-toem" ? "sal" : "en"), pp.V, S.ur);
                pp.V = 0;
                pp.sted = "holder";
                break;
            case "eth-maal": S.maaleglas.V = Math.max(S.maaleglas.V, OPSKRIFT.ethanol - K.vEth); break;
            case "eth-haeld":
                if (S.maaleglas.V < 1) S.maaleglas.V = OPSKRIFT.ethanol - K.vEth;
                Km.tilsaet(K, "ethanol", S.maaleglas.V, S.ur);
                S.maaleglas.V = 0;
                break;
            case "omroer": S.plade.omroer = true; break;
            case "varme": S.plade.varme = true; break;
            case "termo": S.termo.sted = "kolbe"; break;
            case "en-vent":
                S.ventet = true;
                this.spolTil(function () { return K.T >= 74; }, 40);
                break;
            case "tlc-p":
                S.tlc.P = Km.tlcProeve(K); S.tlc.faerdig = Km.faerdig(K); S.tlc.tProeve = S.ur; S.spids.p.indhold = null;
                if (S.tlc.sted !== "bord") S.tlc.sted = "bord";
                break;
            case "tlc-r": S.tlc.R = Km.tlcReference(); S.spids.r.indhold = null; break;
            case "tlc-koer":
                S.tlc.sted = "kammer"; S.tlc.iKammer = true;
                this.spolTil(function () { return S.tlc.front >= 0.85; }, 5);
                break;
            case "tlc-uv":
                S.tlc.sted = "uv"; S.tlc.uvT = 1; S.tlc.set = true; S.tlc.cirkler = true;
                this.logPlade();
                break;
            case "sluk": S.plade.varme = false; S.plade.omroer = false; break;
            case "isbad": S.kolbeSted = "isbad"; break;
            case "filtr-fugt": S.tragt.vaad = true; S.tragt.mL += 2; break;
            case "filtr-sug": S.sug = true; break;
            case "filtr-kold":
                this.spolTil(function () { return K.T < 24; }, 40);
                break;
            case "filtr-haeld":
                S.termo.sted = "bord";
                var n = 0;
                while (Km.rumfang(K) > 0.05 && n < 400) {
                    if (S.tragt.mL >= Km.TRAGT_MAX - 1) Km.opdaterTragt(S.tragt, 1, S.sug);
                    this.haeldITragt(0.1);
                    n++;
                }
                break;
            case "filtr-skyl":
                if (Km.rumfang(K) > 0.5 && S.skylMl < 2) this.goer("filtr-haeld");
                Km.tilsaet(K, "ethanol", 6, S.ur);
                S.skylMl += 6;
                var m2 = 0;
                while (Km.rumfang(K) > 0.05 && m2 < 200) {
                    if (S.tragt.mL >= Km.TRAGT_MAX - 1) Km.opdaterTragt(S.tragt, 1, S.sug);
                    this.haeldITragt(0.1);
                    m2++;
                }
                S.skyllet = true;
                this.spolTil(function () { return S.tragt.mL < 0.05; }, 30);
                this.spolTil(function () { return false; }, 1);
                break;
            case "vej-tom":
                S.urglasSted[S.aktivU] = "vaegt";
                S.urglas[S.aktivU].vejetTom = true;
                S.vejninger.push({ m: rund2(S.urglas[S.aktivU].tom), tom: true, u: S.aktivU });
                S.vejetNu = true;
                break;
            case "vej-skrab":
                var U = S.urglas[S.aktivU];
                if (!U.vejetTom) this.goer("vej-tom");
                if (S.urglas2 && S.aktivU === 1 && S.urglas[0].mKryst > 0) {
                    U.mKryst += S.urglas[0].mKryst * 0.98; U.w = S.urglas[0].w; S.urglas[0].mKryst = 0;
                } else {
                    U.mKryst += S.tragt.mKryst * 0.97; U.w = S.tragt.w; S.tragt.mKryst = 0;
                }
                S.spatel.m = 0;
                S.urglasSted[S.aktivU] = "bord";
                S.vejetNu = false;
                break;
            case "vej-toer":
                S.urglasSted[S.aktivU] = "lampe";
                this.spolTil(function () { return S.urglas[S.aktivU].w < 0.0015; }, 30);
                break;
            case "vej-fuld":
                var Ua = S.urglas[S.aktivU];
                S.urglasSted[S.aktivU] = "vaegt";
                S.vejninger.push({ m: rund2(Km.urglasMasse(Ua)), tom: false, u: S.aktivU, lampe: S.lampeTid[S.aktivU], w: Ua.w });
                S.vejetNu = true;
                S.vaegtVis = Km.urglasMasse(Ua);
                break;
            case "vej-igen":
                var Ui = S.urglas[S.aktivU];
                S.urglasSted[S.aktivU] = "lampe";
                this.spolTil(function () { return Ui.w < 0.0008; }, 40);
                S.urglasSted[S.aktivU] = "vaegt";
                var mi = rund2(Km.urglasMasse(Ui));
                S.vejninger.push({ m: mi, tom: false, u: S.aktivU, lampe: S.lampeTid[S.aktivU], w: Ui.w });
                if (this.fuldeVejninger().length < 2 || Math.abs(this.fuldeVejninger().slice(-2)[0].m - mi) > 0.0101) {
                    S.vejninger.push({ m: mi, tom: false, u: S.aktivU, lampe: S.lampeTid[S.aktivU], w: Ui.w });
                }
                S.vejetNu = true;
                S.vaegtVis = Km.urglasMasse(Ui);
                break;
            case "smp-fyld": S.roer.fyldt = true; break;
            case "smp-ind": S.roer.fyldt = true; S.roer.sted = "apparat"; break;
            case "smp-taend": S.roer.fyldt = true; S.roer.sted = "apparat"; S.app.taendt = true; break;
            case "smp-start":
                S.roer.fyldt = true; S.roer.sted = "apparat"; S.app.taendt = true;
                S.app.T = Math.round((this.proevenSmp().start + 0.2) * 10) / 10;
                S.app.start = S.app.T;
                break;
            case "smp-slut":
                if (S.app.start === null) this.goer("smp-start");
                S.app.T = Math.round((this.proevenSmp().slut + 0.1) * 10) / 10;
                S.app.slut = S.app.T;
                S.app.taendt = false;
                break;
        }
        void mig;
    };

    /* De tal, kortets tekster bruger */
    P.tal = function () {
        var S = this.S, K = S.K;
        var tom = null, fuld = null;
        S.vejninger.forEach(function (v) {
            if (v.u !== S.aktivU) return;
            if (v.tom) tom = v.m; else fuld = v.m;
        });
        return {
            vSal: K.tilsat.sal, vEn: K.tilsat.en, enVedT: K.enVedT,
            filtrT: S.tragt.filtrT, vaad: S.tragt.vaad,
            mTom: tom, mFuld: fuld,
            svar: tom !== null && fuld !== null ? rund2(fuld - tom) : null,
            m: S.feltSvar !== null ? S.feltSvar : (tom !== null && fuld !== null ? rund2(fuld - tom) : 0),
            a: S.app.start, b: S.app.slut
        };
    };

    /* Forbered trin i ved at goere alle de foregaaende trin efter opskriften */
    P.forbered = function (i) {
        this.S = nyTilstand();
        var S = this.S, K = S.K, mig = this;
        for (var t = 0; t < i; t++) {
            this.trinNr = t;
            if (t === 5) this.spolTil(function () { return Km.faerdig(K) && K.T > 70; }, 40);
            if (t === 7) this.spolTil(function () { return K.T < 6; }, 30);
            var n = 0, del;
            while ((del = this.delNu()) !== null && n < 40) { this.goer(del); n++; }
            if (t === 8) S.feltSvar = this.tal().svar;
            if (t === 3) this.spolTil(function () { return K.T >= 74; }, 40);
            if (t === 4) this.spolTil(function () { return true; }, 0);
        }
        /* Det, der bliver staaende fra de foregaaende trin */
        if (i >= 8) { S.urglasSted[S.aktivU] = "bord"; }
        if (i === 9) S.urglasSted = ["bord", "bord"];
        void mig;
    };

    /* ======================================================================
       Panelet: maalingerne
       ====================================================================== */
    P.panelHTML = function () {
        var S = this.S, K = S.K, t = this.trinNr, r = [];
        function raekke(navn, vaerdi, note) {
            r.push('<div class="m-raekke"><span class="m-navn">' + navn + '</span><span class="m-tal">' + vaerdi +
                (note ? '<em>' + note + "</em>" : "") + "</span></div>");
        }
        if (K.tilsat.sal > 0) raekke("Salicylaldehyd", D.komma(K.tilsat.sal, 1) + " mL");
        if (K.tilsat.ethanol > 0) raekke("Ethanol", Math.round(Math.min(K.tilsat.ethanol, K.tilsat.ethanol - S.skylMl)) + " mL");
        if (S.termo.sted === "kolbe" && t <= 7) raekke("Temperatur", D.komma(K.T, 1) + " °C");
        if (K.tilsat.en > 0) raekke("Ethylendiamin", D.komma(K.tilsat.en, 2) + " mL", "ved " + Math.round(K.enVedT) + " °C");
        if (K.tEn !== null && t >= 4 && t <= 6) raekke("Tid siden", Math.floor(S.ur - K.tEn) + " min", "ethylendiamin kom i");
        if (S.plader.length) r.push('<div class="m-plader">' + S.plader.map(pladeSVG).join("") + "</div>");
        if (S.tragt.filtrT !== null) raekke("Filtreret ved", Math.round(S.tragt.filtrT) + " °C");
        S.vejninger.forEach(function (v) {
            var navn = (S.urglas2 ? "Urglas " + (v.u + 1) : "Urglas") + (v.tom ? ", tomt" : " + krystaller");
            raekke(navn, D.komma(v.m, 2) + " g", v.tom ? "" : Math.round(v.lampe) + " min under lampen");
        });
        if (S.feltSvar !== null) raekke("Salenvir", D.komma(S.feltSvar, 2) + " g");
        if (S.app.start !== null) raekke("Smeltepunkt", D.komma(S.app.start, 1) + (S.app.slut !== null ? "-" + D.komma(S.app.slut, 1) : "") + " °C");
        return r.join("") || '<p class="m-tom">Tallene fra forsøget kommer her.</p>';
    };

    /* En lille tegning af en TLC-plade til panelet */
    function pladeSVG(p) {
        var b = 34, h = 70, linje = h - 10, front = linje - (linje - 4) * p.front;
        var s = '<figure class="m-plade"><svg width="' + b + '" height="' + h + '" viewBox="0 0 ' + b + " " + h + '">' +
            '<rect x="0.5" y="0.5" width="' + (b - 1) + '" height="' + (h - 1) + '" fill="#a8f0b0" stroke="#666"/>' +
            '<line x1="2" y1="' + linje + '" x2="' + (b - 2) + '" y2="' + linje + '" stroke="#555" stroke-width="0.8"/>' +
            '<line x1="0" y1="' + front.toFixed(1) + '" x2="' + b + '" y2="' + front.toFixed(1) + '" stroke="#777" stroke-width="0.7" stroke-dasharray="2 2"/>';
        function pl(liste, x) {
            (liste || []).forEach(function (q) {
                var y = linje - (linje - front) * q.rf;
                s += '<ellipse cx="' + x + '" cy="' + y.toFixed(1) + '" rx="3.6" ry="2.7" fill="rgba(60,30,110,' + (0.85 * q.styrke).toFixed(2) + ')"/>';
            });
        }
        pl(p.P, 11); pl(p.R, 24);
        s += '<text x="11" y="' + (h - 2) + '" font-size="7" text-anchor="middle" fill="#333">P</text>' +
             '<text x="24" y="' + (h - 2) + '" font-size="7" text-anchor="middle" fill="#333">R</text></svg>' +
             "<figcaption>" + p.min + " min</figcaption></figure>";
        return s;
    }

    NK.Sim.G = G;
    NK.Sim.synlig = synlig;
}());
