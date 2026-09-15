/* =====================================================================
   vand_tegning.js - alt, der tegnes i vandstraaleforsoeget (fane 4)

   Funktionerne tegner i scenens egne enheder: 1000 x 640 med bordet i
   y = 540. sim_vandstraale.js saetter skalaen, og tegneserie.js bruger
   de samme funktioner i mindre ruder.

   MAAL samler alle maal, saa tegning og simulation er enige om, hvor
   hanen, spidsen og baegerglasset er.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var S = NK.Sprites;

    var MAAL = {
        W: 1000, H: 640, BORD: 540,
        TIP: { x: 390, y: 264 },
        HANE: { x: 390, y: 218 },
        BURETTE: { venstre: 381, hoejre: 399, bund: 206, nul: 30, maks: 50 },
        BAEGER: { venstre: 327, hoejre: 453, bund: 536, top: 446, pxPrML: 0.36, maks: 250 },
        FLASKER: [{ vaeske: "vand", x: 600 }, { vaeske: "ethanol", x: 690 }, { vaeske: "heptan", x: 780 }],
        FLASKE_TOP: 390,
        KLUD: { x: 825, y: 572, b: 150, h: 56 },
        STAV_L: 200,
        LUP: { x: 850, y: 185, r: 118 }
    };

    var T = { MAAL: MAAL };
    NK.VandTegning = T;

    var MINUS = "#8fcaf0";
    var PLUS = "#f39a8f";

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    /* ----- Rummet ---------------------------------------------------------- */
    T.vaeg = function (ctx, b, h) {
        var g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, "#252a32");
        g.addColorStop(1, "#191c22");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, b, h);
    };

    T.bord = function (ctx) {
        var g = ctx.createLinearGradient(0, MAAL.BORD, 0, MAAL.H);
        g.addColorStop(0, "#3a404a");
        g.addColorStop(1, "#23272e");
        ctx.fillStyle = g;
        ctx.fillRect(-3000, MAAL.BORD, 7000, 3000);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(-3000, MAAL.BORD, 7000, 2);
    };

    /* ----- Stativ, burette og hane ------------------------------------------- */
    T.burette = function (ctx, vol, vaeske, haneAaben) {
        var B = MAAL.BURETTE;
        S.tegn(ctx, "stativ", 200, 10, 220, 530);
        if (vol > 0.01 && vaeske) {
            var top = B.bund - vol / B.maks * (B.bund - B.nul);
            ctx.fillStyle = D.VAESKER[vaeske].farve;
            ctx.fillRect(B.venstre, top, B.hoejre - B.venstre, B.bund - top);
            ctx.fillRect(388, 206, 4, 50);
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.fillRect(B.venstre, top, B.hoejre - B.venstre, 1.5);
        }
        S.tegn(ctx, "burette", 370, 16, 40, 250);

        /* Hanegrebet: paa langs af buretten er aaben, paa tvaers er lukket. */
        ctx.save();
        ctx.translate(MAAL.HANE.x, MAAL.HANE.y);
        ctx.rotate(haneAaben ? Math.PI / 2 : 0);
        NK.rundtRekt(ctx, -19, -4, 38, 8, 4);
        ctx.fillStyle = "#c9602e";
        ctx.fill();
        ctx.strokeStyle = "#7d3517";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = "#3b4250";
        ctx.beginPath();
        ctx.arc(MAAL.HANE.x, MAAL.HANE.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
    };

    /* ----- Baegerglasset ----------------------------------------------------
       Vand og ethanol blandes; heptan laegger sig ovenpaa. */
    T.baeger = function (ctx, indhold) {
        var B = MAAL.BAEGER;
        var vandig = (indhold.vand || 0) + (indhold.ethanol || 0);
        var heptan = indhold.heptan || 0;
        var y = B.bund, h;
        if (vandig > 0.2) {
            h = vandig * B.pxPrML;
            ctx.fillStyle = (indhold.ethanol || 0) > (indhold.vand || 0) ? D.VAESKER.ethanol.farve : D.VAESKER.vand.farve;
            ctx.fillRect(B.venstre, y - h, B.hoejre - B.venstre, h);
            y -= h;
        }
        if (heptan > 0.2) {
            h = heptan * B.pxPrML;
            ctx.fillStyle = D.VAESKER.heptan.farve;
            ctx.fillRect(B.venstre, y - h, B.hoejre - B.venstre, h);
            if (vandig > 0.2) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
                ctx.fillRect(B.venstre, y - 1, B.hoejre - B.venstre, 2);
            }
            y -= h;
        }
        if (y < B.bund) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.fillRect(B.venstre, y, B.hoejre - B.venstre, 1.5);
        }
        S.tegn(ctx, "baegerglas", 315, 440, 150, 100);
    };

    /* ----- Flasker og klud --------------------------------------------------- */
    T.flasker = function (ctx, fremhaev) {
        MAAL.FLASKER.forEach(function (f) {
            if (fremhaev === f.vaeske) {
                NK.rundtRekt(ctx, f.x - 46, MAAL.FLASKE_TOP - 6, 92, 160, 10);
                ctx.fillStyle = "rgba(61, 158, 224, 0.14)";
                ctx.fill();
            }
            S.tegn(ctx, "flaske", f.x - 40, MAAL.FLASKE_TOP, 80, 150);
            var v = D.VAESKER[f.vaeske];
            NK.tekst(ctx, stort(v.navn), f.x, MAAL.FLASKE_TOP + 94, { font: "700 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#2b2f36" });
            NK.tekst(ctx, NK.formel(v.formel), f.x, MAAL.FLASKE_TOP + 110, { font: "600 12px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#4a505a" });
        });
    };

    T.klud = function (ctx) {
        S.tegn(ctx, "uldklud", MAAL.KLUD.x, MAAL.KLUD.y, MAAL.KLUD.b, MAAL.KLUD.h);
    };

    /* ----- Straalen ------------------------------------------------------------
       stykker: lister af punkter, der hver tegnes som én sammenhaengende straale. */
    T.straale = function (ctx, stykker, farve) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        stykker.forEach(function (pts) {
            if (!pts.length) return;
            if (pts.length === 1) {
                ctx.fillStyle = farve;
                ctx.beginPath();
                ctx.arc(pts[0].x, pts[0].y, 2.6, 0, Math.PI * 2);
                ctx.fill();
                return;
            }
            ctx.beginPath();
            pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
            ctx.strokeStyle = farve;
            ctx.lineWidth = 4.4;
            ctx.stroke();
            ctx.beginPath();
            pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x - 1, p.y); else ctx.moveTo(p.x - 1, p.y); });
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
        });
        ctx.restore();
    };

    /* En straale, der bøjer defl til siden, til brug i tegneserien. */
    T.boejetStraale = function (defl) {
        var pts = [];
        for (var i = 0; i <= 24; i++) {
            var t = i / 24;
            var y = MAAL.TIP.y + t * (MAAL.BAEGER.top - MAAL.TIP.y);
            pts.push({ x: MAAL.TIP.x + defl * t * t, y: y });
        }
        return [pts];
    };

    T.pytter = function (ctx, pytter) {
        pytter.forEach(function (p) {
            var r = Math.min(70, 8 + Math.sqrt(p.vol) * 9);
            ctx.fillStyle = D.VAESKER[p.vaeske].farve;
            ctx.beginPath();
            ctx.ellipse(p.x, MAAL.BORD + 3, r, 3 + r * 0.06, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    /* ----- Stavene -------------------------------------------------------------
       stav: { sprite, tip: {x, y}, vinkel, ladning, tegn } */
    T.stav = function (ctx, st) {
        if (st.ladning > 0.15) {
            var g = ctx.createRadialGradient(st.tip.x, st.tip.y, 0, st.tip.x, st.tip.y, 34);
            g.addColorStop(0, st.tegn < 0 ? "rgba(143, 202, 240, " + (st.ladning * 0.4).toFixed(3) + ")" : "rgba(243, 154, 143, " + (st.ladning * 0.4).toFixed(3) + ")");
            g.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(st.tip.x, st.tip.y, 34, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.save();
        ctx.translate(st.tip.x, st.tip.y);
        ctx.rotate(st.vinkel);
        S.tegn(ctx, st.sprite, 0, -7, MAAL.STAV_L, 14);
        var n = Math.round(st.ladning * 7);
        for (var k = 0; k < n; k++) {
            NK.tekst(ctx, st.tegn < 0 ? "−" : "+", 14 + k * 17, -17, {
                font: "800 16px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: st.tegn < 0 ? MINUS : PLUS, kant: true, kantBredde: 3
            });
        }
        ctx.restore();
    };

    T.gnister = function (ctx, gnister) {
        ctx.save();
        gnister.forEach(function (g) {
            ctx.globalAlpha = NK.klamp(g.liv, 0, 1);
            ctx.strokeStyle = "#ffe58a";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(g.x - 4, g.y);
            ctx.lineTo(g.x + 4, g.y);
            ctx.moveTo(g.x, g.y - 4);
            ctx.lineTo(g.x, g.y + 4);
            ctx.stroke();
        });
        ctx.restore();
    };

    /* ----- Molekylerne i luppen ----------------------------------------------- */
    function kugle(ctx, x, y, r, lys, moerk) {
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, lys);
        g.addColorStop(1, moerk);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    function rot(v, a) {
        var c = Math.cos(a), s = Math.sin(a);
        return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
    }

    /* theta er retningen mod molekylets negative ende (O). */
    T.vandMolekyle = function (ctx, x, y, theta, k) {
        var d = { x: Math.cos(theta), y: Math.sin(theta) };
        var o = { x: x + d.x * 3 * k, y: y + d.y * 3 * k };
        [52, -52].forEach(function (grad) {
            var h = rot({ x: -d.x, y: -d.y }, grad * Math.PI / 180);
            kugle(ctx, o.x + h.x * 10 * k, o.y + h.y * 10 * k, 5.5 * k, "#ffffff", "#9aa3ae");
        });
        kugle(ctx, o.x, o.y, 9 * k, "#ffa396", "#a8281b");
    };

    T.ethanolMolekyle = function (ctx, x, y, theta, k) {
        var d = { x: Math.cos(theta), y: Math.sin(theta) };
        var o = { x: x + d.x * 8 * k, y: y + d.y * 8 * k };
        kugle(ctx, o.x - d.x * 28 * k, o.y - d.y * 28 * k, 8.5 * k, "#8d95a1", "#1d2127");
        kugle(ctx, o.x - d.x * 15 * k, o.y - d.y * 15 * k, 8.5 * k, "#8d95a1", "#1d2127");
        var h = rot(d, 75 * Math.PI / 180);
        kugle(ctx, o.x + h.x * 9 * k, o.y + h.y * 9 * k, 4.8 * k, "#ffffff", "#9aa3ae");
        kugle(ctx, o.x, o.y, 7.5 * k, "#ffa396", "#a8281b");
    };

    T.heptanMolekyle = function (ctx, x, y, theta, k) {
        var d = { x: Math.cos(theta), y: Math.sin(theta) };
        var n = { x: -d.y, y: d.x };
        for (var j = 0; j < 7; j++) {
            var t = (j - 3) * 7.5 * k, z = (j % 2 ? 3 : -3) * k;
            kugle(ctx, x + d.x * t + n.x * z, y + d.y * t + n.y * z, 5 * k, "#8d95a1", "#1d2127");
        }
    };

    /* Luppen: et udsnit af straalen ved stavens spids. styrke 0-1 er,
       hvor meget staven traekker lige nu. */
    T.lup = function (ctx, cx, cy, r, vaeske, tegn, styrke, tid, alfa, tekst) {
        var v = D.VAESKER[vaeske];
        if (!v) return;
        ctx.save();
        ctx.globalAlpha = alfa;

        ctx.strokeStyle = "#8b929c";
        ctx.lineWidth = 13;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx + r * 0.72, cy + r * 0.72);
        ctx.lineTo(cx + r * 1.08, cy + r * 1.08);
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(12, 14, 20, 0.94)";
        ctx.fill();
        ctx.clip();

        /* Stavens spids i venstre side */
        var kant = cx - r * 0.58;
        NK.rundtRekt(ctx, cx - r - 20, cy - 17, kant - (cx - r - 20), 34, 16);
        ctx.fillStyle = tegn < 0 ? "#3a3f4a" : "rgba(188, 217, 238, 0.55)";
        ctx.fill();
        for (var s = 0; s < 3; s++) {
            NK.tekst(ctx, tegn < 0 ? "−" : "+", kant - 14, cy - 34 + s * 34, {
                font: "800 18px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: tegn < 0 ? MINUS : PLUS, kant: true, kantBredde: 3
            });
        }

        /* Polaere molekyler vender den modsat ladede ende mod staven:
           en negativ stav faar H-enden, en positiv faar O-enden. */
        var maal = tegn < 0 ? 0 : Math.PI;
        var ret = NK.klamp(styrke * v.pol * 1.5, 0, 1);
        for (var i = 0; i < 10; i++) {
            var raekke = Math.floor(i / 2), kolonne = i % 2;
            var x = cx + r * 0.05 + kolonne * 46 - ret * 10 + (raekke % 2) * 12;
            var y = cy - 74 + raekke * 37;
            var uro = Math.sin(i * 2.39 + tid * (0.7 + (i % 3) * 0.3)) * Math.PI;
            var theta = maal + (1 - ret) * uro;
            if (vaeske === "vand") T.vandMolekyle(ctx, x, y, theta, 1);
            else if (vaeske === "ethanol") T.ethanolMolekyle(ctx, x, y, theta, 0.85);
            else T.heptanMolekyle(ctx, x, y, i * 1.3 + tid * 0.4, 0.85);
        }
        if (tekst !== false) {
            NK.tekst(ctx, "Molekylerne i strålen", cx + 10, cy + r - 16, { font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#c8ced6" });
        }
        ctx.restore();

        ctx.strokeStyle = "#d6eaf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };
}());
