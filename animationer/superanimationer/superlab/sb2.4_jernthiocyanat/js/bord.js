/* =====================================================================
   bord.js - tegning af bordet og styring med musen

   Udvider NK.Forsoeg med:
     hvad(pt)          hvilken genstand ligger under punktet
     ned / flyt / op   musen: klik, eller tag fat i udstyret og slip det
                       der, hvor det skal bruges
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
        if (this.visning) return this.visning === "foto" ? S.fotoHvad(pt) : S.ovenfraHvad(pt);
        var kop = g.kaffekop;
        if (!kop.skjult && !kop.iHaand && S.inden("kaffekop", kop.p, kop.anker, pt.x, pt.y, 6)) return "kaffekop";

        /* Ringen og det, der svaever, ligger oeverst */
        var ring = this.svaevRing();
        if (ring && Math.abs(pt.x - ring.x) < ring.r + 6 && Math.abs(pt.y - ring.y) < ring.r + 6) return ring.navn;
        var sv = this.svaevende();
        if (sv && S.inden(sv.sprite, sv.p, sv.anker, pt.x, pt.y, 6)) return sv.navn;

        if (this.station === 1) {
            var glas = this.glasListe();
            for (i = glas.length - 1; i >= 0; i--) {
                var gl = glas[i];
                var off = gl.sted === "vandbad" || gl.sted === "isbad" ? this.badOff[gl.sted] : { x: 0, y: 0 };
                if (S.inden("reagensglas", { x: gl.p.x + off.x, y: gl.p.y + off.y, v: gl.p.v }, gl.anker, pt.x, pt.y, 6)) return gl.navn;
            }
            if (S.iRekt(S.termRekt(g.termometer.p), pt, 3)) return "termometer";
            if (S.iRekt(S.stavRekt(g.glasstav.p), pt, 5)) return "glasstav";
            if (S.inden("spatel", g.spatel.p, g.spatel.anker, pt.x, pt.y, 6)) return "spatel";
            var navne = ["ag", "flaske_scn", "pulver_scn", "pulver_vitc", "pulver_fe", "baegerA", "kolbe1"];
            for (i = 0; i < navne.length; i++) {
                var gg = g[navne[i]];
                if (S.inden(gg.sprite, gg.p, gg.anker, pt.x, pt.y, 4)) return gg.navn;
            }
            var V = S.VARMEPLADE;
            if (S.iRekt(S.badRekt("vandbad", this.badOff.vandbad), pt, 4)) return "vandbad";
            if (pt.x > V.x && pt.x < V.x + 180 * V.skala && pt.y > V.y && pt.y < S.BORD) return "vandbad";
            if (S.iRekt(S.badRekt("isbad", this.badOff.isbad), pt, 4)) return "isbad";
            if (pt.x > S.DUNK.x && pt.x < S.DUNK.x + 90 && pt.y > S.DUNK.y - 4 && pt.y < S.BORD) return "dunk";
            if (pt.x > S.STATIV.x && pt.x < S.STATIV.x + S.STATIV.b && pt.y > S.STATIV.y && pt.y < S.BORD) return "stativ";
            if (S.iRekt(S.KORT, pt)) return "kort";
            return null;
        }

        var navne2 = ["vand", "flaske_farve", "kolbe2"].concat(NK.BAEGERE);
        for (i = 0; i < navne2.length; i++) {
            var g2 = g[navne2[i]];
            if (S.inden(g2.sprite, g2.p, g2.anker, pt.x, pt.y, 4)) return g2.navn;
        }
        if (pt.x > S.DUNK.x && pt.x < S.DUNK.x + 90 && pt.y > S.DUNK.y - 4 && pt.y < S.BORD) return "dunk";
        if (pt.x > S.PAPIR.x && pt.x < S.PAPIR.x + S.PAPIR.b && pt.y > S.BORD - 130 && pt.y < S.BORD + 8) return "papir";
        return null;
    };

    /* Kan genstanden tages med musen lige nu? */
    P.grebbar = function (navn) {
        var gg = this.g[navn];
        if (!gg || !gg.greb || !this.synlig(gg)) return false;
        if (gg.erGlas) return this.kanTageFat(gg);
        if (gg.greb === "bad") {
            var i = this.glasI(navn);
            return !(i && i === this.rystGlas);
        }
        return true;
    };

    /* ----- Mus og beroering --------------------------------------------- */
    P.ned = function (pt) {
        if (NK.Lyd) NK.Lyd.laasOp();
        var navn = this.hvad(pt);
        if (!navn) return false;
        var laererOpt = this.laererOptaget && this.laererOptaget();
        if (!laererOpt && !this.optaget() && !this.rystKilde && !this.baerer && !this.visning && this.grebbar(navn)) {
            /* Tages der fat i noget andet, gaar det svaevende hjem */
            var sv = this.svaevende();
            if (sv && sv.navn !== navn) this.svaevHjem(sv);
            var gg = this.g[navn];
            /* En genstand paa vej hjem kan tages midt i bevaegelsen */
            if (this.handling && this.handling.navn === "hjem" && this.handling.liste.some(function (tr) { return tr.flyt === gg; })) this.handling = null;
            var pos = gg.greb === "bad" ? this.badOff[navn] : gg.p;
            this.holdt = { navn: navn, start: pt, dx: pt.x - pos.x, dy: pt.y - pos.y, flyttet: false, sidst: pt, t: Date.now() };
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
        var gg = this.g[h.navn];
        if (nu === undefined) nu = Date.now();
        if (!h.flyttet) {
            if (Math.abs(pt.x - h.start.x) + Math.abs(pt.y - h.start.y) < 8) return;
            h.flyttet = true;
            h.sidst = pt;
            h.t = nu;
            if (gg.erGlas) {
                if (!this.proevRyst(gg)) { this.holdt = null; return; }
                this.startRyst("mus", gg);
            } else {
                this.startBaer(gg);
            }
        }
        var dts = Math.max(4, nu - h.t) / 1000;
        var dx = pt.x - h.sidst.x, dy = pt.y - h.sidst.y;
        this.musVx = NK.lerp(this.musVx, dx / dts, 0.5);
        this.musFart = NK.lerp(this.musFart, Math.sqrt(dx * dx + dy * dy) / dts, 0.35);
        h.sidst = pt;
        h.t = nu;
        if (gg.greb === "bad") {
            var off = this.badOff[gg.navn];
            off.x = NK.klamp(pt.x - h.dx, -760, 120);
            off.y = NK.klamp(pt.y - h.dy, -260, 0);
        } else {
            gg.p.x = NK.klamp(pt.x - h.dx, 20, S.BREDDE - 20);
            gg.p.y = NK.klamp(pt.y - h.dy, 60, gg.erGlas ? S.GLAS_Y + 8 : gg.hjem.y + 6);
        }
        this.slipMaal = gg.erGlas || gg.greb === "bad" ? null : this.maalVed(gg, pt);
    };

    P.op = function () {
        var h = this.holdt;
        if (!h) return;
        this.holdt = null;
        if (!h.flyttet) { this.klik(h.navn); return; }
        var gg = this.g[h.navn];
        if (gg.erGlas) this.stopRyst(h.sidst);
        else this.stopBaer(h.sidst);
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
            var greb = hv && mig.grebbar(hv);
            c.style.cursor = mig.holdt ? "grabbing" : (greb ? "grab" : (hv && hv !== "visArk" ? "pointer" : "default"));
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
        if (!gg.p || !gg.hjem) return false;
        if (gg.erGlas) {
            if ((this.holdt && this.holdt.navn === gg.navn) || this.rystGlas === gg || gg.sted === "flytter" || gg.sted === "baaret") return true;
            var hj = this.hjemFor(gg);
            return Math.abs(gg.p.x - hj.x) + Math.abs(gg.p.y - hj.y) > 1.5 || Math.abs(gg.p.v - hj.v) > 0.01;
        }
        if (this.baerer === gg || (this.holdt && this.holdt.navn === gg.navn)) return true;
        return Math.abs(gg.p.x - gg.hjem.x) + Math.abs(gg.p.y - gg.hjem.y) > 1.5 || Math.abs(gg.p.v - gg.hjem.v) > 0.01;
    };

    P.beholderTegning = function (c) {
        var b = c.b;
        var bf = this.bundfald(c);
        var farve = c.erGlas ? M.glasFarve : M.baegerFarve;
        return {
            p: c.p, V: M.volumen(b), Vsol: b.sol.V,
            solFarve: farve(b.sol.V > 0.02 ? b.sol : b.lag),
            lagFarve: b.lag ? farve(b.lag) : null, lagBund: b.lagBund,
            bund: bf.bund, uklar: bf.uklar,
            fast: { fe: b.fast.fe, scn: b.fast.scn, vitc: b.fast.vitc },
            boelge: ((this.rystGlas === c || this.baerer === c) ? this.ryst * 3.5 : 0) + (this.roerer === c ? 1.4 : 0),
            fremhaev: this.markeret(c.navn), nr: c.nr || 0, valgt: this.valgt === c.navn
        };
    };

    P.tegnEtGlas = function (ctx, gl, tid) {
        gl.niveau = S.tegnGlas(ctx, this.beholderTegning(gl), tid);
    };

    /* Rammen om en genstand: den bruges baade til hintets markering og til
       det, der er valgt */
    P.ramme = function (gg) {
        if (gg.greb === "stav") return S.stavRekt(gg.p);
        if (gg.greb === "termometer") return S.termRekt(gg.p);
        return S.rekt(gg.sprite, gg.p, gg.anker, 0);
    };

    P.tegnGenstand = function (ctx, gg, tid, hjemme) {
        var mark = this.markeret(gg.navn);
        if (gg.erGlas) { this.tegnEtGlas(ctx, gg, tid); return; }
        if (gg.erBeholder) { gg.niveau = S.tegnBaeger(ctx, this.beholderTegning(gg), tid, hjemme); return; }
        var eget = true;
        switch (gg.greb) {
            case "kolbe":
                S.tegnKolbe(ctx, { p: gg.p, V: gg.tom ? 0 : 200, farve: M.baegerFarve(M.stamOpl(10)), boelge: this.baerer === gg ? this.ryst * 3 : 0, fremhaev: mark }, tid, hjemme);
                break;
            case "stav":
                S.tegnStav(ctx, gg.p, mark, tid);
                break;
            case "termometer":
                S.tegnTermometer(ctx, gg.p, gg.T, !!this.maaler, mark, tid);
                break;
            case "spatel":
                S.tegnSpatel(ctx, gg.p, gg.last, mark, tid);
                break;
            default:
                eget = false;
        }
        if (!eget) {
            if (hjemme) S.skygge(ctx, gg.hjem.x - gg.anker.x + NK.Sprites.FILER[gg.sprite].b / 2, 22, 0.3);
            NK.Sprites.tegnPositur(ctx, gg.sprite, gg.p, gg.anker);
            if (mark) S.tegnMarkering(ctx, this.ramme(gg), tid);
        }
        if (!mark && this.valgt === gg.navn) S.tegnValgt(ctx, this.ramme(gg));
    };

    P.bobleTitel = function (c) {
        if (!c.erGlas) return c.titel;
        var t = "Glas " + c.nr;
        if (c.sted === "vandbad") t += " i vandbadet";
        else if (c.sted === "isbad") t += " i isbadet";
        return t;
    };

    /* Rammen om det, udstyret vil blive brugt paa, hvis det slippes nu */
    P.tegnSlipMaal = function (ctx, tid) {
        var navn = this.slipMaal;
        if (!navn || !this.baerer) return;
        var gg = this.g[navn], rekt = null;
        if (navn === "dunk") rekt = { x: S.DUNK.x, y: S.DUNK.y, b: 90, h: 130 };
        else if (gg && gg.sprite) rekt = S.rekt(gg.sprite, gg.p, gg.anker, 0);
        if (!rekt) return;
        ctx.save();
        ctx.strokeStyle = "#2fbf6f";
        ctx.lineWidth = 3;
        ctx.shadowColor = "rgba(47, 191, 111, 0.85)";
        ctx.shadowBlur = 10;
        NK.rundtRekt(ctx, rekt.x - 7, rekt.y - 7, rekt.b + 14, rekt.h + 14, 9);
        ctx.stroke();
        ctx.restore();
    };

    P.tegnDel1 = function (ctx, tid, aktive) {
        var mig = this, g = this.g;
        S.tegnKort(ctx, this.markeret("kort"), tid);
        S.tegnVarmeplade(ctx, tid);
        ["vandbad", "isbad"].forEach(function (bad) {
            var off = mig.badOff[bad];
            ctx.save();
            ctx.translate(off.x, off.y);
            var gl = mig.glasI(bad);
            if (gl && !mig.oppe(gl)) mig.tegnEtGlas(ctx, gl, tid);
            S.tegnBad(ctx, bad, tid, mig.markeret(bad), off.y === 0);
            ctx.restore();
        });
        S.tegnDampe(ctx, this.dampe);
        S.tegnDunk(ctx, this.markeret("dunk"), tid);

        var orden = ["kolbe1", "baegerA", "pulver_fe", "pulver_vitc", "pulver_scn", "flaske_scn", "ag"].concat(NK.GLAS, ["STATIV", "spatel", "glasstav", "termometer"]);
        for (var i = 0; i < orden.length; i++) {
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
    };

    P.tegnDel2 = function (ctx, tid, aktive) {
        var g = this.g;
        S.tegnPapir(ctx, this.markeret("papir"), tid);
        S.tegnDunk(ctx, this.markeret("dunk"), tid);
        ["kolbe2", "flaske_farve", "vand"].concat(NK.BAEGERE).forEach(function (navn) {
            var gg = g[navn];
            if (this.oppe(gg)) aktive.push(gg);
            else this.tegnGenstand(ctx, gg, tid, true);
        }, this);
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

        var aktive = [];
        if (this.station === 1) this.tegnDel1(ctx, tid, aktive);
        else this.tegnDel2(ctx, tid, aktive);
        S.tegnEtiketter(ctx, this.station);
        S.tegnPyt(ctx, this.pyt);

        /* Zoomboblen */
        if (this.bobleAlfa > 0.01 && this.bobleBeholder && this.synlig(this.bobleBeholder)) {
            var bb = this.bobleBeholder;
            var off = bb.erGlas && (bb.sted === "vandbad" || bb.sted === "isbad") ? this.badOff[bb.sted] : { x: 0, y: 0 };
            var lup = bb.lup || (bb.erGlas ? S.LUP_GLAS : S.LUP_BAEGER);
            var lp = NK.tilVerden(bb.p, bb.anker, lup.x, lup.y);
            S.tegnForbindelse(ctx, { x: lp.x + off.x, y: lp.y + off.y }, S.BOBLE, this.bobleAlfa);
            bb.mikro.tegn(ctx, S.BOBLE, this.bobleAlfa, this.bobleTitel(bb), tid);
        }

        for (i = 0; i < aktive.length; i++) this.tegnGenstand(ctx, aktive[i], tid, false);
        this.tegnSlipMaal(ctx, tid);

        /* Den gule ring ved det, der svaever: et klik gentager handlingen */
        var ring = this.svaevRing();
        if (ring) S.tegnSvaevRing(ctx, ring, tid, this.hover === ring.navn);

        /* Handsken om det reagensglas, der holdes */
        var greb = this.rystGlas || (this.holdt && g[this.holdt.navn].erGlas ? g[this.holdt.navn] : null);
        if (greb) this.sidsteGreb = greb;
        if (this.haandAlfa > 0.01 && this.sidsteGreb) {
            var hp = NK.tilVerden(this.sidsteGreb.p, this.sidsteGreb.anker, 15, 58);
            NK.Sprites.tegnPositur(ctx, "haand", { x: hp.x, y: hp.y, v: this.sidsteGreb.p.v }, A.haand, this.haandAlfa);
        }

        if (this.straale) S.tegnStraale(ctx, this.straale.fra, this.straale.til, this.straale.farve, this.straale.bredde, tid);
        S.tegnDraaber(ctx, this.draaber);
        if (this.tegnLaerer) this.tegnLaerer(ctx, tid);
        if (this.sidsteVisning === "foto") S.tegnFoto(ctx, this.visData, this.visAlfa, tid);
        else if (this.sidsteVisning === "ovenfra") S.tegnOvenfra(ctx, this.visData, this.visAlfa, tid);
        ctx.restore();
    };
}());
