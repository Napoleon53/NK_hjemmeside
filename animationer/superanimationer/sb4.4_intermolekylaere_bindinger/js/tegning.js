/* =====================================================================
   tegning.js - det, fanerne tegner paa laerredet

   Rummet og bordet, temperaturkammeret med reagensglasset og ballonen,
   termometeret (alt det fra sc6.1), luppen med molekylerne og
   bindingerne mellem dem, og molekylerne som kuglemodeller paa
   kortene. Funktionerne tegner én ting et bestemt sted og husker intet
   selv; fanerne bestemmer, hvor tingene staar.
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

    /* Atomernes farver: de gaengse modelfarver, som den gamle b4.1 */
    T.ATOM = {
        C: { farve: "#454b55", kant: "#23262c" },
        O: { farve: "#e2483b", kant: "#9c2a20" },
        H: { farve: "#f4f6f8", kant: "#8d96a1" }
    };
    T.HB_FARVE = "#d42a2a";
    T.LON_FARVE = "#5b6573";

    /* ----- Rummet og bordet (som sc6.1) --------------------------------------- */
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
        var plade = 10;
        ctx.fillStyle = "#2a2e37";
        ctx.fillRect(x0, y + plade, x1 - x0, gulv - y - plade);
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(x0, y, x1 - x0, plade);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0, y, x1 - x0, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x0, y + plade, x1 - x0, 4);
    };

    /* ----- Reagensglasset (som sc6.1) ------------------------------------------
       (x, y): midten af glassets bund. h: glassets hoejde i px. */
    T.glasMaal = function (x, y, h) {
        var M = MAAL.reagensglas, s = h / M.h;
        var vx = x - M.b / 2 * s, vy = y - 190 * s;
        return {
            s: s, x: x, bund: y, venstre: vx, top: vy, b: M.b * s, h: M.h * s,
            mund: { x: x, y: vy + M.mundY * s },
            ind: { x0: vx + M.indV * s, x1: vx + M.indH * s, top: vy + M.indTop * s,
                   midte: vy + M.bundMidte * s, r: M.bundR * s, bund: vy + (M.bundMidte + M.bundR) * s },
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

    /* Vaesken med menisk og bobler, naar den koger. mk fra Proeve.makro() */
    T.glasIndhold = function (ctx, G, mk, tid, frost) {
        var ind = G.ind, s = G.s;
        ctx.save();
        glasSti(ctx, ind);
        ctx.clip();
        var hV = mk.vaeske * G.fuld, yV = ind.bund - hV;
        if (hV > 0.5) {
            var g = ctx.createLinearGradient(ind.x0, 0, ind.x1, 0);
            g.addColorStop(0, "rgba(170, 205, 235, 0.32)");
            g.addColorStop(0.5, "rgba(200, 225, 245, 0.18)");
            g.addColorStop(1, "rgba(170, 205, 235, 0.3)");
            ctx.fillStyle = g;
            ctx.fillRect(ind.x0, yV, ind.x1 - ind.x0, hV + 1);
            ctx.strokeStyle = "rgba(225, 240, 255, 0.75)";
            ctx.lineWidth = Math.max(1, 1.4 * s);
            ctx.beginPath();
            ctx.moveTo(ind.x0, yV - 2 * s);
            ctx.quadraticCurveTo((ind.x0 + ind.x1) / 2, yV + 3 * s, ind.x1, yV - 2 * s);
            ctx.stroke();
            if (mk.koger > 0) {
                var antal = Math.round(4 + mk.koger * 14);
                for (var i = 0; i < antal; i++) {
                    var froe = (i * 0.6180339887) % 1, fase = (tid * (0.9 + froe * 0.8) + froe * 7) % 1;
                    var bx = ind.x0 + 4 * s + froe * (ind.x1 - ind.x0 - 8 * s) + Math.sin(tid * 5 + i) * 1.5 * s;
                    var by = ind.bund - 3 * s - fase * (ind.bund - yV - 2 * s);
                    if (by < yV + 1) continue;
                    var br = (1.4 + froe * 2.2 + fase * 1.2) * s;
                    ctx.strokeStyle = "rgba(235, 245, 255, 0.8)";
                    ctx.lineWidth = Math.max(0.8, 0.9 * s);
                    ctx.beginPath();
                    ctx.arc(bx, by, br, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
        }
        if (frost > 0) {
            ctx.fillStyle = "rgba(235, 245, 255, " + (0.2 * frost) + ")";
            ctx.fillRect(ind.x0, ind.top, 4 * s, ind.bund - ind.top);
            ctx.fillRect(ind.x1 - 4 * s, ind.top, 4 * s, ind.bund - ind.top);
        }
        ctx.restore();
    };

    T.glas = function (ctx, G, mk, tid, v) {
        v = v || {};
        T.glasIndhold(ctx, G, mk, tid, v.frost || 0);
        NK.Sprites.tegn(ctx, "reagensglas", G.venstre, G.top, G.b, G.h);
        if (v.lys) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + NK.klamp(v.lys, 0, 1) + ")";
            ctx.lineWidth = 2.5;
            NK.rundtRekt(ctx, G.venstre - 4, G.top - 4, G.b + 8, G.h + 4, 8);
            ctx.stroke();
            ctx.restore();
        }
        T.ballon(ctx, G.mund.x, G.mund.y, G.s, mk.ballon, tid, v.ballonFarve);
    };

    /* ----- Ballonen (som sc6.1) --------------------------------------------------
       fyld: 0 er tom, 1 er fuld ved 20 °C (varmere damp fylder mere). */
    T.ballonMaal = function (mx, my, s, fyld) {
        var r = 28 * s * Math.cbrt(NK.klamp(fyld, 0, 1.6));
        return { x: mx, y: my - 12 * s - r * 1.08, r: r };
    };

    T.ballon = function (ctx, mx, my, s, fyld, tid, farve) {
        farve = farve || "#e35d4f";
        ctx.save();
        var hb = 24 * s;
        ctx.fillStyle = nuance(farve, -0.15);
        NK.rundtRekt(ctx, mx - hb, my - 4 * s, hb * 2, 9 * s, 3 * s);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.fillRect(mx - hb + 2 * s, my - 3 * s, hb * 2 - 4 * s, 2 * s);
        var oppust = NK.klamp((fyld - 0.02) / 0.12, 0, 1);
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
            ctx.fillStyle = nuance(farve, -0.12);
            ctx.beginPath();
            ctx.moveTo(mx - 9 * s, my - 3 * s);
            ctx.quadraticCurveTo(mx - 4 * s, my - 10 * s, mx - B.r * 0.35, B.y + B.r * 0.8);
            ctx.lineTo(mx + B.r * 0.35, B.y + B.r * 0.8);
            ctx.quadraticCurveTo(mx + 4 * s, my - 10 * s, mx + 9 * s, my - 3 * s);
            ctx.closePath();
            ctx.fill();
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
        }
        ctx.restore();
    };

    /* ----- Temperaturkammeret (som sc6.1) -----------------------------------------
       xMidte, bundY: midten af kammerets bund. hoejde: kammerets hoejde i px. */
    T.kammerMaal = function (xMidte, bundY, hoejde) {
        var M = MAAL.kammer, s = hoejde / M.h;
        var x = xMidte - M.b / 2 * s, y = bundY - M.bund * s;
        return {
            x: x, y: y, s: s, b: M.b * s, h: M.h * s, xMidte: xMidte,
            rum: { x: x + M.rumV * s, y: y + M.rumTop * s, b: (M.rumH - M.rumV) * s, h: (M.rumBund - M.rumTop) * s },
            loft: y + M.loft * s,
            disp: { x: x + M.dispV * s, y: y + M.dispTop * s, b: (M.dispH - M.dispV) * s, h: (M.dispBund - M.dispTop) * s },
            bund: bundY,
            /* Glasset staar paa bunden af rummet og stikker op gennem loftet */
            glas: function () { return T.glasMaal(xMidte, y + 214 * s, 250 * s); }
        };
    };

    T.kammerBag = function (ctx, K, temp) {
        var r = K.rum, s = K.s;
        ctx.save();
        var g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
        g.addColorStop(0, "#161920");
        g.addColorStop(1, "#1e222b");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 8 * s);
        ctx.fill();
        ctx.clip();
        var kold = NK.klamp(-temp / 120, 0, 1);
        if (kold > 0) {
            ctx.fillStyle = "rgba(120, 180, 255, " + (0.22 * kold) + ")";
            ctx.fillRect(r.x, r.y, r.b, r.h);
        }
        var varm = NK.klamp((temp - 30) / 200, 0, 1);
        if (varm > 0) {
            var gl = ctx.createRadialGradient(r.x + r.b / 2, r.y + r.h, 4, r.x + r.b / 2, r.y + r.h, r.h * 1.1);
            gl.addColorStop(0, "rgba(255, 140, 50, " + (0.55 * varm) + ")");
            gl.addColorStop(1, "rgba(255, 90, 30, 0)");
            ctx.fillStyle = gl;
            ctx.fillRect(r.x, r.y, r.b, r.h);
        }
        var yV = r.y + r.h - 12 * s;
        ctx.strokeStyle = varm > 0.05 ? "rgb(" + Math.round(90 + 165 * varm) + "," + Math.round(70 + 40 * varm) + ",50)" : "#3a3f4b";
        ctx.lineWidth = 2.2 * s;
        ctx.beginPath();
        for (var x = r.x + 10 * s; x <= r.x + r.b - 10 * s; x += 2 * s) {
            var y = yV + Math.sin((x - r.x) / (5 * s)) * 3 * s;
            if (x === r.x + 10 * s) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
    };

    T.kammerFront = function (ctx, K, temp, v) {
        v = v || {};
        var s = K.s;
        NK.Sprites.tegn(ctx, "kammer", K.x, K.y, K.b, K.h);
        var rim = NK.klamp((-temp - 20) / 90, 0, 1);
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
        var d = K.disp;
        ctx.save();
        ctx.fillStyle = "#ff6a4d";
        ctx.shadowColor = "rgba(255, 90, 60, 0.7)";
        ctx.shadowBlur = 6;
        ctx.font = "700 " + Math.max(12, Math.round(d.h * 0.62)) + "px " + DISPLAY;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(D.grader(Math.round(temp), 0) + " °C", d.x + d.b / 2, d.y + d.h / 2 + 1);
        ctx.restore();
        if (v.lys) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + NK.klamp(v.lys, 0, 1) + ")";
            ctx.lineWidth = 2.5;
            NK.rundtRekt(ctx, K.x - 3, K.y + 18 * s, K.b + 6, K.h - 18 * s + 3, 10 * s);
            ctx.stroke();
            ctx.restore();
        }
    };

    /* Kammeret med glasset i: bag, glas og ballon, front */
    T.kammerMedGlas = function (ctx, K, temp, mk, tid, v) {
        v = v || {};
        T.kammerBag(ctx, K, temp);
        T.glas(ctx, K.glas(), mk, tid, { frost: NK.klamp(-temp / 100, 0, 1), lys: v.lysGlas, ballonFarve: v.ballonFarve });
        T.kammerFront(ctx, K, temp, v);
    };

    /* ----- Termometeret (som sc6.1) ---------------------------------------------------
       (x, bundY): midten af kuglens bund og hoejden h i px. omr: { min, max }. */
    T.termoMaal = function (x, bundY, h, omr) {
        var M = MAAL.termometer, s = h / M.h;
        var top = bundY - (M.kugleY + 13) * s;
        return {
            x: x, s: s, top: top, h: h, b: M.b * s, venstre: x - M.b / 2 * s, bund: bundY, omr: omr,
            kugle: { x: x, y: top + M.kugleY * s, r: 13 * s },
            yTop: top + M.skalaTop * s, yBund: top + M.skalaBund * s, ySoejle: top + M.soejleBund * s,
            yFor: function (t) {
                return this.yBund - (NK.klamp(t, this.omr.min, this.omr.max) - this.omr.min) / (this.omr.max - this.omr.min) * (this.yBund - this.yTop);
            },
            tFor: function (y) {
                return this.omr.min + (this.yBund - y) / (this.yBund - this.yTop) * (this.omr.max - this.omr.min);
            }
        };
    };

    /* v: { trin, store, maerker: [{ t, tekst, farve, stiplet }], haandtag, puls, tid, traekker, stue } */
    T.termometer = function (ctx, TM, temp, v) {
        v = v || {};
        var s = TM.s, x = TM.x;
        NK.Sprites.tegn(ctx, "termometer", TM.venstre, TM.top, TM.b, TM.h);
        var yT = TM.yFor(temp);
        ctx.save();
        var g = ctx.createLinearGradient(x - 2 * s, 0, x + 2 * s, 0);
        g.addColorStop(0, "#b8352c");
        g.addColorStop(0.5, "#f0685a");
        g.addColorStop(1, "#b8352c");
        ctx.fillStyle = g;
        ctx.fillRect(x - 2.2 * s, yT, 4.4 * s, TM.ySoejle - yT + 2);
        var trin = v.trin || 20, store = v.store || 40;
        var skrift = NK.klamp(11 * s * 1.25, 12, 14);
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
        if (v.stue) {
            var yS = TM.yFor(20);
            ctx.strokeStyle = "rgba(160, 170, 185, 0.8)";
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x - 9 * s, yS);
            ctx.lineTo(x + 9 * s, yS);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        /* Maerkerne til venstre: de kogepunkter, eleven har fundet */
        (v.maerker || []).forEach(function (m) {
            var ym = TM.yFor(m.t);
            ctx.strokeStyle = m.farve;
            ctx.lineWidth = 2;
            if (m.stiplet) ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x - 7 * s, ym);
            ctx.lineTo(x - 17 * s, ym);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = m.farve;
            ctx.font = font("700", skrift);
            ctx.textAlign = "right";
            ctx.fillText(m.tekst, x - 20 * s, ym + (m.dy || 0));
        });
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

    /* ----- Luppen ------------------------------------------------------------------
       L: { x, y, r } midten og radius i px. P: proeven. v: {
         london, hb: tegn bindingerne (standard ja)
         valgt: et molekyle, der er klikket paa (faar δ+ og δ−)
         donorKant: H paa O faar en roed kant (δ+), naar eleven har fundet det
         lysH: et H, der blinker (Vis svaret)
         titel, lys, gaet: gul ring (elevens gaet), tid } */
    T.lup = function (ctx, L, P, v) {
        v = v || {};
        var s = L.r / P.Rm, ox = L.x, oy = L.y;
        ctx.save();
        /* Skyggen og glasset */
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.arc(ox + 3, oy + 6, L.r + 8, 0, Math.PI * 2);
        ctx.fill();
        var g = ctx.createRadialGradient(ox - L.r * 0.2, oy - L.r * 0.25, L.r * 0.1, ox, oy, L.r);
        g.addColorStop(0, "#fbfcfd");
        g.addColorStop(0.65, "#eef2f5");
        g.addColorStop(1, "#d9e1e8");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ox, oy, L.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.clip();

        /* Bindingerne mellem molekylerne under molekylerne */
        var lw = Math.max(2, s * 0.11);
        if (v.london !== false) {
            ctx.strokeStyle = "rgba(91, 101, 115, 0.62)";
            ctx.lineWidth = Math.max(1.6, s * 0.08);
            ctx.lineCap = "round";
            ctx.setLineDash([1, Math.max(4, s * 0.2)]);
            ctx.beginPath();
            P.lonListe.forEach(function (b) {
                ctx.moveTo(ox + b.x1 * s, oy + b.y1 * s);
                ctx.lineTo(ox + b.x2 * s, oy + b.y2 * s);
            });
            ctx.stroke();
            ctx.setLineDash([]);
        }
        /* De bindinger, der lige er sprunget: stregen trækker sig tilbage mod
           hver sin ende og blegner */
        P.brudte.forEach(function (b) {
            var u = NK.klamp(b.t / 0.7, 0, 1), k = 0.5 * (1 - u);
            var x1 = ox + b.x1 * s, y1 = oy + b.y1 * s, x2 = ox + b.x2 * s, y2 = oy + b.y2 * s;
            ctx.globalAlpha = 1 - u;
            ctx.strokeStyle = b.slags === "hb" ? T.HB_FARVE : T.LON_FARVE;
            ctx.lineWidth = b.slags === "hb" ? lw : Math.max(1.6, s * 0.08);
            ctx.setLineDash(b.slags === "hb" ? [s * 0.22, s * 0.16] : [1, Math.max(4, s * 0.2)]);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + (x2 - x1) * k, y1 + (y2 - y1) * k);
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 + (x1 - x2) * k, y2 + (y1 - y2) * k);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        });

        /* Molekylerne */
        P.mol.forEach(function (m) {
            T.molekyle(ctx, P.F, m, s, ox, oy, {
                valgt: v.valgt === m, donorKant: v.donorKant, ring: m.ring,
                lysH: v.lysH && v.lysH.m === m ? v.lysH : null, tid: v.tid
            });
        });

        /* Hydrogenbindingerne ovenpaa, saa de kan ses mellem atomerne */
        if (v.hb !== false) {
            ctx.strokeStyle = T.HB_FARVE;
            ctx.lineWidth = lw;
            ctx.lineCap = "butt";
            ctx.setLineDash([s * 0.22, s * 0.16]);
            ctx.beginPath();
            P.hbListe.forEach(function (b) {
                /* Fra kanten af H til kanten af O */
                var dx = b.x2 - b.x1, dy = b.y2 - b.y1, d = Math.hypot(dx, dy) || 1;
                var a0 = 0.3 / d, a1 = 1 - 0.5 / d;
                ctx.moveTo(ox + (b.x1 + dx * a0) * s, oy + (b.y1 + dy * a0) * s);
                ctx.lineTo(ox + (b.x1 + dx * a1) * s, oy + (b.y1 + dy * a1) * s);
            });
            ctx.stroke();
            ctx.setLineDash([]);
        }

        /* δ+ og δ− paa det valgte molekyle */
        if (v.valgt) T.deltaer(ctx, P.F, v.valgt, s, ox, oy);
        ctx.restore();

        /* Rammen om glasset */
        ctx.lineWidth = Math.max(6, L.r * 0.035);
        ctx.strokeStyle = v.gaet ? "#f2c53d" : (v.lys ? "rgba(242, 197, 61, " + (0.5 + 0.5 * v.lys) + ")" : "#607d8b");
        ctx.beginPath();
        ctx.arc(ox, oy, L.r + ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.arc(ox, oy, L.r + 1, Math.PI * 1.05, Math.PI * 1.55);
        ctx.stroke();
        ctx.restore();
    };

    /* Et molekyle i luppen. m: { x, y, a, gas, ring }. s: pixels pr. enhed. */
    T.molekyle = function (ctx, F, m, s, ox, oy, v) {
        v = v || {};
        var c = Math.cos(m.a), sn = Math.sin(m.a);
        var A = F.atomer;
        var px = [], py = [];
        for (var i = 0; i < A.length; i++) {
            px[i] = ox + (m.x + A[i].x * c - A[i].y * sn) * s;
            py[i] = oy + (m.y + A[i].x * sn + A[i].y * c) * s;
        }
        T.kugler(ctx, F, px, py, s, v);
    };

    /* Kuglerne og pindene for ét molekyle, naar atomernes pladser i px er
       regnet ud. Bruges baade i luppen og paa kortene. */
    T.kugler = function (ctx, F, px, py, s, v) {
        v = v || {};
        var A = F.atomer;
        ctx.save();
        if (v.ring > 0 || v.valgt) {
            ctx.fillStyle = v.valgt ? "rgba(242, 197, 61, 0.55)" : "rgba(120, 190, 255, " + (0.55 * v.ring) + ")";
            A.forEach(function (a, i) {
                ctx.beginPath();
                ctx.arc(px[i], py[i], (a.r + 0.22) * s, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        /* Pindene */
        ctx.strokeStyle = "#7b838f";
        ctx.lineWidth = Math.max(1.5, s * 0.14);
        ctx.lineCap = "round";
        ctx.beginPath();
        F.bindinger.forEach(function (b) {
            ctx.moveTo(px[b[0]], py[b[0]]);
            ctx.lineTo(px[b[1]], py[b[1]]);
        });
        ctx.stroke();
        /* Kuglerne: H paa C, saa C og O, til sidst H paa O */
        F.orden.forEach(function (i) {
            var a = A[i], f = T.ATOM[a.e], r = a.r * s;
            var g = ctx.createRadialGradient(px[i] - r * 0.35, py[i] - r * 0.4, r * 0.1, px[i], py[i], r);
            g.addColorStop(0, nuance(f.farve, 0.45));
            g.addColorStop(1, f.farve);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(px[i], py[i], r, 0, Math.PI * 2);
            ctx.fill();
            var roedKant = a.donor && v.donorKant;
            ctx.lineWidth = roedKant ? Math.max(1.8, s * 0.1) : 1;
            ctx.strokeStyle = roedKant ? "#e2483b" : f.kant;
            ctx.stroke();
        });
        if (v.lysH) {
            var i0 = v.lysH.h, puls = 0.5 + 0.5 * Math.sin((v.tid || 0) * 6);
            ctx.strokeStyle = "rgba(242, 197, 61, 0.95)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(px[i0], py[i0], A[i0].r * s + 4 + puls * 4, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* δ+ ved H paa O og δ− ved O paa det valgte molekyle */
    T.deltaer = function (ctx, F, m, s, ox, oy) {
        var c = Math.cos(m.a), sn = Math.sin(m.a);
        var fs = NK.klamp(s * 0.62, 13, 17);
        F.atomer.forEach(function (a) {
            if (!a.donor && !a.acc) return;
            var x = ox + (m.x + a.x * c - a.y * sn) * s, y = oy + (m.y + a.x * sn + a.y * c) * s;
            var t = a.donor ? "δ+" : "δ−";
            NK.tekst(ctx, t, x + a.r * s + 2, y - a.r * s - 2, {
                font: font("800", fs), farve: a.donor ? "#b3261e" : "#1d4fa3",
                kant: true, kantFarve: "rgba(255, 255, 255, 0.95)", kantBredde: 4
            });
        });
    };

    /* Den stoerste skala, hvor molekylet kan vaere i kassen b x h */
    T.kortSkala = function (F, b, h) {
        var k = NK.Mol.kasse(F, 0);
        return Math.min(b / k.b, h / k.h, 48);
    };

    /* Et molekyle midt i en kasse b x h (til kortene paa fane 3). Den
       lange akse ligger vandret. skala: pixels pr. enhed, saa alle kort i
       en opgave har samme maalestok (stoerrelsen er en del af pointen). */
    T.kortMolekyle = function (ctx, F, cx, cy, b, h, v, skala) {
        var k = NK.Mol.kasse(F, 0);
        var s = skala || T.kortSkala(F, b, h);
        var px = [], py = [];
        F.atomer.forEach(function (a, i) {
            px[i] = cx + (a.x - k.cx) * s;
            py[i] = cy + (a.y - k.cy) * s;
        });
        T.kugler(ctx, F, px, py, s, v || { donorKant: true });
    };

    /* Stiplede linjer fra glasset til luppen (en kegle fra et lille felt i
       vaesken ud til cirklen) */
    T.zoomTilLup = function (ctx, fra, L) {
        ctx.save();
        /* Tegnes foer luppen, saa luppen daekker stregernes ende */
        var cx = fra.x + fra.b / 2, cy = fra.y + fra.h / 2;
        var v = Math.atan2(L.y - cy, L.x - cx);
        var nx = -Math.sin(v), ny = Math.cos(v);
        var p1 = { x: L.x + nx * L.r, y: L.y + ny * L.r };
        var p2 = { x: L.x - nx * L.r, y: L.y - ny * L.r };
        ctx.strokeStyle = "rgba(242, 197, 61, 0.42)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p1.x, p1.y);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(242, 197, 61, 0.75)";
        ctx.strokeRect(fra.x, fra.y, fra.b, fra.h);
        ctx.restore();
    };

    /* ----- Stemplet, naar opgaven er loest (som sc1.4) ------------------------------- */
    T.stempel = function (ctx, x, y, tekst, u) {
        var k = NK.klamp(u, 0.05, 1.08);
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(k, k);
        ctx.font = font("800", 17);
        var b = ctx.measureText(tekst).width + 30, h = 34;
        ctx.fillStyle = "rgba(20, 44, 32, 0.95)";
        NK.rundtRekt(ctx, -b / 2, -h / 2, b, h, 9);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#5fcf92";
        ctx.stroke();
        ctx.fillStyle = "#8ff0b4";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, 0, 1);
        ctx.restore();
    };

    /* En lille etiket med navn og formel (over en lup) */
    T.etiket = function (ctx, x, y, navn, under, v) {
        v = v || {};
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.font = font("700", v.px || 16);
        ctx.fillStyle = v.farve || "#e6ebf1";
        ctx.fillText(navn, x, y);
        if (under) {
            ctx.font = font("500", Math.max(12, (v.px || 16) * 0.82));
            ctx.fillStyle = "#9aa3ae";
            ctx.fillText(under, x, y + (v.px || 16) * 1.15);
        }
        ctx.restore();
    };

    NK.Tegn = T;
}());
