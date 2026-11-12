/* =====================================================================
   braender.js - bunsenbraenderen, luftreguleringen og skeen (fane 1)

   Modellen: braenderen er taendt eller slukket, og luftreguleringen har
   fem trin (D.LUFT). Trinnet afgoer, hvor meget af flammen der er gul, og
   hvor hurtigt skeen bliver sort. Flammen glider fra den ene form til den
   anden, naar luften stilles.

   Skeen sidder paa en arm, der glider gennem en muffe paa et stativ. Et
   klik skubber skeen ind i flammen (den er toerret af foerst), den bliver
   der et oejeblik og kommer selv tilbage. Soder flammen, er skeen sort,
   naar den er tilbage.

   Tegningen: braenderen er spritet sprites/braender.svg. Luftkraven med
   hullet, flammen, luftpilene, skeen, stativet og knappen paa
   luftreguleringen tegnes her, fordi de bevaeger sig.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var SP = NK.Sprites.MAAL;

    var IND = 0.55, I_FLAMMEN = 1.7, UD = 0.55;     /* skeens tur, sekunder */

    function Braender() {
        this.taendt = false;
        this.luft = 0;
        this.luftVis = 0;
        this.taendT = 0;
        this.ske = { fase: "hvile", t: 0, sod: 0, d: 0 };
        this.netopTilbage = false;
        this.dyp = 0;               /* antal gange, skeen har vaeret i flammen */
        this.tid = 0;
    }

    var P = Braender.prototype;

    P.taend = function () {
        if (this.taendt) return false;
        this.taendt = true;
        this.taendT = 0;
        return true;
    };

    P.sluk = function () { this.taendt = false; };

    P.saetLuft = function (n, straks) {
        n = NK.klamp(Math.round(n), 0, D.LUFT.length - 1);
        var skift = n !== this.luft;
        this.luft = n;
        if (straks) this.luftVis = n;
        return skift;
    };

    /* Hvor meget af flammen der er gul lige nu (glider med luftVis) */
    P.gul = function () {
        var i = Math.floor(this.luftVis), f = this.luftVis - i;
        var a = D.LUFT[NK.klamp(i, 0, 4)].gul, b = D.LUFT[NK.klamp(i + 1, 0, 4)].gul;
        return NK.lerp(a, b, f);
    };

    P.soder = function () { return this.taendt && D.soder(this.luft); };

    /* Skeen ind i flammen. Den er toerret af, foer den kommer ind. */
    P.dypSke = function () {
        if (this.ske.fase !== "hvile") return false;
        this.ske.fase = "ind";
        this.ske.t = 0;
        this.ske.sod = 0;
        this.dyp++;
        return true;
    };

    P.skeKlar = function () { return this.ske.fase === "hvile"; };

    P.rensSke = function () {
        this.ske = { fase: "hvile", t: 0, sod: 0, d: 0 };
    };

    P.opdater = function (dt) {
        this.tid += dt;
        this.taendT += dt;
        this.luftVis = NK.mod(this.luftVis, this.luft, 7, dt);
        if (Math.abs(this.luftVis - this.luft) < 0.01) this.luftVis = this.luft;
        var s = this.ske;
        this.netopTilbage = false;
        if (s.fase === "hvile") return;
        s.t += dt;
        if (s.fase === "ind") {
            s.d = NK.blod(s.t / IND);
            if (s.t >= IND) { s.fase = "i"; s.t = 0; s.d = 1; }
        } else if (s.fase === "i") {
            if (this.taendt) s.sod = Math.min(1, s.sod + D.LUFT[this.luft].sod * dt / 1.1);
            if (s.t >= I_FLAMMEN) { s.fase = "ud"; s.t = 0; }
        } else if (s.fase === "ud") {
            s.d = 1 - NK.blod(s.t / UD);
            if (s.t >= UD) { s.fase = "hvile"; s.t = 0; s.d = 0; this.netopTilbage = true; }
        }
    };

    /* ----- Pladserne --------------------------------------------------------------------
       x: braenderens midte, yBord: bordet, k: skala (spritet er 90 x 220).
       Skeen og stativet staar til hoejre for flammen, og luftreguleringens
       knap til hoejre for luftkraven. */
    P.plads = function (x, yBord, k, maxX) {
        var g = { x: x, yBord: yBord, k: k };
        var b = SP.braender;
        g.top = yBord - b.bund * k;                  /* spritets oeverste kant */
        g.rekt = { x: x - b.b / 2 * k, y: g.top, b: b.b * k, h: b.h * k };
        g.mund = { x: x, y: g.top + b.mundY * k };
        g.krave = { x: x - b.kraveB / 2 * k, y: g.top + (b.kraveY - b.kraveH / 2) * k, b: b.kraveB * k, h: b.kraveH * k };
        g.roer = { x: x - 8 * k, y: g.mund.y, b: 16 * k, h: (b.bund - b.mundY - 22) * k };
        /* Flammen: hoejde for en gul og en blaa flamme */
        g.hGul = 168 * k;
        g.hBlaa = 98 * k;
        /* Skeen: skaalen holdes ind i den gule del af flammen */
        var s = SP.ske, ks = k * 0.82;
        g.ks = ks;
        g.skeY = g.mund.y - 92 * k;
        g.skeHvileX = x + 70 * k;                     /* skaalens midte, naar skeen hviler */
        g.skeIndX = x + 4 * k;
        g.skaftL = (s.b - s.skaalX - 2) * ks;          /* fra skaalens midte til skaftets ende */
        g.stativX = Math.min(g.skeHvileX + g.skaftL + 26 * k, maxX - 10 * k);
        /* Luftreguleringens knap: en skinne til hoejre for luftkraven */
        var sx0 = x + 38 * k + 12, sl = NK.klamp(108 * k, 110, 180);
        g.skinne = { x0: sx0, x1: sx0 + sl, y: g.krave.y + g.krave.h / 2 };
        if (g.skinne.x1 > maxX - 14) { g.skinne.x1 = maxX - 14; g.skinne.x0 = Math.min(g.skinne.x0, g.skinne.x1 - 90); }
        this.g = g;
        return g;
    };

    P.knapX = function (pos) {
        var s = this.g.skinne;
        return NK.lerp(s.x0, s.x1, pos / (D.LUFT.length - 1));
    };

    P.knapRekt = function () {
        var s = this.g.skinne, r = 13;
        var x = this.knapX(this.luftVis);
        return { x: x - r, y: s.y - r, b: 2 * r, h: 2 * r };
    };

    P.skinneRekt = function () {
        var s = this.g.skinne;
        return { x: s.x0 - 14, y: s.y - 16, b: s.x1 - s.x0 + 28, h: 32 };
    };

    /* Luftreguleringen, som den gule ring om "luft" omslutter: kraven og skinnen */
    P.luftRekt = function () {
        var g = this.g, s = g.skinne;
        return { x: g.krave.x - 4, y: s.y - 34, b: s.x1 + 16 - g.krave.x + 4, h: 70 };
    };

    P.trinVed = function (x) {
        var s = this.g.skinne;
        return NK.klamp(Math.round((x - s.x0) / (s.x1 - s.x0) * (D.LUFT.length - 1)), 0, D.LUFT.length - 1);
    };

    P.skeSted = function () {
        var g = this.g;
        return { x: NK.lerp(g.skeHvileX, g.skeIndX, this.ske.d), y: g.skeY };
    };

    P.skeRekt = function () {
        var g = this.g, s = SP.ske, p = this.skeSted();
        return { x: p.x - s.skaalX * g.ks - 4, y: p.y - s.skaalY * g.ks - 6, b: s.b * g.ks + 8, h: s.h * g.ks + 8 };
    };

    P.braenderRekt = function () {
        var g = this.g;
        return { x: g.rekt.x + 8 * g.k, y: g.mund.y - 6, b: g.rekt.b - 16 * g.k, h: g.yBord - g.mund.y + 6 };
    };

    /* Det lille felt lige over flammens spids, som luppen viser */
    P.lupFelt = function () {
        var g = this.g, h = NK.lerp(g.hBlaa, g.hGul, this.gul()), fb = 26 * g.k;
        return { x: g.mund.x - fb / 2, y: g.mund.y - h - 8 * g.k - fb, b: fb, h: fb };
    };

    /* Flammens omrids som rekt (til klik paa en slukket braender og ringen) */
    P.flammeRekt = function () {
        var g = this.g, h = NK.lerp(g.hBlaa, g.hGul, this.gul());
        return { x: g.mund.x - 22 * g.k, y: g.mund.y - h, b: 44 * g.k, h: h };
    };

    /* ----- Tegningen ----------------------------------------------------------------------- */

    /* En draabeformet flamme: bred forneden, spids foroven. w er halv bredde. */
    function draabe(ctx, x, y, h, w, boelge) {
        ctx.beginPath();
        ctx.moveTo(x - w * 0.55, y);
        ctx.bezierCurveTo(x - w * 1.05, y - h * 0.18, x - w * 0.95 + boelge, y - h * 0.62, x + boelge * 1.6, y - h);
        ctx.bezierCurveTo(x + w * 0.95 + boelge, y - h * 0.62, x + w * 1.05, y - h * 0.18, x + w * 0.55, y);
        ctx.closePath();
    }

    P.tegnFlamme = function (ctx) {
        if (!this.taendt) return;
        var g = this.g, k = g.k, x = g.mund.x, y = g.mund.y - 1;
        var gul = this.gul(), blaa = 1 - gul, t = this.tid;
        var vokse = NK.klamp(this.taendT / 0.35, 0, 1);
        var h = NK.lerp(g.hBlaa, g.hGul, gul) * (0.35 + 0.65 * NK.pop(vokse));
        var w = NK.lerp(13, 16.5, gul) * k;
        /* Den gule flamme blafrer lidt, den blaa staar stille og bruser */
        var boelge = (Math.sin(t * 5.3) * 0.6 + Math.sin(t * 8.9 + 1) * 0.4) * 2.6 * k * gul;
        var flim = 1 + 0.025 * Math.sin(t * 11) * gul;
        h *= flim;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";

        /* Skaeret om flammen */
        var gl = ctx.createRadialGradient(x, y - h * 0.55, 2, x, y - h * 0.5, h * 0.75);
        gl.addColorStop(0, gul > 0.05 ? "rgba(255, 180, 60, " + (0.32 * gul) + ")" : "rgba(90, 140, 255, 0.12)");
        gl.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gl;
        ctx.fillRect(x - h, y - h * 1.3, h * 2, h * 1.4);

        /* Den blaa kappe: hele flammen, svagere naar flammen er gul */
        draabe(ctx, x, y, h, w, boelge);
        var gb = ctx.createLinearGradient(0, y, 0, y - h);
        gb.addColorStop(0, "rgba(70, 120, 255, " + (0.55 + 0.25 * blaa) + ")");
        gb.addColorStop(0.5, "rgba(80, 130, 255, " + (0.25 + 0.4 * blaa) + ")");
        gb.addColorStop(1, "rgba(120, 90, 255, " + (0.08 + 0.25 * blaa) + ")");
        ctx.fillStyle = gb;
        ctx.fill();

        /* Den gule del: oeverst i flammen og ned til en andel af hoejden. Den
           tegnes oven paa den blaa kappe (ikke lagt sammen med den), saa en gul
           spids er gul og ikke lyseroed. */
        if (gul > 0.01) {
            ctx.save();
            ctx.globalCompositeOperation = "source-over";
            draabe(ctx, x, y, h, w, boelge);
            ctx.clip();
            var bund = y - h * (1 - Math.min(0.92, gul * 0.95));
            var gg = ctx.createLinearGradient(0, bund + h * 0.08, 0, y - h);
            gg.addColorStop(0, "rgba(255, 170, 40, 0)");
            var ga = Math.min(1, 0.4 + gul * 1.1);
            gg.addColorStop(0.18, "rgba(255, 175, 45, " + (0.85 * ga) + ")");
            gg.addColorStop(0.55, "rgba(255, 215, 90, " + (0.95 * ga) + ")");
            gg.addColorStop(1, "rgba(255, 140, 30, " + (0.5 * gul) + ")");
            ctx.fillStyle = gg;
            ctx.fillRect(x - w * 2, y - h - 4, w * 4, h + 4);
            /* den lyse kerne */
            var kg = ctx.createRadialGradient(x + boelge * 0.6, y - h * 0.42, 1, x + boelge * 0.6, y - h * 0.42, w * 1.1);
            kg.addColorStop(0, "rgba(255, 250, 215, " + (0.7 * gul) + ")");
            kg.addColorStop(1, "rgba(255, 230, 150, 0)");
            ctx.fillStyle = kg;
            ctx.fillRect(x - w * 2, y - h, w * 4, h);
            ctx.restore();
        }

        /* Den indre kegle i den blaa flamme */
        if (blaa > 0.05) {
            var hk = h * 0.42, wk = w * 0.6;
            draabe(ctx, x, y, hk, wk, 0);
            var gk = ctx.createLinearGradient(0, y, 0, y - hk);
            gk.addColorStop(0, "rgba(120, 200, 255, " + (0.55 * blaa) + ")");
            gk.addColorStop(1, "rgba(150, 220, 255, " + (0.85 * blaa) + ")");
            ctx.fillStyle = gk;
            ctx.fill();
        }
        ctx.restore();

        /* Sod, der stiger op fra en gul flamme: faa, smaa, rolige pletter */
        if (gul > 0.3) {
            ctx.save();
            for (var i = 0; i < 7; i++) {
                var f = ((t * 0.22 + i / 7) % 1);
                var sx = x + boelge * 1.6 + Math.sin(i * 2.3 + t * 0.7) * 6 * k * f;
                var sy = y - h - 6 * k - f * 60 * k;
                ctx.globalAlpha = (1 - f) * 0.75 * NK.klamp((gul - 0.3) / 0.5, 0, 1);
                ctx.fillStyle = "#121212";
                ctx.beginPath();
                ctx.arc(sx, sy, (1.4 + (i % 3) * 0.6) * k, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    };

    /* Luftkraven med hullet. Hullet er stoerre, jo mere luft der kommer ind, og
       naar braenderen er taendt, viser to blaa pile luften, der suges ind. */
    P.tegnKrave = function (ctx) {
        var g = this.g, R = g.krave, k = g.k, aab = this.luftVis / (D.LUFT.length - 1);
        ctx.save();
        var gr = ctx.createLinearGradient(R.x, 0, R.x + R.b, 0);
        gr.addColorStop(0, "#7b5d24");
        gr.addColorStop(0.4, "#e8c776");
        gr.addColorStop(1, "#6f531f");
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 2.5 * k);
        ctx.fillStyle = gr;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#5b451a";
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 243, 201, 0.5)";
        ctx.beginPath();
        ctx.moveTo(R.x + 1.5, R.y + 2.5 * k); ctx.lineTo(R.x + R.b - 1.5, R.y + 2.5 * k);
        ctx.stroke();
        /* hullet */
        var hw = NK.lerp(0.6, 6.2, aab) * k, hh = 4.4 * k;
        ctx.beginPath();
        ctx.ellipse(R.x + R.b / 2, R.y + R.h / 2, hw, hh, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#141414";
        ctx.fill();
        ctx.restore();
        /* luften, der suges ind */
        if (this.taendt && aab > 0.05) {
            ctx.save();
            ctx.strokeStyle = "rgba(120, 175, 255, " + (0.35 + 0.55 * aab) + ")";
            ctx.fillStyle = ctx.strokeStyle;
            ctx.lineWidth = 2;
            var cy = R.y + R.h / 2, x0 = R.x - 4 * k;
            [-1, 1].forEach(function (s) {
                var y0 = cy + s * 6 * k;
                ctx.beginPath();
                ctx.moveTo(x0 - 20 * k * (0.5 + aab * 0.5), y0 + s * 6 * k);
                ctx.quadraticCurveTo(x0 - 8 * k, y0, x0, cy + s * 1.5 * k);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x0 + 1, cy + s * 1.5 * k);
                ctx.lineTo(x0 - 6 * k, cy + s * 1.5 * k - 3.5 * k);
                ctx.lineTo(x0 - 5 * k, cy + s * 1.5 * k + 3.5 * k);
                ctx.closePath();
                ctx.fill();
            });
            NK.tekst(ctx, "luft", x0 - 26 * k, cy + 4, { font: Tg.font("600", NK.klamp(12 * k, 11, 15)), justering: "right", farve: "#9fc0ff" });
            ctx.restore();
        }
    };

    /* Knappen paa luftreguleringen: en skinne med fem hak fra lukket til aaben */
    P.tegnLuftknap = function (ctx, aktiv, over) {
        var g = this.g, s = g.skinne, k = g.k, mig = this;
        ctx.save();
        /* stangen fra kraven ud til skinnen */
        ctx.strokeStyle = "#8a6a2c";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(g.krave.x + g.krave.b, s.y);
        ctx.lineTo(s.x0 - 2, s.y);
        ctx.stroke();
        /* skinnen */
        NK.rundtRekt(ctx, s.x0 - 8, s.y - 5, s.x1 - s.x0 + 16, 10, 5);
        ctx.fillStyle = "#2a2c36";
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "#5c6070";
        ctx.stroke();
        for (var i = 0; i < D.LUFT.length; i++) {
            var hx = mig.knapX(i);
            ctx.fillStyle = i === this.luft ? "#f2c53d" : "#6b7080";
            ctx.fillRect(hx - 1, s.y + 8, 2, 6);
        }
        var fs = NK.klamp(12 * k, 12, 14);
        NK.tekst(ctx, "lukket", s.x0, s.y + 28, { font: Tg.font("600", fs), justering: "center", farve: "#aeb6c2" });
        NK.tekst(ctx, "åben", s.x1, s.y + 28, { font: Tg.font("600", fs), justering: "center", farve: "#aeb6c2" });
        NK.tekst(ctx, "Luftreguleringen", (s.x0 + s.x1) / 2, s.y - 20, { font: Tg.font("700", fs + 1), justering: "center", farve: "#dfe4ea" });
        /* knappen */
        var kx = this.knapX(this.luftVis), r = 11;
        var gk = ctx.createRadialGradient(kx - 3, s.y - 4, 1, kx, s.y, r);
        gk.addColorStop(0, "#fff1c2");
        gk.addColorStop(0.5, "#e2c071");
        gk.addColorStop(1, "#8a6a2c");
        ctx.beginPath();
        ctx.arc(kx, s.y, r + (over ? 1.5 : 0), 0, Math.PI * 2);
        ctx.fillStyle = gk;
        ctx.fill();
        ctx.lineWidth = aktiv ? 2.5 : 1.2;
        ctx.strokeStyle = aktiv ? "#f2c53d" : "#5b451a";
        ctx.stroke();
        ctx.restore();
    };

    /* Stativet med muffen og armen, der holder skeen */
    P.tegnSke = function (ctx) {
        var g = this.g, k = g.k, s = SP.ske, p = this.skeSted(), ks = g.ks;
        var endeX = p.x + g.skaftL;
        ctx.save();
        /* stativet: fod, stang og muffe */
        var sx = g.stativX, top = g.skeY - 26 * k;
        ctx.fillStyle = "#2e3138";
        NK.rundtRekt(ctx, sx - 22 * k, g.yBord - 6 * k, 44 * k, 6 * k, 2);
        ctx.fill();
        var gs = ctx.createLinearGradient(sx - 3 * k, 0, sx + 3 * k, 0);
        gs.addColorStop(0, "#5f656d");
        gs.addColorStop(0.4, "#d7dce1");
        gs.addColorStop(1, "#5a6068");
        ctx.fillStyle = gs;
        ctx.fillRect(sx - 2.6 * k, top, 5.2 * k, g.yBord - 6 * k - top);
        /* armen fra skaftets ende gennem muffen */
        ctx.fillStyle = "#9aa1a9";
        ctx.fillRect(endeX - 2 * k, g.skeY + 1.6 * k, sx - endeX + 14 * k, 3.4 * k);
        ctx.fillStyle = "#3a3e46";
        NK.rundtRekt(ctx, sx - 7 * k, g.skeY - 3 * k, 14 * k, 14 * k, 2);
        ctx.fill();
        ctx.fillStyle = "#6e747c";
        ctx.beginPath();
        ctx.arc(sx + 9 * k, g.skeY + 4 * k, 3 * k, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        /* skeen */
        var x0 = p.x - s.skaalX * ks, y0 = p.y - s.skaalY * ks;
        NK.Sprites.tegn(ctx, "ske", x0, y0, s.b * ks, s.h * ks);
        /* soden i skaalen */
        if (this.ske.sod > 0.01) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, this.ske.sod * 1.15);
            var sg = ctx.createRadialGradient(p.x - 4 * ks, p.y - 2 * ks, 1, p.x, p.y, s.skaalRx * ks);
            sg.addColorStop(0, "#0d0d0d");
            sg.addColorStop(0.75, "#1c1c1c");
            sg.addColorStop(1, "rgba(30, 30, 30, 0.6)");
            ctx.beginPath();
            ctx.ellipse(p.x, p.y + 1 * ks, s.skaalRx * ks * 1.05, s.skaalRy * ks * 1.35, 0, 0, Math.PI * 2);
            ctx.fillStyle = sg;
            ctx.fill();
            ctx.restore();
        }
    };

    P.tegnBraender = function (ctx) {
        var g = this.g;
        NK.Sprites.tegn(ctx, "braender", g.rekt.x, g.rekt.y, g.rekt.b, g.rekt.h);
        this.tegnKrave(ctx);
    };

    NK.Braender = Braender;
}());
