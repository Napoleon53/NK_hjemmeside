/* =====================================================================
   sim_laes.js - fane 3: Laes pladen

   Seks sager, hvor en TLC-plade svarer paa et spoergsmaal: Hvad er
   stoffet? Er det rent? Er reaktionen faerdig? Pladen staar over
   karret med prøverne paa startlinjen. Eleven stiller den i karret, og
   naar den er loebet, flytter den over i UV-kassen til hoejre (som
   bogens figur i B8.6), hvor den er stor nok til at blive laest. De
   fleste stoffer er farveløse og ses foerst, naar UV-lampen taendes.
   Farvestofferne fra chokoladelinserne ses i dagslys.

   Pillen fra nettet koeres to gange: anden gang med en anden
   løbevæske, og de to plader staar side om side.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var NED_TID = 0.7, LAAG_TID = 0.35, OP_TID = 1.0, UV_TID = 0.6, FYLD_TID = 0.9;

    function SimLaes() {
        this.startFane(D.LAES);
        this.startFoerste();
    }

    var P = SimLaes.prototype;
    NK.Fane.paa(P, { navn: "l" });

    /* ----- Opgaven ---------------------------------------------------------------- */
    P.nyOpgave = function (o) {
        this.plader = [];
        this.uv = 0;
        this.lampe = false;
        this.fyldT = 0;
        this.nyPlade(o.loeb);
    };

    P.nyPlade = function (loebId) {
        var o = this.opg.o;
        this.loeb = D.LOEB[loebId];
        var p = new NK.Model.Plade({ baner: o.baner, loeb: this.loeb });
        p.sted = "over";
        p.ned = 0;
        p.laag = 1;
        p.op = 0;
        this.plader.push(p);
        this.aktiv = p;
        this.lay = null;
    };

    /* Anden plade i Pillen fra nettet: karret faar den nye løbevæske */
    P.nyDelScene = function (del) {
        if (del && del.ny && this.plader.length < 2) {
            this.nyPlade(this.opg.o.loeb2);
            this.fyldT = FYLD_TID;
        }
    };

    /* Trinene i forsoeget, der mangler */
    P.mangler = function () {
        var del = this.delData();
        if (!del || del.slags !== "forsoeg" || this.faerdig || this.venter) return [];
        var p = this.aktiv, ud = [];
        (del.trin || []).forEach(function (t) {
            if (t === "koer" && p.sted !== "vist") ud.push("koer");
            if (t === "uv") ud.push("uv");
        });
        if (del.trin && del.trin.indexOf("uv") >= 0 && this.lampe && this.uv >= 1) ud = ud.filter(function (t) { return t !== "uv"; });
        return ud;
    };

    P.tjekForsoeg = function () {
        var del = this.delData();
        if (!del || del.slags !== "forsoeg" || this.faerdig || this.venter) return;
        if (this.mangler().length) return;
        this.delKlaret("selv", del.set || "");
    };

    P.forsoegSvar = function () {
        var p = this.aktiv;
        p.faerdiggoer();
        p.sted = "vist";
        p.ned = 1;
        p.laag = 0;
        p.op = 1;
        this.fyldT = 0;
        var del = this.delData();
        if (del.trin && del.trin.indexOf("uv") >= 0) { this.lampe = true; this.uv = 1; }
    };

    P.sceneLinje = function () { return ""; };

    /* ----- Scenen ------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h, o = this.opg.o;
        var lay = { W: W, H: H, top: this.top() };
        lay.bordY = H - NK.klamp(H * 0.08, 40, 64);
        var kant = NK.klamp(W * 0.02, 12, 26);
        var p = this.aktiv;
        /* Visningen til hoejre: én eller to plader og navnene paa banerne */
        var to = !!o.loeb2;
        var pb = p.bredde, ph = p.hoejde;
        var visCm = to ? 2 * pb + 1.0 : pb;
        var nb = NK.klamp(W * 0.17, 150, 210);
        var hoejVis = lay.bordY - lay.top - 26;
        var s2 = Math.min((hoejVis - 92 - (to ? 16 : 0)) / ph, 62);
        /* Karret til venstre */
        var hoejKar = (lay.bordY - lay.top - 26) / 1.32;
        var s1 = hoejKar * 0.8 / ph;
        var kb = function () { return (pb + 1.4) * s1 * 240 / 204; };
        var vb = function () { return visCm * s2 + 56 + nb; };
        var ledig = W - 2 * kant - 40;
        if (kb() + vb() > ledig) {
            var f = ledig / (kb() + vb());
            s1 *= f;
            s2 *= f;
        }
        s1 = NK.klamp(s1, 6, 34);
        s2 = Math.max(s2, 8);
        lay.s1 = s1;
        lay.s2 = s2;
        var kh = ph * s1 / 0.8;
        var x0 = kant + Math.max(0, (ledig - kb() - vb()) / 3);
        lay.K = { x: x0, y: lay.bordY - kh, b: kb(), h: kh };
        /* UV-kassen */
        lay.vX = lay.K.x + lay.K.b + Math.max(30, (ledig - kb() - vb()) / 3 + 30);
        lay.vB = vb();
        var ekstra = to ? 16 : 0;
        lay.vH = Math.min(hoejVis, ph * s2 + 92 + ekstra);
        lay.vY = lay.bordY - lay.vH - 4;
        lay.nb = nb;
        lay.pladeVis = [];
        for (var i = 0; i < (to ? 2 : 1); i++) {
            lay.pladeVis.push({ x: lay.vX + 26 + i * (pb + 1.0) * s2, y: lay.vY + 58 + ekstra + (lay.vH - 92 - ekstra - ph * s2) / 2 });
        }
        this.lay = lay;
        this.saetAnker("kar", lay.K.x, lay.K.y - kh * 0.3, lay.K.b, kh * 1.3);
        this.saetAnker("uv", lay.vX, lay.vY, lay.vB, lay.vH);
    };

    /* Pladens rektangel og skala lige nu (paa vej ned, i karret, paa vej op i
       kassen eller i kassen) */
    P.pladeRekt = function (p, nr) {
        var lay = this.lay, K = lay.K, I = Tg.karInde(K), s1 = lay.s1;
        var b1 = p.bredde * s1, h1 = p.hoejde * s1;
        var x1 = (I.x0 + I.x1) / 2 - b1 / 2;
        var yI = I.bund - h1 - 1, yO = K.y - h1 * 0.42;
        var u = NK.blod(p.ned);
        var r = { x: x1, y: NK.lerp(yO, yI, u), s: s1 };
        if (p.op > 0) {
            var V = lay.pladeVis[nr] || lay.pladeVis[0];
            var v = NK.blod(p.op);
            var loeft = Math.sin(v * Math.PI) * 60;
            r = { x: NK.lerp(r.x, V.x, v), y: NK.lerp(r.y, V.y, v) - loeft, s: NK.lerp(s1, lay.s2, v) };
        }
        r.b = p.bredde * r.s;
        r.h = p.hoejde * r.s;
        return r;
    };

    P.opdaterScene = function (dt) {
        var mig = this;
        if (this.fyldT > 0) this.fyldT = Math.max(0, this.fyldT - dt);
        this.plader.forEach(function (p) {
            if (p.sted === "ned") {
                p.ned = Math.min(1, p.ned + dt / NED_TID);
                if (p.ned >= 1) p.sted = "laag";
            } else if (p.sted === "laag") {
                p.laag = Math.max(0, p.laag - dt / LAAG_TID);
                if (p.laag <= 0) { p.sted = "i"; p.koer(); }
            } else if (p.sted === "i" && p.status === "faerdig") {
                p.laag = Math.min(1, p.laag + dt / LAAG_TID);
                if (p.laag >= 1) p.sted = "op";
            } else if (p.sted === "op") {
                p.op = Math.min(1, p.op + dt / OP_TID);
                if (p.op >= 1) { p.sted = "vist"; mig.tjekForsoeg(); }
            }
            p.opdater(dt);
        });
        if (this.lampe && this.uv < 1) {
            this.uv = Math.min(1, this.uv + dt / UV_TID);
            if (this.uv >= 1) this.tjekForsoeg();
        }
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, t = this.tid, o = this.opg.o, mig = this;
        if (!lay) return;
        var W = lay.W, H = lay.H;
        Tg.baggrund(ctx, W, H, lay.bordY);
        /* Visningen: UV-kassen eller en lys plade til farvestofferne */
        if (o.uv) {
            var lampe = Tg.uvKasse(ctx, lay.vX, lay.vY, lay.vB, lay.vH, this.uv);
            this.lampeR = lampe.lampe;
            /* I dagslys er kassen aaben og lys indeni */
            if (this.uv < 1) {
                ctx.save();
                ctx.globalAlpha = 0.55 * (1 - this.uv);
                ctx.fillStyle = "#5b6676";
                NK.rundtRekt(ctx, lay.vX + 10, lay.vY + 44, lay.vB - 20, lay.vH - 54, 10);
                ctx.fill();
                ctx.restore();
            }
        } else {
            ctx.save();
            ctx.fillStyle = "#2c313b";
            NK.rundtRekt(ctx, lay.vX, lay.vY + 30, lay.vB, lay.vH - 30, 14);
            ctx.fill();
            ctx.restore();
            ctx.save();
            ctx.fillStyle = "#cfd6de";
            ctx.font = "700 12px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Pladen i dagslys", lay.vX + lay.vB / 2, lay.vY + 44);
            ctx.restore();
            this.lampeR = null;
        }
        /* Karret med den plade, der er i gang */
        var K = lay.K, p = this.aktiv;
        Tg.karBag(ctx, K);
        var dybde = p.vaeske * lay.s1;
        if (this.fyldT > 0) {
            var u = this.fyldT / FYLD_TID;
            dybde *= u > 0.5 ? (u - 0.5) * 2 : (0.5 - u) * 2;
        }
        Tg.karVaeske(ctx, K, dybde);
        var iKar = p.op <= 0 ? p : null;
        if (iKar) {
            var R = this.pladeRekt(p, this.plader.indexOf(p));
            Tg.plade(ctx, p, R.x, R.y, R.s, { uv: 0 });
        }
        Tg.karFor(ctx, K);
        Tg.laag(ctx, K, iKar ? p.laag : 1);
        Tg.etiket(ctx, "løbevæske: " + this.loeb.navn, K.x + K.b / 2, lay.bordY + 15, { font: "600 12px 'Segoe UI', sans-serif" });
        /* Pladerne, der er paa vej op eller ligger i visningen */
        this.plader.forEach(function (q, i) {
            if (q.op <= 0) return;
            var Rq = mig.pladeRekt(q, i);
            var iKasse = q.op >= 1;
            Tg.plade(ctx, q, Rq.x, Rq.y, Rq.s, { uv: iKasse ? mig.uv : 0 });
            if (iKasse) mig.tegnNavne(ctx, q, Rq, i);
        });
        this.tegnNoegle(ctx);
        this.tegnRinge(ctx, t);
        this.tegnSkilte(ctx, t);
        this.tegnSejr(ctx, W, H);
    };

    /* Banernes numre under pladen og løbevæsken over den (to plader) */
    P.tegnNavne = function (ctx, q, R, nr) {
        var mork = this.opg.o.uv && this.uv > 0.5;
        q.baner.forEach(function (b, i) {
            var x = R.x + q.banePos(i) * R.s;
            ctx.save();
            ctx.fillStyle = mork ? "#e6edf3" : "#e6edf3";
            ctx.font = "800 14px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(String(i + 1), x, R.y + R.h + 6);
            ctx.restore();
        });
        if (this.opg.o.loeb2) {
            Tg.etiket(ctx, q.loeb.navn, R.x + R.b / 2, R.y - 13, { font: "700 11px 'Segoe UI', sans-serif",
                bund: "rgba(20,22,28,0.92)" });
        }
    };

    /* Noeglen: hvad banerne er */
    P.tegnNoegle = function (ctx) {
        var lay = this.lay, o = this.opg.o;
        var x = lay.vX + lay.vB - lay.nb - 12, y = lay.vY + 62;
        var mork = o.uv;
        ctx.save();
        ctx.font = "600 13px 'Segoe UI', sans-serif";
        ctx.textBaseline = "middle";
        o.baner.forEach(function (b, i) {
            var yy = y + i * 28;
            ctx.fillStyle = mork ? "#1b2330" : "#1b2330";
            ctx.beginPath();
            ctx.arc(x + 11, yy, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.35)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = "#e6edf3";
            ctx.textAlign = "center";
            ctx.font = "800 12px 'Segoe UI', sans-serif";
            ctx.fillText(String(i + 1), x + 11, yy + 0.5);
            ctx.textAlign = "left";
            NK.passendeSkrift(ctx, b.navn, lay.nb - 30, 13, 10, "600");
            ctx.fillStyle = "#dfe6ee";
            ctx.fillText(b.navn, x + 28, yy + 0.5);
        });
        ctx.restore();
    };

    P.tegnRinge = function (ctx, t) {
        var lay = this.lay, mig = this, p = this.aktiv;
        var mangler = this.mangler();
        this.omNu().forEach(function (om) {
            if (om === "plade" && p.sted === "over" && mangler.indexOf("koer") >= 0) {
                var R = mig.pladeRekt(p, mig.plader.indexOf(p));
                Tg.ring(ctx, R.x, R.y, R.b, R.h, t, 6);
            } else if (om === "lampe" && mangler.indexOf("uv") >= 0 && mangler.indexOf("koer") < 0 && mig.lampeR) {
                var L = mig.lampeR;
                Tg.ring(ctx, L.x, L.y, L.b, L.h, t, 8);
            } else if (om === "visning") {
                Tg.ring(ctx, lay.vX, lay.vY, lay.vB, lay.vH, t, 16);
            } else if (om.indexOf("bane:") === 0) {
                var q = mig.plader[mig.plader.length - 1];
                if (q.op < 1) return;
                var Rq = mig.pladeRekt(q, mig.plader.length - 1);
                var i = parseInt(om.slice(5), 10), bx = Rq.x + q.banePos(i) * Rq.s, bb = 1.1 * Rq.s;
                Tg.ring(ctx, bx - bb / 2, Rq.y + 3, bb, Rq.h + 18, t, 6);
            }
        });
    };

    P.tegnSkilte = function (ctx, t) {
        if (!this.iForsoeg()) return;
        var p = this.aktiv, m = this.mangler();
        if (m.indexOf("koer") >= 0 && p.sted === "over" && this.fyldT <= 0) {
            var R = this.pladeRekt(p, this.plader.indexOf(p));
            Tg.skilt(ctx, "Klik: stil pladen i karret", R.x + R.b / 2, R.y - 22, t, "ned");
        } else if (m.indexOf("koer") < 0 && m.indexOf("uv") >= 0 && this.lampeR) {
            var L = this.lampeR;
            Tg.skilt(ctx, "Klik: tænd UV-lampen", L.x + L.b / 2, L.y - 6, t, "ned");
        }
    };

    /* ----- Musen ----------------------------------------------------------------------- */
    P.paaPladeOver = function (pt) {
        var p = this.aktiv;
        if (p.sted !== "over") return false;
        var R = this.pladeRekt(p, this.plader.indexOf(p)), K = this.lay.K;
        var iR = pt.x >= R.x - 6 && pt.x <= R.x + R.b + 6 && pt.y >= R.y - 6 && pt.y <= R.y + R.h + 6;
        var iK = pt.x >= K.x && pt.x <= K.x + K.b && pt.y >= K.y && pt.y <= K.y + K.h;
        return iR || iK;
    };

    P.paaLampe = function (pt) {
        var L = this.lampeR;
        if (!L) return false;
        return pt.x >= L.x - 10 && pt.x <= L.x + L.b + 10 && pt.y >= L.y - 10 && pt.y <= L.y + L.h + 10;
    };

    P.overScene = function (pt) {
        if (!pt || !this.lay) return null;
        if (this.paaPladeOver(pt)) return "pointer";
        if (this.paaLampe(pt)) return "pointer";
        return null;
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        if (this.paaPladeOver(pt)) { this.pladeKlik(); return; }
        if (this.paaLampe(pt)) { this.lampeKlik(); return; }
    };

    P.pladeKlik = function () {
        if (this.spaer()) return;
        var m = this.mangler();
        if (m.indexOf("koer") < 0 || this.fyldT > 0) return;
        this.nulstilHjaelp();
        this.aktiv.sted = "ned";
    };

    P.lampeKlik = function () {
        if (this.lampe) {
            this.kortBesked("UV-lampen er tændt. Laget lyser grønt, og stofferne ses som mørke pletter.", 4);
            return;
        }
        if (this.spaer()) return;
        var m = this.mangler();
        if (m.indexOf("koer") >= 0) { this.kortBesked("Kør TLC-pladen først. Klik på pladen over karret.", 4); return; }
        if (m.indexOf("uv") < 0) return;
        this.nulstilHjaelp();
        this.lampe = true;
    };

    NK.SimLaes = SimLaes;
}());
