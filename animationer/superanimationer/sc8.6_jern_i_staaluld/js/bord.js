/* =====================================================================
   bord.js - tegning af bordet og styring med musen

   Udvider NK.Forsoeg med:
     hvad(pt)          hvilken genstand ligger under punktet
     ned / flyt / op   musen: klik, traek eller ryst kolben
     tegn()            hele scenen i den rigtige raekkefoelge
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;
    var B = S.BURET;
    var P = NK.Forsoeg.prototype;

    var LAAG = { svovlsyre: "#2f6fae", saltsyre: "#2f8a52", kmno4: "#26262c" };

    /* ----- Musens position paa tegnebordet ------------------------------ */
    P.tilBord = function (ev) {
        var rect = this.canvas.getBoundingClientRect();
        var sk = S.skala(this.laerred.b, this.laerred.h);
        return { x: (ev.clientX - rect.left - sk.dx) / sk.s, y: (ev.clientY - rect.top - sk.dy) / sk.s };
    };

    /* ----- Hvad ligger under musen? ---------------------------------------- */
    P.hvad = function (pt) {
        var g = this.g;
        if (this.overLaerer) {
            var l = this.overLaerer(pt);
            if (l) return l;
        }
        if (!g.kaffekop.skjult && S.inden("kaffekop", g.kaffekop.p, g.kaffekop.anker, pt.x, pt.y, 6)) return "kaffekop";
        if (Math.abs(pt.x - B.x) < 20 && pt.y > B.hane - 5 && pt.y < B.haneBund + 5) return "hane";
        if (Math.abs(pt.x - B.x) < 14 && pt.y > B.top - 26 && pt.y < B.kegle) return "buret";
        var navne = ["kmno4", "svovlsyre", "saltsyre", "kolbe", "affald"];
        for (var i = 0; i < navne.length; i++) {
            var gg = g[navne[i]];
            if (S.inden(gg.sprite, gg.p, gg.anker, pt.x, pt.y, 4)) return navne[i];
        }
        var baad = g.vejebaad;
        var lb = NK.tilLokal(baad.p, baad.anker, pt.x, pt.y);
        if (lb.x > -12 && lb.x < 76 && lb.y > -30 && lb.y < 22) return "vejebaad";
        if (S.inden("staaluld", g.staaluld.p, g.staaluld.anker, pt.x, pt.y, 6)) return "staaluld";
        if (pt.x > S.PLADE.x && pt.x < S.PLADE.x + 90 && pt.y > S.PLADE.y - 4 && pt.y < S.BORD + 2) return "varmeplade";
        if (pt.x > S.VAEGT.x && pt.x < S.VAEGT.x + 140 && pt.y > S.VAEGT.y - 4 && pt.y < S.BORD) return "vaegt";
        return null;
    };

    /* ----- Mus og beroering --------------------------------------------- */
    P.ned = function (pt) {
        if (NK.Lyd) NK.Lyd.laasOp();
        var navn = this.hvad(pt);
        if (!navn) return false;
        var optaget = this.laererOptaget && this.laererOptaget();
        if (!optaget && !this.handling && !this.arbejdKilde && navn === "kolbe" && this.kanRyste()) {
            this.holdt = { type: "arbejd", navn: navn, start: pt, sidst: pt, t: Date.now(), flyttet: false };
            return true;
        }
        if (this.kanTraekke(navn)) {
            var gg = this.g[navn];
            this.holdt = { type: "traek", navn: navn, start: pt, sidst: pt, flyttet: false, dx: gg.p.x - pt.x, dy: gg.p.y - pt.y,
                fra: { x: gg.p.x, y: gg.p.y, v: gg.p.v }, t0: this.tid };
            return true;
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
        if (h.type === "traek") {
            var gt = this.g[h.navn];
            if (!h.flyttet) {
                if (Math.abs(pt.x - h.start.x) + Math.abs(pt.y - h.start.y) < 6) return;
                h.flyttet = true;
                gt.traekkes = true;
                if (h.navn === "kolbe") gt.sted = "traekkes";
                if (NK.Lyd) NK.Lyd.klik();
            }
            var vx = pt.x - h.sidst.x;
            h.sidst = pt;
            gt.p.x = NK.klamp(pt.x + h.dx, 10, S.BREDDE - 10);
            gt.p.y = NK.klamp(pt.y + h.dy, 60, S.BORD + 30);
            gt.p.v = NK.lerp(gt.p.v, h.fra.v + NK.klamp(vx * 0.02, -0.3, 0.3), 0.3);
            this.traekMaal = this.findMaal(h.navn, pt);
            return;
        }
        if (!h.flyttet) {
            if (Math.abs(pt.x - h.start.x) + Math.abs(pt.y - h.start.y) < 5) return;
            h.flyttet = true;
            h.sidst = pt;
            h.t = nu;
            this.startArbejde("mus-ryst");
        }
        if (!this.kanRyste()) { this.op(); return; }
        var dts = Math.max(4, nu - h.t) / 1000;
        var dx = pt.x - h.sidst.x, dy = pt.y - h.sidst.y;
        var vej = Math.sqrt(dx * dx + dy * dy);
        this.musFart = NK.lerp(this.musFart, vej / dts, 0.35);
        h.sidst = pt;
        h.t = nu;
        var f = this.rystForskyd;
        f.x = NK.klamp(pt.x - h.start.x, -10, 10);
        f.y = NK.klamp((pt.y - h.start.y) * 0.3, -3, 3);
        f.v = NK.klamp(f.x * 0.006, -0.06, 0.06);

        /* Paaskeaeg: bliver eleven ved med at ryste voldsomt, skvulper det */
        if (this.musFart > M.RYST.amok) this.amokTid += Math.min(0.1, vej / this.musFart);
        if (this.amokTid >= M.RYST.amokTid && this.amokPause <= 0) {
            this.amokTid = 0;
            this.amokPause = 5;
            this.skvulp();
            if (this.laererRyst) this.laererRyst();
        }
    };

    P.op = function () {
        var h = this.holdt;
        if (!h) return;
        this.holdt = null;
        if (h.type === "traek") {
            var gg = this.g[h.navn];
            var maal = this.traekMaal;
            this.traekMaal = null;
            gg.traekkes = false;
            if (!h.flyttet) { this.klik(h.navn); return; }
            if (h.navn === "kolbe") gg.sted = (Math.abs(h.fra.x - S.PAA_PLADE.x) < 2 && Math.abs(h.fra.y - S.PAA_PLADE.y) < 2) ? "plade" : "hjem";
            var ok = maal ? this.slipTil(h.navn, maal) : false;
            if (!ok && !this.handling) this.koer([{ flyt: gg, til: h.fra, tid: 0.45, loeft: 25 }], "tilbage");
            this.aendret("slip");
            return;
        }
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
            var greb = (hv === "kolbe" && mig.kanRyste()) || (hv && mig.kanTraekke(hv));
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

    P.tegnFlaske = function (ctx, navn) {
        var fl = this.g[navn];
        NK.Sprites.tegnPositur(ctx, navn, fl.p, fl.anker);
        /* Laaget skrues af og laegges foran flaskens plads */
        var paa = NK.tilVerden(fl.p, fl.anker, 23, 4);
        var t = NK.blod(this.laagT[navn]);
        var x = NK.lerp(paa.x, fl.hjem.x + 14, t), y = NK.lerp(paa.y, S.BORD + 3, t) - Math.sin(Math.PI * t) * 30;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(NK.lerp(fl.p.v, 0, t));
        ctx.fillStyle = LAAG[navn];
        NK.rundtRekt(ctx, -8, -6, 16, 10, 2.5);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(-6, -5, 12, 2.5);
        ctx.restore();
    };

    P.tegnK = function (ctx, tid) {
        var k = this.g.kolbe, kem = this.kem;
        var jern = this.gjort.afvej ? (1 - kem.opl) * NK.klamp((this.mStaal || 0.1) / 0.11, 0.5, 1.3) : 0;
        k.niveau = S.tegnKolbe(ctx, {
            p: k.p, ml: kem.syre ? kem.ml : 0, farve: M.kolbeFarve(kem),
            lokal: M.lokalIntensitet(kem), lokalX: this.lokalX + (k.p.x - S.UNDER_BURET.x),
            jern: jern, bobler: this.kolbeBobler, boelge: this.ryst * 1.5, hvirvel: this.ryst,
            fremhaev: this.markeret("kolbe")
        }, tid);
    };

    P.tegnAf = function (ctx, tid) {
        var af = this.g.affald;
        af.niveau = S.tegnAffald(ctx, { p: af.p, ml: this.affaldMl }, tid);
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

        S.tegnBaggrund(ctx, { tid: tid, urMinutter: this.urMinutter, plakatRegel: lv.plakatRegel || 0 });
        S.tegnStinkskab(ctx, tid);

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
        var su = g.staaluld;
        S.skygge(ctx, S.HJEM.staaluld.x, 44, 0.3);
        NK.Sprites.tegnPositur(ctx, "staaluld", su.p, su.anker);
        if (this.markeret("staaluld")) S.tegnMarkering(ctx, S.rekt("staaluld", su.p, su.anker, 0), tid);

        S.tegnVaegt(ctx, this.vaegtTekst(), Math.abs(this.vaegtVisning - this.vaegtMaal()) < 0.0004);
        var baad = g.vejebaad;
        var baadNede = hjemme(baad) || (Math.abs(baad.p.x - S.HJEM.parkeret.x) + Math.abs(baad.p.y - S.HJEM.parkeret.y) < 1.5);
        if (baadNede) {
            S.tegnVejebaad(ctx, baad.p, this.stykker);
            if (this.markeret("vejebaad")) S.tegnMarkering(ctx, S.rekt("vejebaad", baad.p, baad.anker, 4), tid);
        } else {
            oppe.push(function () { S.tegnVejebaad(ctx, baad.p, this.stykker); });
        }

        /* Stinkskabet */
        ["svovlsyre", "saltsyre"].forEach(function (navn) {
            if (hjemme(g[navn])) {
                S.skygge(ctx, g[navn].hjem.x, 22, 0.3);
                this.tegnFlaske(ctx, navn);
            } else {
                oppe.push(function () { this.tegnFlaske(ctx, navn); });
            }
        }, this);
        if (this.markeret("flasker")) S.tegnMarkering(ctx, { x: 455, y: 380, b: 96, h: 120 }, tid);

        S.tegnVarmeplade(ctx, this.pladeTemp, this.pladeTaendt);
        var k = g.kolbe;
        var kolbeNede = k.sted === "hjem" || k.sted === "plade";
        if (kolbeNede && !k.traekkes) {
            S.skygge(ctx, k.p.x, 40, 0.3, k.sted === "plade" ? S.PLADE.y : S.BORD);
            this.tegnK(ctx, tid);
        } else if (k.sted !== "buret") {
            oppe.push(function () { this.tegnK(ctx, tid); });
        }

        /* Titreropstillingen */
        S.tegnStativ(ctx);
        var af = g.affald;
        if (af.sted === "flytter") oppe.push(function () { this.tegnAf(ctx, tid); });
        else this.tegnAf(ctx, tid);
        if (k.sted === "buret") this.tegnK(ctx, tid);
        S.tegnBuret(ctx, {
            V: this.buret.V, fyldt: this.buret.fyldt, tragt: this.vStart === null, aaben: this.buret.aaben,
            fremhaev: this.markeret("buret"), fremhaevHane: this.markeret("hane")
        }, tid);
        S.tegnKlemme(ctx);
        if (this.buret.aaben) {
            ctx.save();
            ctx.strokeStyle = "rgba(120, 26, 138, 0.9)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(B.x, B.spids);
            ctx.lineTo(B.x, this.overflade(this.destination()));
            ctx.stroke();
            ctx.restore();
        }
        var km = g.kmno4;
        if (hjemme(km)) {
            S.skygge(ctx, km.hjem.x, 22, 0.3);
            this.tegnFlaske(ctx, "kmno4");
            if (this.markeret("kmno4")) S.tegnMarkering(ctx, S.rekt("kmno4", km.p, km.anker, 0), tid);
        } else {
            oppe.push(function () { this.tegnFlaske(ctx, "kmno4"); });
        }
        S.tegnPlet(ctx, this.plet);

        /* Maalet under den genstand, der traekkes */
        var ht = this.holdt;
        if (ht && ht.type === "traek" && ht.flyttet && this.traekMaal) S.tegnMarkering(ctx, this.traekRekt(this.traekMaal), tid);

        for (i = 0; i < oppe.length; i++) oppe[i].call(this);

        if (this.straale) S.tegnStraale(ctx, this.straale.fra, this.straale.til, this.straale.farve, this.straale.bredde, tid);
        S.tegnDraaber(ctx, this.draaber);
        for (i = 0; i < this.flyvende.length; i++) {
            var f = this.flyvende[i];
            if (f.tot) {
                S.tot(ctx, f.x, f.y, f.r || 6, f.a);
            } else {
                ctx.fillStyle = f.farve || "rgba(200, 220, 240, 0.8)";
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r || 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        S.tegnDampe(ctx, this.dampe);

        /* Zoomboblen */
        if (this.bobleAlfa > 0.01 && this.bobleMaal) {
            var bo = { x: this.bobleSted.x, y: this.bobleSted.y, r: S.BOBLE.ude.r };
            S.tegnForbindelse(ctx, this.bobleMaal, bo, this.bobleAlfa);
            this.mikro.tegn(ctx, bo, this.bobleAlfa, this.bobleTitel, tid);
        }

        /* Handsken om kolbehalsen eller den genstand, der traekkes */
        var greb = null, v = 0;
        if (this.arbejdKilde === "mus-ryst" || this.arbejdKilde === "knap-ryst") {
            greb = NK.tilVerden(k.p, k.anker, 48, 30);
            v = k.p.v;
        }
        if (ht && ht.type === "traek" && ht.flyttet) { greb = { x: ht.sidst.x, y: ht.sidst.y + 6 }; v = this.g[ht.navn].p.v; }
        this.haandAlfa = NK.mod(this.haandAlfa || 0, greb ? 1 : 0, 10, 1 / 60);
        if (greb) this.sidsteGreb = { x: greb.x, y: greb.y, v: v };
        if (this.haandAlfa > 0.01 && this.sidsteGreb) {
            NK.Sprites.tegnPositur(ctx, "haand", this.sidsteGreb, S.ANKER.haand, this.haandAlfa);
        }

        if (this.tegnLaerer) this.tegnLaerer(ctx, tid);
        ctx.restore();
    };
}());
