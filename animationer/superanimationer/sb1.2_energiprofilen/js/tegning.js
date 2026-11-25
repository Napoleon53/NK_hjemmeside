/* =====================================================================
   tegning.js - tegnehjaelpere i Kemibogens stil

   Papiret (lyst ark som bogens figurer), pile, stiplede linjer, atomer
   med lys og skygge (farverne fra Kemibogen/vaerktoej/lav_figurer.py,
   KUGLE_GRAD), kuglemodellerne af NO₂, CO, NO, CO₂ og det aktiverede
   kompleks, termometeret og den gule ring om det, kortet spoerger om.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = NK.T = {};

    T.F = {
        blaek: "#14201f",
        daempet: "#556766",
        kant: "#c3d6d4",
        flade: "#e8f1ef",
        papir: "#fbfaf6",
        papirKant: "#d9d4c6",
        accent: "#0f766e",
        ea: "#c2620a",          /* aktiveringsenergien: orange som i bogen */
        afgiv: "#d64533",       /* energi, der afgives */
        optag: "#2563c9",       /* energi, der optages */
        gul: "#f2c53d",
        gulMoerk: "#c79a12"
    };

    T.SKRIFT = "'Segoe UI', Roboto, Arial, sans-serif";
    T.font = function (px, vaegt) { return (vaegt || 600) + " " + px + "px " + T.SKRIFT; };

    /* Et lyst ark med svag skygge, som tavlen i de andre animationer */
    T.papir = function (c, x, y, b, h) {
        c.save();
        c.shadowColor = "rgba(0, 0, 0, 0.35)";
        c.shadowBlur = 14;
        c.shadowOffsetY = 3;
        NK.rundtRekt(c, x, y, b, h, 12);
        c.fillStyle = T.F.papir;
        c.fill();
        c.restore();
        NK.rundtRekt(c, x, y, b, h, 12);
        c.strokeStyle = T.F.papirKant;
        c.lineWidth = 1;
        c.stroke();
    };

    /* Grafens flade: et svagt farveforloeb som bogens figurer */
    T.flade = function (c, x, y, b, h) {
        var g = c.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, "#f6f9f8");
        g.addColorStop(1, "#e9f1ef");
        c.save();
        NK.rundtRekt(c, x, y, b, h, 8);
        c.fillStyle = g;
        c.fill();
        c.restore();
    };

    /* Fyldet under en kurve: lys groenblaa, der bliver lysere nedad */
    T.fyld = function (c, top, bund) {
        var g = c.createLinearGradient(0, top, 0, bund);
        g.addColorStop(0, "rgba(15, 118, 110, 0.24)");
        g.addColorStop(1, "rgba(15, 118, 110, 0.06)");
        return g;
    };

    /* Kurvens streg: moerk med en bloed skygge */
    T.kurveStreg = function (c, bredde) {
        c.save();
        c.shadowColor = "rgba(20, 32, 31, 0.25)";
        c.shadowBlur = 4;
        c.shadowOffsetY = 2;
        c.strokeStyle = T.F.blaek;
        c.lineWidth = bredde || 3.4;
        c.lineJoin = "round";
        c.lineCap = "round";
        c.stroke();
        c.restore();
    };

    T.tekst = function (c, s, x, y, opt) {
        opt = opt || {};
        c.save();
        c.font = opt.font || T.font(opt.px || 15, opt.vaegt);
        c.textAlign = opt.just || "left";
        c.textBaseline = opt.linje || "alphabetic";
        if (opt.bund) {
            var b = c.measureText(s).width, h = (opt.px || 15) + 8;
            var x0 = opt.just === "center" ? x - b / 2 : (opt.just === "right" ? x - b : x);
            var y0 = opt.linje === "middle" ? y - h / 2 : y - h + 5;
            NK.rundtRekt(c, x0 - 6, y0, b + 12, h, 6);
            c.fillStyle = opt.bund;
            c.fill();
        }
        c.fillStyle = opt.farve || T.F.blaek;
        c.fillText(s, x, y);
        c.restore();
    };

    /* En pil fra (x1,y1) til (x2,y2). dobbelt: hoved i begge ender */
    T.pil = function (c, x1, y1, x2, y2, farve, bredde, dobbelt) {
        var v = Math.atan2(y2 - y1, x2 - x1), h = 10 + (bredde || 2.4);
        c.save();
        c.strokeStyle = farve;
        c.fillStyle = farve;
        c.lineWidth = bredde || 2.4;
        c.lineCap = "round";
        c.beginPath();
        var sx = x1 + (dobbelt ? Math.cos(v) * h * 0.8 : 0), sy = y1 + (dobbelt ? Math.sin(v) * h * 0.8 : 0);
        c.moveTo(sx, sy);
        c.lineTo(x2 - Math.cos(v) * h * 0.8, y2 - Math.sin(v) * h * 0.8);
        c.stroke();
        function hoved(x, y, vv) {
            c.beginPath();
            c.moveTo(x, y);
            c.lineTo(x - Math.cos(vv - 0.4) * h, y - Math.sin(vv - 0.4) * h);
            c.lineTo(x - Math.cos(vv + 0.4) * h, y - Math.sin(vv + 0.4) * h);
            c.closePath();
            c.fill();
        }
        hoved(x2, y2, v);
        if (dobbelt) hoved(x1, y1, v + Math.PI);
        c.restore();
    };

    T.stiplet = function (c, x1, y1, x2, y2, farve, bredde) {
        c.save();
        c.strokeStyle = farve || T.F.daempet;
        c.lineWidth = bredde || 1.2;
        c.setLineDash([5, 5]);
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
        c.restore();
    };

    /* Den gule ring om det, kortet spoerger om (regel: fremhaev det, der spoerges om) */
    T.ring = function (c, x, y, r) {
        c.save();
        c.strokeStyle = T.F.gul;
        c.lineWidth = 3.5;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.stroke();
        c.restore();
    };

    T.gulRamme = function (c, x, y, b, h) {
        c.save();
        c.strokeStyle = T.F.gul;
        c.lineWidth = 3;
        NK.rundtRekt(c, x, y, b, h, 9);
        c.stroke();
        c.restore();
    };

    /* ----- Atomer og molekyler ------------------------------------------- */
    var KUGLE = {
        C: ["#a3adb8", "#5b6573", "#2c3540", "#1c232b"],
        N: ["#c2d6fb", "#5f8ce6", "#2753bd", "#1b3f8f"],
        O: ["#ffc9bd", "#ef6f58", "#bf3923", "#8f2a1b"]
    };

    T.atom = function (c, sym, x, y, r) {
        var k = KUGLE[sym];
        var g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, k[0]);
        g.addColorStop(0.45, k[1]);
        g.addColorStop(1, k[2]);
        c.save();
        /* Bloed skygge under kuglen, som bogens kuglemodeller */
        c.shadowColor = "rgba(20, 32, 31, 0.28)";
        c.shadowBlur = r * 0.35;
        c.shadowOffsetY = r * 0.14;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fillStyle = g;
        c.fill();
        c.restore();
        c.save();
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.strokeStyle = k[3];
        c.lineWidth = 1.1;
        c.stroke();
        /* Glansen oppe til venstre */
        var gl = c.createRadialGradient(x - r * 0.42, y - r * 0.48, 0, x - r * 0.42, y - r * 0.48, r * 0.55);
        gl.addColorStop(0, "rgba(255, 255, 255, 0.75)");
        gl.addColorStop(1, "rgba(255, 255, 255, 0)");
        c.fillStyle = gl;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fill();
        c.font = T.font(Math.max(13.5, r * 1.0), 700);
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.lineWidth = 2.2;
        c.strokeStyle = "rgba(0, 0, 0, 0.25)";
        c.lineJoin = "round";
        c.strokeText(sym, x, y + 1);
        c.fillStyle = "#ffffff";
        c.fillText(sym, x, y + 1);
        c.restore();
    };

    /* Bindingen mellem to atomer: orden 1, 2 eller 3 som streger, "del" som stiplet */
    function binding(c, a, b, orden, s) {
        var dx = b.x - a.x, dy = b.y - a.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = -dy / l, ny = dx / l, af = s * 0.13;
        var forsk = orden === 2 ? [-af, af] : (orden === 3 ? [-af * 1.5, 0, af * 1.5] : [0]);
        var w = Math.max(3, s * (orden === 1 || orden === "del" ? 0.13 : 0.085));
        c.save();
        c.lineCap = "round";
        if (orden === "del") c.setLineDash([s * 0.09, s * 0.1]);
        forsk.forEach(function (f) {
            var x1 = a.x + nx * f, y1 = a.y + ny * f, x2 = b.x + nx * f, y2 = b.y + ny * f;
            /* En pind: moerk kant, lys kerne og en tynd glans */
            c.strokeStyle = "#5f6b70";
            c.lineWidth = w + 1.6;
            c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
            c.strokeStyle = "#cdd5d9";
            c.lineWidth = w;
            c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
            c.strokeStyle = "rgba(255, 255, 255, 0.85)";
            c.lineWidth = Math.max(1, w * 0.3);
            c.beginPath(); c.moveTo(x1 - nx * w * 0.2, y1 - ny * w * 0.2); c.lineTo(x2 - nx * w * 0.2, y2 - ny * w * 0.2); c.stroke();
        });
        c.restore();
    }

    /* Molekylerne: atomernes plads i bindingslaengder og bindingerne */
    var V = 67 * Math.PI / 180;   /* NO₂ er vinklet (134°) */
    var MOL = {
        "NO₂": { a: [["N", 0, 0], ["O", -Math.sin(V), Math.cos(V)], ["O", Math.sin(V), Math.cos(V)]], b: [[0, 1, 2], [0, 2, 1]] },
        "CO": { a: [["C", -0.5, 0], ["O", 0.5, 0]], b: [[0, 1, 3]] },
        "NO": { a: [["N", -0.5, 0], ["O", 0.5, 0]], b: [[0, 1, 2]] },
        "CO₂": { a: [["O", -1, 0], ["C", 0, 0], ["O", 1, 0]], b: [[0, 1, 2], [1, 2, 2]] },
        /* O=N···O···C≡O: bindingen N-O er ved at blive brudt, O-C ved at blive dannet */
        "kompleks": { a: [["O", -2.1, 0], ["N", -1.1, 0], ["O", 0, 0], ["C", 1.1, 0], ["O", 2.1, 0]], b: [[0, 1, 2], [1, 2, "del"], [2, 3, "del"], [3, 4, 3]] }
    };

    /* Bredden af et molekyle i px ved bindingslaengden s */
    T.molBredde = function (navn, s) {
        var m = MOL[navn], min = 0, maks = 0;
        m.a.forEach(function (a) { min = Math.min(min, a[1]); maks = Math.max(maks, a[1]); });
        return (maks - min) * s + s * 0.78;
    };

    T.molekyle = function (c, navn, cx, cy, s) {
        var m = MOL[navn], min = 0, maks = 0;
        m.a.forEach(function (a) { min = Math.min(min, a[1]); maks = Math.max(maks, a[1]); });
        var mid = (min + maks) / 2;
        var p = m.a.map(function (a) { return { x: cx + (a[1] - mid) * s, y: cy + a[2] * s * 0.9 }; });
        m.b.forEach(function (b) { binding(c, p[b[0]], p[b[1]], b[2], s); });
        m.a.forEach(function (a, i) { T.atom(c, a[0], p[i].x, p[i].y, s * 0.36); });
    };

    /* Det aktiverede kompleks i skarpe klammer med dobbeltkryds: [O=N···O···C≡O]‡ */
    T.kompleks = function (c, cx, cy, s) {
        T.molekyle(c, "kompleks", cx, cy, s);
        var b = T.molBredde("kompleks", s) / 2 + s * 0.22, h = s * 0.62;
        c.save();
        c.strokeStyle = T.F.blaek;
        c.lineWidth = 2;
        c.lineJoin = "miter";
        [-1, 1].forEach(function (side) {
            var x = cx + side * b;
            c.beginPath();
            c.moveTo(x - side * s * 0.16, cy - h);
            c.lineTo(x, cy - h);
            c.lineTo(x, cy + h);
            c.lineTo(x - side * s * 0.16, cy + h);
            c.stroke();
        });
        c.restore();
        T.tekst(c, "‡", cx + b + 4, cy - h + 6, { px: Math.round(s * 0.5), vaegt: 700 });
        return b + s * 0.4;
    };

    /* To molekyler med + imellem, centreret om cx. Giver bredden */
    T.par = function (c, n1, n2, cx, cy, s) {
        var b1 = T.molBredde(n1, s), b2 = T.molBredde(n2, s), plus = s * 0.9;
        var hel = b1 + plus + b2, x = cx - hel / 2;
        T.molekyle(c, n1, x + b1 / 2, cy, s);
        T.tekst(c, "+", x + b1 + plus / 2, cy + 1, { px: Math.round(s * 0.55), just: "center", linje: "middle", farve: T.F.daempet });
        T.molekyle(c, n2, x + b1 + plus + b2 / 2, cy, s);
        return hel;
    };

    /* ----- Termometeret i omgivelserne ------------------------------------
       niveau 0..1 (0,5 er udgangspunktet), farve paa vaesken */
    T.termometer = function (c, x, y, h, niveau) {
        /* Glastermometeret fra sprites/termometer.svg. Roeret (y 2-230 i figuren) er h
           hoejt; niveau 0..1 er soejlens hoejde mellem 0 °C (y 200) og 50 °C (y 40). */
        var k = h / 230;
        if (!NK.Sprites || !NK.Sprites.tegn(c, "termometer", x - 13 * k, y - 2 * k, k)) return;
        var yT = 200 - 160 * NK.klamp(niveau, 0, 1);
        var gr = c.createLinearGradient(x - 1.6 * k, 0, x + 1.6 * k, 0);
        gr.addColorStop(0, "#f08a78");
        gr.addColorStop(0.5, "#d63a26");
        gr.addColorStop(1, "#9e2617");
        c.fillStyle = gr;
        c.fillRect(x - 1.5 * k, y + (yT - 2) * k, 3 * k, (229 - yT) * k);
    };
}());
