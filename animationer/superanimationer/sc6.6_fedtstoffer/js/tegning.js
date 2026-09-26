/* =====================================================================
   tegning.js - det, begge faner tegner

   Rummet og bordet, formlerne (bindinger, atomer og kaeder med
   dobbeltbindinger), fliserne med fedtsyrerne, glasset med fedt i,
   koeleskabet, vinduet, skiltene ved stederne og zoomvinduet med
   fedtmolekylerne. Funktionerne tegner én ting et bestemt sted og
   husker intet selv; fanerne bestemmer, hvor tingene staar.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Fedt;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* ----- Farver --------------------------------------------------------- */
    function rgb(hex) {
        var h = hex.replace("#", "");
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }

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

    T.O_FARVE = "#ff7b72";
    T.C_FARVE = "#e6ebf1";
    T.H2O_FARVE = "#7cc4f2";
    T.TILSTAND_FARVE = { fast: "#a9cdf0", delvist: "#e8c65a", flydende: "#f0a04b" };

    /* ----- Rummet og bordet (som sc6.1) ------------------------------------- */
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
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(x0, y, x1 - x0, plade);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0, y, x1 - x0, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x0, y + plade, x1 - x0, 4);
    };

    /* ----- Formler -------------------------------------------------------------
       En binding fra (x1, y1) til (x2, y2), der stopper r1 og r2 foer
       atomerne, saa den ikke loeber ind i bogstaverne. */
    T.binding = function (ctx, x1, y1, x2, y2, r1, r2, lw, farve) {
        var dx = x2 - x1, dy = y2 - y1, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var ux = dx / l, uy = dy / l;
        ctx.save();
        ctx.strokeStyle = farve || T.C_FARVE;
        ctx.lineWidth = lw;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1 + ux * r1, y1 + uy * r1);
        ctx.lineTo(x2 - ux * r2, y2 - uy * r2);
        ctx.stroke();
        ctx.restore();
    };

    /* To parallelle streger (C=O) */
    T.dobbeltBinding = function (ctx, x1, y1, x2, y2, r1, r2, lw, afst, farve) {
        var dx = x2 - x1, dy = y2 - y1, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = -dy / l * afst / 2, ny = dx / l * afst / 2;
        T.binding(ctx, x1 + nx, y1 + ny, x2 + nx, y2 + ny, r1, r2, lw, farve);
        T.binding(ctx, x1 - nx, y1 - ny, x2 - nx, y2 - ny, r1, r2, lw, farve);
    };

    /* Et atom (eller en gruppe som CH₂) skrevet midt i (x, y) */
    T.atom = function (ctx, tekst, x, y, px, farve, alfa) {
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        ctx.font = font("700", px);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = farve || T.C_FARVE;
        ctx.fillText(tekst, x, y + px * 0.04);
        ctx.restore();
    };

    /* En kaede som zigzag gennem punkterne (i pixels), med den anden streg
       i dobbeltbindingerne paa indersiden af knaekket. */
    T.kaede = function (ctx, pkt, dobbelt, farve, lw, afst, alfa) {
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        ctx.strokeStyle = farve;
        ctx.lineWidth = lw;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        for (var i = 0; i < pkt.length; i++) {
            if (i) ctx.lineTo(pkt[i].x, pkt[i].y);
            else ctx.moveTo(pkt[i].x, pkt[i].y);
        }
        ctx.stroke();
        (dobbelt || []).forEach(function (k) {
            var a = pkt[k], b = pkt[k + 1];
            var side = F.dobbeltSide(pkt, k);
            var dx = b.x - a.x, dy = b.y - a.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
            var nx = -dy / l * afst * side, ny = dx / l * afst * side;
            var kort = 0.2;
            ctx.beginPath();
            ctx.moveTo(a.x + dx * kort + nx, a.y + dy * kort + ny);
            ctx.lineTo(b.x - dx * kort + nx, b.y - dy * kort + ny);
            ctx.stroke();
        });
        ctx.restore();
    };

    /* ----- Fliserne med fedtsyrerne (fane 1) ---------------------------------------
       r: { x, y, b, h }. v: { lys, graa, tid } */
    T.flise = function (ctx, r, syre, v) {
        v = v || {};
        ctx.save();
        if (v.graa) ctx.globalAlpha *= 0.45;
        ctx.fillStyle = v.lys ? "#353a47" : "#2b2f3a";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 9);
        ctx.fill();
        ctx.strokeStyle = v.lys ? syre.farve : rgba(syre.farve, 0.55);
        ctx.lineWidth = v.lys ? 2.5 : 1.5;
        ctx.stroke();
        ctx.fillStyle = syre.farve;
        NK.rundtRekt(ctx, r.x, r.y, 6, r.h, 3);
        ctx.fill();
        var px = NK.klamp(r.h * 0.19, 12, 15);
        NK.tekst(ctx, syre.Navn, r.x + 14, r.y + px + 6, { font: font("700", px), farve: "#f2f3f5" });
        var dbTekst = D.dbTekst(syre.db), dbPx = Math.max(12, px - 2);
        ctx.font = font("600", dbPx);
        if (ctx.measureText(dbTekst).width > r.b - 20) dbTekst = syre.db + (syre.db === 1 ? " dobbeltbinding" : " dobbeltbindinger");
        NK.tekst(ctx, dbTekst, r.x + 14, r.y + r.h - 9, { font: font("600", dbPx), farve: "#a9b0ba" });
        /* Kaeden som lille zigzag */
        var k = F.kaede(syre.id, 1);
        var minX = 0, maxX = 0, minY = 0, maxY = 0;
        k.pkt.forEach(function (p) {
            minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
        });
        var feltB = r.b - 28, feltH = r.h - px * 2 - 26;
        var s = Math.min(feltB / (maxX - minX), feltH / Math.max(1.4, maxY - minY));
        var ox = r.x + 16 + (feltB - (maxX - minX) * s) / 2 - minX * s;
        var oy = r.y + px + 14 + (feltH - (maxY - minY) * s) / 2 - minY * s;
        var pkt = k.pkt.map(function (p) { return { x: ox + p.x * s, y: oy + p.y * s }; });
        T.kaede(ctx, pkt, k.dobbelt, syre.farve, 2, Math.max(2.2, s * 0.22));
        ctx.restore();
    };

    /* ----- Glasset med fedt ---------------------------------------------------------
       Glasset staar med bunden midt i (x, bund) og er h pixels hoejt. */
    T.glasMaal = function (x, bund, h) {
        var M = MAAL.glas, s = h / M.h;
        return {
            x: x, bund: bund, h: h, s: s, b: M.b * s,
            venstre: x - M.b / 2 * s, top: bund - M.bund * s
        };
    };

    /* v: { fast: 0-100, farve, laag, vinkel, lys, harsk, tid, alfa, tom } */
    T.glas = function (ctx, G, v) {
        var M = MAAL.glas, s = G.s;
        v = v || {};
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= v.alfa;
        ctx.translate(G.x, G.bund);
        ctx.rotate(v.vinkel || 0);
        var ox = -M.b / 2 * s, oy = -M.bund * s;
        /* Lyset rundt om glasset, naar det kan bruges */
        if (v.lys) {
            ctx.save();
            ctx.shadowColor = "rgba(242, 197, 61, " + (0.5 + 0.5 * v.lys) + ")";
            ctx.shadowBlur = 16;
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.35 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 2.5;
            NK.rundtRekt(ctx, ox + 3 * s, oy + 11 * s, (M.b - 6) * s, (M.bund - 10) * s, 9 * s);
            ctx.stroke();
            ctx.restore();
        }
        /* Indholdet, klippet til glassets indre */
        var x0 = ox + M.indV * s, x1 = ox + M.indH * s, y0 = oy + M.indTop * s, y1 = oy + M.indBund * s;
        ctx.save();
        NK.rundtRekt(ctx, x0, y0, x1 - x0, y1 - y0, M.indR * s);
        ctx.clip();
        if (!v.tom) {
            var fyldY = y0 + (y1 - y0) * 0.22;
            var farve = v.harsk ? blandHex(v.farve, "#8a8a3a", 0.45) : v.farve;
            var fast = NK.klamp(v.fast || 0, 0, 100) / 100;
            var vinkel = v.vinkel || 0;
            /* Fast fedt foelger glasset; vaeske holder overfladen vandret */
            if (fast < 0.99) {
                ctx.save();
                ctx.translate((x0 + x1) / 2, fyldY);
                ctx.rotate(-vinkel);
                var boelge = Math.sin((v.tid || 0) * 5) * Math.min(3, Math.abs(vinkel) * 12) * s;
                ctx.fillStyle = rgba(farve, fast > 0.3 ? 0.9 : 0.72);
                ctx.beginPath();
                ctx.moveTo(-80 * s, boelge);
                ctx.quadraticCurveTo(0, -boelge, 80 * s, boelge);
                ctx.lineTo(80 * s, 120 * s);
                ctx.lineTo(-80 * s, 120 * s);
                ctx.closePath();
                ctx.fill();
                /* Overfladen */
                ctx.strokeStyle = rgba("#ffffff", 0.35);
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(-80 * s, boelge);
                ctx.quadraticCurveTo(0, -boelge, 80 * s, boelge);
                ctx.stroke();
                ctx.restore();
            }
            if (fast > 0.01) {
                /* Fast fedt: uigennemsigtigt og lysere. Er det kun delvist
                   fast, ligger krystallerne i bunden, og resten er uklart. */
                var fastFarve = blandHex(farve, "#ffffff", 0.42);
                var hoejde = fast >= 0.99 ? (y1 - fyldY) : (y1 - fyldY) * (0.25 + 0.6 * fast);
                var topY = y1 - hoejde;
                ctx.fillStyle = fastFarve;
                ctx.beginPath();
                ctx.moveTo(x0 - 2, y1 + 2);
                ctx.lineTo(x0 - 2, topY + 2 * s);
                var n = 6;
                for (var i = 0; i <= n; i++) {
                    var xx = x0 + (x1 - x0) * i / n;
                    var yy = topY + Math.sin(i * 2.3 + 1) * 1.6 * s;
                    ctx.lineTo(xx, yy);
                }
                ctx.lineTo(x1 + 2, y1 + 2);
                ctx.closePath();
                ctx.fill();
                /* Krystalstruktur */
                ctx.fillStyle = rgba("#ffffff", 0.35);
                for (var k = 0; k < 14; k++) {
                    var kx = x0 + ((k * 37) % 41) / 41 * (x1 - x0);
                    var ky = topY + 4 * s + ((k * 23) % 29) / 29 * Math.max(1, hoejde - 6 * s);
                    ctx.fillRect(kx, ky, 2 * s, 1.2 * s);
                }
                if (fast < 0.99) {
                    /* Uklare fnug i vaesken */
                    ctx.fillStyle = rgba("#ffffff", 0.25 + 0.4 * fast);
                    var antal = Math.round(6 + 30 * fast);
                    for (var j = 0; j < antal; j++) {
                        var fx = x0 + ((j * 53) % 47) / 47 * (x1 - x0);
                        var fy = fyldY + 3 * s + ((j * 31) % 37) / 37 * Math.max(1, topY - fyldY - 4 * s);
                        ctx.beginPath();
                        ctx.arc(fx, fy, 1.3 * s, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
        ctx.restore();
        /* Glasset og laaget ovenpaa */
        NK.Sprites.tegn(ctx, "glas", ox, oy, M.b * s, M.h * s);
        if (v.laag) {
            ctx.fillStyle = rgba(v.laag, 0.62);
            NK.rundtRekt(ctx, ox + 4 * s, oy + M.laagTop * s, 52 * s, (M.laagBund - M.laagTop) * s, 3 * s);
            ctx.fill();
        }
        ctx.restore();
        /* Harskt: stanken stiger op */
        if (v.harsk) T.stank(ctx, G.x, G.top - 4, v.tid || 0, s);
    };

    /* Groenne boelgede streger, der stiger op (smoersyre) */
    T.stank = function (ctx, x, y, tid, s) {
        ctx.save();
        ctx.strokeStyle = "rgba(160, 200, 70, 0.8)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        for (var i = 0; i < 3; i++) {
            var t = (tid * 0.6 + i / 3) % 1;
            var bx = x + (i - 1) * 12 * s, by = y - t * 34 * s;
            ctx.globalAlpha = Math.sin(t * Math.PI) * 0.9;
            ctx.beginPath();
            for (var k = 0; k <= 10; k++) {
                var yy = by - k * 2 * s;
                var xx = bx + Math.sin(k * 0.9 + tid * 4 + i) * 3 * s;
                if (k) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy);
            }
            ctx.stroke();
        }
        ctx.restore();
    };

    /* Navnet under et glas, med moerk kant saa det kan laeses overalt.
       Er der ikke plads (v.bredde), deles det i to linjer (v.delt). */
    T.glasNavn = function (ctx, G, tekst, v) {
        v = v || {};
        var px = NK.klamp(G.h * 0.16, 12, 14);
        ctx.font = font("700", px);
        var linjer = [tekst];
        if (v.bredde && v.delt && ctx.measureText(tekst).width > v.bredde) linjer = v.delt;
        linjer.forEach(function (l, i) {
            NK.tekst(ctx, l, G.x, G.bund + px + 5 + i * px * 1.15, {
                font: font("700", px), justering: "center", farve: v.farve || "#eef2f6",
                kant: true, kantBredde: 4, kantFarve: "rgba(12, 13, 18, 0.9)"
            });
        });
    };

    /* ----- Koeleskabet og vinduet -------------------------------------------------- */
    T.koeleskabMaal = function (x, bund, h) {
        var M = MAAL.koeleskab, s = h / M.h;
        return {
            s: s, x: x, top: bund - M.bund * s, b: M.b * s, h: M.h * s, bund: bund,
            rumV: x + M.rumV * s, rumH: x + M.rumH * s,
            fryserTop: bund - (M.bund - M.fryserTop) * s, fryserGulv: bund - (M.bund - M.fryserGulv) * s,
            koeleTop: bund - (M.bund - M.koeleTop) * s, koeleGulv: bund - (M.bund - M.koeleGulv) * s
        };
    };

    T.koeleskab = function (ctx, K) {
        NK.Sprites.tegn(ctx, "koeleskab", K.x, K.top, K.b, K.h);
    };

    T.vindueMaal = function (x, karmY, b) {
        var M = MAAL.vindue, s = b / M.b;
        return {
            s: s, x: x, b: b, h: M.h * s, top: karmY - M.karmY * s, karmY: karmY,
            karmV: x + M.karmV * s, karmH: x + M.karmH * s,
            sol: { x: x + M.solX * s, y: karmY - (M.karmY - M.solY) * s }
        };
    };

    T.vindue = function (ctx, V, tid) {
        NK.Sprites.tegn(ctx, "vindue", V.x, V.top, V.b, V.h);
        /* Solen straaler en smule */
        var r = 46 * V.s * (1 + 0.06 * Math.sin(tid * 2));
        var g = ctx.createRadialGradient(V.sol.x, V.sol.y, r * 0.2, V.sol.x, V.sol.y, r * 1.5);
        g.addColorStop(0, "rgba(255, 244, 168, 0.45)");
        g.addColorStop(1, "rgba(255, 224, 102, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(V.sol.x, V.sol.y, r * 1.5, 0, Math.PI * 2);
        ctx.fill();
    };

    /* Skiltet ved et sted: "Køleskabet  5 °C". lys: et glas holdes over */
    T.stedSkilt = function (ctx, x, y, sted, v) {
        v = v || {};
        var px = v.px || 13;
        ctx.save();
        ctx.font = font("700", px);
        var navn = sted.Navn, grad = D.gradTekst(sted.T);
        var b1 = ctx.measureText(navn).width, b2 = ctx.measureText(grad).width;
        var b = b1 + b2 + px * 2.2, h = px * 1.9;
        var x0 = v.justering === "left" ? x : x - b / 2;
        ctx.fillStyle = v.lys ? "rgba(242, 197, 61, 0.95)" : "rgba(16, 17, 24, 0.86)";
        NK.rundtRekt(ctx, x0, y - h / 2, b, h, h / 2);
        ctx.fill();
        ctx.strokeStyle = v.lys ? "#fff1b8" : "rgba(255, 255, 255, 0.18)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = v.lys ? "#1b1b21" : "#f2f3f5";
        ctx.fillText(navn, x0 + px * 0.8, y + 0.5);
        var tf = sted.T < 0 ? "#9fd3ff" : (sted.T > 30 ? "#ffcf6e" : (sted.T > 10 ? "#e6ebf1" : "#bfe3ff"));
        ctx.fillStyle = v.lys ? "#1b1b21" : tf;
        ctx.fillText(grad, x0 + px * 1.4 + b1, y + 0.5);
        ctx.restore();
        return { x: x0, y: y - h / 2, b: b, h: h };
    };

    /* Stedet lyser op, mens et glas holdes over det */
    T.zone = function (ctx, r, lys, tid) {
        if (!lys) return;
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.55 + 0.35 * Math.sin(tid * 6)) + ")";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([7, 6]);
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 10);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(242, 197, 61, 0.08)";
        ctx.fill();
        ctx.restore();
    };

    /* ----- Zoomvinduet med fedtmolekylerne -------------------------------------------
       r: { x, y, b, h } i pixels. Proeven har W x H enheder. */
    function tegnMolekyle(ctx, m, s, ox, oy, lw) {
        var ryst = m.fast ? Math.sin(m.fase * 2.3) * 0.05 : 0;
        ctx.save();
        ctx.translate(ox + (m.x + ryst) * s, oy + (m.y + ryst * 0.6) * s);
        ctx.rotate(m.a);
        ctx.scale(m.retning, 1);
        var f = m.form;
        if (f.glycerol) {
            /* Glycerol: en lodret streg med de tre (eller to) C-atomer */
            var ys = f.kaeder.map(function (k) { return k.y0 * s; });
            var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
            if (f.n < 3) y1 = y0 + 2 * F.G * s;
            ctx.strokeStyle = "#dfe6ee";
            ctx.lineWidth = lw * 1.5;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(0, y0);
            ctx.lineTo(0, y1);
            ctx.stroke();
            f.kaeder.forEach(function (k) {
                ctx.strokeStyle = "#aeb8c4";
                ctx.lineWidth = lw;
                ctx.beginPath();
                ctx.moveTo(0, k.y0 * s);
                ctx.lineTo(1.7 * s, k.y0 * s);
                ctx.stroke();
                ctx.fillStyle = T.O_FARVE;
                ctx.beginPath();
                ctx.arc(0.85 * s, k.y0 * s, Math.max(1.6, s * 0.2), 0, Math.PI * 2);
                ctx.fill();
            });
        }
        f.kaeder.forEach(function (k) {
            var syre = D.syre(k.id);
            var farve = syre ? syre.farve : "#b5c24a";
            var pkt = k.pkt.map(function (p) { return { x: p.x * s, y: p.y * s }; });
            T.kaede(ctx, pkt, k.dobbelt, farve, lw, Math.max(1.6, s * 0.2));
            if (!f.glycerol) {
                /* Fri syre: COOH-enden som en roed prik */
                ctx.fillStyle = T.O_FARVE;
                ctx.beginPath();
                ctx.arc(pkt[0].x, pkt[0].y, Math.max(2, s * 0.28), 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.restore();
    }

    T.zoomKasse = function (ctx, r, P, v) {
        v = v || {};
        var s = r.b / P.W, ox = r.x, oy = r.y;
        ctx.save();
        ctx.fillStyle = "#0e0f14";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 10);
        ctx.fill();
        ctx.save();
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 10);
        ctx.clip();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        for (var gx = r.x + s * 3; gx < r.x + r.b; gx += s * 3) {
            ctx.beginPath();
            ctx.moveTo(Math.round(gx) + 0.5, r.y);
            ctx.lineTo(Math.round(gx) + 0.5, r.y + r.h);
            ctx.stroke();
        }
        var lw = NK.klamp(s * 0.19, 1.4, 2.6);
        /* De faste foerst, saa de flydende svoemmer henover */
        P.mol.forEach(function (m) { if (m.fast) tegnMolekyle(ctx, m, s, ox, oy, lw); });
        P.mol.forEach(function (m) { if (!m.fast) tegnMolekyle(ctx, m, s, ox, oy, lw); });
        ctx.restore();

        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, " + (0.4 + 0.6 * v.lys) + ")" : "#3d4252";
        ctx.lineWidth = v.lys ? 2.5 : 2;
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 10);
        ctx.stroke();

        /* Titlen over vinduet til venstre og tilstanden til hoejre. Er
           der ikke plads til begge, falder temperaturen vaek. */
        var fs = NK.klamp(r.b * 0.033, 12, 15);
        var tt = v.tilstand ? D.TILSTANDE[v.tilstand].Navn + (v.T !== undefined ? "  " + D.gradTekst(v.T) : "") : "";
        ctx.font = font("700", fs);
        if (v.titel && tt && ctx.measureText(v.titel + tt).width + fs * 2 > r.b) tt = D.TILSTANDE[v.tilstand].Navn;
        if (v.titel) NK.tekst(ctx, v.titel, r.x + 2, r.y - 9, { font: font("700", fs), farve: "#e6ebf1" });
        if (tt) NK.tekst(ctx, tt, r.x + r.b - 2, r.y - 9, { font: font("700", fs), justering: "right", farve: T.TILSTAND_FARVE[v.tilstand] });
        ctx.restore();
        return s;
    };

    /* Forklaringen af farverne: én linje under zoomvinduet */
    T.farveForklaring = function (ctx, x, y, b, v) {
        v = v || {};
        var fs = v.px || 12;
        ctx.save();
        ctx.font = font("600", fs);
        var poster = D.SYRER.map(function (s) { return { t: s.navn, f: s.farve }; });
        if (v.smoersyre) poster.push({ t: "smørsyre", f: "#b5c24a" });
        function bredde(liste) {
            var s = 0;
            liste.forEach(function (p) { s += ctx.measureText(p.t).width + fs * 2.2; });
            return s - fs;
        }
        /* Er der ikke plads paa én linje, bliver det to */
        var linjer = bredde(poster) <= b ? [poster] : [poster.slice(0, Math.ceil(poster.length / 2)), poster.slice(Math.ceil(poster.length / 2))];
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        linjer.forEach(function (liste, n) {
            var fx = x + Math.max(0, (b - bredde(liste)) / 2), ly = y + n * fs * 1.5;
            liste.forEach(function (p) {
                ctx.strokeStyle = p.f;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(fx, ly + fs * 0.2);
                ctx.lineTo(fx + fs * 0.45, ly - fs * 0.2);
                ctx.lineTo(fx + fs * 0.9, ly + fs * 0.2);
                ctx.stroke();
                ctx.fillStyle = "#c8ced6";
                ctx.fillText(p.t, fx + fs * 1.2, ly);
                fx += ctx.measureText(p.t).width + fs * 2.2;
            });
        });
        ctx.restore();
        return linjer.length;
    };

    /* Stiplede linjer fra glasset ud til zoomvinduets hjoerner */
    T.zoomLinjer = function (ctx, fra, til) {
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        var under = fra.y > til.y + til.h;
        if (under) {
            ctx.moveTo(fra.x, fra.y);
            ctx.lineTo(til.x, til.y + til.h);
            ctx.moveTo(fra.x + fra.b, fra.y);
            ctx.lineTo(til.x + til.b, til.y + til.h);
        } else {
            var hoejre = til.x > fra.x + fra.b / 2;
            var fx = hoejre ? fra.x + fra.b : fra.x, tx = hoejre ? til.x : til.x + til.b;
            ctx.moveTo(fx, fra.y);
            ctx.lineTo(tx, til.y);
            ctx.moveTo(fx, fra.y + fra.h);
            ctx.lineTo(tx, til.y + til.h);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(242, 197, 61, 0.7)";
        ctx.strokeRect(fra.x, fra.y, fra.b, fra.h);
        ctx.restore();
    };

    /* ----- Smaa ting ----------------------------------------------------------------- */
    /* En pil, der viser, hvad der kan traekkes */
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

    T.stjerne = function (ctx, x, y, r, alfa) {
        ctx.save();
        ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
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

    /* Et vandmolekyle, der svaever: H₂O med en lille dugdraabe */
    T.vand = function (ctx, x, y, px, alfa) {
        ctx.save();
        ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        ctx.fillStyle = "rgba(124, 196, 242, 0.25)";
        ctx.beginPath();
        ctx.arc(x, y, px * 1.35, 0, Math.PI * 2);
        ctx.fill();
        NK.tekst(ctx, "H₂O", x, y + px * 0.36, { font: font("700", px), justering: "center", farve: T.H2O_FARVE });
        ctx.restore();
    };

    /* Ikonet for en tilstand til panelet, som inline-SVG */
    T.tilstandSvg = function (t) {
        var f = T.TILSTAND_FARVE[t];
        if (t === "fast") {
            return '<svg class="ikon-tilstand" viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="2" fill="' + f + '"/><rect x="4" y="5" width="4" height="2" rx="1" fill="#ffffff" opacity="0.6"/></svg>';
        }
        if (t === "delvist") {
            return '<svg class="ikon-tilstand" viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="3.5" width="11" height="10" rx="2" fill="none" stroke="' + f + '" stroke-width="1.5"/><rect x="2.5" y="8.5" width="11" height="5" rx="1.5" fill="' + f + '"/></svg>';
        }
        return '<svg class="ikon-tilstand" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 C8 1.5 3 7.5 3 10.5 A5 5 0 0 0 13 10.5 C13 7.5 8 1.5 8 1.5 Z" fill="' + f + '"/></svg>';
    };

    NK.Tegn = T;
}());
