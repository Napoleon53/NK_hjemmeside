/* =====================================================================
   tegning.js - det, alle tre faner tegner

   Montren, proeverne i deres beholdere, kassen, maerkaten paa proeven,
   tavlen med atommodellen, flasken, atomkuglerne og den store formel.
   Alle funktionerne tegner én ting et bestemt sted og husker intet
   selv; fanerne bestemmer, hvor tingene staar, og hvordan de bevaeger
   sig.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* ----- Farver --------------------------------------------------------- */
    /* "#rrggbb" eller "rgb(r,g,b)" -> [r, g, b] */
    function rgb(hex) {
        if (hex.charAt(0) === "r") return hex.replace(/[^0-9,]/g, "").split(",").slice(0, 3).map(Number);
        var h = hex.replace("#", "");
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }

    /* t > 0 blander mod hvid, t < 0 mod sort */
    function nuance(hex, t) {
        var c = rgb(hex), maal = t > 0 ? 255 : 0, a = Math.abs(t);
        return "rgb(" + c.map(function (v) { return Math.round(v + (maal - v) * a); }).join(",") + ")";
    }
    T.nuance = nuance;

    function rgba(hex, a) {
        var c = rgb(hex);
        return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    }
    T.rgba = rgba;

    /* Et fast pseudo-tilfaeldigt tal pr. proeve, saa formerne ikke danser */
    function froe(n) {
        var s = (n * 7919 + 104729) % 233280;
        return function () {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }

    /* Farverne i det periodiske system: metal, ikke-metal, halvmetal, aedelgas */
    T.SLAGS_FARVE = { m: "#9fb8d8", i: "#9fd8a9", h: "#d8d39f", a: "#c7a9dd" };

    /* ----- Rummet og bordet ------------------------------------------------ */
    T.rum = function (ctx, W, H, gulvY) {
        var g = ctx.createLinearGradient(0, 0, 0, gulvY);
        g.addColorStop(0, "#262833");
        g.addColorStop(1, "#1b1d24");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, gulvY);
        ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
        for (var x = 0; x < W; x += 64) ctx.fillRect(x, 0, 1, gulvY);
        ctx.fillStyle = "#121318";
        ctx.fillRect(0, gulvY, W, H - gulvY);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(0, gulvY, W, 2);
    };

    /* Arbejdsbordet: bordpladen i hoejden y og skabe ned til gulvet */
    T.bord = function (ctx, x0, x1, y, gulv) {
        var plade = 12;
        ctx.fillStyle = "#2a2e37";
        ctx.fillRect(x0, y + plade, x1 - x0, gulv - y - plade);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = 1;
        var doer = Math.max(120, (x1 - x0) / 6);
        for (var x = x0 + doer; x < x1 - 20; x += doer) {
            ctx.beginPath();
            ctx.moveTo(Math.round(x) + 0.5, y + plade + 6);
            ctx.lineTo(Math.round(x) + 0.5, gulv);
            ctx.stroke();
        }
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        for (x = x0 + doer; x < x1 - 20; x += doer) {
            ctx.fillRect(x - 14, y + plade + 18, 8, 3);
            ctx.fillRect(x + 6, y + plade + 18, 8, 3);
        }
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(x0, y, x1 - x0, plade);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0, y, x1 - x0, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x0, y + plade, x1 - x0, 4);
    };

    /* ----- Proeverne --------------------------------------------------------
       En proeve tegnes med bundmidte (x, y) og hoejden h. Indholdet tegnes
       foerst, og beholderens SVG lægges oven paa, saa glasset ligger foran. */

    /* Den hoejde, en proeve kan have i en kasse, der er b bred og h hoej */
    T.proeveHoejde = function (g, b, h) {
        var M = MAAL[g.proeve.b];
        return Math.min(h, b * M.h / M.b);
    };

    T.proeveBredde = function (g, h) {
        var M = MAAL[g.proeve.b];
        return h * M.b / M.h;
    };

    /* En uregelmaessig klump med flad bund. (cx, bund) er bundmidten. */
    function klump(ctx, r, cx, bund, rx, ry, farve, k) {
        var n = 8, pkt = [];
        for (var i = 0; i < n; i++) {
            var v = Math.PI + i / n * Math.PI * 2 + (r() - 0.5) * 0.4;
            var f = 0.78 + r() * 0.3;
            var px = cx + Math.cos(v) * rx * f;
            var py = bund - ry + Math.sin(v) * ry * f;
            pkt.push([px, Math.min(py, bund)]);
        }
        ctx.beginPath();
        pkt.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
        ctx.closePath();
        var g = ctx.createLinearGradient(cx - rx, bund - ry * 2, cx + rx, bund);
        g.addColorStop(0, nuance(farve, 0.38));
        g.addColorStop(0.55, farve);
        g.addColorStop(1, nuance(farve, -0.4));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = Math.max(0.6, 0.8 * k);
        ctx.stroke();
        /* En flade, der fanger lyset */
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.beginPath();
        ctx.moveTo(pkt[1][0], pkt[1][1]);
        ctx.lineTo(pkt[2][0], pkt[2][1]);
        ctx.lineTo(pkt[3][0], pkt[3][1]);
        ctx.lineTo(cx, bund - ry * 0.9);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.beginPath();
        ctx.ellipse(cx - rx * 0.35, bund - ry * 1.35, rx * 0.16, ry * 0.12, -0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    function kubeIndhold(ctx, g, x0, y0, k, tid) {
        var M = MAAL.kube;
        var ix = x0 + M.indV * k, iy = y0 + M.indTop * k;
        var ib = (M.indH - M.indV) * k, ih = (M.indBund - M.indTop) * k;
        var f = g.proeve.farve, r = froe(g.z);
        var bund = iy + ih - 2 * k, mx = ix + ib / 2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(ix, iy, ib, ih);
        ctx.clip();
        /* Kubens bund, der skinner lidt igennem */
        ctx.fillStyle = "rgba(210, 230, 245, 0.06)";
        ctx.fillRect(ix, iy, ib, ih);
        var form = g.proeve.form, i;
        if (form === "klump") {
            klump(ctx, r, mx - 1 * k, bund, 15 * k, 11 * k, f, k);
            if (g.z % 3 === 0) klump(ctx, r, mx + 11 * k, bund, 5 * k, 3.5 * k, nuance(f, -0.08), k);
        } else if (form === "blok") {
            var s = 17 * k, bx = mx - s / 2 - 2 * k, by = bund - s, d = 5 * k;
            ctx.fillStyle = nuance(f, 0.4);
            ctx.beginPath();
            ctx.moveTo(bx, by); ctx.lineTo(bx + d, by - d); ctx.lineTo(bx + s + d, by - d); ctx.lineTo(bx + s, by);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = nuance(f, -0.32);
            ctx.beginPath();
            ctx.moveTo(bx + s, by); ctx.lineTo(bx + s + d, by - d); ctx.lineTo(bx + s + d, bund - d); ctx.lineTo(bx + s, bund);
            ctx.closePath(); ctx.fill();
            var gf = ctx.createLinearGradient(bx, by, bx + s, bund);
            gf.addColorStop(0, nuance(f, 0.25));
            gf.addColorStop(0.5, f);
            gf.addColorStop(1, nuance(f, -0.2));
            ctx.fillStyle = gf;
            ctx.fillRect(bx, by, s, s);
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.beginPath();
            ctx.moveTo(bx + s * 0.15, by + s * 0.85); ctx.lineTo(bx + s * 0.55, by + s * 0.15);
            ctx.lineTo(bx + s * 0.72, by + s * 0.15); ctx.lineTo(bx + s * 0.32, by + s * 0.85);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            ctx.lineWidth = Math.max(0.6, 0.8 * k);
            ctx.strokeRect(bx, by, s, s);
        } else if (form === "krystal") {
            var antal = 4 + Math.floor(r() * 2);
            for (i = 0; i < antal; i++) {
                var cx = ix + ib * (0.18 + 0.64 * (i + r() * 0.6) / antal);
                var hh = (9 + r() * 14) * k, bb = (4 + r() * 4) * k;
                var skaev = (r() - 0.5) * 5 * k;
                ctx.fillStyle = nuance(f, 0.3);
                ctx.beginPath();
                ctx.moveTo(cx - bb, bund); ctx.lineTo(cx + skaev, bund - hh); ctx.lineTo(cx, bund);
                ctx.closePath(); ctx.fill();
                ctx.fillStyle = nuance(f, -0.28);
                ctx.beginPath();
                ctx.moveTo(cx, bund); ctx.lineTo(cx + skaev, bund - hh); ctx.lineTo(cx + bb, bund);
                ctx.closePath(); ctx.fill();
            }
            /* Et glimt, der kommer og gaar */
            var glimt = 0.5 + 0.5 * Math.sin((tid || 0) * 2.2 + g.z);
            ctx.fillStyle = "rgba(255, 255, 255, " + (0.25 + 0.5 * glimt) + ")";
            var gx = mx + 3 * k, gy = bund - 13 * k, gs = 2.4 * k;
            ctx.beginPath();
            ctx.moveTo(gx, gy - gs * 2); ctx.lineTo(gx + gs * 0.5, gy); ctx.lineTo(gx, gy + gs * 2); ctx.lineTo(gx - gs * 0.5, gy);
            ctx.closePath(); ctx.fill();
        } else if (form === "pulver") {
            var gp = ctx.createLinearGradient(0, bund - 14 * k, 0, bund);
            gp.addColorStop(0, nuance(f, 0.15));
            gp.addColorStop(1, nuance(f, -0.25));
            ctx.fillStyle = gp;
            ctx.beginPath();
            ctx.moveTo(ix + 2 * k, bund);
            ctx.quadraticCurveTo(mx - 8 * k, bund - 4 * k, mx - 2 * k, bund - 13 * k);
            ctx.quadraticCurveTo(mx + 3 * k, bund - 15 * k, mx + 8 * k, bund - 7 * k);
            ctx.quadraticCurveTo(mx + 14 * k, bund - 2 * k, ix + ib - 2 * k, bund);
            ctx.closePath();
            ctx.fill();
            for (i = 0; i < 26; i++) {
                ctx.fillStyle = r() < 0.5 ? nuance(f, 0.3) : nuance(f, -0.35);
                var px = mx + (r() - 0.5) * 22 * k, py = bund - r() * 9 * k;
                ctx.fillRect(px, py, Math.max(0.8, 1.2 * k), Math.max(0.8, 1.2 * k));
            }
        } else if (form === "baand") {
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            var sti = function () {
                ctx.beginPath();
                ctx.moveTo(ix + 6 * k, bund - 3 * k);
                for (var t = 0; t <= 1.001; t += 0.05) {
                    var a = t * Math.PI * 5;
                    ctx.lineTo(ix + 6 * k + t * 26 * k + Math.cos(a) * 3 * k, bund - 9 * k - Math.sin(a) * 7 * k);
                }
            };
            ctx.strokeStyle = nuance(f, -0.35);
            ctx.lineWidth = 4 * k;
            sti();
            ctx.stroke();
            ctx.strokeStyle = nuance(f, 0.25);
            ctx.lineWidth = 2.2 * k;
            sti();
            ctx.stroke();
        } else if (form === "draabe") {
            var gd = ctx.createRadialGradient(mx - 3 * k, bund - 8 * k, 1 * k, mx, bund - 4 * k, 14 * k);
            gd.addColorStop(0, "#ffffff");
            gd.addColorStop(0.25, nuance(f, 0.2));
            gd.addColorStop(1, nuance(f, -0.45));
            ctx.fillStyle = gd;
            ctx.beginPath();
            ctx.moveTo(mx - 13 * k, bund);
            ctx.bezierCurveTo(mx - 13 * k, bund - 9 * k, mx - 4 * k, bund - 12 * k, mx + 2 * k, bund - 11 * k);
            ctx.bezierCurveTo(mx + 11 * k, bund - 10 * k, mx + 13 * k, bund - 5 * k, mx + 13 * k, bund);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = gd;
            ctx.beginPath();
            ctx.ellipse(mx + 15 * k, bund - 1.6 * k, 2.6 * k, 1.6 * k, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    /* Ampullens omrids i filens enheder (samme som ampul.svg) */
    function ampulSti(ctx, x0, y0, k) {
        function p(x, y) { return [x0 + x * k, y0 + y * k]; }
        var a;
        ctx.beginPath();
        a = p(18, 5); ctx.moveTo(a[0], a[1]);
        var c = p(20, 1), e = p(22, 5); ctx.quadraticCurveTo(c[0], c[1], e[0], e[1]);
        a = p(22, 22); ctx.lineTo(a[0], a[1]);
        c = p(22, 30); e = p(30, 34); ctx.quadraticCurveTo(c[0], c[1], e[0], e[1]);
        c = p(34, 37); e = p(34, 45); ctx.quadraticCurveTo(c[0], c[1], e[0], e[1]);
        a = p(34, 88); ctx.lineTo(a[0], a[1]);
        c = p(34, 97); e = p(25, 97); ctx.quadraticCurveTo(c[0], c[1], e[0], e[1]);
        a = p(15, 97); ctx.lineTo(a[0], a[1]);
        c = p(6, 97); e = p(6, 88); ctx.quadraticCurveTo(c[0], c[1], e[0], e[1]);
        a = p(6, 45); ctx.lineTo(a[0], a[1]);
        c = p(6, 37); e = p(10, 34); ctx.quadraticCurveTo(c[0], c[1], e[0], e[1]);
        c = p(18, 30); e = p(18, 22); ctx.quadraticCurveTo(c[0], c[1], e[0], e[1]);
        ctx.closePath();
    }

    function ampulIndhold(ctx, g, x0, y0, k, tid) {
        var f = g.proeve.farve;
        ctx.save();
        ampulSti(ctx, x0, y0, k);
        ctx.clip();
        if (g.proeve.fyld === "vaeske") {
            var dampY = y0 + 8 * k, vY = y0 + 72 * k + Math.sin((tid || 0) * 1.3) * 0.6 * k;
            var gd = ctx.createLinearGradient(0, dampY, 0, vY);
            gd.addColorStop(0, "rgba(180, 85, 42, 0.12)");
            gd.addColorStop(1, "rgba(180, 85, 42, 0.5)");
            ctx.fillStyle = gd;
            ctx.fillRect(x0, dampY, 40 * k, vY - dampY);
            var gv = ctx.createLinearGradient(0, vY, 0, y0 + 97 * k);
            gv.addColorStop(0, nuance(f, 0.18));
            gv.addColorStop(1, nuance(f, -0.35));
            ctx.fillStyle = gv;
            ctx.beginPath();
            ctx.moveTo(x0, vY + 1.5 * k);
            ctx.quadraticCurveTo(x0 + 20 * k, vY - 1 * k, x0 + 40 * k, vY + 1.5 * k);
            ctx.lineTo(x0 + 40 * k, y0 + 100 * k);
            ctx.lineTo(x0, y0 + 100 * k);
            ctx.closePath();
            ctx.fill();
        } else if (g.proeve.fyld === "klar") {
            /* En farveloes gas: kun et svagt skaer i glasset */
            var gk = ctx.createLinearGradient(x0, 0, x0 + 40 * k, 0);
            gk.addColorStop(0, "rgba(220, 235, 250, 0.1)");
            gk.addColorStop(0.5, "rgba(220, 235, 250, 0.03)");
            gk.addColorStop(1, "rgba(220, 235, 250, 0.08)");
            ctx.fillStyle = gk;
            ctx.fillRect(x0, y0, 40 * k, 100 * k);
        } else {
            var gg = ctx.createLinearGradient(0, y0, 0, y0 + 97 * k);
            gg.addColorStop(0, rgba(f, 0.3));
            gg.addColorStop(1, rgba(f, 0.62));
            ctx.fillStyle = gg;
            ctx.fillRect(x0, y0, 40 * k, 100 * k);
        }
        ctx.restore();
    }

    function olieIndhold(ctx, g, x0, y0, k, tid) {
        var M = MAAL.olie, f = g.proeve.farve, r = froe(g.z + 5);
        var ix = x0 + M.indV * k, iy = y0 + M.indTop * k, ib = (M.indH - M.indV) * k, ih = (M.indBund - M.indTop) * k;
        ctx.save();
        NK.rundtRekt(ctx, ix, iy, ib, ih, M.indR * k);
        ctx.clip();
        var oy = iy + ih * 0.22;
        ctx.fillStyle = "rgba(233, 205, 110, 0.3)";
        ctx.fillRect(ix, oy, ib, ih);
        ctx.fillStyle = "rgba(255, 240, 190, 0.45)";
        ctx.fillRect(ix, oy, ib, Math.max(1, 1.2 * k));
        var bund = iy + ih - 1.5 * k;
        /* Metallet er matteret af en tynd hinde, derfor lidt graat */
        klump(ctx, r, ix + ib * 0.36, bund, 9 * k, 6 * k, f, k);
        klump(ctx, r, ix + ib * 0.72, bund, 6 * k, 4 * k, nuance(f, -0.06), k);
        ctx.restore();
    }

    /* v.tid    uret, som lyset og glimtene foelger
       v.lys    0-1: gul ramme, naar proeven kan klikkes
       v.alfa   gennemsigtighed
       v.skygge false: ingen skygge under */
    T.proeve = function (ctx, g, x, y, h, v) {
        v = v || {};
        var p = g.proeve, M = MAAL[p.b], k = h / M.h, b = M.b * k;
        var x0 = x - b / 2, y0 = y - h;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        if (v.skygge !== false) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.beginPath();
            ctx.ellipse(x, y - 0.5, b * 0.44, Math.max(1.5, 3 * k), 0, 0, Math.PI * 2);
            ctx.fill();
        }
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.9 * v.lys) + ")";
            ctx.lineWidth = Math.max(1.5, 3 * k);
            NK.rundtRekt(ctx, x0 - 3, y0 - 3, b + 6, h + 6, 6);
            ctx.stroke();
        }
        if (p.b === "ampul") ampulIndhold(ctx, g, x0, y0, k, v.tid);
        else if (p.b === "olie") olieIndhold(ctx, g, x0, y0, k, v.tid);
        else kubeIndhold(ctx, g, x0, y0, k, v.tid);
        if (!NK.Sprites.tegn(ctx, p.b, x0, y0, b, h)) {
            ctx.strokeStyle = "rgba(220, 236, 248, 0.6)";
            ctx.lineWidth = 1;
            NK.rundtRekt(ctx, x0, y0, b, h, 4);
            ctx.stroke();
        }
        ctx.restore();
        return { x: x0, y: y0, b: b, h: h };
    };

    /* ----- Montren -----------------------------------------------------------
       Et skab formet som det periodiske system for grundstof 1-36. Hvert
       rum har en niche til proeven og et messingskilt med atomnummer og
       symbol. Hullet over overgangsmetallerne har skabets navneplade og
       navnetavlen, der aabner det periodiske system i stort format. */
    T.montreLay = function (x0, y0, maxB, maxH) {
        var FORHOLD = 1.3;
        var fr = NK.klamp(maxB * 0.011, 5, 12);
        var ind = 4;
        var lp = NK.klamp(maxB * 0.03, 16, 30);
        var tg = NK.klamp(maxH * 0.06, 14, 22);
        var cb = (maxB - 2 * fr - 2 * ind - lp) / 18;
        var ch = cb * FORHOLD;
        var hoejde = 2 * fr + 2 * ind + tg + 4 * ch;
        if (hoejde > maxH) {
            ch = (maxH - 2 * fr - 2 * ind - tg) / 4;
            cb = ch / FORHOLD;
        }
        var b = 2 * fr + 2 * ind + lp + 18 * cb;
        var h = 2 * fr + 2 * ind + tg + 4 * ch;
        var x = x0 + (maxB - b) / 2, y = y0;
        var m = { x: x, y: y, b: b, h: h, fr: fr, ind: ind, lp: lp, tg: tg, cb: cb, ch: ch, rum: {} };
        var gx = x + fr + ind + lp, gy = y + fr + ind + tg;
        m.gx = gx;
        m.gy = gy;
        var mel = Math.max(1.5, cb * 0.05);
        D.GRUNDSTOFFER.forEach(function (g) {
            var rx = gx + (g.soejle - 1) * cb + mel, ry = gy + (g.periode - 1) * ch + mel;
            var rb = cb - 2 * mel, rh = ch - 2 * mel;
            var nh = rh * 0.7;
            m.rum[g.z] = {
                x: rx, y: ry, b: rb, h: rh,
                niche: { x: rx, y: ry, b: rb, h: nh },
                skilt: { x: rx, y: ry + nh + 1, b: rb, h: rh - nh - 1 }
            };
        });
        m.periodeX = x + fr + ind + lp / 2;
        m.periodeY = [1, 2, 3, 4].map(function (p) { return gy + (p - 0.5) * ch; });
        m.gruppe = [];
        for (var s = 1; s <= 18; s++) {
            if (s > 2 && s < 13) continue;
            m.gruppe.push({ soejle: s, hg: s <= 2 ? s : s - 10, x: gx + (s - 0.5) * cb, y: y + fr + ind + tg / 2 });
        }
        /* Hullet over overgangsmetallerne: soejle 3-12, periode 1-3 */
        var hul = { x: gx + 2 * cb + mel * 2, y: gy + mel, b: 10 * cb - mel * 4, h: 3 * ch - mel * 2 };
        m.hul = hul;
        var ovgH = NK.klamp(ch * 0.26, 12, 18);
        var titelH = NK.klamp(ch * 0.42, 16, 30);
        m.titel = { x: hul.x + hul.b * 0.18, y: hul.y + 4, b: hul.b * 0.64, h: titelH };
        var tavleTop = m.titel.y + titelH + NK.klamp(ch * 0.14, 4, 10);
        var tavleH = hul.y + hul.h - ovgH - 4 - tavleTop;
        var tavleB = Math.min(hul.b * 0.8, tavleH * 3.4);
        m.tavle = { x: hul.x + (hul.b - tavleB) / 2, y: tavleTop, b: tavleB, h: tavleH };
        m.ovg = { x: hul.x + hul.b / 2, y: hul.y + hul.h - ovgH / 2 };
        return m;
    };

    /* Hvilket rum er (px, py) i? */
    T.montreRum = function (m, px, py) {
        for (var z = 1; z <= 36; z++) {
            var r = m.rum[z];
            if (px >= r.x && px <= r.x + r.b && py >= r.y && py <= r.y + r.h) return z;
        }
        return 0;
    };

    T.overTavle = function (m, px, py) {
        var t = m.tavle;
        return px >= t.x && px <= t.x + t.b && py >= t.y && py <= t.y + t.h;
    };

    /* v.inde(z)       staar proeven i sit rum?
       v.stjerne(z)    loest uden at se svaret
       v.lys           z under musen (gul ramme)
       v.maal          z, der blinker gult (hint eller opraab)
       v.blink         { z: { farve, a } } kortvarige blink efter et klik
       v.periodeLys    periode, hvis nummer lyser
       v.gruppeLys     soejle, hvis hovedgruppe lyser
       v.tavleLys      0-1: navnetavlen lyser
       v.skjulTal      intet atomnummer paa skiltene
       v.tid           uret */
    T.montre = function (ctx, m, v) {
        v = v || {};
        var tid = v.tid || 0;
        ctx.save();
        /* Skabet */
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        NK.rundtRekt(ctx, m.x + 4, m.y + 6, m.b, m.h, 8);
        ctx.fill();
        var gt = ctx.createLinearGradient(0, m.y, 0, m.y + m.h);
        gt.addColorStop(0, "#5a3d27");
        gt.addColorStop(1, "#3e2919");
        ctx.fillStyle = gt;
        NK.rundtRekt(ctx, m.x, m.y, m.b, m.h, 7);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 220, 170, 0.12)";
        ctx.fillRect(m.x + 6, m.y + 1, m.b - 12, 2);
        /* Bagklaedningen */
        var ix = m.x + m.fr, iy = m.y + m.fr, ib = m.b - 2 * m.fr, ih = m.h - 2 * m.fr;
        var gb = ctx.createLinearGradient(0, iy, 0, iy + ih);
        gb.addColorStop(0, "#1f1b26");
        gb.addColorStop(1, "#16131c");
        ctx.fillStyle = gb;
        NK.rundtRekt(ctx, ix, iy, ib, ih, 4);
        ctx.fill();

        /* Hovedgruppe og periode */
        var lpx = NK.klamp(m.cb * 0.3, 11, 15);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        m.gruppe.forEach(function (gp) {
            var lys = v.gruppeLys === gp.soejle;
            ctx.font = font(lys ? "800" : "700", lys ? lpx + 2 : lpx);
            ctx.fillStyle = lys ? "#f2c53d" : "#8e8798";
            ctx.fillText(String(gp.hg), gp.x, gp.y + 1);
        });
        m.periodeY.forEach(function (py, i) {
            var lys = v.periodeLys === i + 1;
            ctx.font = font(lys ? "800" : "700", lys ? lpx + 2 : lpx);
            ctx.fillStyle = lys ? "#f2c53d" : "#8e8798";
            ctx.fillText(String(i + 1), m.periodeX, py);
        });

        /* Rummene */
        D.GRUNDSTOFFER.forEach(function (g) {
            T.montreRumTegn(ctx, m, g, v, tid);
        });

        /* Navnepladen og navnetavlen i hullet */
        var t = m.titel;
        var gm = ctx.createLinearGradient(0, t.y, 0, t.y + t.h);
        gm.addColorStop(0, "#e2c27a");
        gm.addColorStop(0.5, "#c69e4d");
        gm.addColorStop(1, "#9c7632");
        ctx.fillStyle = gm;
        NK.rundtRekt(ctx, t.x, t.y, t.b, t.h, 3);
        ctx.fill();
        ctx.strokeStyle = "rgba(60, 40, 10, 0.6)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#3b2a10";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        NK.passendeSkrift(ctx, "GRUNDSTOFFERNE 1-36", t.b - 16, NK.klamp(t.h * 0.56, 10, 17), 8, "800");
        ctx.fillText("GRUNDSTOFFERNE 1-36", t.x + t.b / 2, t.y + t.h / 2 + 1);

        T.navnetavle(ctx, m.tavle, v.tavleLys || 0);

        if (m.cb >= 26) {
            ctx.font = font("600", NK.klamp(m.cb * 0.24, 10, 13));
            ctx.fillStyle = "#8e8798";
            ctx.fillText("overgangsmetaller", m.ovg.x, m.ovg.y);
        }

        /* Glasset foran: et svagt skaer paa skraa */
        ctx.save();
        NK.rundtRekt(ctx, ix, iy, ib, ih, 4);
        ctx.clip();
        var sk = ctx.createLinearGradient(ix, iy, ix + ib * 0.6, iy + ih);
        sk.addColorStop(0, "rgba(255, 255, 255, 0)");
        sk.addColorStop(0.45, "rgba(255, 255, 255, 0.035)");
        sk.addColorStop(0.5, "rgba(255, 255, 255, 0.07)");
        sk.addColorStop(0.56, "rgba(255, 255, 255, 0.02)");
        sk.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = sk;
        ctx.fillRect(ix, iy, ib, ih);
        ctx.restore();

        /* Rammerne ovenpaa: mus, maal og blink */
        D.GRUNDSTOFFER.forEach(function (g) {
            var r = m.rum[g.z];
            var farve = null, a = 0;
            if (v.maal === g.z) { farve = "242, 197, 61"; a = 0.55 + 0.45 * Math.sin(tid * 7); }
            if (v.lys === g.z) { farve = "242, 197, 61"; a = Math.max(a, 0.95); }
            var bl = v.blink && v.blink[g.z];
            if (bl && bl.a > 0.01) { farve = bl.farve; a = bl.a; }
            if (!farve) return;
            ctx.strokeStyle = "rgba(" + farve + ", " + NK.klamp(a, 0, 1) + ")";
            ctx.lineWidth = NK.klamp(m.cb * 0.06, 2, 3);
            NK.rundtRekt(ctx, r.x - 1, r.y - 1, r.b + 2, r.h + 2, 4);
            ctx.stroke();
        });
        ctx.restore();
    };

    T.montreRumTegn = function (ctx, m, g, v, tid) {
        var r = m.rum[g.z], n = r.niche, s = r.skilt;
        var inde = v.inde ? v.inde(g.z) : false;
        var gn = ctx.createLinearGradient(0, n.y, 0, n.y + n.h);
        gn.addColorStop(0, inde ? "#2e2937" : "#211d28");
        gn.addColorStop(1, inde ? "#1d1a24" : "#18151e");
        ctx.fillStyle = gn;
        NK.rundtRekt(ctx, n.x, n.y, n.b, n.h, 3);
        ctx.fill();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(n.x + 2, n.y, n.b - 4, 2);
        if (inde) {
            /* Lille spot fra loftet af nichen */
            var sp = ctx.createRadialGradient(n.x + n.b / 2, n.y, 1, n.x + n.b / 2, n.y, n.h * 0.9);
            sp.addColorStop(0, "rgba(255, 240, 210, 0.16)");
            sp.addColorStop(1, "rgba(255, 240, 210, 0)");
            ctx.fillStyle = sp;
            ctx.fillRect(n.x, n.y, n.b, n.h);
            var ph = T.proeveHoejde(g, n.b * 0.86, n.h * 0.9);
            T.proeve(ctx, g, n.x + n.b / 2, n.y + n.h - 1.5, ph, { tid: tid });
            if (v.stjerne && v.stjerne(g.z)) T.stjerne(ctx, n.x + n.b - 6, n.y + 6, NK.klamp(m.cb * 0.1, 3.5, 6), 1);
        }
        /* Messingskiltet */
        var gs = ctx.createLinearGradient(0, s.y, 0, s.y + s.h);
        gs.addColorStop(0, inde ? "#e2c27a" : "#b99a5c");
        gs.addColorStop(1, inde ? "#a8813c" : "#8a6f3c");
        ctx.fillStyle = gs;
        NK.rundtRekt(ctx, s.x, s.y, s.b, s.h, 2);
        ctx.fill();
        ctx.fillStyle = T.SLAGS_FARVE[g.slags];
        ctx.fillRect(s.x, s.y + s.h - 2, s.b, 2);
        ctx.textBaseline = "middle";
        var sp2 = NK.klamp(s.h * 0.78, 9, 17);
        var medTal = !v.skjulTal && m.cb >= 34;
        ctx.fillStyle = inde ? "#2b1e0b" : "#3f3016";
        if (medTal) {
            ctx.font = font("600", NK.klamp(s.h * 0.5, 8, 11));
            ctx.textAlign = "left";
            ctx.fillText(String(g.z), s.x + 3, s.y + s.h / 2);
            ctx.font = font("800", sp2);
            ctx.textAlign = "right";
            ctx.fillText(g.s, s.x + s.b - 3, s.y + s.h / 2 + 0.5);
        } else {
            ctx.font = font("800", sp2);
            ctx.textAlign = "center";
            ctx.fillText(g.s, s.x + s.b / 2, s.y + s.h / 2 + 0.5);
        }
    };

    /* Navnetavlen: en lille plakat med det periodiske system. Et klik
       aabner det i stort format med navnene. */
    T.navnetavle = function (ctx, t, lys) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(t.x + 3, t.y + 4, t.b, t.h);
        ctx.fillStyle = "#ece7da";
        ctx.fillRect(t.x, t.y, t.b, t.h);
        if (lys > 0) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + NK.klamp(lys, 0, 1) + ")";
            ctx.lineWidth = 3;
            ctx.strokeRect(t.x - 3, t.y - 3, t.b + 6, t.h + 6);
        }
        var titelPx = NK.klamp(t.h * 0.16, 10, 14);
        ctx.fillStyle = "#2b2f38";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        NK.passendeSkrift(ctx, "Grundstoffernes navne", t.b - 12, titelPx, 8, "700");
        ctx.fillText("Grundstoffernes navne", t.x + t.b / 2, t.y + titelPx * 0.95 + 3);
        var top = t.y + titelPx * 1.9 + 5, ih = t.y + t.h - 6 - top, ib = t.b - 14;
        var celle = Math.min(ib / 18, ih / 4);
        var ox = t.x + (t.b - celle * 18) / 2, oy = top + (ih - celle * 4) / 2;
        D.GRUNDSTOFFER.forEach(function (g) {
            ctx.fillStyle = T.SLAGS_FARVE[g.slags];
            ctx.fillRect(ox + (g.soejle - 1) * celle + 0.5, oy + (g.periode - 1) * celle + 0.5, celle - 1, celle - 1);
        });
        ctx.restore();
    };

    /* ----- Kassen med proeverne -------------------------------------------- */
    /* Bagsiden og bunden. (x, y) er oeverste venstre hjoerne. */
    T.kasseBag = function (ctx, x, y, b, h) {
        ctx.fillStyle = "#5a3f25";
        ctx.fillRect(x + 4, y, b - 8, h);
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        for (var i = 1; i < 3; i++) ctx.fillRect(x + 4, y + h * i / 3, b - 8, 1.5);
        ctx.fillStyle = "#3a2717";
        ctx.fillRect(x + 4, y + h - 6, b - 8, 6);
    };

    /* Forsiden: to brede planker med stencileret tekst */
    T.kasseFor = function (ctx, x, y, b, h, tekst) {
        var top = y + h * 0.66;
        var ph = (y + h - top) / 2;
        for (var i = 0; i < 2; i++) {
            var py = top + i * ph;
            var gp = ctx.createLinearGradient(0, py, 0, py + ph);
            gp.addColorStop(0, "#b98a55");
            gp.addColorStop(1, "#946638");
            ctx.fillStyle = gp;
            ctx.fillRect(x, py + 1, b, ph - 2);
            ctx.fillStyle = "rgba(255, 230, 190, 0.18)";
            ctx.fillRect(x, py + 1, b, 1.5);
            ctx.fillStyle = "#4b3420";
            [x + 8, x + b - 8].forEach(function (nx) {
                ctx.beginPath();
                ctx.arc(nx, py + ph / 2, 1.8, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        ctx.fillStyle = "#6d4a28";
        ctx.fillRect(x, top - 2, 6, y + h - top + 2);
        ctx.fillRect(x + b - 6, top - 2, 6, y + h - top + 2);
        if (tekst) {
            ctx.save();
            ctx.fillStyle = "rgba(40, 24, 10, 0.72)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            NK.passendeSkrift(ctx, tekst, b - 30, NK.klamp(ph * 0.62, 11, 18), 9, "800");
            ctx.fillText(tekst, x + b / 2, top + ph + ph / 2);
            ctx.restore();
        }
    };

    /* ----- Maerkaten paa proeven ------------------------------------------
       Et manillamaerke i en snor. (x, y) er oeverste venstre hjoerne, og
       snoren gaar til (sx, sy). linjer: [{ t, px, vaegt, farve, streg }]
       streg: en prikket linje, hvor der skal skrives. */
    T.maerke = function (ctx, x, y, b, h, sx, sy, linjer) {
        ctx.save();
        var hul = { x: x + h * 0.28, y: y + h / 2 };
        ctx.strokeStyle = "rgba(230, 220, 200, 0.75)";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo((sx + hul.x) / 2, Math.max(sy, hul.y) + 16, hul.x, hul.y);
        ctx.stroke();
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        var sk = h * 0.22;
        ctx.beginPath();
        ctx.moveTo(x + sk, y);
        ctx.lineTo(x + b, y);
        ctx.lineTo(x + b, y + h);
        ctx.lineTo(x + sk, y + h);
        ctx.lineTo(x, y + h - sk);
        ctx.lineTo(x, y + sk);
        ctx.closePath();
        ctx.fillStyle = "#e9d8ae";
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "rgba(110, 80, 30, 0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#c9b688";
        ctx.beginPath();
        ctx.arc(hul.x, hul.y, Math.max(3, h * 0.07), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2a2522";
        ctx.beginPath();
        ctx.arc(hul.x, hul.y, Math.max(1.6, h * 0.035), 0, Math.PI * 2);
        ctx.fill();
        var tx = x + h * 0.48, tb = b - h * 0.48 - 8;
        var samlet = 0;
        linjer.forEach(function (l) { samlet += l.px * 1.2; });
        var ly = y + (h - samlet) / 2;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        linjer.forEach(function (l) {
            var cy = ly + l.px * 0.6;
            if (l.streg) {
                ctx.strokeStyle = "rgba(90, 70, 40, 0.45)";
                ctx.setLineDash([2, 3]);
                ctx.beginPath();
                ctx.moveTo(tx + 4, cy + l.px * 0.45);
                ctx.lineTo(tx + tb - 4, cy + l.px * 0.45);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            if (l.t) {
                NK.passendeSkrift(ctx, l.t, tb, l.px, 9, l.vaegt || "700");
                ctx.fillStyle = l.farve || "#2b2418";
                ctx.fillText(l.t, tx + tb / 2, cy);
            }
            ly += l.px * 1.2;
        });
        ctx.restore();
    };

    /* ----- Tavlen ----------------------------------------------------------- */
    /* En lille kridttavle med traeramme og kridtrende. Giver det indre. */
    T.tavle = function (ctx, x, y, b, h) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x + 4, y + 5, b, h);
        ctx.fillStyle = "#6b4a2e";
        NK.rundtRekt(ctx, x, y, b, h, 4);
        ctx.fill();
        var r = 7;
        var gt = ctx.createLinearGradient(x, y, x + b, y + h);
        gt.addColorStop(0, "#27463a");
        gt.addColorStop(1, "#1d362c");
        ctx.fillStyle = gt;
        ctx.fillRect(x + r, y + r, b - 2 * r, h - 2 * r);
        ctx.fillStyle = "#5a3d25";
        ctx.fillRect(x + 10, y + h - 3, b - 20, 6);
        ctx.fillStyle = "#eeeeea";
        ctx.fillRect(x + b * 0.18, y + h - 3, 14, 3.5);
        ctx.restore();
        return { x: x + r, y: y + r, b: b - 2 * r, h: h - 2 * r };
    };

    var KRIDT = "#eef2ea";
    T.KRIDT = KRIDT;

    /* Radius til skal nr (0-3) i en model med den ydre radius R */
    T.skalRadius = function (R, nr) { return R * (0.36 + 0.21 * nr); };

    /* Atommodellen i kridt: kernen med ladningen og skallerne med de
       elektroner, eleven har skrevet. Elektroner ud over skallens plads
       tegnes roede.
       v.ringe      skaller, der tegnes stiplet (hintet)
       v.kerne      teksten i kernen, fx "11+"
       v.faerdig    den yderste skal lyser
       v.tid        uret; elektronerne drejer langsomt */
    T.bohr = function (ctx, cx, cy, R, z, liste, v) {
        v = v || {};
        liste = liste || [];
        var tid = v.tid || 0;
        var n = Math.max(liste.length, v.ringe || 0);
        var er = NK.klamp(R * 0.045, 2.6, 6);
        ctx.save();
        for (var i = 0; i < Math.min(n, 5); i++) {
            var rr = T.skalRadius(R, Math.min(i, 3)) + (i > 3 ? R * 0.08 : 0);
            var fast = i < liste.length;
            var yderst = v.faerdig && i === liste.length - 1;
            ctx.strokeStyle = yderst ? "rgba(242, 197, 61, 0.9)" : (fast ? "rgba(238, 242, 234, 0.55)" : "rgba(238, 242, 234, 0.3)");
            ctx.lineWidth = yderst ? 2.2 : 1.4;
            ctx.setLineDash(fast ? [] : [5, 5]);
            ctx.beginPath();
            ctx.arc(cx, cy, rr, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            if (!fast) continue;
            var c = Math.min(liste[i], 40);
            var loft = D.skalLoft(Math.min(i, 3), z);
            var drej = tid * (0.25 - i * 0.04) * (i % 2 ? -1 : 1);
            for (var e = 0; e < c; e++) {
                var a = drej - Math.PI / 2 + e / c * Math.PI * 2;
                var ex = cx + Math.cos(a) * rr, ey = cy + Math.sin(a) * rr;
                var forMange = e >= loft;
                ctx.fillStyle = forMange ? "#f0776a" : (yderst ? "#f7d774" : "#9fd0f2");
                ctx.beginPath();
                ctx.arc(ex, ey, er, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        /* Kernen */
        var kr = NK.klamp(R * 0.2, 10, 28);
        var gk = ctx.createRadialGradient(cx - kr * 0.3, cy - kr * 0.3, 1, cx, cy, kr);
        gk.addColorStop(0, "#f39a86");
        gk.addColorStop(1, "#b5432f");
        ctx.fillStyle = gk;
        ctx.beginPath();
        ctx.arc(cx, cy, kr, 0, Math.PI * 2);
        ctx.fill();
        if (v.kerne) {
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            NK.passendeSkrift(ctx, v.kerne, kr * 1.7, NK.klamp(kr * 0.8, 10, 18), 8, "800");
            ctx.fillText(v.kerne, cx, cy + 1);
        }
        ctx.restore();
    };

    /* ----- Flasken med stoffet (fane 2) --------------------------------- */
    T.flaske = function (ctx, x, y, h, fo, v) {
        v = v || {};
        var M = MAAL.flaske, k = h / M.h, b = M.b * k;
        var x0 = x - b / 2, y0 = y - h;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(x, y - 1, b * 0.44, Math.max(2, 4 * k), 0, 0, Math.PI * 2);
        ctx.fill();
        var ix = x0 + M.indV * k, iy = y0 + M.indTop * k, ib = (M.indH - M.indV) * k, ih = (M.indBund - M.indTop) * k;
        ctx.save();
        NK.rundtRekt(ctx, ix, iy, ib, ih, M.indR * k);
        ctx.clip();
        if (fo.form === "vaeske") {
            var vy = iy + ih * 0.32;
            var gv = ctx.createLinearGradient(0, vy, 0, iy + ih);
            gv.addColorStop(0, rgba(fo.farve, 0.42));
            gv.addColorStop(1, rgba(fo.farve, 0.62));
            ctx.fillStyle = gv;
            ctx.fillRect(ix, vy, ib, ih);
            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.fillRect(ix, vy, ib, Math.max(1, 1.5 * k));
        } else {
            var r = froe(fo.nr + 40);
            var py = iy + ih * 0.58;
            var gp = ctx.createLinearGradient(0, py, 0, iy + ih);
            gp.addColorStop(0, nuance(fo.farve, 0.05));
            gp.addColorStop(1, nuance(fo.farve, -0.18));
            ctx.fillStyle = gp;
            ctx.beginPath();
            ctx.moveTo(ix, iy + ih);
            ctx.lineTo(ix, py + 6 * k);
            ctx.quadraticCurveTo(ix + ib / 2, py - 10 * k, ix + ib, py + 6 * k);
            ctx.lineTo(ix + ib, iy + ih);
            ctx.closePath();
            ctx.fill();
            for (var i = 0; i < 70; i++) {
                ctx.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.12)";
                ctx.fillRect(ix + r() * ib, py + r() * (ih * 0.42), 1.4 * k, 1.4 * k);
            }
        }
        ctx.restore();
        NK.Sprites.tegn(ctx, "flaske", x0, y0, b, h);
        /* Etiketten */
        var ex = x0 + M.etiketV * k, ey = y0 + M.etiketTop * k, eb = (M.etiketH - M.etiketV) * k, eh = (M.etiketBund - M.etiketTop) * k;
        ctx.fillStyle = "#fbfbf7";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, ex, ey, eb, eh, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = D.NIVEAUER[fo.niveau].farve;
        ctx.fillRect(ex + 1, ey + 1, eb - 2, Math.max(2, eh * 0.08));
        if (v.udenTekst) {
            ctx.fillStyle = "rgba(40, 44, 52, 0.35)";
            ctx.fillRect(ex + eb * 0.2, ey + eh * 0.34, eb * 0.6, Math.max(1, eh * 0.06));
            ctx.fillRect(ex + eb * 0.3, ey + eh * 0.62, eb * 0.4, Math.max(1.5, eh * 0.1));
        } else {
        ctx.fillStyle = "#1c1f26";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        NK.passendeSkrift(ctx, fo.navn, eb * 0.9, NK.klamp(eh * 0.2, 9, 16), 8, "600");
        ctx.fillText(fo.navn, ex + eb / 2, ey + eh * 0.36);
        NK.passendeSkrift(ctx, fo.formelTekst, eb * 0.9, NK.klamp(eh * 0.3, 10, 24), 8, "700");
        ctx.fillText(fo.formelTekst, ex + eb / 2, ey + eh * 0.7);
        }
        if (v.stjerne) T.stjerne(ctx, x + b * 0.36, y0 + 60 * k, Math.max(6, 9 * k), v.stjerne);
        ctx.restore();
        return { x: x0, y: y0, b: b, h: h };
    };

    T.flaskeBredde = function (h) { return h * MAAL.flaske.b / MAAL.flaske.h; };

    /* ----- Atomkuglerne ------------------------------------------------------
       Farverne foelger de almindelige molekylbyggesaet. */
    var KUGLE = {
        H: ["#f4f4f1", "#b9bcc2", "#1f232b"], C: ["#5b5d66", "#25262b", "#ffffff"],
        N: ["#7aa3ff", "#2c55c9", "#ffffff"], O: ["#ff8a7c", "#c7362a", "#ffffff"],
        S: ["#fbe683", "#c9a716", "#2b2410"], Al: ["#d9c7d0", "#8d7582", "#1f232b"],
        Ca: ["#8fe0a0", "#2f8c4a", "#10301a"], P: ["#ffb877", "#d06a14", "#2b1a08"]
    };
    T.kugleFarve = function (s) { return (KUGLE[s] || ["#d8d8e0", "#8a8a98", "#1f232b"])[1]; };

    T.atom = function (ctx, x, y, r, s, v) {
        v = v || {};
        if (r <= 0.5) return;
        var f = KUGLE[s] || ["#d8d8e0", "#8a8a98", "#1f232b"];
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, f[0]);
        g.addColorStop(1, f[1]);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        if (r >= 8) {
            ctx.fillStyle = f[2];
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            NK.passendeSkrift(ctx, s, r * 1.6, Math.max(10, r * 0.95), 8, "700");
            ctx.fillText(s, x, y + 0.5);
        }
        ctx.restore();
    };

    /* ----- Den store formel i kridt ----------------------------------------
       Formlen deles i stykker: symboler i stor skrift, tal efter et symbol
       eller en parentes saenket, ladningen haevet. Hvert stykke ved, hvilket
       led i strukturen det hoerer til, saa hintet kan pege paa det. */
    T.formelStykker = function (fo) {
        var f = fo.f, ud = [], i = 0;
        var stak = [], gruppeNr = 0;
        while (i < f.length) {
            var c = f.charAt(i);
            if (/[A-Z]/.test(c)) {
                var s = c;
                i++;
                while (i < f.length && /[a-z]/.test(f.charAt(i))) { s += f.charAt(i); i++; }
                ud.push({ t: s, slags: "symbol", s: s, grupper: stak.slice() });
                var tal = "";
                while (i < f.length && /[0-9]/.test(f.charAt(i))) { tal += f.charAt(i); i++; }
                if (tal) ud.push({ t: tal, slags: "tal", s: s, grupper: stak.slice() });
            } else if (c === "(") {
                gruppeNr++;
                stak.push(gruppeNr);
                ud.push({ t: "(", slags: "parentes", gruppe: gruppeNr });
                i++;
            } else if (c === ")") {
                var nr = stak.pop();
                ud.push({ t: ")", slags: "parentes", gruppe: nr });
                i++;
                var tal2 = "";
                while (i < f.length && /[0-9]/.test(f.charAt(i))) { tal2 += f.charAt(i); i++; }
                if (tal2) ud.push({ t: tal2, slags: "gange", gruppe: nr });
            } else {
                i++;
            }
        }
        if (fo.q) {
            var q = Math.abs(fo.q);
            ud.push({ t: (q > 1 ? String(q) : "") + (fo.q > 0 ? "+" : "−"), slags: "ladning" });
        }
        return ud;
    };

    /* Grupperne (parenteserne), et symbol staar inde i */
    function grupperMed(stykker, s) {
        var ud = [];
        stykker.forEach(function (st) {
            if (st.slags === "symbol" && st.s === s) st.grupper.forEach(function (g) { if (ud.indexOf(g) < 0) ud.push(g); });
        });
        return ud;
    }

    /* Maaler og tegner formlen centreret om x med grundlinjen y.
       v.fremhaev    symbolet, hintet peger paa (gult)
       v.farver      { s: true } for de grundstoffer, der er talt (farvet)
       v.maal        true: tegn ikke, men giv bredden tilbage */
    T.formel = function (ctx, fo, x, y, px, v) {
        v = v || {};
        var st = T.formelStykker(fo);
        var lille = px * 0.58;
        var bredde = 0;
        st.forEach(function (s) {
            var stor = s.slags === "symbol" || s.slags === "parentes";
            ctx.font = font(stor ? "700" : "700", stor ? px : lille);
            s.b = ctx.measureText(s.t).width + (s.slags === "ladning" ? 2 : 0);
            bredde += s.b;
        });
        if (v.maal) return bredde;
        var fremGr = v.fremhaev ? grupperMed(st, v.fremhaev) : [];
        var cx = x - bredde / 2;
        ctx.save();
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "left";
        st.forEach(function (s) {
            var stor = s.slags === "symbol" || s.slags === "parentes";
            ctx.font = font("700", stor ? px : lille);
            var yy = y;
            if (s.slags === "tal" || s.slags === "gange") yy = y + px * 0.2;
            if (s.slags === "ladning") yy = y - px * 0.52;
            var gul = false;
            if (v.fremhaev) {
                if ((s.slags === "symbol" || s.slags === "tal") && s.s === v.fremhaev) gul = true;
                if ((s.slags === "parentes" || s.slags === "gange") && fremGr.indexOf(s.gruppe) >= 0) gul = true;
            }
            var farve = KRIDT;
            if (v.farver && s.s && v.farver[s.s] && s.slags === "symbol") farve = nuance(T.kugleFarve(s.s), 0.45);
            if (gul) farve = "#f2c53d";
            ctx.fillStyle = farve;
            ctx.fillText(s.t, cx, yy);
            if (gul && (s.slags === "symbol" || s.slags === "tal" || s.slags === "gange")) {
                ctx.fillRect(cx, y + px * (s.slags === "symbol" ? 0.14 : 0.3), s.b, Math.max(2, px * 0.05));
            }
            cx += s.b;
        });
        ctx.restore();
        return bredde;
    };

    /* ----- Smaating ----------------------------------------------------------- */
    T.stjerne = function (ctx, x, y, r, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa === true ? 1 : NK.klamp(alfa, 0, 1);
        ctx.beginPath();
        for (var i = 0; i < 10; i++) {
            var v = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
            ctx.lineTo(x + Math.cos(v) * rr, y + Math.sin(v) * rr);
        }
        ctx.closePath();
        ctx.fillStyle = "#f2c53d";
        ctx.fill();
        ctx.strokeStyle = "#8a6510";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    };

    /* En lille pil, der peger ned paa (x, y) */
    T.pil = function (ctx, x, y, s, farve) {
        ctx.save();
        ctx.fillStyle = farve || "#f2c53d";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - s, y - s * 1.2);
        ctx.lineTo(x - s * 0.4, y - s * 1.2);
        ctx.lineTo(x - s * 0.4, y - s * 2.2);
        ctx.lineTo(x + s * 0.4, y - s * 2.2);
        ctx.lineTo(x + s * 0.4, y - s * 1.2);
        ctx.lineTo(x + s, y - s * 1.2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* En lille pil, der peger op; spidsen i (x, y) */
    T.pilOp = function (ctx, x, y, s, farve) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, -1);
        T.pil(ctx, 0, 0, s, farve);
        ctx.restore();
    };

    /* En taleboble-agtig forklaring over punktet (x, y). Er der ikke plads
       over det, kommer den under yUnder i stedet, med pilen opad.
       linjer: [{ t, px, vaegt, farve }] */
    T.boble = function (ctx, x, y, linjer, W, yUnder) {
        ctx.save();
        var pad = 9, b = 0, h = 0;
        linjer.forEach(function (l) {
            ctx.font = font(l.vaegt || "600", l.px || 13);
            b = Math.max(b, ctx.measureText(l.t).width);
            h += (l.px || 13) * 1.35;
        });
        b += pad * 2;
        h += pad * 2 - 4;
        var under = y - h - 10 < 4 && yUnder !== undefined;
        var bx = NK.klamp(x - b / 2, 4, W - b - 4), by = under ? yUnder + 10 : y - h - 10;
        ctx.fillStyle = "rgba(14, 14, 20, 0.94)";
        ctx.strokeStyle = "#4a4a58";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, bx, by, b, h, 7);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        if (under) {
            ctx.moveTo(x - 6, by);
            ctx.lineTo(x, by - 7);
            ctx.lineTo(x + 6, by);
        } else {
            ctx.moveTo(x - 6, by + h);
            ctx.lineTo(x, by + h + 7);
            ctx.lineTo(x + 6, by + h);
        }
        ctx.closePath();
        ctx.fill();
        var ly = by + pad;
        ctx.textBaseline = "top";
        linjer.forEach(function (l) {
            ctx.font = font(l.vaegt || "600", l.px || 13);
            ctx.fillStyle = l.farve || "#f2f3f5";
            ctx.fillText(l.t, bx + pad, ly);
            ly += (l.px || 13) * 1.35;
        });
        ctx.restore();
    };

    NK.Tegn = T;
}());
