/* =====================================================================
   glas.js - et reagensglas med et fedtstof oploest i heptan (fane 2 og 3)

   Makroniveauet. I glasset er der heptan med en draabe fedtstof i.
   Eleven drypper bromvand i, én draabe ad gangen. Draaben falder ned
   gennem heptanen til bunden, glasset ryster sig selv, og dibrom flytter
   op i det oeverste lag. Hvor orange laget er, regnes af proeven
   (NK.Proeve i js/fedt.js): kun det dibrom, der ikke har adderet til en
   dobbeltbinding, giver farve. Vandet fra draaberne bliver i bunden.

   Glasset er spritet sprites/reagensglas.svg (med prop) eller
   reagensglas_aaben.svg (det glas, der dryppes i). Vaeskerne tegnes bag.
   Glassene staar foran en hvid plade (js/sim_dryp.js), saa farven i det
   oeverste lag er let at se (brugeren 12. nov. 2026). Derfor er stregerne
   og de farveloese vaesker tegnet til en lys baggrund.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Tg = NK.Tegn;

    var FALD_SEK = 0.38;       /* draaben falder fra pipetten ned i glasset */
    var RYST_SEK = 0.75;       /* glasset ryster sig selv */
    var SKIL_SEK = 0.55;       /* de to lag skiller igen */
    var HEPTAN = 92;           /* heptanlagets hoejde i spritets maal */
    var VAND_PR_DRAABE = 2.2;  /* saa meget hoejere bliver vandet i bunden pr. draabe */
    var ORANGE = "236, 128, 24";

    function Roer(valg) {
        this.fedtId = valg.fedt;
        this.proeve = new NK.Proeve(valg.fedt);
        this.x = 0;
        this.bund = 0;
        this.b = 50;
        this.tid = Math.random() * 10;
        this.boble = [];
        for (var i = 0; i < 16; i++) this.boble.push({ fx: Math.random(), fy: Math.random(), r: NK.r(1.6, 3.4), fase: NK.r(0, 6.28), lys: i % 2 === 0 });
        this.nulstil();
    }

    var P = Roer.prototype;

    Roer.FALD_SEK = FALD_SEK;
    Roer.RYST_SEK = RYST_SEK;
    Roer.SKIL_SEK = SKIL_SEK;
    Roer.CYKLUS = FALD_SEK + RYST_SEK + SKIL_SEK;

    P.plads = function (x, bund, b) {
        this.x = x;
        this.bund = bund;
        this.b = b;
    };

    P.nulstil = function () {
        this.proeve.nulstil();
        this.fase = "klar";
        this.t = 0;
        this.uro = 0;
        this.ny = 0;               /* orange i bunden fra den draabe, der lige er landet */
    };

    P.draaber = function () { return this.proeve.draaber; };

    /* Glasset er klar til en ny draabe: intet er paa vej */
    P.klar = function () { return this.fase === "klar" && this.proeve.ro(); };

    /* Alt er faldet til ro efter den sidste draabe */
    P.rolig = function () { return this.klar(); };

    P.dryp = function () {
        if (!this.klar()) return false;
        this.fase = "falder";
        this.t = 0;
        return true;
    };

    P.opdater = function (dt) {
        this.tid += dt;
        this.t += dt;
        if (this.fase === "falder" && this.t >= FALD_SEK) {
            /* draaben er i bunden: glasset ryster, og dibrom flytter op i heptanen */
            this.fase = "ryster";
            this.t = 0;
            this.ny = 1;
            this.proeve.dryp();
        } else if (this.fase === "ryster") {
            this.uro = Math.min(1, this.uro + dt / 0.15);
            this.ny = Math.max(0, this.ny - dt / 0.3);
            if (this.t >= RYST_SEK) { this.fase = "skiller"; this.t = 0; }
        } else if (this.fase === "skiller") {
            this.uro = Math.max(0, this.uro - dt / SKIL_SEK);
            if (this.t >= SKIL_SEK) { this.fase = "klar"; this.t = 0; this.uro = 0; }
        }
        this.proeve.opdater(dt);
        var mig = this;
        if (this.uro > 0) this.boble.forEach(function (d) { d.fase += dt * (6 + d.r); d.fy = (d.fy + dt * (d.lys ? -0.5 : 0.4) * mig.uro + 1) % 1; });
    };

    /* Faerdig med det samme (Vis svaret): dryppet til farven blev ved */
    P.tilEndepunkt = function () {
        this.proeve.tilEndepunkt();
        this.fase = "klar";
        this.t = 0;
        this.uro = 0;
        this.ny = 0;
    };

    /* Hvor glasset er lige nu: det ryster, mens dibrom blandes op */
    P.flyt = function () {
        if (this.fase !== "ryster") return { x: 0, y: 0, rot: 0 };
        var p = this.t / RYST_SEK, env = Math.sin(Math.PI * NK.klamp(p, 0, 1)), k = Math.max(0.8, this.b / 60);
        return { x: 0, y: (-10 + Math.sin(this.tid * 44) * 7) * env * k, rot: Math.sin(this.tid * 44 + 1) * 0.06 * env };
    };

    P.maal = function (aaben) {
        var M = NK.Sprites.MAAL.reagensglas, k = this.b / M.b;
        var x0 = this.x - this.b / 2, y0 = this.bund - (M.h - 6) * k;
        var bundY = y0 + (M.bundC + M.r) * k;
        var vand = Math.min(40, this.proeve.draaber * VAND_PR_DRAABE) * k;
        var yVand = bundY - vand;
        var yTop = yVand - HEPTAN * k;
        return { k: k, x0: x0, y0: y0, h: M.h * k, top: y0 + (aaben ? 24 : M.top) * k, yTop: yTop, yVand: yVand, bundY: bundY,
                 kant: y0 + 20 * k };
    };

    /* Farven i det oeverste lag fra antallet af frie dibrommolekyler.
       Ét frit giver et tydeligt, men lyst orange lag paa den hvide plade;
       flere giver mere farve. */
    Roer.alfa = function (n) {
        if (n <= 0) return 0;
        if (n < 1) return 0.48 * n;
        return Math.min(0.9, 0.48 + 0.14 * (n - 1));
    };

    P.farver = function () {
        var aO = Roer.alfa(this.proeve.farveMaengde());
        var aV = 0.75 * this.ny;
        return { olie: NK.lerp(aO, (aO + aV) / 2, this.uro * 0.6), vand: NK.lerp(aV, (aO + aV) / 2, this.uro) };
    };

    /* Det lille felt i det oeverste lag, som luppen viser forstoerret */
    P.zoomFelt = function (aaben) {
        var m = this.maal(aaben), s = 11 * Math.max(0.8, m.k), f = this.flyt();
        return { x: this.x - s / 2 + f.x, y: (m.yTop + m.yVand) / 2 - s / 2 + f.y, b: s, h: s };
    };

    P.rammer = function (pt) {
        var m = this.maal(), f = this.flyt();
        return pt.x >= m.x0 + f.x - 8 && pt.x <= m.x0 + f.x + this.b + 8 && pt.y >= m.y0 + f.y - 4 && pt.y <= this.bund + 6;
    };

    /* valg: maerke (tal eller bogstav paa sedlen), aaben (uden prop: det glas,
       der dryppes i), peg (gul ring, der pulserer), om (rolig gul ring), tid,
       spids (pipettens spids, saa den faldende draabe kan tegnes) */
    P.tegn = function (ctx, valg) {
        valg = valg || {};
        var aaben = !!valg.aaben;
        var m = this.maal(aaben), k = m.k, S = NK.Sprites, M = S.MAAL.reagensglas, f = this.flyt(), F = this.farver();
        var midtY = m.y0 + m.h * 0.55;

        /* Den faldende draabe: fra pipettens spids ned til bunden */
        if (this.fase === "falder" && valg.spids) {
            var p = this.t / FALD_SEK, yS = valg.spids.y, yB = m.bundY - 6 * k;
            var y = p < 0.45 ? NK.lerp(yS, m.yTop, (p / 0.45) * (p / 0.45)) : NK.lerp(m.yTop, yB, (p - 0.45) / 0.55);
            ctx.save();
            ctx.fillStyle = "rgba(" + ORANGE + ", 0.95)";
            ctx.beginPath();
            ctx.arc(this.x, y, Math.max(2.5, 3.2 * k), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.save();
        ctx.translate(this.x + f.x, midtY + f.y);
        ctx.rotate(f.rot);
        ctx.translate(-this.x, -midtY);

        var iv = m.x0 + M.indV * k, ih = m.x0 + M.indH * k, cy = m.y0 + M.bundC * k, r = M.r * k;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(iv, m.top);
        ctx.lineTo(iv, cy);
        ctx.arc(this.x, cy, r, Math.PI, 0, true);
        ctx.lineTo(ih, m.top);
        ctx.closePath();
        ctx.clip();
        /* vandet fra bromvandet i bunden */
        if (m.bundY - m.yVand > 0.5) {
            ctx.fillStyle = "rgba(140, 190, 235, 0.3)";
            ctx.fillRect(iv, m.yVand, ih - iv, m.bundY - m.yVand + 2);
            ctx.fillStyle = "rgba(" + ORANGE + ", " + F.vand.toFixed(3) + ")";
            ctx.fillRect(iv, m.yVand, ih - iv, m.bundY - m.yVand + 2);
        }
        /* heptanen med fedtstoffet */
        /* den farveloese heptan: et svagt graablaat skaer, der forsvinder, naar laget bliver orange */
        ctx.fillStyle = "rgba(205, 218, 232, " + (0.26 * (1 - Math.min(1, F.olie * 2))).toFixed(3) + ")";
        ctx.fillRect(iv, m.yTop, ih - iv, m.yVand - m.yTop);
        ctx.fillStyle = "rgba(" + ORANGE + ", " + F.olie.toFixed(3) + ")";
        ctx.fillRect(iv, m.yTop, ih - iv, m.yVand - m.yTop);
        /* draaberne, mens lagene er blandet */
        if (this.uro > 0.02) {
            var u = this.uro;
            this.boble.forEach(function (d) {
                var x = iv + 4 + d.fx * (ih - iv - 8) + Math.sin(d.fase) * 2.5;
                var y2 = m.yTop + 4 + d.fy * (m.bundY - m.yTop - 10);
                ctx.beginPath();
                ctx.arc(x, y2, d.r * Math.max(0.8, k), 0, Math.PI * 2);
                ctx.fillStyle = d.lys ? "rgba(120, 150, 180, " + (0.35 * u).toFixed(3) + ")" : "rgba(" + ORANGE + ", " + (0.4 * u).toFixed(3) + ")";
                ctx.fill();
            });
        }
        /* overfladen og graensen mellem de to lag */
        ctx.fillStyle = "rgba(70, 85, 105, 0.5)";
        ctx.fillRect(iv, m.yTop, ih - iv, 1.4);
        if (m.bundY - m.yVand > 0.5) {
            ctx.fillStyle = "rgba(70, 85, 105, " + (0.4 * (1 - this.uro)).toFixed(3) + ")";
            ctx.fillRect(iv, m.yVand, ih - iv, 1.2);
        }
        ctx.restore();

        S.tegn(ctx, aaben ? "reagensglas_aaben" : "reagensglas", m.x0, m.y0, this.b, m.h);

        /* Sedlen med glassets nummer sidder paa glasset over vaesken */
        if (valg.maerke) {
            var sb = (M.indH - M.indV) * k - 5, sh = Math.min(sb, Math.max(14, (m.yTop - m.top) - 8));
            var sy = m.top + Math.max(2, ((m.yTop - m.top) - sh) / 2);
            NK.rundtRekt(ctx, this.x - sb / 2, sy, sb, sh, 3);
            ctx.fillStyle = "#efe9d8";
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#a79e88";
            ctx.stroke();
            ctx.font = Tg.font("800", Math.max(12, Math.min(sh - 5, sb - 6)));
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#1d2027";
            ctx.fillText(valg.maerke, this.x, sy + sh / 2 + 1);
        }
        ctx.restore();

        if (valg.peg) Tg.ring(ctx, m.x0 + 1, m.y0 + 2, this.b - 2, m.h - 12, valg.tid || 0, 16);
        else if (valg.om) Tg.omRing(ctx, m.x0 + 3, m.y0 + 4, this.b - 6, m.h - 14, "#d29a00");
    };

    NK.Roer = Roer;
}());
