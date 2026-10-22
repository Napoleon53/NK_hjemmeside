/* =====================================================================
   tegning.js - det, flere faner tegner ens

   Farver og skrift, de smaa maerkater og skilte (fra sc7.5), kugler med
   lys og skygge, molekylerne (CO, H2O, CO2, H2, O2, Hb og HbO2),
   signaturen med stofferne, tallinjen med Y og K (som figur 1 i
   Kemibogens afsnit B2.4), reaktionsbroeken med rigtig broekstreg,
   knapper paa laerredet og kroppen paa fane 2 (lungerne, musklen,
   blodaarerne og bjergene).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    T.GUL = "#f2c53d";
    /* Tallinjens farver: K er bogens groenne, Y < K orange og Y > K lilla
       (som figur 1 i B2.4, lysere, fordi scenen er moerk) */
    T.K_FARVE = "#3cc2b2";
    T.HOEJRE = "#f0a04b";
    T.VENSTRE = "#b496f0";
    T.TEKST = "#e9eef4";
    T.MAT = "#8d95a3";

    /* ----- Fra sc7.5: maerkat, ringe og skilt -------------------------------- */
    T.maerkat = function (ctx, tekst, x, y, valg) {
        valg = valg || {};
        ctx.save();
        ctx.font = font("700", valg.px || 13);
        var b = ctx.measureText(tekst).width + 16, h = (valg.px || 13) + 10;
        var vx = valg.justering === "left" ? x : (valg.justering === "right" ? x - b : x - b / 2);
        NK.rundtRekt(ctx, vx, y - h / 2, b, h, h / 2);
        ctx.fillStyle = valg.bund || "rgba(14, 15, 21, 0.82)";
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = valg.farve || "#cfd6de";
        ctx.fillText(tekst, vx + b / 2, y + 0.5);
        ctx.restore();
        return { x: vx, y: y - h / 2, b: b, h: h };
    };

    /* En rolig gul ring om det, teksten paa kortet handler om */
    T.omRing = function (ctx, x, y, b, h, r) {
        ctx.save();
        NK.rundtRekt(ctx, x - 9, y - 9, b + 18, h + 18, (r || 14) + 2);
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.22)";
        ctx.stroke();
        NK.rundtRekt(ctx, x - 6, y - 6, b + 12, h + 12, r || 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#f2c53d";
        ctx.stroke();
        ctx.restore();
    };

    /* En gul ring, der pulserer, om det, der skal klikkes paa */
    T.ring = function (ctx, x, y, b, h, tid, r) {
        var puls = 0.5 + 0.5 * Math.sin(tid * 4.2);
        ctx.save();
        NK.rundtRekt(ctx, x - 4 - puls * 3, y - 4 - puls * 3, b + 8 + puls * 6, h + 8 + puls * 6, r || 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.55 + 0.4 * puls) + ")";
        ctx.stroke();
        ctx.restore();
    };

    /* Et lille gult skilt med en spids nedad: hvad et klik goer */
    T.skilt = function (ctx, tekst, x, y, minX, maxX) {
        ctx.save();
        ctx.font = font("700", 14);
        var b = ctx.measureText(tekst).width + 22, h = 28;
        var vx = x - b / 2;
        if (minX !== undefined) vx = NK.klamp(vx, minX, Math.max(minX, maxX - b));
        NK.rundtRekt(ctx, vx, y - h, b, h, 8);
        ctx.fillStyle = "#ffdf6b";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 7, y - 1);
        ctx.lineTo(x + 7, y - 1);
        ctx.lineTo(x, y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#33290a";
        ctx.fillText(tekst, vx + b / 2, y - h / 2 + 0.5);
        ctx.restore();
    };

    /* ----- Kugler med lys og skygge ---------------------------------------------
       Farverne: lys, mellem, moerk og kant. Atomernes farver er Kemibogens
       (H hvid, O roed, C graa). */
    var KUGLE = {
        H: ["#ffffff", "#e9eef0", "#a9b6b8", "#7f8c8e"],
        O: ["#ff9a86", "#e5533d", "#a93226", "#7c2219"],
        C: ["#9aa3ae", "#4b5563", "#262d38", "#151a22"],
        Hb: ["#b46a86", "#6e2346", "#3d1028", "#2a0a1b"],
        HbO2: ["#ff9a8c", "#d8343c", "#8e1622", "#5e0d16"]
    };
    T.KUGLE = KUGLE;

    T.kugle = function (ctx, x, y, r, slags, alfa) {
        var f = KUGLE[slags] || KUGLE.C;
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha = alfa;
        var g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r);
        g.addColorStop(0, f[0]);
        g.addColorStop(0.45, f[1]);
        g.addColorStop(1, f[2]);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = Math.max(0.8, r * 0.09);
        ctx.strokeStyle = f[3];
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Molekylerne -------------------------------------------------------------
       Kalottemodeller: atomerne sidder delvist ind i hinanden. v er vinklen,
       k skalaen. Lyset kommer altid fra oeverst til venstre, saa atomernes
       pladser drejes, ikke tegningen. */
    var R = { H: 5.4, O: 8.6, C: 8.2 };
    var FORM = {
        CO: [["C", -5.2, 0], ["O", 5.6, 0]],
        H2O: [["O", 0, -1.5], ["H", -7.6, 4.6], ["H", 7.6, 4.6]],
        CO2: [["O", -11.6, 0], ["O", 11.6, 0], ["C", 0, 0]],
        H2: [["H", -4.4, 0], ["H", 4.4, 0]],
        O2: [["O", -5.2, 0], ["O", 5.2, 0]]
    };
    T.FORM = FORM;

    T.molekyle = function (ctx, slags, x, y, v, k, alfa) {
        k = k || 1;
        v = v || 0;
        if (slags === "Hb" || slags === "HbO2") { T.hb(ctx, x, y, k, slags === "HbO2", alfa, v); return; }
        var dele = FORM[slags];
        if (!dele) return;
        var c = Math.cos(v), s = Math.sin(v);
        var punkter = dele.map(function (d) {
            return { a: d[0], x: x + (d[1] * c - d[2] * s) * k, y: y + (d[1] * s + d[2] * c) * k };
        });
        /* H2O: brintatomerne bagved ilten, saa vinklen kan ses */
        if (slags === "H2O") punkter = [punkter[1], punkter[2], punkter[0]];
        punkter.forEach(function (p) { T.kugle(ctx, p.x, p.y, R[p.a] * k, p.a, alfa); });
    };

    /* Hb: en stor kugle (proteinet med hem-gruppen). HbO2 er lysere roed og
       har et O2 siddende paa. */
    T.hb = function (ctx, x, y, k, medO2, alfa, v) {
        var r = 13 * k;
        T.kugle(ctx, x, y, r, medO2 ? "HbO2" : "Hb", alfa);
        if (medO2) {
            var vv = (v || 0) * 0.2 - 0.75;
            T.molekyle(ctx, "O2", x + Math.cos(vv) * r * 0.98, y + Math.sin(vv) * r * 0.98, vv + Math.PI / 2, k * 0.78, alfa);
        }
    };

    /* Ikonets bredde i signaturen */
    T.ikonBredde = function (slags, k) {
        k = k || 1;
        return ({ CO: 25, H2O: 27, CO2: 41, H2: 20, O2: 22, Hb: 28, HbO2: 34 }[slags] || 24) * k;
    };

    /* ----- Signaturen: stofferne som maerker med ikon og formel ------------------
       punkter: [{ slags, tekst }]. Midten staar i x. Giver maerkernes felter
       tilbage, saa et klik kan forklare stoffet. */
    T.signatur = function (ctx, x, y, punkter, maxB) {
        var trin = [{ px: 15, k: 0.9, luft: 10, mellem: 8 }, { px: 14, k: 0.8, luft: 8, mellem: 6 }, { px: 13, k: 0.72, luft: 6, mellem: 4 }];
        var m, b, i, felter = [];
        ctx.save();
        for (i = 0; i < trin.length; i++) {
            m = trin[i];
            ctx.font = font("700", m.px);
            b = m.mellem * (punkter.length - 1);
            punkter.forEach(function (p) { b += m.luft * 2 + T.ikonBredde(p.slags, m.k) + 7 + ctx.measureText(p.tekst).width; });
            if (!maxB || b <= maxB) break;
        }
        var h = Math.max(m.px + 15, 30 * m.k + 6), cx = x - b / 2;
        punkter.forEach(function (p) {
            ctx.font = font("700", m.px);
            var ib = T.ikonBredde(p.slags, m.k), tb = ctx.measureText(p.tekst).width;
            var fb = m.luft * 2 + ib + 7 + tb;
            NK.rundtRekt(ctx, cx, y - h / 2, fb, h, h / 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "#4d5364";
            ctx.stroke();
            T.molekyle(ctx, p.slags, cx + m.luft + ib / 2, y, 0, m.k);
            ctx.font = font("700", m.px);
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(p.tekst, cx + m.luft + ib + 7, y + 0.5);
            felter.push({ slags: p.slags, x: cx, y: y - h / 2, b: fb, h: h });
            cx += fb + m.mellem;
        });
        ctx.restore();
        return felter;
    };

    T.feltVed = function (felter, pt) {
        for (var i = 0; felter && i < felter.length; i++) {
            var f = felter[i];
            if (pt.x >= f.x && pt.x <= f.x + f.b && pt.y >= f.y && pt.y <= f.y + f.h) return f;
        }
        return null;
    };

    /* ----- Tal med dansk komma ------------------------------------------------- */
    /* Koncentration med to decimaler: 0,20 M */
    T.konc = function (c) {
        return (Math.round(c * 100) / 100).toFixed(2).replace(".", ",") + " M";
    };

    /* Y med to betydende cifre: 9,0 · 0,50 · 0 · ∞ */
    T.yTal = function (y) {
        if (y === Infinity) return "∞";
        if (!isFinite(y)) return "–";
        if (y < 1e-9) return "0";
        return NK.betydende(y, 2);
    };

    /* ----- Tallinjen ---------------------------------------------------------------
       Som figur 1 i B2.4: K i midten, Y < K til venstre (reaktionen gaar mod
       hoejre), Y > K til hoejre (mod venstre). Skalaen er logaritmisk med en
       tierpotens til hver side, saa Y = K/2 og Y = 2K ligger lige langt fra K.
       opt: K (tal), Ktekst, Y (tal eller null = skjult), yTekst (tekst over
       punktet), foer (et Y foer indgrebet, tegnes som en tom, stiplet ring), maal
       (pil fra Y mod K, mens reaktionen gaar), skjulOmraader. Giver
       pladserne tilbage. */
    T.YPOS = function (Y, K) {
        if (Y === Infinity) return 1;
        if (!(Y > 0)) return 0;
        var p = 0.5 + Math.log(Y / K) / Math.LN10 / 2.4;
        return NK.klamp(p, 0, 1);
    };

    T.tallinje = function (ctx, x, y, w, opt) {
        var xK = x + w / 2;
        function px(Y) { return x + 12 + T.YPOS(Y, opt.K) * (w - 24); }
        ctx.save();
        /* Linjen med de to ender */
        ctx.lineCap = "round";
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = "#6f7787";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
        NK.tekst(ctx, "← lille Y", x, y - 33, { font: font("600", 12.5), farve: T.MAT });
        NK.tekst(ctx, "stor Y →", x + w, y - 33, { font: font("600", 12.5), farve: T.MAT, justering: "right" });

        /* Omraaderne under linjen med retningen */
        if (!opt.skjulOmraader) {
            var a1 = x + w * 0.1, a2 = xK - w * 0.1;
            ctx.strokeStyle = T.HOEJRE;
            ctx.fillStyle = T.HOEJRE;
            ctx.lineWidth = 2.4;
            ctx.beginPath(); ctx.moveTo(a1, y + 17); ctx.lineTo(a2 - 8, y + 17); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(a2, y + 17); ctx.lineTo(a2 - 10, y + 12); ctx.lineTo(a2 - 10, y + 22); ctx.closePath(); ctx.fill();
            NK.tekst(ctx, "Y < K: reaktionen går mod højre", (a1 + a2) / 2, y + 38, { font: font("700", 13), farve: T.HOEJRE, justering: "center" });
            var b1 = xK + w * 0.1, b2 = x + w * 0.9;
            ctx.strokeStyle = T.VENSTRE;
            ctx.fillStyle = T.VENSTRE;
            ctx.beginPath(); ctx.moveTo(b1 + 8, y + 17); ctx.lineTo(b2, y + 17); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(b1, y + 17); ctx.lineTo(b1 + 10, y + 12); ctx.lineTo(b1 + 10, y + 22); ctx.closePath(); ctx.fill();
            NK.tekst(ctx, "Y > K: reaktionen går mod venstre", (b1 + b2) / 2, y + 38, { font: font("700", 13), farve: T.VENSTRE, justering: "center" });
        }

        /* K: maerket staar i en raekke over Y's, saa de aldrig skriver oven i hinanden */
        ctx.strokeStyle = T.K_FARVE;
        ctx.lineWidth = 3.4;
        ctx.beginPath(); ctx.moveTo(xK, y - 27); ctx.lineTo(xK, y + 11); ctx.stroke();
        NK.tekst(ctx, opt.Ktekst ? "K = " + opt.Ktekst : "K", xK, y - 33, { font: font("800", 15), farve: T.K_FARVE, justering: "center" });

        /* Y foer indgrebet: en tom ring */
        if (opt.foer !== undefined && opt.foer !== null) {
            var xf = px(opt.foer);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(233, 238, 244, 0.55)";
            ctx.setLineDash([3, 3]);
            ctx.beginPath(); ctx.arc(xf, y, 8, 0, Math.PI * 2); ctx.stroke();
            ctx.setLineDash([]);
        }

        var ud = { x: x, y: y, w: w, xK: xK, yY: null };
        if (opt.Y !== undefined && opt.Y !== null && !isNaN(opt.Y)) {
            var xY = px(opt.Y);
            ud.yY = xY;
            /* Pilen fra Y mod K, mens reaktionen gaar */
            if (opt.maal && Math.abs(xY - xK) > 16) {
                var mod = xK > xY ? 1 : -1;
                ctx.strokeStyle = mod > 0 ? T.HOEJRE : T.VENSTRE;
                ctx.fillStyle = ctx.strokeStyle;
                ctx.lineWidth = 3;
                ctx.setLineDash([6, 5]);
                ctx.beginPath(); ctx.moveTo(xY + mod * 11, y); ctx.lineTo(xK - mod * 14, y); ctx.stroke();
                ctx.setLineDash([]);
                ctx.beginPath(); ctx.moveTo(xK - mod * 5, y); ctx.lineTo(xK - mod * 15, y - 6); ctx.lineTo(xK - mod * 15, y + 6); ctx.closePath(); ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(xY, y, 8.5, 0, Math.PI * 2);
            ctx.fillStyle = "#f4f6f8";
            ctx.fill();
            ctx.lineWidth = 2.4;
            ctx.strokeStyle = "#14141a";
            ctx.stroke();
            var yt = opt.yTekst || "Y";
            var jus = xY < x + 40 ? "left" : (xY > x + w - 40 ? "right" : "center");
            /* Y's maerke staar lige over punktet. Er Y naer K, flyttes det lidt
               til siden, saa K's lodrette streg ikke gaar igennem teksten. */
            var tx = xY;
            if (Math.abs(xY - xK) < 46 && jus === "center") { jus = xY < xK ? "right" : "left"; tx = xY < xK ? Math.min(xY + 4, xK - 7) : Math.max(xY - 4, xK + 7); }
            NK.tekst(ctx, yt, tx, y - 14, { font: font("800", 15), farve: "#ffffff", justering: jus });
        }
        ctx.restore();
        return ud;
    };

    /* ----- Reaktionsbroeken paa laerredet --------------------------------------------
       venstre: "Y =", over og under som tekst. Giver bredden tilbage. */
    T.broek = function (ctx, x, y, venstre, over, under, opt) {
        opt = opt || {};
        var px = opt.px || 16;
        ctx.save();
        ctx.font = font("700", px);
        var bv = ctx.measureText(venstre + " ").width;
        var bo = ctx.measureText(over).width, bu = under ? ctx.measureText(under).width : 0;
        var bb = Math.max(bo, bu) + 8;
        var bredde = bv + bb;
        var x0 = opt.midt ? x - bredde / 2 : x;
        ctx.fillStyle = opt.farve || T.TEKST;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(venstre, x0, y);
        var mx = x0 + bv + bb / 2;
        ctx.textAlign = "center";
        if (under) {
            ctx.fillText(over, mx, y - px * 0.72);
            ctx.fillText(under, mx, y + px * 0.78);
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = opt.farve || T.TEKST;
            ctx.beginPath(); ctx.moveTo(x0 + bv, y); ctx.lineTo(x0 + bv + bb, y); ctx.stroke();
        } else {
            ctx.fillText(over, mx, y);
        }
        ctx.restore();
        return { x: x0, b: bredde, h: under ? px * 3 : px * 1.4 };
    };

    /* ----- Knapper paa laerredet ---------------------------------------------------- */
    T.knap = function (ctx, f, tekst, opt) {
        opt = opt || {};
        ctx.save();
        NK.rundtRekt(ctx, f.x, f.y, f.b, f.h, opt.r || 9);
        var g = ctx.createLinearGradient(0, f.y, 0, f.y + f.h);
        var farve = opt.farve || "groen";
        var F = {
            groen: ["#4cc184", "#2b8a59", "#1d5f3d", "#ffffff"],
            graa: ["#4a4e5c", "#363945", "#262833", "#e9eef4"],
            gul: ["#ffe58a", "#f2c53d", "#c99a1c", "#33290a"]
        }[farve];
        g.addColorStop(0, opt.over ? F[0] : F[1]);
        g.addColorStop(1, F[2]);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.stroke();
        ctx.font = font("800", opt.px || 15);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = F[3];
        ctx.fillText(tekst, f.x + f.b / 2, f.y + f.h / 2 + 0.5);
        ctx.restore();
    };

    T.i = function (f, pt) {
        return !!f && pt.x >= f.x && pt.x <= f.x + f.b && pt.y >= f.y && pt.y <= f.y + f.h;
    };

    /* ----- Kroppen paa fane 2 ---------------------------------------------------------
       Lungerne: to fligede lapper med luftroeret og bronkierne. cx, cy er
       midten, s er stoerrelsen (bredden). */
    T.lunger = function (ctx, cx, cy, s, tid) {
        var h = s * 1.05, puls = 1 + 0.025 * Math.sin(tid * 1.6);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(puls, puls);
        function lap(spejl) {
            ctx.save();
            ctx.scale(spejl, 1);
            ctx.beginPath();
            ctx.moveTo(s * 0.06, -h * 0.30);
            ctx.bezierCurveTo(s * 0.10, -h * 0.47, s * 0.30, -h * 0.50, s * 0.38, -h * 0.30);
            ctx.bezierCurveTo(s * 0.49, -h * 0.05, s * 0.50, h * 0.30, s * 0.44, h * 0.43);
            ctx.bezierCurveTo(s * 0.36, h * 0.53, s * 0.16, h * 0.50, s * 0.08, h * 0.40);
            ctx.bezierCurveTo(s * 0.03, h * 0.20, s * 0.05, -h * 0.05, s * 0.06, -h * 0.30);
            ctx.closePath();
            var g = ctx.createRadialGradient(s * 0.20, -h * 0.18, s * 0.04, s * 0.25, h * 0.02, s * 0.42);
            g.addColorStop(0, "#ffc3c6");
            g.addColorStop(0.55, "#e8848f");
            g.addColorStop(1, "#a9475a");
            ctx.fillStyle = g;
            ctx.fill();
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = "#7d2f40";
            ctx.stroke();
            /* Bronkierne */
            ctx.strokeStyle = "rgba(255, 236, 238, 0.85)";
            ctx.lineCap = "round";
            ctx.lineWidth = s * 0.028;
            ctx.beginPath();
            ctx.moveTo(s * 0.02, -h * 0.20);
            ctx.quadraticCurveTo(s * 0.13, -h * 0.14, s * 0.20, -h * 0.02);
            ctx.stroke();
            ctx.lineWidth = s * 0.016;
            [[0.20, -0.02, 0.30, -0.20], [0.20, -0.02, 0.33, 0.10], [0.20, -0.02, 0.24, 0.28], [0.30, -0.20, 0.33, -0.32], [0.33, 0.10, 0.41, 0.20]].forEach(function (b) {
                ctx.beginPath();
                ctx.moveTo(s * b[0], h * b[1]);
                ctx.lineTo(s * b[2], h * b[3]);
                ctx.stroke();
            });
            ctx.restore();
        }
        lap(1);
        lap(-1);
        /* Luftroeret */
        ctx.fillStyle = "#f3d5d8";
        ctx.strokeStyle = "#8a5560";
        ctx.lineWidth = 1.3;
        NK.rundtRekt(ctx, -s * 0.035, -h * 0.56, s * 0.07, h * 0.36, s * 0.03);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(138, 85, 96, 0.6)";
        for (var i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(-s * 0.035, -h * 0.52 + i * h * 0.065);
            ctx.lineTo(s * 0.035, -h * 0.52 + i * h * 0.065);
            ctx.stroke();
        }
        ctx.restore();
        return { x: cx - s * 0.5, y: cy - h * 0.56, b: s, h: h * 1.1 };
    };

    /* Musklen: en tenformet muskel med sener i begge ender og tvaerstriber.
       arbejder: musklen trækker sig lidt sammen i takt. */
    T.muskel = function (ctx, cx, cy, s, tid, arbejder) {
        var bul = arbejder ? 1 + 0.10 * (0.5 + 0.5 * Math.sin(tid * 7)) : 1;
        var l = s * 0.5, t = s * 0.26 * bul;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.42);
        /* Senerne */
        ctx.fillStyle = "#e9e1cf";
        ctx.strokeStyle = "#a99c7f";
        ctx.lineWidth = 1.2;
        NK.rundtRekt(ctx, -l - s * 0.13, -s * 0.025, s * 0.2, s * 0.05, s * 0.025);
        ctx.fill(); ctx.stroke();
        NK.rundtRekt(ctx, l - s * 0.07, -s * 0.025, s * 0.2, s * 0.05, s * 0.025);
        ctx.fill(); ctx.stroke();
        /* Muskelbugen */
        ctx.beginPath();
        ctx.moveTo(-l, 0);
        ctx.bezierCurveTo(-l * 0.55, -t * 1.05, l * 0.55, -t * 1.05, l, 0);
        ctx.bezierCurveTo(l * 0.55, t * 1.05, -l * 0.55, t * 1.05, -l, 0);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, -t, 0, t);
        g.addColorStop(0, "#e26a5c");
        g.addColorStop(0.45, "#b8322c");
        g.addColorStop(1, "#6e1714");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = "#521010";
        ctx.stroke();
        /* Fibrene */
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = "rgba(255, 210, 200, 0.28)";
        ctx.lineWidth = 1;
        for (var i = -4; i <= 4; i++) {
            ctx.beginPath();
            ctx.moveTo(-l, 0);
            ctx.bezierCurveTo(-l * 0.5, i * t * 0.24, l * 0.5, i * t * 0.24, l, 0);
            ctx.stroke();
        }
        ctx.restore();
        ctx.restore();
        return { x: cx - s * 0.62, y: cy - s * 0.42, b: s * 1.24, h: s * 0.84 };
    };

    /* Bjergene bag lungerne: graa tinder med sne */
    T.bjerge = function (ctx, x, y, b, h) {
        ctx.save();
        function tind(px, top, bred, lys) {
            ctx.beginPath();
            ctx.moveTo(px - bred / 2, y + h);
            ctx.lineTo(px, y + top);
            ctx.lineTo(px + bred / 2, y + h);
            ctx.closePath();
            var g = ctx.createLinearGradient(px - bred / 2, 0, px + bred / 2, 0);
            g.addColorStop(0, lys ? "#5c6577" : "#4a5263");
            g.addColorStop(0.5, lys ? "#46505f" : "#3a4150");
            g.addColorStop(1, "#2c323e");
            ctx.fillStyle = g;
            ctx.fill();
            /* Sne paa toppen */
            var sn = (h - top) * 0.28;
            ctx.beginPath();
            ctx.moveTo(px, y + top);
            ctx.lineTo(px - bred / 2 * sn / (h - top), y + top + sn);
            ctx.lineTo(px - bred * 0.06, y + top + sn * 0.8);
            ctx.lineTo(px, y + top + sn * 1.05);
            ctx.lineTo(px + bred * 0.07, y + top + sn * 0.78);
            ctx.lineTo(px + bred / 2 * sn / (h - top), y + top + sn);
            ctx.closePath();
            ctx.fillStyle = "#e8eef5";
            ctx.fill();
        }
        tind(x + b * 0.30, h * 0.18, b * 0.75, false);
        tind(x + b * 0.72, 0, b * 0.85, true);
        ctx.restore();
    };

    NK.Tegn = T;
}());
