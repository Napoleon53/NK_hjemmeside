/* =====================================================================
   bord.js - tegning af bordet og styring med musen

   Udvider NK.Forsoeg med:
     hvad(pt)          hvilken genstand ligger under punktet
     ned / flyt / op   musen: klik, eller traek i et glas for at ryste
                       eller flytte det
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
        if (this.saml) return S.sammenlignHvad(pt);
        var kop = g.kaffekop;
        if (!kop.skjult && !kop.iHaand && S.inden("kaffekop", kop.p, kop.anker, pt.x, pt.y, 6)) return "kaffekop";

        var glas = this.glasListe();
        for (i = glas.length - 1; i >= 0; i--) {
            if (S.inden("reagensglas", glas[i].p, glas[i].anker, pt.x, pt.y, 6)) return glas[i].navn;
        }
        if (S.iRekt(S.stavRekt(g.glasstav.p), pt, 5)) return "glasstav";
        var navne = ["fe", "scn", "ag", "vand", "baeger"];
        for (i = 0; i < navne.length; i++) {
            var gg = g[navne[i]];
            if (S.inden(gg.sprite, gg.p, gg.anker, pt.x, pt.y, 5)) return gg.navn;
        }
        var vb = S.BAD.vandbad, ib = S.BAD.isbad, V = S.VARMEPLADE;
        if (pt.x > vb.x - 4 && pt.x < vb.x + vb.b + 4 && pt.y > vb.y - 4 && pt.y < vb.bund) return "vandbad";
        if (pt.x > V.x && pt.x < V.x + 180 * V.skala && pt.y > V.y && pt.y < S.BORD) return "vandbad";
        if (pt.x > ib.x - 4 && pt.x < ib.x + ib.b + 4 && pt.y > ib.y - 4 && pt.y < ib.bund) return "isbad";
        if (pt.x > S.DUNK.x && pt.x < S.DUNK.x + 90 && pt.y > S.DUNK.y - 4 && pt.y < S.BORD) return "dunk";
        if (pt.x > S.STATIV.x && pt.x < S.STATIV.x + S.STATIV.b && pt.y > S.STATIV.y && pt.y < S.BORD) return "stativ";
        if (S.iRekt(S.KORT, pt)) return "kort";
        return null;
    };

    /* ----- Mus og beroering --------------------------------------------- */
    P.ned = function (pt) {
        if (NK.Lyd) NK.Lyd.laasOp();
        var navn = this.hvad(pt);
        if (!navn) return false;
        var optaget = this.laererOptaget && this.laererOptaget();
        if (/^glas\d$/.test(navn) && !optaget && !this.optaget() && !this.rystKilde && !this.saml) {
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
        /* Glasset foelger musen frit, saa det kan baeres hen til badene */
        gl.p.x = NK.klamp(pt.x - h.dx, 40, 960);
        gl.p.y = NK.klamp(pt.y - h.dy, 110, S.GLAS_Y + 8);
    };

    P.op = function () {
        var h = this.holdt;
        if (!h) return;
        this.holdt = null;
        if (!h.flyttet) { this.klik(h.navn); return; }
        this.stopRyst(h.sidst);
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
            var greb = hv && /^glas\d$/.test(hv) && mig.kanTageFat(mig.g[hv]);
            var knap = hv && (/^vurder\d$/.test(hv) || hv === "samlLuk" || hv === "samlUd");
            c.style.cursor = mig.holdt ? "grabbing" : (greb ? "grab" : ((hv && hv !== "samlArk") || knap ? "pointer" : "default"));
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
        if (gg.erGlas) {
            if ((this.holdt && this.holdt.navn === gg.navn) || this.rystGlas === gg || gg.sted === "flytter" || gg.sted === "baaret") return true;
            var hj = this.hjemFor(gg);
            return Math.abs(gg.p.x - hj.x) + Math.abs(gg.p.y - hj.y) > 1.5 || Math.abs(gg.p.v - hj.v) > 0.01;
        }
        return Math.abs(gg.p.x - gg.hjem.x) + Math.abs(gg.p.y - gg.hjem.y) > 1.5 || Math.abs(gg.p.v - gg.hjem.v) > 0.01;
    };

    P.beholderTegning = function (c) {
        var b = c.b;
        var bf = this.bundfald(c);
        var glas = c.erGlas;
        var farve = glas ? M.glasFarve : M.baegerFarve;
        return {
            p: c.p, V: M.volumen(b), Vsol: b.sol.V,
            solFarve: farve(b.sol.V > 0.02 ? b.sol : b.lag),
            lagFarve: b.lag ? farve(b.lag) : null,
            bund: bf.bund, uklar: bf.uklar,
            boelge: (this.rystGlas === c ? this.ryst * 3.5 : 0) + (this.roerer === c ? 1.4 : 0),
            fremhaev: this.markeret(c.navn), nr: c.nr || 0, valgt: this.valgt === c.navn
        };
    };

    P.tegnEtGlas = function (ctx, gl, tid) {
        gl.niveau = S.tegnGlas(ctx, this.beholderTegning(gl), tid);
    };

    P.tegnGenstand = function (ctx, gg, tid, hjemme) {
        var mark = this.markeret(gg.navn);
        switch (gg.navn) {
            case "baeger":
                gg.niveau = S.tegnBaeger(ctx, this.beholderTegning(gg), tid, hjemme);
                return;
            case "glasstav":
                S.tegnStav(ctx, gg.p, mark, tid);
                return;
            default:
                if (gg.erGlas) { this.tegnEtGlas(ctx, gg, tid); return; }
                if (hjemme) S.skygge(ctx, gg.hjem.x - gg.anker.x + NK.Sprites.FILER[gg.sprite].b / 2, 22, 0.3);
                NK.Sprites.tegnPositur(ctx, gg.sprite, gg.p, gg.anker);
        }
        if (mark) S.tegnMarkering(ctx, S.rekt(gg.sprite, gg.p, gg.anker, 0), tid);
    };

    P.bobleTitel = function (c) {
        if (!c.erGlas) return "Bægerglasset";
        var t = "Glas " + c.nr;
        if (c.sted === "vandbad") t += " i vandbadet";
        else if (c.sted === "isbad") t += " i isbadet";
        return t;
    };

    P.tegn = function () {
        var L = this.laerred;
        var ctx = L.ctx;
        ctx.clearRect(0, 0, L.b, L.h);
        var sk = S.skala(L.b, L.h);
        var tid = this.tid, g = this.g, i, mig = this;

        ctx.save();
        ctx.translate(sk.dx, sk.dy);
        ctx.scale(sk.s, sk.s);
        if (this.ryk > 0) ctx.translate((Math.random() - 0.5) * this.ryk, (Math.random() - 0.5) * this.ryk);

        S.tegnBaggrund(ctx, { urMinutter: this.urMinutter });

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

        S.tegnKort(ctx, this.markeret("kort"), tid);
        S.tegnVarmeplade(ctx, tid);
        ["vandbad", "isbad"].forEach(function (bad) {
            var gl = mig.glasI(bad);
            if (gl && !mig.oppe(gl)) mig.tegnEtGlas(ctx, gl, tid);
            S.tegnBad(ctx, bad, tid, mig.markeret(bad));
        });
        S.tegnDampe(ctx, this.dampe);
        S.tegnDunk(ctx, this.markeret("dunk"), tid);

        var aktive = [];
        var orden = ["vand", "baeger", "fe", "scn", "ag"].concat(NK.GLAS, ["STATIV", "glasstav"]);
        for (i = 0; i < orden.length; i++) {
            if (orden[i] === "STATIV") {
                S.tegnStativ(ctx);
                if (this.markeret("stativ")) S.tegnMarkering(ctx, { x: S.STATIV.x, y: 320, b: S.STATIV.b, h: 180 }, tid);
                continue;
            }
            var gg = g[orden[i]];
            if (this.oppe(gg)) { aktive.push(gg); continue; }
            if (gg.erGlas && gg.sted !== "stativ") continue;
            this.tegnGenstand(ctx, gg, tid, true);
        }

        S.tegnPyt(ctx, this.pyt);

        /* Zoomboblen */
        if (this.bobleAlfa > 0.01 && this.bobleBeholder) {
            var bb = this.bobleBeholder;
            var lp = bb.erGlas ? NK.tilVerden(bb.p, bb.anker, S.LUP_GLAS.x, S.LUP_GLAS.y) : NK.tilVerden(bb.p, bb.anker, S.LUP_BAEGER.x, S.LUP_BAEGER.y);
            S.tegnForbindelse(ctx, lp, S.BOBLE, this.bobleAlfa);
            bb.mikro.tegn(ctx, S.BOBLE, this.bobleAlfa, this.bobleTitel(bb), tid);
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
        if (this.tegnLaerer) this.tegnLaerer(ctx, tid);
        S.tegnSammenlign(ctx, this.samlData, this.samlAlfa, tid);
        ctx.restore();
    };
}());
