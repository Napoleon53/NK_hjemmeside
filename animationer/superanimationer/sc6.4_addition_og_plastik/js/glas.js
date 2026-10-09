/* =====================================================================
   glas.js - et reagensglas med bromvand og et carbonhydrid (fane 2)

   Makroniveauet. Nederst staar orange bromvand, oeverst ligger et
   farveloest carbonhydrid. Naar glasset rystes, blandes de to lag et
   oejeblik og skiller saa igen. Hvor brommet er bagefter, afgoer
   K.brom i js/kemi.js: i en alken er det brugt, og begge lag er
   farveloese; ellers er det flyttet op i carbonhydridet.

   Glasset er spritet sprites/reagensglas.svg. Vaeskerne tegnes bag det.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var RYST_SEK = 1.5;        /* saa laenge ryster et klik glasset */
    var SKIL_SEK = 1.3;        /* saa laenge er de to lag om at skille igen */
    var MUS_VEJ = 650;         /* saa langt skal musen flytte glasset for at ryste det faerdigt */

    /* Lagene i spritets egne maal: bromvandet fra bunden op til Y_VAND,
       carbonhydridet derfra op til Y_OLIE */
    var Y_VAND = 128, Y_OLIE = 78;
    var ORANGE = "232, 140, 48";

    function Roer(valg) {
        this.id = valg.id;
        this.stof = valg.stof;
        this.m = 0;                /* 0 = ikke rystet, 1 = rystet faerdigt */
        this.uro = 0;              /* 1 = lagene er blandet, 0 = de har skilt */
        this.auto = 0;             /* sekunder tilbage af et klik-ryst */
        this.holdt = false;        /* eleven holder glasset med musen */
        this.dx = 0;
        this.dy = 0;
        this.rystN = 0;            /* saa mange gange er der klikket for at ryste */
        this.tid = Math.random() * 10;
        this.x = 0;
        this.bund = 0;
        this.b = 50;
        this.draaber = [];
        for (var i = 0; i < 18; i++) this.draaber.push({ fx: Math.random(), fy: Math.random(), r: NK.r(1.6, 3.6), fase: NK.r(0, 6.28), lys: i % 2 === 0 });
    }

    var P = Roer.prototype;

    Roer.RYST_SEK = RYST_SEK;
    Roer.SKIL_SEK = SKIL_SEK;

    /* Glassets midte, bordets hoejde og glassets bredde paa laerredet */
    P.plads = function (x, bund, b) {
        this.x = x;
        this.bund = bund;
        this.b = b;
    };

    P.nulstil = function () {
        this.m = 0;
        this.uro = 0;
        this.auto = 0;
        this.holdt = false;
        this.dx = 0;
        this.dy = 0;
        this.rystN = 0;
    };

    /* Et klik ryster glasset af sig selv */
    P.klikRyst = function () {
        if (this.auto > 0) return false;
        this.auto = RYST_SEK;
        this.rystN++;
        return true;
    };

    /* Rystning: arbejde er broekdelen af en faerdig rystning */
    P.ryst = function (arbejde) {
        this.m = Math.min(1, this.m + arbejde);
        this.uro = 1;
    };

    P.rystMus = function (pixels) { this.ryst(pixels / MUS_VEJ); };

    P.rystes = function () { return this.auto > 0 || this.holdt; };

    /* Rystet faerdigt, og de to lag har skilt sig igen */
    P.faerdig = function () { return this.m >= 1 && this.uro <= 0.02 && !this.rystes(); };

    P.opdater = function (dt) {
        this.tid += dt;
        if (this.auto > 0) {
            this.ryst(dt / RYST_SEK * 1.08);
            this.auto = Math.max(0, this.auto - dt);
        } else if (!this.holdt) {
            this.uro = Math.max(0, this.uro - dt / SKIL_SEK);
            this.dx = NK.mod(this.dx, 0, 14, dt);
            this.dy = NK.mod(this.dy, 0, 14, dt);
            if (Math.abs(this.dx) < 0.3) this.dx = 0;
            if (Math.abs(this.dy) < 0.3) this.dy = 0;
        }
        var mig = this;
        if (this.uro > 0) this.draaber.forEach(function (d) { d.fase += dt * (6 + d.r); d.fy = (d.fy + dt * (d.lys ? -0.5 : 0.4) * mig.uro + 1) % 1; });
    };

    /* Hvor glasset er lige nu: flyttet af musen eller loeftet af et klik-ryst */
    P.flyt = function () {
        var k = this.b / 60, x = this.dx, y = this.dy, rot = 0;
        if (this.auto > 0) {
            var p = 1 - this.auto / RYST_SEK, env = Math.sin(Math.PI * p);
            y += (-20 + Math.sin(this.tid * 44) * 11) * env * Math.max(0.8, k);
            rot = Math.sin(this.tid * 44 + 1) * 0.07 * env;
        } else if (this.holdt) {
            rot = NK.klamp(this.dx / 400, -0.2, 0.2);
        }
        return { x: x, y: y, rot: rot };
    };

    P.maal = function () {
        var M = NK.Sprites.MAAL.reagensglas, k = this.b / M.b;
        var x0 = this.x - this.b / 2, y0 = this.bund - (M.h - 6) * k;
        return { k: k, x0: x0, y0: y0, h: M.h * k, top: y0 + M.top * k, yOlie: y0 + Y_OLIE * k, yVand: y0 + Y_VAND * k, bundY: y0 + (M.bundC + M.r) * k };
    };

    /* Farven i de to lag (0 = farveloes, 1 = helt orange) */
    P.farver = function () {
        var br = K.brom(this.stof, this.m);
        var aV = 0.82 * br.vand, aO = 0.9 * br.olie / K.FORDELING;
        var mix = (aV * (218 - Y_VAND) + aO * (Y_VAND - Y_OLIE)) / (218 - Y_OLIE);
        return { vand: NK.lerp(aV, mix, this.uro), olie: NK.lerp(aO, mix, this.uro), brom: br };
    };

    /* Det lille felt i det oeverste lag, som luppen viser forstoerret */
    P.zoomFelt = function () {
        var m = this.maal(), s = 11 * Math.max(0.8, m.k);
        return { x: this.x - s / 2, y: (m.yOlie + m.yVand) / 2 - s / 2, b: s, h: s };
    };

    P.rammer = function (pt) {
        var m = this.maal(), f = this.flyt();
        return pt.x >= m.x0 + f.x - 8 && pt.x <= m.x0 + f.x + this.b + 8 && pt.y >= m.y0 + f.y - 4 && pt.y <= this.bund + 6;
    };

    /* Klodsen, glasset staar i. Den bliver staaende, naar glasset loeftes. */
    P.tegnHolder = function (ctx) {
        var b = this.b * 1.5, h = Math.max(14, this.b * 0.3);
        ctx.save();
        NK.rundtRekt(ctx, this.x - b / 2, this.bund - h, b, h, 4);
        ctx.fillStyle = "#6d4c2f";
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(this.x - b / 2 + 3, this.bund - h + 2, b - 6, 2);
        /* hullet, glasset staar i */
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(this.x - this.b * 0.36, this.bund - h, this.b * 0.72, 3);
        ctx.restore();
    };

    /* valg: bogstav (paa sedlen paa glasset), peg (gul ring, der pulserer:
       klik her), om (rolig gul ring: det glas, opgaven handler om), tid */
    P.tegn = function (ctx, valg) {
        valg = valg || {};
        var m = this.maal(), k = m.k, S = NK.Sprites, M = S.MAAL.reagensglas, f = this.flyt(), F = this.farver();
        var midtY = m.y0 + m.h * 0.55;

        ctx.save();
        ctx.translate(this.x + f.x, midtY + f.y);
        ctx.rotate(f.rot);
        ctx.translate(-this.x, -midtY);

        /* Vaeskerne, klippet til glassets inderside med den runde bund */
        var iv = m.x0 + M.indV * k, ih = m.x0 + M.indH * k, cy = m.y0 + M.bundC * k, r = M.r * k;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(iv, m.top);
        ctx.lineTo(iv, cy);
        ctx.arc(this.x, cy, r, Math.PI, 0, true);
        ctx.lineTo(ih, m.top);
        ctx.closePath();
        ctx.clip();
        /* bromvandet nederst */
        ctx.fillStyle = "rgba(140, 190, 235, 0.16)";
        ctx.fillRect(iv, m.yVand, ih - iv, m.bundY - m.yVand + 2);
        ctx.fillStyle = "rgba(" + ORANGE + ", " + F.vand.toFixed(3) + ")";
        ctx.fillRect(iv, m.yVand, ih - iv, m.bundY - m.yVand + 2);
        /* carbonhydridet oeverst */
        ctx.fillStyle = "rgba(236, 236, 214, 0.11)";
        ctx.fillRect(iv, m.yOlie, ih - iv, m.yVand - m.yOlie);
        ctx.fillStyle = "rgba(" + ORANGE + ", " + F.olie.toFixed(3) + ")";
        ctx.fillRect(iv, m.yOlie, ih - iv, m.yVand - m.yOlie);
        /* draaberne, mens lagene er blandet */
        if (this.uro > 0.02) {
            var u = this.uro, mig = this;
            this.draaber.forEach(function (d) {
                var x = iv + 4 + d.fx * (ih - iv - 8) + Math.sin(d.fase) * 2.5;
                var y = m.yOlie + 4 + d.fy * (m.bundY - m.yOlie - 10);
                ctx.beginPath();
                ctx.arc(x, y, d.r * Math.max(0.8, k), 0, Math.PI * 2);
                ctx.fillStyle = d.lys ? "rgba(240, 244, 236, " + (0.3 * u).toFixed(3) + ")" : "rgba(" + ORANGE + ", " + (Math.min(0.75, mig.farver().brom.vand + mig.farver().brom.olie) * 0.55 * u).toFixed(3) + ")";
                ctx.fill();
                ctx.strokeStyle = "rgba(255, 255, 255, " + (0.35 * u).toFixed(3) + ")";
                ctx.lineWidth = 0.8;
                ctx.stroke();
            });
        }
        /* overfladen og graensen mellem de to lag */
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(iv, m.yOlie, ih - iv, 1.4);
        ctx.fillStyle = "rgba(255, 255, 255, " + (0.34 * (1 - this.uro)).toFixed(3) + ")";
        ctx.fillRect(iv, m.yVand, ih - iv, 1.2);
        ctx.restore();

        S.tegn(ctx, "reagensglas", m.x0, m.y0, this.b, m.h);

        /* Sedlen med glassets bogstav sidder paa glasset over vaesken */
        if (valg.bogstav) {
            var sb = (M.indH - M.indV) * k - 5, sh = Math.min(sb, (Y_OLIE - M.top) * k - 8), sy = m.top + ((Y_OLIE - M.top) * k - sh) / 2;
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
            ctx.fillText(valg.bogstav, this.x, sy + sh / 2 + 1);
        }
        ctx.restore();

        if (valg.peg) Tg.ring(ctx, m.x0 + 1, m.y0 + 2, this.b - 2, m.h - 12, valg.tid || 0, 16);
        else if (valg.om && !this.rystes()) Tg.omRing(ctx, m.x0 + 3, m.y0 + 4, this.b - 6, m.h - 14);
    };

    NK.Roer = Roer;
}());
