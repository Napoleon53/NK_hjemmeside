/* =====================================================================
   tegning.js - det, alle tre faner tegner

   Rummet og bordet, hylden med glassene, reagensglasset med indhold og
   ballon, temperaturkammeret, termometeret, vandbadet,
   zoomvinduet med molekylerne, parret, der viser beroeringen, taendstikken
   og kurven i panelet. Funktionerne tegner én ting et bestemt sted og
   husker intet selv; fanerne bestemmer, hvor tingene staar.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";
    var DISPLAY = "Consolas, 'Courier New', monospace";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* ----- Farver --------------------------------------------------------- */
    function rgb(hex) {
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

    function blandHex(a, b, t) {
        var ca = rgb(a), cb = rgb(b);
        var c = ca.map(function (v, i) { return Math.round(v + (cb[i] - v) * t); });
        return "#" + c.map(function (v) { return (v < 16 ? "0" : "") + v.toString(16); }).join("");
    }
    T.blandHex = blandHex;

    /* Tilstandens farve, som i den gamle 6.1: graa, orange og blaa */
    T.TILSTAND = ["#b0bec5", "#ffb74d", "#64b5f6"];
    T.TILSTAND_NAVN = ["fast stof", "væske", "gas"];

    /* Farven for et molekyle, der er paa vej mellem to tilstande (0-2) */
    T.tilstandFarve = function (f) {
        f = NK.klamp(f, 0, 2);
        var i = Math.min(1, Math.floor(f));
        return blandHex(T.TILSTAND[i], T.TILSTAND[i + 1], f - i);
    };

    /* ----- Rummet og bordet (som sc4.1 og sc4.2) ------------------------------ */
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

    /* ----- Hylden paa vaeggen med et stativ til glassene ------------------------
       y: hyldens overside. h: glassenes hoejde; stativets holder sidder i
       glassenes midte. */
    T.hylde = function (ctx, x0, x1, y) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(x0 + 4, y + 10, x1 - x0, 5);
        ctx.fillStyle = "#4a4f5c";
        [x0 + 24, x1 - 24].forEach(function (kx) {
            ctx.beginPath();
            ctx.moveTo(kx - 4, y + 9);
            ctx.lineTo(kx + 4, y + 9);
            ctx.lineTo(kx + 4, y + 34);
            ctx.lineTo(kx - 4, y + 24);
            ctx.closePath();
            ctx.fill();
        });
        var g = ctx.createLinearGradient(0, y, 0, y + 10);
        g.addColorStop(0, "#8a6a47");
        g.addColorStop(1, "#5f4730");
        ctx.fillStyle = g;
        ctx.fillRect(x0, y, x1 - x0, 10);
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.fillRect(x0, y, x1 - x0, 1.5);
        ctx.restore();
    };

    /* Stativets holder: en liste med huller, som glassene staar i. Tegnes
       efter glassene, saa den ligger foran dem. */
    T.stativ = function (ctx, x0, x1, yHylde, h, xs) {
        var yH = yHylde - h * 0.42, tyk = Math.max(5, h * 0.07);
        ctx.save();
        /* Benene */
        ctx.fillStyle = "#6b5238";
        ctx.fillRect(x0, yH, 5, yHylde - yH);
        ctx.fillRect(x1 - 5, yH, 5, yHylde - yH);
        /* Listen */
        var g = ctx.createLinearGradient(0, yH, 0, yH + tyk);
        g.addColorStop(0, "#9a7852");
        g.addColorStop(1, "#6b5238");
        ctx.fillStyle = g;
        ctx.fillRect(x0, yH, x1 - x0, tyk);
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.fillRect(x0, yH, x1 - x0, 1.2);
        /* Hullerne, glassene staar i, ses som moerke kanter */
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        (xs || []).forEach(function (x) { ctx.fillRect(x - h * 0.16, yH + tyk - 1.5, h * 0.32, 1.5); });
        ctx.restore();
        return yH;
    };

    /* ----- Reagensglasset --------------------------------------------------------
       (x, y): midten af glassets bund. h: glassets hoejde i px. */
    T.glasMaal = function (x, y, h) {
        var M = MAAL.reagensglas, s = h / M.h;
        var vx = x - M.b / 2 * s, vy = y - 190 * s;
        return {
            s: s, x: x, bund: y, venstre: vx, top: vy, b: M.b * s, h: M.h * s,
            mund: { x: x, y: vy + M.mundY * s },
            ind: { x0: vx + M.indV * s, x1: vx + M.indH * s, top: vy + M.indTop * s,
                   midte: vy + M.bundMidte * s, r: M.bundR * s, bund: vy + (M.bundMidte + M.bundR) * s },
            /* En fuld proeve (alt fast eller flydende) naar saa hoejt op */
            fuld: 84 * s
        };
    };

    function glasSti(ctx, ind) {
        ctx.beginPath();
        ctx.moveTo(ind.x0, ind.top);
        ctx.lineTo(ind.x0, ind.midte);
        ctx.arc((ind.x0 + ind.x1) / 2, ind.midte, (ind.x1 - ind.x0) / 2, Math.PI, 0, true);
        ctx.lineTo(ind.x1, ind.top);
        ctx.closePath();
    }

    /* Indholdet: fast stof i bunden, vaesken over, bobler naar det koger.
       mk: { fast, vaeske, koger } fra Proeve.makro(). tid: sekunder. */
    T.glasIndhold = function (ctx, G, mk, tid, frost) {
        var ind = G.ind, s = G.s;
        ctx.save();
        glasSti(ctx, ind);
        ctx.clip();
        var hFast = mk.fast * G.fuld, hVaeske = mk.vaeske * G.fuld;
        var yFast = ind.bund - hFast, yVaeske = yFast - hVaeske;
        if (hVaeske > 0.5) {
            var g = ctx.createLinearGradient(ind.x0, 0, ind.x1, 0);
            g.addColorStop(0, "rgba(170, 205, 235, 0.32)");
            g.addColorStop(0.5, "rgba(200, 225, 245, 0.18)");
            g.addColorStop(1, "rgba(170, 205, 235, 0.3)");
            ctx.fillStyle = g;
            ctx.fillRect(ind.x0, yVaeske, ind.x1 - ind.x0, hVaeske + 1);
            /* Menisken */
            ctx.strokeStyle = "rgba(225, 240, 255, 0.75)";
            ctx.lineWidth = Math.max(1, 1.4 * s);
            ctx.beginPath();
            ctx.moveTo(ind.x0, yVaeske - 2 * s);
            ctx.quadraticCurveTo((ind.x0 + ind.x1) / 2, yVaeske + 3 * s, ind.x1, yVaeske - 2 * s);
            ctx.stroke();
            /* Bobler, naar det koger: flere, jo hurtigere det koger */
            if (mk.koger > 0) {
                var antal = Math.round(4 + mk.koger * 14);
                for (var i = 0; i < antal; i++) {
                    var froe = (i * 0.6180339887) % 1, fase = (tid * (0.9 + froe * 0.8) + froe * 7) % 1;
                    var bx = ind.x0 + 4 * s + froe * (ind.x1 - ind.x0 - 8 * s) + Math.sin(tid * 5 + i) * 1.5 * s;
                    var by = ind.bund - 3 * s - fase * (ind.bund - yVaeske - 2 * s);
                    if (by < yVaeske + 1 || by > yFast - 1) continue;
                    var br = (1.4 + froe * 2.2 + fase * 1.2) * s;
                    ctx.strokeStyle = "rgba(235, 245, 255, 0.8)";
                    ctx.lineWidth = Math.max(0.8, 0.9 * s);
                    ctx.beginPath();
                    ctx.arc(bx, by, br, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }
        if (hFast > 0.5) {
            var gf = ctx.createLinearGradient(ind.x0, 0, ind.x1, 0);
            gf.addColorStop(0, "rgba(214, 220, 228, 0.92)");
            gf.addColorStop(0.45, "rgba(245, 246, 248, 0.95)");
            gf.addColorStop(1, "rgba(206, 213, 222, 0.92)");
            ctx.fillStyle = gf;
            ctx.fillRect(ind.x0, yFast, ind.x1 - ind.x0, hFast + 1);
            /* Krystallernes kanter */
            ctx.strokeStyle = "rgba(150, 165, 180, 0.45)";
            ctx.lineWidth = Math.max(0.7, 0.8 * s);
            ctx.beginPath();
            for (var k = 0; k < 5; k++) {
                var kx = ind.x0 + (k * 0.23 + 0.08) * (ind.x1 - ind.x0);
                ctx.moveTo(kx, Math.min(ind.bund, yFast + 3 * s + k * 5 * s));
                ctx.lineTo(kx + 6 * s, Math.min(ind.bund, yFast + 11 * s + k * 3 * s));
            }
            ctx.stroke();
        }
        /* Rim paa glasset, naar det er meget koldt */
        if (frost > 0) {
            ctx.fillStyle = "rgba(235, 245, 255, " + (0.2 * frost) + ")";
            ctx.fillRect(ind.x0, ind.top, 4 * s, ind.bund - ind.top);
            ctx.fillRect(ind.x1 - 4 * s, ind.top, 4 * s, ind.bund - ind.top);
        }
        ctx.restore();
    };

    /* Hele glasset: indhold, glas og ballon. v: { ballonFarve, pop, lys } */
    T.glas = function (ctx, G, mk, tid, v) {
        v = v || {};
        T.glasIndhold(ctx, G, mk, tid, v.frost || 0);
        NK.Sprites.tegn(ctx, "reagensglas", G.venstre, G.top, G.b, G.h);
        if (v.lys) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + NK.klamp(v.lys, 0, 1) + ")";
            ctx.lineWidth = 2;
            NK.rundtRekt(ctx, G.venstre - 4, G.top - 4, G.b + 8, G.h + 4, 8);
            ctx.stroke();
            ctx.restore();
        }
        if (!v.udenBallon) T.ballon(ctx, G.mund.x, G.mund.y, G.s, mk.ballon, tid, v.ballonFarve, v);
    };

    /* ----- Ballonen -------------------------------------------------------------
       (mx, my): midten af glassets munding. s: glassets skala. fyld: 0 er
       tom, 1 er fuld ved 20 °C (varmere gas fylder mere). v.pop: 0-1, den er
       lige sprunget. */
    T.ballonMaal = function (mx, my, s, fyld) {
        var r = 28 * s * Math.cbrt(NK.klamp(fyld, 0, 1.6));
        return { x: mx, y: my - 12 * s - r * 1.08, r: r };
    };

    T.ballon = function (ctx, mx, my, s, fyld, tid, farve, v) {
        v = v || {};
        farve = farve || "#e35d4f";
        ctx.save();
        if (v.pop > 0) {
            /* Stumperne efter et knald */
            ctx.strokeStyle = farve;
            ctx.lineWidth = 3 * s;
            ctx.lineCap = "round";
            ctx.globalAlpha *= 1 - v.pop;
            for (var i = 0; i < 6; i++) {
                var vk = i * 1.1 + 0.4, l = (8 + v.pop * 30) * s;
                ctx.beginPath();
                ctx.moveTo(mx + Math.cos(vk) * l * 0.5, my - 20 * s + Math.sin(vk) * l * 0.5 - v.pop * 10 * s);
                ctx.lineTo(mx + Math.cos(vk) * l, my - 20 * s + Math.sin(vk) * l - v.pop * 10 * s);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }
        if (v.vaek) { ctx.restore(); return; }
        /* Halsen, der er rullet ned over glassets krave */
        var hb = 24 * s;
        ctx.fillStyle = nuance(farve, -0.15);
        NK.rundtRekt(ctx, mx - hb, my - 4 * s, hb * 2, 9 * s, 3 * s);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.fillRect(mx - hb + 2 * s, my - 3 * s, hb * 2 - 4 * s, 2 * s);

        var oppust = NK.klamp((fyld - 0.02) / 0.12, 0, 1);
        /* Den tomme ballon haenger slapt ned over kanten */
        if (oppust < 1) {
            ctx.save();
            ctx.globalAlpha *= 1 - oppust;
            var slap = ctx.createLinearGradient(mx, my - 12 * s, mx + 30 * s, my + 18 * s);
            slap.addColorStop(0, nuance(farve, -0.05));
            slap.addColorStop(1, nuance(farve, -0.3));
            ctx.fillStyle = slap;
            ctx.beginPath();
            ctx.moveTo(mx - 14 * s, my - 4 * s);
            ctx.quadraticCurveTo(mx - 6 * s, my - 18 * s, mx + 12 * s, my - 14 * s);
            ctx.quadraticCurveTo(mx + 34 * s, my - 8 * s, mx + 34 * s, my + 16 * s);
            ctx.quadraticCurveTo(mx + 30 * s, my + 24 * s, mx + 25 * s, my + 16 * s);
            ctx.quadraticCurveTo(mx + 22 * s, my + 2 * s, mx + 8 * s, my - 3 * s);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }
        if (oppust > 0) {
            var B = T.ballonMaal(mx, my, s, Math.max(fyld, 0.02));
            ctx.globalAlpha *= oppust;
            /* Halsen fra glasset op til ballonen */
            ctx.fillStyle = nuance(farve, -0.12);
            ctx.beginPath();
            ctx.moveTo(mx - 9 * s, my - 3 * s);
            ctx.quadraticCurveTo(mx - 4 * s, my - 10 * s, mx - B.r * 0.35, B.y + B.r * 0.8);
            ctx.lineTo(mx + B.r * 0.35, B.y + B.r * 0.8);
            ctx.quadraticCurveTo(mx + 4 * s, my - 10 * s, mx + 9 * s, my - 3 * s);
            ctx.closePath();
            ctx.fill();
            /* Kroppen, en anelse aegformet og lidt gennemskinnelig */
            var wob = Math.sin(tid * 2.2) * 0.012;
            var g = ctx.createRadialGradient(B.x - B.r * 0.35, B.y - B.r * 0.4, B.r * 0.1, B.x, B.y, B.r * 1.15);
            g.addColorStop(0, nuance(farve, 0.35));
            g.addColorStop(0.55, farve);
            g.addColorStop(1, nuance(farve, -0.35));
            ctx.fillStyle = g;
            ctx.globalAlpha *= 0.94;
            ctx.beginPath();
            ctx.ellipse(B.x, B.y, B.r * (1 + wob), B.r * (1.1 - wob), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha /= 0.94;
            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.beginPath();
            ctx.ellipse(B.x - B.r * 0.38, B.y - B.r * 0.45, B.r * 0.16, B.r * 0.26, -0.5, 0, Math.PI * 2);
            ctx.fill();
            if (v.lysBallon) {
                ctx.strokeStyle = "rgba(242, 197, 61, " + NK.klamp(v.lysBallon, 0, 1) + ")";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(B.x, B.y, B.r + 5, B.r * 1.1 + 5, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        ctx.restore();
    };

    /* ----- Temperaturkammeret ------------------------------------------------------
       K: { x, y, s } oeverste venstre hjoerne og skala. Rummet bag ruden
       tegnes foer glasset, rammen og displayet efter. */
    T.kammerMaal = function (xMidte, bundY, hoejde) {
        var M = MAAL.kammer, s = hoejde / M.h;
        var x = xMidte - M.b / 2 * s, y = bundY - M.bund * s;
        return {
            x: x, y: y, s: s, b: M.b * s, h: M.h * s,
            rum: { x: x + M.rumV * s, y: y + M.rumTop * s, b: (M.rumH - M.rumV) * s, h: (M.rumBund - M.rumTop) * s },
            loft: y + M.loft * s,
            disp: { x: x + M.dispV * s, y: y + M.dispTop * s, b: (M.dispH - M.dispV) * s, h: (M.dispBund - M.dispTop) * s },
            bund: bundY
        };
    };

    T.kammerBag = function (ctx, K, temp, tid) {
        var r = K.rum, s = K.s;
        ctx.save();
        var g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
        g.addColorStop(0, "#161920");
        g.addColorStop(1, "#1e222b");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 8 * s);
        ctx.fill();
        ctx.clip();
        /* Kulden: et blaaligt skaer */
        var kold = NK.klamp(-temp / 220, 0, 1);
        if (kold > 0) {
            ctx.fillStyle = "rgba(120, 180, 255, " + (0.22 * kold) + ")";
            ctx.fillRect(r.x, r.y, r.b, r.h);
        }
        /* Varmen: varmelegemet i bunden gloeder */
        var varm = NK.klamp((temp - 40) / 320, 0, 1);
        if (varm > 0) {
            var gl = ctx.createRadialGradient(r.x + r.b / 2, r.y + r.h, 4, r.x + r.b / 2, r.y + r.h, r.h * 1.1);
            gl.addColorStop(0, "rgba(255, 140, 50, " + (0.55 * varm) + ")");
            gl.addColorStop(1, "rgba(255, 90, 30, 0)");
            ctx.fillStyle = gl;
            ctx.fillRect(r.x, r.y, r.b, r.h);
        }
        /* Varmelegemet: en spiral langs bunden */
        var yV = r.y + r.h - 12 * s;
        ctx.strokeStyle = varm > 0.05 ? "rgb(" + Math.round(90 + 165 * varm) + "," + Math.round(70 + 40 * varm) + ",50)" : "#3a3f4b";
        ctx.lineWidth = 2.2 * s;
        ctx.beginPath();
        for (var x = r.x + 10 * s; x <= r.x + r.b - 10 * s; x += 2 * s) {
            var y = yV + Math.sin((x - r.x) / (5 * s)) * 3 * s;
            if (x === r.x + 10 * s) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        void tid;
        ctx.restore();
    };

    T.kammerFront = function (ctx, K, temp, v) {
        v = v || {};
        var s = K.s;
        NK.Sprites.tegn(ctx, "kammer", K.x, K.y, K.b, K.h);
        /* Rim i rudens hjoerner, naar det er koldt */
        var rim = NK.klamp((-temp - 30) / 150, 0, 1);
        if (rim > 0) {
            var r = K.rum;
            ctx.save();
            NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 8 * s);
            ctx.clip();
            [[r.x, r.y], [r.x + r.b, r.y], [r.x, r.y + r.h], [r.x + r.b, r.y + r.h]].forEach(function (h) {
                var g = ctx.createRadialGradient(h[0], h[1], 2, h[0], h[1], 60 * s * rim + 10 * s);
                g.addColorStop(0, "rgba(240, 248, 255, " + (0.55 * rim) + ")");
                g.addColorStop(1, "rgba(240, 248, 255, 0)");
                ctx.fillStyle = g;
                ctx.fillRect(h[0] - 80 * s, h[1] - 80 * s, 160 * s, 160 * s);
            });
            ctx.restore();
        }
        /* Displayet */
        var d = K.disp;
        ctx.save();
        ctx.fillStyle = "#ff6a4d";
        ctx.shadowColor = "rgba(255, 90, 60, 0.7)";
        ctx.shadowBlur = 6;
        ctx.font = "700 " + Math.round(d.h * 0.62) + "px " + DISPLAY;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(D.grader(Math.round(temp), 0) + " °C", d.x + d.b / 2, d.y + d.h / 2 + 1);
        ctx.restore();
        if (v.lys) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + NK.klamp(v.lys, 0, 1) + ")";
            ctx.lineWidth = 2;
            NK.rundtRekt(ctx, K.x - 3, K.y + 18 * s, K.b + 6, K.h - 18 * s + 3, 10 * s);
            ctx.stroke();
            ctx.restore();
        }
    };

    /* ----- Termometeret ------------------------------------------------------------
       (x, bundY): midten af kuglens bund og hoejden h i px. omr: { min, max }.
       Returnerer maalene, saa fanen kan ramme det med musen. */
    T.termoMaal = function (x, bundY, h, omr) {
        var M = MAAL.termometer, s = h / M.h;
        var top = bundY - (M.kugleY + 13) * s;
        return {
            x: x, s: s, top: top, h: h, b: M.b * s, venstre: x - M.b / 2 * s, bund: bundY, omr: omr,
            yTop: top + M.skalaTop * s, yBund: top + M.skalaBund * s, ySoejle: top + M.soejleBund * s,
            yFor: function (t) {
                return this.yBund - (NK.klamp(t, this.omr.min, this.omr.max) - this.omr.min) / (this.omr.max - this.omr.min) * (this.yBund - this.yTop);
            },
            tFor: function (y) {
                return this.omr.min + (this.yBund - y) / (this.yBund - this.yTop) * (this.omr.max - this.omr.min);
            }
        };
    };

    /* v: { trin, store, maerker: [{ t, tekst, farve }], haandtag: 0-1 lys,
           puls: 0-1, traekker, stue } */
    T.termometer = function (ctx, TM, temp, v) {
        v = v || {};
        var s = TM.s, x = TM.x;
        NK.Sprites.tegn(ctx, "termometer", TM.venstre, TM.top, TM.b, TM.h);
        /* Soejlen */
        var yT = TM.yFor(temp);
        ctx.save();
        var g = ctx.createLinearGradient(x - 2 * s, 0, x + 2 * s, 0);
        g.addColorStop(0, "#b8352c");
        g.addColorStop(0.5, "#f0685a");
        g.addColorStop(1, "#b8352c");
        ctx.fillStyle = g;
        ctx.fillRect(x - 2.2 * s, yT, 4.4 * s, TM.ySoejle - yT + 2);
        /* Skalaen til hoejre */
        var trin = v.trin || 50, store = v.store || 100;
        var skrift = NK.klamp(11 * s * 1.25, 11, 14);
        ctx.font = font("600", skrift);
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        for (var t = Math.ceil(TM.omr.min / trin) * trin; t <= TM.omr.max + 1e-6; t += trin) {
            var y = TM.yFor(t), stor = Math.abs(t % store) < 1e-6 || t === 0;
            ctx.strokeStyle = stor ? "rgba(230, 240, 250, 0.85)" : "rgba(230, 240, 250, 0.45)";
            ctx.lineWidth = stor ? 1.4 : 1;
            ctx.beginPath();
            ctx.moveTo(x + 7 * s, y);
            ctx.lineTo(x + (stor ? 15 : 11) * s, y);
            ctx.stroke();
            if (stor) {
                ctx.fillStyle = "rgba(225, 232, 240, 0.9)";
                ctx.fillText(D.grader(t, 0), x + 18 * s, y);
            }
        }
        /* Stuetemperaturen som en lille graa streg */
        if (v.stue) {
            var yS = TM.yFor(D.STUE);
            ctx.strokeStyle = "rgba(160, 170, 185, 0.8)";
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x - 9 * s, yS);
            ctx.lineTo(x + 9 * s, yS);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        /* Maerkerne til venstre: kogepunkt og smeltepunkt, naar de er fundet */
        (v.maerker || []).forEach(function (m) {
            var ym = TM.yFor(m.t);
            ctx.strokeStyle = m.farve;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 7 * s, ym);
            ctx.lineTo(x - 17 * s, ym);
            ctx.stroke();
            ctx.fillStyle = m.farve;
            ctx.font = font("700", skrift);
            ctx.textAlign = "right";
            ctx.fillText(m.tekst, x - 20 * s, ym + (m.dy || 0));
        });
        /* Haandtaget i toppen af soejlen */
        var hr = Math.max(9, 9 * s * 1.3);
        var puls = v.puls ? 0.5 + 0.5 * Math.sin(v.tid * 6) : 0;
        if (puls) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.25 + 0.5 * puls) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, yT, hr + 5 + puls * 4, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = v.traekker ? "#f2c53d" : (v.haandtag ? "#f7d56b" : "#e9eef4");
        ctx.strokeStyle = "#8a6510";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, yT, hr, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#3a3320";
        ctx.beginPath();
        ctx.moveTo(x, yT - hr * 0.62);
        ctx.lineTo(x - hr * 0.38, yT - hr * 0.12);
        ctx.lineTo(x + hr * 0.38, yT - hr * 0.12);
        ctx.closePath();
        ctx.moveTo(x, yT + hr * 0.62);
        ctx.lineTo(x - hr * 0.38, yT + hr * 0.12);
        ctx.lineTo(x + hr * 0.38, yT + hr * 0.12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return { x: x, y: yT, r: hr };
    };

    /* ----- Vandbadet (fane 2) ------------------------------------------------------
       En lang, lav bakke fra x0 til x1, hBakke hoej, der staar paa bordet
       i bundY. Vandet viser selv, hvor varmt det er (T.vandbad). */
    T.badMaal = function (x0, x1, bundY, hBakke) {
        var MB = MAAL.vandbad;
        var b = x1 - x0, sx = b / MB.b, sy = hBakke / MB.h;
        var by = bundY - MB.fod * sy;
        return {
            glas: { x: x0, y: by, b: b, h: MB.h * sy, sx: sx, sy: sy,
                    ind0: x0 + MB.indV * sx, ind1: x0 + MB.indH * sx, bund: by + MB.bund * sy, rand: by + MB.rand * sy },
            vandY: by + 22 * sy
        };
    };

    /* Vandet tegnes efter glassene, saa de staar nede i det; saa glasset.
       Varmt vand faar et varmere skaer og smaa varmeboelger over sig. */
    T.vandbad = function (ctx, B, tid, temp) {
        var g = B.glas, varm = NK.klamp(((temp || 0) - 15) / 35, 0, 1);
        ctx.save();
        var gv = ctx.createLinearGradient(0, B.vandY, 0, g.bund);
        gv.addColorStop(0, "rgba(" + Math.round(90 + 40 * varm) + ", 160, " + Math.round(220 - 20 * varm) + ", 0.24)");
        gv.addColorStop(1, "rgba(" + Math.round(60 + 40 * varm) + ", 120, " + Math.round(190 - 20 * varm) + ", 0.34)");
        ctx.fillStyle = gv;
        ctx.fillRect(g.ind0, B.vandY, g.ind1 - g.ind0, g.bund - B.vandY);
        if (varm > 0.05) {
            ctx.strokeStyle = "rgba(255, 190, 140, " + (0.45 * varm) + ")";
            ctx.lineWidth = 1.5;
            ctx.lineCap = "round";
            for (var i = 0; i < 9; i++) {
                var bx = g.ind0 + (i + 0.5) / 9 * (g.ind1 - g.ind0), fase = (tid * 0.6 + i * 0.37) % 1;
                var by = B.vandY - 4 - fase * 18;
                ctx.globalAlpha = 1 - fase;
                ctx.beginPath();
                ctx.moveTo(bx, by + 8);
                ctx.quadraticCurveTo(bx + 4, by + 4, bx, by);
                ctx.quadraticCurveTo(bx - 4, by - 4, bx, by - 8);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
        ctx.strokeStyle = "rgba(190, 225, 255, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (var x = g.ind0; x <= g.ind1; x += 4) {
            var y = B.vandY + Math.sin(x / 11 + tid * 2) * 1.2;
            if (x === g.ind0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
        NK.Sprites.tegn(ctx, "vandbad", g.x, g.y, g.b, g.h);
    };

    /* Stiplede linjer fra et glas op til zoomvinduet over det */
    T.zoomLinjerOp = function (ctx, fra, til) {
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(fra.x, fra.y);
        ctx.lineTo(til.x, til.y + til.h);
        ctx.moveTo(fra.x + fra.b, fra.y);
        ctx.lineTo(til.x + til.b, til.y + til.h);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(242, 197, 61, 0.65)";
        ctx.strokeRect(fra.x, fra.y, fra.b, fra.h);
        ctx.restore();
    };

    /* ----- Molekylerne --------------------------------------------------------------
       Et molekyle tegnes som dets kugler med bindingerne under. s: pixels
       pr. kugleradius. (ox, oy): kassens midte i pixels. */
    T.molekyle = function (ctx, f, x, y, a, s, ox, oy, farve, alfa, ring) {
        var k = NK.Form.kugler(f, x, y, a);
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= alfa;
        /* Den hvide ring: molekylet har lige skiftet tilstand */
        if (ring > 0) {
            ctx.fillStyle = "rgba(255, 255, 255, " + (0.75 * ring) + ")";
            k.forEach(function (q) {
                ctx.beginPath();
                ctx.arc(ox + q[0] * s, oy + q[1] * s, s * (0.95 + 0.35 * ring), 0, Math.PI * 2);
                ctx.fill();
            });
        }
        if (f.b.length) {
            ctx.strokeStyle = nuance(farve, -0.45);
            ctx.lineWidth = s * 0.9;
            ctx.lineCap = "round";
            ctx.beginPath();
            f.b.forEach(function (b) {
                ctx.moveTo(ox + k[b[0]][0] * s, oy + k[b[0]][1] * s);
                ctx.lineTo(ox + k[b[1]][0] * s, oy + k[b[1]][1] * s);
            });
            ctx.stroke();
        }
        var lys = nuance(farve, 0.45), moerk = nuance(farve, -0.28);
        k.forEach(function (q) {
            var px = ox + q[0] * s, py = oy + q[1] * s, r = s * 0.95;
            var g = ctx.createRadialGradient(px - r * 0.35, py - r * 0.4, r * 0.12, px, py, r);
            g.addColorStop(0, lys);
            g.addColorStop(0.6, farve);
            g.addColorStop(1, moerk);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    };

    /* CO2 og H2O efter braendingen */
    function produkt(ctx, p, s, ox, oy) {
        var x = ox + p.x * s, y = oy + p.y * s, r = s * 0.55;
        ctx.save();
        ctx.globalAlpha *= NK.klamp(p.liv * 1.4, 0, 1);
        ctx.translate(x, y);
        ctx.rotate(p.a);
        function kugle(kx, ky, rr, f) {
            ctx.fillStyle = f;
            ctx.beginPath();
            ctx.arc(kx, ky, rr, 0, Math.PI * 2);
            ctx.fill();
        }
        if (p.slags === "co2") {
            kugle(-r * 1.5, 0, r * 0.9, "#e0483a");
            kugle(r * 1.5, 0, r * 0.9, "#e0483a");
            kugle(0, 0, r, "#3b3f47");
        } else {
            kugle(-r * 0.95, -r * 0.8, r * 0.6, "#f4f6f8");
            kugle(r * 0.95, -r * 0.8, r * 0.6, "#f4f6f8");
            kugle(0, 0, r, "#e0483a");
        }
        ctx.restore();
    }

    /* ----- Zoomvinduet ----------------------------------------------------------------
       r: { x, y, b, h } i pixels. P: proeven. v: {
         farve(m): farven for et molekyle (standard: tilstanden)
         kontakter: tegn prikker, hvor molekylerne roerer
         titel, forklaring: [{ farve, tekst }], pause, lys, fremhaev }
       Returnerer pauseknappens felt. */
    T.zoomKasse = function (ctx, r, P, v) {
        v = v || {};
        var s = r.b / P.W, ox = r.x + r.b / 2, oy = r.y + r.h / 2;
        ctx.save();
        ctx.fillStyle = "#0e0f14";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 10);
        ctx.fill();
        ctx.save();
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 10);
        ctx.clip();
        /* Et svagt gitter, saa det ligner et vindue ind i glasset */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        for (var gx = r.x + s * 4; gx < r.x + r.b; gx += s * 4) {
            ctx.beginPath();
            ctx.moveTo(Math.round(gx) + 0.5, r.y);
            ctx.lineTo(Math.round(gx) + 0.5, r.y + r.h);
            ctx.stroke();
        }
        var farve = v.farve || function (m) { return T.tilstandFarve(m.farve); };
        P.mol.forEach(function (m) {
            T.molekyle(ctx, m.f, m.x, m.y, m.a, s, ox, oy, farve(m), v.alfa ? v.alfa(m) : undefined, m.ring);
        });
        /* Prikkerne, hvor to molekyler roerer hinanden: svage paa fane 1,
           tydelige paa fane 2, hvor de er pointen */
        if (v.kontakter) {
            var svag = v.kontakter === "svag";
            ctx.fillStyle = svag ? "rgba(255, 224, 102, 0.5)" : "rgba(255, 224, 102, 0.9)";
            var kr = svag ? Math.max(1.2, s * 0.12) : Math.max(1.6, s * 0.2);
            P.kontakter().forEach(function (k) {
                var mx = ox + (k[0] + k[2]) / 2 * s, my = oy + (k[1] + k[3]) / 2 * s;
                ctx.beginPath();
                ctx.arc(mx, my, kr, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        P.produkter.forEach(function (p) { produkt(ctx, p, s, ox, oy); });
        ctx.restore();

        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, " + (0.4 + 0.6 * v.lys) + ")" : "#3d4252";
        ctx.lineWidth = v.lys ? 2.5 : 2;
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 10);
        ctx.stroke();

        /* Titlen over vinduet */
        if (v.titel) {
            NK.tekst(ctx, v.titel, r.x + 2, r.y - 8, { font: font("600", NK.klamp(r.b * 0.034, 12, 15)), farve: "#c8ced6" });
        }

        /* Forklaringen over vinduet, til hoejre for titlen */
        if (v.forklaring) {
            var fs = NK.klamp(r.b * 0.028, 12, 14), fy = r.y - 8;
            ctx.font = font("600", fs);
            var bredde = 0;
            v.forklaring.forEach(function (f) { bredde += ctx.measureText(f.tekst).width + fs * 2.1; });
            var fx = r.x + r.b - bredde + fs * 0.6;
            ctx.textBaseline = "alphabetic";
            ctx.textAlign = "left";
            v.forklaring.forEach(function (f) {
                ctx.fillStyle = f.farve;
                ctx.beginPath();
                ctx.arc(fx + fs * 0.45, fy - fs * 0.35, fs * 0.42, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#c8ced6";
                ctx.fillText(f.tekst, fx + fs * 1.1, fy);
                fx += ctx.measureText(f.tekst).width + fs * 2.1;
            });
        }

        /* Pauseknappen oeverst til hoejre */
        var pk = null;
        if (v.pause !== undefined) {
            var pb = NK.klamp(r.b * 0.07, 26, 34);
            pk = { x: r.x + r.b - pb - 8, y: r.y + 8, b: pb, h: pb };
            ctx.fillStyle = v.pauseLys ? "rgba(61, 158, 224, 0.5)" : "rgba(40, 44, 56, 0.85)";
            NK.rundtRekt(ctx, pk.x, pk.y, pk.b, pk.h, 6);
            ctx.fill();
            ctx.strokeStyle = v.pause ? "#f2c53d" : "#5b6275";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = "#e9eef4";
            var cx = pk.x + pb / 2, cy = pk.y + pb / 2, u = pb * 0.2;
            if (v.pause) {
                ctx.beginPath();
                ctx.moveTo(cx - u * 0.8, cy - u * 1.2);
                ctx.lineTo(cx + u * 1.3, cy);
                ctx.lineTo(cx - u * 0.8, cy + u * 1.2);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillRect(cx - u * 1.1, cy - u * 1.2, u * 0.75, u * 2.4);
                ctx.fillRect(cx + u * 0.35, cy - u * 1.2, u * 0.75, u * 2.4);
            }
        }
        ctx.restore();
        return pk;
    };

    /* Stiplede linjer fra glasset ud til zoomvinduets hjoerner */
    T.zoomLinjer = function (ctx, fra, til) {
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        var hoejre = til.x > fra.x + fra.b / 2;
        var fx = hoejre ? fra.x + fra.b : fra.x, tx = hoejre ? til.x : til.x + til.b;
        ctx.moveTo(fx, fra.y);
        ctx.lineTo(tx, til.y);
        ctx.moveTo(fx, fra.y + fra.h);
        ctx.lineTo(tx, til.y + til.h);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(242, 197, 61, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(fra.x, fra.y, fra.b, fra.h);
        ctx.restore();
    };

    /* ----- Parret: to molekyler, der roerer hinanden mest -------------------------------
       Tegnet med kaederne vandret og prikker, hvor de roerer. (cx, cy):
       midten. s: pixels pr. kugleradius. Returnerer antallet af beroeringer. */
    /* Parret drejes, saa det ligger vandret (hovedaksen for alle kuglerne),
       og skaleres, saa det fylder hoejst b x h pixels. De to molekyler har
       hver sin nuance, saa man kan se, hvor det ene holder op. */
    T.par = function (ctx, cx, cy, b, h, st, alfa) {
        var f = NK.Form.form(st), par = NK.Form.bedstePar(st);
        var ka0 = NK.Form.kugler(f, 0, 0, 0), kb0 = NK.Form.kugler(f, par.x, par.y, par.a);
        var alle = ka0.concat(kb0), mx = 0, my = 0;
        alle.forEach(function (p) { mx += p[0]; my += p[1]; });
        mx /= alle.length;
        my /= alle.length;
        var sxx = 0, syy = 0, sxy = 0;
        alle.forEach(function (p) {
            var dx = p[0] - mx, dy = p[1] - my;
            sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
        });
        var drej = -0.5 * Math.atan2(2 * sxy, sxx - syy);
        var c = Math.cos(drej), sn = Math.sin(drej);
        function rot(p) { var x = p[0] - mx, y = p[1] - my; return [x * c - y * sn, x * sn + y * c]; }
        var ka = ka0.map(rot), kb = kb0.map(rot);
        var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        ka.concat(kb).forEach(function (p) {
            x0 = Math.min(x0, p[0] - 1); x1 = Math.max(x1, p[0] + 1);
            y0 = Math.min(y0, p[1] - 1); y1 = Math.max(y1, p[1] + 1);
        });
        var s = Math.min(b / (x1 - x0), h / (y1 - y0));
        var ox = cx - (x0 + x1) / 2 * s, oy = cy - (y0 + y1) / 2 * s;
        var mA = rot([0, 0]), mB = rot([par.x, par.y]);
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= alfa;
        T.molekyle(ctx, f, mA[0], mA[1], drej, s, ox, oy, "#ffb74d");
        T.molekyle(ctx, f, mB[0], mB[1], drej + par.a, s, ox, oy, "#e07b2e");
        ka.forEach(function (p) {
            kb.forEach(function (q) {
                var d = Math.sqrt((p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]));
                if (d < NK.Form.KONTAKT) {
                    ctx.beginPath();
                    ctx.arc(ox + (p[0] + q[0]) / 2 * s, oy + (p[1] + q[1]) / 2 * s, Math.max(2.2, s * 0.28), 0, Math.PI * 2);
                    ctx.fillStyle = "#fff176";
                    ctx.fill();
                    ctx.strokeStyle = "rgba(60, 40, 0, 0.8)";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });
        ctx.restore();
        return par.n;
    };

    /* ----- Taendstikken ------------------------------------------------------------------
       (x, y): hovedet. v: { s, vinkel, braender, tid } */
    T.taendstik = function (ctx, x, y, v) {
        var s = v.s || 1, l = 46 * s, vk = v.vinkel === undefined ? 0.5 : v.vinkel;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(vk);
        ctx.strokeStyle = v.braendt ? "#3a3026" : "#e8d3a6";
        ctx.lineWidth = 3.2 * s;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 2 * s);
        ctx.lineTo(0, l);
        ctx.stroke();
        ctx.fillStyle = v.braendt ? "#241c16" : "#b3302a";
        ctx.beginPath();
        ctx.ellipse(0, 0, 3.4 * s, 4.4 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (v.braender) T.flamme(ctx, x, y - 3 * s, 12 * s, v.tid || 0);
    };

    T.flamme = function (ctx, x, y, h, tid) {
        var fl = 1 + Math.sin(tid * 23) * 0.08 + Math.sin(tid * 37) * 0.05;
        ctx.save();
        var g = ctx.createRadialGradient(x, y - h * 0.3, 1, x, y - h * 0.3, h * 1.8);
        g.addColorStop(0, "rgba(255, 210, 110, 0.55)");
        g.addColorStop(1, "rgba(255, 150, 60, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - h * 2, y - h * 2.4, h * 4, h * 4);
        [["#ff8a2a", 1], ["#ffd76a", 0.62], ["#fff6d8", 0.32]].forEach(function (lag) {
            var hh = h * lag[1] * fl, bb = h * 0.42 * lag[1];
            ctx.fillStyle = lag[0];
            ctx.beginPath();
            ctx.moveTo(x, y - hh * 1.6);
            ctx.quadraticCurveTo(x + bb * 1.4, y - hh * 0.3, x, y + bb * 0.6);
            ctx.quadraticCurveTo(x - bb * 1.4, y - hh * 0.3, x, y - hh * 1.6);
            ctx.fill();
        });
        ctx.restore();
    };

    /* Ildkuglen, naar ballonen braender. t: 0-1 */
    T.ildkugle = function (ctx, x, y, r, t) {
        if (t <= 0 || t >= 1) return;
        var rr = r * (0.5 + 1.1 * NK.blod(Math.min(1, t * 2.5)));
        var a = t < 0.3 ? 1 : 1 - (t - 0.3) / 0.7;
        ctx.save();
        ctx.globalAlpha *= NK.klamp(a, 0, 1);
        var g = ctx.createRadialGradient(x, y, rr * 0.05, x, y, rr);
        g.addColorStop(0, "rgba(255, 250, 220, 1)");
        g.addColorStop(0.3, "rgba(255, 210, 90, 0.95)");
        g.addColorStop(0.65, "rgba(255, 120, 40, 0.75)");
        g.addColorStop(1, "rgba(200, 50, 20, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y - t * r * 0.6, rr, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Smaating (som sc4.2) -------------------------------------------------------- */
    T.buePil = function (ctx, x0, y0, x1, y1, tid, kx, ky) {
        var mx = kx !== undefined ? kx : (x0 + x1) / 2;
        var my = ky !== undefined ? ky : Math.min(y0, y1) - Math.abs(x1 - x0) * 0.25 - 20;
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 7]);
        ctx.lineDashOffset = -((tid || 0) * 30 % 15);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(mx, my, x1, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        var vx = x1 - mx, vy = y1 - my, l = Math.sqrt(vx * vx + vy * vy) || 1;
        vx /= l; vy /= l;
        ctx.fillStyle = "rgba(242, 197, 61, 0.95)";
        ctx.beginPath();
        ctx.moveTo(x1 + vx * 4, y1 + vy * 4);
        ctx.lineTo(x1 - vx * 12 - vy * 7, y1 - vy * 12 + vx * 7);
        ctx.lineTo(x1 - vx * 12 + vy * 7, y1 - vy * 12 - vx * 7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* En lodret dobbeltpil ved termometeret: det kan traekkes */
    T.traekPil = function (ctx, x, y, h, tid) {
        var d = Math.sin(tid * 4) * 4;
        ctx.save();
        ctx.fillStyle = "rgba(242, 197, 61, 0.95)";
        [[-1, y - h / 2 - d], [1, y + h / 2 + d]].forEach(function (p) {
            ctx.beginPath();
            ctx.moveTo(x, p[1] + p[0] * 9);
            ctx.lineTo(x - 7, p[1]);
            ctx.lineTo(x + 7, p[1]);
            ctx.closePath();
            ctx.fill();
        });
        ctx.restore();
    };

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

    /* Et lille skilt med tekst (navnet under et glas) */
    T.skilt = function (ctx, x, y, linjer, v) {
        v = v || {};
        ctx.save();
        var px = v.px || 13, b = 0;
        linjer.forEach(function (l, i) {
            ctx.font = font(i ? "500" : "700", i ? px * 0.85 : px);
            b = Math.max(b, ctx.measureText(l).width);
        });
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        linjer.forEach(function (l, i) {
            ctx.font = font(i ? "500" : "700", i ? px * 0.85 : px);
            ctx.fillStyle = i ? "#9aa3ae" : (v.farve || "#e6ebf1");
            ctx.fillText(l, x, y + (i ? px * 1.15 : 0));
        });
        ctx.restore();
        return b;
    };

    /* ----- Kurven i panelet -------------------------------------------------------------
       x: antal C (1-10 og 20 efter et knaek). y: kogepunktet i °C.
       v: { punkter: [{ st, kp, ny }], gaet: { nC, t, fundet }, aktiv: nC,
            gaetLys, tid } */
    var KURVE_OMR = { min: -200, max: 360 };
    T.kurveMaal = function (W, H) {
        var fs = NK.klamp(W * 0.03, 11, 13);
        var v = 40, hj = 10, top = 12, bund = H - fs * 2.6 - 6;
        return {
            W: W, H: H, fs: fs, v: v, hj: hj, top: top, bund: bund,
            xFor: function (nC) {
                var i = nC <= 10 ? nC - 1 : 11;
                return v + (i + 0.5) * (W - v - hj) / 12;
            },
            yFor: function (t) {
                return bund - (NK.klamp(t, KURVE_OMR.min, KURVE_OMR.max) - KURVE_OMR.min) / (KURVE_OMR.max - KURVE_OMR.min) * (bund - top);
            },
            tFor: function (y) {
                return KURVE_OMR.min + (bund - y) / (bund - top) * (KURVE_OMR.max - KURVE_OMR.min);
            }
        };
    };

    T.kurve = function (ctx, W, H, v) {
        v = v || {};
        var K = T.kurveMaal(W, H), fs = K.fs;
        ctx.clearRect(0, 0, W, H);
        ctx.save();
        ctx.font = font("600", fs);
        ctx.textBaseline = "middle";
        /* Gitterlinjerne */
        for (var t = -200; t <= 300; t += 100) {
            var y = Math.round(K.yFor(t)) + 0.5;
            ctx.strokeStyle = t === 0 ? "rgba(255, 255, 255, 0.22)" : "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(K.v, y);
            ctx.lineTo(W - K.hj, y);
            ctx.stroke();
            ctx.fillStyle = "#8b93a0";
            ctx.textAlign = "right";
            ctx.fillText(D.grader(t, 0), K.v - 5, y);
        }
        /* Stuetemperaturen */
        var yS = K.yFor(D.STUE);
        ctx.strokeStyle = "rgba(126, 224, 168, 0.55)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(K.v, yS);
        ctx.lineTo(W - K.hj, yS);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(126, 224, 168, 0.85)";
        ctx.textAlign = "left";
        ctx.fillText("20 °C", K.v + 4, yS - fs * 0.75);

        /* x-aksen: antal C, med et knaek foer 20 */
        ctx.fillStyle = "#8b93a0";
        ctx.textAlign = "center";
        var yX = K.bund + fs * 0.9;
        for (var n = 1; n <= 10; n++) ctx.fillText(String(n), K.xFor(n), yX);
        ctx.fillText("20", K.xFor(20), yX);
        var xk = (K.xFor(10) + K.xFor(20)) / 2;
        ctx.strokeStyle = "#8b93a0";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(xk - 5, yX + 4); ctx.lineTo(xk - 1, yX - 4);
        ctx.moveTo(xk + 1, yX + 4); ctx.lineTo(xk + 5, yX - 4);
        ctx.stroke();
        ctx.fillText("antal C-atomer i kæden", (K.v + W - K.hj) / 2, yX + fs * 1.35);

        /* Den aktive soejle (stoffet i kammeret) */
        if (v.aktiv) {
            var xa = K.xFor(v.aktiv), bredde = (W - K.v - K.hj) / 12;
            ctx.fillStyle = "rgba(61, 158, 224, 0.12)";
            ctx.fillRect(xa - bredde / 2, K.top, bredde, K.bund - K.top);
        }

        /* Punkterne, forbundet i raekkefoelge efter kaedelaengde */
        var pk = (v.punkter || []).slice().sort(function (a, b) { return a.st.nC - b.st.nC; });
        if (pk.length > 1) {
            ctx.strokeStyle = "rgba(240, 104, 90, 0.55)";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            pk.forEach(function (p, i) {
                var px = K.xFor(p.st.nC), py = K.yFor(p.st.kp);
                if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
            });
            ctx.stroke();
        }
        pk.forEach(function (p) {
            var px = K.xFor(p.st.nC), py = K.yFor(p.st.kp);
            if (p.ny) {
                ctx.fillStyle = "rgba(242, 197, 61, " + (0.35 * p.ny) + ")";
                ctx.beginPath();
                ctx.arc(px, py, 7 + 8 * p.ny, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = "#f0685a";
            ctx.strokeStyle = "#1c1f26";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
        /* Tallet ved det nyeste punkt */
        var nyest = null;
        pk.forEach(function (p) { if (p.sidst) nyest = p; });
        if (nyest) {
            var nx = K.xFor(nyest.st.nC), ny = K.yFor(nyest.st.kp);
            var tekst = D.gradTekst(nyest.st.kp);
            ctx.font = font("700", fs);
            var tb = ctx.measureText(tekst).width;
            var lx = NK.klamp(nx - tb / 2, K.v + 2, W - K.hj - tb - 2);
            var ly = ny - fs * 1.3 < K.top + 4 ? ny + fs * 1.4 : ny - fs * 1.3;
            ctx.fillStyle = "rgba(20, 20, 28, 0.85)";
            ctx.fillRect(lx - 4, ly - fs * 0.7, tb + 8, fs * 1.4);
            ctx.fillStyle = "#ffd2cb";
            ctx.textAlign = "left";
            ctx.fillText(tekst, lx, ly);
        }

        /* Gaettet: en hul gul ring med et ?, som kan traekkes op og ned */
        if (v.gaet) {
            var gx = K.xFor(v.gaet.nC), gy = K.yFor(v.gaet.t);
            var puls = v.gaet.sat ? 0 : 0.5 + 0.5 * Math.sin((v.tid || 0) * 5);
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.6 + 0.4 * puls) + ")";
            ctx.fillStyle = "rgba(242, 197, 61, " + (v.gaetLys ? 0.35 : 0.15) + ")";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(gx, gy, 9 + puls * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#f2c53d";
            ctx.font = font("800", fs);
            ctx.textAlign = "center";
            ctx.fillText("?", gx, gy + 0.5);
            if (v.gaet.sat) {
                var gt = "dit gæt: " + D.gradTekst(v.gaet.t, 0);
                ctx.font = font("600", fs);
                var gb = ctx.measureText(gt).width;
                var gxx = NK.klamp(gx - gb - 14, K.v + 2, W - K.hj - gb - 2);
                ctx.fillStyle = "#f2c53d";
                ctx.textAlign = "left";
                ctx.fillText(gt, gxx, gy);
            }
        }
        ctx.restore();
        return K;
    };

    NK.Tegn = T;
}());
