/* =====================================================================
   tegning.js - det, fanerne tegner paa laerredet

   Vaeggen, laboratoriebordet, klinken under urglasset, vaesken i
   urglasset (med farven, der breder sig fra draaben, bundfaldet og
   boblerne), draabeflasken, draaberne og partiklerne i luppen.
   Funktionerne tegner én ting et bestemt sted og husker intet selv.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";
    var MU = NK.Sprites.MAAL.urglas;
    var MF = NK.Sprites.MAAL.draabeflaske;

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* ----- Farver ------------------------------------------------------------------ */
    T.rgba = function (f, gange) {
        var a = f[3] * (gange === undefined ? 1 : gange);
        return "rgba(" + Math.round(f[0]) + ", " + Math.round(f[1]) + ", " + Math.round(f[2]) + ", " + a.toFixed(3) + ")";
    };

    T.bland = function (a, b, t) {
        return [NK.lerp(a[0], b[0], t), NK.lerp(a[1], b[1], t), NK.lerp(a[2], b[2], t), NK.lerp(a[3], b[3], t)];
    };

    /* Et lille, fast tilfaeldighedstal ud fra et fro (samme prikker hver gang) */
    T.fro = function (s) {
        return function () {
            s = (s + 0x6D2B79F5) | 0;
            var t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    };

    /* ----- Vaeggen og bordet --------------------------------------------------------- */
    T.vaeg = function (ctx, W, bund) {
        var g = ctx.createLinearGradient(0, 0, 0, bund);
        g.addColorStop(0, "#262833");
        g.addColorStop(1, "#1f212a");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, bund);
        ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
        for (var x = 0; x < W; x += 64) ctx.fillRect(x, 0, 1, bund);
    };

    /* Laboratoriebordet: en moerk plade fra bagkanten (y) ned til bund */
    T.bord = function (ctx, W, y, bund) {
        ctx.save();
        var g = ctx.createLinearGradient(0, y, 0, bund);
        g.addColorStop(0, "#343942");
        g.addColorStop(0.18, "#2b2f37");
        g.addColorStop(1, "#23262d");
        ctx.fillStyle = g;
        ctx.fillRect(0, y, W, bund - y);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(0, y, W, 1.5);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(0, y - 3, W, 3);
        ctx.restore();
    };

    /* ----- Klinken under urglasset --------------------------------------------------- */
    T.klinke = function (ctx, cx, y, b, lys) {
        var hb = b * 1.08, h = b * 0.15, x = cx - hb / 2, r = b * 0.05;
        ctx.save();
        if (lys > 0.01) {
            ctx.fillStyle = "rgba(242, 197, 61, " + (0.28 * lys).toFixed(3) + ")";
            NK.rundtRekt(ctx, x - 7, y - h / 2 - 7, hb + 14, h + 17, r + 7);
            ctx.fill();
        }
        ctx.fillStyle = "#b9c0c8";
        NK.rundtRekt(ctx, x, y - h / 2 + 4, hb, h, r);
        ctx.fill();
        var g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(1, "#e7ebef");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x, y - h / 2, hb, h, r);
        ctx.fill();
        if (lys > 0.01) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.95 * lys).toFixed(3) + ")";
            ctx.lineWidth = 2.5;
            NK.rundtRekt(ctx, x - 3, y - h / 2 - 3, hb + 6, h + 10, r + 3);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* ----- Urglasset med vaesken -----------------------------------------------------------
       g: { cx, bund, b }: midten, hvor glasset hviler, og bredden.
       v: { farve, blob, bundfald, bundA, bobler, fro }
         blob: { x, y, r, farve } i glassets egne enheder (sprite-koordinater)
    */
    function vaeskeSti(ctx) {
        ctx.beginPath();
        ctx.ellipse(MU.cx, MU.vy, MU.vrx, MU.vry, 0, Math.PI, 2 * Math.PI);
        ctx.quadraticCurveTo(180, 60, 110, 63);
        ctx.quadraticCurveTo(40, 60, MU.cx - MU.vrx, MU.vy);
        ctx.closePath();
    }

    T.urglasGeo = function (cx, bund, b) {
        var s = b / MU.b;
        return { cx: cx, bund: bund, b: b, s: s, x: cx - MU.cx * s, y: bund - MU.bund * s,
                 overflade: bund - (MU.bund - MU.vy) * s, rx: MU.vrx * s, ry: MU.vry * s };
    };

    /* Et punkt i glassets egne enheder lavet om til laerredet og tilbage */
    T.iGlas = function (g, px, py) { return { x: (px - g.x) / g.s, y: (py - g.y) / g.s }; };

    T.urglas = function (ctx, g, v) {
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.scale(g.s, g.s);
        if (v.farve && v.farve[3] > 0.005) {
            ctx.save();
            vaeskeSti(ctx);
            ctx.clip();
            /* Klinken skinner igennem: farverne ses mod hvidt, saa en naesten
               farveloes oploesning ikke ser graa ud */
            ctx.fillStyle = "rgba(236, 240, 244, 0.88)";
            ctx.fillRect(0, 0, MU.b, MU.h);
            ctx.fillStyle = T.rgba(v.farve);
            ctx.fillRect(0, 0, MU.b, MU.h);
            /* Farven, der breder sig fra draaben */
            if (v.blob && v.blob.r > 0.5) {
                var b = v.blob;
                ctx.fillStyle = T.rgba(b.farve);
                ctx.beginPath();
                ctx.ellipse(b.x, b.y, b.r, b.r * 0.42, 0, 0, Math.PI * 2);
                ctx.fill();
                /* Hvirvler rundt om kanten */
                ctx.strokeStyle = T.rgba(b.farve, 0.8);
                ctx.lineWidth = 5;
                ctx.lineCap = "round";
                for (var k = 0; k < 3; k++) {
                    var v0 = b.drej + k * 2.1;
                    ctx.beginPath();
                    ctx.ellipse(b.x, b.y, b.r * 1.12, b.r * 0.5, 0, v0, v0 + 1.1);
                    ctx.stroke();
                }
            }
            /* Dybde: lidt moerkere nederst, lysere overflade */
            var gr = ctx.createLinearGradient(0, MU.vy - MU.vry, 0, 63);
            gr.addColorStop(0, "rgba(255, 255, 255, 0.16)");
            gr.addColorStop(0.45, "rgba(255, 255, 255, 0)");
            gr.addColorStop(1, "rgba(0, 0, 0, 0.16)");
            ctx.fillStyle = gr;
            ctx.fillRect(0, 0, MU.b, MU.h);
            /* Bundfaldet: fnug, der samler sig nederst */
            if (v.bundfald && v.bundA > 0.01) {
                var r = T.fro(v.fro || 7);
                ctx.fillStyle = v.bundfald;
                ctx.globalAlpha = v.bundA;
                for (var n = 0; n < 70; n++) {
                    var px = 34 + r() * 152, py = MU.vy - 6 + Math.pow(r(), 0.6) * 30;
                    ctx.beginPath();
                    ctx.arc(px, py, 0.9 + r() * 1.8, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
            ctx.restore();
            /* Overfladens kant */
            ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(MU.cx, MU.vy, MU.vrx, MU.vry, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        /* Boblerne paa overfladen */
        if (v.bobler && v.bobler.length) {
            v.bobler.forEach(function (bb) {
                var a = Math.sin(Math.PI * NK.klamp(bb.t / bb.liv, 0, 1));
                ctx.strokeStyle = "rgba(255, 255, 255, " + (0.8 * a).toFixed(3) + ")";
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                ctx.ellipse(bb.x, bb.y, bb.r, bb.r * 0.7, 0, 0, Math.PI * 2);
                ctx.stroke();
            });
        }
        NK.Sprites.tegn(ctx, "urglas", 0, 0, MU.b, MU.h);
        ctx.restore();
    };

    /* ----- Draabeflasken ------------------------------------------------------------------
       (x, y) er tudens spids; rot drejer flasken om den. Med rot = 0 staar
       flasken op, og tuden peger opad. */
    T.flaskeGeo = function (hoejde) { return { s: hoejde / MF.h }; };

    T.flaske = function (ctx, x, y, s, rot, tekst, lys, styrke) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.scale(s, s);
        ctx.translate(-MF.tud.x, -MF.tud.y);
        if (lys > 0.01) {
            ctx.save();
            ctx.shadowColor = "rgba(242, 197, 61, " + (0.9 * lys).toFixed(3) + ")";
            ctx.shadowBlur = 14 / s;
            NK.Sprites.tegn(ctx, "draabeflaske", 0, 0, MF.b, MF.h);
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "draabeflaske", 0, 0, MF.b, MF.h);
        var e = MF.etiket;
        ctx.fillStyle = "#1f2328";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var px = NK.passendeSkrift(ctx, tekst, e.b - 6, 13, 8, "800");
        ctx.fillText(tekst, e.x + e.b / 2, e.y + e.h / 2);
        ctx.font = font("600", Math.max(7, px - 4));
        ctx.fillStyle = "#6b6252";
        ctx.fillText(styrke || "", e.x + e.b / 2, e.y + e.h / 2 + px * 0.95);
        ctx.restore();
    };

    /* Flaskens omrids til musen (tilnaermet med en rektangel) */
    T.flaskeBoks = function (x, y, s) {
        return { x: x - MF.tud.x * s, y: y - MF.tud.y * s, b: MF.b * s, h: MF.h * s };
    };

    T.draabe = function (ctx, x, y, r, farve) {
        ctx.save();
        ctx.fillStyle = T.rgba(farve[3] < 0.5 ? [205, 228, 246, 0.85] : farve);
        ctx.strokeStyle = "rgba(40, 60, 80, 0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - r * 2.1);
        ctx.quadraticCurveTo(x + r * 1.05, y - r * 0.4, x + r, y);
        ctx.arc(x, y, r, 0, Math.PI);
        ctx.quadraticCurveTo(x - r * 1.05, y - r * 0.4, x, y - r * 2.1);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.arc(x - r * 0.35, y - r * 0.25, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Luppen ----------------------------------------------------------------------------
       Linsens indre tegnes af den, der kalder (klippet til cirklen), og
       rammen og skaftet lægges over bagefter. */
    T.lupIndre = function (ctx, cx, cy, r, baggrund) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = "#f4f7fa";
        ctx.fill();
        if (baggrund) {
            ctx.fillStyle = baggrund;
            ctx.fill();
        }
    };

    /* Rammen og et kort skaft ned mod hoejre (samme farver som lup.svg fra
       sc4.11, men skaftet er kortere, saa luppen kan staa i hjoernet) */
    T.lupRamme = function (ctx, cx, cy, r) {
        var v = Math.PI / 4, a = r + 4, l = r * 0.6;
        var c = Math.cos(v), s = Math.sin(v);
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = "#aab3bf";
        ctx.lineWidth = Math.max(10, r * 0.24);
        ctx.beginPath();
        ctx.moveTo(cx + c * a, cy + s * a);
        ctx.lineTo(cx + c * (a + r * 0.2), cy + s * (a + r * 0.2));
        ctx.stroke();
        var g = ctx.createLinearGradient(cx + c * a, cy + s * a, cx + c * (a + l), cy + s * (a + l));
        g.addColorStop(0, "#9a6d47");
        g.addColorStop(1, "#5e3f26");
        ctx.strokeStyle = g;
        ctx.lineWidth = Math.max(9, r * 0.2);
        ctx.beginPath();
        ctx.moveTo(cx + c * (a + r * 0.22), cy + s * (a + r * 0.22));
        ctx.lineTo(cx + c * (a + l), cy + s * (a + l));
        ctx.stroke();
        ctx.lineWidth = Math.max(6, r * 0.11);
        ctx.strokeStyle = "#c9d3de";
        ctx.beginPath();
        ctx.arc(cx, cy, r + ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "#6f7b89";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.8, Math.PI * 1.08, Math.PI * 1.42);
        ctx.stroke();
        ctx.restore();
    };

    T.partikel = function (ctx, x, y, r, farve, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa === undefined ? 1 : alfa;
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, "rgba(255, 255, 255, 0.85)");
        g.addColorStop(0.35, farve);
        g.addColorStop(1, farve);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(20, 24, 30, 0.7)";
        ctx.stroke();
        ctx.restore();
    };

    T.elektron = function (ctx, x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd23e";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#6b5200";
        ctx.stroke();
    };

    /* En plads til en elektron: en stiplet ring */
    T.plads = function (ctx, x, y, r) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = "rgba(150, 110, 0, 0.9)";
        ctx.stroke();
        ctx.restore();
    };

    /* En lille maerkat under glasset: "Surt · H₂SO₄" */
    T.skilt = function (ctx, x, y, tekst, lys) {
        ctx.save();
        ctx.font = font("700", 13);
        var b = ctx.measureText(tekst).width + 16, h = 21;
        ctx.fillStyle = lys ? "rgba(242, 197, 61, 0.95)" : "rgba(233, 236, 240, 0.92)";
        NK.rundtRekt(ctx, x - b / 2, y, b, h, 5);
        ctx.fill();
        ctx.fillStyle = "#1f2328";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + h / 2 + 0.5);
        ctx.restore();
        return { x: x - b / 2, y: y, b: b, h: h };
    };

    NK.Tegn = T;
}());
