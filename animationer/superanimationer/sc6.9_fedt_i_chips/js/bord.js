/* =====================================================================
   bord.js - tegning af bordet og styring med musen

   Udvider NK.Forsoeg med:
     hvad(pt)          hvilken genstand ligger under punktet
     ned / flyt / op   musen: klik, eller traek i pistillen og glasstaven
     tegn()            hele scenen i den rigtige raekkefoelge
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var P = NK.Forsoeg.prototype;

    var A_MIDT = 758;

    /* ----- Musens position paa tegnebordet ------------------------------ */
    P.tilBord = function (ev) {
        var rect = this.canvas.getBoundingClientRect();
        var sk = S.skala(this.laerred.b, this.laerred.h);
        return { x: (ev.clientX - rect.left - sk.dx) / sk.s, y: (ev.clientY - rect.top - sk.dy) / sk.s };
    };

    P.stavTop = function () {
        var b = this.stav.bund;
        var v = 0.3 + (b.x - A_MIDT) * 0.006;
        return { x: b.x + Math.sin(v) * 112, y: b.y - Math.cos(v) * 112 };
    };

    P.stavSynlig = function () {
        var a = this.g.baegerA;
        return !this.gjort.filtrer && Math.abs(a.p.x - a.hjem.x) + Math.abs(a.p.y - a.hjem.y) < 1.5;
    };

    function afstandTilLinje(p, a, b) {
        var dx = b.x - a.x, dy = b.y - a.y;
        var t = NK.klamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy), 0, 1);
        var qx = a.x + t * dx - p.x, qy = a.y + t * dy - p.y;
        return Math.sqrt(qx * qx + qy * qy);
    }

    /* ----- Hvad ligger under musen? ---------------------------------------- */
    P.hvad = function (pt) {
        var g = this.g;
        if (this.overLaerer) {
            var l = this.overLaerer(pt);
            if (l) return l;
        }
        if (!g.kaffekop.skjult && S.inden("kaffekop", g.kaffekop.p, g.kaffekop.anker, pt.x, pt.y, 6)) return "kaffekop";
        if (!g.pose.skjult && S.inden("pose", g.pose.p, g.pose.anker, pt.x, pt.y, 4)) return "pose";
        if (this.stavSynlig() && pt.y < 412 && afstandTilLinje(pt, this.stav.bund, this.stavTop()) < 9) return "stav";
        if (!this.gjort.overfoer && S.inden("pistil", g.pistil.p, g.pistil.anker, pt.x, pt.y, 8)) return "pistil";
        var navne = ["vejebaad", "morter", "baegerB", "baegerA", "heptan", "vand"];
        for (var i = 0; i < navne.length; i++) {
            var gg = g[navne[i]];
            if (gg.skjult) continue;
            if (S.inden(gg.sprite, gg.p, gg.anker, pt.x, pt.y, navne[i] === "vejebaad" ? 12 : 5)) return navne[i];
        }
        if (!this.braenderVaek && Math.abs(pt.x - S.TREFOD.x) < 38 && pt.y > S.TREFOD.top - 8 && pt.y < S.BORD + 4) return "braender";
        if (pt.x > S.PLADE.x && pt.x < S.PLADE.x + 90 && pt.y > S.PLADE.y - 4 && pt.y < S.BORD + 2) return "varmeplade";
        if (Math.abs(pt.x - S.TRAGT.x) < 40 && pt.y > 306 && pt.y < 420) return "tragt";
        if (pt.x > S.VAEGT.x && pt.x < S.VAEGT.x + 140 && pt.y > S.VAEGT.y - 4 && pt.y < S.BORD) return "vaegt";
        return null;
    };

    /* ----- Mus og beroering --------------------------------------------- */
    P.ned = function (pt) {
        if (NK.Lyd) NK.Lyd.laasOp();
        var navn = this.hvad(pt);
        if (!navn) return false;
        var optaget = this.laererOptaget && this.laererOptaget();
        if (!optaget && !this.handling && !this.arbejdKilde && !this.uheld) {
            if ((navn === "pistil" && this.kanKnuse()) || (navn === "stav" && this.kanRoere())) {
                var b = this.stav.bund;
                this.holdt = { navn: navn, start: pt, sidst: pt, t: Date.now(), flyttet: false, dx: b.x - pt.x, dy: b.y - pt.y };
                return true;
            }
        }
        this.klik(navn);
        return false;
    };

    /* nu: tidspunktet for musebevaegelsen i ms (ev.timeStamp) */
    P.flyt = function (pt, nu) {
        var h = this.holdt;
        if (!h) {
            this.hover = this.hvad(pt);
            return;
        }
        if (nu === undefined) nu = Date.now();
        if (!h.flyttet) {
            if (Math.abs(pt.x - h.start.x) + Math.abs(pt.y - h.start.y) < 6) return;
            h.flyttet = true;
            h.sidst = pt;
            h.t = nu;
            this.startArbejde(h.navn === "pistil" ? "mus-knus" : "mus-roer");
        }
        var dts = Math.max(4, nu - h.t) / 1000;
        var dx = pt.x - h.sidst.x, dy = pt.y - h.sidst.y;
        var vej = Math.sqrt(dx * dx + dy * dy);
        this.musFart = NK.lerp(this.musFart, vej / dts, 0.35);
        h.sidst = pt;
        h.t = nu;

        if (h.navn === "pistil") {
            if (!this.kanKnuse()) { this.op(); return; }
            var pi = this.g.pistil;
            var nx = NK.klamp(pt.x, S.MORTER.midt - 34, S.MORTER.midt + 34);
            var ny = NK.klamp(pt.y, 452, 480);
            var bev = Math.sqrt((nx - pi.p.x) * (nx - pi.p.x) + (ny - pi.p.y) * (ny - pi.p.y));
            pi.p.x = nx;
            pi.p.y = ny;
            pi.p.v = NK.klamp((nx - S.MORTER.midt) / 34 * 0.45, -0.45, 0.45);
            this.knus(Math.min(bev, 60), this.musFart);
        } else {
            if (!this.kanRoere()) { this.op(); return; }
            this.stav.bund.x = NK.klamp(pt.x + h.dx, A_MIDT - 22, A_MIDT + 22);
            this.stav.bund.y = NK.klamp(pt.y + h.dy, 470, 494);
        }
    };

    P.op = function () {
        var h = this.holdt;
        if (!h) return;
        this.holdt = null;
        if (!h.flyttet) { this.klik(h.navn); return; }
        this.stopArbejde();
    };

    P.bindMus = function () {
        var mig = this;
        var c = this.canvas;
        c.addEventListener("pointerdown", function (ev) {
            if (mig.ned(mig.tilBord(ev))) {
                try { c.setPointerCapture(ev.pointerId); } catch (fejl) {}
                ev.preventDefault();
            }
        });
        c.addEventListener("pointermove", function (ev) {
            mig.flyt(mig.tilBord(ev), ev.timeStamp || Date.now());
            var hv = mig.hover;
            var greb = (hv === "pistil" && mig.kanKnuse()) || (hv === "stav" && mig.kanRoere());
            c.style.cursor = mig.holdt ? "grabbing" : (greb ? "grab" : (hv ? "pointer" : "default"));
        });
        c.addEventListener("pointerup", function () { mig.op(); });
        c.addEventListener("pointercancel", function () { mig.op(); });
        c.addEventListener("pointerleave", function () { if (!mig.holdt) mig.hover = null; });
    };

    /* ================================================================
       TEGNING
       ================================================================ */
    P.tilpas = function () {
        return this.laerred.tilpas();
    };

    function hjemme(gg) {
        return Math.abs(gg.p.x - gg.hjem.x) + Math.abs(gg.p.y - gg.hjem.y) < 1.5 && Math.abs(gg.p.v - gg.hjem.v) < 0.01;
    }

    P.tegnMark = function (ctx, navn, sprite, gg, tid) {
        if (this.markeret(navn)) S.tegnMarkering(ctx, S.rekt(sprite, gg.p, gg.anker, 0), tid);
    };

    P.tegnB = function (ctx, tid) {
        var b = this.g.baegerB;
        b.niveau = S.tegnBaeger(ctx, {
            p: b.p, areal: b.areal, farve: b.farve, uklar: b.uklar, fedt: b.fedt, salt: b.salt,
            sod: b.sod, bobler: b.sted === "plade" || b.sted === "trefod" ? this.bobler : null,
            boelge: this.fordampet > 0 && !this.gjort.inddamp ? 0.8 : 0,
            fremhaev: this.markeret("baegerB")
        }, tid);
    };

    P.tegnA = function (ctx, tid) {
        var a = this.g.baegerA;
        a.niveau = S.tegnBaeger(ctx, {
            p: a.p, areal: a.areal, farve: a.farve, uklar: a.uklar, krummer: a.krummer,
            hvirvel: this.roer, boelge: this.roer * 2.5,
            fremhaev: this.markeret("baegerA")
        }, tid);
        if (this.stavSynlig()) {
            var bund = this.stav.bund, top = this.stavTop();
            ctx.save();
            ctx.lineCap = "round";
            ctx.strokeStyle = "rgba(214, 234, 248, 0.55)";
            ctx.lineWidth = 4.2;
            ctx.beginPath();
            ctx.moveTo(bund.x, bund.y);
            ctx.lineTo(top.x, top.y);
            ctx.stroke();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(bund.x - 1, bund.y - 2);
            ctx.lineTo(top.x - 1, top.y + 2);
            ctx.stroke();
            ctx.restore();
            if (this.markeret("stav")) S.tegnMarkering(ctx, { x: Math.min(bund.x, top.x) - 4, y: top.y, b: Math.abs(top.x - bund.x) + 8, h: bund.y - top.y }, tid);
        }
    };

    P.tegnFlaske = function (ctx, navn, tid) {
        var fl = this.g[navn];
        NK.Sprites.tegnPositur(ctx, navn, fl.p, fl.anker);
        if (navn === "heptan") {
            /* Laaget: skrues af og laegges paa bordet ved siden af */
            var paa = NK.tilVerden(fl.p, fl.anker, 23, 4);
            var t = NK.blod(this.laagT);
            var x = NK.lerp(paa.x, 708, t), y = NK.lerp(paa.y, S.BORD - 5, t) - Math.sin(Math.PI * t) * 30;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(NK.lerp(fl.p.v, 0, t));
            ctx.fillStyle = "#2c5f99";
            NK.rundtRekt(ctx, -9, -6, 18, 11, 2.5);
            ctx.fill();
            ctx.fillStyle = "#3f7fc9";
            ctx.fillRect(-7, -5, 14, 3);
            ctx.restore();
        }
    };

    P.tegn = function () {
        var L = this.laerred;
        var ctx = L.ctx;
        ctx.clearRect(0, 0, L.b, L.h);
        var sk = S.skala(L.b, L.h);
        var tid = this.tid, g = this.g, i;
        var lv = this.laererVisning ? this.laererVisning() : {};

        ctx.save();
        ctx.translate(sk.dx, sk.dy);
        ctx.scale(sk.s, sk.s);
        if (this.ryk > 0) ctx.translate((Math.random() - 0.5) * this.ryk, (Math.random() - 0.5) * this.ryk);

        S.tegnBaggrund(ctx, { sod: this.sod, alarm: this.alarm, tid: tid, urMinutter: this.urMinutter, plakatRegel: lv.plakatRegel || 0 });
        S.tegnStinkskab(ctx, tid);
        S.tegnGas(ctx, !this.braenderVaek);

        var oppe = [];

        /* Hylden og det aabne bord */
        var kop = g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            NK.Sprites.tegnPositur(ctx, "kaffekop", kop.p, kop.anker);
            if (Math.sin(tid * 1.3) > -0.2) {
                ctx.save();
                ctx.strokeStyle = "rgba(230, 236, 242, 0.25)";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(kop.p.x - 4, kop.p.y - 42);
                ctx.bezierCurveTo(kop.p.x - 10, kop.p.y - 52, kop.p.x + 2, kop.p.y - 58, kop.p.x - 4, kop.p.y - 68 - Math.sin(tid * 2) * 3);
                ctx.stroke();
                ctx.restore();
            }
        }
        if (!g.pose.skjult && !g.pose.iHaand) {
            S.skygge(ctx, S.HJEM.pose.x, 46, 0.3);
            NK.Sprites.tegnPositur(ctx, "pose", g.pose.p, g.pose.anker);
            this.tegnMark(ctx, "pose", "pose", g.pose, tid);
        }

        S.tegnVaegt(ctx, this.vaegtTekst(), Math.abs(this.vaegtVisning - this.vaegtMaal()) < 0.004);

        var baad = g.vejebaad;
        var baadHjemme = hjemme(baad) || (Math.abs(baad.p.x - S.HJEM.parkeret.x) + Math.abs(baad.p.y - S.HJEM.parkeret.y) < 1.5);
        if (baadHjemme) {
            S.tegnVejebaad(ctx, baad.p, this.chips);
            if (this.markeret("vejebaad")) S.tegnMarkering(ctx, S.rekt("vejebaad", baad.p, baad.anker, 4), tid);
        } else {
            oppe.push(function () { S.tegnVejebaad(ctx, baad.p, this.chips); });
        }

        var b = g.baegerB;
        if (b.sted === "hjem" || b.sted === "vaegt") {
            if (b.sted === "hjem") S.skygge(ctx, 350, 34, 0.3);
            this.tegnB(ctx, tid);
        } else if (b.sted === "flytter") {
            oppe.push(function () { this.tegnB(ctx, tid); });
        }

        if (!this.braenderVaek) S.tegnBraender(ctx, this.flamme, tid);
        else S.tegnSeddel(ctx, tid);
        if (b.sted === "trefod") this.tegnB(ctx, tid);

        /* Morter og pistil. Pistillen staar i morteren, indtil chipsene
           er haeldt over; saa ligger den foran. */
        var pi = g.pistil, mor = g.morter;
        var pistilIMorter = !this.gjort.overfoer && !(this.handling && this.handling.navn === "overfoer");
        if (pistilIMorter) NK.Sprites.tegnPositur(ctx, "pistil", pi.p, pi.anker);
        if (hjemme(mor)) {
            S.skygge(ctx, S.MORTER.midt, 38, 0.3);
            NK.Sprites.tegnPositur(ctx, "morter", mor.p, mor.anker);
            S.tegnMorterIndhold(ctx, mor.p, this.stykker, this.knust);
            this.tegnMark(ctx, "morter", "morter", mor, tid);
        } else {
            oppe.push(function () {
                NK.Sprites.tegnPositur(ctx, "morter", mor.p, mor.anker);
                S.tegnMorterIndhold(ctx, mor.p, this.stykker, this.knust);
            });
        }
        if (!pistilIMorter) NK.Sprites.tegnPositur(ctx, "pistil", pi.p, pi.anker);
        if (this.markeret("pistil")) S.tegnMarkering(ctx, S.rekt("pistil", pi.p, pi.anker, 0), tid);

        /* Stinkskabet */
        ["vand", "heptan"].forEach(function (navn) {
            var fl = g[navn];
            if (hjemme(fl)) {
                S.skygge(ctx, fl.hjem.x - (navn === "vand" ? 21 : 0), 22, 0.3);
                this.tegnFlaske(ctx, navn, tid);
            } else {
                oppe.push(function () { this.tegnFlaske(ctx, navn, tid); });
            }
        }, this);
        if (this.markeret("flasker")) {
            S.tegnMarkering(ctx, { x: 597, y: 380, b: 98, h: 120 }, tid);
        }

        NK.Sprites.tegn(ctx, "filterstativ", S.STATIV.x, S.STATIV.y);
        if (b.sted === "tragt") this.tegnB(ctx, tid);
        S.tegnTragt(ctx, this.tragt, tid);

        var a = g.baegerA;
        if (hjemme(a)) {
            S.skygge(ctx, A_MIDT, 34, 0.3);
            this.tegnA(ctx, tid);
        } else {
            oppe.push(function () { this.tegnA(ctx, tid); });
        }

        S.tegnVarmeplade(ctx, this.temp, this.pladeTaendt, tid);
        if (b.sted === "plade") this.tegnB(ctx, tid);

        /* Det, der er i luften */
        for (i = 0; i < oppe.length; i++) oppe[i].call(this);

        if (this.straale) S.tegnStraale(ctx, this.straale.fra, this.straale.til, this.straale.farve, this.straale.bredde, tid);
        S.tegnDraaber(ctx, this.draaber);
        S.tegnFlyvende(ctx, this.flyvende);
        S.tegnDampe(ctx, this.dampe);
        if (this.tegnUheld) this.tegnUheld(ctx, tid);
        S.tegnRoeg(ctx, this.roeg);

        /* Zoomboblen */
        if (this.bobleAlfa > 0.01 && this.bobleMaal) {
            var bo = { x: this.bobleSted.x, y: this.bobleSted.y, r: S.BOBLE.ude.r };
            S.tegnForbindelse(ctx, this.bobleMaal, bo, this.bobleAlfa);
            this.mikro.tegn(ctx, bo, this.bobleAlfa, this.bobleTitel, tid);
        }

        /* Handsken om pistillen eller glasstaven */
        var greb = null, v = 0;
        if (this.arbejdKilde === "mus-knus" || this.arbejdKilde === "knap-knus") { greb = NK.tilVerden(pi.p, pi.anker, 11, 22); v = pi.p.v; }
        if (this.arbejdKilde === "mus-roer" || this.arbejdKilde === "knap-roer") {
            var st = this.stavTop();
            greb = { x: NK.lerp(this.stav.bund.x, st.x, 0.85), y: NK.lerp(this.stav.bund.y, st.y, 0.85) };
            v = Math.atan2(st.x - this.stav.bund.x, this.stav.bund.y - st.y);
        }
        this.haandAlfa = NK.mod(this.haandAlfa, greb ? 1 : 0, 10, 1 / 60);
        if (greb) this.sidsteGreb = { x: greb.x, y: greb.y, v: v };
        if (this.haandAlfa > 0.01 && this.sidsteGreb) {
            NK.Sprites.tegnPositur(ctx, "haand", this.sidsteGreb, S.ANKER.haand, this.haandAlfa);
        }

        if (this.tegnLaerer) this.tegnLaerer(ctx, tid);
        ctx.restore();
    };
}());
