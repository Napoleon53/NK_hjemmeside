/* =====================================================================
   skema.js - maengdeberegningsskemaet paa tavlen (fane 2)

   Brugerens oenske 5. okt. 2026: tavlen havde en hel linje med
   oplysninger; nu staar de i et maengdeberegningsskema som i sc4.5.
   Oeverst staar reaktionsskemaet med en kolonne under hvert stof og tre
   raekker: m (masse), M (molarmasse) og n (stofmaengde). Massen af
   jernet (m(før) fra forsoeget) og de to molarmasser staar der fra
   start. De tre celler, eleven regner, staar med et spoergsmaalstegn,
   til trinnet er loest i panelet: n(Fe), n(oxid) og m(oxid). Cellen,
   man er ved, har en gul ramme.

   Pilene viser vejen og kommer frem, naar cellen, de foerer til, er
   fundet: ned i kolonnen med jern (÷ M), paa tvaers under n-raekken med
   forholdet fra skemaet og op i kolonnen med oxidet (· M).

   Skemaet tegnes paa laerredet og har ingen felter; eleven skriver i
   panelet (js/regning.js). Brug:
     var s = new NK.Skema();
     s.saet(opg, regning);  s.layout(ctx, rekt, rh);
     s.loest(id);  s.opdater(dt);  s.tegn(ctx, tid, { hint: true });
     s.ramt(pt)   // cellen under musen, fx "fe_m"
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var KOL = ["fe", "o2", "ox"];
    var FARVE = { tekst: "#1c1f26", koef: "#d9731a", pil: "#2f6fc4", navn: "#2a5d9c", kendt: "#3fae72" };
    /* Trinnet og cellen, det finder; pilen, der foerer dertil; cellerne, det regnes fra */
    var TRIN = {
        n_fe: { celle: "fe_n", pil: "ned", fra: ["fe_m", "fe_M"] },
        n_ox: { celle: "ox_n", pil: "tvaers", fra: ["fe_n"] },
        m_ox: { celle: "ox_m", pil: "op", fra: ["ox_n", "ox_M"] }
    };

    function Skema() {
        this.opg = null;
        this.regning = null;
        this.lay = null;
        this.pile = {};          /* trin -> 0-1: hvor langt pilen er tegnet */
    }

    var P = Skema.prototype;

    /* Tavlens hoejde, naar en raekke er rh hoej */
    Skema.hoejde = function (rh) { return Math.round(22 + 5.65 * rh); };

    /* Trinnet, der finder cellen (eller null) */
    Skema.trinFor = function (celle) {
        var ud = null;
        Object.keys(TRIN).forEach(function (id) { if (TRIN[id].celle === celle) ud = id; });
        return ud;
    };

    P.saet = function (opg, regning) {
        var mig = this;
        this.opg = opg;
        this.regning = regning;
        this.pile = {};
        /* Det, der allerede er loest, har sin pil fra start */
        Object.keys(TRIN).forEach(function (id) { if (regning.loest(id)) mig.pile[id] = 1; });
    };

    /* Et trin er loest: pilen tegnes */
    P.loest = function (id) { if (TRIN[id] && this.pile[id] === undefined) this.pile[id] = 0; };

    P.opdater = function (dt) {
        var p = this.pile;
        Object.keys(p).forEach(function (id) { if (p[id] < 1) p[id] = Math.min(1, p[id] + dt / 0.55); });
    };

    /* ----- Layout -------------------------------------------------------------------
       r: tavlens rektangel. rh: raekkernes hoejde. */
    P.layout = function (ctx, r, rh) {
        var pad = NK.klamp(r.b * 0.022, 10, 24);
        var b = r.b - 2 * pad;
        var labelB = NK.klamp(b * 0.19, 40, 150);
        var tegnB = NK.klamp(b * 0.05, 16, 46);
        var kolB = Math.min((b - labelB - 2 * tegnB) / 3, 230);
        var samlet = labelB + 3 * kolB + 2 * tegnB;
        var lay = { r: r, rh: rh, labelB: labelB, tegnB: tegnB, kolB: kolB, samlet: samlet };
        lay.x0 = r.x + pad + (b - samlet) / 2;
        lay.titelX = r.x + pad;
        lay.titelY = r.y + rh * 0.3 + 10;
        lay.y0 = r.y + rh * 0.3 + 22;
        lay.hovedH = rh * 1.2;
        lay.hovedY = lay.y0 + lay.hovedH * 0.5;
        lay.raekkeY = {};
        D.RAEKKER.forEach(function (rk, i) { lay.raekkeY[rk.id] = lay.y0 + lay.hovedH + rh * (i + 0.5); });
        lay.bund = lay.y0 + lay.hovedH + 3 * rh;
        lay.midter = {};
        KOL.forEach(function (k, j) { lay.midter[k] = lay.x0 + labelB + j * (kolB + tegnB) + kolB / 2; });
        lay.tegnX = [0, 1].map(function (j) { return lay.x0 + labelB + (j + 1) * kolB + j * tegnB + tegnB / 2; });
        lay.feltB = Math.round(NK.klamp(kolB - 2 * NK.klamp(kolB * 0.1, 6, 22), 64, 190));
        lay.feltH = Math.round(NK.klamp(rh * 0.74, 22, 42));
        lay.feltPx = NK.klamp(rh * 0.4, 13, 20);
        lay.formelPx = Math.round(NK.klamp(Math.min(rh * 0.54, kolB * 0.2), 15, 28));
        this.lay = lay;
    };

    P.feltRekt = function (id) {
        var lay = this.lay, d = id.split("_");
        var x = lay.midter[d[0]], y = lay.raekkeY[d[1]];
        return { x: x - lay.feltB / 2, y: y - lay.feltH / 2, b: lay.feltB, h: lay.feltH, cx: x, cy: y };
    };

    /* Cellen under musen */
    P.ramt = function (pt) {
        var lay = this.lay, ud = null, mig = this;
        if (!lay || !pt) return null;
        KOL.forEach(function (k) {
            D.RAEKKER.forEach(function (rk) {
                var r = mig.feltRekt(k + "_" + rk.id);
                if (pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y - 3 && pt.y <= r.y + r.h + 3) ud = k + "_" + rk.id;
            });
        });
        return ud;
    };

    /* ----- Cellernes indhold ---------------------------------------------------------- */
    P.celle = function (id) {
        var o = this.opg, sk = o.sk, f = o.facit;
        if (id === "fe_m") return { slags: "kendt", tekst: K.g2(o.tal.mf) + " g" };
        if (id === "fe_M") return { slags: "tal", tekst: K.MFeTekst + " g/mol" };
        if (id === "ox_M") return { slags: "tal", tekst: sk.Mtekst + " g/mol" };
        var trin = Skema.trinFor(id);
        if (!trin) return { slags: "tom" };
        var tekst = trin === "n_fe" ? K.mol(f.n) + " mol" : (trin === "n_ox" ? K.mol(f.nOx) + " mol" : K.g2(f.m) + " g");
        return { slags: this.regning.status(trin), tekst: tekst, trin: trin };
    };

    /* ----- Tegning ----------------------------------------------------------------------
       v: { hint: cellerne, det aktive trin regnes fra, faar en ring,
            over: cellen under musen } */
    P.tegn = function (ctx, tid, v) {
        var lay = this.lay, o = this.opg, mig = this;
        if (!lay || !o) return;
        v = v || {};
        var sk = o.sk, puls = 0.55 + 0.45 * Math.sin((tid || 0) * 6);
        var aktivt = this.regning.aktivt();
        ctx.save();
        Tg.tavleEtiket(ctx, D.TAVLE_TITEL, lay.titelX, lay.titelY, NK.klamp(lay.rh * 0.3, 12, 14));

        /* Hovedet: reaktionsskemaet med tallene foran stofferne */
        var formler = ["Fe", "O₂", sk.oxid];
        ctx.textBaseline = "middle";
        KOL.forEach(function (k, j) {
            var mx = lay.midter[k], koef = sk.koef[j], kt = koef > 1 ? koef + " " : "";
            /* Ved hintet til trin 2 lyser de to tal, forholdet kommer fra */
            var lys = v.hint && aktivt && aktivt.id === "n_ox" && k !== "o2";
            ctx.font = Tg.font("800", lay.formelPx);
            var kb = ctx.measureText(kt).width;
            ctx.font = Tg.font("700", lay.formelPx);
            var fb = ctx.measureText(formler[j]).width;
            var sx = mx - (kb + fb) / 2;
            if (lys) {
                ctx.save();
                ctx.strokeStyle = "rgba(214, 150, 20, " + (0.5 + 0.5 * puls).toFixed(3) + ")";
                ctx.lineWidth = 3;
                NK.rundtRekt(ctx, sx - 7, lay.hovedY - lay.formelPx * 0.75, kb + fb + 14, lay.formelPx * 1.5, 8);
                ctx.stroke();
                ctx.restore();
            }
            ctx.textAlign = "left";
            ctx.font = Tg.font("800", lay.formelPx);
            ctx.fillStyle = FARVE.koef;
            ctx.fillText(kt, sx, lay.hovedY);
            ctx.font = Tg.font("700", lay.formelPx);
            ctx.fillStyle = FARVE.tekst;
            ctx.fillText(formler[j], sx + kb, lay.hovedY);
        });
        ctx.font = Tg.font("700", lay.formelPx);
        ctx.fillStyle = "#6a7080";
        ctx.textAlign = "center";
        ctx.fillText("+", lay.tegnX[0], lay.hovedY);
        ctx.fillText("→", lay.tegnX[1], lay.hovedY);

        /* Linjerne */
        var xa = lay.x0, xb = lay.x0 + lay.samlet;
        ctx.fillStyle = "#2c3340";
        ctx.fillRect(xa, lay.y0 + lay.hovedH - 1.5, xb - xa, 3);
        ctx.fillStyle = "rgba(40, 46, 58, 0.16)";
        for (var i = 1; i < 3; i++) ctx.fillRect(xa, lay.y0 + lay.hovedH + i * lay.rh - 0.5, xb - xa, 1);
        ctx.fillRect(lay.x0 + lay.labelB - 6, lay.y0 + lay.hovedH, 1.5, 3 * lay.rh);

        /* Raekkernes navne: bogstavet i kursiv og, naar der er plads, ordet */
        var bpx = NK.klamp(lay.rh * 0.5, 16, 24), npx = NK.klamp(lay.rh * 0.29, 12, 14);
        ctx.font = Tg.font("600", npx);
        var medOrd = D.RAEKKER.every(function (rk) { return lay.labelB - 6 >= bpx * 1.3 + ctx.measureText(rk.navn).width + 8; });
        D.RAEKKER.forEach(function (rk) {
            var y = lay.raekkeY[rk.id];
            NK.tekst(ctx, rk.id, lay.x0 + 4, y, { font: Tg.matte(bpx, "700"), linje: "middle", farve: FARVE.navn });
            if (medOrd) NK.tekst(ctx, rk.navn, lay.x0 + 4 + bpx * 1.3, y + 1, { font: Tg.font("600", npx), linje: "middle", farve: "#6a7280" });
        });

        /* Cellerne */
        KOL.forEach(function (k) {
            D.RAEKKER.forEach(function (rk) {
                var id = k + "_" + rk.id, c = mig.celle(id), r = mig.feltRekt(id);
                mig.tegnCelle(ctx, c, r, puls, v.over === id);
            });
        });

        /* Hintet: de celler, trinnet regnes fra */
        if (v.hint && aktivt && TRIN[aktivt.id]) {
            ctx.save();
            ctx.strokeStyle = "rgba(214, 150, 20, " + (0.5 + 0.5 * puls).toFixed(3) + ")";
            ctx.lineWidth = 3;
            TRIN[aktivt.id].fra.forEach(function (id) {
                var r = mig.feltRekt(id);
                NK.rundtRekt(ctx, r.x - 4, r.y - 4, r.b + 8, r.h + 8, 8);
                ctx.stroke();
            });
            ctx.restore();
        }
        ctx.restore();
        this.tegnPile(ctx);
    };

    P.tegnCelle = function (ctx, c, r, puls, over) {
        var lay = this.lay, px = lay.feltPx;
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (c.slags === "tom") {
            ctx.fillStyle = "rgba(60, 66, 80, 0.28)";
            ctx.fillRect(r.cx - 9, r.cy - 1, 18, 2.5);
        } else if (c.slags === "tal") {
            NK.passendeSkrift(ctx, c.tekst, r.b - 8, px, 11, "700");
            ctx.fillStyle = "#3a4150";
            ctx.fillText(c.tekst, r.cx, r.cy + 1);
        } else if (c.slags === "kendt") {
            /* Den kendte masse: groen stiplet boks, som i sc4.5 */
            ctx.fillStyle = "rgba(63, 174, 114, 0.14)";
            NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 6);
            ctx.fill();
            ctx.strokeStyle = FARVE.kendt;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
            NK.passendeSkrift(ctx, c.tekst, r.b - 10, px, 11, "800");
            ctx.fillStyle = "#1f6e45";
            ctx.fillText(c.tekst, r.cx, r.cy + 1);
        } else if (c.slags === "ok" || c.slags === "svar") {
            var svar = c.slags === "svar";
            ctx.fillStyle = svar ? "rgba(214, 160, 20, 0.16)" : "rgba(63, 174, 114, 0.2)";
            NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 6);
            ctx.fill();
            ctx.strokeStyle = svar ? "#c79a1e" : FARVE.kendt;
            ctx.lineWidth = 2;
            ctx.stroke();
            NK.passendeSkrift(ctx, c.tekst, r.b - 10, px, 11, "800");
            ctx.fillStyle = svar ? "#8a6200" : "#1d7a48";
            ctx.fillText(c.tekst, r.cx, r.cy + 1);
        } else {
            /* Skal regnes: et spoergsmaalstegn; den, man er ved, har en gul ramme */
            var aktiv = c.slags === "aktiv";
            ctx.fillStyle = aktiv ? "#fffbe9" : "rgba(40, 46, 58, 0.05)";
            NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 6);
            ctx.fill();
            ctx.strokeStyle = aktiv ? "rgba(214, 160, 20, " + (0.45 + 0.55 * puls).toFixed(3) + ")" : "rgba(40, 46, 58, 0.22)";
            ctx.lineWidth = aktiv ? 3 : 1.5;
            ctx.stroke();
            ctx.font = Tg.font("800", px * 1.1);
            ctx.fillStyle = aktiv ? "#1c1f26" : "rgba(31, 37, 48, 0.4)";
            ctx.fillText("?", r.cx, r.cy + 1);
        }
        if (over && c.slags !== "tom") {
            ctx.strokeStyle = "rgba(47, 111, 196, 0.55)";
            ctx.lineWidth = 2;
            NK.rundtRekt(ctx, r.x - 3, r.y - 3, r.b + 6, r.h + 6, 8);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* Pilene for vejen: ned til hoejre for jernets celler, paa tvaers under
       n-raekken og op til venstre for oxidets celler */
    P.tegnPile = function (ctx) {
        var lay = this.lay, sk = this.opg.sk, p = this.pile;
        var hb = lay.feltB / 2, px = NK.klamp(lay.rh * 0.3, 12, 14);
        var yM = lay.raekkeY.m, yN = lay.raekkeY.n, ym = (yM + yN) / 2;
        function et(t) { return { alfa: NK.klamp((t - 0.6) / 0.4, 0, 1), px: px }; }
        if (p.n_fe !== undefined) {
            var xs = lay.midter.fe + hb + 7;
            Tg.rutePil(ctx, xs, yM + 4, xs, yN - 4, xs + lay.rh * 0.5, ym, { t: p.n_fe });
            Tg.pilEtiket(ctx, xs + lay.rh * 0.25 + 22, ym, "÷ M", et(p.n_fe));
        }
        if (p.n_ox !== undefined) {
            var x0 = lay.midter.fe + 12, x1 = lay.midter.ox - 12, y0 = yN + lay.feltH / 2 + 4;
            var dyb = lay.rh * 0.42;
            Tg.rutePil(ctx, x0, y0, x1, y0, (x0 + x1) / 2, y0 + 2 * dyb, { t: p.n_ox });
            Tg.pilEtiket(ctx, (x0 + x1) / 2, y0 + dyb, sk.del === 1 ? sk.koef[0] + " : " + sk.koef[2] : "÷ " + sk.del, et(p.n_ox));
        }
        if (p.m_ox !== undefined) {
            var xo = lay.midter.ox - hb - 7;
            Tg.rutePil(ctx, xo, yN - 4, xo, yM + 4, xo - lay.rh * 0.5, ym, { t: p.m_ox });
            Tg.pilEtiket(ctx, xo - lay.rh * 0.25 - 22, ym, "· M", et(p.m_ox));
        }
    };

    NK.Skema = Skema;
}());
