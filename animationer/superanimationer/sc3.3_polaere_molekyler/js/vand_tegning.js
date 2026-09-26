/* =====================================================================
   vand_tegning.js - alt, der tegnes i vandstraaleforsoeget (fane 3)

   Funktionerne tegner i scenens egne enheder: 1000 x 640 med bordet i
   y = 540. sim_vandstraale.js saetter skalaen, og tegneserie.js bruger
   de samme funktioner i mindre ruder.

   MAAL samler alle maal, saa tegning og simulation er enige om, hvor
   hanerne, tuderne og vasken er.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var S = NK.Sprites;

    var MAAL = {
        W: 1000, H: 640, BORD: 540,
        HANER: [{ vaeske: "vand", x: 290 }, { vaeske: "ethanol", x: 400 }, { vaeske: "heptan", x: 510 }],
        GREB_Y: 196,        /* hanegrebet midt paa ventilen */
        TUD_Y: 246,         /* hvor straalen kommer ud */
        SKILT_Y: 86,        /* skiltenes overkant */
        VASK: { venstre: 196, hoejre: 604, top: 466 },
        KLUD: { x: 825, y: 572, b: 150, h: 56 },
        STAV_L: 200,
        LUP: { x: 850, y: 185, r: 118 }
    };

    var T = { MAAL: MAAL };
    NK.VandTegning = T;

    T.hane = function (vaeske) {
        for (var i = 0; i < MAAL.HANER.length; i++) if (MAAL.HANER[i].vaeske === vaeske) return MAAL.HANER[i];
        return null;
    };

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

    /* ----- Haner og vask -------------------------------------------------------
       aaben: vaesken, hvis hane er aaben (eller null). fremhaev: hanen under
       musen. Grebet paa langs af tuden er aabent, paa tvaers er lukket. */
    T.haner = function (ctx, aaben, fremhaev) {
        S.tegn(ctx, "haner", 120, 60, 520, 480);

        MAAL.HANER.forEach(function (h) {
            var v = D.VAESKER[h.vaeske];
            if (fremhaev === h.vaeske) {
                NK.rundtRekt(ctx, h.x - 50, MAAL.SKILT_Y - 6, 100, 172, 10);
                ctx.fillStyle = "rgba(61, 158, 224, 0.14)";
                ctx.fill();
                ctx.strokeStyle = "rgba(242, 197, 61, 0.8)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(h.x, MAAL.GREB_Y, 25, 0, Math.PI * 2);
                ctx.stroke();
            }
            NK.tekst(ctx, stort(v.navn), h.x, MAAL.SKILT_Y + 17, { font: "700 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#2b2f36" });
            NK.tekst(ctx, NK.formel(v.formel), h.x, MAAL.SKILT_Y + 34, { font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#4a505a" });

            ctx.save();
            ctx.translate(h.x, MAAL.GREB_Y);
            ctx.rotate(aaben === h.vaeske ? Math.PI / 2 : 0);
            NK.rundtRekt(ctx, -21, -4.5, 42, 9, 4.5);
            ctx.fillStyle = "#c9602e";
            ctx.fill();
            ctx.strokeStyle = "#7d3517";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
            ctx.fillStyle = "#3b4250";
            ctx.beginPath();
            ctx.arc(h.x, MAAL.GREB_Y, 4.5, 0, Math.PI * 2);
            ctx.fill();
        });

        /* Maerkatet ved heptanhanen */
        var hep = T.hane("heptan");
        ctx.strokeStyle = "#8b8470";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(hep.x + 46, 157);
        ctx.lineTo(hep.x + 48, 178);
        ctx.stroke();
        ctx.save();
        ctx.translate(hep.x + 90, 198);
        ctx.rotate(-0.07);
        NK.rundtRekt(ctx, -50, -21, 100, 42, 5);
        ctx.fillStyle = "#efe2b4";
        ctx.fill();
        ctx.strokeStyle = "#b09c5e";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = "#3b3526";
        ctx.beginPath();
        ctx.arc(-42, -14, 2.6, 0, Math.PI * 2);
        ctx.fill();
        NK.tekst(ctx, "Kun i", 4, -7, { font: "700 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#5a4a1c" });
        NK.tekst(ctx, "animationer", 4, 10, { font: "700 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#5a4a1c" });
        ctx.restore();
    };

    T.vask = function (ctx) {
        S.tegn(ctx, "vask", 180, 456, 440, 84);
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
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.beginPath();
            pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x - 1, p.y); else ctx.moveTo(p.x - 1, p.y); });
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
        });
        ctx.restore();
    };

    /* En straale fra hanen med vaesken, der bøjer defl til siden, til brug
       i tegneserien. */
    T.boejetStraale = function (vaeske, defl) {
        var x0 = T.hane(vaeske).x;
        var pts = [];
        for (var i = 0; i <= 24; i++) {
            var t = i / 24;
            var y = MAAL.TUD_Y + t * (MAAL.VASK.top - MAAL.TUD_Y);
            pts.push({ x: x0 + defl * t * t, y: y });
        }
        return [pts];
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
            /* Runde prikker, saa gnisterne ikke ligner et plus. */
            ctx.globalAlpha = NK.klamp(g.liv, 0, 1);
            ctx.fillStyle = "#ffe58a";
            ctx.beginPath();
            ctx.arc(g.x, g.y, 2.4, 0, Math.PI * 2);
            ctx.fill();
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
        ctx.restore();

        ctx.strokeStyle = "#d6eaf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        if (tekst !== false) {
            NK.tekst(ctx, "Lup: molekylerne i strålen", cx, cy - r - 16, { font: "600 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#c8ced6", kant: true });
        }
        ctx.restore();
    };
}());
