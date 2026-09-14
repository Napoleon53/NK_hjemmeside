/* =====================================================================
   bord.js - tegning af bordet og styring med musen

   Udvider NK.Forsoeg med:
     hvad(pt)          hvilken genstand ligger under punktet
     ned / flyt / op   musen: klik, eller traek i et glas for at ryste
     tegn()            hele scenen i den rigtige raekkefoelge
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;
    var A = S.ANKER;
    var P = NK.Forsoeg.prototype;

    /* ----- Musens position paa tegnebordet ------------------------------ */
    P.tilBord = function (ev) {
        var rect = this.canvas.getBoundingClientRect();
        var sk = S.skala(this.laerred.b, this.laerred.h);
        return { x: (ev.clientX - rect.left - sk.dx) / sk.s, y: (ev.clientY - rect.top - sk.dy) / sk.s };
    };

    /* ----- Hvad ligger under musen? ---------------------------------------- */
    P.hvad = function (pt) {
        var g = this.g, i;
        if (this.overLaerer) {
            var l = this.overLaerer(pt);
            if (l) return l;
        }
        var K = S.KONTAKT;
        if (pt.x > K.x0 && pt.x < K.x1 && pt.y > K.y0 && pt.y < K.y1) return "kontakt";
        var kop = g.kaffekop;
        if (!kop.skjult && !kop.iHaand && S.inden("kaffekop", kop.p, kop.anker, pt.x, pt.y, 6)) return "kaffekop";

        /* Proppen i et glas skal vinde over glasset */
        var propper = ["prop1", "prop2"], glas = ["glas1", "glas2"];
        for (i = 0; i < propper.length; i++) {
            var pr = g[propper[i]];
            if (pr.iGlas && S.inden("prop", this.propIGlas(pr.iGlas), A.prop, pt.x, pt.y, 6)) return pr.navn;
        }
        for (i = 0; i < glas.length; i++) {
            var gl = g[glas[i]];
            if (S.inden("reagensglas", gl.p, gl.anker, pt.x, pt.y, 6)) return gl.navn;
        }
        for (i = 0; i < propper.length; i++) {
            var pr2 = g[propper[i]];
            if (!pr2.iGlas && !pr2.flyver && S.inden("prop", pr2.p, pr2.anker, pt.x, pt.y, 8)) return pr2.navn;
        }
        var navne = ["folie", "phpapir", "agno3", "hexan", "bromflaske"];
        for (i = 0; i < navne.length; i++) {
            var gg = g[navne[i]];
            if (S.inden(gg.sprite, gg.p, gg.anker, pt.x, pt.y, 5)) return gg.navn;
        }
        var H = S.HOLDER;
        if (pt.x > H.x - 6 && pt.x < H.x + H.b + 6 && pt.y > H.y - 6 && pt.y < S.BORD + 2) return "holder";
        if (pt.x > 630 && pt.x < 850 && pt.y > 262 && pt.y < S.BORD + 2) return "lampe";
        if (pt.x > S.DUNK.x && pt.x < S.DUNK.x + 90 && pt.y > S.DUNK.y - 4 && pt.y < S.BORD) return "dunk";
        if (pt.x > S.STATIV.x && pt.x < S.STATIV.x + 150 && pt.y > S.STATIV.y && pt.y < S.BORD) return "stativ";
        return null;
    };

    /* ----- Mus og beroering --------------------------------------------- */
    P.ned = function (pt) {
        if (NK.Lyd) NK.Lyd.laasOp();
        var navn = this.hvad(pt);
        if (!navn) return false;
        var optaget = this.laererOptaget && this.laererOptaget();
        if ((navn === "glas1" || navn === "glas2") && !optaget && !this.handling && !this.rystKilde) {
            var gl = this.g[navn];
            if (gl.sted !== "flytter") {
                this.holdt = { navn: navn, start: pt, dx: pt.x - gl.p.x, dy: pt.y - gl.p.y, flyttet: false, sidst: pt, t: Date.now() };
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
        var gl = this.g[h.navn];
        if (nu === undefined) nu = Date.now();
        if (!h.flyttet) {
            if (Math.abs(pt.x - h.start.x) + Math.abs(pt.y - h.start.y) < 8) return;
            if (!this.proevRyst(gl)) { this.holdt = null; return; }
            h.flyttet = true;
            h.sidst = pt;
            h.t = nu;
            this.startRyst("mus", gl);
        }
        var dts = Math.max(4, nu - h.t) / 1000;
        var dx = pt.x - h.sidst.x, dy = pt.y - h.sidst.y;
        this.musVx = NK.lerp(this.musVx, dx / dts, 0.5);
        this.musFart = NK.lerp(this.musFart, Math.sqrt(dx * dx + dy * dy) / dts, 0.35);
        h.sidst = pt;
        h.t = nu;
        var hj = this.hjemFor(gl);
        gl.p.x = NK.klamp(pt.x - h.dx, hj.x - 90, hj.x + 90);
        gl.p.y = NK.klamp(pt.y - h.dy, hj.y - 80, hj.y);
    };

    P.op = function () {
        var h = this.holdt;
        if (!h) return;
        this.holdt = null;
        if (!h.flyttet) { this.klik(h.navn); return; }
        this.stopRyst();
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
            var greb = (hv === "glas1" || hv === "glas2") && mig.kanRyste(mig.g[hv]);
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

    P.oppe = function (gg) {
        var erGlas = gg.navn === "glas1" || gg.navn === "glas2";
        if (erGlas && ((this.holdt && this.holdt.navn === gg.navn) || this.rystGlas === gg)) return true;
        if (gg.flyver) return true;
        var hj = erGlas ? this.hjemFor(gg) : gg.hjem;
        return Math.abs(gg.p.x - hj.x) + Math.abs(gg.p.y - hj.y) > 1.5 || Math.abs(gg.p.v - hj.v) > 0.01;
    };

    P.tegnGlas = function (ctx, gl, tid) {
        var hn = this.handling ? this.handling.navn : "";
        var haelder = (hn === "brom" || hn === "hexan") && this.straale && Math.abs(this.straale.til.x - gl.p.x) < 2;
        var o = {
            p: gl.p, vandAreal: gl.vandAreal, hexAreal: gl.hexAreal,
            vandFarve: M.vandFarve(gl), hexFarve: M.hexanFarve(gl),
            bundfald: gl.visBund, uklar: gl.uklar,
            boelge: (this.rystGlas === gl ? this.ryst * 3.5 : 0) + (haelder ? 1.2 : 0),
            folie: gl.folieVis, fremhaev: this.markeret(gl.navn),
            nr: gl.nr, valgt: this.valgt === gl.navn, strimmel: gl.strimmel
        };
        gl.niveau = S.tegnReagensglas(ctx, o, tid);
        gl.niveauTop = o.niveauTop;
        if (gl.prop) NK.Sprites.tegnPositur(ctx, "prop", this.propIGlas(gl), A.prop);
    };

    P.tegnGenstand = function (ctx, gg, tid, hjemme) {
        var mark = this.markeret(gg.navn);
        switch (gg.navn) {
            case "bromflaske":
                if (hjemme) S.skygge(ctx, 78, 40, 0.3);
                NK.Sprites.tegnPositur(ctx, "bromflaske", gg.p, gg.anker);
                NK.Sprites.tegnPositur(ctx, "skruelaag", this.laagPositur(), A.skruelaag);
                break;
            case "hexan":
                if (hjemme) S.skygge(ctx, 158, 22, 0.3);
                NK.Sprites.tegnPositur(ctx, "hexan", gg.p, gg.anker);
                /* Laaget: skrues af og laegges paa bordet ved siden af */
                var paa = NK.tilVerden(gg.p, gg.anker, 23, 4);
                var t = NK.blod(this.hexLaagT);
                var x = NK.lerp(paa.x, 126, t), y = NK.lerp(paa.y, S.BORD - 5, t) - Math.sin(Math.PI * t) * 30;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(NK.lerp(gg.p.v, 0, t));
                ctx.fillStyle = "#2c5f99";
                NK.rundtRekt(ctx, -9, -6, 18, 11, 2.5);
                ctx.fill();
                ctx.fillStyle = "#3f7fc9";
                ctx.fillRect(-7, -5, 14, 3);
                ctx.restore();
                break;
            case "glas1":
            case "glas2":
                this.tegnGlas(ctx, gg, tid);
                mark = false;
                break;
            case "prop1":
            case "prop2":
                if (gg.iGlas) return;
                if (hjemme) S.skygge(ctx, gg.hjem.x, 12, 0.25);
                NK.Sprites.tegnPositur(ctx, "prop", gg.p, gg.anker);
                break;
            default:
                if (hjemme) S.skygge(ctx, gg.hjem.x - gg.anker.x + NK.Sprites.FILER[gg.sprite].b / 2, 22, 0.3);
                NK.Sprites.tegnPositur(ctx, gg.sprite, gg.p, gg.anker);
        }
        if (mark) S.tegnMarkering(ctx, S.rekt(gg.sprite, gg.p, gg.anker, 0), tid);
    };

    P.bobleTitel = function (gl) {
        var t = "Glas " + gl.nr;
        if (gl.sted === "lampe") t += this.lampeTaendt ? " under lampen" : " under den slukkede lampe";
        else if (gl.folie) t += " i folie";
        else if (gl.brom) t += " i stativet";
        return t;
    };

    P.tegn = function () {
        var L = this.laerred;
        var ctx = L.ctx;
        ctx.clearRect(0, 0, L.b, L.h);
        var sk = S.skala(L.b, L.h);
        var tid = this.tid, g = this.g, i;

        ctx.save();
        ctx.translate(sk.dx, sk.dy);
        ctx.scale(sk.s, sk.s);
        if (this.ryk > 0) ctx.translate((Math.random() - 0.5) * this.ryk, (Math.random() - 0.5) * this.ryk);

        S.tegnBaggrund(ctx, { urMinutter: this.urMinutter });
        S.tegnLuft(ctx, this.luft, tid);
        S.tegnKontrolpanel(ctx, this.udsugning, this.vinge, this.markeret("kontakt"), tid);

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

        S.tegnDunk(ctx);
        if (this.markeret("dunk")) S.tegnMarkering(ctx, { x: S.DUNK.x, y: S.DUNK.y, b: 90, h: 130 }, tid);
        S.tegnPyt(ctx, this.pyt);
        S.tegnHolder(ctx);
        S.tegnLampe(ctx, this.lampeVis, tid, this.markeret("lampe"));

        var aktive = [];
        var orden = ["bromflaske", "hexan", "agno3", "phpapir", "glas1", "glas2", "STATIV", "PAPIR", "prop1", "prop2", "folie"];
        for (i = 0; i < orden.length; i++) {
            if (orden[i] === "STATIV") {
                S.tegnStativ(ctx);
                if (this.markeret("stativ")) S.tegnMarkering(ctx, { x: S.STATIV.x, y: S.STATIV.y + 20, b: 150, h: 80 }, tid);
                continue;
            }
            if (orden[i] === "PAPIR") {
                if (g.glas1.papir) S.tegnStrimmel(ctx, g.glas1.papir);
                if (g.glas2.papir) S.tegnStrimmel(ctx, g.glas2.papir);
                continue;
            }
            var gg = g[orden[i]];
            if (this.oppe(gg)) aktive.push(gg);
            else this.tegnGenstand(ctx, gg, tid, true);
        }

        /* Zoomboblen */
        if (this.bobleAlfa > 0.01 && this.bobleGlas) {
            var bg = this.bobleGlas;
            var lp = NK.tilVerden(bg.p, bg.anker, S.LUP.x, S.LUP.y);
            S.tegnForbindelse(ctx, lp, S.BOBLE, this.bobleAlfa);
            bg.mikro.tegn(ctx, S.BOBLE, this.bobleAlfa, this.bobleTitel(bg), tid);
        }

        for (i = 0; i < aktive.length; i++) this.tegnGenstand(ctx, aktive[i], tid, false);

        /* Handsken om glasset */
        var greb = this.rystGlas || (this.holdt ? g[this.holdt.navn] : null);
        if (greb) this.sidsteGreb = greb;
        if (this.haandAlfa > 0.01 && this.sidsteGreb) {
            var hp = NK.tilVerden(this.sidsteGreb.p, this.sidsteGreb.anker, 15, 58);
            NK.Sprites.tegnPositur(ctx, "haand", { x: hp.x, y: hp.y, v: this.sidsteGreb.p.v }, A.haand, this.haandAlfa);
        }

        if (this.straale) S.tegnStraale(ctx, this.straale.fra, this.straale.til, this.straale.farve, this.straale.bredde, tid);
        S.tegnDraaber(ctx, this.draaber);
        for (i = 0; i < this.strimler.length; i++) S.tegnStrimmel(ctx, this.strimler[i]);
        S.tegnDampe(ctx, this.dampe);
        if (this.tegnLaerer) this.tegnLaerer(ctx, tid);
        ctx.restore();
    };
}());
