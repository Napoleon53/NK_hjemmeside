/* =====================================================================
   scene.js - bassinet paa skaermen

   Binder modellen (js/model.js) til laerredet: placerer bassinet og det
   lille glas, tegner kuglerne, lader eleven ryste ved at traekke i
   bassinet og viser navnet paa den kugle, musen staar over.

   Bassinet er spritet sprites/bassin.svg (690 x 626 enheder, inderside
   x 20-670 og y 30-604,4 = modellens 40,5 x 35,79 kuglediametre). Det
   lille glas er det samme sprite i godt en fjerdedel af stoerrelsen.

   Haendelsen, som Kemichael lytter efter (NK.Bassin.prototype.paa):
     svaever     en stor oliedraabe svaever midt i det hele (paaskeaegget)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegning;
    var TILST = NK.Model.TILSTAND;

    var SPRITE_B = 690, SPRITE_H = 626;
    var IND_X = 20, IND_Y = 30, IND_B = 650, IND_BUND = 604.4;
    var GLAS_SKALA = 0.27;
    var MELLEM = 40;             /* luft mellem bassin og glas, i spriteenheder */

    function Bassin(canvas) {
        this.L = new NK.Laerred(canvas);
        this.m = new NK.Model(D);
        this.tid = 0;
        this.lay = null;
        this.ryk = 0;              /* bassinets forskydning, px */
        this.greb = null;          /* musen holder i bassinet */
        this.mus = null;
        this.lyttere = {};
        this.svaeverUr = 1;
        this.maengdeTekst = "";
        this.koblMus();
    }

    var P = Bassin.prototype;

    P.paa = function (navn, f) { (this.lyttere[navn] = this.lyttere[navn] || []).push(f); };
    P.udsend = function (navn) {
        (this.lyttere[navn] || []).forEach(function (f) { f(); });
    };

    /* ----- Det, panelet og opgaverne kalder ------------------------------ */

    /* fyld: [["vand", 3], ["olie", 1]] */
    P.nulstil = function (fyld, blandet) {
        this.m.nulstil();
        if (fyld && fyld.length) {
            var arter = [];
            fyld.forEach(function (f) { for (var i = 0; i < f[1]; i++) arter.push(D.nr(f[0])); });
            this.m.fyldStraks(arter, blandet);
        }
    };

    P.haeld = function (stofId) { this.m.haeldI(D.nr(stofId)); };

    P.ryst = function (sek) { this.m.ryst(sek || 1.2, 1); };

    P.toem = function () { this.m.toem(); };

    P.saetT = function (T) { this.m.saetT(T); };

    P.analyse = function () { return this.m.analyse(); };

    /* ----- Placering ------------------------------------------------------- */
    P.tilpas = function () {
        this.L.tilpas();
        var W = this.L.b, H = this.L.h;
        var bredde = SPRITE_B + MELLEM + SPRITE_B * GLAS_SKALA;
        var k = Math.min((W - 40) / bredde, (H - 42) / SPRITE_H);
        k = Math.max(0.2, k);
        var x0 = Math.round((W - bredde * k) / 2);
        var y0 = Math.round(H - 20 - SPRITE_H * k);
        var gk = k * GLAS_SKALA;
        var gx = x0 + (SPRITE_B + MELLEM) * k, gy = y0 + SPRITE_H * k - SPRITE_H * gk;
        this.lay = {
            k: k, x0: x0, y0: y0, u: IND_B * k / this.m.bredde,
            ind: { x: x0 + IND_X * k, y: y0 + IND_Y * k, b: IND_B * k, h: (IND_BUND - IND_Y) * k },
            glas: { x: gx, y: gy, k: gk,
                    ind: { x: gx + IND_X * gk, y: gy + IND_Y * gk, bredde: IND_B * gk, hoejde: (IND_BUND - IND_Y) * gk } }
        };
        this.anker("anker-bassin", x0, y0, SPRITE_B * k, SPRITE_H * k);
        this.anker("anker-glas", gx - 10, gy - 34, SPRITE_B * gk + 20, SPRITE_H * gk + 40);
    };

    P.anker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    /* Modellens koordinater (kuglediametre, y opad) til pixels */
    P.tilPx = function (x, y) {
        var l = this.lay;
        return { x: l.ind.x + this.ryk + x * l.u, y: l.ind.y + l.ind.h - y * l.u };
    };

    /* ----- Tidsskridt ------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        var m = this.m;
        m.opdater(dt);

        /* Bassinet ryster, mens modellen ryster, og fjedrer tilbage, naar
           musen slipper */
        if (m.rystTid > 0 && !this.greb) {
            this.ryk = Math.sin(this.tid * 13) * 5 * Math.min(1, m.rystTid * 2);
        } else if (!this.greb) {
            this.ryk *= Math.exp(-12 * dt);
        }

        this.svaeverUr -= dt;
        if (this.svaeverUr <= 0) {
            this.svaeverUr = 1;
            var a = m.analyse();
            var stor = a.lag.some(function (l) { return l.svaever && l.n >= 24; });
            if (stor) this.udsend("svaever");
            this.visMaengde(a);
        }
    };

    /* Linjen under knapperne: hvor meget der er af hvert stof */
    P.visMaengde = function () {
        var o = this.m.opgoer(), dele = [];
        D.STOFFER.forEach(function (s, i) {
            if (o.alt[i] > 0) dele.push(s.navn + " <b>" + Math.round(o.alt[i] / D.PORTION * D.PORTION_ML) + " mL</b>");
        });
        var tekst = dele.length ? "I bassinet: " + dele.join(" · ") : "Bassinet er tomt.";
        if (tekst !== this.maengdeTekst) {
            this.maengdeTekst = tekst;
            var e = NK.el("maengde");
            if (e) e.innerHTML = tekst;
        }
    };

    /* ----- Tegning ------------------------------------------------------------ */
    P.tegn = function () {
        var L = this.L, ctx = L.ctx, l = this.lay, m = this.m;
        if (!l) return;
        L.ryd();
        var dpr = L._dpr || 1, u = l.u, r = u * 0.47;
        var T = m.T, t = this.tid, i, k, p;
        var amp = (0.025 + 0.06 * (T - 20) / 100) * u;

        /* Skygge og varme under bassinet */
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(l.ind.x + l.ind.b / 2 + this.ryk, l.y0 + SPRITE_H * l.k + 4, l.ind.b * 0.52, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        /* Indersiden: den kolde zone, vaesken og dampen */
        ctx.save();
        ctx.beginPath();
        ctx.rect(l.ind.x + this.ryk, l.ind.y, l.ind.b, l.ind.h);
        ctx.clip();

        if (T > 22) {
            var varme = NK.klamp((T - 20) / 100, 0, 1);
            var gv = ctx.createLinearGradient(0, l.ind.y + l.ind.h, 0, l.ind.y + l.ind.h - 5 * u);
            gv.addColorStop(0, "rgba(255, 90, 50, " + (0.28 * varme) + ")");
            gv.addColorStop(1, "rgba(255, 90, 50, 0)");
            ctx.fillStyle = gv;
            ctx.fillRect(l.ind.x + this.ryk, l.ind.y + l.ind.h - 5 * u, l.ind.b, 5 * u);
        }
        var koldY = l.ind.y + (m.hoejde - m.koelFra) * u;
        var gk = ctx.createLinearGradient(0, l.ind.y, 0, koldY);
        gk.addColorStop(0, "rgba(125, 211, 252, 0.16)");
        gk.addColorStop(1, "rgba(125, 211, 252, 0.02)");
        ctx.fillStyle = gk;
        ctx.fillRect(l.ind.x + this.ryk, l.ind.y, l.ind.b, koldY - l.ind.y);

        var kugler = m.kugler, n = kugler.length;
        for (i = 0; i < n; i++) {
            k = kugler[i];
            if (k.tilst !== TILST.VAESKE) continue;
            var w1 = 1.8 + (k.f1 % 1.2), w2 = 1.6 + (k.f2 % 1.1);
            p = this.tilPx(k.x + Math.sin(t * w1 + k.f1) * amp / u, k.y + Math.sin(t * w2 + k.f2) * amp / u);
            Tg.kugle(ctx, k.art, p.x, p.y, r, dpr);
        }
        for (i = 0; i < n; i++) {
            k = kugler[i];
            if (k.tilst === TILST.BOBLE) {
                p = this.tilPx(k.x, k.y);
                Tg.boble(ctx, k.art, p.x, p.y, r, dpr);
            } else if (k.tilst === TILST.DAMP || k.tilst === TILST.DRAABE) {
                p = this.tilPx(k.x, k.y);
                ctx.globalAlpha = k.tilst === TILST.DAMP ? 0.6 : 0.95;
                Tg.kugle(ctx, k.art, p.x, p.y, k.tilst === TILST.DAMP ? r * 0.9 : r, dpr);
                ctx.globalAlpha = 1;
            } else if (k.tilst === TILST.AFLOEB) {
                p = this.tilPx(k.x, k.y);
                ctx.globalAlpha = NK.klamp(k.alfa, 0, 1);
                Tg.kugle(ctx, k.art, p.x, p.y, r, dpr);
                ctx.globalAlpha = 1;
            }
        }
        ctx.restore();

        /* Straalen og det, der loeber over, er uden for glasset */
        for (i = 0; i < n; i++) {
            k = kugler[i];
            if (k.tilst !== TILST.FALD && k.tilst !== TILST.SPILD) continue;
            p = this.tilPx(k.x, k.y);
            ctx.globalAlpha = NK.klamp(k.alfa, 0, 1);
            Tg.kugle(ctx, k.art, p.x, p.y, r, dpr);
            ctx.globalAlpha = 1;
        }

        NK.Sprites.tegn(ctx, "bassin", l.x0 + this.ryk, l.y0, SPRITE_B * l.k, SPRITE_H * l.k);
        NK.tekst(ctx, "køling", l.x0 + this.ryk + (SPRITE_B - 14) * l.k, l.y0 + 26 * l.k - 6,
            { font: "600 12px 'Segoe UI', sans-serif", justering: "right", farve: "rgba(160, 220, 250, 0.85)" });

        this.tegnGlas(ctx);
        this.tegnNavn(ctx, r);
    };

    /* Det lille glas: det samme bassin, set med det blotte oeje */
    P.tegnGlas = function (ctx) {
        var l = this.lay, g = l.glas, m = this.m;
        var gr = this.ryk * GLAS_SKALA;

        /* Forstoerrelsen: fra glasset til bassinet */
        ctx.save();
        ctx.strokeStyle = "rgba(200, 210, 225, 0.22)";
        ctx.setLineDash([4, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(g.ind.x + gr, g.ind.y);
        ctx.lineTo(l.ind.x + l.ind.b + this.ryk, l.ind.y);
        ctx.moveTo(g.ind.x + gr, g.ind.y + g.ind.hoejde);
        ctx.lineTo(l.ind.x + l.ind.b + this.ryk, l.ind.y + l.ind.h);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "rgba(10, 10, 14, 0.9)";
        ctx.fillRect(g.ind.x + gr, g.ind.y, g.ind.bredde, g.ind.hoejde);
        Tg.makro(ctx, m, { x: g.ind.x + gr, y: g.ind.y, bredde: g.ind.bredde, hoejde: g.ind.hoejde });
        /* Boblerne, naar det koger */
        var gs = g.ind.bredde / m.bredde;
        ctx.strokeStyle = "rgba(240, 248, 255, 0.85)";
        ctx.lineWidth = 1;
        for (var i = 0; i < m.kugler.length; i++) {
            var kb = m.kugler[i];
            if (kb.tilst !== TILST.BOBLE) continue;
            ctx.beginPath();
            ctx.arc(g.ind.x + gr + kb.x * gs, g.ind.y + g.ind.hoejde - kb.y * gs, Math.max(1.2, gs * 0.6), 0, Math.PI * 2);
            ctx.stroke();
        }
        /* Straalen, naar der haeldes i */
        if (m.haelder()) {
            var art = m.haeld[0].art;
            ctx.strokeStyle = art === D.nr("olie") ? "rgba(246, 208, 96, 0.8)" : "rgba(205, 228, 250, 0.7)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(g.ind.x + gr + g.ind.bredde / 2, g.y - 18);
            ctx.lineTo(g.ind.x + gr + g.ind.bredde / 2, g.ind.y + g.ind.hoejde - m.overflade() / m.hoejde * g.ind.hoejde);
            ctx.stroke();
        }
        ctx.restore();

        NK.Sprites.tegn(ctx, "bassin", g.x + gr, g.y, SPRITE_B * g.k, SPRITE_H * g.k);
        NK.tekst(ctx, "Sådan ser det ud", g.x + SPRITE_B * g.k / 2, g.y - 12,
            { font: "600 13px 'Segoe UI', sans-serif", justering: "center", farve: "#c8ced6" });
    };

    /* Navnet paa den kugle, musen staar over */
    P.tegnNavn = function (ctx, r) {
        if (!this.mus || this.greb) return;
        var k = this.kugleVed(this.mus.x, this.mus.y, r * 1.1);
        if (!k) return;
        var s = D.STOFFER[k.art];
        var tekst = s.Navn + ", " + s.formel + ", " + (s.polaer ? "polær" : "upolær");
        if (k.tilst === TILST.DAMP || k.tilst === TILST.BOBLE) tekst += ", damp";
        var p = this.tilPx(k.x, k.y);
        ctx.save();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        Tg.skilt(ctx, tekst, p.x, p.y - r - 6, { kant: s.farve, klamp: [4, this.L.b - 4] });
    };

    P.kugleVed = function (px, py, maks) {
        var bedst = null, afst = maks * maks;
        var kugler = this.m.kugler;
        for (var i = 0; i < kugler.length; i++) {
            var k = kugler[i];
            if (k.tilst === TILST.SPILD || k.tilst === TILST.AFLOEB || k.tilst === TILST.FALD) continue;
            var p = this.tilPx(k.x, k.y), dx = p.x - px, dy = p.y - py, d = dx * dx + dy * dy;
            if (d < afst) { afst = d; bedst = k; }
        }
        return bedst;
    };

    /* ----- Musen ----------------------------------------------------------- */
    P.iBassin = function (px, py) {
        var l = this.lay;
        return !!l && px >= l.x0 + this.ryk && px <= l.x0 + this.ryk + SPRITE_B * l.k && py >= l.y0 && py <= l.y0 + SPRITE_H * l.k;
    };

    /* Kemichael kan saette en funktion her, der fanger klik paa ham foerst */
    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        function punkt(e) {
            var r = c.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        }
        c.addEventListener("pointerdown", function (e) {
            var p = punkt(e);
            if (mig.klikFoerst && mig.klikFoerst(p.x, p.y)) return;
            if (!mig.iBassin(p.x, p.y)) return;
            mig.greb = { x0: p.x, ryk0: mig.ryk, sidst: p.x, t: performance.now() };
            try { c.setPointerCapture(e.pointerId); } catch (fejl) { /* ingen fangst */ }
            c.style.cursor = "grabbing";
        });
        c.addEventListener("pointermove", function (e) {
            var p = punkt(e);
            mig.mus = p;
            if (mig.greb) {
                var g = mig.greb, nu = performance.now();
                mig.ryk = NK.klamp(g.ryk0 + p.x - g.x0, -40, 40);
                var fart = Math.abs(p.x - g.sidst) / Math.max(8, nu - g.t) * 1000;
                g.sidst = p.x;
                g.t = nu;
                /* Hurtige ryk ryster vaesken; langsomme flytter bare glasset */
                if (fart > 500) mig.m.ryst(0.12, NK.klamp((fart - 500) / 1500, 0.2, 1));
                return;
            }
            var over = mig.iBassin(p.x, p.y) || (mig.overLaerer && mig.overLaerer(p.x, p.y));
            c.style.cursor = over ? (mig.iBassin(p.x, p.y) ? "grab" : "pointer") : "default";
        });
        function slip() {
            if (!mig.greb) return;
            mig.greb = null;
            c.style.cursor = "grab";
        }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
        c.addEventListener("pointerleave", function () { mig.mus = null; });
    };

    NK.Bassin = Bassin;
}());
