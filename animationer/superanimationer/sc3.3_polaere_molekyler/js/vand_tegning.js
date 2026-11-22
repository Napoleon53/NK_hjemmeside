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
        LUP: { x: 828, y: 200, r: 162 }
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
        /* Maerkatet "Kun i animationer" ved heptanhanen er vaek (Niels 22. nov. 2026) */
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

    /* Molekylerne i luppen (Niels 22. nov. 2026: "tydeligere hvor δ+ og δ−
       er på mikroplanen", og ethanol var svaer at forstaa). Hvert atom har
       sit symbol, og de polaere molekyler har δ+ og δ− ved enderne
       (REGELSAET 24, 45). Ethanol tegnes som skeletformlen: C, C, O og
       H'et i OH-gruppen. theta er retningen mod molekylets negative ende
       (O), og H'et i OH-gruppen peger den modsatte vej. */
    var LEX = "Lexend, 'Segoe UI', sans-serif";
    var ATOMFARVE = {
        O: ["#ffa396", "#a8281b", "#ffffff"],
        H: ["#ffffff", "#9aa3ae", "#2b2f36"],
        C: ["#8d95a1", "#1d2127", "#ffffff"]
    };
    /* CH₃ og CH₂ som én kugle med formlen inde, som paa skiltet (C₂H₅OH) */
    var TEKST = { CH3: "CH₃", CH2: "CH₂" };

    function atom(ctx, p, el, r) {
        var f = ATOMFARVE[el] || ATOMFARVE.C;
        kugle(ctx, p.x, p.y, r, f[0], f[1]);
        var gruppe = !!TEKST[el];
        NK.tekst(ctx, TEKST[el] || el, p.x, p.y + 0.5, { font: "500 " + Math.max(13.5, r * (gruppe ? 0.78 : 1.05)).toFixed(1) + "px " + LEX, justering: "center", linje: "middle", farve: f[2] });
    }

    function delta(ctx, p, tegn) {
        NK.tekst(ctx, tegn > 0 ? "δ+" : "δ−", p.x, p.y, {
            font: "500 15px " + LEX, justering: "center", linje: "middle",
            farve: tegn > 0 ? PLUS : MINUS, kant: true, kantFarve: "rgba(8, 10, 16, 0.95)", kantBredde: 4
        });
    }

    function plus(a, v, l) { return { x: a.x + v.x * l, y: a.y + v.y * l }; }

    /* Tegner atomerne, saa molekylets midte ligger i (x, y) */
    function tegnMolekyle(ctx, x, y, atomer, deltaer) {
        var mx = 0, my = 0;
        atomer.forEach(function (a) { mx += a.p.x; my += a.p.y; });
        mx = x - mx / atomer.length; my = y - my / atomer.length;
        function flyt(p) { return { x: p.x + mx, y: p.y + my }; }
        atomer.forEach(function (a) { atom(ctx, flyt(a.p), a.el, a.r); });
        (deltaer || []).forEach(function (d) { delta(ctx, flyt(d.p), d.t); });
    }

    T.vandMolekyle = function (ctx, x, y, theta, k) {
        var d = { x: Math.cos(theta), y: Math.sin(theta) }, o = { x: 0, y: 0 };
        var h1 = plus(o, rot({ x: -d.x, y: -d.y }, 52 * Math.PI / 180), 19 * k);
        var h2 = plus(o, rot({ x: -d.x, y: -d.y }, -52 * Math.PI / 180), 19 * k);
        tegnMolekyle(ctx, x, y,
            [{ p: h1, el: "H", r: 8.5 * k }, { p: h2, el: "H", r: 8.5 * k }, { p: o, el: "O", r: 12 * k }],
            [{ p: plus(o, d, 23 * k), t: -1 }, { p: plus(o, d, -33 * k), t: 1 }]);
    };

    T.ethanolMolekyle = function (ctx, x, y, theta, k) {
        var d = { x: Math.cos(theta), y: Math.sin(theta) }, o = { x: 0, y: 0 };
        var mod = { x: -d.x, y: -d.y };
        var h = plus(o, mod, 19 * k);
        var u1 = rot(mod, 96 * Math.PI / 180);
        var c1 = plus(o, u1, 29 * k);
        var c2 = plus(c1, rot(u1, -62 * Math.PI / 180), 31 * k);
        tegnMolekyle(ctx, x, y,
            [{ p: c2, el: "CH3", r: 15 * k }, { p: c1, el: "CH2", r: 15 * k }, { p: h, el: "H", r: 8.5 * k }, { p: o, el: "O", r: 12 * k }],
            [{ p: plus(o, rot(d, -0.55), 25 * k), t: -1 }, { p: plus(h, mod, 19 * k), t: 1 }]);
    };

    T.heptanMolekyle = function (ctx, x, y, theta, k) {
        var d = { x: Math.cos(theta), y: Math.sin(theta) };
        var n = { x: -d.y, y: d.x };
        var atomer = [];
        for (var j = 0; j < 7; j++) {
            var t = (j - 3) * 25 * k, z = (j % 2 ? 7 : -7) * k;
            atomer.push({ p: { x: d.x * t + n.x * z, y: d.y * t + n.y * z }, el: j === 0 || j === 6 ? "CH3" : "CH2", r: 14 * k });
        }
        tegnMolekyle(ctx, x, y, atomer, []);
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
        /* Faa, store molekyler, der staar roligt (REGELSAET 25-26) */
        var ret = NK.klamp(styrke * v.pol * 2.2, 0, 1);
        var k = r / 162 * 1.15;
        var PLADS = vaeske === "heptan"
            ? [[0.22, -0.5], [0.24, 0], [0.22, 0.5]]
            : [[0.08, -0.4], [0.58, -0.32], [0.1, 0.36], [0.6, 0.42]];
        PLADS.forEach(function (pl, i) {
            var x = cx + pl[0] * r - ret * 8 * k, y = cy + pl[1] * r;
            var uro = Math.sin(i * 2.39 + tid * (0.3 + (i % 3) * 0.12)) * Math.PI;
            var theta = maal + (1 - ret) * uro;
            if (vaeske === "vand") T.vandMolekyle(ctx, x, y, theta, k);
            else if (vaeske === "ethanol") T.ethanolMolekyle(ctx, x, y, theta, k);
            else T.heptanMolekyle(ctx, x, y, 0.25 * Math.sin(i * 1.7 + tid * 0.25), k * 0.82);
        });
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
